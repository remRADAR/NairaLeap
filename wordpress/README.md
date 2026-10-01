# WordPress / Blogsy migration project

This directory is the second project in the repository. The existing NairaLeap portal remains at the repository root; this project owns the reversible migration path from the legacy WordPress site and Blogsy-authored content.

## Safety boundary

The importer is **local, read-only against the source, and staging-only**. It does not authenticate to WordPress, call Blogsy, write to production, upload media, or change portal/Supabase settings. Every normalized record is marked `migration.state = pending-review` and `production_write = false`.

## Input

Export the legacy site as a standard WordPress WXR/XML export. A Blogsy-managed WordPress site is supported because Blogsy content is stored by WordPress and represented in the normal WXR post/page/media/taxonomy structures. Keep the export file outside git if it contains private content.

## Run a dry import

```bash
python3 wordpress/importer.py /path/to/legacy-wordpress.xml \
  --output wordpress/output
```

Include drafts only when intentionally reviewing them:

```bash
python3 wordpress/importer.py /path/to/legacy-wordpress.xml \
  --include-drafts --output wordpress/output
```

The output package contains:

- `manifest.json` — schema, counts, and source metadata
- `records.jsonl` — normalized posts/pages with source IDs, HTML, dates, authors, and taxonomies
- `media.jsonl` — attachment URLs for later, separately reviewed media migration
- `taxonomies.json` — deduplicated category/tag records

## Verification

```bash
python3 -m unittest discover -s wordpress/tests -v
```

The next stage is intentionally not included: a reviewed mapping from these staging artifacts into the target CMS. That mapping must define redirects, media ownership, sanitization, duplicate handling, and an explicit human-approved publish step before any production write is added.
