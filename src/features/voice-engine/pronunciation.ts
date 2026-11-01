/**
 * Pronunciation handling for Nigerian names, locations, currencies and
 * terminology. Applied as provider-neutral text preprocessing before
 * synthesis so any provider gets consistent, locally correct speech.
 *
 * Entries map a term (word-boundary matched, case-insensitive) to a respelling
 * hint that standard TTS engines pronounce correctly. This is a curated
 * starter lexicon; entries must be reviewed by a native speaker before the
 * founder voice goes live (see HANDOFF).
 */

export const NIGERIAN_PRONUNCIATION_LEXICON: Record<string, string> = {
  // Brand
  nairaleap: "NY-ra LEEP",
  naira: "NY-ra",
  "₦": "Naira",
  // Cities / states
  lagos: "LAH-gos",
  abuja: "ah-BOO-ja",
  kano: "KAH-no",
  ibadan: "ee-BAH-dahn",
  enugu: "eh-NOO-goo",
  jos: "JAWS",
  kaduna: "kah-DOO-na",
  port: "PORT",
  onitsha: "oh-NEE-cha",
  asaba: "ah-SAH-ba",
  calabar: "KAL-ah-bar",
  // Institutions / terms
  cbn: "C B N",
  nhf: "N H F",
  fmbn: "F M B N",
  nin: "N I N",
  cac: "C A C",
  cbt: "C B T",
  vpn: "V P N",
  nnpcl: "triple N P C L",
  pencom: "PEN-com",
  lga: "L G A",
  // Common words
  naira: "NY-ra",
  kobo: "KOH-bo",
  danfo: "DAHN-fo",
  okada: "oh-KAH-dah",
  keke: "KEH-keh",
  garri: "GAH-ree",
  jollof: "JOL-of",
  suya: "SOO-yah",
};

const TERM_PATTERN = new RegExp(
  `(₦|\b${Object.keys(NIGERIAN_PRONUNCIATION_LEXICON)
    .filter((k) => k !== "₦")
    .sort((a, b) => b.length - a.length)
    .join("|")}\b)`,
  "gi",
);

/** Rewrites text with pronunciation hints for consistent Nigerian pronunciation. */
export function applyPronunciationHints(text: string): string {
  return text.replace(TERM_PATTERN, (match) => {
    const key = match.toLowerCase();
    const hint = NIGERIAN_PRONUNCIATION_LEXICON[key];
    return hint ?? match;
  });
}
