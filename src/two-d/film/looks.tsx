// Film looks: a colour grade + grain + thumbnail colours per film, so the channel's videos and thumbnails do not
// all look the same. A film picks one with `"look": "<name>"` in film.json (no look = no extra grade, as before).
// Add a new preset rather than reusing the previous film's one; keep docs/ART_DIRECTION.md "Look table" in sync.

import React from "react";
import { AbsoluteFill } from "remotion";

export type FilmLook = {
  /** One line for humans. */
  about: string;
  saturate: number;
  contrast: number;
  brightness: number;
  /** Light colour from the top (screen blend) and shadow colour from the bottom (multiply): split toning. */
  hi: string;
  hiK: number;
  lo: string;
  loK: number;
  /** Vignette colour + strength. */
  vig: string;
  vigK: number;
  /** Film grain 0..0.2. */
  grain: number;
  /** Thumbnail: hook text colour, its stroke and an accent band/frame colour. */
  thumb: { text: string; stroke: string; accent: string };
};

export const FILM_LOOKS: Record<string, FilmLook> = {
  "sea-teal": {
    about: "teal shadows, warm sun highlights, light grain: sea and harbour stories",
    saturate: 1.12,
    contrast: 1.08,
    brightness: 1.02,
    hi: "#ffcf8a",
    hiK: 0.16,
    lo: "#0e5a6a",
    loK: 0.2,
    vig: "#04202a",
    vigK: 0.5,
    grain: 0.07,
    thumb: { text: "#ffffff", stroke: "#05313d", accent: "#16c6d6" },
  },
  "harvest-amber": {
    about: "golden harvest light, plum shadows, soft grain: village / farm / test-and-gratitude stories",
    saturate: 1.08,
    contrast: 1.07,
    brightness: 1.02,
    hi: "#ffd88a",
    hiK: 0.18,
    lo: "#4a2440",
    loK: 0.18,
    vig: "#2a0c22",
    vigK: 0.5,
    grain: 0.06,
    thumb: { text: "#fff1c9", stroke: "#3a1630", accent: "#f0a830" },
  },
  "desert-gold": {
    about: "hot gold, bleached sky, orange shadows: desert / thirst stories",
    saturate: 1.1,
    contrast: 1.06,
    brightness: 1.03,
    hi: "#fff0b0",
    hiK: 0.18,
    lo: "#8a3a10",
    loK: 0.16,
    vig: "#3a1404",
    vigK: 0.45,
    grain: 0.05,
    thumb: { text: "#ffd83a", stroke: "#2a0e02", accent: "#ff7a1a" },
  },
  "storm-indigo": {
    about: "cold indigo, high contrast, heavy grain: danger / storm / night",
    saturate: 0.92,
    contrast: 1.14,
    brightness: 0.97,
    hi: "#c8d8ff",
    hiK: 0.12,
    lo: "#1a1a52",
    loK: 0.24,
    vig: "#000010",
    vigK: 0.6,
    grain: 0.1,
    thumb: { text: "#e6f0ff", stroke: "#0a0a2a", accent: "#7a6cff" },
  },
  "village-green": {
    about: "fresh green and soft morning light: village, farm, garden stories",
    saturate: 1.15,
    contrast: 1.04,
    brightness: 1.04,
    hi: "#fff6c8",
    hiK: 0.14,
    lo: "#2a5a2a",
    loK: 0.14,
    vig: "#0c2008",
    vigK: 0.4,
    grain: 0.04,
    thumb: { text: "#fff35a", stroke: "#122a06", accent: "#5ad14a" },
  },
  "dusk-rose": {
    about: "rose dusk, purple shadows, soft: sad / emotional home stories",
    saturate: 1.0,
    contrast: 1.05,
    brightness: 1.0,
    hi: "#ffc2b0",
    hiK: 0.16,
    lo: "#4a2a5a",
    loK: 0.2,
    vig: "#1a0a20",
    vigK: 0.5,
    grain: 0.06,
    thumb: { text: "#ffe2ea", stroke: "#2a0a1a", accent: "#ff5a8a" },
  },
};

export const lookOf = (name?: string): FilmLook | null => (name && FILM_LOOKS[name]) || null;

/** Applies a look to the picture (not to captions/overlays). */
export const LookGrade: React.FC<{ look: FilmLook | null; frame: number; w: number; h: number; children: React.ReactNode }> = ({ look, frame, w, h, children }) => {
  if (!look) return <>{children}</>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `saturate(${look.saturate}) contrast(${look.contrast}) brightness(${look.brightness})` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${look.hi}, rgba(0,0,0,0) 60%)`, mixBlendMode: "screen", opacity: look.hiK }} />
      <AbsoluteFill style={{ background: `linear-gradient(rgba(255,255,255,0) 35%, ${look.lo})`, mixBlendMode: "multiply", opacity: look.loK * 2 }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, ${look.vig} 120%)`, opacity: look.vigK }} />
      {look.grain > 0 && (
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: look.grain * 4 }}>
          <filter id={`grain-${frame % 6}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 6} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width={w} height={h} filter={`url(#grain-${frame % 6})`} />
        </svg>
      )}
    </AbsoluteFill>
  );
};
