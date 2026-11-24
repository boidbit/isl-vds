// Film-style virtual camera. A shot is described by intent ("close-up of musafir,
// slow push-in") and this module computes the exact camera position each frame.

import { DEG, addVec, clamp, easeInOut, lerp, scaleVec, wobble, type Vec3 } from "./math";
import type { CameraShot, Scene } from "./schema";
import { actorPositionAt, evaluateActor } from "./timeline";

type ShotSpec = {
  dist: number;
  height: number;
  lookHeight: number; // fraction of the target's height to aim at
  fov: number;
  angle: number; // default angle around the target (deg)
  scaleWithTarget: boolean;
};

const SHOTS: Record<CameraShot["shot"], ShotSpec> = {
  establishing: { dist: 16, height: 5, lookHeight: 0.4, fov: 38, angle: 25, scaleWithTarget: false },
  wide: { dist: 10, height: 2.6, lookHeight: 0.5, fov: 38, angle: 20, scaleWithTarget: false },
  full: { dist: 5.2, height: 1.4, lookHeight: 0.55, fov: 36, angle: 15, scaleWithTarget: true },
  medium: { dist: 3.0, height: 1.55, lookHeight: 0.75, fov: 34, angle: 15, scaleWithTarget: true },
  "close-up": { dist: 1.55, height: 1.62, lookHeight: 0.88, fov: 32, angle: 20, scaleWithTarget: true },
  "extreme-close-up": { dist: 0.9, height: 1.6, lookHeight: 0.9, fov: 30, angle: 25, scaleWithTarget: true },
  "low-angle": { dist: 3.0, height: 0.3, lookHeight: 0.6, fov: 42, angle: 20, scaleWithTarget: true },
  "high-angle": { dist: 4.2, height: 5.2, lookHeight: 0.3, fov: 40, angle: 20, scaleWithTarget: false },
  "top-down": { dist: 0.6, height: 9, lookHeight: 0, fov: 40, angle: 0, scaleWithTarget: false },
  side: { dist: 4.2, height: 1.3, lookHeight: 0.6, fov: 36, angle: 90, scaleWithTarget: true },
  tracking: { dist: 4.6, height: 1.4, lookHeight: 0.6, fov: 36, angle: 70, scaleWithTarget: true },
  "two-shot": { dist: 3.6, height: 1.45, lookHeight: 0.6, fov: 36, angle: 70, scaleWithTarget: false },
  "over-shoulder": { dist: 1.9, height: 1.75, lookHeight: 0.6, fov: 36, angle: 180, scaleWithTarget: false },
};

export type CameraFrame = { position: Vec3; lookAt: Vec3; fov: number };

export type TargetInfo = { height: (id: string) => number };

export const normalizeShots = (scene: Scene): CameraShot[] => {
  const shots = Array.isArray(scene.camera) ? scene.camera : [scene.camera];
  return [...shots].sort((a, b) => a.start - b.start);
};

/** Smoothed target position: averaging the recent past removes jitter from walk bobbing. */
const smoothedPosition = (scene: Scene, id: string, t: number): Vec3 => {
  const actor = scene.actors.find((a) => a.id === id);
  if (!actor) return [0, 0, 0];
  const samples = 6;
  let acc: Vec3 = [0, 0, 0];
  for (let i = 0; i < samples; i++) {
    acc = addVec(acc, actorPositionAt(actor, Math.max(0, t - (i / samples) * 0.5)));
  }
  return scaleVec(acc, 1 / samples);
};

