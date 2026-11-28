// "Laal Patti aur Cheel" (Sahih al-Bukhari 439): 9:16 Short. Nominal timeline at 30 fps.
// Hadith: a freed black slave woman who stayed with an Arab tribe was accused of stealing a girl's red leather sash
// and searched in a humiliating way; while she stood among them a kite dropped the sash, which it had taken for meat.
// She came to Rasoolullah ﷺ, accepted Islam, lived in a small tent in the masjid and kept saying to Aisha (RA):
// "The day of the sash is one of the wonders of our Lord; He saved me from the land of disbelief."
// Never shown: Rasoolullah ﷺ, Aisha (RA) (not even a voice: the narrator tells her question), any figure in the
// masjid except the woman; the search itself. Camp, tents, faces and the walk to Madinah are tasawwur.
// Structure: frame story (Madinah) + mystery and replay (the hook's incomplete shot replays in full at the reveal).
// Look: film look "crimson-sand"; golden-afternoon camp of black tents vs cool-morning / golden Madinah courtyard;
// cel-shaded people, each with their own face and build. Cuts that matter are anchored with `beats`.

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { tr } from "../film/types";
import type { Lang } from "../film/schema";
import type { FilmVisuals, SceneCtx } from "../film/types";
import { blink, easeBack, kf, layerTransform, mix, OUT, shake, VH, VW, type Cam } from "../kit";
import { BASE_POSE, foreAngle, LOOKS, Musafir, type Look, type MusafirPose } from "../Musafir";
import { MusafirFront, type FrontPose } from "../FrontFace";
import { Palm } from "../Scenery";
import { Cheel, CheelShadow, DryShrub, DuneBands, RedSash, SandGround, SandPuff, Spindle, Tent, type DuneTone } from "../library/Desert";
import { MasjidCourt, MasjidFloor, MasjidGate } from "../library/Masjid";
import { Chulha, DustMotes, PerchedBird, TimeSky } from "../library/Courtyard";
import { Camel } from "../library/Farm";
import { Chatai } from "../library/Interior";
import { Birds, Goat, LightRays, Matka } from "../library/Village";
import { HandReach } from "../library/Closeups";
import { FlashFx, LensFlare, LightLeak, RewindFx, WhipFx } from "../library/Fx";

const K = LOOKS.khatoon;
const KM = LOOKS["khatoon-madinah"];
const GIRL = LOOKS.bachchi;
const GIRL_OFF: Partial<Look> = { ...LOOKS.bachchi, sash: "#d2a842" };
const MOTHER = LOOKS["qabeele-aurat"];
const SARDAR = LOOKS.sardar;
const JAWAN = LOOKS["qabeele-jawan"];
const AUNT = LOOKS.maa;

const S1 = 0;
const S2 = 120;
const S3 = 360;
const S4 = 520;
const S5 = 760;
const S6 = 880;
const S7 = 1000;
const S8 = 1270;
const S9 = 1440;
const S10 = 1580;
const END = 1920;

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
const level = (p: MusafirPose, look: Partial<Look>) => `rotate(${-foreAngle(p, "F", look)})`;

/** Colour grade + vignette (screen space). */
const Grade: React.FC<{ tint: string; k?: number; vig?: number; warm?: boolean }> = ({ tint, k = 1, vig = 0.45, warm }) => (
  <g>
    <defs>
      <radialGradient id={`lv${warm ? "w" : "c"}`} cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor={warm ? "#3a0a10" : "#0a1020"} stopOpacity={vig} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={VW} height={VH} fill={tint} style={{ mixBlendMode: "multiply" }} opacity={k} />
    <rect x={0} y={0} width={VW} height={VH} fill={`url(#lv${warm ? "w" : "c"})`} />
  </g>
);

/** 4-point glint. */
const Glint: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) =>
  s > 0.02 ? (
    <path d={`M ${x} ${y - 30 * s} L ${x + 5 * s} ${y} L ${x} ${y + 30 * s} L ${x - 5 * s} ${y} Z M ${x - 30 * s} ${y} L ${x} ${y - 5 * s} L ${x + 30 * s} ${y} L ${x} ${y + 5 * s} Z`} fill="#fffbe0" opacity={o} />
  ) : null;

/** A kite feather rocking down (the clue left behind). */
const Feather: React.FC<{ x: number; y: number; rot: number; s?: number }> = ({ x, y, rot, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -40 Q 15 -10 6 30 Q 0 40 -6 30 Q -15 -10 0 -40 Z" fill="#6e4c32" stroke={OUT} strokeWidth={2.5} />
    <path d="M 0 -36 L 0 46" stroke="#c2a47e" strokeWidth={2.5} />
    <path d="M 0 -12 l 8 -6 M 0 2 l -8 -6 M 0 16 l 8 -6" stroke="#4c3322" strokeWidth={2} />
  </g>
);

/** A kite soaring in circles high up (below view), for the sky layers. */
const SkyKite: React.FC<{ t: number; x: number; y: number; s?: number }> = ({ t, x, y, s = 0.35 }) => {
  const a = t * 0.55;
  return <Cheel x={x + Math.cos(a) * 110} y={y + Math.sin(a) * 36} s={s} t={t} view="below" flap={0.25} heading={(a * 180) / Math.PI + 180} />;
};

/** Front close-up: the body runs out of the frame, the set's grade on top. */
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
  rot?: number;
}> = ({ f, a, b, bg, look, p, push = [1.8, 1.95], y = 1500, held, fg, tint, warm = true, light = "l", dx = 0, rot = 0 }) => {
  const k = kf(f, [[a, 0], [b, 1]], lin);
  const s = mix(push[0], push[1], k);
  const drift = Math.sin(f / 40) * 10;
  return (
    <>
      {bg}
      <g transform={`rotate(${rot} ${VW / 2} ${VH / 2}) translate(${VW / 2 + drift + dx} ${y})`}>
        <MusafirFront x={0} y={0} s={s} look={look} pose={p} held={held} light={light} />
      </g>
      <Grade tint={tint} k={0.28} vig={0.32} warm={warm} />
      {fg}
    </>
  );
};

/** Over-the-shoulder: one person's back big and soft in the foreground (screen space). */
const OTSBack: React.FC<{ f: number; look: Partial<Look>; side: "l" | "r"; p?: Partial<MusafirPose>; hold?: React.ReactNode; dy?: number }> = ({ f, look, side, p = {}, hold, dy = 0 }) => {
  const ps = pose(f, { armF: [10, 10], headTilt: -4, ...p });
  return (
    <g filter="url(#blur4)">
      <Musafir x={side === "r" ? VW - 110 : 110} y={VH + 620 + dy} scale={3.4} flip={side === "l"} back look={look} pose={ps} noShadow holdF={hold ? <g transform={level(ps, look)}>{hold}</g> : undefined} />
    </g>
  );
};

// ------------------------------------------------------------------ world 1: the tribe's camp (golden afternoon)
const G = 1560; // action ground
const HOR = 1170; // dunes base (depth 0.2)
const TB = { x: 1300, y: G - 120, w: 720, h: 300 }; // the girl's family tent, behind the people
const FIRE = { x: 360, y: G - 24 };
const camAt = (x: number, zoom: number, groundY = 1560, rot = 0): Cam => ({ x, y: G - (groundY - 960) / zoom, zoom, rot });

/** Background life on the action plane: cooking fire, a woman at it, goats. */
const CampLife: React.FC<{ f: number; aunt?: boolean; goats?: boolean }> = ({ f, aunt = true, goats = true }) => {
  const t = f / 30;
  return (
    <g>
      <Chulha x={FIRE.x} y={FIRE.y} t={t} s={0.85} roti={false} />
      {aunt && <Musafir x={FIRE.x - 150} y={G - 16} scale={0.95} look={AUNT} pose={pose(f, { kneel: 1, lean: 14, armF: [52 + Math.sin(t * 3) * 10, 34], armB: [22, 30], headTilt: 10, look: 0.6 }, 7)} light="r" />}
      {goats && (
        <>
          <Goat x={720} y={G + 36} t={t} s={0.62} graze={0.8} coat="brown" />
          <Goat x={2050} y={G + 30} t={t + 1.3} s={0.58} flip coat="black" graze={0.5} />
        </>
      )}
    </g>
  );
};

