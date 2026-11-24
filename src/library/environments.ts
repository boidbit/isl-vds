// Time-of-day / weather presets. Pure data: the renderer turns these into sky,
// fog and lights.

export type EnvironmentPreset = {
  skyTop: string;
  skyHorizon: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  groundTint: string;
  /** Colour of the visible sun/moon disc in the sky. */
  discColor: string;
  exposure: number;
};

export const ENVIRONMENTS: Record<string, EnvironmentPreset> = {
  morning: {
    skyTop: "#7fa9d6",
    skyHorizon: "#f3d9b6",
    fog: "#eed8bb",
    fogNear: 40,
    fogFar: 230,
    sunColor: "#ffe0b3",
    sunIntensity: 2.4,
    sunPosition: [-40, 22, 35],
    hemiSky: "#bcd3ee",
    hemiGround: "#c79f72",
    hemiIntensity: 0.9,
    groundTint: "#e0bf8f",
    discColor: "#fff1d6",
    exposure: 1.0,
  },
  noon: {
    skyTop: "#5d93cc",
    skyHorizon: "#efe2c9",
    fog: "#eadcc1",
    fogNear: 45,
    fogFar: 260,
    sunColor: "#fff3dc",
    sunIntensity: 3.4,
    sunPosition: [28, 38, 24],
    hemiSky: "#c6dcf2",
    hemiGround: "#d2aa78",
    hemiIntensity: 0.65,
    groundTint: "#dcb47e",
    discColor: "#ffffff",
    exposure: 1.0,
  },
  golden: {
    skyTop: "#5476a8",
    skyHorizon: "#f2b36f",
    fog: "#d9b48c",
    fogNear: 35,
    fogFar: 220,
    sunColor: "#ffbf7a",
    sunIntensity: 2.6,
    sunPosition: [-45, 12, -30],
    hemiSky: "#a7b9da",
    hemiGround: "#b9875a",
    hemiIntensity: 1.0,
    groundTint: "#eebd86",
    discColor: "#ffd59a",
    exposure: 1.2,
  },
  night: {
    skyTop: "#0a1430",
    skyHorizon: "#2a3b63",
    fog: "#1d2a48",
    fogNear: 25,
    fogFar: 160,
    sunColor: "#a9bcff",
    sunIntensity: 0.7,
    sunPosition: [25, 40, -15],
    hemiSky: "#3a4f86",
    hemiGround: "#2a2a35",
    hemiIntensity: 0.45,
    groundTint: "#8c8aa0",
    discColor: "#e8ecff",
    exposure: 1.0,
  },
};
