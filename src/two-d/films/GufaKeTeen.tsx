// "Gufa Mein Phanse 3 Insaan" (Sahih al-Bukhari 2272; rain from Bukhari 2215): 9:16 Short, ~60 s.
// Nominal timeline at 30 fps; the player stretches each scene to its voice line.
// Grading: storm/cave = cold blue-grey, flashbacks = warm. Allah is never depicted; dua = raised hands only.

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import type { FilmVisuals, SceneCtx } from "../film/types";
import { blink, clamp01, easeBack, kf, layerTransform, mix, shake, VH, VW, type Cam } from "../kit";
import { Camel, Cow, CropRows, Fence, GreenField, WagePouch } from "../library/Farm";
import { GoldCoins, MilkBowl, MudRoom, Sleeper, Chatai } from "../library/Interior";
import { Boulder, CaveInside, CliffCave, Lightning, MountainSky, Peaks, Puddle, Rain, RainSplashes, RockyGround, type SkyMood } from "../library/Mountain";
import { Birds, Bush, Goat, MudHouse, VillageSky, VillageTree } from "../library/Village";
import { BASE_POSE, LOOKS, Musafir, type MusafirPose } from "../Musafir";

const G = 1500; // ground line
const CX = 1000; // cave mouth centre
const R = 480; // boulder radius (~2.4x a man's height in diameter)
const M1 = LOOKS.musafir1; // parents
const M2 = LOOKS.musafir2; // fear of Allah
const M3 = LOOKS.musafir3; // the labourer's wage
const MEN = [M1, M2, M3];

const S1 = 0;
const S2 = 150;
const S3 = 360;
const S4 = 720;
const S5 = 1080;
const S6 = 1440;
const S7 = 1650;
const END = 1800;

// ------------------------------------------------------------------ helpers
const L: React.FC<{ cam: Cam; depth: number; blur?: number; children: React.ReactNode }> = ({ cam, depth, blur = 0, children }) => (
  <g transform={layerTransform(cam, depth, VW, VH)} filter={blur >= 0.5 ? `url(#blur${Math.min(10, Math.round(blur))})` : undefined}>
    {children}
  </g>
);

const pose = (f: number, p: Partial<MusafirPose>, seed = 0): MusafirPose => ({ ...BASE_POSE, time: f / 30, eyeOpen: blink(f, seed), ...p });

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

/** Colour grade + vignette over the whole frame (screen space). */
const Grade: React.FC<{ kind: "storm" | "cave" | "warm" | "dawn" | "none"; k?: number }> = ({ kind, k = 1 }) => {
  const tint = { storm: "#a4b2cc", cave: "#a8b6d0", warm: "#ffe0b8", dawn: "#ffe6c4", none: "#ffffff" }[kind];
  return (
    <g>
      <defs>
        <radialGradient id="vig" cx="50%" cy="45%" r="75%">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor={kind === "warm" ? "#3a1a00" : "#000"} stopOpacity={kind === "none" ? 0.25 : 0.55} />
        </radialGradient>
      </defs>
      {kind !== "none" && <rect x={0} y={0} width={VW} height={VH} fill={tint} style={{ mixBlendMode: "multiply" }} opacity={k} />}
      <rect x={0} y={0} width={VW} height={VH} fill="url(#vig)" />
    </g>
  );
};

/** Three runners (or walkers) in a staggered group. */
const Group: React.FC<{ f: number; x: number; y?: number; flip?: boolean; gap?: number; extra?: Partial<MusafirPose>; walk?: number; back?: boolean; scale?: number }> = ({
  f,
  x,
  y = G + 12,
  flip,
  gap = 170,
  extra = {},
  walk = 1,
  back,
  scale = 1,
}) => (
  <>
    {[2, 1, 0].map((i) => {
      const xi = x + (flip ? 1 : -1) * i * gap;
      return (
        <Musafir
          key={i}
          x={xi}
          y={y + (i === 1 ? -14 : i === 2 ? 10 : 0)}
          flip={flip}
          back={back}
          scale={scale}
          look={MEN[i]}
          pose={pose(f, { walk, step: (xi / 95) * Math.PI + i, ...extra }, i * 13)}
        />
      );
    })}
  </>
);

// ------------------------------------------------------------------ worlds
/** Mountains outside the cave. storm = rain + lightning, dawn = after the rain, wet and golden. */
const Outside: React.FC<{ cam: Cam; t: number; mood: SkyMood; flash?: number; bolt?: number; boulder?: React.ReactNode; children?: React.ReactNode; front?: React.ReactNode }> = ({
  cam,
  t,
  mood,
  flash = 0,
  bolt = 0,
  boulder,
  children,
  front,
}) => {
  const storm = mood === "storm";
  const sway = storm ? Math.sin(t * 3.2) * 6 - 5 : Math.sin(t) * 1.2;
  return (
    <>
      <L cam={cam} depth={0}>
        <MountainSky mood={mood} t={t} flash={flash} sunX={760} w={VW} h={VH} />
        <Lightning x={760} y={120} len={900} k={bolt} seed={Math.floor(t)} />
      </L>
      <L cam={cam} depth={0.25} blur={1}>
        <Peaks mood={mood} y={1650} />
      </L>
      <L cam={cam} depth={0.55}>
        <VillageTree x={-300} y={G - 140} s={0.8} kind="kikar" sway={sway} t={t * (storm ? 3 : 1)} />
        <VillageTree x={2900} y={G - 160} s={0.9} kind="neem" sway={sway} t={t * (storm ? 3 : 1)} />
        {!storm && <Birds t={t} x={300} y={500} n={5} />}
      </L>
      <L cam={cam} depth={1}>
        <RockyGround mood={mood} y={G} wet={1} />
        <CliffCave cx={CX} g={G} mood={mood} glow={storm ? 0 : 0.5} />
        <VillageTree x={2350} y={G + 20} s={1.1} kind="neem" sway={sway * 1.2} t={t * (storm ? 3 : 1)} nest={!storm} />
        <Bush x={-200} y={G + 40} s={1.2} />
        {boulder}
        <Puddle x={1600} y={G + 120} w={340} t={t} tint={storm ? "#6f7d96" : "#f2c98a"} rain={storm} />
        <Puddle x={300} y={G + 220} w={260} t={t} tint={storm ? "#6f7d96" : "#f2c98a"} rain={storm} />
        <Puddle x={2300} y={G + 260} w={300} t={t} tint={storm ? "#6f7d96" : "#f2c98a"} rain={storm} />
        {storm && <RainSplashes t={t} x0={-800} x1={3400} y={G + 10} n={60} spread={420} />}
        {children}
      </L>
      <L cam={cam} depth={1.35}>
        <Bush x={500} y={G + 520} s={1.6} />
        <Bush x={2600} y={G + 560} s={1.8} />
        {front}
      </L>
      {storm && <Rain t={t} w={VW} h={VH} n={170} />}
      <Grade kind={storm ? "storm" : "dawn"} k={storm ? 1 : 0.6} />
      {storm && flash > 0 && <rect x={0} y={0} width={VW} height={VH} fill="#eef4ff" opacity={flash * 0.35} />}
    </>
  );
};

