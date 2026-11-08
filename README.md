# NairaLeap

**Official brand tag:** Indicator Drivers

NairaLeap is a Nigerian information and opportunity ecosystem that makes the forces shaping Nigeria easier to see, understand and act on. The strategic brand promise is:

> Make the forces shaping Nigeria easier to see, understand and act on.

NairaLeap is organised around an indicator-led view of Nigerian economic and public life. It connects evidence, explanation and practical next steps without presenting unverified claims, regulated advice, guaranteed outcomes or invented corporate details as fact.

## Brand foundation

### Operating model

NairaLeap works through a simple **Observe → Explain → Connect** model:

1. **Observe** — track indicators, events, signals and lived realities across Nigeria.
2. **Explain** — turn source-backed information into clear editorial context, analysis and useful guidance.
3. **Connect** — help a reader find a relevant service, opportunity or human follow-up where the product actually supports that next step.

The model describes how the ecosystem works; it does not change the scope of any individual route or service.

### Parent-brand architecture

- **NairaLeap** — the parent brand and shared identity.
- **NairaLeap Editorial** — the public editorial homepage, stories and archive at `/` and related editorial routes.
- **NairaLeap Services** — the service-discovery and request-preparation portal at `/services`.

The editorial homepage is not a service dashboard. `/` preserves the editorial homepage layout, newsletter strip, indicator navigation, ticker, featured story, Top Stories, All Stories and editorial footer. `/services` remains a separate portal with its own service discovery, LeapBot and authenticated request boundary. The two experiences share the parent brand, legal routes and visual foundations but retain their distinct information architecture.

### Editorial voice and communication standards

Editorial and product copy should be clear, specific, calm and useful. Prefer plain language, explain why an indicator matters, name sources and limits, distinguish reported facts from interpretation, and state when information is provisional, revised or contested. Avoid hype, unexplained jargon, guaranteed outcomes, fabricated partners, invented registrations or implied regulatory approval. The editorial archive preserves migrated WordPress stories and their original source context; preservation does not imply that historic copy has been rewritten or independently re-verified.

## Current product architecture

This branch preserves the existing product rather than redesigning it. The application is a TanStack Start application using React 19, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS v4, Supabase Auth/Postgres, Zod and Radix/shadcn-style UI primitives. Nitro provides the current Cloudflare-compatible build configuration.

The main boundaries are:

- Public editorial routes render through `EditorialLayout` and read the local WordPress editorial snapshot and imported taxonomy.
- Service routes render through `AppLayout` and the existing `SERVICE_CATALOG`, service landing content, NairaLeap Guide, LeapBot, question/blueprint flow and authenticated request submission path.
- Supabase Auth provides the session boundary; `service_requests` persistence is protected by the existing server checks and row-level security policies.
- `src/features/brand/brand.ts` is the single source of truth for parent-brand naming, the official tag and shared brand descriptions.
- `src/features/legal/legalDocuments.ts` is the shared source for About, Disclaimer and Privacy Policy metadata and review status.
- `ARCHITECTURE.md` documents the deeper request contract, security posture, rollout model and future module boundaries.

LeapBot is currently an implemented portal navigation and support experience. Its actual capabilities remain bounded by the existing service catalogue, navigation-agent records and request flow; this branch does not expand it into an unverified general-purpose agent.

## Routes

| Route                        | Experience          | Purpose                                                                                    |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `/`                          | NairaLeap Editorial | Editorial homepage with indicator-led stories and the existing homepage content structure. |
| `/articles`                  | NairaLeap Editorial | Latest editorial stories.                                                                  |
| `/articles/$slug`            | NairaLeap Editorial | Individual migrated or local editorial story.                                              |
| `/archive`                   | NairaLeap Editorial | Filterable editorial archive by topic, category or tag.                                    |
| `/about`                     | Shared              | Brand story, ecosystem architecture and accountability information.                        |
| `/disclaimer`                | Shared              | Draft disclaimer for editorial and services experiences.                                   |
| `/privacy-policy`            | Shared              | Draft privacy policy grounded in the current application flows.                            |
| `/services`                  | NairaLeap Services  | Public service discovery portal and NairaLeap Guide entry point.                           |
| `/services/$service`         | NairaLeap Services  | Canonical landing page for each current catalogue service.                                 |
| `/auth`                      | NairaLeap Services  | Sign-in and account creation before durable request submission.                            |
| `/dashboard`                 | NairaLeap Services  | Authenticated customer workspace.                                                          |
| `/requests`                  | NairaLeap Services  | Authenticated customer request tracking.                                                   |
| `/onboarding/$service`       | NairaLeap Services  | Backward-compatible onboarding route into the canonical service flow.                      |
| `/insurance` and `/mortgage` | NairaLeap Services  | Existing backward-compatible, service-specific navigator routes.                           |
| `/admin-login` and `/admin`  | Internal            | Admin authentication and the existing Website / Service Portal studio.                     |

## Taxonomy and content governance

The repository currently contains several related but intentionally distinct vocabularies:

