// Generate narration audio for a film with Gemini TTS.
//
//   GEMINI_API_KEY=... npm run voice -- pyasa-kutta
//
// Writes public/voice/<film>/<scene>.wav and timing.json (scene lengths follow the audio).
// Lines whose text, voice and style did not change are reused, so re-runs are cheap.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FilmSchema, TimingSchema, type Timing } from "../src/two-d/film/schema";

const root = join(import.meta.dirname, "..");
const filmId = process.argv[2];
if (!filmId) {
  console.error("Usage: npm run voice -- <film-id>");
  process.exit(1);
}
const film = FilmSchema.parse(JSON.parse(readFileSync(join(root, "films", filmId, "film.json"), "utf8")));
if (!film.voice.enabled) {
  console.log("Voice disabled in film.json, nothing to do.");
  process.exit(0);
}
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("GEMINI_API_KEY is not set. Add it as a GitHub secret (Settings > Secrets and variables > Actions).");
  process.exit(1);
}

const outDir = join(root, "public", "voice", filmId);
mkdirSync(outDir, { recursive: true });
const timingPath = join(outDir, "timing.json");
const previous: Timing | null = existsSync(timingPath) ? TimingSchema.parse(JSON.parse(readFileSync(timingPath, "utf8"))) : null;

const SAMPLE_RATE = 24000;

/** Find base64 audio anywhere in the response (Interactions API: steps[].content[] {type:"audio", data}). */
const findAudio = (node: unknown): string | null => {
  if (!node || typeof node !== "object") return null;
  const o = node as Record<string, unknown>;
  if (o.type === "audio" && typeof o.data === "string") return o.data;
  const inline = o.inlineData as Record<string, unknown> | undefined; // generateContent style, just in case
  if (inline && typeof inline.data === "string") return inline.data;
  for (const v of Object.values(o)) {
    const found = Array.isArray(v) ? v.map(findAudio).find(Boolean) : findAudio(v);
    if (found) return found;
  }
  return null;
};

const toWav = (pcm: Buffer) => {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SAMPLE_RATE, 24);
  h.writeUInt32LE(SAMPLE_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
};

/** Duration from a PCM WAV (reads the fmt and data chunks). */
const wavSeconds = (wav: Buffer) => {
  let off = 12;
  let byteRate = SAMPLE_RATE * 2;
  while (off + 8 <= wav.length) {
    const id = wav.toString("ascii", off, off + 4);
    const size = wav.readUInt32LE(off + 4);
    if (id === "fmt ") byteRate = wav.readUInt32LE(off + 16);
    if (id === "data") return Math.min(size, wav.length - off - 8) / byteRate;
    off += 8 + size + (size % 2);
  }
  return (wav.length - 44) / byteRate;
};

const synth = async (text: string): Promise<Buffer> => {
  const body = {
    model: film.voice.model,
    input: [
      {
        type: "user_input",
        content: [
          {
            type: "text",
            text,
            ...(film.voice.style ? { annotations: [{ type: "speech_metadata", style: film.voice.style }] } : {}),
          },
        ],
      },
    ],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: film.voice.voice }] },
  };
  for (let attempt = 1; attempt <= 5; attempt++) {
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
      return buf.toString("ascii", 0, 4) === "RIFF" ? buf : toWav(buf);
    }
    const msg = (await res.text()).slice(0, 400);
    if (res.status === 429 || res.status >= 500) {
      const wait = 2000 * 2 ** (attempt - 1);
      console.warn(`  HTTP ${res.status}, retrying in ${wait / 1000}s: ${msg}`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`Gemini TTS failed (HTTP ${res.status}): ${msg}`);
  }
  throw new Error("Gemini TTS failed after 5 attempts");
};

const timing: Timing = { film: filmId, scenes: {} };
for (const scene of film.scenes) {
  const text = scene.voiceText ?? scene.narration;
  if (!text) continue;
  const hash = createHash("sha256").update(JSON.stringify([text, film.voice])).digest("hex").slice(0, 16);
  const file = `voice/${filmId}/${scene.id}.wav`;
  const abs = join(root, "public", file);
  const prev = previous?.scenes[scene.id];
  if (prev && prev.hash === hash && existsSync(abs)) {
    timing.scenes[scene.id] = prev;
    console.log(`= ${scene.id} (${prev.seconds.toFixed(2)}s, unchanged)`);
    continue;
  }
  const wav = await synth(text);
  writeFileSync(abs, wav);
  const seconds = wavSeconds(wav);
  timing.scenes[scene.id] = { file, seconds, hash };
  console.log(`✓ ${scene.id} (${seconds.toFixed(2)}s)`);
}
writeFileSync(timingPath, JSON.stringify(timing, null, 2));
console.log(`Wrote ${timingPath}`);
