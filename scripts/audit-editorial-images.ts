import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { EDITORIAL_POSTS } from "../src/data/wordpressEditorial";
import {
  APPROVED_REPLACEMENT_IMAGES,
  INVALID_ORIGINAL_IMAGES,
  RECOVERED_ORIGINAL_IMAGES,
} from "../src/data/editorialMediaApproved";
import {
  NEUTRAL_EDITORIAL_PLACEHOLDER,
  withEditorialImageFallbacks,
} from "../src/features/editorial/images";
import {
  SUBSET_PATH,
  generateSubsetContent,
  readManifest,
  readReport,
} from "./editorial-media-lib";

/**
 * Editorial image audit: verifies that every article resolves to artwork that
 * exists on disk, that only approved replacements are in use, and that the
 * generated runtime subset matches the manifest and recovery report.
 */

const PUBLIC_DIR = resolve(process.cwd(), "public");
const failures: string[] = [];

const resolvedPosts = withEditorialImageFallbacks(EDITORIAL_POSTS);

const missingOnDisk = resolvedPosts.filter((post) => {
  if (/^(?:https?:)?\/\//i.test(post.image)) return false;
  if (!post.image.startsWith("/")) return true;
  return !existsSync(resolve(PUBLIC_DIR, post.image.slice(1)));
});

const originalCount = EDITORIAL_POSTS.filter(
  (post) => post.image && INVALID_ORIGINAL_IMAGES[post.slug] !== true,
).length;
const recoveredCount = EDITORIAL_POSTS.filter(
  (post) => !post.image && RECOVERED_ORIGINAL_IMAGES[post.slug],
).length;
const approvedInUse = EDITORIAL_POSTS.filter(
  (post) =>
    !post.image &&
    !RECOVERED_ORIGINAL_IMAGES[post.slug] &&
    APPROVED_REPLACEMENT_IMAGES[post.slug],
).length;
const placeholderCount = resolvedPosts.length - originalCount - recoveredCount - approvedInUse;

if (!existsSync(resolve(PUBLIC_DIR, NEUTRAL_EDITORIAL_PLACEHOLDER.slice(1)))) {
  failures.push("Neutral placeholder artwork is missing: " + NEUTRAL_EDITORIAL_PLACEHOLDER);
}

const manifest = readManifest();
const validStatuses = ["original", "candidate", "approved", "rejected"];
const approvedPerSlug = new Map<string, number>();

for (const record of manifest.records) {
  if (!validStatuses.includes(record.status)) {
    failures.push("Manifest record has an invalid status: " + record.articleSlug);
    continue;
  }
  if (record.status === "approved") {
    approvedPerSlug.set(record.articleSlug, (approvedPerSlug.get(record.articleSlug) ?? 0) + 1);
    if (!record.replacementImage || !record.replacementImage.startsWith("/editorial/")) {
      failures.push(
        "Approved manifest record lacks a local replacement image: " + record.articleSlug,
      );
    } else if (!existsSync(resolve(PUBLIC_DIR, record.replacementImage.slice(1)))) {
      failures.push("Approved replacement image is missing on disk: " + record.replacementImage);
    }
    if (!record.sourceProvider || !record.sourceUrl || !record.license || !record.licenseUrl) {
      failures.push("Approved manifest record lacks provenance: " + record.articleSlug);
    }
    if (record.rightsReviewRequired && !record.reviewedBy) {
      failures.push(
        "Approved manifest record needs rights clearance sign-off: " + record.articleSlug,
      );
    }
  }
  if (record.status === "candidate" && (!record.sourceUrl || !record.license || !record.imageUrl)) {
    failures.push("Candidate manifest record lacks discovery provenance: " + record.articleSlug);
  }
}

for (const [slug, count] of approvedPerSlug.entries()) {
  if (count > 1) failures.push("Multiple approved images for article: " + slug);
}

const report = readReport();
if (!report) {
  failures.push("Recovery report is missing; run bun run media:reconcile first.");
} else {
  const committed = readFileSync(SUBSET_PATH, "utf8");
  if (generateSubsetContent(report, manifest) !== committed) {
    failures.push("src/data/editorialMediaApproved.ts is stale; run bun run media:reconcile.");
  }
}

console.log("Articles checked: " + resolvedPosts.length);
console.log("Original featured images preserved: " + originalCount);
console.log("Recovered original images: " + recoveredCount);
console.log("Approved replacements in use: " + approvedInUse);
console.log("Neutral placeholder articles: " + placeholderCount);
console.log("Manifest records: " + manifest.records.length);

if (missingOnDisk.length > 0) {
  console.error("Articles whose resolved image is missing on disk: " + missingOnDisk.length);
  for (const post of missingOnDisk.slice(0, 20)) {
    console.error("- " + post.slug + ": " + post.image);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error("FAIL: " + failure);
  process.exitCode = 1;
} else {
  console.log("Editorial media audit passed.");
}
