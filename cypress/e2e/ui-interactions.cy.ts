const PRIMARY_NAV_LINK = 'header nav[aria-label="Primary"] a:first-child';
const SERVICE_CARD = '#services a[href="/services/agriculture"]';
const GUIDE_BUTTON = '[data-testid="homepage-guide-trigger"]';

describe("Portal UI hover and focus interactions", () => {
  beforeEach(() => {
    cy.visit("/services");
    cy.get('[data-app-hydrated="true"]').should("exist");
    cy.document().then((document) => {
      document.documentElement.style.scrollBehavior = "auto";
    });
  });

  it("asserts hover states and the expected touch-device fallback", () => {
    cy.get(PRIMARY_NAV_LINK).realHover();
    cy.wait(300);
    cy.window().then((appWindow) => {
      const hoverCapable = appWindow.matchMedia("(hover: hover)").matches;

      cy.get(PRIMARY_NAV_LINK).then(($link) => {
        expect($link[0].matches(":hover")).to.eq(true);
        const underline = appWindow.getComputedStyle($link[0], "::after");

        if (hoverCapable) {
          expect(underline.display).not.to.eq("none");
          expect(underline.opacity).to.eq("1");
          expect(new DOMMatrixReadOnly(underline.transform).m11).to.eq(1);
        } else {
          expect(underline.display).to.eq("none");
        }
      });
    });

    cy.get(SERVICE_CARD).scrollIntoView().realHover();
    cy.wait(380);
    cy.window().then((appWindow) => {
      const hoverCapable = appWindow.matchMedia("(hover: hover)").matches;

      cy.get(SERVICE_CARD).then(($card) => {
        const cardStyle = appWindow.getComputedStyle($card[0]);
        const iconStyle = appWindow.getComputedStyle($card.find(".interactive-card-icon")[0]);
        const arrowStyle = appWindow.getComputedStyle($card.find(".interactive-arrow")[0]);

        if (hoverCapable) {
          expect(cardStyle.transitionProperty).to.match(/all|transform/);
          expect(iconStyle.transitionProperty).to.match(/all|transform/);
          expect(arrowStyle.transitionProperty).to.match(/all|transform/);
        } else {
          expect(cardStyle.transitionProperty).to.match(/all|transform/);
          expect(iconStyle.transitionProperty).to.match(/all|transform/);
          expect(arrowStyle.transitionProperty).to.match(/all|transform/);
        }
      });
    });

    cy.get(GUIDE_BUTTON).scrollIntoView().realHover();
    cy.wait(520);
    cy.window().then((appWindow) => {
      const hoverCapable = appWindow.matchMedia("(hover: hover)").matches;

      cy.get(GUIDE_BUTTON).then(($button) => {
        expect($button[0].matches(":hover")).to.eq(true);
        const sheen = appWindow.getComputedStyle($button[0], "::after");
        const offset = new DOMMatrixReadOnly(sheen.transform).m41;

        if (hoverCapable) {
          expect(offset).to.be.greaterThan(0);
        } else {
          expect(offset).to.be.lessThan(0);
        }
      });
    });
  });

  it("shows visible keyboard-focus feedback on navigation, service cards, and actions", () => {
    cy.get('header a[aria-label="Nairaleap - Service Portal"]').focus();
    cy.realPress("Tab");
    cy.wait(260);
    cy.window().then((appWindow) => {
      cy.focused()
        .should("have.class", "portal-nav-link")
        .then(($link) => {
          expect($link[0].matches(":focus-visible")).to.eq(true);
          const underline = appWindow.getComputedStyle($link[0], "::after");

          expect(underline.display).not.to.eq("none");
          expect(underline.opacity).to.eq("1");
        });
    });

    cy.get(SERVICE_CARD)
      .scrollIntoView()
      .focus()
      .then(($card) => {
        expect($card[0].matches(":focus-visible")).to.eq(true);
      });
    cy.wait(360);
    cy.window().then((appWindow) => {
      cy.get(SERVICE_CARD).then(($card) => {
        expect(appWindow.getComputedStyle($card[0]).boxShadow).not.to.eq("none");
      });
    });

    cy.get(GUIDE_BUTTON).scrollIntoView().focus();
    cy.wait(520);
    cy.window().then((appWindow) => {
      cy.get(GUIDE_BUTTON).then(($button) => {
        expect($button[0].matches(":focus-visible")).to.eq(true);
        expect(appWindow.getComputedStyle($button[0], "::after").transitionProperty).to.contain(
          "transform",
        );
      });
    });
  });
});
