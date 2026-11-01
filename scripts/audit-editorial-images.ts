import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { EDITORIAL_POSTS, type EditorialPost } from "../src/data/wordpressEditorial";
import { withEditorialImageFallbacks } from "../src/features/editorial/images";

/**
 * Editorial featured-image integrity audit.
 *
 * Verifies that every article's displayed image comes from that article's own
 * source featured image, that local image files exist, and that the media ID
 * embedded in /editorial/cms/{ID}.{ext} paths matches the article's recorded
 * featuredMediaId when both are available. A genuinely image-less article is
 * valid and must stay image-less; invented fallback assignments fail the audit.
 */

// The generated dataset may not yet declare featuredMediaId in its interface;
// the field is optional either way.
type SourcePost = EditorialPost & { featuredMediaId?: number };

const CMS_IMAGE_PATH = /^\/editorial\/cms\/(\d+)\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const isRemoteReference = (value: string) => /^https?:\/\//i.test(value);

const sourcePosts = EDITORIAL_POSTS as SourcePost[];
const resolvedPosts = withEditorialImageFallbacks(sourcePosts);

const inventedFallbacks: string[] = [];
const missingLocalFiles: string[] = [];
const mismatchedMediaIds: string[] = [];
const remoteSourceImages: string[] = [];

let withSourceImage = 0;
let withoutSourceImage = 0;
let mediaIdChecks = 0;

sourcePosts.forEach((source, index) => {
  const resolved = resolvedPosts[index];
  if (!resolved) {
    inventedFallbacks.push(`${source.slug}: resolver returned no entry`);
    return;
  }

  const sourceImage = source.image ?? "";
  if (sourceImage) {
    withSourceImage += 1;
  } else {
    withoutSourceImage += 1;
  }

  // An article without a source image must remain image-less after resolution;
  // any other article must keep exactly its source image.
  if (resolved.image !== sourceImage) {
    inventedFallbacks.push(
      `${source.slug}: resolver produced "${resolved.image}" for source image "${sourceImage || "(none)"}"`,
    );
  }

  if (!sourceImage || isRemoteReference(sourceImage)) {
    if (sourceImage) remoteSourceImages.push(`${source.slug}: ${sourceImage}`);
    return;
  }

  if (!sourceImage.startsWith("/")) {
    missingLocalFiles.push(`${source.slug}: unrecognized image reference ${sourceImage}`);
    return;
  }

  const localFile = resolve(process.cwd(), "public", sourceImage.slice(1));
  if (!existsSync(localFile)) {
    missingLocalFiles.push(`${source.slug}: ${sourceImage}`);
  }

  const featuredMediaId = source.featuredMediaId;
  const pathMatch = CMS_IMAGE_PATH.exec(sourceImage);
  if (featuredMediaId && pathMatch) {
    mediaIdChecks += 1;
    if (Number(pathMatch[1]) !== featuredMediaId) {
      mismatchedMediaIds.push(
        `${source.slug}: image path media ID ${pathMatch[1]} does not match featuredMediaId ${featuredMediaId}`,
      );
    }
  }
});

console.log(`Articles checked: ${sourcePosts.length}`);
console.log(`Articles with source featured images: ${withSourceImage}`);
console.log(`Articles without source featured images (valid, rendered with the neutral treatment): ${withoutSourceImage}`);
console.log(`Featured-media ID/path cross-checks performed: ${mediaIdChecks}`);
console.log(`Remote source image references (download-failure fallbacks): ${remoteSourceImages.length}`);
if (remoteSourceImages.length > 0) {
  for (const entry of remoteSourceImages.slice(0, 20)) console.log(`  remote: ${entry}`);
}
console.log(`Invented fallback assignments: ${inventedFallbacks.length}`);
console.log(`Missing local image files: ${missingLocalFiles.length}`);
console.log(`Mismatched media IDs: ${mismatchedMediaIds.length}`);

let failed = false;
const report = (label: string, entries: string[]) => {
  if (entries.length === 0) return;
  failed = true;
  console.error(`${label}:`);
  for (const entry of entries.slice(0, 20)) console.error(`- ${entry}`);
  if (entries.length > 20) console.error(`  ... and ${entries.length - 20} more`);
};
report("Articles whose resolved image differs from the source (invented fallback)", inventedFallbacks);
report("Missing local image files", missingLocalFiles);
report("Mismatched featured-media IDs", mismatchedMediaIds);

if (failed) process.exitCode = 1;
