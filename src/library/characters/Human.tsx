// Storybook-style procedural human. Faceless (nose + beard only), rounded
// silhouettes built from lathe profiles, flowing robe with fabric folds,
// bell sleeves and a wrapped turban. Same joint hierarchy as the animation
// clips in humanAnimations.ts (character faces +Z).

import React, { useMemo } from "react";
import * as THREE from "three";
import { Khuff, WaterStream } from "../props/Khuff";
import { cloth, latheWithFolds, matte, shade, skin as skinMat } from "../style";
import type { HumanPose } from "./humanAnimations";
import type { HumanLook } from "./presets";

const BASE_HEIGHT = 1.76;
const THIGH = 0.42;
const SHIN = 0.4;
const FOOT = 0.04;
const HIP_Y = THIGH + SHIN + FOOT;
const HEAD_R = 0.122;

export type HeldProp = { prop: "khuff"; slot: "rightHand" | "leftHand" | "mouth"; pour?: boolean };

type Props = {
  look: HumanLook;
  pose: HumanPose;
  position: [number, number, number];
  yaw: number;
  held?: HeldProp;
  time: number;
};

/** Geometry shared by every human with the same build (memoised per build). */
const useBodyGeometry = (build: number) =>
  useMemo(() => {
    const b = build;
    const torso = latheWithFolds(
      [
        [0.0, -0.02],
        [0.19 * b, -0.02],
        [0.2 * b, 0.1],
        [0.212 * b, 0.28],
        [0.205 * b, 0.4],
        [0.175 * b, 0.49],
        [0.11, 0.55],
        [0.055, 0.585],
        [0.0, 0.59],
      ],
      { segments: 36 },
    );
    const skirt = latheWithFolds(
      [
        [0.185 * b, 0.06],
        [0.198 * b, -0.05],
        [0.215 * b, -0.25],
        [0.245 * b, -0.48],
        [0.285 * b, -0.7],
        [0.31 * b, -0.8],
        [0.3 * b, -0.815],
        [0.27 * b, -0.8],
      ],
      { segments: 48, folds: 9, foldDepth: 0.1, seed: 1.3 },
    );
    // Open-front cloak (bisht): back and sides only.
    const cloakUpper = latheWithFolds(
      [
        [0.13, 0.555],
        [0.205 * b, 0.5],
        [0.228 * b, 0.4],
        [0.232 * b, 0.2],
        [0.235 * b, 0.0],
      ],
      { segments: 32, phiStart: Math.PI * 0.32, phiLength: Math.PI * 1.36 },
    );
    const cloakLower = latheWithFolds(
      [
        [0.235 * b, 0.06],
        [0.25 * b, -0.2],
        [0.285 * b, -0.48],
        [0.33 * b, -0.74],
      ],
      { segments: 40, folds: 7, foldDepth: 0.12, phiStart: Math.PI * 0.3, phiLength: Math.PI * 1.4, seed: 2.1 },
    );
    const sleeveUpper = latheWithFolds(
      [
        [0.0, 0.03],
        [0.06 * b, 0.01],
        [0.062 * b, -0.14],
        [0.064 * b, -0.29],
      ],
      { segments: 18 },
    );
    const sleeveBell = latheWithFolds(
      [
        [0.06 * b, 0.02],
        [0.068 * b, -0.08],
        [0.085 * b, -0.18],
        [0.1 * b, -0.245],
        [0.094 * b, -0.255],
      ],
      { segments: 22, folds: 5, foldDepth: 0.12 },
    );
    // Kneeling: the robe settles into a soft mound over the folded legs.
    const drape = latheWithFolds(
      [
        [0.1 * b, 0.16],
        [0.165 * b, 0.1],
        [0.215 * b, 0.0],
        [0.26 * b, -0.12],
        [0.295 * b, -0.25],
        [0.318 * b, -0.36],
        [0.328 * b, -0.425],
        [0.318 * b, -0.44],
        [0.27 * b, -0.445],
      ],
      { segments: 48, folds: 8, foldDepth: 0.14, seed: 0.7 },
    );
    const sashBand = latheWithFolds(
      [
        [0.204 * b, -0.02],
        [0.21 * b, 0.0],
        [0.21 * b, 0.035],
        [0.204 * b, 0.055],
      ],
      { segments: 36 },
    );
    return { torso, skirt, cloakUpper, cloakLower, sleeveUpper, sleeveBell, drape, sashBand };
  }, [build]);