/** Inside the cave, looking at the mouth. `open` 0..1 = how far the boulder has rolled away. */
const Cave: React.FC<{ cam: Cam; t: number; open: number; sky?: SkyMood; children?: React.ReactNode; front?: React.ReactNode }> = ({ cam, t, open, sky = "storm", children, front }) => (
  <>
    <rect x={0} y={0} width={VW} height={VH} fill="#1a1e28" />
    <L cam={cam} depth={1}>
      <CaveInside cx={CX} g={G} open={open} t={t} layer="back" sky={sky} />
      {children}
      <CaveInside cx={CX} g={G} open={open} t={t} layer="front" sky={sky} />
    </L>
    {front && <L cam={cam} depth={1.3}>{front}</L>}
    <Grade kind={open > 0.6 ? "dawn" : "cave"} k={open > 0.6 ? 0.5 : 1 - open * 0.6} />
  </>
);

/** Side view inside the cave: the boulder fills the right, rock walls around (for the push). */
const CaveSide: React.FC<{ cam: Cam; t: number; children?: React.ReactNode }> = ({ cam, t, children }) => (
  <>
    <rect x={0} y={0} width={VW} height={VH} fill="#1a1e28" />
    <L cam={cam} depth={0.6}>
      <rect x={-800} y={0} width={3600} height={2400} fill="#2c313d" />
      {[
        [200, 700, 260],
        [700, 500, 200],
        [1300, 820, 240],
        [-100, 1100, 220],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill={i % 2 ? "#363c4a" : "#23272f"} stroke="#3d2a1e" strokeWidth={3} />
      ))}
    </L>
    <L cam={cam} depth={1}>
      {/* stalactites */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = 300 + i * 180;
        const top = G - 1200 - (i % 3) * 60;
        return <path key={i} d={`M ${x - 36} ${top} L ${x} ${top + 140 + (i % 4) * 40} L ${x + 32} ${top} Z`} fill={i % 2 ? "#3b4150" : "#565d6e"} stroke="#3d2a1e" strokeWidth={3} />;
      })}
      <rect x={-400} y={G - 1260} width={3000} height={80} fill="#23272f" />
      <path d={`M -400 ${G + 6} Q 800 ${G - 20} 2400 ${G + 6} L 2400 ${G + 900} L -400 ${G + 900} Z`} fill="#2f333e" stroke="#3d2a1e" strokeWidth={4} />
      {[300, 700, 1100].map((x, i) => (
        <ellipse key={i} cx={x} cy={G + 80 + i * 30} rx={120} ry={14} fill="#232733" />
      ))}
      {/* thin light leaking around the boulder's top edge */}
      <path d={`M ${1500 - 300} ${G - 860} Q 1500 ${G - 980} ${1500 + 300} ${G - 860}`} fill="none" stroke="#ffe7a8" strokeWidth={10} opacity={0.35} />
      <Boulder x={1500} y={G - 460} r={R} mood="storm" rim={0.45} rimSide={-1} />
      {children}
      {/* drips */}
      {[700, 1200].map((x, i) => {
        const k = ((t + i * 0.7) % 1.6) / 1.6;
        return <path key={i} d={`M ${x} ${G - 1160 + k * 1160} q 6 10 0 18 q -6 -8 0 -18 Z`} fill="#bcd2ea" opacity={0.8} />;
      })}
    </L>
    <Grade kind="cave" />
  </>
);

/** Farm of the third man: green field, fence, crops, house, trees; herd passed as children. */
const Farm: React.FC<{ cam: Cam; t: number; sunX?: number; grow?: number; children?: React.ReactNode; front?: React.ReactNode }> = ({ cam, t, sunX = 900, grow = 1, children, front }) => (
  <>
    <L cam={cam} depth={0}>
      <VillageSky mood="day" sunX={sunX} />
    </L>
    <L cam={cam} depth={0.12}>
      <Birds t={t} x={100} y={420} n={5} />
    </L>
    <L cam={cam} depth={0.3} blur={1}>
      <Peaks mood="clear" y={1560} />
    </L>
    <L cam={cam} depth={0.6}>
      <GreenField y={G - 40} />
      <MudHouse x={300} y={G - 20} w={460} h={300} tone={2} door={0} t={t} />
      <VillageTree x={900} y={G - 20} s={0.9} kind="neem" t={t} sway={Math.sin(t) * 1.5} />
      <VillageTree x={2700} y={G - 30} s={0.8} kind="kikar" t={t} sway={Math.sin(t * 0.8) * 1.2} />
    </L>
    <L cam={cam} depth={1}>
      <GreenField y={G - 140} />
      <CropRows x0={-600} x1={800} y={G - 150} grow={grow} t={t} />
      <CropRows x0={2200} x1={3600} y={G - 150} grow={grow} t={t} />
      <Fence x0={-700} x1={3800} y={G - 40} />
      {children}
    </L>
    <L cam={cam} depth={1.3}>
      <Bush x={-100} y={G + 600} s={1.5} />
      <Bush x={2600} y={G + 640} s={1.6} />
      {front}
    </L>
    <Grade kind="warm" k={0.55} />
  </>
);

// ------------------------------------------------------------------ scene 1: trapped (hook)
const boulderRoll = (f: number) => {
  const k = kf(f, [[S1 + 80, 0], [S1 + 115, 1]], Easing.in(Easing.quad));
  const x = mix(2600, CX + 150, k);
  const y = mix(G - 1750, G - 700, k) - Math.abs(Math.sin(k * Math.PI * 3)) * 60 * (1 - k);
  return { x, y, rot: (-(2600 - x) / R) * (180 / Math.PI) };
};

