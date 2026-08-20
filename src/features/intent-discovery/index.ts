/**
 * Intent Discovery Engine
 *
 * The master configuration for classifying visitor intent before service
 * onboarding. This is a pure data module — no UI, no business logic, no
 * backend calls, no routes.
 *
 * Consumer layers (routing, onboarding components, server functions) should
 * import this catalog and adapt it to their own needs.
 */

export type {
  IntentId,
  FollowUpCategory,
  IntentPriority,
  IntentDiscoveryEntry,
  IntentDiscoveryCatalog,
} from "./types";

export { INTENT_DISCOVERY_CATALOG, INTENT_DISCOVERY_MAP } from "./intentDiscoveryCatalog";

export { DEMO_DISCOVERY_QUESTIONS } from "./demoDiscoveryQuestions";
