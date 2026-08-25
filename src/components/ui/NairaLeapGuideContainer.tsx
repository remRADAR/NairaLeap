import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/features/auth";
import { DEMO_DISCOVERY_QUESTIONS, INTENT_DISCOVERY_MAP } from "@/features/intent-discovery";
import { QuestionEngine, type AnswersState } from "@/features/question-engine";
import {
  buildServiceRundown,
  getServiceQuestionSet,
  type ServiceRundown,
} from "@/features/service-intake";
import { submitServiceRequest } from "@/features/service-requests";
import {
  SERVICE_CATALOG,
  type ServiceDefinition,
  type ServiceId,
} from "@/features/services/serviceCatalog";
import { cn } from "@/lib/utils";
import {
  savePendingGuideDraft,
  consumePendingGuideDraft,
} from "@/features/service-intake/pendingGuide";
import { BrandButton, GlassCard } from "@/components";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface NairaLeapGuideContainerProps {
  service: ServiceDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: (service: ServiceDefinition) => void;
}

type GuideStage = "discovery" | "service" | "questions" | "review" | "success";

const STEPS = ["Understand", "Questions", "Rundown", "Submit"] as const;
const SERVICE_MAP = Object.fromEntries(SERVICE_CATALOG.map((item) => [item.id, item])) as Record<
  ServiceId,
  ServiceDefinition
>;

function stageIndex(stage: GuideStage): number {
  if (stage === "discovery" || stage === "service") return 0;
  if (stage === "questions") return 1;
  if (stage === "review") return 2;
  return 3;
}

