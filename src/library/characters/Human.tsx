// Procedural, faceless, stylized human built from primitives on a simple joint
// hierarchy (hips -> spine -> neck/head, shoulders -> elbows, hips -> knees).
// One base model + a HumanLook preset = any number of distinct characters.

import React from "react";
import * as THREE from "three";
import { material } from "../materials";
import { Khuff, WaterStream } from "../props/Khuff";
import type { HumanPose } from "./humanAnimations";
import type { HumanLook } from "./presets";

const BASE_HEIGHT = 1.76;
const THIGH = 0.43;
const SHIN = 0.41;
const FOOT = 0.04;
const HIP_Y = THIGH + SHIN + FOOT;

export type HeldProp = { prop: "khuff"; slot: "rightHand" | "leftHand" | "mouth"; pour?: boolean };

type Props = {
  look: HumanLook;
  pose: HumanPose;
  position: [number, number, number];
  yaw: number;
  held?: HeldProp;
  time: number;
};

const Limb: React.FC<{ length: number; radiusTop: number; radiusBottom: number; mat: THREE.Material }> = ({
  length,
  radiusTop,
  radiusBottom,
  mat,
}) => (
  <mesh castShadow material={mat} position={[0, -length / 2, 0]}>
    <cylinderGeometry args={[radiusTop, radiusBottom, length, 12]} />
  </mesh>
);

const Head: React.FC<{ look: HumanLook }> = ({ look }) => {
  const skin = material(look.skin, { roughness: 0.75 });
  const hw = material(look.headwearColor, { roughness: 0.95 });
  const band = material(look.headband);
  const beard = material(look.beardColor, { roughness: 1 });
  const hair = material(look.beard === "none" ? "#2a1d14" : look.beardColor, { roughness: 1 });
  const skinShade = material(new THREE.Color(look.skin).multiplyScalar(0.92).getStyle(), { roughness: 0.75 });
  const beardSize = { none: 0, short: 0.6, full: 0.85, long: 1.15 }[look.beard];

  return (
    <group>
      <mesh castShadow material={skin} position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.09, 10]} />
      </mesh>
      <mesh castShadow material={skin} position={[0, 0.165, 0.005]} scale={[0.92, 1.08, 1]}>
        <sphereGeometry args={[0.105, 20, 16]} />
      </mesh>
      {/* Hair covers the back of the head so front and back read clearly on a faceless head. */}
      <mesh castShadow material={hair} position={[0, 0.17, -0.004]} scale={[0.95, 1.1, 1.04]}>
        <sphereGeometry args={[0.106, 20, 12, Math.PI, Math.PI, 0, Math.PI * 0.72]} />
      </mesh>
      {/* Simple nose and brow ridge: no eyes or mouth, but the face has a direction. */}
      <mesh castShadow material={skinShade} position={[0, 0.158, 0.108]} rotation={[0.35, 0, 0]} scale={[0.8, 1, 1]}>
        <coneGeometry args={[0.02, 0.06, 8]} />
      </mesh>
      <mesh castShadow material={skin} position={[0, 0.195, 0.082]} scale={[1, 0.3, 0.45]}>
        <sphereGeometry args={[0.06, 12, 8]} />
      </mesh>
      {beardSize > 0 && (
        <group>
          {/* jaw-line beard: a U-shaped band hugging the lower front of the head, framing the face */}
          <mesh castShadow material={beard} position={[0, 0.165, 0.008]} scale={[0.95, 1.1, 1.03]}>
            <sphereGeometry args={[0.107, 20, 12, Math.PI * 0.04, Math.PI * 0.92, Math.PI * 0.64, Math.PI * 0.32]} />
          </mesh>
          <mesh castShadow material={beard} position={[0, 0.09 - beardSize * 0.02, 0.06]} scale={[0.9, 0.6 + beardSize * 0.45, 0.75]}>
            <sphereGeometry args={[0.055, 14, 10]} />
          </mesh>
          {/* moustache */}
          <mesh castShadow material={beard} position={[0, 0.122, 0.1]} scale={[1, 0.28, 0.45]}>
            <sphereGeometry args={[0.035, 10, 6]} />
          </mesh>
        </group>
      )}
      {look.headwear === "turban" && (
        <group position={[0, 0.215, -0.005]}>
          <mesh castShadow material={hw} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.088, 0.045, 10, 20]} />
          </mesh>
          <mesh castShadow material={hw} position={[0, 0.035, 0]} scale={[1, 0.75, 1]}>
            <sphereGeometry args={[0.1, 16, 12]} />
          </mesh>
          <mesh castShadow material={band} position={[0, 0.0, 0]} rotation={[Math.PI / 2 + 0.25, 0, 0]}>
            <torusGeometry args={[0.1, 0.012, 6, 20]} />
          </mesh>
          {/* loose tail of cloth behind */}
          <mesh castShadow material={hw} position={[0.04, -0.12, -0.1]} rotation={[0.25, 0, 0.1]}>
            <boxGeometry args={[0.07, 0.2, 0.015]} />
          </mesh>
        </group>
      )}
      {look.headwear === "keffiyeh" && (
        <group position={[0, 0.2, -0.005]}>
          <mesh castShadow material={hw} position={[0, -0.12, -0.01]}>
            <cylinderGeometry args={[0.115, 0.17, 0.3, 16, 1, true, Math.PI * 0.12, Math.PI * 1.76]} />
          </mesh>
          <mesh castShadow material={hw} position={[0, 0.0, 0]} scale={[1, 0.6, 1]}>
            <sphereGeometry args={[0.117, 16, 10]} />
          </mesh>
          <mesh castShadow material={band} position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.1, 0.014, 6, 20]} />
          </mesh>
        </group>
      )}
      {look.headwear === "cap" && (
        <mesh castShadow material={hw} position={[0, 0.195, 0]}>
          <sphereGeometry args={[0.109, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        </mesh>
      )}
    </group>
  );
};

