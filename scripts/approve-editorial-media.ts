import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MANIFEST_PATH,
  readManifest,
  readReport,
  regenerateSubset,
  writeJson,
  type EditorialMediaManifest,
  type EditorialMediaRecord,
} from "./editorial-media-lib";

/**
 * Editorial approval workflow for replacement imagery.
 *
 * Usage:
 *   bun run media:approve list [--status candidate|approved|rejected]
 *   bun run media:approve show --slug <slug>
 *   bun run media:approve approve --slug <slug> --record-id <id> --reviewer "<name>"
 *     [--attribution "<line>"] [--confirm-rights] --confirm-visual-inspection
 *     --confirm-editorial-relevance
 *   bun run media:approve reject --slug <slug> --record-id <id> --reviewer "<name>"
 *     --reason "<text>"
 *
 * Approval requirements (all enforced, none bypassable):
 *   - An explicit reviewer identity (--reviewer), recorded on the record.
 *   - Attribution-requiring licenses (CC BY) must carry creator information
 *     and a ready-to-use attribution line (recorded or passed via --attribution).
 *   - Rights-flagged candidates require --confirm-rights; the clearance is
 *     recorded explicitly on the record with reviewer and timestamp.
 *   - --confirm-visual-inspection records that the reviewer inspected the
 *     image; --confirm-editorial-relevance records the relevance decision.
 *   - Downloads are validated end to end: http(s) URLs only, bounded manual
 *     redirects, MIME allowlist, file signature check, and a size cap. Bytes
 *     are stored content-addressed by full SHA-256. HTML and SVG are never
 *     accepted, and an unknown extension never implies JPEG.
 *   - Rejected records are terminal: a rejected candidate can never be
 *     approved. Approval and rejection history is preserved on every record.
 *
 * Nothing is published without an approval recorded here.
 */

export const MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024;
export const DOWNLOAD_TIMEOUT_MS = 20000;
export const MAX_REDIRECTS = 5;

const ALLOWED_LICENSES = new Set(["cc0", "pdm", "by"]);
export const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const PUBLIC_DIR = resolve(process.cwd(), "public");
const MEDIA_DIR = resolve(PUBLIC_DIR, "editorial", "media");

export type DownloadSuccess = {
  bytes: Uint8Array;
  sha256: string;
  extension: string;
  contentType: string;
  finalUrl: string;
};

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export type ApprovalOptions = {
  reviewer: string | null;
  confirmRights: boolean;
  confirmVisualInspection: boolean;
  confirmEditorialRelevance: boolean;
  attributionOverride: string | null;
};

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun run media:approve list [--status candidate|approved|rejected]",
      "  bun run media:approve show --slug <slug>",
      '  bun run media:approve approve --slug <slug> --record-id <id> --reviewer "<name>"',
      '    [--attribution "<line>"] [--confirm-rights] --confirm-visual-inspection',
      "    --confirm-editorial-relevance",
      '  bun run media:approve reject --slug <slug> --record-id <id> --reviewer "<name>" --reason "<text>"',
    ].join("\n"),
  );
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

const fail = (message: string): never => {
  console.error("ERROR: " + message);
  process.exit(1);
};

/** Only absolute http(s) URLs are acceptable download sources. */
export const validateCandidateImageUrl = (rawUrl: string): URL => {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Image URL is not a valid absolute URL: " + rawUrl);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Image URL must use http or https: " + rawUrl);
  }
  return parsed;
};

/**
 * Detect a supported image format from the file signature. Unknown bytes
 * (including HTML and SVG documents) return null so the caller can reject
 * the download; extensions are never trusted over the actual signature.
 */
export const detectImageSignature = (
  bytes: Uint8Array,
): { extension: "jpg" | "png" | "webp" | "gif"; mime: string } | null => {
  const startsWith = (...prefix: number[]) => prefix.every((byte, index) => bytes[index] === byte);
  if (startsWith(0xff, 0xd8, 0xff)) return { extension: "jpg", mime: "image/jpeg" };
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
    return { extension: "png", mime: "image/png" };
  }
  if (startsWith(0x47, 0x49, 0x46, 0x38)) return { extension: "gif", mime: "image/gif" };
  if (
    startsWith(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { extension: "webp", mime: "image/webp" };
  }
  return null;
};

