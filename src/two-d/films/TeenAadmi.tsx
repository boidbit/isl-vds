// "Teen Aadmi, Ek Imtihaan" (Sahih al-Bukhari 3464): 9:16 Short. Nominal timeline at 30 fps.
// Hadith: Allah tested three men of Bani Israil (a leper, a bald man, a blind man) through an angel who healed them
// and gave each a pregnant animal; their herds filled valleys. The angel came back in each man's old condition
// asking for help: the first two lied and refused, the third gave freely; "Allah is pleased with you and angry with
// your two companions". The angel is NEVER shown (no shape, shadow, hand or voice): the camera IS his point of view,
// the men answer into the lens, the narrator tells his words. The Hadith does not say the two were turned back: we
// only show a cloud shadow over their valleys while the conditional dua is spoken.
// Structure: three tries + mirror (each man sees his own past in a sepia memory flash).
// Look: "harvest-amber" (golden afternoon, plum shadows); poor days are dusty and grey, the test is golden, the two
// refusals go cold under a cloud, the third man's answer is the warmest light of the film.

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { tr } from "../film/types";
import type { Lang } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { blink, easeBack, kf, layerTransform, mix, shake, VH, VW, type Cam } from "../kit";
import { BASE_POSE, foreAngle, LOOKS, Musafir, type Look, type MusafirPose } from "../Musafir";
import { MusafirFront, type FrontPose } from "../FrontFace";
import { CourtWall, DirtGround, DustMotes, FarHouses, TimeSky } from "../library/Courtyard";
import { Camel, Cow } from "../library/Farm";
import { Birds, Goat, Hills, LightRays, MudHouse, VillageSky, VillageTree } from "../library/Village";
import { FlashFx, HealGlow, LightLeak, MemoryFx, WhipFx } from "../library/Fx";

// ------------------------------------------------------------------ cast: poor (conditions on) and rich (healed, dressed)
const POOR = { kodhi: LOOKS.kodhi, ganja: LOOKS.ganja, andha: LOOKS.andha };
const RICH: Record<"kodhi" | "ganja" | "andha", Partial<Look>> = {
  kodhi: { ...LOOKS.kodhi, patches: 0, robe: "#8a2f3a", robeShade: "#6e2430", sash: "#d9a84a", vest: "#3a2a4a", headwear: "turban", turban: "#ffffff", turbanShade: "#e2ddd2" },
  ganja: { ...LOOKS.ganja, hair: 1, robe: "#2f4f8a", robeShade: "#243e6e", sash: "#e0b04a", vest: "#6a4a2a" },
  andha: { ...LOOKS.andha, blind: 0, robe: "#f1e8d4", robeShade: "#d8ccb0", sash: "#4f8a4a", turban: "#ffffff", turbanShade: "#e2ddd2" },
};
type Who = "kodhi" | "ganja" | "andha";

const S1 = 0;
const S2 = 100;
const S3 = 430;
const S4 = 970;
const S5 = 1160;
const S6 = 1910;
const S7 = 2360;
const END = 2760;

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
const rnd = (i: number) => {
  const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return v - Math.floor(v);
};

const Grade: React.FC<{ tint: string; k?: number; vig?: number; warm?: boolean }> = ({ tint, k = 0.35, vig = 0.35, warm = true }) => (
  <g>
    <defs>
      <radialGradient id={`tg${warm ? "w" : "c"}`} cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor={warm ? "#3a1a00" : "#0a1020"} stopOpacity={vig} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={VW} height={VH} fill={tint} style={{ mixBlendMode: "multiply" }} opacity={k} />
    <rect x={0} y={0} width={VW} height={VH} fill={`url(#tg${warm ? "w" : "c"})`} />
  </g>
);

/** Shadow of a passing cloud over a world (screen space), k 0..1 how much of the frame it covers. */
const CloudShadow: React.FC<{ k: number; t: number }> = ({ k, t }) =>
  k > 0.001 ? (
    <g style={{ mixBlendMode: "multiply" }}>
      <rect x={0} y={0} width={VW} height={VH} fill="#4a4a6a" opacity={0.45 * k} />
      <ellipse cx={VW * (1.3 - k * 0.8) + Math.sin(t) * 20} cy={VH * 0.55} rx={VW * 1.1} ry={VH * 0.5} fill="#2a2a44" opacity={0.25 * k} />
    </g>
  ) : null;

// ------------------------------------------------------------------ worlds
const G = 1560; // ground of the action plane
type Kind = "camel" | "cow" | "goat";

/** A herd of `n` animals spread on the valley slope (deterministic), drawn far -> near. */
const Herd: React.FC<{ kind: Kind; n: number; t: number; x0: number; x1: number; pop?: number }> = ({ kind, n, t, x0, x1, pop = 1 }) => {
  const items = Array.from({ length: Math.max(0, Math.floor(n)) }).map((_, i) => {
    const d = rnd(i * 3 + 1); // depth 0 far .. 1 near
    return { i, x: mix(x0, x1, rnd(i * 7 + 2)), y: mix(1080, 1420, d), s: mix(0.26, 0.55, d), flip: rnd(i * 5) > 0.5 };
  });
  items.sort((a, b) => a.y - b.y);
  return (
    <g>
      {items.map(({ i, x, y, s, flip }) => {
        // the newest animals pop in (growth montage)
        const age = Math.min(1, Math.max(0, (n - i) / 1.2)) * pop;
        const sc = s * (0.6 + 0.4 * easeBack(Math.min(1, age)));
        if (age <= 0.01) return null;
        return kind === "camel" ? (
          <Camel key={i} x={x} y={y} t={t + i} s={sc} flip={flip} saddle={false} />
        ) : kind === "cow" ? (
          <Cow key={i} x={x} y={y} t={t + i} s={sc} flip={flip} graze={i % 2} coat={i % 3 ? "white" : "brown"} />
        ) : (
          <Goat key={i} x={x} y={y} t={t + i} s={sc * 1.1} flip={flip} graze={i % 2} coat={(["white", "brown", "black"] as const)[i % 3]} />
        );
      })}
    </g>
  );
};

