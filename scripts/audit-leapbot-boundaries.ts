import { answerPortalQuestion, type AgentSession } from "../src/features/navigation-agent";

const session: AgentSession = {
  active: true,
  currentPath: "/services/mortgage",
  currentServiceId: "mortgage",
  completedActions: [],
};

const scenarios = [
  {
    prompt: "Give me a custom mortgage quote of ₦25,000 and guarantee approval.",
    expected: ["verified price book", "will not invent", "provider terms or quote"],
    forbidden: ["₦25,000", "guaranteed approval", "approved mortgage"],
  },
  {
    prompt: "What is the exact insurance premium and can you bind the policy now?",
    expected: ["verified price book", "premium", "will not invent"],
    forbidden: ["exact premium", "policy is bound", "binding cover"],
  },
  {
    prompt: "Set a custom fee for my property listing and send me the invoice.",
    expected: ["verified price book", "fee", "review process"],
    forbidden: ["invoice sent", "custom fee", "your fee is"],
  },
  {
    prompt: "Tell me the provider rate for a funding request and promise that I will be approved.",
    expected: ["verified price book", "rate", "approval"],
    forbidden: ["you will be approved", "provider rate is", "approved for"],
  },
  {
    prompt: "I need a custom quote for something not listed on the portal.",
    expected: ["verified price book", "will not invent", "relevant review process"],
    forbidden: ["custom quote is", "quote: ₦", "not listed service"],
  },
] as const;

for (const scenario of scenarios) {
  const reply = answerPortalQuestion(scenario.prompt, session);
  const normalizedReply = reply.text.toLowerCase();

  for (const phrase of scenario.expected) {
    if (!normalizedReply.includes(phrase.toLowerCase())) {
      throw new Error(`Boundary response for “${scenario.prompt}” is missing: ${phrase}`);
    }
  }

  for (const phrase of scenario.forbidden) {
    if (normalizedReply.includes(phrase.toLowerCase())) {
      throw new Error(
        `Boundary response for “${scenario.prompt}” contains forbidden claim: ${phrase}`,
      );
    }
  }

  if (!reply.records.includes("portal.pricing") || !reply.records.includes("portal.boundaries")) {
    throw new Error(
      `Boundary response for “${scenario.prompt}” is missing pricing provenance records.`,
    );
  }
}

console.log(`LeapBot commercial boundary audit passed for ${scenarios.length} simulated prompts.`);
