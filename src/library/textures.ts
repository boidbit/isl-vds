// Procedurally generated textures (no image files needed). Deterministic.

import * as THREE from "three";

let ripple: THREE.DataTexture | null = null;

/** Tileable normal map of wind ripples in sand. */
export const sandRippleNormal = () => {
  if (ripple) return ripple;
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  const h = (u: number, v: number) =>
    Math.sin(Math.PI * 2 * (u * 9 + 0.55 * Math.sin(Math.PI * 2 * v * 2) + 0.12 * Math.sin(Math.PI * 2 * (u + v) * 3))) * 0.6 +
    Math.sin(Math.PI * 2 * (u * 23 + v * 4 + 0.2 * Math.sin(Math.PI * 2 * v * 5))) * 0.15;
  const e = 1 / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const dx = (h(u + e, v) - h(u - e, v)) / (2 * e);
      const dy = (h(u, v + e) - h(u, v - e)) / (2 * e);
      const n = new THREE.Vector3(-dx * 0.004, -dy * 0.004, 1).normalize();
      const i = (y * size + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  ripple = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  ripple.wrapS = ripple.wrapT = THREE.RepeatWrapping;
  ripple.magFilter = THREE.LinearFilter;
  ripple.minFilter = THREE.LinearMipmapLinearFilter;
  ripple.generateMipmaps = true;
  ripple.anisotropy = 8;
  ripple.needsUpdate = true;
  return ripple;
};

let soft: THREE.DataTexture | null = null;

/** Soft round sprite used for clouds, dust motes and glows. */
export const softDot = () => {
  if (soft) return soft;
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5;
      const dy = (y + 0.5) / size - 0.5;
      const r = Math.sqrt(dx * dx + dy * dy) * 2;
      const a = Math.max(0, 1 - r);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(Math.pow(a, 1.6) * 255);
    }
  }
  soft = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  soft.magFilter = THREE.LinearFilter;
  soft.minFilter = THREE.LinearMipmapLinearFilter;
  soft.generateMipmaps = true;
  soft.needsUpdate = true;
  return soft;
};
