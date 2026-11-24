// Small helpers for the 2D cartoon pipeline: keyframes, easing, palette.
import { Easing, interpolate } from "remotion";

export const OUT = "#3d2a1e"; // outline colour (warm dark brown, softer than black)
export const LINE = 4; // outline width in world px

/** Keyframed value: [[frame, value], ...] with smooth ease in/out between keys. */
export const kf = (frame: number, keys: [number, number][], ease = Easing.inOut(Easing.cubic)) => {
  if (keys.length === 1) return keys[0][1];
  return interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Natural blink every few seconds (deterministic). */
export const blink = (frame: number, offset = 0) => {
  const f = (frame + offset) % 97;
  return f < 3 ? 0.1 : f < 5 ? 0.5 : 1;
};

export type Cam = { x: number; y: number; zoom: number; rot?: number };
export const W = 1920;
export const H = 1080;

/** Parallax transform: depth 0 = sky (fixed), 1 = action plane, >1 = foreground. */
export const layerTransform = (cam: Cam, depth: number) => {
  const z = 1 + (cam.zoom - 1) * depth;
  const tx = -cam.x * depth - (W / 2) * (1 - depth);
  const ty = -cam.y * depth - (H / 2) * (1 - depth);
  return `translate(${W / 2} ${H / 2}) rotate(${cam.rot ?? 0}) scale(${z}) translate(${tx} ${ty})`;
};

/** Mix two keyframe ranges with a 0..1 weight. */
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
