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
} from "./editorial-media-lib";

/**
 * Reconciliation of the editorial catalog against surviving local media.
 *
 * Goals:
 *   1. Verify every original featured image assignment (nothing is overwritten).
 *   2. Repair broken references where an unambiguous local file exists.
 *   3. Recover original artwork embedded in an article's own migrated content.
 *   4. Report duplicates, dead external references, and remaining gaps.
 *
 * The migration snapshot src/data/wordpressEditorial.ts is never modified.
 * Recovered relationships are recorded in the media manifest and the generated
 * runtime subset, and the structured report is written to
 * docs/editorial-media/recovery-report.json.
 */

const PUBLIC_DIR = resolve(process.cwd(), "public");
const EDITORIAL_DIR = resolve(PUBLIC_DIR, "editorial");

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
});

const manifest = readManifest();

let articlesWithOriginalImage = 0;
let validOriginalImages = 0;
let repairedOriginalImages = 0;
let recoveredFromContent = 0;
const broken: EditorialRecoveryReport["broken"] = [];
const recovered: EditorialRecoveryReport["recovered"] = [];
const deadExternalCounts = new Map<string, number>();
const assignmentCounts = new Map<string, Array<{ slug: string; id: number }>>();

for (const post of EDITORIAL_POSTS) {
  const sources = contentImageSources(post.content);
  for (const source of sources) {
    if (!/^https?:\/\//i.test(source)) continue;
    try {
      const host = new URL(source).host.toLowerCase();
      deadExternalCounts.set(host, (deadExternalCounts.get(host) ?? 0) + 1);
    } catch {
      deadExternalCounts.set("(invalid-url)", (deadExternalCounts.get("(invalid-url)") ?? 0) + 1);
    }
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
    deadExternalContentImages: [...deadExternalCounts.values()].reduce(
      (total, count) => total + count,
      0,
    ),
  },
  broken,
  recovered,
  duplicates,
  deadHosts: [...deadExternalCounts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count),
};

writeJson(REPORT_PATH, report);
writeJson(MANIFEST_PATH, nextManifest);
regenerateSubset(report, nextManifest);

const md = [
  "# Editorial image recovery report",
  "",
  "Generated by scripts/reconcile-editorial-images.ts at " + report.generatedAt + ".",
  "",
  "| Measure | Count |",
  "| --- | ---: |",
  ...Object.entries(report.totals).map(([key, value]) => "| " + key + " | " + value + " |"),
  "",
  "## Broken original references (" + broken.length + ")",
  "",
  broken.length === 0
    ? "None. Every original featured image resolves to a local file."
    : broken
        .slice(0, 50)
        .map(
          (entry) =>
            "- " +
            entry.slug +
            " (" +
            entry.id +
            "): " +
            entry.image +
            (entry.repairedTo ? " -> repaired to " + entry.repairedTo : " -> NOT REPAIRED"),
        )
        .join("\n"),
  "",
  "## Recovered original relationships (" + recovered.length + ")",
  "",
  recovered.length === 0
    ? "No additional original relationships could be recovered."
    : recovered
        .slice(0, 50)
        .map((entry) => "- " + entry.slug + " (" + entry.method + "): " + entry.path)
        .join("\n"),
  "",
  "## Media shared by multiple articles (" + duplicates.length + ")",
  "",
  duplicates.length === 0
    ? "None."
    : duplicates
        .slice(0, 30)
        .map((entry) => "- " + entry.image + " is used by " + entry.articles.length + " articles")
        .join("\n"),
  "",
  "## Dead external content image hosts",
  "",
  report.deadHosts.length === 0
    ? "None."
    : report.deadHosts
        .slice(0, 20)
        .map((entry) => "- " + entry.host + ": " + entry.count + " references")
        .join("\n"),
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

console.log(JSON.stringify({ report: report.totals, recovered: recovered.length }, null, 2));
