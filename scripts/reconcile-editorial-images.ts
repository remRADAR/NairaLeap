/**
 * Editorial featured-image reconciliation (source-backed, review-first).
 *
 * Compares every current article image assignment in the generated dataset
 * (src/data/wordpressEditorial.ts) against the ORIGINAL WordPress exports:
 *
 *   1. nairaleap-wordpress-posts.json  — each post's exact featured_media ID
 *   2. nairaleap-wordpress-media.json  — media records keyed by that exact ID
 *
 * Usage (files were originally at the migration machine's ~/Downloads):
 *   bun run scripts/reconcile-editorial-images.ts <posts.json> <media.json>
 * With no arguments it checks default locations and exits with guidance.
 *
 * Method (strict — no filename-similarity, order or category inference):
 *   - The ONLY authoritative relationship is post.featured_media -> media.id.
 *   - The expected local asset is the file public/editorial/cms/{mediaID}.{ext}.
 *   - An article's current dataset image is compared to that expectation.
 *   - Results are classified and written to a machine-readable report plus a
 *     proposed-corrections file that a human must review and apply.
 *   - This script NEVER modifies the generated dataset or any image file.
 *   - Assignments that cannot be proven against the source stay unverified.
 *
 * Outputs (repo root, gitignored candidates):
 *   - editorial-image-reconciliation-report.json (full machine-readable report)
 *   - editorial-image-proposed-corrections.json  (only source-proven corrections)
 */

import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { EDITORIAL_POSTS } from "../src/data/wordpressEditorial";

const MEDIA_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
const CMS_IMAGE_PATH = /^\/editorial\/cms\/(\d+)\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const isRemoteReference = (value: string) => /^https?:\/\//i.test(value);

type WordPressPost = {
  id?: number;
  slug?: string;
  title?: { rendered?: string };
  featured_media?: number;
};

type WordPressMedia = {
  id?: number;
  source_url?: string;
};

type ReconciliationStatus =
  | "exact_match"
  | "mismatch"
  | "missing_media_record"
  | "missing_dataset_image"
  | "unassigned_in_dataset"
  | "no_source_post"
  | "ambiguous_duplicate"
  | "unverified";

type ReportEntry = {
  articleId: number;
  slug: string;
  title: string;
  featuredMediaId: number | null;
  sourceMediaFound: boolean;
  sourceMediaUrl: string | null;
  expectedImagePath: string | null;
  currentImage: string | null;
  status: ReconciliationStatus;
  note?: string;
};

const loadJson = (label: string, path: string): unknown[] => {
  if (!existsSync(path)) {
    console.error(`Missing ${label}: ${path}`);
    console.error(
      "Locate the original WordPress export JSONs (they lived outside the repository, " +
        "on the migration machine's ~/Downloads) and pass their paths explicitly.",
    );
    process.exit(1);
  }
  const parsed = JSON.parse(readFileSyncShim(path));
  if (!Array.isArray(parsed)) {
    console.error(`${label} at ${path} is not a JSON array.`);
    process.exit(1);
  }
  return parsed;
};

const readFileSyncShim = (path: string) =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require("node:fs") as typeof import("node:fs")).readFileSync(path, "utf-8");

