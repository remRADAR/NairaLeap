import type { IntentDiscoveryCatalog, IntentDiscoveryEntry } from "./types";

/**
 * INTENT_DISCOVERY_CATALOG — master configuration for intent discovery.
 *
 * This is the single source of truth for visitor intent classification.
 * Consumer layers (routing, onboarding, UI components, server functions) may
 * import this catalog and adapt it to their own needs. The catalog does not
 * contain service-specific onboarding questions, AI logic, or backend code.
 */
export const INTENT_DISCOVERY_CATALOG: IntentDiscoveryCatalog = [
  {
    id: "buying",
    title: "Buying",
    description:
      "The visitor wants to purchase an asset, product, or service through the NairaLeap network.",
    recommendedServiceIds: [
      "property-listings",
      "mortgage",
      "distress-sales",
      "vendor-marketplace",
      "recycling-scrap",
    ],
    followUpCategory: "service-match",
    priority: "high",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "selling",
    title: "Selling",
    description: "The visitor wants to list, sell, or dispose of an asset, product, or material.",
    recommendedServiceIds: [
      "property-listings",
      "distress-sales",
      "vendor-marketplace",
      "recycling-scrap",
      "agriculture",
    ],
    followUpCategory: "service-match",
    priority: "high",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "partnering",
    title: "Partnering",
    description:
      "The visitor is looking for strategic partners, joint ventures, or collaboration opportunities.",
    recommendedServiceIds: ["partnerships"],
    followUpCategory: "direct-to-service",
    priority: "high",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "funding",
    title: "Funding",
    description: "The visitor needs capital, financing, grants, or investment readiness support.",
    recommendedServiceIds: ["business-funding", "mortgage"],
    followUpCategory: "direct-to-service",
    priority: "high",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "investment",
    title: "Investment",
    description:
      "The visitor wants to invest in assets, businesses, agriculture, or other opportunities.",
    recommendedServiceIds: ["agriculture", "business-funding", "property-listings", "partnerships"],
    followUpCategory: "service-match",
    priority: "medium",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "registration",
    title: "Registration",
    description:
      "The visitor wants to register as a vendor, professional, or marketplace participant.",
    recommendedServiceIds: ["vendor-marketplace", "professional-services"],
    followUpCategory: "service-match",
    priority: "medium",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "professional-services",
    title: "Professional Services",
    description: "The visitor needs to engage a vetted specialist, consultant, or advisor.",
    recommendedServiceIds: ["professional-services"],
    followUpCategory: "direct-to-service",
    priority: "medium",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "learning",
    title: "Learning",
    description:
      "The visitor wants to stay informed, receive briefs, or learn about markets and opportunities.",
    recommendedServiceIds: ["business-briefs"],
    followUpCategory: "informational",
    priority: "low",
    nextWorkflow: "auto-submit",
  },
  {
    id: "support",
    title: "Support",
    description: "The visitor needs help, has a question, or wants to speak to a real person.",
    recommendedServiceIds: ["customer-support"],
    followUpCategory: "support-queue",
    priority: "critical",
    nextWorkflow: "support-queue",
  },
  {
    id: "general-enquiry",
    title: "General Enquiry",
    description:
      "The visitor is browsing or has a broad request that does not map to a specific intent yet.",
    recommendedServiceIds: ["customer-support"],
    followUpCategory: "support-queue",
    priority: "low",
    nextWorkflow: "support-queue",
  },
];

/** Map of intent entries by id for O(1) lookup. */
export const INTENT_DISCOVERY_MAP: Record<string, IntentDiscoveryEntry> = Object.fromEntries(
  INTENT_DISCOVERY_CATALOG.map((entry) => [entry.id, entry]),
);
