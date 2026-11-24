// Procedural animation clips for the human rig.
//
// Conventions (character faces +Z, all angles in radians):
//   hip / shoulder X  < 0  -> limb swings forward
//   knee X            > 0  -> shin bends backward
//   elbow X           < 0  -> forearm bends forward/up
//   spine / neck X    > 0  -> lean / nod forward
//   armOut            > 0  -> arm raised sideways away from the body (mirrored per side)
//
// A clip is a pure function of time, so any frame can be rendered independently
// (required for deterministic, parallel video rendering).

import { clamp, easeInOut, smoothstep, wobble } from "../../engine/math";

export type HumanPose = {
  bodyY: number; // vertical offset of the whole body (kneeling, bobbing)
  spine: number;
  spineTwist: number;
  spineSide: number;
  neck: number;
  headTurn: number;
  headTilt: number;
  lShoulder: number;
  lArmOut: number;
  lElbow: number;
  rShoulder: number;
  rArmOut: number;
  rElbow: number;
  lHip: number;
  lKnee: number;
  rHip: number;
  rKnee: number;
  breath: number; // 0..1 chest expansion
};

export const NEUTRAL_HUMAN: HumanPose = {
  bodyY: 0,
  spine: 0,
  spineTwist: 0,
  spineSide: 0,
  neck: 0,
  headTurn: 0,
  headTilt: 0,
  lShoulder: 0,
  lArmOut: 0.08,
  lElbow: -0.1,
  rShoulder: 0,
  rArmOut: 0.08,
  rElbow: -0.1,
  lHip: 0,
  lKnee: 0,
  rHip: 0,
  rKnee: 0,
  breath: 0,
};

export type ClipContext = {
  /** Seconds since the action started. */
  t: number;
  /** Action duration in seconds. */
  duration: number;
  /** 0..1 progress through the action. */
  progress: number;
  /** Metres travelled since the action started (drives walk cycles without foot sliding). */
  distance: number;
  /** Seconds since the scene started (for continuous breathing etc.). */
  sceneTime: number;
};

type Clip = (c: ClipContext) => Partial<HumanPose>;

const breathe = (time: number, rate = 0.25) => 0.5 + 0.5 * Math.sin(time * Math.PI * 2 * rate);

/** Walk cycle phase from distance so the feet roughly match ground speed. */
const strideAt = (c: ClipContext, strideLength: number, fallbackRate: number) =>
  c.distance > 0.01 ? (c.distance / strideLength) * Math.PI * 2 : c.t * fallbackRate * Math.PI * 2;

const gait = (phase: number, swing: number, kneeAmt: number) => {
  const s = Math.sin(phase);
  const lKnee = kneeAmt * Math.max(0, Math.sin(phase + Math.PI * 0.5)) + 0.08;
  const rKnee = kneeAmt * Math.max(0, Math.sin(phase + Math.PI * 1.5)) + 0.08;
  return {
    lHip: -s * swing,
    rHip: s * swing,
    lKnee,
    rKnee,
    lShoulder: s * swing * 0.7,
    rShoulder: -s * swing * 0.7,
    bodyY: -0.025 * Math.abs(Math.cos(phase)),
    spineTwist: s * 0.06,
  };
};

const idle: Clip = (c) => ({
  breath: breathe(c.sceneTime),
  spineSide: wobble(c.sceneTime * 0.4, 1) * 0.015,
  headTurn: wobble(c.sceneTime * 0.3, 2) * 0.08,
  lElbow: -0.12,
  rElbow: -0.12,
});

const walk: Clip = (c) => ({
  ...gait(strideAt(c, 1.5, 0.9), 0.42, 0.75),
  spine: 0.05,
  breath: breathe(c.sceneTime, 0.35),
  lElbow: -0.35,
  rElbow: -0.35,
});

