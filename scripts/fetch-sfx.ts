// Fetch a real CC0 sound effect from Freesound into the library, the same way every time.
//
//   npm run fetch:sfx -- <name> "<search words>" [options]
//
//   <name>          library name, e.g. goat, rain, door (becomes public/sfx/real/<name>.mp3; a film uses "sfx/<name>.wav")
//   --list          only show the best CC0 matches (id, length, rating, downloads), change nothing
//   --id N          take this Freesound sound id instead of the top match
//   --dur A-B       allowed length of the source in seconds (default 0.3-120)
//   --max S         keep at most S seconds (default 5.8; the film player plays one cue for max 6 s)
//   --loud L        loudness target in LUFS (default -18; quieter beds like rain/birds -22, hard hits -14)
//   --filter F      extra ffmpeg audio filter, e.g. "lowpass=f=450" for "heard from inside a cave"
//   --desc "..."    description for the library registry (default: the Freesound title)
//
// What it does: searches Freesound for CC0 (public domain) sounds only, downloads the HQ preview, cuts the
// leading silence, trims to --max, fades in/out, normalises loudness, writes public/sfx/real/<name>.mp3,
// registers it in public/sfx/real/index.json, adds/updates its row in public/sfx/real/CREDITS.md and adds
// "sfx-<name>" to src/two-d/library/registry.ts.
//
// Auth: in Claude cloud sessions the Freesound key is injected by the network proxy (nothing to set).
// Elsewhere set FREESOUND_API_KEY. Needs curl and ffmpeg.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const REAL = join(root, "public/sfx/real");
const CC0 = "publicdomain/zero";

type Sound = { id: number; name: string; username: string; license: string; url: string; duration: number; avg_rating: number; num_downloads: number; previews: Record<string, string> };

const args = process.argv.slice(2);
const opt = (k: string) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (k: string) => args.includes(`--${k}`);
const VALUE_FLAGS = ["--id", "--dur", "--max", "--loud", "--filter", "--desc"];
const positional = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && VALUE_FLAGS.includes(args[i - 1])));
const [name, query] = positional;

if (!name || (!query && !opt("id")) || !/^[a-z0-9-]+$/.test(name)) {
  console.log('Usage: npm run fetch:sfx -- <name> "<search words>" [--list] [--id N] [--dur 0.5-4] [--max 5.8] [--loud -18] [--filter F] [--desc "..."]');
  process.exit(1);
}

const api = (path: string) => {
  const headers = process.env.FREESOUND_API_KEY ? ["-H", `Authorization: Token ${process.env.FREESOUND_API_KEY}`] : [];
  const out = execFileSync("curl", ["-s", "--max-time", "30", ...headers, `https://freesound.org/apiv2/${path}`], { encoding: "utf8" });
  const json = JSON.parse(out);
  if (json.detail) throw new Error(`Freesound: ${json.detail} (is the API key set up?)`);
  return json;
};
const FIELDS = "id,name,username,license,url,duration,avg_rating,num_downloads,previews";

const search = (): Sound[] => {
  const [a, b] = (opt("dur") ?? "0.3-120").split("-");
  const params = new URLSearchParams({
    query: query!,
    filter: `license:"Creative Commons 0" duration:[${a} TO ${b}]`,
    sort: "rating_desc",
    page_size: "8",
    fields: FIELDS,
  });
  const res = api(`search/text/?${params}`);
  // well-rated and actually used first: rating, then downloads
  return (res.results as Sound[]).sort((x, y) => y.avg_rating * Math.log10(10 + y.num_downloads) - x.avg_rating * Math.log10(10 + x.num_downloads));
};

const show = (s: Sound) => `${String(s.id).padStart(7)}  ${s.duration.toFixed(1).padStart(5)}s  r${s.avg_rating.toFixed(1)}  dl${String(s.num_downloads).padStart(6)}  ${s.name.slice(0, 60)}  [${s.username}]`;

