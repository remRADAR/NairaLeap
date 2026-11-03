import { readdirSync } from "node:fs";
import { basename, extname, relative, resolve, sep } from "node:path";
import { EDITORIAL_POSTS, type EditorialPost } from "../src/data/wordpressEditorial";
import type { EditorialMediaRecord } from "../src/features/editorial/media-types";
import {
  MANIFEST_PATH,
  REPORT_MD_PATH,
  REPORT_PATH,
  readManifest,
  regenerateSubset,
  writeJson,
  writeText,
  type EditorialMediaManifest,
  type EditorialRecoveryReport,
  type ExternalHostReachability,
} from "./editorial-media-lib";
import { probeExternalUrl, type ProbeOutcome } from "./editorial-network-guard";

/**
 * Reconciliation of the editorial catalog against surviving local media.
 *
 * Goals:
 *   1. Verify every original featured image assignment (nothing is overwritten).
 *   2. Repair broken references where an unambiguous local file exists.
 *   3. Recover original artwork embedded in an article's own migrated content.
 *   4. Report duplicate assignments and external content image references.
 *
 * External content images are reported with a bounded, rate-conscious
 * reachability check: a capped set of unique URLs is probed with HEAD requests
 * (a byte-range GET when HEAD is unsupported), limited concurrency, and short
 * timeouts. Every probe goes through the SSRF destination guard (public
 * addresses only, per-hop redirect revalidation); prohibited destinations
 * are recorded as unsafe. Outcomes are recorded per host as reachable,
 * unavailable, forbidden, timeout, unknown, or unsafe; URLs beyond the cap
 * are counted as unchecked. Reachability is reporting only — article content
 * is never rewritten.
 *
 * The migration snapshot src/data/wordpressEditorial.ts is never modified.
 * Recovered relationships are recorded in the media manifest and the generated
 * runtime subset, and the structured report is written to
 * docs/editorial-media/recovery-report.json.
 */

const PUBLIC_DIR = resolve(process.cwd(), "public");
const EDITORIAL_DIR = resolve(PUBLIC_DIR, "editorial");
const USER_AGENT = "NairaLeap editorial media audit/1.0";

const REACHABILITY = {
  maxChecks: 60,
  concurrency: 6,
  timeoutMs: 5000,
  delayMs: 100,
} as const;

const walkFiles = (dir: string): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(full));
    else files.push(full);
  }
  return files;
};

const editorialFiles = walkFiles(EDITORIAL_DIR);
const localPaths = new Set(
  editorialFiles.map((file) => "/" + relative(PUBLIC_DIR, file).split(sep).join("/")),
);

const stems = new Map<string, string[]>();
for (const path of localPaths) {
  const stem = basename(path, extname(path));
  const existing = stems.get(stem) ?? [];
  existing.push(path);
  stems.set(stem, existing);
}

const CONTENT_IMAGE_PATTERN = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;

const contentImageSources = (content: string): string[] => {
  const sources: string[] = [];
  for (const match of content.matchAll(CONTENT_IMAGE_PATTERN)) {
    sources.push(match[1]);
  }
  return sources;
};

