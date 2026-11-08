const EDITORIAL_TITLE = "NairaLeap Editorial — Nigerian Economy News, Indicators & Analysis";

function assertNoHorizontalOverflow() {
  cy.document().should((document) => {
    expect(document.documentElement.scrollWidth).to.be.at.most(
      document.documentElement.clientWidth,
    );
  });
}

describe("NairaLeap corporate identity on the editorial website", () => {
  it("presents the editorial homepage under the parent NairaLeap identity, not the service portal", () => {
    cy.visit("/");

    cy.title().should("eq", EDITORIAL_TITLE);
    cy.get('meta[name="description"]')
      .should("have.attr", "content")
      .and("include", "Nigeria")
      .and("include", "journalism");
    cy.get('meta[property="og:title"]').should("have.attr", "content", EDITORIAL_TITLE);
    cy.get('link[rel="canonical"]').should("have.attr", "href", "https://nairaleap.vercel.app/");
  });

  it("keeps the portal pages service-specific in their metadata", () => {
    cy.visit("/services");
    cy.title().should("include", "NairaLeap Services");
    cy.title().should("not.include", "NairaLeap Editorial");
    cy.get('meta[name="description"]')
      .should("have.attr", "content")
      .and("include", "Service discovery");
  });

  it("gives each corporate page a distinct document title", () => {
    const titles: string[] = [];

    ["/", "/about", "/disclaimer", "/privacy-policy"].forEach((path) => {
      cy.visit(path);
      cy.title().then((title) => {
        titles.push(title);
        expect(title).to.include("NairaLeap");
      });
    });

    cy.then(() => {
      expect(new Set(titles).size).to.equal(titles.length);
    });
  });
});

describe("canonical corporate pages", () => {
  it("loads the About NairaLeap page with the company story and contact anchor", () => {
    cy.visit("/about");

    cy.contains("h1", "About NairaLeap").should("be.visible");
    cy.get("#our-story").should("exist").and("contain.text", "Naira & Kobo");
    cy.get("#ecosystem").should("exist").and("contain.text", "NairaLeap Services");
    cy.get("#mission").should("exist");
    cy.get("#vision").should("exist").and("contain.text", "forces shaping Nigeria");
    cy.get("#contact").should("exist").and("contain.text", "hello@nairaleap.com");
    cy.contains("Draft — pending owner approval").should("be.visible");
    cy.contains("Last updated:").should("be.visible");
  });

  it("loads the site disclaimer covering both experiences", () => {
    cy.visit("/disclaimer");

    cy.contains("h1", "Disclaimer").should("be.visible");
    cy.get("#general-information").should("exist");
    cy.get("#financial-information").should("exist");
    cy.get("#insurance").should("exist");
    cy.get("#mortgage-lending").should("exist");
    cy.get("#property").should("exist");
    cy.get("#business-funding").should("exist");
    cy.get("#third-parties").should("exist");
    cy.get("#advertising").should("exist");
    cy.get("#ai-guidance").should("exist").and("contain.text", "pre-written guidance");
    cy.get("#service-requests")
      .should("exist")
      .and("contain.text", "not guaranteed offers");
    cy.get("#liability").should("exist");
  });

  it("loads the privacy policy grounded in the actual data flows", () => {
    cy.visit("/privacy-policy");

    cy.contains("h1", "Privacy Policy").should("be.visible");
    cy.get("#account-information").should("exist");
    cy.get("#service-request-information").should("exist");
    cy.get("#storage").should("exist").and("contain.text", "localStorage");
    cy.get("#lawful-bases").should("exist").and("contain.text", "pending confirmation");
    cy.get("#retention").should("exist").and("contain.text", "pending confirmation");
    cy.get("#rights").should("exist").and("contain.text", "Nigeria Data Protection Act");
    cy.contains("Draft — pending owner approval").should("be.visible");
  });
});

describe("editorial website footer", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("presents the NairaLeap brand, tagline and ecosystem description", () => {
    cy.get("footer").within(() => {
      cy.get('img[alt="NairaLeap"]').should("be.visible");
      cy.contains("Indicator Drivers").should("be.visible");
      cy.contains("NairaLeap is a Nigerian digital media, information and services ecosystem").should(
        "be.visible",
      );
    });
  });

  it("navigates from the footer to every destination", () => {
    cy.get('footer nav[aria-label="Explore"] a[href="/articles"]').click();
    cy.location("pathname").should("eq", "/articles");

    cy.get('footer nav[aria-label="Explore"] a[href="/archive"]').click();
    cy.location("pathname").should("eq", "/archive");

    cy.get('footer nav[aria-label="Explore"] a[href="/services"]').click();
    cy.location("pathname").should("eq", "/services");

    cy.get('footer nav[aria-label="Company"] a[href="/about"]').first().click();
    cy.location("pathname").should("eq", "/about");
    cy.location("hash").should("eq", "");

    cy.get('footer nav[aria-label="Legal"] a[href="/disclaimer"]').click();
    cy.location("pathname").should("eq", "/disclaimer");

    cy.get('footer nav[aria-label="Legal"] a[href="/privacy-policy"]').click();
    cy.location("pathname").should("eq", "/privacy-policy");
  });

  it("links Our Story and Contact to the About page anchors", () => {
    cy.get('footer nav[aria-label="Company"]')
      .contains("a", "Our Story")
      .should("have.attr", "href")
      .and("include", "/about#our-story");
    cy.get('footer nav[aria-label="Company"]')
      .contains("a", "Contact")
      .should("have.attr", "href")
      .and("include", "/about#contact");
  });

  it("carries a concise informational disclaimer linking the full disclaimer page", () => {
    cy.get("footer").within(() => {
      cy.contains("does not constitute financial, legal, insurance, mortgage or professional")
        .should("be.visible");
      cy.contains("a", "Read the full disclaimer").should(
        "have.attr",
        "href",
        "/disclaimer",
      );
    });
  });

  it("shows an accurate copyright notice for NairaLeap", () => {
    const year = new Date().getFullYear();
    cy.get("footer").contains(`© ${year} NairaLeap. All rights reserved.`).should("be.visible");
  });

  it("does not link generic platform homepages as official social accounts", () => {
    ["https://www.facebook.com/", "https://twitter.com/", "https://t.me/", "https://www.instagram.com/", "https://youtube.com/"].forEach(
      (href) => {
        cy.get(`footer a[href="${href}"]`).should("not.exist");
      },
    );
    cy.get("footer a[aria-label='Facebook']").should("not.exist");
    cy.get("footer a[aria-label='Twitter']").should("not.exist");
    cy.get("footer a[aria-label='Telegram']").should("not.exist");
    cy.get("footer a[aria-label='Instagram']").should("not.exist");
    cy.get("footer a[aria-label='YouTube']").should("not.exist");
  });

  it("keeps the corporate pages readable without horizontal overflow at tablet and mobile sizes", () => {
    ["/", "/about", "/disclaimer", "/privacy-policy"].forEach((path) => {
      cy.viewport(768, 1024);
      cy.visit(path);
      assertNoHorizontalOverflow();

      cy.viewport(375, 667);
      assertNoHorizontalOverflow();
    });
  });
});
