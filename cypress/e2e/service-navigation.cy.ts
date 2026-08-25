import { SERVICE_CASES } from "../support/e2e";

describe("Nairaleap service discovery and onboarding navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders every current service card as a dedicated landing-page link", () => {
    SERVICE_CASES.forEach(({ id, title }) => {
      cy.get(`a[href="/services/${id}"]`)
        .should("be.visible")
        .and("contain.text", title)
        .and("contain.text", "Learn more");
    });
  });

  SERVICE_CASES.forEach(({ id, title }) => {
    it(`opens the ${title} landing page before onboarding`, () => {
      cy.get(`a[href="/services/${id}"]`).click();

      cy.location("pathname").should("eq", `/services/${id}`);
      cy.assertServicePage(title);
      cy.get('[role="dialog"]').should("not.exist");
    });
  });

  it("opens onboarding only after the landing-page CTA is selected", () => {
    cy.get('a[href="/services/mortgage"]').click();
    cy.location("pathname").should("eq", "/services/mortgage");
    cy.get('[role="dialog"]').should("not.exist");

    cy.contains("main button", "Start onboarding").first().click();

    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[role="dialog"]').should("contain.text", "NairaLeap Guide");
    cy.get('[role="dialog"]').should("contain.text", "Mortgage");
    cy.get('[role="dialog"]').should("contain.text", "Question 1 of");
    cy.get('[role="dialog"] input[placeholder="Type your answer"]').should("be.visible");
  });

  it("preserves the service landing page when the guide is closed", () => {
    cy.get('a[href="/services/agriculture"]').click();
    cy.contains("main button", "Start onboarding").first().click();
    cy.get('[role="dialog"] button[aria-label="Close"]').click();

    cy.location("pathname").should("eq", "/services/agriculture");
    cy.contains("main", "Start onboarding").should("be.visible");
  });

  it("navigates from a related service to its own landing page", () => {
    cy.get('a[href="/services/mortgage"]').click();
    cy.contains('a[href="/services/property-listings"]', "Property Listings").click();

    cy.location("pathname").should("eq", "/services/property-listings");
    cy.assertServicePage("Property Listings");
  });

  it("returns to the homepage Services section from a dedicated page", () => {
    cy.get('a[href="/services/insurance"]').click();
    cy.contains("header a", "Services").click();

    cy.location("pathname").should("eq", "/");
    cy.location("hash").should("eq", "#services");
    cy.get("#services").should("be.visible");
  });

  it("keeps the homepage Guide as a separate service-discovery path", () => {
    cy.contains("button", "Start with NairaLeap Guide").click();

    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[role="dialog"]').should("contain.text", "NairaLeap Guide");
    cy.get('[role="dialog"]').should("contain.text", "What are you trying to accomplish today?");
  });
});

describe("Nairaleap service route recovery", () => {
  it("shows a safe recovery page for an unknown service slug", () => {
    cy.visit("/services/not-a-real-service");

    cy.contains("That service is not available.").should("be.visible");
    cy.contains("a", "View services").click();
    cy.location("pathname").should("eq", "/");
    cy.location("hash").should("eq", "#services");
  });
});
