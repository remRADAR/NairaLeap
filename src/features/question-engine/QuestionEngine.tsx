import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AnswerValue,
  AnswersState,
  Question,
} from "./types";
import { useQuestionEngine } from "./useQuestionEngine";

export interface QuestionEngineProps {
  /**
   * Question set configuration — the engine has no service-specific logic.
   * Preferred name for new integrations; any future Question Catalog can plug
   * in here without changing the engine.
   */
  questionSet?: Question[];
  /**
   * @deprecated Use `questionSet`. Kept for backward compatibility with
   * earlier call sites — behaves identically to `questionSet`.
   */
  questions?: Question[];
  /**
   * Optional id of the question to display first. When provided, the engine
   * resolves the matching index inside `questionSet`. Falls back to the first
   * question when the id is unknown.
   */
  currentQuestion?: string;
  /** Optional pre-filled answers (e.g. resume in-progress flow). */
  initialAnswers?: AnswersState;
  /** Completion callback — invoked with the final answers on submit. */
  onComplete?: (answers: AnswersState) => void;
  /** Optional back handler used on the very first question. */
  onExit?: () => void;
  className?: string;
}

/**
 * QuestionEngine — ONE reusable, service-agnostic question interface.
 *
 * Renders a single question card at a time with progress, validation, and
 * Previous/Next navigation. Accepts any Question Set via configuration; no
 * service-specific branches, no backend, no AI, no persistence, and no
 * dependency on demo data.
 */
export function QuestionEngine({
  questionSet,
  questions,
  currentQuestion,
  initialAnswers,
  onComplete,
  onExit,
  className,
}: QuestionEngineProps) {
  // Backward-compatible resolution: prefer `questionSet`, fall back to
  // legacy `questions`, and default to an empty list so the engine renders
  // its empty-state instead of crashing when no config is supplied.
  const resolvedQuestions: Question[] = questionSet ?? questions ?? [];

  const {
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
  } = useQuestionEngine({
    questions: resolvedQuestions,
    initialAnswers,
    onComplete,
    initialQuestionId: currentQuestion,
  });

  // Fade-between-questions transition (respects reduced motion).
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), 60);
    return () => window.clearTimeout(t);
  }, [index]);

  if (!current || total === 0) {
    return (
      <div
        role="status"
        className={cn(
          "glass-panel mx-auto w-full max-w-xl rounded-2xl p-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No questions to display.
      </div>
    );
  }

  const handlePrevious = () => {
    if (isFirst) {
      onExit?.();
      return;
    }
    goPrevious();
  };

  return (
    <section
      aria-label="Guided question"
      className={cn("mx-auto flex w-full max-w-xl flex-col gap-4", className)}
    >
      {/* Local progress indicator */}
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span aria-live="polite">
          Question <span className="text-foreground">{index + 1}</span> of{" "}
          <span className="text-foreground">{total}</span>
        </span>
        <span aria-hidden="true">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Question progress"
        className="h-1.5 w-full overflow-hidden rounded-full bg-glass-border"
      >
        <div
          className="h-full gradient-brand shadow-[var(--shadow-glow)] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div
        className={cn(
          "glass-panel rounded-3xl p-5 transition-opacity duration-200 motion-reduce:transition-none sm:p-6",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-live="polite"
      >
        <QuestionBody
          question={current}
          value={answers[current.id]}
          onChange={(v) => setAnswer(current.id, v)}
          onEnter={() => {
            if (canGoNext) goNext();
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrevious && !onExit}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full border border-glass-border bg-glass px-4 text-sm font-medium text-foreground transition-colors",
            "hover:text-primary-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-disabled={!canGoNext}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full gradient-brand px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isLast ? "Submit" : "Next"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Question body — one branch per input type. Purely presentational.  */
/* ------------------------------------------------------------------ */

interface QuestionBodyProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  onEnter: () => void;
}

function QuestionBody({ question, value, onChange, onEnter }: QuestionBodyProps) {
  const titleId = useId();
  const helperId = useId();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1.5">
        <h3 id={titleId} className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {question.title}
        </h3>
        {question.helper ? (
          <p id={helperId} className="text-sm leading-relaxed text-muted-foreground">
            {question.helper}
          </p>
        ) : null}
      </header>

      <AnswerField
        question={question}
        value={value}
        onChange={onChange}
        onEnter={onEnter}
        labelledBy={titleId}
        describedBy={question.helper ? helperId : undefined}
      />
    </div>
  );
}

interface AnswerFieldProps extends QuestionBodyProps {
  labelledBy: string;
  describedBy?: string;
}

function AnswerField({
  question,
  value,
  onChange,
  onEnter,
  labelledBy,
  describedBy,
}: AnswerFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [question.id]);

  switch (question.type) {
    case "short-text":
      return (
        <input
          ref={(el) => {
            inputRef.current = el;
          }}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className="min-h-12 w-full rounded-2xl border border-glass-border bg-glass px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );

    case "long-text":
      return (
        <textarea
          ref={(el) => {
            inputRef.current = el;
          }}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          rows={4}
          className="w-full resize-y rounded-2xl border border-glass-border bg-glass px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );

    case "number":
      return (
        <div className="flex items-center gap-2">
          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            type="number"
            inputMode="numeric"
            value={typeof value === "number" ? value : ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? null : Number(v));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEnter();
              }
            }}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            step={question.step}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            className="min-h-12 w-full rounded-2xl border border-glass-border bg-glass px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {question.unit ? (
            <span className="text-sm text-muted-foreground">{question.unit}</span>
          ) : null}
        </div>
      );

    case "date":
      return (
        <input
          ref={(el) => {
            inputRef.current = el;
          }}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          min={question.min}
          max={question.max}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className="min-h-12 w-full rounded-2xl border border-glass-border bg-glass px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );

    case "yes-no": {
      const selected = typeof value === "boolean" ? value : null;
      return (
        <div
          role="radiogroup"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { v: true, label: "Yes", Icon: Check },
            { v: false, label: "No", Icon: X },
          ].map(({ v, label, Icon }) => {
            const isSelected = selected === v;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(v)}
                className={cn(
                  "flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/15 text-foreground shadow-[var(--shadow-glow)]"
                    : "border-glass-border bg-glass text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      );
    }

    case "single-choice": {
      const selected = typeof value === "string" ? value : "";
      return (
        <div
          role="radiogroup"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className="flex flex-col gap-2"
        >
          {question.choices.map((c) => {
            const isSelected = selected === c.value;
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(c.value)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
                    : "border-glass-border bg-glass hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                    isSelected ? "border-primary bg-primary" : "border-glass-border",
                  )}
                >
                  {isSelected ? (
                    <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground sm:text-base">
                    {c.label}
                  </span>
                  {c.description ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
                      {c.description}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    case "multiple-choice": {
      const selected = Array.isArray(value) ? value : [];
      const max = question.maxSelections;
      const toggle = (v: string) => {
        if (selected.includes(v)) {
          onChange(selected.filter((s) => s !== v));
        } else {
          if (max && selected.length >= max) return;
          onChange([...selected, v]);
        }
      };
      return (
        <div
          role="group"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className="flex flex-col gap-2"
        >
          {question.choices.map((c) => {
            const isSelected = selected.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggle(c.value)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
                    : "border-glass-border bg-glass hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                    isSelected ? "border-primary bg-primary" : "border-glass-border",
                  )}
                >
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-foreground sm:text-base">
                  {c.label}
                  {c.description ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground sm:text-sm">
                      {c.description}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    default:
      return null;
  }
}
