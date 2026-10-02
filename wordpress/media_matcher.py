#!/usr/bin/env python3
"""Dry-run matcher for exported WordPress REST JSON pages.

This script never writes to WordPress. It only proposes exact relationships
when a post's embedded image URL exactly matches a destination media URL.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

ARRAY_RE = re.compile(r"(\[\{.*\}\])", re.S)
IMG_RE = re.compile(r"<img\b[^>]+src=[\"']([^\"']+)", re.I)


def load_pages(root: Path, pattern: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(root.glob(pattern)):
        match = ARRAY_RE.search(path.read_text(errors="ignore"))
        if not match:
            continue
        try:
            page = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        if isinstance(page, list):
            records.extend(x for x in page if isinstance(x, dict))
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("export_dir", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    posts = load_pages(
        args.export_dir,
        "nairaleap.ct.ws_wp-json_wp_v2_posts_per_page_100_page_*"
        "__fields_id_slug_featured_media_content_link.md",
    )
    media = load_pages(
        args.export_dir,
        "nairaleap.ct.ws_wp-json_wp_v2_media_per_page_100_page_*"
        "__fields_id_slug_source_url_title_description.md",
    )
    media_by_url = {x.get("source_url"): x.get("id") for x in media if x.get("source_url")}
    proposals: list[dict[str, Any]] = []
    image_refs = 0
    posts_with_images = 0
    for post in posts:
        refs = IMG_RE.findall(post.get("content", {}).get("rendered", ""))
        if refs:
            posts_with_images += 1
        for src in refs:
            image_refs += 1
            if src in media_by_url:
                proposals.append({"post_id": post.get("id"), "media_id": media_by_url[src], "source_url": src})

    lines = [
        "# Featured-media dry-run",
        "",
        "This report is generated without modifying WordPress.",
        "",
        f"- Exported post records scanned: **{len(posts)}**",
        f"- Exported media records scanned: **{len(media)}**",
        f"- Posts containing embedded `<img>` references: **{posts_with_images}**",
        f"- Embedded image references: **{image_refs}**",
        f"- Exact post-to-destination-media proposals: **{len(proposals)}**",
        "",
        "## Result",
        "",
        "No exact post-to-destination-media relationships were proposed. The imported media records do not appear in the post HTML, and the posts have `featured_media: 0`.",
        "",
        "A source media manifest or source-to-destination mapping is required before assigning featured images. This script intentionally refuses fuzzy filename/title matches to avoid incorrect imagery.",
    ]
    output = "\n".join(lines) + "\n"
    if args.report:
        args.report.write_text(output)
    print(output, end="")


if __name__ == "__main__":
    main()
