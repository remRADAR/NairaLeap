import type { BlueprintField } from "@/features/request-blueprint-engine";
import type { ServiceId } from "./serviceCatalog";

export type ServiceRole = "customer" | "seller";

export interface ServiceRoleProfile {
  customer: {
    label: string;
    description: string;
    fields: BlueprintField[];
  };
  seller: {
    label: string;
    description: string;
    fields: BlueprintField[];
  };
}

const textField = (
  id: string,
  key: string,
  label: string,
  description: string,
): BlueprintField => ({
  id,
  key,
  label,
  type: "long-text",
  description,
  required: true,
});

export const SERVICE_ROLE_PROFILES: Record<ServiceId, ServiceRoleProfile> = {
  agriculture: {
    customer: {
      label: "I’m a farmer / grower",
      description: "I grow crops, raise livestock, or need support for my farm operation.",
      fields: [
        textField(
          "agri-customer-goal",
          "roleGoal",
          "What outcome do you want from your farm?",
          "Tell us whether you need inputs, buyers, training, finance, or another farm-related outcome.",
        ),
        textField(
          "agri-customer-operation",
          "operationDetails",
          "Tell us about your farm operation",
          "Share your main crops or livestock, production stage, and the biggest constraint you are facing.",
        ),
      ],
    },
    seller: {
      label: "I’m an input seller or provider",
      description: "I supply farm inputs, equipment, services, produce, or agribusiness support.",
      fields: [
        textField(
          "agri-seller-offer",
          "providerOffer",
          "What farm inputs or services do you provide?",
          "Describe your products, services, brands, coverage area, and typical customer.",
        ),
        textField(
          "agri-seller-capacity",
          "providerCapacity",
          "What supply capacity can you support?",
          "Share available quantities, delivery areas, certifications, and lead times.",
        ),
      ],
    },
  },
  "property-listings": {
    customer: {
      label: "I’m a buyer or renter",
      description: "I’m looking for a home, land, or commercial space to buy or rent.",
      fields: [
        textField(
          "property-customer-need",
          "searchNeed",
          "What property are you looking for?",
          "Describe your intended use, preferred area, must-have features, and viewing needs.",
        ),
        textField(
          "property-customer-readiness",
          "buyerReadiness",
          "How ready are you to proceed?",
          "Tell us whether you are researching, ready to view, negotiating, or prepared to transact.",
        ),
      ],
    },
    seller: {
      label: "I’m a property owner, agent, or developer",
      description: "I want to list, lease, sell, or promote a property.",
      fields: [
        textField(
          "property-seller-authority",
          "listingAuthority",
          "What is your relationship to the property?",
          "Tell us whether you are the owner, authorised agent, developer, trustee, or another representative.",
        ),
        textField(
          "property-seller-details",
          "listingDetails",
          "What should interested buyers or renters know?",
          "Share the property condition, title status, access, amenities, and any important restrictions.",
        ),
      ],
    },
  },
  "business-funding": {
    customer: {
      label: "I’m a business owner or funding applicant",
      description: "I need a loan, grant, investment, or growth funding for a business.",
      fields: [
        textField(
          "funding-customer-use",
          "fundingUse",
          "What will the funding enable?",
          "Explain the specific growth, working-capital, asset, or project use for the funding.",
        ),
        textField(
          "funding-customer-proof",
          "businessTraction",
          "What evidence of business traction can you share?",
          "Mention revenue, customers, contracts, assets, repayment history, or other useful evidence.",
        ),
      ],
    },
    seller: {
      label: "I’m a lender, investor, or grant provider",
      description: "I provide capital, grants, financing, or investment opportunities.",
      fields: [
        textField(
          "funding-seller-program",
          "capitalOffer",
          "What funding or capital do you provide?",
          "Describe the instrument, ticket size, target sectors, eligibility, and geography.",
        ),
        textField(
          "funding-seller-process",
          "fundingProcess",
          "How should applicants engage with you?",
          "Explain your application, screening, documentation, and decision process.",
        ),
      ],
    },
  },
  partnerships: {
    customer: {
      label: "I’m seeking a partner or collaborator",
      description: "I have a partnership, joint-venture, co-founder, or distribution need.",
      fields: [
        textField(
          "partnership-customer-goal",
          "partnershipGoal",
          "What do you want a partner to help achieve?",
          "Describe the outcome, market, project, or capability you want to build together.",
        ),
        textField(
          "partnership-customer-contribution",
          "partnershipContribution",
          "What will you bring to the partnership?",
          "Share your assets, audience, capital, expertise, distribution, or other contribution.",
        ),
      ],
    },
    seller: {
      label: "I’m a partner, collaborator, or opportunity holder",
      description: "I offer a partnership opportunity, capability, channel, or joint venture.",
      fields: [
        textField(
          "partnership-seller-offer",
          "partnershipOffer",
          "What partnership opportunity are you offering?",
          "Describe the opportunity, target counterpart, commercial model, and expected contribution.",
        ),
        textField(
          "partnership-seller-fit",
          "preferredPartner",
          "Who would be a good fit?",
          "Describe the organisation, sector, capability, or market you want to work with.",
        ),
      ],
    },
  },
  "vendor-marketplace": {
    customer: {
      label: "I’m a buyer or procurement customer",
      description: "I need products, services, a quote, or a bulk order from a vendor.",
      fields: [
        textField(
          "marketplace-customer-need",
          "purchaseNeed",
          "What do you need to buy?",
          "Describe the product or service, quantity, specification, delivery location, and deadline.",
        ),
        textField(
          "marketplace-customer-standard",
          "supplierRequirements",
          "What should the vendor be able to provide?",
          "Mention quality, warranty, certification, payment, delivery, or service expectations.",
        ),
      ],
    },
    seller: {
      label: "I’m a vendor, merchant, or service provider",
      description: "I want to register, list products, receive enquiries, or fulfil orders.",
      fields: [
        textField(
          "marketplace-seller-offer",
          "vendorOffer",
          "What products or services do you offer?",
          "Describe your catalogue, service area, capacity, and typical order size.",
        ),
        textField(
          "marketplace-seller-proof",
          "vendorCredentials",
          "What makes your business ready for the marketplace?",
          "Share registration, certifications, references, fulfilment process, or other proof.",
        ),
      ],
    },
  },
  "distress-sales": {
    customer: {
      label: "I’m a buyer or distressed-asset investor",
      description:
        "I’m looking for an urgent purchase of property, vehicles, equipment, or inventory.",
      fields: [
        textField(
          "distress-customer-target",
          "targetAsset",
          "What distressed asset are you looking for?",
          "Describe the asset, preferred location, condition, and the urgency of your purchase.",
        ),
        textField(
          "distress-customer-readiness",
          "purchaseReadiness",
          "How quickly can you inspect or close?",
          "Tell us your funds, inspection availability, and any conditions before purchase.",
        ),
      ],
    },
    seller: {
      label: "I’m an owner, seller, or liquidator",
      description:
        "I need to sell an asset quickly because of urgency, liquidation, or a time-sensitive situation.",
      fields: [
        textField(
          "distress-seller-reason",
          "saleReason",
          "Why is the sale time-sensitive?",
          "Explain the urgency, deadline, liquidation context, or event driving the sale.",
        ),
        textField(
          "distress-seller-condition",
          "assetCondition",
          "What condition and documentation does the asset have?",
          "Describe condition, ownership, valuation, access, and available proof.",
        ),
      ],
    },
  },
  "recycling-scrap": {
    customer: {
      label: "I’m a recycler or material buyer",
      description: "I want to source, collect, process, or buy recyclable materials.",
      fields: [
        textField(
          "recycling-customer-demand",
          "materialDemand",
          "What material do you need?",
          "Describe the material grade, quantity, contamination limits, and buying frequency.",
        ),
        textField(
          "recycling-customer-capacity",
          "processingCapacity",
          "What can you collect or process?",
          "Share your equipment, pickup area, processing capacity, and compliance arrangements.",
        ),
      ],
    },
    seller: {
      label: "I’m a material seller, collector, or waste holder",
      description: "I have scrap, recyclable material, e-waste, or bulk waste to move responsibly.",
      fields: [
        textField(
          "recycling-seller-material",
          "materialDetails",
          "What material do you have?",
          "Describe material type, estimated weight or volume, condition, and how it is packaged.",
        ),
        textField(
          "recycling-seller-logistics",
          "pickupDetails",
          "What are the pickup or delivery details?",
          "Share location, access conditions, sorting status, and preferred timing.",
        ),
      ],
    },
  },
  "business-briefs": {
    customer: {
      label: "I’m a reader, subscriber, or decision-maker",
      description: "I want useful business, market, sector, or opportunity information.",
      fields: [
        textField(
          "briefs-customer-interest",
          "briefInterest",
          "What decisions should the briefs help you make?",
          "Describe the sectors, markets, or decisions where timely information would help.",
        ),
        textField(
          "briefs-customer-context",
          "readerContext",
          "What is your role or organisation context?",
          "Tell us your sector, location, audience, and preferred level of detail.",
        ),
      ],
    },
    seller: {
      label: "I’m a publisher, researcher, or insight provider",
      description:
        "I provide research, market intelligence, announcements, or business opportunities.",
      fields: [
        textField(
          "briefs-seller-content",
          "contentOffer",
          "What insight or content do you provide?",
          "Describe your research, data, announcements, expertise, and publication frequency.",
        ),
        textField(
          "briefs-seller-audience",
          "contentAudience",
          "Who is the intended audience?",
          "Share the sectors, roles, geography, and business decisions your content serves.",
        ),
      ],
    },
  },
  "professional-services": {
    customer: {
      label: "I’m a client seeking an expert",
      description: "I need legal, financial, tax, strategy, compliance, or specialist advice.",
      fields: [
        textField(
          "professional-customer-need",
          "advisoryNeed",
          "What expert outcome do you need?",
          "Describe the decision, deliverable, problem, or transaction where you need professional help.",
        ),
        textField(
          "professional-customer-context",
          "clientContext",
          "What context should the specialist understand?",
          "Share the relevant business, personal, regulatory, timeline, or document context.",
        ),
      ],
    },
    seller: {
      label: "I’m a professional, consultant, or specialist",
      description: "I offer professional expertise, advisory, compliance, or specialist services.",
      fields: [
        textField(
          "professional-seller-practice",
          "practiceOffer",
          "What expertise do you offer?",
          "Describe your practice areas, client types, locations, and typical engagement.",
        ),
        textField(
          "professional-seller-credentials",
          "professionalCredentials",
          "What credentials or experience should clients know?",
          "Share licences, certifications, years of experience, industries, and references.",
        ),
      ],
    },
  },
  "customer-support": {
    customer: {
      label: "I’m a customer or platform user",
      description: "I need help with a service, account, existing request, or experience.",
      fields: [
        textField(
          "support-customer-outcome",
          "supportOutcome",
          "What would a good resolution look like?",
          "Tell us the answer, correction, action, or follow-up you need from the support team.",
        ),
        textField(
          "support-customer-history",
          "supportHistory",
          "What has already happened?",
          "Include relevant dates, request references, steps tried, and any response received.",
        ),
      ],
    },
    seller: {
      label: "I’m a service provider or platform partner",
      description:
        "I provide a NairaLeap service, fulfilment, listing, or partner workflow and need support.",
      fields: [
        textField(
          "support-seller-context",
          "providerSupportContext",
          "Which provider or partner workflow needs help?",
          "Describe the service, listing, fulfilment, or partnership workflow involved.",
        ),
        textField(
          "support-seller-resolution",
          "providerSupportOutcome",
          "What action or clarification do you need?",
          "Tell us what the NairaLeap team should check, change, or explain.",
        ),
      ],
    },
  },
  insurance: {
    customer: {
      label: "I’m seeking cover or policy support",
      description:
        "I need insurance, a quote, a claim route, renewal, or help with an existing policy.",
      fields: [
        textField(
          "insurance-customer-risk",
          "riskContext",
          "What risk or asset needs protection?",
          "Describe the person, asset, activity, location, or event you want the cover to address.",
        ),
        textField(
          "insurance-customer-history",
          "policyHistory",
          "What cover or claim history is relevant?",
          "Mention existing cover, prior claims, renewal timing, exclusions, or urgent deadlines.",
        ),
      ],
    },
    seller: {
      label: "I’m an insurer, broker, agent, or cover provider",
      description: "I provide insurance products, brokerage, claims support, or risk services.",
      fields: [
        textField(
          "insurance-seller-products",
          "coverOffer",
          "What cover or insurance service do you provide?",
          "Describe products, eligible customers, sectors, territory, and claims support.",
        ),
        textField(
          "insurance-seller-credentials",
          "insuranceCredentials",
          "What authorisation or provider credentials apply?",
          "Share your operator, broker, agent, licence, or partnership details for review.",
        ),
      ],
    },
  },
  mortgage: {
    customer: {
      label: "I’m a homebuyer or borrower",
      description: "I need home finance, construction finance, refinancing, or mortgage support.",
      fields: [
        textField(
          "mortgage-customer-goal",
          "housingGoal",
          "What housing outcome are you pursuing?",
          "Describe the home, land, construction, renovation, refinancing, or repayment outcome you need.",
        ),
        textField(
          "mortgage-customer-readiness",
          "financeReadiness",
          "What is your current finance readiness?",
          "Share what you have already identified, your deposit or contribution position, and the next decision needed.",
        ),
      ],
    },
    seller: {
      label: "I’m a lender, PMB, developer, or housing-finance provider",
      description:
        "I provide mortgage, housing finance, property development, or related funding pathways.",
      fields: [
        textField(
          "mortgage-seller-offer",
          "housingFinanceOffer",
          "What housing-finance pathway do you provide?",
          "Describe products, target applicants, property types, locations, ticket sizes, and terms at a high level.",
        ),
        textField(
          "mortgage-seller-process",
          "lenderProcess",
          "What is your application and review process?",
          "Explain eligibility, documents, valuation, affordability, and how applicants should engage.",
        ),
      ],
    },
  },
};

export function getServiceRoleProfile(serviceId: ServiceId): ServiceRoleProfile {
  return SERVICE_ROLE_PROFILES[serviceId];
}
