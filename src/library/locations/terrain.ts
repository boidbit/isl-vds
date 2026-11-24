import { smoothstep } from "../../engine/math";

/** Radius around the origin that is perfectly flat, so characters always stand on y = 0. */
export const PLAY_RADIUS = 13;

/** Height of the desert at (x, z): flat in the middle, rolling dunes beyond. Pure function. */
export const desertHeight = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  const mask = smoothstep(PLAY_RADIUS, PLAY_RADIUS + 30, r);
  const ridge = 1 - Math.abs(Math.sin(x * 0.042 + Math.sin(z * 0.031) * 1.4));
  const dunes =
    ridge * ridge * 5.5 +
    Math.sin(z * 0.075 + 0.7) * 1.6 +
    Math.sin((x + z) * 0.11) * 0.8 +
    Math.sin(x * 0.021 - z * 0.017) * 3.5;
  // Gentle undulation even inside the transition ring.
  const soft = Math.sin(x * 0.18) * Math.sin(z * 0.15) * 0.25 * smoothstep(PLAY_RADIUS - 2, PLAY_RADIUS + 8, r);
  return mask * (dunes + 3.5) + soft;
};
