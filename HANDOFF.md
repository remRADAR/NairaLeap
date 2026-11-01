# NairaLeap Relaunch — Engineering Handoff to Manus

**Status: development branch ready for independent audit, repair, integration and testing.**
**No production deployment has been performed or claimed by this work.**

## 1. Repository state

- Repository: `remRADAR/NairaLeap`
- Base (main) commit at branch creation: **3fa0fcc**
- Development branch: **`feat/nairaleap-relaunch-implementation`** (created from main, never committed to main)
- No changes were made to main, production environment variables, DNS, domains, Supabase production data or deployment configuration. No secrets were exposed, printed, committed or modified.

## 2. Commits created on the development branch (in order)

| Commit | Content |
| --- | --- |
| bc377f6 | Reconciliation of PR #7 (insurance discovery): 15-category INSURANCE_CATEGORY_CATALOG, research/disclosure sections, PR#7 insurance content preserved against current main. |
| cfe228e | PR #8 core merge: unified UI components, QuestionEngine layout types ("sequential" / "horizontal" / "single-page"), service catalog restructuring. |
| 44b3945 | PR #8 landing pages, editorial and catalogue work reconciled against main. |
| 9df593a | PR #8 insurance route (Compare Cover / Get a Quote / Make a Claim + indicative offers table) and 13 remaining PR#8 files, with mojibake (encoding corruption) repaired. |
| 7f9e386 | Editorial image selection rewritten: explicit category-to-image mapping (deepest-match CATEGORY_IMAGE_OVERRIDES + top-level TOP_LEVEL_CATEGORY_IMAGES incl. Transportation & Infrastructure), all mapped images verified on disk, deterministic hash fallback. |
| a676209 | About Us / Privacy Policy / Disclaimer pages (clearly marked DRAFT, [to be confirmed] placeholders), footer links in both layouts; repairs AppLayout mobile-dropdown merge defect (duplicate mislabelled Services link + undefined `closeMenu`). |
| 3893fe7 | Advertising infrastructure: `src/features/advertising/` placements (homepage/article/category/service areas), shared AdSlot component, admin rate-card structure with ALL prices null (PENDING_OWNER_APPROVAL — no invented prices); homepage slots wired to homepage-top/homepage-bottom. |
| 37a61de | Research as a Professional Services offering: client ("I need research or consulting support") and supply-side ("I'm a researcher, consultant or specialist") roles + landing content update. |
| 30fe6b8 | Priorities B–F foundations: Supabase migration 20261101090000 (participant model, provider profiles/staff, service rate cards, scrap pricing framework, subscription states, WhatsApp callback queue with consent, KYC workflow + private document bucket, article FAQs/surveys, social distribution queue, language records — all with RLS), editorial HTML sanitizer, audit scripts `audit:ads` and `audit:editorial-sanitizer`. |
| 10d9b96 | Sanitizer wired into `src/routes/articles.$slug.tsx` (article HTML now passes the allowlist before `dangerouslySetInnerHTML`, cached per content string). |
| (this commit) | HANDOFF.md — this document. |

PR #7 and PR #8 originals were left untouched (reconciled via 3-way merges into direct branch commits; nothing was blindly merged). Temporary artifacts from reconciliation: branches `reconcile/pr7-insurance-discovery`, `reconcile/pr8-product-restructuring` and closed PR #10 — safe to delete, kept only as an audit trail.

## 3. Files created / modified / deleted

**Created**
- `src/routes/about.tsx`, `src/routes/privacy-policy.tsx`, `src/routes/disclaimer.tsx`
- `src/features/advertising/placements.ts`, `src/features/advertising/AdSlot.tsx`, `src/features/advertising/rateCard.ts`
- `src/features/editorial/sanitize.ts`
- `scripts/audit-advertising.ts`, `scripts/audit-editorial-sanitizer.ts`
- `supabase/migrations/20261101090000_marketplace_kyc_editorial_social_foundations.sql`
- `HANDOFF.md`

