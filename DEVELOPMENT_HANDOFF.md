# NairaLeap — Continuity Checkpoint

**Checkpoint date:** 2026-10-04
**Current branch:** `main`
**Current pushed commit:** `2ee121e feat: migrate full WordPress editorial archive`
**Remote state:** `origin/main` is synchronized and the working tree is clean.

## What is complete

The NairaLeap repository now contains the full published WordPress editorial migration from the public CMS API at `https://nairaleap.ct.ws/wp-json/`.

The migration includes **3,688 published posts**, with their IDs, unique slugs, titles, dates, category hierarchy, tags, excerpts, HTML content, and original WordPress source links. The previous 600-post snapshot has been replaced by the complete normalized dataset in `src/data/wordpressEditorial.ts`.

The available CMS media has also been resolved and stored locally under `public/editorial/cms/`. There are **385 unique media records and 385 local image files**. The source assigns featured media to **434 posts**, and all 434 post-to-image mappings were verified. The remaining **3,254 posts have `featured_media: 0` in the source CMS**, so no original featured image exists for those posts; the archive uses its visual fallback treatment for them.

A repeatable migration utility is available at `scripts/import-wordpress-migration.py`. It expects the browser-exported source files in `/home/ubuntu/Downloads/`:

- `nairaleap-wordpress-posts.json`
- `nairaleap-wordpress-categories.json`
- `nairaleap-wordpress-tags.json`
- `nairaleap-wordpress-media.json`

The source host applies a browser JavaScript challenge to some direct command-line API requests. If the migration is refreshed, use the sandbox browser to export the WordPress API JSON first, then run the migration script with low media concurrency.

## Routes and UI state

- `/` — Blogsy-inspired editorial homepage.
- `/articles` — paginated editorial archive, now displaying **3,688 stories**.
- `/articles/$slug` — article detail route with migrated HTML body, image when available, tags, date, category path, source link, and next-story navigation.
- `/services` — existing NairaLeap service portal.
- `/services/$service`, `/auth`, `/dashboard`, `/requests`, and onboarding routes — existing portal flows.

The homepage heading **“What is shaping Nigeria today”** was removed.

The portal logo links to `/services`, and the portal menu includes a Blog link back to `/`. The blog header has the standalone Nairaleap wordmark on the left. The right-side control order is:

1. dark/light mode toggle
2. menu button and dropdown
3. search button

## Important bug fixes included

The article archive parent route previously rendered over the dynamic article child route, causing article clicks to show the archive instead of the article body. `src/routes/articles.tsx` now yields to `<Outlet />` for `/articles/$slug`, and article detail rendering is confirmed working in the preview.

The homepage and article detail routes were rebuilt and checked after the full migration.

## Verification completed

- `npx tsc --noEmit` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Source integrity: 3,688 posts, 3,688 unique slugs, no empty source titles, no empty source content.
- Featured-image integrity: 434 source assignments, 0 missing media records, 0 missing local media files, 0 missing generated mappings.
- Archive preview shows `3688 stories`.
- Representative article detail page returns HTTP 200 and renders the full article body.
- Every one of the 3,688 article URLs returned HTTP 200 in the final route smoke test. Twelve automated title-content checks were false negatives caused by HTML entity normalization (`&#038;`, `&#8230;`, etc.); manual inspection confirmed those routes rendered correctly.

Preview used for the final local verification:

`https://4173-i46f0ywj4tr92urlbfpah-9057d539.us1.manus.computer/`

## Source-of-truth notes

The CMS homepage is a public coming-soon page, but the WordPress REST API exposes the published post collection. Admin access is **not required** for the published posts currently exposed through the API. Admin/application-password access would only be needed for drafts, private posts, deleted content, restricted media, or CMS-side configuration.

The CMS source endpoints used for the migration are:

- `https://nairaleap.ct.ws/wp-json/`
- `https://nairaleap.ct.ws/wp-json/wp/v2/posts`
- `https://nairaleap.ct.ws/wp-json/wp/v2/media`
- `https://nairaleap.ct.ws/wp-json/wp/v2/categories`
- `https://nairaleap.ct.ws/wp-json/wp/v2/tags`

## Recommended next work for the next agent

1. Re-check the deployed Vercel production deployment for commit `2ee121e` and verify that Vercel has picked up the large migration commit.
2. If production deployment size or performance is a concern, move the 22 MB editorial snapshot into a database/API-backed content layer instead of bundling every post into the application JavaScript.
3. Prepare the Admin Studio with two wings: Website and Portal.
4. Design the article FAQ/discussion plugin with moderation, abuse controls, and per-article threads.
5. Design social-media distribution as a draft/approval workflow first; add provider connectors only after the target platforms and credentials are confirmed.
6. Do not move service intake back into the editorial homepage; `/services` remains the portal boundary.
