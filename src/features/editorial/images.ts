import type { EditorialPost } from "@/data/wordpressEditorial";

export type EditorialPostWithImage = EditorialPost & { image: string };

// Deterministic last-resort fallbacks for posts whose category is not mapped below.
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

/**
 * Explicit, maintainable category-to-image mapping.
 *
 * Replaces the old behaviour where missing artwork was chosen by hashing the
 * post slug, which produced unreliable, unrelated artwork (most visibly for
 * Transportation & Infrastructure stories). Every image referenced here must
 * exist under `public/editorial/` and is verified by
 * `scripts/audit-editorial-images.ts` (run via `npm run audit:editorial-images`).
 *
 * Lookup order for a post without its own featured image:
 *   1. deepest matching entry in CATEGORY_IMAGE_OVERRIDES (child categories win),
 *   2. the top-level category image in TOP_LEVEL_CATEGORY_IMAGES,
 *   3. the deterministic hash fallback above (never leaves an image empty).
 */

/** Specific categories (including Transportation & Infrastructure children) with dedicated artwork. */
export const CATEGORY_IMAGE_OVERRIDES: Record<string, string> = {
  // Transportation & Infrastructure
  Transportation: "/editorial/featured-rail.jpg",
  Rail: "/editorial/featured-rail.jpg",
  Road: "/editorial/featured-rail.jpg",
  Aviation: "/editorial/featured-rail.jpg",
  Water: "/editorial/featured-rail.jpg",
  Infrastructure: "/editorial/featured-rail.jpg",
  "Hard Infrastructure": "/editorial/featured-rail.jpg",
  "Soft Infrastructure": "/editorial/featured-rail.jpg",
  "Critical Infrastructure": "/editorial/featured-rail.jpg",

  // Energy
  Energy: "/editorial/featured-nnpcl.jpg",

  // Health
  Health: "/editorial/featured-medicine.jpg",

  // Education & research
  Education: "/editorial/featured-literacy.jpg",
  Research: "/editorial/featured-literacy.jpg",

  // Wealth creation & public finance
  "Monetary Policy": "/editorial/featured-pencom.jpg",
  "Budgeting and Debt Financing": "/editorial/featured-debt.jpg",
  "Savings and Investment": "/editorial/featured-pencom.jpg",

  // Industry
  Manufacturing: "/editorial/featured-manufacturing.jpg",

  // International organizations
  "World Bank (WB)": "/editorial/featured-world-bank.jpg",
};

/** Top-level editorial sections (parent categories) with committed artwork. */
export const TOP_LEVEL_CATEGORY_IMAGES: Record<string, string> = {
  // Transportation & Infrastructure stories now consistently use the rail feature image.
  "INFRASTRUCTURE & CONNECTIVITY": "/editorial/featured-rail.jpg",
  "ECONOMIC DEVELOPMENT": "/editorial/featured-manufacturing.jpg",
  "HUMAN DEVELOPMENT": "/editorial/featured-literacy.jpg",
  "SUSTAINABILITY & DEVELOPMENT": "/editorial/featured-world-bank.jpg",
  "TECHNOLOGY & INNOVATION": "/editorial/cms/4042.jpg",
  "GOVERNANCE & LEADERSHIP": "/editorial/cms/4291.jpg",
  "SECURITY & STABILITY": "/editorial/cms/274.jpg",
  "INTERNATIONAL & REGIONAL AFFAIRS": "/editorial/cms/4167.jpg",
  "CULTURE & CREATIVE ECONOMY": "/editorial/cms/4042.jpg",
};

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
 * Resolve the category-appropriate image for a post, or null when no category
 * mapping applies. Child categories take precedence over their parents.
 */
const categoryImageFor = (post: EditorialPost): string | null => {
  const path = post.categoryPath?.length ? post.categoryPath : [post.category];
  for (let index = path.length - 1; index >= 0; index -= 1) {
    const override = CATEGORY_IMAGE_OVERRIDES[path[index] ?? ""];
    if (override) return override;
  }
  return TOP_LEVEL_CATEGORY_IMAGES[path[0] ?? ""] ?? null;
};

/**
 * Preserve a post's original image. Missing images receive an explicit
 * category-appropriate local image (see the mapping tables above), falling back
 * to a deterministic local image so every editorial card always has artwork.
 * This helper is safe to use in the browser because it does not import the full
 * CMS catalog.
 */
export const withEditorialImageFallbacks = (
  posts: readonly EditorialPost[],
): EditorialPostWithImage[] =>
  posts.map((post) => ({
    ...post,
    image: post.image || categoryImageFor(post) || fallbackImageFor(post),
  }));
