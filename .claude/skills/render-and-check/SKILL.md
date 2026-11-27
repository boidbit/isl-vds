---
name: render-and-check
description: Use after a film is pushed, or when the owner asks to render, check or fix a rendered video. Triggers the GitHub "Render film" workflow (Urdu, English or both), downloads the artifact and checks timing and sound levels.
---

# Render on GitHub and check

## 1. Trigger
GitHub MCP `actions_run_trigger` on `boidbit/isl-vds`, workflow `render-film.yml`, ref = the pushed branch,
inputs `{ film: "<id>", lang: "both", voice: "true" }` (lang: `ur`, `en` or `both`).
Voice: `ur` uses secret `GEMINI_API_KEY`; `en` uses `GEMINI_API_KEY_EN` if set (own quota), else `GEMINI_API_KEY`.
Do not poll in a tight loop: check the run status every few minutes (a render takes ~10-30 min).

## 2. If it fails
Read only the failing step log (`get_job_logs` with failed-only / tail). Common: "Missing assets" (build it, skill
`film-assets`), Gemini 429 (quota: wait or use the other key), schema error in film.json.

## 3. Download + check (artifact `<id>-video`: `out/<id>.mp4`, `out/<id>-en.mp4`, voice folders)
- Length: `ffprobe -show_entries format=duration` (Short ≤ 60 s; tell the owner if longer).
- Lines: `public/voice/<id>[-en]/timing.json`: every line present, none under 0.5 s or cut off.
- Levels: `ffmpeg -i x.mp4 -af volumedetect -f null -` → max_volume below -1 dB, mean around -16..-20 dB.
  Per-second peaks: `ffmpeg -i x.mp4 -af astats=metadata=1:reset=30,ametadata=print:key=lavfi.astats.Overall.Peak_level -f null -`
  A sound louder than the narration → lower its volume in the film visuals.
- One frame from the middle of each language to make sure captions are in the right language.

## 4. Report (short Hinglish)
Run link, both MP4 lengths, any issue fixed, reminder: reference check karke `source.verified: true` karo, phir
Urdu video Urdu channel par, English video English channel par.
