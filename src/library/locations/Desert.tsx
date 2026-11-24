import React, { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "../../engine/math";
import type { Prop } from "../../engine/schema";
import type { EnvironmentPreset } from "../environments";
import { PropNode } from "../props/Props";
import { PLAY_RADIUS, desertHeight } from "./terrain";

const useTerrain = () =>
  useMemo(() => {
    const size = 420;
    const seg = 200;
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = desertHeight(x, z);
      pos.setY(i, h);
      // Grayscale variation; the environment tints it through material colour.
      const v = 0.9 + Math.sin(x * 0.7 + z * 0.3) * 0.025 + Math.sin(x * 0.13 - z * 0.21) * 0.04 + Math.min(h, 10) * 0.008;
      colors[i * 3] = v;
      colors[i * 3 + 1] = v * 0.985;
      colors[i * 3 + 2] = v * 0.96;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

/** Rocks and shrubs scattered deterministically outside the play area. */
const useScatter = (seed: number) =>
  useMemo(() => {
    const rnd = mulberry32(seed);
    const items: Prop[] = [];
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2;
      const r = PLAY_RADIUS * 0.85 + rnd() * 55;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      items.push({
        type: rnd() < 0.45 ? "rock" : "shrub",
        at: [x, desertHeight(x, z), z],
        scale: 0.5 + rnd() * (r > 25 ? 2.2 : 0.9),
        rotation: rnd() * 360,
      });
    }
    return items;
  }, [seed]);

export const Desert: React.FC<{ env: EnvironmentPreset; seed?: number }> = ({ env, seed = 3 }) => {
  const geo = useTerrain();
  const scatter = useScatter(seed);
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial vertexColors color={env.groundTint} roughness={1} metalness={0} />
      </mesh>
      {scatter.map((p, i) => (
        <PropNode key={i} prop={p} time={0} />
      ))}
    </group>
  );
};

/** Fixed layout of the "registan-kuan" location: the well and its surroundings. */
export const WELL_LAYOUT: Prop[] = [
  { type: "well", at: [0, 0, 0], scale: 1, rotation: 0 },
  { type: "acacia", at: [-4.5, 0, -3.2], scale: 1, rotation: 30 },
  { type: "rock", at: [1.6, 0, -1.1], scale: 0.6, rotation: 10 },
  { type: "rock", at: [-1.4, 0, 1.3], scale: 0.45, rotation: 70 },
  { type: "shrub", at: [-3.6, 0, -2.1], scale: 1, rotation: 0 },
  { type: "shrub", at: [3.4, 0, -3.8], scale: 1.2, rotation: 0 },
];
