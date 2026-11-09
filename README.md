# NairaLeap Service Portal

NairaLeap is a customer-facing multi-service portal that turns visitor needs into qualified, routed, and trackable service requests. The experience begins with service discovery and NairaLeap Guide, continues through authenticated service intake and customer review, and is designed to end with human-operated resolution and follow-up.

## Current product checkpoint

The public root now follows the authenticated WordPress Blogsy homepage architecture: newsletter strip, Nairaleap wordmark, exact indicator taxonomy navigation, ticker, featured story, Top Stories, All Stories, social footer, and a Services CTA into the portal. The existing service portal is preserved at `/services`, with Supabase Auth retained as the identity boundary and Cloudflare D1 used for service-request persistence when the `NAIRALEAP_DB` binding is present. Non-Cloudflare environments retain the Supabase persistence fallback for rollback and local verification.

Live Supabase authentication, Cloudflare D1 request insertion, and production deployment remain environment-dependent. Copy `.env.example` to `.env.local` and fill in the Supabase URL and publishable key before testing a real account. The D1 schema is versioned under `cloudflare/migrations/` and the binding is defined in `wrangler.jsonc`.

## Stack

The app uses TanStack Start, React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Router, TanStack Query, Supabase Auth, Cloudflare D1, Zod, and Radix/shadcn-style UI primitives. The runtime is configured for Cloudflare-compatible deployment through the project’s own TanStack Start and Nitro build configuration.

See [`docs/cloudflare-d1-migration.md`](./docs/cloudflare-d1-migration.md) for the staged migration boundary and rollback behavior.

## Routes

| Route                        | Purpose                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `/`                          | Blogsy-inspired editorial homepage and indicator stories                              |
| `/services`                  | Public NairaLeap service portal and service discovery                                  |
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
