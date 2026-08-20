# NairaLeap Service Portal — Platform Architecture

**Status:** Architecture finalized for the first durable product path
**Repository:** [remRADAR/NairaLeap](https://github.com/remRADAR/NairaLeap)
**Current implementation checkpoint:** brain-box navigator, blueprint-driven multi-service intake, and generalized authenticated request submission
**Primary runtime:** TanStack Start + React + TypeScript + Vite + Tailwind CSS v4 on Cloudflare-compatible deployment
**Backend boundary:** Supabase Auth, Postgres, Storage, and server functions through the project’s Lovable/Supabase environment

## 1. Product outcome

NairaLeap is a customer-facing service portal that turns an uncertain visitor need into a qualified, routed, trackable request. The platform is not a directory of disconnected forms. Its core product promise is a guided path:

> **Discover the right service → understand what is needed → answer a focused intake → review the resulting blueprint → submit once → track progress until resolution.**

The platform must work for customers who know exactly what they want and for visitors who only know the outcome they need. It must preserve trust at every boundary: clear explanations before data collection, explicit authentication before durable submission, visible review before commitment, least-privilege persistence, and a human-operable route after submission.

## 2. Evidence and certainty

| Classification | Current finding                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Known**      | The repository contains a responsive branded portal, 10-service catalog data, a working brain-box navigator, blueprint-driven service question generation, a final request rundown with pricing-state disclosure, Supabase client utilities, an auth route, a server-protected dashboard, generalized authenticated request submission, the Agriculture-specific submission path, and an RLS migration. |
| **Known**      | TypeScript and production build checks passed at commit `ca96cf8`; unauthenticated navigation to `/dashboard` redirected to `/auth` in local runtime verification.                                                                                                                                                                                               |
| **Known**      | Insurance and Mortgage remain placeholder routes, request list/detail continuity is still limited, and there is no admin queue, document upload, payment flow, or verified price book.                                                                                                                                                                                                                               |
| **Inferred**   | Agriculture is the correct pilot vertical because it is the first real persisted workflow and already has a defined blueprint, service intelligence metadata, and question contract.                                                                                                                                                                             |
| **Unverified** | Live Supabase sign-up, email confirmation, migration execution, RLS behavior against a real project, and request insertion remain unverified until runtime credentials and the migration are configured.                                                                                                                                                         |
| **Unverified** | Cloudflare deployment, production domain, notification provider, payment provider, CRM integration, and admin operating procedures are not configured in this repository checkpoint.                                                                                                                                                                             |

Any new external capability must remain disabled or feature-flagged until its official support, account prerequisites, permissions, and actual integration response are verified.

## 3. Operating model

### Customer lifecycle

1. **Guest discovery.** A visitor sees the service catalog, can open a service preview, and may use NairaLeap Guide to clarify intent without creating an account.
2. **Authentication.** The visitor signs in or creates an account before entering a durable customer workspace or submitting a request.
3. **Guided intake.** The customer answers service-specific questions from a versioned contract. Drafts may be resumed once draft persistence is added.
4. **Review.** The customer sees the normalized request blueprint, optional fields, required documents, expected handling, and consent language before submission.
5. **Submission.** A server function validates the payload, confirms the authenticated user, enforces idempotency, and creates a `service_requests` record protected by RLS.
6. **Tracking.** The customer sees request status, timeline events, messages, documents, and any required next action.
7. **Resolution.** An authorized agent or admin advances the request, with customer-facing notifications and an immutable audit trail.

### Roles

| Role            | Default access                                              | Control boundary                                         |
| --------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| Guest           | Public discovery and service metadata                       | No customer PII or request records                       |
| Customer        | Own profile, own requests, own documents, own notifications | Every customer-owned row is scoped to `auth.uid()`       |
| Agent           | Assigned requests and scoped communication                  | Cannot reassign or perform governance actions            |
| Reviewer        | Read and review access                                      | No mutation of customer-owned facts                      |
| Admin           | Operational request handling and catalog management         | Elevated actions are logged and role-checked server-side |
| Super admin     | Governance, roles, integrations, feature flags              | Role changes require explicit confirmation and audit     |
| Service account | Narrow server-to-server operations                          | Signed requests, secret storage, no human session        |

Roles must not be stored as editable profile attributes or trusted solely from client state. Any privileged action must be checked server-side against a dedicated role source.

## 4. Logical architecture

```text
Public browser
  ├── Landing page / service discovery / service preview
  └── Auth route ───────────────┐
                                ▼
                     Supabase Auth session
                                │ cookie-backed SSR session
                                ▼
Customer browser ──► TanStack route gate ──► Feature route
                                │                  │
                                │                  ▼
                                │            Feature server function
                                │                  │ Zod + auth + idempotency
                                ▼                  ▼
                         TanStack Query ◄── Supabase user-scoped client
                                                   │
                                                   ▼
                         Postgres + RLS + Storage + durable request records
                                                   │
                                                   ▼
                         Customer tracking ──► Admin queue ──► Notifications
                                                   │                  │
                                                   └──── Audit log ◄────┘
```

### Layer responsibilities

| Layer                       | Responsibility                                                            | Must not do                                                |
| --------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Route                       | Compose feature UI, metadata, loader boundaries, and redirects            | Hold business rules or call provider APIs directly         |
| Feature UI                  | Render domain-specific states and collect user input                      | Decide authorization or ownership                          |
| Feature hook                | Manage local workflow state and server-cache interaction                  | Bypass server functions for protected writes               |
| Server function             | Validate, authenticate, authorize, enforce idempotency, and call Supabase | Trust a client-supplied user ID or secret                  |
| Supabase user-scoped client | Execute Postgres operations under the authenticated session               | Use service-role credentials in browser code               |
| Postgres/RLS                | Enforce data ownership and role policies as the final line                | Rely only on UI hiding or route conventions                |
| Adapter/integration         | Translate provider-specific formats and receipts                          | Leak provider-specific payloads into the core domain model |

## 5. Repository structure

The repository follows feature ownership with thin routes. The current code is the first increment of the target structure; future modules are added only when the next product slice has a real acceptance test.

```text
src/
  routes/                         thin composition and metadata
    __root.tsx                    providers and document shell
    index.tsx                     public landing page
    auth.tsx                      sign-in / sign-up
    _authenticated.tsx            server-side customer gate
    _authenticated/
      dashboard.tsx               customer workspace entry
      onboarding.$service.tsx     service-specific intake entry
      requests/                   future tracking surfaces
      documents.tsx               future document center
      notifications.tsx           future notification center
      profile.tsx                 future profile/security
    _admin.tsx                    future server-side admin gate
    _admin/                       future admin operating surfaces

  features/
    auth/                         session, auth actions, protected user lookup
    services/                     current public service catalog
    intent-discovery/             current visitor intent mapping
    question-engine/              reusable answer renderer/state engine
    agriculture/                  first real service contract and submission
    request-blueprint-engine/     normalized request output definitions
    service-intelligence-catalog/ service metadata and workflow hints
    workflow-orchestrator/        ordered stage definitions
    onboarding/                   future shared draft/review orchestration
    service-requests/             future request queries, timeline, messages
    user-profiles/                future profile persistence
    rbac/                         future roles and permission checks
    admin-submissions/            future queue and triage
    notifications/                future event fan-out and delivery adapters
    documents/                    future storage and signed URLs
    payments/                     future provider-agnostic payments ledger
    audit-log/                    future immutable operational history
    analytics/                    future funnel and operational metrics
    integrations/                 future CRM, email, SMS, and main-site adapters
    ai-assist/                    future bounded recommendation/drafting helpers

  components/                    shared primitives and layout only
  lib/supabase/                  browser/server clients and database types
  hooks/                         cross-cutting hooks
  styles.css                     frozen design tokens

supabase/
  migrations/                    reproducible database changes with grants + RLS
  README.md                      environment and migration setup
```

The implementation currently places the Agriculture and auth server functions at feature root because the slice is intentionally small. As the request lifecycle grows, those modules should split into `server/`, `components/`, `hooks/`, and `schemas.ts` only when doing so creates a real boundary rather than empty ceremony.

## 6. Canonical request contract

The request is the central domain object. A service-specific form produces a versioned payload, but the platform stores one canonical envelope so customer tracking, admin triage, notifications, analytics, and future integrations can use the same record.

```ts
type ServiceRequest = {
  id: string;
  userId: string;
  serviceId: string;
  schemaVersion: string;
  status: "draft" | "submitted" | "in_review" | "resolved" | "rejected";
  submittedPayload: Record<string, unknown>;
  idempotencyKey: string;
  source: "portal" | "admin" | "integration";
  createdAt: string;
  updatedAt: string;
};
```

The canonical envelope owns lifecycle metadata. The `submittedPayload` owns service-specific answers and is validated by the service schema. The UI must never infer a request’s authoritative status from local state after submission; it should query the server record.

### Agriculture payload

The first service schema includes contact name, phone, email, farm location, farm size, service type, crop or livestock, quantity or scale, timeline, budget range, inputs needed, buyer preferences, and additional notes. Required fields are validated in the client for immediate feedback and again in the server function before persistence.

### Lifecycle states

```text
draft ──► submitted ──► in_review ──► resolved
   │                         │
   └── customer edit          └── rejected ──► customer clarification / resubmit
```

State transitions must be explicit, role-aware, timestamped, and recorded as request events once the tracking layer is implemented.

## 7. Security and reliability posture

The default security posture is defense in depth:

- Supabase Auth owns sessions; the app uses a browser client and request-scoped server client rather than hand-rolled tokens.
- `getUser()` or an equivalent server-confirmed identity check protects customer actions; the server never trusts a client-provided `user_id`.
- Every exposed table ships with RLS, explicit role grants, ownership checks, and an index for policy-filtered user columns.
- State-changing server functions use shared Zod schemas and return safe domain errors without leaking provider details.
- Secret or service-role keys never enter `VITE_*` variables or browser bundles.
- Submission uses a UUID idempotency key plus a database uniqueness constraint to prevent duplicate customer requests.
- Customer-facing actions are reversible where possible; destructive or reputation-bearing operations require explicit human authorization.
- Inbound text, attachments, links, and future AI inputs are untrusted data. They must not modify system instructions, reveal secrets, bypass policy, or authorize tools.
- Audit records should be append-only and should not retain unnecessary personal data or credentials.

## 8. State and data-fetching rules

The platform uses a simple ownership rule: **server data belongs in TanStack Query; URL-worthy state belongs in TanStack Router; feature workflow state belongs in colocated hooks; transient UI state belongs in local React state.** Global context is reserved for cross-cutting concerns such as the current auth session and feature flags.

Draft persistence is a product requirement for the next onboarding increment, but it is not yet implemented. Until then, a browser refresh can discard in-progress Agriculture answers. This is an explicit known limitation, not a hidden promise.

## 9. Integration and automation boundary

Future CRM, email, SMS, payment, and main-site connectors must be adapters at the edge of the platform. The core should receive canonical domain events such as `request.created`, `request.status_changed`, `request.message_posted`, and `document.uploaded`.

The controlled event lifecycle is:

```text
Domain event → durable event record → normalized payload → policy check
→ notification/action outbox → adapter → provider response/receipt
→ reconciliation → audit + metrics
```

No external action should occur merely because a draft was generated. First deployments default to approval-required for public messages, sensitive customer responses, payments, role changes, and any irreversible action. Provider support, permissions, rate limits, and receipt behavior must be verified from current official documentation before an adapter becomes active.

AI, when added, is bounded to classification, recommendation, summarization, and drafting. It may not access secrets, choose privileged actions, bypass RLS, publish externally, or change approval state without deterministic policy enforcement.

## 10. Product rollout

| Stage                       | Product outcome                                                              | Exit evidence                                                                     |
| --------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **1. Foundation**           | Public discovery, auth, Agriculture intake, review, and protected submission | TypeScript/build pass, route-gate test, real Supabase auth and insert verified    |
| **2. Customer continuity**  | Request list/detail, statuses, timeline, draft resume, and profile           | Authenticated integration tests, RLS policy tests, refresh/resume test            |
| **3. Human operations**     | Admin queue, assignment, review notes, status transitions, audit events      | Role-separation tests, audit receipt, customer/admin end-to-end test              |
| **4. Trust infrastructure** | Documents, notifications, consent, deletion/retention, support messaging     | Storage policy tests, notification receipts, recovery and escalation tests        |
| **5. Service expansion**    | Property, funding, marketplace, professional services, support               | Each vertical has a versioned schema, review, submit, owner, and operational path |
| **6. Optimization**         | Analytics, AI assistance, payments, integrations, mobile-ready contracts     | Feature-flagged rollout, measured outcomes, rollback/kill-switch evidence         |

The next build checkpoint is **Stage 2: Customer continuity**, beginning with a request list/detail surface backed by the existing `service_requests` table. The platform should not expand to multiple verticals before one vertical can be submitted, retrieved, tracked, and operationally resolved.

## 11. Open decisions

| Decision                                        | Recommended default                                                                                        | Current status                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Live Supabase project and environment ownership | Configure the connected Lovable/Supabase project and keep secrets outside Git                              | **UNVERIFIED**                |
| Email confirmation policy                       | Require confirmation before first durable submission unless business operations explicitly allow otherwise | Decision needed               |
| Request schema versioning                       | Store an explicit schema version in the request envelope before adding a second vertical                   | Recommended structural change |
| Draft persistence                               | Server-backed draft rows with ownership RLS and expiration policy                                          | Next implementation slice     |
| Admin role source                               | Dedicated `user_roles` table with server-side checks                                                       | Planned, not implemented      |
| Notifications                                   | Start with in-app request events, then add email adapter with receipts                                     | Planned, not implemented      |
| AI assistance                                   | Draft/recommendation only, feature-flagged behind policy and audit                                         | Planned, not implemented      |

## References

[1]: https://github.com/remRADAR/NairaLeap "NairaLeap repository and implementation checkpoint"
[2]: https://supabase.com/docs/guides/getting-started/quickstarts/tanstack "Supabase TanStack Start quickstart"
[3]: https://supabase.com/docs/guides/auth/server-side/creating-a-client "Supabase SSR client guidance"
[4]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security guidance"
