import { EDITORIAL_POSTS, type EditorialPost } from "@/data/wordpressEditorial";

export type EditorialPostWithImage = EditorialPost & { image: string };

const localImagePaths = Array.from(
  new Set(EDITORIAL_POSTS.flatMap((post) => (post.image ? [post.image] : []))),
).sort();

const normalizeTerm = (value: string) => value.trim().toLowerCase();
const imagePathsByTerm = new Map<string, string[]>();

for (const post of EDITORIAL_POSTS) {
  if (!post.image) continue;
  const terms = new Set([post.category, ...post.categoryPath, ...post.tags].map(normalizeTerm));
  for (const term of terms) {
    if (!term) continue;
    const paths = imagePathsByTerm.get(term) ?? [];
    if (!paths.includes(post.image)) paths.push(post.image);
    imagePathsByTerm.set(term, paths);
  }
}

const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const fallbackImageFor = (post: EditorialPost) => {
  const matchingTerms = [post.category, ...post.categoryPath.slice().reverse(), ...post.tags];
  for (const term of matchingTerms) {
    const candidates = imagePathsByTerm.get(normalizeTerm(term));
    if (candidates?.length) return candidates[stableHash(post.slug) % candidates.length];
  }

  return (
    localImagePaths[stableHash(post.slug) % localImagePaths.length] ??
    "/editorial/featured-debt.jpg"
  );
};

/**
 * Preserve a post's original WordPress image. If the source post has no image,
 * use a deterministic, locally imported CMS image that matches its taxonomy
 * where possible, so article cards and detail pages never ship without art.
 */
export const withEditorialImageFallbacks = (
  posts: readonly EditorialPost[],
): EditorialPostWithImage[] =>
  posts.map((post) => ({
    ...post,
    image: post.image || fallbackImageFor(post),
  }));
