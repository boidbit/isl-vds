import React, { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "../../engine/math";
import type { Prop } from "../../engine/schema";
import type { EnvironmentPreset } from "../environments";
import { PropNode } from "../props/Props";
import { latheWithFolds } from "../style";
import { sandRippleNormal, softDot } from "../textures";
import { PLAY_RADIUS, desertHeight } from "./terrain";

/** Sculpted dunes with lit crests and cooler troughs, plus wind-ripple normals. */
const useTerrain = (env: EnvironmentPreset) =>
  useMemo(() => {
    const size = 440;
    const seg = 260;
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, desertHeight(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    const nrm = g.attributes.normal;
    const lit = new THREE.Color(env.sandColor);
    const shadow = new THREE.Color(env.sandShadow);
    const crest = lit.clone().offsetHSL(0, -0.05, 0.06);
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = pos.getY(i);
      const slope = 1 - nrm.getY(i);
      const variation = Math.sin(x * 0.31 + z * 0.17) * 0.5 + Math.sin(x * 0.07 - z * 0.11) * 0.5;
      c.copy(lit).lerp(shadow, Math.min(1, slope * 2.2 + Math.max(0, -variation) * 0.12));
      c.lerp(crest, Math.min(1, Math.max(0, h - 4) * 0.05));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const ripple = sandRippleNormal();
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.96,
      metalness: 0,
      normalMap: ripple,
      normalScale: new THREE.Vector2(0.55, 0.55),
    });
    material.normalMap!.repeat.set(170, 170);
    return { g, material };
  }, [env]);

/** Far-away flat-topped sandstone mesas: silhouettes that sit in the haze. */
const Mesas: React.FC<{ env: EnvironmentPreset }> = ({ env }) => {
  const mesas = useMemo(() => {
    const rnd = mulberry32(77);
    return Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + rnd() * 0.6;
      const r = 170 + rnd() * 50;
      const h = 14 + rnd() * 22;
      const w = 18 + rnd() * 30;
      const geo = latheWithFolds(
        [
          [w * 1.25, -2],
          [w * 1.0, h * 0.35],
          [w * 0.82, h * 0.8],
          [w * 0.78, h * 0.96],
          [w * 0.7, h],
          [0, h * 1.01],
        ],
        { segments: 40, folds: 11, foldDepth: 0.12, seed: i },
      );
      return { geo, pos: [Math.sin(a) * r, -1, Math.cos(a) * r] as [number, number, number], sx: 0.6 + rnd() * 0.8 };
    });
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(env.sandShadow).lerp(new THREE.Color("#b96f4c"), 0.4), roughness: 1 }), [env]);
  return (
    <group>
      {mesas.map((m, i) => (
        <mesh key={i} geometry={m.geo} position={m.pos} scale={[1, 1, m.sx]} material={mat} />
      ))}
    </group>
  );
};

/** Golden dust floating in the light: a cheap trick that sells "atmosphere". */
export const DustMotes: React.FC<{ env: EnvironmentPreset; center: [number, number, number]; time: number }> = ({ env, center, time }) => {
  const base = useMemo(() => {
    const rnd = mulberry32(9);
    const n = 260;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rnd() - 0.5) * 14;
      arr[i * 3 + 1] = rnd() * 3.2;
      arr[i * 3 + 2] = (rnd() - 0.5) * 14;
    }
    return arr;
  }, []);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = new Float32Array(base.length);
  for (let i = 0; i < base.length; i += 3) {
    const k = i / 3;
    positions[i] = center[0] + base[i] + Math.sin(time * 0.3 + k) * 0.25 + time * 0.12;
    positions[i + 1] = base[i + 1] + Math.sin(time * 0.5 + k * 1.7) * 0.15;
    positions[i + 2] = center[2] + base[i + 2] + Math.cos(time * 0.25 + k * 0.7) * 0.25;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={softDot()}
        color={env.dust}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/** Rocks, bushes and grass scattered deterministically outside the play area. */
const useScatter = (seed: number) =>
  useMemo(() => {
    const rnd = mulberry32(seed);
    const items: Prop[] = [];
    const place = (type: Prop["type"], rMin: number, rMax: number, sMin: number, sMax: number) => {
      const a = rnd() * Math.PI * 2;
      const r = rMin + rnd() * (rMax - rMin);
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      items.push({ type, at: [x, desertHeight(x, z) - 0.02, z], scale: sMin + rnd() * (sMax - sMin), rotation: rnd() * 360 });
    };
    // Boulder clusters
    for (let c = 0; c < 14; c++) {
      const a = rnd() * Math.PI * 2;
      const r = PLAY_RADIUS * 0.8 + rnd() * 45;
      const cx = Math.sin(a) * r;
      const cz = Math.cos(a) * r;
      const n = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const x = cx + (rnd() - 0.5) * 3;
        const z = cz + (rnd() - 0.5) * 3;
        items.push({ type: "rock", at: [x, desertHeight(x, z) - 0.05, z], scale: (i === 0 ? 1.6 : 0.6) + rnd() * 1.2, rotation: rnd() * 360 });
      }
    }
    for (let i = 0; i < 40; i++) place("grass", 7, 40, 0.8, 1.6);
    for (let i = 0; i < 22; i++) place("shrub", 9, 50, 0.7, 1.5);
    return items;
  }, [seed]);

export const Desert: React.FC<{ env: EnvironmentPreset; seed?: number; time: number }> = ({ env, seed = 3, time }) => {
  const { g, material } = useTerrain(env);
  const scatter = useScatter(seed);
  return (
    <group>
      <mesh geometry={g} material={material} receiveShadow />
      <Mesas env={env} />
      {scatter.map((p, i) => (
        <PropNode key={i} prop={p} time={time} />
      ))}
    </group>
  );
};

/** Fixed layout of the "registan-kuan" location, composed around the well. */
export const WELL_LAYOUT: Prop[] = [
  { type: "well", at: [0, 0, 0], scale: 1, rotation: 0 },
  { type: "acacia", at: [-4.6, 0, -3.4], scale: 1.05, rotation: 30 },
  { type: "palm", at: [-8.5, 0, -7.5], scale: 1, rotation: 0 },
  { type: "palm", at: [-10.5, 0, -5.5], scale: 0.9, rotation: 120 },
  { type: "palm", at: [7.5, 0, -10], scale: 1.1, rotation: 200 },
  { type: "rock", at: [5.2, 0, -4.8], scale: 1.8, rotation: 10 },
  { type: "rock", at: [6.4, 0, -3.9], scale: 1.0, rotation: 70 },
  { type: "rock", at: [-2.6, 0, 3.1], scale: 0.7, rotation: 20 },
  { type: "rock", at: [1.7, 0, 1.6], scale: 0.38, rotation: 45 },
  { type: "shrub", at: [-3.4, 0, -2.0], scale: 1.1, rotation: 0 },
  { type: "shrub", at: [4.2, 0, -5.6], scale: 1.3, rotation: 0 },
  { type: "grass", at: [1.15, 0, 0.6], scale: 1.1, rotation: 0 },
  { type: "grass", at: [-1.1, 0, -0.5], scale: 1.2, rotation: 40 },
  { type: "grass", at: [0.3, 0, -1.25], scale: 0.9, rotation: 80 },
  { type: "grass", at: [-4.0, 0, -2.8], scale: 1.4, rotation: 0 },
  { type: "grass", at: [3.6, 0, -2.6], scale: 1.0, rotation: 0 },
  { type: "grass", at: [4.7, 0, -4.3], scale: 1.3, rotation: 0 },
];
