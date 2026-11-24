// Character presets. Every human is built from the same procedural base model;
// a preset only changes proportions, clothing and colours. Stories can override
// any field per character via `cast.<id>.overrides`.
//
// Characters are intentionally faceless (no eyes/mouth): emotion is carried by
// body language and camera, and it respects sensitivities around depiction.

export type HumanLook = {
  height: number; // metres
  build: number; // 0.8 thin .. 1.3 heavy
  skin: string;
  robe: string; // thobe colour
  robeTrim: string;
  cloak: string | null; // outer bisht/abaya, null for none
  headwear: "turban" | "keffiyeh" | "cap" | "none";
  headwearColor: string;
  headband: string; // agal / turban band
  beard: "none" | "short" | "full" | "long";
  beardColor: string;
  sash: string | null;
};

export type DogLook = {
  size: number;
  fur: string;
  furDark: string;
  thin: number; // 0 healthy .. 1 starving (ribs/narrow body)
};

export const HUMAN_PRESETS: Record<string, HumanLook> = {
  musafir: {
    height: 1.76,
    build: 0.95,
    skin: "#b98a62",
    robe: "#e4d6bd",
    robeTrim: "#b49a73",
    cloak: "#7a5638",
    headwear: "turban",
    headwearColor: "#efe8da",
    headband: "#cbbfa6",
    beard: "full",
    beardColor: "#2e2219",
    sash: "#8b3a2b",
  },
  buzurg: {
    height: 1.68,
    build: 0.9,
    skin: "#c49b76",
    robe: "#f3efe6",
    robeTrim: "#d4cbb8",
    cloak: "#5d5a52",
    headwear: "turban",
    headwearColor: "#ffffff",
    headband: "#e6e1d6",
    beard: "long",
    beardColor: "#e8e6e1",
    sash: null,
  },
  naujawan: {
    height: 1.8,
    build: 1.0,
    skin: "#ad7d55",
    robe: "#d9cfbf",
    robeTrim: "#8f7c63",
    cloak: null,
    headwear: "keffiyeh",
    headwearColor: "#f1ede4",
    headband: "#1d1d1d",
    beard: "short",
    beardColor: "#1f1712",
    sash: "#3e5a74",
  },
  vyapari: {
    height: 1.72,
    build: 1.25,
    skin: "#c08e66",
    robe: "#3d5c7a",
    robeTrim: "#c9a24a",
    cloak: "#6b2f3a",
    headwear: "turban",
    headwearColor: "#c9a24a",
    headband: "#8a6a24",
    beard: "full",
    beardColor: "#251b14",
    sash: "#c9a24a",
  },
  gareeb: {
    height: 1.7,
    build: 0.85,
    skin: "#a7774f",
    robe: "#a89a83",
    robeTrim: "#7d705c",
    cloak: null,
    headwear: "cap",
    headwearColor: "#cfc5b2",
    headband: "#a99f8c",
    beard: "short",
    beardColor: "#2b2019",
    sash: null,
  },
  bachcha: {
    height: 1.15,
    build: 0.9,
    skin: "#c59a70",
    robe: "#eae2d2",
    robeTrim: "#9d8b6f",
    cloak: null,
    headwear: "cap",
    headwearColor: "#ffffff",
    headband: "#e3ddd0",
    beard: "none",
    beardColor: "#000000",
    sash: "#6f8f4e",
  },
};

export const DOG_PRESETS: Record<string, DogLook> = {
  "desert-dog": { size: 1, fur: "#c9a273", furDark: "#8c6a45", thin: 0.8 },
  "street-dog": { size: 0.9, fur: "#6f5a48", furDark: "#3f3228", thin: 0.3 },
  "white-dog": { size: 1.05, fur: "#e9e2d6", furDark: "#b8ab98", thin: 0 },
};

/** Height used by the camera system to frame each character type. */
export const characterHeight = (type: "human" | "dog", look: HumanLook | DogLook) =>
  type === "human" ? (look as HumanLook).height : 0.56 * (look as DogLook).size;
