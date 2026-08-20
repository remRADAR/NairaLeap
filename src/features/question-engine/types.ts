/**
 * Question Engine — shared types.
 *
 * The engine is intentionally service-agnostic. Any guided flow (onboarding,
 * service request, KYC, etc.) can drive it by passing a `Question[]` config.
 */

export type QuestionType =
  | "short-text"
  | "long-text"
  | "email"
  | "phone"
  | "location"
  | "currency"
  | "single-choice"
  | "multiple-choice"
  | "yes-no"
  | "number"
  | "date";

export interface QuestionChoice {
  value: string;
  label: string;
  description?: string;
}

interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  helper?: string;
  required?: boolean;
}

export interface ShortTextQuestion extends BaseQuestion {
  type: "short-text";
  placeholder?: string;
  maxLength?: number;
}

export interface LongTextQuestion extends BaseQuestion {
  type: "long-text";
  placeholder?: string;
  maxLength?: number;
}

export interface SemanticTextQuestion extends BaseQuestion {
  type: "email" | "phone" | "location" | "currency";
  placeholder?: string;
  maxLength?: number;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: "single-choice";
  choices: QuestionChoice[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  choices: QuestionChoice[];
  minSelections?: number;
  maxSelections?: number;
}

export interface YesNoQuestion extends BaseQuestion {
  type: "yes-no";
}

export interface NumberQuestion extends BaseQuestion {
  type: "number";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface DateQuestion extends BaseQuestion {
  type: "date";
  min?: string;
  max?: string;
}

export type Question =
  | ShortTextQuestion
  | LongTextQuestion
  | SemanticTextQuestion
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | YesNoQuestion
  | NumberQuestion
  | DateQuestion;

/** Runtime answer value shape, keyed by question id. */
export type AnswerValue = string | number | string[] | boolean | null;

export type AnswersState = Record<string, AnswerValue>;
