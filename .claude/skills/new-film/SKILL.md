---
name: new-film
description: Use whenever the owner pastes a story script, or says "issue #N wali script banao" (script is in that GitHub issue) (scenes, narration, camera, sound, Hadith/Quran reference) or asks for a new video/Short, even if they only paste the script with no other words. Runs the whole Tareeka 1 pipeline from script to preview contact sheet, in Urdu and English.
---

# New film from a pasted script (Tareeka 1)

The owner usually pastes only the script. Do not ask "kya karna hai": start this pipeline. Reply in short Hinglish.
Ask only if something truly blocks you (e.g. the reference is missing). Budget is tight: read only what you need.

## 0. Film id and setup
- Script in an issue: read it with GitHub MCP `issue_read` (boidbit/isl-vds, #N); title `film: <id>` gives the id.
- Film id: the one the owner gave, else kebab-case of the title (e.g. `sone-ka-matka`). Say which id you used.
- Branch: the session's development branch. Read nothing big up front.

## 1. Save the script
`films/<id>/script.md` = the script exactly as pasted (add a 1-line title header only).

## 2. Islamic check (before any code)
- Never depict Allah, Prophets, angels, named Companions. A possible Prophet = only from behind/silhouette; say why.
- Dialogue only from the source; animals never speak. List every place the script drifts from the Hadith/ayat
  and propose the fix in one short list. Keep `source.verified: false`.
- The reference is shown on screen (end card).

## 3. film.json (both languages)
Copy the shape of `films/gufa-ke-teen/film.json` (read it, it is the newest Short). Rules:
- `"format": "short"`, `"motionBlur": 5`, `"languages": ["ur", "en"]`.
- Each scene uses `lines`: `{ "speaker", "text", "voiceText", "en": { "text" } }`
  - `text` = Roman Urdu caption (simple, short, 2-4 words per caption chunk read well).
  - `voiceText` = same line in Devanagari, Urdu vocabulary (Gemini has no Urdu TTS; Hindustani speech sounds the same).
    Use Urdu words: "ज़िंदगी, मुश्किल, इंसान, शुक्रिया, अल्लाह", nuqta letters (ज़ फ़ ख़ ग़ क़).
  - `en.text` = natural, simple spoken English of the same line (it is both caption and voice text). Faithful to the
    Hadith meaning; keep names (Allah, Bukhari); no slang. Add `en.voiceText` only if pronunciation needs help.
  - Speaker = `narrator` or a character id defined in `voice.speakers` (voice + style). Max 2 characters per Gemini call.
- Hook line first (question / shock within 2 s). Total 45-60 s for a Short.
- `assets`: every library name the film uses (characters, places, props, `sfx-*`).

## 3b. Publish text (shown on the videos page with copy buttons)
`film.json` → `publish.ur` and `publish.en`, each `{ title, alts, description, hashtags }`:
- `title` ≤ 70 chars, a hook: curiosity gap or emotion + 1 emoji ("Gufa band ho gayi… teen neki ne jaan bacha li! 😱").
  True to the story, no fake claims. `alts`: 2 more hooks to test. Urdu = Roman Urdu; English = natural English.
- `description`: 2-3 lines of story + lesson, then `Reference: <refs>`, then a subscribe line.
- `hashtags`: 8-12, mix broad (`#Shorts #IslamicStories #Hadith`) + story-specific (`#Imaandari`, `#Honesty`);
  English channel uses English tags (`#IslamicStory #ProphetsTeachings` only if accurate).

## 4. Assets: reuse first, build the rest → skill `film-assets`
## 5. Sounds: real recordings → skill `film-sounds`

## 6. Visuals: `src/two-d/films/<PascalName>.tsx`, register in `src/two-d/films/index.ts`
- Follow skill `lively-motion` (no flat or dead frames). It is the quality bar.
- Pattern to copy: top of `src/two-d/films/GufaKeTeen.tsx` (imports, `L` layer helper, `pose`, scene constants) and
  one of its scenes. Read with offset/limit, not the whole file.
- On-screen text (hook, labels, end card) goes through `tr(lang, { ur: "...", en: "..." })` from `../film/types`,
  and `overlay: (f, lang) => <Overlay f={f} lang={lang} />`, so the English video has English text.
- Shot rules: every shot shows a character; object-only inserts ≤ 1 s then a face; both characters sharp when two
  share the frame; camera close, wide only to open/close; characters in the upper 2/3, captions sit at 75% height.

## 7. Check
```
npm run typecheck && npm test && npm run validate:films -- <id>
```
(`npm ci` first if `tsx` is missing.)

## 8. Preview: ONE contact sheet
Render ~8 stills (hook, each scene peak, end card) at `--scale=0.4`, tile them with ffmpeg, look at it yourself,
fix obvious problems, then send the sheet to the owner. Browser for local renders:
`REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
```
npx remotion still src/index.ts film-<id> <scratchpad>/s1.png --frame=N --scale=0.4 --browser-executable=$REMOTION_BROWSER
ffmpeg -y -i <scratchpad>/s%d.png -filter_complex tile=4x2 <scratchpad>/sheet.png
```
Put stills in the scratchpad dir, not the repo. One English still (`film-<id>-en`) of the end card is enough.

## 9. After the owner says OK
Commit + push the branch. Then skill `render-and-check` (lang `both`).

## Reply to the owner (short)
Film id, Hadith drift points (if any), new assets built, new sounds fetched, contact sheet, "push karun?".
