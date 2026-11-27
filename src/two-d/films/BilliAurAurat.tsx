// "Billi aur Aurat" (Sahih al-Bukhari 2365): 9:16 Short, ~46 s. Nominal timeline at 30 fps.
// Hadith: a woman was punished because of a cat she locked up until it died; she did not feed it or give it water,
// nor let it free to eat the small creatures of the earth. The cage, the cooking and the child with water (s7) are
// added by the script; s7 is labelled on screen as a lesson, not part of the Hadith. The cat's death is never graphic:
// it lies curled with closed eyes, then fade to black. No Prophet / angel is shown.

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { tr } from "../film/types";
import type { Lang } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { blink, easeBack, kf, layerTransform, mix, VH, VW, type Cam } from "../kit";
import { CAT_BASE, Cat2D, type CatCoat, type CatPose } from "../Cat2D";
import {
  CatBowl,
  Chulha,
  ClothesLine,
  CourtWall,
  DateStall,
  DirtGround,
  Donkey,
  DryLeaf,
  DustMotes,
  FarHouses,
  FruitBasket,
  Laalten,
  LowTable,
  nightK,
  PalmShadow,
  PerchedBird,
  RotiStack,
  StoneFloor,
  TimeSky,
  timeColor,
  Veranda,
  WoodCage,
  WoodChest,
} from "../library/Courtyard";
import { Birds, ClayPots, Goat, Matka, MudHouse, VillageSky, VillageTree } from "../library/Village";
import { Palm } from "../Scenery";
import { BASE_POSE, LOOKS, Musafir, type MusafirPose } from "../Musafir";

const G = 1560; // courtyard action ground
const WB = 1400; // back wall base
const CX = 1250; // cage centre
const CW = 300;
const CH = 210;
const BOWL = { x: 1150, y: G + 46 };
const AURAT = LOOKS["aurat-beige"];

const S1 = 0;
const S2 = 120;
const S3 = 300;
const S4 = 540;
const S5 = 780;
const S6 = 930;
const S7 = 1110;
const END = 1380;

// ------------------------------------------------------------------ helpers
const L: React.FC<{ cam: Cam; depth: number; blur?: number; children: React.ReactNode }> = ({ cam, depth, blur = 0, children }) => (
  <g transform={layerTransform(cam, depth, VW, VH)} filter={blur >= 0.5 ? `url(#blur${Math.min(10, Math.round(blur))})` : undefined}>
    {children}
  </g>
);
const pose = (f: number, p: Partial<MusafirPose>, seed = 0): MusafirPose => ({ ...BASE_POSE, time: f / 30, eyeOpen: blink(f, seed), ...p });
const cat = (f: number, p: Partial<CatPose>, seed = 0): CatPose => ({ ...CAT_BASE, time: f / 30, eyeOpen: blink(f, seed + 7), ...p });
const cut = (f: number, a: number, b: number) => f >= a && f < b;
const lin = (v: number) => v;

/** Colour grade + vignette (screen space). */
const Grade: React.FC<{ tint: string; k?: number; vig?: number; warmVig?: boolean }> = ({ tint, k = 1, vig = 0.5, warmVig }) => (
  <g>
    <defs>
      <radialGradient id="bvig" cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor={warmVig ? "#3a1a00" : "#000"} stopOpacity={vig} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={VW} height={VH} fill={tint} style={{ mixBlendMode: "multiply" }} opacity={k} />
    <rect x={0} y={0} width={VW} height={VH} fill="url(#bvig)" />
  </g>
);

/** A child running in small loops (playing). */
const Kid: React.FC<{ f: number; cx: number; y: number; r?: number; phase?: number; scale?: number; look?: string }> = ({ f, cx, y, r = 120, phase = 0, scale = 0.55, look = "bachcha" }) => {
  const t = f / 30 + phase;
  const x = cx + Math.sin(t * 1.6) * r;
  const dir = Math.cos(t * 1.6) > 0;
  const hop = Math.abs(Math.sin(t * 6)) * 14;
  return <Musafir x={x} y={y - hop} flip={!dir} scale={scale} look={look === "bachcha" ? LOOKS.bachcha : { ...LOOKS.bachcha, robe: "#d9a03a", robeShade: "#b8842a", turban: "#c94a3a" }} pose={pose(f, { walk: 1, step: t * 9, mouth: "smile", brow: 0.8, armF: [40, 30], armB: [-40, 30] }, phase * 10)} />;
};

/** Woman carrying a water pot on her head. */
const PotCarrier: React.FC<{ f: number; x: number; y: number; flip?: boolean; s?: number }> = ({ f, x, y, flip, s = 0.85 }) => (
  <g>
    <Musafir x={x} y={y} flip={flip} scale={s} look={LOOKS.maa} pose={pose(f, { walk: 1, step: x / 40, armF: [165, 20], armB: [-8, 10] }, 3)} />
    <Matka x={x + (flip ? -6 : 6) * s} y={y - 352 * s} s={0.42 * s} />
  </g>
);

