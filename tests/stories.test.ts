import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { checkStory, isWarning } from "../src/engine/schema";

const dir = join(import.meta.dirname, "..", "stories");
const load = (f: string) => JSON.parse(readFileSync(join(dir, f), "utf8"));

describe("story files", () => {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    it(`${file} has no errors`, () => {
      const { issues } = checkStory(load(file));
      assert.deepEqual(issues.filter((i) => !isWarning(i)), []);
    });
  }
});

describe("validator catches authoring mistakes", () => {
  const base = load("pyasa-kutta.json");
  const mutate = (fn: (s: typeof base) => void) => {
    const copy = structuredClone(base);
    fn(copy);
    return checkStory(copy).issues.filter((i) => !isWarning(i)).map((i) => i.message);
  };

  it("unknown animation for a character type", () => {
    const msgs = mutate((s) => (s.scenes[0].actors[0].actions[0].type = "fly"));
    assert.ok(msgs.some((m) => m.includes('no animation "fly"')), msgs.join("\n"));
  });

  it("dog cannot use a human-only animation", () => {
    const msgs = mutate((s) => (s.scenes[4].actors[1].actions[0].type = "wipe-brow"));
    assert.ok(msgs.some((m) => m.includes("dog has no animation")));
  });

  it("action longer than its scene", () => {
    const msgs = mutate((s) => (s.scenes[0].actors[0].actions[0].duration = 60));
    assert.ok(msgs.some((m) => m.includes("but the scene is only")));
  });

  it("actor not in the cast", () => {
    const msgs = mutate((s) => (s.scenes[0].actors[0].id = "ghost"));
    assert.ok(msgs.some((m) => m.includes("not in the cast")));
  });

  it("camera aimed at someone who is not in the scene", () => {
    const msgs = mutate((s) => (s.scenes[0].camera.target = "kutta"));
    assert.ok(msgs.some((m) => m.includes("not an actor in this scene")));
  });

  it("unknown environment", () => {
    const msgs = mutate((s) => (s.scenes[0].environment = "snow"));
    assert.ok(msgs.some((m) => m.includes('unknown environment "snow"')));
  });

  it("warns (but does not fail) while a hadith source is unverified", () => {
    const { issues } = checkStory(base);
    assert.ok(issues.some((i) => isWarning(i) && i.path === "source.verified"));
  });
});
