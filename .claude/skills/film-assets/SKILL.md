---
name: film-assets
description: Use when a film needs characters, places, props, animals or close-ups. Finds reusable assets in the 2D library first and, for anything missing, builds a new reusable asset and registers it so future films can use it.
---

# Reuse first, build once, register forever

## 1. Find what exists (cheap)
- `src/two-d/library/registry.ts`: every asset name + description + tags. Grep it, do not read all library files:
  `grep -n "goat\|tree\|rain" src/two-d/library/registry.ts`
- Exports per file: `grep -n "^export const" src/two-d/library/*.tsx src/two-d/Scenery.tsx`
- Puppets: `src/two-d/Musafir.tsx` (human: `LOOKS`, `MusafirPose`, walk/kneel/talk/back view, `holdF`/`holdB`
  props in the fist, `grip`, `light` cel shading, `handPos`/`foreAngle`), `src/two-d/FrontFace.tsx` (`MusafirFront`:
  same looks from the front, chest up, hands dua/letter/hold/chin), `src/two-d/Dog2D.tsx`, `Cat2D.tsx`.
- **New people = a new entry in `LOOKS` with its own face and body, never only new colours.** Set at least 3 of:
  `face` (round/long/square), `nose` (small/big/hook), `eyes` (0.85-1.15), `brows` (0.8-1.5), `build` (0.85-1.22),
  `height` (0.9-1.1), `age` (0-1 wrinkles), `beardStyle` (full/goatee), `beardLength`, `beardGrey`, `stoop`,
  `headwear`, `vest`/`shawl`/`shoulderCloth`. Two main characters must differ in face shape AND build.
- Effects/transitions: `src/two-d/library/Fx.tsx`. Hand inserts: `TableTop`, `HandReach` in `Closeups.tsx`.
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

## Views to build (wanted, not there yet)
Done: `MusafirFront` (front chest-up, `turn` ±1 for 3/4). Still wanted, add as a prop instead of a new puppet:
1. `Cat2D` / `Dog2D` `view="front"`: face to camera, big eyes, ears, sitting front body (cheap, big impact).
2. Side-puppet head turn side -> 3/4 -> front inside one shot.
3. Real vehicles at the right scale: use `Ship` (markab, 2 masts, cabin, oars, gangplank) for any sea journey;
   `Boat` only for a small rowing/fishing boat.
Keep the look switchable by props (colour, outline weight, texture): see docs/ART_DIRECTION.md "2D look".

## 4. Register
Add to `LIBRARY` in `registry.ts`: `"name": { description: "what + what it can do (moves, variants)", tags: [...], builtFor: "<film-id>" }`.
List it in the film's `assets`. `npm run validate:films -- <id>` must pass.
Optionally add it to a gallery (`VillageGallery.tsx` / `MountainGallery.tsx`) so it can be seen in one still.

## 5. Tell the owner
One line per new asset: "Naya asset: `market-stall` (dukaan, kapde hilte hain) — aage bhi kaam aayega."
