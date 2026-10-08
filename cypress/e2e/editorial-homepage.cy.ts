describe("Editorial homepage restoration", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("h2", "Top Stories").should("be.visible");
  });

  it("keeps ten story previews, restores both ad spaces, and links to the full archive", () => {
    cy.contains("h2", "Top Stories").should("be.visible");
    cy.get('section[aria-label="Featured story"] img[src]').should("exist");
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
  });
});
