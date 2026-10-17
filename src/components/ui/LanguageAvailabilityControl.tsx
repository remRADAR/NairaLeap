import { ChevronDown, Globe2 } from "lucide-react";
import { useId } from "react";

type LanguageAvailabilityControlProps = {
  theme: "portal" | "editorial";
};

/**
 * Honest locale-selector foundation: English is currently the only enabled
 * interface locale because no human-reviewed full-site dictionaries exist.
 */
export function LanguageAvailabilityControl({ theme }: LanguageAvailabilityControlProps) {
  const helpId = useId();
  const isPortal = theme === "portal";

  return (
    <div className="shrink-0">
      <label
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2 text-[11px] font-semibold focus-within:ring-2 focus-within:ring-ring ${
          isPortal
            ? "border-glass-border bg-glass text-foreground"
            : "border-[#e5e5ee] bg-white text-[#626277]"
        }`}
      >
        <Globe2 className="h-3.5 w-3.5 shrink-0 text-primary-glow" aria-hidden="true" />
        <span className="sr-only">Interface language</span>
        <select
          aria-describedby={helpId}
          aria-label="Interface language"
          data-testid="language-availability-select"
          value="en"
          onChange={() => undefined}
          className={`max-w-[10rem] cursor-pointer appearance-none border-0 bg-transparent py-1 pr-0.5 text-[11px] outline-none ${
            isPortal ? "text-foreground" : "text-[#626277]"
          }`}
        >
          <option value="en">English (active)</option>
          <option value="hau" disabled>
            Hausa — translation review pending
          </option>
          <option value="ibo" disabled>
            Igbo — translation review pending
          </option>
          <option value="yor" disabled>
            Yoruba — translation review pending
          </option>
          <option value="tiv" disabled>
            Tiv — translation review pending
          </option>
        </select>
        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
      </label>
      <span id={helpId} className="sr-only">
        English is the only enabled interface language. Other languages are disabled until complete,
        human-reviewed interface translations are available.
      </span>
    </div>
  );
}
