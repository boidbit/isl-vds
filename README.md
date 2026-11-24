# ISL-VDS: Islamic 3D Story Video Studio

Code se bani ek 3D animation studio. Har kahani ek **JSON file** hai. Engine usse
**1080p MP4** banata hai, YouTube (16:9) aur Shorts (9:16) dono ke liye.
Blender ya koi paid tool nahi chahiye: characters, registan, kuan, camera aur lighting sab code se bante hain.

```
stories/pyasa-kutta.json  ──►  validator  ──►  3D engine (Three.js + Remotion)  ──►  out/pyasa-kutta.mp4
   (Claude likhta hai)        (galti pakadta)     (characters, camera, light)          (YouTube / Shorts)
```

## Visual style

Art direction: **soft storybook cartoon + cinematic light** (poori detail: [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md)).
Gol, mulayam shapes, kapde par sheen, low golden sun + rim light + lavender shadows, depth of field,
hawa mein dhool, aur dur ke pahad dhund mein. Benchmark shot: `npm run render -- benchmark-pilana`.

## Phase 1 mein kya bana hai

| Hissa | Kya hai |
|---|---|
| **Story format** | `src/engine/schema.ts`: scenes, cast, actions, camera, subtitles, Hadith reference |
| **Validator** | Galat animation, galat character, scene se lambi action, galat camera target: render se pehle pakadta hai |
| **Characters** | Ek procedural insaan (6 presets: musafir, buzurg, naujawan, vyapari, gareeb, bachcha) + kutta (3 presets). Chehre par aankhen nahi: emotion body language se |
| **Animations** | Insaan: 15 (walk, walk-tired, climb, kneel-give, wipe-brow…). Kutta: 7 (lie-pant, lick-ground, drink, wag…). Har action ke beech smooth blending |
| **Locations** | Registan (ripple wali ret, sandstone chattanein, ghaas, dur ke mesa, baadal) aur registan-kuan (gol pattharon ka kuan, babool, khajoor) |
| **Environments** | morning, noon, afternoon, golden, night: key sun + rim + fill, color grade, bloom, vignette |
| **Post-processing** | Depth of field (subject par focus), bloom, ACES tone mapping, color grade, SMAA |
| **Camera** | 13 film shots (close-up, two-shot, over-shoulder, low-angle…) + moves (push-in, orbit, crane) + halka handheld drift |
| **Video** | Subtitles, title, fade transitions, letterbox, vignette, end card, hawa ki awaaz |
| **Automation** | GitHub Actions: har push par tests, aur ek button se MP4 render |

## Chalane ka tareeka

Node.js 22 chahiye.

```bash
npm install
```

```bash
npm run studio          # browser mein live preview + timeline (scrub karke dekho)
```

```bash
npm run validate        # saari stories check karo
```

```bash
npm run render -- pyasa-kutta              # out/pyasa-kutta.mp4 (1920x1080)
```

```bash
npm run render -- pyasa-kutta --short      # Shorts ke liye 1080x1920
```

```bash
npm run render -- pyasa-kutta --scale 0.5  # jaldi preview, aadhi resolution
```

```bash
npm run still -- pyasa-kutta               # har scene ki ek PNG -> out/stills/
```

```bash
npm test                # engine ke unit tests
```

Bina internet wali machine par Chrome ka path do: `REMOTION_BROWSER=/path/to/chrome-headless-shell npm run render -- ...`

### GitHub par render (bina apne computer ke)

Repo > **Actions** > **Render video** > **Run workflow** > story id daalo. 10 se 20 minute baad MP4
"Artifacts" mein download ke liye milegi. Public repo par ye free hai.

## Nayi kahani kaise banayein

1. Authentic source chuno (Hadith number / ayat) aur text khud verify karo.
2. [`docs/STORY_PROMPT.md`](docs/STORY_PROMPT.md) wala prompt Claude ko do, saath mein source text.
3. Jo JSON mile use `stories/<naam>.json` mein save karo aur `src/stories.ts` mein import karo.
4. `npm run validate`. Error aaye to Claude ko wapas do.
5. `npm run still` se scenes dekho, phir `npm run render`.
6. Reference dobara check karo, `"verified": true` karo, tab publish karo.

## Folder structure

```
stories/                 kahaniyan (JSON)
src/engine/              schema, timeline, camera, renderer (story -> frames)
src/library/characters/  insaan + kutta: model, animations, presets
src/library/locations/   registan, aasmaan, terrain
src/library/props/       kuan, khuff, pathar, ped, paani
scripts/                 validate, render, stills
tests/                   unit tests
public/sfx/              awaazein (hawa)
```

## Aage ka roadmap

- **Phase 2 (Story Engine):** Locations badhana (gaon, ghar, bazaar), 3 to 4 nayi kahaniyan.
- **Phase 3 (Cinematic):** Free GLB/Mixamo characters ko optional replacement ki tarah lagana, kapdon ki behtar shading, dhool aur garmi ka effect.
- **Phase 4 (Studio):** Narration (apni awaaz ya TTS) ko scene timing se jodna, background nasheed/ambience mix.
- **Phase 5 (Automation):** Source text se seedha story JSON, phir render, phir human review.

## Zaroori note

- Anbiya, farishton aur Sahaba ko kabhi character ki tarah na dikhayein.
- `source.verified: false` par validator warning deta hai. Publish se pehle reference khud check karein.
- Remotion individuals aur 3 logon tak ki companies ke liye free hai. Badi team ho to unka license dekhein.
