# NairaLeap — Editorial Media Recovery Handoff Ledger

Cross-agent continuity ledger for the editorial media recovery and intelligent
image sourcing work. Keep this file updated at every handoff point. The repo also
contains a legacy DEVELOPMENT_HANDOFF.md; that file documents earlier work and
should not be rewritten by this effort.

## Objective

Repair the editorial image system for remRADAR/NairaLeap: recover surviving
original image associations, replace the six-image slug-hash fallback with a
provenance-aware resolution hierarchy, add Openverse-based intelligent image
sourcing with an editorial approval gate, and keep full licensing provenance in
a structured media manifest.

## Working rules (inherited)

- All work happens on the feature branch `feat/editorial-media-recovery` (draft PR #12).
- Never push to main; merging requires explicit owner approval.
- The 22MB snapshot `src/data/wordpressEditorial.ts` is immutable; recovered and
  approved relationships live in `docs/editorial-media/manifest.json` (provenance)
  and the generated `src/data/editorialMediaApproved.ts` (runtime subset).
- Only approved replacement images may be publicly assigned.
- Never automatically assign unrelated imagery.
- No production deploys, DNS changes, or secret configuration from this work.

## Status: review corrections complete (2026-11-03)

Two rounds of verification:

1. First correction round (commits 3a6e67d, 178f2a2) — external metric rename +
   bounded reachability, approval/audit hardening, hardened downloads. CI green
   on 3a6e67d (bot prettier commit bd17bd9 recorded ci-status.json).
2. Second correction round (commits 2627fe0, b5aa7f5, 90c73f1) — discovery eligibility
   fix, Nigeria-aware query expansion, validation test suite, hardened workflow
   isolation, README rewrite, publish-job fix. The workflow run on 90c73f1
   ("Verify editorial media pipeline") is GREEN on every step: setup, install,
   typecheck, selftest, validation, reconcile, discover, audit, format, lint,
   build — see `docs/editorial-media/ci-status.json` (committed by the publish
   job). Step diagnostics, when a step fails, land in `docs/editorial-media/ci-*.txt`.

Vercel preview deployments for every branch push also succeeded.

## Technical review corrections applied (PR #12 review)

1. **External image reporting** — `reconcile-editorial-images.ts` now reports
   `externalContentImageReferences` and probes each unique host URL with a
   bounded, rate-conscious reachability check (HEAD, Range-GET fallback on
   405/501; concurrency 6; 5s timeout; max 60 unique URLs; 100ms spacing).
   Outcomes recorded separately: ok / unavailable / forbidden / timeout /
   unknown / unchecked, summarized per host in `externalHosts`. Article content
   is never rewritten.
2. **GitHub Actions hardening** — `.github/workflows/editorial-media-audit.yml`:
   main push trigger removed (feature branch + workflow_dispatch only);
   `permissions: {}` at the top with a read-only `verify` job (`contents: read`)
   and an isolated `publish-artifacts` job (`contents: write`, feature-branch
   push events only, `[skip ci]` and bot-actor guards); formatting is now
   `prettier --check` (never writes); only permitted artifacts are committed
   (docs/editorial-media reports+diagnostics, generated subset, approved media
   assets); concurrency group per ref; recursion impossible via [skip ci] +
   actor guards + GITHUB_TOKEN semantics; failures still reported by an explicit
   gate step plus committed ci-status.json and ci-*.txt diagnostics.
3. **Approval hardening** — `approve-editorial-media.ts` + audit + media-types:
   explicit reviewer identity required and recorded; CC BY requires creator
   and attribution (recorded or --attribution override); rights clearance
   sign-off recorded (rightsClearedBy/At); documented visual inspection
   (--confirm-visual-inspection) and editorial relevance
   (--confirm-editorial-relevance) recorded; rejected is terminal; full
   approval/rejection history preserved in `statusHistory`.
4. **Download hardening** — http(s)-only URLs, bounded manual redirects
   (http(s) targets only, max 5), MIME allowlist (JPEG/PNG/WebP/GIF), file
   signature detection with signature/MIME agreement, 10MB cap (declared and
   streamed), HTML/SVG/unknown formats rejected, extension never assumed;
   SHA-256 content-addressed storage preserved. Covered by
   `scripts/test-editorial-media-validation.ts` (37 checks).
5. **Discovery eligibility** — `discover-editorial-images.ts` now skips articles
   with valid OR recovered originals, allows broken (invalid) originals to
   receive candidates, keeps approved articles locked, and --refresh never
   discards approved records.
6. **Improved queries** — up to 6 deduplicated queries per article from named
   entities (+ " Nigeria" variants), article vocabulary, category/tag context,
   and industry-specific visual concepts (banking, crypto, markets, economy,
   oil, telecom, agric, aviation, real estate, trade, sport, entertainment,
   health, education, power, transport). Relevance (>= 2 term overlap) and
   licensing (cc0/pdm/by) requirements unchanged. Openverse stays the only
   provider; no paid services. Nothing approved or published automatically.

## Verified reconciliation results (docs/editorial-media/recovery-report.json)

- Articles: 3,688
- Local media files under public/editorial: 469
- Articles with original featured image: 434 — ALL 434 valid on disk (0 broken)
- Articles without original featured image: 3,254 (currently neutral placeholder)
- Recovered from content embeds: 0 (no article embeds local media)
- Repaired originals: 0 (nothing needed repair)
- Images shared by multiple articles: 36 (original WordPress assignments, preserved)
- External content image references inside article bodies: 140 across 13 hosts
  (cdn.punchng.com 79, nairametrics.com 25, cdn.vanguardngr.com 13, ...).
  Bounded reachability check (62 probed, concurrency 6, 5s timeout):
  32 reachable, 26 unavailable, 4 forbidden, 78 unchecked over the probe cap —
  see `externalReachability` / `externalHosts` in the recovery report. These
  are in-body images, not featured images; rewriting them touches article
  content and needs owner sign-off.

The historical migration figures (3,688 / 385 / 434 / 3,254) are confirmed,
except media: 469 local files exist, not 385.

## Openverse discovery pilots (docs/editorial-media/discovery-log.json)

- Pilot 1 (original queries, run on 178f2a2): 3 articles, 5 queries issued,
  0 candidates, 4 timeouts — the relevance gate (>= 2 term overlap) rejected
  everything returned.
- Pilot 2 (improved Nigeria-aware queries, run on 90c73f1): 3 articles,
  9 queries issued (entities, entities+" Nigeria", keywords, category context,
  industry concepts), 0 candidates, 7 of 9 queries timed out — Openverse
  rate-limits anonymous GitHub Actions runner IPs. The improved query
  construction is verified by the validation suite; Openverse connectivity
  needs to be re-tested locally or from an allowlisted environment.
  Relevance and licensing gates were NOT weakened to raise counts.

## Implementation summary

- Resolution hierarchy in `src/features/editorial/images.ts`: valid original ->
  recovered original -> approved replacement -> neutral placeholder
  (`public/editorial/placeholder-editorial.svg`). Consumers keep calling
  `withEditorialImageFallbacks`; no route-level changes were needed.
- R2-ready storage seam in `src/features/editorial/media-storage.ts`:
  `VITE_EDITORIAL_MEDIA_BASE_URL` joins local media paths onto a future bucket
  origin; absolute and data URLs pass through.
- Manifest schema in `src/features/editorial/media-types.ts` with statuses
  original/candidate/approved/rejected, full provenance fields, sign-off
  fields, download verification fields, and append-only `statusHistory`.
- Scripts: editorial-media-lib, reconcile-editorial-images,
  audit-editorial-images, discover-editorial-images, approve-editorial-media
  (approval CLI with reviewer/attribution/rights/visual/relevance gates),
  test-editorial-image-resolution (resolution self-test, 14 assertions),
  test-editorial-media-validation (37 checks: signatures, downloads,
  approvals, eligibility, queries).
- CI: `.github/workflows/editorial-media-audit.yml` — read-only verify job
  (typecheck, both test suites, reconcile, discovery pilot, audit, format
  check, lint, build) + isolated feature-branch publish job for permitted
  artifacts. Diagnostics in ci-*.txt, outcomes in ci-status.json.
- Docs: docs/editorial-media/README.md and STORAGE-ARCHITECTURE.md.

## Defects found and fixed during verification

1. Repaired broken originals were not marked invalid, so tier 1 could serve the
   broken path (moot in practice: 0 broken originals exist).
2. `joinMediaBaseUrl` treated every root-relative path as absolute, so the
   media base URL was never joined — the R2 seam would not work. Fixed; the
   self-test now asserts the join.
3. CI artifacts step ran `git add public/editorial/media` on a nonexistent
   directory and failed the job silently. Now isolated in the publish job with
   mkdir -p and permitted-path-only commits.
4. Discovery eligibility ignored reconciliation results: broken originals were
   treated as "has image" and never received replacement candidates (moot at
   present: 0 broken originals) while the old filter also skipped them from
   candidate sourcing entirely. Now explicit: valid/recovered skip, broken
   eligible.
5. The first hardened CI run failed: a validation-test helper leaked a
   `body: Uint8Array` field into Response headers, throwing inside one
   download test. Fixed by passing the body override explicitly.
6. The publish job's artifact push failed silently: `ref: ${{ github.sha }}`
   produced a detached HEAD, so `git push` refused. Fixed by checking out the
   feature branch and pushing to an explicit ref
   (`origin HEAD:refs/heads/feat/editorial-media-recovery`).

## Owner decisions pending

1. Batch strategy for discovery over the 3,254 placeholder articles
   (recommended: batches of 25-50 with editorial review, not bulk approval).
2. Approval of any candidates (manual gate:
   `bun run media:approve approve --slug X --record-id Y --reviewer "..." \
   --confirm-visual-inspection --confirm-editorial-relevance [--confirm-rights]`).
3. Merge of draft PR #12 (never merge without owner approval).
4. Optional follow-up: handle the 137 external in-body content images
   (touches article content, needs explicit authorization).
5. Cypress suite was NOT run in CI (no browser on the runner); the affected
   spec asserts img[src] presence which the placeholder tier satisfies, but
   run it locally before merge if in doubt.

## Verification commands

- `bun run media:reconcile` - rebuild recovery report + subset
- `bun run media:discover [--limit N]` - Openverse discovery for eligible articles
- `bun run media:approve list|show|approve|reject` - editorial approval CLI
- `bun run audit:editorial-images` - audit resolved images, manifest, subset drift
- `bun run test:editorial-images` - resolution hierarchy self-test
- `bun run test:editorial-media` - approval/download/eligibility validation suite
- `bunx tsc --noEmit`, `bun run build`