| Source                       | Current evidence                                                                                                                                                                                                                                                                        | Status                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Legacy WordPress categories  | 256 imported category records, including 9 top-level domains and the original parent/child paths in `src/data/wordpressCategories.ts`.                                                                                                                                                  | Historical editorial source of truth for migrated archive records.                         |
| Current editorial navigation | 5-section visible menu in `src/features/navigation-agent/wordpressMainNavigation.ts`, with groups such as Education, Agriculture, Infrastructure, Technology, Leadership and Political Arena.                                                                                           | Existing navigation contract; links currently filter the local archive by slugified topic. |
| Proposed indicator domains   | The 9 imported top-level domains: Culture & Creative Economy; Economic Development; Governance & Leadership; Human Development; Infrastructure & Connectivity; International & Regional Affairs; Security & Stability; Sustainability & Development; Technology & Innovation.           | Recommended canonical domain layer for future reconciliation.                              |
| Service catalogue            | 12 operational discovery entries in `src/features/services/serviceCatalog.ts`: Agriculture, Property Listings, Business Funding, Partnerships, Vendor Marketplace, Distress Sales, Recycling & Scrap, Business Briefs, Professional Services, Customer Support, Insurance and Mortgage. | Separate opportunity/service vocabulary; not editorial categories.                         |

The discrepancy is structural rather than a reason to silently rename content: the imported hierarchy has nine domains and legacy labels, the visible navigation exposes only five of those domains at its top level, and the service catalogue mixes opportunity pathways with editorial subjects. The recommended canonical structure is **NairaLeap Editorial domain → editorial group → indicator/topic → story**, alongside an independent **NairaLeap Services service → service role → intake workflow** structure. Cross-links may connect a story to a service only when the relationship is explicit and supported by the existing product.

No category, slug, article, service, route or database record is renamed, deleted or migrated by this branch. Taxonomy reconciliation remains an owner decision and should be handled through a separately reviewed migration with redirect, archive and analytics checks.

## Visual identity and design constraints

The parent identity uses the existing NairaLeap wordmark and shared brand naming. The editorial experience retains its light editorial surface, purple accent system, pink newsletter strip, responsive navigation, ticker, story hierarchy and footer. The services experience retains its dark glassmorphism shell, service-page treatment, responsive behaviour, LeapBot motion and existing design tokens in `src/styles.css`.

The brand implementation is intentionally narrow: update identity and shared copy without changing layout architecture, service navigation, the authentication boundary, Supabase security, request workflows or LeapBot capabilities. Official social accounts, registration details, ownership claims, partnerships, addresses and legal approvals must not be added until independently supplied and approved.

## Development

### Requirements

- Node.js with Bun available for the repository's lockfile and scripts.
- A local copy of the repository and the target branch.
- Optional Supabase project settings for real authentication and request persistence.
- Optional WordPress REST API endpoint; the local editorial snapshot is used when it is unset.
- Optional public KeyPay key; secret or gateway credentials must never be placed in frontend code.

Copy `.env.example` to `.env.local` when environment-backed flows are needed:

```bash
cp .env.example .env.local
```

The supported public variables are `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, optional `VITE_WORDPRESS_API_URL`, and optional `VITE_KEYPAY_PUBLIC_KEY`. Live Supabase authentication, migrations, RLS behaviour, external integrations and production deployment remain environment-dependent and are not verified by a local build alone.

### Commands

```bash
bun install --frozen-lockfile
bun dev                 # local development server
bunx tsc --noEmit       # TypeScript check
bun run lint            # ESLint
bun run build           # production build
bun run e2e             # Cypress / Chromium end-to-end suites
```

Useful focused audits include `bun run audit:intake`, `bun run audit:insurance`, `bun run audit:leapbot-boundaries`, `bun run audit:leapbot-workflow-boundaries` and `bun run audit:editorial-images`. Cypress uses `CYPRESS_BASE_URL` when set and otherwise expects the local app at `http://localhost:8091`; start the appropriate dev or preview server before running browser tests.

For production setup, use [`docs/vercel-supabase-production-runbook.md`](./docs/vercel-supabase-production-runbook.md). Do not treat that runbook as proof that the current checkout is deployed or that live integrations are configured.

## Brand governance and implementation sequence

1. Treat `NairaLeap` and **Indicator Drivers** as the authoritative parent name and official brand tag.
2. Use `NairaLeap Editorial` for the editorial homepage/archive and `NairaLeap Services` for the `/services` portal.
3. Keep the strategic promise — “Make the forces shaping Nigeria easier to see, understand and act on.” — distinct from the official tag.
4. Route shared metadata and legal-page naming through the shared brand/legal modules rather than copying divergent strings into components.
5. Preserve the editorial/service boundary and existing visual tokens while reconciling taxonomy through an explicit, separately approved change.
6. Before publishing legal, registration, ownership, partner, address, social-account or domain claims, obtain owner confirmation and qualified review where appropriate.
7. Verify the diff, TypeScript, lint, production build, relevant Cypress suites and brand-reference checks before review. Keep PR #14 open and unmerged until an independent reviewer approves the result.

## Verification notes for this branch

The requested verification should be run from the target branch and reported with actual output, not inferred from source inspection. At minimum, record the results of the TypeScript check, lint, production build, relevant corporate/footer/brand Cypress suites, and a repository-wide brand-reference check that confirms the old slogan is absent and canonical NairaLeap naming is present. Live Supabase behaviour and production deployment require separate environment-backed verification.

## Further documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — product model, request contract and security boundaries.
- [`DEVELOPMENT_HANDOFF.md`](./DEVELOPMENT_HANDOFF.md) — continuity checkpoint and implementation history.
- [`docs/legal-owner-approvals.md`](./docs/legal-owner-approvals.md) — claims awaiting owner approval.
- [`docs/rebrand-discovery-report-2026-11-07.md`](./docs/rebrand-discovery-report-2026-11-07.md) — prior rebrand discovery and evidence.
- [`docs/vercel-supabase-production-runbook.md`](./docs/vercel-supabase-production-runbook.md) — environment and production preparation caveats.

Repository: [remRADAR/NairaLeap](https://github.com/remRADAR/NairaLeap)
