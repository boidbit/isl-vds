// Shared art-direction palette and materials. See docs/ART_DIRECTION.md.
// Everything is smooth-shaded; cloth and fur get "sheen" so silhouettes catch the light.

import * as THREE from "three";

export const PALETTE = {
  sand: "#e8b98a",
  sandShadow: "#c98f63",
  terracotta: "#b5643c",
  linen: "#efe4d0",
  sage: "#8c9a5b",
  sageDark: "#5e6b3a",
  sky: "#9fc3dd",
  lavender: "#8c7fa8",
  bark: "#6b4a34",
  stone: "#cfa47c",
  stoneDark: "#a57a57",
  water: "#a9dcea",
};

const cache = new Map<string, THREE.Material>();
const cached = <T extends THREE.Material>(key: string, make: () => T): T => {
  let m = cache.get(key);
  if (!m) {
    m = make();
    cache.set(key, m);
  }
  return m as T;
};

const lighten = (hex: string, amount: number) => {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s * 0.85, Math.min(1, hsl.l + amount));
  return c;
};

export const shade = (hex: string, factor: number) => "#" + new THREE.Color(hex).multiplyScalar(factor).getHexString();

/** Woven fabric: matte with a soft bright sheen at grazing angles. */
export const cloth = (color: string, side: THREE.Side = THREE.FrontSide) =>
  cached(`cloth${color}${side}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.82,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.55,
      sheenColor: lighten(color, 0.18),
      // a little self-light keeps cloth soft and readable in shadow (storybook look)
      emissive: new THREE.Color(color).multiplyScalar(0.07),
      side,
    }),
  );

/** Skin: warm, soft, slightly glowing to fake subsurface light. */
export const skin = (color: string) =>
  cached(`skin${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.6,
      sheen: 0.6,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color("#ffb38a"),
      emissive: new THREE.Color(color).multiplyScalar(0.06),
    }),
  );

/** Fur: like cloth but warmer sheen. */
export const fur = (color: string) =>
  cached(`fur${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.9,
      sheen: 1,
      sheenRoughness: 0.45,
      sheenColor: lighten(color, 0.25),
    }),
  );

export const matte = (color: string, roughness = 0.9, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  cached(`matte${color}${roughness}${JSON.stringify(opts)}`, () => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...opts }));

export const glossy = (color: string) =>
  cached(`glossy${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.2 }));

export const vertexColored = (roughness = 0.95) =>
  cached(`vc${roughness}`, () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness: 0 }));

/** Shallow water: bright, sky-tinted and glossy so it reads as water against warm sand. */
export const water = () =>
  cached("water", () =>
    new THREE.MeshPhysicalMaterial({
      color: "#b9e4ef",
      emissive: new THREE.Color("#7fb8d4"),
      emissiveIntensity: 0.35,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1,
      depthWrite: false,
    }),
  );

/**
 * Lathe helper: revolve a 2D profile [(radius, y)] around Y, with optional
 * fabric folds whose depth grows towards the bottom of the profile.
 */
export const latheWithFolds = (
  profile: [number, number][],
  opts: { segments?: number; folds?: number; foldDepth?: number; phiStart?: number; phiLength?: number; seed?: number } = {},
) => {
  const { segments = 40, folds = 0, foldDepth = 0, phiStart = 0, phiLength = Math.PI * 2, seed = 0 } = opts;
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, segments, phiStart, phiLength);
  if (folds > 0 && foldDepth > 0) {
    const pos = g.attributes.position;
    const ys = profile.map((p) => p[1]);
    const top = Math.max(...ys);
    const bottom = Math.min(...ys);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const t = (top - y) / Math.max(1e-6, top - bottom); // 0 at top, 1 at hem
      const a = Math.atan2(x, z);
      const wave = Math.sin(a * folds + seed) * 0.7 + Math.sin(a * folds * 2.3 + seed * 3) * 0.3;
      const k = 1 + wave * foldDepth * t * t;
      pos.setXYZ(i, x * k, y, z * k);
    }
  }
  g.computeVertexNormals();
  return g;
};
