# Claude ke liye story prompt template

Nayi kahani ke liye ye poora prompt Claude ko do. `<<...>>` wali jagah bharo.
Claude sirf JSON dega. Use `stories/<id>.json` mein save karo, `npm run validate` chalao,
errors aayen to wahi errors Claude ko wapas paste kar do.

> **Zaroori:** Kahani ka source (Quran ayat / Hadith number) tum khud dete ho, Claude nahi.
> Claude sirf diye gaye verified text ko scenes mein badalta hai. Publish karne se pehle
> reference sunnah.com / quran.com par khud check karo aur `source.verified` ko `true` karo.

---

```
You are the director of a stylized 3D animated Islamic short film. Convert the
VERIFIED source text below into a story JSON for my rendering engine.

SOURCE (verified by me):
<<Hadith/ayah reference, e.g. Sahih al-Bukhari 2363>>
<<English or Urdu translation of the full text>>

RULES
- Do not add events, dialogue or details that are not in the source. Narration may
  describe feelings only if they are implied by the text.
- Never depict a Prophet, an angel, or a named Companion as a character.
- Subtitles in simple Roman Hindi/Urdu, max ~12 words per line.
- Total length 45-75 seconds. 6-10 scenes, each 4-10 seconds.
- Vary camera shots: establishing -> medium/close-up -> two-shot/over-shoulder ->
  emotional low-angle/close-up. Never use the same shot type 3 times in a row.
- Characters stay inside a 12 m radius of the origin. The well (location
  "registan-kuan") is at [0,0,0] with radius 1.1 m; an acacia tree stands at
  [-4.5,0,-3.2]. Nothing may stand inside those.
- Actions of one actor must not overlap; each must end inside its scene.
- Output ONLY the JSON, matching the format of the example below.

CATALOG (only these names exist)
- character types/presets: human = musafir, buzurg, naujawan, vyapari, gareeb, bachcha
                           dog = desert-dog, street-dog, white-dog
- human animations: idle, walk, walk-tired, run, look-around, wipe-brow, tired, realize,
  point, kneel, kneel-give, kneel-comfort, sit, climb, drink-hands
- dog animations: idle, walk, lie-pant, lie-look, lick-ground, drink, wag
- locations: registan, registan-kuan
- environments: morning, noon, golden, night
- props: well, rock, shrub, acacia, wet-sand, puddle, khuff
- holdable: khuff in slot rightHand | leftHand | mouth (with optional "pour": [from,to])
- camera shots: establishing, wide, full, medium, close-up, extreme-close-up, low-angle,
  high-angle, top-down, side, tracking, two-shot (2 targets), over-shoulder (2 targets)
- camera moves: follow, static, push-in, pull-out, orbit, crane-up, crane-down

EXAMPLE
<<paste stories/pyasa-kutta.json here>>
```
