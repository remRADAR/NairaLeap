import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { EDITORIAL_POSTS } from "../src/data/wordpressEditorial";
import { withEditorialImageFallbacks } from "../src/features/editorial/images";

const resolvedPosts = withEditorialImageFallbacks(EDITORIAL_POSTS);
const missing = resolvedPosts.filter((post) => {
  if (!post.image.startsWith("/")) return true;
  return !existsSync(resolve(process.cwd(), "public", post.image.slice(1)));
});
const originalImages = EDITORIAL_POSTS.filter((post) => post.image).length;
const fallbackImages = resolvedPosts.length - originalImages;

console.log(`Articles checked: ${resolvedPosts.length}`);
console.log(`Original featured images: ${originalImages}`);
console.log(`Local fallback images applied: ${fallbackImages}`);
console.log(`Articles with a valid local image: ${resolvedPosts.length - missing.length}`);

if (missing.length > 0) {
  console.error("Articles without a valid local image:");
  for (const post of missing.slice(0, 20)) {
    console.error(`- ${post.slug}: ${post.image}`);
  }
  process.exitCode = 1;
}
