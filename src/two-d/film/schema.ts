// Film format for the 2D pipeline: films/<id>/film.json
import { z } from "zod";

export const FilmSceneSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Roman Hindi/Urdu: shown as the subtitle. */
  narration: z.string().optional(),
  /** Text sent to the voice model (Devanagari reads best). Defaults to narration. */
  voiceText: z.string().optional(),
  /** Max fraction of the scene the subtitle may cover (e.g. leave room for an end card). */
  subtitleMax: z.number().min(0.1).max(1).optional(),
});

export const FilmSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "use lowercase-kebab-case"),
  title: z.string(),
  fps: z.number().int().default(30),
  source: z.object({ references: z.array(z.string()).min(1), verified: z.boolean() }),
  voice: z
    .object({
      enabled: z.boolean().default(true),
      model: z.string().default("gemini-3.8-flash-tts"),
      voice: z.string().default("Sulafat"),
      style: z.string().default(""),
    })
    .default({}),
  /** Library assets this film needs (checked against the registry before rendering). */
  assets: z.array(z.string()).default([]),
  scenes: z.array(FilmSceneSchema).min(1),
});

export type Film = z.infer<typeof FilmSchema>;

/** Written by scripts/voice.ts into public/voice/<id>/timing.json */
export const TimingSchema = z.object({
  film: z.string(),
  scenes: z.record(z.object({ file: z.string(), seconds: z.number().positive(), hash: z.string() })),
});
export type Timing = z.infer<typeof TimingSchema>;