const Scene1: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  if (f < S1 + 40) {
    // wide: storm over the mountains, three tiny figures run for the cave
    const bolt = f >= 4 && f < 13 ? (f % 3 === 0 ? 0.4 : 1) : 0;
    const x = kf(f, [[S1, 2050], [S1 + 40, 1720]], (v) => v);
    const cam: Cam = { x: 1600, y: G - 560, zoom: kf(f, [[S1, 0.68], [S1 + 40, 0.8]]) };
    return (
      <Outside cam={cam} t={t} mood="storm" flash={bolt} bolt={bolt}>
        <Group f={f} x={x} flip extra={{ lean: 14, brow: -0.6, mouth: "open", armF: [40, 50], armB: [-30, 50] }} />
      </Outside>
    );
  }
  if (f < S1 + 80) {
    // front tracking: close on the running men, rain in their faces
    const x = kf(f, [[S1 + 40, 1900], [S1 + 80, 1420]], (v) => v);
    const cam: Cam = { x: x - 120, y: G - 280, zoom: 1.75 };
    const bolt = f >= S1 + 66 && f < S1 + 72 ? 1 : 0;
    return (
      <Outside cam={cam} t={t} mood="storm" flash={bolt}>
        <Group f={f} x={x} flip gap={150} extra={{ lean: 16, brow: -0.8, mouth: "pant", sweat: 0.4, armF: [50, 60], armB: [-40, 60] }} />
        {[0, 1, 2].map((i) => {
          const k = ((t * 3 + i * 0.33) % 1);
          return <ellipse key={i} cx={x - i * 150 + 20} cy={G + 10} rx={20 + k * 50} ry={6 + k * 10} fill="none" stroke="#dbe7f5" strokeWidth={3} opacity={1 - k} />;
        })}
      </Outside>
    );
  }
  if (f < S1 + 115) {
    // low angle: the boulder comes rolling down the mountain at them
    const b = boulderRoll(f);
    const look = kf(f, [[S1 + 80, 0], [S1 + 90, 1]]);
    const cam: Cam = { x: 1450, y: G - 640, zoom: 0.95, rot: -2.5 };
    return (
      <Outside cam={cam} t={t} mood="storm" boulder={<Boulder x={b.x} y={b.y} r={R} rot={b.rot} />}>
        {[0, 1, 2].map((i) => (
          <Musafir
            key={i}
            x={900 + i * 170}
            y={G + 12 + (i === 1 ? -10 : 0)}
            look={MEN[i]}
            pose={pose(f, { headTilt: -20 * look, brow: -1, mouth: "open", look: 1, lean: -8 * look, armF: [mix(10, 130, look), 40], armB: [mix(-6, 100, look), 40], eyeOpen: 1 })}
          />
        ))}
        {/* dust and pebbles trailing the boulder */}
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={b.x + 300 + i * 60} cy={b.y + 300 - i * 80} r={30 + i * 10} fill="#8a909c" opacity={0.35} />
        ))}
      </Outside>
    );
  }
  // inside: the boulder slams into the mouth, darkness, shake
  const HIT = S1 + 124;
  const open = f < HIT ? kf(f, [[S1 + 115, 1.4], [HIT, 0]], Easing.in(Easing.quad)) : kf(f, [[HIT, 0], [HIT + 4, 0.03], [HIT + 9, 0]]);
  const sh = shake(f, HIT, 26, 16);
  const recoil = clamp01((f - HIT + 3) / 6);
  const cam: Cam = { x: CX + sh.x, y: G - 250 + sh.y, zoom: 1.05 };
  return (
    <Cave cam={cam} t={t} open={open}>
      {[0, 1, 2].map((i) => (
        <Musafir key={i} x={640 + i * 360} y={G + 160 - (i === 1 ? 30 : 0)} scale={1.2} back look={MEN[i]} pose={pose(f, { lean: -10 * recoil, armF: [mix(10, 120, recoil), 50], armB: [mix(-5, 110, recoil), 50] })} />
      ))}
      {f >= HIT &&
        Array.from({ length: 10 }, (_, i) => {
          const k = clamp01((f - HIT) / 24);
          const a = (i / 10) * Math.PI;
          return <circle key={i} cx={CX + Math.cos(a) * (300 + k * 300)} cy={G - 40 - Math.sin(a) * k * 300} r={40 + k * 60} fill="#8a8f99" opacity={(1 - k) * 0.45} />;
        })}
    </Cave>
  );
};

// ------------------------------------------------------------------ scene 2: the push, then the dua
const Scene2: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const tremble = Math.sin(t * 46) * 2.5;
  const pushers = (strain: number) =>
    [1, 0, 2].map((i) => (
      <Musafir
        key={i}
        x={[930, 790, 880][i] + tremble * strain}
        y={G + [0, -24, 26][i]}
        scale={[1, 0.95, 1.05][i]}
        look={MEN[i]}
        pose={pose(f, { lean: 26 + Math.sin(t * 3 + i) * 3 * strain, headTilt: 6, armF: [84, 4], armB: [76, 8], brow: -1, mouth: i === 2 ? "pant" : "sad", sweat: (t * 0.8 + i * 0.3) % 1, look: 1 }, i * 7)}
      />
    ));
  if (f < S2 + 65) {
    const cam: Cam = { x: 1180, y: G - 330, zoom: kf(f, [[S2, 1.45], [S2 + 65, 1.6]]) };
    return <CaveSide cam={cam} t={t}>{pushers(1)}</CaveSide>;
  }
  if (f < S2 + 95) {
    // close-up: trembling hands on the rock and the strained face
    const cam: Cam = { x: 1010 + tremble, y: G - 300, zoom: 3.3 };
    return <CaveSide cam={cam} t={t}>{pushers(1.6)}</CaveSide>;
  }
  if (f < S2 + 150) {
    // they give up, step back and sink down; camera orbits slowly
    const k = kf(f, [[S2 + 95, 0], [S2 + 150, 1]]);
    const sit = kf(f, [[S2 + 100, 0], [S2 + 130, 1]]);
    const cam: Cam = { x: CX + Math.sin(k * Math.PI - Math.PI / 2) * 140, y: G - 100, zoom: mix(1.2, 1.35, k), rot: Math.sin(k * Math.PI) * 2.5 };
    return (
      <Cave cam={cam} t={t} open={0}>
        {[0, 1, 2].map((i) => (
          <Musafir
            key={i}
            x={[CX, CX - 330, CX + 330][i]}
            y={G + 140 + (i === 0 ? 30 : 0)}
            flip={i === 2}
            look={MEN[i]}
            pose={pose(f, { kneel: sit, lean: 14 * sit, headTilt: 14, brow: -1, mouth: "pant", sweat: 0.6, armF: [20, 30], armB: [10, 30], look: 0 }, i * 9)}
          />
        ))}
      </Cave>
    );
  }
  // the dua: all three raise their hands; slow push-in on the first man
  const raise = kf(f, [[S2 + 150, 0], [S2 + 175, 1]], easeBack);
  const cam: Cam = { x: CX, y: kf(f, [[S2 + 150, G - 100], [S3, G - 140]]), zoom: kf(f, [[S2 + 150, 1.35], [S3, 2.0]]) };
  return (
    <Cave cam={cam} t={t} open={0}>
      {[0, 1, 2].map((i) => (
        <Musafir
          key={i}
          x={[CX, CX - 330, CX + 330][i]}
          y={G + 140 + (i === 0 ? 30 : 0)}
          flip={i === 2}
          look={MEN[i]}
          pose={pose(f, { kneel: 1, lean: 6, headTilt: mix(14, -6, raise), brow: -0.5, mouth: "sad", eyeOpen: mix(1, 0.35, raise), armF: [mix(20, 34, raise), mix(30, 118, raise)], armB: [mix(10, 28, raise), mix(30, 118, raise)], look: 0 }, i * 9)}
        />
      ))}
      <circle cx={CX} cy={G - 700} r={420} fill="#ffe7a8" opacity={0.05 + raise * 0.05} />
    </Cave>
  );
};