/** A man's valley: sky, hills, his herd, his house with a gated wall (gate at x 1100). */
const Valley: React.FC<{ cam: Cam; f: number; kind: Kind; n: number; gate?: number; shadow?: number; children?: React.ReactNode; front?: React.ReactNode; blur?: number; sky?: number; pop?: number; wall?: boolean }> = ({
  cam,
  f,
  kind,
  n,
  gate = 0,
  shadow = 0,
  children,
  front,
  blur = 0,
  sky,
  pop = 1,
  wall = true,
}) => {
  const t = f / 30;
  return (
    <>
      <L cam={cam} depth={0} blur={blur}>
        {sky === undefined ? <VillageSky mood="evening" sunX={1500} /> : <TimeSky time={sky} t={t} />}
      </L>
      <L cam={cam} depth={0.2} blur={blur}>
        <Birds t={t} x={300} y={620} n={5} />
      </L>
      <L cam={cam} depth={0.6} blur={blur}>
        <Hills mood="evening" />
        <Herd kind={kind} n={n} t={t} x0={-1000} x1={2900} pop={pop} />
      </L>
      <L cam={cam} depth={1} blur={blur}>
        <VillageTree x={-300} y={1500} s={1.1} kind="kikar" t={t} sway={Math.sin(t) * 1.5} />
        {wall && <MudHouse x={1500} y={G - 60} w={520} h={340} tone={kind === "camel" ? 0 : kind === "cow" ? 1 : 2} t={t} />}
        {wall && <CourtWall x0={600} x1={2300} y={G} h={220} gateX={1100} gateW={240} gate={gate} />}
        <DirtGround y={G} t={t} x0={-1500} x1={3500} depth={900} />
        {children}
      </L>
      <L cam={cam} depth={1.25} blur={blur}>
        {front}
      </L>
      <CloudShadow k={shadow} t={t} />
      <Grade tint="#ffe2b8" k={0.3} vig={0.3} />
    </>
  );
};

/** The poor village street (scene 2/3): dusty, grey-gold, people passing. */
const Street: React.FC<{ cam: Cam; f: number; children?: React.ReactNode; blur?: number }> = ({ cam, f, children, blur = 0 }) => {
  const t = f / 30;
  return (
    <>
      <L cam={cam} depth={0} blur={blur}>
        <VillageSky mood="day" sunX={300} />
      </L>
      <L cam={cam} depth={0.5} blur={blur + 1}>
        <FarHouses y={G - 260} t={t} x0={-900} n={12} />
      </L>
      <L cam={cam} depth={0.8} blur={blur}>
        <MudHouse x={-200} y={G - 80} w={520} h={340} tone={1} t={t} />
        <MudHouse x={1500} y={G - 80} w={560} h={360} tone={0} t={t} />
        <VillageTree x={700} y={G - 70} s={0.95} kind="neem" t={t} sway={Math.sin(t * 0.8) * 1.5} />
      </L>
      <L cam={cam} depth={1} blur={blur}>
        <DirtGround y={G - 40} t={t} />
        {children}
      </L>
      <g transform={`translate(${VW / 2} ${VH / 2}) scale(${cam.zoom * 0.3 + 0.7}) translate(${-VW / 2} ${-VH / 2})`}>
        <DustMotes t={t} x={0} y={0} w={VW} h={VH} n={30} o={0.45} />
      </g>
      <Grade tint="#e8d8c0" k={0.4} vig={0.4} />
    </>
  );
};

/** Front close-up over a blurred world; the body runs out of the frame. */
const Close: React.FC<{ f: number; a: number; b: number; bg: React.ReactNode; look: Partial<Look>; p: Partial<FrontPose>; push?: [number, number]; y?: number; fg?: React.ReactNode; light?: "l" | "r"; tint?: string }> = ({
  f,
  a,
  b,
  bg,
  look,
  p,
  push = [1.85, 2.0],
  y = 1540,
  fg,
  light = "r",
  tint = "#ffe2b8",
}) => {
  const k = kf(f, [[a, 0], [b, 1]], lin);
  const s = mix(push[0], push[1], k);
  return (
    <>
      {bg}
      <g transform={`translate(${VW / 2 + Math.sin(f / 40) * 10} ${y})`}>
        <MusafirFront x={0} y={0} s={s} look={look} pose={p} light={light} />
      </g>
      <Grade tint={tint} k={0.25} vig={0.3} />
      {fg}
    </>
  );
};