export const computeCamera = (
  scene: Scene,
  t: number,
  info: TargetInfo,
  aspect: number,
): CameraFrame => {
  const shots = normalizeShots(scene);
  let index = 0;
  shots.forEach((s, i) => {
    if (t >= s.start) index = i;
  });
  const shot = shots[index];
  const shotEnd = shots[index + 1]?.start ?? scene.duration;
  const shotStart = shot.start;
  const p = easeInOut(clamp((t - shotStart) / Math.max(0.001, shotEnd - shotStart)));
  const spec = SHOTS[shot.shot];

  const targets =
    shot.target === undefined
      ? scene.actors.slice(0, 1).map((a) => a.id)
      : Array.isArray(shot.target)
        ? shot.target
        : [shot.target];

  const follow = shot.move !== "static";
  const sampleT = follow ? t : shotStart;

  // Subject point and height.
  let subject: Vec3;
  let subjectHeight = 1.75;
  if (shot.lookAt) {
    // Frame an exact world point; camera height is measured from the ground below it.
    subject = [shot.lookAt[0], 0, shot.lookAt[2]];
  } else if (targets.length > 0) {
    const positions = targets.map((id) => smoothedPosition(scene, id, sampleT));
    subject = scaleVec(positions.reduce(addVec, [0, 0, 0] as Vec3), 1 / positions.length);
    subjectHeight = Math.max(...targets.map((id) => info.height(id)));
  } else {
    subject = [0, 0, 0];
  }

  // Basis angle: where the primary target faces at the start of the shot (stable during the shot).
  let baseYaw = 0;
  const primary = scene.actors.find((a) => a.id === targets[0]);
  if (primary && !shot.lookAt) baseYaw = evaluateActor(primary, scene, shotStart).yaw;

  const k = spec.scaleWithTarget ? clamp(subjectHeight / 1.75, 0.5, 1.5) : 1;
  let distance = spec.dist * k;
  let height = spec.height * k;
  let angle = (shot.angle ?? spec.angle) * DEG;

  // Two-shot: pull back far enough to keep both subjects in frame.
  if (shot.shot === "two-shot" && targets.length >= 2) {
    const a = smoothedPosition(scene, targets[0], sampleT);
    const b = smoothedPosition(scene, targets[1], sampleT);
    distance = Math.max(distance, Math.hypot(a[0] - b[0], a[2] - b[2]) * 1.6 + 1.5);
  }

  const amount = shot.amount;
  switch (shot.move) {
    case "push-in":
      distance *= lerp(1.35, 0.8, p);
      break;
    case "pull-out":
      distance *= lerp(0.8, 1.6, p);
      height += lerp(0, (amount ?? 1.5) * k, p);
      break;
    case "orbit":
      angle += (amount ?? 35) * DEG * p;
      break;
    case "crane-up":
      height += lerp(0, amount ?? 3, p);
      distance *= lerp(1, 1.3, p);
      break;
    case "crane-down":
      height += lerp(amount ?? 3, 0, p);
      break;
    default:
      break;
  }

  // Portrait (Shorts): vertical FOV must grow so the subject is not cropped sideways.
  let fov = spec.fov;
  if (aspect < 1) {
    const hFov = 2 * Math.atan(Math.tan((spec.fov * DEG) / 2) * (16 / 9));
    fov = (2 * Math.atan(Math.tan(hFov / 2) / aspect) * 0.62) / DEG;
    distance *= 1.15;
  }

  const yaw = baseYaw + angle;
  let position: Vec3 = [
    subject[0] + Math.sin(yaw) * distance,
    subject[1] + height,
    subject[2] + Math.cos(yaw) * distance,
  ];

  let lookAt: Vec3 = shot.lookAt ?? [subject[0], subject[1] + subjectHeight * spec.lookHeight, subject[2]];

  if (shot.shot === "over-shoulder" && targets.length >= 2) {
    const a = smoothedPosition(scene, targets[0], sampleT);
    const b = smoothedPosition(scene, targets[1], sampleT);
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dz) || 1;
    const back: Vec3 = [-dx / len, 0, -dz / len];
    const side: Vec3 = [-dz / len, 0, dx / len];
    position = addVec(a, addVec(scaleVec(back, distance), addVec(scaleVec(side, 0.7), [0, height, 0])));
    lookAt = [b[0], b[1] + info.height(targets[1]) * 0.6, b[2]];
  }

  if (shot.shot === "top-down") {
    lookAt = [subject[0], subject[1], subject[2]];
  }

  // Subtle "breathing" handheld drift keeps shots from feeling like a game camera.
  const drift = shot.shot === "establishing" ? 0.12 : 0.025 * Math.max(1, distance / 3);
  position = addVec(position, [wobble(t * 0.35, 11) * drift, wobble(t * 0.3, 12) * drift * 0.6, 0]);
  lookAt = addVec(lookAt, [wobble(t * 0.25, 13) * drift * 0.4, 0, 0]);

  return { position, lookAt, fov };
};