/** Back in the cave after a good deed: the boulder grinds a bit, light grows, faces lift. */
const CaveBeat: React.FC<{ f: number; from: number; to: number; open0: number; open1: number; stand?: boolean }> = ({ f, from, to, open0, open1, stand }) => {
  const t = f / 30;
  const MOVE = from + 12;
  const open = kf(f, [[MOVE, open0], [MOVE + 24, open1]], Easing.inOut(Easing.cubic));
  const sh = shake(f, MOVE, 12, 26);
  const hope = clamp01((f - MOVE - 10) / 14);
  const up = stand ? kf(f, [[MOVE + 20, 1], [MOVE + 40, 0]]) : 1;
  const cam: Cam = { x: CX + sh.x, y: G - 110 + sh.y, zoom: kf(f, [[from, 1.2], [to, 1.35]]) };
  return (
    <Cave cam={cam} t={t} open={open}>
      {[0, 1, 2].map((i) => (
        <Musafir
          key={i}
          x={[CX, CX - 330, CX + 330][i]}
          y={G + 140 + (i === 0 ? 30 : 0)}
          flip={i === 2}
          look={MEN[i]}
          pose={pose(f, { kneel: up, lean: 4, headTilt: -4, brow: mix(-0.5, 0.9, hope), mouth: hope > 0.5 ? "open" : "sad", look: i === 2 ? -0.6 : 0.6, armF: [mix(34, 60, hope), mix(118, 40, hope)], armB: [28, mix(118, 60, hope)] }, i * 9)}
        />
      ))}
    </Cave>
  );
};

// ------------------------------------------------------------------ scene 3: first deed (parents)
const ROOM1 = { doorX: 200, winX: 1300, diyaX: 860 };
const Room1: React.FC<{ cam: Cam; t: number; time?: number; door?: number; burn?: number; children?: React.ReactNode; front?: React.ReactNode }> = ({ cam, t, time = 0, door = 0, burn = 1, children, front }) => (
  <>
    <L cam={cam} depth={1}>
      <MudRoom g={G} t={t} time={time} door={door} diyaBurn={burn} {...ROOM1} />
      <Chatai x={1330} y={G + 110} w={1050} d={110} />
      {children}
    </L>
    {front && <L cam={cam} depth={1.25}>{front}</L>}
    <Grade kind="warm" k={0.9} />
  </>
);

const Scene3: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const sleepers = (
    <>
      <Sleeper x={1100} y={G + 70} look={LOOKS.pita} t={t} blanket="#6a5a8a" />
      <Sleeper x={1650} y={G + 90} look={LOOKS.maa} t={t + 1.3} blanket="#8a4a5a" />
    </>
  );
  const carry = (x: number, p: Partial<MusafirPose>, flip = false) => {
    const pp = pose(f, { armF: [60, 70], armB: [50, 70], look: 1, ...p });
    const h = handF(x, G + 12, pp, flip);
    return (
      <>
        <Musafir x={x} y={G + 12} look={M1} flip={flip} pose={pp} />
        <MilkBowl x={h.x + (flip ? -6 : 6)} y={h.y + 14} s={0.62} t={t} />
      </>
    );
  };
  if (f < S3 + 50) {
    // night: he comes home with the bowl of milk
    const door = kf(f, [[S3, 0], [S3 + 12, 1]], easeBack);
    const x = kf(f, [[S3 + 8, 200], [S3 + 46, 560]]);
    const walking = f < S3 + 46 ? 1 : 0;
    const cam: Cam = { x: kf(f, [[S3, 520], [S3 + 50, 760]]), y: G - 330, zoom: 1.45 };
    return (
      <Room1 cam={cam} t={t} door={door}>
        {sleepers}
        {carry(x, { walk: walking, step: (x / 95) * Math.PI, brow: 0.2 })}
      </Room1>
    );
  }
  if (f < S3 + 110) {
    // over the shoulder: his back big in the foreground, the parents asleep
    const cam: Cam = { x: kf(f, [[S3 + 50, 1150], [S3 + 110, 1220]]), y: G - 200, zoom: 1.6 };
    return (
      <Room1 cam={cam} t={t}>
        {sleepers}
        <Musafir x={kf(f, [[S3 + 50, 880], [S3 + 110, 920]])} y={G + 330} scale={1.5} back look={M1} pose={pose(f, { armF: [60, 70], armB: [50, 70], headTilt: 8 })} />
      </Room1>
    );
  }
  if (f < S3 + 150) {
    // close: the bowl in his hands, he looks at it and at them, tender
    const cam: Cam = { x: 690, y: G - 340, zoom: 3.0 };
    return (
      <Room1 cam={cam} t={t}>
        {sleepers}
        {carry(600, { headTilt: 12, brow: -0.2, mouth: "smile", look: 1 })}
      </Room1>
    );
  }
  if (f < S3 + 240) {
    // time-lapse: the whole night passes, the diya burns down, he keeps standing
    const k = kf(f, [[S3 + 150, 0], [S3 + 235, 1]], (v) => v);
    const cam: Cam = { x: 960, y: G - 330, zoom: 1.1 };
    return (
      <Room1 cam={cam} t={t + k * 30} time={k} burn={mix(1, 0.15, k)}>
        {sleepers}
        {carry(600, { headTilt: 10, brow: -0.3, eyeOpen: mix(1, 0.55, k) * blink(f), lean: Math.sin(t * 1.2) * 2 })}
      </Room1>
    );
  }
  if (f < S3 + 300) {
    // morning: the parents wake and sit up; he kneels and gives them the milk
    const give = kf(f, [[S3 + 250, 0], [S3 + 275, 1]]);
    const drink = kf(f, [[S3 + 275, 0], [S3 + 288, 1]]);
    const cam: Cam = { x: kf(f, [[S3 + 240, 930], [S3 + 300, 960]]), y: G - 260, zoom: kf(f, [[S3 + 240, 1.8], [S3 + 300, 1.95]]) };
    const sonP = pose(f, { kneel: 1, lean: 10 + give * 8, armF: [mix(60, 92, give), mix(70, 14, give)], armB: [mix(50, 80, give), mix(70, 20, give)], brow: 0.4, mouth: "smile", look: 1 });
    const h = handF(760, G + 40, sonP);
    const bowl = drink > 0 ? { x: mix(h.x + 6, 1012, drink), y: mix(h.y + 14, G - 150, drink) } : { x: h.x + 6, y: h.y + 14 };
    return (
      <Room1 cam={cam} t={t} time={1} burn={0}>
        <Musafir x={1080} y={G + 40} flip look={LOOKS.pita} pose={pose(f, { kneel: 1, lean: 6 + drink * 6, headTilt: drink * 6, armF: [mix(20, 70, give), 50], brow: 0.5, mouth: drink > 0.8 ? "smile" : "neutral", look: 1, eyeOpen: blink(f, 21) })} />
        <Musafir x={1300} y={G + 60} flip look={LOOKS.maa} pose={pose(f, { kneel: 1, lean: 4, armF: [20, 60], armB: [10, 60], brow: 0.6, mouth: "smile", look: 1 }, 33)} />
        <Musafir x={760} y={G + 40} look={M1} pose={sonP} />
        <MilkBowl x={bowl.x} y={bowl.y} s={0.62} t={t} fill={mix(0.85, 0.5, drink)} />
      </Room1>
    );
  }
  return <CaveBeat f={f} from={S3 + 300} to={S4} open0={0} open1={0.15} />;
};