// ------------------------------------------------------------------ the courtyard world
type CourtOpts = {
  cam: Cam;
  f: number;
  time?: number; // 0 day .. 1 sunset .. 2 night .. 3 morning
  door?: number;
  latch?: number;
  cat?: React.ReactNode; // drawn inside the cage
  catFront?: React.ReactNode; // drawn in front of the bars (paw)
  street?: React.ReactNode; // people behind the wall
  front?: React.ReactNode; // action plane, in front of the cage
  kitchen?: React.ReactNode; // woman at the veranda
  bowl?: Partial<React.ComponentProps<typeof CatBowl>>;
  leaves?: boolean;
  shut?: number;
  bird?: number; // perched bird fly 0 (sitting) .. 1 gone
  birdDir?: 1 | -1;
  bgBlur?: number;
  cageBlur?: number;
  bowlBlur?: number;
  coldRight?: number; // warm kitchen left, cold cage right
  puff?: number; // roti on the tawa (undefined = no roti)
};

const Court: React.FC<CourtOpts> = ({ cam, f, time = 0.2, door = 0, latch = 1, cat, catFront, street, front, kitchen, bowl, leaves, shut = 0, bird = 0, birdDir = 1, bgBlur = 0, cageBlur = 0, bowlBlur = 0, coldRight = 0, puff }) => {
  const t = f / 30;
  const n = nightK(time);
  const day = 1 - n;
  const sunK = Math.min(1, time / 1.6);
  return (
    <>
      <L cam={cam} depth={0}>
        <TimeSky time={time} t={t} />
      </L>
      <L cam={cam} depth={0.5} blur={bgBlur + 1}>
        <FarHouses y={WB - 120} time={time} t={t} x0={-500} n={10} />
      </L>
      <L cam={cam} depth={0.8} blur={bgBlur}>
        <Palm x={1800} y={WB - 60} s={2.1} sway={Math.sin(t * 1.3) * 4} />
        <Palm x={-80} y={WB - 60} s={1.7} lean={-1} sway={Math.sin(t * 1.1 + 1) * 4} />
      </L>
      <L cam={cam} depth={0.88} blur={bgBlur}>
        <DateStall x={850} y={WB - 20} t={t} s={0.85} shut={shut} time={time} />
        {street}
      </L>
      <L cam={cam} depth={1} blur={bgBlur * 0.7}>
        <StoneFloor y={WB} time={time} />
        <CourtWall x0={-800} x1={3600} y={WB} h={200} gateX={2700} gate={0.85} time={time} />
        <PalmShadow x={1500} y={WB + 40} t={t} s={1.1} o={0.2 * day} skew={mix(-40, 45, sunK)} />
        <PerchedBird x={1520} y={WB - 214} t={t} s={1} fly={bird} dir={birdDir} />
        <Laalten x={1520} y={WB - 190} t={t} lit={n} rope={20} s={0.9} />
        <Laalten x={2700} y={WB - 380} t={t + 1} lit={n} rope={30} s={0.9} />
        <WoodChest x={1700} y={WB + 90} />
        <WoodChest x={1890} y={WB + 80} w={170} h={110} />
        <ClayPots x={2440} y={WB + 90} />
        <ClothesLine x0={1980} x1={2560} y={WB - 420} g={WB + 120} t={t} wind={1 - n * 0.6} />
        <Veranda x0={-260} x1={720} y={G + 20} h={620} t={t} time={time} warm={1 - n * 0.3} />
        <Laalten x={560} y={G - 590} t={t + 0.5} lit={Math.max(n, 0.35 * (1 - n))} rope={30} />
      </L>
      <L cam={cam} depth={1}>
        {kitchen}
        <Chulha x={240} y={G + 10} t={t} s={0.9} fire={time > 0.9 && time < 2.9 ? 0.4 : 1} puff={puff ?? 0} roti={puff !== undefined} />
        <LowTable x={520} y={G + 40} w={260} h={100} />
        <FruitBasket x={470} y={G - 80} s={0.65} />
        <RotiStack x={590} y={G - 80} t={t} s={0.6} />
        <Matka x={800} y={G + 30} s={0.7} />
      </L>
      <L cam={cam} depth={1} blur={cageBlur}>
        <WoodCage x={CX} y={G} w={CW} h={CH} layer="back" time={time} />
        {cat}
        <rect x={CX - CW / 2 + 10} y={G - CH + 10} width={CW - 20} height={CH - 20} fill="#1a1230" opacity={0.15 + 0.1 * n} style={{ mixBlendMode: "multiply" }} />
        <WoodCage x={CX} y={G} w={CW} h={CH} layer="front" door={door} latch={latch} time={time} />
        {catFront}
        {leaves &&
          [
            [CX - 220, G + 80, 20, 0],
            [CX + 180, G + 60, -40, 1],
            [CX + 60, G + 140, 70, 2],
            [CX - 60, G + 120, -10, 1],
            [CX + 320, G + 150, 30, 0],
          ].map(([lx, ly, r, k], i) => <DryLeaf key={i} x={lx} y={ly} rot={r} s={1.1} tone={k} />)}
      </L>
      <L cam={cam} depth={1} blur={bowlBlur}>
        <CatBowl x={BOWL.x} y={BOWL.y} s={0.8} t={t} dry {...bowl} />
      </L>
      <L cam={cam} depth={1}>{front}</L>
      {coldRight > 0 && (
        <L cam={cam} depth={1}>
          <defs>
            <linearGradient id="coldR" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#8a9cc8" />
            </linearGradient>
          </defs>
          <rect x={780} y={0} width={1000} height={3000} fill="url(#coldR)" opacity={coldRight} style={{ mixBlendMode: "multiply" }} />
          <rect x={1780} y={0} width={1500} height={3000} fill="#8a9cc8" opacity={coldRight} style={{ mixBlendMode: "multiply" }} />
          <rect x={-800} y={0} width={1500} height={3000} fill="#ff9a3c" opacity={0.12 * coldRight} />
        </L>
      )}
      <Grade tint={timeColor(["#fff4e4", "#ffc48a", "#6a78b8", "#efe8e4"], time)} k={1} vig={0.45 + n * 0.2} />
    </>
  );
};

