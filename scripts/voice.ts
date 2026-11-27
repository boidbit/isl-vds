// Generate all voices of a film with Gemini TTS in as few calls as possible.
//
//   GEMINI_API_KEY=... npm run voice -- <film-id> [--lang ur|en]
//   (--lang en uses GEMINI_API_KEY_EN when it is set, so the English track has its own quota)
//
// 1. Lines are grouped: the narrator gets one call for the whole film; characters are
//    paired (Gemini allows 2 speakers per call) and each pair gets one call.
// 2. Each call's audio is cut back into lines at the silences (<long pause> between lines).
//    If the cut does not line up, that group falls back to one call per line.
// 3. Every line gets a voice treatment (narrator: deep & warm; characters: clean & close),
//    is loudness-normalised, and gets a loudness envelope for lip-flap.
// Output: public/voice/<film>/*.wav + timing.json. Unchanged groups are reused.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FilmSchema, LANGS, TimingSchema, lineKey, localLine, sceneLines, speakerVoice, voiceDir, type Film, type Lang, type Timing } from "../src/two-d/film/schema";
import { SR, splitAligned, trim, type Pcm } from "./audio-split";

const root = join(import.meta.dirname, "..");
const filmId = process.argv[2];
const langArg = process.argv.indexOf("--lang");
const lang = (langArg > 0 ? process.argv[langArg + 1] : "ur") as Lang;
if (!filmId || !LANGS.includes(lang)) {
  console.error("Usage: npm run voice -- <film-id> [--lang ur|en]");
  process.exit(1);
}
const film: Film = FilmSchema.parse(JSON.parse(readFileSync(join(root, "films", filmId, "film.json"), "utf8")));
if (!film.voice.enabled) {
  console.log("Voice disabled in film.json, nothing to do.");
  process.exit(0);
}
if (!film.languages.includes(lang)) {
  console.error(`film.json "languages" does not include "${lang}".`);
  process.exit(1);
}
const key = (lang === "en" && process.env.GEMINI_API_KEY_EN) || process.env.GEMINI_API_KEY;
if (!key) {
  console.error("GEMINI_API_KEY is not set. Add it as a GitHub secret (Settings > Secrets and variables > Actions).");
  process.exit(1);
}

const outDir = join(root, "public", voiceDir(filmId, lang));
const rawDir = join(outDir, "raw");
mkdirSync(rawDir, { recursive: true });
const timingPath = join(outDir, "timing.json");
const previous: Timing | null = (() => {
  try {
    return existsSync(timingPath) ? TimingSchema.parse(JSON.parse(readFileSync(timingPath, "utf8"))) : null;
  } catch {
    return null;
  }
})();


// ------------------------------------------------------------------ wav helpers
const readWav = (buf: Buffer): Pcm => {
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "data") {
      const len = Math.min(size, buf.length - off - 8);
      return new Int16Array(buf.buffer.slice(buf.byteOffset + off + 8, buf.byteOffset + off + 8 + len - (len % 2)));
    }
    off += 8 + size + (size % 2);
  }
  return new Int16Array(buf.buffer.slice(buf.byteOffset + 44));
};
const writeWav = (pcm: Pcm) => {
  const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};

// ------------------------------------------------------------------ Gemini
const findAudio = (node: unknown): string | null => {
  if (!node || typeof node !== "object") return null;
  const o = node as Record<string, unknown>;
  if (o.type === "audio" && typeof o.data === "string") return o.data;
  const inline = o.inlineData as Record<string, unknown> | undefined;
  if (inline && typeof inline.data === "string") return inline.data;
  for (const v of Object.values(o)) {
    const found = Array.isArray(v) ? v.map(findAudio).find(Boolean) : findAudio(v);
    if (found) return found;
  }
  return null;
};

type Turn = { speaker: string; text: string };

const synth = async (turns: Turn[]): Promise<Pcm> => {
  const speakers = [...new Set(turns.map((t) => t.speaker))];
  const multi = speakers.length > 1;
  const body = {
    model: film.voice.model,
    input: [
      {
        type: "user_input",
        content: turns.map((t) => {
          const sv = speakerVoice(film, t.speaker);
          const meta = { type: "speech_metadata", ...(multi ? { speaker: t.speaker } : {}), ...(sv.style ? { style: sv.style } : {}) };
          return { type: "text", text: t.text, ...(multi || sv.style ? { annotations: [meta] } : {}) };
        }),
      },
    ],
    response_format: { type: "audio" },
    generation_config: {
      speech_config: multi
        ? { speakers: speakers.map((s) => ({ speaker: s, voice: speakerVoice(film, s).voice })) }
        : [{ voice: speakerVoice(film, speakers[0]).voice }],
    },
  };
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = await res.json();
      const b64 = findAudio(json);
      if (!b64) throw new Error(`No audio in response: ${JSON.stringify(json).slice(0, 400)}`);
      const buf = Buffer.from(b64, "base64");
      return buf.toString("ascii", 0, 4) === "RIFF" ? readWav(buf) : new Int16Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length - (buf.length % 2)));
    }
    const msg = (await res.text()).slice(0, 500);
    if (res.status === 429 || res.status >= 500) {
      const wait = 4000 * 2 ** (attempt - 1);
      console.warn(`  HTTP ${res.status}, retrying in ${wait / 1000}s: ${msg}`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`Gemini TTS failed (HTTP ${res.status}): ${msg}`);
  }
  throw new Error("Gemini TTS failed after retries (free-tier rate limit?)");
};