// ------------------------------------------------------------------ scene 4: second deed (fear of Allah)
const ROOM2 = { doorX: 250, winX: 1450, diyaX: 960 };
const Room2: React.FC<{ cam: Cam; t: number; door?: number; children?: React.ReactNode }> = ({ cam, t, door = 0, children }) => (
  <>
    <L cam={cam} depth={1}>
      <MudRoom g={G} t={t} time={0.05} door={door} {...ROOM2} />
      <Chatai x={1010} y={G + 110} w={900} d={100} />
      {children}
    </L>
    <Grade kind="warm" k={0.85} />
  </>
);

const Scene4: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const coins = (shine = 1) => <GoldCoins x={1010} y={G + 60} s={0.75} t={t} shine={shine} />;
  const woman = (warn: number) => (
    <Musafir
      x={1250}
      y={G + 40}
      flip
      look={LOOKS.aurat}
      pose={pose(f, { kneel: 1, lean: -4 * warn, headTilt: -4 * warn, armF: [mix(20, 112, warn) + Math.sin(t * 6) * 6 * warn, mix(40, 24, warn)], armB: [10, 50], brow: -0.6, mouth: warn > 0.5 && Math.sin(t * 9) > 0 ? "open" : "sad", look: 1 }, 17)}
    />
  );
  const man = (p: Partial<MusafirPose>, x = 780) => <Musafir x={x} y={G + 40} look={M2} pose={pose(f, { kneel: 1, lean: 12, armF: [64, 12], armB: [50, 20], look: 1, ...p }, 5)} />;
  if (f < S4 + 32) {
    // insert: the gold coins between them (with both of them at the edges)
    const cam: Cam = { x: 1010, y: G - 30, zoom: kf(f, [[S4, 2.6], [S4 + 32, 2.9]]) };
    return (
      <Room2 cam={cam} t={t}>
        {man({})}
        {woman(0)}
        {coins(1.4)}
      </Room2>
    );
  }
  if (f < S4 + 120) {
    // medium: she reminds him to fear Allah, hand raised in warning
    const warn = kf(f, [[S4 + 36, 0], [S4 + 56, 1]], easeBack);
    const cam: Cam = { x: 1015, y: G - 300, zoom: kf(f, [[S4 + 32, 1.75], [S4 + 120, 1.95]]) };
    return (
      <Room2 cam={cam} t={t}>
        {man({ brow: mix(0, 0.6, warn), mouth: warn > 0.5 ? "open" : "neutral" })}
        {woman(warn)}
        {coins()}
      </Room2>
    );
  }
  if (f < S4 + 170) {
    // close: his hands pull back, head bowed in shame
    const back = kf(f, [[S4 + 122, 0], [S4 + 150, 1]]);
    const cam: Cam = { x: 860, y: G - 290, zoom: 2.9 };
    return (
      <Room2 cam={cam} t={t}>
        {woman(0.3)}
        {coins()}
        {man({ lean: mix(12, -4, back), headTilt: mix(0, 18, back), armF: [mix(64, 12, back), mix(12, 50, back)], armB: [mix(50, 6, back), mix(20, 50, back)], brow: -1, mouth: "sad", look: 0.2 })}
      </Room2>
    );
  }
  if (f < S4 + 270) {
    // he gets up and walks out, leaving the gold where it is (rear tracking)
    const rise = kf(f, [[S4 + 170, 1], [S4 + 186, 0]]);
    const x = kf(f, [[S4 + 186, 780], [S4 + 262, 300]], (v) => v);
    const walking = f > S4 + 186 && f < S4 + 262 ? 1 : 0;
    const door = kf(f, [[S4 + 236, 0], [S4 + 252, 1]], easeBack);
    const cam: Cam = { x: kf(f, [[S4 + 170, 900], [S4 + 262, 560]]), y: G - 330, zoom: 1.55 };
    return (
      <Room2 cam={cam} t={t} door={door}>
        {woman(0)}
        {coins()}
        <Musafir x={x} y={G + 40} flip back={walking > 0 || f > S4 + 186} look={M2} pose={pose(f, { kneel: rise, walk: walking, step: (x / 95) * Math.PI, headTilt: 14, armF: [8, 10], armB: [-6, 8] }, 5)} />
      </Room2>
    );
  }
  return <CaveBeat f={f} from={S4 + 270} to={S5} open0={0.15} open1={0.32} stand />;
};

