// Procedural stylized dog on a simple quadruped joint hierarchy.

import React from "react";
import { material } from "../materials";
import type { DogPose } from "./dogAnimations";
import type { DogLook } from "./presets";

type Props = { look: DogLook; pose: DogPose; position: [number, number, number]; yaw: number };

const UPPER = 0.16;
const LOWER = 0.16;
const BODY_Y = 0.39;

export const Dog: React.FC<Props> = ({ look, pose, position, yaw }) => {
  const fur = material(look.fur, { roughness: 1 });
  const dark = material(look.furDark, { roughness: 1 });
  const black = material("#1a1410", { roughness: 0.4 });
  const pink = material("#d9707a", { roughness: 0.5 });
  const width = 1 - look.thin * 0.22;
  const breathe = 1 + pose.breath * (0.03 + look.thin * 0.03);

  const leg = (x: number, z: number, swing: number, knee: number, front: boolean) => (
    <group position={[x, -0.04, z]} rotation={[swing, 0, 0]}>
      <mesh castShadow material={front ? fur : dark} position={[0, -UPPER / 2, 0]}>
        <capsuleGeometry args={[0.038, UPPER - 0.04, 4, 8]} />
      </mesh>
      <group position={[0, -UPPER, 0]} rotation={[front ? knee : -knee, 0, 0]}>
        <mesh castShadow material={fur} position={[0, -LOWER / 2, 0]}>
          <capsuleGeometry args={[0.03, LOWER - 0.03, 4, 8]} />
        </mesh>
        <mesh castShadow material={dark} position={[0, -LOWER, 0.02]} scale={[1, 0.6, 1.4]}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
      </group>
    </group>
  );

  return (
    <group position={position} rotation={[0, yaw, 0]} scale={look.size}>
      <group position={[0, BODY_Y + pose.bodyY, 0]} rotation={[pose.bodyPitch, 0, pose.bodyRoll]}>
        {/* torso */}
        <mesh castShadow material={fur} rotation={[Math.PI / 2, 0, 0]} scale={[width * breathe, 1, 0.92 * breathe]}>
          <capsuleGeometry args={[0.13, 0.4, 6, 14]} />
        </mesh>
        <mesh castShadow material={dark} position={[0, 0.07, -0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[width * 0.9, 1, 0.5]}>
          <capsuleGeometry args={[0.11, 0.3, 4, 10]} />
        </mesh>
        {/* starving dog: visible ribs */}
        {look.thin > 0.4 &&
          [-0.06, 0.0, 0.06].map((z) => (
            <mesh key={z} material={dark} position={[0, -0.02, z + 0.06]} scale={[width * breathe * 1.01, 0.92, 0.12]}>
              <torusGeometry args={[0.126, 0.006, 4, 16, Math.PI]} />
            </mesh>
          ))}

        {leg(0.08 * width, 0.22, pose.legFL, pose.kneeF, true)}
        {leg(-0.08 * width, 0.22, pose.legFR, pose.kneeF, true)}
        {leg(0.08 * width, -0.22, pose.legBL, pose.kneeB, false)}
        {leg(-0.08 * width, -0.22, pose.legBR, pose.kneeB, false)}

        {/* tail */}
        <group position={[0, 0.06, -0.33]} rotation={[-pose.tailPitch - 0.6, pose.tailYaw, 0]}>
          <mesh castShadow material={dark} position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.025, 0.2, 4, 8]} />
          </mesh>
        </group>

        {/* neck + head */}
        <group position={[0, 0.08, 0.3]} rotation={[pose.headPitch - 0.35, pose.headYaw, 0]}>
          <mesh castShadow material={fur} position={[0, 0.04, 0.02]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.065, 0.12, 4, 10]} />
          </mesh>
          <group position={[0, 0.12, 0.08]} rotation={[0.35, 0, 0]}>
            <mesh castShadow material={fur} scale={[0.9, 0.85, 1]}>
              <sphereGeometry args={[0.105, 16, 12]} />
            </mesh>
            {/* snout */}
            <mesh castShadow material={fur} position={[0, -0.025, 0.1]} scale={[0.7, 0.6, 1]}>
              <capsuleGeometry args={[0.05, 0.08, 4, 10]} />
            </mesh>
            <mesh castShadow material={black} position={[0, -0.01, 0.19]}>
              <sphereGeometry args={[0.022, 8, 6]} />
            </mesh>
            {/* jaw + tongue */}
            <group position={[0, -0.05, 0.06]} rotation={[pose.jaw * 0.45, 0, 0]}>
              <mesh castShadow material={dark} position={[0, -0.005, 0.06]} scale={[0.6, 0.3, 1]}>
                <capsuleGeometry args={[0.04, 0.06, 4, 8]} />
              </mesh>
              {pose.tongue > 0.05 && (
                <mesh material={pink} position={[0, -0.02 - pose.tongue * 0.03, 0.09 + pose.tongue * 0.02]} scale={[1, 0.25, 0.7 + pose.tongue * 0.6]}>
                  <sphereGeometry args={[0.03, 8, 6]} />
                </mesh>
              )}
            </group>
            {/* eyes */}
            {[1, -1].map((side) => (
              <mesh key={side} material={black} position={[side * 0.045, 0.02, 0.075]}>
                <sphereGeometry args={[0.012, 6, 6]} />
              </mesh>
            ))}
            {/* ears */}
            {[1, -1].map((side) => (
              <group key={side} position={[side * 0.055, 0.07, -0.02]} rotation={[0, 0, side * (0.25 + pose.earDroop * 0.9)]}>
                <mesh castShadow material={dark} position={[0, 0.045, 0]} scale={[1, 1, 0.35]}>
                  <coneGeometry args={[0.035, 0.09, 6]} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};