type CampProps = {
  cam: Cam;
  f: number;
  time?: number;
  bgBlur?: number;
  nearBlur?: number;
  tentOpen?: number;
  life?: boolean;
  aunt?: boolean;
  kite?: boolean;
  kiteAt?: [number, number];
  tone?: DuneTone;
  dim?: number;
  children?: React.ReactNode;
  front?: React.ReactNode;
};
const Camp: React.FC<CampProps> = ({ cam, f, time = 0.4, bgBlur = 0, nearBlur = 0, tentOpen = 1, life = true, aunt = true, kite, kiteAt = [820, 300], tone = "gold", dim = 0, children, front }) => {
  const t = f / 30;
  return (
    <g>
      <L cam={cam} depth={0.04}>
        <TimeSky time={time} t={t} x0={-1200} x1={3200} y0={-300} y1={1450} />
        {kite && <SkyKite t={t} x={kiteAt[0]} y={kiteAt[1]} s={0.32} />}
      </L>
      <L cam={cam} depth={0.2} blur={bgBlur * 0.6}>
        <DuneBands y={HOR} tone={tone} x0={-2400} x1={5200} />
      </L>
      <L cam={cam} depth={0.45} blur={bgBlur * 0.8}>
        <Palm x={-420} y={1215} s={1.3} sway={Math.sin(t * 0.9) * 4} />
        <Palm x={-230} y={1228} s={1.0} lean={-0.6} sway={Math.sin(t * 0.8 + 1) * 4} />
        <Palm x={2380} y={1215} s={1.4} lean={-0.8} sway={Math.sin(t * 0.85 + 2) * 4} />
        <Tent x={1960} y={1224} w={460} h={200} t={t} tone="brown" />
      </L>
      <L cam={cam} depth={0.62} blur={bgBlur * 0.7}>
        <SandGround y={1196} t={t} x0={-2400} x1={5200} depth={700} tone={tone} shrubs={false} />
        <Tent x={-170} y={1300} w={640} h={270} t={t} />
        <Camel x={420} y={1300} t={t} s={0.42} saddle={false} />
      </L>
      <L cam={cam} depth={1} blur={nearBlur}>
        <SandGround y={G - 240} t={t} x0={-2400} x1={5200} depth={1900} tone={tone} />
        <Tent x={TB.x} y={TB.y} w={TB.w} h={TB.h} t={t} open={tentOpen} />
        {life && <CampLife f={f} aunt={aunt} />}
        {children}
      </L>
      {front && <L cam={cam} depth={1.3}>{front}</L>}
      {dim > 0 && <rect x={0} y={0} width={VW} height={VH} fill="#1a0610" opacity={dim} />}
    </g>
  );
};

/** Blurred camp behind a front close-up: horizon low, sky behind the head, a kite circling high (clue). */
const campCloseBg = (f: number, x = 1150, opts: { kite?: boolean; crowd?: React.ReactNode; time?: number } = {}) => (
  <Camp cam={{ x, y: 1100, zoom: 1.5 }} f={f} bgBlur={6} nearBlur={5} kite={opts.kite} kiteAt={[860, 560]} time={opts.time ?? 0.55}>
    {opts.crowd}
  </Camp>
);

// ------------------------------------------------------------------ the tribe in a ring around her
const RING = { aunt: 680, mother: 820, girl: 930, khatoon: 1160, sardar: 1420, jawan: 1570, sash: 1040 };
const Crowd: React.FC<{ f: number; up?: number; back?: number; bow?: number; point?: number; k?: Partial<MusafirPose>; kFlip?: boolean; showK?: boolean; kLook?: Partial<Look>; cry?: number }> = ({
  f,
  up = 0,
  back = 0,
  bow = 0,
  point = 0,
  k = {},
  kFlip,
  showK = true,
  kLook = K,
  cry = 0,
}) => {
  const head = -18 * up + 20 * bow;
  const brow = -0.8 * Math.max(bow, cry) - 0.4 * point;
  const away = (side: 1 | -1, amt: number) => side * back * amt;
  return (
    <g>
      <Musafir x={RING.aunt + away(-1, 30)} y={G} look={AUNT} pose={pose(f, { headTilt: head, lean: -6 * back, brow, armF: [20 + 40 * back, 30], armB: [10, 20] }, 1)} light="r" />
      <Musafir x={RING.mother + away(-1, 50)} y={G} look={MOTHER} pose={pose(f, { headTilt: head, lean: -8 * back, brow, armF: [24 + 60 * back, 40], armB: [30, 60], mouth: back > 0.5 ? "open" : "neutral" }, 2)} light="r" />
      <Musafir x={RING.girl + away(-1, 40)} y={G} scale={0.62} look={GIRL_OFF} pose={pose(f, { headTilt: head * 0.8, brow: cry ? -1 : brow, mouth: cry > 0.5 ? "sad" : "neutral", armF: cry > 0.5 ? [40, 125] : [20, 20], armB: cry > 0.5 ? [36, 125] : [10, 20] }, 3)} light="r" />
      {showK && <Musafir x={RING.khatoon} y={G} flip={kFlip} look={kLook} pose={pose(f, { headTilt: -14 * up, ...k }, 4)} light="r" />}
      <Musafir x={RING.sardar + away(1, 40)} y={G} flip look={SARDAR} pose={pose(f, { headTilt: head, lean: -6 * back, brow, armF: [24 + 30 * back, 20], armB: [10, 20] }, 5)} light="l" />
      <Musafir x={RING.jawan + away(1, 50)} y={G} flip look={JAWAN} pose={pose(f, { headTilt: head, lean: -6 * back + 6 * point, brow, armF: [mix(16, 92, point), mix(20, 0, point)], armB: [12, 18], mouth: point > 0.5 ? "open" : "neutral" }, 6)} light="l" />
    </g>
  );
};

// ------------------------------------------------------------------ ground-level close on the sash (hook + replay)
const SA = { x: 540, y: 1240 };
const SashClose: React.FC<{ f: number; push: number; crane?: number; sh?: { x: number; y: number }; ground?: React.ReactNode; over?: React.ReactNode }> = ({ f, push, crane = 0, sh = { x: 0, y: 0 }, ground, over }) => {
  const t = f / 30;
  const at = (k: number, par: number) => `translate(${SA.x + sh.x * par} ${SA.y + crane * par + sh.y * par}) scale(${k}) translate(${-SA.x} ${-SA.y})`;
  return (
    <g>
      <g transform={`translate(0 ${crane * 0.12})`}>
        <TimeSky time={0.4} t={t} x0={-300} x1={1400} y0={-700} y1={1000} />
      </g>
      <g transform={at(1 + (push - 1) * 0.3, 0.4)} filter="url(#blur4)">
        <DuneBands y={790} x0={-500} x1={1600} />
      </g>
      <g transform={at(1 + (push - 1) * 0.55, 0.6)} filter="url(#blur6)">
        <Tent x={140} y={880} w={560} h={250} t={t} />
        <Tent x={960} y={870} w={430} h={200} t={t} tone="brown" />
        <Camel x={640} y={890} t={t} s={0.55} saddle={false} />
      </g>
      <g transform={at(push, 1)}>
        <SandGround y={860} t={t} x0={-500} x1={1600} depth={1800} />
        <rect x={-500} y={860} width={2100} height={160} fill="#f2d2a6" opacity={0.35} filter="url(#blur8)" />
        {ground}
      </g>
      <g transform={at(push * 1.08, 1.25)} filter="url(#blur6)">
        <DryShrub x={-30} y={1800} s={3.2} t={t} />
        <DryShrub x={1120} y={1860} s={2.6} t={t + 2} />
      </g>
      {over}
    </g>
  );
};

