from __future__ import annotations

import concurrent.futures
import html
import json
import mimetypes
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

import requests

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path('/home/ubuntu/Downloads')
DATA_DIR = ROOT / 'src' / 'data'
MEDIA_DIR = ROOT / 'public' / 'editorial' / 'cms'
POSTS_FILE = DOWNLOADS / 'nairaleap-wordpress-posts.json'
CATEGORIES_FILE = DOWNLOADS / 'nairaleap-wordpress-categories.json'
TAGS_FILE = DOWNLOADS / 'nairaleap-wordpress-tags.json'
MEDIA_FILE = DOWNLOADS / 'nairaleap-wordpress-media.json'
OLD_DATA_FILE = DATA_DIR / 'wordpressEditorial.ts'
OUTPUT_FILE = DATA_DIR / 'wordpressEditorial.ts'


def read_old_images() -> dict[int, str]:
    result: dict[int, str] = {}
    current_id: int | None = None
    for line in OLD_DATA_FILE.read_text(encoding='utf-8').splitlines():
        match_id = re.match(r'\s*id:\s*(\d+),', line)
        if match_id:
            current_id = int(match_id.group(1))
        match_image = re.match(r'\s*image:\s*"([^"]+)"', line)
        if match_image and current_id is not None:
            result[current_id] = match_image.group(1)
    return result


def extension_for(url: str, content_type: str | None = None) -> str:
    suffix = Path(urlparse(url).path).suffix.lower()
    if suffix in {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'}:
        return suffix
    guessed = mimetypes.guess_extension((content_type or '').split(';')[0].strip())
    return guessed or '.jpg'


def download_media(item: dict) -> tuple[int, str, bool]:
    media_id = int(item['id'])
    url = item['source_url']
    target_base = MEDIA_DIR / str(media_id)
    session = requests.Session()
    session.headers.update({'User-Agent': 'NairaLeap editorial migration/1.0'})
    for attempt in range(3):
        try:
            response = session.get(url, timeout=45)
            response.raise_for_status()
            ext = extension_for(url, response.headers.get('content-type'))
            target = target_base.with_suffix(ext)
            target.write_bytes(response.content)
            return media_id, f'/editorial/cms/{target.name}', True
        except Exception:
            if attempt == 2:
                return media_id, url, False
    return media_id, url, False


def strip_excerpt(value: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', value)
    text = html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()


def format_date(value: str) -> str:
    try:
        return datetime.fromisoformat(value).strftime('%B %-d, %Y')
    except ValueError:
        return value[:10]


def build_category_path(category_id: int, categories: dict[int, dict]) -> list[str]:
    path: list[str] = []
    seen: set[int] = set()
    current = category_id
    while current and current not in seen:
        seen.add(current)
        category = categories.get(current)
        if not category:
            path.append(f'Category {current}')
            break
        path.append(category['name'])
        current = int(category.get('parent') or 0)
    return list(reversed(path))


def main() -> None:
    posts = json.loads(POSTS_FILE.read_text(encoding='utf-8'))
    categories_list = json.loads(CATEGORIES_FILE.read_text(encoding='utf-8'))
    tags_list = json.loads(TAGS_FILE.read_text(encoding='utf-8'))
    media_list = json.loads(MEDIA_FILE.read_text(encoding='utf-8'))
    old_images = read_old_images()

    categories = {int(item['id']): item for item in categories_list}
    tags = {int(item['id']): item['name'] for item in tags_list}
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)

    media_map: dict[int, str] = {}
    failures: list[int] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(download_media, item) for item in media_list]
        for future in concurrent.futures.as_completed(futures):
            media_id, image_path, ok = future.result()
            media_map[media_id] = image_path
            if not ok:
                failures.append(media_id)

    normalized: list[dict] = []
    for post in posts:
        category_ids = [int(x) for x in post.get('categories', [])]
        category_id = category_ids[0] if category_ids else 0
        category_path = build_category_path(category_id, categories) if category_id else ['Uncategorized']
        category = category_path[-1]
        image = media_map.get(int(post.get('featured_media') or 0)) or old_images.get(int(post['id']))
        normalized.append({
            'id': int(post['id']),
            'slug': post['slug'],
            'title': html.unescape(post.get('title', {}).get('rendered', '')).strip(),
            'date': format_date(post.get('date', '')),
            'category': category,
            'categoryId': category_id,
            'categoryPath': category_path,
            'tags': [tags[tag_id] for tag_id in post.get('tags', []) if int(tag_id) in tags],
            'excerpt': strip_excerpt(post.get('excerpt', {}).get('rendered', '')),
            'content': post.get('content', {}).get('rendered', ''),
            'sourceUrl': post.get('link', ''),
            **({'image': image} if image else {}),
        })

    output = '''/* eslint-disable */\n// Complete published-post migration from the public Nairaleap WordPress REST API.\n// Generated 2026-10-04. Article pages use this local bundle and local CMS media assets.\n\nexport interface EditorialPost {\n  id: number;\n  slug: string;\n  title: string;\n  date: string;\n  category: string;\n  categoryId: number;\n  categoryPath: string[];\n  tags: string[];\n  excerpt: string;\n  content: string;\n  sourceUrl: string;\n  image?: string;\n}\n\nexport const EDITORIAL_POSTS: EditorialPost[] = ''' + json.dumps(normalized, ensure_ascii=False, separators=(',', ':')) + ''';\n\nexport function getEditorialPost(slug: string) {\n  return EDITORIAL_POSTS.find((post) => post.slug === slug);\n}\n'''
    OUTPUT_FILE.write_text(output, encoding='utf-8')
    print(json.dumps({
        'posts': len(normalized),
        'withImages': sum(bool(x.get('image')) for x in normalized),
        'downloadedMedia': len(media_map) - len(failures),
        'mediaFailures': failures,
        'outputBytes': OUTPUT_FILE.stat().st_size,
    }))


if __name__ == '__main__':
    main()
