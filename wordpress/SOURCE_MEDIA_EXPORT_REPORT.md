# Source CMS media export report

**Audit date:** 2026-10-02  
**Source CMS:** `https://nairaandkobo.ng`  
**Destination WordPress:** `https://nairaleap.ct.ws`  
**Branch:** `wordpress-migration`

## Source CMS discovery

The source site is a custom CMS, not WordPress. It has no working `/wp-json/` API. Its internal `AjaxController/loadMorePosts` endpoint was used to export the full article/image manifest without crawling thousands of individual pages.

- Article batches exported: **308**
- Source post/image HTML export: **6.1 MB**
- Distinct original source image URLs: **3,271**
- Responsive-size duplicates: **0** (the CMS uses distinct original asset names)

## Download verification

All distinct source image URLs were downloaded locally and verified:

- Downloaded successfully: **3,271 / 3,271**
- Failed downloads: **0**
- Total downloaded bytes: **174,311,845** (**174.3 MB**)
- SHA-256 checksums: recorded in `wordpress/source-media-export/manifest.json`
- Local files: `wordpress/source-media-export/`

The export includes **3,265 JPG**, **4 PNG**, and **2 GIF** assets, including the two source branding/block images referenced by the CMS homepage.

## Destination status

The destination currently exposes **515 WordPress media attachments**, all from the earlier WordPress-style import. They do not correspond to the current custom-CMS `/uploads/images/...` asset set. Therefore:

> The source image export is complete locally, but the destination WordPress media library is **not yet fully synchronized** with the source CMS.

No destination media or posts were changed during this audit. The next migration operation is a bulk upload of the verified 3,271-file export to WordPress, followed by post-to-media assignment using the source manifest.
