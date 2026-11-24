// Turns a scene's declarative actor timeline into the exact state of every actor
// at any time t. Pure and deterministic: frame N always produces the same pose.

import type { ClipContext } from "../library/characters/humanAnimations";
import { DEG, clamp, dist, easeWalk, lerpAngle, lerpVec, subVec, yawFromDir, type Vec3 } from "./math";
import type { Action, Scene, SceneActor, Story } from "./schema";

export const BLEND_SECONDS = 0.35;
const TURN_SECONDS = 0.45;

export type ClipRef = { clip: string; ctx: ClipContext };

export type ActorState = {
  id: string;
  position: Vec3;
  yaw: number;
  current: ClipRef;
  /** Previous clip being blended out, with weight 0..1 of the *current* clip. */
  from?: ClipRef;
  blend: number;
  action?: Action;
};

type Segment = {
  action: Action;
  points: Vec3[] | null;
  length: number;
  startPos: Vec3;
  endPos: Vec3;
};

const pathLength = (pts: Vec3[]) => pts.slice(1).reduce((sum, p, i) => sum + dist(pts[i], p), 0);

const pointAlong = (pts: Vec3[], d: number): { pos: Vec3; dir: Vec3 } => {
  let remaining = d;
  for (let i = 1; i < pts.length; i++) {
    const seg = dist(pts[i - 1], pts[i]);
    if (remaining <= seg || i === pts.length - 1) {
      const k = seg > 0 ? clamp(remaining / seg) : 1;
      return { pos: lerpVec(pts[i - 1], pts[i], k), dir: subVec(pts[i], pts[i - 1]) };
    }
    remaining -= seg;
  }
  return { pos: pts[pts.length - 1], dir: [0, 0, 1] };
};

const segmentsCache = new WeakMap<SceneActor, Segment[]>();

const segmentsOf = (actor: SceneActor): Segment[] => {
  const cached = segmentsCache.get(actor);
  if (cached) return cached;
  const sorted = [...actor.actions].sort((a, b) => a.start - b.start);
  let pos: Vec3 = actor.at;
  const segs = sorted.map((action) => {
    const points = action.path ? [pos, ...action.path] : action.to ? [pos, action.to] : null;
    const seg: Segment = {
      action,
      points,
      length: points ? pathLength(points) : 0,
      startPos: pos,
      endPos: points ? points[points.length - 1] : pos,
    };
    pos = seg.endPos;
    return seg;
  });
  segmentsCache.set(actor, segs);
  return segs;
};

/** Position only (no facing) — used to resolve "face another actor" without recursion. */
export const actorPositionAt = (actor: SceneActor, t: number): Vec3 => {
  const segs = segmentsOf(actor);
  let pos = actor.at;
  for (const s of segs) {
    if (t < s.action.start) return pos;
    if (t < s.action.start + s.action.duration && s.points) {
      const k = easeWalk((t - s.action.start) / s.action.duration);
      return pointAlong(s.points, k * s.length).pos;
    }
    pos = s.endPos;
  }
  return pos;
};

const resolveFacing = (
  face: number | string | undefined,
  scene: Scene,
  from: Vec3,
  t: number,
): number | undefined => {
  if (face === undefined) return undefined;
  if (typeof face === "number") return face * DEG;
  const other = scene.actors.find((a) => a.id === face);
  if (!other) return undefined;
  const p = actorPositionAt(other, t);
  return yawFromDir(p[0] - from[0], p[2] - from[2]);
};

const ctxFor = (seg: Segment, t: number, sceneTime: number): ClipContext => {
  const local = clamp(t - seg.action.start, 0, seg.action.duration);
  const progress = local / seg.action.duration;
  return {
    t: local,
    duration: seg.action.duration,
    progress,
    distance: seg.points ? easeWalk(progress) * seg.length : 0,
    sceneTime,
  };
};

const idleRef = (t: number, sinceStart: number): ClipRef => ({
  clip: "idle",
  ctx: { t: sinceStart, duration: 1, progress: 0, distance: 0, sceneTime: t },
});