// cat inside the cage: floor of the cage is at G - 26
const CY = G - 26;

// ------------------------------------------------------------------ scene 1: hook
const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const z = kf(f, [[S1, 9], [S1 + 22, 8.3], [S1 + 105, 1.9], [S2, 1.8]]);
  const cam: Cam = { x: kf(f, [[S1 + 22, 1262], [S1 + 105, 1320]]), y: kf(f, [[S1 + 22, 1420], [S1 + 105, 1360]]), zoom: z };
  const paw = kf(f, [[S1 + 48, 0], [S1 + 62, 1], [S1 + 84, 0.75], [S1 + 100, 0.3]], easeBack);
  const meow = kf(f, [[S1 + 56, 0], [S1 + 60, 1], [S1 + 70, 1], [S1 + 76, 0]]);
  const cp = cat(f, { sit: 1, sad: 0.5, ears: 0.8, paw, meow, look: 0.2, headUp: 0.15, eyeOpen: f < 20 ? 1 : blink(f, 3), tail: 0.3 });
  const traveller = kf(f, [[S1 + 30, 300], [S2, 900]], lin);
  return (
    <Court
      cam={cam}
      f={f}
      time={0.15}
      bird={kf(f, [[S1 + 28, 1], [S1 + 56, 0]], Easing.out(Easing.quad))}
      birdDir={1}
      cat={<Cat2D x={CX - 20} y={CY} scale={0.9} pose={cp} pawOut />}
      catFront={<Cat2D x={CX - 20} y={CY} scale={0.9} pose={cp} part="paw" />}
      street={<Musafir x={traveller} y={WB - 20} scale={0.85} look={LOOKS.musafir1} pose={pose(f, { walk: 1, step: traveller / 40 })} />}
    />
  );
};

// ------------------------------------------------------------------ scene 2: the woman locks the cat in
const Scene2: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const doorK = kf(f, [[S2 + 18, 1], [S2 + 34, 0]], easeBack);
  const latch = kf(f, [[S2 + 76, 0], [S2 + 90, 1]], Easing.inOut(Easing.quad));
  const kids = (
    <>
      <Kid f={f} cx={2700} y={WB - 10} r={90} phase={0} />
      <Kid f={f} cx={2700} y={WB - 4} r={110} phase={1.7} look="b" />
    </>
  );
  const shopkeeper = <Musafir x={850} y={WB - 30} scale={0.8} look={LOOKS.kisan} pose={pose(f, { armF: [60 + Math.sin(t * 4) * 20, 40], armB: [30, 30], headTilt: 12, look: 0 })} />;
  const donkeyX = kf(f, [[S2, 1700], [S3, 2600]], lin);
  const street = (
    <>
      {shopkeeper}
      <Donkey x={donkeyX} y={WB - 10} t={t} s={0.75} walk={1} />
      {kids}
    </>
  );
  if (f < S2 + 70) {
    // medium side: she shuts the cage door; the cat lunges at it
    const lunge = kf(f, [[S2 + 30, 0], [S2 + 40, 1]], easeBack);
    const cp = cat(f, { sit: 1 - lunge, walk: 0, paw: kf(f, [[S2 + 38, 0], [S2 + 46, 1], [S2 + 60, 0.8]], easeBack), meow: kf(f, [[S2 + 42, 0], [S2 + 46, 1], [S2 + 56, 0]]), ears: 1 - lunge * 0.4, sad: 0.4 + lunge * 0.3, headUp: 0.3 });
    const reach = kf(f, [[S2, 0.4], [S2 + 18, 1], [S2 + 36, 0.9], [S2 + 56, 0.2]]);
    const cam: Cam = { x: kf(f, [[S2, 1380], [S2 + 70, 1400]]), y: 1370, zoom: kf(f, [[S2, 2.0], [S2 + 70, 2.2]]) };
    return (
      <Court
        cam={cam}
        f={f}
        time={0.2}
        door={doorK}
        latch={0}
        street={street}
        cat={<Cat2D x={CX - 30 + lunge * 50} y={CY} scale={0.9} pose={cp} pawOut />}
        catFront={<Cat2D x={CX - 30 + lunge * 50} y={CY} scale={0.9} pose={cp} part="paw" />}
        front={<Musafir x={CX + 250} y={G + 40} flip look={AURAT} pose={pose(f, { lean: 14 * reach, armF: [mix(10, 80, reach), 20], armB: [-10, 10], brow: -0.4, mouth: "neutral", look: 0.6, headTilt: 10 })} />}
      />
    );
  }
  if (f < S2 + 105) {
    // close-up of the latch: the wooden bolt slides shut, paw pushing behind the bars
    const cp = cat(f, { sit: 0, paw: 0.7 + Math.sin(t * 9) * 0.2, ears: 0.6, sad: 0.6, headUp: 0.2 });
    const cam: Cam = { x: kf(f, [[S2 + 70, CX + 30], [S2 + 105, CX + 20]]), y: G - 120, zoom: kf(f, [[S2 + 70, 5.2], [S2 + 105, 5.8]]) };
    return (
      <Court
        cam={cam}
        f={f}
        time={0.2}
        latch={latch}
        street={street}
        cat={<Cat2D x={CX + 20} y={CY} scale={0.9} pose={cp} pawOut />}
        catFront={
          <>
            <Cat2D x={CX + 20} y={CY} scale={0.9} pose={cp} part="paw" />
            {/* her hand on the bolt */}
            <g transform={`translate(${CX + 20 + latch * 32} ${G - CH + CH * 0.45 + 18})`}>
              <ellipse cx={30} cy={4} rx={34} ry={22} fill="#e6b088" stroke="#3d2a1e" strokeWidth={4} />
              <rect x={50} y={-16} width={140} height={44} rx={20} fill="#7a2a35" stroke="#3d2a1e" strokeWidth={4} />
            </g>
          </>
        }
      />
    );
  }
  // low angle from inside the cage: she walks away
  const wx = kf(f, [[S2 + 105, CX + 220], [S3, 380]], lin);
  const cam: Cam = { x: kf(f, [[S2 + 105, 1100], [S3, 850]]), y: 1400, zoom: 1.75, rot: -3 };
  const barX = (i: number) => 120 + i * 230 + (cam.x - 1100) * -0.4;
  return (
    <>
      <Court cam={cam} f={f} time={0.22} street={street} front={<Musafir x={wx} y={G + 30} flip look={AURAT} pose={pose(f, { walk: 1, step: wx / 42, look: -0.2 })} />} />
      {/* blurred cage bars + cat ears in the foreground (cat POV) */}
      <g filter="url(#blur6)">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={barX(i)} y={-50} width={70} height={VH + 100} fill="#5a3a20" />
        ))}
        <rect x={-50} y={VH - 260} width={VW + 100} height={90} fill="#5a3a20" />
        <path d={`M 340 ${VH} L 420 ${VH - 210 + Math.sin(t * 2) * 6} L 520 ${VH} Z`} fill="#c8803e" />
        <path d={`M 640 ${VH} L 740 ${VH - 200} L 820 ${VH} Z`} fill="#c8803e" />
      </g>
    </>
  );
};

