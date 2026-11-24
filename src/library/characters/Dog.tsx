// Storybook saluki-type desert dog: slender, deep chest, tucked waist, long
// floppy ears, expressive eyes. Same pose interface as dogAnimations.ts (faces +Z).

import React, { useMemo } from "react";
import * as THREE from "three";
import { smoothstep } from "../../engine/math";
import { fur, glossy, matte, shade, skin } from "../style";
import type { DogPose } from "./dogAnimations";
import type { DogLook } from "./presets";

type Props = { look: DogLook; pose: DogPose; position: [number, number, number]; yaw: number };

const BODY_Y = 0.4;
const UPPER = 0.165;
const LOWER = 0.165;

const useDogGeometry = (thin: number) =>
  useMemo(() => {
    // Body as a lathe along the spine, then sculpted: deep chest, tucked belly.
    const profile: [number, number][] = [
      [0.0, -0.3],
      [0.06, -0.295],
      [0.098, -0.25],
      [0.108, -0.18],
      [0.092, -0.09],
      [0.095, 0.0],
      [0.12, 0.09],
      [0.135, 0.17],
      [0.128, 0.24],
      [0.09, 0.295],
      [0.0, 0.315],
    ];
    const body = new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(r, y)),
      36,
      0,
      Math.PI * 2,
    );
    body.rotateX(Math.PI / 2);
    const p = body.attributes.position;
    const width = 1 - thin * 0.18;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i);
      let y = p.getY(i);
      const z = p.getZ(i);
      if (y < 0) {
        const chest = smoothstep(-0.05, 0.18, z);
        const tuck = 1 - smoothstep(-0.2, -0.05, z) * (1 - smoothstep(-0.05, 0.08, z));
        y *= (1 + chest * 0.55) * (1 - (1 - tuck) * (0.25 + thin * 0.2));
      } else {
        y *= 0.9;
      }
      x *= width;
      p.setXYZ(i, x, y, z);
    }
    body.computeVertexNormals();

    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.05, -0.07),
      new THREE.Vector3(0, -0.12, -0.11),
      new THREE.Vector3(0, -0.18, -0.09),
      new THREE.Vector3(0, -0.2, -0.04),
    ]);
    const tail = new THREE.TubeGeometry(tailCurve, 24, 0.028, 10, false);
    // taper the tail
    const tp = tail.attributes.position;
    const center = new THREE.Vector3();
    for (let i = 0; i < tp.count; i++) {
      const ring = Math.floor(i / 11);
      const t = ring / 24;
      tailCurve.getPointAt(Math.min(1, t), center);
      const v = new THREE.Vector3(tp.getX(i), tp.getY(i), tp.getZ(i)).sub(center).multiplyScalar(1 - t * 0.65).add(center);
      tp.setXYZ(i, v.x, v.y, v.z);
    }
    tail.computeVertexNormals();

    // Long floppy ear: flattened, tapered teardrop.
    const ear = new THREE.SphereGeometry(0.05, 18, 14);
    const ep = ear.attributes.position;
    for (let i = 0; i < ep.count; i++) {
      const y = ep.getY(i);
      const t = (0.05 - y) / 0.1; // 0 top .. 1 bottom
      ep.setXYZ(i, ep.getX(i) * 0.28, y * 1.9 - 0.06, ep.getZ(i) * (0.75 + t * 0.35));
    }
    ear.computeVertexNormals();

    const snout = new THREE.LatheGeometry(
      [
        [0.0, 0.0],
        [0.03, 0.005],
        [0.04, 0.04],
        [0.05, 0.09],
        [0.058, 0.13],
        [0.0, 0.135],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      24,
    );
    snout.rotateX(-Math.PI / 2); // tip points +Z
    snout.translate(0, 0, 0.135);
    snout.scale(0.9, 0.8, 1);
    return { body, tail, ear, snout };
  }, [thin]);

