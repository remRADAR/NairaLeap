/**
 * Workflow Orchestrator
 *
 * Central coordinator configuration for every guided request. Defines the
 * execution sequence between existing reusable modules. Pure data — no UI,
 * no backend, no API, no business logic, no onboarding questions, no routes.
 */

import type { WorkflowDefinition, WorkflowOrchestratorCatalog } from "./types";

export type {
  WorkflowId,
  WorkflowModule,
  CompletionCondition,
  WorkflowStep,
  WorkflowDefinition,
  WorkflowOrchestratorCatalog,
} from "./types";

/**
 * WORKFLOW_ORCHESTRATOR — master configuration for reusable workflows.
 *
 * Every guided request across the platform (including future Insurance,
 * Mortgage, and all service onboarding flows) is coordinated through one of
 * these workflow definitions.
 */
export const WORKFLOW_ORCHESTRATOR: WorkflowOrchestratorCatalog = [
  {
    workflowId: "guided-service-request",
    startingModule: "intent-discovery",
    orderedSteps: [
      {
        id: "discover-intent",
        module: "intent-discovery",
        label: "Discover Intent",
        required: true,
      },
      {
        id: "resolve-service",
        module: "service-intelligence",
        label: "Resolve Service",
        required: true,
      },
      {
        id: "load-blueprint",
        module: "request-blueprint",
        label: "Load Blueprint",
        required: true,
      },
      {
        id: "collect-answers",
        module: "question-engine",
        label: "Guided Questions",
        required: true,
      },
      {
        id: "review-request",
        module: "review",
        label: "Review",
        required: true,
      },
      {
        id: "submit-request",
        module: "submission",
        label: "Submit",
        required: true,
      },
      {
        id: "admin-processing",
        module: "admin-processing",
        label: "Admin Processing",
        required: false,
      },
    ],
    completionCondition: "user-submitted",
    nextWorkflow: "admin-review",
    supportsResume: true,
    requiresAuthentication: true,
    requiresAdminReview: true,
  },
  {
    workflowId: "support-request",
    startingModule: "intent-discovery",
    orderedSteps: [
      {
        id: "discover-intent",
        module: "intent-discovery",
        label: "Discover Intent",
        required: true,
      },
      {
        id: "collect-details",
        module: "question-engine",
        label: "Support Details",
        required: true,
      },
      {
        id: "submit-ticket",
        module: "submission",
        label: "Create Ticket",
        required: true,
      },
    ],
    completionCondition: "support-ticket-created",
    nextWorkflow: "support-queue",
    supportsResume: false,
    requiresAuthentication: false,
    requiresAdminReview: false,
  },
  {
    workflowId: "informational-subscription",
    startingModule: "intent-discovery",
    orderedSteps: [
      {
        id: "discover-intent",
        module: "intent-discovery",
        label: "Discover Intent",
        required: true,
      },
      {
        id: "capture-preferences",
        module: "question-engine",
        label: "Capture Preferences",
        required: true,
      },
      {
        id: "auto-submit",
        module: "submission",
        label: "Confirm Subscription",
        required: true,
      },
    ],
    completionCondition: "subscription-confirmed",
    nextWorkflow: "auto-submit",
    supportsResume: false,
    requiresAuthentication: false,
    requiresAdminReview: false,
  },
];

/** Map of workflow definitions by id for O(1) lookup. */
export const WORKFLOW_ORCHESTRATOR_MAP: Record<string, WorkflowDefinition> = Object.fromEntries(
  WORKFLOW_ORCHESTRATOR.map((workflow) => [workflow.workflowId, workflow]),
);
