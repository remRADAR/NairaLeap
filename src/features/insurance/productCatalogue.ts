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
  freshnessNote: string;
  pricingNote: string;
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
export const INSURANCE_SOURCE_CHECKED_PRODUCTS: InsuranceProductSnapshot[] = [
  {
    id: "leadway-investment-plan",
    name: "Investment Plan",
    provider: LEADWAY,
    category: "savings-investment",
    intendedCustomer: "Applicants considering a lump-sum investment-linked insurance policy.",
    publishedTerms: [
      "Leadway's official page describes a lump sum held for an agreed policy term of 1–20 years.",
      "The page lists life cover and optional critical-illness and accidental-permanent-disability cover.",
      "The page describes interest as highly competitive but gives no numerical rate or individualized illustration; its FAQ says additional deposits cannot be added to the original guaranteed policy and may instead require a new policy.",
    ],
    formalApplicationDocuments: [
      "Leadway's product page lists valid identification, a passport photograph and a completed proposal form.",
      "These are provider-published formal application items, not requirements for this NairaLeap discovery enquiry.",
    ],
    sourceUrl: "https://www.leadway.com/leadway-investment-plan/",
    lastChecked: "2026-10-12",
    freshnessNote:
      "The official page has no visible publication, update or effective date. Checked on 12 October 2026; this is the retrieval date, not confirmation that the terms remain current.",
    pricingNote:
      "The page uses qualitative 'highly competitive' interest wording but publishes no numerical rate or personalized illustration. Request current policy terms and an insurer-issued illustration.",
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
      "The page permits customers to pay more and states ₦10,000 or above; it does not separately define additional-contribution conditions. Its FAQ describes a policy loan subject to agreement and once-yearly partial surrender after one active year (₦50,000 minimum, up to 25% of policy value).",
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
    freshnessNote:
      "The product page and savings overview show no visible publication, update or effective date. Checked on 12 October 2026; confirm current terms with Leadway.",
    pricingNote:
      "The page does not give a personalized rate or maturity value; loan terms and full-surrender penalties are not quantified. Obtain a current illustration and policy wording.",
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
      "Leadway calls this a defined-benefit policy and says it is not a savings policy; the page does not call it a bank savings account.",
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
    freshnessNote:
      "The official page has no visible publication or update date. Checked on 12 October 2026; the page says its 10% late-payment rate may change.",
    pricingNote:
      "A current target, price, term and missed-premium impact require an insurer illustration and policy wording. The page's late-payment charge is expressly changeable.",
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
    freshnessNote:
      "The official page has no visible publication, update or effective date. Checked on 12 October 2026; renewal and surrender conditions should be confirmed with Leadway.",
    pricingNote:
      "The page describes interest qualitatively as competitive but publishes no numerical rate or personalized quote. Confirm current interest, renewal and surrender terms.",
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
      "The page lists a monthly minimum contribution of ₦5,000, policy durations as 10, 12, 15 or 20 (the page does not state the unit), and insurance periods of 6, 9, 12 or 15 years.",
      "The page describes target-savings contributions, account crediting, a loan up to 70% of account balance after three years, and maturity/death benefits; it does not clearly explain how target savings relate to the individual account.",
      "The reviewed page provides no numerical interest rate, charges or individualized illustration.",
    ],
    formalApplicationDocuments: [
      "The official forms listing we inspected is an undated staging page and does not show a clearly labelled form for this specific product; that absence does not prove no current form exists. Confirm the correct pack and requirements with AIICO.",
      "Do not submit provider application or bank details through this discovery form.",
    ],
    sourceUrl: "https://www.aiicoplc.com/home/home-insurance/new-income-investment",
    lastChecked: "2026-10-12",
    freshnessNote:
      "The product page was checked on 12 October 2026 but shows no visible publication or update date. The policy-duration units are unstated, and the inspected forms listing is an undated staging page.",
    pricingNote:
      "No numerical interest rate, fee schedule or individualized illustration is published on the reviewed product page. Obtain current charges, policy wording and an insurer-issued illustration.",
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
    freshnessNote:
      "Leadway page metadata reports a modification date of 18 August 2026, not a product effective date. Confirm current policy wording and pension eligibility before application.",
    pricingNote:
      "The page does not disclose a personalized payout, purchase-price range or guaranteed-period length. 'Augment' does not specify which additional funds are permitted; request a current provider quotation.",
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
      "AIICO's undated public page describes deferred and immediate options, flat or annually increasing income (5% or 10%), and a 10-year guaranteed period. Its Version 07-2019 form lists a 5- or 10-year guarantee and flat or 5% increasing choices; confirm the mismatch and current wording directly with AIICO.",
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
    freshnessNote:
      "The public product page is undated. Its application form is Version 07-2019; the page and form differ on escalation and guaranteed-period options. Treat the form as historical pending AIICO confirmation.",
    pricingNote:
      "No personalized payout, premium minimum or numerical annuity quote is provided. The page's 10% increase/10-year guarantee language conflicts with the dated form; obtain current written terms.",
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
      "IGI's official page metadata records publication in 2019 and last modification on 28 November 2019; confirm current availability, terms and requirements before relying on it.",
      "The published age-based example is historical and illustrative only; NairaLeap does not reproduce it as a current rate or quote.",
      "The provider page states payout depends on purchase amount and selected option; request a current personalized quotation and terms.",
    ],
    formalApplicationDocuments: [
      "IGI's official page includes a prospect enquiry slip requesting contact details, age/date of birth, beneficiary, proposed purchase price and option, and lists a colour photograph.",
      "The initial NairaLeap enquiry intentionally avoids collecting beneficiary identities, dates of birth and document images.",
    ],
    sourceUrl: "https://www.iginigeria.com/products/life-products/individual-life/annuity-plan/",
    additionalSources: [
      {
        label: "IGI official page metadata (2019 publication/update dates)",
        url: "https://www.iginigeria.com/wp-json/wp/v2/pages/371",
      },
    ],
    lastChecked: "2026-10-12",
    freshnessNote:
      "IGI's official page metadata dates publication to 2019 and last modification to 28 November 2019. Treat its terms and examples as historical unless IGI confirms them.",
    pricingNote:
      "The page's age-based example uses a ₦2,000,000 single premium and is not a current quote. Request a current personalized quotation and confirm product availability with IGI.",
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
    freshnessNote:
      "The product page is undated; the official FAQ PDF metadata is dated 28 February 2023. Confirm that its terms and document requirements remain current.",
    pricingNote:
      "The cited page and FAQ provide no current premium or payout amount. Request a current insurer quotation; the 2023 FAQ is not a price offer.",
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
      "The official page conflicts with itself: the body says premiums are as low as ₦20,000 per year, while its FAQ says as low as ₦10,000 per year. NairaLeap does not display either as a minimum; obtain a current written quote from Leadway.",
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
    freshnessNote:
      "The main product page is undated. A timestamp on the selector page is ambiguous and is not an effective date. Checked on 12 October 2026; current terms and availability remain unconfirmed.",
    pricingNote:
      "Leadway's product page states ₦20,000/year in its body and ₦10,000/year in its FAQ. The conflict is unresolved; NairaLeap shows no minimum and requires a current written quote.",
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
