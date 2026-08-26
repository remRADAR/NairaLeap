describe("LeapBot persistent chauffeur", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('button[aria-label="Open LeapBot chauffeur"]').should("be.visible");
  });

  it("stays present after the inactivity prompt instead of disappearing", () => {
    cy.wait(10_500);
    cy.get('button[aria-label="Open LeapBot chauffeur"]').should("be.visible");
  });

  it("opens a persistent conversation and explains the portal boundaries", () => {
    cy.get('button[aria-label="Open LeapBot chauffeur"]').click({ force: true });
    cy.get('[data-testid="leapbot-panel"]').should("be.visible");
    cy.get('[role="log"]').should("contain.text", "I’m your NairaLeap chauffeur");
    cy.get("#leapbot-message").type("How much is the fee?");
    cy.get('[aria-label="Send message"]').click({ force: true });
    cy.get('[role="log"]', { timeout: 5_000 }).should("contain.text", "verified price book");
    cy.get('[data-testid="leapbot-panel"]').should("be.visible");
  });

  it("takes the user to a known service and keeps the conversation after navigation", () => {
    cy.get('button[aria-label="Open LeapBot chauffeur"]').click({ force: true });
    cy.get("#leapbot-message").type("Take me to mortgage");
    cy.get('[aria-label="Send message"]').click({ force: true });
    cy.location("pathname").should("eq", "/services/mortgage");
    cy.get('[data-testid="leapbot-panel"]').should("be.visible");
    cy.get('[role="log"]', { timeout: 5_000 }).should("contain.text", "dedicated Mortgage page");
    cy.get('[data-testid="service-start-onboarding"]').should("be.visible");
  });

  it("answers service preparation questions with blueprint-backed knowledge", () => {
    cy.visit("/services/insurance");
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('button[aria-label="Open LeapBot chauffeur"]')
      .should("be.visible")
      .click({ force: true });
    cy.get('[data-testid="leapbot-panel"]').should("be.visible");
    cy.get("#leapbot-message").type("What do I need to prepare for insurance?");
    cy.get('[aria-label="Send message"]').click({ force: true });
    cy.get('[role="log"]', { timeout: 5_000 })
      .should("contain.text", "government ID")
      .and("contain.text", "Required information");
  });
});