const useHeadGeometry = () =>
  useMemo(() => {
    // Turban tail: a bent strip of cloth hanging down the back.
    const tail = new THREE.PlaneGeometry(0.085, 0.3, 1, 10);
    const pos = tail.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (0.15 - y) / 0.3; // 0 top .. 1 bottom
      pos.setZ(i, -Math.sin(t * 1.2) * 0.06 + t * t * 0.02);
      pos.setX(i, pos.getX(i) * (1 - t * 0.25));
    }
    tail.computeVertexNormals();
    const beard = latheWithFolds(
      [
        [0.0, -0.075],
        [0.035, -0.07],
        [0.07, -0.045],
        [0.098, -0.005],
        [0.112, 0.03],
        [0.118, 0.05],
      ],
      { segments: 24, phiStart: -Math.PI * 0.5, phiLength: Math.PI },
    );
    return { tail, beard };
  }, []);

const Head: React.FC<{ look: HumanLook }> = ({ look }) => {
  const { tail } = useHeadGeometry();
  const sk = skinMat(look.skin);
  const skShade = skinMat(shade(look.skin, 0.93));
  const hw = cloth(look.headwearColor);
  const hwSide = cloth(look.headwearColor, THREE.DoubleSide);
  const band = cloth(look.headband);
  const beardMat = cloth(shade(look.beardColor, 1.35));
  const beardScale = { none: 0, short: 0.75, full: 1, long: 1.3 }[look.beard];

  return (
    <group>
      <mesh castShadow material={sk} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.048, 0.056, 0.1, 16]} />
      </mesh>
      <group position={[0, 0.19, 0]}>
        <mesh castShadow material={sk} scale={[0.9, 1.06, 0.98]}>
          <sphereGeometry args={[HEAD_R, 32, 24]} />
        </mesh>
        {/* hair at the back of the head (below the turban), never on the face */}
        <mesh castShadow material={cloth("#3b2a20")} scale={[0.93, 1.08, 1.0]} position={[0, 0, -0.006]}>
          <sphereGeometry args={[HEAD_R * 1.015, 28, 14, Math.PI * 1.12, Math.PI * 0.76, Math.PI * 0.28, Math.PI * 0.42]} />
        </mesh>
        {/* soft nose + brow: the face has a direction but no eyes or mouth */}
        <mesh castShadow material={skShade} position={[0, -0.012, HEAD_R * 0.97]} rotation={[0.5, 0, 0]} scale={[0.85, 1, 0.9]}>
          <capsuleGeometry args={[0.017, 0.028, 6, 12]} />
        </mesh>
        <mesh castShadow material={sk} position={[0, 0.035, HEAD_R * 0.8]} scale={[1.15, 0.32, 0.5]}>
          <sphereGeometry args={[0.065, 20, 12]} />
        </mesh>
        {beardScale > 0 && (
          <group>
            {/* jaw beard: an ellipsoid hugging the chin and cheeks, below the nose */}
            <mesh castShadow material={beardMat} position={[0, -0.072, 0.042]} scale={[1.0, 0.62 + beardScale * 0.25, 0.85]}>
              <sphereGeometry args={[0.088, 24, 18]} />
            </mesh>
            <mesh castShadow material={beardMat} position={[0, -0.112 - beardScale * 0.02, 0.07]} scale={[0.8, 0.7 + beardScale * 0.35, 0.75]}>
              <sphereGeometry args={[0.05, 18, 14]} />
            </mesh>
            {/* moustache */}
            <mesh castShadow material={beardMat} position={[0, -0.044, 0.108]} rotation={[0.3, 0, 0]} scale={[1.3, 0.34, 0.5]}>
              <sphereGeometry args={[0.03, 16, 8]} />
            </mesh>
          </group>
        )}
        {look.headwear === "turban" && (
          <group position={[0, 0.055, -0.006]}>
            {/* wrapped layers */}
            {[
              { y: 0.0, r: 0.112, tube: 0.04, tilt: 0.18 },
              { y: 0.04, r: 0.106, tube: 0.038, tilt: -0.14 },
              { y: 0.075, r: 0.092, tube: 0.034, tilt: 0.1 },
            ].map((l, i) => (
              <mesh key={i} castShadow material={hw} position={[0, l.y, 0]} rotation={[Math.PI / 2 + l.tilt, 0, l.tilt * 0.5]}>
                <torusGeometry args={[l.r, l.tube, 14, 36]} />
              </mesh>
            ))}
            <mesh castShadow material={hw} position={[0, 0.07, 0]} scale={[1, 0.62, 1]}>
              <sphereGeometry args={[0.1, 24, 16]} />
            </mesh>
            <mesh castShadow material={band} position={[0, 0.018, 0]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
              <torusGeometry args={[0.135, 0.009, 8, 40]} />
            </mesh>
            <mesh castShadow geometry={tail} material={hwSide} position={[0.03, -0.17, -0.12]} rotation={[0.08, 0.25, 0.06]} />
          </group>
        )}
        {look.headwear === "keffiyeh" && (
          <group position={[0, 0.03, 0]}>
            <mesh castShadow material={hwSide} position={[0, -0.12, -0.01]}>
              <latheGeometry
                args={[
                  [
                    new THREE.Vector2(0.13, 0.12),
                    new THREE.Vector2(0.14, 0.02),
                    new THREE.Vector2(0.16, -0.1),
                    new THREE.Vector2(0.2, -0.2),
                  ],
                  28,
                  Math.PI * 0.18,
                  Math.PI * 1.64,
                ]}
              />
            </mesh>
            <mesh castShadow material={hw} scale={[1, 0.62, 1]} position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.132, 24, 14]} />
            </mesh>
            {[0.03, 0.055].map((y) => (
              <mesh key={y} castShadow material={band} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.118, 0.011, 8, 36]} />
              </mesh>
            ))}
          </group>
        )}
        {look.headwear === "cap" && (
          <mesh castShadow material={hw} position={[0, 0.02, 0]}>
            <sphereGeometry args={[HEAD_R * 1.04, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          </mesh>
        )}
      </group>
    </group>
  );
};

