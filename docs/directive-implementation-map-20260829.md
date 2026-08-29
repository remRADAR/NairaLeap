# NairaLeap directive implementation map

**Status:** Prepared before implementation
**Directive source:** `Pasted_content_25.txt`
**Repository:** `remRADAR/NairaLeap`

## Current architecture map

| Boundary              | Current implementation                                                              | Directive alignment                                                                           |
| --------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Public discovery      | `src/routes/index.tsx`, `SERVICE_CATALOG` and service cards                         | Implemented: one canonical service registry and service-first discovery                       |
| Service understanding | `src/routes/services.$service.tsx`, `ServiceLandingPage`, `SERVICE_LANDING_CONTENT` | Implemented: all 12 services have dedicated landing pages before onboarding                   |
| Intent routing        | `intent-discovery` and `navigation-agent` registries                                | Implemented: deterministic service matching and safe internal actions                         |
| Guided qualification  | `question-engine`, `service-intake`, request blueprints                             | Implemented: reusable question engine and service-specific generated question sets            |
| Authentication        | `auth`, `AuthProvider`, protected route boundary                                    | Implemented: auth before durable authenticated workspace/submission                           |
| Review and submission | `NairaLeapGuideContainer`, `service-requests/submit`, Supabase migration/RLS        | Implemented locally; live Supabase behavior remains environment-dependent                     |
| Customer workspace    | `dashboard`, `requests`                                                             | Implemented foundation; operational timeline/admin resolution are not complete                |
| Persistent chauffeur  | `navigation-agent`, `NairaLeapBot`, shared `AppLayout` mount                        | Implemented deterministic, session-persistent, allowlisted navigation and grounded boundaries |
| Data/security         | Zod validation, server functions, user-scoped Supabase client, RLS migration        | Implemented foundation; production migration/RLS execution remains unverified                 |

## Feature inventory

The repository contains the 12 top-level services, typed service-intelligence metadata, landing-page content, intent discovery, blueprint-backed intake, Agriculture-specific schema/server support, generalized request submission, authentication, customer request tracking foundation, persistent LeapBot knowledge/action contract, branding assets, and Cypress coverage.

## Gap classification against the directive

| Directive area                                                                           | Classification                       | Evidence-based gap                                                                                                                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service pages before onboarding                                                          | **VERIFIED**                         | Dedicated route and shared landing component exist for all catalog services; browser tests cover the flow                                         |
| Agriculture as first deep vertical                                                       | **IMPLEMENTED — PARTIALLY VERIFIED** | Agriculture blueprint, schema and onboarding exist; conditional question branching and all operational agricultural capabilities are not complete |
| Property, funding, partnerships, marketplace, recycling, distress, professional services | **IMPLEMENTED — PARTIALLY VERIFIED** | Service landing and intake contracts exist; marketplace primitives, provider records and operational matching are not implemented                 |
| Review/rundown before commitment                                                         | **VERIFIED LOCALLY**                 | Existing guide renders review and submission boundary; live persistence remains unverified                                                        |
| Request lifecycle/tracking                                                               | **IMPLEMENTED — PARTIALLY VERIFIED** | Customer request surface exists; admin queue, assignment, event timeline and resolution operations are absent                                     |
| Central knowledge system                                                                 | **VERIFIED LOCALLY**                 | Typed registry and provenance-backed replies exist                                                                                                |
| Safe agent actions                                                                       | **VERIFIED LOCALLY**                 | Actions are allowlisted; submission, consent changes, payment and permissions are not agent-triggerable                                           |
| Vendor trust and verification                                                            | **PLANNED**                          | No operational evidence/review workflow is present                                                                                                |
| Reminders and notifications                                                              | **PLANNED**                          | No event-driven notification adapter is present                                                                                                   |
| Language/display expansion                                                               | **PLANNED**                          | English dark-mode baseline exists; verified language pilot and light theme are not implemented                                                    |
| Voice                                                                                    | **PLACEHOLDER / LIMITED**            | Browser speech demo exists; founder voice, server-side credentials and production voice adapter are not implemented                               |
| Live provider/partner matching                                                           | **PLANNED**                          | No verified provider integration or matching backend exists                                                                                       |
| Admin/human operations                                                                   | **PLANNED**                          | No server-protected queue, role source, assignment or audit log exists                                                                            |
| Live Supabase/deployment behavior                                                        | **UNVERIFIED**                       | Requires configured production credentials, migrations and runtime verification                                                                   |

## Architectural risks and duplication review

No second service catalog, request envelope, onboarding engine or chatbot architecture should be introduced. New capability must extend the existing `SERVICE_CATALOG`, `SERVICE_LANDING_CONTENT`, blueprint/question engine, canonical request submission boundary, and `navigation-agent` registry. Marketplace, vendor, matching, notification and admin abstractions should not be created until an end-to-end slice has a real use case and acceptance test.

## Recommended implementation sequence

1. **Service Foundation refinement:** add request types, examples, and post-submission expectations to the existing landing-content model and render them progressively on service pages.
2. **Agriculture depth:** add conditional branching only where the existing blueprint and question engine can support it without a second form system.
3. **Request continuity:** strengthen draft persistence, review/edit state and request detail using the existing canonical request envelope.
4. **Operational slice:** introduce one real admin/review path only after role source and persistence requirements are defined.
5. **Marketplace primitives:** introduce shared listing/provider/capability records only for a tested first use case.
6. **Agent and voice expansion:** keep deterministic knowledge/actions authoritative; add external AI or voice only behind verified server-side adapters.

## Exact first build increment

Extend the existing service landing-page architecture with **common request types and after-submission expectations**, using the existing `ServiceLandingContent` configuration and `ServiceLandingPage` renderer. This directly satisfies the directive’s service-understanding requirements, improves user qualification before onboarding, and does not change routing, request persistence, authentication, or the canonical question engine.

## Expected files for first increment

- `src/features/services/serviceLandingContent.ts`
- `src/components/ui/ServiceLandingPage.tsx`
- `cypress/support/e2e.ts` or a focused service-navigation spec
- Documentation for the verified scope

## Verification plan

Run the existing TypeScript check, lint, production build, deterministic intake and LeapBot audits, then Chromium coverage for all service landing pages and the new request-type/after-submission rendering. Inspect the changed diff and preserve unrelated work. Live Supabase, external providers, admin operations and production deployment remain explicitly unverified unless separately exercised.
