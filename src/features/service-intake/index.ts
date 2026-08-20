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
};

const FIELD_HELPERS: Record<string, string> = {
  contactPhone: "Use a number where the NairaLeap team can reach you.",
  contactEmail: "We will use this for confirmation and follow-up.",
  budgetRange: "Tell us what you plan to spend; this is not a NairaLeap service fee.",
  priceExpectation: "This is the amount you expect for the asset or material, not a portal fee.",
  fundingAmount: "Enter the amount you want to raise or access.",
  askingPrice: "Enter the price you are asking for the asset.",
  additionalNotes: "Add anything important that the earlier questions did not cover.",
};

function questionTypeForField(type: BlueprintFieldType): Question["type"] {
  return type;
}

function fallbackChoices(field: BlueprintField): QuestionChoice[] {
  return CHOICES[field.key] ?? [{ value: "not-sure", label: "I’m not sure yet" }];
}

function fieldToQuestion(field: BlueprintField): Question {
  const base = {
    id: field.key,
    title: field.label,
    helper: field.description ?? FIELD_HELPERS[field.key],
    required: field.required,
  };

  switch (questionTypeForField(field.type)) {
    case "single-choice":
      return { ...base, type: "single-choice", choices: fallbackChoices(field) };
    case "multiple-choice":
      return {
        ...base,
        type: "multiple-choice",
        choices: fallbackChoices(field),
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
    [...blueprint.requiredFields, ...blueprint.optionalFields].map(fieldToQuestion),
  ]),
) as Record<ServiceId, Question[]>;

export function getServiceQuestionSet(serviceId: ServiceId): Question[] {
  return SERVICE_QUESTION_SETS[serviceId] ?? [];
}

function hasAnswer(value: AnswersState[string] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return !Number.isNaN(value);
  return typeof value === "string" ? value.trim().length > 0 : false;
}

function formatAnswer(field: BlueprintField, value: AnswersState[string]): string {
  if (Array.isArray(value)) {
    const choices = CHOICES[field.key] ?? [];
    return value
      .map((item) => choices.find((choice) => choice.value === item)?.label ?? item)
      .join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-NG");
  if (typeof value !== "string") return "—";
  const choice = CHOICES[field.key]?.find((item) => item.value === value);
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
      value: formatAnswer(field, answers[field.key]),
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