// ------------------------------------------------------------------ scene 3: no food, no water
const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const cook = (
    <Musafir x={420} y={G + 30} flip look={AURAT} pose={pose(f, { armF: [70 + Math.sin(t * 3) * 14, 50], armB: [20, 30], lean: 10, headTilt: 16, look: 0.4, mouth: "neutral" })} />
  );
  const pawing = (k: number) => cat(f, { sit: 0, headDown: 0.4, paw: 0.6 + Math.sin(t * 7) * 0.35 * k, ears: 0.7, sad: 0.6, look: 0.6 });
  const wob = Math.sin(t * 7) * 6;
  if (f < S3 + 60) {
    // close-up: fresh roti puffing on the tawa
    const cam: Cam = { x: kf(f, [[S3, 230], [S3 + 60, 260]]), y: 1430, zoom: kf(f, [[S3, 4.3], [S3 + 60, 4.7]]) };
    return (
<Court cam={cam} f={f} time={0.3} kitchen={cook} coldRight={1} puff={kf(f, [[S3 + 15, 0], [S3 + 30, 1], [S3 + 50, 0.7]], easeBack)} />
    );
  }
  if (f < S3 + 120) {
    // pan from the roti and fruit to the empty bowl
    const k = kf(f, [[S3 + 60, 0], [S3 + 118, 1]], Easing.inOut(Easing.cubic));
    const cam: Cam = { x: mix(260, BOWL.x + 40, k), y: mix(1430, 1520, k), zoom: mix(4.0, 3.2, k) };
    return (
      <Court
        cam={cam}
        f={f}
        time={0.3}
        kitchen={cook}
        puff={0.6}
        coldRight={1}
        bowl={{ wobble: k > 0.6 ? wob : 0 }}
        cat={<Cat2D x={CX - 40} y={CY} flip scale={0.9} pose={pawing(k > 0.6 ? 1 : 0)} pawOut />}
        catFront={<Cat2D x={CX - 40} y={CY} flip scale={0.9} pose={pawing(k > 0.6 ? 1 : 0)} part="paw" />}
      />
    );
  }
  if (f < S3 + 180) {
    // ground level: the cat looks up at her, hoping
    const up = kf(f, [[S3 + 124, 0], [S3 + 140, 1]], easeBack);
    const cp = cat(f, { sit: 1, headUp: up * 0.9, sad: 0.8, ears: 0.55, look: 0.9, meow: kf(f, [[S3 + 140, 0], [S3 + 144, 0.7], [S3 + 152, 0]]), tail: 0.15 });
    const cam: Cam = { x: kf(f, [[S3 + 120, CX - 70], [S3 + 180, CX - 60]]), y: kf(f, [[S3 + 120, 1500], [S3 + 180, 1480]]), zoom: kf(f, [[S3 + 120, 4.2], [S3 + 180, 4.8]]), rot: 2 };
    return <Court cam={cam} f={f} time={0.32} coldRight={1} kitchen={cook} puff={0} cat={<Cat2D x={CX - 40} y={CY} flip scale={0.9} pose={cp} />} />;
  }
  // she eats; a woman with a water pot passes outside; the cat's head sinks
  const eat = Math.max(0, Math.sin(t * 3.2));
  const potX = kf(f, [[S3 + 180, 1500], [S4, 300]], lin);
  const sink = kf(f, [[S3 + 210, 0], [S3 + 240, 1]]);
  const cam: Cam = { x: kf(f, [[S3 + 180, 760], [S4, 900]]), y: kf(f, [[S3 + 180, 1330], [S4, 1360]]), zoom: kf(f, [[S3 + 180, 1.3], [S4, 1.45]]) };
  return (
    <Court
      cam={cam}
      f={f}
      time={0.35}
      coldRight={1}
      kitchen={
        <>
          <Musafir x={600} y={G + 40} flip look={AURAT} pose={pose(f, { kneel: 1, armF: [mix(40, 140, eat), mix(30, 110, eat)], armB: [10, 20], headTilt: 6, mouth: eat > 0.7 ? "open" : "neutral", look: -0.3 })} />
        </>
      }
      street={
        <>
          <PotCarrier f={f} x={potX} y={WB - 20} flip />
          <Birds t={t} x={kf(f, [[S3 + 180, 1600], [S4, 600]], lin)} y={700} n={4} />
        </>
      }
      cat={<Cat2D x={CX - 40} y={CY} flip scale={0.9} pose={cat(f, { sit: 1, headDown: sink * 0.7, headUp: (1 - sink) * 0.5, sad: 0.9, ears: mix(0.55, 0.3, sink), look: 0.8 })} />}
    />
  );
};

