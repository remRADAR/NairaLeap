import { createContext, useContext } from "react";
import type { COPY, CultureCode, LocaleCode, LocaleDefinition } from "./index";

export interface LocaleContextValue {
  locale: LocaleCode;
  culture: CultureCode;
  locales: readonly LocaleDefinition[];
  setLocale: (nextLocale: LocaleCode) => void;
  setCulture: (nextCulture: CultureCode) => void;
  t: typeof COPY;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
