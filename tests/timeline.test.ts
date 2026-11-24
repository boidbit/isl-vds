import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeCamera } from "../src/engine/camera";
import { DEG, dist } from "../src/engine/math";
import { SceneSchema, type Scene } from "../src/engine/schema";
import { computeStoryTiming, evaluateActor, sceneAtFrame } from "../src/engine/timeline";
import { STORIES } from "../src/stories";

const scene = (partial: object): Scene =>
  SceneSchema.parse({
    id: "t",
    location: "registan",
    environment: "noon",
    duration: 10,
    camera: { shot: "medium", target: "a" },
    ...partial,
  });

describe("actor timeline", () => {
  const s = scene({
    actors: [
      {
        id: "a",
        at: [0, 0, 0],
        actions: [
          { type: "walk", start: 1, duration: 4, to: [0, 0, 4] },
          { type: "kneel", start: 5, duration: 3 },
        ],
      },
      { id: "b", at: [5, 0, 4], actions: [] },
    ],
  });
  const a = s.actors[0];

  it("stays at its start point before the first action", () => {
    assert.deepEqual(evaluateActor(a, s, 0.5).position, [0, 0, 0]);
    assert.equal(evaluateActor(a, s, 0.5).current.clip, "idle");
  });

  it("moves along the path and arrives exactly at the target", () => {
    const mid = evaluateActor(a, s, 3).position;
    assert.ok(mid[2] > 1 && mid[2] < 3, `mid-walk z=${mid[2]}`);
    assert.deepEqual(evaluateActor(a, s, 5).position, [0, 0, 4]);
    assert.deepEqual(evaluateActor(a, s, 9.9).position, [0, 0, 4]);
  });

  it("faces the walking direction", () => {
    assert.ok(Math.abs(evaluateActor(a, s, 3).yaw) < 1e-6);
  });

  it("blends into the next clip instead of snapping", () => {
    const st = evaluateActor(a, s, 5.1);
    assert.equal(st.current.clip, "kneel");
    assert.equal(st.from?.clip, "walk");
    assert.ok(st.blend > 0 && st.blend < 1);
  });

  it("returns to idle after the last action, blending out", () => {
    const st = evaluateActor(a, s, 8.1);
    assert.equal(st.current.clip, "idle");
    assert.equal(st.from?.clip, "kneel");
    assert.equal(evaluateActor(a, s, 9.5).from, undefined);
  });

  it("drives the walk cycle by distance (no foot sliding)", () => {
    const c1 = evaluateActor(a, s, 2).current.ctx.distance;
    const c2 = evaluateActor(a, s, 4).current.ctx.distance;
    assert.ok(c2 > c1 && c2 <= 4);
  });

  it("can face another actor", () => {
    const s2 = scene({
      actors: [
        { id: "a", at: [0, 0, 0], actions: [{ type: "idle", start: 0, duration: 2, face: "b" }] },
        { id: "b", at: [3, 0, 0], actions: [] },
      ],
    });
    const yaw = evaluateActor(s2.actors[0], s2, 1.5).yaw;
    assert.ok(Math.abs(yaw - 90 * DEG) < 1e-3, `yaw=${yaw}`);
  });

  it("is deterministic (same frame -> same state)", () => {
    assert.deepEqual(evaluateActor(a, s, 3.3), evaluateActor(a, s, 3.3));
  });
});

describe("camera", () => {
  const s = scene({ actors: [{ id: "a", at: [0, 0, 0], actions: [] }] });

  it("places a front close-up in front of the subject and aims at the head", () => {
    const cam = computeCamera(
      { ...s, camera: { start: 0, shot: "close-up", target: "a", angle: 0, move: "follow" } },
      0,
      { height: () => 1.75 },
      16 / 9,
    );
    assert.ok(cam.position[2] > 1, "camera should be on the +Z (front) side");
    assert.ok(cam.lookAt[1] > 1.3, "should aim at head height");
    assert.ok(dist(cam.position, [0, 1.6, 0]) < 2.5);
  });

  it("eases a custom shot from its start to its end position and focuses on the focus actor", () => {
    const shot = { start: 0, shot: "custom" as const, move: "follow" as const, position: [0, 1, 10] as [number, number, number], toPosition: [0, 1, 4] as [number, number, number], lookAt: [0, 1, 0] as [number, number, number] };
    const sc = { ...s, focus: "a", camera: shot };
    const startCam = computeCamera(sc, 0, { height: () => 1.75 }, 16 / 9);
    const endCam = computeCamera(sc, s.duration, { height: () => 1.75 }, 16 / 9);
    assert.ok(Math.abs(startCam.position[2] - 10) < 0.1);
    assert.ok(Math.abs(endCam.position[2] - 4) < 0.1);
    assert.ok(Math.abs(endCam.focus[1] - 1.75 * 0.6) < 1e-6, "focus at the actor's chest height");
  });

  it("widens the field of view for portrait (Shorts)", () => {
    const land = computeCamera(s, 1, { height: () => 1.75 }, 16 / 9);
    const port = computeCamera(s, 1, { height: () => 1.75 }, 9 / 16);
    assert.ok(port.fov > land.fov);
  });
});

describe("story timing", () => {
  const story = STORIES[0];
  const timing = computeStoryTiming(story);

  it("covers every scene back-to-back plus the end card", () => {
    const scenesFrames = timing.scenes.reduce((n, s) => n + s.durationInFrames, 0);
    assert.equal(timing.totalFrames, scenesFrames + timing.endCardFrames);
    timing.scenes.slice(1).forEach((s, i) => {
      const prev = timing.scenes[i];
      assert.equal(s.startFrame, prev.startFrame + prev.durationInFrames);
    });
  });

  it("maps frames to scenes and local time", () => {
    const second = timing.scenes[1];
    const at = sceneAtFrame(timing, second.startFrame + story.fps);
    assert.equal(at?.scene.id, story.scenes[1].id);
    assert.ok(Math.abs((at?.localTime ?? 0) - 1) < 1e-9);
    assert.equal(sceneAtFrame(timing, timing.endCardStart), null);
  });
});