// ------------------------------------------------------------------ world 2: the masjid courtyard in Madinah
const MG = 1540; // her mat
const MW = 1240; // wall foot (depth 0.6)
const KH = { x: 250, y: MG - 70 }; // her khaima
const courtCam = (x: number, zoom: number, groundY = 1560, rot = 0): Cam => ({ x, y: MG - (groundY - 960) / zoom, zoom, rot });

const Court: React.FC<{ cam: Cam; f: number; warm?: number; bgBlur?: number; nearBlur?: number; fly?: number; kite?: boolean; children?: React.ReactNode; front?: React.ReactNode }> = ({ cam, f, warm = 0, bgBlur = 0, nearBlur = 0, fly = 0, kite, children, front }) => {
  const t = f / 30;
  return (
    <g>
      <L cam={cam} depth={0.05}>
        <TimeSky time={warm > 0.5 ? 0.78 : 3} t={t} x0={-1200} x1={3200} y0={-300} y1={1450} />
        {kite && <SkyKite t={t} x={800} y={340} s={0.3} />}
      </L>
      <L cam={cam} depth={0.6} blur={bgBlur}>
        <MasjidCourt g={MW} t={t} warm={warm} x0={-1800} x1={3800} />
        {[-160, 240, 700, 1100, 1500].map((bx, i) => (
          <PerchedBird key={i} x={bx} y={MW - 596} t={t + i * 0.7} s={0.95} fly={kf(fly, [[i * 0.1, 0], [i * 0.1 + 0.5, 1]], lin)} dir={i % 2 ? 1 : -1} flip={i % 2 === 0} />
        ))}
      </L>
      <L cam={cam} depth={1} blur={nearBlur}>
        <MasjidFloor y={MG - 300} warm={warm} x0={-1800} x1={3800} depth={1900} />
        <Tent x={KH.x} y={KH.y} w={400} h={270} t={t} tone="cream" poles={1} open={0.35} />
        <Matka x={KH.x + 270} y={KH.y + 24} s={0.45} />
        <Chatai x={640} y={MG + 30} w={440} d={70} />
        {children}
      </L>
      {front && <L cam={cam} depth={1.3}>{front}</L>}
    </g>
  );
};

/** Her spinning wool on the mat: front hand up holding the thread, the spindle hangs and turns. */
const spinPose = (f: number, extra: Partial<MusafirPose> = {}) =>
  pose(f, { kneel: 1, lean: 4, armF: [128 + Math.sin(f / 9) * 3, 26], armB: [34, 72 + Math.sin(f / 7) * 6], headTilt: -4, look: 0.5, grip: true, ...extra }, 9);
const Spinner: React.FC<{ f: number; x?: number; look?: Partial<Look>; p?: Partial<MusafirPose> }> = ({ f, x = 640, look = KM, p = {} }) => {
  const ps = spinPose(f, p);
  return (
    <Musafir
      x={x}
      y={MG}
      look={look}
      pose={ps}
      light="r"
      holdF={
        <g transform={level(ps, look)}>
          <Spindle x={0} y={6} t={f / 30} s={0.7} len={140} />
        </g>
      }
    />
  );
};
const courtBg = (f: number, x = 900, warm = 0) => <Court cam={courtCam(x, 1.5, 1820)} f={f} warm={warm} bgBlur={6} nearBlur={5} />;

