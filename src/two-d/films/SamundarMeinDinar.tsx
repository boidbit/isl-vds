// "Samundar Mein 1,000 Dinar" (Sahih al-Bukhari 2291): 9:16 Short. Nominal timeline at 30 fps.
// Hadith: a man of Bani Israil borrowed 1,000 dinars with Allah as witness and guarantor, could not find a ship to
// return on time, put the money and a letter in a hollowed piece of wood and entrusted it to Allah in the sea. The
// lender found it as firewood; the borrower later came with another 1,000 dinars and was told to take them back.
// Houses, pier, steps, ship, clothes, faces and background life are imagined (tasawwur). No Prophet / angel is shown.
// Look: film look "sea-teal" (teal shadows, warm sun, grain); warm sandy home shore vs cold blue-grey far pier;
// cel-shaded characters (light from the sun side), each man with his own face and build.
// Cuts that matter are anchored to the narration with `beats` (line 2 of each scene starts on its cut).

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { tr } from "../film/types";
import type { Lang } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { blink, easeBack, kf, layerTransform, mix, shake, VH, VW, type Cam } from "../kit";
import { BASE_POSE, foreAngle, handPos, LOOKS, Musafir, type Look, type MusafirPose } from "../Musafir";
import { MusafirFront, type FrontPose } from "../FrontFace";
import { CargoPile, DoorCurtain, FoldedLetter, HandSaw, HollowLogTop, KnotLog, MooringPost, Sawdust, Sea, SeaSky, Seagull, Ship, ShoreFoam, StoneSteps, Woodpile, WoodPier, type SeaMood } from "../library/Sea";
import { ClothesLine, DateStall, DustMotes, FruitBasket, LowTable, PalmShadow, PerchedBird, StoneFloor } from "../library/Courtyard";
import { HandReach, TableTop } from "../library/Closeups";
import { FlashFx, LensFlare, LightLeak, RewindFx, slowmo, SplashFx, WaterWipe, WhipFx } from "../library/Fx";
import { WagePouch } from "../library/Farm";
import { Birds, MudHouse } from "../library/Village";

const LENDER = LOOKS["qarz-dene-wala"];
const BORROWER = LOOKS.qarzdar;
const SAILOR = LOOKS.mallah;

const S1 = 0;
const S2 = 90;
const S3 = 480;
const S4 = 810;
const S5 = 1170;
const S6 = 1420;
const S7 = 1670;
const S8 = 2060;
const END = 2430;

// ------------------------------------------------------------------ helpers
const L: React.FC<{ cam: Cam; depth: number; blur?: number; children: React.ReactNode }> = ({ cam, depth, blur = 0, children }) => (
  <g transform={layerTransform(cam, depth, VW, VH)} filter={blur >= 0.5 ? `url(#blur${Math.min(10, Math.round(blur))})` : undefined}>
    {children}
  </g>
);
const pose = (f: number, p: Partial<MusafirPose>, seed = 0): MusafirPose => ({ ...BASE_POSE, time: f / 30, eyeOpen: blink(f, seed), ...p });
const fp = (f: number, p: Partial<FrontPose>, seed = 0): Partial<FrontPose> => ({ t: f / 30, eyeOpen: blink(f, seed), ...p });
const lin = (v: number) => v;
const ease = Easing.inOut(Easing.cubic);
const deg = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;

/** Rotation (forearm space) that points a held prop's +x axis at screen angle `screenDeg`. */
const aim = (p: MusafirPose, screenDeg: number, flip: boolean, look?: Partial<Look>, which: "F" | "B" = "F") => (flip ? 180 - screenDeg : screenDeg) - foreAngle(p, which, look);

/** Colour grade + vignette (screen space). */
const Grade: React.FC<{ tint: string; k?: number; vig?: number; warm?: boolean }> = ({ tint, k = 1, vig = 0.45, warm }) => (
  <g>
    <defs>
      <radialGradient id={`sv${warm ? "w" : "c"}`} cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor={warm ? "#3a1a00" : "#0a1420"} stopOpacity={vig} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={VW} height={VH} fill={tint} style={{ mixBlendMode: "multiply" }} opacity={k} />
    <rect x={0} y={0} width={VW} height={VH} fill={`url(#sv${warm ? "w" : "c"})`} />
  </g>
);

/** Thin sun streak (screen space). */
const Streak: React.FC<{ x: number; y: number; rot?: number; o?: number; w?: number }> = ({ x, y, rot = -20, o = 0.35, w = 60 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} style={{ mixBlendMode: "screen" }}>
    <rect x={-w / 2} y={-1400} width={w} height={2800} fill="#fff2c0" opacity={o} />
    <rect x={-w / 6} y={-1400} width={w / 3} height={2800} fill="#ffffff" opacity={o * 0.8} />
  </g>
);

// ------------------------------------------------------------------ background people of the far pier
const Fisherman: React.FC<{ f: number; x: number }> = ({ f, x }) => {
  const t = f / 30;
  const p = pose(f, { kneel: 1, lean: -4, armF: [70 + Math.sin(t * 0.8) * 4, -10], armB: [30, 30], look: 0.6, headTilt: 6, grip: true }, 21);
  return (
    <Musafir
      x={x}
      y={1500 - 30}
      scale={0.8}
      look={LOOKS.machhera}
      pose={p}
      holdF={
        <g transform={`rotate(${aim(p, -30, false, LOOKS.machhera)})`}>
          <path d="M 0 0 L 360 0" stroke="#6e4a2e" strokeWidth={8} strokeLinecap="round" />
          <path d={`M 360 0 Q ${380 + Math.sin(t) * 6} 200 ${370 + Math.sin(t * 1.3) * 10} 420`} stroke="#e8e0cc" strokeWidth={2} fill="none" />
        </g>
      }
    />
  );
};

const Porter: React.FC<{ f: number }> = ({ f }) => {
  const x = ((f * 2.2) % 2100) - 820;
  const p = pose(f, { walk: 1, step: x / 40, armF: [160, 30], armB: [-10, 10], lean: 8, grip: true, brow: -0.2 }, 13);
  return (
    <Musafir
      x={x}
      y={1500 - 30}
      scale={0.85}
      look={LOOKS.hammal}
      pose={p}
      holdF={
        <g transform={`rotate(${-foreAngle(p, "F", LOOKS.hammal)})`}>
          <path d="M -70 -20 Q -80 -90 -20 -100 L 30 -100 Q 90 -90 80 -20 Q 0 10 -70 -20 Z" fill="#d8c294" stroke="#3d2a1e" strokeWidth={4} strokeLinejoin="round" />
        </g>
      }
    />
  );
};

/** Top view of a cloth pouch of coins (for table inserts). */
const PouchTop: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={8} cy={14} rx={120} ry={100} fill="#000" opacity={0.2} />
    <path d="M -110 0 Q -110 -96 0 -100 Q 110 -96 110 0 Q 110 96 0 100 Q -110 96 -110 0 Z" fill="#c9a26e" stroke="#3d2a1e" strokeWidth={6} />
    <path d="M -60 -40 Q 0 -20 60 -40 M -70 30 Q 0 50 70 30" fill="none" stroke="#a8824e" strokeWidth={6} />
    <circle cx={0} cy={-6} r={26} fill="#a8824e" stroke="#3d2a1e" strokeWidth={5} />
    <path d="M 0 -6 Q 40 -40 70 -30 M 0 -6 Q 30 30 66 30" fill="none" stroke="#7a2a35" strokeWidth={8} strokeLinecap="round" />
  </g>
);

// ------------------------------------------------------------------ world 1: the lender's courtyard
const G = 1560; // courtyard floor (action ground)
const WB = 1300; // back wall base
const TABLE = { x: 1080, w: 470, h: 120 };
const TOP = G - TABLE.h - 20; // table surface
const LOG = { x: 1060, y: TOP - 64 * 0.75, s: 0.75 };
const KERF = { x: LOG.x + 40 * LOG.s, y: LOG.y - 64 * LOG.s };
const DOOR = { x: 1560, w: 250, h: 430 };

