// "Pyase Kutte Ki Kahani": 6-scene script, 2D cartoon style.
// Scene -> shots, each with its own camera. Assets come from the 2D library.

import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { FilmVisuals } from "../film/types";
import { Dog2D, type DogPose } from "../Dog2D";
import { blink, clamp01, kf, layerTransform, mix, type Cam, W, H } from "../kit";
import { BASE_POSE, Musafir, type MusafirPose } from "../Musafir";
import { Clouds, FarMountains, GROUND_Y, Grass, Ground, MidDunes, Palm, Rock, Sky, Sun } from "../Scenery";
import { BackShoulder, CuppedHands, GreenTree, KhuffFilling, TopDownMan, WaterCloseup, WetMud } from "../library/Closeups";
import { WellBack, WellFront, WellOpening, WellShaft, WellTopDown } from "../library/Well";

const FILM_FRAMES = 960;

// ------------------------------------------------------------------ timeline
const S1 = 0; // tapta registan
const S2 = 150; // paani ki talaash: top-down, hands, climb out
const S2b = 195;
const S2c = 240;
const S3 = 270; // pyasa kutta, rack focus
const S4 = 420; // rehamdili: over-shoulder, khuff fills, climbing
const S4b = 480;
const S4c = 555;
const S5 = 630; // neki: side profile, dog close-up
const S5b = 690;
const S6 = 750; // khoobsurat anjaam
const END = FILM_FRAMES;

const WELL_X = 2200;
const TREE_X = 2760;

// ------------------------------------------------------------------ helpers
const blurAttr = (v: number) => (v < 0.5 ? undefined : `url(#blur${Math.min(10, Math.round(v))})`);

const L: React.FC<{ cam: Cam; depth: number; blur?: number; children: React.ReactNode }> = ({ cam, depth, blur = 0, children }) => (
  <g transform={layerTransform(cam, depth)} filter={blurAttr(blur)}>
    {children}
  </g>
);

/** The exterior desert world: every outdoor shot renders this with its own camera. */
const World: React.FC<{ cam: Cam; t: number; warm: boolean; bgBlur?: number; action: React.ReactNode; front?: React.ReactNode }> = ({
  cam,
  t,
  warm,
  bgBlur = 0,
  action,
  front,
}) => (
  <>
    <L cam={cam} depth={0}>
      <Sky warm={warm ? 1 : 0} />
    </L>
    <L cam={cam} depth={0.05}>
      <Sun x={warm ? 2300 : 1700} y={warm ? 560 : 220} />
    </L>
    <L cam={cam} depth={0.12}>
      <g transform={`translate(${t * 12} 0)`}>
        <Clouds />
      </g>
    </L>
    <L cam={cam} depth={0.3} blur={bgBlur * 0.6}>
      <FarMountains />
    </L>
    <L cam={cam} depth={0.6} blur={bgBlur * 0.8}>
      <MidDunes />
      <Palm x={500} y={760} s={0.65} sway={Math.sin(t) * 2} />
      <Palm x={3500} y={740} s={0.7} lean={-1} sway={Math.sin(t + 1) * 2} />
    </L>
    <L cam={cam} depth={1}>
      <Ground />
      <Rock x={1100} y={GROUND_Y + 10} s={0.8} />
      <Rock x={3100} y={GROUND_Y + 30} s={1.2} />
      <Grass x={1750} y={GROUND_Y + 20} s={1} t={t} />
      <Grass x={2950} y={GROUND_Y + 5} s={1.1} t={t} />
      <GreenTree x={TREE_X} y={GROUND_Y} s={1.05} sway={Math.sin(t * 0.8) * 1.5} />
      <WetMud x={2350} y={GROUND_Y + 18} />
      {action}
    </L>
    {front}
  </>
);

const footstepFrames = (from: number, to: number, every: number) => Array.from({ length: Math.floor((to - from) / every) }, (_, i) => from + i * every);