// ------------------------------------------------------------------ scene 1: hook (the sash, a shadow, gone; her face)
const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S1;
  if (l < 60) {
    const push = kf(l, [[0, 1.0], [60, 1.12]], lin);
    const lift = kf(l, [[44, 0], [53, 1]], Easing.in(Easing.quad));
    const sh = shake(l, 44, 12, 12);
    const gx = kf(l, [[0, 700], [26, -300]], lin);
    const gp = pose(f, { walk: 1, step: gx / 24, armF: [40, 30], armB: [-30, 20], lean: 10, look: 0.2 }, 3);
    return (
      <SashClose
        f={f}
        push={push}
        sh={sh}
        ground={
          <>
            {lift <= 0 ? <RedSash x={SA.x} y={SA.y} t={t} s={2.0} mode="lie" glint={0.9} /> : null}
            <SandPuff x={SA.x} y={SA.y + 14} age={l - 45} s={1.7} />
            {l < 28 && <Musafir x={gx} y={SA.y + 40} scale={1.35} flip look={GIRL_OFF} pose={gp} light="l" />}
          </>
        }
        over={
          <>
            <CheelShadow x={kf(l, [[30, 1700], [56, -800]], lin)} y={SA.y - 20} s={3.0} o={0.42} t={t} rot={-90} />
            {lift > 0 && lift < 1 && <RedSash x={SA.x + lift * 200} y={SA.y - lift * 1700} t={t} s={2.0} mode="hang" drag={0.3} />}
            <FlashFx k={kf(l, [[44, 0.25], [50, 0]], lin)} w={VW} h={VH} />
          </>
        }
      />
    );
  }
  // her face: wide eyes, fingers point at her from both sides; a kite circles high in the sky (the clue)
  const wide = kf(l, [[60, 0.4], [66, 1]], easeBack);
  const lookX = kf(l, [[60, 0], [70, -0.6], [84, -0.6], [92, 0.6], [106, 0.6], [114, 0]]);
  return (
    <>
      <Close
        f={f}
        a={S1 + 60}
        b={S2}
        bg={campCloseBg(f, 1150, { kite: true })}
        look={K}
        p={fp(f, { wide, brow: -0.75, mouth: "open", lookX, tilt: -3 }, 4)}
        push={[1.78, 1.96]}
        y={1520}
        tint="#ffe0c4"
        light="r"
        rot={-2}
        fg={
          <g filter="url(#blur3)">
            <HandReach from={[-200, 1560]} to={[kf(l, [[60, 40], [68, 170]], easeBack), 1330]} mode="point" skin={SARDAR.skin} sleeve={SARDAR.robe} s={1.6} />
            <HandReach from={[1280, 1620]} to={[kf(l, [[64, 1040], [72, 910]], easeBack), 1380]} mode="point" skin={MOTHER.skin} sleeve={MOTHER.robe} s={1.6} />
          </g>
        }
      />
      <WhipFx k={kf(l, [[108, 0], [120, 1]], lin)} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ scene 2: Madinah, years later (the frame)
const Scene2: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  const l = f - S2;
  const talk = ctx.talk("khatoon");
  if (l < 40) {
    const cam: Cam = { x: kf(l, [[0, 760], [40, 640]]), y: kf(l, [[0, 980], [40, 1210]]), zoom: kf(l, [[0, 1.02], [40, 1.28]]) };
    return (
      <>
        <Court cam={cam} f={f} fly={kf(l, [[8, 0], [40, 0.5]], lin)}>
          <Spinner f={f} />
        </Court>
        <LightRays x={980} y={-200} t={t} o={0.14} />
        <DustMotes t={t} x={0} y={500} w={VW} h={1200} n={20} o={0.4} />
        <WhipFx k={kf(l, [[0, 1], [10, 0]], lin)} t={t} w={VW} h={VH} dir={-1} />
      </>
    );
  }
  if (l < 105) {
    // her front close-up, 3/4 to someone off-screen right (never shown), a quiet smile
    return (
      <Close
        f={f}
        a={S2 + 40}
        b={S2 + 105}
        bg={courtBg(f, 900)}
        look={KM}
        p={fp(f, { turn: 0.35, lookX: 0.6, lookY: kf(l, [[40, -0.3], [70, -0.1]]), mouth: "smile", talk, brow: 0.25, tilt: 3 }, 2)}
        push={[1.8, 1.9]}
        y={1520}
        tint="#f2eeff"
        warm={false}
        light="l"
        fg={<DustMotes t={t} x={0} y={300} w={VW} h={1300} n={18} o={0.5} />}
      />
    );
  }
  // side view on the mat, spinning; push in on "lekin kyun?"; rewind into the past
  const zoom = kf(l, [[105, 1.7], [190, 1.82], [214, 2.4]]);
  const cam = courtCam(kf(l, [[105, 600], [214, 700]]), zoom, 1600, kf(l, [[190, 0], [214, -2]]));
  const ps = { headTilt: kf(l, [[150, -4], [175, -10], [200, -4]]), look: 0.7, brow: kf(l, [[170, 0], [195, -0.3]]) };
  return (
    <>
      <Court cam={cam} f={f}>
        <Spinner f={f} p={ps} />
      </Court>
      <LightRays x={1000} y={-260} t={t} o={0.12} />
      <RewindFx k={kf(l, [[214, 0], [240, 1]], lin)} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ scene 3: the tribe (flashback)
const Sardar: React.FC<{ f: number; x?: number }> = ({ f, x = TB.x - 180 }) => {
  const t = f / 30;
  return <Musafir x={x} y={TB.y + 40} scale={0.95} look={SARDAR} pose={pose(f, { kneel: 1, lean: 6, armF: [44 + Math.sin(t * 2.2) * 16, 40], armB: [20, 30], look: 0.7, talk: Math.max(0, Math.sin(t * 7)) * 0.4 }, 12)} light="r" />;
};
const Jawan: React.FC<{ f: number; x?: number }> = ({ f, x = TB.x + 40 }) => {
  const t = f / 30;
  return <Musafir x={x} y={TB.y + 70} flip look={JAWAN} pose={pose(f, { headTilt: 4 + Math.sin(t * 1.5) * 4, armF: [14, 20], armB: [8, 16], look: 0.6 }, 13)} light="l" />;
};
const carryPose = (f: number, kx: number, walk = 1) => pose(f, { walk, step: kx / 34, armF: [32, 84], armB: [26, 84], lean: 4, look: 0.4, grip: true }, 5);
const PotCarry: React.FC<{ p: MusafirPose; look?: Partial<Look> }> = ({ p, look = K }) => (
  <g transform={level(p, look)}>
    <Matka x={30} y={74} s={0.42} />
  </g>
);

const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S3;
  const rew = kf(l, [[0, 1], [12, 0]], lin);
  if (l < 90) {
    // establishing: the camp in golden light; she walks past with a water pot; a kite circles far above
    const kx = kf(l, [[0, 60], [90, 640]], lin);
    const kp = carryPose(f, kx);
    const cam = camAt(kf(l, [[0, 560], [90, 840]]), kf(l, [[0, 1.12], [90, 1.24]]), 1640);
    return (
      <>
        <Camp cam={cam} f={f} kite>
          <Sardar f={f} />
          <Jawan f={f} />
          <Musafir x={kx} y={G + 20} look={K} pose={kp} light="r" holdF={<PotCarry p={kp} />} />
        </Camp>
        <RewindFx k={rew} t={t} w={VW} h={VH} />
      </>
    );
  }
  // closer: she sets the pot down by the women at the fire; they turn away; she stays standing, alone
  const kneel = kf(l, [[96, 0], [110, 0.8], [130, 0.8], [140, 0]]);
  const kx = 640;
  const kp = pose(f, { kneel, lean: 10 * kneel, armF: kneel > 0.4 || l < 110 ? [32, 84] : [10, 14], armB: [26, 84 - 60 * (l > 120 ? 1 : 0)], grip: l < 120, look: 0.3, headTilt: l > 140 ? 10 : 4, brow: l > 138 ? -0.45 : 0 }, 5);
  const potDown = l >= 120;
  const cam = camAt(kf(l, [[90, 470], [160, 510]]), kf(l, [[90, 1.75], [160, 1.85]]), 1600);
  return (
    <Camp cam={cam} f={f} aunt={false}>
      <Musafir x={FIRE.x + 70} y={G - 10} scale={0.95} flip look={MOTHER} pose={pose(f, { kneel: 1, lean: 10, armF: [40, 50], armB: [20, 30], look: l > 124 && l < 134 ? -0.6 : 0.6, headTilt: 6 }, 8)} light="l" />
      <Musafir x={FIRE.x - 140} y={G - 16} scale={0.95} look={AUNT} pose={pose(f, { kneel: 1, lean: 14, armF: [52 + Math.sin(t * 3) * 10, 34], armB: [22, 30], headTilt: 10 }, 7)} light="r" />
      {potDown && <Matka x={kx + 70} y={G + 14} s={0.42} />}
      <Musafir x={kx} y={G + 10} flip look={K} pose={kp} light="r" holdF={potDown ? undefined : <PotCarry p={kp} />} />
    </Camp>
  );
};

// ------------------------------------------------------------------ scene 4: the red sash
const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S4;
  if (l < 80) {
    // the girl skips out of the tent wearing the sash; it glints; she twirls; the woman watches and smiles
    const gx = kf(l, [[0, TB.x + 10], [34, TB.x - 210]], ease);
    const twirl = l > 40 && l < 66;
    const gp = pose(f, twirl ? { armF: [160, 10], armB: [150, 10], mouth: "smile", brow: 0.6 } : { walk: l < 34 ? 1 : 0, step: gx / 22, armF: [60, 30], armB: [-20, 20], mouth: "smile", brow: 0.5 }, 11);
    const flip = twirl ? Math.floor(l / 5) % 2 === 0 : true;
    const waist = { x: gx + (flip ? 4 : -4), y: G - 102 };
    const cam = camAt(kf(l, [[0, TB.x - 150], [80, TB.x - 230]]), kf(l, [[0, 2.05], [80, 2.15]]), 1600);
    return (
      <Camp cam={cam} f={f} aunt={false}>
        <Musafir x={TB.x - 420} y={G} look={K} pose={pose(f, { kneel: 1, lean: 8, armF: [40, 40], armB: [30, 40], mouth: "smile", brow: 0.3, look: 0.8, headTilt: -2 }, 14)} light="r" />
        <Matka x={TB.x - 520} y={G + 6} s={0.42} />
        <Musafir x={gx} y={G} scale={0.62} flip={flip} look={GIRL} pose={gp} light="r" />
        <Glint x={waist.x - 14} y={waist.y} s={0.5 + 0.5 * Math.max(0, Math.sin(t * 6))} />
        <Glint x={waist.x + 16} y={waist.y + 4} s={0.4 * Math.max(0, Math.sin(t * 6 + 2))} />
      </Camp>
    );
  }
  if (l < 140) {
    // she chases a goat kid; the sash slips from her waist and falls
    const gx = kf(l, [[80, 1180], [140, 560]], lin);
    const kidX = kf(l, [[80, 1000], [140, 300]], lin);
    const slip = kf(l, [[112, 0], [128, 1]], Easing.in(Easing.quad));
    const off = l >= 112;
    const fallX = mix(1180 - (112 - 80) * (620 / 60), 860, slip);
    const gp = pose(f, { walk: 1, step: gx / 22, armF: [80, 20], armB: [60, 20], lean: 12, mouth: "smile", brow: 0.5 }, 11);
    const cam = camAt(kf(l, [[80, 1000], [140, 820]]), 1.85, 1600);
    return (
      <Camp cam={cam} f={f} aunt={false}>
        <Musafir x={1500} y={G} flip look={K} pose={pose(f, { kneel: 1, lean: 8, armF: [40, 40], armB: [30, 40], mouth: "smile", brow: 0.3, look: 0.8 }, 14)} light="l" />
        <Goat x={kidX} y={G + 10} t={t} s={0.42} flip walk={1} coat="white" />
        <Musafir x={gx} y={G} scale={0.62} flip look={off ? GIRL_OFF : GIRL} pose={gp} light="r" />
        {off && (slip < 1 ? <RedSash x={fallX} y={mix(G - 100, G - 8, slip)} t={t} s={0.42} mode="fall" rot={mix(0, 170, slip)} /> : <RedSash x={860} y={G - 6} t={t} s={0.42} mode="lie" glint={0.6} />)}
      </Camp>
    );
  }
  if (l < 200) {
    // beat: line 2. The sash left alone on the sand; her feet run off; then a shadow passes and it is lifted away
    const push = kf(l, [[140, 1.02], [200, 1.1]], lin);
    const lift = kf(l, [[190, 0], [199, 1]], Easing.in(Easing.quad));
    const legs = kf(l, [[140, 460], [168, -260]], lin);
    return (
      <SashClose
        f={f}
        push={push}
        sh={shake(l, 190, 8, 10)}
        ground={
          <>
            {lift <= 0 && <RedSash x={SA.x} y={SA.y} t={t} s={2.0} mode="lie" glint={0.7} />}
            <SandPuff x={SA.x} y={SA.y + 14} age={l - 191} s={1.6} />
            {l < 170 && <Musafir x={legs} y={SA.y - 120} scale={1.1} flip look={GIRL_OFF} pose={pose(f, { walk: 1, step: legs / 22, armF: [80, 20], armB: [60, 20], lean: 12 }, 11)} light="l" />}
          </>
        }
        over={
          <>
            <CheelShadow x={kf(l, [[178, 1700], [202, -800]], lin)} y={SA.y - 20} s={3.0} o={0.42} t={t} rot={-90} />
            {lift > 0 && lift < 1 && <RedSash x={SA.x + lift * 200} y={SA.y - lift * 1700} t={t} s={2.0} mode="hang" drag={0.3} />}
          </>
        }
      />
    );
  }
  // "...aur phir, gaayab!": the empty spot, sand settling, one brown feather rocking down; the girl comes back, shocked
  const gx = kf(l, [[204, 620], [218, 870]], easeBack);
  const fy = kf(l, [[200, G - 420], [240, G - 40]], lin);
  const cam = camAt(980, kf(l, [[200, 2.0], [240, 2.15]]), 1620);
  const shock = l > 216;
  return (
    <Camp cam={cam} f={f} aunt={false} life={false}>
      <SandPuff x={1060} y={G + 8} age={l - 200 + 14} s={0.8} />
      <Musafir x={gx} y={G} scale={0.62} look={GIRL_OFF} pose={pose(f, shock ? { armF: [40, 125], armB: [36, 125], mouth: "open", brow: -0.8, headTilt: 8, look: 0.9 } : { walk: 1, step: gx / 22, armF: [60, 20], armB: [40, 20] }, 11)} light="r" />
      <Feather x={1060 + Math.sin(t * 3) * 40} y={fy} rot={Math.sin(t * 3) * 35} s={0.8} />
    </Camp>
  );
};

