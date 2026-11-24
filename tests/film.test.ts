import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FILMS } from "../src/two-d/films";
import { nominalToActual, planFilm } from "../src/two-d/film/timeline";
import { LIBRARY } from "../src/two-d/library/registry";

const { film, visuals } = FILMS["pyasa-kutta"];

describe("2D film timing", () => {
  it("uses the nominal design length when there is no voice", () => {
    const plan = planFilm(film, visuals, null);
    assert.equal(plan.totalFrames, 960);
  });

  it("stretches a scene to fit a longer voice line and shifts later scenes", () => {
    const timing = { film: film.id, scenes: { "s1-tapta-registan": { file: "x.wav", seconds: 6.5, hash: "h" } } };
    const plan = planFilm(film, visuals, timing);
    const s1 = plan.scenes[0];
    assert.ok(s1.duration >= Math.ceil((0.35 + 6.5 + 0.6) * 30), `s1 ${s1.duration}`);
    assert.equal(plan.scenes[1].start, s1.duration);
    assert.equal(plan.totalFrames, 960 - 150 + s1.duration);
  });

  it("moves sound cues with their scene", () => {
    const timing = { film: film.id, scenes: { "s1-tapta-registan": { file: "x.wav", seconds: 6.5, hash: "h" } } };
    const plan = planFilm(film, visuals, timing);
    assert.equal(nominalToActual(plan.scenes, 150), plan.scenes[1].start);
  });

  it("every asset the film lists exists in the library", () => {
    assert.deepEqual(film.assets.filter((a) => !LIBRARY[a]), []);
  });
});
