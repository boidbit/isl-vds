// "Samundar Mein 1,000 Dinar" (Sahih al-Bukhari 2291): 9:16 Short. Nominal timeline at 30 fps.
// Hadith: a man of Bani Israil borrowed 1,000 dinars with Allah as witness and guarantor, could not find a boat to
// return on time, put the money and a letter in a hollowed piece of wood and entrusted it to Allah in the sea. The
// lender found it as firewood; the borrower later came with another 1,000 dinars and was told to take them back.
// Houses, pier, steps, clothes, faces and background life are imagined (tasawwur). No Prophet / angel is shown.
// Look: warm sandy storybook for the lender's shore, cold blue-grey for the far pier; thick soft outline.

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { tr } from "../film/types";
import type { Lang } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { blink, easeBack, kf, layerTransform, mix, shake, VH, VW, type Cam } from "../kit";
import { BASE_POSE, LOOKS, Musafir, type MusafirPose } from "../Musafir";
import { MusafirFront, type FrontPose } from "../FrontFace";
import { Boat, DoorCurtain, FoldedLetter, HandSaw, HollowLogTop, KnotLog, Sawdust, Sea, SeaSky, Seagull, ShoreFoam, StoneSteps, Woodpile, WoodPier, type SeaMood } from "../library/Sea";
import { ClothesLine, DustMotes, FruitBasket, LowTable, PalmShadow, PerchedBird, StoneFloor } from "../library/Courtyard";
import { WagePouch } from "../library/Farm";
import { Birds, MudHouse } from "../library/Village";

const LENDER = LOOKS["qarz-dene-wala"];
const BORROWER = LOOKS.qarzdar;

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

/** World position of the front hand of a Musafir at (x, y) with pose p (for props held in the hand). */
const handF = (x: number, y: number, p: MusafirPose, flip = false, s = 1) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const rot = (vx: number, vy: number, deg: number) => [vx * Math.cos(r(deg)) - vy * Math.sin(r(deg)), vx * Math.sin(r(deg)) + vy * Math.cos(r(deg))];
  const hipY = -165 + p.kneel * 92;
  const [sx, sy] = rot(12, -114, p.lean);
  const [ex, ey] = rot(0, 56, p.lean - p.armF[0]);
  const [hx, hy] = rot(0, 66, p.lean - p.armF[0] - p.armF[1]);
  const lx = sx + ex + hx;
  const ly = hipY + 6 + sy + ey + hy;
  return { x: x + (flip ? -lx : lx) * s, y: y + ly * s };
};

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
      <Grade tint="#ffe6c4" k={0.6} vig={0.4} warm />
    </>
  );
};

// ------------------------------------------------------------------ world 2: the lender's shore (stone steps)
const HS = { horizon: 1150, top: 1250, stepsX: 520, run: 120, rise: 55, n: 10, water: 1600 };
const stepY = (x: number) => HS.top + Math.max(0, Math.min(HS.n - 1, (x - HS.stepsX) / HS.run)) * HS.rise;

const HomeShore: React.FC<{ cam: Cam; f: number; mood?: SeaMood; children?: React.ReactNode; water?: React.ReactNode; front?: React.ReactNode; blur?: number }> = ({ cam, f, mood = "warm", children, water, front, blur = 0 }) => {
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
      <Grade tint={mood === "grey" ? "#c8d4e2" : "#ffe2bc"} k={0.55} vig={0.38} warm={mood !== "grey"} />
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
        {/* the land the pier starts from, with flat stones */}
        <path d={`M -2600 ${PR.land} Q -1600 ${PR.land - 60} ${PR.x0 + 60} ${PR.land - 10} L ${PR.x0 + 140} ${PR.water + 40} L -2600 3400 Z`} fill="#8e8676" stroke="#3d2a1e" strokeWidth={4} />
        {[[-1500, 0, 1.3], [-1150, 10, 1], [-820, 60, 0.9], [-1900, -10, 1.1]].map(([sx, dy, sc], i) => (
          <ellipse key={i} cx={sx} cy={PR.land + dy} rx={150 * sc} ry={34 * sc} fill="#b5ad9a" stroke="#3d2a1e" strokeWidth={4} />
        ))}
        <ShoreFoam x0={PR.x0 - 40} x1={PR.x0 + 260} y={PR.water + 30} t={t} />
        <WoodPier x0={PR.x0} x1={PR.x1} y={PR.deck} waterY={PR.water} t={t} />
        <ShoreFoam x0={PR.x0} x1={PR.x1 + 100} y={PR.water} t={t + 1} reach={0.5} />
        </>
        )}
        {children}
      </L>
      <L cam={cam} depth={1.25}>{front}</L>
      <Grade tint={mood === "grey" ? "#c4d0de" : "#ffe6c4"} k={0.6} vig={0.5} warm={mood !== "grey"} />
    </>
  );
};

