import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { EditorialPost } from "../src/data/wordpressEditorial";
import type { EditorialMediaRecord } from "../src/features/editorial/media-types";
import { buildQueries, isEligibleForDiscovery } from "./discover-editorial-images";
import {
  applyApproval,
  detectImageSignature,
  downloadCandidateImage,
  evaluateApproval,
  readBodyWithLimit,
  type ApprovalOptions,
  type FetchLike,
} from "./approve-editorial-media";

/**
 * Validation tests for the hardened editorial media pipeline:
 *   - image signature detection (HTML and SVG are never accepted);
 *   - hardened downloads (URL validation, bounded http(s) redirects, MIME
 *     allowlist, size caps, signature/MIME agreement, SHA-256 content
 *     addressing, no unknown-extension assumptions);
 *   - approval requirements (explicit reviewer identity, CC BY attribution,
 *     rights clearance sign-off, documented visual inspection, editorial
 *     relevance confirmation, rejected is terminal, history is preserved);
 *   - discovery eligibility and bounded, Nigeria-aware query construction.
 *
 * Pure functions only: no network access, no file writes, no approvals.
 */

let passed = 0;
const failures: string[] = [];

const check = async (name: string, assertion: () => void | Promise<void>): Promise<void> => {
  try {
    await assertion();
    passed += 1;
    console.log("PASS " + name);
  } catch (error) {
    failures.push(name + " — " + (error as Error).message);
    console.log("FAIL " + name);
  }
};

const baseRecord = (overrides: Partial<EditorialMediaRecord>): EditorialMediaRecord => ({
  articleId: 1,
  articleSlug: "test-article",
  articleTitle: "Test article",
  originalImage: null,
  replacementImage: null,
  sourceProvider: "openverse",
  sourceRecordId: "abc123",
  sourceUrl: "https://example.com/photos/1",
  imageUrl: "https://images.example.com/1.png",
  imageCreator: "Test Creator",
  license: "cc0",
  licenseVersion: null,
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  attributionRequired: false,
  attributionText: null,
  rightsReviewRequired: false,
  rightsNotes: null,
  relevanceScore: 2,
  relevanceNotes: null,
  queryUsed: "test query",
  retrievedAt: "2026-11-03T00:00:00.000Z",
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
  statusHistory: [],
  status: "candidate",
  ...overrides,
});

const baseOptions = (overrides: Partial<ApprovalOptions> = {}): ApprovalOptions => ({
  reviewer: "Test Reviewer",
  confirmRights: true,
  confirmVisualInspection: true,
  confirmEditorialRelevance: true,
  attributionOverride: null,
  ...overrides,
});

const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const GIF_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0]);
const WEBP_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
const HTML_BYTES = new TextEncoder().encode("<!doctype html><html><body>hi</body></html>");
const SVG_BYTES = new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="..." />');
const UNKNOWN_BYTES = new Uint8Array([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);

type FakeResponseSpec = { status?: number; headers?: Record<string, string>; body?: Uint8Array };

const fakeFetch = (specs: FakeResponseSpec[]): FetchLike => {
  let calls = 0;
  const handler = (): Promise<Response> => {
    const spec = specs[Math.min(calls, specs.length - 1)];
    calls += 1;
    return Promise.resolve(new Response(spec.body ?? null, spec));
  };
  return handler as FetchLike;
};

const pngSpec = (body: Uint8Array = PNG_BYTES): FakeResponseSpec => ({
  headers: { "content-type": "image/png" },
  body,
});

await check("detects the PNG signature", () => {
  assert.equal(detectImageSignature(PNG_BYTES)?.extension, "png");
});

await check("detects the JPEG signature", () => {
  assert.equal(detectImageSignature(JPEG_BYTES)?.extension, "jpg");
});

await check("detects the GIF signature", () => {
  assert.equal(detectImageSignature(GIF_BYTES)?.extension, "gif");
});

await check("detects the WebP signature", () => {
  assert.equal(detectImageSignature(WEBP_BYTES)?.extension, "webp");
});

await check("rejects HTML bytes as an image signature", () => {
  assert.equal(detectImageSignature(HTML_BYTES), null);
});

await check("rejects SVG bytes as an image signature", () => {
  assert.equal(detectImageSignature(SVG_BYTES), null);
});

await check("downloads a valid PNG and records its full SHA-256", async () => {
  const result = await downloadCandidateImage("https://images.example.com/a.png", {
    fetchImpl: fakeFetch([pngSpec()]),
  });
  const expected = createHash("sha256").update(PNG_BYTES).digest("hex");
  assert.equal(result.sha256, expected);
  assert.equal(result.extension, "png");
  assert.equal(result.contentType, "image/png");
});

await check("follows bounded http(s) redirects", async () => {
  const result = await downloadCandidateImage("https://images.example.com/a.png", {
    fetchImpl: fakeFetch([
      { status: 301, headers: { location: "https://cdn.example.com/b.png" } },
      { status: 302, headers: { location: "https://cdn.example.com/c.png" } },
      pngSpec(),
    ]),
  });
  assert.equal(result.finalUrl, "https://cdn.example.com/c.png");
});

await check("rejects non-http image URLs", async () => {
  await assert.rejects(
    () => downloadCandidateImage("ftp://example.com/a.png", { fetchImpl: fakeFetch([]) }),
    /http or https/,
  );
});

await check("rejects redirects to non-http targets", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([
          { status: 302, headers: { location: "data:image/png;base64,AAAA" } },
        ]),
      }),
    /Redirect target must use http or https/,
  );
});

