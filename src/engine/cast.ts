import { DOG_PRESETS, HUMAN_PRESETS, characterHeight, type DogLook, type HumanLook } from "../library/characters/presets";
import type { Story } from "./schema";

export type ResolvedCast = Record<string, { type: "human" | "dog"; look: HumanLook | DogLook; height: number }>;

/** Merge each cast member's preset with its per-story overrides. */
export const resolveCast = (story: Story): ResolvedCast => {
  const out: ResolvedCast = {};
  for (const [id, m] of Object.entries(story.cast)) {
    const base = m.type === "human" ? HUMAN_PRESETS[m.preset] : DOG_PRESETS[m.preset];
    const look = { ...base, ...(m.overrides ?? {}) } as HumanLook | DogLook;
    out[id] = { type: m.type, look, height: characterHeight(m.type, look) };
  }
  return out;
};
