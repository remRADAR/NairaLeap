# Features

NairaLeap uses feature-based organization. Each business capability owns its contract, UI orchestration, server functions, and persistence boundaries. Shared primitives remain in `src/components/`; routes compose features and set metadata but do not own business rules.

## Implemented modules

```text
src/features/
  auth/                         session hydration and protected user lookup
  agriculture/                  first real intake schema and submission function
  service-requests/             canonical request contract and customer query
  services/                     public service catalog
  intent-discovery/             visitor intent mapping
  question-engine/              reusable answer renderer/state engine
  request-blueprint-engine/     normalized request output definitions
  service-intelligence-catalog/ per-service workflow metadata
  workflow-orchestrator/        ordered workflow definitions
```

## Feature rules

A feature may own `components/`, `hooks/`, `lib/`, `server/`, `schemas.ts`, `types.ts`, and `index.ts` as its complexity justifies. Do not create empty folder ceremony. A server function must validate inputs, verify authentication and authorization where required, enforce idempotency for retried writes, and call the user-scoped Supabase client. A client component must not decide ownership or privilege.

The canonical request envelope is defined by `src/features/service-requests/types.ts`. Service-specific answers belong in a versioned payload such as `agriculture.v1`; lifecycle fields, provenance, ownership, and idempotency belong in the envelope.

## Next module boundary

The next high-value module is customer request continuity: request detail, timeline events, draft resume, and profile linkage. Admin queue, notifications, documents, payments, integrations, and AI assistance should be added only when each has a verified acceptance test and a clear security boundary.