await check("rejects too many redirects", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ status: 302, headers: { location: "https://r.example.com/x" } }]),
      }),
    /Exceeded the maximum/,
  );
});

await check("rejects non-200 final responses", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ status: 404, headers: {} }]),
      }),
    /HTTP 404/,
  );
});

await check("rejects HTML responses", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "text/html" }, body: HTML_BYTES }]),
      }),
    /Unsupported content type/,
  );
});

await check("rejects SVG responses", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "image/svg+xml" }, body: SVG_BYTES }]),
      }),
    /Unsupported content type/,
  );
});

await check("rejects content type and signature mismatches", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.jpg", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "image/jpeg" }, body: PNG_BYTES }]),
      }),
    /does not match the detected image format/,
  );
});

await check("rejects unrecognized image bytes", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "image/png" }, body: UNKNOWN_BYTES }]),
      }),
    /not a recognized image format/,
  );
});

await check("rejects oversized declared downloads", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([
          { headers: { "content-type": "image/png", "content-length": "999999" }, body: PNG_BYTES },
        ]),
        maxBytes: 16,
      }),
    /maximum download size/,
  );
});

await check("rejects oversized streamed bodies without content-length", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([pngSpec(new Uint8Array(64))]),
        maxBytes: 16,
      }),
    /maximum download size/,
  );
});

await check("enforces the streaming cap in readBodyWithLimit", async () => {
  const stream = new Response(new Uint8Array(32)).body;
  await assert.rejects(() => readBodyWithLimit(stream, 4), /maximum download size/);
});

await check("requires an explicit reviewer identity", () => {
  const result = evaluateApproval(baseRecord({}), baseOptions({ reviewer: null }));
  assert.ok(!result.ok);
  assert.ok(result.errors.some((error) => error.includes("--reviewer")));
});

await check("requires creator information for CC BY", () => {
  const record = baseRecord({
    license: "by",
    attributionRequired: true,
    imageCreator: null,
    attributionText: "Photo by X, CC BY 2.0",
  });
  const result = evaluateApproval(record, baseOptions());
  assert.ok(!result.ok);
  assert.ok(result.errors.some((error) => error.includes("creator information")));
});

await check("requires an attribution line for CC BY", () => {
  const record = baseRecord({
    license: "by",
    attributionRequired: true,
    imageCreator: "X",
    attributionText: null,
  });
  const result = evaluateApproval(record, baseOptions());
  assert.ok(!result.ok);
  assert.ok(result.errors.some((error) => error.includes("attribution line")));
});

await check("accepts an attribution override for CC BY", () => {
  const record = baseRecord({
    license: "by",
    attributionRequired: true,
    imageCreator: "X",
    attributionText: null,
  });
  const result = evaluateApproval(record, baseOptions({ attributionOverride: "Photo by X" }));
  assert.ok(result.ok);
});

await check("requires explicit rights clearance for flagged candidates", () => {
  const record = baseRecord({ rightsReviewRequired: true, rightsNotes: "identifiable people" });
  const missing = evaluateApproval(record, baseOptions({ confirmRights: false }));
  assert.ok(!missing.ok);
  assert.ok(missing.errors.some((error) => error.includes("--confirm-rights")));
  const confirmed = evaluateApproval(record, baseOptions());
  assert.ok(confirmed.ok);
});

