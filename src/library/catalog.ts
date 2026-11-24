// Single source of truth for everything a story JSON is allowed to reference.
// The validator and the renderer both read from here, so a typo in a story
// is caught before a single frame is rendered.

import { DOG_CLIPS } from "./characters/dogAnimations";
import { HUMAN_CLIPS } from "./characters/humanAnimations";
import { DOG_PRESETS, HUMAN_PRESETS } from "./characters/presets";
import { ENVIRONMENTS } from "./environments";

export const CHARACTER_TYPES = ["human", "dog"] as const;
export type CharacterType = (typeof CHARACTER_TYPES)[number];

export const ANIMATIONS: Record<CharacterType, string[]> = {
  human: Object.keys(HUMAN_CLIPS),
  dog: Object.keys(DOG_CLIPS),
};

export const PRESETS: Record<CharacterType, string[]> = {
  human: Object.keys(HUMAN_PRESETS),
  dog: Object.keys(DOG_PRESETS),
};

export const LOCATIONS = ["registan", "registan-kuan"] as const;

export const ENVIRONMENT_NAMES = Object.keys(ENVIRONMENTS);

/** Scene props that can be placed in the world. */
export const PROPS = ["well", "rock", "shrub", "grass", "acacia", "palm", "wet-sand", "puddle", "khuff"] as const;

/** Props a character can hold during an action. */
export const HOLDABLE = ["khuff"] as const;
export const HOLD_SLOTS = ["rightHand", "leftHand", "mouth"] as const;

export const CAMERA_SHOTS = [
  "establishing",
  "wide",
  "full",
  "medium",
  "close-up",
  "extreme-close-up",
  "low-angle",
  "high-angle",
  "top-down",
  "side",
  "tracking",
  "two-shot",
  "over-shoulder",
  "custom",
] as const;

export const CAMERA_MOVES = ["follow", "static", "push-in", "pull-out", "orbit", "crane-up", "crane-down"] as const;
