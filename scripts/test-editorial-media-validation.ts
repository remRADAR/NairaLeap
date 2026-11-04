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
import { isDisallowedIp, probeExternalUrl, type LookupLike } from "./editorial-network-guard";

/**
 * Validation tests for the hardened editorial media pipeline:
 *   - SSRF destination guard (non-public IPv4/IPv6 literals, hostnames that
 *     resolve to prohibited addresses, redirect hops, rebinding
 *     revalidation, and probe safety);
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

const PUBLIC_LOOKUP: LookupLike = async () => [{ address: "93.184.216.34", family: 4 }];

const neverFetch = (): FetchLike => () => Promise.reject(new Error("fetch must not be called"));

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
    lookup: PUBLIC_LOOKUP,
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
    lookup: PUBLIC_LOOKUP,
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
        lookup: PUBLIC_LOOKUP,
      }),
    /Redirect target must use http or https/,
  );
});

await check("rejects too many redirects", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ status: 302, headers: { location: "https://r.example.com/x" } }]),
        lookup: PUBLIC_LOOKUP,
      }),
    /Exceeded the maximum/,
  );
});

await check("rejects non-200 final responses", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ status: 404, headers: {} }]),
        lookup: PUBLIC_LOOKUP,
      }),
    /HTTP 404/,
  );
});

await check("rejects HTML responses", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "text/html" }, body: HTML_BYTES }]),
        lookup: PUBLIC_LOOKUP,
      }),
    /Unsupported content type/,
  );
});

await check("rejects SVG responses", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "image/svg+xml" }, body: SVG_BYTES }]),
        lookup: PUBLIC_LOOKUP,
      }),
    /Unsupported content type/,
  );
});

await check("rejects content type and signature mismatches", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.jpg", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "image/jpeg" }, body: PNG_BYTES }]),
        lookup: PUBLIC_LOOKUP,
      }),
    /does not match the detected image format/,
  );
});

await check("rejects unrecognized image bytes", async () => {
  await assert.rejects(
    () =>
      downloadCandidateImage("https://images.example.com/a.png", {
        fetchImpl: fakeFetch([{ headers: { "content-type": "image/png" }, body: UNKNOWN_BYTES }]),
        lookup: PUBLIC_LOOKUP,
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
        lookup: PUBLIC_LOOKUP,
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
        lookup: PUBLIC_LOOKUP,
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
    isEligibleForDiscovery({ slug: "a", image: "/editorial/cms/1.jpg" }, {}, {}, new Set<string>()),
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

await check("blocks IPv4 loopback destinations", () => {
  assert.ok(isDisallowedIp("127.0.0.1"));
  assert.ok(isDisallowedIp("127.255.255.254"));
});

await check("blocks IPv4 link-local and cloud metadata destinations", () => {
  assert.ok(isDisallowedIp("169.254.169.254"));
  assert.ok(isDisallowedIp("169.254.0.1"));
});

await check("blocks RFC1918 private IPv4 destinations", () => {
  assert.ok(isDisallowedIp("10.0.0.1"));
  assert.ok(isDisallowedIp("10.255.255.255"));
  assert.ok(isDisallowedIp("172.16.0.1"));
  assert.ok(isDisallowedIp("172.31.255.254"));
  assert.ok(isDisallowedIp("192.168.0.1"));
});

await check("blocks multicast, reserved, and special-purpose IPv4 destinations", () => {
  assert.ok(isDisallowedIp("0.0.0.0"));
  assert.ok(isDisallowedIp("100.64.0.1"));
  assert.ok(isDisallowedIp("192.0.2.9"));
  assert.ok(isDisallowedIp("198.18.0.1"));
  assert.ok(isDisallowedIp("198.51.100.7"));
  assert.ok(isDisallowedIp("203.0.113.7"));
  assert.ok(isDisallowedIp("224.0.0.1"));
  assert.ok(isDisallowedIp("240.0.0.1"));
  assert.ok(isDisallowedIp("255.255.255.255"));
});

await check("blocks IPv6 loopback, link-local, unique-local, and multicast destinations", () => {
  assert.ok(isDisallowedIp("::"));
  assert.ok(isDisallowedIp("::1"));
  assert.ok(isDisallowedIp("fe80::1"));
  assert.ok(isDisallowedIp("fec0::1"));
  assert.ok(isDisallowedIp("fd12:3456:789a::1"));
  assert.ok(isDisallowedIp("ff02::1"));
  assert.ok(isDisallowedIp("2001:db8::1"));
  assert.ok(isDisallowedIp("100::1"));
});

await check("blocks IPv4-mapped IPv6 destinations", () => {
  assert.ok(isDisallowedIp("::ffff:127.0.0.1"));
  assert.ok(isDisallowedIp("::ffff:169.254.169.254"));
  assert.ok(isDisallowedIp("::ffff:192.168.0.1"));
  assert.ok(isDisallowedIp("::ffff:7f00:1"));
  assert.equal(isDisallowedIp("::ffff:8.8.8.8"), false);
});

await check("blocks NAT64 and 6to4 destinations embedding prohibited IPv4", () => {
  assert.ok(isDisallowedIp("64:ff9b::7f00:1"));
  assert.ok(isDisallowedIp("64:ff9b:1::1"));
  assert.ok(isDisallowedIp("2002:0a00:0001::"));
  assert.equal(isDisallowedIp("64:ff9b::808:808"), false);
});

await check("allows public IPv4 and IPv6 literals", () => {
  assert.equal(isDisallowedIp("93.184.216.34"), false);
  assert.equal(isDisallowedIp("8.8.8.8"), false);
  assert.equal(isDisallowedIp("2606:2800:220:1:248:1893:25c8:1946"), false);
});

await check("blocks downloads to literal loopback and metadata destinations", async () => {
  await assert.rejects(
    () => downloadCandidateImage("http://127.0.0.1/a.png", { fetchImpl: neverFetch() }),
    /non-public/,
  );
  await assert.rejects(
    () => downloadCandidateImage("http://169.254.169.254/m", { fetchImpl: neverFetch() }),
    /non-public/,
  );
});

await check("blocks downloads to IPv6 loopback, link-local, and mapped destinations", async () => {
  await assert.rejects(
    () => downloadCandidateImage("http://[::1]/a.png", { fetchImpl: neverFetch() }),
    /non-public/,
  );
  await assert.rejects(
    () => downloadCandidateImage("http://[fe80::1]/a.png", { fetchImpl: neverFetch() }),
    /non-public/,
  );
  await assert.rejects(
    () => downloadCandidateImage("http://[fd00::1]/a.png", { fetchImpl: neverFetch() }),
    /non-public/,
  );
  await assert.rejects(
    () => downloadCandidateImage("http://[::ffff:192.168.0.1]/a.png", { fetchImpl: neverFetch() }),
    /non-public/,
  );
});

await check("blocks hostnames that resolve to prohibited addresses", async () => {
  const lookup: LookupLike = async () => [{ address: "10.0.0.5", family: 4 }];
  await assert.rejects(
    () => downloadCandidateImage("https://internal.example.com/a.png", { lookup }),
    /non-public/,
  );
});

await check("blocks hostnames with any unsafe resolved address", async () => {
  const lookup: LookupLike = async () => [
    { address: "93.184.216.34", family: 4 },
    { address: "192.168.0.7", family: 4 },
  ];
  await assert.rejects(
    () => downloadCandidateImage("https://mixed.example.com/a.png", { lookup }),
    /non-public/,
  );
});

await check("blocks redirects to prohibited destinations", async () => {
  const fetched: string[] = [];
  const fetchImpl: FetchLike = async (url) => {
    fetched.push(url);
    return new Response(null, {
      status: 302,
      headers: { location: "http://169.254.169.254/latest/meta-data" },
    });
  };
  await assert.rejects(
    () => downloadCandidateImage("https://a.example.com/x", { fetchImpl, lookup: PUBLIC_LOOKUP }),
    /non-public/,
  );
  assert.equal(fetched.length, 1);
});

await check("blocks redirect chains with an unsafe intermediate destination", async () => {
  const fetched: string[] = [];
  const chainLookup: LookupLike = async (host) =>
    host === "internal.example.com"
      ? [{ address: "10.0.0.9", family: 4 }]
      : [{ address: "93.184.216.34", family: 4 }];
  const fetchImpl: FetchLike = async (url) => {
    fetched.push(url);
    if (url === "https://a.example.com/x") {
      return new Response(null, {
        status: 302,
        headers: { location: "https://internal.example.com/x" },
      });
    }
    return new Response(null, {
      status: 302,
      headers: { location: "https://b.example.com/final.png" },
    });
  };
  await assert.rejects(
    () => downloadCandidateImage("https://a.example.com/x", { fetchImpl, lookup: chainLookup }),
    /non-public/,
  );
  assert.equal(fetched.length, 1);
});

await check("revalidates the destination after the response arrives", async () => {
  let calls = 0;
  const rebindingLookup: LookupLike = async () => {
    calls += 1;
    return calls === 1
      ? [{ address: "93.184.216.34", family: 4 }]
      : [{ address: "10.0.0.66", family: 4 }];
  };
  const options = { fetchImpl: fakeFetch([pngSpec()]), lookup: rebindingLookup };
  await assert.rejects(
    () => downloadCandidateImage("https://a.example.com/x", options),
    /non-public/,
  );
});

await check("probes report unsafe without fetching prohibited destinations", async () => {
  const fetched: string[] = [];
  const fetchImpl: FetchLike = async (url) => {
    fetched.push(url);
    return new Response(null, {
      status: 302,
      headers: { location: "http://169.254.169.254/latest/meta-data" },
    });
  };
  const outcome = await probeExternalUrl("https://cdn.example.com/a.jpg", {
    userAgent: "test",
    timeoutMs: 5000,
    fetchImpl,
    lookup: PUBLIC_LOOKUP,
  });
  assert.equal(outcome, "unsafe");
  assert.equal(fetched.length, 1);
});

await check("probes classify reachable public URLs", async () => {
  const outcome = await probeExternalUrl("https://cdn.example.com/a.jpg", {
    userAgent: "test",
    timeoutMs: 5000,
    fetchImpl: fakeFetch([{ status: 200, headers: {} }]),
    lookup: PUBLIC_LOOKUP,
  });
  assert.equal(outcome, "ok");
});

await check("blocks Teredo and 2001::/23 protocol-assignment destinations", async () => {
  assert.ok(isDisallowedIp("2001::1"));
  assert.ok(isDisallowedIp("2001:0:4136:e378:8000:83bf:427d:26d1"));
  assert.ok(isDisallowedIp("2001:1::1"));
  assert.ok(isDisallowedIp("2001:3::1"));
  assert.ok(isDisallowedIp("2001:4:112::1"));
  await assert.rejects(
    () => downloadCandidateImage("http://[2001::1]/a.png", { fetchImpl: neverFetch() }),
    /non-public/,
  );
});

await check("blocks ORCHID and ORCHIDv2 destinations", () => {
  assert.ok(isDisallowedIp("2001:10::1"));
  assert.ok(isDisallowedIp("2001:20::1"));
  assert.ok(isDisallowedIp("2001:2f::1"));
});

await check("blocks IPv6 benchmarking destinations", () => {
  assert.ok(isDisallowedIp("2001:2::1"));
  assert.ok(isDisallowedIp("2001:2::99"));
});

await check("blocks non-global and special-purpose IPv6 assignments", () => {
  assert.ok(isDisallowedIp("3ffe::1"));
  assert.ok(isDisallowedIp("5f00::1"));
  assert.ok(isDisallowedIp("1fff::1"));
  assert.ok(isDisallowedIp("4000::1"));
  assert.ok(isDisallowedIp("6000::1"));
});

await check("allows public global-unicast IPv6 destinations", () => {
  assert.equal(isDisallowedIp("2001:4860:4860::8888"), false);
  assert.equal(isDisallowedIp("2606:4700:4700::1111"), false);
  assert.equal(isDisallowedIp("2a00:1450::1"), false);
  assert.equal(isDisallowedIp("2600:1f18::1"), false);
  assert.equal(isDisallowedIp("2002:808:808::"), false);
});

await check("blocks AS112 and other IANA special-purpose IPv4 ranges", () => {
  assert.ok(isDisallowedIp("192.0.0.8"));
  assert.ok(isDisallowedIp("192.88.99.1"));
  assert.ok(isDisallowedIp("192.31.196.1"));
  assert.ok(isDisallowedIp("192.52.193.1"));
  assert.ok(isDisallowedIp("192.175.48.1"));
});

console.log("");
console.log(passed + " checks passed, " + failures.length + " failed.");
if (failures.length > 0) {
  for (const failure of failures) {
    console.error("FAILED: " + failure);
  }
  process.exitCode = 1;
}
