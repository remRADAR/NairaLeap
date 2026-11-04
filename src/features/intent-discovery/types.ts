/**
 * Intent Discovery Engine — pure configuration types.
 *
 * This module defines reusable intent classifications used to understand what
 * a visitor wants before routing them into a detailed service onboarding flow.
 * It contains no UI, no business logic, no backend calls, and no routes.
 */

import type { ServiceId, NextWorkflow } from "@/features/service-intelligence-catalog";

/** Stable identifier for a visitor intent. */
export type IntentId =
  | "buying"
  | "selling"
  | "partnering"
  | "funding"
  | "learning"
  | "support"
  | "investment"
  | "registration"
  | "professional-services"
  | "general-enquiry";

/** Broad category used to group follow-up behaviour after intent is detected. */
export type FollowUpCategory =
  | "service-match"
  | "guided-intake"
  | "direct-to-service"
  | "support-queue"
  | "informational";

/** Priority level used to rank or order matched intents. */
export type IntentPriority = "low" | "medium" | "high" | "critical";

/**
 * Single, reusable intent definition.
 *
 * Intent entries describe what a visitor is trying to accomplish. They map to
 * recommended service IDs from the Service Intelligence Catalog and declare a
 * suggested next workflow stage for later consumption by routing or onboarding
 * layers.
 */
export interface IntentDiscoveryEntry {
  /** Stable machine-readable identifier. */
  id: IntentId;

  /** Human-readable intent label. */
  title: string;

  /** Concise explanation of what this intent means. */
  description: string;

  /** Service IDs from the Service Intelligence Catalog recommended for this intent. */
  recommendedServiceIds: ServiceId[];

  /** Category that determines the follow-up behaviour once the intent is selected. */
  followUpCategory: FollowUpCategory;

  /** Priority used for ranking or ordering recommendations. */
  priority: IntentPriority;

  /** Suggested workflow stage after the intent is discovered. */
  nextWorkflow: NextWorkflow;
}

/** Shape of the exported intent discovery catalog. */
export type IntentDiscoveryCatalog = IntentDiscoveryEntry[];
