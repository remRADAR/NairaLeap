#!/usr/bin/env python3
"""Normalize a WordPress WXR export into a staging-only migration package.

The importer never connects to WordPress, Blogsy, Supabase, or production. It
only reads a local WXR XML file and writes deterministic JSON/NDJSON artifacts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import xml.etree.ElementTree as ET

NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "wp": "http://wordpress.org/export/1.2/",
}


def text(node: ET.Element | None, default: str = "") -> str:
    return (node.text or "").strip() if node is not None else default


def child(item: ET.Element, name: str, default: str = "") -> str:
    return text(item.find(f"wp:{name}", NS), default)


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "untitled"


def stable_id(kind: str, source_id: str, fallback: str) -> str:
    raw = f"{kind}:{source_id or fallback}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:16]


def parse_date(value: str) -> str | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc).isoformat()
    except ValueError:
        return value


def normalize_item(item: ET.Element, include_drafts: bool) -> tuple[dict[str, Any] | None, list[dict[str, Any]]]:
    title = text(item.find("title"))
    post_type = child(item, "post_type", "post")
    status = child(item, "status", "publish")
    # Attachments commonly use WordPress's `inherit` status. They are retained
    # as staging metadata even when editorial drafts are excluded.
    if post_type != "attachment" and status != "publish" and not include_drafts:
        return None, []

    source_id = child(item, "post_id")
    guid = text(item.find("guid"))
    link = text(item.find("link"))
    slug = child(item, "post_name") or slugify(title)
    content = text(item.find("content:encoded", NS))
    excerpt = text(item.find("excerpt:encoded", NS))
    author = text(item.find("dc:creator", NS))
    terms: list[dict[str, str]] = []
    for term in item.findall("category"):
        name = text(term)
        if not name:
            continue
        terms.append({"taxonomy": term.attrib.get("domain", "category"), "name": name, "slug": slugify(name)})

    record = {
        "id": stable_id(post_type, source_id, f"{slug}:{title}"),
        "source": {"system": "wordpress-wxr", "post_id": source_id or None, "guid": guid or None, "link": link or None},
        "type": post_type,
        "status": status,
        "slug": slug,
        "title": title,
        "content_html": content,
        "excerpt_html": excerpt,
        "author": author or None,
        "published_at": parse_date(child(item, "post_date")),
        "modified_at": parse_date(child(item, "post_date_gmt")),
        "terms": terms,
        "migration": {"state": "pending-review", "production_write": False},
    }
    media = []
    if post_type == "attachment":
        media.append({
            "id": stable_id("media", source_id, guid or title),
            "source_id": source_id or None,
            "url": child(item, "attachment_url") or link or guid or None,
            "title": title,
            "status": "pending-review",
            "production_write": False,
        })
    return record, media


def normalize(wxr_path: Path, include_drafts: bool = False) -> dict[str, Any]:
    tree = ET.parse(wxr_path)
    channel = tree.getroot().find("channel")
    if channel is None:
        raise ValueError("WXR file has no RSS channel")
    items: list[dict[str, Any]] = []
    media: list[dict[str, Any]] = []
    skipped = 0
    for item in channel.findall("item"):
        record, item_media = normalize_item(item, include_drafts)
        if record is None:
            skipped += 1
            continue
        items.append(record)
        media.extend(item_media)
    items.sort(key=lambda x: (x["type"], x["slug"], x["id"]))
    media.sort(key=lambda x: x["id"])
    taxonomies = sorted({json.dumps(term, sort_keys=True) for item in items for term in item["terms"]})
    return {
        "schema_version": "1.0",
        "source": {"format": "wordpress-wxr", "file": wxr_path.name, "include_drafts": include_drafts},
        "summary": {"records": len(items), "media": len(media), "skipped": skipped},
        "records": items,
        "media": media,
        "taxonomies": [json.loads(value) for value in taxonomies],
    }


def write_package(package: dict[str, Any], output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="nairaleap-wp-", dir=output.parent) as temp:
        staging = Path(temp)
        manifest = {key: value for key, value in package.items() if key not in {"records", "media"}}
        manifest["generated_at"] = "deterministic-dry-run"
        (staging / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
        for name, records in (("records.jsonl", package["records"]), ("media.jsonl", package["media"])):
            (staging / name).write_text("".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records))
        (staging / "taxonomies.json").write_text(json.dumps(package["taxonomies"], indent=2, ensure_ascii=False) + "\n")
        output.mkdir(parents=True, exist_ok=True)
        for path in staging.iterdir():
            destination = output / path.name
            destination.write_bytes(path.read_bytes())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("wxr", type=Path, help="Local WordPress WXR export, including a Blogsy-exported WordPress site")
    parser.add_argument("--output", type=Path, default=Path("wordpress/output"), help="Staging output directory")
    parser.add_argument("--include-drafts", action="store_true", help="Include non-published records as pending-review")
    args = parser.parse_args()
    if not args.wxr.is_file():
        parser.error(f"WXR file does not exist: {args.wxr}")
    try:
        package = normalize(args.wxr, args.include_drafts)
        write_package(package, args.output)
    except (ET.ParseError, ValueError) as error:
        print(f"import failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps({"output": str(args.output), **package["summary"], "production_write": False}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
