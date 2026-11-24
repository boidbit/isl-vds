// Time-of-day presets in the storybook-cinematic style (docs/ART_DIRECTION.md).
// Three lights per preset: warm key sun, warm rim from behind the subject,
// cool lavender sky fill, plus the colour grade applied in post.

export type EnvironmentPreset = {
  skyTop: string;
  skyHorizon: string;
  sunGlow: string;
  cloud: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  sunColor: string;
  sunIntensity: number;
  /** Direction towards the sun (normalised by the renderer). */
  sunPosition: [number, number, number];
  rimColor: string;
  rimIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sandColor: string;
  sandShadow: string;
  discColor: string;
  exposure: number;
  grade: { saturation: number; contrast: number; brightness: number; bloom: number; vignette: number };
  dust: string;
};

export const ENVIRONMENTS: Record<string, EnvironmentPreset> = {
  morning: {
    skyTop: "#86b4dc",
    skyHorizon: "#f6dcc0",
    sunGlow: "#ffe1b8",
    cloud: "#fff4ea",
    fog: "#f0d9c0",
    fogNear: 30,
    fogFar: 260,
    sunColor: "#ffe2b8",
    sunIntensity: 3.0,
    sunPosition: [-40, 18, 30],
    rimColor: "#ffe7c4",
    rimIntensity: 1.6,
    hemiSky: "#b8c6ee",
    hemiGround: "#d9a77a",
    hemiIntensity: 1.1,
    sandColor: "#ecc29a",
    sandShadow: "#c99272",
    discColor: "#fff3da",
    exposure: 1.0,
    grade: { saturation: 0.08, contrast: 0.06, brightness: 0.0, bloom: 0.35, vignette: 0.45 },
    dust: "#fff0d8",
  },
  noon: {
    skyTop: "#6ea6d8",
    skyHorizon: "#f3e2c8",
    sunGlow: "#fff2d6",
    cloud: "#ffffff",
    fog: "#efdcc2",
    fogNear: 40,
    fogFar: 300,
    sunColor: "#fff1d8",
    sunIntensity: 3.4,
    sunPosition: [30, 34, 26],
    rimColor: "#fff0d8",
    rimIntensity: 1.4,
    hemiSky: "#b4c8ec",
    hemiGround: "#e0ab7c",
    hemiIntensity: 1.15,
    sandColor: "#efc395",
    sandShadow: "#cf9468",
    discColor: "#ffffff",
    exposure: 1.0,
    grade: { saturation: 0.1, contrast: 0.08, brightness: 0.0, bloom: 0.3, vignette: 0.42 },
    dust: "#fff3e0",
  },
  afternoon: {
    skyTop: "#5f95c9",
    skyHorizon: "#f7cf9c",
    sunGlow: "#ffd194",
    cloud: "#fff0dc",
    fog: "#f0cfa6",
    fogNear: 25,
    fogFar: 230,
    sunColor: "#ffd49a",
    sunIntensity: 3.6,
    sunPosition: [-38, 14, -34],
    rimColor: "#ffc985",
    rimIntensity: 5.0,
    hemiSky: "#a9b6e6",
    hemiGround: "#e3a070",
    hemiIntensity: 1.0,
    sandColor: "#f0bd88",
    sandShadow: "#c4876a",
    discColor: "#fff0cf",
    exposure: 1.05,
    grade: { saturation: 0.2, contrast: 0.2, brightness: -0.02, bloom: 0.5, vignette: 0.5 },
    dust: "#ffe2b0",
  },
  golden: {
    skyTop: "#5a76ab",
    skyHorizon: "#f6ad6a",
    sunGlow: "#ffb46b",
    cloud: "#ffd2b0",
    fog: "#eab78a",
    fogNear: 22,
    fogFar: 210,
    sunColor: "#ffb872",
    sunIntensity: 3.2,
    sunPosition: [-45, 8, -30],
    rimColor: "#ffa95e",
    rimIntensity: 3.6,
    hemiSky: "#9aa3dc",
    hemiGround: "#d98f62",
    hemiIntensity: 1.2,
    sandColor: "#eeb07c",
    sandShadow: "#b77a68",
    discColor: "#ffe2b0",
    exposure: 1.08,
    grade: { saturation: 0.16, contrast: 0.1, brightness: 0.0, bloom: 0.7, vignette: 0.55 },
    dust: "#ffd29a",
  },
  night: {
    skyTop: "#0d1838",
    skyHorizon: "#33446e",
    sunGlow: "#9fb0e8",
    cloud: "#6a78a6",
    fog: "#25345a",
    fogNear: 20,
    fogFar: 170,
    sunColor: "#b4c4ff",
    sunIntensity: 1.1,
    sunPosition: [25, 40, -15],
    rimColor: "#c2d0ff",
    rimIntensity: 1.4,
    hemiSky: "#4a5c9a",
    hemiGround: "#3a3245",
    hemiIntensity: 0.7,
    sandColor: "#a9a2bc",
    sandShadow: "#6d6788",
    discColor: "#eef1ff",
    exposure: 1.0,
    grade: { saturation: -0.05, contrast: 0.08, brightness: 0.0, bloom: 0.5, vignette: 0.6 },
    dust: "#c8d2ff",
  },
};
