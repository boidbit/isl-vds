// Film format for the 2D pipeline: films/<id>/film.json
import { z } from "zod";

/** Languages a film can be voiced in. "ur" = the main Hindustani track (Roman Urdu captions, Devanagari voice text). */
export const LANGS = ["ur", "en"] as const;
export type Lang = (typeof LANGS)[number];

/** English version of a line: caption text + optional voice text (defaults to text). */
const TranslationSchema = z.object({ text: z.string(), voiceText: z.string().optional() });

export const LineSchema = z.object({
  /** Who speaks: "narrator" or a character id from voice.speakers. */
  speaker: z.string().default("narrator"),
  /** Roman Hindi/Urdu: shown as caption. */
  text: z.string(),
  /** Text sent to the voice model (Devanagari reads best). Defaults to text. English tags like <sigh> allowed. */
  voiceText: z.string().optional(),
  /** English track (needed when film.languages has "en"). */
  en: TranslationSchema.optional(),
});

export const FilmSceneSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Legacy single narration line (same as lines: [{speaker: "narrator", ...}]). */
  narration: z.string().optional(),
  voiceText: z.string().optional(),
  /** English for the legacy narration line. */
  en: TranslationSchema.optional(),
  lines: z.array(LineSchema).optional(),
  /** Max fraction of the scene the spoken lines may cover (leave room for an end card). */
  subtitleMax: z.number().min(0.1).max(1).optional(),
});

const SpeakerSchema = z.object({ voice: z.string(), style: z.string().default("") });

export const FilmSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "use lowercase-kebab-case"),
  title: z.string(),
  fps: z.number().int().default(30),
  /** landscape = 1920x1080 (YouTube), short = 1080x1920 (Shorts) */
  format: z.enum(["landscape", "short"]).default("landscape"),
  /** Camera motion blur samples per frame (1 = off). Smoother motion, slower render. */
  motionBlur: z.number().int().min(1).max(10).default(1),
  /** Voice/caption tracks to render: "ur" -> film-<id>, "en" -> film-<id>-en. */
  languages: z.array(z.enum(LANGS)).min(1).default(["ur"]),
  source: z.object({ references: z.array(z.string()).min(1), verified: z.boolean() }),
  voice: z
    .object({
      enabled: z.boolean().default(true),
      model: z.string().default("gemini-3.8-flash-tts"),
      voice: z.string().default("Sulafat"),
      style: z.string().default(""),
      speakers: z.record(SpeakerSchema).default({}),
    })
    .default({}),
  assets: z.array(z.string()).default([]),
  scenes: z.array(FilmSceneSchema).min(1),
});

export type Film = z.infer<typeof FilmSchema>;
export type FilmLine = z.infer<typeof LineSchema>;

/** All spoken lines of a scene (legacy narration folded in). */
export const sceneLines = (scene: Film["scenes"][number]): FilmLine[] =>
  scene.lines ?? (scene.narration ? [{ speaker: "narrator", text: scene.narration, voiceText: scene.voiceText, en: scene.en }] : []);

/** A line in one language (English falls back to the main text if missing; the validator flags that). */
export const localLine = (line: FilmLine, lang: Lang = "ur") => {
  if (lang === "en" && line.en) return { speaker: line.speaker, text: line.en.text, voiceText: line.en.voiceText ?? line.en.text };
  return { speaker: line.speaker, text: line.text, voiceText: line.voiceText ?? line.text };
};

/** Where the voice of a language lives (under public/). "ur" keeps the original folder. */
export const voiceDir = (filmId: string, lang: Lang = "ur") => (lang === "ur" ? `voice/${filmId}` : `voice/${filmId}-${lang}`);

/** Remotion composition id of a film in one language. */
export const compositionId = (filmId: string, lang: Lang = "ur") => (lang === "ur" ? `film-${filmId}` : `film-${filmId}-${lang}`);

export const lineKey = (sceneId: string, i: number) => `${sceneId}#${i}`;

/** Voice + style for a speaker (narrator falls back to voice.voice / voice.style). */
export const speakerVoice = (film: Film, speaker: string) =>
  film.voice.speakers[speaker] ?? { voice: film.voice.voice, style: film.voice.style };

/** Written by scripts/voice.ts into public/voice/<id>/timing.json */
export const TimingSchema = z.object({
  film: z.string(),
  lines: z.record(
    z.object({
      file: z.string(),
      seconds: z.number().positive(),
      hash: z.string(),
      /** Loudness per video frame 0..1, drives lip-flap. */
      env: z.array(z.number()).default([]),
    }),
  ),
});
export type Timing = z.infer<typeof TimingSchema>;
