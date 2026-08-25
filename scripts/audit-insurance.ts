import { SERVICE_CATALOG } from "../src/features/services/serviceCatalog";
import { SERVICE_INTELLIGENCE_MAP } from "../src/features/service-intelligence-catalog";
import { REQUEST_BLUEPRINT_MAP } from "../src/features/request-blueprint-engine";
import {
  getServiceQuestionSet,
  buildServiceRundown,
  SERVICE_PRICING_MAP,
} from "../src/features/service-intake";

const serviceId = "insurance";
const catalog = SERVICE_CATALOG.find((service) => service.id === serviceId);
const intelligence = SERVICE_INTELLIGENCE_MAP[serviceId];
const blueprint = REQUEST_BLUEPRINT_MAP[serviceId];
const questions = getServiceQuestionSet(serviceId);
const rundown = buildServiceRundown(serviceId, {});

const checks = [
  ["catalog entry", Boolean(catalog)],
  ["intelligence entry", Boolean(intelligence)],
  ["blueprint entry", Boolean(blueprint)],
  ["guided questions", questions.length >= 10],
  ["pricing rule", SERVICE_PRICING_MAP[serviceId]?.mode === "quote"],
  ["truthful quote label", SERVICE_PRICING_MAP[serviceId]?.label === "Quote required after review"],
  [
    "rundown reports required fields",
    rundown.missingRequiredFields.length === blueprint.requiredFields.length,
  ],
  ["no required upload blocker", rundown.requiredDocuments.length === 0],
  ["recommended documents present", rundown.recommendedDocuments.length >= 3],
  ["all coverage choices", questions.some((question) => question.id === "insuranceCategory")],
  [
    "claims and policy support choices",
    questions.some((question) => question.id === "insuranceRequestType"),
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
      requiredFieldCount: blueprint?.requiredFields.length,
      optionalFieldCount: blueprint?.optionalFields.length,
      recommendedDocumentCount: rundown.recommendedDocuments.length,
    },
    null,
    2,
  ),
);

if (checks.some(([, passed]) => !passed)) process.exit(1);
