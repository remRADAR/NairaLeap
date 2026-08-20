# NairaLeap Service Portal

NairaLeap is a customer-facing multi-service portal that turns visitor needs into qualified, routed, and trackable service requests. The experience begins with service discovery and NairaLeap Guide, continues through authenticated service intake and customer review, and is designed to end with human-operated resolution and follow-up.

## Current product checkpoint

The repository currently contains the public portal foundation, a Supabase-backed authentication boundary, the first authenticated Agriculture intake, review and submission, and the first customer request-tracking surface. Agriculture is the pilot vertical for proving the full request lifecycle before expanding the same contract-driven pattern to Property Listings, Business Funding, Partnerships, Vendor Marketplace, Distress Sales, Recycling & Scrap, Business Briefs, Professional Services, and Customer Support.

Live Supabase authentication, migration execution, RLS behavior, and request insertion are **UNVERIFIED** until the project environment is configured. Copy `.env.example` to `.env.local`, fill in the Supabase URL and publishable key, and apply the migration under `supabase/migrations/` before testing a real account.

## Stack

The app uses TanStack Start, React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Router, TanStack Query, Supabase Auth/Postgres, Zod, and Radix/shadcn-style UI primitives. The runtime is designed for Cloudflare-compatible deployment through the existing Lovable/TanStack configuration.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page and service discovery |
| `/auth` | Sign-in and account creation |
| `/dashboard` | Authenticated customer workspace |
| `/onboarding/agriculture` | Agriculture-specific intake, review, and submission |
| `/requests` | Authenticated customer request tracking |
| `/insurance` | Current placeholder vertical |
| `/mortgage` | Current placeholder vertical |

## Development commands

```bash
bun install --frozen-lockfile
bun dev
bunx tsc --noEmit
bun run build
bun run lint
```

The existing lint command still reports repository-wide formatting debt. TypeScript and the production build pass at the current implementation checkpoint.

## Architecture

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the product model, canonical request contract, security boundaries, rollout stages, and future module responsibilities. The rendered platform flow is available at [`docs/architecture/nairaleap-platform.png`](./docs/architecture/nairaleap-platform.png), with Mermaid source at [`docs/architecture/nairaleap-platform.mmd`](./docs/architecture/nairaleap-platform.mmd).

## Repository

[remRADAR/NairaLeap](https://github.com/remRADAR/NairaLeap)