const localContentImage = (sources: string[]): string | null => {
  for (const source of sources) {
    if (/^https?:\/\//i.test(source) || source.startsWith("data:")) continue;
    const normalized = source.startsWith("/") ? source : "/" + source.replace(/^.\//, "");
    if (localPaths.has(normalized)) return normalized;
  }
  return null;
};

const postsBySlug = new Map(EDITORIAL_POSTS.map((post) => [post.slug, post]));

const hostOf = (source: string): string => {
  try {
    return new URL(source).host.toLowerCase();
  } catch {
    return "(invalid-url)";
  }
};

const checkExternalUrl = (url: string): Promise<ProbeOutcome> =>
  probeExternalUrl(url, {
    userAgent: USER_AGENT,
    timeoutMs: REACHABILITY.timeoutMs,
  });

const checkExternalUrls = async (urls: string[]): Promise<Map<string, ProbeOutcome>> => {
  const outcomes = new Map<string, ReachabilityOutcome>();
  const queue = [...urls];
  const workerCount = Math.min(REACHABILITY.concurrency, queue.length);
  const workers = Array.from({ length: workerCount }, async () => {
    for (;;) {
      const url = queue.shift();
      if (!url) return;
      await new Promise((done) => setTimeout(done, REACHABILITY.delayMs));
      outcomes.set(url, await checkExternalUrl(url));
    }
  });
  await Promise.all(workers);
  return outcomes;
};

const makeRecoveredRecord = (
  post: EditorialPost,
  path: string,
  method: string,
): EditorialMediaRecord => ({
  articleId: post.id,
  articleSlug: post.slug,
  articleTitle: post.title,
  originalImage: post.image ?? null,
  replacementImage: path,
  sourceProvider: null,
  sourceRecordId: null,
  sourceUrl: null,
  imageUrl: null,
  imageCreator: null,
  license: null,
  licenseVersion: null,
  licenseUrl: null,
  attributionRequired: false,
  attributionText: null,
  rightsReviewRequired: false,
  rightsNotes: null,
  relevanceScore: null,
  relevanceNotes: null,
  queryUsed: null,
  retrievedAt: new Date().toISOString(),
  reviewedAt: null,
  reviewedBy: null,
  rejectionReason: null,
  recoveryMethod: method,
  status: "original",
  rightsClearedBy: null,
  rightsClearedAt: null,
  visualInspectionConfirmedBy: null,
  visualInspectionConfirmedAt: null,
  editorialRelevanceConfirmedBy: null,
  editorialRelevanceConfirmedAt: null,
  downloadVerified: false,
  downloadedSha256: null,
  statusHistory: [
    {
      at: new Date().toISOString(),
      by: "reconciliation",
      action: "recovered",
      notes: method,
    },
  ],
});

const manifest = readManifest();

let articlesWithOriginalImage = 0;
let validOriginalImages = 0;
let repairedOriginalImages = 0;
let recoveredFromContent = 0;
const broken: EditorialRecoveryReport["broken"] = [];
const recovered: EditorialRecoveryReport["recovered"] = [];
const assignmentCounts = new Map<string, Array<{ slug: string; id: number }>>();
const externalReferences = new Map<string, number>();
const urlHosts = new Map<string, string>();

for (const post of EDITORIAL_POSTS) {
  const sources = contentImageSources(post.content);
  for (const source of sources) {
    const isExternal = /^(?:https?:)?\/\//i.test(source);
    if (!isExternal) continue;
    externalReferences.set(source, (externalReferences.get(source) ?? 0) + 1);
    const absolute = source.startsWith("//") ? "https:" + source : source;
    if (!urlHosts.has(source)) urlHosts.set(source, hostOf(absolute));
  }

  const image = post.image?.trim();
  if (image) {
    articlesWithOriginalImage += 1;
    const assigned = assignmentCounts.get(image) ?? [];
    assigned.push({ slug: post.slug, id: post.id });
    assignmentCounts.set(image, assigned);
    if (localPaths.has(image)) {
      validOriginalImages += 1;
      continue;
    }
    const candidates = stems.get(basename(image, extname(image))) ?? [];
    if (candidates.length === 1) {
      broken.push({ slug: post.slug, id: post.id, image, repairedTo: candidates[0] });
      recovered.push({
        slug: post.slug,
        id: post.id,
        path: candidates[0],
        method: "path-repair",
      });
      repairedOriginalImages += 1;
    } else {
      broken.push({ slug: post.slug, id: post.id, image, repairedTo: null });
    }
    continue;
  }

  const contentImage = localContentImage(sources);
  if (contentImage) {
    recovered.push({
      slug: post.slug,
      id: post.id,
      path: contentImage,
      method: "content-embedded",
    });
    recoveredFromContent += 1;
  }
}

const duplicates = [...assignmentCounts.entries()]
  .filter(([, articles]) => articles.length > 1)
  .map(([image, articles]) => ({ image, articles }));

const externalUrls = [...externalReferences.keys()];
const totalExternalReferences = [...externalReferences.values()].reduce(
  (total, count) => total + count,
  0,
);
const outcomes = await checkExternalUrls(externalUrls.slice(0, REACHABILITY.maxChecks));

const hostStats = new Map<string, ExternalHostReachability>();
const hostBucket = (host: string): ExternalHostReachability => {
  const existing = hostStats.get(host);
  if (existing) return existing;
  const created: ExternalHostReachability = {
    host,
    references: 0,
    checked: 0,
    ok: 0,
    unavailable: 0,
    forbidden: 0,
    timeout: 0,
    unknown: 0,
    unsafe: 0,
    unchecked: 0,
  };
  hostStats.set(host, created);
  return created;
};

const externalReachability = {
  checked: 0,
  ok: 0,
  unavailable: 0,
  forbidden: 0,
  timeout: 0,
  unknown: 0,
  unsafe: 0,
  unchecked: 0,
};

for (const url of externalUrls) {
  const refs = externalReferences.get(url) ?? 0;
  const bucket = hostBucket(urlHosts.get(url) ?? "(invalid-url)");
  bucket.references += refs;
  const outcome = outcomes.get(url);
  if (!outcome) {
    bucket.unchecked += refs;
    externalReachability.unchecked += refs;
    continue;
  }
  bucket.checked += refs;
  externalReachability.checked += refs;
  bucket[outcome] += refs;
  externalReachability[outcome] += refs;
}

const nextRecords: EditorialMediaRecord[] = [...manifest.records];
for (const entry of recovered) {
  const post = postsBySlug.get(entry.slug);
  if (!post) continue;
  const record = makeRecoveredRecord(post, entry.path, entry.method);
  const index = nextRecords.findIndex(
    (existing) => existing.articleSlug === entry.slug && existing.status === "original",
  );
  if (index >= 0) nextRecords[index] = record;
  else nextRecords.push(record);
}
const nextManifest: EditorialMediaManifest = { schemaVersion: 1, records: nextRecords };

const recoveredSlugs = new Set(recovered.map((entry) => entry.slug));
const approvedReplacementsInUse = nextManifest.records.filter(
  (record) =>
    record.status === "approved" &&
    record.replacementImage &&
    postsBySlug.has(record.articleSlug) &&
    !postsBySlug.get(record.articleSlug)?.image &&
    !recoveredSlugs.has(record.articleSlug),
).length;

const articlesWithoutOriginalImage = EDITORIAL_POSTS.length - articlesWithOriginalImage;
const placeholderArticles =
  articlesWithoutOriginalImage - recoveredFromContent - approvedReplacementsInUse;

const report: EditorialRecoveryReport = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  totals: {
    articles: EDITORIAL_POSTS.length,
    localMediaFiles: localPaths.size,
    articlesWithOriginalImage,
    validOriginalImages,
    brokenOriginalImages: broken.length,
    repairedOriginalImages,
    unrepairedOriginalImages: broken.length - repairedOriginalImages,
    articlesWithoutOriginalImage,
    recoveredFromContent,
    approvedReplacementsInUse,
    placeholderArticles,
    imagesSharedByMultipleArticles: duplicates.length,
    externalContentImageReferences: totalExternalReferences,
  },
  externalReachability,
  broken,
  recovered,
  duplicates,
  externalHosts: [...hostStats.values()].sort((a, b) => b.references - a.references),
};

writeJson(REPORT_PATH, report);
writeJson(MANIFEST_PATH, nextManifest);
regenerateSubset(report, nextManifest);

const brokenLines = broken.slice(0, 50).map((entry) => {
  const outcome = entry.repairedTo ? "repaired to " + entry.repairedTo : "NOT REPAIRED";
  return `- ${entry.slug} (${entry.id}): ${entry.image} -> ${outcome}`;
});
const brokenSection =
  broken.length === 0
    ? "None. Every original featured image resolves to a local file."
    : brokenLines.join("\n");

const recoveredLines = recovered.slice(0, 50).map((entry) => {
  return `- ${entry.slug} (${entry.method}): ${entry.path}`;
});
const recoveredSection =
  recovered.length === 0
    ? "No additional original relationships could be recovered."
    : recoveredLines.join("\n");

const duplicateLines = duplicates.slice(0, 30).map((entry) => {
  return `- ${entry.image} is used by ${entry.articles.length} articles`;
});
const duplicatesSection = duplicates.length === 0 ? "None." : duplicateLines.join("\n");

const reachabilityLines = [
  `- Reachable (2xx): ${externalReachability.ok}`,
  `- Unavailable (4xx/5xx): ${externalReachability.unavailable}`,
  `- Forbidden (401/403): ${externalReachability.forbidden}`,
  `- Timed out: ${externalReachability.timeout}`,
  `- Unknown errors: ${externalReachability.unknown}`,
  `- Unsafe (blocked by the SSRF destination guard): ${externalReachability.unsafe}`,
  `- Not checked this run (capped at ${REACHABILITY.maxChecks} unique URLs): ${externalReachability.unchecked}`,
];

const hostRows = report.externalHosts.slice(0, 15).map((host) => {
  return [
    "| " + host.host,
    host.references,
    host.ok,
    host.unavailable,
    host.forbidden,
    host.timeout,
    host.unknown,
    host.unsafe,
    host.unchecked + " |",
  ].join(" | ");
});

const md = [
  "# Editorial image recovery report",
  "",
  `Generated by scripts/reconcile-editorial-images.ts at ${report.generatedAt}.`,
  "",
  "| Measure | Count |",
  "| --- | ---: |",
  ...Object.entries(report.totals).map(([key, value]) => `| ${key} | ${value} |`),
  "",
  `## Broken original references (${broken.length})`,
  "",
  brokenSection,
  "",
  `## Recovered original relationships (${recovered.length})`,
  "",
  recoveredSection,
  "",
  `## Media shared by multiple articles (${duplicates.length})`,
  "",
  duplicatesSection,
  "",
  `## External content image references (${totalExternalReferences})`,
  "",
  "External images inside article bodies, checked with bounded HEAD probes",
  "(limited concurrency, short timeouts, capped URL set). This is reporting",
  "only; article content is never rewritten.",
  "",
  ...reachabilityLines,
  "",
  "### Top external hosts by reference count",
  "",
  "| Host | Refs | Reachable | Unavailable | Forbidden | Timeout | Unknown | Unsafe | Unchecked |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...hostRows,
  "",
  "## Next steps",
  "",
  "1. Articles counted under placeholderArticles have no original artwork. Use",
  "   bun run media:discover to find licensed replacement candidates.",
  "2. Review and approve candidates with bun run media:approve.",
  "3. Re-run bun run media:reconcile and bun run audit:editorial-images after approval.",
  "",
].join("\n");

writeText(REPORT_MD_PATH, md);

console.log(
  JSON.stringify(
    { report: report.totals, externalReachability, recovered: recovered.length },
    null,
    2,
  ),
);
