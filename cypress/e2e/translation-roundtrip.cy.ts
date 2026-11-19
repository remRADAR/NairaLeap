declare global {
  interface Window {
    __nairaLeapTranslationSelections?: string[];
  }
}

const googleTranslateStub = `(() => {
  window.__nairaLeapTranslationSelections = [];
  window.google = {
    translate: {
      TranslateElement: class {
        constructor(_options, targetId) {
          const host = document.getElementById(targetId);
          if (!host || host.querySelector(".goog-te-combo")) return;

          const combo = document.createElement("select");
          combo.className = "goog-te-combo";
          for (const [value, label] of [
            ["", "Choose language"],
            ["ha", "Hausa"],
            ["ig", "Igbo"],
            ["yo", "Yoruba"],
            ["tiv", "Tiv"],
          ]) {
            combo.add(new Option(label, value));
          }

          combo.addEventListener("change", () => {
            const value = combo.value;
            window.__nairaLeapTranslationSelections.push(value);
            document.cookie = "googtrans=/en/" + value + "; path=/";
            document.querySelectorAll("h1").forEach((heading) => {
              if (!heading.dataset.sourceText) heading.dataset.sourceText = heading.textContent || "";
              heading.textContent = value === "en"
                ? heading.dataset.sourceText
                : "[" + value + "] " + heading.dataset.sourceText;
            });
          });
          host.appendChild(combo);
        }
      },
    },
  };
  window.nairaLeapGoogleTranslateInit?.();
})();`;

describe("site translation round trip", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://translate.google.com/translate_a/element.js*", {
      statusCode: 200,
      headers: { "content-type": "application/javascript; charset=utf-8" },
      body: googleTranslateStub,
    }).as("googleTranslateScript");
  });

  it("translates a rotating homepage headline and restores English in place", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("nairaleap.locale", "en");
      },
    });

    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get(".site-translator-bar").should("not.exist");
    cy.get('button[aria-label="Open menu"]').click();
    cy.get('nav[aria-label="Editorial menu"]').within(() => {
      cy.get('[data-testid="language-availability-select"]').select("yor");
    });
    cy.window().its("localStorage").invoke("getItem", "nairaleap.locale").should("eq", "yor");
    cy.wait("@googleTranslateScript");
    cy.get(".goog-te-combo").should("have.value", "yo");
    cy.get(".editorial-hero-copy h1").should("contain.text", "[yo]");
    cy.get("html").should("have.attr", "lang", "yor");

    let selectionsBeforeCarousel = 0;
    cy.window().then((win) => {
      selectionsBeforeCarousel = (win.__nairaLeapTranslationSelections || []).filter(
        (value) => value === "yo",
      ).length;
    });
    cy.get('button[aria-label="Next featured story"]').click();
    cy.get(".editorial-hero-copy h1").should("contain.text", "[yo]");
    cy.window().then((win) => {
      const selectionsAfterCarousel = (win.__nairaLeapTranslationSelections || []).filter(
        (value) => value === "yo",
      ).length;
      expect(selectionsAfterCarousel).to.be.greaterThan(selectionsBeforeCarousel);
    });

    cy.get('[data-testid="language-availability-select"]').select("en");
    cy.get(".editorial-hero-copy h1").should("not.contain.text", "[yo]");
    cy.get(".goog-te-combo").should("have.value", "en");
    cy.get("html").should("have.attr", "lang", "en");
    cy.window().its("localStorage").invoke("getItem", "nairaleap.locale").should("eq", "en");
    cy.document().its("cookie").should("contain", "googtrans=/en/en");
  });

  it("reapplies the selected language after SPA navigation into the Services Portal", () => {
    cy.viewport(390, 844);
    cy.visit("/");
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.get('button[aria-label="Open menu"]').click();
    cy.get('nav[aria-label="Editorial menu"]').within(() => {
      cy.get('[data-testid="language-availability-select"]').select("yor");
    });
    cy.wait("@googleTranslateScript");
    cy.get(".goog-te-combo").should("have.value", "yo");
    cy.get(".editorial-hero-copy h1").should("contain.text", "[yo]");

    let selectionsBeforeNavigation = 0;
    cy.window().then((win) => {
      selectionsBeforeNavigation = (win.__nairaLeapTranslationSelections || []).filter(
        (value) => value === "yo",
      ).length;
    });

    cy.get('nav[aria-label="Editorial menu"]').within(() => {
      cy.contains("a", "NairaLeap services").click();
    });

    cy.location("pathname").should("eq", "/services");
    cy.title().should("eq", "NairaLeap — Services Portal");
    cy.get('[data-testid="services-portal-badge"]').should("be.visible");
    cy.get("html").should("have.attr", "lang", "yor");
    cy.window().should((win) => {
      const selectionsAfterNavigation = (win.__nairaLeapTranslationSelections || []).filter(
        (value) => value === "yo",
      ).length;
      expect(selectionsAfterNavigation).to.be.greaterThan(selectionsBeforeNavigation);
    });
    cy.get("main h1").should("contain.text", "[yo]");
  });
});