/** Read a response body while enforcing a hard byte cap (streaming). */
export const readBodyWithLimit = async (
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<Uint8Array> => {
  if (!body) throw new Error("Response has no body.");
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new Error("Image exceeds the maximum download size of " + maxBytes + " bytes.");
    }
    chunks.push(value);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
};

/**
 * Hardened download pipeline for approved candidates: manual redirects
 * bounded by count and restricted to http(s), MIME allowlist, content-length
 * pre-check, streaming size cap, and a file-signature check that must agree
 * with the declared MIME. Returns the bytes, their full SHA-256, and the
 * extension derived from the detected signature (never from the URL).
 */
export const downloadCandidateImage = async (
  rawUrl: string,
  options: {
    fetchImpl?: FetchLike;
    maxBytes?: number;
    timeoutMs?: number;
    maxRedirects?: number;
  } = {},
): Promise<DownloadSuccess> => {
  const fetchImpl = options.fetchImpl ?? (fetch as FetchLike);
  const maxBytes = options.maxBytes ?? MAX_DOWNLOAD_BYTES;
  const timeoutMs = options.timeoutMs ?? DOWNLOAD_TIMEOUT_MS;
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;
  let current = validateCandidateImageUrl(rawUrl);
  let response: Response | null = null;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    response = await fetchImpl(current.toString(), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "NairaLeap editorial media approval/1.0" },
    });
    const status = response.status;
    if (status < 300 || status >= 400) break;
    const location = response.headers.get("location");
    if (!location) throw new Error("Redirect response without a Location header.");
    let next: URL;
    try {
      next = new URL(location, current);
    } catch {
      throw new Error("Redirect target is not a valid URL: " + location);
    }
    if (next.protocol !== "http:" && next.protocol !== "https:") {
      throw new Error("Redirect target must use http or https: " + next.protocol);
    }
    if (hop === maxRedirects) {
      throw new Error("Exceeded the maximum of " + maxRedirects + " redirects.");
    }
    current = next;
  }
  if (!response) throw new Error("No response received.");
  if (response.status !== 200) {
    throw new Error("Image download failed (HTTP " + response.status + ").");
  }
  const contentTypeHeader = response.headers.get("content-type") ?? "";
  const mime = (contentTypeHeader.split(";")[0] ?? "").trim().toLowerCase();
  if (!ALLOWED_IMAGE_MIMES.has(mime)) {
    throw new Error(
      "Unsupported content type: '" +
        (mime || "none") +
        "'. Only JPEG, PNG, WebP, and GIF are accepted; HTML and SVG are never accepted.",
    );
  }
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > maxBytes) {
    throw new Error("Image exceeds the maximum download size of " + maxBytes + " bytes.");
  }
  const bytes = await readBodyWithLimit(response.body, maxBytes);
  const signature = detectImageSignature(bytes);
  if (!signature) {
    throw new Error(
      "Downloaded bytes are not a recognized image format (JPEG, PNG, WebP, or GIF); " +
        "HTML and SVG are rejected.",
    );
  }
  if (signature.mime !== mime) {
    throw new Error(
      "Content type '" +
        mime +
        "' does not match the detected image format '" +
        signature.mime +
        "'.",
    );
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {
    bytes,
    sha256,
    extension: signature.extension,
    contentType: mime,
    finalUrl: current.toString(),
  };
};

