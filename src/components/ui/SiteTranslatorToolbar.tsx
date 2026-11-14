import type { ReactNode } from "react";
import { LanguageAvailabilityControl } from "./LanguageAvailabilityControl";

export function SiteTranslatorToolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="site-translator-bar" role="region" aria-label="NairaLeap site translation">
      <div className="site-translator-bar__inner">
        <div className="site-translator-bar__message">
          {children ?? <span>Translate the entire NairaLeap website</span>}
        </div>
        <LanguageAvailabilityControl theme="toolbar" />
      </div>
    </div>
  );
}
