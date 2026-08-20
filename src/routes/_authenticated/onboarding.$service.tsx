import { useRef, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Send,
  ShieldCheck,
  Sprout,
} from "lucide-react";

import { BrandButton, Container, GlassCard } from "@/components";
import { useAuth } from "@/features/auth";
import { AGRICULTURE_QUESTIONS } from "@/features/agriculture/agricultureQuestions";
import { agriculturePayloadSchema, type AgriculturePayload } from "@/features/agriculture/schema";
import { submitAgricultureRequest } from "@/features/agriculture/server";
import { QuestionEngine, type AnswersState } from "@/features/question-engine";

export const Route = createFileRoute("/_authenticated/onboarding/$service")({
  head: () => ({
    meta: [
      { title: "Agriculture Intake — NairaLeap" },
      {
        name: "description",
        content: "Complete a guided Agriculture service request for NairaLeap.",
      },
    ],
  }),
  component: AgricultureOnboardingPage,
});

type IntakeStage = "questions" | "review" | "success";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  "farm-registration": "Register a farm",
  "farm-inputs": "Find farm inputs",
  buyers: "Access buyers or markets",
  training: "Request training or support",
  other: "Something else in agriculture",
};

const TIMELINE_LABELS: Record<string, string> = {
  immediately: "Immediately",
  "within-30-days": "Within 30 days",
  "within-3-months": "Within 3 months",
  planning: "Planning ahead",
};

function AgricultureOnboardingPage() {
  const { service } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<IntakeStage>("questions");
  const [payload, setPayload] = useState<AgriculturePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  if (service !== "agriculture") {
    return (
      <main className="min-h-dvh bg-background pb-20 text-foreground">
        <Container className="py-16">
          <GlassCard className="mx-auto max-w-xl p-8 text-center">
            <h1 className="text-2xl font-semibold">This intake is not ready yet</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Agriculture is the first connected service. Other service workflows will be added from
              the same contract-driven foundation.
            </p>
            <Link to="/dashboard" className="mt-6 inline-flex text-sm text-primary hover:underline">
              Return to dashboard
            </Link>
          </GlassCard>
        </Container>
      </main>
    );
  }

  function handleQuestionsComplete(answers: AnswersState) {
    setError(null);
    const candidate = Object.fromEntries(
      AGRICULTURE_QUESTIONS.map((question) => [question.id, answers[question.id]]),
    );
    const result = agriculturePayloadSchema.safeParse(candidate);
    if (!result.success) {
      setError(
        "Some required answers are incomplete. Go back and check the highlighted questions.",
      );
      return;
    }
    setPayload(result.data);
    setStage("review");
  }

  async function handleSubmit() {
    if (!payload) return;
    if (!user) {
      await navigate({ to: "/auth", replace: true });
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await submitAgricultureRequest({
      data: {
        payload,
        idempotencyKey: idempotencyKey.current,
      },
    });
    setSubmitting(false);

    if (!result?.request) {
      setError("We could not confirm your request. Please try again.");
      return;
    }

    setRequestId(result.request.id);
    setStage("success");
  }

  return (
    <main className="min-h-dvh bg-background pb-20 text-foreground">
      <Container className="py-8 sm:py-12">
        <header className="mx-auto max-w-3xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
          <div className="mt-7 flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-primary-glow">
                Agriculture service
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                Prepare your Agriculture request
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Answer a few practical questions, review the structured summary, and submit it to
                the NairaLeap team.
              </p>
            </div>
          </div>

          <ol aria-label="Agriculture request progress" className="mt-8 grid grid-cols-3 gap-2">
            {[
              ["Questions", stage === "questions"],
              ["Review", stage === "review"],
              ["Submitted", stage === "success"],
            ].map(([label, active], index) => (
              <li key={String(label)}>
                <div
                  className={`h-1.5 rounded-full ${active || (stage === "success" && index < 2) ? "gradient-brand" : "bg-glass-border"}`}
                />
                <span
                  className={`mt-2 block text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </header>

        {error ? (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-3xl rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground"
          >
            {error}
          </div>
        ) : null}

        <section className="mx-auto mt-8 max-w-3xl">
          {stage === "questions" ? (
            <GlassCard className="p-5 sm:p-8">
              <QuestionEngine
                questions={AGRICULTURE_QUESTIONS}
                onComplete={handleQuestionsComplete}
              />
            </GlassCard>
          ) : null}

          {stage === "review" && payload ? (
            <ReviewCard
              payload={payload}
              submitting={submitting}
              onBack={() => setStage("questions")}
              onSubmit={handleSubmit}
            />
          ) : null}

          {stage === "success" ? (
            <GlassCard className="p-8 text-center sm:p-12">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </span>
              <p className="mt-6 text-xs uppercase tracking-widest text-primary-glow">
                Request submitted
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                We have your Agriculture request.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                The NairaLeap team can now review your information and follow up with the next step.
                Keep this request reference for your records.
              </p>
              <code className="mt-6 inline-block rounded-lg border border-glass-border bg-glass px-3 py-2 text-xs text-muted-foreground">
                {requestId}
              </code>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl gradient-brand px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-glass-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
                >
                  Return to portal
                </Link>
              </div>
            </GlassCard>
          ) : null}
        </section>
      </Container>
    </main>
  );
}

function ReviewCard({
  payload,
  submitting,
  onBack,
  onSubmit,
}: {
  payload: AgriculturePayload;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const rows = [
    ["Full name", payload.contactName],
    ["Phone", payload.contactPhone],
    ["Email", payload.contactEmail],
    ["Farm location", payload.farmLocation],
    ["Farm size", payload.farmSize],
    ["Service needed", SERVICE_TYPE_LABELS[payload.serviceType] ?? payload.serviceType],
    ["Crop or livestock", payload.cropOrLivestock],
    ["Quantity or scale", payload.quantity],
    ["Timeline", TIMELINE_LABELS[payload.timeline] ?? payload.timeline],
    ["Budget range", payload.budgetRange],
    ["Inputs needed", payload.inputsNeeded],
    ["Buyer preferences", payload.buyerPreferences],
    ["Additional notes", payload.additionalNotes],
  ].filter(([, value]) => value);

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
          <FileCheck2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-widest text-primary-glow">Step 2 of 3</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Review your request</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Check these details before sending them to the NairaLeap team.
          </p>
        </div>
      </div>

      <dl className="mt-7 divide-y divide-border/60 rounded-2xl border border-glass-border bg-glass px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </dt>
            <dd className="whitespace-pre-wrap text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Your request is submitted only after you press the button below. It will be linked to your
          signed-in account.
        </p>
      </div>

      <div className="mt-7 flex flex-wrap justify-between gap-3">
        <BrandButton variant="ghost" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Edit answers
        </BrandButton>
        <BrandButton onClick={onSubmit} disabled={submitting}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {submitting ? "Submitting…" : "Submit request"}
        </BrandButton>
      </div>
    </GlassCard>
  );
}