// ------------------------------------------------------------------ scene 4: time passes
const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const time = kf(f, [[S4 + 6, 0], [S4 + 150, 3]], (v) => Easing.inOut(Easing.sin)(v));
  const pace = kf(f, [[S4, 1], [S4 + 60, 0.5], [S4 + 80, 0]]);
  const ph = (f - S4) / 30;
  const px = CX - 10 + Math.sin(ph * 2.2) * 60 * pace;
  const goingRight = Math.cos(ph * 2.2) > 0;
  const sitK = kf(f, [[S4 + 70, 0], [S4 + 85, 1]]);
  const lieK = kf(f, [[S4 + 105, 0], [S4 + 125, 1]]);
  const cp = cat(f, {
    walk: pace,
    step: ph * 9,
    sit: sitK,
    lie: lieK,
    ears: mix(0.8, 0.15, kf(f, [[S4 + 40, 0], [S4 + 140, 1]])),
    sad: 0.8,
    thin: kf(f, [[S4, 0.1], [S4 + 150, 0.8]]),
    headDown: 0.3 + lieK * 0.2,
    eyeOpen: f > S4 + 150 ? (Math.sin((f - S4) / 18) > 0.85 ? 0.1 : 0.45) : blink(f, 2),
    tail: mix(0.4, 0, lieK),
  });
  const push = kf(f, [[S4 + 150, 0], [S5, 1]], Easing.inOut(Easing.sin));
  const cam: Cam = { x: mix(1250, CX, push), y: mix(1250, 1490, push), zoom: mix(kf(f, [[S4, 1.05], [S4 + 150, 1.1]]), 3.4, push) };
  const shut = kf(f, [[S4 + 45, 0], [S4 + 65, 1]]);
  const homeX = kf(f, [[S4 + 25, 2200], [S4 + 95, 300]], lin);
  return (
    <Court
      cam={cam}
      f={f}
      time={time}
      shut={shut}
      bird={time > 2.6 ? kf(f, [[S4 + 135, 1], [S4 + 155, 0]]) : 1}
      birdDir={-1}
      street={
        <>
          {time < 1.6 && time > 0.4 && (
            <>
              <Musafir x={homeX} y={WB - 20} flip scale={0.85} look={LOOKS.buzurg} pose={pose(f, { walk: 1, step: homeX / 40 })} />
              <Musafir x={homeX + 200} y={WB - 14} flip scale={0.85} look={LOOKS.musafir1} pose={pose(f, { walk: 1, step: homeX / 40 + 1 })} />
            </>
          )}
          {time > 2.5 && <Birds t={t} x={kf(f, [[S4 + 130, 1800], [S5, 900]], lin)} y={600} n={5} />}
        </>
      }
      cat={<Cat2D x={lieK > 0 || sitK > 0.5 ? CX - 10 : px} y={CY} flip={sitK > 0.5 || lieK > 0 ? true : !goingRight} scale={0.9} pose={cp} />}
    />
  );
};

