export type InsuranceCategoryId =
  | "motor-auto"
  | "health-medical"
  | "home-building"
  | "household-contents"
  | "agricultural"
  | "life-protection"
  | "savings-investment"
  | "personal-annuity"
  | "education-endowment"
  | "group-association"
  | "business-commercial"
  | "travel"
  | "marine-cargo-aviation"
  | "liability-compulsory"
  | "micro-takaful-inclusion";

export interface InsuranceCategoryDefinition {
  id: InsuranceCategoryId;
  title: string;
  description: string;
  examples: string;
  icon:
    | "car"
    | "health"
    | "home"
    | "contents"
    | "agriculture"
    | "life"
    | "savings"
    | "annuity"
    | "education"
    | "group"
    | "business"
    | "travel"
    | "marine"
    | "liability"
    | "inclusion";
}

/**
 * Insurance discovery categories. This is a routing taxonomy, not a provider
 * availability claim. Eligibility, terms, cover, exclusions and premiums must
 * be confirmed by an appropriately authorized insurance operator.
 */
export const INSURANCE_CATEGORY_CATALOG: InsuranceCategoryDefinition[] = [
  {
    id: "motor-auto",
    title: "Motor & Auto",
    description: "Vehicle protection for personal, commercial and fleet use.",
    examples: "Third-party, comprehensive, vehicle or fleet enquiries",
    icon: "car",
  },
  {
    id: "health-medical",
    title: "Health & Medical",
    description:
      "Individual, family, informal-sector, association and group health-cover enquiries.",
    examples: "Clinics, medicines, dependants and group proposals",
    icon: "health",
  },
  {
    id: "home-building",
    title: "Home & Building",
    description:
      "Building or property protection for owners, landlords and other eligible interests.",
    examples: "Building, fire, landlord and property risks",
    icon: "home",
  },
  {
    id: "household-contents",
    title: "Household Contents",
    description: "Contents and belongings protection for eligible homeowners or tenants.",
    examples: "Household contents, specified items and combined cover enquiries",
    icon: "contents",
  },
  {
    id: "agricultural",
    title: "Agricultural",
    description: "Protection needs connected to farms, crops, livestock and agricultural activity.",
    examples: "Farm, crop, livestock and equipment enquiries",
    icon: "agriculture",
  },
  {
    id: "life-protection",
    title: "Life & Protection",
    description: "Personal and family protection enquiries, subject to provider terms.",
    examples: "Life protection, family support and cover enquiries",
    icon: "life",
  },
  {
    id: "savings-investment",
    title: "Savings & Investment-Linked Insurance",
    description:
      "Explore insurer-provided savings or investment-linked insurance products and request provider-confirmed terms.",
    examples: "Savings goals, target plans and investment-linked insurance enquiries",
    icon: "savings",
  },
  {
    id: "personal-annuity",
    title: "Personal & Retirement Annuities",
    description:
      "Make a distinct annuity enquiry and request an individualized provider quotation.",
    examples: "Immediate or deferred retirement-income enquiries",
    icon: "annuity",
  },
  {
    id: "education-endowment",
    title: "Education Savings & Endowment",
    description: "Explore education savings, endowment and target-plan enquiries.",
    examples: "Education goals, future milestones and endowment enquiries",
    icon: "education",
  },
  {
    id: "group-association",
    title: "Group & Association",
    description:
      "Prepare protection or health proposals for eligible companies, associations and cooperatives.",
    examples: "Group health, group life and association proposals",
    icon: "group",
  },
  {
    id: "business-commercial",
    title: "Business & Commercial",
    description:
      "Commercial risk enquiries for premises, stock, equipment and business operations.",
    examples: "SME packages, warehouse stock and equipment",
    icon: "business",
  },
  {
    id: "travel",
    title: "Travel",
    description: "Travel and travel-medical protection enquiries for people and trips.",
    examples: "Single-trip, annual and travel-medical enquiries",
    icon: "travel",
  },
  {
    id: "marine-cargo-aviation",
    title: "Marine, Cargo & Aviation",
    description: "Risk enquiries for goods in transit, cargo, vessels and aviation activity.",
    examples: "Cargo, marine, vessel and aviation enquiries",
    icon: "marine",
  },
  {
    id: "liability-compulsory",
    title: "Liability & Compulsory Cover",
    description: "Requests involving third-party, builders, occupiers or other liability needs.",
    examples: "Third-party, builders, occupiers and professional liability",
    icon: "liability",
  },
  {
    id: "micro-takaful-inclusion",
    title: "Microinsurance, Takaful & Inclusion",
    description: "Lower-cost, cooperative and inclusion-focused protection preferences.",
    examples: "Microinsurance, Takaful and community-cover enquiries",
    icon: "inclusion",
  },
];
