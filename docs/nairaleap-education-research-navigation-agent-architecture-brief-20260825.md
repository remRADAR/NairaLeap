# Nairaleap Education + Research + Navigation Agent

## Reconciled architecture brief

**Project:** Nairaleap - Service Portal  
**Repository:** [`remRADAR/NairaLeap`](https://github.com/remRADAR/NairaLeap)  
**Date:** 25 August 2026  
**Author:** Manus AI  
**Status:** Architecture proposal; education, external research and source-citation capabilities are not yet implemented

## Executive recommendation

Nairaleap should extend its existing Guide into a **Knowledge Guide** rather than create a second chatbot. The Guide should retain its navigation, service discovery, onboarding and voice roadmap while adding bounded education and research capabilities.

The recommended operating sequence is:

```text
Understand intent → retrieve approved Nairaleap knowledge → decide whether current research is needed → research only when justified → validate sources → answer at the requested depth → offer a relevant next action
```

This keeps the portal’s internal truth separate from changing external information. It also prevents a generic model from silently inventing Nairaleap policies, services, prices, funding claims, eligibility rules, sources or agricultural recommendations.

The smallest coherent next move is a **text-first, internal-knowledge education layer** with deterministic response metadata and source cards. External web research should be a server-side, targeted capability introduced behind explicit policy and rate limits. Voice remains a later adapter that reads the exact visible answer and never becomes a second content-generation path.

## Verified current baseline

The current repository already contains a reusable `NairaLeapGuideContainer` with the state sequence `discovery → service recommendations → questions → review → success`. It draws from the centralized `INTENT_DISCOVERY_CATALOG`, `SERVICE_CATALOG`, service question sets and rundown builders. It can recommend services and launch the shared guided request flow, but it is not yet a persistent context-aware education or research agent.

The existing architecture brief has already defined a future `NavigationAgentProvider`, context adapter, approved knowledge registry, safe action resolver and optional voice adapter. This brief extends that design with source-aware education, depth control, targeted research, citation cards, research freshness and safe high-stakes boundaries.

The service catalog currently contains 12 top-level services. The agent must use those actual service definitions as the internal source of truth and must not substitute the agriculture-specific taxonomy from the supplied brief for the existing catalog without a confirmed workspace decision.

## Knowledge layers

The agent must distinguish two knowledge layers in both implementation and presentation.

| Layer | Use | Authority and restrictions |
|---|---|---|
| Nairaleap knowledge | Explain Nairaleap, its services, workflows, requirements, field purposes, consent, routes and approved FAQs. | Authoritative for Nairaleap-specific claims. Versioned, approved records only. |
| External research | Answer current, general or research-oriented questions about agriculture, finance concepts, markets, technology, soil, water, livestock and related topics. | Only when the research policy permits it; use authoritative sources, record dates and show citations. |
| General model knowledge | Provide simple low-risk explanations when appropriate. | Must not override internal Nairaleap information or be presented as current, Nigeria-specific or professionally validated without evidence. |

The response object should expose its knowledge classification:

```ts
type KnowledgeMode =
  | "NAIRALEAP_ONLY"
  | "WEB_SUPPORTED"
  | "NAIRALEAP_PLUS_WEB"
  | "GENERAL_KNOWLEDGE"
  | "INSUFFICIENT_INFORMATION";
```

For Nairaleap-specific questions, internal approved content wins over external information. For general educational questions, the answer may use external research and explain a distinction where the broader context differs from Nairaleap’s current portal wording.

## Agent response contract

Every response should be composed from typed content rather than an unbounded text string. This lets the UI decide when to show sources and which actions are safe.

```ts
type AgentResponse = {
  text: string;
  knowledgeMode: KnowledgeMode;
  citations: SourceReference[];
  confidence: "high" | "medium" | "limited";
  freshness?: {
    checkedAt: string;
    validUntil?: string;
  };
  actions: AgentAction[];
  context: {
    route?: string;
    serviceId?: ServiceId;
    onboardingStage?: string;
  };
};

type SourceReference = {
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
  relevance: string;
};
```

The UI should show one to three relevant source cards for substantive externally researched answers. A `View sources` action can reveal additional references without making citations dominate the conversation. Raw URLs should not be read aloud by TTS.

## Educational conversation model

The agent should adapt answer depth to user intent. A short question should not receive a long lecture. The user should be able to request `Explain simply`, `Tell me more`, `Give me an example`, `Show sources`, `Research this deeply`, `What does this mean for my farm?`, `What does Nairaleap offer for this?` and `Take me there`.

| Level | Output shape | Example use |
|---|---|---|
| Quick | One to three clear sentences. | “What is Finance?” |
| Explain | Plain-language explanation with a few examples. | “How does an aggregator work?” |
| Deep dive | Structured explanation with practical context and caveats. | “Tell me more about irrigation.” |
| Research | Synthesized answer with current, authoritative sources and dates. | “Research fertilizer options for maize in Nigeria.” |

Education should lead to action only when relevant. For example, an explanation of aggregators may offer the Market service, while a general explanation of soil may simply answer the question unless the user is currently in Production onboarding.

## Research decision policy

The agent should not search the web for every message. It should use external research when the user explicitly asks for more information, current/latest/today’s information, recent developments, statistics, studies, changing regulations, market availability, external recommendations or sources, or when approved internal knowledge is insufficient and the answer materially benefits from verification.

Before research, the server-side research planner should produce a narrow query intent containing topic, geography, time sensitivity, desired depth and safety category. The planner should prefer Nigerian government agencies, regulators, public institutions, recognized research institutions, universities, FAO, World Bank, IFAD, CGIAR and reputable industry organizations where relevant. Search-result snippets must not be treated as final evidence.

The research pipeline is:

```text
User message
  → intent and context classification
  → Nairaleap knowledge retrieval
  → research-needed decision
  → targeted search
  → source retrieval and validation
  → claim synthesis
  → citation attachment
  → answer and safe action generation
```

Research should be time-bounded, rate-limited, cacheable for the current session and observable without storing unnecessary personal data. Cached current information must retain its access date and must not be treated as permanently current.

## Source quality and transparency

The agent should communicate the knowledge layer naturally. It may say, “Nairaleap’s portal describes the Finance service this way. For the broader agricultural context, current research from an external institution indicates…” It must not make external material appear to be Nairaleap policy.

When sources disagree, the agent should state the distinction rather than silently selecting one. When reliable information cannot be established, it should say so and offer the closest verified information or a Nairaleap route. The agent must summarize sources in its own words, avoid copying long passages and provide publication/access dates when available.

## Nigerian and user context

For questions relevant to Nigeria, the research planner should prefer Nigerian context where authoritative evidence exists and should consider climate zones, local crops, market structures, institutions and regional terminology. It must not assume that advice from another country transfers perfectly to Nigeria.

The agent may personalize education using facts the user voluntarily provided in the active session, such as the selected service, current crop field or onboarding stage. It must not infer sensitive characteristics or invent farm details. User-entered names, addresses, farm names and free text remain unchanged and are not silently translated.

## High-stakes safety boundary

Educational answers about livestock treatment, veterinary medicines, pesticides, chemical application, human health, loans, investments, mortgages, insurance or other high-impact areas must be framed as general information, not diagnosis, treatment, personalized financial advice, underwriting, approval or eligibility assessment. The agent should direct the user to qualified professionals or authoritative institutions where appropriate.

The agent must not promise funding, approvals, returns, insurance cover, mortgage terms, buyer availability, regulatory outcomes, service turnaround times or partner acceptance. It must not make external recommendations that appear personalized when the evidence or user context is insufficient.

## Navigation and action integration

Education must remain connected to the portal but must not become unsolicited promotion. The approved action set remains:

```ts
type AgentAction =
  | { type: "show_service"; serviceId: ServiceId }
  | { type: "start_onboarding"; serviceId: ServiceId }
  | { type: "continue_onboarding"; serviceId: ServiceId }
  | { type: "explain_field"; fieldId: string }
  | { type: "show_sources"; responseId: string }
  | { type: "go_back" }
  | { type: "go_home" }
  | { type: "request_human_help" };
```

The agent may navigate safely to known internal routes after stating the destination. It must not submit, delete, share, change consent or trigger another high-impact action without the existing confirmation surface. `show_sources` should reveal citations for the current response and must not navigate users to unallowlisted domains without explicit link handling.

## Follow-up context and memory

Within the active session, retain only the context needed for coherent follow-up: current route, service, onboarding stage, recent topic, requested depth, recent source set and completed navigation step. This allows “What about equipment?” to refer to the immediately preceding agricultural-finance discussion without storing an unnecessary profile.

Context should expire when the session ends or after a defined inactivity window. Sensitive form values, credentials, documents and raw personal data must not be added to agent memory. If the user changes language or theme, the agent uses the updated preference while preserving the conversation and form state.

## Multilingual and voice integration

The education layer must consume the same future locale dictionary and language registry as the rest of the portal. The visible translated text remains canonical. Sources remain clickable and visible even when the selected voice reads the answer.

If a locale lacks a verified translation or capable voice, the agent should use the approved fallback and explain that voice playback is unavailable for that language. It must not generate poor or misleading speech. TTS must be explicit-user-activation only, server-side where provider credentials are involved, stoppable, serialized and non-blocking.

## Privacy, security and reliability

External research and any future model calls must be server-side or through a controlled backend boundary. API keys, model credentials, internal prompts, private knowledge sources, user tokens and Supabase service-role keys must never be sent to the browser. The client should receive only the normalized response, approved citations and allowlisted actions.

The system should use request correlation IDs, timeouts, retries for safe reads, a bounded cache, a research failure state and a text-only fallback. If research is unavailable, the agent must say it could not verify the latest external information and should answer only from reliable available knowledge or route the user to a relevant Nairaleap service.

Telemetry should record latency, research-needed decisions, source validation outcomes, citation rendering, unknown intents, action results and failures without logging passwords, tokens, raw form values, documents, identity numbers, precise financial amounts or full conversation content by default.

## Staged implementation roadmap

### Stage 0 — Internal educational content

Add typed education records for the existing service catalog, approved FAQs, field explanations, service purpose, requirements and safe examples. Add answer-depth actions and source-aware response metadata without external web access.

**Exit evidence:** users can request quick, explain and deeper internal answers for known Nairaleap services; every answer maps to approved records; navigation remains intact; no separate chatbot is created.

### Stage 1 — Source-aware response UI

Add compact source cards, `View sources`, response classification and citation rendering. Ensure the UI distinguishes Nairaleap information from external information even before live search is enabled.

**Exit evidence:** citations are readable, clickable and subordinate to the answer; missing citations are not fabricated; voice can read the visible answer only.

### Stage 2 — Bounded external research

Add a server-side research planner, allowlisted retrieval path, source validator, freshness metadata, query limits, cache and failure fallback. Start with low-risk agricultural education and explicitly exclude personalized medical, veterinary, chemical and financial decisions from autonomous recommendation behaviour.

**Exit evidence:** current questions trigger targeted research, stable internal questions do not, authoritative sources are shown, research failures are honest and the browser receives no provider secrets.

### Stage 3 — Contextual education and onboarding help

Connect route/stage/field context and session-only topic memory. Add contextual prompts such as “Why do you need this?” and “What does this mean for my farm?” while keeping the existing question engine and submission boundary authoritative.

**Exit evidence:** follow-up questions resolve correctly, field explanations are approved, sensitive values are not retained in agent memory, and onboarding data survives language/theme changes.

### Stage 4 — Multilingual education and voice

Integrate the approved locale dictionary, translated source labels, language-aware quick actions and voice capability checks. Enable TTS only for locales with approved translations and supported voices, with explicit authorization for any founder voice.

**Exit evidence:** visible and spoken responses match exactly, source links remain visible, unsupported voices degrade to text, and changing locale does not reset conversation or onboarding state.

### Stage 5 — Measured rollout and governance

Introduce feature flags, content review dates, source allowlists, research policy updates, incident handling, evaluation sets and human escalation. Review factual accuracy, source quality, Nigerian relevance, response depth, navigation completion and safety refusals.

**Exit evidence:** rollback is available, knowledge changes are reviewable, research and agent telemetry excludes unnecessary personal data, and acceptance tests pass across desktop, mobile, keyboard, reduced motion and unstable-network states.

## Open decisions

| Decision | Recommendation | Status |
|---|---|---|
| Initial education scope | Start with current service definitions, approved FAQs and field help. | Recommended |
| External search provider | Select only after official API, privacy, rate-limit and cost review. | **UNVERIFIED** |
| Research source allowlist | Prefer Nigerian public institutions and recognized research bodies, with explicit domain policy. | Requires product/legal/security approval |
| Source freshness window | Define by topic risk; current regulations and market data require stricter freshness than stable concepts. | Requires policy decision |
| Model usage | Use bounded classification/synthesis only; deterministic services own policy and actions. | Recommended |
| Knowledge administration | Repository config first; admin workflow later with approval and review metadata. | Recommended |
| Voice | Keep later and feature-flagged; require language quality and founder authorization gates. | **UNVERIFIED** |

## Acceptance criteria

The extension is ready for controlled release only when users can ask for explanations at different depths, request examples and sources, receive a clear distinction between Nairaleap and external information, get Nigerian context when appropriate, trigger targeted research only when justified, recover honestly from research failure, maintain follow-up context, navigate to relevant services, receive field help during onboarding, and remain protected from fabricated policies, sources, guarantees and high-impact advice.

The current portal must continue to own authentication, question validation, rundown, review, consent and submission. The education agent may explain and guide, but it must not silently replace those deterministic controls.

## References

1. `Pasted_content_18.txt` — supplied Nairaleap Education + Research + Navigation Agent master implementation prompt, reviewed from the user attachment.
2. [`src/features/services/serviceCatalog.ts`](../src/features/services/serviceCatalog.ts) — current top-level service registry.
3. [`src/features/intent-discovery/intentDiscoveryCatalog.ts`](../src/features/intent-discovery/intentDiscoveryCatalog.ts) — current intent routing configuration.
4. [`src/components/ui/NairaLeapGuideContainer.tsx`](../src/components/ui/NairaLeapGuideContainer.tsx) — current shared guided-request flow.
5. [`docs/nairaleap-service-first-navigation-agent-architecture-brief-20260825.md`](./nairaleap-service-first-navigation-agent-architecture-brief-20260825.md) — previously reconciled service-first and navigation-agent architecture.
6. [`docs/nairaleap-native-language-display-system-architecture-brief-20260825.md`](./nairaleap-native-language-display-system-architecture-brief-20260825.md) — previously reconciled language and display architecture.