// ------------------------------------------------------------------ scene 5: third deed (the labourer's wage)
type Beast = { kind: "goat" | "cow" | "camel"; x: number; y: number; at: number; coat?: string; flip?: boolean };
const HERD: Beast[] = [
  { kind: "goat", x: 1350, y: G + 120, at: S5 + 60 },
  { kind: "goat", x: 1520, y: G + 180, at: S5 + 66, coat: "brown" },
  { kind: "cow", x: 1800, y: G + 80, at: S5 + 82 },
  { kind: "goat", x: 1250, y: G + 260, at: S5 + 92, coat: "black" },
  { kind: "cow", x: 2200, y: G + 200, at: S5 + 100, coat: "brown" },
  { kind: "camel", x: 2650, y: G + 60, at: S5 + 112 },
  { kind: "goat", x: 2000, y: G + 300, at: S5 + 120, coat: "brown" },
  { kind: "camel", x: 3050, y: G + 160, at: S5 + 130 },
  { kind: "cow", x: 2600, y: G + 320, at: S5 + 140 },
  { kind: "goat", x: 1700, y: G + 330, at: S5 + 148 },
];

const Herd: React.FC<{ f: number; dx?: number; walk?: number }> = ({ f, dx = 0, walk = 0 }) => {
  const t = f / 30;
  return (
    <>
      {[...HERD]
        .sort((a, b) => a.y - b.y)
        .map((b, i) => {
          const pop = kf(f, [[b.at, 0], [b.at + 10, 1]], easeBack);
          if (pop <= 0.01) return null;
          const x = b.x + dx;
          return (
            <g key={i} transform={`translate(${x} ${b.y}) scale(${pop}) translate(${-x} ${-b.y})`}>
              {b.kind === "goat" && <Goat x={x} y={b.y} t={t + i} s={1.35} coat={(b.coat as "white" | "brown" | "black") ?? "white"} graze={walk ? 0 : (i % 2) * 1} walk={walk} />}
              {b.kind === "cow" && <Cow x={x} y={b.y} t={t + i} s={1.3} coat={(b.coat as "white" | "brown") ?? "white"} graze={walk ? 0 : i % 2} walk={walk} />}
              {b.kind === "camel" && <Camel x={x} y={b.y} t={t + i} s={1.15} walk={walk} />}
            </g>
          );
        })}
    </>
  );
};

const Scene5: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const MZ = LOOKS.mazdoor;
  if (f < S5 + 50) {
    // the labourer walks off without his wage; the third man holds it out after him
    const x = kf(f, [[S5, 620], [S5 + 50, 300]], (v) => v);
    const p = pose(f, { armF: [80, 10], armB: [10, 20], brow: 0.3, mouth: "open", look: -1 });
    const h = handF(900, G + 12, p, true);
    const cam: Cam = { x: kf(f, [[S5, 800], [S5 + 50, 700]]), y: G - 300, zoom: kf(f, [[S5, 2.3], [S5 + 50, 1.8]]) };
    return (
      <Farm cam={cam} t={t}>
        <Musafir x={x} y={G - 10} flip back look={MZ} pose={pose(f, { walk: 1, step: (x / 95) * Math.PI, headTilt: 6 })} />
        <Musafir x={900} y={G + 12} flip look={M3} pose={p} />
        <WagePouch x={h.x - 4} y={h.y + 40} s={0.7} t={t} />
      </Farm>
    );
  }
  if (f < S5 + 170) {
    // time-lapse: seasons pass, the wage grows into a herd; camera pulls back
    const k = kf(f, [[S5 + 50, 0], [S5 + 170, 1]], (v) => v);
    const grow = (k * 3) % 1;
    const cam: Cam = { x: mix(900, 1800, k), y: mix(G - 300, G - 450, k), zoom: mix(1.7, 0.78, Easing.inOut(Easing.cubic)(k)) };
    return (
      <Farm cam={cam} t={t + k * 20} sunX={-200 + ((k * 3) % 1) * 1500} grow={0.15 + grow * 0.85}>
        <Herd f={f} />
        <Musafir x={900} y={G + 12} look={M3} pose={pose(f, { brow: 0.4 + k * 0.4, mouth: "smile", armF: [20, 30], look: 1 })} />
      </Farm>
    );
  }
  if (f < S5 + 230) {
    // years later the labourer returns and asks for his wage
    const x = kf(f, [[S5 + 170, 300], [S5 + 205, 620]]);
    const walking = f < S5 + 205 ? 1 : 0;
    const ask = clamp01((f - (S5 + 205)) / 10);
    const cam: Cam = { x: 790, y: G - 290, zoom: 1.8 };
    return (
      <Farm cam={cam} t={t + 20}>
        <Herd f={f} />
        <Musafir x={x} y={G + 12} look={MZ} pose={pose(f, { walk: walking, step: (x / 95) * Math.PI, armF: [mix(8, 60, ask), mix(10, 70, ask)], armB: [mix(-6, 50, ask), mix(8, 70, ask)], brow: -0.4, mouth: ask > 0.5 && Math.sin(t * 9) > 0 ? "open" : "neutral", look: 1 })} />
        <Musafir x={960} y={G + 12} flip look={M3} pose={pose(f, { brow: 0.5, mouth: "smile", look: 1 })} />
      </Farm>
    );
  }
  if (f < S5 + 280) {
    // wide reveal: "all of this is yours" - the herd
    const k = kf(f, [[S5 + 230, 0], [S5 + 280, 1]]);
    const point = kf(f, [[S5 + 232, 0], [S5 + 246, 1]], easeBack);
    const cam: Cam = { x: mix(800, 1600, k), y: mix(G - 290, G - 430, k), zoom: mix(1.8, 0.8, k) };
    return (
      <Farm cam={cam} t={t + 20}>
        <Herd f={f} />
        <Musafir x={620} y={G + 12} look={MZ} pose={pose(f, { armF: [60, 70], armB: [50, 70], brow: 1, mouth: "open", look: 1, eyeOpen: 1 })} />
        <Musafir x={960} y={G + 12} look={M3} pose={pose(f, { armF: [mix(10, 105, point), mix(20, 0, point)], brow: 0.6, mouth: "smile", look: 1 })} />
      </Farm>
    );
  }
  if (f < S5 + 320) {
    // medium: the labourer cannot believe it
    const cam: Cam = { x: 700, y: G - 330, zoom: 2.6 };
    return (
      <Farm cam={cam} t={t + 20}>
        <Herd f={f} />
        <Musafir x={620} y={G + 12} look={MZ} pose={pose(f, { armF: [80 + Math.sin(t * 5) * 6, 80], armB: [70, 80], headTilt: -8, brow: 1, mouth: "open", look: 1, eyeOpen: 1 })} />
        <Musafir x={960} y={G + 12} flip look={M3} pose={pose(f, { brow: 0.6, mouth: "smile", look: 1 })} />
      </Farm>
    );
  }
  // he takes all of it and drives the herd away, happy
  const dx = kf(f, [[S5 + 320, 0], [S6, 520]], (v) => v);
  const cam: Cam = { x: 1500 + dx * 0.6, y: G - 420, zoom: 0.95 };
  return (
    <Farm cam={cam} t={t + 20}>
      <Herd f={f} dx={dx} walk={1} />
      <Musafir x={1150 + dx} y={G + 40} look={MZ} pose={pose(f, { walk: 1, step: (dx / 95) * Math.PI, brow: 0.8, mouth: "smile", armF: [40, 30], look: 1 })} />
      <Musafir x={850} y={G + 12} look={M3} pose={pose(f, { armF: [150 + Math.sin(t * 8) * 15, 20], brow: 0.7, mouth: "smile", look: 1 })} />
    </Farm>
  );
};