// ------------------------------------------------------------------ scene 5: the end (never graphic)
const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const still = cat(S5, { lie: 1, eyeOpen: 0, ears: 0.1, thin: 1, headDown: 0.6, tail: 0 });
  const leafK = kf(f, [[S5 + 30, 0], [S5 + 80, 1]], Easing.out(Easing.quad));
  const leaf = (
    <DryLeaf x={mix(CX + 360, CX + 120, leafK) + Math.sin(leafK * 9) * 40} y={mix(G - 420, G + 70, leafK)} rot={leafK * 400} s={1.2} tone={2} />
  );
  const lyingCat = <Cat2D x={CX - 10} y={CY} flip scale={0.9} pose={still} />;
  if (f < S5 + 55) {
    // empty bowl, cat soft behind it
    const cam: Cam = { x: kf(f, [[S5, BOWL.x - 10], [S5 + 55, BOWL.x]]), y: BOWL.y - 60, zoom: kf(f, [[S5, 5.2], [S5 + 55, 5.6]]) };
    return <Court cam={cam} f={f} time={3} leaves cageBlur={6} bgBlur={4} cat={lyingCat} front={leaf} />;
  }
  if (f < S5 + 110) {
    // rack focus to the cat, lying still with closed eyes
    const k = kf(f, [[S5 + 55, 0], [S5 + 85, 1]]);
    const cam: Cam = { x: mix(BOWL.x, CX - 10, k), y: mix(BOWL.y - 60, G - 70, k), zoom: kf(f, [[S5 + 55, 5.6], [S5 + 110, 4.4]]) };
    return <Court cam={cam} f={f} time={3} leaves cageBlur={mix(6, 0, k)} bowlBlur={mix(0, 5, k)} bgBlur={4} cat={lyingCat} front={leaf} />;
  }
  // slow pull-out: silence, the bird on the wall flies away
  const cam: Cam = { x: kf(f, [[S5 + 110, CX - 10], [S6, CX + 60]]), y: kf(f, [[S5 + 110, G - 70], [S6, 1380]]), zoom: kf(f, [[S5 + 110, 4.4], [S6, 2.0]]) };
  return (
    <Court
      cam={cam}
      f={f}
      time={3}
      leaves
      cat={lyingCat}
      front={leaf}
      bird={kf(f, [[S5 + 115, 0], [S6 - 5, 1]], Easing.in(Easing.quad))}
      birdDir={1}
      street={<Musafir x={kf(f, [[S5 + 110, 400], [S6, 900]], lin)} y={WB - 20} scale={0.85} look={LOOKS.kisan} pose={pose(f, { walk: 1, step: f / 6 })} />}
    />
  );
};

