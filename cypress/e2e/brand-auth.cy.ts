describe("canonical NairaLeap branding", () => {
  it("renders the canonical wordmark in the shared portal header", () => {
    cy.visit("/services");

    cy.title().should("eq", "NairaLeap — Services Portal");
    cy.get('header a[aria-label="NairaLeap — Services Portal"] img')
      .should("be.visible")
      .and("have.attr", "src", "/nairaleap-3d-logo.png?v=20261119-official-logo")
      .and("have.attr", "alt", "NairaLeap — Services Portal");
    cy.get('header a[aria-label="Go to Indicator Drivers"]:visible')
      .should("be.visible")
      .and("have.attr", "href", "/");

    cy.screenshot("branding-home-header");
  });

  it("serves the favicon and manifest with the canonical icon family", () => {
    cy.request("/favicon.ico?v=20261119-official-logo")
      .its("headers.content-type")
      .should("include", "image/x-icon");

    cy.request("/manifest.webmanifest")
      .its("body")
      .should((manifest) => {
        expect(manifest.name).to.equal("NairaLeap — Indicator Drivers");
        expect(manifest.icons).to.deep.include({
          src: "/icons/icon-192.png?v=20261119-official-logo",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        });
        expect(manifest.icons).to.deep.include({
          src: "/icons/icon-512.png?v=20261119-official-logo",
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
    cy.title().should("eq", "Sign in — NairaLeap — Services Portal");
    cy.get('img[alt="NairaLeap — Services Portal"]')
      .should("be.visible")
      .and("have.attr", "src", "/nairaleap-3d-logo.png?v=20261119-official-logo");
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

describe("editorial and portal identity labels", () => {
  it("shows Indicator Drivers on the main site and Services Portal only in the portal", () => {
    cy.visit("/");
    cy.title().should("eq", "NairaLeap — Indicator Drivers");
    cy.get('[data-testid="indicator-drivers-badge"]')
      .should("be.visible")
      .and("have.text", "Indicator Drivers");
    cy.get('[data-testid="services-portal-badge"]').should("not.exist");

    cy.visit("/services");
    cy.title().should("eq", "NairaLeap — Services Portal");
    cy.get('[data-testid="services-portal-badge"]')
      .should("be.visible")
      .and("have.text", "Services Portal");
    cy.get('[data-testid="indicator-drivers-badge"]').should("not.exist");
  });
});

describe("homepage campaign advertising", () => {
  it("renders five-slide campaign carousels in both advert slots", () => {
    cy.visit("/");
    cy.get('section[aria-label="Advertise with NairaLeap"]')
      .should("have.length", 2)
      .each(($slot) => {
        cy.wrap($slot).find("img").should("have.length", 5);
        cy.wrap($slot).find('button[aria-label^="Show "]').should("have.length", 5);
      });
  });
});
