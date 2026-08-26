import {
  SERVICE_INTELLIGENCE_MAP,
  SERVICE_INTELLIGENCE_CATALOG,
  type ServiceId,
} from "@/features/service-intelligence-catalog";
import { INTENT_DISCOVERY_CATALOG } from "@/features/intent-discovery/intentDiscoveryCatalog";
import { SERVICE_CATALOG } from "@/features/services/serviceCatalog";
import { REQUEST_BLUEPRINT_MAP } from "@/features/request-blueprint-engine";
import {
  SERVICE_LANDING_CONTENT,
  type ServiceLandingContent,
} from "@/features/services/serviceLandingContent";

export type AgentKnowledgeKind =
  | "portal"
  | "service"
  | "service_page"
  | "requirement"
  | "process_step"
  | "route"
  | "quick_action"
  | "field_help"
  | "consent"
  | "faq";

export type AgentKnowledgeRecord = {
  id: string;
  kind: AgentKnowledgeKind;
  version: "2026-08-25";
  status: "approved";
  title: string;
  body: string;
  serviceId?: ServiceId;
  route?: string;
  relatedRecordIds?: string[];
};

export type AgentAction =
  | { type: "show_service"; serviceId: ServiceId }
  | { type: "start_onboarding"; serviceId: ServiceId }
  | { type: "explain_current_context" }
  | { type: "go_home" }
  | { type: "request_human_help" }
  | { type: "stay_with_user" };

export type AgentReply = {
  text: string;
  records: string[];
  actions: AgentAction[];
};

export type AgentSession = {
  active: boolean;
  currentPath: string;
  currentServiceId?: ServiceId;
  lastIntent?: string;
  completedActions: string[];
};

const PORTAL_BOUNDARIES = [
  "NairaLeap is a service portal that helps users describe a need, choose the right service, answer relevant questions, review a request and continue to the correct next step.",
  "The chauffeur can explain portal services and navigate to known internal service pages, but it must not invent prices, approvals, providers, regulatory status, guarantees or unsupported requirements.",
  "A customer’s stated budget, property value, funding amount or asking price is not automatically a NairaLeap fee.",
  "Submission, document sharing, consent changes and other durable actions remain inside the portal’s explicit confirmation and authentication flow.",
  "When the portal does not have an approved answer, the chauffeur should say so and offer the nearest safe service or human-support path.",
] as const;

const DOCUMENT_LABELS: Record<string, string> = {
  "government-id": "government ID",
  "proof-of-address": "proof of address",
  "business-registration": "business registration",
  "tax-identification": "tax identification",
  "financial-statements": "financial statements",
  "income-evidence": "income evidence",
  "bank-statement": "bank statement",
  "property-title": "property title",
  "survey-plan": "survey plan",
  "farm-ownership": "farm ownership evidence",
  "farm-plan": "farm plan",
  "partnership-agreement": "partnership agreement",
  "vendor-license": "vendor licence",
  "product-catalog": "product catalogue",
  "ownership-proof": "ownership proof",
  "asset-photos": "asset photos",
  "valuation-report": "valuation report",
  "professional-license": "professional licence",
  certification: "certification",
  "cv-resume": "CV or résumé",
  "supporting-documents": "supporting documents",
};