// ------------------------------------------------------------------ scene 5: everyone searches, then all eyes turn to her
const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S5;
  if (l < 55) {
    const sh = { x: Math.sin(t * 7) * 6, y: Math.cos(t * 5) * 4 };
    const cam = camAt(TB.x - 220 + sh.x, 1.42, 1640 + sh.y);
    const shakeCloth = Math.sin(t * 9) * 40;
    const mp = pose(f, { armF: [80 + shakeCloth, 20], armB: [70 + shakeCloth, 20], lean: 8, brow: -0.6, mouth: "open", grip: true }, 2);
    return (
      <Camp cam={cam} f={f} time={0.5} aunt={false} tentOpen={kf(l, [[10, 0.3], [30, 1]])}>
        <Musafir x={TB.x - 520} y={G} look={MOTHER} pose={mp} light="r" holdF={<g transform={level(mp, MOTHER)}><rect x={-10} y={-20} width={170} height={110} rx={10} fill="#a8322a" stroke={OUT} strokeWidth={4} transform={`rotate(${Math.sin(t * 9) * 12})`} /></g>} />
        <Musafir x={TB.x - 400} y={G} scale={0.62} look={GIRL_OFF} pose={pose(f, { armF: [40, 125], armB: [36, 125], mouth: "sad", brow: -1, headTilt: 10 }, 3)} light="r" />
        <Musafir x={TB.x + 260} y={G} flip={Math.floor(l / 16) % 2 === 0} look={SARDAR} pose={pose(f, { brow: -0.5, headTilt: 6, armF: [30, 30], armB: [20, 20], look: 0.9 }, 5)} light="l" />
        <Musafir x={TB.x + 40} y={G - 20} flip look={JAWAN} pose={pose(f, { armF: [150, 20], armB: [140, 10], lean: 10, brow: -0.4, look: 0.8, headTilt: -6 }, 6)} light="l" />
        <Musafir x={TB.x - 760} y={G + 10} look={K} pose={pose(f, { armF: [32, 84], armB: [26, 84], grip: true, look: 0.6, brow: -0.2 }, 4)} light="r" holdF={<PotCarry p={pose(f, { armF: [32, 84], armB: [26, 84] })} />} />
      </Camp>
    );
  }
  // over their shoulders: she stands with the pot; they turn; the young man's arm comes up at her; push in
  const zoom = kf(l, [[55, 1.6], [95, 1.75], [120, 2.5]], ease);
  const kx = 1160;
  const kp = pose(f, { armF: [32, 84], armB: [26, 84], grip: true, look: kf(l, [[70, 0.2], [90, 0.9]]), brow: kf(l, [[80, 0], [100, -0.9]]), headTilt: -2, mouth: l > 98 ? "open" : "neutral" }, 4);
  const point = kf(l, [[78, 0], [88, 1]], easeBack);
  return (
    <>
      <Camp cam={camAt(kx, zoom, 1560)} f={f} time={0.5} bgBlur={3} kite kiteAt={[860, 520]}>
        <Musafir x={kx + 260} y={G - 30} scale={0.95} flip look={SARDAR} pose={pose(f, { brow: -0.7, headTilt: 4, armF: [20, 20], armB: [10, 16] }, 5)} light="l" />
        <Musafir x={kx} y={G} look={K} pose={kp} light="r" holdF={<PotCarry p={kp} />} />
      </Camp>
      <OTSBack f={f} look={MOTHER} side="l" p={{ headTilt: -2 }} />
      <OTSBack f={f} look={JAWAN} side="r" p={{ armF: [mix(10, 96, point), mix(10, 0, point)], headTilt: -4 }} />
    </>
  );
};

// ------------------------------------------------------------------ scene 6: the search (never shown): her face, then small among them
const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S6;
  if (l < 75) {
    const tear = kf(l, [[18, 0], [72, 1]], lin);
    return (
      <>
        <Close
          f={f}
          a={S6}
          b={S6 + 75}
          bg={campCloseBg(f, 1100, { time: 0.75 })}
          look={K}
          p={fp(f, { brow: -1, mouth: "sad", lookY: kf(l, [[0, 0.3], [30, 0.7]]), lookX: -0.2, tilt: kf(l, [[0, 2], [75, 7]]), tear, eyeOpen: l > 40 && l < 52 ? 0.15 : blink(f, 6) }, 6)}
          push={[1.86, 2.02]}
          y={1540}
          tint="#c8cce4"
          warm={false}
          light="r"
          fg={
            <g filter="url(#blur8)" opacity={0.85}>
              <Musafir x={-60} y={2350} scale={3.6} back look={SARDAR} pose={pose(f, { headTilt: 4 })} noShadow />
              <Musafir x={VW + 80} y={2400} scale={3.8} back flip look={MOTHER} pose={pose(f, { headTilt: 4 })} noShadow />
            </g>
          }
        />
        <rect x={0} y={0} width={VW} height={VH} fill="#10061a" opacity={kf(l, [[0, 0.05], [75, 0.22]])} />
      </>
    );
  }
  // high and wide: she stands alone in the middle of the ring
  const cam = camAt(1130, kf(l, [[75, 1.3], [120, 1.2]]), 1330, -3);
  return (
    <>
      <Camp cam={cam} f={f} time={0.75} aunt={false} life={false} dim={0.12}>
        <Crowd f={f} k={{ headTilt: 14, brow: -1, mouth: "sad", armF: [6, 10], armB: [4, 8] }} />
      </Camp>
      <Grade tint="#d4d0ea" k={0.25} vig={0.5} />
    </>
  );
};

