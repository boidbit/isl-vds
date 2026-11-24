import React, { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "../../engine/math";
import type { EnvironmentPreset } from "../environments";
import { softDot } from "../textures";

const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 top;
  uniform vec3 horizon;
  uniform vec3 sunDir;
  uniform vec3 glow;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(horizon, top, pow(h, 0.5));
    float s = max(dot(d, normalize(sunDir)), 0.0);
    // wide warm halo + tighter glow around the sun
    col = mix(col, glow, pow(s, 6.0) * 0.55);
    col += glow * (pow(s, 48.0) * 0.6 + pow(s, 600.0) * 1.2);
    // haze band just above the horizon
    col = mix(col, horizon * 1.04, smoothstep(0.18, 0.0, d.y) * 0.5);
    col = mix(col, horizon, smoothstep(0.0, -0.06, d.y));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/** A few soft, painterly cloud banks made of overlapping sprites. */
const Clouds: React.FC<{ env: EnvironmentPreset }> = ({ env }) => {
  const puffs = useMemo(() => {
    const rnd = mulberry32(42);
    const out: { pos: [number, number, number]; scale: [number, number, number]; opacity: number }[] = [];
    for (let c = 0; c < 9; c++) {
      const a = rnd() * Math.PI * 2;
      const r = 300 + rnd() * 80;
      const y = 45 + rnd() * 70;
      const n = 5 + Math.floor(rnd() * 5);
      for (let i = 0; i < n; i++) {
        const off = (i - n / 2) * (10 + rnd() * 8);
        const pa = a + off / r;
        const w = 40 + rnd() * 40;
        out.push({
          pos: [Math.sin(pa) * r, y + (rnd() - 0.3) * 10, Math.cos(pa) * r],
          scale: [w, w * (0.35 + rnd() * 0.25), 1],
          opacity: 0.35 + rnd() * 0.35,
        });
      }
    }
    return out;
  }, []);
  const tex = softDot();
  return (
    <group>
      {puffs.map((p, i) => (
        <sprite key={i} position={p.pos} scale={p.scale}>
          <spriteMaterial map={tex} color={env.cloud} opacity={p.opacity} transparent depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  );
};

export const Sky: React.FC<{ env: EnvironmentPreset }> = ({ env }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color(env.skyTop) },
          horizon: { value: new THREE.Color(env.skyHorizon) },
          sunDir: { value: new THREE.Vector3(...env.sunPosition).normalize() },
          glow: { value: new THREE.Color(env.sunGlow) },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      }),
    [env],
  );
  const sun = new THREE.Vector3(...env.sunPosition).normalize().multiplyScalar(440);
  return (
    <group>
      <mesh material={mat} renderOrder={-1}>
        <sphereGeometry args={[480, 48, 24]} />
      </mesh>
      <mesh position={sun.toArray()}>
        <sphereGeometry args={[7, 24, 16]} />
        <meshBasicMaterial color={env.discColor} fog={false} toneMapped={false} />
      </mesh>
      <Clouds env={env} />
    </group>
  );
};
