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
        .should("exist")
        .and("contain.text", title)
        .and("contain.text", "Learn more");
    });
  });

  it("adds interactive feedback to navigation, service cards, and intake fields", () => {
    cy.get('header nav[aria-label="Primary"] a')
      .first()
      .should("have.class", "portal-nav-link")
      .then(($link) => {
        const underline = window.getComputedStyle($link[0], "::after");

        expect(underline.transitionDuration).to.contain("0.24s");
      });

    cy.get('#services a[href="/services/agriculture"] .interactive-card-icon')
      .should("exist")
      .then(($icon) => {
        expect(window.getComputedStyle($icon[0]).transitionDuration).to.contain("0.26s");
      });

    cy.visit("/services/agriculture");
    activate('[data-testid="service-start-onboarding"]');
    cy.get(
      '#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"] input[placeholder="Type your answer"]',
    )
      .should("have.class", "portal-field")
      .and("have.focus")
      .then(($field) => {
        const style = window.getComputedStyle($field[0]);

        expect(style.transitionProperty).to.contain("border-color");
        expect(style.boxShadow).not.to.eq("none");
      });
  });

  SERVICE_CASES.forEach(({ id, title }) => {
    it(`opens the ${title} landing page before onboarding`, () => {
      cy.get(`#services a[href="/services/${id}"]`).click();

      cy.location("pathname").should("eq", `/services/${id}`);
      cy.assertServicePage(title);
      cy.get("#service-page-title").should("be.visible").and("have.text", title);
      cy.get("#services").should("not.exist");
      cy.get(".service-page-shell").should("have.attr", "data-service-id", id);
      cy.get('[role="dialog"]').should("not.exist");
    });
  });

  it("keeps a service detail page within one desktop viewport", () => {
    cy.viewport(1280, 800);
    cy.visit("/services/agriculture");

    cy.get("footer").should("not.be.visible");
    cy.document().should((document) => {
      expect(document.documentElement.scrollHeight).to.be.at.most(
        document.documentElement.clientHeight,
      );
    });
  });

  it("opens Agriculture onboarding directly from its dedicated landing page", () => {
    cy.visit("/services/agriculture");
    cy.get('[data-testid="nairaleap-guide-dialog"]').should("not.exist");
    cy.assertServicePage("Agriculture");

    activate('[data-testid="service-start-onboarding"]');

    cy.location("pathname").should("eq", "/services/agriculture");
    cy.get('[data-testid="service-start-onboarding"]').should("have.attr", "aria-expanded", "true");
    cy.get('#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]')
      .should("be.visible")
      .and("contain.text", "Agriculture")
      .and("contain.text", "Question 1 of")
      .and("contain.text", "Full name");
    cy.get(
      '#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"] input[placeholder="Type your answer"]',
    ).should("be.visible");
  });

  it("blocks Agriculture users from skipping required onboarding questions", () => {
    cy.visit("/services/agriculture");
    activate('[data-testid="service-start-onboarding"]');

    const dialog = '#nairaleap-guide-dialog[data-testid="nairaleap-guide-dialog"]';
    cy.get(dialog).within(() => {
      cy.contains("Question 1 of").should("be.visible");
      cy.get("h3").should("contain.text", "Full name");
      cy.contains("button", "Next")
        .should("be.disabled")
        .and("have.attr", "aria-disabled", "true")
        .click({ force: true });
      cy.contains("Question 1 of").should("be.visible");
      cy.contains("button", "Submit").should("not.exist");

      cy.get('input[placeholder="Type your answer"]')
        .should("be.visible")
        .type("Agriculture Audit User");
      cy.contains("button", "Next").should("not.be.disabled").click();
      cy.contains("Question 2 of").should("be.visible");
      cy.get("h3").should("contain.text", "Phone number");

      cy.contains("button", "Previous").click();
      cy.get('input[placeholder="Type your answer"]').clear().should("have.value", "");
      cy.contains("button", "Next").should("be.disabled");
    });

    cy.location("pathname").should("eq", "/services/agriculture");
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

  it("keeps the viewport background mounted while service images crossfade", () => {
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('[data-testid="portal-background"]').then(($background) => {
      const persistentBackground = $background[0];

      cy.get('#services a[href="/services/agriculture"]').click();
      cy.location("pathname").should("eq", "/services/agriculture");
      cy.get('[data-testid="portal-background"]').should(($current) => {
        expect($current[0]).to.eq(persistentBackground);
      });
      cy.get(
        '[data-testid="portal-background-layer"][data-service-id="agriculture"][data-active="true"]',
      ).should("exist");

      cy.intercept(
        "GET",
        "**/service-backgrounds/vendor-marketplace-background.webp",
        (request) => {
          request.on("response", (response) => {
            response.setDelay(350);
          });
        },
      ).as("vendorBackground");
      cy.get('main a[href="/services/vendor-marketplace"]').click();
      cy.location("pathname").should("eq", "/services/vendor-marketplace");
      cy.get(
        '[data-testid="portal-background-layer"][data-service-id="agriculture"][data-active="true"]',
      ).should("exist");
      cy.wait("@vendorBackground");
      cy.get(
        '[data-testid="portal-background-layer"][data-service-id="vendor-marketplace"][data-active="true"]',
      ).should("exist");
      cy.get('[data-testid="portal-background"]').should(($current) => {
        expect($current[0]).to.eq(persistentBackground);
      });
      cy.get(".page-transition").should(($transition) => {
        expect(window.getComputedStyle($transition[0]).transform).to.eq("none");
      });

      cy.contains("main a", "Back to services").click();
      cy.location("pathname").should("eq", "/");
      cy.get('[data-testid="portal-background"]').should(($current) => {
        expect($current[0]).to.eq(persistentBackground);
        expect($current).to.have.attr("data-target-service-id", "");
      });
      cy.get(
        '[data-testid="portal-background-layer"][data-service-id="vendor-marketplace"]',
      ).should("have.attr", "data-active", "false");
      cy.get(
        '[data-testid="portal-background-layer"][data-service-id="vendor-marketplace"]',
      ).should("not.exist");
    });
  });

  it("returns to the homepage Services section from a dedicated page", () => {
    cy.get('#services a[href="/services/insurance"]').click();
    cy.contains("header a", "Services").click();

    cy.location("pathname").should("eq", "/");
    cy.location("hash").should("eq", "#services");
    cy.get("#services").should("be.visible");
  });

  it("does not render the removed lower quick-access dock", () => {
    cy.get('nav[aria-label="Portal quick access"]').should("not.exist");
  });

  it("keeps the homepage Guide as a separate service-discovery path", () => {
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('[data-testid="homepage-guide-trigger"]').click({ force: true });

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

  it("uses a resolvable branded background for every service landing page", () => {
    SERVICE_CASES.forEach(({ id }) => {
      cy.visit(`/services/${id}`);
      cy.get(`[data-service-id="${id}"]`)
        .should("have.class", "service-page-shell")
        .then(() => {
          cy.get(
            `[data-testid="portal-background-layer"][data-service-id="${id}"][data-active="true"]`,
          ).should(($layer) => {
            const backgroundImage = window.getComputedStyle($layer[0]).backgroundImage;

            expect(backgroundImage).to.contain(`/service-backgrounds/${id}-background.webp`);
          });
        });
      cy.request(`/service-backgrounds/${id}-background.webp`).its("status").should("eq", 200);
    });
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
