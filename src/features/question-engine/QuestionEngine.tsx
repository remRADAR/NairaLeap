import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerValue, AnswersState, Question } from "./types";
import { isQuestionAnswered, useQuestionEngine } from "./useQuestionEngine";

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
   * Optional id of the question to display first (guided layout only).
   * When provided, the engine resolves the matching index inside
   * `questionSet`. Falls back to the first question when the id is unknown.
   */
  currentQuestion?: string;
  /**
   * Layout of the intake form:
   * - "one-per-page" (default): guided frames, one question per screen.
   * - "single-page": the WHOLE form on one frame/page, grouped into
   *   Required / Optional sections with a single submit action.
   */
  layout?: "one-per-page" | "single-page";
  /** Optional pre-filled answers (e.g. resume in-progress flow). */
  initialAnswers?: AnswersState;
  /** Completion callback — invoked with the final answers on submit. */
  onComplete?: (answers: AnswersState) => void;
  /** Optional back/exit handler (guided: first question; single-page: footer). */
  onExit?: () => void;
  /** Optional title for the single-page form. */
  title?: string;
  /** Optional submit button label (single-page layout). Defaults to "Submit". */
  submitLabel?: string;
  className?: string;
}

/**
 * QuestionEngine — ONE reusable, service-agnostic question interface.
 *
 * Accepts any Question Set via configuration; no service-specific branches,
 * no backend, no AI, no persistence, and no dependency on demo data.
 * Default layout is the guided one-question-per-frame flow. Set
 * `layout="single-page"` to render the whole intake form on one frame.
 */
