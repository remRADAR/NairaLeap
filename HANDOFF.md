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

## Status: CI fully green (2026-11-03)

Workflow run on commit 821f5e5 — every step passed:

setup success, install success, typecheck success, selftest success,
discover success, reconcile success, audit success, format success,
lint success, build success. (See `docs/editorial-media/ci-status.json`,
committed by the workflow itself on each run.)

Vercel preview deployments for every branch push also succeeded.

## Verified reconciliation results (docs/editorial-media/recovery-report.json)

- Articles: 3,688
- Local media files under public/editorial: 469
- Articles with original featured image: 434 — ALL 434 valid on disk (0 broken)
- Articles without original featured image: 3,254 (currently neutral placeholder)
- Recovered from content embeds: 0 (no article embeds local media)
- Repaired originals: 0 (nothing needed repair)
- Images shared by multiple articles: 36 (original WordPress assignments, preserved)
- Dead external content images inside article bodies: 137 across 12 hosts
  (cdn.punchng.com 79, nairametrics.com 25, cdn.vanguardngr.com 13, ...).
  These are in-body images, not featured images; a future fix could rewrite
  or remove them, but that touches article content and needs owner sign-off.

The historical migration figures (3,688 / 385 / 434 / 3,254) are confirmed,
except media: 469 local files exist, not 385.

## Openverse discovery pilot (docs/editorial-media/discovery-log.json)

- 3 articles processed, 9 queries issued, 0 candidates recorded, 0 errors.
- The relevance gate (>= 2 term overlap between candidate and article entities)
  rejected everything the pilot returned. This is the intended conservative
  behaviour: Nigerian finance articles rarely have genuinely representative
  CC-licensed imagery on Openverse. Expect low candidate yield at full scale;
  batches should be small and editorially reviewed.

## Implementation summary

- Resolution hierarchy in `src/features/editorial/images.ts`: valid original ->
  recovered original -> approved replacement -> neutral placeholder
  (`public/editorial/placeholder-editorial.svg`). Consumers keep calling
  `withEditorialImageFallbacks`; no route-level changes were needed.
- R2-ready storage seam in `src/features/editorial/media-storage.ts`:
  `VITE_EDITORIAL_MEDIA_BASE_URL` joins local media paths onto a future bucket
  origin; absolute and data URLs pass through.
- Manifest schema in `src/features/editorial/media-types.ts` with statuses
  original/candidate/approved/rejected and full provenance fields.
- Scripts: editorial-media-lib, reconcile-editorial-images,
  audit-editorial-images, discover-editorial-images, approve-editorial-media
  (approval CLI with rights-clearance gate), test-editorial-image-resolution
  (self-test, 14 assertions).
- CI: `.github/workflows/editorial-media-audit.yml` — every step records its
  outcome to ci-status.json, artifacts are committed back to this branch
  best-effort, and an explicit gate fails the job on any step failure.
- Docs: docs/editorial-media/README.md and STORAGE-ARCHITECTURE.md.

## Defects found and fixed during verification

1. Repaired broken originals were not marked invalid, so tier 1 could serve the
   broken path (moot in practice: 0 broken originals exist).
2. `joinMediaBaseUrl` treated every root-relative path as absolute, so the
   media base URL was never joined — the R2 seam would not work. Fixed; the
   self-test now asserts the join.
3. CI artifacts step ran `git add public/editorial/media` on a nonexistent
   directory and failed the job silently. Now best-effort (set +e) with
   per-step outcomes recorded.

## Owner decisions pending

1. Batch strategy for discovery over the 3,254 placeholder articles
   (recommended: batches of 25-50 with editorial review, not bulk approval).
2. Approval of any candidates (manual gate:
   `bun run media:approve approve --slug X --record-id Y [--confirm-rights]`).
3. Merge of draft PR #12 (never merge without owner approval).
4. Optional follow-up: handle the 137 dead in-body content images (touches
   article content, needs explicit authorization).
5. Cypress suite was NOT run in CI (no browser on the runner); the affected
   spec asserts img[src] presence which the placeholder tier satisfies, but
   run it locally before merge if in doubt.

## Verification commands

- `bun run media:reconcile` - rebuild recovery report + subset
- `bun run media:discover [--limit N]` - Openverse discovery for unimaged articles
- `bun run media:approve list|show|approve|reject` - editorial approval CLI
- `bun run audit:editorial-images` - audit resolved images, manifest, subset drift
- `bun run test:editorial-images` - resolution hierarchy self-test
- `bunx tsc --noEmit`, `bun run build`
