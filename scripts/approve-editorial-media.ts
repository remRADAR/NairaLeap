import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
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
 *   bun run media:approve approve --slug <slug> --record-id <id> [--reviewer <name>] [--confirm-rights]
 *   bun run media:approve reject --slug <slug> --record-id <id> --reason "<text>" [--reviewer <name>]
 *
 * Approval downloads the source image once, stores it content-addressed under
 * public/editorial/media/ (identical files are never downloaded twice), and
 * regenerates the runtime subset so the approved image becomes the article's
 * featured image. Nothing is published without an approval recorded here.
 */

const ALLOWED_LICENSES = new Set(["cc0", "pdm", "by"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const PUBLIC_DIR = resolve(process.cwd(), "public");
const MEDIA_DIR = resolve(PUBLIC_DIR, "editorial", "media");

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun run media:approve list [--status candidate|approved|rejected]",
      "  bun run media:approve show --slug <slug>",
      "  bun run media:approve approve --slug <slug> --record-id <id> [--reviewer <name>] [--confirm-rights]",
      '  bun run media:approve reject --slug <slug> --record-id <id> --reason "<text>" [--reviewer <name>]',
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

const command = process.argv[2] ?? "list";
const slug = flagValue("slug");
const recordId = flagValue("record-id");
const reviewer = flagValue("reviewer") ?? "nairaleap-editor";
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
  if (!ALLOWED_LICENSES.has((record.license ?? "").toLowerCase())) {
    fail("License " + record.license + " is not on the approved allowlist (cc0, pdm, by).");
  }
  if (record.rightsReviewRequired && !hasFlag("confirm-rights")) {
    fail(
      "This candidate needs rights clearance (" +
        (record.rightsNotes ?? "identifiable people or third-party IP") +
        "). Re-run with --confirm-rights once rights are verified.",
    );
  }
  if (!record.imageUrl) fail("Candidate has no downloadable image URL.");

  const response = await fetch(record.imageUrl, {
    headers: { "User-Agent": "NairaLeap editorial media approval/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) fail("Image download failed (HTTP " + response.status + ").");
  const bytes = new Uint8Array(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  let extension = extname(new URL(record.imageUrl).pathname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) extension = ".jpg";
  const fileName = hash + extension;
  const localPath = "/editorial/media/" + fileName;
  mkdirSync(MEDIA_DIR, { recursive: true });
  const target = resolve(MEDIA_DIR, fileName);
  if (!existsSync(target)) writeFileSync(target, bytes);

  const now = new Date().toISOString();
  const nextRecords: EditorialMediaRecord[] = manifest.records.map((existing) => {
    if (existing === record) {
      return {
        ...existing,
        replacementImage: localPath,
        status: "approved" as const,
        reviewedAt: now,
        reviewedBy: reviewer,
      };
    }
    if (
      existing.articleSlug === slug &&
      existing.status === "approved" &&
      existing !== record
    ) {
      return {
        ...existing,
        status: "rejected" as const,
        rejectionReason: "Superseded by a newer approved image.",
        reviewedAt: now,
        reviewedBy: reviewer,
      };
    }
    return existing;
  });
  persist({ schemaVersion: 1, records: nextRecords });
  console.log("APPROVED " + slug + " -> " + localPath + " (stored by " + reviewer + ")");
} else if (command === "reject") {
  if (!slug) fail("--slug is required for reject.");
  const record = manifest.records.find(
    (candidate) =>
      candidate.articleSlug === slug &&
      (recordId ? candidate.sourceRecordId === recordId : true) &&
      (candidate.status === "candidate" || candidate.status === "approved"),
  );
  if (!record) fail("No matching record for slug: " + slug);
  const reason = flagValue("reason") ?? "Rejected by editorial review.";
  const now = new Date().toISOString();
  const nextRecords = manifest.records.map((existing) =>
    existing === record
      ? {
          ...existing,
          status: "rejected" as const,
          rejectionReason: reason,
          reviewedAt: now,
          reviewedBy: reviewer,
        }
      : existing,
  );
  persist({ schemaVersion: 1, records: nextRecords });
  console.log("REJECTED " + slug + " (" + reason + ")");
} else {
  usage();
  fail("Unknown command: " + command);
}