const CourtBack: React.FC<{ t: number; curtainLift?: number }> = ({ t, curtainLift = 0 }) => (
  <g>
    {/* the sea seen through the open door */}
    <defs>
      <clipPath id="doorClip">
        <path d={`M ${DOOR.x - DOOR.w / 2} ${WB} L ${DOOR.x - DOOR.w / 2} ${WB - DOOR.h + 90} Q ${DOOR.x} ${WB - DOOR.h - 30} ${DOOR.x + DOOR.w / 2} ${WB - DOOR.h + 90} L ${DOOR.x + DOOR.w / 2} ${WB} Z`} />
      </clipPath>
    </defs>
    <g clipPath="url(#doorClip)">
      <rect x={DOOR.x - 200} y={WB - 600} width={400} height={600} fill="#a9d8f2" />
      <g transform={`translate(${DOOR.x - 200} ${WB - 250}) scale(0.3)`}>
        <Sea y={0} y1={900} x0={0} x1={1400} t={t} mood="sun" />
      </g>
      <g transform={`translate(${DOOR.x - 150} ${WB - 140}) scale(0.32)`}>
        <StoneSteps x={0} y={0} n={6} run={130} rise={70} bottom={500} />
      </g>
    </g>
    {/* plastered wall with lime border and a parapet (munder) */}
    <path
      d={`M -900 ${WB} L -900 ${WB - 760} L 2900 ${WB - 760} L 2900 ${WB} L ${DOOR.x + DOOR.w / 2} ${WB} L ${DOOR.x + DOOR.w / 2} ${WB - DOOR.h + 90} Q ${DOOR.x} ${WB - DOOR.h - 30} ${DOOR.x - DOOR.w / 2} ${WB - DOOR.h + 90} L ${DOOR.x - DOOR.w / 2} ${WB} Z`}
      fill="#dcae7c"
      stroke="#3d2a1e"
      strokeWidth={4}
    />
    <rect x={-900} y={WB - 790} width={3800} height={40} fill="#e8c497" stroke="#3d2a1e" strokeWidth={4} />
    <rect x={-900} y={WB - 70} width={3800} height={70} fill="#efe2c8" opacity={0.9} />
    {[[-300, -520], [300, -300], [820, -600], [2100, -420], [2500, -250]].map(([cx, cy], i) => (
      <path key={i} d={`M ${cx} ${WB + cy} l 30 26 l -10 30 l 24 22`} fill="none" stroke="#b5824f" strokeWidth={3} />
    ))}
    {/* niche with a pot */}
    <path d={`M 560 ${WB - 330} L 560 ${WB - 460} Q 620 ${WB - 520} 680 ${WB - 460} L 680 ${WB - 330} Z`} fill="#8a5a36" stroke="#3d2a1e" strokeWidth={4} />
    <ellipse cx={620} cy={WB - 360} rx={32} ry={28} fill="#c07a4a" stroke="#3d2a1e" strokeWidth={3} />
    {/* door frame + curtain */}
    <path d={`M ${DOOR.x - DOOR.w / 2 - 18} ${WB} L ${DOOR.x - DOOR.w / 2 - 18} ${WB - DOOR.h + 80} Q ${DOOR.x} ${WB - DOOR.h - 54} ${DOOR.x + DOOR.w / 2 + 18} ${WB - DOOR.h + 80} L ${DOOR.x + DOOR.w / 2 + 18} ${WB}`} fill="none" stroke="#8a5a36" strokeWidth={22} />
    <DoorCurtain x={DOOR.x - DOOR.w / 2 + 6} y={WB - DOOR.h + 70} w={DOOR.w * 0.42} h={DOOR.h - 70} t={t} lift={curtainLift} />
    <PalmShadow x={700} y={WB - 60} t={t} s={1.3} o={0.2} skew={-10} />
  </g>
);

type CourtOpts = { cam: Cam; f: number; children?: React.ReactNode; front?: React.ReactNode; bgBlur?: number; bird?: number; curtainLift?: number; log?: React.ReactNode; table?: React.ReactNode; dust?: number };
const Court: React.FC<CourtOpts> = ({ cam, f, children, front, bgBlur = 0, bird = 0, curtainLift = 0, log, table, dust = 0.5 }) => {
  const t = f / 30;
  return (
    <>
      <rect x={0} y={0} width={VW} height={VH} fill="#a9d8f2" />
      <L cam={cam} depth={0.85} blur={bgBlur}>
        <CourtBack t={t} curtainLift={curtainLift} />
        <PerchedBird x={260} y={WB - 790} t={t} s={1.1} fly={bird} dir={-1} />
        <PerchedBird x={2050} y={WB - 790} t={t + 1.3} s={1} fly={bird * 0.9} dir={1} flip />
        <ClothesLine x0={-200} x1={700} y={WB - 520} g={WB + 60} t={t} />
      </L>
      <L cam={cam} depth={1}>
        <StoneFloor y={WB} x0={-1200} x1={3200} depth={1400} />
        <Woodpile x={420} y={G - 30} s={1} />
        <LowTable x={TABLE.x} y={G} w={TABLE.w} h={TABLE.h} />
        {table}
        {log}
        {children}
      </L>
      <L cam={cam} depth={1.2}>
        {front}
      </L>
      <g transform={`translate(${VW / 2} ${VH / 2}) scale(${cam.zoom * 0.3 + 0.7}) translate(${-VW / 2} ${-VH / 2})`}>
        <DustMotes t={t} x={0} y={0} w={VW} h={VH} n={26} o={dust} />
      </g>
      <Grade tint="#ffe6c4" k={0.35} vig={0.3} warm />
    </>
  );
};

// ------------------------------------------------------------------ world 2: the lender's shore (stone steps)
const HS = { horizon: 1150, top: 1250, stepsX: 520, run: 120, rise: 55, n: 10, water: 1600 };
const stepY = (x: number) => HS.top + Math.max(0, Math.min(HS.n - 1, (x - HS.stepsX) / HS.run)) * HS.rise;

