import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LANGUAGE_CODES = {
  en: "en",
  hau: "ha",
  ibo: "ig",
  yor: "yo",
  pcm: "pcm",
  tiv: "tiv",
} as const;

const translationInput = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Enter text to translate.")
    .max(2000, "Text is limited to 2,000 characters."),
  sourceLocale: z.enum(["en", "hau", "ibo", "yor", "pcm", "tiv"]),
  targetLocale: z.enum(["en", "hau", "ibo", "yor", "pcm", "tiv"]),
});

type ProviderResponse = {
  responseData?: { translatedText?: unknown };
  responseStatus?: number;
  responseDetails?: string;
};

export const translateText = createServerFn({ method: "POST" })
  .validator((input: unknown) => translationInput.parse(input))
  .handler(async ({ data }) => {
    if (data.sourceLocale === data.targetLocale) {
      return {
        text: data.text,
        sourceLocale: data.sourceLocale,
        targetLocale: data.targetLocale,
        provider: "identity",
      };
    }
    const langpair = `${LANGUAGE_CODES[data.sourceLocale]}|${LANGUAGE_CODES[data.targetLocale]}`;
    const endpoint = new URL("https://api.mymemory.translated.net/get");
    endpoint.searchParams.set("q", data.text);
    endpoint.searchParams.set("langpair", langpair);
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("The translation provider is temporarily unavailable.");
    const payload = (await response.json()) as ProviderResponse;
    const translatedText = payload.responseData?.translatedText;
    if (
      payload.responseStatus !== 200 ||
      typeof translatedText !== "string" ||
      !translatedText.trim()
    ) {
      throw new Error(payload.responseDetails || "This language pair is not currently supported.");
    }
    return {
      text: translatedText.trim(),
      sourceLocale: data.sourceLocale,
      targetLocale: data.targetLocale,
      provider: "MyMemory",
    };
  });
