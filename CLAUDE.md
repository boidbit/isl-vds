# ISL-VDS: Islamic story videos (2D cartoon, YouTube Shorts, Urdu + English)

The owner writes in Hinglish (Roman Hindi/Urdu); reply in Hinglish, short and clear. They work from an office
laptop / phone browser only: never ask them to install tools or run commands locally.

## What to do in a new chat
- **Owner pastes a script (even with no other words) → use skill `new-film`** and run the whole pipeline.
- Skills (in `.claude/skills/`): `new-film` (script → film.json → visuals → contact sheet), `film-assets`
  (reuse/build/register assets), `lively-motion` (no flat/dead frames: quality bar for every scene),
  `film-sounds` (real CC0 sounds), `render-and-check` (GitHub render in ur/en/both + checks).
- Anything else: answer directly, read only the files you need.

## Project map
- `films/<id>/script.md` (owner's script) + `film.json` (scenes, spoken `lines` with `text` Roman caption,
  `voiceText` Devanagari, `en.text` English; `languages: ["ur","en"]`; `voice.speakers`; `assets`).
- `src/two-d/films/<Name>.tsx` scene visuals (registered in `index.ts`); `src/two-d/library/` reusable assets +
  `registry.ts`; `src/two-d/Musafir.tsx` human puppet, `Dog2D.tsx`; `src/two-d/film/` player, schema, timeline.
- Two videos per film: `film-<id>` (Urdu/Hindi channel) and `film-<id>-en` (English channel).
- `scripts/voice.ts` Gemini TTS (`--lang ur|en`; en uses secret `GEMINI_API_KEY_EN` if set). No Urdu TTS in
  Gemini, so the Urdu track speaks Devanagari text with Urdu words.
- `.github/workflows/render-film.yml`: inputs film id + lang (ur/en/both).
- The old 3D engine (`src/engine`, `src/library` except `src/two-d`, `stories/`) is abandoned; do not extend it.

## Islamic content rules (non-negotiable)
- Never depict Allah, Prophets, angels or named Companions. A figure who might be a Prophet: only from behind /
  silhouette, and say why.
- Dialogue only from the source; animals do not speak. Point out where a script drifts from the Hadith.
- Show the reference on screen; `source.verified` stays false until the owner checks it.

## Sounds
Real recordings only via `npm run fetch:sfx` (CC0 Freesound; licences that allow monetised YouTube). Never BBC
Sound Effects. Generated sounds only for abstract effects. Details: skill `film-sounds`.

## Testing
`npm run typecheck`, `npm test`, `npm run validate:films` (`npm ci` first if `tsx` is missing). Local renders need
`REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## Usage limits
The owner is on a limited plan: one contact sheet per film, no re-reading large files (use grep / offset),
batch fixes, short replies.
