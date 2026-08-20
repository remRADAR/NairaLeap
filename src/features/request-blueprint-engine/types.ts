/**
 * Request Blueprint Engine — pure configuration types.
 *
 * Defines the final structured output package that every onboarding process
 * must produce. This is the source of truth for review screens, admin
 * dashboards, notifications, PDF generation, and CRM integrations.
 *
 * This module intentionally contains no UI, no business logic, and no backend
 * concerns. It references the Service Intelligence Catalog only by stable
 * identifiers to avoid duplicating service metadata.
 */

import type {
  DocumentTypeId,
  NextWorkflow,
  ServiceId,
} from "@/features/service-intelligence-catalog";

/** Field type for a value expected in the final request package. */
export type BlueprintFieldType =
  | "short-text"
  | "long-text"
  | "number"
  | "date"
  | "yes-no"
  | "single-choice"
  | "multiple-choice"
  | "email"
  | "phone"
  | "location"
  | "currency";

/** Priority assigned to incoming requests for triage. */
export type RequestPriority = "low" | "normal" | "high" | "urgent";

/** Category for admin checklist items. */
export type AdminChecklistCategory =
  | "verification"
  | "review"
  | "compliance"
  | "assignment"
  | "communication";

/**
 * A single field expected in the final request package.
 *
 * The `questionRef` field is optional and links the expected output to a
 * Question Engine question id when the value is collected through the guide.
 */
export interface BlueprintField {
  /** Stable identifier for this field within the blueprint. */
  id: string;

  /** Machine-readable key used in the submitted payload and CRM mappings. */
  key: string;

  /** Human-readable label displayed in review and admin surfaces. */
  label: string;

  /** Expected data type for the value. */
  type: BlueprintFieldType;

  /** Whether this field must be present for a complete submission. */
  required: boolean;

  /** Optional helper text describing what the field should contain. */
  description?: string;

  /** Optional reference to the Question Engine question that collects this value. */
  questionRef?: string;
}

/**
 * A document expected in the final request package.
 *
 * `documentTypeId` references the shared document type registry in the Service
 * Intelligence Catalog so that upload flows and verification rules stay in
 * sync.
 */
export interface BlueprintDocument {
  /** Document type from the shared document registry. */
  documentTypeId: DocumentTypeId;

  /** Whether the document is required before submission can be completed. */
  required: boolean;

  /** Optional guidance on what the document should contain. */
  description?: string;
}

/** A single checklist item for administrators handling the request. */
export interface AdminChecklistItem {
  /** Stable identifier for the checklist item. */
  id: string;

  /** Human-readable action label. */
  label: string;

  /** Category used for grouping and assignment rules. */
  category: AdminChecklistCategory;
}

/**
 * Complete blueprint for the final request package of a single service.
 */
export interface RequestBlueprint {
  /** Service this blueprint belongs to. */
  serviceId: ServiceId;

  /** Title of the generated request package. */
  outputTitle: string;

  /** Human-readable summary template describing the final output to the user. */
  summaryTemplate: string;

  /** Fields that must be present in a complete submission. */
  requiredFields: BlueprintField[];

  /** Fields that may be collected but are not required. */
  optionalFields: BlueprintField[];

  /** Documents that should be attached to the request. */
  requiredDocuments: BlueprintDocument[];

  /** Default checklist presented to administrators during triage. */
  adminChecklist: AdminChecklistItem[];

  /** Next workflow stage after the blueprint is complete. */
  nextWorkflow: NextWorkflow;

  /** Default triage priority for requests of this service. */
  priority: RequestPriority;
}

/** Shape of the exported blueprint catalog. */
export type RequestBlueprintCatalog = RequestBlueprint[];