/** Evaluate every approval requirement before anything is downloaded or stored. */
export const evaluateApproval = (
  record: EditorialMediaRecord,
  options: ApprovalOptions,
): { ok: boolean; errors: string[]; attributionText: string | null } => {
  const errors: string[] = [];
  if (record.status !== "candidate") {
    if (record.status === "rejected") {
      errors.push(
        "Rejected candidates cannot be approved. Rejected is a terminal status; run " +
          "discovery again for a fresh candidate.",
      );
    } else {
      errors.push(
        "Only candidate records can be approved (current status: " + record.status + ").",
      );
    }
  }
  const reviewer = (options.reviewer ?? "").trim();
  if (!reviewer) {
    errors.push('An explicit reviewer identity is required: pass --reviewer "<name>".');
  }
  const license = (record.license ?? "").trim().toLowerCase();
  if (!ALLOWED_LICENSES.has(license)) {
    errors.push("License '" + record.license + "' is not on the allowlist (cc0, pdm, by).");
  }
  let attributionText = (record.attributionText ?? "").trim() || null;
  const override = (options.attributionOverride ?? "").trim();
  if (override) attributionText = override;
  if (license === "by" || record.attributionRequired) {
    if (!(record.imageCreator ?? "").trim()) {
      errors.push("Attribution licenses require creator information; this record has none.");
    }
    if (!attributionText) {
      errors.push(
        "Attribution licenses require an attribution line; none is recorded and no " +
          "--attribution override was given.",
      );
    }
  }
  if (record.rightsReviewRequired && !options.confirmRights) {
    errors.push(
      "This candidate is flagged for rights review (" +
        (record.rightsNotes ?? "identifiable people or third-party IP") +
        "). Pass --confirm-rights after verifying rights.",
    );
  }
  if (!options.confirmVisualInspection) {
    errors.push(
      "Documented visual inspection is required: pass --confirm-visual-inspection after " +
        "inspecting the source image.",
    );
  }
  if (!options.confirmEditorialRelevance) {
    errors.push(
      "Editorial relevance confirmation is required: pass --confirm-editorial-relevance.",
    );
  }
  if (!record.imageUrl) errors.push("Candidate has no downloadable image URL.");
  return { ok: errors.length === 0, errors, attributionText };
};

/**
 * Apply an approval to the manifest: mark the candidate approved with every
 * sign-off recorded, supersede any previously approved record for the same
 * article, and append history entries. Rejected records stay rejected.
 */
export const applyApproval = (
  records: EditorialMediaRecord[],
  record: EditorialMediaRecord,
  options: ApprovalOptions,
  download: { sha256: string; extension: string },
  localPath: string,
  now: string,
): EditorialMediaRecord[] => {
  const reviewer = (options.reviewer ?? "").trim();
  return records.map((existing) => {
    if (existing === record) {
      return {
        ...existing,
        replacementImage: localPath,
        status: "approved" as const,
        attributionText: (options.attributionOverride ?? "").trim() || existing.attributionText,
        reviewedAt: now,
        reviewedBy: reviewer,
        rightsClearedBy: existing.rightsReviewRequired ? reviewer : existing.rightsClearedBy,
        rightsClearedAt: existing.rightsReviewRequired ? now : existing.rightsClearedAt,
        visualInspectionConfirmedBy: reviewer,
        visualInspectionConfirmedAt: now,
        editorialRelevanceConfirmedBy: reviewer,
        editorialRelevanceConfirmedAt: now,
        downloadVerified: true,
        downloadedSha256: download.sha256,
        statusHistory: [
          ...existing.statusHistory,
          { at: now, by: reviewer, action: "approved" as const, notes: null },
        ],
      };
    }
    if (existing.articleSlug === record.articleSlug && existing.status === "approved") {
      return {
        ...existing,
        status: "rejected" as const,
        rejectionReason: "Superseded by a newer approved image.",
        reviewedAt: now,
        reviewedBy: reviewer,
        statusHistory: [
          ...existing.statusHistory,
          {
            at: now,
            by: reviewer,
            action: "rejected" as const,
            notes: "Superseded by a newer approved image.",
          },
        ],
      };
    }
    return existing;
  });
};

