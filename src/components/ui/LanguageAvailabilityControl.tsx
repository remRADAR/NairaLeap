import { ChevronDown, Globe2 } from "lucide-react";
import { useId } from "react";
import { useLocale } from "@/features/i18n";

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
  const { locale, locales, setLocale, t } = useLocale();

  return (
    <div className="shrink-0">
      <label
        className={`inline-flex min-h-8 items-center gap-1 rounded-lg border px-1.5 text-[10px] font-semibold leading-none focus-within:ring-2 focus-within:ring-ring ${
          isPortal
            ? "border-glass-border bg-glass text-foreground"
            : "border-[#e5e5ee] bg-white text-[#626277]"
        }`}
      >
        <Globe2 className="h-3 w-3 shrink-0 text-primary-glow" aria-hidden="true" />
        <span className="sr-only">{t.interfaceLanguage}</span>
        <select
          aria-describedby={helpId}
          aria-label="Interface language"
          data-testid="language-availability-select"
          value={locale}
          onChange={(event) => setLocale(event.target.value as typeof locale)}
          className={`max-w-[5.75rem] cursor-pointer appearance-none border-0 bg-transparent py-1 pr-0 text-[10px] outline-none ${
            isPortal ? "text-foreground" : "text-[#626277]"
          }`}
        >
          {locales.map((language) => (
            <option
              key={language.code}
              value={language.code}
              disabled={language.status !== "supported"}
            >
              {language.label}
              {language.status === "unavailable" ? " (not available)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="h-2.5 w-2.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </label>
      <span id={helpId} className="sr-only">
        {t.languageStatus(locales.find((language) => language.code === locale)?.label ?? "English")}
      </span>
    </div>
  );
}