const streetBg = (f: number, x = 700) => <Street cam={{ x, y: G - 520, zoom: 1.5 }} f={f} blur={7} />;
const valleyBg = (f: number, kind: Kind, n = 40, shadow = 0) => <Valley cam={{ x: 1100, y: G - 560, zoom: 1.4 }} f={f} kind={kind} n={n} blur={6} shadow={shadow} />;
const KIND: Record<Who, Kind> = { kodhi: "camel", ganja: "cow", andha: "goat" };

/** A sepia memory of the man's own past: his old face, ripples, a heartbeat. */
const Memory: React.FC<{ f: number; who: Who; k: number }> = ({ f, who, k }) => (
  <>
    <g filter="url(#memory)">
      <Close f={f} a={0} b={1} bg={streetBg(f, 600)} look={POOR[who]} p={fp(f, { lookY: 0.4, brow: -0.6, mouth: "sad", tilt: 4, eyeOpen: who === "andha" ? 0.7 : 1 })} push={[2.05, 2.05]} />
    </g>
    <MemoryFx k={k} t={f / 30} w={VW} h={VH} />
  </>
);

/** Point of view walking (camera bob), used whenever the angel approaches. */
const pov = (l: number, a: number, b: number, x0: number, x1: number, y: number, z0: number, z1: number): Cam => {
  const k = kf(l, [[a, 0], [b, 1]], lin);
  return { x: mix(x0, x1, k) + Math.sin(l * 0.42) * 6, y: y + Math.abs(Math.sin(l * 0.21)) * 10, zoom: mix(z0, z1, k) };
};

// ------------------------------------------------------------------ scene 1: hook
const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S1;
  if (l < 40) {
    // three poor men in a row, all looking into the lens
    const z = kf(l, [[0, 1.0], [40, 1.06]]);
    return (
      <g>
        {streetBg(f, 700)}
        <g transform={`translate(${VW / 2} ${VH / 2}) scale(${z}) translate(${-VW / 2} ${-VH / 2})`}>
          {([["kodhi", 0], ["andha", 2], ["ganja", 1]] as [Who, number][]).map(([w, i]) => (
            <g key={w} transform={`translate(${VW * (0.18 + i * 0.32)} ${1230 + (i === 1 ? 60 : 0)})`}>
              <MusafirFront x={0} y={0} s={i === 1 ? 1.0 : 0.92} look={POOR[w]} pose={fp(f, { lookX: w === "andha" ? 0.3 : 0, brow: -0.4, mouth: "sad", tilt: (i - 1) * 3 }, i * 17)} light="r" />
            </g>
          ))}
        </g>
        <Grade tint="#e8d8c0" k={0.3} vig={0.45} />
      </g>
    );
  }
  if (l < 70) {
    // three valleys full of herds, whip-panned
    const which: Kind = l < 50 ? "camel" : l < 60 ? "cow" : "goat";
    const lk = (l - 40) % 10;
    const cam: Cam = { x: 900 + lk * 30, y: G - 600, zoom: 1.0 };
    return (
      <>
        <Valley cam={cam} f={f} kind={which} n={46} wall={false} />
        <WhipFx k={kf(lk, [[0, 0.8], [4, 0], [8, 0], [10, 0.8]], lin)} t={t} w={VW} h={VH} />
      </>
    );
  }
  // point of view: up to a closed gate; a knock
  const sh = shake(l, 82, 5, 6);
  const sh2 = shake(l, 90, 5, 6);
  const cam = pov(l, 70, 100, 1100, 1100, G - 380, 1.6, 2.1);
  return <Valley cam={{ ...cam, x: cam.x + sh.x + sh2.x, y: cam.y + sh.y + sh2.y }} f={f} kind="camel" n={30} gate={0} />;
};

// ------------------------------------------------------------------ scene 2: three sorrows
const Passer: React.FC<{ f: number; x: number; y: number; flip?: boolean; look: Partial<Look>; shy?: number; s?: number; seed?: number }> = ({ f, x, y, flip, look, shy = 0, s = 0.95, seed = 0 }) => (
  <Musafir x={x} y={y} flip={flip} scale={s} look={look} light="l" pose={pose(f, { walk: 1, step: x / 38, lean: -shy * 8, headTilt: -shy * 10, armF: [shy * 70, 30], look: -0.4 * shy, brow: -0.3 * shy }, seed)} />
);

const stick = (p: MusafirPose, look: Partial<Look>, flip: boolean, tap: number) => (
  <g transform={`rotate(${(flip ? 180 - 110 : 110) - foreAngle(p, "F", look) + tap * 6})`}>
    <rect x={-6} y={-6} width={240} height={12} rx={6} fill="#8a5a34" stroke="#3d2a1e" strokeWidth={3} />
  </g>
);

