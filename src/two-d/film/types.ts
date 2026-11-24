import type React from "react";

/**
 * Visual side of a film (written in code by Claude per script, using library assets).
 * Every scene is designed on a "nominal" frame range; the player stretches it to the
 * real scene length, which comes from the narration audio.
 */
export type SceneVisual = { nominal: [number, number]; render: (nominalFrame: number) => React.ReactNode };

export type FilmVisuals = {
  scenes: Record<string, SceneVisual>;
  ambience?: { file: string; volume: number };
  /** One-shot sounds on the nominal timeline (moved with their scene). */
  sfx: { file: string; at: number; volume: number }[];
  /** HTML overlays (title cards, end text) on the nominal timeline. */
  overlay?: (nominalFrame: number) => React.ReactNode;
};