// ------------------------------------------------------------------ scenes
const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const x = kf(f, [[S1, 260], [S2, 1500]], (v) => v);
  const shade = clamp01(kf(f, [[18, 0], [30, 1], [62, 1], [76, 0]]));
  const step = (x / 100) * Math.PI;
  const pose: MusafirPose = {
    ...BASE_POSE,
    time: t,
    walk: 1,
    step,
    lean: 10,
    headTilt: 8 - shade * 12,
    armF: [mix(Math.sin(step) * 14, 158, shade), mix(14, 112, shade)],
    armB: [-Math.sin(step) * 14, 10],
    eyeOpen: (0.5 + shade * 0.25) * blink(f),
    brow: -0.7,
    mouth: "pant",
    look: 1,
    sweat: ((f % 50) / 50) * (1 - shade),
  };
  // wide establishing, then side-tracking that slowly moves closer
  const track = clamp01(kf(f, [[60, 0], [110, 1]]));
  const cam: Cam = {
    x: mix(1250, x + 260, track),
    y: mix(520, 600, track),
    zoom: mix(0.7, kf(f, [[60, 1.0], [S2, 1.45]]), track),
  };
  return (
    <World
      cam={cam}
      t={t}
      warm={false}
      action={
        <>
          <WellBack x={WELL_X} y={GROUND_Y + 10} />
          <WellFront x={WELL_X} y={GROUND_Y + 10} />
          <Musafir x={x} y={GROUND_Y + 12} pose={pose} />
        </>
      }
      front={
        <L cam={cam} depth={1.35}>
          <Grass x={1200} y={GROUND_Y + 220} s={1.8} t={t} />
          <Rock x={700} y={GROUND_Y + 260} s={1.6} />
        </L>
      }
    />
  );
};

const Scene2: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  if (f < S2b) {
    // top-down: he lowers himself into the well
    const k = clamp01(kf(f, [[S2, 0], [S2b, 1]]));
    return (
      <g transform={`translate(${W / 2} ${H / 2}) rotate(${k * 10}) scale(${1 + k * 0.15})`}>
        <WellTopDown t={t} />
        <TopDownMan x={0} y={0} s={mix(1.25, 0.32, k)} reach={1 - k} />
        <circle r={375} fill="#0b1418" opacity={k * 0.35} />
      </g>
    );
  }
  if (f < S2c) {
    // close-up: cupped hands touch the water and drink
    const handY = kf(f, [[S2b, 220], [S2b + 14, 600], [S2b + 26, 600], [S2b + 42, 330]]);
    const water = clamp01(kf(f, [[S2b + 22, 0], [S2b + 30, 1]]));
    return (
      <g transform={`translate(${W / 2} ${H / 2}) scale(${kf(f, [[S2b, 1], [S2c, 1.08]])}) translate(${-W / 2} ${-H / 2})`}>
        <WaterCloseup t={t} ripples={[{ x: 960, age: (f - (S2b + 14)) / 24 }]} />
        <CuppedHands x={960} y={handY} water={water} t={t} />
        <rect x={-200} y={640} width={2320} height={600} fill="#1f6f8c" opacity={handY > 560 ? 0.35 : 0} />
      </g>
    );
  }
  // quick cut: climbing out over the rim
  const rise = kf(f, [[S2c, GROUND_Y + 330], [S2c + 18, GROUND_Y - 150]]);
  const outK = clamp01(kf(f, [[S2c + 18, 0], [S3, 1]]));
  const x = mix(WELL_X, WELL_X + 220, outK);
  const y = mix(rise, GROUND_Y + 12, outK) - Math.sin(outK * Math.PI) * 50;
  const climb = Math.sin(t * 14);
  const pose: MusafirPose = {
    ...BASE_POSE,
    time: t,
    eyeOpen: blink(f),
    brow: 0.3,
    mouth: "neutral",
    armF: [mix(150 + climb * 15, 20, outK), mix(30, 10, outK)],
    armB: [mix(150 - climb * 15, -10, outK), mix(30, 10, outK)],
    look: 0.5,
  };
  const cam: Cam = { x: 2290, y: 600, zoom: 1.5 };
  const man = <Musafir x={x} y={y} pose={pose} />;
  return (
    <World
      cam={cam}
      t={t}
      warm={false}
      action={
        <>
          <defs>
            <clipPath id="aboveGround">
              <rect x={0} y={-2000} width={6000} height={2000 + GROUND_Y + 14} />
            </clipPath>
          </defs>
          <WellBack x={WELL_X} y={GROUND_Y + 10} />
          {outK < 0.6 && <g clipPath="url(#aboveGround)">{man}</g>}
          <WellFront x={WELL_X} y={GROUND_Y + 10} />
          {outK >= 0.6 && man}
        </>
      }
    />
  );
};

