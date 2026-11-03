import type { EditorialPost } from "../src/data/wordpressEditorial";
import {
  INVALID_ORIGINAL_IMAGES,
  RECOVERED_ORIGINAL_IMAGES,
} from "../src/data/editorialMediaApproved";
import type { EditorialMediaRecord } from "../src/features/editorial/media-types";
import {
  DISCOVERY_LOG_PATH,
  MANIFEST_PATH,
  readManifest,
  readReport,
  regenerateSubset,
  writeJson,
  type EditorialMediaManifest,
} from "./editorial-media-lib";

/**
 * Intelligent replacement-imagery discovery via Openverse.
 *
 * Eligibility (corrected): articles with a valid original featured image are
 * skipped, as are articles whose original was recovered by reconciliation and
 * articles that already have an approved replacement. Articles whose original
 * image is broken (marked invalid by reconciliation) ARE eligible for
 * replacement candidates, as are articles that never had an original image.
 * Rejected records keep their existing workflow rules: a rejected article can
 * receive fresh candidates on an explicit --refresh run, and refresh never
 * silently discards approved records.
 *
 * For each eligible article:
 *   1. analyse the title (named entities), tags, and category context;
 *   2. build focused queries, including Nigerian geographic context and
 *      industry-specific visual concepts;
 *   3. retrieve candidates from Openverse, filtered to commercial-safe
 *      licenses;
 *   4. score genuine relevance against the article's own vocabulary;
 *   5. record candidates — with full source and licensing provenance — in the
 *      media manifest as "candidate" records for editorial approval.
 *
 * Relevance and licensing requirements are never weakened to increase counts.
 * Candidates are never published and never auto-approved. Only records
 * approved through scripts/approve-editorial-media.ts can become featured
 * images.
 *
 * Usage:
 *   bun run media:discover [--limit 3] [--slugs a,b] [--licenses cc0,pdm,by]
 *                          [--min-score 2] [--refresh]
 */

const OPENVERSE_ENDPOINT = "https://api.openverse.org/v1/images/";
const DEFAULT_LICENSES = ["cc0", "pdm", "by"];
const LICENSE_RANK: Record<string, number> = { cc0: 0, pdm: 1, by: 2 };
const MAX_CANDIDATES_PER_ARTICLE = 3;
const MAX_QUERIES_PER_ARTICLE = 6;
const QUERY_DELAY_MS = 300;
const QUERY_TIMEOUT_MS = 15000;

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "in",
  "on",
  "for",
  "to",
  "as",
  "at",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "with",
  "after",
  "before",
  "from",
  "over",
  "into",
  "amid",
  "among",
  "between",
  "their",
  "his",
  "her",
  "its",
  "this",
  "that",
  "these",
  "those",
  "not",
  "no",
  "nor",
  "but",
  "if",
  "then",
  "than",
  "so",
  "such",
  "can",
  "could",
  "may",
  "might",
  "will",
  "would",
  "should",
  "must",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "about",
  "against",
  "off",
  "per",
  "vs",
  "via",
  "up",
  "out",
  "down",
  "more",
  "most",
  "how",
  "why",
  "what",
  "when",
  "where",
  "who",
  "whom",
  "which",
  "says",
  "said",
  "say",
  "new",
  "top",
  "best",
  "worst",
  "full",
  "video",
  "photos",
  "photo",
  "watch",
  "read",
  "amidst",
]);

const PEOPLE_HINTS = [
  "portrait",
  "man",
  "woman",
  "person",
  "people",
  "face",
  "crowd",
  "child",
  "children",
  "student",
  "worker",
  "farmer",
  "police",
  "soldier",
  "president",
  "governor",
  "minister",
  "senator",
  "celebrity",
  "footballer",
  "artist",
  "singer",
  "musician",
  "fan",
  "players",
];

const IP_HINTS = [
  "logo",
  "brand",
  "trademark",
  "product",
  "shopfront",
  "billboard",
  "advertisement",
  "poster",
  "album",
  "cover",
  "screenshot",
  "currency",
  "banknote",
  "coin",
  "stamp",
  "merchandise",
];