// ------------------------------------------------------------------ scene 6: the boulder rolls away
const Scene6: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  if (f < S6 + 60) {
    // low, close to the ground: the boulder rolls away, light floods in
    const open = kf(f, [[S6 + 6, 0.32], [S6 + 54, 1]], Easing.inOut(Easing.cubic));
    const sh = shake(f, S6 + 8, 10, 40);
    const cam: Cam = { x: 1150 + sh.x, y: G - 260 + sh.y, zoom: 1.5 };
    return (
      <Cave cam={cam} t={t} open={open} sky="dawn">
        {[1, 0, 2].map((i) => (
          <Musafir key={i} x={[CX - 120, CX - 420, CX + 280][i]} y={G + 220} scale={1.25} back look={MEN[i]} pose={pose(f, { headTilt: -6, armF: [20 + open * 30, 30], armB: [10, 30] })} />
        ))}
      </Cave>
    );
  }
  if (f < S6 + 110) {
    // wide from inside: the cave fills with light, they walk out towards it
    const k = kf(f, [[S6 + 60, 0], [S6 + 110, 1]], (v) => v);
    const cam: Cam = { x: CX, y: G - 470, zoom: mix(0.95, 1.1, k) };
    return (
      <Cave cam={cam} t={t} open={1} sky="dawn">
        {[1, 0, 2].map((i) => {
          const x = mix([CX - 120, CX - 420, CX + 280][i], CX + (i - 1) * 140, k);
          return <Musafir key={i} x={x} y={mix(G + 220, G + 20, k)} scale={mix(1.25, 0.8, k)} back look={MEN[i]} pose={pose(f, { walk: 1, step: t * 9 + i })} />;
        })}
        <circle cx={CX} cy={G - 400} r={600} fill="#fff1c8" opacity={0.15 + k * 0.15} />
      </Cave>
    );
  }
  // outside at dawn: they step out of the cave, the camera pulls back to the mountains
  const k = kf(f, [[S6 + 110, 0], [S7, 1]], (v) => v);
  const x = mix(CX - 40, CX + 620, k);
  const cam: Cam = { x: mix(CX + 300, CX + 450, k), y: mix(G - 350, G - 640, k), zoom: mix(1.5, 0.75, Easing.inOut(Easing.cubic)(k)) };
  return (
    <Outside cam={cam} t={t} mood="dawn" boulder={<Boulder x={CX + 950} y={G - 460} r={R} rot={140} mood="dawn" />}>
      <Group f={f} x={x} gap={150} extra={{ brow: 0.8, mouth: "smile", look: 1, headTilt: -4 }} />
    </Outside>
  );
};

// ------------------------------------------------------------------ scene 7: ending
const Scene7: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const k = kf(f, [[S7, 0], [END, 1]], (v) => v);
  const x = mix(700, 1150, k);
  const cam: Cam = { x: mix(850, 1000, k), y: mix(G - 380, G - 700, k), zoom: mix(1.35, 0.7, Easing.out(Easing.cubic)(k)) };
  return (
    <>
      <L cam={cam} depth={0}>
        <MountainSky mood="clear" t={t} sunX={820} w={VW} h={VH} />
      </L>
      <L cam={cam} depth={0.12}>
        <Birds t={t} x={100} y={520} n={6} />
      </L>
      <L cam={cam} depth={0.3} blur={1}>
        <Peaks mood="clear" y={1600} />
      </L>
      <L cam={cam} depth={0.6}>
        <GreenField y={G - 60} />
        <VillageTree x={-200} y={G - 40} s={0.9} kind="kikar" t={t} />
        <VillageTree x={2300} y={G - 50} s={0.8} kind="neem" t={t} />
        <Goat x={1900} y={G + 20} t={t} s={1} coat="white" graze={1} />
      </L>
      <L cam={cam} depth={1}>
        <GreenField y={G - 30} />
        {/* mountain path winding into the valley */}
        <path d={`M -800 ${G + 60} Q 600 ${G - 10} 1300 ${G + 40} Q 2200 ${G + 100} 3400 ${G + 20} L 3400 ${G + 120} Q 2200 ${G + 200} 1300 ${G + 140} Q 600 ${G + 90} -800 ${G + 160} Z`} fill="#d8b88a" stroke="#3d2a1e" strokeWidth={4} />
        <VillageTree x={1800} y={G - 10} s={1.1} kind="neem" t={t} nest />
        <Bush x={200} y={G + 10} s={1.1} />
        <Group f={f} x={x} y={G + 80} gap={160} extra={{ brow: 0.6, mouth: "smile", look: 1 }} />
      </L>
      <L cam={cam} depth={1.3}>
        <Bush x={300} y={G + 560} s={1.6} />
        <Bush x={1900} y={G + 600} s={1.7} />
      </L>
      <Grade kind="dawn" k={0.35} />
    </>
  );
};

