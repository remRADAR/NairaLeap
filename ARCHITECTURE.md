# NairaLeap Service Portal — Architecture Blueprint

> **Stack note:** TanStack Start (React 19) + TypeScript + Tailwind v4 + Vite,
> deployed on Cloudflare Workers. Backend capabilities (DB, auth, storage,
> server functions) are provided by **Lovable Cloud** (Supabase under the hood).
> The original Laravel-flavoured brief maps 1:1 onto this stack — the
> architectural principles (feature-based, thin routes, modular views,
> utility-first CSS, minimal JS) are preserved.

This document is the **single source of truth** for how the platform is
organised. Every future phase extends this blueprint; nothing here is
implemented as a business feature yet.

---

## 1. Application Modules

The platform is organised into **feature modules** under `src/features/`.
Each module is self-contained (`components/`, `hooks/`, `lib/`, `types.ts`,
`schemas.ts`, `server/`) and depends only on shared primitives in
`src/components/`, `src/lib/`, `src/hooks/`.

| # | Module | Purpose | Responsibilities | Folder | Depends on | Public interface |
|---|---|---|---|---|---|---|
| 1 | **auth** | Identity & sessions | Sign-up, sign-in, password reset, session hydration, role loading | `src/features/auth/` | cloud, shared/ui | `useAuth()`, `<AuthGate />`, `requireAuth` server middleware |
| 2 | **user-profiles** | Profile data separate from `auth.users` | Display name, phone, avatar, KYC pointers | `src/features/user-profiles/` | auth, cloud | `useProfile()`, `updateProfile()` server fn |
| 3 | **rbac** | Roles & permissions | `user_roles` table, `has_role()` security-definer, permission helpers | `src/features/rbac/` | auth, cloud | `hasRole()`, `hasPermission()`, `<RoleGate />` |
| 4 | **service-catalog** | Registry of NairaLeap services | Categories, services, eligibility rules, pricing metadata | `src/features/service-catalog/` | cloud | `listServices()`, `getService(slug)` |
| 5 | **service-discovery** | Guide visitors to the right service | Search, filters, recommendation surface | `src/features/service-discovery/` | service-catalog | `<Discovery />`, `useDiscovery()` |
| 6 | **onboarding** | Guided intake flow | Multi-step wizard, per-service schemas, draft persistence | `src/features/onboarding/` | service-catalog, auth | `<OnboardingFlow serviceId />`, `submitIntake()` |
| 7 | **service-requests** | Structured request lifecycle | Create, track, message, status transitions, attachments | `src/features/service-requests/` | onboarding, auth, storage | `createRequest()`, `useRequest(id)`, `useMyRequests()` |
| 8 | **admin-submissions** | Admin queue & triage | Assignment, status changes, internal notes, audit log | `src/features/admin-submissions/` | service-requests, rbac | `<AdminQueue />`, admin-only server fns |
| 9 | **notifications** | In-app + email fan-out | Event bus, templates, delivery adapters | `src/features/notifications/` | auth | `notify(event, payload)`, `<NotificationBell />` |
| 10 | **documents** | File uploads & signed URLs | Storage buckets, virus/type checks, retention | `src/features/documents/` | storage, auth | `uploadDocument()`, `getSignedUrl()` |
| 11 | **payments** | Payment intents & receipts | Provider adapter, webhook handling, ledger entries | `src/features/payments/` | service-requests, auth | `createPaymentIntent()`, webhook route |
| 12 | **ai-assist** | AI helpers (recommendations, summarisation) | Lovable AI Gateway calls, prompt templates, guardrails | `src/features/ai-assist/` | service-catalog, service-requests | `recommendService()`, `summarizeRequest()` |
| 13 | **insurance** | Insurance vertical | Product schemas, quotes, policy records | `src/features/insurance/` | service-requests, documents | `quoteInsurance()`, `<InsuranceIntake />` |
| 14 | **mortgage** | Mortgage vertical | Product schemas, eligibility, application tracking | `src/features/mortgage/` | service-requests, documents | `<MortgageIntake />`, `estimateMortgage()` |
| 15 | **analytics** | Product & business metrics | Event capture, funnel tracking, dashboards data | `src/features/analytics/` | auth | `track(event)`, admin queries |
| 16 | **audit-log** | Immutable action log | Actor, action, entity, diff, timestamp | `src/features/audit-log/` | rbac | `recordAudit()`, admin viewer |
| 17 | **integrations** | Third-party connectors | Main NairaLeap site handshake, CRM, email provider | `src/features/integrations/` | notifications, payments | Adapter interfaces |
| 18 | **admin-console** | Admin surface composition | Dashboards, user management, module settings | `src/features/admin-console/` | rbac, admin-submissions, analytics | Route composition |

