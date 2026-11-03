import assert from "node:assert/strict";
import { joinMediaBaseUrl } from "../src/features/editorial/media-storage";
import {
  NEUTRAL_EDITORIAL_PLACEHOLDER,
  resolveEditorialImageWith,
  type EditorialImageOverrides,
} from "../src/features/editorial/images";
import type { EditorialPost } from "../src/data/wordpressEditorial";

/**
 * Self-test for the editorial image resolution hierarchy and the media
 * storage seam. Runs on synthetic posts only — it never loads the CMS
 * catalog, so it is fast enough for CI on every push.
 */

const post = (slug: string, image?: string): EditorialPost =>
  ({
    id: 1,
    slug,
    title: "Test article",
    date: "January 1, 2026",
    category: "Indicators",
    categoryId: 1,
    categoryPath: ["Indicators"],
    tags: [],
    excerpt: "",
    content: "",
    sourceUrl: "/articles/" + slug,
    ...(image ? { image } : {}),
  }) as EditorialPost;

const empty: EditorialImageOverrides = { recovered: {}, invalid: {}, approved: {} };

// Storage seam: local paths pass through untouched without a base URL.
assert.equal(joinMediaBaseUrl("", "/editorial/cms/1.jpg"), "/editorial/cms/1.jpg");
assert.equal(
  joinMediaBaseUrl("https://media.example.com", "/editorial/cms/1.jpg"),
  "https://media.example.com/editorial/cms/1.jpg",
);
assert.equal(
  joinMediaBaseUrl("https://media.example.com/", "/editorial/cms/1.jpg"),
  "https://media.example.com/editorial/cms/1.jpg",
);
assert.equal(
  joinMediaBaseUrl("https://media.example.com", "https://elsewhere.example/a.jpg"),
  "https://elsewhere.example/a.jpg",
);
assert.equal(
  joinMediaBaseUrl("https://media.example.com", "data:image/svg+xml;base64,AAA"),
  "data:image/svg+xml;base64,AAA",
);

// Tier 1: a valid original featured image is preserved.
assert.equal(
  resolveEditorialImageWith(post("a", "/editorial/cms/1.jpg"), empty),
  "/editorial/cms/1.jpg",
);

// Tier 1 skipped for invalid originals, tier 3 approved replacement applies.
const invalidWithApproved: EditorialImageOverrides = {
  recovered: {},
  invalid: { a: true },
  approved: { a: "/editorial/media/x.jpg" },
};
assert.equal(
  resolveEditorialImageWith(post("a", "/editorial/cms/missing.jpg"), invalidWithApproved),
  "/editorial/media/x.jpg",
);

// Tier 2: a recovered original wins over an approved replacement.
const recoveredOverApproved: EditorialImageOverrides = {
  recovered: { b: "/editorial/cms/9.jpg" },
  invalid: {},
  approved: { b: "/editorial/media/y.jpg" },
};
assert.equal(
  resolveEditorialImageWith(post("b"), recoveredOverApproved),
  "/editorial/cms/9.jpg",
);

// Tier 3: an approved replacement applies when nothing original survives.
const approvedOnly: EditorialImageOverrides = {
  recovered: {},
  invalid: {},
  approved: { c: "/editorial/media/z.webp" },
};
assert.equal(resolveEditorialImageWith(post("c"), approvedOnly), "/editorial/media/z.webp");

// Tier 4: the neutral branded placeholder is the final fallback.
assert.equal(resolveEditorialImageWith(post("d"), empty), NEUTRAL_EDITORIAL_PLACEHOLDER);

// Absolute original URLs pass through the storage seam untouched.
assert.equal(
  resolveEditorialImageWith(post("e", "https://nairaleap.example/img.jpg"), empty),
  "https://nairaleap.example/img.jpg",
);

// Resolution is deterministic.
assert.equal(
  resolveEditorialImageWith(post("d"), empty),
  resolveEditorialImageWith(post("d"), empty),
);

console.log("Editorial image resolution self-test passed (14 assertions).");
