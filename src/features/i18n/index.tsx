import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocaleCode = "en" | "hau" | "ibo" | "yor" | "pcm" | "tiv";
export type CultureCode = "neutral";

type GoogleTranslateApi = {
  translate: {
    TranslateElement: new (
      options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
      elementId: string,
    ) => unknown;
  };
};

declare global {
  interface Window {
    google?: GoogleTranslateApi;
    nairaLeapGoogleTranslateInit?: () => void;
  }
}

export interface LocaleDefinition {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  googleCode?: string;
  status: "supported" | "unavailable";
}

export const LOCALE_STORAGE_KEY = "nairaleap.locale";
export const CULTURE_STORAGE_KEY = "nairaleap.culture";

// Keep the language registry in one place so the menu control and the full-page
// Google Translate runtime always expose the same set of site languages.
export const LOCALE_REGISTRY: readonly LocaleDefinition[] = [
  { code: "en", label: "English", nativeLabel: "English", status: "supported" },
  { code: "hau", label: "Hausa", nativeLabel: "Hausa", googleCode: "ha", status: "supported" },
  { code: "ibo", label: "Igbo", nativeLabel: "Igbo", googleCode: "ig", status: "supported" },
  { code: "yor", label: "Yoruba", nativeLabel: "Yorùbá", googleCode: "yo", status: "supported" },
  {
    code: "pcm",
    label: "Nigerian Pidgin",
    nativeLabel: "Nigerian Pidgin",
    googleCode: "pcm",
    status: "supported",
  },
  { code: "tiv", label: "Tiv", nativeLabel: "Tiv", googleCode: "tiv", status: "supported" },
] as const;

export const CULTURE_REGISTRY = [
  {
    code: "neutral" as const,
    label: "Neutral Nigerian context",
    description: "Language and cultural identity remain separate preferences.",
  },
] as const;

export const COPY = {
  interfaceLanguage: "Translate this site",
  languageUnavailable: (language: string) =>
    `${language} translation is not available through Google Translate yet.`,
  languageStatus: (language: string) =>
    `The entire site can be translated to ${language}. Page navigation and editorial content are translated in place; your entered form values are kept unchanged.`,
  services: "Services",
  signIn: "Sign in",
  dashboard: "Dashboard",
  admin: "Admin",
  reviewBeforeSubmit: "Review before submit",
  singlePageFormNotice: (submitLabel: string) =>
    `The whole form is on this one page. Nothing is submitted until you press ${submitLabel}.`,
} as const;

function isLocaleCode(value: string | null): value is LocaleCode {
  return LOCALE_REGISTRY.some((locale) => locale.code === value);
}

function readStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (!stored || !isLocaleCode(stored)) return "en";
  return LOCALE_REGISTRY.find((locale) => locale.code === stored)?.status === "supported"
    ? stored
    : "en";
}

let googleTranslateReady: Promise<void> | null = null;

function loadGoogleTranslate(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.translate) return Promise.resolve();
  if (googleTranslateReady) return googleTranslateReady;

  googleTranslateReady = new Promise((resolve) => {
    const initialize = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "ha,ig,yo,pcm,tiv",
            autoDisplay: false,
          },
          "google_translate_element",
        );
      }
      resolve();
    };

    window.nairaLeapGoogleTranslateInit = initialize;
    const existing = document.getElementById("google-translate-script");
    if (existing) {
      const retry = window.setInterval(() => {
        if (!window.google?.translate) return;
        window.clearInterval(retry);
        initialize();
      }, 100);
      window.setTimeout(() => {
        window.clearInterval(retry);
        resolve();
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.async = true;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=nairaLeapGoogleTranslateInit";
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return googleTranslateReady;
}

function selectGoogleLocale(locale: LocaleCode) {
  if (typeof document === "undefined") return;
  const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (!combo) return;
  const googleCode = LOCALE_REGISTRY.find((item) => item.code === locale)?.googleCode ?? "";
  combo.value = googleCode;
  combo.dispatchEvent(new Event("change"));
}

function selectGoogleLocaleWhenReady(locale: LocaleCode, attempts = 0) {
  if (typeof window === "undefined") return;
  const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (combo) {
    selectGoogleLocale(locale);
    return;
  }
  if (attempts < 30)
    window.setTimeout(() => selectGoogleLocaleWhenReady(locale, attempts + 1), 150);
}

interface LocaleContextValue {
  locale: LocaleCode;
  culture: CultureCode;
  locales: readonly LocaleDefinition[];
  setLocale: (nextLocale: LocaleCode) => void;
  setCulture: (nextCulture: CultureCode) => void;
  t: typeof COPY;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(readStoredLocale);
  const [culture, setCultureState] = useState<CultureCode>("neutral");

  useEffect(() => {
    const translateRoot = document.getElementById("google_translate_element");
    if (!translateRoot) {
      const element = document.createElement("div");
      element.id = "google_translate_element";
      element.setAttribute("aria-hidden", "true");
      element.className = "google-translate-runtime";
      document.body.appendChild(element);
    }
    void loadGoogleTranslate().then(() => selectGoogleLocaleWhenReady(locale));
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "en" ? "en" : locale;
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem(CULTURE_STORAGE_KEY, culture);
  }, [culture]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      culture,
      locales: LOCALE_REGISTRY,
      setLocale: (nextLocale) => {
        const definition = LOCALE_REGISTRY.find((item) => item.code === nextLocale);
        if (definition?.status === "supported") {
          setLocaleState(nextLocale);
          window.setTimeout(() => selectGoogleLocaleWhenReady(nextLocale), 250);
        }
      },
      setCulture: setCultureState,
      t: COPY,
    }),
    [culture, locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
