---
name: film-assets
description: Use when a film needs characters, places, props, animals or close-ups. Finds reusable assets in the 2D library first and, for anything missing, builds a new reusable asset and registers it so future films can use it.
---

# Reuse first, build once, register forever

## 1. Find what exists (cheap)
- `src/two-d/library/registry.ts`: every asset name + description + tags. Grep it, do not read all library files:
  `grep -n "goat\|tree\|rain" src/two-d/library/registry.ts`
- Exports per file: `grep -n "^export const" src/two-d/library/*.tsx src/two-d/Scenery.tsx`
- Puppets: `src/two-d/Musafir.tsx` (human: `LOOKS`, `MusafirPose`, walk/kneel/talk/back view/props),
  `src/two-d/Dog2D.tsx`. New people = a new entry in `LOOKS` (clothes/colours), not a new puppet.
- Read only the props type + signature of a component you will use (Grep with -A 15).

## 2. Can an existing asset do it with a prop?
Prefer adding a prop (mood, colour, variant, pose) to an existing asset over a new file. E.g. sky moods,
`VillageTree kind="kikar"`, a new `LOOKS` entry.

## 3. Building a new asset
- File by world: `Village.tsx`, `Farm.tsx`, `Mountain.tsx`, `Interior.tsx`, `Well.tsx`, `Closeups.tsx`; new world
  = new file (e.g. `Market.tsx`, `Masjid.tsx` exterior only, `Sea.tsx`).
- SVG React component, props `{ x, y, s?, f? ... }` where `f` = frame so it can move by itself.
- Style: outline `OUT`/`LINE` from `../kit`, warm storybook palette (docs/ART_DIRECTION.md), rounded shapes,
  2-3 tones per surface (base, shade, highlight) + small details (cracks, stitches, leaves, stones).
- Built-in life: anything natural moves on its own via `f`: leaves sway, cloth flutters, animals blink/chew/ear flick/
  tail, water ripples, fire flickers, smoke rises. A static asset is not finished.
- Animals and people: blink, breathe (1-2% scale on chest), idle weight shift.

## 4. Register
Add to `LIBRARY` in `registry.ts`: `"name": { description: "what + what it can do (moves, variants)", tags: [...], builtFor: "<film-id>" }`.
List it in the film's `assets`. `npm run validate:films -- <id>` must pass.
Optionally add it to a gallery (`VillageGallery.tsx` / `MountainGallery.tsx`) so it can be seen in one still.

## 5. Tell the owner
One line per new asset: "Naya asset: `market-stall` (dukaan, kapde hilte hain) — aage bhi kaam aayega."