let sound: Sound;
if (opt("id")) {
  sound = api(`sounds/${opt("id")}/?fields=${FIELDS}`);
} else {
  const found = search();
  if (!found.length) {
    console.log(`No CC0 sound found for "${query}". Try other words or a wider --dur.`);
    process.exit(1);
  }
  if (flag("list")) {
    console.log(`CC0 matches for "${query}":`);
    found.forEach((s) => console.log(show(s)));
    console.log(`\nTake one with: npm run fetch:sfx -- ${name} "${query}" --id <id>`);
    process.exit(0);
  }
  sound = found[0];
}
if (!sound.license.includes(CC0)) {
  console.log(`Sound ${sound.id} is not CC0 (${sound.license}); only CC0 is allowed. Pick another.`);
  process.exit(1);
}
console.log(`Using ${show(sound)}`);

// ---- download + process
const max = Number(opt("max") ?? 5.8);
const loud = Number(opt("loud") ?? -18);
const fade = Math.max(0.05, Math.min(0.6, max * 0.15));
const tmp = mkdtempSync(join(tmpdir(), "sfx-"));
try {
  const src = join(tmp, "src.mp3");
  execFileSync("curl", ["-s", "-L", "--max-time", "120", "-o", src, sound.previews["preview-hq-mp3"]]);
  const filters = [
    "silenceremove=start_periods=1:start_threshold=-45dB",
    ...(opt("filter") ? [opt("filter")!] : []),
    `atrim=0:${max}`,
    "afade=t=in:d=0.02",
    `areverse,afade=t=in:d=${fade},areverse`, // fade out at the real end, however long the clip is
    `loudnorm=I=${loud}:TP=-1.5:LRA=11`,
  ].join(",");
  const out = join(REAL, `${name}.mp3`);
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", filters, "-ar", "44100", "-ac", "2", "-b:a", "160k", out]);
  const secs = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf8" }));
  console.log(`Wrote public/sfx/real/${name}.mp3 (${secs.toFixed(2)} s)`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ---- register: index.json
const indexPath = join(REAL, "index.json");
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : {};
index[name] = `${name}.mp3`;
writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");

// ---- credits
const creditsPath = join(REAL, "CREDITS.md");
const header = [
  "# Credits for real sound effects",
  "",
  "All files below are from [Freesound](https://freesound.org), licence **CC0 1.0 (public domain)**: free for monetised YouTube, no attribution required (listed here anyway). Previews (HQ mp3) were trimmed, faded and loudness-normalised.",
  "",
  "| File | Freesound sound | Author | Licence |",
  "|---|---|---|---|",
].join("\n");
const note = opt("filter") ? ` (filtered: ${opt("filter")})` : "";
const row = `| \`${name}.mp3\` | [${sound.name.replace(/\|/g, "/")}](${sound.url})${note} | ${sound.username} | [CC0](${sound.license}) |`;
let credits = existsSync(creditsPath) ? readFileSync(creditsPath, "utf8") : header + "\n";
const rowRe = new RegExp(`^\\| \`${name}\\.mp3\` \\|.*$`, "m");
credits = rowRe.test(credits) ? credits.replace(rowRe, row) : credits.trimEnd() + "\n" + row + "\n";
writeFileSync(creditsPath, credits);

// ---- library registry
const regPath = join(root, "src/two-d/library/registry.ts");
let reg = readFileSync(regPath, "utf8");
const key = `"sfx-${name}"`;
const desc = (opt("desc") ?? `${sound.name} (real, CC0)`).replace(/"/g, "'");
if (!reg.includes(`${key}:`)) {
  const at = reg.trimEnd().lastIndexOf("};");
  reg = reg.slice(0, at) + `  ${key}: { description: "${desc}", tags: ["sound", "real"], builtFor: "library" },\n` + reg.slice(at);
  writeFileSync(regPath, reg);
  console.log(`Registered ${key} in the library`);
}
console.log(`Done. Use it in a film as s("${name}.wav", at, volume) and list "sfx-${name}" in film.json assets.`);