// ------------------------------------------------------------------ voice treatment
const FX: Record<string, string> = {
  // deep, warm documentary narrator: low-end lift, gentle compression, a touch of room
  narrator: "highpass=f=60,bass=g=5:f=110,equalizer=f=3000:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2,aecho=0.8:0.55:38:0.07,loudnorm=I=-15:TP=-1.5:LRA=7",
  character: "highpass=f=80,bass=g=2:f=140,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=100:makeup=2,aecho=0.8:0.5:22:0.05,loudnorm=I=-16:TP=-1.5:LRA=7",
};

const treat = (pcm: Pcm, speaker: string): Pcm => {
  const tmpIn = join(rawDir, "_in.wav");
  const tmpOut = join(rawDir, "_out.wav");
  writeFileSync(tmpIn, writeWav(pcm));
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", tmpIn, "-af", speaker === "narrator" ? FX.narrator : FX.character, "-ar", String(SR), "-ac", "1", "-sample_fmt", "s16", tmpOut]);
  if (r.status !== 0) {
    console.warn(`  ffmpeg treatment failed, using dry voice: ${r.stderr?.toString().slice(0, 200)}`);
    return pcm;
  }
  return readWav(readFileSync(tmpOut));
};

/** Loudness per video frame, normalised 0..1 (drives the mouth). */
const envelope = (pcm: Pcm) => {
  const per = SR / film.fps;
  const vals: number[] = [];
  for (let f = 0; f * per < pcm.length; f++) {
    let sum = 0;
    const a = Math.floor(f * per);
    const b = Math.min(pcm.length, Math.floor((f + 1) * per));
    for (let i = a; i < b; i++) sum += pcm[i] * pcm[i];
    vals.push(Math.sqrt(sum / Math.max(1, b - a)));
  }
  const max = Math.max(1, ...vals);
  return vals.map((v) => Math.round(Math.min(1, (v / max) * 1.3) * 100) / 100);
};

// ------------------------------------------------------------------ plan the calls
type Entry = { key: string; speaker: string; text: string };
const entries: Entry[] = [];
film.scenes.forEach((sc) =>
  sceneLines(sc).forEach((raw, i) => {
    const l = localLine(raw, lang);
    entries.push({ key: lineKey(sc.id, i), speaker: l.speaker, text: l.voiceText.trim() });
  }),
);
const order = [...new Set(entries.map((e) => e.speaker))];
const groups: string[][] = [];
if (order.includes("narrator")) groups.push(["narrator"]);
const others = order.filter((s) => s !== "narrator");
for (let i = 0; i < others.length; i += 2) groups.push(others.slice(i, i + 2));

const timing: Timing = { film: filmId, lines: {} };
console.log(`Voice track: ${lang}${lang === "en" && process.env.GEMINI_API_KEY_EN ? " (GEMINI_API_KEY_EN)" : ""}`);
let calls = 0;

for (const group of groups) {
  const lines = entries.filter((e) => group.includes(e.speaker));
  const hash = createHash("sha256")
    .update(JSON.stringify([film.voice.model, lines.map((l) => [l.speaker, l.text]), group.map((s) => speakerVoice(film, s))]))
    .digest("hex")
    .slice(0, 16);
  const cached = lines.every((l) => previous?.lines[l.key]?.hash === hash && existsSync(join(root, "public", previous.lines[l.key].file)));
  if (cached) {
    lines.forEach((l) => (timing.lines[l.key] = previous!.lines[l.key]));
    console.log(`= [${group.join(" + ")}] ${lines.length} lines unchanged`);
    continue;
  }

  console.log(`→ [${group.join(" + ")}] ${lines.length} lines in one call`);
  const take = await synth(lines.map((l, i) => ({ speaker: l.speaker, text: i < lines.length - 1 ? `${l.text} <long pause>` : l.text })));
  calls++;
  writeFileSync(join(rawDir, `${group.join("+")}.wav`), writeWav(take));
  let parts = splitAligned(take, lines.map((l) => l.text));
  if (!parts) {
    console.warn(`  could not cut the take into ${lines.length} lines; generating line by line instead`);
    parts = [];
    for (const l of lines) {
      parts.push(trim(await synth([{ speaker: l.speaker, text: l.text }])));
      calls++;
    }
  }
  lines.forEach((l, i) => {
    const pcm = treat(parts![i], l.speaker);
    const file = `${voiceDir(filmId, lang)}/${l.key.replace("#", "-")}.wav`;
    writeFileSync(join(root, "public", file), writeWav(pcm));
    timing.lines[l.key] = { file, seconds: pcm.length / SR, hash, env: envelope(pcm) };
    console.log(`  ✓ ${l.key} ${l.speaker} ${(pcm.length / SR).toFixed(2)}s`);
  });
}

writeFileSync(timingPath, JSON.stringify(timing));
console.log(`Wrote ${timingPath} (${calls} Gemini call${calls === 1 ? "" : "s"})`);
