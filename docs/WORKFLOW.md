# Roz ki video: Tareeka 1

1. Script likho (scene, environment, action, camera, narration, sound + Hadith/ayat reference).
2. claude.ai/code par script do: "Nayi script, naam `<film-id>`, video bana do."
3. Claude banata hai: `films/<film-id>/script.md`, `film.json` (subtitle + Devanagari voice text),
   scene visuals (`src/two-d/films/`), aur naye assets (`src/two-d/library/`, registry mein entry).
   Preview sheet dikhata hai, tumhari haan ke baad push karta hai.
4. GitHub → Actions → **Render film** → Run workflow → film id daalo.
   Steps: validate (missing assets?) → Gemini voice → render → Artifacts mein MP4 + voice files.
5. Video dekho, reference check karo, `source.verified: true` karwa do, publish.

Render fail ho ("Missing assets: ...") to claude.ai/code par error batao: asset banega, phir dobara Run.

Secrets: `GEMINI_API_KEY` (Settings → Secrets and variables → Actions). Voice settings `film.json` → `voice`
(model `gemini-3.8-flash-tts`, voice `Sulafat`, style). Urdu TTS list mein nahi hai, isliye awaaz ka text Devanagari Hindi mein.