const CATEGORY_CONCEPTS: Array<{ match: RegExp; concepts: string[] }> = [
  { match: /bank|cbn|mortgage|loan|lending|deposit/i, concepts: ["banknotes", "bank building"] },
  {
    match: /cryptocurrenc|bitcoin|blockchain|crypto|web3|defi|stablecoin/i,
    concepts: ["bitcoin", "cryptocurrency"],
  },
  { match: /stock|equit|shares|investor|nasd|nse|bourse|dividend/i, concepts: ["stock market"] },
  {
    match: /econom|gdp|inflation|recession|fiscal|budget|treasury|debt|naira/i,
    concepts: ["economy", "financial charts"],
  },
  { match: /oil|gas|petrol|energy|refiner|opec/i, concepts: ["oil industry", "refinery"] },
  { match: /telecom|internet|broadband|5g|technolog|fintech/i, concepts: ["telecommunications"] },
  { match: /agric|farm|crop|cocoa|rice|food|harvest/i, concepts: ["agriculture", "farmland"] },
  { match: /aviation|airline|airport|flight/i, concepts: ["airplanes", "airport"] },
  { match: /real estate|property|housing|construction|cement/i, concepts: ["real estate"] },
  { match: /trade|export|import|port|shipping|custom|maritime/i, concepts: ["cargo port"] },
  { match: /sport|football|caf|fifa|league/i, concepts: ["football stadium"] },
  { match: /entertainment|music|film|nollywood|cinema/i, concepts: ["concert", "cinema"] },
  { match: /health|hospital|medic|doctor|disease|malaria/i, concepts: ["hospital", "medicine"] },
  { match: /education|school|university|student|jamb/i, concepts: ["classroom"] },
  { match: /power|electricity|grid|solar|renewable/i, concepts: ["power lines", "solar panels"] },
  { match: /transport|rail|road|traffic|logistics/i, concepts: ["railway", "highway"] },
];

type OpenverseTag = { name?: string | null };

type OpenverseImage = {
  id: string;
  title?: string | null;
  creator?: string | null;
  license?: string | null;
  license_version?: string | null;
  license_url?: string | null;
  foreign_landing_url?: string | null;
  url?: string | null;
  source?: string | null;
  filetype?: string | null;
  tags?: OpenverseTag[] | null;
};

const flagValue = (name: string): string | null => {
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--" + name) return args[index + 1] ?? "";
    if (arg.startsWith("--" + name + "=")) return arg.slice(name.length + 3);
  }
  return null;
};

const hasFlag = (name: string): boolean => process.argv.slice(2).includes("--" + name);

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));

/**
 * Conservative named-entity extraction: acronyms and capitalized words that
 * are not the title's first word, merged into adjacent phrases.
 */
const extractEntities = (title: string): string[] => {
  const words = title
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z'\u2019-]/g, ""))
    .filter((word) => word.length > 0);
  const phrases: string[] = [];
  let current: string[] = [];
  words.forEach((word, index) => {
    const isEntity = /^[A-Z]{2,}$/.test(word) || (index > 0 && /^[A-Z][a-z]/.test(word));
    if (isEntity) current.push(word);
    else if (current.length > 0) {
      phrases.push(current.join(" "));
      current = [];
    }
  });
  if (current.length > 0) phrases.push(current.join(" "));
  return phrases.filter((phrase) => phrase.length >= 3).slice(0, 3);
};

const articleKeywords = (post: EditorialPost): Set<string> =>
  new Set([
    ...tokenize(post.title),
    ...post.tags.flatMap((tag) => tokenize(tag)),
    ...tokenize(post.category),
    ...post.categoryPath.flatMap((segment) => tokenize(segment)),
  ]);

/**
 * Discovery eligibility. Articles with a valid original image are skipped;
 * articles with a recovered original are skipped; articles whose original is
 * broken (invalid) CAN receive replacement candidates; articles without an
 * original are eligible; articles with an approved replacement are never
 * re-discovered.
 */
export const isEligibleForDiscovery = (
  post: { slug: string; image: string | null },
  invalidOriginals: Record<string, true>,
  recoveredOriginals: Record<string, string>,
  approvedSlugs: Set<string>,
): boolean => {
  if (approvedSlugs.has(post.slug)) return false;
  if (recoveredOriginals[post.slug]) return false;
  if (post.image) return invalidOriginals[post.slug] === true;
  return true;
};

/**
 * Build focused queries from named entities, article vocabulary, category
 * context, industry-specific visual concepts, and Nigerian geographic
 * context. Bounded to MAX_QUERIES_PER_ARTICLE and deduplicated.
 */
