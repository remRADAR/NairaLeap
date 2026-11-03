# Editorial media manifest & approval guide

This directory is the editorial media control plane for NairaLeap. It records
where every replacement and recovered image came from, under what license, and
whether editorial review has approved it for publication.

## Files

- `manifest.json` — the media manifest: full provenance records with statuses.
- `recovery-report.json` — structured output of the reconciliation audit.
- `RECOVERY_REPORT.md` — human-readable reconciliation summary.
- `discovery-log.json` — output of the last Openverse discovery run.
- `ci-status.json` — per-step outcome of the last CI verification run.
- `ci-*.txt` — captured output of each CI verification step, committed as
  diagnostics when a step fails.
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
| rightsClearedBy / rightsClearedAt | Who cleared depiction or trademark rights, and when. |
| visualInspectionConfirmedBy / visualInspectionConfirmedAt | Documented visual inspection sign-off. |
| editorialRelevanceConfirmedBy / editorialRelevanceConfirmedAt | Editorial relevance sign-off. |
| downloadVerified / downloadedSha256 | Whether the hardened download pipeline verified the bytes, and their full SHA-256. |
| statusHistory | Append-only audit trail of every status transition. |
| status | Lifecycle state, see below. |

## Statuses

- **original** — a recovered original relationship (repaired path or artwork
  embedded in the article's own migrated content). Not a replacement.
- **candidate** — discovered by tooling, awaiting editorial review. Never
  published.
- **approved** — cleared by editorial review with every sign-off recorded;
  the only status that can become a publicly assigned featured image.
- **rejected** — declined by editorial review, with a recorded reason.
  Rejection is **terminal**: a rejected candidate can never be approved. Run
  discovery again (with `--refresh`) to surface a fresh candidate. Approval
  and rejection history is preserved on every record via `statusHistory`.

Only **approved** records are surfaced to the website (via the generated
runtime subset). The audit fails CI if an approved record lacks provenance, a
local file, matching SHA-256, attribution for CC BY, rights sign-off, visual
inspection and relevance sign-offs, history entries, or if more than one
record is approved per article.

## Workflows

### 1. Reconcile originals (bounded network checks)

```bash
bun run media:reconcile
bun run audit:editorial-images
```

Verifies every original assignment against local media, repairs broken paths,
recovers content-embedded artwork, and writes the recovery report. External
image references found inside article content are counted as
`externalContentImageReferences` and probed with a bounded reachability check
(limited URL count, limited concurrency, request timeouts). Each reference is
classified as reachable, unavailable, forbidden, timed out, unknown, unsafe
(blocked by the SSRF destination guard), or unchecked; results are summarized
per host in `externalHosts`. Article content is never rewritten.

### 2. Discover replacement candidates (Openverse)

```bash
bun run media:discover --limit 10
bun run media:discover --slugs article-slug-one,article-slug-two
bun run media:discover --licenses cc0,pdm,by --min-score 2 --refresh
```

Eligibility rules:

- articles with a **valid** original image are skipped;
- articles with a **recovered** original are skipped;
- articles whose original image is **broken** (marked invalid by
  reconciliation) can receive replacement candidates;
- articles with **no** original image are eligible;
- articles that already have an **approved** replacement are never
  re-discovered;
- `--refresh` re-runs discovery but never discards approved or rejected
  records — only stale candidates for the refreshed articles are replaced.

The pipeline analyses title entities, tags, and category context; builds
bounded, deduplicated queries that include Nigerian geographic context and
industry-specific visual concepts (banking, crypto, markets, energy,
agriculture, and so on); retrieves Openverse results limited to
commercial-safe licenses (default: CC0, Public Domain Mark, CC BY); scores
genuine relevance against the article's own vocabulary; and records up to
three candidates per article with full provenance and a `discovered` history
entry. Relevance is not title-similarity: a candidate only records when its
own tags/title overlap the article's terms, and the relevance threshold is
never weakened to increase counts.

Note on licenses: CC BY-SA is excluded from the default allowlist because
cropping or re-encoding to WebP can count as an adaptation under share-alike
terms. Override with `--licenses` only after review.

### 3. Review and approve

```bash
bun run media:approve list
bun run media:approve show --slug article-slug
bun run media:approve approve --slug article-slug --record-id <openverse-id> --reviewer "CZA OF REM" --confirm-visual-inspection --confirm-editorial-relevance [--confirm-rights] [--attribution "..."]
bun run media:approve reject --slug article-slug --record-id <openverse-id> --reviewer "CZA OF REM" --reason "wrong subject"
```

Approval requirements (all enforced, none bypassable):

- an explicit reviewer identity (`--reviewer`), recorded on the record;
- CC BY and other attribution licenses must carry creator information and a
  ready-to-use attribution line (recorded, or passed via `--attribution`);
- rights-flagged candidates require `--confirm-rights`, and the clearance is
  recorded on the record (`rightsClearedBy` / `rightsClearedAt`);
- documented visual inspection (`--confirm-visual-inspection`) and editorial
  relevance confirmation (`--confirm-editorial-relevance`) are recorded with
  reviewer and timestamp;
- rejected candidates can never be approved (terminal status).

Before storing, the candidate download is validated end to end: an SSRF
destination guard requires public network destinations (literal and resolved
IPv4 addresses are checked against the IANA special-purpose registry, and IPv6
destinations must belong to 2000::/3 global unicast space, with the
special-purpose carve-outs inside it — 2001::/23 IETF protocol assignments
such as Teredo, ORCHID, and benchmarking; 2001:db8::/32 documentation;
3ffe::/16 6bone — rejected along with everything outside it; IPv4-mapped,
NAT64, and 6to4 forms are unwrapped and their embedded IPv4 address
validated), every redirect hop is revalidated before the connection is opened,
and the destination is rechecked after the response arrives; plus bounded
manual redirects restricted to http(s), a MIME
allowlist (JPEG, PNG, WebP, GIF), image file-signature detection, agreement
between the declared MIME and the detected signature, and a hard download
size cap. HTML, SVG, and unrecognized formats are rejected, and an unknown
extension never implies JPEG. Bytes are stored content-addressed by full
SHA-256 under `public/editorial/media/` (identical files are stored once),
then the runtime subset is regenerated.

Network safety limitation: the runtime fetch implementation cannot pin a
connection to the address that was validated, so a DNS rebinding attack that
flips a hostname to a prohibited address between validation and connection
cannot be fully prevented. Coverage: the approved-image download path
revalidates after the response arrives and aborts before reading the body;
the discovery fetch and the reconciliation probe validate before every
connection (per hop) but do not revalidate after the response, and the probe
never consumes a body (HEAD, or a cancelled 256-byte range request).
Complete connection-time SSRF protection is not claimed.

### 4. Verify

```bash
bun run test:editorial-images
bun run test:editorial-media
bun run audit:editorial-images
bunx tsc --noEmit && bun run build
```

CI (`.github/workflows/editorial-media-audit.yml`) runs the same verification
read-only on every push to the feature branch: type-check, both self-test
suites, reconciliation, an Openverse discovery pilot, the image audit,
formatting **checks** (never writes), lint, and the production build. Each
step's output is captured to the `ci-*.txt` diagnostics files, and per-step
outcomes land in `ci-status.json`. A separate, feature-branch-only publish
job commits the permitted generated artifacts (reports, diagnostics, the
manifest, the runtime subset, and approved media assets) with a `[skip ci]`
marker and bot-actor guards so the workflow can never recurse. Application
source files are never modified or committed by CI.

## Rights guidance

- CC0 / Public Domain Mark: no attribution required; attribution recorded
  anyway as good practice.
- CC BY: attribution required — the manifest stores a ready-to-use line and
  the creator must be known before approval.
- Identifiable people: commercial use of photographs of identifiable people
  can require model releases even when the photo license is permissive. The
  discovery pipeline flags likely-people candidates; approval is blocked
  until the reviewer passes `--confirm-rights`.
- Trademarks, logos, artwork, currency, and third-party designs carry
  separate rights beyond the photo license; flagged candidates require the
  same explicit clearance.
- When in doubt, leave the article on the neutral placeholder.
