import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FILMS } from "../src/two-d/films";
import { nominalToActual, planFilm } from "../src/two-d/film/timeline";
import { LIBRARY } from "../src/two-d/library/registry";

const { film, visuals } = FILMS["pyasa-kutta"];

describe("2D film timing", () => {
  it("keeps the nominal design length when estimated speech fits", () => {
    const plan = planFilm(film, visuals, null);
    assert.ok(plan.totalFrames >= 960);
  });

  it("stretches a scene to fit a longer voice line and shifts later scenes", () => {
    const timing = { film: film.id, lines: { "s1-tapta-registan#0": { file: "x.wav", seconds: 6.5, hash: "h", env: [] } } };
    const plan = planFilm(film, visuals, timing);
    const s1 = plan.scenes[0];
    assert.ok(s1.duration >= Math.ceil((0.3 + 6.5 + 0.45) * 30), `s1 ${s1.duration}`);
    assert.equal(plan.scenes[1].start, s1.duration);
    assert.equal(s1.lines[0].frames, Math.ceil(6.5 * 30));
  });

  it("moves sound cues with their scene", () => {
    const timing = { film: film.id, lines: { "s1-tapta-registan#0": { file: "x.wav", seconds: 6.5, hash: "h", env: [] } } };
    const plan = planFilm(film, visuals, timing);
    assert.equal(nominalToActual(plan.scenes, 150), plan.scenes[1].start);
  });

  it("every asset the film lists exists in the library", () => {
    assert.deepEqual(film.assets.filter((a) => !LIBRARY[a]), []);
  });
});
