# LeapBot Portal Skill and Chauffeur Contract

**Status:** Implemented and verified  
**Knowledge version:** `2026-08-25`  
**Scope:** Nairaleap Service Portal public navigation, service discovery, onboarding continuity and support routing

## Product role

LeapBot is the portal’s persistent **chauffeur**, not a detached help prompt. It stays mounted in the shared portal shell, keeps the user’s conversation and route context for the browser session, and remains available until the user leaves the portal session. Minimizing the conversation hides the panel but does not delete the transcript or the active context.

The chauffeur can explain what the current page is for, identify the correct service, navigate to an approved internal service landing page, explain preparation requirements, describe the review path and open the existing onboarding engine when the user is ready. It does not duplicate the question engine or silently submit information.

## Authoritative knowledge sources

| Source | Role in the skill |
|---|---|
| `serviceCatalog.ts` | Canonical service IDs, titles, descriptions and public examples for all 12 portal services. |
| `serviceLandingContent.ts` | Audience, purpose, information categories, process steps, boundaries and related-service routes in plain language. |
| `service-intelligence-catalog/index.ts` | Estimated completion time, guided-question requirement, document posture, admin-review posture, output summary and next workflow. |
| `request-blueprint-engine/index.ts` | Required and optional intake fields, document expectations, triage priority, admin-review checklist and workflow target. |
| `intentDiscoveryCatalog.ts` | Initial broad intent vocabulary for routing ordinary user language to known portal services. |
| `brain-box-contract.md` | Service-first journey, truthful pricing rules, authentication boundary, review/rundown behavior and unsupported-submission rules. |
| `nairaleap-service-first-navigation-agent-architecture-brief-20260825.md` | Knowledge-record format, safe action contract, context/session model, voice posture and privacy controls. |

The runtime registry is `src/features/navigation-agent/index.ts`. It composes the canonical modules above rather than creating a second ungoverned copy of the portal’s service data.

## Runtime guarantees

The registry contains approved, versioned records for the portal overview, authentication, pricing truth, human support, every service page, process, preparation guidance, route, boundary, related-service set, blueprint-backed intake fields and review contract. Every reply returned by the resolver includes the record IDs used to ground the answer.

The current resolver is deterministic and intentionally conservative. It recognizes service aliases such as mortgage, home finance, insurance, cover, farming, funding, property, recycling, professional support and human help. Unknown requests receive a safe explanation and a route to continue discovery rather than an invented answer.

## Safe action contract

LeapBot currently executes only allowlisted internal actions: show a known service page, start the existing onboarding guide, explain the active context, return home, request the Customer Support path and remain active. It cannot navigate to arbitrary URLs, submit a request, delete information, change consent, expose credentials or claim that a provider approved a request.

Numeric fees, premiums, rates, approval decisions, partner commitments and guarantees are never fabricated. The current portal does not expose a verified price book, so pricing questions receive a transparent quote/review response.

## Session behavior

The following browser-session values are used:

| Key | Purpose | Retention |
|---|---|---|
| `nairaleap.bot.session` | Active route, selected service, recent intent and completed safe actions. | Session storage only. |
| `nairaleap.bot.transcript` | Bounded visible conversation transcript. | Session storage only, capped at 24 messages. |
| `nairaleap.bot.panel` | Whether the user left the chauffeur panel open or minimized. | Session storage only. |
| `nairaleap.bot.position` | User-selected floating position. | Local storage only; no personal data. |

The floating icon never enters a sleeping state or disappears after inactivity. After approximately ten seconds, it may display a non-blocking prompt, but the icon remains available. Internal route navigation rehydrates the active panel state and keeps the transcript available.

## Privacy and trust boundary

The client-side skill contains approved portal product knowledge only. It does not contain Supabase service-role credentials, provider secrets, private prompts, document contents, identity numbers, passwords, tokens or hidden customer profiles. Future model or voice adapters must preserve exact visible-transcript parity, explicit user activation and server-side secret isolation.

## Verification evidence

The following checks passed after implementation:

| Check | Result |
|---|---:|
| TypeScript compilation | Passed |
| ESLint | Passed |
| Production build | Passed |
| Full Chromium Cypress suite | **28 passed, 0 failed** |
| Persistent icon after inactivity | Passed |
| Grounded pricing boundary response | Passed |
| Known-service navigation with transcript continuity | Passed |
| Blueprint-backed preparation response | Passed |
| Existing branding and service-navigation coverage | Passed |

The current implementation is a grounded deterministic chauffeur foundation. A future server-side LLM can be added only behind the same registry, typed action schema, allowlisted routes, audit controls and explicit privacy boundary.
