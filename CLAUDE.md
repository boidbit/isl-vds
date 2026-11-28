# ISL-VDS: Islamic story videos (2D cartoon, YouTube Shorts, Urdu + English)

The owner writes in Hinglish (Roman Hindi/Urdu); reply in Hinglish, short and clear. They work from an office
laptop / phone browser only: never ask them to install tools or run commands locally.

## What to do in a new chat
- **Owner pastes a script (even with no other words), or gives only a Hadith number / topic → use skill
  `new-film`** and run the whole pipeline; its first step is skill `story-craft` (engaging telling, scored).
- Skills (in `.claude/skills/`): `new-film` (script → film.json → visuals → contact sheet), `story-craft` (hook,
  structure, heart, reveal, ending from the source; story ideas list), `film-assets`
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
- `.github/workflows/render-film.yml`: inputs film id + lang (ur/en/both); publishes to release `film-<id>`.
- Videos page (GitHub Pages, `site/index.html` + `pages.yml`): https://boidbit.github.io/isl-vds/ shows every
  rendered film in Urdu/English with title, description, hashtags (`film.json` → `publish`). Issues titled
  `render: <id> <lang>` render a film (`issue-command.yml`); `film: <id>` issues hold a script for Claude.
- The old 3D engine (`src/engine`, `src/library` except `src/two-d`, `stories/`) is abandoned; do not extend it.

## Islamic content rules (non-negotiable)
- Never depict Allah, Prophets, angels or named Companions in any form: not from behind, not as a silhouette, no
  shadow, hand or voice acting. A figure who might be a Prophet is not shown at all; tell it through narration,
  the place, or other people's reactions.
- Dialogue only from the source; animals do not speak. Point out where a script drifts from the Hadith.
- Show the reference on screen; `source.verified` stays false until the owner checks it (the sunnah.com link).
- Source text from `npm run hadith -- <collection> <number>` (Bukhari/Muslim, or Sahih/Hasan graded only).

## Sounds
Real recordings only via the `fetch-sfx.yml` workflow / `npm run fetch:sfx` (CC0 Freesound, secret FREESOUND_API_KEY; licences that allow monetised YouTube). Never BBC
Sound Effects. Generated sounds only for abstract effects. Details: skill `film-sounds`.

## Testing
`npm run typecheck`, `npm test`, `npm run validate:films` (`npm ci` first if `tsx` is missing). Local renders need
`REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## Usage limits
The owner is on a limited plan: one contact sheet per film, no re-reading large files (use grep / offset),
batch fixes, short replies.