export const buildQueries = (post: EditorialPost): string[] => {
  const queries: string[] = [];
  const entities = extractEntities(post.title);
  if (entities.length > 0) {
    const phrase = entities.slice(0, 2).join(" ");
    queries.push(phrase);
    queries.push(phrase + " Nigeria");
  }
  const keywords = [...articleKeywords(post)];
  if (keywords.length >= 2) queries.push(keywords.slice(0, 4).join(" "));
  const context = [post.category, ...post.tags.slice(0, 2)].filter(Boolean).join(" ").trim();
  if (context.length > 0) queries.push(context);
  const haystack = post.title + " " + post.tags.join(" ") + " " + post.category;
  const concepts: string[] = [];
  for (const entry of CATEGORY_CONCEPTS) {
    if (entry.match.test(haystack)) concepts.push(...entry.concepts);
  }
  for (const concept of [...new Set(concepts)].slice(0, 4)) {
    queries.push(concept + " Nigeria");
    if (queries.length >= MAX_QUERIES_PER_ARTICLE) break;
    queries.push(concept);
  }
  return [...new Set(queries.map((query) => query.trim()).filter(Boolean))].slice(
    0,
    MAX_QUERIES_PER_ARTICLE,
  );
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((done) => setTimeout(done, ms));
};

const searchOpenverse = async (query: string, licenses: string[]): Promise<OpenverseImage[]> => {
  const params = new URLSearchParams({
    q: query,
    license: licenses.join(","),
    page_size: "20",
    mature: "false",
  });
  const response = await fetch(OPENVERSE_ENDPOINT + "?" + params.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "NairaLeap editorial media discovery/1.0",
    },
    signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
  });
  if (response.status === 429 || response.status === 403) {
    throw new Error("Openverse rate limit reached (HTTP " + response.status + ")");
  }
  if (!response.ok) {
    throw new Error("Openverse request failed (HTTP " + response.status + ")");
  }
  const payload = (await response.json()) as { results?: OpenverseImage[] };
  return payload.results ?? [];
};

const rightsNotesFor = (image: OpenverseImage): { required: boolean; notes: string | null } => {
  const haystack =
    (image.title ?? "") + " " + (image.tags ?? []).map((tag) => tag.name ?? "").join(" ");
  const lower = haystack.toLowerCase();
  const peopleHits = PEOPLE_HINTS.filter((hint) => lower.includes(hint));
  const ipHits = IP_HINTS.filter((hint) => lower.includes(hint));
  const notes: string[] = [];
  if (peopleHits.length > 0) {
    notes.push(
      "May depict identifiable people (" +
        peopleHits.join(", ") +
        "); verify depiction rights before commercial use.",
    );
  }
  if (ipHits.length > 0) {
    notes.push(
      "May contain trademarks, artwork, or third-party IP (" +
        ipHits.join(", ") +
        "); verify rights before use.",
    );
  }
  return { required: notes.length > 0, notes: notes.length > 0 ? notes.join(" ") : null };
};

const attributionFor = (image: OpenverseImage): string => {
  const parts = [
    image.title ?? "Untitled image",
    image.creator ? "by " + image.creator : null,
    (image.license ?? "").toUpperCase() +
      (image.license_version ? " " + image.license_version : ""),
    "via Openverse" + (image.source ? " (" + image.source + ")" : ""),
    image.license_url ?? null,
  ];
  return parts.filter(Boolean).join(" — ");
};

