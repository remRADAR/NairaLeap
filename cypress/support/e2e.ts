export const SERVICE_CASES = [
  { id: "agriculture", title: "Agriculture" },
  { id: "property-listings", title: "Property Listings" },
  { id: "business-funding", title: "Business Funding" },
  { id: "partnerships", title: "Partnerships" },
  { id: "vendor-marketplace", title: "Vendor Marketplace" },
  { id: "distress-sales", title: "Distress Sales" },
  { id: "recycling-scrap", title: "Recycling & Scrap" },
  { id: "business-briefs", title: "Business Briefs" },
  { id: "professional-services", title: "Professional Services" },
  { id: "customer-support", title: "Customer Support" },
  { id: "insurance", title: "Insurance" },
  { id: "mortgage", title: "Mortgage" },
] as const;

Cypress.Commands.add("assertServicePage", (serviceTitle: string) => {
  cy.get("main").should("contain.text", serviceTitle);
  cy.contains("Nairaleap service guide").should("be.visible");
  cy.contains("What this service is").should("be.visible");
  cy.contains("What you’ll provide").should("be.visible");
  cy.contains("Start onboarding").should("be.visible");
});

declare global {
  namespace Cypress {
    interface Chainable {
      assertServicePage(serviceTitle: string): Chainable<void>;
    }
  }
}

export {};
