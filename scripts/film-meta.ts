// Write out/meta.json for a rendered film: what the site shows next to the videos.
//   npx tsx scripts/film-meta.ts <film-id> "<langs>"   (langs = "ur en")
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { FilmSchema } from "../src/two-d/film/schema";

const root = join(import.meta.dirname, "..");
const [id, langs = "ur"] = process.argv.slice(2);
const film = FilmSchema.parse(JSON.parse(readFileSync(join(root, "films", id, "film.json"), "utf8")));
const rendered = langs.split(/\s+/).filter(Boolean);
const file = (l: string) => (l === "ur" ? id : `${id}-${l}`);
const meta = {
  id,
  title: film.title,
  references: film.source.references,
  verified: film.source.verified,
  ref: process.env.GITHUB_REF_NAME ?? "",
  renderedAt: new Date().toISOString(),
  videos: Object.fromEntries(
    rendered.map((l) => [l, { full: `${file(l)}.mp4`, preview: `${file(l)}-preview.mp4`, poster: `${file(l)}.jpg`, publish: film.publish[l as "ur" | "en"] ?? null }]),
  ),
};
mkdirSync(join(root, "out"), { recursive: true });
writeFileSync(join(root, "out", "meta.json"), JSON.stringify(meta, null, 2));
console.log(`out/meta.json: ${rendered.join(", ")}`);