// ------------------------------------------------------------------ front close-up (screen space over a blurred set)
const Close: React.FC<{ f: number; a: number; b: number; bg: React.ReactNode; look: typeof LENDER; p: Partial<FrontPose>; push?: [number, number]; y?: number; letter?: React.ReactNode; fg?: React.ReactNode; tint?: string }> = ({
  f,
  a,
  b,
  bg,
  look,
  p,
  push = [1.85, 2.0],
  y = 1560,
  letter,
  fg,
  tint,
}) => {
  const k = kf(f, [[a, 0], [b, 1]], lin);
  const s = mix(push[0], push[1], k);
  const dx = Math.sin(f / 40) * 10;
  return (
    <>
      {bg}
      <g transform={`translate(${VW / 2 + dx} ${y})`}>
        <MusafirFront x={0} y={0} s={s} look={look} pose={p} letter={letter} />
      </g>
      {fg}
      {tint && <rect x={0} y={0} width={VW} height={VH} fill={tint} style={{ mixBlendMode: "multiply" }} opacity={0.35} />}
    </>
  );
};

const courtBg = (f: number, x = 1200, blur = 7) => <Court cam={{ x, y: G - 520, zoom: 1.6 }} f={f} bgBlur={blur} dust={0.3} />;
const pierBg = (f: number) => <Pier cam={{ x: 900 + Math.sin(f / 60) * 20, y: PR.deck - 360, zoom: 1.5 }} f={f} />;

// ------------------------------------------------------------------ the saw on the log (court)
const Sawing: React.FC<{ f: number; on: number; x?: number }> = ({ f, on, x = 1420 }) => {
  const t = f / 30;
  const stroke = Math.sin(t * 13) * on;
  const p = pose(f, { lean: 22, armF: [62 + stroke * 10, 30 - stroke * 8], armB: [40 + stroke * 6, 30], headTilt: 12, look: 0.8, brow: -0.1 }, 5);
  const h = handF(x, G + 20, p, true);
  const rot = (Math.atan2(h.y - KERF.y, h.x - KERF.x) * 180) / Math.PI;
  return (
    <>
      <Musafir x={x} y={G + 20} flip look={LENDER} pose={p} />
      <g transform={`translate(${h.x} ${h.y}) rotate(${rot}) translate(-350 12)`}>
        <HandSaw x={0} y={0} />
      </g>
    </>
  );
};

// ------------------------------------------------------------------ scene 1: hook (saw, glint, the lender's face)
const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S1;
  if (l < 44) {
    const cut = kf(l, [[0, 0.25], [40, 0.6]], lin);
    const glint = kf(l, [[22, 0], [34, 1]], easeBack);
    const on = l < 40 ? 1 : 0;
    const sh = shake(l, 36, 6, 10);
    const cam: Cam = { x: KERF.x + 10 + sh.x, y: KERF.y + 70 + sh.y, zoom: kf(l, [[0, 6.2], [44, 5.6]]), rot: -3 };
    return (
      <>
        <Court cam={cam} f={f} bgBlur={8} log={<KnotLog x={LOG.x} y={LOG.y} s={LOG.s} t={t} cut={cut} glint={glint} />} front={<Sawdust x={KERF.x} y={KERF.y + 40} t={t} on={on} floor={120} />}>
          <Sawing f={f} on={on} />
        </Court>
        <Streak x={560} y={900} rot={-24} o={0.25} w={40} />
      </>
    );
  }
  // front close-up: frozen in wonder, eyes into the lens; the glowing log in the foreground
  const wide = kf(l, [[44, 0.6], [52, 1]], easeBack);
  const lookY = kf(l, [[44, 0.7], [60, 0]]);
  return (
    <Close
      f={f}
      a={S1 + 44}
      b={S2}
      bg={courtBg(f, 1300)}
      look={LENDER}
      p={fp(f, { wide, lookY, brow: 0.9, mouth: "open", eyeOpen: 1, tilt: -2 })}
      push={[1.8, 1.95]}
      y={1420}
      fg={
        <g>
          <g transform={`translate(${VW / 2 - 40} 1780) scale(1.6)`}>
            <KnotLog x={0} y={0} t={t} cut={0.6} glint={1} />
          </g>
          <circle cx={VW / 2 + 24} cy={1700} r={160} fill="#fff2a0" opacity={0.15 + Math.sin(t * 5) * 0.05} style={{ mixBlendMode: "screen" }} />
        </g>
      }
    />
  );
};

// ------------------------------------------------------------------ scene 2: the loan
const Passerby: React.FC<{ f: number; k: number }> = ({ f, k }) => {
  const x = mix(HS.stepsX - 160, HS.stepsX + 900, k);
  const y = x < HS.stepsX ? HS.top : stepY(x) + 2;
  return (
    <g>
      <Musafir x={x} y={y} scale={0.9} look={LOOKS.kisan} pose={pose(f, { walk: 1, step: x / 38, armF: [165, 20], armB: [-8, 10] }, 3)} />
      <FruitBasket x={x + 8} y={y - 350 * 0.9} s={0.55} />
    </g>
  );
};

const TableTalk: React.FC<{ f: number; borrowerArm?: number; lenderNod?: number; lenderReach?: number; borrowerReach?: number; pouch?: React.ReactNode; letter?: React.ReactNode }> = ({ f, borrowerArm = 0, lenderNod = 0, lenderReach = 0, borrowerReach = 0, pouch, letter }) => {
  const t = f / 30;
  return (
    <>
      {letter}
      {pouch}
      <Musafir
        x={TABLE.x - 330}
        y={G + 30}
        look={BORROWER}
        pose={pose(f, { lean: 6 + borrowerReach * 14, armF: [mix(30 + Math.sin(t * 2.4) * 14 * borrowerArm, 72, borrowerReach), mix(40, 14, borrowerReach)], armB: [-6, 10], brow: -0.2, look: 0.6, headTilt: 3 }, 11)}
      />
      <Musafir
        x={TABLE.x + 330}
        y={G + 30}
        flip
        look={LENDER}
        pose={pose(f, { lean: 4 + lenderReach * 18, armF: [mix(14, 74, lenderReach), mix(16, 12, lenderReach)], armB: [-8, 10], headTilt: lenderNod * 10 * Math.max(0, Math.sin(t * 7)), look: 0.6, brow: 0.1 }, 2)}
      />
    </>
  );
};

