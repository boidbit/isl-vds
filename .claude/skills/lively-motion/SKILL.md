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

## Cinematic camera language (pick on purpose, per beat)
Plan each scene as a mini shot list first: `beat → shot size + angle + move + transition in`.
- **Shot sizes:** extreme close-up (eyes, hands, coin) for tension ≤1 s; close-up for emotion and dialogue;
  medium for action; over-the-shoulder for two people talking; wide/establishing only to open a place or end.
- **Angles carry meaning:** low angle = power, awe, danger (boulder, storm, rich man); high angle / top-down =
  small, trapped, helpless (men in the cave, man in the well); eye level = honest, calm; dutch tilt (`rot` 4-8°)
  = fear, panic; POV (what the character sees, then cut to his face) = curiosity, discovery.
- **Moves:** slow push-in = realisation, emotion rising; pull-out = loneliness, ending, reveal of scale;
  track/truck alongside a walk = journey; crane up (y moves, zoom out) = hope, prayer answered; crane down =
  arrival into a place; orbit-feel = parallax of 3+ layers moving at different speeds while the subject stays;
  dolly-zoom feel (zoom in while far layers scale the other way) = shock, once per film max; handheld (tiny
  `shake` noise 2-4 px) = chaos, storm, chase.
- **Focus:** rack focus only between one subject and an object (hand → pot). Two characters = both sharp.
- **Grammar:** keep the 180° rule (a character who faces right keeps facing right across the cut); match
  eyelines in a conversation; cut on action (cut in the middle of a gesture, continue it in the next shot);
  reaction shot after every big line or reveal.
- **Transitions:** hard cut on the beat (default); whip-pan for time/place jumps; match cut (round pot → round
  sun, hand → hand); flash-white into a flashback, flash-cold back; push into darkness/out of it; L-cut/J-cut:
  next scene's sound starts 0.3-0.5 s before the picture cut (sfx at an earlier nominal frame).
- **Light & grade per mood:** warm gold = kindness, flashback, ending; cold blue-grey = danger, night, cave;
  god rays (`LightRays`) when a prayer is answered; flicker (diya, lightning) for tension.
- **Rhythm:** fast cuts (1-1.5 s) in the hook and tension; slower (3-4 s, still moving) at the emotional peak;
  last shot holds while the end card settles, then loops.

## Not always from the side (front views)
Side view is only the default because the puppets were drawn that way. Mix angles on purpose:
- **Front close-up for every emotional peak:** sad/hopeful/shocked face looking into the camera (eye contact
  stops the scroll). Chest-up framing is enough; walking and actions can stay side view.
- **Head turn** side -> 3/4 -> front inside one shot when a character notices something or turns to the viewer.
- **Animal front face** (cat/dog looking into the lens through bars, at a bowl, at a person) for hooks and thumbnails.
- Also: over-the-shoulder, POV, top-down, low angle from the animal's height.
- If the needed front/3/4 view does not exist yet, build it as a reusable view of the puppet (skill `film-assets`),
  do not skip the shot. Aim: at least 2 front-facing close-ups per Short.

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