const Scene2: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S2;
  if (l < 90) {
    // establishing the poor street: the three men in three corners of life
    const cam: Cam = { x: kf(l, [[0, 300], [90, 900]]), y: G - 420, zoom: 1.15 };
    const bp = pose(f, { walk: 0.5, step: t * 3, look: 0.2, grip: true, headTilt: -8 }, 5);
    return (
      <Street cam={cam} f={f}>
        <Musafir x={60} y={G + 10} look={POOR.kodhi} light="l" pose={pose(f, { kneel: 1, lean: 14, headTilt: 18, brow: -0.6, mouth: "sad", armF: [30, 50] }, 1)} />
        <Musafir x={720} y={G + 20} flip look={POOR.ganja} light="l" pose={pose(f, { headTilt: 14, brow: -0.5, armF: [20, 30], look: -0.3 }, 2)} />
        <Musafir x={1260 - (l % 90) * 0.8} y={G + 30} flip look={POOR.andha} light="l" pose={bp} holdF={stick(bp, POOR.andha, true, Math.sin(t * 6))} />
      </Street>
    );
  }
  if (l < 160) {
    // beat (line 2): the leper sits; people swerve away from him
    const cam: Cam = { x: kf(l, [[90, 420], [160, 470]]), y: G - 300, zoom: 1.7 };
    const px = kf(l, [[90, 1100], [160, 150]], lin);
    const shy = Math.max(0, 1 - Math.abs(px - 420) / 260);
    return (
      <Street cam={cam} f={f}>
        <Musafir x={420} y={G + 10} look={POOR.kodhi} light="l" pose={pose(f, { kneel: 1, lean: 10, headTilt: mix(18, -4, shy), brow: -0.7, mouth: "sad", armF: [mix(30, 70, shy), 40], look: 0.6 }, 1)} />
        <Passer f={f} x={px} y={G + 70 + shy * 40} flip look={LOOKS.raahgir} shy={shy} seed={4} />
        <Passer f={f} x={px + 160} y={G + 80 + shy * 30} flip look={LOOKS.maa} shy={shy} s={0.88} seed={8} />
      </Street>
    );
  }
  if (l < 230) {
    // the bald man: eyes down, people avoid him (3/4 close-up)
    return <Close f={f} a={S2 + 160} b={S2 + 230} bg={streetBg(f, 900)} look={POOR.ganja} p={fp(f, { lookY: 0.7, lookX: -0.3, brow: -0.6, mouth: "sad", turn: -0.35, tilt: 5 }, 3)} light="l" tint="#e8d8c0" />;
  }
  if (l < 290) {
    // the blind man taps along; children's laughter: he turns his face to the sound
    const x = kf(l, [[230, 900], [290, 760]], lin);
    const turn = kf(l, [[262, 0], [276, 1]]);
    const p = pose(f, { walk: l < 262 ? 0.6 : 0, step: x / 30, look: 0.2, grip: true, headTilt: mix(-8, -16, turn), brow: mix(0, 0.4, turn) }, 5);
    const cam: Cam = { x: x - 60, y: G - 330, zoom: 1.8 };
    return (
      <Street cam={cam} f={f}>
        <Musafir x={x} y={G + 30} flip look={POOR.andha} light="l" pose={p} holdF={stick(p, POOR.andha, true, Math.sin(t * 6))} />
      </Street>
    );
  }
  // "...jo bas logon ko dekhna chahta tha": front close-up, clouded eyes, a longing smile
  return <Close f={f} a={S2 + 290} b={S3} bg={streetBg(f, 600)} look={POOR.andha} p={fp(f, { lookX: kf(l, [[290, -0.5], [330, 0.3]]), lookY: -0.2, brow: 0.3, mouth: l > 340 ? "smile" : "neutral", tilt: -6, turn: 0.25 }, 6)} light="l" tint="#e8d8c0" />;
};

// ------------------------------------------------------------------ scene 3: the first visit (POV), the gifts
const Healing: React.FC<{ f: number; who: Who; a: number; b: number; heal: number }> = ({ f, who, a, b, heal }) => {
  const t = f / 30;
  const look: Partial<Look> = who === "kodhi" ? { ...POOR.kodhi, patches: 1 - heal } : who === "ganja" ? { ...POOR.ganja, hair: heal } : { ...POOR.andha, blind: 1 - heal };
  const wonder = heal > 0.8;
  return (
    <Close
      f={f}
      a={a}
      b={b}
      bg={streetBg(f, who === "kodhi" ? 420 : who === "ganja" ? 900 : 700)}
      look={look}
      p={fp(f, { wide: wonder ? 0.8 : 0.2, brow: wonder ? 0.8 : 0.2, mouth: wonder ? "smile" : "open", lookY: who === "andha" && heal > 0.5 ? kf(f, [[a + 20, -0.4], [a + 40, 0]]) : -0.2, eyeOpen: who === "andha" ? (heal < 0.5 ? 0.6 : blink(f, 2)) : blink(f, 2) })}
      push={[1.85, 2.0]}
      fg={
        <>
          <HealGlow x={VW / 2} y={880} k={kf(f, [[a, 0], [a + 8, 1], [b - 6, 0.6], [b, 0]])} t={t} r={420} />
          <FlashFx k={kf(f, [[a + 16, 0], [a + 20, 0.5], [a + 28, 0]], lin)} w={VW} h={VH} color="#fff6d8" />
        </>
      }
    />
  );
};

