import type { Question } from "@/features/question-engine";

/**
 * DEMO ONLY — universal intent discovery questions.
 *
 * These questions are service-agnostic and are meant to demonstrate how the
 * Intent Discovery Engine can be used with the Question Engine. Real flows will
 * supply their own `Question[]` config.
 */
export const DEMO_DISCOVERY_QUESTIONS: Question[] = [
  {
    id: "discovery-goal",
    type: "single-choice",
    title: "What are you trying to accomplish today?",
    helper: "Pick the option that best matches your goal.",
    required: true,
    choices: [
      { value: "buying", label: "Buy something" },
      { value: "selling", label: "Sell something" },
      { value: "partnering", label: "Find a partner" },
      { value: "funding", label: "Get funding" },
      { value: "investment", label: "Make an investment" },
      { value: "registration", label: "Register on the platform" },
      { value: "professional-services", label: "Hire a professional" },
      { value: "learning", label: "Learn or stay informed" },
      { value: "support", label: "Get help or support" },
      { value: "general-enquiry", label: "Something else" },
    ],
  },
  {
    id: "discovery-who",
    type: "single-choice",
    title: "Who is this request for?",
    helper: "Tell us who the request is on behalf of.",
    required: true,
    choices: [
      { value: "myself", label: "Myself" },
      { value: "family", label: "Family member" },
      { value: "business", label: "Business or organisation" },
      { value: "client", label: "A client" },
    ],
  },
  {
    id: "discovery-personal-or-business",
    type: "yes-no",
    title: "Is this personal or business related?",
    required: true,
  },
  {
    id: "discovery-guidance",
    type: "single-choice",
    title: "Would you like guidance or do you already know the service?",
    helper: "We can recommend the right path, or take you directly to a service.",
    required: true,
    choices: [
      { value: "guidance", label: "Guide me to the right service" },
      { value: "known", label: "I already know the service I need" },
    ],
  },
];
