# WordPress migration audit

**Audit date:** 2026-10-02
**Source:** `https://nairaandkobo.ng`
**Destination:** `https://nairaleap.ct.ws`
**Branch:** `wordpress-migration`

## Verified destination inventory

- 3,688 published WordPress posts are present.
- 515 WordPress media attachments are present.
- Imported post GUIDs preserve `nairaandkobo.ng` source references.
- Source categories and tags are present on the destination.
- The Blogsy theme is installed and active.
- WordPress REST API is available.
- No WordPress Pages are currently present.

## Import conclusion

The article and media import phase is complete. Do not run the importer again without a deduplication plan; a second bulk import could create duplicate posts and media.

The current post sample has `featured_media: 0`. This is an association/audit issue, not evidence that the media library is empty. Featured-image relationships should be reviewed separately before launch.

## Remaining launch work

1. Create/review the missing static pages: About Us, Connect with Us, Gallery, and Terms & Conditions.
2. Treat “Our Services” as a portal CTA rather than copying the source services catalog; it should link to the NairaLeap portal.
3. Add and verify the primary navigation and footer portal link.
4. Review featured-image associations and homepage presentation.
5. Keep WooCommerce Coming soon enabled until the owner approves public launch.
6. Do not describe the traditional WordPress runtime as Vercel-hosted; use WordPress hosting for the CMS and Vercel only for a separate frontend if needed.

## Featured-image and attachment relationship audit

**Audit date:** 2026-10-02

Using the destination WordPress REST API:

- Posts filtered by `featured_media=0`: **3,688**.
- Total published posts: **3,688**.
- Media filtered by `parent=0`: **515**.
- Total media attachments: **515**.
- Representative posts from the first and 100th API pages both have `featured_media: 0`.
- The media library is populated, but the attachments are not assigned as post parents.

### Conclusion

The binary media import completed, but the importer did not preserve post-to-media relationships. The destination therefore has the article text and media files, but not the featured-image mapping required for complete visual parity.

No media or posts were changed during this audit. The next implementation step is a source-to-destination media matching pass using stable source URLs/filenames, followed by a dry-run report of proposed post/attachment assignments before any bulk update.

## Media relationship dry run

The reusable matcher in `wordpress/media_matcher.py` was run against the collected authenticated REST exports.

- Post records scanned in the collected export: **700**.
- Media records scanned: **515**.
- Posts containing embedded image tags: **17**.
- Embedded image references: **19**.
- Exact post-to-destination-media proposals: **0**.

The embedded image URLs point to third-party publisher CDNs, not the destination media library. No fuzzy filename/title assignments were generated, because those could attach incorrect images to articles. A source media manifest or an authenticated source export is required to safely reconstruct featured-image relationships.


## Complete source CMS media export

See `wordpress/SOURCE_MEDIA_EXPORT_REPORT.md`. The custom source CMS was exported through `AjaxController/loadMorePosts`: **3,271/3,271** distinct source images downloaded successfully, **0** failures, **174.3 MB**, SHA-256 checksummed. The destination still has only **515** older WordPress media attachments and is not yet synchronized with this source asset set.
