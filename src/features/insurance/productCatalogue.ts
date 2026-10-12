export type InsuranceProductCategory =
  "savings-investment" | "personal-annuity" | "education-endowment" | "home-property";

export interface InsuranceProviderSnapshot {
  legalName: string;
  officialWebsite: string;
  naicomMcrReference: string;
  naicomMcrClass: string;
  naicomMcrSource: string;
}

export interface InsuranceProductSnapshot {
  id: string;
  name: string;
  provider: InsuranceProviderSnapshot;
  category: InsuranceProductCategory;
  intendedCustomer: string;
  publishedTerms: string[];
  formalApplicationDocuments: string[];
  sourceUrl: string;
  additionalSources?: Array<{ label: string; url: string }>;
  lastChecked: string;
  ratingStatus: "No verified comparable ratings available";
  availabilityStatus: "Provider confirmation required";
}

const NAICOM_MCR_SOURCE =
  "https://naicom.gov.ng/wp-content/uploads/2026/08/List-of-Insurance-Companies-that-Complied-with-the-MCR-Prescribed-by-NIIRA-2025.pdf";

const LEADWAY: InsuranceProviderSnapshot = {
  legalName: "Leadway Assurance Company Limited",
  officialWebsite: "https://www.leadway.com/",
  naicomMcrReference: "LIC 002",
  naicomMcrClass: "Composite",
  naicomMcrSource: NAICOM_MCR_SOURCE,
};

const AIICO: InsuranceProviderSnapshot = {
  legalName: "AIICO Insurance Plc",
  officialWebsite: "https://www.aiicoplc.com/",
  naicomMcrReference: "LIC 006",
  naicomMcrClass: "Composite",
  naicomMcrSource: NAICOM_MCR_SOURCE,
};

const IGI: InsuranceProviderSnapshot = {
  legalName: "Industrial and General Insurance Plc",
  officialWebsite: "https://www.iginigeria.com/",
  naicomMcrReference: "LIC 038",
  naicomMcrClass: "Composite",
  naicomMcrSource: NAICOM_MCR_SOURCE,
};

const STANBIC_IBTC: InsuranceProviderSnapshot = {
  legalName: "Stanbic IBTC Insurance Limited",
  officialWebsite: "https://www.stanbicibtcinsurance.com/",
  naicomMcrReference: "LIC 018",
  naicomMcrClass: "Life",
  naicomMcrSource: NAICOM_MCR_SOURCE,
};

/**
 * Source-checked product summaries, not offers, recommendations, live quotes,
 * or proof of a commercial relationship with NairaLeap. Provider pages and
 * terms change; re-confirm product terms, licensing and availability before
 * making any referral or collecting formal-application data.
 */
