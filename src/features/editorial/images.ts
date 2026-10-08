import type { EditorialPost } from "@/data/wordpressEditorial";

export type EditorialPostWithImage = EditorialPost & { image: string };

// Keep this list intentionally small: the complete editorial catalog is server-side data and
// should not be pulled into the homepage client bundle just to fill missing card artwork.
const FALLBACK_IMAGE_PATHS = [
  "/editorial/featured-debt.jpg",
  "/editorial/featured-medicine.jpg",
  "/editorial/cms/4042.jpg",
  "/editorial/cms/4291.jpg",
  "/editorial/cms/274.jpg",
  "/editorial/cms/4167.jpg",
] as const;

const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const fallbackImageFor = (post: EditorialPost) =>
  FALLBACK_IMAGE_PATHS[stableHash(post.slug) % FALLBACK_IMAGE_PATHS.length];

/**
 * Preserve a post's original image. Missing images receive a deterministic local fallback.
 * This helper is safe to use in the browser because it does not import the full CMS catalog.
 */
export const withEditorialImageFallbacks = (
  posts: readonly EditorialPost[],
): EditorialPostWithImage[] =>
  posts.map((post) => ({
    ...post,
    image: post.image || fallbackImageFor(post),
  }));