export function NairaLeapGuideContainer({
  service,
  open,
  onOpenChange,
  onBack,
}: NairaLeapGuideContainerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<GuideStage>(service ? "questions" : "discovery");
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(service);
  const [discoveryAnswers, setDiscoveryAnswers] = useState<AnswersState | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [rundown, setRundown] = useState<ServiceRundown | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (!open) return;
    setStage(service ? "questions" : "discovery");
    setSelectedService(service);
    setDiscoveryAnswers(null);
    const pendingDraft = service ? consumePendingGuideDraft(service.id as ServiceId) : null;
    setAnswers(pendingDraft?.answers ?? {});
    setRundown(null);
    setRequestId(null);
    setError(null);
    setSubmitting(false);
    idempotencyKey.current = crypto.randomUUID();
  }, [open, service]);

  const resolvedIntent = useMemo(() => {
    const rawIntent = discoveryAnswers?.["discovery-goal"];
    if (typeof rawIntent !== "string") return null;
    return INTENT_DISCOVERY_MAP[rawIntent] ?? null;
  }, [discoveryAnswers]);

  const candidates = useMemo(
    () =>
      resolvedIntent?.recommendedServiceIds
        .map((id) => SERVICE_MAP[id as ServiceId])
        .filter(Boolean) ?? [],
    [resolvedIntent],
  );

  function chooseService(serviceId: ServiceId) {
    const nextService = SERVICE_MAP[serviceId];
    if (!nextService) return;
    setSelectedService(nextService);
    setAnswers({});
    setRundown(null);
    setError(null);
    setStage("questions");
  }

  function handleDiscoveryComplete(nextAnswers: AnswersState) {
    setDiscoveryAnswers(nextAnswers);
    setError(null);
    setStage("service");
  }

  function handleQuestionsComplete(nextAnswers: AnswersState) {
    if (!selectedService) return;
    const nextRundown = buildServiceRundown(selectedService.id as ServiceId, nextAnswers);
    if (nextRundown.missingRequiredFields.length > 0) {
      setError(`Please complete: ${nextRundown.missingRequiredFields.join(", ")}.`);
      return;
    }
    setAnswers(nextAnswers);
    setRundown(nextRundown);
    setError(null);
    setStage("review");
  }

  async function handleSubmit() {
    if (!selectedService || !rundown) return;
    if (!user) {
      setError(
        "Sign in or create an account to submit this request. Your answers remain visible here until you close the guide.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitServiceRequest({
        data: {
          serviceId: selectedService.id,
          schemaVersion: `${selectedService.id}.v1`,
          payload: answers,
          idempotencyKey: idempotencyKey.current,
        },
      });
      if (!result?.request) {
        setError("We could not confirm your request. Please try again.");
        return;
      }
      setRequestId(result.request.id);
      setStage("success");
    } catch (submissionError) {
      console.error(submissionError);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const currentStepIndex = stageIndex(stage);
  const Icon = selectedService?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-0 top-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-background p-0 sm:left-1/2 sm:top-1/2 sm:h-[92dvh] sm:max-h-[92dvh] sm:w-[min(100%,48rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-glass-border sm:bg-background/95 sm:backdrop-blur-xl"
        id="nairaleap-guide-dialog"
        aria-describedby="naira-guide-desc"
        data-testid="nairaleap-guide-dialog"
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="glass-panel rounded-none border-x-0 border-t-0 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:rounded-t-3xl sm:border-x sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Back"
                onClick={() => {
                  if (stage === "discovery") {
                    onOpenChange(false);
                    return;
                  }
                  if (stage === "service") {
                    setStage("discovery");
                    return;
                  }
                  if (stage === "questions") {
                    if (service) onBack?.(service);
                    else setStage("service");
                    return;
                  }
                  if (stage === "review") {
                    setStage("questions");
                    return;
                  }
                  setStage("review");
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-glass-border bg-glass text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              {Icon ? (
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  <Sparkles className="h-5 w-5" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary-glow" aria-hidden="true" />
                  NairaLeap Guide · brain box
                </div>
                <DialogTitle className="truncate text-base font-semibold tracking-tight sm:text-lg">
                  {selectedService?.title ?? "Let’s find the right path"}
                </DialogTitle>
              </div>
            </div>

            <ol aria-label="Guided request progress" className="mt-4 grid grid-cols-4 gap-2">
              {STEPS.map((label, index) => {
                const isCurrent = index === currentStepIndex;
                const isDone = index < currentStepIndex;
                return (
                  <li key={label} className="min-w-0">
                    <div
                      aria-current={isCurrent ? "step" : undefined}
                      className={cn(
                        "h-1.5 w-full rounded-full",
                        isCurrent
                          ? "gradient-brand shadow-[var(--shadow-glow)]"
                          : isDone
                            ? "bg-primary/60"
                            : "bg-glass-border",
                      )}
                    />
                    <div className="mt-1.5 flex items-center gap-1 truncate text-[11px] sm:text-xs">
                      {isDone ? (
                        <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                      ) : null}
                      <span
                        className={
                          isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                        }
                      >
                        {label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </header>

          <div
            role="log"
            aria-live="polite"
            aria-label="NairaLeap Guide conversation"
            className="min-h-0 flex-1 scroll-smooth overflow-y-auto px-4 py-6 sm:px-6"
          >
            <DialogDescription id="naira-guide-desc" className="sr-only">
              A guided service navigator that turns your need into a reviewable NairaLeap request.
            </DialogDescription>
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
              {error ? (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground"
                >
                  {error}
                </div>
              ) : null}

              {stage === "discovery" ? (
                <>
                  <AssistantMessage title="Tell us what you are trying to achieve.">
                    I will narrow your need to the most relevant NairaLeap service, then take you
                    through only the questions that matter.
                  </AssistantMessage>
                  <QuestionEngine
                    questionSet={DEMO_DISCOVERY_QUESTIONS}
                    onComplete={handleDiscoveryComplete}
                  />
                </>
              ) : null}

              {stage === "service" ? (
                <ServiceResolutionPanel
                  intentTitle={resolvedIntent?.title}
                  intentDescription={resolvedIntent?.description}
                  candidates={candidates}
                  onChoose={chooseService}
                  onBack={() => setStage("discovery")}
                />
              ) : null}

              {stage === "questions" && selectedService ? (
                <>
                  <AssistantMessage title={`Let’s prepare your ${selectedService.title} request.`}>
                    Answer the practical questions below. Required questions are enforced by the
                    flow; optional details help the team give you a more accurate response.
                  </AssistantMessage>
                  <QuestionEngine
                    questionSet={getServiceQuestionSet(selectedService.id as ServiceId)}
                    initialAnswers={answers}
                    onComplete={handleQuestionsComplete}
                  />
                </>
              ) : null}

              {stage === "review" && rundown ? (
                <RundownPanel
                  rundown={rundown}
                  userSignedIn={Boolean(user)}
                  submitting={submitting}
                  onEdit={() => setStage("questions")}
                  onSubmit={handleSubmit}
                  onSignIn={() => {
                    if (!selectedService) return;
                    const saved = savePendingGuideDraft(selectedService.id as ServiceId, answers);
                    if (!saved) {
                      setError(
                        "Your browser blocked temporary draft storage. Keep this guide open while you sign in, then return to submit.",
                      );
                      return;
                    }
                    void navigate({ to: "/auth" });
                  }}
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
                    Your request is now in the NairaLeap queue.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Keep the reference below. You can follow the status from your request workspace
                    while the team reviews the details.
                  </p>
                  <code className="mt-6 inline-block rounded-lg border border-glass-border bg-glass px-3 py-2 text-xs text-muted-foreground">
                    {requestId}
                  </code>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/requests"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl gradient-brand px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                    >
                      Track request <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-glass-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
                    >
                      Close guide
                    </button>
                  </div>
                </GlassCard>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssistantMessage({ title, children }: { title: string; children: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
      >
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="glass-panel min-w-0 flex-1 rounded-2xl rounded-tl-md p-4">
        <p className="text-sm font-medium leading-relaxed text-foreground sm:text-base">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {children}
        </p>
      </div>
    </div>
  );
}

function ServiceResolutionPanel({
  intentTitle,
  intentDescription,
  candidates,
  onChoose,
  onBack,
}: {
  intentTitle?: string;
  intentDescription?: string;
  candidates: ServiceDefinition[];
  onChoose: (serviceId: ServiceId) => void;
  onBack: () => void;
}) {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="service-resolution-title">
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-widest text-primary-glow">
          NairaLeap recommendation
        </p>
        <h2 id="service-resolution-title" className="mt-2 text-2xl font-semibold tracking-tight">
          {intentTitle
            ? `Your need sounds like ${intentTitle.toLowerCase()}.`
            : "Here are the best paths to consider."}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {intentDescription ??
            "Choose the service that best matches the outcome you want. You can change this before answering questions."}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {candidates.map((candidate) => {
          const CandidateIcon = candidate.icon;
          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => onChoose(candidate.id as ServiceId)}
              className="glass-card group flex items-start gap-3 rounded-2xl p-4 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-brand text-primary-foreground">
                <CandidateIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{candidate.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {candidate.shortDescription}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-glow">
                  Use this path <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Change my answers
      </button>
    </section>
  );
}

function RundownPanel({
  rundown,
  userSignedIn,
  submitting,
  onEdit,
  onSubmit,
  onSignIn,
}: {
  rundown: ServiceRundown;
  userSignedIn: boolean;
  submitting: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onSignIn: () => void;
}) {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="rundown-title">
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-widest text-primary-glow">Final rundown</p>
        <h2 id="rundown-title" className="mt-2 text-2xl font-semibold tracking-tight">
          {rundown.outputTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{rundown.summary}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryMetric label="Team response" value={rundown.estimatedCompletionTime} />
          <SummaryMetric label="Priority" value={rundown.priority} />
          <SummaryMetric label="Workflow" value={rundown.nextWorkflow.replaceAll("-", " ")} />
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-foreground">What you told us</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This is the structured request the team will review.
            </p>
          </div>
        </div>
        <dl className="mt-5 divide-y divide-border/60 rounded-2xl border border-glass-border bg-glass px-4">
          {rundown.answers.map((answer) => (
            <div key={answer.key} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {answer.label}
              </dt>
              <dd className="whitespace-pre-wrap text-sm text-foreground">{answer.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="glass-panel rounded-3xl p-5">
          <h3 className="font-semibold text-foreground">Documents</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Required before or during team review.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {rundown.requiredDocuments.map((document) => (
              <li key={document} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {document.replaceAll("-", " ")}
              </li>
            ))}
            {rundown.recommendedDocuments.map((document) => (
              <li key={document} className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary/60"
                  aria-hidden="true"
                />
                Recommended: {document.replaceAll("-", " ")}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <h3 className="font-semibold text-foreground">Price status</h3>
          <p className="mt-3 text-lg font-semibold text-gradient-brand">{rundown.price.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {rundown.price.detail}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Any amount you entered above is your own budget, asking price, or expectation. It is not
            treated as a NairaLeap fee.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Review this rundown before submission. Your request is only stored in the customer
          workspace after you confirm.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BrandButton variant="ghost" onClick={onEdit} disabled={submitting}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Edit answers
        </BrandButton>
        {userSignedIn ? (
          <BrandButton onClick={onSubmit} disabled={submitting}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {submitting ? "Submitting…" : "Submit request"}
          </BrandButton>
        ) : (
          <BrandButton onClick={onSignIn}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Sign in to submit
          </BrandButton>
        )}
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-glass-border bg-glass p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-foreground">{value}</p>
    </div>
  );
}