/** Slow, heavy, head-down walk of someone exhausted by thirst. */
const walkTired: Clip = (c) => {
  const phase = strideAt(c, 1.0, 0.6);
  const g = gait(phase, 0.3, 0.55);
  return {
    ...g,
    lShoulder: g.lShoulder * 0.4,
    rShoulder: g.rShoulder * 0.4,
    spine: 0.28 + Math.sin(phase * 2) * 0.03,
    neck: 0.32,
    headTilt: Math.sin(phase * 0.5) * 0.08,
    spineSide: Math.sin(phase) * 0.05,
    bodyY: g.bodyY * 1.6 - 0.02,
    breath: breathe(c.sceneTime, 0.6),
    lElbow: -0.15,
    rElbow: -0.15,
    lArmOut: 0.05,
    rArmOut: 0.05,
  };
};

const run: Clip = (c) => {
  const phase = strideAt(c, 2.4, 1.6);
  const g = gait(phase, 0.75, 1.3);
  return {
    ...g,
    bodyY: 0.04 * Math.abs(Math.sin(phase)) - 0.03,
    spine: 0.2,
    lElbow: -1.3,
    rElbow: -1.3,
    breath: breathe(c.sceneTime, 0.8),
  };
};

/** Standing, scanning the horizon. */
const lookAround: Clip = (c) => {
  const turn = Math.sin(c.t * 1.1) * 0.9;
  return {
    ...idle(c),
    headTurn: turn,
    spineTwist: turn * 0.3,
    neck: -0.08,
    rShoulder: -1.9 * smoothstep(0.1, 0.25, c.progress) * (1 - smoothstep(0.75, 0.95, c.progress)),
    rElbow: -1.9 * smoothstep(0.1, 0.25, c.progress) * (1 - smoothstep(0.75, 0.95, c.progress)),
    rArmOut: 0.3,
  };
};

/** Wipes sweat from the forehead with the right forearm. */
const wipeBrow: Clip = (c) => {
  const up = smoothstep(0.05, 0.3, c.progress) * (1 - smoothstep(0.7, 0.95, c.progress));
  const sweep = Math.sin(c.t * 4) * 0.25 * up;
  return {
    ...idle(c),
    spine: 0.12,
    neck: -0.1 * up + 0.15,
    rShoulder: -2.3 * up,
    rArmOut: 0.35 * up + 0.08,
    rElbow: -1.9 * up - 0.1,
    spineTwist: sweep,
    breath: breathe(c.sceneTime, 0.6),
  };
};

/** Tired standing: hunched, heavy breathing. */
const tired: Clip = (c) => ({
  breath: breathe(c.sceneTime, 0.7),
  spine: 0.3 + Math.sin(c.sceneTime * 4.4) * 0.025,
  neck: 0.3,
  lShoulder: 0.05,
  rShoulder: 0.05,
  lElbow: -0.1,
  rElbow: -0.1,
  lKnee: 0.12,
  rKnee: 0.12,
  bodyY: -0.02,
});

/** Notices something and is moved by it: hand to chest, head slightly bowed towards it. */
const realize: Clip = (c) => {
  const k = smoothstep(0.05, 0.35, c.progress);
  return {
    ...idle(c),
    neck: 0.35 * k,
    headTilt: 0.12 * k,
    spine: 0.1 * k,
    rShoulder: -0.55 * k,
    rArmOut: -0.25 * k,
    rElbow: -1.95 * k,
    breath: breathe(c.sceneTime, 0.35),
  };
};

const pointAt: Clip = (c) => {
  const k = smoothstep(0.05, 0.3, c.progress) * (1 - smoothstep(0.8, 1, c.progress));
  return { ...idle(c), rShoulder: -1.5 * k, rElbow: -0.1, rArmOut: 0.1, neck: -0.05 };
};

const kneelBase = (c: ClipContext): Partial<HumanPose> => ({
  bodyY: -0.45,
  lHip: 0.05,
  rHip: -0.05,
  lKnee: Math.PI / 2,
  rKnee: Math.PI / 2,
  spine: 0.2,
  neck: 0.25,
  breath: breathe(c.sceneTime, 0.35),
});

