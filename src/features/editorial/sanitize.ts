/**
 * Allowlist-based HTML sanitiser for editorial article content.
 *
 * Editorial HTML must be sanitised before rendering anywhere it can be
 * multi-user or externally sourced (studio submissions, imported posts).
 * This is a dependency-free allowlist sanitiser: everything not explicitly
 * allowed is stripped, including scripts, styles, iframes, event handlers and
 * javascript:/data: URLs.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
  "span",
  "small",
  "mark",
  "sup",
  "sub",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading", "decoding"]),
};

const URL_ATTRS = new Set(["href", "src"]);
const DANGEROUS_CONTENT_BLOCK =
  /<(script|style|iframe|object|embed|svg|math|template|noscript|noembed|plaintext|xmp)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi;

function isSafeUrl(value: string): boolean {
  const trimmed = value
    .trim()
    .toLowerCase()
    .replace(/\p{Cc}/gu, "");
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:")
  );
}

function sanitiseAttributes(tag: string, attrHtml: string): string {
  const attrs: string[] = [];
  const attrPattern = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+)/g;
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(attrHtml)) !== null) {
    const name = match[1].toLowerCase();
    const rawValue = match[3] ?? match[4] ?? match[2] ?? "";
    const value = rawValue
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const allowed = ALLOWED_ATTRS[tag];
    if (!allowed || !allowed.has(name)) continue;
    if (URL_ATTRS.has(name) && !isSafeUrl(rawValue)) continue;
    attrs.push(`${name}="${value}"`);
  }
  return attrs.length > 0 ? " " + attrs.join(" ") : "";
}

/**
 * Sanitises an HTML fragment for safe rendering.
 * Escapes disallowed tags instead of dropping content text, removes all
 * event-handler attributes, and neutralises unsafe URLs.
 */
export function sanitizeEditorialHtml(input: string): string {
  if (!input) return "";
  const withoutComments = input.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
  const withoutDangerousContent = withoutComments.replace(DANGEROUS_CONTENT_BLOCK, "");
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)(\/?)>/g;
  return withoutDangerousContent.replace(
    tagPattern,
    (whole, rawTag: string, rawAttrs: string, selfClose: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      const isClosing = whole.startsWith("</");
      if (isClosing) return `</${tag}>`;
      const attrs = sanitiseAttributes(tag, rawAttrs ?? "");
      return `<${tag}${attrs}${selfClose ? " /" : ""}>`;
    },
  );
}