const Scene2: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S2;
  if (l < 90) {
    const cam: Cam = { x: kf(l, [[0, 560], [90, 640]]), y: kf(l, [[0, 1180], [90, 1220]]), zoom: kf(l, [[0, 1.0], [90, 1.08]]) };
    return <HomeShore cam={cam} f={f} mood="warm"><Passerby f={f} k={kf(l, [[0, 0.05], [90, 0.6]], lin)} /></HomeShore>;
  }
  if (l < 170) {
    const cam: Cam = { x: TABLE.x, y: kf(l, [[90, G - 380], [170, G - 360]]), zoom: kf(l, [[90, 1.45], [170, 1.62]]) };
    return (
      <Court cam={cam} f={f} curtainLift={Math.max(0, Math.sin(t * 0.9)) * 0.5}>
        <TableTalk f={f} borrowerArm={1} />
      </Court>
    );
  }
  if (l < 250) {
    // borrower: "Allah is enough" - earnest, eyes lift, then into the lens
    const lookY = kf(l, [[176, 0], [196, -0.8], [226, -0.8], [240, 0]]);
    return <Close f={f} a={S2 + 170} b={S2 + 250} bg={courtBg(f, 800)} look={BORROWER} p={fp(f, { lookY, brow: 0.3, mouth: "neutral", tilt: kf(l, [[176, 0], [200, -4]]) }, 4)} />;
  }
  if (l < 320) {
    // lender decides: looks aside, thinks, nods, a small smile
    const lookX = kf(l, [[250, -0.7], [290, -0.7], [300, 0]]);
    const tilt = kf(l, [[290, 0], [298, 6], [306, 0], [312, 5], [320, 2]]);
    return <Close f={f} a={S2 + 250} b={S2 + 320} bg={courtBg(f, 1400)} look={LENDER} p={fp(f, { lookX, tilt, brow: l > 296 ? 0.4 : -0.2, mouth: l > 300 ? "smile" : "neutral" }, 9)} push={[1.9, 2.05]} />;
  }
  // the pouch slides across the table (push-in)
  const slide = kf(l, [[330, 0], [366, 1]], Easing.out(Easing.cubic));
  const cam: Cam = { x: TABLE.x, y: kf(l, [[320, TOP - 230], [390, TOP - 200]]), zoom: kf(l, [[320, 1.7], [390, 1.9]]) };
  return (
    <Court cam={cam} f={f}>
      <TableTalk f={f} lenderReach={kf(l, [[320, 0.4], [334, 1], [366, 0.6], [380, 0.2]])} borrowerReach={kf(l, [[360, 0], [380, 0.8]])} pouch={<WagePouch x={mix(TABLE.x + 150, TABLE.x - 90, slide)} y={TOP + 4} s={0.75} t={t} />} />
    </Court>
  );
};

// ------------------------------------------------------------------ scene 3: across the sea, no boat back
const BoatWith: React.FC<{ f: number; x: number; y: number; who?: boolean; boatman?: boolean; s?: number; flip?: boolean; pull?: number }> = ({ f, x, y, who = true, boatman = true, s = 1, flip, pull = 0 }) => {
  const t = f / 30;
  const bob = Math.sin(t * 1.4 + 0.6) * 8;
  return (
    <g>
      <Boat x={x} y={y} s={s} t={t} flip={flip} layer="back" />
      {boatman && <Musafir x={x + (flip ? 180 : -180) * s} y={y - 50 * s + bob} scale={0.85 * s} flip={flip} look={LOOKS.mazdoor} pose={pose(f, { lean: 10 + pull * 16, armF: [60 + pull * 30 * Math.sin(t * 4), 30], armB: [40, 30], headTilt: 4 }, 8)} />}
      {who && <Musafir x={x + (flip ? -40 : 40) * s} y={y - 50 * s + bob} scale={0.9 * s} flip={flip} look={BORROWER} pose={pose(f, { look: 0.8, brow: 0.1, armF: [10, 12] }, 1)} />}
      <Boat x={x} y={y} s={s} t={t} flip={flip} layer="front" />
    </g>
  );
};

