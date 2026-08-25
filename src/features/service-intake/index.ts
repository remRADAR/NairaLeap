import type { AnswersState, Question, QuestionChoice } from "@/features/question-engine";
import {
  REQUEST_BLUEPRINT_MAP,
  type BlueprintField,
  type BlueprintFieldType,
} from "@/features/request-blueprint-engine";
import { SERVICE_INTELLIGENCE_MAP, type ServiceId } from "@/features/service-intelligence-catalog";

export type PriceMode = "fixed" | "estimate" | "quote" | "no-charge";

export interface ServicePriceRule {
  mode: PriceMode;
  label: string;
  amount?: string;
  detail: string;
}

export interface RundownAnswer {
  key: string;
  label: string;
  value: string;
  required: boolean;
}

export interface ServiceRundown {
  serviceId: ServiceId;
  serviceTitle: string;
  outputTitle: string;
  summary: string;
  answers: RundownAnswer[];
  missingRequiredFields: string[];
  requiredDocuments: string[];
  recommendedDocuments: string[];
  estimatedCompletionTime: string;
  nextWorkflow: string;
  priority: string;
  price: ServicePriceRule;
}

/**
 * Commercial truthfulness boundary: no price book has been supplied yet, so
 * every service starts in quote mode. A numeric fee must only be added here
 * after a verified business rule exists.
 */
export const SERVICE_PRICING_MAP = {
  agriculture: {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "The NairaLeap team will confirm any service or matching fee after reviewing your request and documents.",
  },
  "property-listings": {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Listing, verification, and visibility costs are confirmed after the property details are reviewed.",
  },
  "business-funding": {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Any advisory or matching fee is confirmed after eligibility and funding requirements are reviewed.",
  },
  partnerships: {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Any partnership facilitation fee is confirmed after the proposal and fit requirements are reviewed.",
  },
  "vendor-marketplace": {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Any marketplace or quote-request fee is confirmed after the request or vendor profile is reviewed.",
  },
  "distress-sales": {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Any listing or facilitation fee is confirmed after urgency, ownership, and pricing are verified.",
  },
  "recycling-scrap": {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Any inspection, logistics, or facilitation fee is confirmed after the material and location are reviewed.",
  },
  "business-briefs": {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Subscription or custom-report pricing is not configured in the current portal and will be confirmed by the team.",
  },
  "professional-services": {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "The specialist’s availability and professional fee are confirmed after the service need is reviewed.",
  },
  "customer-support": {
    mode: "no-charge",
    label: "No portal fee configured",
    detail: "Support requests do not display a numeric fee in the current portal.",
  },
  insurance: {
    mode: "quote",
    label: "Quote required after review",
    detail:
      "Insurance eligibility, terms, exclusions and premium are confirmed by an authorized insurance operator after reviewing the request.",
  },
  mortgage: {
    mode: "quote",
    label: "Terms required after partner review",
    detail:
      "Mortgage eligibility, rates, tenure, repayment terms and approval are confirmed by a verified lender, PMB, FMBN/NHF pathway or other authorized partner after reviewing the request.",
  },
} satisfies Record<ServiceId, ServicePriceRule>;

