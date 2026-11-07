describe("Editorial homepage restoration", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("h2", "Top Stories").should("be.visible");
  });

  it("keeps ten story previews, restores both ad spaces, and links to the full archive", () => {
    cy.contains("h2", "Top Stories").should("be.visible");
    cy.get('section[aria-label="Featured story"] img[src]').should("exist");
    cy.get('section[aria-label="Featured story"] img[src]').should(($image) => {
      expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
    });
    cy.get("article.editorial-story-card").should("have.length", 9);
    cy.get("article.editorial-story-card img[src]").should("have.length", 9);
    cy.get('section[aria-label="Advertisement"]').should("have.length", 2);
    cy.get('section[aria-label="Desk ticker"]').should("not.exist");
    cy.get('section[aria-label="Taxonomy ticker"]').should("be.visible");
    cy.get('section[aria-label="Taxonomy ticker"] a').should("have.length", 12);
    cy.get('section[aria-label="Taxonomy ticker"]').contains("Latest").should("be.visible");
    cy.get('section[aria-label="Taxonomy ticker"]').should("not.contain", "Latest indicators");
    cy.get('section[aria-label="More perspectives"]').should("be.visible");
    cy.get('section[aria-label="More perspectives"] a').should("have.length", 5);
    cy.contains("Showing 10 featured stories").should("be.visible");

    cy.contains("a", "Browse all articles").click();
    cy.location("pathname").should("eq", "/archive");
    cy.contains("h1", "Every indicator, in one place.").should("be.visible");
  });

  it("shows Nigerian date and time and updates the date at midnight", () => {
    cy.clock(Date.parse("2026-11-06T22:59:59.000Z"), ["Date", "setInterval", "clearInterval"]);
    cy.visit("/");

    cy.get('[data-testid="editorial-clock"]')
      .should("contain", "Friday, November 6, 2026")
      .and("contain", "11:59:59 PM WAT");

    cy.tick(1000);

    cy.get('[data-testid="editorial-clock"]')
      .should("contain", "Saturday, November 7, 2026")
      .and("contain", "12:00:00 AM WAT");
  });

  it("recovers with a local fallback when a featured image fails to load", () => {
    cy.intercept("GET", "**/editorial/recovered/**", { statusCode: 404 }).as(
      "missingFeaturedImage",
    );
    cy.visit("/");

    cy.get('section[aria-label="Featured story"] img[data-editorial-image]')
      .should("have.attr", "data-fallback-applied", "true")
      .should(($image) => {
        expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      });
  });

  it("keeps the full date and time readable on a mobile viewport", () => {
    cy.viewport(375, 812);
    cy.visit("/");

    cy.get('[data-testid="editorial-clock"]')
      .should("be.visible")
      .and("contain", "WAT")
      .should(($clock) => {
        expect($clock.text().trim()).to.match(/\d{1,2}:\d{2}:\d{2} (AM|PM) WAT/);
        expect(Number.parseFloat(getComputedStyle($clock[0]).fontSize)).to.be.at.least(12);
        const { left, right } = $clock[0].getBoundingClientRect();
        expect(left).to.be.at.least(0);
        expect(right).to.be.at.most(375);
      });
  });

  it("opens the archive filtered to the selected homepage story category", () => {
    cy.get("article.editorial-story-card")
      .first()
      .find("a")
      .first()
      .then(($category) => {
        const category = $category
          .text()
          .trim()
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        cy.wrap($category).click();
        cy.location("pathname").should("eq", "/archive");
        cy.location("search").should("include", `topic=${category}`);
        cy.contains("Showing stories for").should("be.visible");
      });
  });

  it("keeps article detail imagery present after a direct route load", () => {
    cy.visit("/articles/police-nab-three-cops-after-alleged-extortion-of-abia-travellers");
    cy.contains("h1", "police", { matchCase: false }).should("be.visible");
    cy.get("article > header img[src]").should("be.visible");
    cy.get("article > header img[src]").should(($image) => {
      expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
    });
  });
});