const WithAnimal: React.FC<{ f: number; who: Who; a: number; b: number }> = ({ f, who, a, b }) => {
  const t = f / 30;
  const l = f - a;
  const ax = kf(f, [[a, 1300], [a + (b - a) * 0.7, 760]], Easing.out(Easing.quad));
  const walking = f < a + (b - a) * 0.7;
  const look = who === "kodhi" ? { ...POOR.kodhi, patches: 0 } : who === "ganja" ? { ...POOR.ganja, hair: 1 } : { ...POOR.andha, blind: 0 };
  const cam: Cam = { x: kf(f, [[a, 700], [b, 680]]), y: G - 330, zoom: kf(f, [[a, 1.6], [b, 1.75]]) };
  const reach = kf(f, [[a + (b - a) * 0.6, 0], [a + (b - a) * 0.85, 1]], easeBack);
  return (
    <Street cam={cam} f={f}>
      <Musafir x={520} y={G + 30} look={look} light="l" pose={pose(f, { lean: 6 + reach * 10, armF: [mix(20, 80, reach), 20], brow: 0.8, mouth: "smile", look: 0.6 }, 9)} />
      {who === "kodhi" ? (
        <Camel x={ax} y={G + 40} t={t} s={1.1} flip walk={walking ? 1 : 0} saddle={false} />
      ) : who === "ganja" ? (
        <Cow x={ax} y={G + 40} t={t} s={1.15} flip walk={walking ? 1 : 0} coat="brown" />
      ) : (
        <Goat x={ax - 60} y={G + 40 - Math.abs(Math.sin(l * 0.4)) * (walking ? 30 : 0)} t={t} s={1.3} flip walk={walking ? 1 : 0} coat="white" />
      )}
    </Street>
  );
};

const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S3;
  if (l < 40) {
    // point of view: walking up the street to the leper (the angel is never seen)
    const cam = pov(l, 0, 40, 200, 380, G - 360, 1.3, 1.8);
    return (
      <Street cam={cam} f={f}>
        <Musafir x={420} y={G + 10} look={POOR.kodhi} light="l" pose={pose(f, { kneel: 1, lean: 8, headTilt: kf(l, [[20, 18], [36, -6]]), brow: -0.4, armF: [30, 40], look: 0.8 }, 1)} />
      </Street>
    );
  }
  if (l < 100) return <Close f={f} a={S3 + 40} b={S3 + 100} bg={streetBg(f, 420)} look={POOR.kodhi} p={fp(f, { lookY: kf(l, [[40, 0.6], [56, 0]]), brow: 0.3, wide: 0.3, mouth: "neutral" }, 2)} light="l" />;
  if (l < 170) return <Close f={f} a={S3 + 100} b={S3 + 170} bg={streetBg(f, 900)} look={POOR.ganja} p={fp(f, { lookY: kf(l, [[100, 0.7], [116, 0]]), brow: 0.4, wide: 0.4, turn: 0.2 }, 3)} light="l" />;
  if (l < 260) {
    // the blind man turns his face toward the voice
    return <Close f={f} a={S3 + 170} b={S3 + 260} bg={streetBg(f, 700)} look={POOR.andha} p={fp(f, { lookX: kf(l, [[170, -0.6], [200, 0]]), turn: kf(l, [[170, -0.5], [200, 0]]), tilt: kf(l, [[170, 6], [200, -4]]), brow: 0.5, eyeOpen: 0.7 }, 6)} light="l" />;
  }
  // beat (line 2): the gifts, one by one, with healing light
  if (l < 305) return <Healing f={f} who="kodhi" a={S3 + 260} b={S3 + 305} heal={kf(l, [[264, 0], [290, 1]])} />;
  if (l < 340) return <WithAnimal f={f} who="kodhi" a={S3 + 305} b={S3 + 340} />;
  if (l < 385) return <Healing f={f} who="ganja" a={S3 + 340} b={S3 + 385} heal={kf(l, [[344, 0], [372, 1]])} />;
  if (l < 420) return <WithAnimal f={f} who="ganja" a={S3 + 385} b={S3 + 420} />;
  if (l < 470) return <Healing f={f} who="andha" a={S3 + 420} b={S3 + 470} heal={kf(l, [[424, 0], [452, 1]])} />;
  if (l < 505) return <WithAnimal f={f} who="andha" a={S3 + 470} b={S3 + 505} />;
  // "Allah tumhe isme barkat de": the three with their animals, warm light from above
  const cam: Cam = { x: 700, y: kf(l, [[505, G - 380], [540, G - 460]]), zoom: kf(l, [[505, 1.2], [540, 1.12]]) };
  return (
    <>
      <Street cam={cam} f={f}>
        <LightRays x={700} y={G - 1100} t={t} o={0.22} />
        <Musafir x={150} y={G + 20} look={{ ...POOR.kodhi, patches: 0 }} light="l" pose={pose(f, { brow: 0.7, mouth: "smile", armF: [40, 30] }, 1)} />
        <Camel x={-80} y={G + 40} t={t} s={0.9} saddle={false} />
        <Musafir x={700} y={G + 30} look={{ ...POOR.ganja, hair: 1 }} light="l" pose={pose(f, { brow: 0.7, mouth: "smile", armF: [40, 30] }, 2)} />
        <Cow x={900} y={G + 50} t={t} s={0.9} coat="brown" flip />
        <Musafir x={1250} y={G + 20} flip look={{ ...POOR.andha, blind: 0 }} light="l" pose={pose(f, { brow: 0.8, mouth: "smile", armF: [60, 20], headTilt: -8 }, 3)} />
        <Goat x={1420} y={G + 40} t={t} s={1.1} coat="white" flip />
      </Street>
      <HealGlow x={VW / 2} y={500} k={0.5} t={t} r={500} />
    </>
  );
};

