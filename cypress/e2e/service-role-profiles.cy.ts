const ROLE_PROFILES = [
  {
    id: "agriculture",
    customer: "farmer / grower",
    seller: "input seller or provider",
    customerField: "What outcome do you want from your farm?",
    sellerField: "What farm inputs or services do you provide?",
  },
  {
    id: "property-listings",
    customer: "buyer or renter",
    seller: "property owner, agent, or developer",
    customerField: "What property are you looking for?",
    sellerField: "What is your relationship to the property?",
  },
  {
    id: "business-funding",
    customer: "business owner or funding applicant",
    seller: "lender, investor, or grant provider",
    customerField: "What will the funding enable?",
    sellerField: "What funding or capital do you provide?",
  },
  {
    id: "partnerships",
    customer: "partner or collaborator",
    seller: "partner, collaborator, or opportunity holder",
    customerField: "What do you want a partner to help achieve?",
    sellerField: "What partnership opportunity are you offering?",
  },
  {
    id: "vendor-marketplace",
    customer: "buyer or procurement customer",
    seller: "vendor, merchant, or service provider",
    customerField: "What do you need to buy?",
    sellerField: "What products or services do you offer?",
  },
  {
    id: "distress-sales",
    customer: "buyer or distressed-asset investor",
    seller: "owner, seller, or liquidator",
    customerField: "What distressed asset are you looking for?",
    sellerField: "Why is the sale time-sensitive?",
  },
  {
    id: "recycling-scrap",
    customer: "recycler or material buyer",
    seller: "material seller, collector, or waste holder",
    customerField: "What material do you need?",
    sellerField: "What material do you have?",
  },
  {
    id: "business-briefs",
    customer: "reader, subscriber, or decision-maker",
    seller: "publisher, researcher, or insight provider",
    customerField: "What decisions should the briefs help you make?",
    sellerField: "What insight or content do you provide?",
  },
  {
    id: "professional-services",
    customer: "client seeking an expert",
    seller: "professional, consultant, or specialist",
    customerField: "What expert outcome do you need?",
    sellerField: "What expertise do you offer?",
  },
  {
    id: "customer-support",
    customer: "customer or platform user",
    seller: "service provider or platform partner",
    customerField: "What would a good resolution look like?",
    sellerField: "Which provider or partner workflow needs help?",
  },
  {
    id: "insurance",
    customer: "seeking cover or policy support",
    seller: "insurer, broker, agent, or cover provider",
    customerField: "What risk or asset needs protection?",
    sellerField: "What cover or insurance service do you provide?",
  },
  {
    id: "mortgage",
    customer: "homebuyer or borrower",
    seller: "lender, PMB, developer, or housing-finance provider",
    customerField: "What housing outcome are you pursuing?",
    sellerField: "What housing-finance pathway do you provide?",
  },
] as const;

describe("service-specific role profiles", () => {
  for (const profile of ROLE_PROFILES) {
    it(`uses tailored ${profile.id} role tags and customer intake`, () => {
      cy.visit(`/services/${profile.id}`);
      cy.get('[data-testid="service-start-onboarding"]')
        .should("contain.text", profile.customer)
        .click({ force: true });
      cy.get('[data-testid="nairaleap-guide-dialog"]')
        .should("contain.text", profile.customer)
        .and("contain.text", profile.customerField)
        .and("not.contain.text", profile.sellerField);
    });

    it(`uses tailored ${profile.id} provider intake`, () => {
      cy.visit(`/services/${profile.id}`);
      cy.get('[data-testid="service-seller-onboarding"]')
        .should("contain.text", profile.seller)
        .click({ force: true });
      cy.get('[data-testid="nairaleap-guide-dialog"]')
        .should("contain.text", profile.seller)
        .and("contain.text", profile.sellerField)
        .and("not.contain.text", profile.customerField);
    });
  }
});
