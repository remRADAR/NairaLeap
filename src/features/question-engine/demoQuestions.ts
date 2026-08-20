import type { Question } from "./types";

/**
 * DEMO ONLY — generic, service-agnostic sample questions covering every
 * supported input type. Real guided flows will supply their own `Question[]`
 * config. Do not add service-specific questions here.
 */
export const DEMO_QUESTIONS: Question[] = [
  {
    id: "demo-short-text",
    type: "short-text",
    title: "What should we call you?",
    helper: "A first name or preferred nickname works fine.",
    placeholder: "e.g. Ada",
    maxLength: 60,
    required: true,
  },
  {
    id: "demo-single-choice",
    type: "single-choice",
    title: "How would you describe your goal?",
    helper: "Pick the option that best matches your situation.",
    required: true,
    choices: [
      { value: "explore", label: "Just exploring" },
      { value: "compare", label: "Comparing options" },
      { value: "ready", label: "Ready to get started" },
    ],
  },
  {
    id: "demo-multiple-choice",
    type: "multiple-choice",
    title: "Which of these apply to you?",
    helper: "Select all that apply.",
    required: true,
    minSelections: 1,
    choices: [
      { value: "budget", label: "I have a budget in mind" },
      { value: "timeline", label: "I have a specific timeline" },
      { value: "location", label: "Location matters to me" },
      { value: "flexible", label: "I'm flexible" },
    ],
  },
  {
    id: "demo-yes-no",
    type: "yes-no",
    title: "Have you used NairaLeap before?",
    required: true,
  },
  {
    id: "demo-number",
    type: "number",
    title: "How many people are involved?",
    helper: "Enter a whole number.",
    placeholder: "0",
    min: 0,
    step: 1,
    required: true,
  },
  {
    id: "demo-date",
    type: "date",
    title: "When would you like to get started?",
    required: true,
  },
  {
    id: "demo-long-text",
    type: "long-text",
    title: "Anything else we should know?",
    helper: "A few sentences is perfect.",
    placeholder: "Share any extra context…",
    maxLength: 600,
    required: true,
  },
];
