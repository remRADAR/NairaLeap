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

/** Append-only audit trail entry for a manifest record. */
export type EditorialMediaHistoryEntry = {
  /** ISO timestamp of the recorded action. */
  at: string;
  /** Identity of the person or process that recorded the action. */
  by: string;
  /** What happened to the record. */
  action: "discovered" | "recovered" | "downloaded" | "approved" | "rejected";
  /** Optional context recorded with the action. */
  notes: string | null;
};

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
  /** Stable identifier of the source record at the provider. */
  sourceRecordId: string | null;
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
  /** Reviewer who explicitly cleared depiction or trademark rights, if required. */
  rightsClearedBy: string | null;
  /** When rights clearance was recorded. */
  rightsClearedAt: string | null;
  /** Reviewer who confirmed documented visual inspection of the source image. */
  visualInspectionConfirmedBy: string | null;
  /** When visual inspection was confirmed. */
  visualInspectionConfirmedAt: string | null;
  /** Reviewer who confirmed the image is editorially relevant to the article. */
  editorialRelevanceConfirmedBy: string | null;
  /** When editorial relevance was confirmed. */
  editorialRelevanceConfirmedAt: string | null;
  /** Whether the hardened download pipeline verified MIME, signature, and size. */
  downloadVerified: boolean;
  /** Full SHA-256 of the stored bytes (content-addressed storage). */
  downloadedSha256: string | null;
  /** Append-only audit trail of status transitions. */
  statusHistory: EditorialMediaHistoryEntry[];
};