const HomeShore: React.FC<{ cam: Cam; f: number; mood?: SeaMood; children?: React.ReactNode; water?: React.ReactNode; front?: React.ReactNode; blur?: number; farShip?: boolean }> = ({ cam, f, mood = "warm", children, water, front, blur = 0, farShip }) => {
  const t = f / 30;
  return (
    <>
      <L cam={cam} depth={0} blur={blur}>
        <SeaSky mood={mood} t={t} sunX={1500} sunY={420} />
      </L>
      <L cam={cam} depth={0.2} blur={blur}>
        <Birds t={t} x={500} y={650} n={4} />
        <Seagull x={((t * 90) % 2600) - 600} y={760 + Math.sin(t) * 30} t={t} s={0.6} />
      </L>
      <L cam={cam} depth={1} blur={blur}>
        <Sea y={HS.horizon} t={t} mood={mood === "grey" ? "grey" : "sun"} />
        {farShip && <Ship x={2300 + t * 6} y={HS.horizon + 40} s={0.16} t={t} />}
        {water}
        {/* terrace + wall the house stands on */}
        <path d={`M -1500 ${HS.top} L ${HS.stepsX + 6} ${HS.top} L ${HS.stepsX + 6} 3400 L -1500 3400 Z`} fill="#c9a57a" stroke="#3d2a1e" strokeWidth={4} />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M -1500 ${HS.top + 60 + i * 70} L ${HS.stepsX} ${HS.top + 60 + i * 70}`} stroke="#a98a62" strokeWidth={3} opacity={0.6} />
        ))}
        <MudHouse x={130} y={HS.top} w={560} h={380} door={0.8} t={t} tone={2} />
        <ClothesLine x0={-520} x1={-150} y={HS.top - 300} g={HS.top} t={t} />
        <StoneSteps x={HS.stepsX} y={HS.top} n={HS.n} run={HS.run} rise={HS.rise} bottom={3400} />
        {/* water over the lowest steps */}
        <rect x={HS.stepsX - 10} y={HS.water} width={2600} height={1800} fill="#2f78a8" opacity={0.92} />
        <ShoreFoam x0={HS.stepsX + ((HS.water - HS.top) / HS.rise) * HS.run - 60} x1={3000} y={HS.water} t={t} reach={0.7} />
        {children}
      </L>
      <L cam={cam} depth={1.25}>{front}</L>
      <Grade tint={mood === "grey" ? "#c8d4e2" : "#ffe2bc"} k={0.35} vig={0.3} warm={mood !== "grey"} />
    </>
  );
};

// ------------------------------------------------------------------ world 3: the far pier (grey)
const PR = { horizon: 1000, x0: -900, x1: 1400, deck: 1500, water: 1640, land: 1540 };

const Pier: React.FC<{ cam: Cam; f: number; children?: React.ReactNode; water?: React.ReactNode; front?: React.ReactNode; mood?: SeaMood; open?: boolean }> = ({ cam, f, children, water, front, mood = "grey", open }) => {
  const t = f / 30;
  return (
    <>
      <L cam={cam} depth={0}>
        <SeaSky mood={mood} t={t} />
      </L>
      <L cam={cam} depth={0.25}>
        <Seagull x={((t * 70) % 3000) - 800} y={700 + Math.sin(t * 0.8) * 40} t={t} s={0.7} glide={Math.sin(t) > 0.3} />
        <Seagull x={2200 - ((t * 50) % 3000)} y={820} t={t + 0.5} s={0.5} flip />
      </L>
      <L cam={cam} depth={1}>
        <Sea y={PR.horizon} t={t} mood={mood} rough={1.3} />
        {water}
        {!open && (
        <>
        {/* far coast with a harbour town */}
        <path d={`M -3000 ${PR.horizon + 4} L -3000 ${PR.horizon - 90} Q -2400 ${PR.horizon - 150} -1600 ${PR.horizon - 60} L -1200 ${PR.horizon + 4} Z`} fill="#7d8796" opacity={0.85} />
        {[-2700, -2520, -2360, -2200, -2040].map((hx, i) => (
          <rect key={i} x={hx} y={PR.horizon - 120 - (i % 2) * 30} width={120} height={120 + (i % 2) * 30} fill="#8a93a2" opacity={0.85} />
        ))}
        {/* the land the pier starts from, with flat stones */}
        <path d={`M -2600 ${PR.land} Q -1600 ${PR.land - 60} ${PR.x0 + 60} ${PR.land - 10} L ${PR.x0 + 140} ${PR.water + 40} L -2600 3400 Z`} fill="#8e8676" stroke="#3d2a1e" strokeWidth={4} />
        {[[-1500, 0, 1.3], [-1150, 10, 1], [-820, 60, 0.9], [-1900, -10, 1.1]].map(([sx, dy, sc], i) => (
          <ellipse key={i} cx={sx} cy={PR.land + dy} rx={150 * sc} ry={34 * sc} fill="#b5ad9a" stroke="#3d2a1e" strokeWidth={4} />
        ))}
        <ShoreFoam x0={PR.x0 - 40} x1={PR.x0 + 260} y={PR.water + 30} t={t} />
        <WoodPier x0={PR.x0} x1={PR.x1} y={PR.deck} waterY={PR.water} t={t} />
        <ShoreFoam x0={PR.x0} x1={PR.x1 + 100} y={PR.water} t={t + 1} reach={0.5} />
        <MooringPost x={260} y={PR.deck - 34} t={t} waterY={PR.water - PR.deck + 60} />
        <MooringPost x={820} y={PR.deck - 34} t={t + 2} waterY={PR.water - PR.deck + 60} />
        <CargoPile x={-560} y={PR.deck - 34} s={0.8} />
        <CargoPile x={-1700} y={PR.land - 10} s={1} />
        <DateStall x={-2150} y={PR.land - 30} t={t} s={0.9} />
        <Fisherman f={f} x={560} />
        <Porter f={f} />
        </>
        )}
        {children}
      </L>
      <L cam={cam} depth={1.25}>{front}</L>
      <Grade tint={mood === "grey" ? "#c4d0de" : "#ffe6c4"} k={0.4} vig={0.4} warm={mood !== "grey"} />
    </>
  );
};


// ------------------------------------------------------------------ front close-up: body runs out of the frame, the set's grade on top
const Close: React.FC<{
  f: number;
  a: number;
  b: number;
  bg: React.ReactNode;
  look: Partial<Look>;
  p: Partial<FrontPose>;
  push?: [number, number];
  y?: number;
  held?: React.ReactNode;
  fg?: React.ReactNode;
  tint: string;
  warm?: boolean;
  light?: "l" | "r";
  dx?: number;
}> = ({ f, a, b, bg, look, p, push = [1.85, 2.0], y = 1560, held, fg, tint, warm = true, light = "l", dx = 0 }) => {
  const k = kf(f, [[a, 0], [b, 1]], lin);
  const s = mix(push[0], push[1], k);
  const drift = Math.sin(f / 40) * 10;
  return (
    <>
      {bg}
      <g transform={`translate(${VW / 2 + drift + dx} ${y})`}>
        <MusafirFront x={0} y={0} s={s} look={look} pose={p} held={held} light={light} />
      </g>
      <Grade tint={tint} k={0.28} vig={0.32} warm={warm} />
      {fg}
    </>
  );
};

const courtBg = (f: number, x = 1200, blur = 7) => <Court cam={{ x, y: G - 520, zoom: 1.6 }} f={f} bgBlur={blur} dust={0.3} />;
const pierBg = (f: number) => <Pier cam={{ x: 900 + Math.sin(f / 60) * 20, y: PR.deck - 360, zoom: 1.5 }} f={f} />;

/** Table seen from above (inserts): letter, pouch and hands. */
const TableInsert: React.FC<{ f: number; z?: number; rot?: number; children: React.ReactNode; leak?: number }> = ({ f, z = 1, rot = 0, children, leak = 0 }) => {
  const t = f / 30;
  return (
    <g>
      <g transform={`translate(${VW / 2} ${VH / 2}) scale(${z}) rotate(${rot}) translate(${-VW / 2} ${-VH / 2})`}>
        <rect x={-400} y={-400} width={VW + 800} height={VH + 800} fill="#a87648" />
        <TableTop w={VW} h={VH} />
        {children}
      </g>
      <Streak x={VW * 0.62} y={VH * 0.4} rot={-32} o={0.22} w={120} />
      <LightLeak k={leak} t={t} w={VW} h={VH} />
      <Grade tint="#ffe2bc" k={0.3} vig={0.45} warm />
    </g>
  );
};

// ------------------------------------------------------------------ the lender sawing (saw held in his fist, blade aimed at the kerf)
const LX = 1430;
const sawPose = (f: number, on: number) => {
  const t = f / 30;
  const stroke = Math.sin(t * 13) * on;
  return pose(f, { lean: 20, armF: [58 + stroke * 12, 34 - stroke * 10], armB: [36 + stroke * 6, 40], headTilt: 12, look: 0.8, brow: -0.1, grip: true }, 5);
};
const Sawing: React.FC<{ f: number; on: number; x?: number }> = ({ f, on, x = LX }) => {
  const p = sawPose(f, on);
  const h = handPos(x, G + 20, p, true, 1, LENDER);
  const toKerf = deg(KERF.x - h.x, KERF.y + 10 - h.y);
  return (
    <Musafir
      x={x}
      y={G + 20}
      flip
      look={LENDER}
      light="r"
      pose={p}
      holdF={
        <g transform={`rotate(${aim(p, toKerf + 180, true, LENDER)}) translate(-350 12)`}>
          <HandSaw x={0} y={0} />
        </g>
      }
    />
  );
};

// ------------------------------------------------------------------ scene 1: hook (saw, glint, slow-motion gold, the lender's face)
const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S1;
  const rewind = kf(l, [[80, 0], [90, 1]], lin);
  if (l < 36) {
    const cut = kf(l, [[0, 0.25], [34, 0.6]], lin);
    const glint = kf(l, [[20, 0], [30, 1]], easeBack);
    const sh = shake(l, 30, 6, 8);
    const cam: Cam = { x: KERF.x + 30 + sh.x, y: KERF.y + 40 + sh.y, zoom: kf(l, [[0, 4.6], [36, 4.2]]), rot: -3 };
    return (
      <>
        <Court cam={cam} f={f} bgBlur={8} log={<KnotLog x={LOG.x} y={LOG.y} s={LOG.s} t={t} cut={cut} glint={glint} />} front={<Sawdust x={KERF.x} y={KERF.y + 40} t={t} on={1} floor={120} />}>
          <Sawing f={f} on={1} />
        </Court>
        <LensFlare x={VW / 2 - 40} y={VH / 2 + 60} k={glint * 0.9} t={t} w={VW} h={VH} />
        <FlashFx k={kf(l, [[30, 0], [35, 0.7]], lin)} w={VW} h={VH} />
      </>
    );
  }
  if (l < 60) {
    // slow motion: the log falls open, gold slides out in the light
    const sl = slowmo(l, 36, 60, 0.35);
    const open = kf(sl, [[36, 0], [44.4, 1]], Easing.out(Easing.quad));
    const cam: Cam = { x: KERF.x + 70, y: LOG.y + 10, zoom: kf(l, [[36, 3.6], [60, 3.9]]), rot: 2 };
    return (
      <>
        <Court cam={cam} f={f} bgBlur={9} log={<KnotLog x={LOG.x} y={LOG.y} s={LOG.s} t={t * 0.35} open={open} />} />
        <LensFlare x={VW / 2 + 40} y={VH / 2 + 20} k={0.8} t={t} w={VW} h={VH} />
        <FlashFx k={kf(l, [[36, 0.8], [42, 0]], lin)} w={VW} h={VH} />
      </>
    );
  }
  // front close-up: frozen in wonder, eyes into the lens
  const wide = kf(l, [[60, 0.6], [66, 1]], easeBack);
  const lookY = kf(l, [[60, 0.7], [72, 0]]);
  return (
    <>
      <Close
        f={f}
        a={S1 + 60}
        b={S2}
        bg={courtBg(f, 1300)}
        look={LENDER}
        p={fp(f, { wide, lookY, brow: 0.9, mouth: "open", eyeOpen: 1, tilt: -2 })}
        push={[1.75, 1.9]}
        y={1450}
        tint="#ffe6c4"
        light="r"
        fg={
          <g>
            <Streak x={VW / 2 + 160} y={900} rot={-24} o={0.18} w={70} />
            {/* the glowing log in front of him (soft focus) */}
            <g filter="url(#blur3)" transform={`translate(${VW / 2 - 40} 1790) scale(1.7)`}>
              <KnotLog x={0} y={0} t={t} cut={0.6} glint={1} />
            </g>
            <LensFlare x={VW / 2 + 40} y={1720} k={0.6} t={t} w={VW} h={VH} />
          </g>
        }
      />
      <RewindFx k={rewind} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ scene 2: the loan (flashback)
const Passerby: React.FC<{ f: number; k: number }> = ({ f, k }) => {
  const x = mix(HS.stepsX - 160, HS.stepsX + 900, k);
  const y = x < HS.stepsX ? HS.top : stepY(x) + 2;
  const p = pose(f, { walk: 1, step: x / 38, armF: [165, 20], armB: [-8, 10], grip: true }, 3);
  return (
    <Musafir
      x={x}
      y={y}
      scale={0.9}
      look={LOOKS.raahgir}
      light="r"
      pose={p}
      holdF={
        <g transform={`rotate(${-foreAngle(p, "F", LOOKS.raahgir)}) translate(-10 30)`}>
          <FruitBasket x={0} y={0} s={0.6} />
        </g>
      }
    />
  );
};

/** Two men at the table (side view). */
const TableTalk: React.FC<{ f: number; borrowerArm?: number; lenderNod?: number; lenderTalk?: number; front?: boolean; letter?: React.ReactNode; pouch?: React.ReactNode }> = ({ f, borrowerArm = 0, lenderNod = 0, lenderTalk = 0, letter, pouch }) => {
  const t = f / 30;
  const up = Math.max(0, Math.sin(t * 2.2)) * borrowerArm;
  return (
    <>
      {letter}
      {pouch}
      <Musafir
        x={TABLE.x - 330}
        y={G + 30}
        look={BORROWER}
        light="r"
        pose={pose(f, { lean: 6, armF: [mix(30, 150, up), mix(40, 10, up)], armB: [-6, 10], brow: -0.2 + up * 0.5, look: 0.6, headTilt: 3 - up * 6, mouth: borrowerArm > 0 && Math.sin(t * 9) > 0 ? "open" : "neutral" }, 11)}
      />
      <Musafir
        x={TABLE.x + 330}
        y={G + 30}
        flip
        look={LENDER}
        light="r"
        pose={pose(f, { lean: 4, armF: [mix(14, 50, lenderTalk), mix(16, 40, lenderTalk)], armB: [-8, 10], headTilt: lenderNod * 10 * Math.max(0, Math.sin(t * 7)), look: 0.6, brow: 0.1 + lenderTalk * 0.4, mouth: lenderTalk > 0 && Math.sin(t * 9) > 0 ? "open" : "neutral" }, 2)}
      />
    </>
  );
};

/** Over-the-shoulder: one man's back big and soft in the foreground (screen space), the other in the set behind. */
const OTS: React.FC<{ f: number; look: Partial<Look>; side: "l" | "r"; children: React.ReactNode }> = ({ f, look, side, children }) => (
  <>
    {children}
    <g filter="url(#blur4)">
      <Musafir x={side === "r" ? VW - 120 : 120} y={VH + 620} scale={3.4} flip={side === "l"} back look={look} pose={pose(f, { armF: [10, 10], headTilt: -4 })} noShadow />
    </g>
  </>
);

const Scene2: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S2;
  const rewind = kf(l, [[0, 1], [14, 0]], lin);
  if (l < 100) {
    // crane down from the sky to the house on the steps; a ship far out at sea
    const k = kf(l, [[0, 0], [70, 1]], ease);
    const cam: Cam = { x: mix(700, 620, k), y: mix(700, 1220, k), zoom: mix(1.2, 1.06, k) };
    return (
      <>
        <HomeShore cam={cam} f={f} mood="warm" farShip>
          <Passerby f={f} k={kf(l, [[0, 0.05], [100, 0.6]], lin)} />
        </HomeShore>
        <RewindFx k={rewind} t={t} w={VW} h={VH} />
      </>
    );
  }
  if (l < 190) {
    // over the lender's shoulder: the borrower asks for the loan
    const cam: Cam = { x: kf(l, [[100, TABLE.x - 260], [190, TABLE.x - 230]]), y: G - 430, zoom: kf(l, [[100, 1.7], [190, 1.82]]) };
    return (
      <OTS f={f} look={LENDER} side="r">
        <Court cam={cam} f={f} curtainLift={Math.max(0, Math.sin(t * 0.9)) * 0.5}>
          <TableTalk f={f} borrowerArm={0.6} />
        </Court>
      </OTS>
    );
  }
  if (l < 270) {
    // beat: line 2 starts here. The borrower: "Allah is enough" - earnest, eyes lift, then into the lens
    const lookY = kf(l, [[196, 0], [214, -0.8], [244, -0.8], [258, 0]]);
    return <Close f={f} a={S2 + 190} b={S2 + 270} bg={courtBg(f, 800)} look={BORROWER} p={fp(f, { lookY, brow: 0.3, turn: 0.35, tilt: kf(l, [[196, 0], [220, -4]]) }, 4)} tint="#ffe6c4" light="r" />;
  }
  if (l < 330) {
    // the lender decides: looks aside, thinks, nods, a small smile (3/4)
    const lookX = kf(l, [[270, -0.7], [300, -0.7], [310, 0]]);
    const tilt = kf(l, [[300, 0], [306, 6], [312, 0], [318, 5], [330, 2]]);
    return <Close f={f} a={S2 + 270} b={S2 + 330} bg={courtBg(f, 1400)} look={LENDER} p={fp(f, { lookX, tilt, turn: -0.35, brow: l > 306 ? 0.4 : -0.2, mouth: l > 310 ? "smile" : "neutral" }, 9)} push={[1.9, 2.05]} tint="#ffe6c4" light="r" />;
  }
  // insert from above: his hand pushes the pouch across, the borrower's hand takes it
  const push = kf(l, [[340, 0], [372, 1]], Easing.inOut(Easing.cubic));
  const px = mix(VW * 0.72, VW * 0.36, push);
  const take = kf(l, [[366, 0], [384, 1]], easeBack);
  return (
    <TableInsert f={f} z={kf(l, [[330, 1.02], [390, 1.1]])} rot={-4}>
      <PouchTop x={px} y={VH * 0.5} />
      <HandReach from={[VW + 200, VH * 0.58]} to={[px + 140, VH * 0.5 + 10]} k={kf(l, [[330, 0.3], [340, 1], [376, 1], [390, 0.5]])} sleeve={LENDER.robe} skin={LENDER.skin} mode="flat" s={1.1} />
      <HandReach from={[-200, VH * 0.44]} to={[px - 140, VH * 0.5]} k={take} sleeve={BORROWER.robe} skin={BORROWER.skin} mode="grip" s={1.05} />
    </TableInsert>
  );
};

// ------------------------------------------------------------------ scene 3: by ship across the sea, then no ship back
const SHIP_HOME = { x: 1950, y: HS.water, s: 0.7 };
const plankStart = { x: 1177, y: stepY(1177) };
const plankEnd = { x: SHIP_HOME.x - 560 * SHIP_HOME.s, y: SHIP_HOME.y - 300 * SHIP_HOME.s };

const ShipWith: React.FC<{ f: number; x: number; y: number; s: number; flip?: boolean; who?: React.ReactNode; row?: number; plank?: number; plankSide?: "stern" | "bow"; plankLen?: number; plankAng?: number; crewPull?: number }> = ({ f, x, y, s, flip, who, row = 0, plank = 0, plankSide, plankLen, plankAng, crewPull = 0 }) => {
  const t = f / 30;
  const deck = y - 210 * (s / 0.7);
  const bob = Math.sin(t * 1.1 + 0.6) * 10 * s;
  return (
    <g>
      <Ship x={x} y={y} s={s} t={t} flip={flip} layer="back" row={row} />
      <Musafir x={x + (flip ? -1 : 1) * 260 * s} y={deck + bob + 30 * s} scale={1.2 * s} flip={flip} look={SAILOR} light="r" pose={pose(f, { lean: 10 + crewPull * 18, armF: [60 + crewPull * 30 * Math.sin(t * 4), 30], armB: [50, 30], headTilt: 4, grip: crewPull > 0 }, 8)} />
      <Musafir x={x + (flip ? 1 : -1) * 120 * s} y={deck + bob + 30 * s} scale={1.15 * s} flip={!flip} look={{ ...LOOKS.mazdoor, face: "long", build: 0.95 }} light="r" pose={pose(f, { armF: [30, 20], armB: [-10, 10], look: 0.4 }, 17)} />
      {who}
      <Ship x={x} y={y} s={s} t={t} flip={flip} layer="front" row={row} plank={plank} plankSide={plankSide} plankLen={plankLen} plankAng={plankAng} />
      <rect x={x - 900 * s} y={y + 10} width={1800 * s} height={140 * s} fill="#2f78a8" opacity={0.8} />
    </g>
  );
};

const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S3;
  if (l < 70) {
    // home steps: he walks up the gangplank onto the ship
    const k = kf(l, [[4, 0], [56, 1]], lin);
    const wx = mix(plankStart.x - 120, plankEnd.x, k);
    const wy = wx < plankStart.x ? stepY(wx) : mix(plankStart.y, plankEnd.y, (wx - plankStart.x) / (plankEnd.x - plankStart.x));
    const cam: Cam = { x: kf(l, [[0, 1350], [70, 1480]]), y: 1240, zoom: 1.2 };
    return (
      <HomeShore cam={cam} f={f} mood="sun">
        <ShipWith f={f} x={SHIP_HOME.x} y={SHIP_HOME.y} s={SHIP_HOME.s} plank={1} plankLen={600} plankAng={155} />
        <Musafir x={wx} y={wy} look={BORROWER} light="r" pose={pose(f, { walk: 1, step: wx / 34, look: 0.6, lean: 6 }, 2)} />
      </HomeShore>
    );
  }
  if (l < 150) {
    // open sea: the ship sails, oars row, camera tracks with it
    const sx = kf(l, [[70, 200], [150, 1200]], lin);
    const cam: Cam = { x: sx + 160, y: 1050, zoom: 1.25 };
    const whip = kf(l, [[140, 0], [150, 1]], Easing.in(Easing.quad));
    return (
      <>
        <Pier cam={{ ...cam, x: cam.x + whip * 600 }} f={f} mood="sun" open water={<ShipWith f={f} x={sx} y={1300} s={0.75} row={1} who={<Musafir x={sx - 20} y={1300 - 225 + Math.sin(t * 1.1 + 0.6) * 7} scale={0.85} look={BORROWER} light="l" pose={pose(f, { look: 0.9, armF: [20, 10] }, 1)} />} />} />
        <WhipFx k={whip} t={t} w={VW} h={VH} />
      </>
    );
  }
  if (l < 220) {
    // time jump: the busy grey far pier; low-angle tracking as he walks to the end looking for a ship back
    const wx = kf(l, [[150, 200], [216, 1150]], lin);
    const whip = kf(l, [[150, 1], [158, 0]], Easing.out(Easing.quad));
    const cam: Cam = { x: wx + 60 - whip * 600, y: PR.deck - 300, zoom: 1.55, rot: 1.2 };
    return (
      <>
        <Pier cam={cam} f={f}>
          <Musafir x={wx} y={PR.deck - 30} look={BORROWER} light="l" pose={pose(f, { walk: l < 214 ? 1 : 0, step: wx / 40, look: 0.9, brow: -0.4, armF: [20, 20] }, 6)} />
        </Pier>
        <WhipFx k={whip} t={t} w={VW} h={VH} />
      </>
    );
  }
  if (l < 270) {
    // beat: line 2. His POV: empty water, a slow pan, an empty mooring rope
    const cam: Cam = { x: kf(l, [[220, 2200], [270, 2700]]), y: PR.horizon + 120, zoom: 1.35 };
    return <Pier cam={cam} f={f} />;
  }
  const lookX = kf(l, [[270, 0.8], [285, -0.8], [300, 0.8], [314, 0]]);
  return <Close f={f} a={S3 + 270} b={S4} bg={pierBg(f)} look={BORROWER} p={fp(f, { lookX, brow: -0.8, mouth: "sad", tilt: -3, turn: 0.2 }, 2)} tint="#b8c6d8" warm={false} light="l" />;
};

// ------------------------------------------------------------------ scene 4: the hollow log, the letter, the prayer, the sea
const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S4;
  if (l < 80) {
    // kneeling on the flat stone: chisel in one fist, mallet in the other (chips fly)
    const hit = Math.max(0, Math.sin(t * 7));
    const p = pose(f, { kneel: 1, lean: 30, armF: [30 + hit * 55, 50], armB: [40, 50], headTilt: 16, look: 0.8, brow: -0.3, grip: true }, 4);
    const cam: Cam = { x: kf(l, [[0, -1080], [80, -1050]]), y: PR.land - 260, zoom: kf(l, [[0, 2.0], [80, 2.2]]) };
    return (
      <Pier
        cam={cam}
        f={f}
        front={
          <g>
            {[0, 1, 2, 3].map((i) => {
              const ph = ((t * 1.3 + i / 4) % 1 + 1) % 1;
              return <path key={i} d="M 0 0 q 14 -8 26 0 q -12 8 -26 0 Z" fill="#d9b47e" stroke="#3d2a1e" strokeWidth={2} transform={`translate(${-1020 + ph * 160 * (i % 2 ? 1 : -1)} ${PR.land - 70 - ph * 90 + ph * ph * 160}) rotate(${ph * 300})`} opacity={1 - ph} />;
            })}
          </g>
        }
      >
        <KnotLog x={-1010} y={PR.land - 44} s={0.6} t={t} hollowEnd={kf(l, [[0, 0.3], [80, 1]])} />
        <Musafir
          x={-1250}
          y={PR.land + 4}
          look={BORROWER}
          light="l"
          pose={p}
          holdF={
            <g transform={`rotate(${aim(p, -100 + hit * 40, false, BORROWER)})`}>
              <rect x={-8} y={-10} width={120} height={16} rx={6} fill="#8a5a34" stroke="#3d2a1e" strokeWidth={3} />
              <rect x={100} y={-26} width={50} height={48} rx={10} fill="#6e4426" stroke="#3d2a1e" strokeWidth={3} />
            </g>
          }
          holdB={
            <g transform={`rotate(${aim(p, 60, false, BORROWER, "B")})`}>
              <rect x={-6} y={-6} width={70} height={12} rx={4} fill="#8a5a34" stroke="#3d2a1e" strokeWidth={3} />
              <path d="M 64 -5 L 100 -3 L 100 3 L 64 5 Z" fill="#c9ccd0" stroke="#3d2a1e" strokeWidth={3} />
            </g>
          }
        />
      </Pier>
    );
  }
  if (l < 210) {
    // top-down: coins go in, his hand lays the letter in, then presses the plug shut
    const coins = kf(l, [[86, 0], [140, 1]], lin);
    const letter = kf(l, [[136, 0], [172, 1]], Easing.out(Easing.cubic));
    const plug = kf(l, [[184, 0], [198, 1]], easeBack);
    const z = kf(l, [[80, 1.0], [210, 1.12]]);
    const lx = mix(VW / 2 - 260, VW / 2 + 60, letter);
    const ly = mix(VH * 0.8, VH * 0.48 + 4, letter);
    return (
      <g>
        <rect x={0} y={0} width={VW} height={VH} fill="#8d8a80" />
        <g transform={`translate(${VW / 2} ${VH / 2}) scale(${z * 1.12}) rotate(${kf(l, [[80, -4], [210, 2]])}) translate(${-VW / 2} ${-VH / 2})`}>
          <HollowLogTop t={t} w={VW} h={VH} coins={coins} letter={letter} plug={plug} />
          {l < 178 && <HandReach from={[-180, VH + 160]} to={[lx - 70, ly + 40]} k={kf(l, [[126, 0], [138, 1], [172, 1], [178, 0.3]])} sleeve={BORROWER.robe} skin={BORROWER.skin} mode="grip" />}
          {l >= 178 && <HandReach from={[VW + 160, VH + 200]} to={[VW / 2 + 60, VH * 0.48 + 20]} k={kf(l, [[178, 0], [190, 1], [204, 1], [210, 0.6]])} sleeve={BORROWER.robe} skin={BORROWER.skin} mode="flat" s={1.1} />}
        </g>
        <Grade tint="#ffe2bc" k={0.3} vig={0.4} warm />
      </g>
    );
  }
  if (l < 285) {
    // the prayer: front close-up, hands rise from below the frame, eyes closed, then open, steady
    const upK = kf(l, [[210, 0], [228, 1]], easeBack);
    const eyes = l < 266 ? 0.12 : blink(f, 3);
    return (
      <Close
        f={f}
        a={S4 + 210}
        b={S4 + 285}
        bg={<Pier cam={{ x: -900, y: PR.land - 420, zoom: 1.4 }} f={f} />}
        look={BORROWER}
        p={fp(f, { hands: "dua", handsUp: upK, eyeOpen: eyes, brow: -0.3, lookY: -0.3, tilt: 3 })}
        push={[1.7, 1.86]}
        y={1480}
        tint="#c8d4e2"
        warm={false}
        light="l"
      />
    );
  }
  // the throw: log over his head in both fists, released; slow motion in the air; splash; camera drops to the surface
  const sl = slowmo(l, 300, 330, 0.4);
  const k = kf(sl, [[298, 0], [312, 1]], lin);
  const held = sl < 298;
  const throwP = pose(f, { lean: kf(l, [[285, -8], [296, -14], [302, 18], [330, 6]]), armF: [kf(l, [[285, 120], [296, 160], [302, 40], [330, 20]]), 10], armB: [kf(l, [[285, 110], [296, 150], [302, 40], [330, 20]]), 10], look: 0.9, brow: -0.2, grip: held }, 7);
  const sx = -860;
  const hand = handPos(sx, PR.land, throwP, false, 1, BORROWER);
  const lx = mix(hand.x, -500, k);
  const ly = held ? hand.y : sl < 312 ? mix(hand.y, PR.water + 20, k) - Math.sin(k * Math.PI) * 220 : PR.water + 20 + Math.sin(t * 2) * 8;
  const drift = sl > 312 ? (sl - 312) * 3 : 0;
  const lowCam = kf(sl, [[312, 0], [322, 1]]);
  const cam: Cam = { x: mix(-740, -480 + drift, lowCam), y: mix(PR.land - 300, PR.water - 40, lowCam), zoom: mix(1.6, 2.3, lowCam) };
  const splash = sl >= 312 ? kf(sl, [[312, 0], [332, 1]], Easing.out(Easing.quad)) : 0;
  return (
    <Pier cam={cam} f={f} front={<SplashFx x={-500 + drift} y={PR.water + 10} age={splash} s={0.7} />}>
      <Musafir
        x={sx}
        y={PR.land}
        look={BORROWER}
        light="l"
        pose={throwP}
        holdF={held ? <g transform={`rotate(${-foreAngle(throwP, "F", BORROWER)}) translate(-40 0)`}><KnotLog x={0} y={0} s={0.5} t={t} sealed /></g> : undefined}
      />
      {!held && <KnotLog x={lx + drift} y={ly} s={0.5} rot={sl < 312 ? k * 200 : 6 + Math.sin(t * 2) * 4} t={t} sealed wet={sl > 312 ? 1 : 0} />}
    </Pier>
  );
};

// ------------------------------------------------------------------ scene 5: one sea, two shores (water wipe between them)
const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S5;
  if (l < 60) {
    const cam: Cam = { x: kf(l, [[0, 900], [60, 1000]]), y: PR.deck - 280, zoom: kf(l, [[0, 1.25], [60, 1.35]]) };
    const shade = Math.sin(t * 2.2) > 0;
    return (
      <>
        <Pier cam={cam} f={f}>
          <Musafir x={1240} y={PR.deck - 30} look={BORROWER} light="l" pose={pose(f, { armF: shade ? [150, 40] : [20, 20], look: 0.9, brow: -0.5, headTilt: -6, lean: -3 }, 3)} />
        </Pier>
        <WaterWipe k={kf(l, [[44, 0], [60, 1]], Easing.in(Easing.quad))} t={t} w={VW} h={VH} />
      </>
    );
  }
  if (l < 140) {
    // beat: line 2. The lender (heavier, stooped) comes down the steps and looks out to sea
    const wx = kf(l, [[60, HS.stepsX + 80], [115, HS.stepsX + 560]], lin);
    const walking = l < 115;
    const cam: Cam = { x: kf(l, [[60, 900], [140, 980]]), y: 1300, zoom: 1.35 };
    return (
      <>
        <HomeShore cam={cam} f={f} mood="warm">
          <PerchedBird x={HS.stepsX + 700} y={stepY(HS.stepsX + 700)} t={t} s={1} fly={kf(l, [[80, 0], [115, 1]], Easing.in(Easing.quad))} dir={1} />
          <Musafir x={wx} y={stepY(wx) + 4} look={LENDER} light="r" pose={pose(f, { walk: walking ? 0.8 : 0, step: wx / 30, look: 0.9, armF: walking ? [10, 10] : [150, 40], headTilt: walking ? 4 : -6 }, 6)} />
        </HomeShore>
        <WaterWipe k={kf(l, [[60, 1], [76, 0]], Easing.out(Easing.quad))} t={t} w={VW} h={VH} />
      </>
    );
  }
  // his gaze: from the far water down to the knot bobbing at the steps; a wave turns it over
  const k = kf(l, [[140, 0], [215, 1]]);
  const flipK = kf(l, [[215, 0], [235, 1]], easeBack);
  const cam: Cam = { x: mix(1900, 1450, k), y: mix(HS.horizon + 60, HS.water - 20, k), zoom: mix(1.4, 2.6, k) };
  return <HomeShore cam={cam} f={f} mood="warm" water={<KnotLog x={1460} y={HS.water + 16 + Math.sin(t * 2.2) * 10} s={0.55} rot={mix(170, 8, flipK) + Math.sin(t * 2) * 4} t={t} wet={1} sealed />} />;
};

// ------------------------------------------------------------------ scene 6: the log is opened: dinars and the same letter
const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S6;
  if (l < 75) {
    // he lifts it in both fists and carries it up the steps
    const wx = kf(l, [[0, HS.stepsX + 820], [20, HS.stepsX + 820], [75, HS.stepsX + 420]], lin);
    const lift = kf(l, [[4, 0], [18, 1]], easeBack);
    const p = pose(f, { walk: l > 20 ? 0.8 : 0, step: wx / 30, lean: mix(34, 8, lift), armF: [mix(20, 70, lift), mix(10, 50, lift)], armB: [mix(10, 66, lift), 50], look: 0.4, brow: 0.2, grip: true }, 2);
    const cam: Cam = { x: kf(l, [[0, 1350], [75, 1050]]), y: kf(l, [[0, 1480], [75, 1400]]), zoom: 1.9 };
    return (
      <HomeShore cam={cam} f={f} mood="warm">
        <Musafir
          x={wx}
          y={stepY(wx) + 4}
          flip
          look={LENDER}
          light="r"
          pose={p}
          holdF={
            <g transform={`rotate(${-foreAngle(p, "F", LENDER)}) translate(-70 4)`}>
              <KnotLog x={0} y={0} s={0.42} rot={-4} t={t} wet={0.8} sealed />
            </g>
          }
        />
      </HomeShore>
    );
  }
  if (l < 150) {
    // beat: line 2. The saw again; it stops - half a second of silence - the log opens: flare, coins spill
    const on = l < 112 ? 1 : 0;
    const open = kf(l, [[126, 0], [140, 1]], easeBack);
    const cam: Cam = { x: kf(l, [[75, 1200], [150, 1120]]), y: kf(l, [[75, G - 360], [150, TOP - 120]]), zoom: kf(l, [[75, 1.7], [112, 2.0], [150, 3.6]]) };
    return (
      <>
        <Court cam={cam} f={f} curtainLift={kf(l, [[126, 0], [142, 1], [150, 0.6]])} log={<KnotLog x={LOG.x} y={LOG.y} s={LOG.s} t={t} cut={kf(l, [[75, 0.3], [112, 1]], lin)} glint={kf(l, [[100, 0], [112, 1]])} open={open} />} front={<Sawdust x={KERF.x} y={KERF.y + 40} t={t} on={on} floor={120} />}>
          {l < 112 ? (
            <Sawing f={f} on={on} />
          ) : (
            <Musafir x={LX} y={G + 20} flip look={LENDER} light="r" pose={pose(f, { lean: 10, armF: [40, 20], armB: [-6, 10], look: 0.8, brow: 0.9, mouth: "open" })} />
          )}
        </Court>
        <LensFlare x={VW / 2 + 30} y={VH / 2 + 80} k={kf(l, [[126, 0], [134, 1], [150, 0.4]])} t={t} w={VW} h={VH} />
        <FlashFx k={kf(l, [[126, 0], [129, 0.6], [136, 0]], lin)} w={VW} h={VH} color="#fff2c0" />
      </>
    );
  }
  if (l < 195) {
    // from above: his hand draws the folded letter out of the hollow
    const out = kf(l, [[160, 1], [190, 0]], Easing.inOut(Easing.cubic));
    const lx = mix(VW / 2 - 260, VW / 2 + 60, out);
    const ly = mix(VH * 0.8, VH * 0.48 + 4, out);
    return (
      <TableInsert f={f} z={kf(l, [[150, 1.05], [195, 1.15]])} rot={3}>
        <HollowLogTop t={t} w={VW} h={VH} coins={1} letter={out} bg={false} chips={0} />
        <HandReach from={[-180, VH + 160]} to={[lx - 70, ly + 40]} k={kf(l, [[150, 0.2], [160, 1]])} sleeve={LENDER.robe} skin={LENDER.skin} mode="grip" s={1.1} />
      </TableInsert>
    );
  }
  // the same letter in his fists; it opens; his eyes rise from the letter to the lens
  const open = kf(l, [[198, 0], [222, 1]], Easing.out(Easing.cubic));
  const lookY = kf(l, [[195, 0.9], [232, 0.9], [244, 0]]);
  return (
    <Close
      f={f}
      a={S6 + 195}
      b={S7}
      bg={courtBg(f, 1100)}
      look={LENDER}
      p={fp(f, { hands: "letter", handsUp: kf(l, [[195, 0.4], [206, 1]], easeBack), lookY, wide: l > 232 ? 0.8 : 0.3, brow: 0.8, mouth: l > 236 ? "open" : "neutral", holdW: 150 })}
      push={[1.75, 1.9]}
      y={1460}
      held={<FoldedLetter x={0} y={-40} s={1.4} open={open} rot={-3} />}
      tint="#ffe6c4"
      light="r"
      fg={<Streak x={VW / 2 - 80} y={1300} rot={-28} o={0.18} w={50} />}
    />
  );
};

// ------------------------------------------------------------------ scene 7: he comes himself
const SHIP_IN = { y: HS.water, s: 0.7 };
const Scene7: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S7;
  if (l < 110) {
    // low angle from the water: the ship comes in to the steps (bow first), the plank swings down, he walks off
    const bx = kf(l, [[0, 2700], [50, 2046]], Easing.out(Easing.cubic));
    const plank = kf(l, [[48, 0], [64, 1]], easeBack);
    const top = { x: bx - 700 * SHIP_IN.s, y: SHIP_IN.y - 300 * SHIP_IN.s };
    const end = { x: 1215, y: stepY(1215) };
    const walk = kf(l, [[66, 0], [104, 1]], lin);
    const wx = mix(top.x, end.x - 100, walk);
    const wy = wx > end.x ? mix(top.y, end.y, (top.x - wx) / (top.x - end.x)) : stepY(wx);
    const cam: Cam = { x: kf(l, [[0, 1800], [110, 1500]]), y: HS.water - 160, zoom: kf(l, [[0, 1.5], [110, 1.7]]), rot: -1.5 };
    return (
      <HomeShore cam={cam} f={f} mood="warm" front={<rect x={-3000} y={HS.water + 70 + Math.sin(t * 2) * 6} width={8000} height={400} fill="#2f78a8" opacity={0.5} />}>
        <ShipWith
          f={f}
          x={bx}
          y={SHIP_IN.y}
          s={SHIP_IN.s}
          flip
          plank={plank}
          plankSide="bow"
          plankLen={560}
          crewPull={kf(l, [[40, 0], [56, 1]])}
          who={l < 66 ? <Musafir x={top.x + 80} y={top.y + 21 + Math.sin(t * 1.1 + 0.6) * 7} flip look={BORROWER} light="r" pose={pose(f, { look: 0.7, brow: -0.2, armF: [20, 20] }, 5)} /> : undefined}
        />
        {l >= 66 && <Musafir x={wx} y={wy} flip look={BORROWER} light="r" pose={pose(f, { walk: 1, step: wx / 34, brow: -0.3, look: 0.6, armF: [20, 20], grip: true }, 5)} holdF={<g transform="translate(0 20)"><WagePouch x={0} y={40} s={0.45} /></g>} />}
      </HomeShore>
    );
  }
  if (l < 220) {
    // same insert as the loan: his hand sets a pouch down; the letter already lies on the table
    const set = kf(l, [[124, 0], [160, 1]], Easing.out(Easing.cubic));
    return (
      <TableInsert f={f} z={kf(l, [[110, 1.02], [220, 1.1]])} rot={-4}>
        <FoldedLetter x={VW * 0.7} y={VH * 0.36} s={1.6} rot={8} open={0.2} />
        <PouchTop x={mix(VW * 0.1, VW * 0.4, set)} y={mix(VH * 0.62, VH * 0.52, set)} s={mix(1.12, 1, set)} />
        <HandReach from={[-200, VH * 0.62]} to={[mix(VW * 0.1, VW * 0.4, set) - 130, mix(VH * 0.62, VH * 0.52, set)]} k={kf(l, [[110, 0.4], [124, 1], [166, 1], [190, 0.3]])} sleeve={BORROWER.robe} skin={BORROWER.skin} mode="grip" s={1.05} />
      </TableInsert>
    );
  }
  if (l < 300) {
    // beat: line 2. Over the borrower's shoulder: the lender asks "did you send me anything?"
    const cam: Cam = { x: kf(l, [[220, TABLE.x + 230], [300, TABLE.x + 210]]), y: G - 430, zoom: kf(l, [[220, 1.75], [300, 1.86]]) };
    return (
      <OTS f={f} look={BORROWER} side="l">
        <Court cam={cam} f={f} table={<FoldedLetter x={TABLE.x + 90} y={TOP - 8} s={0.5} rot={4} open={0.2} />}>
          <TableTalk f={f} lenderTalk={1} />
        </Court>
      </OTS>
    );
  }
  // the borrower: "I found no ship before this one" - worried, eyes into the lens
  const lookX = kf(l, [[300, 0.6], [330, 0.6], [345, 0]]);
  return <Close f={f} a={S7 + 300} b={S8} bg={courtBg(f, 800)} look={BORROWER} p={fp(f, { lookX, brow: -0.8, mouth: "sad", tilt: -3, lookY: 0.2, turn: 0.3 }, 8)} push={[1.9, 2.1]} tint="#ffe6c4" light="r" />;
};

// ------------------------------------------------------------------ scene 8: "take your thousand dinars back" + end card
const Scene8: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S8;
  const leak = kf(l, [[60, 0], [140, 0.5], [370, 0.7]]);
  if (l < 120) {
    // slow insert: the lender's fingers rest on the letter... then push the pouch back; the borrower's hand closes on it
    const touch = kf(l, [[4, 0], [24, 1]], Easing.out(Easing.cubic));
    const back = kf(l, [[56, 0], [96, 1]], Easing.inOut(Easing.cubic));
    const px = mix(VW * 0.4, VW * 0.2, back);
    const take = kf(l, [[92, 0], [112, 1]], easeBack);
    return (
      <TableInsert f={f} z={kf(l, [[0, 1.04], [120, 1.16]])} rot={-4} leak={leak}>
        <FoldedLetter x={VW * 0.7} y={VH * 0.36} s={1.6} rot={8} open={0.2} />
        <PouchTop x={px} y={VH * 0.52} />
        <HandReach from={[VW + 200, VH * 0.28]} to={[VW * 0.7 + 40, VH * 0.36]} k={touch * (1 - kf(l, [[40, 0], [56, 1]]))} sleeve={LENDER.robe} skin={LENDER.skin} mode="flat" s={1.05} />
        <HandReach from={[VW + 200, VH * 0.62]} to={[px + 140, VH * 0.52 + 10]} k={kf(l, [[44, 0], [56, 1], [100, 1], [118, 0.4]])} sleeve={LENDER.robe} skin={LENDER.skin} mode="flat" s={1.1} />
        <HandReach from={[-200, VH * 0.5]} to={[px - 130, VH * 0.52]} k={take} sleeve={BORROWER.robe} skin={BORROWER.skin} mode="grip" s={1.05} />
      </TableInsert>
    );
  }
  if (l < 230) {
    // the borrower's worry melts into a smile; eyes to the lens
    const calm = kf(l, [[140, 0], [190, 1]]);
    return (
      <>
        <Close
          f={f}
          a={S8 + 120}
          b={S8 + 230}
          bg={courtBg(f, 800)}
          look={BORROWER}
          p={fp(f, { brow: mix(-0.8, 0.5, calm), mouth: calm > 0.6 ? "smile" : "sad", lookX: kf(l, [[120, 0.6], [195, 0.6], [210, 0]]), tilt: mix(-3, 2, calm), turn: 0.2 }, 4)}
          push={[1.95, 2.1]}
          tint="#ffe6c4"
          light="r"
          fg={<Streak x={VW / 2 + 120} y={900} rot={-22} o={kf(l, [[160, 0], [210, 0.2]])} w={80} />}
        />
        <LightLeak k={leak} t={t} w={VW} h={VH} />
      </>
    );
  }
  if (l < 300) {
    // the lender: a small smile, a nod (3/4)
    const tilt = kf(l, [[250, 0], [258, 6], [266, 0], [274, 4], [300, 2]]);
    return (
      <>
        <Close f={f} a={S8 + 230} b={S8 + 300} bg={courtBg(f, 1400)} look={LENDER} p={fp(f, { tilt, turn: -0.4, brow: 0.5, mouth: "smile", lookX: -0.5 }, 3)} push={[1.85, 1.98]} tint="#ffe6c4" light="r" />
        <LightLeak k={leak} t={t} w={VW} h={VH} />
      </>
    );
  }
  // beat: line 2 + end card. Pull back: both at the table, birds fly off the wall, warm light
  const k = kf(l, [[300, 0], [370, 1]], ease);
  const cam: Cam = { x: mix(TABLE.x, TABLE.x + 60, k), y: mix(G - 380, G - 620, k), zoom: mix(1.6, 1.15, k) };
  return (
    <>
      <Court cam={cam} f={f} bird={kf(l, [[310, 0], [350, 1]], Easing.in(Easing.quad))} table={<FoldedLetter x={TABLE.x + 90} y={TOP - 8} s={0.5} rot={4} open={0.2} />}>
        <TableTalk f={f} pouch={<WagePouch x={TABLE.x - 210} y={TOP + 4} s={0.75} t={t} />} />
      </Court>
      <LightLeak k={leak} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ sound (nominal frames); `until` stops a cue at its cut
type Cue = FilmVisuals["sfx"][number];
const s = (file: string, at: number, volume = 0.8, until?: number): Cue => ({ file: `sfx/${file}`, at, volume, until });
const SFX: FilmVisuals["sfx"] = [
  // 1 hook: saw stops dead on the cut; slow-motion swell; rewind into the flashback
  s("saw.wav", S1, 0.5, S1 + 34),
  s("shimmer.wav", S1 + 22, 0.4),
  s("slowmo.wav", S1 + 36, 0.5, S1 + 62),
  s("coins.wav", S1 + 40, 0.35, S1 + 60),
  s("rewind.wav", S1 + 82, 0.45),
  // 2 the loan
  s("seagulls.wav", S2 + 10, 0.22, S2 + 100),
  ...[20, 40, 60, 80].map((d) => s("step.wav", S2 + d, 0.22)),
  s("pigeon.wav", S2 + 120, 0.2, S2 + 190),
  s("breeze.wav", S2 + 200, 0.18, S2 + 330),
  s("coins.wav", S2 + 352, 0.45),
  // 3 the ship, then the grey pier
  ...[10, 26, 42].map((d) => s("step.wav", S3 + d, 0.25)),
  s("boat-creak.wav", S3 + 4, 0.35, S3 + 150),
  s("seagulls.wav", S3 + 70, 0.28, S3 + 150),
  s("whoosh.wav", S3 + 140, 0.4),
  s("breeze.wav", S3 + 150, 0.38),
  ...[156, 172, 188, 204].map((d) => s("step.wav", S3 + d, 0.3)),
  s("seagulls.wav", S3 + 230, 0.16, S3 + 270),
  // 4 carving, coins, letter, prayer, splash
  ...[6, 20, 34, 48, 62].map((d) => s("chisel.wav", S4 + d, 0.42, S4 + 80)),
  s("coins.wav", S4 + 92, 0.4),
  s("coins.wav", S4 + 118, 0.32),
  s("paper.wav", S4 + 140, 0.55),
  s("impact.wav", S4 + 196, 0.3),
  s("pad.wav", S4 + 210, 0.3, S4 + 285),
  s("whoosh.wav", S4 + 298, 0.4),
  s("slowmo.wav", S4 + 300, 0.4),
  s("splash.wav", S4 + 324, 0.85),
  // 5 two shores, water wipe
  s("breeze.wav", S5, 0.3, S5 + 60),
  s("splash.wav", S5 + 50, 0.35),
  ...[68, 84, 100].map((d) => s("step.wav", S5 + d, 0.25)),
  s("pigeon.wav", S5 + 80, 0.25),
  s("splash.wav", S5 + 218, 0.3),
  // 6 the log opens
  ...[26, 44, 62].map((d) => s("step.wav", S6 + d, 0.25)),
  s("saw.wav", S6 + 78, 0.5, S6 + 112),
  s("coins.wav", S6 + 126, 0.5),
  s("shimmer.wav", S6 + 124, 0.35),
  s("paper.wav", S6 + 160, 0.6),
  s("paper.wav", S6 + 198, 0.45),
  s("pigeon.wav", S6 + 210, 0.18),
  // 7 he comes himself
  s("boat-creak.wav", S7 + 6, 0.4, S7 + 110),
  s("impact.wav", S7 + 50, 0.3),
  s("impact.wav", S7 + 64, 0.22),
  ...[70, 84, 98].map((d) => s("step.wav", S7 + d, 0.3)),
  s("coins.wav", S7 + 156, 0.45),
  s("breeze.wav", S7 + 280, 0.18),
  // 8 the pouch slides back, birds, the far sea
  s("paper.wav", S8 + 10, 0.3),
  s("coins.wav", S8 + 66, 0.3),
  s("pad.wav", S8 + 120, 0.3),
  s("pigeon.wav", S8 + 310, 0.25),
  s("chime.wav", S8 + 300, 0.35),
];

// ------------------------------------------------------------------ overlays: hook, place labels, end card
const fade = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const up = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Label: React.FC<{ o: number; text: string }> = ({ o, text }) => (
  <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 200, opacity: o }}>
    <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 800, fontSize: 44, color: "#ffffff", background: "rgba(5,49,61,0.7)", border: "3px solid #16c6d6", borderRadius: 18, padding: "10px 28px", letterSpacing: 1 }}>{text}</div>
  </AbsoluteFill>
);

const Overlay: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #05313d", paintOrder: "stroke fill", textAlign: "center" as const };
  const hook = fade(f, S1 + 2, S1 + 8, S2 - 14, S2 - 6);
  const hookPop = interpolate(f, [S1 + 2, S1 + 10], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const end1 = up(f, S8 + 300, S8 + 314);
  const end2 = up(f, S8 + 324, S8 + 336);
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 220, opacity: hook }}>
        <div style={{ ...big, fontSize: 92, color: "#ffe066", transform: `scale(${hookPop}) rotate(-3deg)`, lineHeight: 1.1, padding: "0 40px" }}>
          {tr(lang, { ur: "LAKDI MEIN 1,000 DINAR?", en: "1,000 DINARS IN A LOG?" })}
        </div>
      </AbsoluteFill>
      <Label o={fade(f, S2 + 6, S2 + 16, S2 + 84, S2 + 94)} text={tr(lang, { ur: "Bani Israil ka ek kinara", en: "A shore of Bani Israil" })} />
      <Label o={fade(f, S3 + 154, S3 + 164, S3 + 210, S3 + 218)} text={tr(lang, { ur: "Samundar ke us paar", en: "Across the sea" })} />
      <Label o={fade(f, S5 + 64, S5 + 74, S5 + 125, S5 + 133)} text={tr(lang, { ur: "Udhar, doosra kinara", en: "Meanwhile, the other shore" })} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230 }}>
        <div style={{ ...big, fontSize: 84, color: "#ffffff", opacity: end1, lineHeight: 1.15, padding: "0 60px", transform: `scale(${0.9 + 0.1 * end1})` }}>
          {tr(lang, { ur: "Bharosa Rakho, Koshish Jaari Rakho", en: "Trust Allah, Keep Trying" })}
        </div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 38, color: "#bff6fb", opacity: end2, marginTop: 26, textShadow: "0 2px 8px #000" }}>Sahih al-Bukhari 2291</div>
      </AbsoluteFill>
    </>
  );
};

export const samundarMeinDinarVisuals: FilmVisuals = {
  scenes: {
    "s1-aari": { nominal: [S1, S2], render: (f) => <Scene1 f={f} /> },
    "s2-qarz": { nominal: [S2, S3], render: (f) => <Scene2 f={f} />, beats: [null, S2 + 190] },
    "s3-kashti": { nominal: [S3, S4], render: (f) => <Scene3 f={f} />, beats: [null, S3 + 220] },
    "s4-khat": { nominal: [S4, S5], render: (f) => <Scene4 f={f} />, beats: [null, S4 + 180] },
    "s5-do-kinare": { nominal: [S5, S6], render: (f) => <Scene5 f={f} />, beats: [null, S5 + 60] },
    "s6-khulna": { nominal: [S6, S7], render: (f) => <Scene6 f={f} />, beats: [null, S6 + 75] },
    "s7-wapsi": { nominal: [S7, S8], render: (f) => <Scene7 f={f} />, beats: [null, S7 + 220] },
    "s8-seekh": { nominal: [S8, END], render: (f) => <Scene8 f={f} />, beats: [null, S8 + 300] },
  },
  ambience: { file: "sfx/sea-bed.wav", volume: 0.14 },
  sfx: SFX,
  overlay: (f, lang) => <Overlay f={f} lang={lang} />,
};