export const INSURANCE_VERIFIED_PRODUCTS: InsuranceProductSnapshot[] = [
  {
    id: "leadway-investment-plan",
    name: "Investment Plan",
    provider: LEADWAY,
    category: "savings-investment",
    intendedCustomer: "Applicants considering a lump-sum investment-linked insurance policy.",
    publishedTerms: [
      "Leadway's official page describes a lump sum held for an agreed policy term of 1–20 years.",
      "The page lists life cover and optional critical-illness and accidental-permanent-disability cover.",
      "The public page does not provide a live individualized illustration or a current rate for this portal to reproduce.",
    ],
    formalApplicationDocuments: [
      "Leadway's product page lists valid identification, a passport photograph and a completed proposal form.",
      "These are provider-published formal application items, not requirements for this NairaLeap discovery enquiry.",
    ],
    sourceUrl: "https://www.leadway.com/leadway-investment-plan/",
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "leadway-savings-plan",
    name: "Savings Plan",
    provider: LEADWAY,
    category: "savings-investment",
    intendedCustomer: "Applicants saving toward a medium-term personal goal.",
    publishedTerms: [
      "The official page states a minimum monthly premium of ₦10,000 and monthly, quarterly, semi-annual or annual payment frequencies.",
      "The page says additional contributions must be at least ₦10,000; its FAQ describes a policy loan subject to agreement and once-yearly partial surrender after one active year (₦50,000 minimum, up to 25% of policy value).",
      "The page states a minimum policy term of 3 years and describes optional critical-illness or accidental-permanent-disability cover.",
      "Full surrender is subject to provider conditions and possible penalties; request the current policy wording and illustration before comparing.",
      "No rate, maturity value or personalized benefit is quoted by NairaLeap.",
    ],
    formalApplicationDocuments: [
      "The official page lists valid identification and a completed proposal/KYC form for offline purchases.",
      "Provider-specific formal application only; not required for this initial enquiry.",
    ],
    sourceUrl: "https://www.leadway.com/leadway-savings-plan/",
    additionalSources: [
      {
        label: "Leadway savings and investments overview",
        url: "https://www.leadway.com/savings-investments/",
      },
    ],
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "leadway-target-plan",
    name: "Target Plan",
    provider: LEADWAY,
    category: "education-endowment",
    intendedCustomer: "Applicants planning toward a future target amount or milestone.",
    publishedTerms: [
      "Leadway describes the plan as a defined-benefit endowment policy, not a conventional savings account.",
      "The page states that the target sum assured is payable when due when premiums are paid as due, subject to its policy terms.",
      "Optional critical-illness and accidental-total-and-permanent-disability covers are listed; maturity proceeds may be converted to an annuity subject to provider terms.",
      "The page states a 10% per-annum prorated late-premium charge, which may change, and says risk may be reassessed after non-payment exceeds one year.",
      "Current price, target, term and missed-payment effects require an insurer-issued illustration and policy wording.",
    ],
    formalApplicationDocuments: [
      "Leadway's page lists valid identification, a passport photograph and a completed proposal form for offline purchases.",
      "These provider-specific items are not collected in the initial NairaLeap enquiry.",
    ],
    sourceUrl: "https://www.leadway.com/leadway-target-plan/",
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "leadway-smart-cash-plan",
    name: "Smart Cash Plan",
    provider: LEADWAY,
    category: "savings-investment",
    intendedCustomer: "Applicants exploring a renewable short-term savings and life-cover policy.",
    publishedTerms: [
      "The official page states premiums from ₦5,000 monthly, a one-year renewable term and additional life-insurance cover up to ₦2,000,000.",
      "The page describes interest as competitive but does not provide a live individualized quote in this portal.",
      "The provider page states that full surrender can forfeit accrued interest and premiums relating to life cover; ask for current surrender and renewal terms.",
    ],
    formalApplicationDocuments: [
      "The official page lists valid identification and a completed proposal form for offline purchases.",
      "Pre-existing conditions and cover are handled by the provider during formal application; this portal does not collect medical histories.",
    ],
    sourceUrl: "https://www.leadway.com/leadway-smart-cash-plan/",
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "aiico-income-investment-plan",
    name: "Income Investment Plan",
    provider: AIICO,
    category: "savings-investment",
    intendedCustomer: "Applicants considering a long-term investment-linked insurance policy.",
    publishedTerms: [
      "AIICO describes this as an investment-linked policy combining investment, savings and insurance protection.",
      "The current product page lists monthly minimum contributions of ₦5,000, policy durations of 10, 12, 15 or 20 years, and insurance periods of 6, 9, 12 or 15 years.",
      "The page describes target-savings contributions, account crediting, a loan up to 70% of account balance after three years, and maturity/death benefits; verify current product wording and illustration directly with AIICO.",
      "The reviewed page provides no numerical interest rate, charges or individualized illustration.",
    ],
    formalApplicationDocuments: [
      "The official form-download page we checked did not expose a clearly labelled current application form for this specific product; confirm the correct pack and requirements with AIICO.",
      "Do not submit provider application or bank details through this discovery form.",
    ],
    sourceUrl: "https://www.aiicoplc.com/home/home-insurance/new-income-investment",
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "leadway-personal-annuity",
    name: "Personal Annuity Plan",
    provider: LEADWAY,
    category: "personal-annuity",
    intendedCustomer:
      "Applicants approaching or in retirement who want to request an insurer quote for lifetime income.",
    publishedTerms: [
      "The official page describes monthly or quarterly income payments, a guaranteed-period option and spouse continuation options of 50% or 75%.",
      "The page lists an increasing-annuity option with annual increases of 5% or 7.5%, and profit participation; the actual quote depends on the selected design and insurer calculation.",
      "The page describes a purchase using RSA balance and/or additional permitted funds; confirm current Pension Reform Act and provider eligibility rules before application.",
    ],
    formalApplicationDocuments: [
      "The official page lists a completed proposal form, valid identification and a recent passport photograph.",
      "These provider-specific items are for formal application, not initial discovery.",
    ],
    sourceUrl: "https://www.leadway.com/personal-annuity-plan/",
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "aiico-annuity-plan",
    name: "Annuity / Retirement Plan",
    provider: AIICO,
    category: "personal-annuity",
    intendedCustomer: "Prospective retirees enquiring about immediate or deferred annuity options.",
    publishedTerms: [
      "AIICO's current public page describes deferred and immediate options, flat or annually increasing income (5% or 10%), and a 10-year guaranteed period. Its dated 2019 form lists a 5- or 10-year guarantee and flat or 5% increasing choices, so confirm current options and wording directly with AIICO.",
      "The page describes 75% spouse continuation for its immediate annuity option and a death benefit for its deferred option; these are product-specific features subject to the current policy terms.",
      "The official page states that a deferred plan may be funded by lump sum or annual premium; the provider determines the current quote and eligibility.",
      "The portal does not calculate or promise an annuity rate or payout.",
    ],
    formalApplicationDocuments: [
      "AIICO's published Annuity Plan application form is marked Version 07-2019. It requests sensitive identity, BVN, address, income/source-of-funds, PEP, bank, next-of-kin, beneficiary and health-declaration information; confirm the current form with AIICO before use.",
      "Do not treat the dated form as a current universal requirement. NairaLeap's initial enquiry does not request BVN, bank credentials, beneficiary identity documents or medical history.",
    ],
    sourceUrl: "https://www.aiicoplc.com/home/annuity-plan",
    additionalSources: [
      {
        label: "AIICO annuity application form (Version 07-2019; confirm current form)",
        url: "https://www.aiicoplc.com/staging/images/forms/ANNUITY_PLAN.pdf",
      },
    ],
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "igi-annuity-plan",
    name: "Annuity Plan",
    provider: IGI,
    category: "personal-annuity",
    intendedCustomer:
      "Prospective policyholders or retirees considering immediate or deferred income from a lump sum.",
    publishedTerms: [
      "IGI describes immediate and deferred options, level or increasing income (5% or 10%), a 10-year guaranteed period and monthly, quarterly, half-yearly or annual payment frequencies.",
      "The official page is undated and its page metadata indicates it was last modified in 2019; confirm current availability, terms and requirements before relying on it.",
      "The official page has no visible current version date; its WordPress metadata indicates last modification in 2019, so current product terms, prices and eligibility remain unverified.",
      "The published example is illustrative only; NairaLeap does not reproduce it as a current rate or quote.",
      "The provider page states payout depends on purchase amount and selected option; request a current personalized quotation and terms.",
    ],
    formalApplicationDocuments: [
      "IGI's official page includes a prospect enquiry slip requesting contact details, age/date of birth, beneficiary, proposed purchase price and option, and lists a colour photograph.",
      "The initial NairaLeap enquiry intentionally avoids collecting beneficiary identities, dates of birth and document images.",
    ],
    sourceUrl: "https://www.iginigeria.com/products/life-products/individual-life/annuity-plan/",
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "stanbic-retiree-annuity",
    name: "Retiree Life Annuity",
    provider: STANBIC_IBTC,
    category: "personal-annuity",
    intendedCustomer:
      "Retirees enquiring about an annuity purchased within the stated pension framework.",
    publishedTerms: [
      "Stanbic IBTC describes lifetime monthly or quarterly income and level or increasing payout options, including published 5% or 10% increase choices.",
      "Its page describes a 10-year guaranteed period. Its official FAQ says beneficiaries receive the commuted value of remaining guaranteed-period payments if the annuitant dies within that period; if the annuitant outlives it, lifetime payments continue but no residual benefit is due on death.",
      "The official FAQ PDF metadata is dated 28 February 2023; confirm current rates, eligibility, regulatory rules and provider terms before application.",
      "NairaLeap does not calculate an annuity quote or confirm a customer's eligibility.",
    ],
    formalApplicationDocuments: [
      "The official product page and FAQ list a PFA statement no more than one month old, BVN, valid ID, retiree and beneficiary photographs, applicable retirement evidence, and a utility/address document within six months for formal sign-up.",
      "These are provider-specific formal sign-up requirements; none are collected or uploaded during this discovery enquiry.",
    ],
    sourceUrl:
      "https://www.stanbicibtcinsurance.com/nigeriainsurancelimited/life-insurance/personal/product/annuity%E2%80%93insurance",
    additionalSources: [
      {
        label: "Stanbic IBTC annuity FAQ (official PDF; metadata dated 28 February 2023)",
        url: "https://www.stanbicibtcinsurance.com/static_file/Nigeria/nigeriainsurancelimited/Downloads/PDFs/FAQ+for+Annuity.pdf",
      },
    ],
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
  {
    id: "leadway-householder",
    name: "Householder Insurance",
    provider: LEADWAY,
    category: "home-property",
    intendedCustomer:
      "Tenants or landlords seeking combined building and household-contents cover, subject to the insurer's current terms.",
    publishedTerms: [
      "Leadway's official page describes cover for building and contents against insured perils, plus additional-accommodation expense, public liability and an insured-death benefit.",
      "The page says jewellery, laptops, phones and certain personal effects are excluded unless added as extensions; request the current full cover/exclusion list.",
      "The same official page displays two different 'as low as' annual premium figures (₦20,000 and ₦10,000). NairaLeap deliberately omits a minimum price and requires a current insurer quote.",
    ],
    formalApplicationDocuments: [
      "The official page lists a completed proposal form, valid identification and a passport photograph.",
      "These are provider-specific formal application items, not required for this initial enquiry.",
    ],
    sourceUrl: "https://www.leadway.com/householder/",
    additionalSources: [
      {
        label: "Leadway householder cover selector",
        url: "https://www.leadway.com/select-householder/",
      },
    ],
    lastChecked: "2026-10-12",
    ratingStatus: "No verified comparable ratings available",
    availabilityStatus: "Provider confirmation required",
  },
];

export const INSURANCE_PRODUCT_DISCLOSURE = {
  checkedAt: "2026-10-12",
  naicomMcrDisclaimer:
    "NAICOM's 31 July 2026 minimum-capital compliance list records the named legal entities and business class. It is not a substitute for checking the live licence register, product approval, current terms or an executed NairaLeap provider agreement.",
  relationshipDisclaimer:
    "These are source-checked public product references only. NairaLeap has not represented that it is appointed by, partnered with or authorized to bind any listed provider.",
  ratingsDisclaimer:
    "No verified, independently comparable customer-rating dataset is connected; the portal does not rank these providers.",
  quoteDisclaimer:
    "Any amounts, terms or benefits shown on a provider page are not a NairaLeap quote. Obtain current provider-issued policy wording and an individualized quotation before comparing or applying.",
};