export const Human: React.FC<Props> = ({ look, pose, position, yaw, held, time }) => {
  const s = look.height / BASE_HEIGHT;
  const b = look.build;
  const robe = material(look.robe);
  const trim = material(look.robeTrim);
  const skin = material(look.skin, { roughness: 0.75 });
  const cloak = look.cloak ? material(look.cloak, { side: THREE.DoubleSide }) : null;
  const sash = look.sash ? material(look.sash) : null;
  const sandal = material("#4b3322");

  const breathScale = 1 + pose.breath * 0.035;
  const skirtSwing = (pose.lHip + pose.rHip) * 0.25;
  const skirtSpread = Math.abs(pose.lHip - pose.rHip) * 0.25;

  // Accumulated forward rotation down to each slot; used to keep held objects hanging naturally.
  const handPitch = (shoulder: number, elbow: number) => pose.spine + shoulder + elbow;

  const heldNode = (slot: HeldProp["slot"], pitch: number) =>
    held && held.slot === slot ? (
      <group rotation={[-pitch, 0, 0]}>
        <group position={slot === "mouth" ? [0, -0.02, 0.02] : [0, 0.02, 0]} rotation={[held.pour ? 1.9 : 0, 0, 0]}>
          <Khuff wet />
          {held.pour && (
            <group rotation={[-1.9, 0, 0]} position={[0, 0, 0.0]}>
              <WaterStream time={time} length={0.5} />
            </group>
          )}
        </group>
      </group>
    ) : null;

  const arm = (side: 1 | -1) => {
    const shoulder = side === 1 ? pose.lShoulder : pose.rShoulder;
    const out = side === 1 ? pose.lArmOut : pose.rArmOut;
    const elbow = side === 1 ? pose.lElbow : pose.rElbow;
    const slot = side === 1 ? "leftHand" : "rightHand";
    return (
      <group position={[side * 0.2 * b, 0.5, 0]} rotation={[shoulder, 0, side * out]}>
        <mesh castShadow material={robe} position={[0, 0.0, 0]}>
          <sphereGeometry args={[0.062 * b, 12, 10]} />
        </mesh>
        <Limb length={0.3} radiusTop={0.058 * b} radiusBottom={0.052 * b} mat={robe} />
        <group position={[0, -0.3, 0]} rotation={[elbow, 0, 0]}>
          <mesh castShadow material={robe}>
            <sphereGeometry args={[0.052 * b, 10, 8]} />
          </mesh>
          <Limb length={0.24} radiusTop={0.05 * b} radiusBottom={0.058 * b} mat={robe} />
          <mesh castShadow material={trim} position={[0, -0.235, 0]}>
            <cylinderGeometry args={[0.06 * b, 0.06 * b, 0.02, 12]} />
          </mesh>
          <mesh castShadow material={skin} position={[0, -0.28, 0.005]} scale={[0.85, 1.1, 0.6]}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
          <group position={[0, -0.3, 0.01]}>{heldNode(slot, handPitch(shoulder, elbow))}</group>
        </group>
      </group>
    );
  };

  const leg = (side: 1 | -1) => {
    const hip = side === 1 ? pose.lHip : pose.rHip;
    const knee = side === 1 ? pose.lKnee : pose.rKnee;
    return (
      <group position={[side * 0.085 * b, 0, 0]} rotation={[hip, 0, 0]}>
        <Limb length={THIGH} radiusTop={0.075 * b} radiusBottom={0.055 * b} mat={robe} />
        <group position={[0, -THIGH, 0]} rotation={[knee, 0, 0]}>
          <Limb length={SHIN} radiusTop={0.05 * b} radiusBottom={0.04} mat={skin} />
          <mesh castShadow material={sandal} position={[0, -SHIN - FOOT / 2, 0.04]}>
            <boxGeometry args={[0.08, FOOT, 0.22]} />
          </mesh>
        </group>
      </group>
    );
  };

  return (
    <group position={position} rotation={[0, yaw, 0]} scale={s}>
      <group position={[0, HIP_Y + pose.bodyY, 0]}>
        {leg(1)}
        {leg(-1)}

        {/* Lower robe: a flared skirt that sways with the stride. */}
        <group rotation={[skirtSwing, 0, 0]} scale={[1 + skirtSpread, 1, 1 + skirtSpread]}>
          <mesh castShadow material={robe} position={[0, -0.36, 0]}>
            <cylinderGeometry args={[0.19 * b, 0.29 * b, 0.74, 18, 1, true]} />
          </mesh>
          <mesh castShadow material={trim} position={[0, -0.72, 0]}>
            <cylinderGeometry args={[0.293 * b, 0.295 * b, 0.04, 18, 1, true]} />
          </mesh>
          {cloak && (
            <mesh castShadow material={cloak} position={[0, -0.27, -0.012]}>
              <cylinderGeometry args={[0.215 * b, 0.3 * b, 0.6, 20, 1, true, Math.PI * 0.3, Math.PI * 1.4]} />
            </mesh>
          )}
        </group>

        <group rotation={[pose.spine, pose.spineTwist, pose.spineSide]}>
          <mesh castShadow material={robe} position={[0, 0.26, 0]} scale={[breathScale, 1, breathScale]}>
            <cylinderGeometry args={[0.205 * b, 0.185 * b, 0.52, 18]} />
          </mesh>
          <mesh castShadow material={robe} position={[0, 0.52, 0]} scale={[1, 0.45, 0.8]}>
            <sphereGeometry args={[0.21 * b, 16, 10]} />
          </mesh>
          {sash && (
            <mesh castShadow material={sash} position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.195 * b, 0.19 * b, 0.07, 18]} />
            </mesh>
          )}
          {cloak && (
            <mesh castShadow material={cloak} position={[0, 0.25, -0.012]}>
              <cylinderGeometry args={[0.215 * b, 0.215 * b, 0.56, 20, 1, true, Math.PI * 0.3, Math.PI * 1.4]} />
            </mesh>
          )}
          {arm(1)}
          {arm(-1)}
          <group position={[0, 0.58, 0.01]} rotation={[pose.neck, pose.headTurn, pose.headTilt]}>
            <Head look={look} />
            <group position={[0, 0.1, 0.11]}>{heldNode("mouth", pose.spine + pose.neck)}</group>
          </group>
        </group>
      </group>
    </group>
  );
};