const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S3;
  if (l < 60) {
    const bx = kf(l, [[0, 1500], [60, 1900]], Easing.in(Easing.quad));
    const cam: Cam = { x: kf(l, [[0, 1100], [60, 1300]]), y: 1300, zoom: 1.15 };
    return <HomeShore cam={cam} f={f} mood="sun" water={<BoatWith f={f} x={bx} y={HS.water + 20} s={0.8} />} />;
  }
  if (l < 140) {
    // open sea: the boat crosses, camera tracks with it
    const bx = kf(l, [[60, 300], [140, 1300]], lin);
    const cam: Cam = { x: bx + 120, y: 1150, zoom: 1.2 };
    return (
      <Pier cam={cam} f={f} mood="sun" open water={<BoatWith f={f} x={bx} y={1300} s={0.9} />} />
    );
  }
  if (l < 220) {
    // time jump: grey far pier, low-angle tracking as he walks to the end
    const wx = kf(l, [[140, 200], [215, 1150]], lin);
    const whip = kf(l, [[140, -900], [150, 0]], Easing.out(Easing.cubic));
    const cam: Cam = { x: wx + 60 + whip, y: PR.deck - 300, zoom: 1.55, rot: 1.2 };
    return (
      <Pier cam={cam} f={f}>
        <Musafir x={wx} y={PR.deck - 30} look={BORROWER} pose={pose(f, { walk: l < 212 ? 1 : 0, step: wx / 40, look: 0.9, brow: -0.4, armF: [20, 20] }, 6)} />
      </Pier>
    );
  }
  if (l < 275) {
    // his POV: empty water, a slow pan
    const cam: Cam = { x: kf(l, [[220, 2200], [275, 2700]]), y: PR.horizon + 120, zoom: 1.35 };
    return <Pier cam={cam} f={f} />;
  }
  const lookX = kf(l, [[275, 0.8], [290, -0.8], [305, 0.8], [318, 0]]);
  return <Close f={f} a={S3 + 275} b={S4} bg={pierBg(f)} look={BORROWER} p={fp(f, { lookX, brow: -0.8, mouth: "sad", tilt: -3 }, 2)} tint="#b8c6d8" />;
};

// ------------------------------------------------------------------ scene 4: the hollow log, the letter, the prayer, the sea
const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S4;
  if (l < 80) {
    // kneeling on the flat stone, carving the log (chips fly)
    const hit = Math.max(0, Math.sin(t * 7));
    const p = pose(f, { kneel: 1, lean: 30, armF: [40 + hit * 50, 40], armB: [30, 40], headTilt: 16, look: 0.8, brow: -0.3 }, 4);
    const h = handF(-1250, PR.land + 4, p);
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
        <Musafir x={-1250} y={PR.land + 4} look={BORROWER} pose={p} />
        <g transform={`translate(${h.x} ${h.y}) rotate(${-60 + hit * 30})`}>
          <rect x={-6} y={-70} width={12} height={70} rx={4} fill="#8a5a34" stroke="#3d2a1e" strokeWidth={3} />
          <path d="M -5 0 L 5 0 L 3 30 L -3 30 Z" fill="#c9ccd0" stroke="#3d2a1e" strokeWidth={3} />
        </g>
      </Pier>
    );
  }
  if (l < 215) {
    // top-down insert: coins then the letter go into the hollow, the plug closes it
    const coins = kf(l, [[86, 0], [140, 1]], lin);
    const letter = kf(l, [[136, 0], [170, 1]], Easing.out(Easing.cubic));
    const plug = kf(l, [[182, 0], [200, 1]], easeBack);
    const z = kf(l, [[80, 1.0], [215, 1.12]]);
    return (
      <g>
      <rect x={0} y={0} width={VW} height={VH} fill="#8d8a80" />
      <g transform={`translate(${VW / 2} ${VH / 2}) scale(${z * 1.12}) rotate(${kf(l, [[80, -4], [215, 2]])}) translate(${-VW / 2} ${-VH / 2})`}>
        <HollowLogTop t={t} w={VW} h={VH} coins={coins} letter={letter} plug={plug} />
      </g>
        <Grade tint="#ffe2bc" k={0.5} vig={0.4} warm />
      </g>
    );
  }
  if (l < 290) {
    // the prayer: front close-up, hands raised, eyes closed, then open, steady
    const up = kf(l, [[215, 0], [232, 1]], easeBack);
    const eyes = l < 270 ? 0.12 : blink(f, 3);
    return (
      <Close
        f={f}
        a={S4 + 215}
        b={S4 + 290}
        bg={<Pier cam={{ x: -900, y: PR.land - 420, zoom: 1.4 }} f={f} />}
        look={BORROWER}
        p={fp(f, { hands: "dua", handsUp: up, eyeOpen: eyes, brow: -0.3, lookY: -0.3, tilt: 3 })}
        push={[1.75, 1.92]}
        y={1500}
        tint="#c8d4e2"
      />
    );
  }
  // the throw: the log arcs into the sea; camera drops to the surface and follows it
  const k = kf(l, [[300, 0], [322, 1]], lin);
  const throwP = pose(f, { lean: kf(l, [[290, -8], [300, -14], [306, 18], [330, 6]]), armF: [kf(l, [[290, 120], [300, 150], [306, 40], [330, 20]]), 10], armB: [-10, 10], look: 0.9, brow: -0.2 }, 7);
  const sx = -860;
  const lx = mix(sx + 40, -500, k);
  const ly = l < 300 ? PR.land - 330 : l < 322 ? mix(PR.land - 330, PR.water + 20, k) - Math.sin(k * Math.PI) * 220 : PR.water + 20 + Math.sin(t * 2) * 8;
  const drift = l > 322 ? (l - 322) * 3 : 0;
  const lowCam = kf(l, [[322, 0], [334, 1]]);
  const cam: Cam = { x: mix(-760, -480 + drift, lowCam), y: mix(PR.land - 300, PR.water - 40, lowCam), zoom: mix(1.6, 2.3, lowCam) };
  const splash = l >= 322 ? kf(l, [[322, 0], [336, 1]], Easing.out(Easing.quad)) : 0;
  return (
    <Pier
      cam={cam}
      f={f}
      front={
        splash > 0 && splash < 1 ? (
          <g opacity={1 - splash}>
            {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
              <circle key={i} cx={-500 + i * 26 * (1 + splash)} cy={PR.water - splash * 120 * (1 - Math.abs(i) / 4)} r={10} fill="#e6f6ff" />
            ))}
          </g>
        ) : null
      }
    >
      <Musafir x={sx} y={PR.land} look={BORROWER} pose={throwP} />
      <KnotLog x={lx + drift} y={ly} s={0.5} rot={l < 322 ? k * 200 : 6 + Math.sin(t * 2) * 4} t={t} sealed wet={l > 322 ? 1 : 0} />
      {l >= 322 && <ellipse cx={-500 + drift} cy={PR.water + 30} rx={90 + (l - 322) * 3} ry={14} fill="none" stroke="#ffffff" strokeWidth={4} opacity={Math.max(0, 1 - (l - 322) / 40)} />}
    </Pier>
  );
};

