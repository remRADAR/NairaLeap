describe("Admin Studio workspace", () => {
  beforeEach(() => {
    cy.visit("/admin");
    cy.clearLocalStorage();
    cy.reload();
    cy.contains("h1", "Control the website.").should("be.visible");
  });

  it("switches between website and service portal workspaces", () => {
    cy.contains("button", "Service Portal").click();
    cy.contains("h1", "Control the service portal.").should("be.visible");
    cy.contains("button", "Portal overview").should("have.class", "bg-[#f2ebff]");

    cy.contains("button", "Service catalog").click();
    cy.contains("h2", "Service catalog").should("be.visible");
    cy.contains("a", "View portal").should("have.attr", "href", "/services");

    cy.contains("button", "Website").click();
    cy.contains("h1", "Control the website.").should("be.visible");
    cy.contains("button", "Overview").should("have.class", "bg-[#f2ebff]");
  });

  it("publishes an article and opens its public detail route", () => {
    const title = "Cypress Admin Regression Article";
    const slug = "cypress-admin-regression-article";

    cy.contains("button", "Open article studio").click();
    cy.contains("h2", "Publish an article").should("be.visible");
    cy.get('input[placeholder="Article headline"]').type(title);
    cy.get("select")
      .first()
      .find("option")
      .eq(1)
      .then(($option) => {
        cy.get("select")
          .first()
          .select($option.val() as string);
      });
    cy.get('input[placeholder="Add a custom tag"]').type("cypress-regression");
    cy.contains("button", "Add").click();
    cy.get('textarea[placeholder="Short summary for cards and metadata"]').type(
      "A regression article created by the admin studio test.",
    );
    cy.get('textarea[placeholder="Write the article body. Blank lines become paragraphs."]').type(
      "This article verifies the studio publishing flow.\n\nIt should be available on its detail route.",
    );
    cy.contains("button", "Publish article").click();

    cy.contains(`Published “${title}” to the Website workspace.`).should("be.visible");
    cy.contains("a", "Published successfully — view article")
      .should("be.visible")
      .and("have.attr", "href", `/articles/${slug}`)
      .click();
    cy.location("pathname").should("eq", `/articles/${slug}`);
    cy.contains("h1", title).should("be.visible");
  });

  it("creates, renames, and deletes a top-level category", () => {
    const categoryName = "Cypress Regression Category";
    const renamedCategory = "Cypress Renamed Category";

    cy.contains("button", "Categories").click();
    cy.contains("h2", "Category builder").should("be.visible");
    cy.get('input[placeholder="New category name"]').type(categoryName);
    cy.get('input[placeholder="New category name"]').closest("form").find("select").select("0");
    cy.contains("button", "Add").click();
    cy.contains("p", "Category created in the studio taxonomy.").should("be.visible");

    cy.contains("h3", categoryName)
      .closest('[class*="rounded-2xl"]')
      .within(() => {
        cy.contains("button", "Rename").click();
      });
    cy.get(`input[aria-label="Rename ${categoryName}"]`)
      .clear()
      .type(renamedCategory)
      .closest('[class*="rounded-2xl"]')
      .contains("button", "Save")
      .click();
    cy.contains(`Updated “${renamedCategory}” and its category path.`).should("be.visible");
    cy.contains("h3", renamedCategory).should("be.visible");

    cy.contains("h3", renamedCategory)
      .closest('[class*="rounded-2xl"]')
      .within(() => {
        cy.contains("button", "Delete").click();
      });
    cy.contains(`Deleted “${renamedCategory}”.`).should("be.visible");
    cy.contains("h3", renamedCategory).should("not.exist");
  });
});