// ------------------------------------------------------------------ scene 7: "By Allah!" - the kite returns; then the replay
const KITE_DROP = { from: { x: 1250, y: 720 }, to: { x: 260, y: 620 } };
const Scene7: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S7;
  if (l < 70) {
    // she lifts her head among them; a big shadow passes over everyone; they look up
    const up = kf(l, [[48, 0], [60, 1]], easeBack);
    const cam = camAt(kf(l, [[0, 1120], [70, 1150]]), kf(l, [[0, 1.55], [70, 1.62]]), 1620);
    return (
      <>
        <Camp cam={cam} f={f} time={0.6} aunt={false} life={false} dim={kf(l, [[38, 0], [46, 0.25], [56, 0]])}>
          <Crowd f={f} up={up} k={{ headTilt: kf(l, [[0, 12], [20, 0]]), brow: -0.3, armF: [8, 10], armB: [6, 8] }} />
        </Camp>
        <CheelShadow x={kf(l, [[36, 1800], [58, -900]], lin)} y={1200} s={4.2} o={0.35} t={t} rot={-90} />
      </>
    );
  }
  if (l < 110) {
    // looking up: the kite flies over, opens its talons, the sash drops toward us
    const k = kf(l, [[70, 0], [110, 1]], lin);
    const kx = mix(KITE_DROP.from.x, KITE_DROP.to.x, k);
    const ky = mix(KITE_DROP.from.y, KITE_DROP.to.y, k) + Math.sin(k * 3) * 30;
    const s = 1.5;
    const grab = kf(l, [[90, 1], [95, 0]], lin);
    const rel = { x: mix(KITE_DROP.from.x, KITE_DROP.to.x, (92 - 70) / 40) - 64 * s, y: mix(KITE_DROP.from.y, KITE_DROP.to.y, (92 - 70) / 40) + 70 * s };
    const fall = kf(l, [[93, 0], [110, 1]], Easing.in(Easing.quad));
    const sh = { x: Math.sin(t * 6) * 5, y: Math.cos(t * 4) * 4 };
    return (
      <g transform={`translate(${sh.x} ${sh.y})`}>
        <TimeSky time={0.6} t={t} x0={-200} x1={1300} y0={-200} y1={1900} />
        <LensFlare x={940} y={420} k={0.7} t={t} w={VW} h={VH} />
        <g filter="url(#blur5)">
          <Tent x={120} y={2060} w={700} h={320} t={t} />
          <Tent x={1000} y={2000} w={560} h={260} t={t} tone="brown" />
          <Musafir x={260} y={2380} scale={2.6} look={MOTHER} pose={pose(f, { headTilt: -20 })} noShadow />
          <Musafir x={860} y={2420} scale={2.8} flip look={SARDAR} pose={pose(f, { headTilt: -20 })} noShadow />
        </g>
        <Cheel
          x={kx}
          y={ky}
          s={s}
          t={t}
          flip
          flap={1}
          talons={1}
          grab={grab}
          held={l < 93 ? <RedSash x={0} y={0} t={t} s={0.42} mode="hang" drag={0.5} /> : undefined}
        />
        {l >= 93 && <RedSash x={rel.x + 40 * fall} y={rel.y + fall * 1500} t={t * 0.6} s={mix(0.5, 1.4, fall)} mode="fall" rot={mix(70, 200, fall)} />}
      </g>
    );
  }
  if (l < 170) {
    // slow motion: the sash flutters down into the middle of them and lands; they step back
    const fall = kf(l, [[110, 0], [150, 1]], Easing.in(Easing.quad));
    const back = kf(l, [[150, 0], [158, 1]], easeBack);
    const cam = camAt(1090, kf(l, [[110, 1.5], [170, 1.62]]), 1360);
    const sh = shake(l, 150, 10, 10);
    return (
      <>
        <Camp cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} f={f} time={0.6} aunt={false} life={false}>
          <Crowd f={f} back={back} up={1 - back} k={{ headTilt: l > 152 ? 18 : -14, brow: 0.2, mouth: "open", armF: [10, 10], armB: [8, 8] }} />
          {fall < 1 ? (
            <RedSash x={RING.sash + Math.sin(t * 2) * 20} y={mix(G - 1100, G - 10, fall)} t={t * 0.4} s={0.6} mode="fall" rot={mix(30, 175, fall)} />
          ) : (
            <RedSash x={RING.sash} y={G + 6} t={t} s={0.6} mode="lie" glint={1} />
          )}
          <SandPuff x={RING.sash} y={G + 10} age={l - 150} s={1} />
        </Camp>
        <FlashFx k={kf(l, [[150, 0.3], [156, 0]], lin)} w={VW} h={VH} />
      </>
    );
  }
  // REPLAY (line 2: "It had taken the red leather for meat!"): the hook shot again, in full
  const rew = kf(l, [[170, 0], [178, 1], [190, 0]], lin);
  const dive = kf(l, [[182, 0], [212, 1]], Easing.in(Easing.cubic));
  const rise = kf(l, [[214, 0], [266, 1]], Easing.out(Easing.quad));
  const crane = kf(l, [[214, 0], [262, 1300]], ease);
  const grabbed = l >= 212;
  const s = 2.1;
  const foot = { x: (10 + 46) * s, y: (24 + 34) * s }; // talons offset (flipped: x mirrors)
  const kx = grabbed ? mix(SA.x + foot.x, 260, rise) : mix(1300, SA.x + foot.x, dive);
  const ky = grabbed ? mix(SA.y - foot.y - 10, 380, rise) - Math.sin(rise * 3) * 30 : mix(-260, SA.y - foot.y - 10, dive);
  const rot = grabbed ? mix(-5, -28, rise) : mix(40, 10, dive);
  return (
    <>
      <SashClose
        f={f}
        push={1.05}
        crane={crane}
        sh={shake(l, 212, 12, 12)}
        ground={
          <>
            {!grabbed && <RedSash x={SA.x} y={SA.y} t={t} s={2.0} mode="lie" glint={0.8} />}
            <SandPuff x={SA.x} y={SA.y + 14} age={l - 212} s={1.8} />
          </>
        }
        over={
          <>
            <CheelShadow x={kf(l, [[196, 1500], [214, SA.x]], lin)} y={SA.y - 10} s={2.6} o={kf(l, [[196, 0.2], [212, 0.45], [222, 0]], lin)} t={t} rot={-60} />
            <Cheel
              x={kx}
              y={ky}
              s={s}
              t={t}
              flip
              flap={grabbed ? 1 : 0}
              fold={grabbed ? 0 : kf(l, [[182, 1], [204, 1], [210, 0.2]], lin)}
              talons={kf(l, [[200, 0], [208, 1]], lin)}
              grab={grabbed ? kf(l, [[212, 0], [216, 1]], lin) : 0}
              rot={rot}
              held={grabbed ? <RedSash x={0} y={0} t={t} s={0.9} mode="hang" drag={0.6 * rise} /> : undefined}
            />
          </>
        }
      />
      <g opacity={0.25}>
        <rect x={0} y={0} width={VW} height={VH} fill="#f0d8a8" style={{ mixBlendMode: "multiply" }} />
      </g>
      <RewindFx k={rew} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ scene 8: "This is what you accused me of... I was innocent"
const Scene8: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  const l = f - S8;
  if (l < 105) {
    return (
      <Close
        f={f}
        a={S8}
        b={S8 + 105}
        bg={campCloseBg(f, 1000, { crowd: <Crowd f={f} showK={false} bow={0.3} /> })}
        look={K}
        p={fp(f, { brow: kf(l, [[0, -0.6], [60, -0.1]]), mouth: "sad", talk: ctx.talk("khatoon"), lookX: -0.35, turn: -0.25, tilt: kf(l, [[0, 4], [50, -4]]), tear: 0.75, hands: "hold", handsUp: kf(l, [[0, 0.3], [16, 1]], easeBack), holdW: 120 }, 8)}
        held={<RedSash x={0} y={-14} t={t} s={0.6} mode="held" w={250} glint={0.6} />}
        push={[1.82, 1.96]}
        y={1400}
        tint="#ffe2c8"
        light="r"
        fg={<LightLeak k={0.2} t={t} w={VW} h={VH} />}
      />
    );
  }
  // reverse over her shoulder: the sash in her hand; they lower their heads; the girl hugs her mother
  const bow = kf(l, [[112, 0], [140, 1]], ease);
  const cam = camAt(kf(l, [[105, 860], [170, 840]]), kf(l, [[105, 1.6], [170, 1.7]]), 1600);
  return (
    <>
      <Camp cam={cam} f={f} aunt={false} life={false}>
        <Musafir x={600} y={G - 20} scale={0.95} look={SARDAR} pose={pose(f, { headTilt: 22 * bow, brow: -0.8 * bow, armF: [10, 16], armB: [8, 12] }, 5)} light="r" />
        <Musafir x={720} y={G} look={AUNT} pose={pose(f, { headTilt: 18 * bow, brow: -0.7 * bow, armF: [14, 20], armB: [8, 14] }, 1)} light="r" />
        <Musafir x={860} y={G} look={MOTHER} pose={pose(f, { headTilt: 20 * bow, brow: -0.9 * bow, armF: [30 + 20 * bow, 40], armB: [14, 20] }, 2)} light="r" />
        <Musafir x={930} y={G} scale={0.62} look={GIRL_OFF} pose={pose(f, { armF: [80 * bow, 40], armB: [60 * bow, 40], headTilt: -6, brow: -0.6, lean: -6 * bow }, 3)} light="r" />
      </Camp>
      <OTSBack f={f} look={K} side="r" dy={-40} p={{ armF: [52, 20], headTilt: -6 }} hold={<RedSash x={0} y={0} t={t} s={0.28} mode="hang" />} />
    </>
  );
};