const run = async (): Promise<void> => {
  const command = process.argv[2] ?? "list";
  const slug = flagValue("slug");
  const recordId = flagValue("record-id");
  const reviewer = flagValue("reviewer");
  const manifest = readManifest();

  const persist = (next: EditorialMediaManifest) => {
    writeJson(MANIFEST_PATH, next);
    regenerateSubset(readReport(), next);
  };

  if (command === "list") {
    const status = flagValue("status") ?? "candidate";
    const records = manifest.records.filter((record) => record.status === status);
    console.log("Manifest records with status " + status + ": " + records.length);
    for (const record of records) {
      console.log(
        [
          record.articleSlug,
          "id=" + record.sourceRecordId,
          "score=" + record.relevanceScore,
          "license=" + record.license,
          "creator=" + (record.imageCreator ?? "unknown"),
          "rights=" + (record.rightsReviewRequired ? "review-required" : "clear"),
          record.sourceUrl ?? "",
        ].join(" | "),
      );
    }
  } else if (command === "show") {
    if (!slug) fail("--slug is required for show.");
    const records = manifest.records.filter((record) => record.articleSlug === slug);
    if (records.length === 0) fail("No manifest records for slug: " + slug);
    console.log(JSON.stringify(records, null, 2));
  } else if (command === "approve") {
    if (!slug) fail("--slug is required for approve.");
    const record = manifest.records.find(
      (candidate) =>
        candidate.articleSlug === slug &&
        candidate.status === "candidate" &&
        (recordId ? candidate.sourceRecordId === recordId : true),
    );
    if (!record) fail("No matching candidate record for slug: " + slug);
    const options: ApprovalOptions = {
      reviewer,
      confirmRights: hasFlag("confirm-rights"),
      confirmVisualInspection: hasFlag("confirm-visual-inspection"),
      confirmEditorialRelevance: hasFlag("confirm-editorial-relevance"),
      attributionOverride: flagValue("attribution"),
    };
    const evaluation = evaluateApproval(record, options);
    if (!evaluation.ok) {
      for (const error of evaluation.errors) {
        console.error("REQUIREMENT NOT MET: " + error);
      }
      fail("Approval requirements not met; nothing was changed.");
    }
    let download: DownloadSuccess;
    try {
      download = await downloadCandidateImage(record.imageUrl ?? "");
    } catch (error) {
      fail("Download validation failed: " + (error as Error).message);
    }
    const fileName = download.sha256 + "." + download.extension;
    const localPath = "/editorial/media/" + fileName;
    mkdirSync(MEDIA_DIR, { recursive: true });
    const target = resolve(MEDIA_DIR, fileName);
    if (!existsSync(target)) writeFileSync(target, download.bytes);
    const now = new Date().toISOString();
    const nextRecords = applyApproval(manifest.records, record, options, download, localPath, now);
    persist({ schemaVersion: 1, records: nextRecords });
    console.log(
      "APPROVED " + slug + " -> " + localPath + " (reviewed by " + options.reviewer + ")",
    );
  } else if (command === "reject") {
    if (!slug) fail("--slug is required for reject.");
    const reviewerId = (reviewer ?? "").trim();
    if (!reviewerId) {
      fail('An explicit reviewer identity is required: pass --reviewer "<name>".');
    }
    const reason = (flagValue("reason") ?? "").trim();
    if (!reason) fail('A rejection reason is required: pass --reason "<text>".');
    const record = manifest.records.find(
      (candidate) =>
        candidate.articleSlug === slug &&
        (recordId ? candidate.sourceRecordId === recordId : true) &&
        (candidate.status === "candidate" || candidate.status === "approved"),
    );
    if (!record) fail("No matching record for slug: " + slug);
    const now = new Date().toISOString();
    const nextRecords = manifest.records.map((existing) =>
      existing === record
        ? {
            ...existing,
            status: "rejected" as const,
            rejectionReason: reason,
            reviewedAt: now,
            reviewedBy: reviewerId,
            statusHistory: [
              ...existing.statusHistory,
              { at: now, by: reviewerId, action: "rejected" as const, notes: reason },
            ],
          }
        : existing,
    );
    persist({ schemaVersion: 1, records: nextRecords });
    console.log("REJECTED " + slug + " (" + reason + ")");
  } else {
    usage();
    fail("Unknown command: " + command);
  }
};

if ((import.meta as ImportMeta & { main?: boolean }).main === true) {
  await run();
}