**Shared (not features):** `src/components/ui/*`, `src/components/layout/*`,
`src/lib/*`, `src/hooks/*`, `src/styles.css`.

---

## 2. User Types

Roles live in a dedicated `user_roles` table (never on `profiles`). Access
checks use a `has_role()` SECURITY DEFINER function to avoid RLS recursion.

| Role | Responsibilities | Permissions | Accessible modules | Security notes |
|---|---|---|---|---|
| **guest** | Browse portal, discover services | Read public catalog only | service-catalog (public), service-discovery | No PII; anon RLS SELECT only on public tables |
| **customer** | Submit and track own requests | CRUD own requests, own profile, own documents | onboarding, service-requests (own), documents (own), notifications, payments (own) | RLS scoped to `auth.uid()` |
| **agent** | Handle assigned requests | Read/update assigned requests, message customers | admin-submissions (assigned), notifications, documents (scoped) | Cannot reassign or delete; audit-logged |
| **reviewer** | QA / compliance review | Read all requests, add review notes, flag issues | admin-submissions (read), audit-log (read) | No writes to customer data |
| **admin** | Operate the portal | Full CRUD on requests, assign agents, manage catalog | all admin modules except role management | Elevated actions audit-logged |
| **super_admin** | Platform governance | Manage roles, integrations, secrets, feature flags | everything incl. rbac module | Role changes require re-auth + audit; small population |
| **service_account** | Server-to-server (webhooks, cron) | Scoped by signed tokens/HMAC | integrations, payments (webhook), admin-submissions (system) | Never a human; keys in secret store |

Privilege escalation controls: role assignment goes through a
super-admin-only server function; all role mutations write to `audit_log`;
JWT never carries role — always re-checked server-side via `has_role()`.

---

## 3. Navigation Architecture

### Primary (public, top nav — glass header)
`Home` · `Services` · `How it works` · `Insurance` · `Mortgage` · `Help` · `Sign in`

### Secondary (contextual, per section)
- Inside **Services**: category tabs (Banking, Insurance, Mortgage, Advisory…)
- Inside a **Service detail**: Overview / Requirements / Start request
- Inside **Request detail**: Timeline / Messages / Documents / Payments

### Mobile navigation
- Collapsed glass header with menu button → full-screen sheet
- Bottom tab bar for authenticated users: `Home` · `Requests` · `Discover` · `Notifications` · `Profile`

### Authenticated (customer) navigation
Sidebar (desktop) / bottom tabs (mobile):
`Dashboard` · `My requests` · `Discover services` · `Documents` · `Notifications` · `Profile & security`

### Admin console navigation
Left rail (desktop only):
`Overview` · `Queue` · `Requests` · `Customers` · `Services catalog` · `Agents & roles` · `Integrations` · `Audit log` · `Settings`

### User flow (high-level)
```text
Guest ──► Discover ──► Service detail ──► Sign in / sign up ──► Onboarding wizard
                                                                     │
                                                                     ▼
                                                              Request created
                                                                     │
                       ┌─────────────────────────────────────────────┼──────────────┐
                       ▼                                             ▼              ▼
                Customer tracks                              Admin triage      Notifications
                 request & docs                              & assignment       (email + in-app)
                                                                     │
                                                                     ▼
                                                              Agent works it
                                                                     │
                                                                     ▼
                                                              Resolution + audit
```

