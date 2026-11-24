// Check every film (or one: npm run validate:films -- <id>) before voice + render.
// Fails with a clear list when a film needs something the library does not have yet.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { FilmSchema, sceneLines } from "../src/two-d/film/schema";
import { FILMS } from "../src/two-d/films";
import { LIBRARY } from "../src/two-d/library/registry";

const root = join(import.meta.dirname, "..");
const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(join(root, "films")).filter((d) => existsSync(join(root, "films", d, "film.json")));

let failed = false;
for (const id of ids) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const path = join(root, "films", id, "film.json");
  if (!existsSync(path)) {
    console.log(`✗ ${id}: films/${id}/film.json not found`);
    failed = true;
    continue;
  }
  const parsed = FilmSchema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!parsed.success) {
    parsed.error.issues.forEach((i) => errors.push(`film.json ${i.path.join(".")}: ${i.message}`));
  } else {
    const film = parsed.data;
    if (film.id !== id) errors.push(`film.json id "${film.id}" does not match folder "${id}"`);
    const missing = film.assets.filter((a) => !LIBRARY[a]);
    if (missing.length) errors.push(`Missing assets (not in the library yet): ${missing.join(", ")}. Banana hai ya scene badalna hai?`);
    const entry = FILMS[id];
    if (!entry) {
      errors.push(`No visuals registered for this film (src/two-d/films/index.ts). Scenes still need to be built.`);
    } else {
      film.scenes.forEach((s) => {
        if (!entry.visuals.scenes[s.id]) errors.push(`Scene "${s.id}" has no visuals yet (needs to be built).`);
      });
      Object.keys(entry.visuals.scenes).forEach((sid) => {
        if (!film.scenes.some((s) => s.id === sid)) warnings.push(`Visual scene "${sid}" is not used in film.json`);
      });
    }
    if (film.voice.enabled) film.scenes.forEach((s) => sceneLines(s).length === 0 && warnings.push(`Scene "${s.id}" has no spoken lines`));
    if (!film.source.verified) warnings.push("Religious source not verified yet: check the reference before publishing.");
  }
  console.log(`${errors.length ? "✗" : "✓"} ${id}`);
  errors.forEach((e) => console.log(`    error   ${e}`));
  warnings.forEach((w) => console.log(`    warning ${w}`));
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
