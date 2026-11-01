import type { EditorialPost } from "@/data/wordpressEditorial";

export type EditorialPostWithImage = EditorialPost & { image: string };

/**
 * Resolve each post's presentation image from its own source data only.
 *
 * A post's source featured image (the WordPress featured_media asset captured
 * during import) is preserved exactly as recorded. When the source has no
 * featured image, the resolved reference is an empty string: article cards
 * already render a neutral gradient/background treatment for image-less
 * posts, and filling the gap with unrelated editorial artwork would
 * misrepresent the source archive. No category-based, hash-based or
 * order-based substitution is performed.
 *
 * The historical export name is retained so existing callers keep working.
 */
export const withEditorialImageFallbacks = (
  posts: readonly EditorialPost[],
): EditorialPostWithImage[] =>
  posts.map((post) => ({
    ...post,
    image: post.image ?? "",
  }));
