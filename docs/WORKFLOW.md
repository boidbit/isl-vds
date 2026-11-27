# Roz ki video: Tareeka 1

**Videos page:** https://boidbit.github.io/isl-vds/ — Urdu/English videos, title, description, hashtags (copy
button), MP4 download, "Render" button. Ek baar setup: GitHub → Settings → Pages → Source: **GitHub Actions**.

1. Naya chat kholo (claude.ai/code, isi repo par) aur **sirf script paste karo**. Film id dena ho to upar
   likh do, warna Claude title se bana lega.
2. Claude khud karta hai: script save, Hadith check, `film.json` (Urdu + English lines), purane assets reuse,
   naye assets bana kar library mein save, real sounds, scene visuals, ek preview sheet.
3. Tum "ok" bolo → Claude push karta hai aur GitHub par render chalata hai (Urdu + English dono).
4. GitHub → Actions → **Render film** → Artifacts: `<id>.mp4` (Urdu channel) aur `<id>-en.mp4` (English channel).
   Khud chalana ho to: Run workflow → film id → lang `ur` / `en` / `both`, ya page par "Render" dabao
   (issue `render: <film-id> both` khulta hai, render hota hai, page update ho jata hai).
5. Reference check karo, `source.verified: true` karwao, dono channel par publish.

## Secrets (GitHub → Settings → Secrets and variables → Actions)
- `GEMINI_API_KEY`: Urdu/Hindi awaaz.
- `GEMINI_API_KEY_EN` (naya, optional): English awaaz isi key se banti hai, taaki purani key ka quota bache.
  Na ho to English bhi `GEMINI_API_KEY` se banti hai.

Gemini mein Urdu TTS nahi hai, isliye Urdu track ki awaaz Devanagari text (Urdu alfaaz) se banti hai; bolne mein
Urdu jaisi hi lagti hai. Captions Roman Urdu mein.
