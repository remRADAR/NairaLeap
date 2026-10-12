const dialog = '[data-testid="nairaleap-guide-dialog"]';

function answerText(label: string, value: string) {
  cy.get(dialog)
    .contains("h3", label)
    .then(($heading) => {
      const headingId = $heading.attr("id");
      expect(headingId).to.be.a("string");
      cy.get(`${dialog} [aria-labelledby="${headingId}"]`).type(value);
    });
}

function nextQuestion() {
  cy.get(dialog)
    .contains("button", /^(Next|Submit)$/)
    .click();
}

function chooseOption(label: string) {
  cy.get(dialog).contains('[role="radio"]', label).click();
}

describe("Insurance portal and conditional onboarding", () => {
  it("shows the expanded insurance categories on the dedicated portal", () => {
    cy.visit("/insurance");

    [
      "Motor & Auto",
      "Health & Medical",
      "Home & Building",
      "Household Contents",
      "Agricultural",
      "Life & Protection",
      "Savings & Investment-Linked Insurance",
      "Personal & Retirement Annuities",
      "Education Savings & Endowment",
      "Group & Association",
      "Business & Commercial",
    ].forEach((category) => cy.contains("h3", category).should("be.visible"));

    cy.contains("button", "Start insurance guide").click();
    cy.get(dialog).should("be.visible");
    cy.get(dialog).find("input[aria-labelledby]").should("have.length", 3);
  });

  it("asks for an organization name only on the organization path and requires it there", () => {
    cy.visit("/insurance");
    cy.contains("button", "Start insurance guide").click();

    answerText("Full name", "Ada Example");
    answerText("Phone number", "+2348012345678");
    answerText("Email address", "ada@example.com");
    nextQuestion();
    chooseOption("Company, association or organization");

    cy.get(`${dialog} h3`).should("contain.text", "Registered or legal organization name");
    cy.get(dialog)
      .contains("button", /^Next$/)
      .should("be.disabled");
    answerText("Registered or legal organization name", "Example Farmers Cooperative");
    nextQuestion();
    cy.get(`${dialog} h3`).should("contain.text", "What do you need help with?");
    cy.get(`${dialog} h3`).should("contain.text", "What would you like to protect?");
  });

  it("uses a distinct annuity questionnaire and requires provider quote confirmation", () => {
    cy.visit("/insurance");
    cy.contains("button", "Start insurance guide").click();

    answerText("Full name", "Nneka Example");
    answerText("Phone number", "+2348098765432");
    answerText("Email address", "nneka@example.com");
    nextQuestion();
    chooseOption("Individual");
    nextQuestion();
    chooseOption("Get new cover");
    chooseOption("Personal & Retirement Annuities");
    nextQuestion();
    answerText("Where is the person, asset or activity located?", "Ikeja, Lagos");
    answerText("Tell us about the protection need", "I am exploring retirement-income options.");
    nextQuestion();

    // Skip the optional cover-start date, then the provider preference screen.
    nextQuestion();
    cy.get(`${dialog} h3`).should("contain.text", "Provider or cover preference");
    cy.get(`${dialog} h3`).should("contain.text", "Provider you would like to explore");
    cy.get(`${dialog} h3`).should("contain.text", "Annuity provider or product");
    nextQuestion();

    cy.get(`${dialog} h3`).should("contain.text", "Expected or current age");
    cy.get(`${dialog} h3`).should("contain.text", "Which annuity structure");
    cy.get(dialog)
      .contains("button", /^Next$/)
      .should("be.disabled");
    chooseOption("60–64");
    chooseOption("Deferred annuity enquiry");
    nextQuestion();
    cy.get(`${dialog} h3`).should("contain.text", "Preferred income-payment frequency");
    cy.get(dialog).should("not.contain.text", "What is the main goal for this plan?");

    nextQuestion();
    nextQuestion();
    cy.contains("Final rundown").should("be.visible");
    cy.contains("Quote required after review").should("be.visible");
    cy.contains("Sign in to submit").should("be.visible");
  });
});
