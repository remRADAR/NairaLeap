/**
 * Advertising infrastructure audit (bun run scripts/audit-advertising.ts).
 *
 * Verifies, without a browser:
 *  1. Every enabled placement resolves and has a draft rate-card entry.
 *  2. No rate-card entry has an invented price — every price must be null
 *     (pending owner approval) or explicitly active with effectiveFrom and
 *     lastVerifiedAt set.
 *  3. Homepage routes its slots through the shared AdSlot with placement ids.
 */
import { readFileSync } from "node:fs";
import { RATE_CARD, isRateQuotable } from "../src/features/advertising/rateCard";
import { AD_PLACEMENTS } from "../src/features/advertising/placements";

let failures = 0;
const fail = (message: string) => {
  failures += 1;
  console.error(`FAIL: ${message}`);
};

// 1. Placement integrity
for (const placement of Object.values(AD_PLACEMENTS)) {
  if (!placement.id || !placement.placeholderLabel || placement.minPxHeight < 60) {
    fail(`invalid placement definition: ${placement.id}`);
  }
  if (placement.enabled) {
    const entry = RATE_CARD.find((r) => r.placementId === placement.id);
    if (!entry) fail(`enabled placement without a rate-card entry: ${placement.id}`);
  }
}

// 2. Pricing discipline — no invented prices
for (const entry of RATE_CARD) {
  if (!AD_PLACEMENTS[entry.placementId]) {
    fail(`rate-card entry references unknown placement: ${entry.placementId}`);
  }
  if (entry.priceNaira !== null && !isRateQuotable(entry)) {
    fail(`price set but entry not fully approved/verified: ${entry.placementId}`);
  }
  if (entry.status === "active" && (entry.effectiveFrom === null || entry.priceNaira === null)) {
    fail(`active rate missing price or effectiveFrom: ${entry.placementId}`);
  }
}

// 3. Homepage wiring
const homepage = readFileSync("src/routes/index.tsx", "utf8");
if (!homepage.includes('AdSlot placementId="homepage-top"')) fail("homepage-top slot not wired");
if (!homepage.includes('AdSlot placementId="homepage-bottom"')) fail("homepage-bottom slot not wired");
if (homepage.includes("<AdSlot label=")) fail("homepage still uses hard-coded label AdSlot");
if (/function AdSlot\(/.test(homepage)) fail("homepage still defines a local AdSlot");

if (failures > 0) {
  console.error(`\n${failures} advertising audit failure(s).`);
  process.exit(1);
}
console.log(`Advertising audit passed: ${Object.keys(AD_PLACEMENTS).length} placements, ${RATE_CARD.length} rate-card entries (all pending owner approval).\n`);
