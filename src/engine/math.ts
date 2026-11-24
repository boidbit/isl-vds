// Small, dependency-free math helpers shared by the timeline, camera and animations.
// Everything here is pure so it can be unit tested in Node without a browser.

export type Vec3 = [number, number, number];

export const DEG = Math.PI / 180;

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export const addVec = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const subVec = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const scaleVec = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];

export const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const easeInOut = (t: number) => {
  const c = clamp(t);
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
};

/** Ease that starts and ends gently but moves at near-constant speed in the middle (good for walking). */
export const easeWalk = (t: number) => {
  const c = clamp(t);
  const ramp = 0.12;
  // Integrate a trapezoid velocity profile so distance is continuous.
  const vmax = 1 / (1 - ramp);
  if (c < ramp) return (vmax * c * c) / (2 * ramp);
  if (c > 1 - ramp) {
    const r = 1 - c;
    return 1 - (vmax * r * r) / (2 * ramp);
  }
  return vmax * (c - ramp / 2);
};

/** Shortest-path interpolation between two angles (radians). */
export const lerpAngle = (a: number, b: number, t: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

/** Yaw (rotation about Y) that makes a +Z-facing model look along (dx, dz). */
export const yawFromDir = (dx: number, dz: number) => Math.atan2(dx, dz);

/** Deterministic PRNG so scattered rocks/shrubs are identical on every frame and every render. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Cheap smooth deterministic noise in [-1, 1] for camera drift and idle motion. */
export const wobble = (t: number, seed = 0) =>
  (Math.sin(t * 1.3 + seed * 12.9898) * 0.6 +
    Math.sin(t * 2.7 + seed * 78.233) * 0.3 +
    Math.sin(t * 5.1 + seed * 37.719) * 0.1);
