# NairaLeap Relaunch — Engineering Handoff to Manus (rev. 2, post-security-repair)

**Status: development branch with all review-mandated repairs applied; ready for independent audit, execution of the full verification suite, and repair of anything it exposes.**
**No production deployment has been performed. No migration has been applied to any database.**

## 1. Repository state

- Repository: `remRADAR/NairaLeap`
- Base (main) commit at branch creation: **3fa0fcc**
- Development branch: **`feat/nairaleap-relaunch-implementation`** — the ONLY branch worked on; main was never modified.
- No DNS, domains, production environment variables or deploy configuration were touched. No secrets were exposed or committed.

## 2. Original implementation commits (chronological)

| Commit | Content |
| --- | --- |
| bc377f6 | PR #7 reconciliation (15-category insurance catalog, research/disclosure sections). |
| cfe228e | PR #8 core: unified UI, QuestionEngine layouts (sequential/horizontal/single-page), service catalog restructure. |
| 44b3945 | PR #8 landing/editorial/catalogue work. |
| 9df593a | PR #8 insurance route (Compare/Quote/Claim + indicative offers) + 13 direct files, mojibake repaired. |
| 7f9e386 | Editorial category→image mapping rewritten (explicit overrides, verified files, deterministic fallback). |
| a676209 | About/Privacy/Disclaimer DRAFT pages + footer links; AppLayout mobile-nav merge defect repaired. |
| 3893fe7 | Advertising: placements (8, all areas), shared AdSlot, rate-card structure (all prices NULL / pending owner approval); homepage wired. |
| 37a61de | Research as Professional Services offering (demand + supply roles). |
| 30fe6b8 | Foundations migration 20261101090000 + editorial sanitizer + audit scripts (audit:ads, audit:editorial-sanitizer). |
| 10d9b96 | Sanitizer wired into articles.$slug render path. |
| 85c2cc8 | HANDOFF.md rev.1. |

## 3. REPAIR commits (this round — ChatGPT-identified mandatory corrections)

| Commit | Repair |
| --- | --- |
| 0be4417 | **(1) package.json restored**: the complete dependency manifest from main (every dependency and version verbatim; nothing upgraded/removed); new audit scripts retained. Repository uses bun; `bun.lock` was never modified and matches the restored manifest exactly, so no lockfile change is required. **(2) Security migration 20261101120000_security_hardening.sql** (details §5). **(3) pgTAP database security tests** `supabase/tests/rls_security_test.sql` (14 cases). |
| 6918472 | **(6) Advertising integration completed**: article-end slot on article pages, category-list-top above the archive grid, service-landing-footer on service pages (portal tone added to the shared AdSlot). Single ad system, no duplicates; 8 placements preserved; prices still NULL. |
| (see below) | HANDOFF.md rev.2 — this document. |
| (final repair) | **Dependency audit finding fixed**: a verification pass comparing package.json against main byte-for-byte caught one transcription error — `@radix-ui/react-switch` was written as `^2.2.6` instead of main's `^1.2.6` in commit 0be4417. Corrected to match main exactly. With this fix, `dependencies` and `devDependencies` are verified identical to main (every key, version and order), `bun.lock` remains the untouched main lockfile, and no unrelated dependency was upgraded. |

## 4. Features implemented vs outstanding

Implemented: PR #7 + #8 reconciled (10-service catalog, 3-flow insurance route, indicative table, disclosures); category→image editorial mapping; Research as Professional Services; DRAFT legal pages (About/Privacy/Disclaimer) with explicit placeholders; content-driven news ticker; complete advertising foundation (8 placements + shared AdSlot wired on homepage, article, archive and service pages + admin rate-card structure, all prices pending owner approval); database foundations with RLS (§5); editorial HTML sanitizer on the article render path.

Outstanding: UI for new tables (provider onboarding, staff assignment, rate-card admin, scrap price admin, WhatsApp workbench, KYC review screen, article FAQ/survey components, social scheduling UI, language tooling UIs); booking/scheduling engine; annuity/savings-linked insurance discovery; Cypress spec updates for the restructured UI; owner approvals for all DRAFT content and prices.

## 5. Database security corrections (migrations 20261101090000 + 20261101120000)

Both migrations are append-only; the second supersedes the first's policies. NOT applied to any database — staging first, only.