// ------------------------------------------------------------------ scene 5: one sea, two shores
const Wave: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  // a big wave rising (k 0..1) from the bottom to cover the frame (match cut)
  const top = mix(VH + 100, -200, k);
  let d = `M -50 ${VH + 100} L -50 ${top}`;
  for (let x = -50; x <= VW + 50; x += 30) d += ` L ${x} ${top + Math.sin(x / 90 + t * 3) * 40}`;
  d += ` L ${VW + 50} ${VH + 100} Z`;
  return (
    <g>
      <path d={d} fill="#3f6f8c" />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={14} opacity={0.6} />
    </g>
  );
};

const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S5;
  if (l < 60) {
    const cam: Cam = { x: kf(l, [[0, 900], [60, 1000]]), y: PR.deck - 280, zoom: kf(l, [[0, 1.25], [60, 1.35]]) };
    const shade = Math.sin(t * 2.2) > 0;
    return (
      <>
        <Pier cam={cam} f={f}>
          <Musafir x={1240} y={PR.deck - 30} look={BORROWER} pose={pose(f, { armF: shade ? [150, 40] : [20, 20], look: 0.9, brow: -0.5, headTilt: -6, lean: -3 }, 3)} />
        </Pier>
        <Wave k={kf(l, [[44, 0], [60, 1]], Easing.in(Easing.quad))} t={t} />
      </>
    );
  }
  if (l < 140) {
    // the lender comes down the steps and looks out to sea
    const wx = kf(l, [[60, HS.stepsX + 80], [115, HS.stepsX + 560]], lin);
    const walking = l < 115;
    const cam: Cam = { x: kf(l, [[60, 900], [140, 980]]), y: 1300, zoom: 1.35 };
    return (
      <>
        <HomeShore cam={cam} f={f} mood="warm">
          <PerchedBird x={HS.stepsX + 700} y={stepY(HS.stepsX + 700)} t={t} s={1} fly={kf(l, [[80, 0], [115, 1]], Easing.in(Easing.quad))} dir={1} />
          <Musafir x={wx} y={stepY(wx) + 4} look={LENDER} pose={pose(f, { walk: walking ? 1 : 0, step: wx / 36, look: 0.9, armF: walking ? [10, 10] : [150, 40], headTilt: walking ? 4 : -6 }, 6)} />
        </HomeShore>
        <Wave k={kf(l, [[60, 1], [76, 0]], Easing.out(Easing.quad))} t={t} />
      </>
    );
  }
  // his gaze: from the far water down to the knot bobbing at the steps; a wave turns it over
  const k = kf(l, [[140, 0], [215, 1]]);
  const flipK = kf(l, [[215, 0], [235, 1]], easeBack);
  const cam: Cam = { x: mix(1900, 1450, k), y: mix(HS.horizon + 60, HS.water - 20, k), zoom: mix(1.4, 2.6, k) };
  return (
    <HomeShore
      cam={cam}
      f={f}
      mood="warm"
      water={<KnotLog x={1460} y={HS.water + 16 + Math.sin(t * 2.2) * 10} s={0.55} rot={mix(170, 8, flipK) + Math.sin(t * 2) * 4} t={t} wet={1} sealed />}
    />
  );
};

