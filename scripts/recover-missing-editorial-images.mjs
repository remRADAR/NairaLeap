import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = path.join(ROOT, "src/data/wordpressEditorial.ts");
const IMAGE_DIR = path.join(ROOT, "public/editorial/recovered");
const REPORT_PATH = path.join(ROOT, "qa-artifacts/editorial-image-recovery-report.json");
const USER_AGENT = "NairaLeap-editorial-image-recovery/1.0 (+https://nairaleap.com)";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const CONCURRENCY = Math.max(1, Number(process.env.IMAGE_RECOVERY_CONCURRENCY || 6));
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const searchFallback = args.has("--search-fallback");
const limitArg = process.argv.find((value) => value.startsWith("--limit="));
const startArg = process.argv.find((value) => value.startsWith("--start="));
const limit = limitArg ? Math.max(1, Number(limitArg.slice(8))) : Infinity;
const start = startArg ? Math.max(0, Number(startArg.slice(8))) : 0;

function parsePosts(source) {
  const prefix = "export const EDITORIAL_POSTS: EditorialPost[] = ";
  const begin = source.indexOf(prefix);
  const end = source.indexOf(";\n\nexport function getEditorialPost", begin);
  if (begin < 0 || end < 0) throw new Error("Could not locate EDITORIAL_POSTS in the generated data module.");
  return { posts: JSON.parse(source.slice(begin + prefix.length, end)), begin, end, prefix };
}

function writePosts(source, parsed, posts) {
  return `${source.slice(0, parsed.begin + parsed.prefix.length)}${JSON.stringify(posts)}${source.slice(parsed.end)}`;
}

function absoluteUrl(value, base) {
  if (!value || value.startsWith("data:") || value.startsWith("file:")) return "";
  try {
    const url = new URL(value, base);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)) result[match[1].toLowerCase()] = match[3];
  return result;
}

