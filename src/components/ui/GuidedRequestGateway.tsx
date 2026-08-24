import { ArrowRight, ArrowLeft, Clock, ShieldCheck, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { BrandButton } from "./BrandButton";
import type { ServiceDefinition } from "@/features/services/serviceCatalog";
import { SERVICE_INTELLIGENCE_MAP } from "@/features/service-intelligence-catalog";

export interface GuidedRequestGatewayProps {
  service: ServiceDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: (service: ServiceDefinition) => void;
  onBack?: (service: ServiceDefinition) => void;
}

const STEPS = ["Choose Service", "Guide", "Review", "Submit"] as const;
const CURRENT_STEP_INDEX = 1; // "Guide" is active on the gateway.

/**
 * GuidedRequestGateway — ONE reusable transitional step shown after the user
 * taps "Continue" inside the ServicePreviewSheet. Prepares the user before the
 * guided request flow begins. Populated dynamically from a ServiceDefinition
 * so every service (including future Insurance/Mortgage) reuses this component.
 */
export function GuidedRequestGateway({
  service,
  open,
  onOpenChange,
  onStart,
  onBack,
}: GuidedRequestGatewayProps) {
  const Icon = service?.icon;
  const estimatedCompletionTime = service
    ? SERVICE_INTELLIGENCE_MAP[service.id]?.estimatedCompletionTime
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl gap-0 border-glass-border bg-background/95 p-0 backdrop-blur-xl data-[state=open]:duration-200 motion-reduce:transition-none"
        aria-describedby="guided-gateway-desc"
      >
        <div className="flex max-h-[90dvh] flex-col overflow-hidden">
          {/* Header */}
          <div className="relative px-5 pt-6 pb-4 sm:px-7">
            <div className="flex items-start gap-4">
              {Icon ? (
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  <Icon className="h-6 w-6" />
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary-glow" aria-hidden="true" />
                  NairaLeap Guide
                </div>
                <DialogTitle className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  {service?.title ?? ""}
                </DialogTitle>
                <DialogDescription
                  id="guided-gateway-desc"
                  className="mt-1 text-sm leading-relaxed text-muted-foreground"
                >
                  You&apos;re about to begin a guided request.
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="Close guided request"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-glass-border bg-glass text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="px-5 sm:px-7">
            <ol aria-label="Guided request progress" className="grid grid-cols-4 gap-2">
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
                    <div
                      className={`mt-2 truncate text-[11px] sm:text-xs ${
                        isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            <p className="text-sm leading-relaxed text-foreground sm:text-base">
              NairaLeap Guide will ask a few simple questions to understand your needs and prepare
              the correct request.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="glass-panel flex items-start gap-3 rounded-xl p-4">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"
                >
                  <Clock className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Estimated time
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {estimatedCompletionTime ?? "A few minutes"}
                  </div>
                </div>
              </div>
              <div className="glass-panel flex items-start gap-3 rounded-xl p-4">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"
                >
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Privacy
                  </div>
                  <div className="mt-0.5 text-sm text-foreground">
                    Your information will only be used to prepare your request.
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              You can pause any time. We&apos;ll walk you through it step by step.
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-glass-border bg-background/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <BrandButton
                variant="ghost"
                className="min-h-12 px-5 text-base"
                onClick={() => {
                  if (service) onBack?.(service);
                  onOpenChange(false);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </BrandButton>
              <BrandButton
                className="min-h-12 px-6 text-base"
                onClick={() => {
                  if (service) onStart?.(service);
                }}
              >
                Start Guided Request
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </BrandButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
