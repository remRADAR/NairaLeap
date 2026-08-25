import { SERVICE_CASES } from "../support/e2e";

function activate(selector: string) {
  cy.get('[data-app-hydrated="true"]').should("exist");
  cy.get(selector).should("be.visible").click({ force: true });
}

describe("Nairaleap service discovery and onboarding navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders every current service card as a dedicated landing-page link", () => {
    SERVICE_CASES.forEach(({ id, title }) => {
      cy.get(`#services a[href="/services/${id}"]`)
        .should("be.visible")
        .and("contain.text", title)
        .and("contain.text", "Learn more");
    });
  });

  SERVICE_CASES.forEach(({ id, title }) => {
    it(`opens the ${title} landing page before onboarding`, () => {
      cy.get(`#services a[href="/services/${id}"]`).click();

      cy.location("pathname").should("eq", `/services/${id}`);
      cy.assertServicePage(title);
      cy.get('[role="dialog"]').should("not.exist");
    });
  });

  it("opens onboarding only after the landing-page CTA is selected", () => {
    cy.visit("/services/mortgage");
    cy.get('[data-testid="nairaleap-guide-dialog"]').should("not.exist");

    activate('[data-testid="service-start-onboarding"]');
    cy.get('[data-testid="service-start-onboarding"]').should("have.attr", "aria-expanded", "true");

    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]').should("be.visible");
    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]').should(
      "contain.text",
      "NairaLeap Guide",
    );
    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]').should(
      "contain.text",
      "Mortgage",
    );
    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]').should(
      "contain.text",
      "Question 1 of",
    );
    cy.get(
      '#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"] input[placeholder="Type your answer"]',
    ).should("be.visible");
  });

  it("preserves the service landing page when the guide is closed", () => {
    cy.visit("/services/agriculture");
    activate('[data-testid="service-start-onboarding"]');
    activate(
      '#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"] [data-testid="dialog-close"]',
    );

    cy.location("pathname").should("eq", "/services/agriculture");
    cy.contains("main", "Start onboarding").should("be.visible");
  });

  it("navigates from a related service to its own landing page", () => {
    cy.get('#services a[href="/services/mortgage"]').click();
    cy.get('main a[href="/services/property-listings"]').click();

    cy.location("pathname").should("eq", "/services/property-listings");
    cy.assertServicePage("Property Listings");
  });

  it("returns to the homepage Services section from a dedicated page", () => {
    cy.get('#services a[href="/services/insurance"]').click();
    cy.contains("header a", "Services").click();

    cy.location("pathname").should("eq", "/");
    cy.location("hash").should("eq", "#services");
    cy.get("#services").should("be.visible");
  });

  it("keeps quick-access services on their canonical landing routes", () => {
    cy.get('nav[aria-label="Portal quick access"] a[aria-label="Insurance"]').should(
      "have.attr",
      "href",
      "/services/insurance",
    );
    cy.get('nav[aria-label="Portal quick access"] a[aria-label="Mortgage"]').should(
      "have.attr",
      "href",
      "/services/mortgage",
    );
  });

  it("keeps the homepage Guide as a separate service-discovery path", () => {
    activate('[data-testid="homepage-guide-trigger"]');

    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]').should("be.visible");
    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]').should(
      "contain.text",
      "NairaLeap Guide",
    );
    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]').should(
      "contain.text",
      "What are you trying to accomplish today?",
    );
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