function serviceRecords(serviceId: ServiceId): AgentKnowledgeRecord[] {
  const service = SERVICE_CATALOG.find((entry) => entry.id === serviceId);
  const intelligence = SERVICE_INTELLIGENCE_MAP[serviceId];
  const landing: ServiceLandingContent = SERVICE_LANDING_CONTENT[serviceId];
  if (!service || !intelligence || !landing) return [];

  const records: AgentKnowledgeRecord[] = [
    {
      id: `service.${serviceId}`,
      kind: "service",
      version: "2026-08-25",
      status: "approved",
      title: service.title,
      body: `${service.longDescription} ${landing.purpose} Audience: ${landing.audience}. Estimated completion: ${intelligence.estimatedCompletionTime}.`,
      serviceId,
      route: `/services/${serviceId}`,
    },
    {
      id: `service-page.${serviceId}`,
      kind: "service_page",
      version: "2026-08-25",
      status: "approved",
      title: `${service.title} service page`,
      body: `${landing.informationIntro} ${landing.information.join("; ")}.`,
      serviceId,
      route: `/services/${serviceId}`,
    },
    {
      id: `process.${serviceId}`,
      kind: "process_step",
      version: "2026-08-25",
      status: "approved",
      title: `${service.title} process`,
      body: landing.process.map((step, index) => `${index + 1}. ${step}`).join(" "),
      serviceId,
      route: `/services/${serviceId}`,
    },
    {
      id: `requirements.${serviceId}`,
      kind: "requirement",
      version: "2026-08-25",
      status: "approved",
      title: `${service.title} preparation`,
      body: `Prepare ${landing.information.join(", ")}. Documents may include ${intelligence.requiredDocumentTypes.map((id) => DOCUMENT_LABELS[id] ?? id).join(", ") || "no documents at the initial stage"}.`,
      serviceId,
      route: `/services/${serviceId}`,
    },
    {
      id: `boundary.${serviceId}`,
      kind: "faq",
      version: "2026-08-25",
      status: "approved",
      title: `${service.title} boundary`,
      body:
        landing.boundary ??
        `${service.title} requests are reviewed through the NairaLeap workflow. The portal does not promise an outcome before the relevant review step.`,
      serviceId,
      route: `/services/${serviceId}`,
    },
    {
      id: `route.${serviceId}`,
      kind: "route",
      version: "2026-08-25",
      status: "approved",
      title: `${service.title} route`,
      body: `Open the dedicated ${service.title} landing page before onboarding.`,
      serviceId,
      route: `/services/${serviceId}`,
    },
  ];

  const blueprint = REQUEST_BLUEPRINT_MAP[serviceId];
  if (blueprint) {
    records.push(
      {
        id: `blueprint-fields.${serviceId}`,
        kind: "field_help",
        version: "2026-08-25",
        status: "approved",
        title: `${service.title} intake fields`,
        body: `Required information: ${blueprint.requiredFields.map((field) => field.label).join(", ") || "none listed"}. Optional information: ${blueprint.optionalFields.map((field) => field.label).join(", ") || "none listed"}.`,
        serviceId,
        route: `/services/${serviceId}`,
      },
      {
        id: `blueprint-review.${serviceId}`,
        kind: "process_step",
        version: "2026-08-25",
        status: "approved",
        title: `${service.title} review contract`,
        body: `The request follows the ${blueprint.nextWorkflow} workflow with ${blueprint.priority} priority. NairaLeap may review ${blueprint.adminChecklist.map((item) => item.label.toLowerCase()).join(", ") || "the submitted context"} before the next step.`,
        serviceId,
        route: `/services/${serviceId}`,
      },
    );
  }

  if (landing.relatedServiceIds?.length) {
    records.push({
      id: `related.${serviceId}`,
      kind: "quick_action",
      version: "2026-08-25",
      status: "approved",
      title: `Related services for ${service.title}`,
      body: landing.relatedServiceIds
        .map((relatedId) => SERVICE_INTELLIGENCE_MAP[relatedId]?.title ?? relatedId)
        .join(", "),
      serviceId,
      route: `/services/${serviceId}`,
    });
  }

  return records;
}

export const AGENT_KNOWLEDGE_REGISTRY: AgentKnowledgeRecord[] = [
  {
    id: "portal.overview",
    kind: "portal",
    version: "2026-08-25",
    status: "approved",
    title: "NairaLeap portal overview",
    body: PORTAL_BOUNDARIES[0],
    route: "/",
  },
  {
    id: "portal.boundaries",
    kind: "faq",
    version: "2026-08-25",
    status: "approved",
    title: "NairaLeap safety and truthfulness boundaries",
    body: PORTAL_BOUNDARIES.slice(1).join(" "),
    route: "/",
  },
  {
    id: "portal.authentication",
    kind: "route",
    version: "2026-08-25",
    status: "approved",
    title: "Authentication and request ownership",
    body: "Visitors can review a request as guests. Authentication is required before a durable customer-owned request is submitted. A saved intake can be resumed after authentication.",
    route: "/auth",
  },
  {
    id: "portal.pricing",
    kind: "faq",
    version: "2026-08-25",
    status: "approved",
    title: "Pricing truth",
    body: "The current portal does not contain a verified NairaLeap price book. The chauffeur must say that a quote may be required after review and must not invent a numeric fee.",
    route: "/",
  },
  {
    id: "portal.human-support",
    kind: "quick_action",
    version: "2026-08-25",
    status: "approved",
    title: "Human support",
    body: "Customer Support is the safe route for an issue, feedback, existing request or human follow-up.",
    serviceId: "customer-support",
    route: "/services/customer-support",
  },
  ...SERVICE_INTELLIGENCE_CATALOG.flatMap((entry) => serviceRecords(entry.id)),
];

export const AGENT_KNOWLEDGE_MAP = Object.fromEntries(
  AGENT_KNOWLEDGE_REGISTRY.map((record) => [record.id, record]),
) as Record<string, AgentKnowledgeRecord>;

