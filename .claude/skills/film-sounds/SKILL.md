---
name: film-sounds
description: Use for every new film script and whenever a film needs sound effects or ambience. Lists the sounds a script needs, reuses real recordings in the library and fetches missing ones as CC0 from Freesound with the project script.
---

# Real sounds for every film

## 1. List
Every `Sound:` line in the script + everything on screen that makes noise (animals, weather, water, doors, steps,
cloth, coins, tools, fire, crowd, birds, wind). Write the list as `name: where it plays`.

## 2. Reuse
`cat public/sfx/real/index.json` and `grep -n '"sfx-' src/two-d/library/registry.ts`. Use the existing name.

## 3. Fetch missing (never by hand, never BBC) — on GitHub, secret FREESOUND_API_KEY
Run workflow `fetch-sfx.yml` (GitHub MCP `actions_run_trigger`, ref = default branch) with
`sounds: "<name>: <search words> [--id N] [--max S] [--loud L] [--filter F]; ..."` (all missing sounds in one run):
1. `list: true` → read the run's job log / summary (ids, length, rating, title), pick the best per sound
   (exact title match: "goat bleat" not "goat farm ambience").
2. `list: false` with `--id N` for each → it pushes branch `sfx/<run id>`; open a PR into the default branch,
   merge it, then pull it into your working branch.
Loudness: hits -14, one-shots/animals -18, beds (rain, birds, wind, drips, crowd) -22. A cue plays max 6 s, so
repeat beds as cues every ~5.5 s or use `ambience` (loop). `--filter "lowpass=f=450"` = heard from inside.
(Locally `npm run fetch:sfx -- ...` works too when FREESOUND_API_KEY is set.)

## 4. Generated sounds
Only abstract effects (whoosh, chime, riser, shimmer, pad, rewind, slowmo) from `scripts/make-sfx.sh`.

## 5. Place them
In the film visuals: `sfx: [{ file: "<name>", at: <nominal frame>, volume, until? }]` on the exact action frame,
plus `ambience`. Volumes: bed 0.25-0.4, one-shot 0.5-0.8, hit 0.8-1. Voice must stay on top.
- A cue plays max 6 s. **Give `until: <nominal frame of the cut>`** to any cue longer than its shot (saw, chisel,
  creak, waves, birds): it stops there with a 0.25 s fade (`dur` in seconds also works).
- Long beds: one long CC0 recording (20-30 s, `--max 30`) as `ambience` (loops) instead of the same 6 s clip again
  and again (the repeat is audible). Keep it low (0.1-0.18) and add scene-specific cues on top.
- Real recordings are loud: after a render check peaks; any cue that hits > -1 dB gets its volume lowered
  (saw/coins needed ~0.3-0.5).