const thirstyDog = (f: number): DogPose => ({
  lie: 0,
  headDown: 1,
  headUp: 0,
  tongue: 1,
  pant: 1,
  wag: 0,
  eyeOpen: 0.5 * blink(f, 33),
  happy: 0,
  ears: 0,
  lap: 1,
  time: f / 30,
});

const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  // rack focus: dog sharp -> man sharp
  const k = clamp01(kf(f, [[S3 + 75, 0], [S3 + 110, 1]]));
  const walkK = clamp01(kf(f, [[S3, 1], [S3 + 30, 0]]));
  const mx = kf(f, [[S3, 2830], [S3 + 30, 2680]]);
  const stopped = 1 - walkK;
  const pose: MusafirPose = {
    ...BASE_POSE,
    time: t,
    walk: walkK,
    step: (mx / 100) * Math.PI,
    lean: 6,
    headTilt: 14 * stopped,
    eyeOpen: (0.6 + stopped * 0.3) * blink(f, 12),
    brow: -1 * stopped,
    mouth: stopped > 0.5 ? "sad" : "pant",
    look: 1,
    armF: [mix(0, 25, clamp01(kf(f, [[S3 + 60, 0], [S3 + 80, 1]]))), mix(10, 105, clamp01(kf(f, [[S3 + 60, 0], [S3 + 80, 1]])))],
  };
  const cam: Cam = { x: kf(f, [[S3, 2440], [S4, 2470]]), y: 740, zoom: kf(f, [[S3, 2.0], [S4, 2.2]]) };
  return (
    <World
      cam={cam}
      t={t}
      warm={false}
      bgBlur={4}
      action={
        <>
          <WellBack x={WELL_X} y={GROUND_Y + 10} />
          <WellFront x={WELL_X} y={GROUND_Y + 10} />
        </>
      }
      front={
        <>
          {/* the man stands a little behind the dog: his own plane for the rack focus */}
          <L cam={cam} depth={0.9} blur={(1 - k) * 7}>
            <Musafir x={mx} y={GROUND_Y - 20} flip scale={0.95} pose={pose} />
          </L>
          <L cam={cam} depth={1.02} blur={k * 6}>
            <Dog2D x={2500} y={GROUND_Y + 14} flip pose={thirstyDog(f)} />
          </L>
        </>
      }
    />
  );
};