---

## 4. Route Architecture

File-based routing under `src/routes/`. Pathless layouts (`_authenticated`,
`_admin`) gate subtrees.

```text
src/routes/
  __root.tsx                          shell, providers, head metadata
  index.tsx                           / (public landing)
  services.tsx                        /services (layout, <Outlet />)
  services.index.tsx                  /services (catalog list)
  services.$slug.tsx                  /services/:slug
  insurance.tsx                       /insurance
  mortgage.tsx                        /mortgage
  how-it-works.tsx                    /how-it-works
  help.tsx                            /help
  legal.terms.tsx                     /legal/terms
  legal.privacy.tsx                   /legal/privacy

  auth.tsx                            /auth (sign-in + sign-up tabs)
  reset-password.tsx                  /reset-password (public, recovery)

  _authenticated.tsx                  gate: redirect to /auth if signed out
  _authenticated/dashboard.tsx        /dashboard
  _authenticated/requests.tsx         /requests (layout)
  _authenticated/requests.index.tsx   /requests
  _authenticated/requests.$id.tsx     /requests/:id
  _authenticated/onboarding.$service.tsx  /onboarding/:service
  _authenticated/documents.tsx        /documents
  _authenticated/notifications.tsx    /notifications
  _authenticated/profile.tsx          /profile

  _authenticated/_admin.tsx           gate: requires admin role
  _authenticated/_admin/overview.tsx  /overview
  _authenticated/_admin/queue.tsx     /queue
  _authenticated/_admin/requests.tsx  /admin-requests (or nested)
  _authenticated/_admin/catalog.tsx   /catalog
  _authenticated/_admin/agents.tsx    /agents
  _authenticated/_admin/audit.tsx     /audit
  _authenticated/_admin/settings.tsx  /settings

  api/public/webhooks.$provider.ts    external webhooks (HMAC verified)
  api/public/health.ts                health check
```

**Rules:** each shareable public route sets its own `head()` (title,
description, og:title, og:description). Only leaf routes may set `og:image`.
`/api/public/*` bypasses auth — verify signatures inside the handler.

---

## 5. Data Architecture

Core entities (design only — no migrations yet):

```text
auth.users (managed)
   │
   ├── profiles (1:1)          display_name, phone, avatar_url, locale
   │
   ├── user_roles (1:N)        role ∈ {customer, agent, reviewer, admin, super_admin}
   │
   ├── service_requests (1:N)  status, service_id, submitted_payload, assigned_to
   │       │
   │       ├── request_events (1:N)   status_changed, message_posted, doc_uploaded
   │       ├── request_messages (1:N) author_id, body, visibility (internal/external)
   │       ├── request_documents (1:N)→ documents
   │       └── payments (1:N)         provider_ref, amount, status
   │
   ├── documents (1:N)         storage_path, mime, size, owner_id
   │
   ├── notifications (1:N)     channel, template, payload, read_at
   │
   └── audit_log (1:N)         actor_id, action, entity, entity_id, diff, at

service_categories (1:N) ── services (1:N) ── service_versions
services (1:N) ── service_schemas (per version, JSON Schema for onboarding)

integrations                    provider, config, secrets_ref
feature_flags                   key, value, scope
```

**Ownership rules**
- Every customer-owned row carries `user_id` and is protected by RLS
  (`user_id = auth.uid()`).
- Admin-only tables (`audit_log`, `feature_flags`, `integrations`) grant
  SELECT to `authenticated` only through `has_role('admin')` policies.
- `user_roles` is auth-only — no `anon` grant.

**Future DB organisation**
- Schema `public` for app data.
- Views (`v_admin_queue`, `v_customer_dashboard`) for read models.
- SECURITY DEFINER functions for cross-table checks (`has_role`,
  `can_view_request`).
- All new tables ship with GRANT + RLS + policies in the same migration.

---

## 6. State Management