// ------------------------------------------------------------------ scene 4: the blessing grows (time-lapse)
const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S4;
  const seg = l < 80 ? 0 : l < 135 ? 1 : 2;
  const kind: Kind = (["camel", "cow", "goat"] as Kind[])[seg];
  const a = [0, 80, 135][seg];
  const b = [80, 135, 190][seg];
  const n = kf(l, [[a, 1], [b - 6, 46]], Easing.in(Easing.quad));
  const days = ((l - a) * 0.12) % 3;
  const cam: Cam = { x: 900, y: kf(l, [[a, G - 420], [b, G - 640]]), zoom: kf(l, [[a, 1.4], [b, 1.0]]) };
  const whip = kf(l, [[b - 6, 0], [b, 1]], Easing.in(Easing.quad)) + kf(l, [[a, a === 0 ? 0 : 1], [a + 6, 0]], Easing.out(Easing.quad));
  return (
    <>
      <Valley cam={cam} f={f} kind={kind} n={n} sky={days} wall={false} />
      <WhipFx k={Math.min(1, whip)} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ scene 5: the test of the two
const Gate: React.FC<{ f: number; who: Who; a: number; b: number }> = ({ f, who, a, b }) => {
  // point of view: down the road to his gate, it opens, he stands there rich
  const l = f - a;
  const len = b - a;
  const gate = kf(l, [[len * 0.6, 0], [len * 0.85, 1]], easeBack);
  const cam = pov(l, 0, len, 1000, 1100, G - 380, 1.35, 1.9);
  return (
    <Valley cam={cam} f={f} kind={KIND[who]} n={44} gate={gate}>
      {gate > 0.2 && <Musafir x={1100} y={G - 6} look={RICH[who]} light="r" pose={pose(f, { lean: -4, headTilt: -6, look: 0.2, brow: -0.2, armF: [10, 10] }, 4)} />}
    </Valley>
  );
};

const Refuse: React.FC<{ f: number; who: Who; a: number; b: number; proud?: boolean }> = ({ f, who, a, b, proud }) => (
  <Close
    f={f}
    a={a}
    b={b}
    bg={valleyBg(f, KIND[who])}
    look={RICH[who]}
    p={fp(f, { brow: -0.5, mouth: proud ? "neutral" : "sad", tilt: proud ? -8 : Math.sin(f / 4) * 4, turn: kf(f, [[a, 0], [b, -0.5]]), lookX: kf(f, [[a, 0], [b, -0.7]]), lookY: proud ? -0.2 : 0 }, 5)}
    push={[1.9, 2.05]}
    light="r"
  />
);

const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S5;
  if (l < 100) return <Gate f={f} who="kodhi" a={S5} b={S5 + 100} />;
  if (l < 180) {
    // he looks at the poor traveller (the lens) with a frown
    return <Close f={f} a={S5 + 100} b={S5 + 180} bg={valleyBg(f, "camel")} look={RICH.kodhi} p={fp(f, { brow: -0.4, lookY: kf(l, [[100, -0.2], [130, 0.4], [160, 0]]), tilt: -5, mouth: "neutral" }, 7)} light="r" />;
  }
  if (l < 240) return <Memory f={f} who="kodhi" k={kf(l, [[180, 0], [186, 1], [234, 1], [240, 0]])} />;
  if (l < 330) return <Refuse f={f} who="kodhi" a={S5 + 240} b={S5 + 330} />;
  if (l < 430) {
    // beat (line 2): proud, he points at his herd: "inherited from my forefathers"
    const sweep = kf(l, [[352, 0], [372, 1]], easeBack);
    const cam: Cam = { x: kf(l, [[330, 1080], [430, 1020]]), y: G - 360, zoom: 1.7 };
    return (
      <Valley cam={cam} f={f} kind="camel" n={44} gate={1}>
        <Musafir x={1100} y={G - 6} flip look={RICH.kodhi} light="r" pose={pose(f, { lean: -6, headTilt: -10, armF: [mix(10, 120, sweep), 10], armB: [-20, 10], look: 0.6, brow: -0.2, mouth: "neutral" }, 4)} />
      </Valley>
    );
  }
  if (l < 470) return <Memory f={f} who="kodhi" k={kf(l, [[430, 0], [434, 1], [466, 1], [470, 0]])} />;
  if (l < 560) return <Refuse f={f} who="kodhi" a={S5 + 470} b={S5 + 560} proud />;
  // beat (line 3): the bald man says the same; memory; then the cloud passes over both valleys
  if (l < 620) return <Refuse f={f} who="ganja" a={S5 + 560} b={S5 + 620} />;
  if (l < 650) return <Memory f={f} who="ganja" k={kf(l, [[620, 0], [624, 1], [646, 1], [650, 0]])} />;
  const shadow = kf(l, [[660, 0], [700, 1]]);
  return (
    <g>
      <Valley cam={{ x: 900, y: G - 600, zoom: 1.05 }} f={f} kind={l < 705 ? "camel" : "cow"} n={44} shadow={shadow} />
      <g transform={`translate(${VW * 0.28} 1500)`}>
        <MusafirFront x={0} y={0} s={0.95} look={RICH.kodhi} pose={fp(f, { brow: -0.6, lookX: 0.5, mouth: "sad", turn: 0.3 }, 1)} light="r" />
      </g>
      <g transform={`translate(${VW * 0.72} 1520)`}>
        <MusafirFront x={0} y={0} s={0.95} look={RICH.ganja} pose={fp(f, { brow: -0.6, lookX: -0.5, mouth: "sad", turn: -0.3 }, 2)} light="l" />
      </g>
      <CloudShadow k={shadow} t={t} />
    </g>
  );
};