const kneel: Clip = (c) => ({ ...kneelBase(c), lElbow: -0.3, rElbow: -0.3 });

/** Kneeling and holding something low in front with both hands (offering water). */
const kneelGive: Clip = (c) => {
  const k = smoothstep(0.0, 0.25, c.progress);
  const tremble = Math.sin(c.t * 2.2) * 0.04;
  return {
    ...kneelBase(c),
    spine: 0.5 * k + 0.2,
    neck: 0.45,
    rShoulder: -0.95 * k + tremble,
    rElbow: -0.35,
    rArmOut: 0.0,
    lShoulder: -0.8 * k,
    lElbow: -0.6,
    lArmOut: -0.15,
  };
};

/** Kneels and gently strokes something low in front (comforting an animal). */
const kneelComfort: Clip = (c) => {
  const k = smoothstep(0.0, 0.25, c.progress);
  const stroke = Math.sin(c.t * 2.4) * 0.22 * k;
  return {
    ...kneelBase(c),
    spine: 0.45 * k + 0.2,
    neck: 0.4,
    rShoulder: -0.9 * k + stroke,
    rElbow: -0.45,
    lShoulder: 0.1,
    lElbow: -0.2,
  };
};

const sit: Clip = (c) => ({
  bodyY: -0.74,
  lHip: -1.45,
  rHip: -1.35,
  lKnee: 0.5,
  rKnee: 0.35,
  spine: 0.15,
  neck: 0.2,
  lShoulder: -0.6,
  rShoulder: -0.6,
  lElbow: -0.4,
  rElbow: -0.4,
  breath: breathe(c.sceneTime, 0.3),
});

/** Climbing a rope or well wall: alternating reach, legs pushing. */
const climb: Clip = (c) => {
  const p = c.t * Math.PI * 2 * 0.9;
  const s = Math.sin(p);
  return {
    lShoulder: -2.6 + s * 0.35,
    rShoulder: -2.6 - s * 0.35,
    lElbow: -0.5 - Math.max(0, s) * 0.6,
    rElbow: -0.5 - Math.max(0, -s) * 0.6,
    lArmOut: 0.15,
    rArmOut: 0.15,
    lHip: -0.7 + s * 0.4,
    rHip: -0.7 - s * 0.4,
    lKnee: 1.0 + s * 0.3,
    rKnee: 1.0 - s * 0.3,
    spine: 0.15,
    neck: -0.35,
    breath: breathe(c.sceneTime, 0.7),
  };
};

/** Drinking from cupped hands. */
const drinkHands: Clip = (c) => {
  const k = smoothstep(0.05, 0.3, c.progress) * (1 - smoothstep(0.85, 1, c.progress));
  return {
    ...idle(c),
    lShoulder: -1.1 * k,
    rShoulder: -1.1 * k,
    lElbow: -1.7 * k,
    rElbow: -1.7 * k,
    lArmOut: -0.3 * k,
    rArmOut: -0.3 * k,
    neck: -0.35 * k + 0.15,
  };
};

export const HUMAN_CLIPS: Record<string, Clip> = {
  idle,
  walk,
  "walk-tired": walkTired,
  run,
  "look-around": lookAround,
  "wipe-brow": wipeBrow,
  tired,
  realize,
  point: pointAt,
  kneel,
  "kneel-give": kneelGive,
  "kneel-comfort": kneelComfort,
  sit,
  climb,
  "drink-hands": drinkHands,
};

export const evaluateHumanClip = (name: string, c: ClipContext): HumanPose => ({
  ...NEUTRAL_HUMAN,
  ...(HUMAN_CLIPS[name] ?? idle)(c),
});

export const blendHumanPose = (a: HumanPose, b: HumanPose, t: number): HumanPose => {
  const k = clamp(easeInOut(t));
  const out = { ...a };
  (Object.keys(a) as (keyof HumanPose)[]).forEach((key) => {
    out[key] = a[key] + (b[key] - a[key]) * k;
  });
  return out;
};
