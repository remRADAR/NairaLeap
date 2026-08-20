import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ServiceDefinition } from "@/features/services/serviceCatalog";
import {
  QuestionEngine,
  type AnswersState,
} from "@/features/question-engine";
import {
  DEMO_DISCOVERY_QUESTIONS,
  INTENT_DISCOVERY_MAP,
  type IntentId,
} from "@/features/intent-discovery";
import {
  SERVICE_INTELLIGENCE_MAP,
  type ServiceIntelligenceEntry,
} from "@/features/service-intelligence-catalog";

export interface NairaLeapGuideContainerProps {
  service: ServiceDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: (service: ServiceDefinition) => void;
}

const STEPS = ["Choose Service", "Guide", "Review", "Submit"] as const;
const CURRENT_STEP_INDEX = 1;

/**
 * NairaLeapGuideContainer — reusable conversational shell that connects the
 * existing architecture: Intent Discovery → Service Intelligence Catalog →
 * Question Engine. No new components or catalogs are introduced here; this
 * container only wires the existing modules together for the guided flow.
 */
export function NairaLeapGuideContainer({
  service,
  open,
  onOpenChange,
  onBack,
}: NairaLeapGuideContainerProps) {
  const Icon = service?.icon;

  // Local-only state — no backend, no persistence.
  const [discoveryAnswers, setDiscoveryAnswers] = useState<AnswersState | null>(null);

  // Reset the guided flow whenever the container is re-opened or the service changes.
  useEffect(() => {
    if (open) setDiscoveryAnswers(null);
  }, [open, service?.id]);

  // Resolve intent → recommended service → intelligence entry from existing catalogs.
  const resolved = useMemo(() => {
    if (!discoveryAnswers) return null;
    const rawIntent = discoveryAnswers["discovery-goal"];
    if (typeof rawIntent !== "string") return null;
    const intent = INTENT_DISCOVERY_MAP[rawIntent];
    if (!intent) return null;
    const recommendedServiceId = intent.recommendedServiceIds[0] ?? null;
    const intelligence: ServiceIntelligenceEntry | null = recommendedServiceId
      ? SERVICE_INTELLIGENCE_MAP[recommendedServiceId] ?? null
      : null;
    return {
      intentId: intent.id as IntentId,
      intentTitle: intent.title,
      recommendedServiceId,
      intelligence,
      nextWorkflow: intelligence?.nextWorkflow ?? intent.nextWorkflow,
    };
  }, [discoveryAnswers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-background p-0 left-0 top-0 sm:left-1/2 sm:top-1/2 sm:h-[90dvh] sm:max-h-[90dvh] sm:w-[min(100%,44rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-glass-border sm:bg-background/95 sm:backdrop-blur-xl data-[state=open]:duration-200 motion-reduce:transition-none"
        aria-describedby="naira-guide-desc"
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Header */}
          <header className="glass-panel rounded-none border-x-0 border-t-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:rounded-t-3xl sm:border-x sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Back"
                onClick={() => {
                  if (service) onBack?.(service);
                  onOpenChange(false);
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
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary-glow" aria-hidden="true" />
                  NairaLeap Guide
                </div>
                <DialogTitle className="truncate text-base font-semibold tracking-tight sm:text-lg">
                  {service?.title ?? ""}
                </DialogTitle>
              </div>
            </div>

            {/* Progress */}
            <ol
              aria-label="Guided request progress"
              className="mt-4 grid grid-cols-4 gap-2"
            >
              {STEPS.map((label, i) => {
                const isCurrent = i === CURRENT_STEP_INDEX;
                const isDone = i < CURRENT_STEP_INDEX;
                return (
                  <li key={label} className="min-w-0">
                    <div
                      aria-current={isCurrent ? "step" : undefined}
                      className={`h-1.5 w-full rounded-full ${
                        isCurrent
                          ? "gradient-brand shadow-[var(--shadow-glow)]"
                          : isDone
                            ? "bg-primary/60"
                            : "bg-glass-border"
                      }`}
                    />
                    <div className="mt-1.5 flex items-center gap-1 truncate text-[11px] sm:text-xs">
                      {isDone ? (
                        <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                      ) : null}
                      <span
                        className={
                          isCurrent
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
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

          {/* Conversation / engine area */}
          <div
            role="log"
            aria-live="polite"
            aria-label="NairaLeap Guide conversation"
            className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-6"
          >
            <DialogDescription id="naira-guide-desc" className="sr-only">
              Guided conversation for {service?.title ?? "your request"}.
            </DialogDescription>

            <div className="mx-auto flex w-full max-w-xl flex-col gap-6 animate-in fade-in duration-300 motion-reduce:animate-none">
              {/* Assistant welcome bubble */}
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="glass-panel min-w-0 flex-1 rounded-2xl rounded-tl-md p-4">
                  <p className="text-sm leading-relaxed text-foreground sm:text-base">
                    Welcome to NairaLeap Guide.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    A few quick questions will help us understand what you need
                    {service ? ` for ${service.title}` : ""}.
                  </p>
                </div>
              </div>

              {/* Intent Discovery → Question Engine wiring */}
              {!resolved ? (
                <QuestionEngine
                  questions={DEMO_DISCOVERY_QUESTIONS}
                  onComplete={(answers) => setDiscoveryAnswers(answers)}
                />
              ) : (
                <div className="glass-panel rounded-2xl p-5 text-sm text-muted-foreground">
                  <p className="text-foreground">
                    Recommended service loaded:{" "}
                    <span className="font-semibold">
                      {resolved.intelligence?.title ?? "—"}
                    </span>
                  </p>
                  <p className="mt-2">
                    The Question Engine is ready to receive the service-specific
                    question set in a future step.
                  </p>
                </div>
              )}

              {/* Dev-only debug panel */}
              {import.meta.env.DEV && resolved ? (
                <aside
                  aria-label="Developer debug panel"
                  className="glass-panel rounded-2xl border-dashed p-4 font-mono text-[11px] leading-relaxed text-muted-foreground"
                >
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary-glow">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Debug · dev only
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <dt>Selected Intent</dt>
                    <dd className="text-foreground">{resolved.intentId}</dd>
                    <dt>Recommended Service</dt>
                    <dd className="text-foreground">
                      {resolved.recommendedServiceId ?? "—"}
                    </dd>
                    <dt>Service Title</dt>
                    <dd className="text-foreground">
                      {resolved.intelligence?.title ?? "—"}
                    </dd>
                    <dt>Next Workflow</dt>
                    <dd className="text-foreground">{resolved.nextWorkflow}</dd>
                  </dl>
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
