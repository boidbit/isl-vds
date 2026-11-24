import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp, easeInOut, mulberry32 } from "../../engine/math";
import type { Prop } from "../../engine/schema";
import { material } from "../materials";
import { Khuff } from "./Khuff";

/** Old stone well. Hole is a dark disc: anything below y = 0 is hidden by the ground, so climbing down reads naturally. */
export const Well: React.FC = () => {
  const stones = useMemo(() => {
    const rnd = mulberry32(7);
    const out: { pos: [number, number, number]; rot: number; size: [number, number, number]; shade: number }[] = [];
    const rows = 4;
    for (let row = 0; row < rows; row++) {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const a = ((i + (row % 2) * 0.5) / count) * Math.PI * 2;
        const r = 0.92;
        out.push({
          pos: [Math.sin(a) * r, 0.11 + row * 0.2, Math.cos(a) * r],
          rot: a,
          size: [0.34 + rnd() * 0.06, 0.19 + rnd() * 0.03, 0.24 + rnd() * 0.05],
          shade: rnd(),
        });
      }
    }
    return out;
  }, []);
  const mats = ["#a8957a", "#9b876c", "#b5a388", "#8f7c63"].map((c) => material(c, { flat: true, roughness: 1 }));
  const inner = material("#3d3226", { side: THREE.BackSide, roughness: 1 });
  return (
    <group>
      {stones.map((s, i) => (
        <mesh key={i} castShadow receiveShadow position={s.pos} rotation={[0, s.rot, 0]} material={mats[Math.floor(s.shade * mats.length)]}>
          <boxGeometry args={s.size} />
        </mesh>
      ))}
      {/* inner wall + dark hole */}
      <mesh position={[0, 0.4, 0]} material={inner}>
        <cylinderGeometry args={[0.8, 0.8, 0.8, 24, 1, true]} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 24]} />
        <meshBasicMaterial color="#0b0805" />
      </mesh>
      {/* flat capstones on the rim */}
      <mesh castShadow receiveShadow position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material("#b8a78d", { flat: true })}>
        <ringGeometry args={[0.78, 1.1, 18, 1]} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.8, 0]} material={material("#a5937a", { flat: true })}>
        <cylinderGeometry args={[1.1, 1.1, 0.05, 18, 1, true]} />
      </mesh>
    </group>
  );
};

export const Rock: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const geo = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(0.5, 0);
    const rnd = mulberry32(seed);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const k = 0.75 + rnd() * 0.5;
      pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.7, pos.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
  return <mesh castShadow receiveShadow geometry={geo} position={[0, 0.15, 0]} material={material("#9c8467", { flat: true, roughness: 1 })} />;
};

export const Shrub: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const twigs = useMemo(() => {
    const rnd = mulberry32(seed * 31);
    return Array.from({ length: 9 }, () => ({ a: rnd() * Math.PI * 2, tilt: 0.4 + rnd() * 0.6, len: 0.3 + rnd() * 0.35 }));
  }, [seed]);
  const mat = material("#7a6a45", { roughness: 1 });
  const leaf = material("#6f7a45", { flat: true, roughness: 1 });
  return (
    <group>
      {twigs.map((t, i) => (
        <group key={i} rotation={[0, t.a, t.tilt]}>
          <mesh castShadow material={mat} position={[0, t.len / 2, 0]}>
            <cylinderGeometry args={[0.008, 0.015, t.len, 4]} />
          </mesh>
          {i % 3 === 0 && (
            <mesh castShadow material={leaf} position={[0, t.len, 0]}>
              <icosahedronGeometry args={[0.07, 0]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

/** Lone flat-topped acacia: the classic desert silhouette. */
export const Acacia: React.FC = () => {
  const bark = material("#5e4632", { flat: true });
  const leaves = material("#6c7440", { flat: true, roughness: 1 });
  const branches: [number, number, number, number][] = [
    [0.5, 0, 0.5, 1.4],
    [-0.6, 0.6, -0.4, 1.3],
    [0.2, 2.2, 0.6, 1.2],
  ];
  return (
    <group>
      <mesh castShadow material={bark} position={[0, 1.1, 0]} rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.1, 0.16, 2.2, 7]} />
      </mesh>
      {branches.map(([tilt, yaw, , len], i) => (
        <group key={i} position={[0, 2.0, 0]} rotation={[0, yaw, tilt]}>
          <mesh castShadow material={bark} position={[0, len / 2, 0]}>
            <cylinderGeometry args={[0.04, 0.08, len, 6]} />
          </mesh>
        </group>
      ))}
      {[
        [0, 3.25, 0, 2.2],
        [0.9, 3.05, 0.5, 1.4],
        [-0.9, 3.1, -0.3, 1.5],
        [0.2, 3.15, -0.9, 1.3],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} castShadow receiveShadow material={leaves} position={[x, y, z]} scale={[1, 0.28, 1]}>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  );
};

const Decal: React.FC<{ color: string; radius: number; opacity: number; roughness?: number; y?: number }> = ({
  color,
  radius,
  opacity,
  roughness = 1,
  y = 0.006,
}) => (
  <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow scale={[1, 0.7, 1]} material={material(color, { opacity, roughness })}>
    <circleGeometry args={[radius, 24]} />
  </mesh>
);

export const PropNode: React.FC<{ prop: Prop; time: number }> = ({ prop, time }) => {
  if (prop.appear !== undefined && time < prop.appear) return null;
  const grow = prop.appear !== undefined ? easeInOut(clamp((time - prop.appear) / 1.5)) : 1;
  let node: React.ReactNode = null;
  switch (prop.type) {
    case "well":
      node = <Well />;
      break;
    case "rock":
      node = <Rock seed={Math.round(prop.at[0] * 13 + prop.at[2] * 7)} />;
      break;
    case "shrub":
      node = <Shrub seed={Math.round(prop.at[0] * 5 + prop.at[2] * 3)} />;
      break;
    case "acacia":
      node = <Acacia />;
      break;
    case "wet-sand":
      node = <Decal color="#7d5a3a" radius={0.45} opacity={0.55} />;
      break;
    case "puddle":
      node = (
        <group scale={[grow, 1, grow]}>
          <Decal color="#6b4b31" radius={0.42} opacity={0.6} />
          <Decal color="#9cc3cf" radius={0.28} opacity={0.75} roughness={0.08} y={0.009} />
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