export function QuestionEngine({
  questionSet,
  questions,
  currentQuestion,
  layout = "one-per-page",
  initialAnswers,
  onComplete,
  onExit,
  title,
  submitLabel = "Submit",
  className,
}: QuestionEngineProps) {
  // Backward-compatible resolution: prefer `questionSet`, fall back to
  // legacy `questions`, and default to an empty list so the engine renders
  // its empty-state instead of crashing when no config is supplied.
  const resolvedQuestions: Question[] = questionSet ?? questions ?? [];

  if (resolvedQuestions.length === 0) {
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

  if (layout === "single-page") {
    return (
      <SinglePageForm
        questions={resolvedQuestions}
        initialAnswers={initialAnswers}
        onComplete={onComplete}
        onExit={onExit}
        title={title}
        submitLabel={submitLabel}
        className={className}
      />
    );
  }

  return (
    <GuidedForm
      questions={resolvedQuestions}
      currentQuestion={currentQuestion}
      initialAnswers={initialAnswers}
      onComplete={onComplete}
      onExit={onExit}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Single-page layout — the whole intake form on ONE frame.           */
/* ------------------------------------------------------------------ */

interface SinglePageFormProps {
  questions: Question[];
  initialAnswers?: AnswersState;
  onComplete?: (answers: AnswersState) => void;
  onExit?: () => void;
  title?: string;
  submitLabel: string;
  className?: string;
}

function SinglePageForm({
  questions,
  initialAnswers,
  onComplete,
  onExit,
  title,
  submitLabel,
  className,
}: SinglePageFormProps) {
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers ?? {});
  const [attempt, setAttempt] = useState(0);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const required = questions.filter((q) => q.required !== false);
  const optional = questions.filter((q) => q.required === false);
  const missingRequired = attempt
    ? required.filter((q) => !isQuestionAnswered(q, answersRef.current[q.id]))
    : [];

  // On each submit attempt, surface the inline error and move focus to the
  // first required field that is still unanswered. Depends only on `attempt`
  // so typing never re-triggers the scroll.
  useEffect(() => {
    if (attempt === 0) return;
    const missing = required.filter((q) => !isQuestionAnswered(q, answersRef.current[q.id]));
    if (missing.length === 0) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => {
      fieldRefs.current[missing[0].id]?.focus?.({ preventScroll: true });
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = required.filter((q) => !isQuestionAnswered(q, answers[q.id]));
    if (missing.length > 0) {
      setAttempt((n) => n + 1);
      return;
    }
    onComplete?.(answers);
  }

  const setAnswer = (id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <form
      aria-label={title ?? "Service intake form"}
      onSubmit={handleSubmit}
      data-testid="single-page-intake-frame"
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-[2rem] border border-primary/20 bg-primary/[0.045] p-4 shadow-[0_18px_55px_rgba(91,32,171,0.12)] sm:p-6",
        className,
      )}
      noValidate
    >
      {title ? (
        <header className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The whole form is on this one page. Nothing is submitted until you press {submitLabel}.
          </p>
        </header>
      ) : null}

      {missingRequired.length > 0 ? (
        <div
          ref={errorRef}
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">
              {missingRequired.length} required {missingRequired.length === 1 ? "field" : "fields"}{" "}
              still {missingRequired.length === 1 ? "needs" : "need"} an answer:
            </p>
            <p className="mt-1 leading-relaxed">{missingRequired.map((q) => q.title).join(", ")}</p>
          </div>
        </div>
      ) : null}

      {required.length > 0 ? (
        <FormSection
          index={1}
          heading="Required information"
          description="These answers are needed before the NairaLeap team can review your request."
        >
          {required.map((question) => (
            <FormField
              key={question.id}
              question={question}
              value={answers[question.id]}
              invalid={attempt > 0 && !isQuestionAnswered(question, answers[question.id])}
              onChange={(v) => setAnswer(question.id, v)}
              registerRef={(el) => {
                fieldRefs.current[question.id] = el;
              }}
            />
          ))}
        </FormSection>
      ) : null}

      {optional.length > 0 ? (
        <FormSection
          index={required.length > 0 ? 2 : 1}
          heading="Additional details"
          description="Optional — add anything that helps the team handle your request better."
        >
          {optional.map((question) => (
            <FormField
              key={question.id}
              question={question}
              value={answers[question.id]}
              invalid={false}
              onChange={(v) => setAnswer(question.id, v)}
              registerRef={(el) => {
                fieldRefs.current[question.id] = el;
              }}
            />
          ))}
        </FormSection>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-glass-border bg-glass px-4 text-sm font-medium text-foreground transition-colors hover:text-primary-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <button
          type="submit"
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full gradient-brand px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {submitLabel}
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

function FormSection({
  index,
  heading,
  description,
  children,
}: {
  index: number;
  heading: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-3xl p-5 sm:p-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-primary-glow">
          Section {String(index).padStart(2, "0")}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {heading}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </header>
      <div className="mt-5 flex flex-col gap-6">{children}</div>
    </section>
  );
}

interface FormFieldProps {
  question: Question;
  value: AnswerValue | undefined;
  invalid: boolean;
  onChange: (value: AnswerValue) => void;
  registerRef: (el: HTMLElement | null) => void;
}

function FormField({ question, value, invalid, onChange, registerRef }: FormFieldProps) {
  const titleId = useId();
  const helperId = useId();

  return (
    <div
      ref={registerRef}
      tabIndex={-1}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex flex-col gap-2 rounded-2xl focus-visible:outline-none",
        invalid && "border border-destructive/50 bg-destructive/5 p-3",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <label id={titleId} className="text-sm font-semibold text-foreground sm:text-base">
          {question.title}
        </label>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {question.required === false ? "Optional" : "Required"}
        </span>
      </div>
      {question.helper ? (
        <p id={helperId} className="text-sm leading-relaxed text-muted-foreground">
          {question.helper}
        </p>
      ) : null}
      <AnswerField
        question={question}
        value={value}
        onChange={onChange}
        onEnter={() => {
          /* Enter moves through native fields; submit is explicit. */
        }}
        labelledBy={titleId}
        describedBy={question.helper ? helperId : undefined}
        autoFocus={false}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Guided layout — one question per frame (kept for discovery flows).*/
/* ------------------------------------------------------------------ */

interface GuidedFormProps {
  questions: Question[];
  currentQuestion?: string;
  initialAnswers?: AnswersState;
  onComplete?: (answers: AnswersState) => void;
  onExit?: () => void;
  className?: string;
}

function GuidedForm({
  questions,
  currentQuestion,
  initialAnswers,
  onComplete,
  onExit,
  className,
}: GuidedFormProps) {
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
    questions,
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
        <h3
          id={titleId}
          className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
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
  labelledBy?: string;
  describedBy?: string;
  autoFocus?: boolean;
}

function AnswerField({
  question,
  value,
  onChange,
  onEnter,
  labelledBy,
  describedBy,
  autoFocus = true,
}: AnswerFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [question.id, autoFocus]);

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
          className="portal-field min-h-12 w-full rounded-2xl border border-glass-border bg-glass px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="portal-field w-full resize-y rounded-2xl border border-glass-border bg-glass px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );

    case "email":
    case "phone":
    case "location":
    case "currency": {
      const inputType =
        question.type === "email" ? "email" : question.type === "phone" ? "tel" : "text";
      const inputMode =
        question.type === "currency" ? "decimal" : question.type === "phone" ? "tel" : undefined;
      return (
        <input
          ref={(el) => {
            inputRef.current = el;
          }}
          type={inputType}
          inputMode={inputMode}
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
          className="portal-field min-h-12 w-full rounded-2xl border border-glass-border bg-glass px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }

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
            className="portal-field min-h-12 w-full rounded-2xl border border-glass-border bg-glass px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="portal-field min-h-12 w-full rounded-2xl border border-glass-border bg-glass px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