// ------------------------------------------------------------------ scene 6: the log is opened: dinars and the same letter
const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S6;
  if (l < 70) {
    // he lifts it and carries it up the steps
    const wx = kf(l, [[0, HS.stepsX + 820], [20, HS.stepsX + 820], [70, HS.stepsX + 420]], lin);
    const lift = kf(l, [[4, 0], [18, 1]], easeBack);
    const p = pose(f, { walk: l > 20 ? 1 : 0, step: wx / 36, lean: mix(30, 8, lift), armF: [mix(20, 64, lift), mix(10, 60, lift)], armB: [mix(10, 50, lift), 50], look: 0.4, brow: 0.2 }, 2);
    const h = handF(wx, stepY(wx) + 4, p, true);
    const cam: Cam = { x: kf(l, [[0, 1350], [70, 1050]]), y: kf(l, [[0, 1480], [70, 1400]]), zoom: 1.9 };
    return (
      <HomeShore cam={cam} f={f} mood="warm">
        <Musafir x={wx} y={stepY(wx) + 4} flip look={LENDER} pose={p} />
        <KnotLog x={h.x - 10} y={h.y - 10} s={0.42} rot={-6} t={t} wet={0.8} sealed />
      </HomeShore>
    );
  }
  if (l < 150) {
    // the saw again, this time it goes through: the log opens, coins spill
    const on = l < 112 ? 1 : 0;
    const open = kf(l, [[118, 0], [136, 1]], easeBack);
    const cam: Cam = { x: kf(l, [[70, 1200], [150, 1120]]), y: kf(l, [[70, G - 360], [150, TOP - 120]]), zoom: kf(l, [[70, 1.7], [112, 2.0], [150, 3.6]]) };
    return (
      <Court cam={cam} f={f} curtainLift={kf(l, [[120, 0], [140, 1], [150, 0.6]])} log={<KnotLog x={LOG.x} y={LOG.y} s={LOG.s} t={t} cut={kf(l, [[70, 0.3], [112, 1]], lin)} glint={kf(l, [[96, 0], [110, 1]])} open={open} />} front={<Sawdust x={KERF.x} y={KERF.y + 40} t={t} on={on} floor={120} />}>
        {l < 116 ? <Sawing f={f} on={on} /> : <Musafir x={1420} y={G + 20} flip look={LENDER} pose={pose(f, { lean: 10, armF: [40, 20], armB: [-6, 10], look: 0.8, brow: 0.9, mouth: "open" })} />}
      </Court>
    );
  }
  // the same folded letter in his hands; it opens; his eyes rise from the letter to the lens
  const open = kf(l, [[156, 0], [184, 1]], Easing.out(Easing.cubic));
  const lookY = kf(l, [[150, 0.9], [205, 0.9], [220, 0]]);
  return (
    <Close
      f={f}
      a={S6 + 150}
      b={S7}
      bg={courtBg(f, 1100)}
      look={LENDER}
      p={fp(f, { hands: "letter", handsUp: kf(l, [[150, 0.3], [164, 1]], easeBack), lookY, wide: l > 205 ? 0.8 : 0.3, brow: 0.8, mouth: l > 210 ? "open" : "neutral" }, 6)}
      push={[1.8, 1.95]}
      y={1480}
      letter={<FoldedLetter x={0} y={-80} s={1.3} open={open} rot={-3} />}
      fg={<Streak x={VW / 2 - 80} y={1300} rot={-28} o={0.18} w={50} />}
    />
  );
};

// ------------------------------------------------------------------ scene 7: he comes himself
const Scene7: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S7;
  if (l < 110) {
    // low angle from the water: the boat comes in to the steps, the boatman pulls the rope, he steps off
    const bx = kf(l, [[0, 2300], [50, 1650]], Easing.out(Easing.cubic));
    const step = kf(l, [[66, 0], [96, 1]]);
    const wx = mix(1650, HS.stepsX + 980, step);
    const cam: Cam = { x: kf(l, [[0, 1800], [110, 1560]]), y: HS.water - 120, zoom: kf(l, [[0, 1.6], [110, 1.8]]), rot: -1.5 };
    return (
      <HomeShore
        cam={cam}
        f={f}
        mood="warm"
        water={<BoatWith f={f} x={bx} y={HS.water + 20} s={0.85} flip who={l < 66} pull={kf(l, [[40, 0], [60, 1]])} />}
        front={<rect x={-3000} y={HS.water + 70 + Math.sin(t * 2) * 6} width={8000} height={400} fill="#2f78a8" opacity={0.55} />}
      >
        {l >= 66 && <Musafir x={wx} y={Math.min(stepY(wx), HS.water) - 4} flip look={BORROWER} pose={pose(f, { walk: 1, step: wx / 34, brow: -0.3, look: 0.6 }, 5)} />}
      </HomeShore>
    );
  }
  if (l < 220) {
    // same framing as the loan: he puts the pouch on the table; the letter already lies there
    const place = kf(l, [[130, 0], [160, 1]], Easing.out(Easing.cubic));
    const cam: Cam = { x: TABLE.x, y: kf(l, [[110, TOP - 230], [220, TOP - 200]]), zoom: kf(l, [[110, 1.7], [220, 1.9]]) };
    return (
      <Court cam={cam} f={f}>
        <TableTalk
          f={f}
          borrowerReach={kf(l, [[120, 0.2], [140, 1], [170, 0.4]])}
          pouch={<WagePouch x={mix(TABLE.x - 260, TABLE.x - 80, place)} y={mix(TOP - 60, TOP + 4, place)} s={0.75} t={t} />}
          letter={<FoldedLetter x={TABLE.x + 110} y={TOP - 6} s={0.6} rot={4} open={0.2} />}
        />
      </Court>
    );
  }
  if (l < 300) {
    // the lender asks: "did you send me anything?"
    return <Close f={f} a={S7 + 220} b={S7 + 300} bg={courtBg(f, 1400)} look={LENDER} p={fp(f, { lookX: -0.6, brow: 0.6, tilt: kf(l, [[220, 0], [250, 5]]), mouth: "neutral" }, 1)} />;
  }
  // the borrower: "I found no boat before this one" - worried, eyes into the lens
  const lookX = kf(l, [[300, 0.6], [330, 0.6], [345, 0]]);
  return <Close f={f} a={S7 + 300} b={S8} bg={courtBg(f, 800)} look={BORROWER} p={fp(f, { lookX, brow: -0.8, mouth: "sad", tilt: -3, lookY: 0.2 }, 8)} push={[1.9, 2.1]} />;
};

