import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { EDITORIAL_POSTS } from "../src/data/wordpressEditorial.ts";

const publicRoot = resolve(process.cwd(), "public");
const fallbackImages = [
  "/editorial/featured-debt.jpg",
  "/editorial/featured-medicine.jpg",
  "/editorial/cms/4042.jpg",
  "/editorial/cms/4291.jpg",
  "/editorial/cms/274.jpg",
  "/editorial/cms/4167.jpg",
];
const fallbackFor = (slug) => {
  let hash = 2166136261;
  for (const character of slug) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return fallbackImages[(hash >>> 0) % fallbackImages.length];
};
const localExists = (value) => value.startsWith("/") && existsSync(resolve(publicRoot, value.slice(1)));
const resolvedImage = (post) => post.image || fallbackFor(post.slug);
const displaySource = (value) => value.length > 160 ? `${value.slice(0, 157)}...` : value;
const inlineImages = [];
for (const post of EDITORIAL_POSTS) {
  for (const match of post.content.matchAll(/<img\b[^>]*>/gi)) {
    const src = match[0].match(/\bsrc=["']([^"']+)/i)?.[1] || "";
    inlineImages.push({ slug: post.slug, src });
  }
}

const missingFeatured = EDITORIAL_POSTS
  .map((post) => ({ slug: post.slug, image: resolvedImage(post) }))
  .filter(({ image }) => !localExists(image));
const invalidInline = inlineImages.filter(({ src }) => !src || (!src.startsWith("/") && !/^https?:\/\//i.test(src) && !/^data:image\//i.test(src)));
const localInline = inlineImages.filter(({ src }) => src.startsWith("/"));
const externalInline = inlineImages.filter(({ src }) => /^https?:\/\//i.test(src));
const embeddedInline = inlineImages.filter(({ src }) => /^data:image\//i.test(src));
const cmsFiles = readdirSync(resolve(publicRoot, "editorial/cms"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(?:jpe?g|png|webp|gif|avif)$/i.test(entry.name)).length;

const report = {
  articlesChecked: EDITORIAL_POSTS.length,
  originalFeaturedImages: EDITORIAL_POSTS.filter((post) => Boolean(post.image)).length,
  fallbackFeaturedImages: EDITORIAL_POSTS.filter((post) => !post.image).length,
  missingFeaturedImages: missingFeatured.length,
  inlineImagesChecked: inlineImages.length,
  localInlineImages: localInline.length,
  externalInlineImages: externalInline.length,
  embeddedInlineImages: embeddedInline.length,
  invalidInlineImages: invalidInline.length,
  localCmsFiles: cmsFiles,
  missingFeatured,
  invalidInline: invalidInline.slice(0, 20).map(({ slug, src }) => ({ slug, src: displaySource(src) })),
};
console.log(JSON.stringify(report, null, 2));
if (missingFeatured.length || invalidInline.length) process.exitCode = 1;