// ------------------------------------------------------------------ scene 6: the Hadith on black
const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const glow = kf(f, [[S6, 0], [S6 + 40, 1]]);
  return (
    <g>
      <rect x={0} y={0} width={VW} height={VH} fill="#050404" />
      <defs>
        <radialGradient id="hglow" cx="50%" cy="42%" r="55%">
          <stop offset="0" stopColor="#5a3a14" stopOpacity={0.55} />
          <stop offset="1" stopColor="#050404" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={VW} height={VH} fill="url(#hglow)" opacity={glow * (0.85 + 0.15 * Math.sin(t * 1.5))} />
      <g transform={`translate(${VW / 2} ${VH * 0.42}) scale(${1 + (f - S6) * 0.0006}) translate(${-VW / 2} ${-VH * 0.42})`}>
        <DustMotes t={t} x={0} y={0} w={VW} h={VH} n={40} o={0.45 * glow} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ scene 7: the lesson (not part of the Hadith)
const VG = 1560;
const Village: React.FC<{ cam: Cam; f: number; children?: React.ReactNode }> = ({ cam, f, children }) => {
  const t = f / 30;
  return (
    <>
      <L cam={cam} depth={0}>
        <VillageSky mood="day" sunX={820} />
      </L>
      <L cam={cam} depth={0.15}>
        <Birds t={t} x={200 + ((t * 40) % 600)} y={520} n={5} />
        <Birds t={t + 2} x={900 - ((t * 30) % 500)} y={760} n={3} />
      </L>
      <L cam={cam} depth={0.5} blur={1}>
        <FarHouses y={VG - 200} time={0} t={t} x0={-700} n={10} />
      </L>
      <L cam={cam} depth={0.75}>
        <Palm x={-150} y={VG - 120} s={2.0} sway={Math.sin(t * 1.3) * 4} />
        <Palm x={2350} y={VG - 120} s={2.3} lean={-1} sway={Math.sin(t * 1.1 + 1) * 4} />
        <MudHouse x={150} y={VG - 100} w={480} h={320} tone={1} t={t} />
        <MudHouse x={1650} y={VG - 100} w={520} h={340} tone={2} t={t} />
        <VillageTree x={1250} y={VG - 100} s={0.9} kind="neem" t={t} sway={Math.sin(t) * 1.5} nest />
        <ClothesLine x0={700} x1={1150} y={VG - 470} g={VG - 90} t={t} />
      </L>
      <L cam={cam} depth={0.88}>
        <DateStall x={2050} y={VG - 60} t={t} s={0.8} />
        <Musafir x={2050} y={VG - 70} scale={0.8} look={LOOKS.kisan} pose={pose(f, { armF: [50 + Math.sin(t * 3) * 25, 30], mouth: Math.sin(t * 6) > 0 ? "open" : "smile", brow: 0.5 })} />
        <Musafir x={1820} y={VG - 50} flip scale={0.8} look={LOOKS.buzurg} pose={pose(f, { armF: [40, 30], headTilt: 6, brow: 0.4, mouth: "smile" })} />
        <Kid f={f} cx={500} y={VG - 50} r={150} phase={0} scale={0.5} />
        <Kid f={f} cx={560} y={VG - 40} r={120} phase={2.2} scale={0.5} look="b" />
        <Goat x={-150} y={VG - 40} t={t} s={0.8} coat="brown" graze={1} />
        <PotCarrier f={f} x={kf(f, [[S7, 2800], [END, 1500]], lin)} y={VG - 50} flip s={0.75} />
      </L>
      <L cam={cam} depth={1}>
        <DirtGround y={VG - 60} t={f / 30} />
        {children}
      </L>
      <L cam={cam} depth={1.3}>
        <VillageTree x={-350} y={VG + 520} s={1.3} kind="kikar" t={t} sway={Math.sin(t * 0.9) * 2} />
      </L>
      <Grade tint="#ffe6c0" k={0.55} vig={0.35} warmVig />
    </>
  );
};

const Scene7: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const bowlX = 1110;
  const set = kf(f, [[S7 + 4, 0], [S7 + 36, 1]], Easing.out(Easing.cubic));
  const bowlY = mix(VG - 40, VG + 60, set);
  const water = 1;
  // grey cat walks in from the right and drinks
  const walkK = kf(f, [[S7 + 50, 0], [S7 + 95, 1]], Easing.out(Easing.quad));
  const catX = mix(1700, bowlX + 120, walkK);
  const drinking = f > S7 + 98;
  const cp = cat(f, { walk: drinking ? 0 : 1, step: (f - S7) / 3, headDown: drinking ? 0.9 : 0, lap: drinking ? 1 : 0, tail: 0.9, ears: 1, look: 0.5, eyeOpen: drinking ? 0.5 : blink(f, 4) }, 0);
  const kneel = kf(f, [[S7, 0.6], [S7 + 20, 1]]);
  const child = (
    <Musafir
      x={bowlX - 120}
      y={VG + 70}
      scale={0.62}
      look={LOOKS.bachcha}
      pose={pose(f, { kneel, lean: mix(26, 8, kf(f, [[S7 + 36, 0], [S7 + 60, 1]])), armF: [mix(70, 20, kf(f, [[S7 + 36, 0], [S7 + 60, 1]])), 30], armB: [40, 30], brow: 0.9, mouth: "smile", headTilt: 14, look: 0.7 })}
    />
  );
  const scene = (
    <>
      {child}
      <CatBowl x={bowlX} y={bowlY} s={0.8} t={t} water={water} />
      <Cat2D x={catX} y={VG + 66} flip scale={0.8} coat={"grey" as CatCoat} pose={cp} />
    </>
  );
  let cam: Cam;
  if (f < S7 + 50) cam = { x: bowlX - 30, y: kf(f, [[S7, VG - 80], [S7 + 50, VG - 20]]), zoom: kf(f, [[S7, 4.4], [S7 + 50, 4.0]]) };
  else if (f < S7 + 130) cam = { x: kf(f, [[S7 + 50, 1200], [S7 + 130, 1080]]), y: VG - 120, zoom: kf(f, [[S7 + 50, 2.7], [S7 + 130, 3.0]]) };
  else {
    const k = kf(f, [[S7 + 130, 0], [END - 50, 1]], Easing.inOut(Easing.cubic));
    cam = { x: mix(1080, 1060, k), y: mix(VG - 120, VG - 260, k), zoom: mix(3.0, 1.7, k) };
  }
  return <Village cam={cam} f={f}>{scene}</Village>;
};

// ------------------------------------------------------------------ sound (nominal frames)
const s = (file: string, at: number, volume = 0.8) => ({ file: `sfx/${file}`, at, volume });
const SFX: FilmVisuals["sfx"] = [
  s("pad.wav", S1, 0.35),
  s("breeze.wav", S1, 0.3),
  s("birds.wav", S1 + 36, 0.25),
  s("cat-meow-weak.wav", S1 + 56, 0.75),
  s("village-ambience.mp3", S2 - 6, 0.25),
  s("children-play.wav", S2, 0.35),
  s("door.wav", S2 + 26, 0.5),
  s("impact.wav", S2 + 33, 0.35),
  s("cat-meow.wav", S2 + 42, 0.6),
  s("latch.wav", S2 + 80, 0.9),
  ...[118, 134, 150, 166].map((d) => s("step.wav", S2 + d, 0.3)),
  s("donkey.wav", S2 + 120, 0.35),
  s("children-play.wav", S2 + 120, 0.3),
  s("cat-meow-weak.wav", S2 + 150, 0.5),
  s("fire-crackle.wav", S3 - 4, 0.45),
  s("dishes.wav", S3 + 30, 0.4),
  s("fire-crackle.wav", S3 + 70, 0.3),
  s("whoosh.wav", S3 + 60, 0.25),
  s("fire-crackle.wav", S3 + 140, 0.22),
  s("cat-meow-weak.wav", S3 + 140, 0.6),
  s("dishes.wav", S3 + 190, 0.35),
  s("village-ambience.mp3", S3 + 180, 0.22),
  s("birds.wav", S3 + 200, 0.25),
  s("whoosh.wav", S4 - 2, 0.3),
  s("breeze.wav", S4, 0.35),
  s("village-ambience.mp3", S4 + 4, 0.18),
  s("crickets.wav", S4 + 55, 0.4),
  s("crickets.wav", S4 + 100, 0.35),
  s("birds.wav", S4 + 130, 0.3),
  s("cat-meow-weak.wav", S4 + 175, 0.25),
  s("desert-wind.mp3", S4 + 160, 0.25),
  s("breeze.wav", S5, 0.28),
  s("desert-wind.mp3", S5 + 60, 0.18),
  s("pad.wav", S6, 0.35),
  s("chime.wav", S6 + 8, 0.3),
  s("village-ambience.mp3", S7, 0.3),
  s("children-play.wav", S7 + 4, 0.3),
  s("birds.wav", S7 + 10, 0.35),
  s("cat-meow.wav", S7 + 70, 0.4),
  s("lap.wav", S7 + 100, 0.6),
  s("lap.wav", S7 + 140, 0.5),
  s("village-ambience.mp3", S7 + 165, 0.3),
  s("children-play.wav", S7 + 170, 0.28),
  s("birds.wav", S7 + 180, 0.35),
  s("chime.wav", END - 90, 0.45),
];