// ------------------------------------------------------------------ scene 6: the third gate
const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S6;
  if (l < 90) return <Gate f={f} who="andha" a={S6} b={S6 + 90} />;
  if (l < 150) {
    // his memory: darkness, his old stick, his old face
    const dark = kf(l, [[90, 0], [96, 1], [112, 1], [120, 0]]);
    return (
      <>
        <Memory f={f} who="andha" k={kf(l, [[110, 0], [118, 1], [146, 1], [150, 0]])} />
        <rect x={0} y={0} width={VW} height={VH} fill="#000" opacity={dark} />
      </>
    );
  }
  if (l < 270) {
    // beat (line 2): "main andha tha, Allah ne aankhen di…" eyes wet, warm
    return (
      <Close
        f={f}
        a={S6 + 150}
        b={S6 + 270}
        bg={valleyBg(f, "goat")}
        look={RICH.andha}
        p={fp(f, { brow: 0.6, mouth: l > 200 ? "smile" : "neutral", lookY: kf(l, [[150, 0.2], [180, 0]]), tilt: kf(l, [[150, 0], [220, -4]]), turn: 0.15 }, 6)}
        push={[1.85, 2.02]}
        light="r"
        fg={<HealGlow x={VW / 2} y={760} k={0.35} t={t} r={520} />}
      />
    );
  }
  if (l < 380) {
    // "jo chaho le lo": he steps aside and opens his arm to his flock
    const open = kf(l, [[282, 0], [304, 1]], easeBack);
    const cam: Cam = { x: kf(l, [[270, 1150], [380, 1060]]), y: G - 380, zoom: 1.55 };
    return (
      <Valley cam={cam} f={f} kind="goat" n={46} gate={1}>
        <Musafir x={mix(1100, 980, open)} y={G - 6} flip look={RICH.andha} light="r" pose={pose(f, { lean: 6, armF: [mix(10, 100, open), 20], armB: [mix(-10, 40, open), 20], brow: 0.7, mouth: "smile", look: 0.2 }, 3)} />
        {[0, 1, 2].map((i) => (
          <Goat key={i} x={kf(l, [[300 + i * 12, 1120], [380, 1300 + i * 60]], lin)} y={G + 10 + i * 20} t={t + i} s={1.1} walk={1} coat={(["white", "brown", "black"] as const)[i]} />
        ))}
      </Valley>
    );
  }
  return <Close f={f} a={S6 + 380} b={S7} bg={valleyBg(f, "goat")} look={RICH.andha} p={fp(f, { brow: 0.8, mouth: "smile", tilt: -3 }, 9)} push={[1.95, 2.1]} light="r" />;
};

// ------------------------------------------------------------------ scene 7: the answer + end card
const Scene7: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const l = f - S7;
  const leak = kf(l, [[0, 0.2], [120, 0.5], [400, 0.7]]);
  if (l < 120) {
    // his eyes, very close; he looks up at the voice; light grows
    return (
      <>
        <Close f={f} a={S7} b={S7 + 120} bg={valleyBg(f, "goat")} look={RICH.andha} p={fp(f, { lookY: kf(l, [[30, 0], [60, -0.6]]), brow: 0.7, wide: 0.4, mouth: "open" }, 4)} push={[3.2, 3.5]} y={2350} light="r" />
        <LightLeak k={leak} t={t} w={VW} h={VH} />
      </>
    );
  }
  // crane back: his valley in golden light; the far valleys under a cloud; end card from the beat
  const k = kf(l, [[120, 0], [260, 1]], ease);
  const cam: Cam = { x: mix(1100, 900, k), y: mix(G - 380, G - 700, k), zoom: mix(1.7, 0.95, k) };
  return (
    <>
      <Valley cam={cam} f={f} kind="goat" n={46} gate={1}>
        <Musafir x={1100} y={G - 6} look={RICH.andha} light="r" pose={pose(f, { brow: 0.8, mouth: "smile", armF: [20, 20], headTilt: -6 }, 4)} />
      </Valley>
      <LightRays x={VW * 0.7} y={-200} t={t} o={0.2} />
      <LightLeak k={leak} t={t} w={VW} h={VH} />
    </>
  );
};