export const Dog: React.FC<Props> = ({ look, pose, position, yaw }) => {
  const g = useDogGeometry(look.thin);
  const coat = fur(look.fur);
  const dark = fur(look.furDark);
  const light = fur(shade(look.fur, 1.12));
  const nose = glossy("#1d1410");
  const eye = glossy("#1a120c");
  const white = matte("#ffffff", 0.2, { emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.6 });
  const tongue = skin("#d8697a");
  const breathe = 1 + pose.breath * (0.025 + look.thin * 0.035);
  const width = 1 - look.thin * 0.18;

  const frontLeg = (x: number, swing: number) => (
    <group position={[x, -0.07, 0.2]} rotation={[swing, 0, 0]}>
      <mesh castShadow material={coat} position={[0, -UPPER / 2 + 0.03, 0]}>
        <cylinderGeometry args={[0.048, 0.026, UPPER + 0.04, 14]} />
      </mesh>
      <group position={[0, -UPPER, 0]} rotation={[pose.kneeF, 0, 0]}>
        <mesh castShadow material={coat}>
          <sphereGeometry args={[0.027, 12, 10]} />
        </mesh>
        <mesh castShadow material={coat} position={[0, -LOWER / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.019, LOWER, 12]} />
        </mesh>
        <mesh castShadow material={light} position={[0, -LOWER, 0.018]} scale={[1, 0.6, 1.45]}>
          <sphereGeometry args={[0.03, 14, 10]} />
        </mesh>
      </group>
    </group>
  );

  const backLeg = (x: number, swing: number) => (
    <group position={[x, -0.03, -0.21]} rotation={[swing, 0, 0]}>
      {/* haunch */}
      <mesh castShadow material={coat} position={[0, -0.02, 0.0]} scale={[0.6, 1.05, 0.95]}>
        <sphereGeometry args={[0.07, 18, 14]} />
      </mesh>
      <mesh castShadow material={coat} position={[0, -UPPER / 2, 0.02]} rotation={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.025, UPPER + 0.03, 14]} />
      </mesh>
      <group position={[0, -UPPER, 0.04]} rotation={[-pose.kneeB + 0.35, 0, 0]}>
        <mesh castShadow material={coat}>
          <sphereGeometry args={[0.027, 12, 10]} />
        </mesh>
        <mesh castShadow material={coat} position={[0, -LOWER / 2, 0]}>
          <cylinderGeometry args={[0.024, 0.018, LOWER, 12]} />
        </mesh>
        <group position={[0, -LOWER, 0]} rotation={[-0.35, 0, 0]}>
          <mesh castShadow material={light} position={[0, -0.005, 0.018]} scale={[1, 0.6, 1.45]}>
            <sphereGeometry args={[0.03, 14, 10]} />
          </mesh>
        </group>
      </group>
    </group>
  );

  const earAngle = 0.05 + pose.earDroop * 0.12;
  // Neck carries most of the head drop so the muzzle can reach the ground when drinking.
  const neckPitch = 0.6 + (pose.headPitch > 0 ? pose.headPitch * 1.6 : pose.headPitch * 0.8);
  const headPitch = pose.headPitch - neckPitch;

  return (
    <group position={position} rotation={[0, yaw, 0]} scale={look.size}>
      <group position={[0, BODY_Y + pose.bodyY, 0]} rotation={[pose.bodyPitch, 0, pose.bodyRoll]}>
        <mesh castShadow receiveShadow material={coat} geometry={g.body} scale={[breathe, breathe, 1]} />
        {/* lighter chest and belly */}
        <mesh material={light} position={[0, -0.12, 0.18]} scale={[0.75 * width, 0.9, 0.9]}>
          <sphereGeometry args={[0.1, 18, 14]} />
        </mesh>

        {frontLeg(0.065 * width, pose.legFL)}
        {frontLeg(-0.065 * width, pose.legFR)}
        {backLeg(0.07 * width, pose.legBL)}
        {backLeg(-0.07 * width, pose.legBR)}

        <group position={[0, 0.03, -0.29]} rotation={[-pose.tailPitch + 0.4, pose.tailYaw, 0]}>
          <mesh castShadow material={coat} geometry={g.tail} />
        </group>

        {/* neck */}
        <group position={[0, 0.04, 0.24]} rotation={[neckPitch, pose.headYaw * 0.5, 0]}>
          <mesh castShadow material={coat} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.05, 0.075, 0.2, 18]} />
          </mesh>
          <mesh castShadow material={coat} position={[0, -0.01, -0.01]} scale={[1, 0.9, 1.1]}>
            <sphereGeometry args={[0.08, 18, 14]} />
          </mesh>
          {/* head */}
          <group position={[0, 0.2, 0.01]} rotation={[headPitch, pose.headYaw * 0.5, 0]}>
            <mesh castShadow material={coat} scale={[0.92, 0.9, 1.05]}>
              <sphereGeometry args={[0.092, 28, 20]} />
            </mesh>
            <mesh castShadow material={coat} geometry={g.snout} position={[0, -0.02, -0.035]} />
            {/* muzzle shading */}
            <mesh material={dark} position={[0, -0.01, 0.135]} scale={[0.75, 0.6, 0.9]}>
              <sphereGeometry args={[0.04, 16, 12]} />
            </mesh>
            <mesh castShadow material={nose} position={[0, -0.0, 0.155]} scale={[1.2, 0.85, 0.9]}>
              <sphereGeometry args={[0.018, 14, 10]} />
            </mesh>
            {/* jaw + tongue */}
            <group position={[0, -0.042, 0.04]} rotation={[pose.jaw * 0.38, 0, 0]}>
              <mesh castShadow material={coat} position={[0, 0, 0.055]} scale={[0.62, 0.32, 1]}>
                <capsuleGeometry args={[0.035, 0.07, 6, 10]} />
              </mesh>
              {pose.tongue > 0.05 && (
                <mesh castShadow material={tongue} position={[0, -0.012 - pose.tongue * 0.03, 0.09 + pose.tongue * 0.015]} rotation={[0.9 * pose.tongue, 0, 0]} scale={[1, 0.3, 0.8 + pose.tongue * 0.7]}>
                  <sphereGeometry args={[0.024, 14, 10]} />
                </mesh>
              )}
            </group>
            {/* eyes with a highlight, soft brows */}
            {[1, -1].map((side) => (
              <group key={side} position={[side * 0.038, 0.022, 0.066]} rotation={[0, side * 0.35, 0]}>
                <mesh material={eye} scale={[1, 0.95 - pose.earDroop * 0.15, 0.7]}>
                  <sphereGeometry args={[0.014, 14, 10]} />
                </mesh>
                <mesh material={white} position={[side * 0.004, 0.005, 0.009]}>
                  <sphereGeometry args={[0.0035, 8, 6]} />
                </mesh>
                <mesh material={light} position={[0, 0.018, -0.002]} rotation={[0, 0, side * (0.25 + pose.earDroop * 0.3)]} scale={[1.4, 0.4, 0.6]}>
                  <sphereGeometry args={[0.012, 10, 8]} />
                </mesh>
              </group>
            ))}
            {/* ears */}
            {[1, -1].map((side) => (
              <group key={side} position={[side * 0.07, 0.04, -0.03]} rotation={[-(pose.headPitch + pose.bodyPitch) + 0.15, 0, 0]}>
                <group rotation={[0, side * 0.15, side * earAngle]}>
                  <mesh castShadow material={dark} geometry={g.ear} />
                </group>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};
