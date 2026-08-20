# NairaLeap Brain-Box Contract

**Status:** Implementation contract for the next product slice  
**Scope:** Public discovery through service selection, final rundown, pricing state, and authenticated handoff  
**Date:** 20 August 2026

## Product outcome

The NairaLeap brain box is the customer-facing decision layer between an uncertain need and a complete service request. It must help a visitor move through one continuous path:

> **Describe the need → resolve the best service → answer only relevant questions → see the complete request rundown → understand the price state → authenticate when durable submission is required → submit or continue to the correct next action.**

The experience must work both when a visitor chooses a service directly and when the visitor asks NairaLeap to guide them.

## Evidence from the current repository

| Classification | Finding                                                                                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Known**      | The public Guide currently renders four demo discovery questions and then stops after selecting the first recommended service.                                                                                                |
| **Known**      | The repository already contains a 10-service catalog, service-intelligence metadata, per-service request blueprints, a reusable QuestionEngine, and a working authenticated Agriculture submission path.                      |
| **Known**      | Blueprint fields include customer-stated financial information such as price expectation, funding amount, budget range, or asking price. These are inputs to qualification, not computed NairaLeap fees.                      |
| **Known**      | The canonical persisted request envelope requires `serviceId`, `schemaVersion`, `status`, `submittedPayload`, `idempotencyKey`, and `source`.                                                                                 |
| **Inferred**   | The missing brain-box behavior is primarily deterministic orchestration and UI state management. AI assistance can be added later for classification or summarisation, but it is not required to remove the current dead end. |
| **Unknown**    | The commercial price book, provider fees, commission rules, taxes, payment provider, and when a quote becomes binding have not been supplied or verified.                                                                     |

## Runtime decision model

### Entry modes

The Guide accepts either a directly selected service or no service. A direct service selection skips unnecessary intent resolution but still explains the selected service and collects its relevant information. A no-service entry begins with intent discovery and then presents a recommendation with a transparent “why this service” explanation.

### Service resolution

Resolution is deterministic in the first implementation. It uses the existing intent catalog and may present more than one candidate when the catalog returns multiple services. The user must be able to confirm the recommendation or choose another service before service-specific questions begin. The system must not silently route to the first candidate when the intent is ambiguous.

### Intake loading

Every service has one runtime question set. The question set is derived from its request blueprint and uses the existing QuestionEngine field types. Required blueprint fields are mandatory. Optional fields are clearly marked and may be skipped. The Agriculture question set remains the reference implementation and the shared engine remains service-agnostic.

### Final rundown

Before submission, the Guide generates a structured rundown from the selected service, the blueprint, and the answers. It includes the service, the customer’s stated goal, captured answers grouped by topic, missing or recommended documents, expected NairaLeap handling path, target response window from service intelligence, priority, and the price state.

The rundown is a review artifact. It is not an authoritative quotation unless a verified price rule is present in the price catalog.

## Pricing and commercial truthfulness

No actual NairaLeap price book is present in the repository. The portal must therefore never fabricate a numeric fee. The initial price contract is:

| Pricing mode | Customer-facing behavior                                                                               | Current availability                    |
| ------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `fixed`      | Show the configured amount and currency, with the rule label and validity state.                       | Not configured                          |
| `estimate`   | Show the configured range or estimate, clearly labelled as non-binding.                                | Not configured                          |
| `quote`      | Show “Quote required after review” and explain which information/documents determine the final amount. | Default for the current service catalog |
| `no-charge`  | Show “No portal fee configured” only when a business decision explicitly sets this mode.               | Not configured                          |

The final rundown must distinguish three different monetary concepts: the customer’s stated budget or asset price, any configured NairaLeap service fee, and a quote that still requires human review. These values must not be merged or labelled as an “actual price” without a verified rule.

## Submission behavior

The public Guide may collect and review answers as a guest. Durable submission requires authentication, because the existing architecture requires customer-owned request records and server-side identity checks. If the visitor is not signed in at the submit boundary, the portal must preserve the reviewed request in a resumable client handoff and send the visitor to authentication. After sign-in, the visitor must be able to return to the final rundown and submit without repeating the entire flow.

The existing Agriculture server function remains the only connected submission implementation until a generalized multi-service server contract is added and tested. For other services, the first brain-box slice may end at a clearly labelled “ready to submit” handoff if persistence is not yet supported, but it must not claim that a request was submitted.

## Acceptance criteria

1. The hero Guide actions and the Need Help Guide action open the real Guide instead of doing nothing.
2. A directly selected service reaches its service-specific question set rather than the demo placeholder.
3. A visitor who starts without a service receives a recommendation, can see the reason, and can confirm or change the selected service.
4. All ten services have a runtime question set generated from their existing blueprint fields or an explicit lightweight flow for the service.
5. The visitor reaches a final rundown containing answers, documents, response expectation, workflow, priority, and a truthful pricing state.
6. A numeric price is displayed only when a verified pricing rule exists in the price catalog.
7. Agriculture can still be submitted through the existing authenticated Supabase path, with the canonical envelope and idempotency behavior preserved.
8. Unsupported service submission states are explicit and do not pretend that persistence or payment occurred.
9. The flow has accessible progress, back/edit actions, loading/error states, and mobile-safe layouts in the existing dark glassmorphism system.
10. `bun run build` passes, and the final diff contains no credentials or service-role keys.

## Deferred work

The following remain separate product increments: a verified price book and payment flow; generalized service schemas and server submission functions for the remaining nine services; document upload and verification; draft persistence; request detail timelines; admin queue and assignment; notifications; and bounded AI classification or summarisation behind feature flags and audit controls.