// ------------------------------------------------------------------ overlays: hook, fade, Hadith card, lesson + end card
const fade = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const up = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Overlay: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #1d120a", paintOrder: "stroke fill", textAlign: "center" as const };
  const hook = fade(f, S1 + 3, S1 + 8, S1 + 78, S1 + 88);
  const hookPop = interpolate(f, [S1 + 3, S1 + 11], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const black = interpolate(f, [S6 - 30, S6 - 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (f < S6 ? 1 : 0);
  const card = fade(f, S6 + 10, S6 + 26, S7 - 12, S7 - 2);
  const ref = fade(f, S6 + 4, S6 + 16, S7 - 12, S7 - 2);
  const lesson = fade(f, S7 + 6, S7 + 14, S7 + 80, S7 + 92);
  const end1 = up(f, END - 100, END - 86);
  const end2 = up(f, END - 76, END - 64);
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230, opacity: hook }}>
        <div style={{ ...big, fontSize: 96, color: "#ffd34d", transform: `scale(${hookPop}) rotate(-2deg)`, lineHeight: 1.1, padding: "0 40px" }}>
          {tr(lang, { ur: "EK BILLI… AUR JAHANNAM?", en: "ONE CAT… AND HELL?" })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      {/* Hadith card (the Hadith part) */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 260 }}>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 800, fontSize: 46, color: "#ffd98a", opacity: ref, letterSpacing: 2 }}>📖 Sahih al-Bukhari 2365</div>
        <div
          style={{
            fontFamily: "'DejaVu Serif', Georgia, serif",
            fontSize: 50,
            lineHeight: 1.35,
            color: "#fff6e4",
            opacity: card,
            transform: `translateY(${(1 - card) * 24}px)`,
            textAlign: "center",
            padding: "0 70px",
            marginTop: 40,
          }}
        >
          {tr(lang, {
            ur: "“Ek aurat ko ek billi ki wajah se azaab diya gaya. Usne use qaid rakha yahan tak ki woh bhookh se mar gayi… na use khilaya, na pilaya, na use chhoda ki woh zameen ke keede-makode kha leti.”",
            en: "“A woman was punished because of a cat. She kept it locked up until it died of hunger… she neither fed it nor gave it water, nor set it free to eat the small creatures of the earth.”",
          })}
        </div>
      </AbsoluteFill>
      {/* lesson tag: the child scene is not part of the Hadith */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 210, opacity: lesson }}>
        <div style={{ ...big, fontSize: 76, color: "#ffe9b0", WebkitTextStroke: "9px #3a1a00" }}>{tr(lang, { ur: "Seekh", en: "The lesson" })}</div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 34, color: "#fff6e0", marginTop: 14, textShadow: "0 2px 8px #000", padding: "0 80px", textAlign: "center" }}>
          {tr(lang, { ur: "(Ye manzar Hadith ka hissa nahi, seekh ke liye hai)", en: "(This scene is not part of the Hadith: it shows the lesson)" })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 240 }}>
        <div style={{ ...big, fontSize: 84, color: "#ffe9b0", opacity: end1, lineHeight: 1.15, padding: "0 60px", transform: `scale(${0.9 + 0.1 * end1})` }}>
          {tr(lang, { ur: "Bejubaan hain, bejaan nahi.", en: "Voiceless, not lifeless." })}
        </div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 40, color: "#fff6e0", opacity: end2, marginTop: 28, textShadow: "0 2px 8px #000" }}>Sahih al-Bukhari 2365</div>
      </AbsoluteFill>
    </>
  );
};

export const billiAurAuratVisuals: FilmVisuals = {
  scenes: {
    "s1-hook": { nominal: [S1, S2], render: (f) => <Scene1 f={f} /> },
    "s2-qaid": { nominal: [S2, S3], render: (f) => <Scene2 f={f} /> },
    "s3-bhookh": { nominal: [S3, S4], render: (f) => <Scene3 f={f} /> },
    "s4-waqt": { nominal: [S4, S5], render: (f) => <Scene4 f={f} /> },
    "s5-anjaam": { nominal: [S5, S6], render: (f) => <Scene5 f={f} /> },
    "s6-hadith": { nominal: [S6, S7], render: (f) => <Scene6 f={f} /> },
    "s7-seekh": { nominal: [S7, END], render: (f) => <Scene7 f={f} /> },
  },
  sfx: SFX,
  overlay: (f, lang) => <Overlay f={f} lang={lang} />,
};

