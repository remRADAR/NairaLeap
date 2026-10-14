import type { ComponentType, SVGProps } from "react";
import {
  Sprout,
  Building2,
  Banknote,
  Store,
  Recycle,
  Newspaper,
  Briefcase,
  LifeBuoy,
  ShieldCheck,
  House,
} from "lucide-react";

export type ServiceId =
  | "agriculture"
  | "property-listings"
  | "business-funding"
  | "vendor-marketplace"
  | "recycling-scrap"
  | "business-briefs"
  | "professional-services"
  | "customer-support"
  | "insurance"
  | "mortgage";

export interface ServiceDefinition {
  id: ServiceId;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  shortDescription: string;
  longDescription: string;
  examples: string[];
}

/**
 * Single source of truth for the service catalog.
 * Consumed by the service grid AND the reusable ServicePreviewSheet.
 *
 * Services merged in v2 restructuring:
 * - Partnerships → merged into Business Funding (investor & partner paths unified)
 * - Distress Sales → merged into Property Listings (urgency flag within property)
 */
export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: "agriculture",
    icon: Sprout,
    title: "Agriculture",
    shortDescription: "Register your farm or supply inputs to farmers across Nigeria.",
    longDescription:
      "Farmers register their farm and crops. Input suppliers register their company to reach farmers. No metrics forms — just tell us who you are and what you do.",
    examples: ["Register a Farm", "Find Farm Inputs", "Request Training"],
  },
  {
    id: "property-listings",
    icon: Building2,
    title: "Property & Distress Sales",
    shortDescription: "List, rent, buy land, homes and commercial spaces across Nigeria.",
    longDescription:
      "List a property, find a home to rent, buy land, or browse distressed/urgent sales. Choose your role as Buyer, Developer, or Agent.",
    examples: ["List a Property", "Find a Home to Rent", "Buy Land", "Browse Distress Sales"],
  },
  {
    id: "business-funding",
    icon: Banknote,
    title: "Business Funding & Partnerships",
    shortDescription: "Loans, grants, investors, joint ventures and strategic partnerships.",
    longDescription:
      "Access working capital, pitch to investors, find grants, or propose strategic partnerships and joint ventures — all in one guided flow.",
    examples: ["Apply for a Loan", "Pitch to Investors", "Propose a Partnership", "Find a Grant"],
  },
  {
    id: "vendor-marketplace",
    icon: Store,
    title: "Vendor Marketplace",
    shortDescription: "Trusted vendors for goods and services.",
    longDescription:
      "Source products and services from a marketplace of vetted vendors with transparent reviews.",
    examples: ["Register as a Vendor", "Request a Quote", "Compare Vendors", "Bulk Order Enquiry"],
  },
  {
    id: "recycling-scrap",
    icon: Recycle,
    title: "Recycling & Scrap",
    shortDescription: "Sell, buy and recycle materials responsibly.",
    longDescription:
      "Connect with recyclers, scrap dealers and buyers to move materials responsibly and profitably.",
    examples: ["Sell Scrap Metal", "Find a Recycler", "Bulk Waste Pickup", "E-Waste Disposal"],
  },
  {
    id: "business-briefs",
    icon: Newspaper,
    title: "Business Briefs",
    shortDescription: "Concise updates on markets and opportunities.",
    longDescription:
      "Stay informed with short, actionable briefs on markets, sectors and emerging opportunities.",
    examples: [
      "Subscribe to Daily Briefs",
      "Request a Sector Report",
      "Market Insights",
      "Suggest a Topic",
    ],
  },
  {
    id: "professional-services",
    icon: Briefcase,
    title: "Professional Services",
    shortDescription: "Expert advisors, consultants and specialists.",
    longDescription:
      "Engage vetted professionals for legal, financial, tax, strategy and specialist advisory needs.",
    examples: ["Hire a Lawyer", "Find an Accountant", "Business Consulting", "Tax & Compliance"],
  },
  {
    id: "customer-support",
    icon: LifeBuoy,
    title: "Customer Support",
    shortDescription: "Talk to a real person, quickly.",
    longDescription:
      "Reach a human on our support team for questions, feedback or help with an existing request.",
    examples: ["Report an Issue", "Ask a Question", "Give Feedback", "Speak to an Agent"],
  },
  {
    id: "insurance",
    icon: ShieldCheck,
    title: "Insurance",
    shortDescription: "Compare cover, get a quote, or make a claim.",
    longDescription:
      "Three flows: Compare Cover (see indicative starting prices across motor, health, life, home, business, agriculture, travel, liability and microinsurance), Get a Quote, or Make a Claim. NairaLeap routes your request to licensed insurance operators for review.",
    examples: ["Compare Cover", "Get a Quote", "Make a Claim"],
  },
  {
    id: "mortgage",
    icon: House,
    title: "Mortgage",
    shortDescription: "Buy, build, renovate, or explore NHF / FMBN housing finance.",
    longDescription:
      "Three pathways: Buy a Home / Build, Renovate, or Explore NHF / FMBN Pathways. Developers and mortgage banks can onboard with a KYC profile. NairaLeap prepares your request for review by a suitable verified finance partner.",
    examples: [
      "Buy a Home / Build",
      "Renovate",
      "Explore NHF / FMBN Pathways",
      "Developer or Mortgage Bank onboarding",
    ],
  },
];
