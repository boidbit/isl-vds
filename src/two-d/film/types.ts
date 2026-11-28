import type React from "react";
import type { Lang } from "./schema";

/** What a scene's render function can ask about the current moment. */
export type SceneCtx = {
  /** 0..1 mouth opening for a speaker right now (0 when silent). */
  talk: (speaker: string) => number;
  /** Is this speaker's line playing right now? */
  speaking: (speaker: string) => boolean;
  /** Local frame and real length of the scene. */
  local: number;
  duration: number;
};

/**
 * Visual side of a film (written in code by Claude per script, using library assets).
 * Every scene is designed on a "nominal" frame range; the player stretches it to the
 * real scene length, which comes from the narration audio.
 */
export type SceneVisual = {
  nominal: [number, number];
  render: (nominalFrame: number, ctx: SceneCtx) => React.ReactNode;
  /**
   * Optional: nominal frame where each spoken line (by index) starts. The player then stretches the scene piece by
   * piece so that a cut planned at that nominal frame lands exactly when the line starts (null = no anchor).
   */
  beats?: (number | null)[];
};

/** A sound cue. It plays up to 6 s; `until` (nominal frame, e.g. the shot's cut) or `dur` (seconds) stops it
 * earlier with a short fade (`fade` seconds, default 0.25) so a sound never runs over the next shot. */
export type SfxCue = { file: string; at: number; volume: number; until?: number; dur?: number; fade?: number };

export type FilmVisuals = {
  scenes: Record<string, SceneVisual>;
  ambience?: { file: string; volume: number };
  /** One-shot sounds on the nominal timeline (moved with their scene). */
  sfx: SfxCue[];
  /** HTML overlays (title cards, end text) on the nominal timeline. Use `tr(lang, {ur, en})` for on-screen text. */
  overlay?: (nominalFrame: number, lang: Lang) => React.ReactNode;
};

/** Pick on-screen text for the language being rendered (falls back to Urdu/Roman). */
export const tr = (lang: Lang, t: { ur: string; en?: string }) => (lang === "en" && t.en ? t.en : t.ur);
