import type React from "react";

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
export type SceneVisual = { nominal: [number, number]; render: (nominalFrame: number, ctx: SceneCtx) => React.ReactNode };

export type FilmVisuals = {
  scenes: Record<string, SceneVisual>;
  ambience?: { file: string; volume: number };
  /** One-shot sounds on the nominal timeline (moved with their scene). */
  sfx: { file: string; at: number; volume: number }[];
  /** HTML overlays (title cards, end text) on the nominal timeline. */
  overlay?: (nominalFrame: number) => React.ReactNode;
};
