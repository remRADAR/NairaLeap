import "cypress-real-events";

// The unmodified TanStack head emits a recoverable JSON-LD hydration mismatch;
// ignore only that baseline error so Cypress can test the client-recovered app.
Cypress.on("uncaught:exception", (error) => {
  if (
    error.message.includes(
      "Hydration failed because the server rendered HTML didn't match the client",
    )
  ) {
    return false;
  }
});

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
  cy.contains("Nairaleap service").should("be.visible");
  cy.contains("Choose your role").should("be.visible");
  cy.get('[data-testid="service-start-onboarding"]').should("be.visible");
  cy.get('[data-testid="service-seller-onboarding"]').should("be.visible");
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