**Modified**
- `src/components/layout/AppLayout.tsx` (footer destinations; mobile dropdown repaired)
- `src/components/layout/EditorialLayout.tsx` (footer legal links; content-driven LatestTicker — the hard-coded news ticker is already replaced)
- `src/routes/index.tsx` (homepage slots via shared AdSlot)
- `src/routes/articles.$slug.tsx` (sanitised article HTML)
- `src/components/ui/ServiceLandingPage.tsx` (professional-services roles)
- `src/features/services/serviceLandingContent.ts` (professional-services research content)
- `package.json` (two new audit scripts)
- Plus the PR #7/#8 reconciliation set: insurance catalog/route files, question engine, service catalog (10 services), editorial images (`src/features/editorial/images.ts`), service landing content, and related components.

**Deleted**: nothing.

## 4. Features implemented vs outstanding

Implemented on this branch:
- PR #7 + PR #8 fully reconciled into a 10-service catalog with a 3-flow insurance route (compare/quote/claim + indicative offers table driven by the 15-category insurance catalog with product-research disclosures).
- Explicit, maintainable category→image editorial mapping with verified on-disk images and deterministic fallback.
- Research as a Professional Services offering (demand + supply side).
- Footer destinations About Us / Privacy Policy / Disclaimer (DRAFT-marked legal content, explicit placeholders, no invented business/legal facts).
- Content-driven news ticker (already present, verified).
- Configurable advertising placements across homepage/article/category/service areas + admin rate-card structure (all prices null pending owner approval).
- Database foundations (schema + RLS) for: unified participants, provider profiles/staff, service rate cards, scrap pricing (source/location/unit/effective/last-verified mandatory), subscription states (free/pending/active/suspended/cancelled — no charging), WhatsApp consent/callback staff queue, KYC verification workflow with private bucket, article FAQs/surveys, social distribution queue, language records with provenance/review.
- Editorial HTML sanitisation on the article render path.

Outstanding (not started or foundation-only, by design):
- UI for the new tables: provider registration screens, staff assignment UI, rate-card admin screen, scrap price admin, WhatsApp queue workbench, KYC review UI, article FAQ/survey components, social scheduling UI, dictionary/translator UIs, LeapBot TTS controls beyond existing browser speech.
- Article/category/service page wiring of the remaining AdSlot placements (definitions exist; only homepage slots wired).
- Booking/scheduling engine design (investigated: needs availability + staff calendar model — deliberately not reduced to a date-picker).
- Insurance discovery for annuities and savings/investment-linked insurance beyond what PR #7 introduced.
- Cypress coverage updates for restructured services/insurance UI.

## 5. Database migrations and RLS

New migration: `supabase/migrations/20261101090000_marketplace_kyc_editorial_social_foundations.sql`
- Tables: participants, provider_profiles, provider_staff, service_rate_cards, scrap_prices, subscriptions, whatsapp_callbacks, kyc_verifications, article_faqs, article_surveys, article_survey_responses, social_posts, language_entries — all with `enable row level security` and explicit policies.
- `app_is_admin()` helper (security definer) used by admin policies.
- Private storage bucket `kyc-documents` (public = false) created via `insert into storage.buckets ... on conflict do nothing`.
- Updated_at triggers on all tables with `updated_at`.
- Not applied to any environment — apply via `supabase db push` / `supabase migration up` against a staging project first.

## 6. Verification status — IMPORTANT, READ CAREFULLY

**No build, TypeScript check, lint, Cypress run or bun audit script was executed in this workspace.** The working environment had no Node/Bun runtime, no `npm`/`bun` install and no local checkout — all work was done through the GitHub API. The previously recorded 58/58 Cypress and 74 language-check results are historical and must not be assumed. Nothing in this handoff claims a passing test.