// ------------------------------------------------------------------ sound (nominal frames)
const s = (file: string, at: number, volume = 0.8) => ({ file: `sfx/${file}`, at, volume });
const SFX: FilmVisuals["sfx"] = [
  s("rain.mp3", S1, 0.55),
  s("thunder.wav", S1 + 4, 0.9),
  ...[0, 6, 12, 18, 24, 30, 36].map((d) => s("step.wav", S1 + 42 + d, 0.4)),
  s("thunder.wav", S1 + 66, 0.7),
  s("rumble.wav", S1 + 80, 0.9),
  s("whoosh.wav", S1 + 114, 0.5),
  s("impact.wav", S1 + 124, 1),
  s("grind.wav", S1 + 124, 0.6),
  s("rain-muffled.mp3", S2 - 20, 0.5),
  s("strain.wav", S2 + 8, 0.6),
  s("grind.wav", S2 + 20, 0.25),
  s("strain.wav", S2 + 40, 0.6),
  s("strain.wav", S2 + 70, 0.7),
  s("drip.wav", S2 + 110, 0.4),
  s("drip.wav", S2 + 175, 0.4),
  s("whoosh.wav", S3 - 4, 0.5),
  s("chime.wav", S3, 0.35),
  s("door.wav", S3 + 2, 0.5),
  ...[10, 22, 34].map((d) => s("step.wav", S3 + d, 0.3)),
  s("shimmer.wav", S3 + 160, 0.3),
  s("birds.wav", S3 + 235, 0.35),
  s("whoosh.wav", S3 + 298, 0.45),
  s("grind.wav", S3 + 312, 0.85),
  s("rumble.wav", S3 + 312, 0.5),
  s("drip.wav", S3 + 340, 0.35),
  s("whoosh.wav", S4 - 4, 0.5),
  s("chime.wav", S4, 0.35),
  s("shimmer.wav", S4 + 2, 0.5),
  ...[192, 206, 220, 234].map((d) => s("step.wav", S4 + d, 0.3)),
  s("door.wav", S4 + 236, 0.5),
  s("whoosh.wav", S4 + 268, 0.45),
  s("grind.wav", S4 + 282, 0.9),
  s("rumble.wav", S4 + 282, 0.55),
  s("whoosh.wav", S5 - 4, 0.5),
  s("chime.wav", S5, 0.35),
  s("birds.wav", S5 + 10, 0.4),
  s("whoosh.wav", S5 + 50, 0.4),
  s("shimmer.wav", S5 + 100, 0.35),
  s("birds.wav", S5 + 180, 0.35),
  s("shimmer.wav", S5 + 236, 0.45),
  s("whoosh.wav", S6 - 4, 0.45),
  s("rumble.wav", S6 + 6, 1),
  s("grind.wav", S6 + 8, 0.9),
  s("grind.wav", S6 + 30, 0.6),
  s("desert-wind.mp3", S6 + 60, 0.3),
  s("birds.wav", S6 + 70, 0.5),
  s("birds.wav", S6 + 140, 0.45),
  s("birds.wav", S7 + 20, 0.4),
  s("chime.wav", END - 100, 0.5),
];

// ------------------------------------------------------------------ hook, chapter tags, transitions, end text
const fade = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #1d120a", paintOrder: "stroke fill", textAlign: "center" as const };
  const hook = fade(f, S1 + 2, S1 + 8, S1 + 70, S1 + 78);
  const hookPop = interpolate(f, [S1 + 2, S1 + 10], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  // warm flash into each flashback, cold flash back to the cave
  const flashes = [S3, S3 + 300, S4, S4 + 270, S5, S6].map((at) => Math.max(0, 1 - Math.abs(f - at) / 6));
  const flash = Math.max(...flashes);
  const tags: [number, string][] = [
    [S3, "Pehli neki"],
    [S4, "Doosri neki"],
    [S5, "Teesri neki"],
  ];
  const end1 = interpolate(f, [END - 105, END - 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const end2 = interpolate(f, [END - 80, END - 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 220, opacity: hook }}>
        <div style={{ ...big, fontSize: 92, color: "#ffd34d", transform: `scale(${hookPop}) rotate(-2deg)`, lineHeight: 1.1, padding: "0 40px" }}>MAUT SE KAISE BACHE YE TEEN INSAAN?</div>
      </AbsoluteFill>
      {tags.map(([at, label]) => {
        const o = fade(f, at + 4, at + 12, at + 70, at + 80);
        return o > 0 ? (
          <AbsoluteFill key={label} style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 200, opacity: o }}>
            <div style={{ ...big, fontSize: 72, color: "#ffe9b0", WebkitTextStroke: "9px #3a1a00", transform: `translateY(${(1 - o) * -20}px)` }}>{label}</div>
          </AbsoluteFill>
        ) : null;
      })}
      <AbsoluteFill style={{ background: "#fff3dc", opacity: flash * 0.85 }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230 }}>
        <div style={{ ...big, fontSize: 64, color: "#ffe9b0", opacity: end1, lineHeight: 1.18, padding: "0 60px" }}>Tumhari neki mushkil waqt mein tumhare kaam aa sakti hai.</div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 38, color: "#fff6e0", opacity: end2, marginTop: 28, textShadow: "0 2px 8px #000" }}>Sahih al-Bukhari 2272</div>
      </AbsoluteFill>
    </>
  );
};

export const gufaKeTeenVisuals: FilmVisuals = {
  scenes: {
    "s1-chattan": { nominal: [S1, S2], render: (f, ctx) => <Scene1 f={f} ctx={ctx} /> },
    "s2-dua": { nominal: [S2, S3], render: (f, ctx) => <Scene2 f={f} ctx={ctx} /> },
    "s3-maa-baap": { nominal: [S3, S4], render: (f, ctx) => <Scene3 f={f} ctx={ctx} /> },
    "s4-gunah-se-bachna": { nominal: [S4, S5], render: (f, ctx) => <Scene4 f={f} ctx={ctx} /> },
    "s5-mazdoor": { nominal: [S5, S6], render: (f, ctx) => <Scene5 f={f} ctx={ctx} /> },
    "s6-madad": { nominal: [S6, S7], render: (f, ctx) => <Scene6 f={f} ctx={ctx} /> },
    "s7-ending": { nominal: [S7, END], render: (f, ctx) => <Scene7 f={f} ctx={ctx} /> },
  },
  sfx: SFX,
  overlay: (f) => <Overlay f={f} />,
};
