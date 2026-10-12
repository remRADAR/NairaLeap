import { z } from "zod";

const INSURANCE_CATEGORIES = [
  "motor-auto",
  "health-medical",
  "home-building",
  "household-contents",
  "agricultural",
  "life-protection",
  "savings-investment",
  "personal-annuity",
  "education-endowment",
  "group-association",
  "business-commercial",
  "travel",
  "marine-cargo-aviation",
  "liability-compulsory",
  "micro-takaful-inclusion",
] as const;

const INSURANCE_REQUEST_TYPES = [
  "new-cover",
  "compare-options",
  "claim",
  "renew-or-change",
  "verify-or-support",
] as const;

const optionalText = z.string().trim().max(3000).optional();
const optionalDate = z
  .string()
  .trim()
  .max(10)
  .refine(
    (value) =>
      value.length === 0 ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))),
    "Enter a valid calendar date.",
  )
  .optional();
const optionalAmount = z
  .string()
  .trim()
  .max(80)
  .refine(
    (value) =>
      value.length === 0 || /^(?:₦\s*)?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value),
    "Enter a non-negative amount using digits and optional thousands separators.",
  )
  .optional();

/**
 * Validate the Insurance journey at the server boundary. Sensitive formal-KYC
 * identifiers and document uploads are intentionally not part of this schema.
 */
export const insurancePayloadSchema = z
  .object({
    contactName: z.string().trim().min(2).max(120),
    contactPhone: z.string().trim().min(7).max(40),
    contactEmail: z.string().trim().email().max(254),
    applicantType: z.enum(["individual", "organization"]),
    companyName: optionalText,
    companyRegistrationNumber: z.string().trim().max(120).optional(),
    authorizedRepresentativeRole: z.string().trim().max(120).optional(),
    insuranceRequestType: z.enum(INSURANCE_REQUEST_TYPES),
    insuranceCategory: z.enum(INSURANCE_CATEGORIES),
    insuranceLocation: z.string().trim().min(2).max(200),
    insuranceNeed: z.string().trim().min(2).max(3000),
    insuranceProviderPreference: z
      .enum(["no-preference", "leadway", "aiico", "igi", "stanbic-ibtc", "other"])
      .optional(),
    savingsProductPreference: z
      .enum([
        "leadway-investment-plan",
        "leadway-savings-plan",
        "leadway-target-plan",
        "leadway-smart-cash-plan",
        "aiico-income-investment-plan",
        "another-product",
      ])
      .optional(),
    annuityProductPreference: z
      .enum([
        "leadway-personal-annuity",
        "aiico-annuity",
        "igi-annuity",
        "stanbic-retiree-annuity",
        "another-product",
      ])
      .optional(),
    savingsGoal: z
      .enum([
        "short-term-savings",
        "planned-expense",
        "long-term-accumulation",
        "education",
        "retirement",
        "other",
      ])
      .optional(),
    contributionStructure: z.enum(["lump-sum", "recurring", "not-sure"]).optional(),
    contributionFrequency: z
      .enum(["monthly", "quarterly", "semi-annually", "annually", "provider-advice"])
      .optional(),
    savingsContributionAmount: optionalAmount,
    savingsTargetDate: optionalDate,
    earlyAccessNeed: z.enum(["yes", "no", "not-sure"]).optional(),
    lifeCoverInterest: z.boolean().optional(),
    annuityCommencementAgeBand: z
      .enum(["under-50", "50-54", "55-59", "60-64", "65-plus", "prefer-not-to-say"])
      .optional(),
    annuityType: z.enum(["immediate", "deferred", "not-sure"]).optional(),
    annuityPurchaseAmount: optionalAmount,
    annuityFundingSource: z
      .enum(["rsa", "other-retirement-funds", "other-permitted-lump-sum", "not-sure"])
      .optional(),
    annuityPaymentFrequency: z.enum(["monthly", "quarterly", "other"]).optional(),
    annuityIncreasingIncomeInterest: z.boolean().optional(),
    annuityGuaranteedPeriodInterest: z.boolean().optional(),
    annuityJointLifeInterest: z.boolean().optional(),
    healthCoverType: z.enum(["individual", "family", "group"]).optional(),
    groupSize: z.number().int().min(1).max(100000).optional(),
    healthNetworkPreference: optionalText,
    healthBenefitInterests: optionalText,
    propertyCoverType: z
      .enum(["building", "contents", "combined", "warehouse-stock", "not-sure"])
      .optional(),
    propertyRelationship: z.enum(["owner", "tenant", "landlord", "company"]).optional(),
    propertyUse: optionalText,
    propertyConstructionCondition: optionalText,
    buildingReplacementValue: optionalAmount,
    contentsValue: optionalAmount,
    warehouseStockValue: optionalAmount,
    propertyFloorArea: z.string().trim().max(120).optional(),
    motorVehicleDetails: optionalText,
    motorUse: z.enum(["private", "commercial", "fleet"]).optional(),
    motorRegistrationState: z.string().trim().max(200).optional(),
    motorDeclaredValue: optionalAmount,
    insuranceFarmDetails: optionalText,
    insuranceFarmAreaSeason: z.string().trim().max(200).optional(),
    commercialBusinessActivity: optionalText,
    otherProviderPreference: z.string().trim().max(200).optional(),
    assetOrPerson: optionalText,
    coverageAmount: optionalAmount,
    coverStartDate: optionalDate,
    existingPolicyNumber: z.string().trim().max(120).optional(),
    incidentDate: optionalDate,
    additionalNotes: optionalText,
  })
  .passthrough();
