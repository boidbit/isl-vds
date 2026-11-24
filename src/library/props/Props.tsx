// Storybook scene dressing: rounded-stone well, sandstone boulders, grass tufts,
// dry bushes, acacia, date palms, water. All smooth-shaded and deterministic.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp, easeInOut, mulberry32 } from "../../engine/math";
import type { Prop } from "../../engine/schema";
import { PALETTE, fur, latheWithFolds, matte, vertexColored, water } from "../style";
import { Khuff } from "./Khuff";

const color = (hex: string) => new THREE.Color(hex);

/** Smooth 3D value noise built from sines (deterministic, no textures). */
const noise3 = (x: number, y: number, z: number, seed: number) =>
  Math.sin(x * 1.7 + seed) * Math.sin(y * 2.3 + seed * 1.3) * Math.sin(z * 1.9 + seed * 0.7) * 0.5 +
  Math.sin(x * 3.1 - z * 2.2 + seed * 2.1) * 0.25 +
  Math.sin(y * 4.3 + x * 1.1 + seed * 3.7) * 0.15;

const paintVertices = (g: THREE.BufferGeometry, fn: (x: number, y: number, z: number) => THREE.Color) => {
  const p = g.attributes.position;
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const col = fn(p.getX(i), p.getY(i), p.getZ(i));
    c[i * 3] = col.r;
    c[i * 3 + 1] = col.g;
    c[i * 3 + 2] = col.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
};

// ---------------------------------------------------------------- boulders

const boulderGeometry = (seed: number) => {
  const g = new THREE.IcosahedronGeometry(0.5, 5);
  const p = g.attributes.position;
  const s = seed * 1.37;
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
    const n = v.clone().normalize();
    const d = 1 + noise3(n.x * 2, n.y * 2, n.z * 2, s) * 0.22;
    v.multiplyScalar(d);
    v.y *= 0.72;
    // flatten the base so it sits in the sand
    if (v.y < -0.12) v.y = -0.12 + (v.y + 0.12) * 0.25;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const light = color(PALETTE.stone);
  const dark = color(PALETTE.stoneDark);
  const terra = color(PALETTE.terracotta);
  paintVertices(g, (_x, y) => {
    const band = 0.5 + 0.5 * Math.sin(y * 28 + seed);
    const c = light.clone().lerp(dark, band * 0.45);
    return c.lerp(terra, Math.max(0, 0.15 - y) * 0.9);
  });
  return g;
};

export const Boulder: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const geo = useMemo(() => boulderGeometry(seed), [seed]);
  return <mesh castShadow receiveShadow geometry={geo} position={[0, 0.1, 0]} material={vertexColored(0.92)} />;
};

// ---------------------------------------------------------------- grass

