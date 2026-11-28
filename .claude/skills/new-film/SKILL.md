---
name: new-film
description: Use whenever the owner pastes a story script, gives only a Hadith number / topic for a new Short, or says "issue #N wali script banao" (script is in that GitHub issue) (scenes, narration, camera, sound, Hadith/Quran reference) or asks for a new video/Short, even if they only paste the script with no other words. Runs the whole Tareeka 1 pipeline from script to preview contact sheet, in Urdu and English.
---

# New film from a pasted script (Tareeka 1)

The owner usually pastes only the script. Do not ask "kya karna hai": start this pipeline. Reply in short Hinglish.
Ask only if something truly blocks you (e.g. the reference is missing). Budget is tight: read only what you need.

## 0. Film id and setup
- Script in an issue: read it with GitHub MCP `issue_read` (boidbit/isl-vds, #N); title `film: <id>` gives the id.
- Film id: the one the owner gave, else kebab-case of the title (e.g. `sone-ka-matka`). Say which id you used.
- Branch: the session's development branch. Read nothing big up front.

## 1. Save the script
`films/<id>/script.md` = the script exactly as pasted (add a 1-line title header only). If the owner gave only a
Hadith number / topic, write the script yourself with skill `story-craft` and save that.

## 1b. Story craft (always, before any code) → skill `story-craft`
Fetch the source text (`npm run hadith -- <collection> <number> --film <id>`), read the full source, score the script (hook, open loop, heart, twist, ending from the source). Below 8/10, or the
owner says it feels flat: rewrite the telling (keep the owner's scenes/ideas where they work) and show the owner
the improved script + score in the first reply. Build from the improved version.

## 2. Islamic check (before any code)
- Never depict Allah, Prophets, angels, named Companions in any form (no back view, silhouette, shadow or hand).
  A possible Prophet is not shown at all: narration, place or other people's reactions only. Flag it in the drift list.
- Dialogue only from the source; animals never speak. List every place the script drifts from the Hadith/ayat
  and propose the fix in one short list. Keep `source.verified: false`.
- The reference is shown on screen: small, under the end line. **No long Hadith text card** in the video: the
  story ends, the narrator says the Hadith point in one line ("Rasoolullah ﷺ ne bataya…"), then the end card.
  The Hadith meaning (translation) goes in the description instead.

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
- **Narration that sounds told, not read** (rewrite the script's lines if they are choppy):
  - ~110-130 spoken words for 45-60 s (Urdu and English alike); 1-2 lines per scene, mix one long and one short.
  - Talk to the viewer like a storyteller: "Socho…", "Aur phir…", "Lekin usne…", "Pata hai kya hua?". Connect
    scenes ("Din guzre…", "Usi raat…"); no bare report sentences like "Waqt guzarta gaya." on their own.
  - Use "…" for a breath before a reveal; at most one inner full stop per line (they become long pauses).
  - The whole narration of a language is one Gemini call (`scripts/voice.ts`), cut at the pauses: keep every
    line a complete thought so the cut points are clean. Do not split one sentence across two scenes.
  - `voice.speakers.narrator.style` follows the mood of this film (e.g. "suspense at the start, soft and sad in
    the middle, warm at the end"); never just "fast and energetic" for a sad story.
- **End line every film:** the last scene ends with a 3-6 word memorable line on screen (like "Bejubaan hain,
  bejaan nahi."), the reference small under it, and the narrator's last words lead to it. If the script has
  none, write one and tell the owner. Put a matching comment question in the description.
- `assets`: every library name the film uses (characters, places, props, `sfx-*`).

## 3b. Publish text (shown on the videos page with copy buttons)
`film.json` → `publish.ur` and `publish.en`, each `{ title, alts, description, hashtags }`. **Never reveal the
ending** (no outcome, no moral answer) in title or description: open a loop the video closes.
- `title` ≤ 70 chars: setup + twist + open question/ellipsis + 1 emoji. Formula: "<shocking situation>… <why/what
  next?>". E.g. "Zameen khodi to sone ka matka nikla… lekin dono ne lene se inkaar kyun kiya? 🤯". True to the story,
  no fake claims. `alts`: 2 more hooks (stakes / "aakhir tak dekhna" / relatable question).
- `description`: line 1-2 = cinematic setup + cliffhanger (first ~100 chars show in the feed), then a comment
  question ("Aap hote to kya karte?"), then `📖 Reference: <refs>` + one-line Hadith meaning (the video has no
  Hadith text card), then `🔔` subscribe line.
- `hashtags`: 8-12, `#Shorts` first, broad (`#IslamicStories #Hadith`) + story-specific; English channel uses English.
- Urdu = Roman Urdu; English = natural English, same no-spoiler rules.
- Never call the series "sachchi kahani": some films will add fictional parts. If a film adds fiction to a Hadith
  story, say so in the description ("kahani mein kuch hisse tasawwur par mabni hain") and keep the Hadith part exact.

## 3c. Thumbnail (`film.json` → `thumbnail`, rendered as `thumb-<id>` / `thumb-<id>-en`)
Suspense, never the ending. `at` = nominal frame with a big emotional face (fear, shock, wonder) AND the mystery
in view (pot, closed cave, dog). `text` = 2-4 BIG words that open a question ("Khazana mila… phir?" /
"Gold found… then?"). `zoom` 1.2-1.6 on the face (`focus` 0..1), red `circle` or `arrow` on the mystery
(output coordinates 0..1). Text sits on the top (default) away from faces. Check it in the contact sheet.

## 4. Assets: reuse first, build the rest → skill `film-assets`
## 5. Sounds: real recordings → skill `film-sounds`

## 6. Visuals: `src/two-d/films/<PascalName>.tsx`, register in `src/two-d/films/index.ts`
- Follow skill `lively-motion` (no flat or dead frames). It is the quality bar.
- **A look of its own (so the channel's thumbnails never look the same):** read the "Look table" in
  docs/ART_DIRECTION.md, then pick for this film a `look` preset (`src/two-d/film/looks.tsx`, or add a new one),
  a main location, time of day and palette that differ from the last 2 films; set `"look"` in film.json and add a
  row to the table. The look also colours the thumbnail (text, stroke, frame).
- Plan the shots with the lively-motion rules: 2-5 front close-ups (body out of the frame, 3/4 mix), OTS and hand
  inserts between them, 4+ transitions/effects, props held in the fist, `beats` on cuts that match words,
  `until` on long sounds, every man with his own face/build (`LOOKS` variety fields).
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
Film id, story score (+ what you changed in the telling), Hadith drift points (if any), new assets built, new
sounds fetched, contact sheet, "push karun?".
