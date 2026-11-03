import type { EditorialPost } from "@/data/wordpressEditorial";
import {
  APPROVED_REPLACEMENT_IMAGES,
  INVALID_ORIGINAL_IMAGES,
  RECOVERED_ORIGINAL_IMAGES,
} from "@/data/editorialMediaApproved";
import { editorialMediaUrl } from "@/features/editorial/media-storage";

export type EditorialPostWithImage = EditorialPost & { image: string };

/**
 * Neutral, branded placeholder artwork. It is the only image ever assigned
 * automatically to an article: no unrelated photography is used as filler.
 */
export const NEUTRAL_EDITORIAL_PLACEHOLDER = "/editorial/placeholder-editorial.svg";

/**
 * Override maps generated from the editorial media manifest and the
 * reconciliation report. Keys are article slugs.
 */
export type EditorialImageOverrides = {
  recovered: Record<string, string>;
  invalid: Record<string, true>;
  approved: Record<string, string>;
};

/**
 * Editorial artwork resolution hierarchy:
 *
 *   1. the article's original featured image, unless reconciliation marked
 *      it invalid (broken reference that could not be repaired);
 *   2. a recovered original relationship — a repaired path or artwork that
 *      was embedded in the article's own migrated content;
 *   3. an editorially approved replacement from the media manifest;
 *   4. the neutral NairaLeap placeholder.
 *
 * Candidates discovered by tooling are never assigned until they are approved.
 */
export const resolveEditorialImageWith = (
  post: EditorialPost,
  overrides: EditorialImageOverrides,
): string => {
  if (post.image && overrides.invalid[post.slug] !== true) {
    return editorialMediaUrl(post.image);
  }
  const recovered = overrides.recovered[post.slug];
  if (recovered) return editorialMediaUrl(recovered);
  const approved = overrides.approved[post.slug];
  if (approved) return editorialMediaUrl(approved);
  return editorialMediaUrl(NEUTRAL_EDITORIAL_PLACEHOLDER);
};

export const resolveEditorialImage = (post: EditorialPost): string =>
  resolveEditorialImageWith(post, {
    recovered: RECOVERED_ORIGINAL_IMAGES,
    invalid: INVALID_ORIGINAL_IMAGES,
    approved: APPROVED_REPLACEMENT_IMAGES,
  });

/**
 * Resolve every post's featured image while preserving valid original
 * artwork. This helper is safe to use in the browser because it does not
 * import the full CMS catalog — only the small generated media subset.
 */
export const withEditorialImageFallbacks = (
  posts: readonly EditorialPost[],
): EditorialPostWithImage[] =>
  posts.map((post) => ({ ...post, image: resolveEditorialImage(post) }));