/**
 * Yaw the actor ends each action with. Walking actors face where they walked,
 * explicit `face` wins, otherwise the previous facing is kept.
 */
const yawTargetDuring = (seg: Segment, scene: Scene, pos: Vec3, t: number, fallback: number) => {
  const explicit = resolveFacing(seg.action.face, scene, pos, t);
  if (explicit !== undefined) return explicit;
  if (seg.points && seg.length > 0.05) {
    const k = easeWalk(clamp((t - seg.action.start) / seg.action.duration));
    const { dir } = pointAlong(seg.points, Math.min(seg.length, k * seg.length + 0.01));
    if (Math.hypot(dir[0], dir[2]) > 1e-3) return yawFromDir(dir[0], dir[2]);
  }
  return fallback;
};

export const evaluateActor = (actor: SceneActor, scene: Scene, t: number): ActorState => {
  const segs = segmentsOf(actor);
  const initialYaw = resolveFacing(actor.face, scene, actor.at, 0) ?? 0;

  let yaw = initialYaw;
  let prev: { seg: Segment; endT: number } | null = null;

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    const { start, duration } = seg.action;
    const end = start + duration;

    if (t < start) break;

    const startYaw = yaw;
    if (t < end) {
      // Active action.
      const ctx = ctxFor(seg, t, t);
      const pos = actorPositionAt(actor, t);
      const target = yawTargetDuring(seg, scene, pos, t, startYaw);
      const turnK = easeWalk(clamp((t - start) / TURN_SECONDS));
      const current: ClipRef = { clip: seg.action.type, ctx };
      const sinceStart = t - start;
      let from: ClipRef | undefined;
      if (sinceStart < BLEND_SECONDS) {
        from =
          prev && Math.abs(prev.endT - start) < 0.05
            ? { clip: prev.seg.action.type, ctx: ctxFor(prev.seg, t, t) }
            : idleRef(t, t);
      }
      return {
        id: actor.id,
        position: pos,
        yaw: lerpAngle(startYaw, target, turnK),
        current,
        from,
        blend: from ? sinceStart / BLEND_SECONDS : 1,
        action: seg.action,
      };
    }

    // Finished: carry facing forward.
    yaw = yawTargetDuring(seg, scene, seg.endPos, end, startYaw);
    prev = { seg, endT: end };
  }

  // Between or after actions: idle, blending out of the last action.
  const pos = actorPositionAt(actor, t);
  const idle = idleRef(t, prev ? t - prev.endT : t);
  if (prev && t - prev.endT < BLEND_SECONDS) {
    return {
      id: actor.id,
      position: pos,
      yaw,
      current: idle,
      from: { clip: prev.seg.action.type, ctx: ctxFor(prev.seg, prev.endT, t) },
      blend: (t - prev.endT) / BLEND_SECONDS,
    };
  }
  return { id: actor.id, position: pos, yaw, current: idle, blend: 1 };
};

export type SceneTiming = { scene: Scene; startFrame: number; durationInFrames: number };

export type StoryTiming = {
  fps: number;
  scenes: SceneTiming[];
  endCardStart: number;
  endCardFrames: number;
  totalFrames: number;
};

export const computeStoryTiming = (story: Story): StoryTiming => {
  const fps = story.fps;
  let cursor = 0;
  const scenes = story.scenes.map((scene) => {
    const durationInFrames = Math.round(scene.duration * fps);
    const timing = { scene, startFrame: cursor, durationInFrames };
    cursor += durationInFrames;
    return timing;
  });
  const endCardFrames = story.endCard ? Math.round(story.endCard.duration * fps) : 0;
  return { fps, scenes, endCardStart: cursor, endCardFrames, totalFrames: cursor + endCardFrames };
};

/** Which scene is on screen at a global frame, and the local time inside it. */
export const sceneAtFrame = (timing: StoryTiming, frame: number) => {
  for (const s of timing.scenes) {
    if (frame < s.startFrame + s.durationInFrames) {
      return { ...s, localTime: (frame - s.startFrame) / timing.fps };
    }
  }
  return null;
};
