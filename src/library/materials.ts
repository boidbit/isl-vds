import { useMemo } from "react";
import * as THREE from "three";

const cache = new Map<string, THREE.MeshStandardMaterial>();

/** Shared, cached stylized material (soft, matte, slightly warm). */
export const material = (
  color: string,
  opts: { roughness?: number; flat?: boolean; opacity?: number; side?: THREE.Side; emissive?: string } = {},
) => {
  const key = JSON.stringify([color, opts]);
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.9,
      metalness: 0,
      flatShading: opts.flat ?? false,
      transparent: opts.opacity !== undefined,
      opacity: opts.opacity ?? 1,
      side: opts.side ?? THREE.FrontSide,
      emissive: opts.emissive ?? "#000000",
      depthWrite: opts.opacity === undefined,
    });
    cache.set(key, m);
  }
  return m;
};

export const useMaterial = (color: string, opts?: Parameters<typeof material>[1]) =>
  useMemo(() => material(color, opts), [color, JSON.stringify(opts)]);
