describe("Admin Studio access boundary", () => {
  it("redirects unauthenticated visitors to the dedicated admin login", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/admin");
    cy.location("pathname").should("eq", "/admin-login");
    cy.contains("h1", "Admin Studio sign in").should("be.visible");
    cy.get('input[autocomplete="username"]').should("be.visible");
    cy.get('input[autocomplete="current-password"]').should("be.visible");
    cy.contains("button", "Open Admin Studio").should("be.visible");
    cy.contains("Open the service portal sign in").should("have.attr", "href", "/auth");
  });

  it("keeps the customer sign-in surface separate", () => {
    cy.visit("/auth");
    cy.contains("button", "Sign in").should("be.visible");
    cy.contains("Secure customer access").should("be.visible");
    cy.get('a[href="/admin-login"]').should("not.exist");
  });
});
