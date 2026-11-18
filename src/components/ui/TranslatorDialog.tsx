import { Languages, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { translateText } from "@/features/translation/server";

type LocaleCode = "en" | "hau" | "ibo" | "yor" | "pcm" | "tiv";
const LANGUAGES: Array<{ code: LocaleCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "hau", label: "Hausa" },
  { code: "ibo", label: "Igbo" },
  { code: "yor", label: "Yoruba" },
  { code: "pcm", label: "Nigerian Pidgin" },
  { code: "tiv", label: "Tiv" },
];

export function TranslatorDialog({ theme = "editorial" }: { theme?: "editorial" | "portal" }) {
  const [open, setOpen] = useState(false);
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>("en");
  const [targetLocale, setTargetLocale] = useState<LocaleCode>("yor");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [provider, setProvider] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const portal = theme === "portal";

  const translate = async () => {
    setError("");
    setResult("");
    setProvider("");
    setLoading(true);
    try {
      const response = await translateText({ data: { text, sourceLocale, targetLocale } });
      setResult(response.text);
      setProvider(response.provider);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Translation could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Open translator"
          data-testid="translator-button"
          className={
            portal
              ? "portal-nav-link inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/40 px-3 text-primary-glow transition hover:bg-surface-elevated"
              : "editorial-control inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e5e5ee] px-3 text-[#626277] transition hover:border-[#d8c9f3] hover:text-[#8129e5]"
          }
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.1em] sm:inline">
            Translate
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Translate with NairaLeap</DialogTitle>
          <DialogDescription>
            Send a short phrase to the translation engine. Results are provider output and should be
            reviewed before formal publication.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              From
              <select
                value={sourceLocale}
                onChange={(event) => setSourceLocale(event.target.value as LocaleCode)}
                className="h-10 rounded-md border bg-background px-3"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              To
              <select
                value={targetLocale}
                onChange={(event) => setTargetLocale(event.target.value as LocaleCode)}
                className="h-10 rounded-md border bg-background px-3"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Enter text to translate"
            rows={5}
            maxLength={2000}
            aria-label="Text to translate"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{text.length}/2000</span>
            <Button
              type="button"
              onClick={() => void translate()}
              disabled={loading || !text.trim()}
              data-testid="translator-submit"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? "Translating…" : "Translate"}
            </Button>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}
          {result && (
            <div
              className="rounded-md border border-primary/20 bg-primary/5 p-4"
              data-testid="translator-result"
            >
              <p className="text-sm leading-6">{result}</p>
              <p className="mt-2 text-xs text-muted-foreground">Provider: {provider}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