// ------------------------------------------------------------------ scene 9: dawn: she walks to Madinah, into the light of the masjid
const Scene9: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S9;
  if (l < 70) {
    const kx = kf(l, [[0, 300], [70, 820]], lin);
    const kp = pose(f, { walk: 1, step: kx / 36, armF: [24, 20], armB: [-16, 20], lean: 4, look: 0.6, headTilt: -4 }, 4);
    const cam = camAt(kx + 120, 1.7, 1560);
    return (
      <>
        <L cam={cam} depth={0.04}>
          <TimeSky time={2.88} t={t} x0={-1200} x1={3200} y0={-300} y1={1450} />
          <Birds t={t} x={300} y={520} n={5} />
        </L>
        <L cam={cam} depth={0.2}>
          <DuneBands y={HOR} tone="dawn" x0={-2400} x1={5200} />
        </L>
        <L cam={cam} depth={0.45}>
          {[760, 860, 950, 1060, 1180].map((px, i) => (
            <Palm key={i} x={px} y={1230} s={0.7 + (i % 2) * 0.2} lean={i % 2 ? -0.5 : 0.6} sway={Math.sin(t + i) * 3} />
          ))}
        </L>
        <L cam={cam} depth={1}>
          <SandGround y={G - 240} t={t} x0={-2400} x1={5200} depth={1900} tone="dawn" />
          <path d={`M ${kx - 20} ${G + 4} L ${kx + 360} ${G + 40} L ${kx + 340} ${G + 70} L ${kx - 30} ${G + 14} Z`} fill="#5a3a3a" opacity={0.22} filter="url(#blur4)" />
          <Musafir x={kx} y={G} look={K} pose={kp} light="l" />
        </L>
        <LightLeak k={0.25} t={t} w={VW} h={VH} color="#ffd0a0" color2="#ff9a7a" />
        <WhipFx k={kf(l, [[58, 0], [70, 1]], lin)} t={t} w={VW} h={VH} />
      </>
    );
  }
  // the masjid door, morning light; she walks in and is lost in the light (nobody inside is shown)
  const kx = kf(l, [[70, 160], [112, 560]], lin);
  const enter = kf(l, [[118, 0], [138, 1]], ease);
  const walking = l < 112 || l > 118;
  const kp = pose(f, { walk: walking ? 1 : 0, step: (kx + enter * 120) / 36, armF: [20, 20], armB: [-12, 18], look: 0.8, headTilt: l > 110 && l < 122 ? -8 : 0 }, 4);
  const cam = camAt(kf(l, [[70, 480], [140, 600]]), kf(l, [[70, 1.4], [140, 1.55]]), 1640);
  const glow = kf(l, [[70, 0.45], [130, 1]], lin);
  return (
    <>
      <L cam={cam} depth={0.04}>
        <TimeSky time={2.95} t={t} x0={-1200} x1={3200} y0={-300} y1={1450} />
      </L>
      <L cam={cam} depth={1}>
        <SandGround y={G - 300} t={t} x0={-2400} x1={5200} depth={1900} tone="dawn" shrubs={false} />
        <MasjidGate x={700} g={G - 40} t={t} glow={glow} x0={-1600} x1={3200} />
        <g opacity={1 - enter}>
          <Musafir x={kx + enter * 120} y={G - 40 * enter} scale={1 - 0.12 * enter} look={K} pose={kp} light="r" />
        </g>
      </L>
      <LightRays x={760} y={360} t={t} o={0.12 + 0.1 * glow} />
      <LightLeak k={0.2 + 0.4 * enter} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ scene 10: back in Madinah, golden: her words; pull out; end card
const Scene10: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  const l = f - S10;
  if (l < 170) {
    const lookY = kf(l, [[0, -0.45], [100, -0.45], [125, 0]]);
    return (
      <Close
        f={f}
        a={S10}
        b={S10 + 170}
        bg={courtBg(f, 900, 1)}
        look={KM}
        p={fp(f, { mouth: "smile", talk: ctx.talk("khatoon"), lookY, brow: 0.35, tilt: kf(l, [[0, -2], [170, 3]]), hands: "dua", handsUp: kf(l, [[10, 0], [60, 1]], ease) }, 3)}
        push={[1.8, 1.96]}
        y={1540}
        tint="#ffe6c4"
        light="l"
        fg={
          <>
            <DustMotes t={t} x={0} y={300} w={VW} h={1300} n={22} o={0.6} />
            <LightLeak k={0.35} t={t} w={VW} h={VH} />
          </>
        }
      />
    );
  }
  // beat: line 2. Pull out over the courtyard; pigeons take off; a kite glides high in the evening sky
  const k = kf(l, [[170, 0], [270, 1]], ease);
  const cam: Cam = { x: mix(640, 660, k), y: mix(MG - 600 / 1.9, 1050, k), zoom: mix(1.9, 1.02, k) };
  return (
    <>
      <Court cam={cam} f={f} warm={1} fly={kf(l, [[190, 0], [290, 1]], lin)} kite>
        <Spinner f={f} />
      </Court>
      <LightRays x={1000} y={-200} t={t} o={0.16} />
      <DustMotes t={t} x={0} y={400} w={VW} h={1300} n={16} o={0.45} />
      <LightLeak k={0.3} t={t} w={VW} h={VH} />
      <rect x={0} y={0} width={VW} height={700} fill="#2a0a12" opacity={kf(l, [[190, 0], [230, 0.28]])} />
    </>
  );
};

