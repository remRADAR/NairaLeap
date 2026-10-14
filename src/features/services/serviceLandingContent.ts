import { SERVICE_CATALOG, type ServiceId, type ServiceDefinition } from "./serviceCatalog";

export interface ServiceLandingContent {
  audience: string;
  purpose: string;
  informationIntro: string;
  information: string[];
  process: string[];
  afterSubmission: string;
  boundary?: string;
  relatedServiceIds?: ServiceId[];
}

export const SERVICE_LANDING_CONTENT: Record<ServiceId, ServiceLandingContent> = {
  agriculture: {
    audience: "Farmers and input suppliers across Nigeria",
    purpose:
      "Use this service to register your farm, find farm inputs, or connect as an input supplier — fertilizers, improved seeds, tractors, extension services, laborers, and chemical suppliers.",
    informationIntro:
      "You will provide the practical details that help NairaLeap understand your agricultural role and needs.",
    information: [
      "Your contact details and role (farmer or input supplier)",
      "Farm location and crop or animal types",
      "Inputs, equipment, or services you need or supply",
      "Timeline and budget context",
    ],
    process: [
      "Choose whether you are a farmer or an input supplier",
      "Answer a short set of practical questions on one page",
      "Review the structured Agriculture rundown",
      "Submit for NairaLeap review and follow-up",
    ],
    afterSubmission:
      "NairaLeap reviews the request context and may follow up about missing information, suitable matches, or next steps. Submission does not guarantee a transaction or outcome.",
    relatedServiceIds: ["vendor-marketplace", "business-funding", "insurance"],
  },
  "property-listings": {
    audience: "Buyers, developers, agents, property owners and renters",
    purpose:
      "List a property, find a home to rent, or buy land — all in one place. NairaLeap helps you connect with the right people for property and distress sales.",
    informationIntro: "Prepare the property and contact information relevant to your enquiry.",
    information: [
      "Your role: buyer, developer, or agent",
      "Property type, location and intended action (sell, rent, buy, or rent-search)",
      "Property features, condition and supporting details",
      "Preferred viewing, buyer or renter requirements",
    ],
    process: [
      "Choose your role: buyer, developer, or agent",
      "Tell us whether you are listing, buying, renting, or searching",
      "Share the property context and what you need next",
      "Review and submit your property request",
    ],
    afterSubmission:
      "The property enquiry is reviewed with any relevant ownership, inspection or valuation context. NairaLeap may request clarification before follow-up.",
    boundary:
      "Property details, ownership documents, inspections and valuation remain subject to review where applicable.",
    relatedServiceIds: ["mortgage", "professional-services", "business-funding"],
  },
  "business-funding": {
    audience: "Businesses, founders, cooperatives, investors and growth-stage operators",
    purpose:
      "Describe a business funding, grant, investment, working-capital or partnership need. NairaLeap helps connect both clients seeking funding and investors looking to fund or partner.",
    informationIntro:
      "The onboarding focuses on your business context and the type of support you are seeking. No KYC documents are required at this stage.",
    information: [
      "Business stage, sector and location",
      "Funding or partnership purpose",
      "Requested amount and timing context",
      "Business and financial context",
    ],
    process: [
      "Choose the type of funding or partnership support you need",
      "Answer questions about the business and request",
      "Review the funding profile and next-step summary",
      "Submit for review and possible partner routing",
    ],
    afterSubmission:
      "The funding or partnership request is reviewed for context and possible routing. Funding, eligibility, rates and approval remain subject to an authorised provider. KYC documents may be requested after initial review.",
    boundary:
      "NairaLeap does not promise funding, approval, rates or investment returns. Any offer is decided by the relevant authorised provider.",
    relatedServiceIds: ["agriculture", "vendor-marketplace", "professional-services"],
  },
  "vendor-marketplace": {
    audience: "Buyers, suppliers, vendors and service providers",
    purpose:
      "Find or present goods and services through a guided vendor, quotation or marketplace enquiry.",
    informationIntro:
      "Provide the product, service or purchasing context needed to understand the marketplace request.",
    information: [
      "Buyer or vendor profile",
      "Product or service category",
      "Quantity, location and timing",
      "Registration, catalogue or supporting information where relevant",
    ],
    process: [
      "Choose whether you are buying, sourcing or registering as a vendor",
      "Describe the product or service requirement",
      "Review the marketplace request",
      "Submit for verification, matching or follow-up",
    ],
    afterSubmission:
      "The marketplace request is reviewed for category, location and fit. Any vendor, product, quotation or match remains subject to the relevant review process.",
    relatedServiceIds: ["agriculture", "business-funding", "recycling-scrap"],
  },
  "recycling-scrap": {
    audience: "Material owners, recyclers, scrap dealers and responsible buyers",
    purpose:
      "Describe materials for sale, purchase, pickup or responsible recycling and identify the support you need.",
    informationIntro:
      "Share the material category, quantity and collection context so the request can be reviewed appropriately.",
    information: [
      "Material type and approximate quantity",
      "Location and pickup or delivery context",
      "Ownership and condition information",
      "Photos or supporting details where useful",
    ],
    process: [
      "Choose whether you are selling, buying or arranging recycling",
      "Describe the material and location",
      "Review the recycling or scrap request",
      "Submit for buyer, recycler or pickup follow-up",
    ],
    afterSubmission:
      "The material request is reviewed for location, quantity and handling context. Any price, buyer, recycler or pickup arrangement must be confirmed through review.",
    relatedServiceIds: ["vendor-marketplace", "property-listings", "customer-support"],
  },
  "business-briefs": {
    audience: "People who want concise market, sector and opportunity updates",
    purpose:
      "Choose the type of business or market information you would like to receive or request.",
    informationIntro: "Tell us the themes, sectors or topics that are useful to you.",
    information: [
      "Topics or sectors of interest",
      "Preferred update frequency",
      "Custom report or briefing request",
      "Contact details for delivery and follow-up",
    ],
    process: [
      "Choose the brief or report type",
      "Set your topics and delivery preference",
      "Review the information request",
      "Submit or save your preference",
    ],
    afterSubmission:
      "NairaLeap reviews the information request and uses the selected contact and delivery context for the next supported follow-up. Delivery timing is not guaranteed.",
    relatedServiceIds: ["professional-services", "business-funding", "agriculture"],
  },
  "professional-services": {
    audience: "Individuals, businesses and institutions seeking specialist support",
    purpose:
      "Describe the legal, financial, tax, strategy, compliance or specialist advisory support you are looking for.",
    informationIntro:
      "The service helps NairaLeap understand the expertise, timing and context relevant to your request.",
    information: [
      "Area of professional support",
      "Your organisation or personal context",
      "Scope, location and timing",
      "Professional or supporting documents where relevant",
    ],
    process: [
      "Choose the type of specialist support",
      "Describe the issue or outcome you need",
      "Review the professional-services request",
      "Submit for review and possible specialist matching",
    ],
    afterSubmission:
      "The request is reviewed for scope and suitability before any specialist follow-up. The portal does not provide a professional opinion or guarantee a match.",
    boundary:
      "A request is not a legal, tax, financial or professional opinion. Any advice is provided by the engaged qualified professional.",
    relatedServiceIds: ["business-funding", "vendor-marketplace", "customer-support"],
  },
  "customer-support": {
    audience: "Anyone who needs help, clarification or human follow-up",
    purpose:
      "Reach the NairaLeap support team about a question, issue, feedback or existing request.",
    informationIntro:
      "Share enough context for a support person to understand what happened and how to help.",
    information: [
      "Your contact details",
      "The area of the portal or service involved",
      "What you need help with",
      "A request reference or supporting context where available",
    ],
    process: [
      "Choose the type of support you need",
      "Describe the issue or question clearly",
      "Review the support request",
      "Submit for human follow-up",
    ],
    afterSubmission:
      "A support person reviews the context and may follow up using the contact information supplied. Response time depends on the request and available support capacity.",
    relatedServiceIds: ["agriculture", "insurance", "mortgage"],
  },
  insurance: {
    audience: "Individuals, families, asset owners and businesses seeking protection",
    purpose:
      "Describe a protection, claim, renewal, policy-support or verification need for review by suitable licensed insurance operators.",
    informationIntro:
      "The navigator helps organise your protection need before any provider discussion.",
    information: [
      "Protection category and request type",
      "Person, asset, health or business context",
      "Timing and existing-policy information where relevant",
      "Supporting documents only where the review requires them",
    ],
    process: [
      "Choose the protection area and request type",
      "Answer a small set of guided questions",
      "Review the insurance request and next-step summary",
      "Submit for licensed-operator review where available",
    ],
    afterSubmission:
      "The protection request is prepared for review by a suitable licensed operator where available. The operator—not NairaLeap—determines terms, premiums, claims decisions and cover.",
    boundary:
      "NairaLeap does not underwrite risk, bind cover or issue a policy. Terms, premiums, claims decisions and cover are determined by the licensed operator.",
    relatedServiceIds: ["mortgage", "property-listings", "customer-support"],
  },
  mortgage: {
    audience: "Home buyers, builders, property owners, developers and diaspora applicants",
    purpose:
      "Describe a home purchase, construction, renovation, refinancing or housing-finance need for review by a suitable verified finance partner.",
    informationIntro:
      "The navigator organises the housing-finance context before any lender or mortgage-partner review.",
    information: [
      "Mortgage purpose, property stage and location",
      "Applicant, income and contribution context",
      "Requested amount, property value and timing",
      "Property, identity and income evidence where relevant",
    ],
    process: [
      "Choose the housing-finance pathway",
      "Answer practical questions about the applicant and property",
      "Review the mortgage request and recommended next documents",
      "Submit for partner review and next-step confirmation",
    ],
    afterSubmission:
      "The housing-finance request is reviewed for completeness and possible partner routing. The authorised partner determines eligibility, rates, terms, approval and disbursement.",
    boundary:
      "NairaLeap does not lend, underwrite, approve, price or guarantee a mortgage. Eligibility, rates, terms, approval and disbursement remain subject to the authorised partner.",
    relatedServiceIds: ["property-listings", "business-funding", "insurance"],
  },
};

export function getServiceBySlug(slug: string): ServiceDefinition | null {
  return SERVICE_CATALOG.find((service) => service.id === slug) ?? null;
}
