# NairaLeap Relaunch — Independent Engineering & Release-Readiness Handoff (rev. 3)

**Status: NOT READY for merge or production release.** The QuestionEngine build failure and service-request participant UPDATE gap have been repaired in feature-branch code. The latest source commit, `8fd76cd`, reached Vercel **READY**; its homepage, insurance, legal and services routes all returned HTTP 200. Local build/typecheck and all seven configured audit scripts pass. Database migrations and pgTAP have not been applied or executed because no isolated staging project/toolchain is available. The full repository lint, Cypress E2E, remaining dependency advisories, owner approvals and database-backed runtime checks remain open.

**No production deployment or database migration was performed.** No production DNS, environment variables, secrets, billing, or account configuration was changed.

## 1. Repository, branch, and commit state

- Repository: `remRADAR/NairaLeap`
- Working branch: `feat/nairaleap-relaunch-implementation`
- Starting branch SHA independently checked against GitHub: `a3c3624e665fa0d3a45f387f3eeb1e7aeaadc0be`
- Source repair commit: [`cf215a717382f20213c9ddfc1f37aefcd62f96de`](https://github.com/remRADAR/NairaLeap/commit/cf215a717382f20213c9ddfc1f37aefcd62f96de) (`fix: secure service requests and repair relaunch flows`).
- Security follow-up commit pushed to the same branch: [`8fd76cd7e262ab261ef76dd0745ef2120c458c1d`](https://github.com/remRADAR/NairaLeap/commit/8fd76cd7e262ab261ef76dd0745ef2120c458c1d) (`fix(db): enforce admin-only service request updates`). The remote branch SHA matched this commit after push.
- No merge, reset, force-push, or main-branch change occurred. No pull request was created. This handoff is a documentation-only follow-up to source commit `8fd76cd`; it changes no application code or database migration.
- Source commits change application code, tests, `bun.lock` and additive migrations; `package.json` and environment files were not changed.

### Relevant commit history

| Commit | Change |
| --- | --- |
| `bc377f6` | PR #7 reconciliation: insurance catalogue and disclosures. |
| `cfe228e`, `44b3945` | PR #8 core UI, QuestionEngine, service catalogue, landing and editorial work. |
| `9df593a` | Insurance route and three visitor-facing action flows. |
| `7f9e386`, `a676209` | Editorial image mapping; draft About, Privacy and Disclaimer pages and footer work. |
| `3893fe7`, `37a61de` | Advertising foundation and Research under Professional Services. |
| `30fe6b8`, `10d9b96`, `85c2cc8` | Marketplace/security foundations, sanitizer wiring and earlier handoff. |
| `0be4417`, `6918472` | Package manifest/security-test repairs and additional AdSlot wiring. |
| `a3c3624` | Latest pre-task branch tip; Vercel failed on the duplicate `layout` declaration. |
| `cf215a7` | This round’s build, QuestionEngine, insurance-contract, sanitizer, dependency-lock and service-request authorization repairs. |
| `8fd76cd` | Adds a restrictive admin-only service-request UPDATE guard and a regression that injects a temporary permissive policy. |

## 2. Changes in this round

- Repaired `src/features/question-engine/QuestionEngine.tsx` layout prop/declaration conflicts while retaining guided, horizontal and single-page rendering. The shared hook now provides visible questions to the horizontal form; the existing single-page UX and role-specific page layout are preserved. Related role/catalogue/route typing issues and the missing `Sailboat` import were also corrected. TanStack’s generated route tree now includes `/about`, `/disclaimer` and `/privacy-policy` after the production build.
- Fixed the insurance form/server contract: the visible Compare Cover, Get a Quote and Make a Claim labels now submit the schema’s canonical values (`compare-options`, `new-cover`, `claim`). Claim-only incident-date visibility now matches the canonical `claim` value. `scripts/audit-insurance.ts` asserts both choice/schema agreement and the conditional field.
- Hardened the existing editorial sanitizer’s handling of comments and dangerous embedded blocks and added regression cases. The sanitizer audit passes, but this is not a browser XSS assessment or proof against all malformed HTML.
- Repaired service-role/catalogue mismatches and updated the existing service-role Cypress matrix to the current catalogue. Added an explicit article-loader return contract to resolve type inference. These changes preserve existing systems rather than adding parallel implementations.
- Updated `bun.lock` with compatible-range vulnerability fixes using Bun’s audit workflow. No dependency manifest was changed. Two advisories remain; see §4.
- Improved the KYC identity reference in `supabase/migrations/20261101120000_security_hardening.sql`: keyed HMAC-SHA-256 uses a Vault secret behind a `SECURITY DEFINER` trigger; raw identity input is transient, only last four and versioned HMAC remain; missing/short keys fail closed; duplicate detection checks non-retired key versions and private legacy SHA references. Key-rotation comments and compatibility state are present. Secret provisioning and live data-history reconciliation remain prerequisites.
- Added [`supabase/migrations/20261101130000_service_request_write_hardening.sql`](https://github.com/remRADAR/NairaLeap/blob/8fd76cd7e262ab261ef76dd0745ef2120c458c1d/supabase/migrations/20261101130000_service_request_write_hardening.sql). It drops the customer-owned UPDATE policy, revokes broad UPDATE (including prior column grants), grants authenticated users UPDATE on `status` only, and applies a restrictive `public.is_admin()` policy so a future permissive policy cannot reopen participant updates. Participants retain select/insert capabilities.
- Repaired and expanded [`supabase/tests/rls_security_test.sql`](https://github.com/remRADAR/NairaLeap/blob/8fd76cd7e262ab261ef76dd0745ef2120c458c1d/supabase/tests/rls_security_test.sql): deterministic participant/second-participant/admin fixtures fail safely on conflicting identities; FAQ self-approval matches the trigger contract; permissive-policy OR interactions are tested for KYC, callback, FAQ, storage and service requests. The callback assertions cover explicit consent, ownership, initial status, participant status/assignment denial and staff assignment/queue access. The service-request test temporarily adds a permissive UPDATE policy and verifies its restrictive admin-only guard. The test plan is 58 and the assertion count matches. These are authored tests only; pgTAP was not executed.

## 3. Verification evidence

| Check | Result | Evidence and limitation |
| --- | --- | --- |
| Frozen dependency install | PASS | `CYPRESS_INSTALL_BINARY=0 npm exec --yes --package=bun -- bun install --frozen-lockfile`; Cypress binary download was intentionally disabled for installation. |
| TypeScript | PASS | `./node_modules/.bin/tsc --noEmit` after the repairs. |
| Focused lint | PASS | `./node_modules/.bin/eslint` over all edited TS/TSX source, audit and Cypress-spec files. |
| Production build | PASS | `npm run build` locally on the pushed source. This proves build completion only, not runtime integrations. |
| Vercel preview and HTTP smoke | PASS, HTTP-only | Latest source commit `8fd76cd` deployment `dpl_1rcGWDQvyR5HHuUrdDR2m9bGEJQs` is READY; its log says `Build Completed in /vercel/output [1m]` and `Deployment completed`. `/`, `/insurance`, `/about`, `/privacy-policy`, `/disclaimer` and `/services` each returned HTTP 200. No forms were submitted and no data was written. |
| Repository-wide lint | FAIL | `npm run lint`: 97 problems (88 errors, 9 warnings), all remaining findings reported in files outside this patch. The focused lint over every edited TS/TSX file passes. |
| Configured audit scripts | PASS | All seven passed: `audit-service-intake.ts`, `audit-insurance.ts`, `audit-editorial-images.ts`, `audit-leapbot-boundaries.ts`, `audit-leapbot-workflow-boundaries.ts`, `audit-advertising.ts`, and `audit-editorial-sanitizer.ts`, each run with `npm exec --yes --package=bun -- bun run scripts/<name>.ts`. |
| SQL grammar and pgTAP plan | PASS, static only | Python `pglast.parse_sql` accepted both security migrations and `rls_security_test.sql` after the restrictive guard was added; the test plan is 58 and 58 assertion calls were counted. This is not database execution. |
| `git diff --check` | PASS | No whitespace errors before commit. |
| Bun dependency audit | FINDINGS | `npm exec --yes --package=bun -- bun audit` reports 2 residual advisories: high Zod constrained-collection memory exhaustion and moderate `minimatch` glob-parts amplification. The available semver-bounded update did not remove these; resolving may require a major upgrade and compatibility work. |
| Cypress | NOT RUN | `npm run e2e -- --spec cypress/e2e/service-role-profiles.cy.ts` cannot execute because the Cypress binary is unavailable. `./node_modules/.bin/cypress install` was attempted but remained at 1% with a multi-hour estimate and was stopped; this is an infrastructure/download limitation, not a test failure/pass. |
| Supabase/pgTAP | NOT RUN | `supabase`, `docker`, and `psql` are unavailable locally, and no separate staging Supabase project/branch is connected. The connected Supabase project was not used to apply migrations or run tests. |

Vercel’s install log for the pre-repair deployment used `npm install` and reported 18 npm advisories (16 moderate, 2 high). Vercel is not using the Bun lockfile in that log; this should be reconciled with the project’s package-manager/install-command policy rather than silently treated as covered by the local Bun audit.

## 4. Vercel and environment verification

The pre-repair deployment, `dpl_DpNkosZf5seuicr5vM8fARfYz3Kd`, targeted branch `feat/nairaleap-relaunch-implementation` at SHA `a3c3624e665fa0d3a45f387f3eeb1e7aeaadc0be` and finished **ERROR**. Its logs show that `npm install` completed, then `npm run build` failed with `[PARSE_ERROR] Identifier 'layout' has already been declared` at `src/features/question-engine/QuestionEngine.tsx:23:75`. The duplicate declaration is repaired.

The preview for source commit `cf215a717382f20213c9ddfc1f37aefcd62f96de` is deployment `dpl_7BZhbYKXH22PZxfnzns8BBcH4Qjr`, URL `https://nairaleap-e09p42nee-remradars-projects.vercel.app`, state **READY**. The Vercel log records `npm install` (54 seconds), 2,108 modules transformed, `Build Completed in /vercel/output [1m]` and `Deployment completed`. The HTTP smoke command was `curl -sS -L --max-time 30` for each route; `/`, `/insurance`, `/about`, `/privacy-policy`, `/disclaimer` and `/services` all returned **HTTP 200** (no form submissions or data writes). This verifies those page responses for commit `cf215a7`, not database-backed journeys.

The latest source commit `8fd76cd7e262ab261ef76dd0745ef2120c458c1d` triggered deployment [`dpl_1rcGWDQvyR5HHuUrdDR2m9bGEJQs`](https://vercel.com/remradars-projects/nairaleap/1rcGWDQvyR5HHuUrdDR2m9bGEJQs), URL [`https://nairaleap-5e4mw2y81-remradars-projects.vercel.app`](https://nairaleap-5e4mw2y81-remradars-projects.vercel.app), state **READY**. Vercel’s build-event tail records `Build Completed in /vercel/output [1m]` and `Deployment completed`. The command `curl -sS -L --max-time 30` returned HTTP 200 for `/`, `/insurance`, `/about`, `/privacy-policy`, `/disclaimer` and `/services` (HTML bodies 13,142–61,175 bytes). These are page-response smoke checks only; authenticated submissions, mobile behavior and database-backed paths remain untested.

The Vercel project is linked to `remRADAR/NairaLeap` and the expected feature branch. A branch-scoped environment-variable name query returned no preview variables. Source documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as required for Supabase-backed paths; those names are not configured for this preview. `VITE_WORDPRESS_API_URL` and `VITE_KEYPAY_PUBLIC_KEY` are optional public settings. No secret values were requested or displayed. A public build may complete without these variables, but authentication, persistence and other connected flows cannot be runtime-verified without the appropriate preview configuration.

## 5. Database and security status

Migrations have **not** been applied to staging or production. Read-only schema/policy/migration metadata inspection found no separate staging branch in the connected project list; no records or decrypted secret values were read. No production database write was performed.

The HMAC migration references the Vault secret name `nairaleap-kyc-identity-hmac-v1`; the corresponding secret value has not been provisioned by this task and must never be committed or exposed. The trigger requires exactly one active key of at least 32 bytes and fails KYC writes shut if it is missing or invalid. For rotation, add a versioned Vault key, keep previous versions non-retired while records reference them, and do not retire a key until duplicates remain detectable under retained versions. Legacy SHA references are moved into a private table for duplicate checks; actual deployed records, backups, logs and historical plaintext copies have not been inventoried. That reconciliation needs explicit owner/security authorization and privacy-safe staging access.

The service-request migration is additive and idempotent. Its authored pgTAP cases verify that a participant cannot change their own status or payload, another participant cannot change status, an admin can change status, and even admin status access does not grant submitted-payload writes. Until these cases execute on isolated staging, the authorization repair is implemented in code but not runtime-verified.

## 6. Independent implementation audit

Classification describes source and available local test evidence, not production or end-to-end operation. No broad feature qualifies as fully end-to-end **IMPLEMENTED AND VERIFIED** in this pass because Cypress and isolated database tests could not run.

| Requirement | Classification | Repository evidence / remaining limitation |
| --- | --- | --- |
| Participant accounts and role model | IMPLEMENTED BUT NOT VERIFIED | Foundations and hardening migrations enforce trusted roles; 58 pgTAP assertions are authored but not run against a database. |
| Customer service-request journey | PARTIALLY IMPLEMENTED | Catalogue, validation, idempotent submission and customer list exist; local type/build/audits pass, but persistence and authenticated journey were not exercised in E2E/staging. |
| Service-request participant UPDATE boundary | PARTIALLY IMPLEMENTED | Additive migration now removes customer UPDATE and permits admin status-only writes; pgTAP cases added but not executed. This remains a P0 staging verification gate. |
| Provider/seller onboarding, profiles and verification | PARTIALLY IMPLEMENTED | Public role choices and schema/verification guards exist; typed profile intake, provider onboarding, review UI and verified-provider discovery are missing. |
| Staff assignment and service-request audit trail | NOT IMPLEMENTED | Admin status update exists; assignee field, assignment workflow and audit history were not found. |
| Catalogue and category mapping | IMPLEMENTED BUT NOT VERIFIED | Current ten-service mapping, role normalization and intake audits pass locally; no browser-level discovery test ran. |
| QuestionEngine layouts and conditional questions | IMPLEMENTED BUT NOT VERIFIED | Build/typecheck pass; sequential, horizontal and single-page code paths remain. Validation/layout parity and mobile behavior still need Cypress coverage. |
| Booking and scheduling | NOT IMPLEMENTED | No booking lifecycle, availability, appointment, cancellation or scheduling workflow was found. |
| Callback consent and staff queue | PARTIALLY IMPLEMENTED | Consent/ownership/state/RLS schema and tests exist; no callback workbench or runtime RLS proof. No WhatsApp sending integration is active. |
| Research / Professional Services trust claims | OWNER APPROVAL REQUIRED | The service exists, but “vetted/verified specialist” and response-time promises need current operational evidence or qualification and owner approval. |
| Insurance Compare Cover / Get a Quote / Make a Claim action contract | IMPLEMENTED BUT NOT VERIFIED | Canonical values now agree across UI choices, schema and claim conditional; insurance audit and local build pass. No E2E persistence/handler test ran. |
| Insurance quotations, claims and provider handoff | PARTIALLY IMPLEMENTED | Manual service-request intake only; no insurer filing, quote API, claim decision or guaranteed outcome. |
| Insurance comparison amounts and coverage claims | OWNER APPROVAL REQUIRED | Amounts remain unverified indicative placeholders; no live premium or provider confirmation was established. Remove or substantiate before public relaunch. |
| Insurance legal disclosures and advice boundary | OWNER APPROVAL REQUIRED | Disclaimer and related legal copy remain draft; owner/legal review must distinguish general information, licensed quotations and regulated advice. |
| Scrap rates, sources, location and dates | PARTIALLY IMPLEMENTED | Data model accommodates rates/source/location/effective and verification dates, but prices remain NULL/pending and no customer/admin price-book UI exists. Do not invent rates. |
| KYC identity reference | PARTIALLY IMPLEMENTED | Vault-backed versioned HMAC, last-four handling, fail-closed behavior and legacy hash compatibility are coded; Vault provisioning, data-history review and staging tests remain. |
| KYC document ownership/storage controls | IMPLEMENTED BUT NOT VERIFIED | Private-bucket and owner/MIME/size/admin policies are in migrations/tests; no storage API integration test or staging RLS run. |
| KYC onboarding and review workflow | NOT IMPLEMENTED | End-to-end document upload and reviewer UI are absent. |
| Advertising placement definitions | IMPLEMENTED BUT NOT VERIFIED | Eight IDs are defined; local advertising audit passes. |
| Advertising page wiring | PARTIALLY IMPLEMENTED | Homepage top/bottom, article end, category-list top and service footer are mounted. `article-inline`, `service-landing-top` and `category-sidebar` are not mounted (sidebar is currently disabled by design). |
| Shared AdSlot fallback/responsiveness | IMPLEMENTED BUT NOT VERIFIED | Shared component exists; no browser/responsive smoke test ran. |
| Advertising rates and administration | PARTIALLY IMPLEMENTED | Rate-card source entries remain pending/NULL and audit passes; admin persistence/management UI is absent. Owner approval required before rates are published or sold. |
| About, Privacy and Disclaimer route/content | OWNER APPROVAL REQUIRED | Draft pages are registered in the generated route tree and footer links exist; substantive legal/business placeholders need owner/legal approval and direct-route browser tests. Footer also contains Terms/Cookies labels without destinations. |
| Article HTML sanitization | PARTIALLY IMPLEMENTED | Allowlist and dangerous-block/comment handling were improved and the local sanitizer regression audit passes; parser-based/browsing XSS assurance is still absent. |
| FAQ moderation and survey validation | PARTIALLY IMPLEMENTED | Database schema/trigger/policies and pgTAP assertions exist; migrations/tests are unapplied/unexecuted, and identity/abuse behavior needs staging checks. |
| Public article FAQ/survey UI and moderator queue | NOT IMPLEMENTED | No public FAQ submission/display, survey participation or protected moderation queue was found. |
| Editorial draft/review workflow | PARTIALLY IMPLEMENTED | Studio has browser-local editing, but publication is immediate/local rather than a shared draft-review-approval workflow. |
| Newsletter backend | NOT IMPLEMENTED | Current submit handler changes local state only while saying “check your inbox to confirm”; no persistence or email delivery exists. Remove misleading confirmation until a consent-aware provider flow is implemented. |
| Hausa, Igbo, Yoruba, Nigerian Pidgin and Tiv | NOT IMPLEMENTED | All five locale choices are explicitly unavailable; no reviewed dictionaries/content are served. |
| Dictionary/translator data quality | PARTIALLY IMPLEMENTED | Schema supports reviewed/provenance fields, but no usable reviewed language dataset or serving workflow was found. |
| NairaLeapBot text-to-speech | IMPLEMENTED BUT NOT VERIFIED | Browser `speechSynthesis` is used; authored Cypress assertions were not run, and unsupported-device/cancel/fallback behavior remains unverified. This is not a server/provider TTS integration. |
| Social distribution queue | PARTIALLY IMPLEMENTED; live publishing BLOCKED BY EXTERNAL AUTHORIZATION | Queue states/policies exist, but no scheduler, publisher worker, provider adapter, idempotent retries or social credentials are active. |
| WhatsApp | PARTIALLY IMPLEMENTED; live automation BLOCKED BY EXTERNAL AUTHORIZATION | Manual consent-first callback schema and staff-queue rules only; no workbench or WhatsApp API integration. |
| Subscriptions and payments | PARTIALLY IMPLEMENTED; billing BLOCKED BY EXTERNAL AUTHORIZATION | Status schema exists; no subscription management UI, checkout, charge, webhook reconciliation or paid entitlement proof. Do not activate or claim payment operation. |
| Product walkthrough | PARTIALLY IMPLEMENTED | Services page includes static numbered steps, not a route-aware interactive tour with progress/completion tests. |
| Product walkthrough video | NOT IMPLEMENTED | No approved video asset, accessible player or playback test was found. |

## 7. Prioritized follow-up backlog

Effort estimates below are rough engineering estimates, may overlap, and exclude approval lead time, provider onboarding and data collection unless stated. Do not begin unrelated P2 integrations while P0 verification gates remain open.

### P0 — Release blockers

1. **Run critical Cypress E2E journeys on an available runner.** Current state: no Cypress binary is installed; `npm run e2e -- --spec cypress/e2e/service-role-profiles.cy.ts` could not execute, and the attempted `./node_modules/.bin/cypress install` stalled at 1% with a multi-hour estimate and was stopped. Evidence: latest preview is READY and six direct HTTP route checks passed, which is not interaction/E2E proof. Missing: execute mobile/desktop navigation, customer onboarding/request, insurance, QuestionEngine and provider journeys; use authorized preview credentials where needed. Dependencies: a working Cypress/browser runner and Supabase preview configuration/test accounts for persistence paths. Estimate: under 1 day once available. Recommended: CI/QA engineer; no owner approval for non-destructive preview tests.
2. **Execute service-request and security authorization tests on isolated staging.** Current state: broad participant UPDATE is removed in an additive migration; admin status-only and negative cases are authored. Evidence: migration grammar and 58-count pgTAP plan pass static validation only. Missing: authorized isolated Supabase staging, migration application, pgTAP output and targeted RLS probes. Dependencies/approval: explicit staging access, migration approval and owner/security approval of operator roles; never production. Estimate: 1–4 days depending on findings. Recommended: Supabase security engineer plus QA.
3. **Provision and verify the KYC Vault key before any real KYC writes.** Current state: code requires `nairaleap-kyc-identity-hmac-v1` and fails closed. Missing: create/provision a strong Vault secret (minimum 32 bytes) in authorized staging, test missing-key and duplicate cases, document rotation, and privacy-safely reconcile existing records/backups/logs. Dependencies/approval: owner/security/data-protection approval and staging access. Estimate: 2–4 days for setup/review, excluding legacy-user re-verification. Recommended: security/backend and data-protection owner.

### P1 — Required relaunch functionality and integrity

1. **Verify the customer request journey and insurer action flows.** Current state: local validation/audits/build pass; insurer action values were fixed. Missing: authenticated browser and handler tests for submit, retries, persistence, Compare/Quote/Claim actions and conditional claim fields. Dependencies: Supabase preview settings and test accounts. Estimate: 1–3 days. Recommended: frontend/backend QA.
2. **Complete provider profiles, KYC onboarding/review, assignment and booking.** Current state: role/schema foundations, but no complete provider profile/reviewer journey; no assignment field/audit workflow or booking lifecycle. Missing: approved provider/staff roles, onboarding/review UI, assignment model, booking/availability/cancellation rules and negative permission tests. Dependencies: owner/operations workflow and staging. Estimate: provider/KYC 1–2 weeks; assignment 1–2 weeks; booking more than 2 weeks. Recommended: product/operations, frontend/backend and security engineer.
3. **Remove or substantiate insurance prices and service trust/SLA claims; approve disclosures.** Current state: insurance figures are unverified placeholders; provider vetting and response promises lack verified operational evidence; legal disclaimer remains draft. Missing: dated provider-confirmed sources or removal/qualification, plus legal/owner review. Dependencies/approval: owner, licensed providers and legal reviewer. Estimate: 1–3 engineering/content days plus evidence/approval lead time. Recommended: product/content owner, legal and provider operations.
4. **Establish scrap-rate source/freshness and a controlled price-book.** Current state: rates deliberately NULL/pending; schema fields exist. Missing: approved source, location/unit, effective and last-verified dates, stale policy, customer/admin UI and tests. Dependencies/approval: owner/data steward and authorized database access. Estimate: 1–3 days for rules/tests; sourcing and curation separate. Recommended: data steward plus backend engineer.
5. **Wire intended ad inventory and add authorized rate administration.** Current state: five of eight placement IDs mounted; three are not (sidebar currently disabled); rate-card prices pending/NULL. Missing: owner decision about sidebar/inventory, route wiring, browser fallback/responsive checks and an admin persistence/audit flow. Dependencies/approval: owner-approved placement/rates and persistence roles. Estimate: 2–5 days wiring/tests; 1–2 weeks admin UI/persistence. Recommended: frontend and admin/backend engineer.
6. **Complete legal route/footer checks and approve draft content.** Current state: About/Privacy/Disclaimer pages exist and route tree is generated, but draft placeholders remain; Terms/Cookies footer labels have no destinations. Missing: legal/data-protection review, final content decisions, direct-route/footer browser checks and link policy. Dependencies/approval: owner and legal reviewer. Estimate: 1–3 engineering days plus review. Recommended: content/legal and frontend.
7. **Build FAQ/survey participation and moderation UI.** Current state: schema and SQL safeguards exist, but public and moderator UI is absent. Missing: article-level question/approved-answer flows, survey UI, moderation queue, abuse/identity controls and staging verification. Dependencies/approval: privacy/moderation policy and staging access. Estimate: 1–3 weeks. Recommended: product, frontend/backend and security QA.
8. **Make newsletter messaging truthful, then implement opt-in persistence/delivery.** Current state: front-end-only success falsely says inbox confirmation. Missing: remove/qualify that claim; implement consent, persistence, unsubscribe/retention and actual delivery/confirmation. Dependencies/approval: owner-approved consent copy and an authorized email provider. Estimate: 2–5 days plus provider onboarding. Recommended: product/content and backend engineer.
9. **Complete callback workbench; retain manual-only messaging boundary.** Current state: consent-first schema/policies, no staff workbench or runtime proof. Missing: UI, provenance/audit trail and staging role tests. Do not activate WhatsApp sending without separate provider authorization. Dependencies/approval: operations/compliance owner and staging; provider credentials/permissions for future automation. Estimate: 2–4 days plus 0.5–1.5 days staging verification. Recommended: operations, backend and security QA.
10. **Harden sanitizer assurance and QuestionEngine parity.** Current state: sanitizer audit passes and compile repairs pass; no browser XSS test or E2E layout parity. Missing: parser-based sanitizer or further adversarial review, browser rendering tests, and shared validation parity for conditional requiredness/email/numeric bounds across layouts. Dependencies: working Cypress/browser runner. Estimate: 2–5 days for sanitizer; 1–3 days for validation parity. Recommended: frontend/security engineer and QA.

### P2 — Operational maturity (defer until P0 gates are green)

1. **Social publishing integration:** schema/queue exists; scheduler, approval audit, provider adapters, idempotent retries and OAuth are missing. Live provider use is **BLOCKED BY EXTERNAL AUTHORIZATION**; keep publishing disabled. Dependencies/approval: owner and platform permissions. Estimate: 3–6 engineering days plus 1–3 days per provider, excluding approval. Recommended: backend/worker engineer.
2. **Subscription billing:** schema only; define plans/pricing, checkout, webhooks, idempotent reconciliation and entitlement tests before any charge. Activation is **BLOCKED BY EXTERNAL AUTHORIZATION** and commercial approval. Estimate: 2–4 days UI/lifecycle plus 3–6 days integration. Recommended: payments/backend engineer.
3. **Language data:** all five Nigerian locales unavailable; produce complete, human-reviewed dictionaries and consent/legal/financial terminology coverage before enabling. Dependencies/approval: owner terminology policy and qualified language reviewers; Pidgin variety/spelling decision. Estimate: 3–7 engineering days per locale plus 2–4 weeks initial content/review. Recommended: localization lead and native reviewers.
4. **Dictionary/translator serving and quality:** schema exists but no reviewed dataset or quality gates. Define provenance, review and coverage standards before serving. Dependencies: content and language owners. Estimate: 1–2 weeks including workflow/data.
5. **Interactive walkthrough/video and TTS maturity:** static service steps exist; no dedicated tour/video; browser TTS needs unsupported-device and cancellation tests. Dependencies/approval: owner-approved script/claims/branding and accessible video asset. Estimate: tour 1–3 days, video 2–5 days after asset, TTS verification 0.5–1.5 days. Recommended: frontend/content and QA.
6. **Taxonomy normalization and editorial review:** reconcile catalogue/category identifiers only after owner confirms canonical taxonomy; add draft/review/publish states only if editorial policy requires shared approval. Dependencies/approval: owner taxonomy/editorial decisions. Estimate: 3–5 days taxonomy; 3–7 days editorial workflow. Recommended: product and content-platform engineer.
7. **Product snapshot freshness and monitoring:** refresh source-checked insurance references with provider-confirmed facts and clear dates; add operational monitoring only after owners define supported service levels. Dependencies/approval: owner and provider source confirmation. Estimate: 1–2 days display/tests plus refresh work. Recommended: content/data owner.
8. **Analytics and operational monitoring:** no end-to-end production instrumentation or operator SLO was verified. Define privacy-safe success/error/latency signals, ownership, alert thresholds and incident response before adding analytics providers. Dependencies/approval: owner/privacy review and approved telemetry provider/configuration. Estimate: 2–5 days for event design and basic instrumentation, plus 1–3 days for alerting/runbooks. Recommended: observability/backend engineer and privacy owner.

## 8. Environment, authorization and production impact

- Preview has no branch-scoped environment variables returned by Vercel. Supabase-backed runtime paths require `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; provide only in the authorized preview environment. No secret values were exposed.
- Optional names from `.env.example`: `VITE_WORDPRESS_API_URL` and `VITE_KEYPAY_PUBLIC_KEY`. No live WordPress, KeyPay, email, WhatsApp or social credentials were configured or used.
- Supabase CLI, Docker, local PostgreSQL and Cypress executable are unavailable in this sandbox. No isolated staging project was available. These are infrastructure/access constraints, not passing test results.
- No production deploy, production DNS/configuration change, production migration, real KYC write, real subscription charge, social post, WhatsApp message, or customer contact occurred.

## 9. Release recommendation

**Do not merge or release yet.** The latest pushed source preview is READY and six direct-route HTTP smoke checks passed. Still complete authorized isolated-staging migration/pgTAP and RLS verification; provision and test the Vault key; run critical Cypress journeys; review the remaining full-lint baseline and two Bun audit advisories; and obtain owner/legal/provider approvals for draft legal content, insurance figures/claims, ad rates, provider operations and external integrations. Production remains untouched.


---

# NairaLeap Relaunch — Engineering Handoff Addendum (rev. 4)

**Status: NOT READY for merge or production release.** This addendum records the Phase 2 directive work appended on top of rev. 3. Everything in rev. 3 remains accurate unless amended below. **No build, typecheck, lint, audit, Cypress, migration or database test was executed in this session** — the current environment has no Node/Bun runtime, no Vercel access and no Supabase staging project. All execution verification remains NOT RUN and must be performed by Manus per §E of this addendum.

## A. Commits added on top of rev. 3 (branch `feat/nairaleap-relaunch-implementation`)

| Commit | Change |
| --- | --- |
| `01e84fa` | Newsletter truthfulness fix (C5) + `service-landing-top` ad placement mount (C1). |
| `384bb5e` | Staff assignment + audit trail (B4), booking foundation (B5), pgTAP `rls_assignment_booking_test.sql`. |
| `ce98165` | Founder Voice Engine architecture (D1) + migration `20261101160000_founder_voice_engine.sql` + `scripts/audit-voice-engine.ts`. |
| (this commit) | Registers `audit:voice-engine` in package.json; this rev. 4 addendum. |

## B. What was implemented this round

- **C5 Newsletter truthfulness:** `SubscribeBanner` no longer claims an inbox confirmation was completed. Copy now states that subscription delivery is not active and the address was not yet persisted, until a consent-aware provider flow exists. Migration `20261101140000_newsletter_consent_model.sql` adds consent-first `subscribers` (status `pending_opt_in` → `subscribed`/`unsubscribed`, verified email flow) and an immutable `newsletter_consent_events` trail. No email is sent; no provider is configured.
- **C1 Advertising:** `service-landing-top` is now mounted on service landing pages via the shared `AdSlot`. Mounted placements: 6 of 8 (homepage-top, homepage-bottom, article-end, category-list-top, service-footer, service-landing-top). `article-inline` requires a mid-body article-section decision (owner call), `category-sidebar` is intentionally disabled by design. All rate-card prices remain NULL pending owner approval.
- **B4 Assignment and audit:** `service_requests.assigned_staff` with trigger-enforced admin/staff-only assignment; immutable `service_request_history` audit trail written by a `SECURITY DEFINER` trigger on every status/assignment change; restrictive write policies. Participants cannot self-assign or grant staff roles (roles remain `auth.users.raw_app_meta_data`-based, admin-provisioned).
- **B5 Booking foundation:** `provider_availability` + `bookings` tables (requested → confirmed/rescheduled → completed/cancelled). Customers may create and cancel only; confirmation and rescheduling are provider/staff/admin actions. **No cancellation windows, fees or policy promises were invented** — those business rules require owner approval.
- **D1 Founder Voice Engine:** `src/features/voice-engine/` — `VoiceProvider` abstraction with a server-backed cloned-voice provider contract (credentials server-side only; provider swappable without Bot changes), the temporary synthetic demonstration voice (browser speechSynthesis, explicitly labelled NOT the founder voice), the `FounderVoiceEngine` (dynamic speech from Bot replies, streaming consumption, interruptible playback, replay, provider-failure fallback, always-available text fallback, metadata-only usage logging), and a Nigerian pronunciation lexicon (brand, cities, institutions, currency). `FOUNDER_VOICE_ENROLMENT_ENABLED = false`: `recordFounderEnrolment` throws; no founder recordings are uploaded or processed. Migration adds `voice_profiles` (activation admin-only via trigger), immutable `voice_consent_events`, `voice_usage_log` (metadata only), and a private `voice-samples` bucket with owner-scoped, audio-type, 50 MB, immutable policies plus a secure-deletion workflow. Classification: **ARCHITECTURALLY IMPLEMENTED**.

## C. Verification status (this round)

| Check | Result |
| --- | --- |
| Build / tsc / lint / audits / Cypress / pgTAP | **NOT RUN** — no runtime in this environment. Do not treat any rev. 3 result as still valid without re-running. |
| Source pushes | Confirmed by returned commit SHAs (above). |

## D. Known defects and owner gates carried forward (unchanged from rev. 3 unless noted)

- Insurance comparison amounts/coverage claims: unverified placeholders — owner approval required.
- Draft legal content (About/Privacy/Disclaimer): owner/legal approval required; Terms/Cookies footer labels still have no destinations.
- Advertising rates, scrap prices: deliberately NULL — owner approval required.
- Full-repo lint baseline (97 problems), 2 Bun advisories (zod high, minimatch moderate): re-verify, do not assume unchanged.
- Founder voice: recordings + explicit cloning/commercial-use authorisation + server provider configuration + testing required before `FOUNDER_VOICE_ENROLMENT_ENABLED` may flip. Never claim the founder voice is live until then.
- Voice-engine audit script uses top-level `await import` inside a try block — valid under Bun; verify if the runner changes.

## E. Instructions for Manus (Phase E verification, in order)

1. **Dependency reconciliation:** confirm `package.json` on the branch matches main's manifest (all deps/devDeps/versions preserved) plus only the audit scripts; `bun install --frozen-lockfile`; run `bun audit` and re-verify advisory status.
2. **Static suite:** `tsc --noEmit`; focused ESLint on all files touched since rev. 3; `npm run build`.
3. **Audits:** run all audit scripts including the new `bun run scripts/audit-voice-engine.ts`.
4. **Staging (never production):** apply pending migrations to an isolated Supabase staging project, then run `supabase db test` including `supabase/tests/rls_security_test.sql` (58 assertions) and the new `rls_assignment_booking_test.sql` (assignment, booking and self-promotion boundaries). Provision the `nairaleap-kyc-identity-hmac-v1` Vault key there and test fail-closed/duplicate behaviour.
5. **Cypress:** run the critical journeys (navigation, onboarding/service requests, insurance, QuestionEngine layouts, service-role matrix).
6. **Vercel:** confirm the latest branch SHA preview builds READY and re-run the six direct-route HTTP checks; reconcile the npm-vs-Bun install-command policy noted in rev. 3 §3.
7. **Founder voice activation checklist (only with owner authorisation):** founder provides recordings → explicit consent recorded in `voice_consent_events` → server-side provider configured → enrolment + testing → only then flip `FOUNDER_VOICE_ENROLMENT_ENABLED` and activate the profile administratively.
8. Update this handoff with actual results. **Do not merge to main, deploy, or touch production/DNS/env/secrets.**


---

# NairaLeap Relaunch — Engineering Handoff Addendum (rev. 5)

**Task: Editorial Featured Image Reconciliation and Implementation.** Base SHA verified before work: `1bdb91b` (rev. 4 tip). **No build, typecheck, lint, audit or test was executed in this session** — this environment has no Node/Bun runtime and works only through the GitHub API. Verification remains for the environment with a real checkout (Manus), per §E below.

## A. Source-of-truth finding (§2 of the directive)

- The original WordPress export JSONs (`nairaleap-wordpress-posts.json`, `-media.json`, `-categories.json`, `-tags.json`) are **not in the repository**; the importer reads them from a migration machine's `~/Downloads` path. GitHub code search (which indexes only the default branch) returned 0 hits and the working tree contains no export files.
- The WordPress REST API source could not be checked here (`VITE_WORDPRESS_API_URL` is an environment value not available in this session).
- **Consequence:** the 434 existing explicit image assignments **cannot be independently verified against the source featured_media IDs from here**. Per the directive's §7 fallback, they are preserved unchanged and are NOT claimed as source-verified. Reconciliation requires the original `nairaleap-wordpress-posts.json` + `nairaleap-wordpress-media.json` exports; see §E step 3 for the exact procedure.
- Repository audit figures carried forward as claims (not re-verified): 3,688 imported articles; 434 with explicit images; 3,254 without; all 434 paths previously resolving under `public/editorial/cms/`.

## B. Changes in this round — commit `fix(editorial): preserve source featured image assignments`

1. **`src/features/editorial/images.ts`** — removed `CATEGORY_IMAGE_OVERRIDES`, `TOP_LEVEL_CATEGORY_IMAGES`, `FALLBACK_IMAGE_PATHS`, the stable-hash function and all substitution logic. `withEditorialImageFallbacks` (name retained for callers) now only preserves each post's source image and returns an empty string when none exists. All observed callers (`index.tsx`, `articles.tsx`, `archive.tsx`, `articles.$slug.tsx`) already render `post.image ? <img/> : <neutral gradient>`, so image-less cards keep the existing neutral treatment. `studio.ts` studio-authored images are unaffected (their own `image` field passes through unchanged).
2. **`scripts/import-wordpress-migration.py`** — removed `read_old_images()` and the old-image fallback entirely. Each post's `featured_media` is preserved as `featuredMediaId`; the image resolves strictly through the media map keyed by that exact ID. Failed downloads keep the original source URL as a traceable fallback. Reports total posts, posts with source media IDs, resolved images, missing media records (per article), failed download media IDs and affected articles. Generated `EditorialPost` template now declares `featuredMediaId?: number`.
3. **`src/features/editorial/server.ts`** — `WordPressPost` gains `featured_media`; `_fields` now requests it; normalization preserves it as `featuredMediaId` (typed via a `NormalizedEditorialPost` intersection so it compiles whether or not the generated interface yet declares the field); the embedded `wp:featuredmedia.source_url` remains the actual image; no fallback is manufactured when absent.
4. **`scripts/audit-editorial-images.ts`** — rewritten: counts articles with/without source featured images, verifies local files exist, cross-checks `featuredMediaId` against the numeric media ID in `/editorial/cms/{ID}.{ext}` when both are available, reports remote source references separately, and fails (exit 1) on missing local files, mismatched media IDs or invented fallback assignments. A genuinely image-less article does **not** fail.

## C. Known limitation — generated dataset interface (needs a real checkout)

`src/data/wordpressEditorial.ts` is 22.7 MB (3,688 articles) and cannot be fetched/re-pushed through the GitHub API tools available here. The one-line interface addition could therefore **not** be applied to the generated file in this session. Required change (surgical, no data reformatting):

- In `src/data/wordpressEditorial.ts`, inside `export interface EditorialPost {`, immediately after the line `  sourceUrl: string;`, insert `  featuredMediaId?: number;`

Until that line is added, everything still compiles (consumers use intersection types and `image?: string` is unchanged), and existing dataset entries carry no `featuredMediaId` (they were generated before this field existed). Do **not** regenerate the dataset without the original exports.

## D. Verification status

| Check | Result |
| --- | --- |
| `npm run audit:editorial-images` | **NOT RUN** — no runtime in this environment |
| Type-check (`tsc --noEmit`) | **NOT RUN** — same reason |
| `npm run build` | **NOT RUN** — same reason |
| Source pushes | Confirmed by returned commit SHAs |

## E. Instructions for the next agent (Manus / environment with runtime + checkout)

1. **Add the one-line interface field** (§C) to `src/data/wordpressEditorial.ts` — do not reformat or rewrite the dataset.
2. **Static suite:** `tsc --noEmit`, focused ESLint on the five touched files, `npm run build`.
3. **Audit:** `npm run audit:editorial-images`. Expected honest outcomes: articles without source images are reported as valid image-less entries (no failure); the 434 existing local references must all resolve to files; zero invented fallbacks. If any of the 434 paths is missing locally or the audit reports a substitution, fix before proceeding.
4. **Reconciliation (only if the original export JSONs are available):** match each article's `featured_media` to the media export by exact ID, compare against the assigned image path media ID, and correct **only** proven relationships. Produce the reconciliation report (article ID, title, original featured-media ID, assigned path, result). Without the exports, preserve the 434 and document them as unverified — never shuffle images to make the archive look complete.
5. **Regression eyes:** homepage hero/cards, `/articles`, `/archive`, article pages — image-less articles should now show the neutral gradient instead of unrelated artwork.
6. Update this handoff with actual results. **Do not merge to main, deploy, or touch production/DNS/env/secrets/CMS records.**


---

# NairaLeap Relaunch — Engineering Handoff Addendum (rev. 6)

**Task: rev. 5 continuation — editorial image unblocking, reconciliation preparation, Phase E gate preservation.** Verified branch tip before work: `11188f5` (rev. 5 docs commit), matching rev. 5. Environment: GitHub API access only — **no repository checkout, no Node/Bun runtime, no browser.** Tasks 1–3 of the directive (interface repair in the 22.7 MB generated file, tsc/lint/build/audit execution, visual regression) are **environment-blocked here**, not skipped: the generated `src/data/wordpressEditorial.ts` cannot be fetched or re-pushed through the GitHub API tooling (22.7 MB payload), and no execution environment exists. Task 4 (reconciliation preparation) is complete.

## A. Source export search result

Searched: the repository (GitHub code search + branch tree) and the local authorized workspace. `nairaleap-wordpress-posts.json` and `nairaleap-wordpress-media.json` were **not found**. Their last known location remains the migration machine's `~/Downloads` (outside the repo, per the importer's constants). **Consequence: the 434 existing image assignments remain UNVERIFIED** — preserved unchanged, never claimed as source-checked.

## B. Changes in this round

| Commit | Change |
| --- | --- |
| `ddf51aab67afde670607c9543ec6c09c5886f7e1` | `scripts/reconcile-editorial-images.ts` + `reconcile:editorial-images` package.json script. |
| (this commit) | This rev. 6 addendum. |

### Reconciliation script methodology (`bun run reconcile:editorial-images <posts.json> <media.json>`)

1. Loads both original export JSONs (explicit paths, or `~/Downloads` defaults; exits with guidance when absent — the 434 assignments stay unverified until supplied).
2. Authoritative relationship ONLY: `post.featured_media -> media.id`. No filename similarity, order, category, hash or visual inference.
3. Expected asset = `public/editorial/cms/{mediaID}.{ext}` when the file exists locally, else the media record's `source_url` (matching the importer's failed-download traceability).
4. Compares against every dataset article's current image; classifies: `exact_match`, `mismatch`, `missing_media_record` (media ID absent from media export), `missing_dataset_image` (source-proven asset, dataset has none), `ambiguous_duplicate` (one CMS asset shared by several articles — each checked against its own featured_media), `no_source_post`, `unassigned_in_dataset` (correct image-less), `unverified` (image present but source post has no featured_media → REMOVE candidate, human review).
5. Writes `editorial-image-reconciliation-report.json` (machine-readable, full per-article detail) and `editorial-image-proposed-corrections.json` (only source-proven changes, human review required).
6. **Never modifies the dataset, never overwrites assignments, never substitutes unrelated images.** Corrections are applied manually only after review.

## C. Blocked items and why (do not re-attempt in a GitHub-API-only environment)

- **Interface repair (rev. 5 §C):** insert `  featuredMediaId?: number;` after `  sourceUrl: string;` in `export interface EditorialPost` inside `src/data/wordpressEditorial.ts`. Requires a real checkout (one-line `sed`-style edit; the 22.7 MB file cannot round-trip the API). The diff must show ONLY that line.
- **Verification:** `tsc --noEmit`; focused ESLint on the five rev. 5 files; `npm run build`; `npm run audit:editorial-images` (expected outcomes documented in rev. 5 §E — NOT claimed as achieved here).
- **Visual regression:** homepage, `/articles`, `/archive`, article pages — needs a running build + browser.
- **Reconciliation execution:** blocked on locating the two export JSONs.

## D. Phase E release gates (preserved, unchanged)

1. Both pgTAP suites (`rls_security_test.sql`, `rls_assignment_booking_test.sql`) on authorized isolated staging — never production.
2. KYC Vault key (`nairaleap-kyc-identity-hmac-v1`) provisioning + fail-closed/duplicate security verification.
3. Cypress critical journeys.
4. Vercel preview verification of the latest branch SHA.
5. Owner approvals: insurance figures, advertising rates, scrap prices, legal drafts.
6. Founder Voice Engine activation ONLY with explicit founder authorisation + recordings + server provider config + testing. **Never treat browser TTS as the founder voice.**

## E. Ordered next actions

1. In an environment with a checkout + runtime: apply the §C one-line interface repair (diff must show ONLY that line).
2. Run tsc, focused ESLint, build, and `npm run audit:editorial-images`; record actual results.
3. Visual regression across homepage/articles/archive/article pages (image-less = neutral gradient).
4. Locate the original export JSONs (migration machine's `~/Downloads` or any backup) and run `bun run reconcile:editorial-images <posts.json> <media.json>`; review `editorial-image-proposed-corrections.json` and apply only human-approved, source-proven corrections.
5. Proceed through Phase E gates (§D). Update this handoff with actual results. **Do not merge to main, deploy, or touch production/DNS/env/secrets.**


# NairaLeap Relaunch — Engineering Handoff Addendum (rev. 7)

**Task:** rev. 5 continuation — generated editorial-image interface repair, visual regression, source reconciliation preparation, and Phase E gates. This addendum supersedes rev. 6 status statements for this execution; prior ledger entries remain unchanged.

## A. Current status

**Not ready for merge or production release.** The generated dataset interface repair is complete, the image-less article-detail presentation now uses a neutral gradient, the focused build passes, the editorial-image audit passes its local-file/no-invention checks, and the latest Vercel preview for this commit is READY. However, none of the 434 image assignments has been reconciled against the original WordPress exports: those files were not found and the audit had zero featured-media ID/path cross-checks. Full typecheck, focused lint on the legacy five-file surface, Cypress, isolated-staging Supabase tests, Vault verification, and owner approvals remain open.

No production deployment, migration, database test, record rewrite, DNS/environment change, external publishing, WhatsApp, billing, founder-voice activation, pull request, or merge was performed.

## B. Repository, branch, and change record

- Repository: `remRADAR/NairaLeap`; branch: `feat/nairaleap-relaunch-implementation`.
- Starting HEAD: `9be3c7cf19a7b907d4275849ea09e83a77dd3891`; the working tree was clean before this task.
- Commit pushed: [`287caf39422f57d7b89c01ef118c97f652879545`](https://github.com/remRADAR/NairaLeap/commit/287caf39422f57d7b89c01ef118c97f652879545), `fix: preserve neutral editorial image fallbacks`.
- The remote feature branch tip matched that SHA after push; no force-push, reset, merge, or `main` change occurred.
- Changed files: (1) `src/data/wordpressEditorial.ts` adds exactly `featuredMediaId?: number;` to the `EditorialPost` interface after `sourceUrl`; (2) `src/routes/articles.$slug.tsx` renders a neutral 16:9 gradient when an article has no source image, instead of substituting unrelated art or leaving an inconsistent blank; (3) `cypress/e2e/editorial-homepage.cy.ts` checks source-backed images and image-less gradients on the homepage and article detail.
- Byte comparison against starting HEAD proves the 22,763,679-byte generated file changed only by the 28-byte interface line. The generated-record payload SHA-256 is unchanged: `27fd98cc31b771db47c2074e7a765f270e8c6e6d6276c9a201305155997efd6f`. No editorial records or image assignments were modified.

## C. Verification evidence

| Check | Result | Evidence and limitation |
| --- | --- | --- |
| Generated dataset isolation | PASS | Exact byte comparison: only the optional interface line was inserted; all generated record bytes/hash are unchanged. |
| Focused dataset typecheck | PASS | `./node_modules/.bin/tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler src/data/wordpressEditorial.ts`. This checks the generated dataset file only. |
| Full TypeScript | FAIL, unrelated to these edits | `tsc --noEmit` reports one pre-existing `TS1117` duplicate `naira` property at `src/features/voice-engine/pronunciation.ts:41`. No errors point to the three changed files. |
| Focused lint: new route and Cypress spec | PASS | `./node_modules/.bin/eslint 'src/routes/articles.$slug.tsx' cypress/e2e/editorial-homepage.cy.ts`; Prettier and `git diff --check` also pass for these changes. |
| Focused lint: five original editorial-image files | FAIL on existing audit formatting | ESLint reports 3 `prettier/prettier` errors in `scripts/audit-editorial-images.ts` lines 86, 88 and 104. It warns that the generated dataset is ignored and that `scripts/import-wordpress-migration.py` has no ESLint configuration; `src/features/editorial/images.ts` and `src/features/editorial/server.ts` report no errors. No formatter-only rewrite of unrelated audit code was made. |
| Production build | PASS | `npm run build` after the detail-page change; Vite/Nitro completed. |
| `npm run audit:editorial-images` | BLOCKED as invoked | Exit 127: `bun: not found` in this environment. |
| Editorial-image audit via temporary Bun | PASS, source IDs unverified | `npm exec --yes --package=bun -- bun run scripts/audit-editorial-images.ts`: 3,688 articles; 434 with source featured images; 3,254 valid image-less; 0 featured-media ID/path cross-checks; 0 remote fallbacks; 0 invented fallbacks; 0 missing local files; 0 mismatched IDs. Zero mismatches is not source verification because the generated records contain no `featuredMediaId` values yet. |
| Reconciliation script preflight | EXPECTED BLOCK | `bun run scripts/reconcile-editorial-images.ts` exits 1 with the expected `~/Downloads` JSON paths missing; it states the 434 assignments remain unverified and creates no report/correction files. |
| Both pgTAP files | STATIC PARSE PASS; NOT EXECUTED | Located `supabase/tests/rls_security_test.sql` and `supabase/tests/rls_assignment_booking_test.sql`. `pglast.parse_sql` parsed 148 and 14 statements respectively. This is grammar validation, not pgTAP/database execution. |
| Supabase staging | BLOCKED | Only the NairaLeap project was connected. Branch metadata showed only a nonpersistent, default `main` branch (`with_data: false`), not an explicitly authorized staging environment. No migration, SQL test, record query, or Vault secret check was run. |
| Cypress | NOT RUN | `npm run e2e -- --spec cypress/e2e/editorial-homepage.cy.ts --browser chromium` exits 1: Cypress 15.21 package exists, but its Linux ARM64 Cypress binary is absent. A prior binary download attempt stalled at 1% with a multi-hour estimate; system Chromium screenshots were used for read-only visual checks instead. |
| Founder Voice audit | FAIL, activation remains disabled | `npm exec --yes --package=bun -- bun run scripts/audit-voice-engine.ts` reports `pronunciation hints not applied`. The enrolment-disabled, no-frontend-credential, synthetic-fallback-label and engine-path assertions did not report failures. Do not activate cloned voice; lexicon and founder approval/recordings remain prerequisites. |
| Vercel preview | PASS | Deployment [`dpl_GJeZQro85xQvaHsfqZZxmcxLG1iM`](https://vercel.com/remradars-projects/nairaleap/GJeZQro85xQvaHsfqZZxmcxLG1iM) for exact source SHA `287caf39422f57d7b89c01ef118c97f652879545` is READY. Build event: `Build Completed in /vercel/output [1m]`; deployment event: `Deployment completed`. Preview: [nairaleap-3znezl8i5-remradars-projects.vercel.app](https://nairaleap-3znezl8i5-remradars-projects.vercel.app). No production deployment. |
| Browser smoke and visual regression | PASS for rendered routes; no form/data journeys | Read-only HTTP checks returned 200 for `/`, `/articles`, `/archive`, a source-image article, and an image-less article. Real Chromium viewport screenshots were captured from the READY preview at 390×844 and 1280×900. The source-image article displayed its assigned local media; image-less homepage, listing, archive and detail render gradients without unrelated artwork. Responsive visual review was limited to these representative viewport captures. |
| Local preview server | NOT USED for final visuals | `vite preview` could not start because Nitro attempted Wrangler and timed out waiting for a port; the local dev screenshot attempt was also terminated. Final visuals came from the READY Vercel preview, not HTTP-200-only inference. |

Visual files captured in the execution environment: `home-mobile.png`, `home-desktop.png`, `articles-mobile.png`, `articles-desktop.png`, `archive-mobile.png`, `archive-desktop.png`, `image-detail-mobile.png`, `image-detail-desktop.png`, `image-less-detail-mobile.png`, and `image-less-detail-desktop.png` under `/home/ubuntu/nairaleap-visual-evidence/`.

## D. Original-export search and reconciliation method

The two required files, `nairaleap-wordpress-posts.json` and `nairaleap-wordpress-media.json`, were not found in the repository, `/home/ubuntu` (including Downloads and upload), or the checked safe scratch/workspace directories. A broad scan of `/mnt` could not be completed because it is a protected FUSE mount. The last known location remains the migration machine's `~/Downloads`; obtain the originals or an authorized backup before reconciliation.

The prepared command is `bun run scripts/reconcile-editorial-images.ts <posts.json> <media.json>`; default paths are `~/Downloads/nairaleap-wordpress-posts.json` and `~/Downloads/nairaleap-wordpress-media.json`. Inputs are top-level JSON arrays: posts use numeric `id` and exact numeric `featured_media`; media uses numeric `id` and, when available, `source_url`. The only accepted relationship is `post.featured_media === media.id`. The script compares each current image to `public/editorial/cms/{mediaID}.{ext}` when present, otherwise to that media record's traceable `source_url`; it does not infer from title, ordering, filename similarity, category, or visual resemblance. It writes `editorial-image-reconciliation-report.json` and a review-only `editorial-image-proposed-corrections.json`; it never edits the dataset or applies corrections. The 434 assignments remain **UNVERIFIED** until exact source exports are reconciled and any proposed correction is reviewed.

## E. Phase E and approval inventory

- **Critical path — source reconciliation:** recover both export JSONs; run the command above; review every proposed correction and apply only exact, approved source relationships.
- **Critical path — staging/security:** provision an explicitly isolated and authorized Supabase staging project/branch; review/apply migrations only there; execute both pgTAP suites; verify KYC fail-closed and duplicate behavior with a staging Vault key. The connected `main` branch is not a substitute.
- **Critical path — browser E2E:** install a compatible Cypress runner or use CI, then run onboarding/request, insurance, QuestionEngine, editorial navigation, source-image and image-less fallback journeys. Current Cypress assertions were updated but not executed.
- **Quality blocker:** resolve the duplicate `naira` key and pronunciation-hint audit defect with appropriate review; do not enable cloned voice while doing so.
- **Owner approval remains pending:** insurance figures and coverage claims; advertising rates; scrap prices and sources; About/Privacy/Disclaimer legal drafts; and founder voice recordings/cloning activation. Founder voice requires explicit founder authorization and suitable recordings; browser TTS is not the founder voice.
- Live social publishing, WhatsApp automation and billing remain externally authorization-blocked; none were activated.

## F. Classification, impact and final state

- **Editorial image display:** **Implemented but unverified against source exports**. Local assets resolve and representative desktop/mobile rendering is verified; exact provenance for all 434 assignments is not.
- **Export reconciliation:** **Partially implemented**. Script and format/method are prepared; inputs absent, no reconciliation report or correction file produced.
- **Founder Voice Engine:** **Architecturally implemented but not verified**; audit has a pronunciation-hints failure; enrollment/clone activation remains disabled and approval-gated.
- **Supabase security suites:** **Implemented but unverified at runtime**; static SQL parsing only, no isolated staging execution.

Production impact: none observed. No production data, database, deployment, credentials, secrets, environment variables, DNS, or external integrations were changed. Working branch after push: `feat/nairaleap-relaunch-implementation`, commit `287caf39422f57d7b89c01ef118c97f652879545`; final clean working-tree state must be rechecked after this documentation update. No PR was created and no merge was performed.


## G. Post-addendum repository verification

After pushing this rev. 7 handoff, recheck `git status --short --branch` and the remote feature-branch tip. The intended final state is a clean working tree on `feat/nairaleap-relaunch-implementation`, with no production merge or pull request; record the observed result in the completion message.


## H. Final branch-tip preview and dependency warning

The final remote branch tip at documentation commit `d38f1881df8835c69a449d38d3f737b025396e01` had a READY Vercel preview: [`dpl_CaCjbGoaNimtpKLt1aiuYTYQeFEj`](https://vercel.com/remradars-projects/nairaleap/CaCjbGoaNimtpKLt1aiuYTYQeFEj), [preview URL](https://nairaleap-5hw8e10hh-remradars-projects.vercel.app). This was a documentation-only commit after the application change in `287caf3`; no production target was used. The preview served HTTP 200 for `/`, `/articles`, `/archive`, a source-image detail, and an image-less detail; the ten desktop/mobile captures in `/home/ubuntu/nairaleap-visual-evidence/` were refreshed from this READY preview.

The Vercel `npm install` log reports **18 dependency audit findings (16 moderate, 2 high)**. It also warns that `cypress@15.21.0`'s postinstall script is not covered by the project's install-script allowlist; the build continues and the Cypress binary is still unavailable in this sandbox. These findings were not remediated here. Before release, review the full advisory/package paths and the install-script policy; do not apply `npm audit fix --force` or approve install scripts without compatibility/security review.
