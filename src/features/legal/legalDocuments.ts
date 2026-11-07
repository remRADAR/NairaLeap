import {
  NAIRALEAP_SITE_ORIGIN,
  NAIRALEAP_BRAND,
  NAIRALEAP_CONTACT_EMAIL,
} from "@/features/brand/brand";

/**
 * Shared legal document architecture.
 *
 * Every legal/corporate page resolves its metadata, last-updated stamp and
 * review status from this module so the editorial website and the services
 * portal can never drift into two conflicting versions of the same document.
 */

export type LegalDocumentId = "about" | "disclaimer" | "privacy-policy";

export type LegalReviewStatus = "draft-pending-owner-approval";

export interface LegalDocumentMeta {
  id: LegalDocumentId;
  /** Document title shown on the page. */
  title: string;
  /** Title for the document head; defaults to `${title} — NairaLeap`. */
  headTitle?: string;
  /** Canonical route shared by the editorial website and the services portal. */
  path: "/about" | "/disclaimer" | "/privacy-policy";
  /** Unique meta description for the route. */
  description: string;
  /** ISO date of the last content update. */
  lastUpdated: string;
  /** Honest review state — never publish a legal page as approved when it is not. */
  reviewStatus: LegalReviewStatus;
  /** Contact route shown on the page for corrections and questions. */
  contactEmail: string;
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocumentMeta> = {
  about: {
    id: "about",
    title: "About NairaLeap",
    headTitle: "About NairaLeap — Nigerian Digital Media, Information & Services Ecosystem",
    path: "/about",
    description:
      "The story of NairaLeap — from the Naira & Kobo editorial archive to a Nigerian digital media, information and services ecosystem — our mission, our services and our vision for Nigeria.",
    lastUpdated: "2026-11-07",
    reviewStatus: "draft-pending-owner-approval",
    contactEmail: NAIRALEAP_CONTACT_EMAIL,
  },
  disclaimer: {
    id: "disclaimer",
    title: "Disclaimer",
    path: "/disclaimer",
    description:
      "How NairaLeap information, editorial coverage, indicative service descriptions and guidance should and should not be relied on — across the editorial website and the services portal.",
    lastUpdated: "2026-11-07",
    reviewStatus: "draft-pending-owner-approval",
    contactEmail: NAIRALEAP_CONTACT_EMAIL,
  },
  "privacy-policy": {
    id: "privacy-policy",
    title: "Privacy Policy",
    path: "/privacy-policy",
    description:
      "What personal information NairaLeap collects across the editorial website and services portal, how it is used, where it is stored, and the rights available to you under Nigerian data-protection law.",
    lastUpdated: "2026-11-07",
    reviewStatus: "draft-pending-owner-approval",
    contactEmail: NAIRALEAP_CONTACT_EMAIL,
  },
};

/**
 * Standard review banner shown on every legal page whose content has not yet
 * been approved by the owner and reviewed by qualified counsel. Legal pages are
 * published as clearly marked drafts rather than silently asserting approval.
 */
export function legalReviewNotice(doc: LegalDocumentMeta): string {
  return `This page is a working draft last updated on ${doc.lastUpdated}. Business, legal and data-protection details still require review and approval by the NairaLeap owner (and, for legal text, qualified counsel) before this page can be treated as approved. Contact ${doc.contactEmail} to correct or approve anything on this page.`;
}

/**
 * Route-level head for a canonical legal document. Both experiences link to
 * these routes, so each document owns a unique title and description.
 */
export function buildLegalHead(id: LegalDocumentId) {
  const doc = LEGAL_DOCUMENTS[id];
  const title = doc.headTitle ?? `${doc.title} — ${NAIRALEAP_BRAND.name}`;
  return {
    meta: [
      { title },
      { name: "description", content: doc.description },
      { property: "og:title", content: title },
      { property: "og:description", content: doc.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${NAIRALEAP_SITE_ORIGIN}${doc.path}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${NAIRALEAP_SITE_ORIGIN}${doc.path}` }],
  };
}
