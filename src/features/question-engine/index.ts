export { QuestionEngine } from "./QuestionEngine";
export type { QuestionEngineProps } from "./QuestionEngine";
export { useQuestionEngine } from "./useQuestionEngine";
export type { UseQuestionEngineOptions } from "./useQuestionEngine";
// Optional development-only sample data. The engine itself has no dependency
// on this — real Question Catalogs are supplied via the `questionSet` prop.
export { DEMO_QUESTIONS } from "./demoQuestions";
export type {
  Question,
  QuestionType,
  QuestionChoice,
  ShortTextQuestion,
  LongTextQuestion,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  YesNoQuestion,
  NumberQuestion,
  DateQuestion,
  AnswerValue,
  AnswersState,
} from "./types";