| Layer | Tool | What lives here |
|---|---|---|
| **Server cache** | TanStack Query (already wired) | All server data: requests, catalog, profile, notifications. Loaders `ensureQueryData`, components `useSuspenseQuery`. |
| **Router state** | TanStack Router context + search params | Auth context, filters, pagination, tab selection — anything shareable via URL. |
| **Global client** | Small React context providers per concern | Theme (dark default), toast/notification queue, feature flags, current-user helpers derived from Query. No Redux. |
| **Feature state** | Colocated hooks inside `src/features/<mod>/hooks/` | Wizard progress, form drafts (persisted to Cloud), unsent messages. |
| **Local UI state** | `useState` / `useReducer` in the component | Menu open/close, hover, transient form field state. |
| **Persistent client** | `localStorage` behind `useHydrated()` | Theme preference, dismissed banners, last-visited service. Never auth tokens (Cloud SDK manages those). |

Rule of thumb: **server data → Query. URL-worthy state → router. Everything
else → local.** Global context is the last resort.

---

## 7. API Architecture

### Layers
```text
UI component
   │  (event handler / suspense query)
   ▼
Feature hook (src/features/<mod>/hooks)
   │  calls server fn via useServerFn / queryFn
   ▼
Server function (src/features/<mod>/*.functions.ts)
   │  zod input validation → middleware (requireSupabaseAuth) → handler
   ▼
Server helper (src/features/<mod>/*.server.ts)
   │  Supabase client (user-scoped) OR supabaseAdmin (verified privileged only)
   ▼
Postgres (RLS enforced)
```

### Boundaries
- **`createServerFn`** — app-internal RPC (typed, called by loaders/components).
- **Server routes under `src/routes/api/public/*`** — external HTTP:
  webhooks, cron, integrations, health. Auth bypassed by prefix; handler
  MUST verify signatures.
- **Never** call server fns via manual `fetch()` to their `.url`.

### Error handling
- `zod.parse` at the boundary → structured 400.
- Auth failure → 401 via `requireSupabaseAuth`.
- Domain errors → typed return `{ ok: false, code, message }`; UI maps to
  toasts / inline messages.
- Unexpected → thrown Error → route `errorComponent`. `redirect()` only from
  loaders or `useServerFn` call sites.
- All server errors logged with correlation id; never leak provider details.

### Request flow (customer submits a service request)
```text
<OnboardingFlow> ──► submitRequest server fn
   ├─ zod validate payload
   ├─ requireSupabaseAuth (user token)
   ├─ insert into service_requests (RLS enforced)
   ├─ enqueue notifications.notify('request.created')
   ├─ audit_log.recordAudit()
   └─ return { id }
UI ──► navigate({ to: '/requests/$id' })
```

### Future integrations
Adapter pattern in `src/features/integrations/`: each provider (email,
CRM, main NairaLeap site, payment provider, SMS) implements a small
interface and is swapped via config. Webhooks land at
`/api/public/webhooks/$provider` with HMAC verification.

---

## 8. Security Architecture

### Authentication
- Lovable Cloud (Supabase Auth). Email/password + Google (default when
  enabled). Password HIBP check on.
- Session hydrated once in the root route; `onAuthStateChange` invalidates
  the router.
- Password reset uses a dedicated `/reset-password` page (checks
  `type=recovery`, calls `updateUser({ password })`).

### Authorization
- **RLS everywhere.** Every public-schema table has RLS enabled and
  explicit policies.
- **RBAC** via `user_roles` + `has_role(uid, role)` SECURITY DEFINER.
- **Route gates**: `_authenticated` layout enforces sign-in;
  `_authenticated/_admin` enforces admin. Component-level checks only for
  hiding controls, never as the sole gate.
- **Server-fn gates**: `requireSupabaseAuth` middleware + explicit
  `has_role` check for privileged actions; `supabaseAdmin` used only after
  the check passes.

### Session management
- Tokens managed by Supabase SDK (httpOnly cookie for SSR, localStorage
  for CSR). Never hand-rolled.
- Sign-out: cancel queries → clear query cache → `signOut()` → `navigate`
  with `replace: true`.