// ------------------------------------------------------------------ scene 8: "take your thousand dinars back" + end card
const Scene8: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S8;
  const letter = <FoldedLetter x={TABLE.x + 110} y={TOP - 6} s={0.6} rot={4} open={0.2} />;
  if (l < 110) {
    // insert: the lender touches the letter, then pushes the pouch back
    const back = kf(l, [[50, 0], [84, 1]], Easing.inOut(Easing.cubic));
    const cam: Cam = { x: kf(l, [[0, TABLE.x + 120], [110, TABLE.x + 80]]), y: TOP - 220, zoom: kf(l, [[0, 2.0], [110, 2.2]]) };
    return (
      <Court cam={cam} f={f}>
        <TableTalk
          f={f}
          lenderReach={kf(l, [[0, 0.2], [20, 0.75], [44, 0.7], [56, 1], [84, 1], [100, 0.4]])}
          borrowerReach={kf(l, [[84, 0], [104, 0.9]])}
          letter={letter}
          pouch={<WagePouch x={mix(TABLE.x - 80, TABLE.x - 210, back)} y={TOP + 4} s={0.75} t={t} />}
        />
      </Court>
    );
  }
  if (l < 230) {
    // the borrower's worry melts into a smile; eyes to the lens
    const calm = kf(l, [[130, 0], [180, 1]]);
    return (
      <Close
        f={f}
        a={S8 + 110}
        b={S8 + 230}
        bg={courtBg(f, 800)}
        look={BORROWER}
        p={fp(f, { brow: mix(-0.8, 0.5, calm), mouth: calm > 0.6 ? "smile" : "sad", lookX: kf(l, [[110, 0.6], [190, 0.6], [205, 0]]), tilt: mix(-3, 2, calm) }, 4)}
        push={[1.95, 2.1]}
        fg={<Streak x={VW / 2 + 120} y={900} rot={-22} o={kf(l, [[150, 0], [200, 0.2]])} w={80} />}
      />
    );
  }
  // pull back: both at the table, the birds fly off the wall, warm light; end card settles
  const k = kf(l, [[230, 0], [330, 1]], ease);
  const cam: Cam = { x: mix(TABLE.x, TABLE.x + 60, k), y: mix(G - 360, G - 620, k), zoom: mix(1.7, 1.15, k) };
  return (
    <Court cam={cam} f={f} bird={kf(l, [[250, 0], [300, 1]], Easing.in(Easing.quad))}>
      <TableTalk f={f} borrowerReach={0.6} letter={letter} pouch={<WagePouch x={TABLE.x - 210} y={TOP + 4} s={0.75} t={t} />} />
    </Court>
  );
};

// ------------------------------------------------------------------ sound (nominal frames)
const s = (file: string, at: number, volume = 0.8) => ({ file: `sfx/${file}`, at, volume });
const waves = (from: number, to: number, v = 0.3) => {
  const out: FilmVisuals["sfx"] = [];
  for (let a = from; a < to; a += 165) out.push(s("sea-waves.wav", a, v));
  return out;
};
const SFX: FilmVisuals["sfx"] = [
  // 1 hook: saw, then sudden silence, shimmer on the glint
  s("saw.wav", S1, 0.5),
  s("shimmer.wav", S1 + 30, 0.4),
  s("impact.wav", S1 + 44, 0.25),
  // 2 the loan
  ...waves(S2 - 4, S2 + 100, 0.3),
  s("seagulls.wav", S2 + 10, 0.25),
  ...[20, 40, 60, 80].map((d) => s("step.wav", S2 + d, 0.25)),
  s("breeze.wav", S2 + 90, 0.22),
  s("pigeon.wav", S2 + 120, 0.2),
  s("breeze.wav", S2 + 260, 0.2),
  s("coins.wav", S2 + 340, 0.45),
  // 3 the voyage, then the grey pier
  ...waves(S3, S3 + 140, 0.32),
  s("boat-creak.wav", S3 + 20, 0.35),
  s("seagulls.wav", S3 + 70, 0.3),
  s("whoosh.wav", S3 + 138, 0.35),
  s("breeze.wav", S3 + 140, 0.4),
  ...waves(S3 + 145, S4, 0.28),
  ...[150, 166, 182, 198].map((d) => s("step.wav", S3 + d, 0.3)),
  s("seagulls.wav", S3 + 230, 0.18),
  // 4 carving, coins, letter, prayer, splash
  ...waves(S4, S5, 0.26),
  ...[6, 20, 34, 48, 62].map((d) => s("chisel.wav", S4 + d, 0.45)),
  s("coins.wav", S4 + 92, 0.45),
  s("coins.wav", S4 + 118, 0.36),
  s("paper.wav", S4 + 140, 0.6),
  s("impact.wav", S4 + 196, 0.3),
  s("pad.wav", S4 + 215, 0.3),
  s("breeze.wav", S4 + 220, 0.25),
  s("whoosh.wav", S4 + 302, 0.4),
  s("splash.wav", S4 + 322, 0.85),
  // 5 two shores, waves carry across the cut
  ...waves(S5, S6, 0.34),
  s("breeze.wav", S5, 0.3),
  s("whoosh.wav", S5 + 50, 0.3),
  ...[68, 84, 100].map((d) => s("step.wav", S5 + d, 0.25)),
  s("pigeon.wav", S5 + 80, 0.25),
  s("splash.wav", S5 + 218, 0.35),
  // 6 the log opens
  ...waves(S6, S6 + 70, 0.28),
  ...[24, 40, 56].map((d) => s("step.wav", S6 + d, 0.25)),
  s("saw.wav", S6 + 72, 0.5),
  s("coins.wav", S6 + 122, 0.49),
  s("shimmer.wav", S6 + 120, 0.35),
  s("paper.wav", S6 + 156, 0.7),
  s("pigeon.wav", S6 + 170, 0.2),
  // 7 he comes himself
  ...waves(S7, S7 + 110, 0.3),
  s("boat-creak.wav", S7 + 10, 0.4),
  s("impact.wav", S7 + 50, 0.3),
  ...[70, 84, 98].map((d) => s("step.wav", S7 + d, 0.3)),
  s("breeze.wav", S7 + 110, 0.2),
  s("coins.wav", S7 + 156, 0.49),
  s("breeze.wav", S7 + 280, 0.18),
  // 8 the pouch slides back, birds, the far sea
  s("coins.wav", S8 + 66, 0.29),
  s("pad.wav", S8 + 110, 0.3),
  s("pigeon.wav", S8 + 250, 0.25),
  s("chime.wav", S8 + 260, 0.35),
  ...waves(S8 + 200, END, 0.22),
];

