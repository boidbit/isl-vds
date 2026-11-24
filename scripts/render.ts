// Render a story to MP4 (or a few preview stills).
//
//   npm run render -- pyasa-kutta                 # 1920x1080 MP4 -> out/pyasa-kutta.mp4
//   npm run render -- pyasa-kutta --short         # 1080x1920 for YouTube Shorts
//   npm run render -- pyasa-kutta --scale 0.5     # quick half-resolution preview
//   npm run render -- pyasa-kutta --frames 0-299  # only part of the video
//   npm run still  -- pyasa-kutta                 # one PNG per scene -> out/stills/
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { computeStoryTiming } from "../src/engine/timeline";
import { STORIES } from "../src/stories";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    short: { type: "boolean", default: false },
    stills: { type: "boolean", default: false },
    scale: { type: "string", default: "1" },
    frames: { type: "string" },
    at: { type: "string" },
    concurrency: { type: "string" },
    out: { type: "string" },
  },
});

const storyId = positionals[0] ?? STORIES[0].id;
const story = STORIES.find((s) => s.id === storyId);
if (!story) {
  console.error(`Unknown story "${storyId}". Have: ${STORIES.map((s) => s.id).join(", ")}`);
  process.exit(1);
}

const root = join(import.meta.dirname, "..");
const compositionId = values.short ? `${story.id}-short` : story.id;
const scale = Number(values.scale);
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const chromiumOptions = { gl: "angle" as const };

console.log(`Bundling…`);
const serveUrl = await bundle({ entryPoint: join(root, "src/index.ts"), publicDir: join(root, "public") });
const inputProps = { story };
const composition = await selectComposition({ serveUrl, id: compositionId, inputProps, browserExecutable, chromiumOptions });

if (values.stills || process.argv[1].endsWith("stills.ts")) {
  const dir = join(root, "out", "stills");
  mkdirSync(dir, { recursive: true });
  const timing = computeStoryTiming(story);
  const frames = values.at
    ? values.at.split(",").map((s) => Math.round(Number(s) * story.fps))
    : timing.scenes.map((s) => s.startFrame + Math.round(s.durationInFrames * 0.6));
  for (const frame of frames) {
    const output = join(dir, `${compositionId}-${String(frame).padStart(5, "0")}.png`);
    const started = Date.now();
    await renderStill({ serveUrl, composition, frame, output, inputProps, scale, browserExecutable, chromiumOptions });
    console.log(`  frame ${frame} -> ${output} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  }
} else {
  const range = values.frames?.split("-").map(Number) as [number, number] | undefined;
  const output = values.out ?? join(root, "out", `${compositionId}${scale !== 1 ? `-x${scale}` : ""}.mp4`);
  const started = Date.now();
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 20,
    outputLocation: output,
    inputProps,
    scale,
    frameRange: range ?? null,
    concurrency: values.concurrency ? Number(values.concurrency) : null,
    browserExecutable,
    chromiumOptions,
    imageFormat: "jpeg",
    jpegQuality: 92,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct % 5 === 0 && pct !== last) {
        last = pct;
        console.log(`  ${pct}%  (${((Date.now() - started) / 1000).toFixed(0)}s)`);
      }
    },
  });
  console.log(`Done in ${((Date.now() - started) / 1000).toFixed(0)}s -> ${output}`);
}