const main = async (): Promise<void> => {
  const { EDITORIAL_POSTS } = await import("../src/data/wordpressEditorial");

  const limit = Math.max(1, Number(flagValue("limit") ?? 3));
  const requestedSlugs = (flagValue("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0);
  const licenses = (flagValue("licenses") ?? DEFAULT_LICENSES.join(","))
    .split(",")
    .map((license) => license.trim().toLowerCase())
    .filter((license) => license.length > 0);
  const minScore = Math.max(1, Number(flagValue("min-score") ?? 2));
  const refresh = hasFlag("refresh");

  const manifest = readManifest();
  const report = readReport();
  const statusBySlug = new Map<string, Set<string>>();
  for (const record of manifest.records) {
    const statuses = statusBySlug.get(record.articleSlug) ?? new Set<string>();
    statuses.add(record.status);
    statusBySlug.set(record.articleSlug, statuses);
  }
  const approvedSlugs = new Set(
    manifest.records
      .filter((record) => record.status === "approved")
      .map((record) => record.articleSlug),
  );

  const pending = EDITORIAL_POSTS.filter((post) =>
    isEligibleForDiscovery(post, INVALID_ORIGINAL_IMAGES, RECOVERED_ORIGINAL_IMAGES, approvedSlugs),
  )
    .filter((post) => requestedSlugs.length === 0 || requestedSlugs.includes(post.slug))
    .filter((post) => {
      if (refresh) return true;
      const statuses = statusBySlug.get(post.slug);
      if (!statuses) return true;
      return !statuses.has("candidate") && !statuses.has("approved") && !statuses.has("rejected");
    })
    .slice(0, limit);

  const log = {
    ranAt: new Date().toISOString(),
    endpoint: OPENVERSE_ENDPOINT,
    licenses,
    minScore,
    articlesProcessed: pending.length,
    queriesIssued: 0,
    candidatesRecorded: 0,
    errors: [] as string[],
  };

  const newRecords: EditorialMediaRecord[] = [];

  for (const post of pending) {
    const keywords = articleKeywords(post);
    const queries = buildQueries(post);
    const scored = new Map<
      string,
      { image: OpenverseImage; score: number; matched: string[]; query: string }
    >();

    for (const query of queries) {
      let results: OpenverseImage[] = [];
      try {
        await delay(QUERY_DELAY_MS);
        results = await searchOpenverse(query, licenses);
        log.queriesIssued += 1;
      } catch (error) {
        log.errors.push(post.slug + " / " + query + ": " + (error as Error).message);
        continue;
      }
      for (const image of results) {
        if (!image.id || !image.url) continue;
        const imageTerms = new Set([
          ...tokenize(image.title ?? ""),
          ...(image.tags ?? []).flatMap((tag) => tokenize(tag.name ?? "")),
        ]);
        const matched = [...keywords].filter((keyword) => imageTerms.has(keyword));
        const score = matched.length;
        const previous = scored.get(image.id);
        if (!previous || score > previous.score) {
          scored.set(image.id, { image, score, matched, query });
        }
      }
    }

    const ranked = [...scored.values()]
      .filter((entry) => entry.score >= minScore)
      .sort(
        (a, b) =>
          b.score - a.score ||
          (LICENSE_RANK[a.image.license ?? ""] ?? 3) - (LICENSE_RANK[b.image.license ?? ""] ?? 3),
      )
      .slice(0, MAX_CANDIDATES_PER_ARTICLE);

    for (const entry of ranked) {
      const license = entry.image.license ?? null;
      const licenseCode = (license ?? "").toLowerCase();
      const attributionRequired = licenseCode !== "cc0" && licenseCode !== "pdm";
      const rights = rightsNotesFor(entry.image);
      const record: EditorialMediaRecord = {
        articleId: post.id,
        articleSlug: post.slug,
        articleTitle: post.title,
        originalImage: post.image ?? null,
        replacementImage: null,
        sourceProvider: "openverse",
        sourceRecordId: entry.image.id,
        sourceUrl: entry.image.foreign_landing_url ?? entry.image.url ?? null,
        imageUrl: entry.image.url,
        imageCreator: entry.image.creator ?? null,
        license,
        licenseVersion: entry.image.license_version ?? null,
        licenseUrl: entry.image.license_url ?? null,
        attributionRequired,
        attributionText: attributionRequired ? attributionFor(entry.image) : null,
        rightsReviewRequired: rights.required,
        rightsNotes: rights.notes,
        relevanceScore: entry.score,
        relevanceNotes:
          "Matched article terms: " + entry.matched.join(", ") + " (query: " + entry.query + ").",
        queryUsed: entry.query,
        retrievedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        recoveryMethod: null,
        rightsClearedBy: null,
        rightsClearedAt: null,
        visualInspectionConfirmedBy: null,
        visualInspectionConfirmedAt: null,
        editorialRelevanceConfirmedBy: null,
        editorialRelevanceConfirmedAt: null,
        downloadVerified: false,
        downloadedSha256: null,
        statusHistory: [
          {
            at: new Date().toISOString(),
            by: "openverse-discovery",
            action: "discovered",
            notes: "query: " + entry.query,
          },
        ],
        status: "candidate",
      };
      newRecords.push(record);
    }
  }

  log.candidatesRecorded = newRecords.length;

  const processedSlugs = new Set(pending.map((post) => post.slug));
  const keptRecords = refresh
    ? manifest.records.filter(
        (record) => !(record.status === "candidate" && processedSlugs.has(record.articleSlug)),
      )
    : manifest.records;
  const nextManifest: EditorialMediaManifest = {
    schemaVersion: 1,
    records: [...keptRecords, ...newRecords],
  };

  writeJson(MANIFEST_PATH, nextManifest);
  writeJson(DISCOVERY_LOG_PATH, log);
  regenerateSubset(report, nextManifest);

  console.log(
    JSON.stringify(
      {
        articlesProcessed: log.articlesProcessed,
        queriesIssued: log.queriesIssued,
        candidatesRecorded: log.candidatesRecorded,
        errors: log.errors,
      },
      null,
      2,
    ),
  );
};

if ((import.meta as ImportMeta & { main?: boolean }).main === true) {
  await main();
}
