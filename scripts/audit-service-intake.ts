import { REQUEST_BLUEPRINT_MAP } from "../src/features/request-blueprint-engine";
import { buildServiceRundown, getServiceQuestionSet } from "../src/features/service-intake";
import { SERVICE_CATALOG } from "../src/features/services/serviceCatalog";

const checks: Array<[string, boolean]> = [];

for (const service of SERVICE_CATALOG) {
  const blueprint = REQUEST_BLUEPRINT_MAP[service.id];
  const questions = getServiceQuestionSet(service.id);
  const questionIds = new Set(questions.map((question) => question.id));
  const rundown = buildServiceRundown(service.id, {});

  checks.push([`${service.id}: blueprint exists`, Boolean(blueprint)]);
  checks.push([
    `${service.id}: question count matches blueprint`,
    questions.length === blueprint.requiredFields.length + blueprint.optionalFields.length,
  ]);
  checks.push([`${service.id}: question ids are unique`, questionIds.size === questions.length]);
  checks.push([
    `${service.id}: rundown required count matches blueprint`,
    rundown.missingRequiredFields.length === blueprint.requiredFields.length,
  ]);
}

const propertyTypeChoices = getServiceQuestionSet("property-listings").find(
  (question) => question.id === "propertyType",
);
const mortgagePropertyTypeChoices = getServiceQuestionSet("mortgage").find(
  (question) => question.id === "propertyType",
);

checks.push([
  "property-listings: residential property choice is present",
  propertyTypeChoices?.type === "single-choice" &&
    propertyTypeChoices.choices.some((choice) => choice.value === "residential"),
]);
checks.push([
  "mortgage: apartment choice is present",
  mortgagePropertyTypeChoices?.type === "single-choice" &&
    mortgagePropertyTypeChoices.choices.some((choice) => choice.value === "apartment"),
]);
checks.push([
  "property-listings: mortgage-only apartment choice is absent",
  propertyTypeChoices?.type === "single-choice" &&
    !propertyTypeChoices.choices.some((choice) => choice.value === "apartment"),
]);

for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
}

if (checks.some(([, passed]) => !passed)) process.exit(1);