await check("requires documented visual inspection", () => {
  const result = evaluateApproval(baseRecord({}), baseOptions({ confirmVisualInspection: false }));
  assert.ok(!result.ok);
  assert.ok(result.errors.some((error) => error.includes("--confirm-visual-inspection")));
});

await check("requires editorial relevance confirmation", () => {
  const result = evaluateApproval(
    baseRecord({}),
    baseOptions({ confirmEditorialRelevance: false }),
  );
  assert.ok(!result.ok);
  assert.ok(result.errors.some((error) => error.includes("--confirm-editorial-relevance")));
});

await check("refuses rejected candidates permanently", () => {
  const result = evaluateApproval(baseRecord({ status: "rejected" }), baseOptions());
  assert.ok(!result.ok);
  assert.ok(result.errors.some((error) => error.includes("terminal status")));
});

await check("only candidate records can be approved", () => {
  const result = evaluateApproval(baseRecord({ status: "approved" }), baseOptions());
  assert.ok(!result.ok);
  assert.ok(result.errors.some((error) => error.includes("Only candidate records")));
});

await check("approves a fully validated candidate", () => {
  const result = evaluateApproval(baseRecord({}), baseOptions());
  assert.ok(result.ok);
  assert.deepEqual(result.errors, []);
});

await check("records sign-offs and supersession history on approval", () => {
  const older = baseRecord({ sourceRecordId: "old", status: "approved" });
  const candidate = baseRecord({ sourceRecordId: "abc123" });
  const next = applyApproval(
    [older, candidate],
    candidate,
    baseOptions(),
    { sha256: "deadbeef", extension: "png" },
    "/editorial/media/deadbeef.png",
    "2026-11-03T00:00:00.000Z",
  );
  const updatedOld = next.find((record) => record.sourceRecordId === "old");
  const updatedNew = next.find((record) => record.sourceRecordId === "abc123");
  assert.equal(updatedNew?.status, "approved");
  assert.equal(updatedNew?.downloadVerified, true);
  assert.equal(updatedNew?.downloadedSha256, "deadbeef");
  assert.equal(updatedNew?.visualInspectionConfirmedBy, "Test Reviewer");
  assert.equal(updatedNew?.editorialRelevanceConfirmedBy, "Test Reviewer");
  assert.ok(updatedNew?.statusHistory.some((entry) => entry.action === "approved"));
  assert.equal(updatedOld?.status, "rejected");
  assert.ok(updatedOld?.statusHistory.some((entry) => entry.action === "rejected"));
});

await check("skips articles with valid original images", () => {
  assert.equal(
    isEligibleForDiscovery(
      { slug: "a", image: "/editorial/cms/1.jpg" },
      {},
      {},
      new Set<string>(),
    ),
    false,
  );
});

await check("skips articles with recovered originals", () => {
  assert.equal(
    isEligibleForDiscovery(
      { slug: "a", image: null },
      {},
      { a: "/editorial/cms/2.jpg" },
      new Set<string>(),
    ),
    false,
  );
});

await check("allows broken originals to receive replacement candidates", () => {
  assert.equal(
    isEligibleForDiscovery(
      { slug: "a", image: "/editorial/cms/broken.jpg" },
      { a: true },
      {},
      new Set<string>(),
    ),
    true,
  );
});

await check("allows articles without any original image", () => {
  assert.equal(isEligibleForDiscovery({ slug: "a", image: null }, {}, {}, new Set<string>()), true);
});

await check("skips articles that already have an approved replacement", () => {
  assert.equal(isEligibleForDiscovery({ slug: "a", image: null }, {}, {}, new Set(["a"])), false);
});

await check("builds bounded, deduplicated, Nigeria-aware queries", () => {
  const post = {
    title: "CBN Raises Interest Rate as Inflation Peaks",
    tags: ["Central Bank", "Monetary Policy"],
    category: "Business",
    categoryPath: ["Business", "Finance"],
  } as unknown as EditorialPost;
  const queries = buildQueries(post);
  assert.ok(queries.length > 0 && queries.length <= 6);
  assert.equal(new Set(queries).size, queries.length);
  assert.ok(queries.some((query) => query.toLowerCase().includes("nigeria")));
  assert.ok(queries.every((query) => query.trim().length > 0));
});

console.log("");
console.log(passed + " checks passed, " + failures.length + " failed.");
if (failures.length > 0) {
  for (const failure of failures) {
    console.error("FAILED: " + failure);
  }
  process.exitCode = 1;
}
