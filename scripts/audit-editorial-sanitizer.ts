/**
 * Editorial sanitiser audit (bun run scripts/audit-editorial-sanitizer.ts).
 *
 * Verifies the allowlist sanitiser removes the dangerous constructs that
 * matter for multi-user / externally sourced publishing:
 * scripts, styles, iframes, event handlers, javascript:/data: URLs and HTML
 * comments — while keeping ordinary editorial markup intact.
 */
import { sanitizeEditorialHtml } from "../src/features/editorial/sanitize";

let failures = 0;
const check = (
  name: string,
  actual: string,
  mustNotContain: string[],
  mustContain: string[] = [],
) => {
  for (const bad of mustNotContain) {
    if (actual.toLowerCase().includes(bad.toLowerCase())) {
      failures += 1;
      console.error(`FAIL ${name}: output still contains "${bad}" -> ${actual}`);
    }
  }
  for (const good of mustContain) {
    if (!actual.includes(good)) {
      failures += 1;
      console.error(`FAIL ${name}: output missing "${good}" -> ${actual}`);
    }
  }
};

check(
  "script tag",
  sanitizeEditorialHtml('<p>ok</p><script>alert("x")</script>'),
  ["script", "alert"],
  ["<p>ok</p>"],
);
check(
  "unclosed script block",
  sanitizeEditorialHtml("<p>safe</p><script>dangerous()"),
  ["script", "dangerous"],
  ["<p>safe</p>"],
);
check(
  "style block",
  sanitizeEditorialHtml("<p>safe</p><style>body{display:none}</style>"),
  ["style", "display:none"],
  ["<p>safe</p>"],
);
check(
  "HTML comment",
  sanitizeEditorialHtml("<p>visible</p><!-- hidden editorial content -->"),
  ["<!--", "hidden editorial content"],
  ["<p>visible</p>"],
);
check(
  "event handler",
  sanitizeEditorialHtml('<p onclick="steal()">hi</p>'),
  ["onclick"],
  ["<p>hi</p>"],
);
check("javascript url", sanitizeEditorialHtml('<a href="javascript:alert(1)">x</a>'), [
  "javascript",
]);
check("data url image", sanitizeEditorialHtml('<img src="data:text/html;base64,PHNjcmlwdD4=">'), [
  "data:",
]);
check("iframe", sanitizeEditorialHtml('<iframe src="https://evil.example"></iframe>'), ["iframe"]);
check("style attr", sanitizeEditorialHtml('<p style="background:url(javascript:x)">t</p>'), [
  "style",
]);
check(
  "safe anchor kept",
  sanitizeEditorialHtml('<a href="https://example.com/a" title="t">go</a>'),
  ["javascript"],
  ['<a href="https://example.com/a" title="t">', "go"],
);
check(
  "relative image kept",
  sanitizeEditorialHtml('<img src="/editorial/cms/4042.jpg" alt="chart">'),
  [],
  ['src="/editorial/cms/4042.jpg"'],
);

if (failures > 0) {
  console.error(`\n${failures} sanitiser audit failure(s).`);
  process.exit(1);
}
console.log(
  "Editorial sanitiser audit passed: dangerous constructs stripped, editorial markup preserved.\n",
);