const SERVICE_ALIASES: Record<ServiceId, string[]> = {
  agriculture: ["farm", "farming", "agri", "agriculture", "crop", "livestock"],
  "property-listings": ["property", "home", "house", "land", "rent", "listing"],
  "business-funding": ["funding", "loan", "grant", "investor", "capital", "finance"],
  partnerships: ["partner", "partnership", "joint venture", "cofounder", "collaboration"],
  "vendor-marketplace": ["vendor", "marketplace", "supplier", "buy goods", "quote"],
  "distress-sales": ["distress", "urgent sale", "quick sale", "liquidation"],
  "recycling-scrap": ["recycling", "recycle", "scrap", "waste", "e-waste"],
  "business-briefs": ["brief", "market update", "report", "insight", "news"],
  "professional-services": ["lawyer", "accountant", "tax", "consultant", "professional"],
  "customer-support": ["support", "help", "issue", "complaint", "agent", "human"],
  insurance: ["insurance", "cover", "policy", "claim", "premium", "risk"],
  mortgage: ["mortgage", "home finance", "housing finance", "nhf", "fmbn", "refinance"],
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveServiceFromText(text: string): ServiceId | undefined {
  const normalized = normalize(text);
  const scored = Object.entries(SERVICE_ALIASES)
    .map(([serviceId, aliases]) => ({
      serviceId: serviceId as ServiceId,
      score: aliases.reduce(
        (score, alias) => score + (normalized.includes(alias) ? alias.length : 0),
        0,
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.serviceId;
}

export function getServiceKnowledge(serviceId: ServiceId) {
  return AGENT_KNOWLEDGE_REGISTRY.filter((record) => record.serviceId === serviceId);
}

export function getServiceTitle(serviceId: ServiceId) {
  return SERVICE_INTELLIGENCE_MAP[serviceId]?.title ?? serviceId;
}

export function answerPortalQuestion(text: string, session: AgentSession): AgentReply {
  const normalized = normalize(text);
  const serviceId = resolveServiceFromText(normalized) ?? session.currentServiceId;

  if (/price|cost|fee|premium|rate|how much/.test(normalized)) {
    return {
      text: "I can explain the request and prepare the right review path, but the portal does not have a verified price book available to me. I will not invent a fee, premium, rate or approval. Any provider terms or quote must come through the relevant review process.",
      records: ["portal.pricing", "portal.boundaries"],
      actions: serviceId ? [{ type: "show_service", serviceId }] : [{ type: "go_home" }],
    };
  }

  if (/human|person|agent|support|issue|complaint|problem/.test(normalized)) {
    return {
      text: "I’m staying with you. For a human follow-up, Customer Support is the safest route. I can take you there without losing this chauffeur session.",
      records: ["portal.human-support"],
      actions: [
        { type: "show_service", serviceId: "customer-support" },
        { type: "request_human_help" },
      ],
    };
  }

  if (/start|begin|apply|open|take me|go to|find/.test(normalized) && serviceId) {
    return {
      text: `I’ll take you to the dedicated ${getServiceTitle(serviceId)} page first. I’ll remain with you there, explain what is needed, and open onboarding only when you are ready.`,
      records: [`route.${serviceId}`, `service.${serviceId}`],
      actions: [{ type: "show_service", serviceId }],
    };
  }

  if (/what do i need|document|prepare|requirement|bring|provide/.test(normalized) && serviceId) {
    const preparation = AGENT_KNOWLEDGE_MAP[`requirements.${serviceId}`];
    const fields = AGENT_KNOWLEDGE_MAP[`blueprint-fields.${serviceId}`];
    return {
      text: `${preparation.body} ${fields?.body ?? ""}`,
      records: [preparation.id, ...(fields ? [fields.id] : [])],
      actions: [{ type: "show_service", serviceId }],
    };
  }

  if (/how|process|next|step|work|do i/.test(normalized) && serviceId) {
    const process = AGENT_KNOWLEDGE_MAP[`process.${serviceId}`];
    const review = AGENT_KNOWLEDGE_MAP[`blueprint-review.${serviceId}`];
    return {
      text: `${process.body} ${review?.body ?? ""}`,
      records: [process.id, ...(review ? [review.id] : [])],
      actions: [{ type: "show_service", serviceId }],
    };
  }

  if (/where am i|this page|current|here|context/.test(normalized)) {
    return {
      text: session.currentServiceId
        ? `You are on the ${getServiceTitle(session.currentServiceId)} path. I can explain this service, take you home, or stay with you while you complete the next step.`
        : "You are in the NairaLeap Service Portal. Tell me what you want to accomplish and I will take you to the right service page.",
      records: [
        session.currentServiceId ? `service.${session.currentServiceId}` : "portal.overview",
      ],
      actions: [{ type: "explain_current_context" }],
    };
  }

  if (serviceId) {
    const service = AGENT_KNOWLEDGE_MAP[`service.${serviceId}`];
    return {
      text: `${service.body} I can take you to its dedicated page and stay with you through the next steps.`,
      records: [service.id, `service-page.${serviceId}`],
      actions: [{ type: "show_service", serviceId }],
    };
  }

  return {
    text: "I’m with you for the whole portal journey. Tell me the outcome you want—such as finding a home, arranging insurance, seeking funding, listing an asset, finding a partner, recycling materials, or getting human support—and I’ll take you to the correct path. If I do not have an approved answer, I’ll say so rather than guess.",
    records: ["portal.overview", "portal.boundaries"],
    actions: [{ type: "stay_with_user" }, { type: "show_service", serviceId: "customer-support" }],
  };
}

export const INTENT_RECORD_COUNT = INTENT_DISCOVERY_CATALOG.length;