// ------------------------------------------------------------------ overlays: hook, place labels, end card
const fade = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const up = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Label: React.FC<{ o: number; text: string }> = ({ o, text }) => (
  <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 200, opacity: o }}>
    <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 800, fontSize: 44, color: "#fff6e4", background: "rgba(30,20,10,0.55)", borderRadius: 18, padding: "10px 28px", letterSpacing: 1 }}>{text}</div>
  </AbsoluteFill>
);

const Overlay: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #1d120a", paintOrder: "stroke fill", textAlign: "center" as const };
  const hook = fade(f, S1 + 2, S1 + 8, S2 - 6, S2 + 4);
  const hookPop = interpolate(f, [S1 + 2, S1 + 10], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const end1 = up(f, END - 130, END - 116);
  const end2 = up(f, END - 104, END - 92);
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 220, opacity: hook }}>
        <div style={{ ...big, fontSize: 92, color: "#ffd34d", transform: `scale(${hookPop}) rotate(-3deg)`, lineHeight: 1.1, padding: "0 40px" }}>
          {tr(lang, { ur: "LAKDI MEIN 1,000 DINAR?", en: "1,000 DINARS IN A LOG?" })}
        </div>
      </AbsoluteFill>
      <Label o={fade(f, S2 + 4, S2 + 14, S2 + 80, S2 + 90)} text={tr(lang, { ur: "Bani Israil ka ek kinara", en: "A shore of Bani Israil" })} />
      <Label o={fade(f, S3 + 144, S3 + 154, S3 + 210, S3 + 218)} text={tr(lang, { ur: "Samundar ke us paar", en: "Across the sea" })} />
      <Label o={fade(f, S5 + 64, S5 + 74, S5 + 125, S5 + 133)} text={tr(lang, { ur: "Udhar, doosra kinara", en: "Meanwhile, the other shore" })} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230 }}>
        <div style={{ ...big, fontSize: 84, color: "#ffe9b0", opacity: end1, lineHeight: 1.15, padding: "0 60px", transform: `scale(${0.9 + 0.1 * end1})` }}>
          {tr(lang, { ur: "Bharosa Rakho, Koshish Jaari Rakho", en: "Trust Allah, Keep Trying" })}
        </div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 38, color: "#fff6e0", opacity: end2, marginTop: 26, textShadow: "0 2px 8px #000" }}>Sahih al-Bukhari 2291</div>
      </AbsoluteFill>
    </>
  );
};

export const samundarMeinDinarVisuals: FilmVisuals = {
  scenes: {
    "s1-aari": { nominal: [S1, S2], render: (f) => <Scene1 f={f} /> },
    "s2-qarz": { nominal: [S2, S3], render: (f) => <Scene2 f={f} /> },
    "s3-kashti": { nominal: [S3, S4], render: (f) => <Scene3 f={f} /> },
    "s4-khat": { nominal: [S4, S5], render: (f) => <Scene4 f={f} /> },
    "s5-do-kinare": { nominal: [S5, S6], render: (f) => <Scene5 f={f} /> },
    "s6-khulna": { nominal: [S6, S7], render: (f) => <Scene6 f={f} /> },
    "s7-wapsi": { nominal: [S7, S8], render: (f) => <Scene7 f={f} /> },
    "s8-seekh": { nominal: [S8, END], render: (f) => <Scene8 f={f} /> },
  },
  sfx: SFX,
  overlay: (f, lang) => <Overlay f={f} lang={lang} />,
};
