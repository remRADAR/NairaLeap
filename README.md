# NairaLeap Service Portal

NairaLeap is a customer-facing multi-service portal that turns visitor needs into qualified, routed, and trackable service requests. The experience begins with service discovery and NairaLeap Guide, continues through authenticated service intake and customer review, and is designed to end with human-operated resolution and follow-up.

## Current product checkpoint

The repository currently contains the public portal foundation, a Supabase-backed authentication boundary, canonical landing pages for all 12 services, blueprint-driven multi-service intake, the first authenticated Agriculture intake, review and submission, a customer request-tracking surface, and a persistent deterministic LeapBot chauffeur. Agriculture remains the pilot vertical for proving the full request lifecycle while the other services use the same contract-driven landing and intake pattern.

Live Supabase authentication, migration execution, RLS behavior, and request insertion are **UNVERIFIED** until the project environment is configured. Copy `.env.example` to `.env.local`, fill in the Supabase URL and publishable key, and apply the migration under `supabase/migrations/` before testing a real account.

## Stack

The app uses TanStack Start, React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Router, TanStack Query, Supabase Auth/Postgres, Zod, and Radix/shadcn-style UI primitives. The runtime is configured for Cloudflare-compatible deployment through the project’s own TanStack Start and Nitro build configuration.

## Routes

| Route                        | Purpose                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `/`                          | Public landing page and service discovery                                             |
| `/auth`                      | Sign-in and account creation                                                          |
| `/dashboard`                 | Authenticated customer workspace                                                      |
| `/services/{service}`        | Canonical landing page for each of the 12 services before onboarding                  |
| `/onboarding/{service}`      | Backward-compatible redirect into the canonical service landing flow                  |
| `/requests`                  | Authenticated customer request tracking                                               |
| `/insurance` and `/mortgage` | Backward-compatible redirects into the canonical Insurance and Mortgage landing pages |

## Development commands

```bash
bun install --frozen-lockfile
bun dev
bunx tsc --noEmit
bun run build
bun run lint
```

The repository’s lint, TypeScript, production-build and Chromium end-to-end checks are run as part of each meaningful increment. The live Supabase integration and production deployment remain environment-dependent and must be verified separately.

## Production setup

Follow [`docs/vercel-supabase-production-runbook.md`](./docs/vercel-supabase-production-runbook.md) for the exact Vercel environment-variable, redeployment, Supabase Auth URL, migration, and live verification sequence. The runbook never stores secrets and includes a troubleshooting matrix for the current production blocker.

## Architecture

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the product model, canonical request contract, security boundaries, rollout stages, and future module responsibilities. The rendered platform flow is available at [`docs/architecture/nairaleap-platform.png`](./docs/architecture/nairaleap-platform.png), with Mermaid source at [`docs/architecture/nairaleap-platform.mmd`](./docs/architecture/nairaleap-platform.mmd).

## Repository

[remRADAR/NairaLeap](https://github.com/remRADAR/NairaLeap)
