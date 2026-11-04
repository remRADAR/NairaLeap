/**
 * Workflow Orchestrator — pure configuration types.
 *
 * Defines the execution sequence between the existing reusable modules
 * (Intent Discovery → Service Intelligence → Request Blueprint →
 * Question Engine → Review → Submission → Admin Processing).
 *
 * This module contains no UI, no backend, no API calls, no business logic,
 * no onboarding questions, and no routes — only reusable workflow
 * configuration referenced by higher layers.
 */

import type { NextWorkflow } from "@/features/service-intelligence-catalog";

/** Stable identifier for a workflow definition. */
export type WorkflowId =
  | "guided-service-request"
  | "support-request"
  | "informational-subscription";

/**
 * Modules that participate in the orchestrated sequence.
 *
 * These identifiers reference the existing reusable modules in the project.
 * They are intentionally string literals so the orchestrator stays a pure
 * configuration module without importing runtime code.
 */
export type WorkflowModule =
  | "intent-discovery"
  | "service-intelligence"
  | "request-blueprint"
  | "question-engine"
  | "review"
  | "submission"
  | "admin-processing";

/**
 * Condition that marks a workflow as complete.
 *
 * Consumer layers interpret these conditions at runtime; the orchestrator
 * only declares them.
 */
export type CompletionCondition =
  | "all-required-fields-collected"
  | "blueprint-fields-and-documents-complete"
  | "user-submitted"
  | "admin-approved"
  | "support-ticket-created"
  | "subscription-confirmed";

/**
 * Single step in a workflow's ordered sequence.
 */
export interface WorkflowStep {
  /** Stable step identifier within the workflow. */
  id: string;

  /** Module responsible for executing this step. */
  module: WorkflowModule;

  /** Human-readable label for progress trackers and admin surfaces. */
  label: string;

  /** Whether the step must complete before the workflow can finish. */
  required: boolean;
}

/**
 * Reusable workflow definition.
 */
export interface WorkflowDefinition {
  /** Stable machine-readable identifier. */
  workflowId: WorkflowId;

  /** Module that begins the workflow. */
  startingModule: WorkflowModule;

  /** Ordered execution sequence between reusable modules. */
  orderedSteps: WorkflowStep[];

  /** Condition that determines when the workflow is complete. */
  completionCondition: CompletionCondition;

  /** Next workflow stage after this workflow completes. */
  nextWorkflow: NextWorkflow;

  /** Whether the workflow supports pausing and resuming later. */
  supportsResume: boolean;

  /** Whether an authenticated session is required to run this workflow. */
  requiresAuthentication: boolean;

  /** Whether the workflow output requires manual admin review. */
  requiresAdminReview: boolean;
}

/** Shape of the exported orchestrator catalog. */
export type WorkflowOrchestratorCatalog = WorkflowDefinition[];