function extractImageCandidates(html, baseUrl) {
  const candidates = [];
  for (const tagMatch of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(tagMatch[0]);
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (["og:image", "og:image:url", "twitter:image", "twitter:image:src"].includes(key)) {
      const value = absoluteUrl(attrs.content, baseUrl);
      if (value) candidates.push(value);
    }
  }
  for (const tagMatch of html.matchAll(/<img\b[^>]*>/gi)) {
    const attrs = attributes(tagMatch[0]);
    const raw = attrs.src || attrs["data-src"] || attrs["data-lazy-src"] || attrs["data-original"] || attrs["data-orig-file"] || attrs["data-large-file"] || "";
    const value = absoluteUrl(raw.split(",")[0].trim().split(/\s+/)[0], baseUrl);
    if (value) candidates.push(value);
  }
  return [...new Set(candidates)].filter((value) => !/\.svg(?:[?#]|$)/i.test(value));
}

function extractReferenceUrls(post) {
  const html = String(post.content || "");
  const urls = [];
  for (const match of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const value = absoluteUrl(match[2], post.sourceUrl);
    if (value) urls.push(value);
  }
  return [...new Set(urls)].filter((value) => {
    try {
      const host = new URL(value).hostname.toLowerCase();
      return host !== "nairaleap.ct.ws" && !host.endsWith(".nairaleap.ct.ws");
    } catch {
      return false;
    }
  });
}

async function fetchText(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("html")) return null;
    return { url: response.url, html: await response.text() };
  } catch {
    return null;
  }
}

async function searchCandidates(post) {
  const query = encodeURIComponent(`"${post.title}" Nigeria`);
  try {
    const response = await fetch(`https://news.google.com/rss/search?q=${query}&hl=en-NG&gl=NG&ceid=NG:en`, {
      headers: { "user-agent": USER_AGENT, accept: "application/rss+xml,text/xml" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const html = await response.text();
    const urls = [];
    for (const match of html.matchAll(/<link>(https?:\/\/news\.google\.com\/rss\/articles\/[^<]+)<\/link>/gi)) {
      const value = absoluteUrl(match[1], "https://html.duckduckgo.com");
      if (value) urls.push(value);
    }
    return [...new Set(urls)].slice(0, 5);
  } catch {
    return [];
  }
}

async function findImageCandidates(post) {
  const results = [];
  const inlineCandidates = extractImageCandidates(String(post.content || ""), post.sourceUrl);
  const pages = [post.sourceUrl, ...extractReferenceUrls(post)];
  for (const pageUrl of pages.slice(0, 8)) {
    const page = await fetchText(pageUrl);
    if (!page) continue;
    const candidates = extractImageCandidates(page.html, page.url);
    for (const imageUrl of candidates) results.push({ imageUrl, discoveredFrom: page.url, method: pageUrl === post.sourceUrl ? "source-page" : "reference-page" });
  }
  for (const imageUrl of inlineCandidates) results.push({ imageUrl, discoveredFrom: post.sourceUrl, method: "article-inline" });
  if (searchFallback) {
    for (const resultUrl of await searchCandidates(post)) {
      const page = await fetchText(resultUrl);
      if (!page) continue;
      for (const imageUrl of extractImageCandidates(page.html, page.url)) results.push({ imageUrl, discoveredFrom: page.url, method: "web-search" });
    }
  }
  const seen = new Set();
  return results.filter((candidate) => !seen.has(candidate.imageUrl) && seen.add(candidate.imageUrl));
}

function extensionFor(contentType, url) {
  const type = contentType.split(";", 1)[0].toLowerCase();
  const extensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif" };
  if (extensions[type]) return extensions[type];
  try {
    const suffix = path.extname(new URL(url).pathname).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(suffix) ? suffix : ".jpg";
  } catch {
    return ".jpg";
  }
}

async function downloadImage(imageUrl, post) {
  try {
    const response = await fetch(imageUrl, { redirect: "follow", headers: { "user-agent": USER_AGENT, accept: "image/avif,image/webp,image/*" }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) return { error: `HTTP ${response.status}` };
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) return { error: `not-image:${contentType || "unknown"}` };
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_IMAGE_BYTES) return { error: "image-too-large" };
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) return { error: "image-too-large" };
    const extension = extensionFor(contentType, response.url);
    const relativePath = `/editorial/recovered/${post.id}${extension}`;
    if (!dryRun) await writeFile(path.join(ROOT, "public", relativePath.slice(1)), bytes);
    return { path: relativePath, sourceUrl: response.url, bytes: bytes.length };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

const source = await readFile(DATA_PATH, "utf8");
const parsed = parsePosts(source);
const missing = parsed.posts.filter((post) => !post.image).slice(start, start + limit);
const report = { startedAt: new Date().toISOString(), dryRun, searchFallback, totalArticles: parsed.posts.length, missingBefore: parsed.posts.filter((post) => !post.image).length, selected: missing.length, recovered: [], unresolved: [] };
if (!dryRun) await mkdir(IMAGE_DIR, { recursive: true });
let next = 0;
async function worker() {
  while (true) {
    const index = next++;
    if (index >= missing.length) return;
    const post = missing[index];
    const candidates = await findImageCandidates(post);
    let found = null;
    let downloaded = null;
    for (const candidate of candidates) {
      const attempt = await downloadImage(candidate.imageUrl, post);
      if (attempt.path) {
        found = candidate;
        downloaded = attempt;
        break;
      }
    }
    if (!found || !downloaded) {
      report.unresolved.push({ id: post.id, slug: post.slug, title: post.title, sourceUrl: post.sourceUrl });
      console.log(`UNRESOLVED ${post.id} ${post.slug}`);
      continue;
    }
    if (downloaded.path) {
      report.recovered.push({ id: post.id, slug: post.slug, title: post.title, image: downloaded.path, imageUrl: downloaded.sourceUrl, discoveredFrom: found.discoveredFrom, method: found.method, bytes: downloaded.bytes });
      const target = parsed.posts.find((item) => item.id === post.id);
      if (target && !dryRun) target.image = downloaded.path;
      console.log(`RECOVERED ${post.id} ${post.slug} -> ${downloaded.path} (${found.method})`);
    } else {
      report.unresolved.push({ id: post.id, slug: post.slug, title: post.title, sourceUrl: post.sourceUrl, candidate: found.imageUrl, error: downloaded.error });
      console.log(`FAILED ${post.id} ${post.slug} ${downloaded.error}`);
    }
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, missing.length) }, worker));
report.finishedAt = new Date().toISOString();
report.recoveredCount = report.recovered.length;
report.unresolvedCount = report.unresolved.length;
await mkdir(path.dirname(REPORT_PATH), { recursive: true });
await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
if (!dryRun && report.recovered.length) await writeFile(DATA_PATH, writePosts(source, parsed, parsed.posts));
console.log(JSON.stringify({ report: REPORT_PATH, ...report, recovered: undefined, unresolved: undefined }, null, 2));
if (report.unresolved.length && !dryRun) process.exitCode = 1;