export const Human: React.FC<Props> = ({ look, pose, position, yaw, held, time }) => {
  const s = look.height / BASE_HEIGHT;
  const b = look.build;
  const geo = useBodyGeometry(b);
  const robe = cloth(look.robe);
  const robeIn = cloth(shade(look.robe, 0.8), THREE.DoubleSide);
  const trim = cloth(look.robeTrim);
  const trouser = cloth(shade(look.robe, 0.92));
  const sk = skinMat(look.skin);
  const cloak = look.cloak ? cloth(look.cloak, THREE.DoubleSide) : null;
  const sandal = matte("#5a3a26", 0.7);

  const breathScale = 1 + pose.breath * 0.03;
  // Robe sways with the stride and pools on the ground when the hips drop (kneeling/sitting).
  const hipHeight = HIP_Y + pose.bodyY;
  const squash = Math.min(1, Math.max(0.6, hipHeight / HIP_Y));
  const pool = 1 + (1 - squash) * 0.55;
  const kneeling = hipHeight < HIP_Y * 0.7;
  const skirtSwing = (pose.lHip + pose.rHip) * 0.22;
  const skirtSpread = Math.abs(pose.lHip - pose.rHip) * 0.2;

  const heldNode = (slot: HeldProp["slot"], pitch: number) =>
    held && held.slot === slot ? (
      <group rotation={[-pitch, 0, 0]}>
        <group position={slot === "mouth" ? [0, -0.02, 0.02] : [0, 0.02, 0.01]} rotation={[held.pour ? 1.9 : 0, 0, 0]}>
          <group scale={0.8}>
            <Khuff wet />
          </group>
          {held.pour && (
            <group rotation={[-1.9, 0, 0]}>
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
      <group position={[side * 0.2 * b, 0.47, 0]} rotation={[shoulder, 0, side * out]}>
        <mesh castShadow material={robe} geometry={geo.sleeveUpper} />
        <group position={[0, -0.28, 0]} rotation={[elbow, 0, 0]}>
          <mesh castShadow material={robe}>
            <sphereGeometry args={[0.062 * b, 16, 12]} />
          </mesh>
          <mesh castShadow material={robeIn} geometry={geo.sleeveBell} />
          <mesh castShadow material={sk} position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.028, 0.032, 0.12, 12]} />
          </mesh>
          {/* mitten hand + thumb */}
          <group position={[0, -0.285, 0.008]}>
            <mesh castShadow material={sk} scale={[0.82, 1.15, 0.55]}>
              <sphereGeometry args={[0.046, 18, 14]} />
            </mesh>
            <mesh castShadow material={sk} position={[side * -0.03, 0.012, 0.016]} rotation={[0.3, 0, side * 0.5]}>
              <capsuleGeometry args={[0.013, 0.03, 4, 8]} />
            </mesh>
          </group>
          <group position={[0, -0.31, 0.01]}>{heldNode(slot, pose.spine + shoulder + elbow)}</group>
        </group>
      </group>
    );
  };

  const leg = (side: 1 | -1) => {
    const hip = side === 1 ? pose.lHip : pose.rHip;
    const knee = side === 1 ? pose.lKnee : pose.rKnee;
    return (
      <group position={[side * 0.085 * b, 0, 0]} rotation={[hip, 0, 0]}>
        <mesh castShadow material={trouser} position={[0, -THIGH / 2, 0]}>
          <capsuleGeometry args={[0.07 * b, THIGH - 0.1, 6, 14]} />
        </mesh>
        <group position={[0, -THIGH, 0]} rotation={[knee, 0, 0]}>
          <mesh castShadow material={trouser} position={[0, -SHIN / 2 + 0.02, 0]}>
            <capsuleGeometry args={[0.052 * b, SHIN - 0.08, 6, 12]} />
          </mesh>
          {/* foot in a sandal */}
          <group position={[0, -SHIN - FOOT / 2 + 0.01, 0.045]}>
            <mesh castShadow material={sk} position={[0, 0.02, 0]} scale={[0.85, 0.55, 1.6]}>
              <sphereGeometry args={[0.05, 16, 12]} />
            </mesh>
            <mesh castShadow material={sandal} position={[0, -0.005, 0.005]} scale={[1, 0.25, 1.9]}>
              <sphereGeometry args={[0.052, 16, 10]} />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group position={position} rotation={[0, yaw, 0]} scale={s}>
      <group position={[0, hipHeight, 0]}>
        {!kneeling && leg(1)}
        {!kneeling && leg(-1)}

        {/* hip bridge hides the seam between torso and skirt when bending */}
        <mesh castShadow material={robe} position={[0, 0.02, 0]} scale={[1.12, 0.75, 0.95]}>
          <sphereGeometry args={[0.2 * b, 24, 16]} />
        </mesh>
        {kneeling && (
          <group position={[0, -(hipHeight - 0.42), -0.11]} scale={[1.0, (hipHeight + 0.02) / 0.44, 1.3]}>
            <mesh castShadow receiveShadow material={robe} geometry={geo.drape} />
            <mesh material={matte(shade(look.robe, 0.55), 1, { side: THREE.BackSide })} geometry={geo.drape} />
            {/* sandal soles peeking out behind */}
            {[1, -1].map((side) => (
              <mesh key={side} castShadow material={sandal} position={[side * 0.08, -0.43, -0.3]} rotation={[-1.3, 0, 0]} scale={[0.8, 0.25, 1.6]}>
                <sphereGeometry args={[0.05, 12, 8]} />
              </mesh>
            ))}
          </group>
        )}
        <group visible={!kneeling} rotation={[skirtSwing, 0, 0]} scale={[pool + skirtSpread, squash, pool + skirtSpread]}>
          <mesh castShadow receiveShadow material={robe} geometry={geo.skirt} />
          <mesh material={matte(shade(look.robe, 0.55), 1, { side: THREE.BackSide })} geometry={geo.skirt} scale={[0.985, 1, 0.985]} />
          <mesh castShadow material={trim} position={[0, -0.775, 0]}>
            <torusGeometry args={[0.302 * b, 0.012, 6, 48]} />
          </mesh>
          {cloak && squash > 0.85 && <mesh castShadow receiveShadow material={cloak} geometry={geo.cloakLower} position={[0, 0, -0.01]} />}
        </group>

        <group rotation={[pose.spine, pose.spineTwist, pose.spineSide]}>
          <mesh castShadow receiveShadow material={robe} geometry={geo.torso} scale={[1.1 * breathScale, 1, 0.86 * breathScale]} />
          {/* collar opening */}
          <mesh material={trim} position={[0, 0.555, 0.035]} rotation={[-0.35, 0, 0]}>
            <torusGeometry args={[0.065, 0.012, 8, 28]} />
          </mesh>
          {look.sash && (
            <group>
              <mesh castShadow material={cloth(look.sash)} geometry={geo.sashBand} position={[0, 0.02, 0]} scale={[1.1 * breathScale, 1, 0.86 * breathScale]} />
              <mesh castShadow material={cloth(look.sash, THREE.DoubleSide)} position={[0.09 * b, -0.06, 0.17 * b]} rotation={[0.1, 0.4, 0.08]}>
                <planeGeometry args={[0.06, 0.2]} />
              </mesh>
            </group>
          )}
          {cloak && <mesh castShadow receiveShadow material={cloak} geometry={geo.cloakUpper} scale={[1.1, 1, 0.9]} position={[0, 0, -0.01]} />}
          {arm(1)}
          {arm(-1)}
          <group position={[0, 0.56, 0.0]} rotation={[pose.neck, pose.headTurn, pose.headTilt]}>
            <Head look={look} />
            <group position={[0, 0.13, 0.13]}>{heldNode("mouth", pose.spine + pose.neck)}</group>
          </group>
        </group>
      </group>
    </group>
  );
};

export { HIP_Y };
