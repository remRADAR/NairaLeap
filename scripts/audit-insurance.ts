import { SERVICE_CATALOG } from "../src/features/services/serviceCatalog";
import { SERVICE_INTELLIGENCE_MAP } from "../src/features/service-intelligence-catalog";
import {
  getMissingRequiredBlueprintFields,
  REQUEST_BLUEPRINT_MAP,
} from "../src/features/request-blueprint-engine";
import {
  getServiceQuestionSet,
  buildServiceRundown,
  SERVICE_PRICING_MAP,
} from "../src/features/service-intake";
import { INSURANCE_SOURCE_CHECKED_PRODUCTS } from "../src/features/insurance/productCatalogue";

const serviceId = "insurance";
const catalog = SERVICE_CATALOG.find((service) => service.id === serviceId);
const intelligence = SERVICE_INTELLIGENCE_MAP[serviceId];
const blueprint = REQUEST_BLUEPRINT_MAP[serviceId];
const questions = getServiceQuestionSet(serviceId);
const rundown = buildServiceRundown(serviceId, {});
const householderProduct = INSURANCE_SOURCE_CHECKED_PRODUCTS.find(
  (product) => product.id === "leadway-householder",
);
const aiicoAnnuityProduct = INSURANCE_SOURCE_CHECKED_PRODUCTS.find(
  (product) => product.id === "aiico-annuity-plan",
);
const igiAnnuityProduct = INSURANCE_SOURCE_CHECKED_PRODUCTS.find(
  (product) => product.id === "igi-annuity-plan",
);

const checks = [
  ["catalog entry", Boolean(catalog)],
  ["intelligence entry", Boolean(intelligence)],
  ["blueprint entry", Boolean(blueprint)],
  ["guided questions", questions.length >= 10],
  ["pricing rule", SERVICE_PRICING_MAP[serviceId]?.mode === "quote"],
  ["truthful quote label", SERVICE_PRICING_MAP[serviceId]?.label === "Quote required after review"],
  [
    "rundown reports required fields",
    rundown.missingRequiredFields.length ===
      getMissingRequiredBlueprintFields(blueprint, {}).length,
  ],
  ["no required upload blocker", rundown.requiredDocuments.length === 0],
  ["recommended documents present", rundown.recommendedDocuments.length >= 3],
  ["all coverage choices", questions.some((question) => question.id === "insuranceCategory")],
  [
    "claims and policy support choices",
    questions.some((question) => question.id === "insuranceRequestType"),
  ],
  ["ten source-checked product snapshots", INSURANCE_SOURCE_CHECKED_PRODUCTS.length === 10],
  [
    "every product has freshness and pricing notes",
    INSURANCE_SOURCE_CHECKED_PRODUCTS.length === 10 &&
      INSURANCE_SOURCE_CHECKED_PRODUCTS.every(
        (product) => product.freshnessNote.trim() && product.pricingNote.trim(),
      ),
  ],
  [
    "Householder conflicting prices remain explicitly unpriced",
    Boolean(
      householderProduct?.pricingNote.includes("₦20,000/year") &&
      householderProduct.pricingNote.includes("₦10,000/year") &&
      householderProduct.pricingNote.includes("no minimum"),
    ),
  ],
  [
    "AIICO annuity page/form version mismatch is disclosed",
    Boolean(aiicoAnnuityProduct?.freshnessNote.includes("Version 07-2019")),
  ],
  [
    "IGI annuity source age is disclosed",
    Boolean(igiAnnuityProduct?.freshnessNote.includes("28 November 2019")),
  ],
] as const;

for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
}

console.log(
  JSON.stringify(
    {
      serviceId,
      catalogTitle: catalog?.title,
      estimatedCompletionTime: intelligence?.estimatedCompletionTime,
      questionCount: questions.length,
      requiredFieldCount: getMissingRequiredBlueprintFields(blueprint, {}).length,
      optionalFieldCount: blueprint?.optionalFields.length,
      recommendedDocumentCount: rundown.recommendedDocuments.length,
    },
    null,
    2,
  ),
);

if (checks.some(([, passed]) => !passed)) process.exit(1);
