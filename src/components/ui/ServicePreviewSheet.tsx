import { X, ArrowRight, Check } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { BrandButton } from "./BrandButton";
import type { ServiceDefinition } from "@/features/services/serviceCatalog";

export interface ServicePreviewSheetProps {
  service: ServiceDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue?: (service: ServiceDefinition) => void;
}

/**
 * ServicePreviewSheet — ONE reusable bottom sheet shared by every service card.
 * Content is populated from the ServiceDefinition passed in.
 *
 * - Slides up from the bottom with a softly dimmed backdrop (Spotify/Apple Maps feel).
 * - Focus trap, Escape-to-close and accessible labelling via Radix/Vaul primitives.
 * - Respects prefers-reduced-motion (handled by Vaul + our tailwind animations).
 */
export function ServicePreviewSheet({
  service,
  open,
  onOpenChange,
  onContinue,
}: ServicePreviewSheetProps) {
  const Icon = service?.icon;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="border-glass-border bg-background/95 backdrop-blur-xl motion-reduce:transition-none"
        aria-describedby={service ? "service-preview-desc" : undefined}
      >
        {/* Safe-area aware container */}
        <div className="mx-auto w-full max-w-2xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <DrawerHeader className="relative px-0 pt-2 text-left">
            <div className="flex items-start gap-4">
              {Icon && service ? (
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  <Icon className="h-6 w-6" />
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {service?.title ?? ""}
                </DrawerTitle>
                <DrawerDescription
                  id="service-preview-desc"
                  className="mt-1 text-sm leading-relaxed text-muted-foreground"
                >
                  {service?.longDescription ?? service?.shortDescription ?? ""}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  aria-label="Close service preview"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-glass-border bg-glass text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {service ? (
            <div className="mt-2">
              <h3 className="text-sm font-semibold text-foreground">What we can help you with</h3>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {service.examples.map((item) => (
                  <li
                    key={item}
                    className="glass-panel flex items-start gap-3 rounded-xl p-3 text-sm text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <BrandButton variant="ghost" className="min-h-12 px-6 text-base">
                Close
              </BrandButton>
            </DrawerClose>
            <BrandButton
              className="min-h-12 px-6 text-base"
              onClick={() => {
                if (service) onContinue?.(service);
                onOpenChange(false);
              }}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </BrandButton>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
