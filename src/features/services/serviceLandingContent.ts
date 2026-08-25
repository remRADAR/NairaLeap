import { SERVICE_CATALOG, type ServiceId, type ServiceDefinition } from "./serviceCatalog";

export interface ServiceLandingContent {
  audience: string;
  purpose: string;
  informationIntro: string;
  information: string[];
  process: string[];
  boundary?: string;
  relatedServiceIds?: ServiceId[];
}

export const SERVICE_LANDING_CONTENT: Record<ServiceId, ServiceLandingContent> = {
  agriculture: {
    audience: "Farmers, farm owners, agribusinesses and agricultural partners",
    purpose:
      "Use this service to describe the farm, inputs, production, market or training support you are looking for across the agricultural value chain.",
    informationIntro:
      "You will provide the practical details that help NairaLeap understand your agricultural need.",
    information: [
      "Your contact and farming profile",
      "Farm location, scale and current activity",
      "Crop, livestock or production focus",
      "Inputs, buyers, training or support needs",
    ],
    process: [
      "Choose the agricultural need that best describes your request",
      "Answer a short set of practical questions",
      "Review the structured Agriculture rundown",
      "Submit for NairaLeap review and follow-up",
    ],
    relatedServiceIds: ["vendor-marketplace", "business-funding", "insurance"],
  },
  "property-listings": {
    audience: "Property owners, buyers, renters, developers and investors",
    purpose:
      "Describe a property to list, find, buy, rent or inspect, with the context needed for a clearer property enquiry.",
    informationIntro: "Prepare the property and contact information relevant to your enquiry.",
    information: [
      "Property type, location and intended action",
      "Ownership or listing context",
      "Property features, condition and supporting details",
      "Preferred viewing, buyer or renter requirements",
    ],
    process: [
      "Tell us whether you are listing, buying, renting or enquiring",
      "Share the property context and what you need next",
      "Review the property request before submission",
      "Receive follow-up on the next review step",
    ],
    boundary:
      "Property details, ownership documents, inspections and valuation remain subject to review where applicable.",
    relatedServiceIds: ["mortgage", "distress-sales", "professional-services"],
  },
  "business-funding": {
    audience: "Businesses, founders, cooperatives and growth-stage operators",
    purpose:
      "Use this service to describe a business funding, grant, investment or working-capital need without treating the request as an approval.",
    informationIntro:
      "The onboarding focuses on your business context and the type of support you are seeking.",
    information: [
      "Business stage, sector and location",
      "Funding or investment purpose",
      "Requested amount and timing context",
      "Business, financial or supporting information where relevant",
    ],
    process: [
      "Choose the type of funding or support you need",
      "Answer questions about the business and request",
      "Review the funding profile and next-step summary",
      "Submit for review and possible partner routing",
    ],
    boundary:
      "NairaLeap does not promise funding, approval, rates or investment returns. Any offer is decided by the relevant authorised provider.",
    relatedServiceIds: ["agriculture", "partnerships", "professional-services"],
  },
  partnerships: {
    audience: "Businesses, founders, institutions and potential collaborators",
    purpose:
      "Structure a partnership, joint-venture, co-founder, distribution or collaboration enquiry for review.",
    informationIntro:
      "Explain the opportunity, the counterpart you need and the kind of collaboration you have in mind.",
    information: [
      "Your organisation or operating context",
      "Partnership purpose and expected contribution",
      "Sector, location and preferred counterpart",
      "Supporting proposal or business information",
    ],
    process: [
      "Describe the partnership opportunity",
      "Share the fit, scope and intended next step",
      "Review the structured partnership request",
      "Submit for NairaLeap review and possible introductions",
    ],
    relatedServiceIds: ["business-funding", "vendor-marketplace", "professional-services"],
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
    relatedServiceIds: ["agriculture", "partnerships", "recycling-scrap"],
  },
  "distress-sales": {
    audience: "Owners, buyers and intermediaries handling time-sensitive assets",
    purpose:
      "Describe an urgent listing or enquiry for property, vehicles, equipment or inventory that needs structured review.",
    informationIntro:
      "The flow helps capture urgency, ownership and asset details without publishing anything automatically.",
    information: [
      "Asset type, location and condition",
      "Ownership and urgency context",
      "Expected price or transaction objective",
      "Photos, valuation or supporting information where relevant",
    ],
    process: [
      "Tell us what is being listed or sought",
      "Explain the urgency and asset context",
      "Review the request before it is shared for review",
      "Submit for verification and possible buyer routing",
    ],
    boundary:
      "Urgency, ownership, pricing and publication remain subject to NairaLeap review; a buyer or sale is not guaranteed.",
    relatedServiceIds: ["property-listings", "vendor-marketplace", "recycling-scrap"],
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
    relatedServiceIds: ["vendor-marketplace", "distress-sales", "customer-support"],
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
    boundary:
      "A request is not a legal, tax, financial or professional opinion. Any advice is provided by the engaged qualified professional.",
    relatedServiceIds: ["business-funding", "partnerships", "customer-support"],
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
    boundary:
      "NairaLeap does not lend, underwrite, approve, price or guarantee a mortgage. Eligibility, rates, terms, approval and disbursement remain subject to the authorised partner.",
    relatedServiceIds: ["property-listings", "business-funding", "insurance"],
  },
};

export function getServiceBySlug(slug: string): ServiceDefinition | null {
  return SERVICE_CATALOG.find((service) => service.id === slug) ?? null;
}
