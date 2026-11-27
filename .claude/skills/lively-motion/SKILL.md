---
name: lively-motion
description: Use when writing or fixing film scene visuals (src/two-d/films/*.tsx). The quality bar so a Short never looks flat or dead - every moment has camera, character, environment and sound motion. Also has the useful Remotion animation tips.
---

# Never a dead frame

The viewer must always see something change. Check every scene against the 4 layers below; a scene that misses
a layer is not done.

## The 4 layers (all at once, all the time)
1. **Camera always moves.** Never a locked frame. Minimum: slow push-in or drift (zoom +3-6% over the shot,
   x/y drift 20-60 px). Use `camPath` keyframes from `../kit`. Accents: punch-in (zoom +15% in 6-8 frames with
   `easeBack`) on a key word; `shake()` on impacts; slight `rot` (±1.5°) on tension.
2. **Character acts.** Every character on screen does something: talk (lip-flap from `ctx.talk`), gesture, head
   turn, lean, walk, blink (`blink(f, seed)`), breathe. Big actions get anticipation (small move the other way,
   4-6 frames), action, overshoot and settle (`easeBack`). Listeners react (nod, look, hands). No statues.
3. **World is alive.** At least 3 moving things in the background: birds (`Birds`), clouds drift, tree/grass sway
   (`VillageTree`), animals idle (goat chew, cow tail), smoke/dust motes, light rays (`LightRays`), rain/splashes,
   water ripples, cloth flutter, sparkles (`Sparkle`) on magic moments. Parallax: foreground layers move faster
   than background (depth in the `L` helper).
4. **Sound marks the motion.** Steps, cloth, animal sounds, impacts land on the frame they happen (skill
   `film-sounds`). Ambient bed under every scene.

## Pace for Shorts
- New shot/angle every 1.5-3 s (cut inside a scene by switching camera keys or framing). Never > 4 s same framing.
- Hook in the first 1-2 s: motion + text punch (scale pop), the most curious visual of the story.
- Vary shot size: close → medium → over-shoulder → reaction close-up → wide to breathe → close again.
- Transitions between scenes: whip-pan (fast camera x move, motion blur does the smear), match cut on shape or
  action, flash/dip on a dramatic beat, push into a dark area and out of the next. Hard cuts on the beat are fine.
- Emotional beats slow down (longer ease, smaller moves) but never stop.
- End: slow pull-out, warm light, end card text with the reference, gentle sparkle/birds.
- Loop: Shorts blend their last 14 frames into frame 0 (`loopEnding`, on by default), so the replay is seamless.
  Make the first frame strong (no black, no empty sky) and let the end card settle before the last 0.5 s.

## Motion craft (Remotion)
- Everything is frame-driven: `interpolate`/`kf(frame, [[f, v], ...], easing)` with clamp. Never CSS animations
  or `Math.random()` (use seeds: `Math.sin(i * 12.9898)` style).
- Easing: `Easing.inOut(Easing.cubic)` for camera, `easeBack` (= `Easing.out(Easing.back(1.6))`) for pops and
  overshoot, `Easing.spring({ damping: 200 })` for a smooth push without bounce, `Easing.bezier(...)` for custom feel.
- Loops (sway, breath, flutter): `Math.sin(f / period + phase) * amount`, different phase per object so
  nothing moves in sync.
- Motion blur: `film.json` `motionBlur` 5 (player wraps the picture in `CameraMotionBlur`). Fast moves then
  look smooth; do not fake blur by hand.
- Text: pop in (scale 0.8 → 1 with `easeBack` over 4-6 frames), small rotate (-2°..-4°) for hooks, never over faces.
- Depth: blur only far background layers (`L blur={n}`), both characters sharp in a two-shot.

## Self-check before the contact sheet (no extra renders)
For each scene write in your head: camera move? each character's action? 3 background movers? sound cues?
cut every ≤3 s? If any answer is "no", fix the code first. In the contact sheet, frames of the same scene must
look clearly different (angle, size, pose).

## Remotion skills (checked)
Official skills: `remotion-dev/skills` (`npx remotion skills add`). We do not install them: ~2 MB, mostly
Studio/maps/SaaS/video-editing and Studio-editing advice that our code-built player does not use. Useful parts
are copied above. If a special effect is needed later, read just that file from GitHub:
`remotion-dev/skills/skills/remotion-markup/<topic>.md` (e.g. `light-leaks.md`, `transitions.md`, `effects.md`,
`arabic-text.md` for Urdu script captions).
