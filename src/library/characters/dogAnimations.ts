// Procedural animation clips for the four-legged dog rig. The dog faces +Z.
//   leg X  < 0 -> leg swings forward
//   headPitch > 0 -> head lowers towards the ground

import { clamp, easeInOut, smoothstep, wobble } from "../../engine/math";
import type { ClipContext } from "./humanAnimations";

export type DogPose = {
  bodyY: number;
  bodyPitch: number; // > 0 nose down
  bodyRoll: number;
  headPitch: number;
  headYaw: number;
  legFL: number;
  legFR: number;
  legBL: number;
  legBR: number;
  kneeF: number; // fold of front lower legs (> 0 folds backwards)
  kneeB: number; // fold of back lower legs (> 0 folds forwards)
  tailYaw: number;
  tailPitch: number; // > 0 tail up
  tongue: number; // 0..1 how far the tongue hangs out
  jaw: number; // 0..1 open
  breath: number; // 0..1
  earDroop: number; // 0..1
};

export const NEUTRAL_DOG: DogPose = {
  bodyY: 0,
  bodyPitch: 0,
  bodyRoll: 0,
  headPitch: 0,
  headYaw: 0,
  legFL: 0,
  legFR: 0,
  legBL: 0,
  legBR: 0,
  kneeF: 0,
  kneeB: 0,
  tailYaw: 0,
  tailPitch: 0.5,
  tongue: 0,
  jaw: 0,
  breath: 0,
  earDroop: 0,
};

type Clip = (c: ClipContext) => Partial<DogPose>;

const idle: Clip = (c) => ({
  breath: 0.5 + 0.5 * Math.sin(c.sceneTime * 2.2),
  headYaw: wobble(c.sceneTime * 0.4, 3) * 0.2,
  tailYaw: Math.sin(c.sceneTime * 3) * 0.2,
});

const walk: Clip = (c) => {
  const phase = c.distance > 0.01 ? (c.distance / 0.75) * Math.PI * 2 : c.t * Math.PI * 2 * 1.6;
  const s = Math.sin(phase);
  return {
    legFL: -s * 0.45,
    legBR: -s * 0.45,
    legFR: s * 0.45,
    legBL: s * 0.45,
    kneeF: 0.3 * Math.max(0, Math.cos(phase)),
    kneeB: 0.3 * Math.max(0, -Math.cos(phase)),
    bodyY: -0.015 * Math.abs(Math.cos(phase)),
    headPitch: 0.1 + Math.sin(phase * 2) * 0.04,
    tailYaw: Math.sin(phase) * 0.35,
    breath: 0.5 + 0.5 * Math.sin(c.sceneTime * 3),
  };
};

/** Exhausted dog lying down, panting fast with tongue out. */
const liePant: Clip = (c) => {
  const pant = 0.5 + 0.5 * Math.sin(c.sceneTime * Math.PI * 2 * 2.6);
  return {
    bodyY: -0.22,
    bodyRoll: 0.08,
    legFL: -1.45,
    legFR: -1.4,
    legBL: -1.25,
    legBR: -1.3,
    kneeF: 0.1,
    kneeB: 1.9,
    headPitch: 0.3 + pant * 0.04,
    headYaw: 0.15,
    tailPitch: -0.6,
    tailYaw: 0.5,
    tongue: 1,
    jaw: 0.6 + pant * 0.3,
    breath: pant,
    earDroop: 1,
  };
};

/** Standing, licking the damp ground out of thirst. */
const lickGround: Clip = (c) => {
  const lick = Math.max(0, Math.sin(c.t * Math.PI * 2 * 1.8));
  return {
    bodyPitch: 0.18,
    legFL: -0.15,
    legFR: -0.15,
    kneeF: 0.25,
    headPitch: 1.05 + lick * 0.18,
    tongue: 0.4 + lick * 0.6,
    jaw: 0.2 + lick * 0.4,
    tailPitch: -0.3,
    tailYaw: 0.1,
    breath: 0.5 + 0.5 * Math.sin(c.sceneTime * 12),
    earDroop: 0.8,
  };
};

/** Lapping water, slowly perking up (tail starts wagging). */
const drink: Clip = (c) => {
  const lap = Math.max(0, Math.sin(c.t * Math.PI * 2 * 2.4));
  const revive = smoothstep(0.3, 1, c.progress);
  return {
    bodyPitch: 0.2,
    legFL: -0.2,
    legFR: -0.2,
    kneeF: 0.3,
    headPitch: 1.1 + lap * 0.12,
    tongue: 0.5 + lap * 0.5,
    jaw: 0.3 + lap * 0.3,
    tailPitch: -0.3 + revive * 0.9,
    tailYaw: Math.sin(c.t * (4 + revive * 10)) * (0.15 + revive * 0.45),
    breath: 0.5 + 0.5 * Math.sin(c.sceneTime * 6),
    earDroop: 0.8 - revive * 0.7,
  };
};

/** Happy and refreshed: tail wagging, looking up. */
const wag: Clip = (c) => ({
  headPitch: -0.2,
  headYaw: wobble(c.sceneTime * 0.6, 4) * 0.25,
  tailPitch: 0.8,
  tailYaw: Math.sin(c.sceneTime * 16) * 0.6,
  tongue: 0.5,
  jaw: 0.35,
  bodyRoll: Math.sin(c.sceneTime * 16) * 0.03,
  breath: 0.5 + 0.5 * Math.sin(c.sceneTime * 4),
});

/** Lying but lifting its head weakly to look at something. */
const lieLook: Clip = (c) => {
  const k = easeInOut(clamp(c.progress * 2.5));
  return {
    ...liePant(c),
    headPitch: 0.3 - 0.45 * k,
    headYaw: 0.15 + 0.35 * k,
    tailYaw: 0.5 + Math.sin(c.t * 5) * 0.15 * k,
  };
};

export const DOG_CLIPS: Record<string, Clip> = {
  idle,
  walk,
  "lie-pant": liePant,
  "lie-look": lieLook,
  "lick-ground": lickGround,
  drink,
  wag,
};

export const evaluateDogClip = (name: string, c: ClipContext): DogPose => ({
  ...NEUTRAL_DOG,
  ...(DOG_CLIPS[name] ?? idle)(c),
});

export const blendDogPose = (a: DogPose, b: DogPose, t: number): DogPose => {
  const k = clamp(easeInOut(t));
  const out = { ...a };
  (Object.keys(a) as (keyof DogPose)[]).forEach((key) => {
    out[key] = a[key] + (b[key] - a[key]) * k;
  });
  return out;
};