// ------------------------------------------------------------------ sound (nominal frames); `until` stops a cue at its cut
type Cue = FilmVisuals["sfx"][number];
const s = (file: string, at: number, volume = 0.8, until?: number): Cue => ({ file: `sfx/${file}`, at, volume, until });
const SFX: FilmVisuals["sfx"] = [
  // 1 hook: running steps, a shadow, wings, the sash snatched; her face, heartbeat
  ...[2, 9, 16, 23].map((d) => s("step-sand.wav", S1 + d, 0.35)),
  s("wings.wav", S1 + 36, 0.7),
  s("whoosh.wav", S1 + 40, 0.55),
  s("kite-cry.wav", S1 + 50, 0.22),
  s("heartbeat.wav", S1 + 60, 0.5, S2),
  s("impact.wav", S1 + 60, 0.25),
  s("whoosh.wav", S1 + 108, 0.45),
  // 2 Madinah: pigeons, breeze; rewind into the past
  s("pigeon.wav", S2 + 8, 0.3, S2 + 100),
  s("wings.wav", S2 + 14, 0.25),
  s("breeze.wav", S2 + 40, 0.2, S2 + 200),
  s("birds.wav", S2 + 110, 0.15, S2 + 215),
  s("rewind.wav", S2 + 212, 0.45),
  // 3 the camp
  s("tent-flap.wav", S3 + 8, 0.35, S3 + 90),
  s("goat.wav", S3 + 30, 0.35),
  ...[14, 30, 46, 62, 78].map((d) => s("step-sand.wav", S3 + d, 0.25)),
  s("camel.wav", S3 + 64, 0.3),
  s("fire-crackle.wav", S3 + 90, 0.3, S3 + 160),
  s("cloth.wav", S3 + 118, 0.4),
  // 4 the sash: a child playing, the goat kid, the fall, the shadow, gone
  s("cloth.wav", S4 + 6, 0.45),
  s("children-play.wav", S4 + 10, 0.18, S4 + 140),
  s("shimmer.wav", S4 + 40, 0.25),
  s("goat.wav", S4 + 86, 0.35),
  ...[146, 152, 158, 164].map((d) => s("step-sand.wav", S4 + d, 0.3)),
  s("cloth.wav", S4 + 118, 0.35),
  s("wings.wav", S4 + 182, 0.65),
  s("whoosh.wav", S4 + 188, 0.5),
  s("goat.wav", S4 + 206, 0.3),
  s("impact.wav", S4 + 218, 0.2),
  // 5 the search, all eyes turn to her
  s("cloth.wav", S5 + 4, 0.45),
  s("cloth.wav", S5 + 22, 0.4),
  s("tent-flap.wav", S5 + 10, 0.3, S5 + 55),
  s("cloth.wav", S5 + 40, 0.35),
  s("heartbeat.wav", S5 + 70, 0.45, S5 + 120),
  s("impact.wav", S5 + 86, 0.2),
  // 6 the search (not shown): heartbeat, a low pad
  s("heartbeat.wav", S6, 0.5, S6 + 75),
  s("pad.wav", S6 + 10, 0.3, S6 + 115),
  s("breeze.wav", S6 + 75, 0.25, S6 + 120),
  // 7 the kite returns; the sash falls; replay
  s("wings.wav", S7 + 38, 0.6),
  s("kite-cry.wav", S7 + 46, 0.55),
  s("kite-cry.wav", S7 + 88, 0.7),
  s("whoosh.wav", S7 + 94, 0.4),
  s("slowmo.wav", S7 + 110, 0.4, S7 + 150),
  s("sand-thud.wav", S7 + 150, 0.9),
  s("gasp.wav", S7 + 150, 0.6),
  s("impact.wav", S7 + 150, 0.3),
  s("rewind.wav", S7 + 168, 0.45),
  s("wings.wav", S7 + 198, 0.6),
  s("whoosh.wav", S7 + 204, 0.55),
  s("kite-cry.wav", S7 + 212, 0.6),
  s("sand-thud.wav", S7 + 212, 0.5),
  s("wings.wav", S7 + 222, 0.65),
  s("wings.wav", S7 + 244, 0.5),
  // 8 her words, then their heads go down
  s("pad.wav", S8 + 10, 0.25, S8 + 100),
  s("cloth.wav", S8 + 110, 0.3),
  s("breeze.wav", S8 + 106, 0.25, S8 + 170),
  // 9 dawn walk, the masjid door
  s("birds.wav", S9 + 4, 0.25, S9 + 70),
  ...[8, 26, 44].map((d) => s("step-sand.wav", S9 + d, 0.25)),
  s("whoosh.wav", S9 + 58, 0.45),
  ...[76, 92, 108, 124].map((d) => s("step-sand.wav", S9 + d, 0.25)),
  s("shimmer.wav", S9 + 112, 0.35),
  s("chime.wav", S9 + 124, 0.3),
  // 10 golden Madinah, pigeons fly, a kite far up, end card
  s("pigeon.wav", S10 + 10, 0.25, S10 + 160),
  s("birds.wav", S10 + 172, 0.2, S10 + 330),
  s("wings.wav", S10 + 196, 0.3),
  s("kite-cry.wav", S10 + 250, 0.15),
  s("chime.wav", S10 + 206, 0.35),
];

// ------------------------------------------------------------------ overlays: hook, place labels, end card
const fade = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const up = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Label: React.FC<{ o: number; text: string }> = ({ o, text }) => (
  <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 200, opacity: o }}>
    <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 800, fontSize: 44, color: "#fff4e2", background: "rgba(58,6,16,0.72)", border: "3px solid #e0283a", borderRadius: 18, padding: "10px 28px", letterSpacing: 1 }}>{text}</div>
  </AbsoluteFill>
);

const Overlay: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #3a0610", paintOrder: "stroke fill", textAlign: "center" as const };
  const hook = fade(f, S1 + 62, S1 + 68, S2 - 12, S2 - 4);
  const hookPop = interpolate(f, [S1 + 62, S1 + 70], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const end1 = up(f, S10 + 196, S10 + 210);
  const end2 = up(f, S10 + 220, S10 + 232);
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 210, opacity: hook }}>
        <div style={{ ...big, fontSize: 104, color: "#ffe9d6", transform: `scale(${hookPop}) rotate(-3deg)`, lineHeight: 1.1, padding: "0 40px" }}>{tr(lang, { ur: "CHOR KAUN?", en: "WHO'S THE THIEF?" })}</div>
      </AbsoluteFill>
      <Label o={fade(f, S2 + 8, S2 + 18, S2 + 84, S2 + 94)} text={tr(lang, { ur: "Madinah, kai saal baad", en: "Madinah, years later" })} />
      <Label o={fade(f, S3 + 14, S3 + 24, S3 + 78, S3 + 88)} text={tr(lang, { ur: "Ek Arab qabeela", en: "An Arab tribe" })} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 240 }}>
        <div style={{ ...big, fontSize: 86, color: "#fff4e2", opacity: end1, lineHeight: 1.15, padding: "0 60px", transform: `scale(${0.9 + 0.1 * end1})` }}>
          {tr(lang, { ur: "Ilzaam Se Pehle Saboot Dekho", en: "Before You Blame, Look for Proof" })}
        </div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 38, color: "#ffd2c8", opacity: end2, marginTop: 26, textShadow: "0 2px 8px #000" }}>Sahih al-Bukhari 439</div>
      </AbsoluteFill>
    </>
  );
};

export const laalPattiAurCheelVisuals: FilmVisuals = {
  scenes: {
    "s1-hook": { nominal: [S1, S2], render: (f) => <Scene1 f={f} /> },
    "s2-madinah": { nominal: [S2, S3], render: (f, ctx) => <Scene2 f={f} ctx={ctx} />, beats: [null, S2 + 105] },
    "s3-qabeela": { nominal: [S3, S4], render: (f) => <Scene3 f={f} /> },
    "s4-patti": { nominal: [S4, S5], render: (f) => <Scene4 f={f} />, beats: [null, S4 + 140] },
    "s5-ilzaam": { nominal: [S5, S6], render: (f) => <Scene5 f={f} /> },
    "s6-talaashi": { nominal: [S6, S7], render: (f) => <Scene6 f={f} /> },
    "s7-cheel": { nominal: [S7, S8], render: (f) => <Scene7 f={f} />, beats: [null, S7 + 170] },
    "s8-begunaah": { nominal: [S8, S9], render: (f, ctx) => <Scene8 f={f} ctx={ctx} /> },
    "s9-islam": { nominal: [S9, S10], render: (f) => <Scene9 f={f} /> },
    "s10-ajooba": { nominal: [S10, END], render: (f, ctx) => <Scene10 f={f} ctx={ctx} />, beats: [null, S10 + 170] },
  },
  ambience: { file: "sfx/desert-bed.wav", volume: 0.12 },
  sfx: SFX,
  overlay: (f, lang) => <Overlay f={f} lang={lang} />,
};
