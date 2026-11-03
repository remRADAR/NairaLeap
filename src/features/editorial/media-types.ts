/**
 * Editorial media provenance record schema.
 *
 * The editorial media manifest at `docs/editorial-media/manifest.json` is the
 * source of truth for replacement imagery and recovered original artwork. The
 * runtime never imports the full manifest; scripts generate a small typed
 * subset at `src/data/editorialMediaApproved.ts` instead, so the client bundle
 * stays small.
 *
 * See `docs/editorial-media/README.md` for the full field guide.
 */
export type EditorialMediaStatus = "original" | "candidate" | "approved" | "rejected";

export type EditorialMediaRecord = {
  /** WordPress post id of the article this record belongs to. */
  articleId: number;
  /** Article slug; the stable key used by the resolution hierarchy. */
  articleSlug: string;
  /** Article title at processing time, kept for review context. */
  articleTitle: string;
  /** Original featured image path from the migration, when one existed. */
  originalImage: string | null;
  /** Local path of the recovered or approved image serving as featured art. */
  replacementImage: string | null;
  /** Discovery provider, for example "openverse". Null for recovered originals. */
  sourceProvider: string | null;
  /** Provider landing/detail URL for the source image. */
  sourceUrl: string | null;
  /** Direct image file URL, used when downloading approved replacements. */
  imageUrl: string | null;
  /** Creator of the source image, when known. */
  imageCreator: string | null;
  /** License code, for example "cc0", "pdm", or "by". */
  license: string | null;
  /** License version string, when known. */
  licenseVersion: string | null;
  /** Canonical license URL. */
  licenseUrl: string | null;
  /** Whether the license requires attribution for use. */
  attributionRequired: boolean;
  /** Ready-to-use attribution line, when attribution applies. */
  attributionText: string | null;
  /** Whether editorial review must clear depiction or trademark rights first. */
  rightsReviewRequired: boolean;
  /** Notes explaining rights caution flags. */
  rightsNotes: string | null;
  /** Relevance score from the discovery pipeline (candidates only). */
  relevanceScore: number | null;
  /** Why the candidate matched this article (candidates only). */
  relevanceNotes: string | null;
  /** Search query that surfaced this candidate. */
  queryUsed: string | null;
  /** ISO timestamp when the source record was retrieved. */
  retrievedAt: string | null;
  /** ISO timestamp of the approval or rejection decision. */
  reviewedAt: string | null;
  /** Reviewer identity recorded with an approval or rejection. */
  reviewedBy: string | null;
  /** Reason recorded when a candidate was rejected. */
  rejectionReason: string | null;
  /** How an original relationship was recovered, for recovered originals. */
  recoveryMethod: string | null;
  /** Lifecycle status of this record. */
  status: EditorialMediaStatus;
};
