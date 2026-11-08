describe("NairaLeap Services portal footer", () => {
  it("keeps the portal identity while connecting to the NairaLeap ecosystem", () => {
    cy.visit("/services");

    cy.get("footer").within(() => {
      cy.get('img[alt="NairaLeap Services"]').should("be.visible");
      cy.contains("NairaLeap Services").should("be.visible");
      cy.contains("Service discovery, guided onboarding, request preparation").should("be.visible");
      cy.contains("a", "Visit the main NairaLeap website").should("have.attr", "href", "/");
    });
    cy.get("footer").contains("NairaLeap Services is part of the NairaLeap ecosystem.").should("be.visible");
  });

  it("navigates to every footer destination", () => {
    cy.visit("/services");

    cy.get('footer nav[aria-label="Platform"] a[href="/services"]').should(
      "contain.text",
      "Explore Services",
    );
    cy.get("footer").within(() => {
      cy.contains("a", "Main Website").should("have.attr", "href", "/").click();
    });
    cy.location("pathname").should("eq", "/");

    cy.visit("/services");
    cy.get('footer nav[aria-label="Company"] a[href="/about"]').should(
      "contain.text",
      "About NairaLeap",
    );
    cy.get('footer nav[aria-label="Company"] a[href="/about"]').click();
    cy.location("pathname").should("eq", "/about");

    cy.visit("/services");
    cy.get('footer nav[aria-label="Legal and Trust"] a[href="/disclaimer"]').should(
      "contain.text",
      "Disclaimer",
    );
    cy.get('footer nav[aria-label="Legal and Trust"] a[href="/disclaimer"]').click();
    cy.location("pathname").should("eq", "/disclaimer");

    cy.visit("/services");
    cy.get('footer nav[aria-label="Legal and Trust"] a[href="/privacy-policy"]').click();
    cy.location("pathname").should("eq", "/privacy-policy");
  });

  it("links the customer workspace according to the signed-in state", () => {
    cy.visit("/services");

    cy.get("footer").within(() => {
      cy.get('a[href="/auth"], a[href="/dashboard"]').should("exist");
    });
  });

  it("opens the NairaLeap Guide from the footer", () => {
    cy.visit("/services");
    cy.get('[data-app-hydrated="true"]').should("exist");

    cy.get("footer").contains("button", "NairaLeap Guide").click({ force: true });
    cy.get('[data-testid="nairaleap-guide-dialog"]').should("be.visible");
  });

  it("does not duplicate legal links across footer columns", () => {
    cy.visit("/services");

    cy.get("footer").within(() => {
      cy.get('a[href="/disclaimer"]').should("have.length", 1);
      cy.get('a[href="/privacy-policy"]').should("have.length", 1);
      cy.get('a[href="/about"]').should("have.length", 1);
    });
  });

  it("does not keep dead placeholder links", () => {
    cy.visit("/services");

    cy.get("footer").within(() => {
      ["Careers", "Press", "Partners", "Terms", "Cookies"].forEach((label) => {
        cy.contains("span", label).should("not.exist");
      });
    });
  });

  it("keeps the compact service-page footer hidden on desktop and visible on mobile", () => {
    cy.viewport(1280, 800);
    cy.visit("/services/agriculture");

    cy.get("footer").should("exist").and("not.be.visible");

    cy.viewport(375, 667);
    cy.get("footer").should("be.visible");
  });
});