const CHOICES: Record<string, QuestionChoice[]> = {
  serviceType: [
    { value: "farm-registration", label: "Register a farm" },
    { value: "farm-inputs", label: "Find farm inputs" },
    { value: "buyers", label: "Access buyers or markets" },
    { value: "training", label: "Request training or support" },
    { value: "other", label: "Something else in agriculture" },
  ],
  transactionType: [
    { value: "sell", label: "Sell a property" },
    { value: "rent", label: "Rent out a property" },
    { value: "buy", label: "Find a property to buy" },
    { value: "rent-search", label: "Find a property to rent" },
  ],
  propertyType: [
    { value: "land", label: "Land" },
    { value: "residential", label: "Residential property" },
    { value: "commercial", label: "Commercial property" },
    { value: "industrial", label: "Industrial property" },
    { value: "other", label: "Other property type" },
  ],
  businessStage: [
    { value: "idea", label: "Idea or pre-launch" },
    { value: "early-stage", label: "Early-stage business" },
    { value: "growing", label: "Growing business" },
    { value: "established", label: "Established business" },
  ],
  fundingType: [
    { value: "loan", label: "Loan or working capital" },
    { value: "grant", label: "Grant" },
    { value: "investment", label: "Investor or equity funding" },
    { value: "not-sure", label: "Not sure yet" },
  ],
  partnershipType: [
    { value: "joint-venture", label: "Joint venture" },
    { value: "distribution", label: "Distribution or sales" },
    { value: "strategic", label: "Strategic partnership" },
    { value: "co-founder", label: "Co-founder or collaboration" },
  ],
  marketplaceRole: [
    { value: "find-vendor", label: "Find a vendor" },
    { value: "request-quote", label: "Request a quote" },
    { value: "register-vendor", label: "Register as a vendor" },
  ],
  assetType: [
    { value: "property", label: "Property" },
    { value: "vehicle", label: "Vehicle" },
    { value: "equipment", label: "Equipment" },
    { value: "inventory", label: "Inventory or goods" },
    { value: "other", label: "Other asset" },
  ],
  materialType: [
    { value: "metal", label: "Metal or steel" },
    { value: "plastic", label: "Plastic" },
    { value: "e-waste", label: "E-waste" },
    { value: "paper", label: "Paper or cardboard" },
    { value: "other", label: "Other material" },
  ],
  transactionRole: [
    { value: "sell-material", label: "Sell or dispose of material" },
    { value: "buy-material", label: "Buy or source material" },
    { value: "find-recycler", label: "Find a recycling partner" },
  ],
  briefType: [
    { value: "market-update", label: "Market updates" },
    { value: "sector-brief", label: "Sector briefs" },
    { value: "opportunities", label: "Opportunities and calls" },
    { value: "custom-report", label: "Custom report" },
  ],
  frequency: [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "as-needed", label: "Only when relevant" },
  ],
  serviceCategory: [
    { value: "legal", label: "Legal" },
    { value: "accounting-tax", label: "Accounting or tax" },
    { value: "strategy", label: "Strategy or consulting" },
    { value: "compliance", label: "Compliance" },
    { value: "other", label: "Other professional service" },
  ],
  urgency: [
    { value: "urgent", label: "Urgent" },
    { value: "this-month", label: "Within this month" },
    { value: "planning", label: "Planning ahead" },
  ],
  issueType: [
    { value: "account", label: "Account or sign-in" },
    { value: "existing-request", label: "Existing request" },
    { value: "service-question", label: "Service question" },
    { value: "feedback", label: "Feedback" },
    { value: "other", label: "Other issue" },
  ],
  preferredContact: [
    { value: "phone", label: "Phone call" },
    { value: "email", label: "Email" },
    { value: "whatsapp", label: "WhatsApp, if available" },
  ],
  agentPreference: [
    { value: "yes", label: "Yes, help me prepare it" },
    { value: "no", label: "No, I can prepare it" },
  ],
  sectors: [
    { value: "agriculture", label: "Agriculture" },
    { value: "property", label: "Property" },
    { value: "finance", label: "Finance and funding" },
    { value: "marketplace", label: "Marketplace" },
    { value: "technology", label: "Technology" },
    { value: "general-business", label: "General business" },
  ],
  insuranceRequestType: [
    { value: "new-cover", label: "Get new cover" },
    { value: "compare-options", label: "Compare cover options" },
    { value: "claim", label: "Make a claim" },
    { value: "renew-or-change", label: "Renew or change a policy" },
    { value: "verify-or-support", label: "Verify a policy or get policy support" },
  ],
  insuranceCategory: [
    { value: "motor-auto", label: "Motor and auto" },
    { value: "health-medical", label: "Health and medical" },
    { value: "life-family", label: "Life and family" },
    { value: "home-property", label: "Home and property" },
    { value: "business-commercial", label: "Business and commercial" },
    { value: "agriculture", label: "Agriculture" },
    { value: "travel", label: "Travel" },
    { value: "marine-cargo-aviation", label: "Marine, cargo and aviation" },
    { value: "liability-compulsory", label: "Liability and compulsory cover" },
    { value: "micro-takaful-inclusion", label: "Microinsurance, Takaful and inclusion" },
  ],
  providerPreference: [
    { value: "no-preference", label: "No preference" },
    { value: "conventional", label: "Conventional insurance" },
    { value: "takaful", label: "Takaful / cooperative model" },
    { value: "microinsurance", label: "Microinsurance / lower-cost cover" },
  ],
  mortgageRequestType: [
    { value: "home-purchase", label: "Buy a completed home" },
    { value: "land-and-build", label: "Buy land and build" },
    { value: "construction", label: "Build on land I already have" },
    { value: "renovation", label: "Renovate or improve a home" },
    { value: "rent-to-own", label: "Explore rent-to-own or affordable housing" },
    { value: "nhf-fmbn", label: "Explore NHF / FMBN housing finance" },
    { value: "diaspora", label: "Diaspora mortgage enquiry" },
    { value: "refinance", label: "Refinance or transfer an existing mortgage" },
    { value: "restructure", label: "Discuss repayment support or restructuring" },
    { value: "developer-finance", label: "Estate development or developer finance" },
    { value: "mortgage-support", label: "Mortgage readiness, documents or support" },
  ],
  applicantProfile: [
    { value: "individual", label: "Individual applicant" },
    { value: "joint-applicant", label: "Joint or family applicants" },
    { value: "self-employed", label: "Self-employed applicant" },
    { value: "business", label: "Business or organisation" },
    { value: "developer", label: "Property developer or cooperative" },
    { value: "diaspora", label: "Nigerian living outside Nigeria" },
  ],
  propertyStage: [
    { value: "searching", label: "Still searching for a property" },
    { value: "identified", label: "Property identified, not yet purchased" },
    { value: "owned-land", label: "I own land and want to build" },
    { value: "under-construction", label: "Construction has started" },
    { value: "existing-home", label: "Existing home needs renovation" },
    { value: "existing-mortgage", label: "I already have a mortgage" },
  ],
  incomeSource: [
    { value: "salary", label: "Salary or formal employment" },
    { value: "self-employed", label: "Self-employed or professional income" },
    { value: "business-income", label: "Business income" },
    { value: "mixed-income", label: "Mixed income sources" },
    { value: "diaspora-income", label: "Income earned outside Nigeria" },
    { value: "not-sure", label: "I need help understanding the requirements" },
  ],
  mortgagePropertyType: [
    { value: "apartment", label: "Apartment or flat" },
    { value: "house", label: "House" },
    { value: "land", label: "Land or plot" },
    { value: "commercial", label: "Commercial or mixed-use property" },
    { value: "estate-unit", label: "Estate or developer unit" },
    { value: "not-sure", label: "Not sure yet" },
  ],
  incomeRange: [
    { value: "not-disclosed", label: "Prefer not to say yet" },
    { value: "under-250k", label: "Under ₦250,000 monthly" },
    { value: "250k-500k", label: "₦250,000–₦500,000 monthly" },
    { value: "500k-1m", label: "₦500,000–₦1,000,000 monthly" },
    { value: "over-1m", label: "Over ₦1,000,000 monthly" },
  ],
  timeline: [
    { value: "immediate", label: "As soon as possible" },
    { value: "three-months", label: "Within 3 months" },
    { value: "six-months", label: "Within 6 months" },
    { value: "planning", label: "Planning ahead" },
  ],
  mortgageStatus: [
    { value: "none", label: "No existing mortgage" },
    { value: "active", label: "Active mortgage" },
    { value: "arrears", label: "Repayment difficulty or arrears" },
    { value: "paid-off", label: "Mortgage paid off; need records or next steps" },
    { value: "not-sure", label: "Not sure which support I need" },
  ],
  nhfPreference: [
    { value: "yes", label: "Yes, please include NHF / FMBN where relevant" },
    { value: "no", label: "No, explore other pathways" },
    { value: "not-sure", label: "I need guidance" },
  ],
};

