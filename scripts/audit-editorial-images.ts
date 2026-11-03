import { createHash } from "node:crypto";
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
 * exists on disk, that only approved replacements are in use, that every
 * approval carries explicit reviewer identity, attribution, rights clearance,
 * visual inspection, and editorial relevance sign-off, and that the generated
 * runtime subset matches the manifest and recovery report. Rejected candidates
 * must never resurface as publicly assigned imagery.
 */

const PUBLIC_DIR = resolve(process.cwd(), "public");
const ALLOWED_LICENSES = new Set(["cc0", "pdm", "by"]);
const failures: string[] = [];

const resolvedPosts = withEditorialImageFallbacks(EDITORIAL_POSTS);

const missingOnDisk = resolvedPosts.filter((post) => {
  if (/^(?:https?:)?\/\//i.test(post.image)) return false;
  if (!post.image.startsWith("/")) return true;
  return !existsSync(resolve(PUBLIC_DIR, post.image.slice(1)));
});

const usesOriginal = (post: (typeof EDITORIAL_POSTS)[number]) =>
  Boolean(post.image) && INVALID_ORIGINAL_IMAGES[post.slug] !== true;
const usesRecovered = (post: (typeof EDITORIAL_POSTS)[number]) =>
  !usesOriginal(post) && Boolean(RECOVERED_ORIGINAL_IMAGES[post.slug]);
const usesApproved = (post: (typeof EDITORIAL_POSTS)[number]) =>
  !usesOriginal(post) &&
  !RECOVERED_ORIGINAL_IMAGES[post.slug] &&
  Boolean(APPROVED_REPLACEMENT_IMAGES[post.slug]);

const originalCount = EDITORIAL_POSTS.filter(usesOriginal).length;
const recoveredCount = EDITORIAL_POSTS.filter(usesRecovered).length;
const approvedInUse = EDITORIAL_POSTS.filter(usesApproved).length;
const placeholderCount = resolvedPosts.length - originalCount - recoveredCount - approvedInUse;

if (!existsSync(resolve(PUBLIC_DIR, NEUTRAL_EDITORIAL_PLACEHOLDER.slice(1)))) {
  failures.push(`Neutral placeholder artwork is missing: ${NEUTRAL_EDITORIAL_PLACEHOLDER}`);
}

const sha256OfFile = (localPath: string): string => {
  const absolute = resolve(PUBLIC_DIR, localPath.slice(1));
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
};

const manifest = readManifest();
const validStatuses = ["original", "candidate", "approved", "rejected"];
const approvedPerSlug = new Map<string, number>();
const rejectedImageUrls = new Set<string>();
const rejectedContentHashes = new Set<string>();

for (const record of manifest.records) {
  if (record.status === "rejected") {
    if (record.imageUrl) rejectedImageUrls.add(record.imageUrl);
    if (record.downloadedSha256) rejectedContentHashes.add(record.downloadedSha256);
  }
}

for (const record of manifest.records) {
  if (!validStatuses.includes(record.status)) {
    failures.push(`Manifest record has an invalid status: ${record.articleSlug}`);
    continue;
  }
  if (record.status === "approved") {
    approvedPerSlug.set(record.articleSlug, (approvedPerSlug.get(record.articleSlug) ?? 0) + 1);
    if (!record.replacementImage || !record.replacementImage.startsWith("/editorial/media/")) {
      failures.push(`Approved record lacks a local replacement image: ${record.articleSlug}`);
    } else if (!existsSync(resolve(PUBLIC_DIR, record.replacementImage.slice(1)))) {
      failures.push(`Approved replacement image is missing on disk: ${record.articleSlug}`);
    } else if (!record.downloadedSha256) {
      failures.push(`Approved record lacks a recorded download hash: ${record.articleSlug}`);
    } else {
      const fileHash = sha256OfFile(record.replacementImage);
      if (fileHash !== record.downloadedSha256) {
        failures.push(`Approved file hash mismatch: ${record.articleSlug}`);
      }
    }
    if (record.downloadVerified !== true) {
      failures.push(`Approved record was not download-verified: ${record.articleSlug}`);
    }
    if (!record.reviewedBy || !record.reviewedAt) {
      failures.push(`Approved record lacks reviewer identity: ${record.articleSlug}`);
    }
    if (!record.sourceProvider || !record.sourceUrl || !record.license || !record.licenseUrl) {
      failures.push(`Approved record lacks provenance: ${record.articleSlug}`);
    }
    if (!ALLOWED_LICENSES.has((record.license ?? "").toLowerCase())) {
      failures.push(`Approved record uses a license outside the allowlist: ${record.articleSlug}`);
    }
    if ((record.license ?? "").toLowerCase() === "by" || record.attributionRequired) {
      if (!(record.imageCreator ?? "").trim()) {
        failures.push(`Approved CC BY record lacks creator info: ${record.articleSlug}`);
      }
      if (!(record.attributionText ?? "").trim()) {
        failures.push(`Approved CC BY record lacks an attribution line: ${record.articleSlug}`);
      }
    }
    if (record.rightsReviewRequired) {
      if (!record.rightsClearedBy || !record.rightsClearedAt) {
        failures.push(`Approved record lacks rights clearance sign-off: ${record.articleSlug}`);
      }
    }
    if (!record.visualInspectionConfirmedBy || !record.visualInspectionConfirmedAt) {
      failures.push(`Approved record lacks visual inspection sign-off: ${record.articleSlug}`);
    }
    if (!record.editorialRelevanceConfirmedBy || !record.editorialRelevanceConfirmedAt) {
      failures.push(`Approved record lacks relevance confirmation: ${record.articleSlug}`);
    }
    if (!record.statusHistory.some((entry) => entry.action === "approved")) {
      failures.push(`Approved record lacks an approval history entry: ${record.articleSlug}`);
    }
    if (record.imageUrl && rejectedImageUrls.has(record.imageUrl)) {
      failures.push(`Approved record uses a previously rejected image URL: ${record.articleSlug}`);
    }
    if (record.downloadedSha256 && rejectedContentHashes.has(record.downloadedSha256)) {
      failures.push(`Approved record reuses rejected image content: ${record.articleSlug}`);
    }
  }
  if (record.status === "rejected") {
    if (!record.reviewedBy || !record.reviewedAt || !record.rejectionReason) {
      failures.push(`Rejected record lacks reviewer or reason: ${record.articleSlug}`);
    }
    if (!record.statusHistory.some((entry) => entry.action === "rejected")) {
      failures.push(`Rejected record lacks a rejection history entry: ${record.articleSlug}`);
    }
  }
  if (record.status === "candidate" && (!record.sourceUrl || !record.license || !record.imageUrl)) {
    failures.push(`Candidate record lacks discovery provenance: ${record.articleSlug}`);
  }
}

for (const [slug, count] of approvedPerSlug.entries()) {
  if (count > 1) failures.push(`Multiple approved images for article: ${slug}`);
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
    console.error(`- ${post.slug}: ${post.image}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error("FAIL: " + failure);
  process.exitCode = 1;
} else {
  console.log("Editorial media audit passed.");
}
