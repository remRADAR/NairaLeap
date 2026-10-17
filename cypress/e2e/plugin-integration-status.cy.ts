describe("safe plugin integration status", () => {
  it("keeps English active and other interface locales disabled in the editorial nav", () => {
    cy.visit("/");

    cy.get('button[aria-label="Open menu"]').should("be.visible").click();
    cy.get('nav[aria-label="Editorial menu"] [data-testid="language-availability-select"]')
      .should("have.value", "en")
      .and("have.attr", "aria-describedby");
    cy.get(
      'nav[aria-label="Editorial menu"] [data-testid="language-availability-select"] option[value="hau"]',
    ).should("be.disabled");
    cy.get(
      'nav[aria-label="Editorial menu"] [data-testid="language-availability-select"] option[value="ibo"]',
    ).should("be.disabled");
    cy.get(
      'nav[aria-label="Editorial menu"] [data-testid="language-availability-select"] option[value="yor"]',
    ).should("be.disabled");
    cy.get(
      'nav[aria-label="Editorial menu"] [data-testid="language-availability-select"] option[value="tiv"]',
    ).should("be.disabled");
    cy.get('nav[aria-label="Editorial menu"]').within(() => {
      cy.contains("Nairaleap services").should("be.visible");
      cy.contains("Admin Studio").should("be.visible");
    });
  });

  it("keeps the article taxonomy out of the portal services shell", () => {
    cy.visit("/services");
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('a[href^="/?topic="]').should("not.exist");
    cy.contains("HUMAN DEVELOPMENT").should("not.exist");
    cy.contains("ECONOMIC DEVELOPMENT").should("not.exist");
    cy.contains("a", "Services").should("be.visible");
  });

  it("keeps the English-only status available from the portal mobile menu", () => {
    cy.viewport(390, 844);
    cy.visit("/services");
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('button[aria-label="Open menu"]').should("be.visible").click();

    cy.get('[data-testid="language-availability-select"]')
      .should("be.visible")
      .and("have.value", "en");
    cy.get('option[value="hau"]').should("be.disabled");
  });

  it("keeps Article Intelligence read-only and visibly unavailable on article details", () => {
    cy.visit("/articles/unbundling-nigerian-railway-corporation-for-rail-sector-reform");

    cy.get('[data-testid="article-intelligence-availability"]')
      .should("be.visible")
      .and("contain.text", "Not enabled")
      .and(
        "contain.text",
        "evidence submissions, comments, and automated verdicts are unavailable",
      );
    cy.get(
      '[data-testid="article-intelligence-availability"] button, [data-testid="article-intelligence-availability"] textarea',
    ).should("not.exist");
  });

  it("discloses that LeapBot read-aloud uses browser/device speech and does not request microphone access", () => {
    cy.visit("/services");
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('[aria-label="Open LeapBot chauffeur"]').click({ force: true });

    cy.get('[data-testid="leapbot-panel"]').within(() => {
      cy.get('[data-testid="leapbot-speech-disclosure"]').then(($disclosure) => {
        const disclosureId = $disclosure.attr("id");
        expect(disclosureId).to.be.a("string");
        cy.get('[aria-label="Read the latest LeapBot response aloud"]').should(
          "have.attr",
          "aria-describedby",
          disclosureId,
        );
      });
      cy.get('[data-testid="leapbot-speech-disclosure"]')
        .should("contain.text", "browser or device")
        .and("contain.text", "does not request microphone access or voice enrollment");
    });
  });

  it("reads the latest bot reply only after the user clicks the browser speech control", () => {
    cy.visit("/services", {
      onBeforeLoad(win) {
        cy.stub(win.speechSynthesis, "speak").as("speak");
      },
    });
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('[aria-label="Open LeapBot chauffeur"]').click({ force: true });
    cy.get("#leapbot-message").type("What is onboarding?{enter}");
    cy.get('[data-role="bot"]').should("have.length.at.least", 2);
    cy.get('[data-role="bot"]')
      .last()
      .invoke("text")
      .then((latestReply) => {
        cy.get("@speak").should("not.have.been.called");
        cy.get('[aria-label="Read the latest LeapBot response aloud"]').click();
        cy.get("@speak").should("have.been.calledOnce");
        cy.get("@speak").its("lastCall.args.0.text").should("equal", latestReply);
      });
  });
});
