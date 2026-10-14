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
    shortDescription: "Farm registration, inputs, and supplier connections.",
    detailedDescription:
      "Register your farm, find inputs like fertilizer, improved seeds, tractors, and extension services, or connect as an input supplier. Farmers select crop types (maize, sesame, sorghum, cocoa, etc.) and animal types (goats, cows, fish, etc.). Input suppliers register their company details and offerings.",
    onboardingCategory: "agriculture",
    estimatedCompletionTime: "2–3 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: false,
    requiresAdminReview: true,
    suggestedQuestionSet: "agriculture-intake",
    requiredDocumentTypes: [],
    outputSummaryTemplate:
      "Your Agriculture request has been prepared. NairaLeap will review your farm or input-supplier profile and match you with verified agribusiness opportunities within 1–2 business days.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "property-listings",
    title: "Property & Distress Sales",
    icon: "Building2",
    shortDescription: "List, find, rent, or buy property and land.",
    detailedDescription:
      "List a property, find a home to rent, or buy land — all in one service. Choose your role as a buyer, developer, or agent. NairaLeap handles property listings and distress sales with verified details and guided support.",
    onboardingCategory: "property",
    estimatedCompletionTime: "4–6 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: true,
    requiresAdminReview: true,
    suggestedQuestionSet: "property-intake",
    requiredDocumentTypes: ["government-id", "property-title", "survey-plan", "asset-photos"],
    outputSummaryTemplate:
      "Your Property request has been captured. NairaLeap will verify the property details, prepare visibility options and connect you with interested buyers, renters, or developers.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "business-funding",
    title: "Business Funding & Partnerships",
    icon: "Banknote",
    shortDescription: "Access funding, investment, and partnership opportunities.",
    detailedDescription:
      "Match your business with lenders, grants, investors, and partners suited to your stage, sector, and needs. Whether you are seeking funding or looking to invest and partner, NairaLeap helps you present the right information. No KYC documents required at intake.",
    onboardingCategory: "funding",
    estimatedCompletionTime: "5–7 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: false,
    requiresAdminReview: true,
    suggestedQuestionSet: "funding-intake",
    requiredDocumentTypes: [],
    outputSummaryTemplate:
      "Your Business Funding & Partnerships profile is ready for review. NairaLeap will match your requirements with suitable lenders, investors, grant programmes or partners and respond within 2 business days.",
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
  {
    id: "mortgage",
    title: "Mortgage",
    icon: "House",
    shortDescription: "Buy, build, renovate, or explore NHF / FMBN housing finance.",
    detailedDescription:
      "Three pathways — Buy a Home / Build, Renovate, or Explore NHF / FMBN Pathways. Home applicants describe their housing-finance need. Developers onboard with estate KYC (location, size, facilities, pricing, company details). Mortgage banks onboard with bank KYC (name, RC number, license type, years in operation, AOB). NairaLeap structures the request for review by a suitable verified finance partner.",
    onboardingCategory: "mortgage",
    estimatedCompletionTime: "5–7 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: false,
    requiresAdminReview: true,
    suggestedQuestionSet: "mortgage-intake",
    requiredDocumentTypes: [
      "government-id",
      "proof-of-address",
      "income-evidence",
      "bank-statement",
      "property-title",
      "valuation-report",
      "supporting-documents",
    ],
    outputSummaryTemplate:
      "Your Mortgage request has been prepared. NairaLeap will review your housing-finance need and confirm suitable next steps with a verified lender, PMB, FMBN/NHF pathway or other authorized partner where available. Eligibility, rates, terms, approval and disbursement remain subject to partner review.",
    nextWorkflow: "guided-question-engine",
  },
  {
    id: "insurance",
    title: "Insurance",
    icon: "ShieldCheck",
    shortDescription: "Compare cover, get a quote, or make a claim.",
    detailedDescription:
      "Three flows — Compare Cover (with indicative starting prices across motor, health, life, home, business, agriculture, travel, liability and microinsurance), Get a Quote, or Make a Claim. NairaLeap structures the request for review and routes it to suitable licensed insurance operators where available. Indicative prices are starting points only; final premiums are confirmed by a licensed insurer.",
    onboardingCategory: "insurance",
    estimatedCompletionTime: "4–6 minutes",
    requiresGuidedQuestions: true,
    requiresDocuments: false,
    requiresAdminReview: true,
    suggestedQuestionSet: "insurance-intake",
    requiredDocumentTypes: ["government-id", "proof-of-address", "supporting-documents"],
    outputSummaryTemplate:
      "Your Insurance request has been prepared. NairaLeap will review your protection need and confirm suitable next steps, provider options, terms and any applicable premium directly with an authorized insurance operator.",
    nextWorkflow: "guided-question-engine",
  },
];

/** Map of service entries by id for O(1) lookup. */
export const SERVICE_INTELLIGENCE_MAP: Record<string, ServiceIntelligenceEntry> =
  Object.fromEntries(SERVICE_INTELLIGENCE_CATALOG.map((entry) => [entry.id, entry]));