const main = () => {
  const args = process.argv.slice(2);
  const defaultPosts = resolve(homedir(), "Downloads", "nairaleap-wordpress-posts.json");
  const defaultMedia = resolve(homedir(), "Downloads", "nairaleap-wordpress-media.json");
  const postsPath = args[0] ?? defaultPosts;
  const mediaPath = args[1] ?? defaultMedia;
  if (!existsSync(postsPath) || !existsSync(mediaPath)) {
    console.error("Original WordPress exports not found.");
    console.error(`  posts export expected at: ${postsPath}`);
    console.error(`  media export expected at: ${mediaPath}`);
    console.error("The 434 existing image assignments remain UNVERIFIED until these files are supplied.");
    process.exit(1);
  }

  const sourcePosts = loadJson("Posts export", postsPath) as WordPressPost[];
  const sourceMedia = loadJson("Media export", mediaPath) as WordPressMedia[];

  const mediaById = new Map<number, WordPressMedia>();
  for (const item of sourceMedia) {
    if (typeof item.id === "number") mediaById.set(item.id, item);
  }

  const datasetById = new Map<number, (typeof EDITORIAL_POSTS)[number]>();
  for (const post of EDITORIAL_POSTS) datasetById.set(post.id, post);

  // Local CMS assets actually present, keyed by numeric media ID.
  const cmsDir = resolve(process.cwd(), "public", "editorial", "cms");
  const localAssetByMediaId = new Map<number, string>();
  if (existsSync(cmsDir)) {
    for (const name of readdirSync(cmsDir)) {
      const match = /^(\d+)\.(\w+)$/.exec(name);
      if (match && MEDIA_EXTENSIONS.includes(match[2].toLowerCase())) {
        localAssetByMediaId.set(Number(match[1]), `/editorial/cms/${name}`);
      }
    }
  }

  // Detect duplicate/ambiguous assignments: one CMS asset used by several articles.
  const imageUseCount = new Map<string, number[]>();
  for (const post of EDITORIAL_POSTS) {
    if (!post.image || isRemoteReference(post.image)) continue;
    const users = imageUseCount.get(post.image) ?? [];
    users.push(post.id);
    imageUseCount.set(post.image, users);
  }

  const sourcePostById = new Map<number, WordPressPost>();
  for (const post of sourcePosts) {
    if (typeof post.id === "number") sourcePostById.set(post.id, post);
  }

  const entries: ReportEntry[] = [];
  const corrections: Array<{
    articleId: number;
    slug: string;
    fromImage: string | null;
    toImage: string | null;
    reason: string;
  }> = [];

  const expectedPathFor = (mediaId: number, media: WordPressMedia | undefined): string | null => {
    const local = localAssetByMediaId.get(mediaId);
    if (local) return local;
    // Traceable remote fallback mirrors the importer's failed-download behaviour.
    return media?.source_url ?? null;
  };

  // 1) Every dataset article carrying an image, checked against the source.
  for (const post of EDITORIAL_POSTS) {
    const currentImage = post.image ?? null;
    const sourcePost = sourcePostById.get(post.id);
    if (!sourcePost) {
      entries.push({
        articleId: post.id,
        slug: post.slug,
        title: post.title,
        featuredMediaId: null,
        sourceMediaFound: false,
        sourceMediaUrl: null,
        expectedImagePath: null,
        currentImage,
        status: "no_source_post",
        note: "No matching record in the posts export; assignment remains unverified.",
      });
      continue;
    }
    const featuredMediaId = sourcePost.featured_media || null;
    const media = featuredMediaId !== null ? mediaById.get(featuredMediaId) : undefined;
    const expected = featuredMediaId !== null ? expectedPathFor(featuredMediaId, media) : null;

    if (!currentImage) {
      entries.push({
        articleId: post.id,
        slug: post.slug,
        title: post.title,
        featuredMediaId,
        sourceMediaFound: media !== undefined,
        sourceMediaUrl: media?.source_url ?? null,
        expectedImagePath: expected,
        currentImage,
        status: featuredMediaId && expected ? "missing_dataset_image" : "unassigned_in_dataset",
        note: featuredMediaId ? undefined : "Source post has no featured_media; image-less is correct.",
      });
      if (featuredMediaId && expected) {
        corrections.push({
          articleId: post.id,
          slug: post.slug,
          fromImage: null,
          toImage: expected,
          reason: `Source featured_media ${featuredMediaId} resolves to ${expected}.`,
        });
      }
      continue;
    }

    if (!featuredMediaId) {
      entries.push({
        articleId: post.id,
        slug: post.slug,
        title: post.title,
        featuredMediaId: null,
        sourceMediaFound: false,
        sourceMediaUrl: null,
        expectedImagePath: null,
        currentImage,
        status: "unverified",
        note: "Dataset image present but source post has no featured_media — REMOVE candidate, human review required.",
      });
      corrections.push({
        articleId: post.id,
        slug: post.slug,
        fromImage: currentImage,
        toImage: null,
        reason: "Source post has no featured_media; current image cannot be source-proven.",
      });
      continue;
    }

    const pathMatch = CMS_IMAGE_PATH.exec(currentImage);
    const sharedWith = imageUseCount.get(currentImage) ?? [];
    const duplicateSuspect = sharedWith.length > 1;
    if (expected && currentImage === expected && !duplicateSuspect) {
      entries.push({
        articleId: post.id, slug: post.slug, title: post.title,
        featuredMediaId, sourceMediaFound: media !== undefined,
        sourceMediaUrl: media?.source_url ?? null,
        expectedImagePath: expected, currentImage, status: "exact_match",
      });
    } else if (!media) {
      entries.push({
        articleId: post.id, slug: post.slug, title: post.title,
        featuredMediaId, sourceMediaFound: false,
        sourceMediaUrl: null, expectedImagePath: null, currentImage,
        status: "missing_media_record",
        note: "featured_media ID absent from the media export; current assignment remains unverified.",
      });
    } else if (duplicateSuspect) {
      entries.push({
        articleId: post.id, slug: post.slug, title: post.title,
        featuredMediaId, sourceMediaFound: true,
        sourceMediaUrl: media.source_url ?? null,
        expectedImagePath: expected, currentImage,
        status: "ambiguous_duplicate",
        note: `Asset ${currentImage} also assigned to article(s) ${sharedWith.filter((id) => id !== post.id).join(", ")}; verify each against its own featured_media before any correction.`,
      });
    } else {
      entries.push({
        articleId: post.id, slug: post.slug, title: post.title,
        featuredMediaId, sourceMediaFound: true,
        sourceMediaUrl: media.source_url ?? null,
        expectedImagePath: expected, currentImage,
        status: "mismatch",
        note: "Current image differs from the source-proven asset.",
      });
      if (expected) {
        corrections.push({
          articleId: post.id,
          slug: post.slug,
          fromImage: currentImage,
          toImage: expected,
          reason: `Source featured_media ${featuredMediaId} resolves to ${expected}.`,
        });
      }
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    datasetArticles: EDITORIAL_POSTS.length,
    datasetArticlesWithImages: EDITORIAL_POSTS.filter((p) => p.image).length,
    sourcePosts: sourcePosts.length,
    sourceMediaRecords: sourceMedia.length,
    exactMatches: entries.filter((e) => e.status === "exact_match").length,
    mismatches: entries.filter((e) => e.status === "mismatch").length,
    missingMediaRecords: entries.filter((e) => e.status === "missing_media_record").length,
    missingDatasetImages: entries.filter((e) => e.status === "missing_dataset_image").length,
    ambiguousDuplicates: entries.filter((e) => e.status === "ambiguous_duplicate").length,
    noSourcePost: entries.filter((e) => e.status === "no_source_post").length,
    unverified: entries.filter((e) => e.status === "unverified").length,
    proposedCorrections: corrections.length,
  };

  const report = { summary, entries };
  const reportPath = resolve(process.cwd(), "editorial-image-reconciliation-report.json");
  const correctionsPath = resolve(process.cwd(), "editorial-image-proposed-corrections.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  writeFileSync(correctionsPath, JSON.stringify({ summary, corrections }, null, 2), "utf-8");

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Report written: ${reportPath}`);
  console.log(`Proposed corrections (human review required, nothing applied): ${correctionsPath}`);
  console.log("This script does not modify the generated dataset. Apply reviewed corrections manually.");
};

main();