Manus must run, in this order, and fix anything that fails:
1. `npm install` (or `bun install`)
2. `npx tsc --noEmit` (or the project's typecheck) — note: the QuestionEngine 3-layout merge and the PR#8-reconciled files were reasoned about carefully but never compiled; treat type errors as likely and fix them.
3. `npm run lint`
4. `npm run build`
5. `bun run scripts/audit-service-intake.ts`, `audit:insurance`, `audit:editorial-images`, `audit:leapbot-boundaries`, `audit:leapbot-workflow-boundaries` plus the new `audit:ads` and `audit:editorial-sanitizer`
6. `npm run e2e` (Cypress). Expect possible failures in insurance-onboarding, service-role-profiles and service-navigation specs against the restructured service/insurance UI; update specs to the new UI rather than reverting UI work.

## 7. Known defects and unresolved issues

- PR #8's indicative insurance prices in the compare-cover flow are UNVERIFIED placeholder figures from the original branch; the owner must verify or replace them before relaunch. They are labelled indicative.
- A mobile-nav merge defect in AppLayout (duplicate mislabelled Services link, undefined `closeMenu`) was found and repaired in a676209 — re-verify the mobile menu visually in Cypress.
- Cypress specs referencing the pre-restructure service/insurance flows may fail until updated.
- Legal pages are DRAFT: registered entity, retention periods, cookie inventory, advertising terms all use [to be confirmed] placeholders requiring owner/legal sign-off.
- Rate card and scrap prices are intentionally empty (null) — never fill them with invented values.
- Social publishing and WhatsApp API integrations are schema-only; no OAuth credentials or platform permissions exist. Do not enable external publishing until consent, credentials and tests are verified.
- `AppLayout` imports `BookOpen` from lucide-react but appears not to use it — harmless, but lint may flag it; remove if so.

## 8. Environment variables / provider authorisations required (names only, no secret values)

- Supabase project URL and anon/service-role keys (existing project pattern — confirm staging vs production values are separated).
- Future: OAuth credentials for each social platform (Twitter/X, Facebook, Instagram, Telegram, LinkedIn, YouTube) — only when social publishing is being enabled, never before.
- Future: WhatsApp Business API verification — only when the callback workflow moves beyond the manual staff queue.
- Vercel: no changes required for this branch's code; existing project `nairaleap` under `remradars-projects`.

## 9. Manual configuration still required (owner decisions)

1. Approve/replace all [to be confirmed] legal content on About, Privacy Policy, Disclaimer.
2. Set advertising rate prices (or leave slots as labelled placeholders).
3. Supply real scrap market rates with sources, locations and verification dates.
4. Verify PR #8 indicative insurance prices.
5. Decide subscription plan details (prices, entitlements) before any paid state is ever activated.
6. Decide KYC retention policy and reviewer staffing.

## 10. Exact instructions for Manus

1. `git clone https://github.com/remRADAR/NairaLeap && cd NairaLeap && git checkout feat/nairaleap-relaunch-implementation` — verify base is main@3fa0fcc lineage via `git log --oneline` and the commit list in section 2.
2. Audit the branch: `git diff main...feat/nairaleap-relaunch-implementation --stat`, review each commit, especially the PR#7/#8 reconciliations (bc377f6, cfe228e, 44b3945, 9df593a) for semantic correctness against PR #7/#8 originals.
3. Run the full verification sequence from section 6; repair failures as small, well-described commits on the same branch. Do not force-push and do not commit to main.
4. Apply the migration to a STAGING Supabase project first (`supabase db push`); verify RLS with `supabase db lint` and per-role select/insert/update probes. Only then consider production application, with owner approval.
5. Re-run and update Cypress specs for: services navigation (10 services), insurance 3-flow, professional-services research roles, mobile nav, footer legal links, homepage ad slots (`[data-ad-placement="homepage-top"|"homepage-bottom"]`), article sanitiser behaviour.
6. Confirm no accidental changes to production config: `git diff main...HEAD -- vercel.json .env* supabase/config.toml` should show only the new migration file.
7. When green: open a PR from `feat/nairaleap-relaunch-implementation` to main, request owner review of all DRAFT/pending-approval content (legal text, prices, insurance figures), and only merge and deploy via the existing Vercel project after explicit owner approval. Delete the reconcile/* temp branches and PR #10 after merge if desired.
8. Do not enable paid subscriptions, automatic social publishing or the WhatsApp API without the authorisations in section 8.

**This branch is not deployed. Production remains on main and untouched.**
