import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = path.join(ROOT, "src/data/wordpressEditorial.ts");
const REPORT_PATH = path.join(ROOT, "qa-artifacts/editorial-image-finalization-report.json");
const STOPWORDS = new Set("a an and as at be by for from in is of on or the to with nigeria nigerian says said new this that".split(" "));

const source = await readFile(DATA_PATH, "utf8");
const prefix = "export const EDITORIAL_POSTS: EditorialPost[] = ";
const begin = source.indexOf(prefix);
const end = source.indexOf(";\n\nexport function getEditorialPost", begin);
if (begin < 0 || end < 0) throw new Error("Could not locate generated editorial data.");
const posts = JSON.parse(source.slice(begin + prefix.length, end));
const tokens = (value) => new Set(String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((token) => token.length > 2 && !STOPWORDS.has(token)));
const scored = (target, candidate) => {
  let score = candidate.category === target.category ? 100 : 0;
  const targetTokens = tokens(`${target.title} ${target.category}`);
  const candidateTokens = tokens(`${candidate.title} ${candidate.category}`);
  for (const token of targetTokens) if (candidateTokens.has(token)) score += 3;
  return score;
};
const available = posts.filter((post) => post.image && post.image.startsWith("/editorial/recovered/"));
const unresolved = posts.filter((post) => !post.image);
const assignments = [];
for (const post of unresolved) {
  const candidates = available.filter((candidate) => candidate.id !== post.id).sort((a, b) => scored(post, b) - scored(post, a));
  const chosen = candidates[0];
  if (!chosen) throw new Error(`No recovered image available for ${post.id}`);
  post.image = chosen.image;
  assignments.push({ id: post.id, slug: post.slug, title: post.title, category: post.category, image: chosen.image, matchedArticleId: chosen.id, matchedArticleSlug: chosen.slug, score: scored(post, chosen) });
}
await writeFile(DATA_PATH, `${source.slice(0, begin + prefix.length)}${JSON.stringify(posts)}${source.slice(end)}\n`);
await writeFile(REPORT_PATH, `${JSON.stringify({ finalizedAt: new Date().toISOString(), assigned: assignments.length, assignments }, null, 2)}\n`);
console.log(JSON.stringify({ assigned: assignments.length, report: REPORT_PATH, sample: assignments.slice(0, 10) }, null, 2));
