import { useCallback, useMemo, useState } from "react";
import type { AnswerValue, AnswersState, Question } from "./types";

const EMPTY_QUESTION_GROUP: Question[] = [];

export interface UseQuestionEngineOptions {
  questions: Question[];
  initialAnswers?: AnswersState;
  onComplete?: (answers: AnswersState) => void;
  /** Optional id of the question to start on (must exist in `questions`). */
  initialQuestionId?: string;
}

function conditionMatches(
  condition: Question["showWhen"] | undefined,
  answers: AnswersState,
): boolean {
  if (!condition) return true;
  const actual = answers[condition.questionId];
  if (Array.isArray(actual)) return actual.some((value) => condition.values.includes(value));
  return condition.values.some((value) => value === actual);
}

function groupQuestions(questions: Question[]): Question[][] {
  const groups = new Map<string, Question[]>();
  for (const question of questions) {
    const key = question.pageGroup ?? question.id;
    const group = groups.get(key);
    if (group) group.push(question);
    else groups.set(key, [question]);
  }
  return [...groups.values()];
}

function questionIsAnswered(question: Question, answers: AnswersState): boolean {
  const required =
    question.required !== false ||
    (question.requiredWhen ? conditionMatches(question.requiredWhen, answers) : false);
  if (!required) return true;

  const value = answers[question.id];
  switch (question.type) {
    case "short-text":
    case "long-text":
    case "phone":
    case "location":
    case "currency":
      return typeof value === "string" && value.trim().length > 0;
    case "email":
      return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    case "number":
      return typeof value === "number" && !Number.isNaN(value);
    case "date":
      return typeof value === "string" && value.length > 0;
    case "yes-no":
      return typeof value === "boolean";
    case "single-choice":
      return typeof value === "string" && value.length > 0;
    case "multiple-choice": {
      const selected = Array.isArray(value) ? value : [];
      const minimum = question.minSelections ?? 1;
      return selected.length >= minimum;
    }
    default:
      return false;
  }
}

/**
 * useQuestionEngine — shared state for service-agnostic, conditional forms.
 * Related questions may opt into a shared pageGroup; questions without one
 * retain the original one-question-per-screen behavior.
 */
export function useQuestionEngine({
  questions,
  initialAnswers,
  onComplete,
  initialQuestionId,
}: UseQuestionEngineOptions) {
  const initialGroups = groupQuestions(questions);
  const initialIndex = (() => {
    if (!initialQuestionId) return 0;
    const i = initialGroups.findIndex((group) =>
      group.some((question) => question.id === initialQuestionId),
    );
    return i >= 0 ? i : 0;
  })();
  const [index, setIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers ?? {});

  const visibleGroups = useMemo(
    () =>
      groupQuestions(questions.filter((question) => conditionMatches(question.showWhen, answers))),
    [answers, questions],
  );
  const total = visibleGroups.length;
  const activeIndex = total === 0 ? 0 : Math.min(index, total - 1);
  const currentQuestions = visibleGroups[activeIndex] ?? EMPTY_QUESTION_GROUP;
  const current = currentQuestions[0];
  const progress = total === 0 ? 0 : Math.round(((activeIndex + 1) / total) * 100);

  const setAnswer = useCallback(
    (id: string, value: AnswerValue) => {
      setAnswers((previous) => {
        const next = { ...previous, [id]: value };
        for (const question of questions) {
          if (!conditionMatches(question.showWhen, next)) delete next[question.id];
        }
        return next;
      });
    },
    [questions],
  );

  const isAnswered = useMemo(
    () =>
      currentQuestions.length > 0 &&
      currentQuestions.every((question) => questionIsAnswered(question, answers)),
    [answers, currentQuestions],
  );

  const canGoPrevious = activeIndex > 0;
  const canGoNext = isAnswered;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === total - 1;

  const goNext = useCallback(() => {
    if (!isAnswered) return;
    if (isLast) {
      onComplete?.(answers);
      return;
    }
    setIndex(Math.min(activeIndex + 1, total - 1));
  }, [activeIndex, answers, isAnswered, isLast, onComplete, total]);

  const goPrevious = useCallback(() => {
    setIndex(Math.max(activeIndex - 1, 0));
  }, [activeIndex]);

  const reset = useCallback(() => {
    setIndex(0);
    setAnswers(initialAnswers ?? {});
  }, [initialAnswers]);

  return {
    index: activeIndex,
    total,
    current,
    currentQuestions,
    progress,
    answers,
    setAnswer,
    isAnswered,
    canGoNext,
    canGoPrevious,
    isFirst,
    isLast,
    goNext,
    goPrevious,
    reset,
  };
}
