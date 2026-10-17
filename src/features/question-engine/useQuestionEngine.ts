import { useCallback, useMemo, useState } from "react";
import type { AnswerValue, AnswersState, Question } from "./types";

export interface UseQuestionEngineOptions {
  questions: Question[];
  initialAnswers?: AnswersState;
  onComplete?: (answers: AnswersState) => void;
  /** Optional id of the question to start on (must exist in `questions`). */
  initialQuestionId?: string;
}

/**
 * Shared answer-presence check. Works for any question so both the guided
 * (one-per-page) and single-page form layouts validate identically.
 */
export function isQuestionAnswered(
  question: Question,
  value: AnswerValue | undefined,
): boolean {
  if (question.required === false) return true;
  switch (question.type) {
    case "short-text":
    case "long-text":
    case "email":
    case "phone":
    case "location":
    case "currency":
      return typeof value === "string" && value.trim().length > 0;
    case "number":
      return typeof value === "number" && !Number.isNaN(value);
    case "date":
      return typeof value === "string" && value.length > 0;
    case "yes-no":
      return typeof value === "boolean";
    case "single-choice":
      return typeof value === "string" && value.length > 0;
    case "multiple-choice": {
      const arr = Array.isArray(value) ? value : [];
      const min = question.minSelections ?? 1;
      return arr.length >= min;
    }
    default:
      return false;
  }
}

/**
 * useQuestionEngine — the single reusable state manager for the Question Engine.
 * Purely local; no API calls, no persistence.
 */
export function useQuestionEngine({
  questions,
  initialAnswers,
  onComplete,
  initialQuestionId,
}: UseQuestionEngineOptions) {
  const initialIndex = (() => {
    if (!initialQuestionId) return 0;
    const i = questions.findIndex((q) => q.id === initialQuestionId);
    return i >= 0 ? i : 0;
  })();
  const [index, setIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers ?? {});

  const total = questions.length;
  const current = questions[index];
  const progress = total === 0 ? 0 : Math.round(((index + 1) / total) * 100);

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const isAnswered = useMemo(() => {
    if (!current) return false;
    return isQuestionAnswered(current, answers[current.id]);
  }, [answers, current]);

  const canGoPrevious = index > 0;
  const canGoNext = isAnswered;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const goNext = useCallback(() => {
    if (!isAnswered) return;
    if (isLast) {
      onComplete?.(answers);
      return;
    }
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [answers, isAnswered, isLast, onComplete, total]);

  const goPrevious = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setIndex(0);
    setAnswers(initialAnswers ?? {});
  }, [initialAnswers]);

  return {
    index,
    total,
    current,
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
