/**
 * Service Intelligence Catalog — pure configuration types.
 *
 * This module defines the master metadata schema for every NairaLeap service.
 * It intentionally contains no UI rendering, no business logic, and no
 * backend concerns. Consumer layers (components, server functions, workflows)
 * import this catalog and adapt it as needed.
 */

/** Stable identifier for each NairaLeap service. */
export type ServiceId =
  | "agriculture"
  | "property-listings"
  | "business-funding"
  | "partnerships"
  | "vendor-marketplace"
  | "distress-sales"
  | "recycling-scrap"
  | "business-briefs"
  | "professional-services"
  | "customer-support"
  | "insurance"
  | "mortgage";

/** Broad category used to group services in onboarding flows and analytics. */
export type OnboardingCategory =
  | "agriculture"
  | "property"
  | "funding"
  | "partnerships"
  | "marketplace"
  | "distressed-sales"
  | "recycling"
  | "information"
  | "professional-services"
  | "support"
  | "insurance"
  | "mortgage";

/** Document type identifiers referenced by services. */
export type DocumentTypeId =
  | "government-id"
  | "proof-of-address"
  | "business-registration"
  | "tax-identification"
  | "financial-statements"
  | "income-evidence"
  | "bank-statement"
  | "property-title"
  | "survey-plan"
  | "farm-ownership"
  | "farm-plan"
  | "partnership-agreement"
  | "vendor-license"
  | "product-catalog"
  | "ownership-proof"
  | "asset-photos"
  | "valuation-report"
  | "professional-license"
  | "certification"
  | "cv-resume"
  | "supporting-documents";

/** Reference to a question set managed by the Question Engine. */
export type QuestionSetId = string;

/** Stages a service request can flow into after the service preview. */
export type NextWorkflow =
  | "guided-question-engine"
  | "document-upload"
  | "admin-review"
  | "auto-submit"
  | "support-queue";

/** Icon identifier from the Lucide icon library. UI layers map this to a component. */
export type IconName = string;

/**
 * Single, extensible metadata record for a NairaLeap service.
 *
 * All fields are optional unless marked otherwise, allowing new services to be
 * registered incrementally without breaking the type contract.
 */
export interface ServiceIntelligenceEntry {
  /** Stable machine-readable identifier. */
  id: ServiceId;

  /** Human-readable service name. */
  title: string;

  /** Lucide icon identifier rendered by the UI layer. */
  icon: IconName;

  /** One-line description used in cards and lists. */
  shortDescription: string;

  /** Full description used in detail views, sheets, and SEO content. */
  detailedDescription: string;

  /** Category used for grouping, filtering, and onboarding defaults. */
  onboardingCategory: OnboardingCategory;

  /** Human-readable estimate for completing the request flow. */
  estimatedCompletionTime: string;

  /** Whether the service requires a guided Question Engine flow. */
  requiresGuidedQuestions: boolean;

  /** Whether the service requires the user to upload documents. */
  requiresDocuments: boolean;

  /** Whether submitted requests require manual review by an admin/agent. */
  requiresAdminReview: boolean;

  /** Reference to the recommended question set, or null if none. */
  suggestedQuestionSet: QuestionSetId | null;

  /** List of document types the user may be asked to provide. */
  requiredDocumentTypes: DocumentTypeId[];

  /** Template string describing what the user receives after submission. */
  outputSummaryTemplate: string;

  /** Next workflow stage after the service preview. */
  nextWorkflow: NextWorkflow;
}

/** Shape of the exported catalog. */
export type ServiceIntelligenceCatalog = ServiceIntelligenceEntry[];