const tuftGeometry = (seed: number) => {
  const rnd = mulberry32(seed * 977 + 3);
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const base = color(PALETTE.sageDark);
  const tip = color("#d8c27a");
  const blades = 14;
  for (let b = 0; b < blades; b++) {
    const a = rnd() * Math.PI * 2;
    const lean = 0.25 + rnd() * 0.6;
    const len = 0.22 + rnd() * 0.25;
    const w = 0.018 + rnd() * 0.01;
    const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const start = positions.length / 3;
    const segs = 4;
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const y = len * Math.sin((t * Math.PI) / 2) * (1 - lean * 0.3);
      const out = len * lean * t * t;
      const width = w * (1 - t);
      const cx = dir.x * (out + 0.01);
      const cz = dir.z * (out + 0.01);
      positions.push(cx + side.x * width, y, cz + side.z * width, cx - side.x * width, y, cz - side.z * width);
      const c = base.clone().lerp(tip, t);
      colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
      if (s < segs) {
        const i = start + s * 2;
        indices.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
};

const grassMat = () => vertexColored(0.85);
const grassMaterial = (() => {
  let m: THREE.MeshStandardMaterial | null = null;
  return () => {
    if (!m) {
      m = (grassMat() as THREE.MeshStandardMaterial).clone();
      m.side = THREE.DoubleSide;
    }
    return m;
  };
})();

export const GrassTuft: React.FC<{ seed?: number; time?: number }> = ({ seed = 1, time = 0 }) => {
  const geo = useMemo(() => tuftGeometry(seed), [seed]);
  const sway = Math.sin(time * 1.3 + seed) * 0.05;
  return <mesh castShadow geometry={geo} material={grassMaterial()} rotation={[sway, 0, sway * 0.6]} />;
};

export const Bush: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const clumps = useMemo(() => {
    const rnd = mulberry32(seed * 131 + 7);
    return Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + rnd();
      const r = i === 0 ? 0 : 0.18 + rnd() * 0.12;
      return { pos: [Math.sin(a) * r, 0.18 + rnd() * 0.12, Math.cos(a) * r] as [number, number, number], s: 0.16 + rnd() * 0.08, tone: rnd() };
    });
  }, [seed]);
  const mats = [fur(PALETTE.sage), fur("#9aa265"), fur(PALETTE.sageDark)];
  return (
    <group>
      {clumps.map((c, i) => (
        <mesh key={i} castShadow receiveShadow position={c.pos} scale={[1, 0.8, 1]} material={mats[Math.floor(c.tone * mats.length)]}>
          <icosahedronGeometry args={[c.s, 3]} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- trees

const tube = (points: [number, number, number][], r0: number, r1: number, segs = 24) => {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, segs, 1, 10, false);
  const p = g.attributes.position;
  const c = new THREE.Vector3();
  const radial = 11;
  for (let i = 0; i < p.count; i++) {
    const t = Math.floor(i / radial) / segs;
    curve.getPointAt(Math.min(1, t), c);
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).sub(c).multiplyScalar(r0 + (r1 - r0) * t).add(c);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

/** Flat-topped umbrella acacia: the classic storybook desert silhouette. */
export const Acacia: React.FC = () => {
  const parts = useMemo(() => {
    const trunk = tube([[0, 0, 0], [0.15, 0.9, 0.05], [0.05, 1.8, 0.1], [0.25, 2.4, 0.05]], 0.2, 0.11);
    const branches = [
      tube([[0.2, 2.2, 0.05], [0.9, 2.8, 0.3], [1.6, 3.15, 0.5]], 0.1, 0.035),
      tube([[0.2, 2.25, 0.05], [-0.6, 2.85, -0.2], [-1.5, 3.1, -0.4]], 0.1, 0.035),
      tube([[0.22, 2.35, 0.08], [0.4, 3.0, -0.7], [0.5, 3.2, -1.3]], 0.08, 0.03),
      tube([[0.2, 2.3, 0.1], [0.1, 2.95, 0.8], [-0.2, 3.2, 1.3]], 0.08, 0.03),
    ];
    const rnd = mulberry32(5);
    const clumps = Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 * 1.7 + rnd();
      const r = Math.sqrt(rnd()) * 2.0;
      return {
        pos: [0.2 + Math.sin(a) * r, 3.25 + rnd() * 0.25 - r * 0.06, Math.cos(a) * r] as [number, number, number],
        s: 0.55 + rnd() * 0.35,
        tone: rnd(),
      };
    });
    return { trunk, branches, clumps };
  }, []);
  const bark = fur(PALETTE.bark);
  const leaf = [fur("#7f9150"), fur("#90a05a"), fur("#6a7d42")];
  return (
    <group>
      <mesh castShadow receiveShadow geometry={parts.trunk} material={bark} />
      {parts.branches.map((g, i) => (
        <mesh key={i} castShadow geometry={g} material={bark} />
      ))}
      {parts.clumps.map((c, i) => (
        <mesh key={i} castShadow receiveShadow position={c.pos} scale={[1, 0.36, 1]} material={leaf[Math.floor(c.tone * leaf.length)]}>
          <icosahedronGeometry args={[c.s, 3]} />
        </mesh>
      ))}
    </group>
  );
};

const frondGeometry = () => {
  const len = 2.3;
  const g = new THREE.PlaneGeometry(0.7, len, 6, 16);
  g.translate(0, len / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const t = y / len;
    const w = Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.4);
    const nx = x * w;
    // arch outward and droop at the tip, fold leaflets into a V
    const z = Math.abs(nx) * 0.45 - t * t * 1.2;
    p.setXYZ(i, nx, y * (1 - t * 0.25), z);
  }
  g.computeVertexNormals();
  const light = color("#94a857");
  const dark = color("#5f7436");
  paintVertices(g, (x, y) => dark.clone().lerp(light, Math.min(1, y / len + Math.abs(x) * 0.8)));
  return g;
};

export const DatePalm: React.FC<{ height?: number; seed?: number }> = ({ height = 5, seed = 1 }) => {
  const parts = useMemo(() => {
    const lean = 0.5 + (seed % 3) * 0.2;
    const top: [number, number, number] = [lean, height, 0.1];
    const trunk = tube([[0, 0, 0], [lean * 0.15, height * 0.4, 0], [lean * 0.55, height * 0.8, 0.05], top], 0.2, 0.14, 32);
    const light = color("#a07b58");
    const dark = color("#6d4f39");
    paintVertices(trunk, (_x, y) => light.clone().lerp(dark, 0.5 + 0.5 * Math.sin(y * 18)));
    return { trunk, top, frond: frondGeometry() };
  }, [height, seed]);
  const frondMat = useMemo(() => {
    const m = (vertexColored(0.8) as THREE.MeshStandardMaterial).clone();
    m.side = THREE.DoubleSide;
    return m;
  }, []);
  return (
    <group>
      <mesh castShadow receiveShadow geometry={parts.trunk} material={vertexColored(0.9)} />
      <group position={parts.top}>
        {Array.from({ length: 13 }, (_, i) => {
          const a = (i / 13) * Math.PI * 2 + seed;
          const tilt = 0.9 + (i % 3) * 0.25;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh castShadow geometry={parts.frond} material={frondMat} rotation={[tilt, 0, 0]} />
            </group>
          );
        })}
        {/* date clusters */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} castShadow position={[Math.sin(i * 2.1) * 0.18, -0.25, Math.cos(i * 2.1) * 0.18]} material={fur("#b5642c")} scale={[1, 1.3, 1]}>
            <icosahedronGeometry args={[0.13, 2]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- well

export const Well: React.FC = () => {
  const parts = useMemo(() => {
    const rnd = mulberry32(11);
    const stones: { pos: [number, number, number]; rot: [number, number, number]; geo: THREE.BufferGeometry; tone: number }[] = [];
    const courses = 4;
    const geos = [0, 1, 2].map((i) => new RoundedBoxGeometry(0.36 + i * 0.03, 0.2, 0.26, 3, 0.06));
    for (let row = 0; row < courses; row++) {
      const count = 15;
      for (let i = 0; i < count; i++) {
        const a = ((i + (row % 2) * 0.5) / count) * Math.PI * 2 + (rnd() - 0.5) * 0.04;
        const r = 0.93 + (rnd() - 0.5) * 0.03;
        stones.push({
          pos: [Math.sin(a) * r, 0.1 + row * 0.19, Math.cos(a) * r],
          rot: [(rnd() - 0.5) * 0.06, a, (rnd() - 0.5) * 0.08],
          geo: geos[Math.floor(rnd() * geos.length)],
          tone: rnd(),
        });
      }
    }
    // Capstones: larger, flatter slabs around the rim.
    const caps: typeof stones = [];
    const capGeo = new RoundedBoxGeometry(0.52, 0.12, 0.42, 3, 0.05);
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.1;
      caps.push({ pos: [Math.sin(a) * 0.98, 0.83, Math.cos(a) * 0.98], rot: [(rnd() - 0.5) * 0.05, a, (rnd() - 0.5) * 0.05], geo: capGeo, tone: rnd() });
    }
    const mound = latheWithFolds(
      [
        [0.0, 0.03],
        [1.0, 0.03],
        [1.4, 0.02],
        [2.2, 0.0],
        [2.6, -0.02],
      ],
      { segments: 48 },
    );
    return { stones, caps, mound };
  }, []);
  const stoneMats = [fur("#d6ad85"), fur("#c49872"), fur("#e0bd96"), fur("#b88a66")];
  const capMats = [fur("#e2c29c"), fur("#d4b089")];
  return (
    <group>
      <mesh receiveShadow geometry={parts.mound} material={matte("#e0ac7c", 1)} />
      {parts.stones.map((s, i) => (
        <mesh key={i} castShadow receiveShadow geometry={s.geo} position={s.pos} rotation={s.rot} material={stoneMats[Math.floor(s.tone * stoneMats.length)]} />
      ))}
      {parts.caps.map((s, i) => (
        <mesh key={`c${i}`} castShadow receiveShadow geometry={s.geo} position={s.pos} rotation={s.rot} material={capMats[Math.floor(s.tone * capMats.length)]} />
      ))}
      {/* inner shaft + darkness */}
      <mesh position={[0, 0.42, 0]} material={matte("#3b2a1e", 1, { side: THREE.BackSide })}>
        <cylinderGeometry args={[0.8, 0.8, 0.85, 32, 1, true]} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="#120b06" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- ground decals & water

const Decal: React.FC<{ hex: string; radius: number; opacity: number; y?: number }> = ({ hex, radius, opacity, y = 0.006 }) => (
  <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow scale={[1, 0.72, 1]}>
    <circleGeometry args={[radius, 32]} />
    <meshStandardMaterial color={hex} transparent opacity={opacity} roughness={0.7} depthWrite={false} />
  </mesh>
);

export const PropNode: React.FC<{ prop: Prop; time: number }> = ({ prop, time }) => {
  if (prop.appear !== undefined && time < prop.appear) return null;
  const grow = prop.appear !== undefined ? easeInOut(clamp((time - prop.appear) / 1.5)) : 1;
  const seed = Math.abs(Math.round(prop.at[0] * 13 + prop.at[2] * 7)) + 1;
  let node: React.ReactNode = null;
  switch (prop.type) {
    case "well":
      node = <Well />;
      break;
    case "rock":
      node = <Boulder seed={seed} />;
      break;
    case "shrub":
      node = <Bush seed={seed} />;
      break;
    case "grass":
      node = <GrassTuft seed={seed} time={time} />;
      break;
    case "acacia":
      node = <Acacia />;
      break;
    case "palm":
      node = <DatePalm seed={seed} height={4.5 + (seed % 3) * 0.6} />;
      break;
    case "wet-sand":
      node = <Decal hex="#6e4128" radius={0.5} opacity={0.4} />;
      break;
    case "puddle":
      node = (
        <group scale={[grow, 1, grow]}>
          <Decal hex="#8d5a3a" radius={0.36} opacity={0.5} />
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0.4]} scale={[1, 0.62, 1]} material={water()}>
            <circleGeometry args={[0.2, 32]} />
          </mesh>
        </group>
      );
      break;
    case "khuff":
      node = (
        <group rotation={[Math.PI / 2, 0, 0.4]} position={[0, 0.05, 0]}>
          <Khuff />
        </group>
      );
      break;
  }
  return (
    <group position={prop.at} rotation={[0, (prop.rotation * Math.PI) / 180, 0]} scale={prop.scale}>
      {node}
    </group>
  );
};

