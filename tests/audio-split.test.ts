import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SR, splitAligned } from "../scripts/audio-split";

/** Tone for `sec` seconds, silence for `gap` seconds, repeated per segment. */
const build = (segments: [number, number][]) => {
  const total = segments.reduce((n, [s, g]) => n + s + g, 0.3);
  const pcm = new Int16Array(Math.round(total * SR));
  let i = Math.round(0.15 * SR);
  for (const [sec, gap] of segments) {
    for (let k = 0; k < sec * SR; k++, i++) pcm[i] = Math.round(Math.sin(k * 0.2) * 12000);
    i += Math.round(gap * SR);
  }
  return pcm;
};

describe("splitting one TTS take into lines", () => {
  it("cuts at line boundaries, not at the long pause inside a line", () => {
    // line A: 1s speech, 0.9s pause ("…"), 1s speech | 0.8s gap | line B: 0.6s | 0.8s gap | line C: 2s
    const pcm = build([[1, 0.9], [1, 0.8], [0.6, 0.8], [2, 0]]);
    const parts = splitAligned(pcm, ["aaaaaaaaaa… bbbbbbbbbbbb", "cccccc", "dddddddddddddddddddddd"]);
    assert.ok(parts, "split succeeded");
    const secs = parts!.map((p) => p.length / SR);
    assert.ok(secs[0] > 2.5 && secs[0] < 3.2, `A=${secs[0]}`);
    assert.ok(secs[1] > 0.5 && secs[1] < 0.9, `B=${secs[1]}`);
    assert.ok(secs[2] > 1.9 && secs[2] < 2.3, `C=${secs[2]}`);
  });

  it("gives up (so the caller falls back to one call per line) when there are too few pauses", () => {
    const pcm = build([[3, 0]]);
    assert.equal(splitAligned(pcm, ["one", "two"]), null);
  });
});
