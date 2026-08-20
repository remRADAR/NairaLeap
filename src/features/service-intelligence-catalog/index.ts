/**
 * Service Intelligence Catalog
 *
 * The master configuration for every NairaLeap service. This is a pure data
 * module — no UI, no business logic, no backend calls, no routes.
 *
 * Consumer layers (components, server functions, workflows) should import this
 * catalog and adapt it to their own needs.
 */

import type { ServiceIntelligenceCatalog, ServiceIntelligenceEntry } from "./types";

export type {
  ServiceId,
  OnboardingCategory,
  DocumentTypeId,
  QuestionSetId,
  NextWorkflow,
  IconName,
  ServiceIntelligenceEntry,
  ServiceIntelligenceCatalog,
} from "./types";

export const SERVICE_INTELLIGENCE_CATALOG: ServiceIntelligenceCatalog = [
  {
    id: "agriculture",
    title: "Agriculture",
    icon: "Sprout",
    shortDescription: "Farming inputs, produce and agri opportunities.",
    detailedDescription:
      "Helping farmers, investors and agribusinesses connect with the right opportunities across the value chain — from inputs and financing to buyers and training.",
    onboardingCategory: "agriculture",
    estimatedCompletionTime: "3–5 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "agriculture-intake",
    requiredDocumentTypes: ["government-id", "farm-ownership", "farm-plan"],
    outputSummaryTemplate:
      "Your Agriculture request has been prepared. NairaLeap will review your farm profile, inputs or buyer needs and match you with verified agribusiness opportunities within 1–2 business days.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "property-listings",
    title: "Property Listings",
    icon: "Building2",
    shortDescription: "Homes, land and commercial spaces across Nigeria.",
    detailedDescription:
      "Discover, list and enquire about residential, commercial and land assets with verified details and guided support from NairaLeap property advisors.",
    onboardingCategory: "property",
    estimatedCompletionTime: "4–6 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "property-intake",
    requiredDocumentTypes: ["government-id", "property-title", "survey-plan", "asset-photos"],
    outputSummaryTemplate:
      "Your Property Listing request has been captured. NairaLeap will verify the property details, prepare visibility options and connect you with interested buyers or renters.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "business-funding",
    title: "Business Funding",
    icon: "Banknote",
    shortDescription: "Access working capital and growth financing.",
    detailedDescription:
      "Match your business with lenders, grants and investors suited to your stage, sector and funding needs. The NairaLeap guide helps you present the right information.",
    onboardingCategory: "funding",
    estimatedCompletionTime: "5–7 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "funding-intake",
    requiredDocumentTypes: [
      "government-id",
      "business-registration",
      "tax-identification",
      "financial-statements",
      "bank-statement",
    ],
    outputSummaryTemplate:
      "Your Business Funding profile is ready for review. NairaLeap will match your requirements with suitable lenders, investors or grant programmes and respond within 2 business days.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "partnerships",
    title: "Partnerships",
    icon: "Handshake",
    shortDescription: "Connect with vetted partners and collaborators.",
    detailedDescription:
      "Explore strategic partnerships, joint ventures, co-founders and distribution relationships with trusted counterparts across the NairaLeap network.",
    onboardingCategory: "partnerships",
    estimatedCompletionTime: "4–6 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "partnerships-intake",
    requiredDocumentTypes: [
      "government-id",
      "business-registration",
      "partnership-agreement",
      "supporting-documents",
    ],
    outputSummaryTemplate:
      "Your Partnership request has been structured. NairaLeap will review your proposal and introduce compatible, vetted partners where there is mutual fit.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "vendor-marketplace",
    title: "Vendor Marketplace",
    icon: "Store",
    shortDescription: "Trusted vendors for goods and services.",
    detailedDescription:
      "Source products and services, register as a vendor, or request quotes from a marketplace of verified businesses with transparent reviews and terms.",
    onboardingCategory: "marketplace",
    estimatedCompletionTime: "3–5 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "vendor-marketplace-intake",
    requiredDocumentTypes: [
      "government-id",
      "vendor-license",
      "product-catalog",
      "business-registration",
    ],
    outputSummaryTemplate:
      "Your Vendor Marketplace request has been recorded. NairaLeap will match you with verified vendors or evaluate your vendor registration and follow up within 1–2 business days.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "distress-sales",
    title: "Distress Sales",
    icon: "Tag",
    shortDescription: "Time-sensitive listings at reduced prices.",
    detailedDescription:
      "Browse or submit urgent, time-sensitive listings across property, vehicles, equipment and inventory. NairaLeap verifies urgency and helps you move fast.",
    onboardingCategory: "distressed-sales",
    estimatedCompletionTime: "3–5 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "distress-sales-intake",
    requiredDocumentTypes: ["government-id", "ownership-proof", "asset-photos", "valuation-report"],
    outputSummaryTemplate:
      "Your Distress Sale request has been documented. NairaLeap will verify the urgency, pricing and ownership details, then publish the listing to matched buyers.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "recycling-scrap",
    title: "Recycling & Scrap",
    icon: "Recycle",
    shortDescription: "Sell, buy and recycle materials responsibly.",
    detailedDescription:
      "Connect with recyclers, scrap dealers and buyers to move materials responsibly and profitably across metal, plastic, e-waste and bulk waste categories.",
    onboardingCategory: "recycling",
    estimatedCompletionTime: "3–5 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "recycling-scrap-intake",
    requiredDocumentTypes: ["government-id", "ownership-proof", "asset-photos"],
    outputSummaryTemplate:
      "Your Recycling & Scrap request has been prepared. NairaLeap will connect you with verified recyclers or buyers and arrange pickup or inspection details.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "business-briefs",
    title: "Business Briefs",
    icon: "Newspaper",
    shortDescription: "Concise updates on markets and opportunities.",
    detailedDescription:
      "Stay informed with short, actionable briefs on markets, sectors and emerging opportunities. Subscribe to regular briefs or request a custom sector report.",
    onboardingCategory: "information",
    estimatedCompletionTime: "1–2 minutes",
    requiresGuidedQuestions: false,
    requiresDocuments: false,
    requiresAdminReview: false,
    suggestedQuestionSet: null,
    requiredDocumentTypes: [],
    outputSummaryTemplate:
      "Your Business Briefs preference has been saved. You will start receiving the selected briefs, and any custom sector report requests will be prepared by the research team.",
    nextWorkflow: "auto-submit",
  },
  {
    id: "professional-services",
    title: "Professional Services",
    icon: "Briefcase",
    shortDescription: "Expert advisors, consultants and specialists.",
    detailedDescription:
      "Engage vetted professionals for legal, financial, tax, strategy, compliance and specialist advisory needs through a guided matching process.",
    onboardingCategory: "professional-services",
    estimatedCompletionTime: "4–6 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "professional-services-intake",
    requiredDocumentTypes: ["government-id", "professional-license", "certification", "cv-resume"],
    outputSummaryTemplate:
      "Your Professional Services request has been prepared. NairaLeap will match you with a verified specialist and confirm availability within 1 business day.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "customer-support",
    title: "Customer Support",
    icon: "LifeBuoy",
    shortDescription: "Talk to a real person, quickly.",
    detailedDescription:
      "Reach a human on the NairaLeap support team for questions, feedback, help with an existing request or general guidance through the platform.",
    onboardingCategory: "support",
    estimatedCompletionTime: "2–3 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: false,
    requiresAdminReview: true,
    suggestedQuestionSet: "support-intake",
    requiredDocumentTypes: [],
    outputSummaryTemplate:
      "Your support request has been logged. A NairaLeap support agent will review it and reach out to you directly with the next steps.",
    nextWorkflow: "support-queue",
  },
];

/** Map of service entries by id for O(1) lookup. */
export const SERVICE_INTELLIGENCE_MAP: Record<string, ServiceIntelligenceEntry> =
  Object.fromEntries(SERVICE_INTELLIGENCE_CATALOG.map((entry) => [entry.id, entry]));