const FIELD_HELPERS: Record<string, string> = {
  contactPhone: "Use a number where the NairaLeap team can reach you.",
  contactEmail: "We will use this for confirmation and follow-up.",
  budgetRange: "Tell us what you plan to spend; this is not a NairaLeap service fee.",
  priceExpectation: "This is the amount you expect for the asset or material, not a portal fee.",
  fundingAmount: "Enter the amount you want to raise or access.",
  askingPrice: "Enter the price you are asking for the asset.",
  additionalNotes: "Add anything important that the earlier questions did not cover.",
  insuranceNeed:
    "Describe what you want protected, the concern you are trying to address, and any deadline.",
  coverageAmount: "Optional estimate of the value or protection amount you want to consider.",
  existingPolicyNumber: "Add this only if you already have a policy with an insurer or broker.",
  incidentDate: "Add this only if you are reporting a claim or incident.",
  mortgageNeed:
    "Tell us what you want to finance, where the property or project is located, and what kind of help you want next.",
  requestedAmount: "Optional amount you would like to explore; this is not an approval or offer.",
  propertyValue: "Optional property or project value, if known; final valuation is partner-led.",
  incomeRange:
    "A broad range helps route your request; exact affordability is assessed by the selected partner.",
  mortgageStatus: "Choose the option closest to your current mortgage position.",
  nhfPreference: "This indicates a routing preference, not confirmation of NHF eligibility.",
};

function questionTypeForField(type: BlueprintFieldType): Question["type"] {
  return type;
}

const SERVICE_CHOICE_ALIASES: Partial<Record<ServiceId, Record<string, string>>> = {
  mortgage: { propertyType: "mortgagePropertyType" },
};