- **Privilege escalation closed.** `app_is_admin()` / `app_is_staff_or_admin()` now derive privilege from `auth.users.raw_app_meta_data` — settable only via the Supabase Auth admin API (trusted server-side administrative process), unreachable by participants. A trigger forces ordinary participant inserts to `roles = ['customer']` and makes roles immutable on update: self-promotion to admin/staff and granting roles to others are neutralised/rejected at the database level.
- **Provider verification locked.** Owners freely edit business info; `verification_status` is forced 'unverified' on insert and any change raises 42501 unless the caller is a trusted admin (reviewer path).
- **KYC hardened.** Raw identity numbers are NEVER stored in participant-readable rows: a trigger consumes `id_number_input`, storing only a SHA-256 reference hash + last 4 characters. Owners can never set verified/rejected states nor touch `reviewer_id`/`review_notes`/`expires_at` (trigger + policy). Documents stay in the PRIVATE `kyc-documents` bucket with explicit `storage.objects` policies: owner-prefixed paths (uid folder), mimetype allowlist (JPEG/PNG/WebP/PDF), 10 MB size cap, owner+admin read, owner delete, no update policy (immutable; re-upload to replace).
- **Editorial/callback policies corrected.** FAQ inserts forced to `status='pending'` (moderation admin-only); survey responses validated against the referenced active survey's options; callback inserts require participant ownership + explicit consent timestamp + 'queued' state + no staff assignment, and ordinary users have no update policy on callbacks at all; staff-queue policies use the trusted role source.

**Database-level tests**: `supabase/tests/rls_security_test.sql` (pgTAP, 14 cases) exercises attempted self-promotion, granting roles to others, provider self-verification, KYC input consumption/self-verify/reviewer tampering, callback consent/ownership, FAQ self-approval and survey option validity — via direct authenticated SQL with simulated JWT claims, not the UI. **NOT EXECUTED in this environment**; run with `supabase db test` against staging (needs `create extension pgtap`) and attach output.

## 6. Verification status — HONEST, READ FIRST

**This environment has no Node/Bun runtime, no npm/bun install, no database and no Cypress. NOTHING was executed. Every item below is REQUIRED EVIDENCE that Manus must generate:**

| Command | Status |
| --- | --- |
| `bun install` (repo uses bun; bun.lock) | NOT RUN — but lockfile is unchanged from main and matches the restored manifest, so a clean install should succeed; verify. |
| `npx tsc --noEmit` | NOT RUN — treat type errors as possible; fix in small commits. |
| `npm run lint` (ESLint) | NOT RUN. |
| `npm run build` (production build) | NOT RUN. |
| All audit scripts incl. new `audit:ads`, `audit:editorial-sanitizer` | NOT RUN. |
| `npm run e2e` (Cypress) | NOT RUN — expect updates needed for insurance-onboarding, service-role-profiles, service-navigation specs and new coverage for ad slots (`[data-ad-placement=...]`), legal pages and mobile nav. |
| `supabase db test` (pgTAP security tests) | NOT RUN — requires staging database. |

**Vercel check finding:** no Vercel access exists in this environment. The previously failing Vercel/CI check on the branch is consistent with the now-fixed package.json defect (dependency sections were accidentally dropped in commit 30fe6b8, breaking install/build). With the manifest restored byte-for-byte from main, the build inputs are identical to main's, which is green. Manus MUST confirm by checking the Vercel deployment status for the branch after the repair commits; if it still fails, capture the build log and fix the actual error — do not assume.

## 7. Known defects / open items

- PR #8's indicative insurance prices are UNVERIFIED placeholders — owner must verify/replace before relaunch.
- Legal pages are DRAFT with [to be confirmed] placeholders — owner/legal sign-off required.
- All advertising rates and scrap prices intentionally NULL — never fill with invented values.
- Social publishing + WhatsApp API are schema-only; no credentials/permissions exist; do not enable.
- Subscriptions model states only; no charging — do not activate.
- `service-landing-top`, `article-inline` and `category-sidebar` placements are defined but not yet rendered in page templates (sidebar one is disabled by design); wiring them is trivial via the shared AdSlot.

## 8. Environment variables / provider authorisations needed (names only)

- Supabase project URL + keys (staging separated from production).
- Future only: OAuth per social platform; WhatsApp Business API; each only when its feature is being enabled, after owner authorisation.

## 9. Exact instructions for Manus

1. Clone, checkout `feat/nairaleap-relaunch-implementation`; verify commit inventory matches §2 + §3 (base 3fa0fcc lineage, no commits to main).
2. `git diff main...HEAD -- package.json` should show ONLY the two added audit scripts; dependencies must match main exactly.
3. Run the full verification suite (§6) in order; fix failures as small commits on the same branch; no force-push; never commit to main.
4. Apply BOTH migrations to a STAGING Supabase project (`supabase db push`), run `supabase db test` (pgTAP), and probe RLS with authenticated test accounts for: self-promotion attempts, provider self-verification, KYC reviewer tampering, storage upload of an oversized/wrong-type document. Attach real output to this handoff's successor.
5. Confirm the Vercel check now passes; if not, capture and fix the actual build error.
6. Re-run and extend Cypress coverage per §6; also cover the three legal pages and footer links.
7. When green: open a PR to main, request owner review of all DRAFT/pending content (legal text, insurance figures, rates), and merge/deploy only after explicit owner approval. The reconcile/* temp branches and closed PR #10 may be deleted after merge.
8. Do not enable paid subscriptions, WhatsApp automation or social publishing without the authorisations in §8.

**This branch is not deployed. Production remains on main, untouched.**