const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  if (f < S4b) {
    // over-the-shoulder into the well
    const z = kf(f, [[S4, 1], [S4b, 1.1]]);
    return (
      <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${-W / 2} ${-H / 2})`}>
        <WellOpening t={t} />
        <g filter="url(#blur3)">
          <BackShoulder x={360} y={kf(f, [[S4, 900], [S4b, 960]])} s={1.15} />
        </g>
      </g>
    );
  }
  if (f < S4c) {
    // the leather sock fills with water
    const y = kf(f, [[S4b, 60], [S4b + 18, 420], [S4b + 55, 420], [S4c, 120]]);
    const fill = clamp01(kf(f, [[S4b + 18, 0], [S4b + 52, 1]]));
    return (
      <g transform={`translate(${W / 2} ${H / 2}) scale(${kf(f, [[S4b, 1.02], [S4c, 1.12]])}) translate(${-W / 2} ${-H / 2})`}>
        <WaterCloseup t={t} ripples={[{ x: 990, age: (f - (S4b + 18)) / 24 }, { x: 990, age: (f - (S4b + 58)) / 24 }]} />
        <KhuffFilling x={960} y={y} fill={fill} t={t} />
        <rect x={-200} y={642} width={2320} height={600} fill="#1f6f8c" opacity={0.4} />
        {f > S4b + 58 &&
          [0, 1, 2].map((i) => {
            const yy = y + 380 + ((t * 400 + i * 60) % 200);
            return yy < 640 ? <path key={i} transform={`translate(${1000 + i * 50} ${yy})`} d="M 0 -14 Q 9 2 0 10 Q -9 2 0 -14 Z" fill="#bfeaf8" stroke="#4c9cc0" strokeWidth={3} /> : null;
          })}
      </g>
    );
  }
  // low angle inside the shaft: he climbs towards the light, sock in his teeth
  const k = kf(f, [[S4c, 0], [S5, 1]], (v) => v);
  const camY = mix(1000, -350, k);
  const manY = mix(1650, -260, k);
  const c = Math.sin(t * 9);
  // hands reach for the right-hand wall, body pressed close to it
  const wallX = 1290 + ((manY - 300 + 1180) / 2980) * 330;
  const pose: MusafirPose = {
    ...BASE_POSE,
    time: t,
    khuff: "mouth",
    mouth: "neutral",
    eyeOpen: blink(f),
    brow: -0.2,
    look: 0.2,
    headTilt: -18,
    lean: 6,
    armF: [138 + c * 16, 6 + Math.max(0, c) * 22],
    armB: [138 - c * 16, 6 + Math.max(0, -c) * 22],
  };
  return (
    <g transform={`translate(0 ${H / 2 - camY})`}>
      <WellShaft t={t} />
      <Musafir x={wallX - 190} y={manY} pose={pose} scale={1.35} noShadow />
    </g>
  );
};

const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const place = clamp01(kf(f, [[S5, 0], [S5 + 18, 1]]));
  const drinkK = clamp01(kf(f, [[S5 + 14, 0], [S5 + 26, 1]]));
  const revive = clamp01(kf(f, [[S5 + 30, 0], [S6, 1]]));
  const pose: MusafirPose = {
    ...BASE_POSE,
    time: t,
    kneel: 1,
    lean: 24,
    headTilt: 18,
    eyeOpen: 0.8 * blink(f, 7),
    brow: -0.2 + revive * 0.9,
    mouth: revive > 0.4 ? "smile" : "neutral",
    look: 0.6,
    armF: [mix(40, 58, place), mix(40, 14, place)],
    armB: [26, 30],
    khuff: place < 1 ? "hand" : "none",
  };
  const dog: DogPose = {
    ...thirstyDog(f),
    headDown: 1,
    lap: drinkK,
    pant: 1 - revive * 0.6,
    wag: revive * 0.7,
    happy: revive,
    ears: revive * 0.5,
    eyeOpen: (f >= S5b ? 0.45 : 0.6) * blink(f, 33),
  };
  const cam: Cam =
    f < S5b
      ? { x: kf(f, [[S5, 2420], [S5b, 2440]]), y: 650, zoom: kf(f, [[S5, 1.7], [S5b, 1.8]]) }
      : { x: kf(f, [[S5b, 2445], [S6, 2455]]), y: 765, zoom: kf(f, [[S5b, 3.0], [S6, 3.3]]) };
  return (
    <World
      cam={cam}
      t={t}
      warm={false}
      bgBlur={f < S5b ? 2 : 5}
      action={
        <>
          <WellBack x={WELL_X} y={GROUND_Y + 10} />
          <WellFront x={WELL_X} y={GROUND_Y + 10} />
          {place >= 1 && (
            <g transform={`translate(2425 ${GROUND_Y + 14})`}>
              <path d="M -16 -50 L -17 -8 Q -17 4 0 4 L 28 4 Q 38 4 38 -4 Q 38 -12 24 -14 L 14 -16 L 14 -50 Z" fill="#8f5a33" stroke="#3d2a1e" strokeWidth={4} strokeLinejoin="round" />
              <ellipse cx={-1} cy={-50} rx={16} ry={6} fill="#7fc9e6" stroke="#3d2a1e" strokeWidth={3} />
            </g>
          )}
          <Musafir x={2290} y={GROUND_Y + 12} pose={pose} />
          <Dog2D x={2575} y={GROUND_Y + 14} flip pose={dog} />
        </>
      }
    />
  );
};

const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const stand = clamp01(kf(f, [[S6, 0], [S6 + 22, 1]]));
  const mx = kf(f, [[S6 + 25, 2330], [END, 3350]], (v) => v);
  const walking = f > S6 + 25 ? 1 : 0;
  const pose: MusafirPose = {
    ...BASE_POSE,
    time: t,
    kneel: 1 - stand,
    walk: walking,
    step: (mx / 100) * Math.PI,
    lean: mix(24, 4, stand),
    headTilt: mix(18, 0, stand),
    eyeOpen: 0.9 * blink(f, 7),
    brow: 0.6,
    mouth: "smile",
    look: 1,
    armF: [walking ? Math.sin((mx / 100) * Math.PI) * 14 : 10, 14],
    armB: [walking ? -Math.sin((mx / 100) * Math.PI) * 14 : -6, 10],
  };
  const dog: DogPose = { lie: 0, sit: 1, headDown: 0, headUp: 0.35, tongue: 0.5, pant: 0.2, wag: 0.6, eyeOpen: blink(f, 33), happy: 1, ears: 0.7, lap: 0, time: t };
  const k = clamp01(kf(f, [[S6, 0], [S6 + 140, 1]]));
  const cam: Cam = { x: mix(2560, 2600, k), y: mix(640, 470, k), zoom: mix(1.6, 0.66, k) };
  return (
    <World
      cam={cam}
      t={t}
      warm
      action={
        <>
          <WellBack x={WELL_X} y={GROUND_Y + 10} />
          <WellFront x={WELL_X} y={GROUND_Y + 10} />
          <Musafir x={mx} y={GROUND_Y + 12} pose={pose} />
          <Dog2D x={TREE_X - 30} y={GROUND_Y + 14} flip pose={dog} />
        </>
      }
    />
  );
};

// ------------------------------------------------------------------ sound design (nominal frames)
const sfx = (file: string, frames: number[], volume: number) => frames.map((at) => ({ file: `sfx/${file}`, at, volume }));
const SFX: FilmVisuals["sfx"] = [
  ...sfx("step.wav", footstepFrames(4, S2, 12), 0.55),
  ...sfx("splash.wav", [S2b + 14], 0.8),
  ...sfx("drip.wav", [S2b + 30, S2b + 36, S2b + 41], 0.5),
  ...sfx("scrape.wav", [S2c + 4, S2c + 12, S2c + 20], 0.6),
  ...sfx("step.wav", footstepFrames(S3, S3 + 30, 12), 0.4),
  ...sfx("pant.wav", footstepFrames(S3, S4, 10), 0.55),
  ...sfx("splash.wav", [S4b + 18], 0.8),
  ...sfx("drip.wav", [S4b + 60, S4b + 66, S4b + 71], 0.5),
  ...sfx("scrape.wav", footstepFrames(S4c, S5, 15), 0.5),
  ...sfx("lap.wav", footstepFrames(S5 + 26, S6, 7), 0.45),
  ...sfx("step.wav", footstepFrames(S6 + 25, END - 20, 12), 0.35),
];

// ------------------------------------------------------------------ title + end card (nominal frames)
const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const titleO = interpolate(f, [14, 32, 110, 135], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const moralO = interpolate(f, [852, 872], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 110, opacity: titleO }}>
        <div style={{ fontFamily: "'DejaVu Serif', Georgia, serif", fontWeight: 700, fontSize: 92, color: "#fff7e6", WebkitTextStroke: "3px #6b3a1c", textShadow: "0 6px 0 #8a4b22, 0 10px 24px rgba(0,0,0,0.35)" }}>
          Pyase Kutte Ki Kahani
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: moralO }}>
        <div style={{ textAlign: "center", background: "rgba(60,30,12,0.55)", padding: "36px 60px", borderRadius: 28, fontFamily: "'DejaVu Serif', Georgia, serif", color: "#fffaf0" }}>
          <div style={{ fontSize: 66, fontWeight: 700 }}>Kisi bhi neki ko chhota mat samjho.</div>
          <div style={{ fontSize: 36, marginTop: 18, color: "#f6dcb0" }}>Sahih al-Bukhari — 2363</div>
        </div>
      </AbsoluteFill>
    </>
  );
};

/** Scene visuals keyed by the scene ids in films/pyasa-kutta/film.json */
export const pyasaKuttaVisuals: FilmVisuals = {
  scenes: {
    "s1-tapta-registan": { nominal: [S1, S2], render: (f) => <Scene1 f={f} /> },
    "s2-paani-ki-talaash": { nominal: [S2, S3], render: (f) => <Scene2 f={f} /> },
    "s3-pyasa-kutta": { nominal: [S3, S4], render: (f) => <Scene3 f={f} /> },
    "s4-rehamdili": { nominal: [S4, S5], render: (f) => <Scene4 f={f} /> },
    "s5-neki": { nominal: [S5, S6], render: (f) => <Scene5 f={f} /> },
    "s6-anjaam": { nominal: [S6, END], render: (f) => <Scene6 f={f} /> },
  },
  ambience: { file: "sfx/desert-wind.mp3", volume: 0.32 },
  sfx: SFX,
  overlay: (f) => <Overlay f={f} />,
};
