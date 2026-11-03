# Editorial media storage architecture

## Current state

All editorial artwork is stored in the repository and served from the
deployment filesystem:

- `public/editorial/cms/` — the 385 surviving WordPress CMS media files
  (named by their WordPress media id).
- `public/editorial/imported/` — article-body images recovered during
  migration.
- `public/editorial/featured-*.jpg`, `public/editorial/inline-*.jpg` —
  hand-placed editorial artwork.
- `public/editorial/media/` — approved replacement imagery, stored
  content-addressed by `scripts/approve-editorial-media.ts`.
- `public/editorial/placeholder-editorial.svg` — the neutral branded
  placeholder, the only image ever auto-assigned to an article.

## Design rules

1. **Discovery is separate from storage.** `scripts/discover-editorial-images.ts`
   only records candidates and provenance. Downloading happens once, at
   approval time, in `scripts/approve-editorial-media.ts`.
2. **No unnecessary duplicate downloads.** Approved files are stored by the
   SHA-256 of their bytes (first 16 hex chars). Approving the same source
   image for two articles writes the file once.
3. **Stable URLs.** Local paths like `/editorial/media/ab12cd34ef56.jpg` never
   change once committed. They are the durable keys for every image.
4. **One seam for durable storage.** `src/features/editorial/media-storage.ts`
   is the only module that maps media paths to served URLs. Setting
   `VITE_EDITORIAL_MEDIA_BASE_URL` (for example
   `https://media.nairaleap.com`) redirects all local media to that base
   without touching routes, components, or data.

## Cloudflare R2 migration path (future — nothing provisioned now)

1. Create an R2 bucket (or one per environment) and enable public access via
   the bucket's `r2.dev` subdomain or a custom domain behind Cloudflare.
2. Upload the repository media by its stable path keys, for example
   `editorial/cms/4042.jpg`, `editorial/media/ab12cd34ef56.jpg`.
3. Optionally re-encode JPEG/PNG to WebP during upload and keep the original
   bytes for provenance. Content-addressed approval files already make this
   safe: the hash key pins the source bytes.
4. Set `VITE_EDITORIAL_MEDIA_BASE_URL` in the deployment environment.
5. Keep the repository files for one deploy cycle as a rollback, then remove
   them from git to shrink the deployment.

No storage was provisioned, no DNS was changed, and no secrets were created
as part of the editorial media implementation. Those steps require explicit
owner approval.

## Provenance guarantee

The manifest (`docs/editorial-media/manifest.json`) travels with the media:
every approved image carries its provider, source URL, creator, license,
license URL, attribution line, rights flags, retrieval and review timestamps.
The audit fails if an approved record lacks any of this.