// ------------------------------------------------------------------ sound (nominal frames); `until` stops a cue at its cut
type Cue = FilmVisuals["sfx"][number];
const s = (file: string, at: number, volume = 0.8, until?: number): Cue => ({ file: `sfx/${file}`, at, volume, until });
const SFX: FilmVisuals["sfx"] = [
  // 1 hook
  s("heartbeat.wav", S1, 0.35, S1 + 40),
  s("whoosh.wav", S1 + 40, 0.35),
  s("camel.wav", S1 + 42, 0.35, S1 + 50),
  s("cow.wav", S1 + 52, 0.35, S1 + 60),
  s("goat.wav", S1 + 62, 0.35, S1 + 70),
  ...[74, 80, 86].map((d) => s("steps-mud.wav", S1 + d, 0.2, S1 + d + 5)),
  s("knock.wav", S1 + 82, 0.8),
  s("knock.wav", S1 + 90, 0.8),
  // 2 three sorrows
  s("village-ambience.mp3", S2, 0.25, S3),
  ...[100, 130, 160].map((d) => s("step.wav", S2 + d, 0.2)),
  ...[236, 250, 264].map((d) => s("stick-tap.wav", S2 + d, 0.55)),
  s("children-play.wav", S2 + 255, 0.3, S3),
  ...[16, 46, 76].map((d) => s("stick-tap.wav", S2 + d, 0.35)),
  // 3 the visit, the gifts
  ...[0, 12, 24, 36].map((d) => s("step.wav", S3 + d, 0.25)),
  s("pad.wav", S3 + 40, 0.25, S3 + 260),
  s("shimmer.wav", S3 + 262, 0.45),
  s("camel.wav", S3 + 320, 0.45),
  s("shimmer.wav", S3 + 342, 0.45),
  s("cow.wav", S3 + 400, 0.45),
  s("shimmer.wav", S3 + 422, 0.45),
  s("goat.wav", S3 + 485, 0.5),
  s("chime.wav", S3 + 508, 0.4),
  // 4 growth
  s("flock.wav", S4, 0.3, S4 + 190),
  s("camel.wav", S4 + 40, 0.3),
  s("whoosh.wav", S4 + 76, 0.35),
  s("cow.wav", S4 + 100, 0.3),
  s("whoosh.wav", S4 + 131, 0.35),
  s("goat.wav", S4 + 160, 0.3),
  // 5 the test of the two
  ...[4, 18, 32, 46].map((d) => s("steps-mud.wav", S5 + d, 0.22, S5 + d + 6)),
  s("knock.wav", S5 + 52, 0.7),
  s("door.wav", S5 + 62, 0.45),
  s("camel.wav", S5 + 120, 0.2),
  s("heartbeat.wav", S5 + 180, 0.45, S5 + 240),
  s("whoosh.wav", S5 + 238, 0.3),
  s("heartbeat.wav", S5 + 430, 0.45, S5 + 470),
  s("heartbeat.wav", S5 + 620, 0.45, S5 + 650),
  s("desert-wind.mp3", S5 + 655, 0.35, S6),
  // 6 the third gate
  s("flock.wav", S6, 0.25, S6 + 90),
  ...[4, 18, 32].map((d) => s("steps-mud.wav", S6 + d, 0.22, S6 + d + 6)),
  s("knock.wav", S6 + 44, 0.7),
  s("door.wav", S6 + 56, 0.45),
  ...[98, 106, 114].map((d) => s("stick-tap.wav", S6 + d, 0.45)),
  s("pad.wav", S6 + 150, 0.3, S6 + 270),
  s("flock.wav", S6 + 270, 0.35, S6 + 380),
  s("goat.wav", S6 + 300, 0.4),
  // 7 the answer
  s("pad.wav", S7, 0.3),
  s("chime.wav", S7 + 60, 0.4),
  s("birds.wav", S7 + 130, 0.35),
  s("flock.wav", S7 + 140, 0.2),
  s("chime.wav", S7 + 270, 0.4),
];

// ------------------------------------------------------------------ overlays: hook, end card
const fade = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const up = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Overlay: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #3a1630", paintOrder: "stroke fill", textAlign: "center" as const };
  const hook = fade(f, S1 + 2, S1 + 8, S1 + 64, S1 + 72);
  const pop = interpolate(f, [S1 + 2, S1 + 10], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const end1 = up(f, S7 + 270, S7 + 284);
  const end2 = up(f, S7 + 296, S7 + 308);
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 220, opacity: hook }}>
        <div style={{ ...big, fontSize: 96, color: "#ffd88a", transform: `scale(${pop}) rotate(-3deg)`, lineHeight: 1.08, padding: "0 40px" }}>
          {tr(lang, { ur: "TEEN AADMI… EK SAWAAL", en: "3 MEN… 1 QUESTION" })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 240 }}>
        <div style={{ ...big, fontSize: 88, color: "#fff1c9", opacity: end1, lineHeight: 1.12, padding: "0 60px", transform: `scale(${0.9 + 0.1 * end1})` }}>
          {tr(lang, { ur: "Apna Kal Mat Bhoolo", en: "Never Forget Where You Came From" })}
        </div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 38, color: "#ffe6b0", opacity: end2, marginTop: 26, textShadow: "0 2px 8px #000" }}>Sahih al-Bukhari 3464</div>
      </AbsoluteFill>
    </>
  );
};

export const teenAadmiVisuals: FilmVisuals = {
  scenes: {
    "s1-hook": { nominal: [S1, S2], render: (f) => <Scene1 f={f} /> },
    "s2-teen-dukh": { nominal: [S2, S3], render: (f) => <Scene2 f={f} />, beats: [null, S2 + 90, S2 + 160, S2 + 230] },
    "s3-pehli-mulaqat": { nominal: [S3, S4], render: (f) => <Scene3 f={f} />, beats: [null, S3 + 260, S3 + 340, S3 + 420, S3 + 505] },
    "s4-barkat": { nominal: [S4, S5], render: (f) => <Scene4 f={f} /> },
    "s5-imtihaan": { nominal: [S5, S6], render: (f) => <Scene5 f={f} />, beats: [null, S5 + 330, S5 + 560] },
    "s6-teesra-darwaza": { nominal: [S6, S7], render: (f) => <Scene6 f={f} />, beats: [null, S6 + 150] },
    "s7-ant": { nominal: [S7, END], render: (f) => <Scene7 f={f} />, beats: [null, S7 + 270] },
  },
  ambience: { file: "sfx/breeze.wav", volume: 0.1 },
  sfx: SFX,
  overlay: (f, lang) => <Overlay f={f} lang={lang} />,
};
