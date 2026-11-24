// Validates every story in /stories before rendering. Exit code 1 on errors.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { checkStory, isWarning } from "../src/engine/schema";
import { computeStoryTiming } from "../src/engine/timeline";

const dir = join(import.meta.dirname, "..", "stories");
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => join(dir, f));

let failed = false;
for (const file of files) {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`✗ ${file}: invalid JSON: ${(e as Error).message}`);
    failed = true;
    continue;
  }
  const { story, issues } = checkStory(json);
  const errors = issues.filter((i) => !isWarning(i));
  const warnings = issues.filter(isWarning);
  const label = story ? `${story.id} (${(computeStoryTiming(story).totalFrames / story.fps).toFixed(1)}s, ${story.scenes.length} scenes)` : file;
  console.log(`${errors.length ? "✗" : "✓"} ${label}`);
  for (const i of errors) console.log(`    error   ${i.path}: ${i.message}`);
  for (const i of warnings) console.log(`    warning ${i.path}: ${i.message.replace(/^WARNING: /, "")}`);
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
