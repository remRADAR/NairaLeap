import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocaleCode = "en" | "hau" | "ibo" | "yor" | "pcm" | "tiv";
export type CultureCode = "neutral";

export interface LocaleDefinition {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  status: "supported" | "unavailable";
}

export const LOCALE_STORAGE_KEY = "nairaleap.locale";
export const CULTURE_STORAGE_KEY = "nairaleap.culture";

export const LOCALE_REGISTRY: readonly LocaleDefinition[] = [
  { code: "en", label: "English", nativeLabel: "English", status: "supported" },
  { code: "hau", label: "Hausa", nativeLabel: "Hausa", status: "unavailable" },
  { code: "ibo", label: "Igbo", nativeLabel: "Igbo", status: "unavailable" },
  { code: "yor", label: "Yoruba", nativeLabel: "Yorùbá", status: "unavailable" },
  { code: "pcm", label: "Nigerian Pidgin", nativeLabel: "Nigerian Pidgin", status: "unavailable" },
  { code: "tiv", label: "Tiv", nativeLabel: "Tiv", status: "unavailable" },
] as const;

export const CULTURE_REGISTRY = [
  {
    code: "neutral" as const,
    label: "Neutral Nigerian context",
    description: "Language and cultural identity remain separate preferences.",
  },
] as const;

export const COPY = {
  interfaceLanguage: "Interface language",
  languageUnavailable: (language: string) =>
    `${language} interface translation is not available yet.`,
  languageStatus: (language: string) =>
    `${language} is the only enabled interface language. Other languages remain unavailable until complete, human-reviewed translations are available.`,
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
        if (definition?.status === "supported") setLocaleState(nextLocale);
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