### API security
- All state-changing server fns validate with Zod.
- Public webhook routes verify HMAC with `timingSafeEqual`.
- Rate limiting per IP + per user on sensitive endpoints (auth, uploads,
  payments) via a shared middleware.
- CSRF: SameSite cookies + non-GET server fns require the SDK's bearer
  token (attached by client middleware in `src/start.ts`).
- Secrets live in the Cloud secret store; never in code or `VITE_*`.

### Validation strategy
- **Client**: Zod schemas colocated per feature (`schemas.ts`) used by both
  form (`react-hook-form` + `@hookform/resolvers/zod`) and server fn input.
- **Server**: same schema re-validated in `inputValidator`.
- **DB**: constraints + check constraints as the final line.

### Threat considerations
- Privilege escalation → roles table, not profile column; `has_role` is
  SECURITY DEFINER.
- IDOR → RLS on every table; server fns never trust client-provided user ids.
- Data exfiltration via public routes → `/api/public/*` never returns PII.
- Prompt injection (ai-assist) → user content is data, not instructions;
  system prompt fixed, outputs schema-validated.

---

## 9. Scalability Strategy

| Concern | Approach |
|---|---|
| **Thousands of users** | Stateless Cloudflare Workers auto-scale; Postgres connection pooling via Supabase; read models as views; add indexes per query pattern. |
| **Mobile apps (future)** | Server logic already lives in typed server fns + `/api/public/*` routes. A React Native / native client can call the same `/api/*` endpoints with the same auth. Keep DTOs stable and versioned. |
| **Third-party integrations** | Adapter interfaces in `features/integrations/`; provider swap without touching feature code. Webhooks isolated under `/api/public/webhooks/$provider`. |
| **AI services** | Lovable AI Gateway (chat, embeddings, image, TTS/STT). Prompts + guardrails in `features/ai-assist/`; heavy jobs run server-side, results cached in Postgres. |
| **Analytics** | Event capture via `track()` → append-only `analytics_events` table + external sink (e.g. product analytics provider) through an adapter. Dashboards read from materialised views. |
| **Notifications** | Event bus (`notify(event, payload)`) with pluggable channels (in-app, email, SMS, push). Fan-out is async; retries + dead-letter table. |
| **Payments** | Provider-agnostic `payments` module with intent + webhook pattern. Ledger table is the source of truth; provider is replaceable. |
| **Performance** | TanStack Router preloading (`intent`), Query cache with SWR, image optimisation, code-splitting per route, edge SSR. |
| **Observability** | Structured server logs + correlation ids, client error reporting hook (`reportLovableError`), audit log for business events. |
| **Feature rollout** | `feature_flags` table + `useFlag(key)` hook → gradual rollout, kill switches, per-role targeting. |

---

## 10. Folder Blueprint (target end-state)

```text
src/
  routes/                         thin — compose features
  components/
    layout/                       AppLayout, AdminLayout, AuthLayout
    ui/                           Container, GlassCard, BrandButton, …
  features/
    auth/
    user-profiles/
    rbac/
    service-catalog/
    service-discovery/
    onboarding/
    service-requests/
    admin-submissions/
    notifications/
    documents/
    payments/
    ai-assist/
    insurance/
    mortgage/
    analytics/
    audit-log/
    integrations/
    admin-console/
  lib/                            cross-cutting utilities
  hooks/                          cross-cutting hooks
  styles.css                      design tokens (do not fork)
```

Each feature folder skeleton (created on demand, not now):
```text
features/<name>/
  components/
  hooks/
  lib/
  server/                *.functions.ts + *.server.ts
  schemas.ts             zod schemas shared client+server
  types.ts
  index.ts               public barrel
  README.md
```

---

## Blueprint status

- Foundation (Phase 1): **complete** — design system, layout, primitives.
- Architecture blueprint (Phase 2): **complete** — this document.
- Implementation of any module above: **not started, intentionally.**

Future phases extend `src/features/*` and add routes under `src/routes/*`
strictly following this blueprint. The design system and shared primitives
are frozen surface area — extend, never fork.
