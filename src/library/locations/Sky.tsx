import React, { useMemo } from "react";
import * as THREE from "three";
import type { EnvironmentPreset } from "../environments";

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
  uniform vec3 sunColor;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    vec3 col = mix(horizon, top, pow(h, 0.55));
    float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
    col += sunColor * (pow(s, 8.0) * 0.25 + pow(s, 64.0) * 0.35);
    // below horizon: settle into horizon haze
    col = mix(col, horizon, smoothstep(0.0, -0.08, vDir.y));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

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
          sunColor: { value: new THREE.Color(env.discColor) },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      }),
    [env],
  );
  const sunDir = new THREE.Vector3(...env.sunPosition).normalize().multiplyScalar(420);
  return (
    <group>
      <mesh material={mat} renderOrder={-1}>
        <sphereGeometry args={[480, 32, 16]} />
      </mesh>
      <mesh position={sunDir.toArray()}>
        <sphereGeometry args={[9, 20, 12]} />
        <meshBasicMaterial color={env.discColor} fog={false} toneMapped={false} />
      </mesh>
    </group>
  );
};
