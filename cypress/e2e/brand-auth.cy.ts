describe("canonical NairaLeap branding", () => {
  it("renders the canonical wordmark in the shared portal header", () => {
    cy.visit("/services");

    cy.title().should("eq", "NairaLeap — Indicator Drivers");
    cy.get('header a[aria-label="NairaLeap — Indicator Drivers"] img')
      .should("be.visible")
      .and("have.attr", "src", "/nairaleap-3d-logo.png")
      .and("have.attr", "alt", "NairaLeap — Indicator Drivers");
    cy.get('header a[aria-label="Go to NairaLeap editorial site"]:visible')
      .should("be.visible")
      .and("have.attr", "href", "/");

    cy.screenshot("branding-home-header");
  });

  it("serves the favicon and manifest with the canonical icon family", () => {
    cy.request("/favicon.ico?v=20261114-3d-logo")
      .its("headers.content-type")
      .should((contentType) => {
        const mediaType = contentType.split(";")[0].toLowerCase();

        expect(["image/x-icon", "image/vnd.microsoft.icon"]).to.include(mediaType);
      });

    cy.request("/manifest.webmanifest")
      .its("body")
      .should((manifest) => {
        expect(manifest.name).to.equal("NairaLeap — Indicator Drivers");
        expect(manifest.icons).to.deep.include({
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        });
        expect(manifest.icons).to.deep.include({
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        });
      });
  });
});

describe("authentication branding and entry states", () => {
  beforeEach(() => {
    cy.visit("/auth");
  });

  it("renders the canonical wordmark and stable sign-in form", () => {
    cy.title().should("eq", "NairaLeap — Indicator Drivers");
    cy.get('img[alt="NairaLeap — Indicator Drivers"]')
      .should("be.visible")
      .and("have.attr", "src", "/nairaleap-3d-logo.png");
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

describe("homepage campaign advertising", () => {
  it("renders the five-slide campaign carousel in the top advert slot", () => {
    cy.visit("/");
    cy.get('section[aria-label="Advertise with NairaLeap"] img').should("have.length", 5);
    cy.get('section[aria-label="Advertise with NairaLeap"] button[aria-label^="Show "]').should(
      "have.length",
      5,
    );
  });
});
