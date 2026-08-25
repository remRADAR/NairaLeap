describe("canonical Nairaleap branding", () => {
  it("renders the canonical wordmark in the shared portal header", () => {
    cy.visit("/");

    cy.title().should("eq", "Nairaleap - Service Portal");
    cy.get('header a[aria-label="Nairaleap - Service Portal"] img')
      .should("be.visible")
      .and("have.attr", "src", "/nairaleap-wordmark.png")
      .and("have.attr", "alt", "Nairaleap - Service Portal");

    cy.screenshot("branding-home-header");
  });

  it("serves the favicon and manifest with the canonical icon family", () => {
    cy.request("/favicon.ico?v=20260825-wordmark")
      .its("headers.content-type")
      .should("include", "image/x-icon");

    cy.request("/manifest.webmanifest")
      .its("body")
      .should((manifest) => {
        expect(manifest.name).to.equal("Nairaleap - Service Portal");
        expect(manifest.icons).to.deep.include({
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        });
        expect(manifest.icons).to.deep.include({
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        });
      });
  });
});

describe("authentication branding and entry states", () => {
  beforeEach(() => {
    cy.visit("/auth");
  });

  it("renders the canonical wordmark and stable sign-in form", () => {
    cy.title().should("eq", "Nairaleap - Service Portal");
    cy.get('img[alt="Nairaleap - Service Portal"]')
      .should("be.visible")
      .and("have.attr", "src", "/nairaleap-wordmark.png");
    cy.get("#auth-email").should("be.visible").and("have.attr", "autocomplete", "email");
    cy.get("#auth-password")
      .should("be.visible")
      .and("have.attr", "autocomplete", "current-password");
    cy.contains("button", "Sign in").should("have.attr", "aria-pressed", "true");
    cy.contains("button", "Create account").should("be.visible");

    cy.screenshot("branding-auth-sign-in");
  });

  it("switches to the new-account state without losing the auth surface", () => {
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('[data-testid="auth-mode-sign-up"]').should("be.visible").click({ force: true });

    cy.get("h2").contains("Create your account").should("be.visible");
    cy.get("#auth-password").should("have.attr", "autocomplete", "new-password");
    cy.get('[data-testid="auth-mode-sign-up"]')
      .should("have.attr", "aria-pressed", "true")
      .and("be.visible");
    cy.get("#auth-email").should("be.visible");
    cy.get("#auth-password").should("be.visible");

    cy.screenshot("branding-auth-sign-up");
  });
});
