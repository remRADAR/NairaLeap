import type { ComponentType, SVGProps } from "react";
import {
  Sprout,
  Building2,
  Banknote,
  Handshake,
  Store,
  Tag,
  Recycle,
  Newspaper,
  Briefcase,
  LifeBuoy,
} from "lucide-react";

export type ServiceId =
  | "agriculture"
  | "property-listings"
  | "business-funding"
  | "partnerships"
  | "vendor-marketplace"
  | "distress-sales"
  | "recycling-scrap"
  | "business-briefs"
  | "professional-services"
  | "customer-support";

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
 */
export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: "agriculture",
    icon: Sprout,
    title: "Agriculture",
    shortDescription: "Farming inputs, produce and agri opportunities.",
    longDescription:
      "Helping farmers, investors and agribusinesses connect with the right opportunities across the value chain.",
    examples: ["Register a Farm", "Find Farm Inputs", "Access Buyers", "Request Training"],
  },
  {
    id: "property-listings",
    icon: Building2,
    title: "Property Listings",
    shortDescription: "Homes, land and commercial spaces across Nigeria.",
    longDescription:
      "Discover, list and enquire about residential, commercial and land assets with verified details.",
    examples: ["List a Property", "Find a Home to Rent", "Buy Land", "Request a Site Visit"],
  },
  {
    id: "business-funding",
    icon: Banknote,
    title: "Business Funding",
    shortDescription: "Access working capital and growth financing.",
    longDescription:
      "Match your business with lenders, grants and investors suited to your stage and sector.",
    examples: ["Apply for a Loan", "Pitch to Investors", "Find a Grant", "Get Funding Advice"],
  },
  {
    id: "partnerships",
    icon: Handshake,
    title: "Partnerships",
    shortDescription: "Connect with vetted partners and collaborators.",
    longDescription:
      "Explore strategic partnerships, joint ventures and collaboration opportunities with trusted counterparts.",
    examples: [
      "Propose a Partnership",
      "Find a Co-founder",
      "Joint Venture Enquiry",
      "Distribution Partner",
    ],
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
    id: "distress-sales",
    icon: Tag,
    title: "Distress Sales",
    shortDescription: "Time-sensitive listings at reduced prices.",
    longDescription:
      "Browse or submit urgent, time-sensitive listings across property, vehicles, equipment and inventory.",
    examples: [
      "List a Distress Sale",
      "Browse Distressed Property",
      "Distressed Vehicles",
      "Equipment & Inventory",
    ],
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
];
