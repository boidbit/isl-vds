// Build the videos page: merge every release's meta.json into _site/data.json.
// Run by .github/workflows/pages.yml after the release files are downloaded into _site/videos/<id>/.
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "_site";
const repo = process.env.GITHUB_REPOSITORY ?? "boidbit/isl-vds";
const dir = join(out, "videos");
mkdirSync(dir, { recursive: true });
const films = [];
for (const id of readdirSync(dir)) {
  const metaPath = join(dir, id, "meta.json");
  if (!existsSync(metaPath)) continue;
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  // the repo's film.json wins for things that change without a re-render (reference check, publish text)
  const filmPath = join("films", id, "film.json");
  if (existsSync(filmPath)) {
    const film = JSON.parse(readFileSync(filmPath, "utf8"));
    meta.verified = film.source?.verified ?? meta.verified;
    for (const [lang, v] of Object.entries(meta.videos ?? {})) if (film.publish?.[lang]) v.publish = film.publish[lang];
  }
  for (const [lang, v] of Object.entries(meta.videos ?? {})) {
    v.preview = existsSync(join(dir, id, v.preview)) ? `videos/${id}/${v.preview}` : null;
    v.poster = existsSync(join(dir, id, v.poster)) ? `videos/${id}/${v.poster}` : null;
    v.thumb = v.thumb && existsSync(join(dir, id, v.thumb)) ? `videos/${id}/${v.thumb}` : null;
    v.full = `https://github.com/${repo}/releases/download/film-${id}/${v.full}`;
    if (!v.preview) delete meta.videos[lang];
  }
  films.push(meta);
}
films.sort((a, b) => (b.renderedAt ?? "").localeCompare(a.renderedAt ?? ""));
writeFileSync(join(out, "data.json"), JSON.stringify({ repo, builtAt: new Date().toISOString(), films }, null, 1));
console.log(`data.json: ${films.length} film(s)`);
