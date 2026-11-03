# Editorial media manifest & approval guide

This directory is the editorial media control plane for NairaLeap. It records
where every replacement and recovered image came from, under what license, and
whether editorial review has approved it for publication.

## Files

- `manifest.json` — the media manifest: full provenance records with statuses.
- `recovery-report.json` — structured output of the reconciliation audit.
- `RECOVERY_REPORT.md` — human-readable reconciliation summary.
- `discovery-log.json` — output of the last Openverse discovery run.
- `../..` runtime subset — `src/data/editorialMediaApproved.ts` is generated
  from the manifest and report by `scripts/editorial-media-lib.ts`. Never edit
  it by hand; it is eslint-ignored and audited for drift.

## Record schema

Each manifest record (`EditorialMediaRecord` in
`src/features/editorial/media-types.ts`) contains:

| Field | Meaning |
| --- | --- |
| articleId / articleSlug / articleTitle | The article the record belongs to. |
| originalImage | The migrated original featured image path, when one existed. |
| replacementImage | Local path of the recovered or approved image serving as featured art. |
| sourceProvider / sourceRecordId / sourceUrl / imageUrl | Discovery provider identity and URLs (Openverse). |
| imageCreator | Creator of the source image, when known. |
| license / licenseVersion / licenseUrl | License code, version, and canonical URL. |
| attributionRequired / attributionText | Whether attribution is required, and a ready-to-use line. |
| rightsReviewRequired / rightsNotes | Flags for identifiable people, trademarks, artwork, and third-party IP. |
| relevanceScore / relevanceNotes / queryUsed | How and why the candidate matched the article. |
| retrievedAt / reviewedAt / reviewedBy | Retrieval and review timestamps plus reviewer identity. |
| rejectionReason | Recorded when a candidate is rejected. |
| recoveryMethod | `path-repair` or `content-embedded` for recovered originals. |
| status | Lifecycle state, see below. |

## Statuses

- **original** — a recovered original relationship (repaired path or artwork
  embedded in the article's own migrated content). Not a replacement.
- **candidate** — discovered by tooling, awaiting editorial review. Never
  published.
- **approved** — cleared by editorial review; the only status that can become
  a publicly assigned featured image.
- **rejected** — declined by editorial review, with a recorded reason.

Only **approved** records are surfaced to the website (via the generated
runtime subset). The audit fails CI if an approved record lacks provenance, a
local file, rights sign-off, or if more than one record is approved per article.

## Workflows

### 1. Reconcile originals (no network required)

```bash
bun run media:reconcile
bun run audit:editorial-images
```

Verifies every original assignment against local media, repairs broken paths,
recovers content-embedded artwork, and writes the recovery report.

### 2. Discover replacement candidates (Openverse)

```bash
bun run media:discover --limit 10
bun run media:discover --slugs article-slug-one,article-slug-two
bun run media:discover --licenses cc0,pdm,by --min-score 2 --refresh
```

For each article without original artwork the pipeline analyses title
entities, tags, and category context; builds focused queries; retrieves
Openverse results limited to commercial-safe licenses (default: CC0, Public
Domain Mark, CC BY); scores genuine relevance against the article's own
vocabulary; and records up to three candidates per article with full
provenance. Relevance is not title-similarity: a candidate only records when
its own tags/title overlap the article's terms.

Note on licenses: CC BY-SA is excluded from the default allowlist because
cropping or re-encoding to WebP can count as an adaptation under share-alike
terms. Override with `--licenses` only after review.

### 3. Review and approve

```bash
bun run media:approve list
bun run media:approve show --slug article-slug
bun run media:approve approve --slug article-slug --record-id <openverse-id> --reviewer "CZA OF REM"
bun run media:approve reject --slug article-slug --record-id <openverse-id> --reason "wrong subject"
```

Approval downloads the image once and stores it content-addressed under
`public/editorial/media/` (identical files are stored once), then regenerates
the runtime subset. If the candidate was flagged for rights reasons,
`--confirm-rights` is required after verifying depiction rights.

### 4. Verify

```bash
bun run test:editorial-images
bun run audit:editorial-images
bunx tsc --noEmit && bun run build
```

## Rights guidance

- CC0 / Public Domain Mark: no attribution required; attribution recorded
  anyway as good practice.
- CC BY: attribution required — the manifest stores a ready-to-use line.
- Identifiable people: commercial use of photographs of identifiable people
  can require model releases even when the photo license is permissive. The
  discovery pipeline flags likely-people candidates; approval is blocked
  until the reviewer passes `--confirm-rights`.
- Trademarks, logos, artwork, currency, and third-party designs carry
  separate rights beyond the photo license; flagged candidates require the
  same explicit clearance.
- When in doubt, leave the article on the neutral placeholder.