function choiceKeyForField(field: BlueprintField, serviceId?: ServiceId): string {
  return SERVICE_CHOICE_ALIASES[serviceId ?? "agriculture"]?.[field.key] ?? field.key;
}

function fallbackChoices(field: BlueprintField, serviceId?: ServiceId): QuestionChoice[] {
  return (
    CHOICES[choiceKeyForField(field, serviceId)] ?? [
      { value: "not-sure", label: "I’m not sure yet" },
    ]
  );
}

function fieldToQuestion(field: BlueprintField, serviceId: ServiceId): Question {
  const base = {
    id: field.key,
    title: field.label,
    helper: field.description ?? FIELD_HELPERS[field.key],
    required: field.required,
  };

  switch (questionTypeForField(field.type)) {
    case "single-choice":
      return { ...base, type: "single-choice", choices: fallbackChoices(field, serviceId) };
    case "multiple-choice":
      return {
        ...base,
        type: "multiple-choice",
        choices: fallbackChoices(field, serviceId),
        minSelections: field.required ? 1 : 0,
      };
    case "yes-no":
      return { ...base, type: "yes-no" };
    case "number":
      return { ...base, type: "number", placeholder: "Enter a number" };
    case "date":
      return { ...base, type: "date" };
    case "email":
      return { ...base, type: "email", placeholder: "you@example.com" };
    case "phone":
      return { ...base, type: "phone", placeholder: "+234 800 000 0000" };
    case "location":
      return { ...base, type: "location", placeholder: "City, State" };
    case "currency":
      return { ...base, type: "currency", placeholder: "e.g. ₦500,000" };
    case "short-text":
      return { ...base, type: "short-text", placeholder: "Type your answer" };
    case "long-text":
      return { ...base, type: "long-text", placeholder: "Tell us a little more" };
    default:
      return { ...base, type: "short-text", placeholder: "Type your answer" };
  }
}

export const SERVICE_QUESTION_SETS: Record<ServiceId, Question[]> = Object.fromEntries(
  Object.entries(REQUEST_BLUEPRINT_MAP).map(([serviceId, blueprint]) => [
    serviceId,
    [...blueprint.requiredFields, ...blueprint.optionalFields].map((field) =>
      fieldToQuestion(field, serviceId as ServiceId),
    ),
  ]),
) as Record<ServiceId, Question[]>;

export function getServiceQuestionSet(serviceId: ServiceId): Question[] {
  return SERVICE_QUESTION_SETS[serviceId] ?? [];
}

function hasAnswer(value: AnswersState[string] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  return typeof value === "string" ? value.trim().length > 0 : false;
}

function formatAnswer(
  field: BlueprintField,
  value: AnswersState[string],
  serviceId: ServiceId,
): string {
  if (Array.isArray(value)) {
    const choices = CHOICES[choiceKeyForField(field, serviceId)] ?? [];
    return value
      .map((item) => choices.find((choice) => choice.value === item)?.label ?? item)
      .join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number")
    return Number.isFinite(value) ? value.toLocaleString("en-NG") : "—";
  if (typeof value !== "string") return "—";
  const choice = CHOICES[choiceKeyForField(field, serviceId)]?.find((item) => item.value === value);
  return choice?.label ?? value;
}

export function buildServiceRundown(serviceId: ServiceId, answers: AnswersState): ServiceRundown {
  const blueprint = REQUEST_BLUEPRINT_MAP[serviceId];
  const intelligence = SERVICE_INTELLIGENCE_MAP[serviceId];
  const fields = [...blueprint.requiredFields, ...blueprint.optionalFields];
  const answerRows = fields
    .filter((field) => hasAnswer(answers[field.key]))
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: formatAnswer(field, answers[field.key], serviceId),
      required: field.required,
    }));

  return {
    serviceId,
    serviceTitle: intelligence.title,
    outputTitle: blueprint.outputTitle,
    summary: blueprint.summaryTemplate,
    answers: answerRows,
    missingRequiredFields: blueprint.requiredFields
      .filter((field) => !hasAnswer(answers[field.key]))
      .map((field) => field.label),
    requiredDocuments: blueprint.requiredDocuments
      .filter((document) => document.required)
      .map((document) => document.documentTypeId),
    recommendedDocuments: blueprint.requiredDocuments
      .filter((document) => !document.required)
      .map((document) => document.documentTypeId),
    estimatedCompletionTime: intelligence.estimatedCompletionTime,
    nextWorkflow: blueprint.nextWorkflow,
    priority: blueprint.priority,
    price: SERVICE_PRICING_MAP[serviceId],
  };
}
