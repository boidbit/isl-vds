// "Sone Se Bhara Matka" (Sahih al-Bukhari 3472): 9:16 Short, fast-paced.
// Nominal timeline at 30 fps; the player stretches each scene to its voice lines.

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { tr } from "../film/types";
import type { Lang } from "../film/schema";
import type { FilmVisuals, SceneCtx } from "../film/types";
import { blink, clamp01, easeBack, kf, layerTransform, mix, shake, VH, VW, type Cam } from "../kit";
import { GreenTree } from "../library/Closeups";
import {
  Birds,
  Bush,
  Charpai,
  ClayPots,
  FarmGround,
  Goat,
  Hills,
  LightRays,
  Matka,
  MudHouse,
  MudWall,
  SeatMat,
  Sparkle,
  Stone,
  VillageSky,
  type Mood,
} from "../library/Village";
import { BASE_POSE, LOOKS, Musafir, type MusafirPose } from "../Musafir";

const G = 1500; // ground line
const KH = LOOKS.kisan; // the buyer
const ML = LOOKS.malik; // the first owner
const BZ = LOOKS.buzurg; // the judge (only ever seen from behind)

const S1 = 0;
const S2 = 120;
const S3 = 240;
const S4 = 420;
const S5 = 600;
const S6 = 780;
const END = 1020;

// ------------------------------------------------------------------ layering helpers
const L: React.FC<{ cam: Cam; depth: number; blur?: number; children: React.ReactNode }> = ({ cam, depth, blur = 0, children }) => (
  <g transform={layerTransform(cam, depth, VW, VH)} filter={blur >= 0.5 ? `url(#blur${Math.min(10, Math.round(blur))})` : undefined}>
    {children}
  </g>
);

/** Full-frame close-up layer (screen coordinates) with push-in and shake. */
const Shot: React.FC<{ zoom?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ zoom = 1, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${VW / 2 + dx} ${VH / 2 + dy}) scale(${zoom}) translate(${-VW / 2} ${-VH / 2})`}>{children}</g>
);

const pose = (f: number, p: Partial<MusafirPose>, seed = 0): MusafirPose => ({ ...BASE_POSE, time: f / 30, eyeOpen: blink(f, seed), ...p });

/** Village world, every outdoor shot is a camera onto this. */
const Village: React.FC<{ cam: Cam; mood: Mood; t: number; door?: number; children?: React.ReactNode; front?: React.ReactNode }> = ({ cam, mood, t, door = 0, children, front }) => (
  <>
    <L cam={cam} depth={0}>
      <VillageSky mood={mood} sunX={mood === "evening" ? 1700 : 900} />
    </L>
    <L cam={cam} depth={0.15}>
      <Birds t={t} x={200} y={500} n={5} />
    </L>
    <L cam={cam} depth={0.3} blur={1}>
      <Hills mood={mood} />
    </L>
    <L cam={cam} depth={0.6}>
      <MudHouse x={-300} y={1260} w={420} h={280} tone={2} />
      <MudHouse x={2300} y={1250} w={460} h={300} tone={1} />
      <GreenTree x={2900} y={1260} s={0.9} sway={Math.sin(t) * 1.5} />
    </L>
    <L cam={cam} depth={1}>
      <FarmGround mood={mood} y={G} />
      {/* village lane */}
      <MudWall x={-700} y={G} w={520} />
      <MudHouse x={150} y={G} w={520} h={360} tone={0} />
      <GreenTree x={620} y={G - 30} s={0.95} sway={Math.sin(t * 0.8) * 1.5} />
      <MudHouse x={1500} y={G} w={600} h={390} tone={1} door={door} />
      <MudWall x={1800} y={G} w={600} />
      <ClayPots x={1880} y={G + 10} />
      <Charpai x={520} y={G + 40} />
      <Goat x={1000} y={G + 70} t={t} s={0.95} />
      {/* courtyard of the elder */}
      <MudWall x={2850} y={G} w={900} h={190} />
      <GreenTree x={3250} y={G - 10} s={1.35} sway={Math.sin(t * 0.7) * 1.2} />
      <SeatMat x={3150} y={G + 30} />
      <Bush x={3900} y={G + 30} s={1.1} />
      {children}
    </L>
    <L cam={cam} depth={1.3}>
      <Stone x={300} y={G + 330} s={1.4} />
      <Bush x={1300} y={G + 360} s={1.3} />
      <Stone x={2600} y={G + 330} s={1.2} />
      <Bush x={3500} y={G + 360} s={1.4} />
      {front}
    </L>
  </>
);

/** Open field (scene 1-2). */
const Field: React.FC<{ cam: Cam; t: number; children?: React.ReactNode }> = ({ cam, t, children }) => (
  <>
    <L cam={cam} depth={0}>
      <VillageSky mood="morning" sunX={300} />
    </L>
    <L cam={cam} depth={0.15}>
      <Birds t={t} x={0} y={700} n={3} />
    </L>
    <L cam={cam} depth={0.3} blur={1}>
      <Hills mood="morning" />
    </L>
    <L cam={cam} depth={0.55}>
      <MudHouse x={1100} y={1230} w={380} h={250} tone={2} />
      <GreenTree x={200} y={1240} s={0.8} />
    </L>
    <L cam={cam} depth={1}>
      <FarmGround mood="morning" y={G} />
      <Bush x={150} y={G + 40} />
      <Stone x={1000} y={G + 60} s={1.1} />
      <Stone x={880} y={G + 90} s={0.7} />
      {children}
    </L>
    <L cam={cam} depth={1.3}>
      <Bush x={-50} y={G + 380} s={1.5} />
      <Stone x={1250} y={G + 400} s={1.6} />
    </L>
  </>
);

// ------------------------------------------------------------------ scene 1: hook
// Rule: every shot shows the character. Objects are framed together with him.
const DIG_X = 790; // where the hoe lands

/** Dirt burst, spark and "TAK!" where the hoe hits (world coordinates). */
const Impact: React.FC<{ k: number; t: number }> = ({ k, t }) =>
  k <= 0 || k >= 1 ? null : (
    <g>
      <ellipse cx={DIG_X} cy={G + 6} rx={60 + 160 * k} ry={14 + 26 * k} fill="#e0c7a0" opacity={(1 - k) * 0.7} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i - 5) * 0.26;
        const d = k * (80 + (i % 4) * 40);
        return <ellipse key={i} cx={DIG_X + Math.cos(a) * d} cy={G - 4 + Math.sin(a) * d + k * k * 120} rx={9 + (i % 3) * 4} ry={7} fill="#8a5a34" stroke="#3d2a1e" strokeWidth={2.5} opacity={1 - k * 0.6} />;
      })}
      <g opacity={Math.max(0, 1 - k * 2.4)}>
        <Sparkle x={DIG_X} y={G - 6} s={2.2} a={t * 200} />
      </g>
      <text x={DIG_X - 260} y={G - 250} fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={110} fill="#fff" stroke="#1d120a" strokeWidth={9} paintOrder="stroke" opacity={k < 0.75 ? 1 : 0} transform={`rotate(-8 ${DIG_X - 260} ${G - 250})`}>
        TAK!
      </text>
    </g>
  );

const HIT = S1 + 22;

const Scene1: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  if (f < S1 + 40) {
    // medium shot: he raises the hoe (anticipation) and brings it down hard
    const up = kf(f, [[S1, 0], [S1 + 12, 1]], Easing.out(Easing.cubic));
    const down = kf(f, [[S1 + 12, 0], [HIT, 1]], Easing.in(Easing.cubic));
    const shoulder = mix(mix(110, 178, up), 38, down);
    const sh = shake(f, HIT, 18, 12);
    const cam: Cam = { x: 680 + sh.x, y: G - 240 + sh.y, zoom: kf(f, [[S1, 1.9], [S1 + 40, 2.1]]) };
    return (
      <Field cam={cam} t={t}>
        <Musafir
          x={560}
          y={G + 12}
          look={KH}
          pose={pose(f, { hold: "hoe", lean: mix(mix(4, -6, up), 30, down), headTilt: mix(0, 16, down), armF: [shoulder, mix(25, 6, down)], armB: [shoulder - 14, mix(30, 10, down)], brow: -0.2, mouth: "neutral", look: 1 })}
        />
        <Impact k={(f - HIT) / 18} t={t} />
      </Field>
    );
  }
  if (f < S1 + 64) {
    // close-up: his face freezes, eyes on the ground, hands still on the hoe
    const freeze = clamp01((f - (S1 + 40)) / 8);
    const cam: Cam = { x: 650, y: G - 320, zoom: kf(f, [[S1 + 40, 3.0], [S1 + 64, 3.3]]) };
    return (
      <Field cam={cam} t={t}>
        <Musafir
          x={560}
          y={G + 12}
          look={KH}
          pose={pose(f, { hold: "hoe", lean: 30 - freeze * 8, headTilt: 16, armF: [38, 6], armB: [24, 10], eyeOpen: 1, brow: freeze, mouth: freeze > 0.5 ? "open" : "neutral", look: 1 })}
        />
      </Field>
    );
  }
  // he kneels and brushes the soil away: the lid of a buried pot appears
  const reveal = kf(f, [[S1 + 70, 0], [S2 - 8, 1]]);
  const swipe = Math.sin(t * 14);
  const cam: Cam = { x: kf(f, [[S1 + 64, 700], [S2, 720]]), y: G - 210, zoom: kf(f, [[S1 + 64, 2.0], [S2, 2.3]]) };
  return (
    <Field cam={cam} t={t}>
      <ellipse cx={DIG_X} cy={G + 14} rx={135} ry={36} fill="#5e3a1e" stroke="#3d2a1e" strokeWidth={4} />
      <ellipse cx={DIG_X} cy={G + 12} rx={66} ry={18} fill="#a45530" stroke="#3d2a1e" strokeWidth={4} opacity={reveal} />
      <ellipse cx={DIG_X} cy={G + 8} rx={18} ry={7} fill="#8e4523" opacity={reveal} />
      {Array.from({ length: 9 }, (_, i) => {
        const push = reveal * (60 + (i % 3) * 30);
        const side = i % 2 ? 1 : -1;
        return <ellipse key={i} cx={DIG_X + (i - 4) * 18 + side * push} cy={G + 10 - (i % 3) * 4} rx={20} ry={11} fill={i % 2 ? "#8a5a34" : "#9c6a40"} stroke="#3d2a1e" strokeWidth={2.5} opacity={1 - reveal * 0.7} />;
      })}
      <Musafir
        x={600}
        y={G + 12}
        look={KH}
        pose={pose(f, { kneel: 1, lean: 34, headTilt: 22, armF: [42 + swipe * 14, 12], armB: [30 - swipe * 14, 16], eyeOpen: 1, brow: 0.6 + reveal * 0.4, mouth: "open", look: 1 })}
      />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={DIG_X - 60 + ((t * 140 + i * 50) % 160)} cy={G - 30 - ((t * 80 + i * 30) % 70)} r={7} fill="#c9a07a" opacity={0.6} />
      ))}
    </Field>
  );
};

// ------------------------------------------------------------------ scene 2: the pot opens
const Scene2: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  if (f < S2 + 45) {
    // pulls the pot out of the hole, then brushes the dust off
    const lift = kf(f, [[S2, 0], [S2 + 22, 1]], easeBack);
    const brush = clamp01(kf(f, [[S2 + 22, 0], [S2 + 42, 1]]));
    const swipe = Math.sin(t * 16) * 30 * (brush > 0 && brush < 1 ? 1 : 0);
    const cam: Cam = { x: kf(f, [[S2, 620], [S2 + 45, 640]]), y: G - 230, zoom: kf(f, [[S2, 1.9], [S2 + 45, 2.15]]) };
    const potY = G + 10 - lift * 10 + (1 - lift) * 140;
    return (
      <Field cam={cam} t={t}>
        {/* hole behind the pot */}
        <ellipse cx={760} cy={G + 16} rx={130} ry={34} fill="#5e3a1e" />
        <g clipPath="url(#aboveHole)">
          <defs>
            <clipPath id="aboveHole">
              <rect x={0} y={0} width={4000} height={G + 18} />
            </clipPath>
          </defs>
          <Matka x={760} y={potY} s={0.9} dirt={1 - brush * 0.85} t={t} />
        </g>
        <path d={`M 630 ${G + 16} Q 760 ${G + 60} 890 ${G + 16}`} fill="#8a5a34" stroke="#3d2a1e" strokeWidth={4} />
        <Musafir
          x={560}
          y={G + 12}
          look={KH}
          pose={pose(f, {
            kneel: 1,
            lean: 30 - lift * 10,
            headTilt: 18,
            brow: 0.6,
            mouth: "open",
            look: 1,
            armF: [mix(30, 70, lift) + swipe * 0.4, 20],
            armB: [mix(20, 55, lift), 25],
          })}
        />
        {brush > 0.1 && brush < 1 && [0, 1, 2, 3].map((i) => <circle key={i} cx={830 + i * 20 + ((t * 120 + i * 30) % 80)} cy={G - 120 - ((t * 90 + i * 40) % 90)} r={8} fill="#c9a07a" opacity={0.6} />)}
      </Field>
    );
  }
  if (f < S2 + 80) {
    // he lifts the lid: gold light pours up onto him
    const open = kf(f, [[S2 + 45, 0], [S2 + 62, 1]], Easing.out(Easing.cubic));
    const cam: Cam = { x: 700, y: G - 250, zoom: kf(f, [[S2 + 45, 2.2], [S2 + 80, 2.6]]) };
    return (
      <Field cam={cam} t={t}>
        <g transform={`rotate(180 760 ${G - 120})`}>
          <LightRays x={760} y={G - 120} t={t} o={0.28 * open} />
        </g>
        <Matka x={760} y={G + 10} s={0.9} lid={open} glow={open} t={t} />
        <Musafir x={560} y={G + 12} look={KH} pose={pose(f, { kneel: 1, lean: 22, headTilt: 14, armF: [mix(70, 95, open), mix(20, 0, open)], armB: [50, 30], eyeOpen: 1, brow: open, mouth: "open", look: 1 })} />
        <rect x={350} y={G - 600} width={600} height={700} fill="#ffcf3a" opacity={0.16 * open} />
        {[0, 1, 2, 3].map((i) => (
          <Sparkle key={i} x={700 + i * 40} y={G - 170 - ((t * 60 + i * 25) % 90)} s={(0.6 + Math.sin(t * 9 + i) * 0.4) * open} a={t * 150} />
        ))}
      </Field>
    );
  }
  // face lit by gold: dramatic push-in
  const cam: Cam = { x: 600, y: G - 380, zoom: kf(f, [[S2 + 80, 3.2], [S3, 4.0]]) };
  return (
    <Field cam={cam} t={t}>
      <Musafir x={560} y={G + 12} look={KH} pose={pose(f, { kneel: 1, lean: 10, headTilt: 6, eyeOpen: 1, brow: 1, mouth: "open", look: 1, armF: [60, 30], armB: [50, 30] })} />
      <Matka x={760} y={G + 10} s={0.9} glow={1} t={t} />
      <rect x={300} y={G - 700} width={700} height={800} fill="#ffcf3a" opacity={0.18} />
      {[0, 1, 2].map((i) => (
        <Sparkle key={i} x={720 + i * 50} y={G - 250 - i * 30} s={0.8 + Math.sin(t * 8 + i) * 0.4} a={t * 120} />
      ))}
    </Field>
  );
};

// ------------------------------------------------------------------ scene 3: to the first owner
const carry = (f: number, x: number, walking: boolean, extra: Partial<MusafirPose> = {}) => (
  <>
    <Musafir
      x={x}
      y={G + 12}
      look={KH}
      pose={pose(f, { walk: walking ? 1 : 0, step: (x / 110) * Math.PI, lean: 6, armF: [72, 46], armB: [64, 46], brow: 0.3, look: 1, ...extra })}
    />
    <Matka x={x + 92} y={G - 160 - (walking ? Math.abs(Math.sin((x / 110) * Math.PI)) * 6 : 0)} s={0.62} t={f / 30} />
  </>
);

const Scene3: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  if (f < S3 + 60) {
    const x = kf(f, [[S3, -80], [S3 + 60, 1080]], (v) => v);
    const cam: Cam = { x: x + 180, y: G - 250, zoom: 1.4 };
    return <Village cam={cam} mood="day" t={t}>{carry(f, x, true)}</Village>;
  }
  const door = kf(f, [[S3 + 80, 0], [S3 + 98, 1]], easeBack);
  const malikX = kf(f, [[S3 + 92, 1500], [S3 + 110, 1350]]);
  const knock = f > S3 + 62 && f < S3 + 78 ? Math.abs(Math.sin((f - S3) * 0.8)) * 30 : 0;
  if (f < S3 + 110) {
    const cam: Cam = { x: 1280, y: G - 220, zoom: kf(f, [[S3 + 60, 1.55], [S3 + 110, 1.7]]) };
    return (
      <Village cam={cam} mood="day" t={t} door={door}>
        {f > S3 + 90 && <Musafir x={malikX} y={G + 12} flip look={ML} pose={pose(f, { look: 1, brow: 0.2, armF: [10, 20] }, 9)} />}
        {carry(f, 1080, false, knock ? { armF: [100 + knock, 80] } : {})}
      </Village>
    );
  }
  // over-the-shoulder: his back in the foreground, the owner sharp in frame
  const offer = kf(f, [[S3 + 110, 0], [S3 + 135, 1]], easeBack);
  const ots = f < S3 + 145;
  const cam: Cam = ots ? { x: 1210, y: G - 260, zoom: kf(f, [[S3 + 110, 2.3], [S3 + 145, 2.45]]) } : { x: 1215, y: G - 210, zoom: kf(f, [[S3 + 145, 1.75], [S4, 1.85]]) };
  return (
    <Village cam={cam} mood="day" t={t} door={1}>
      <Musafir x={1350} y={G + 12} flip look={ML} pose={pose(f, { look: 1, brow: 0.2, eyeOpen: blink(f, 9) })} />
      <Matka x={1080 + mix(92, 150, offer)} y={G - mix(160, 230, offer)} s={0.62} t={t} />
      <Musafir
        x={1080}
        y={G + 12}
        look={KH}
        back={ots}
        pose={pose(f, { armF: [mix(72, 88, offer), mix(46, 8, offer)], armB: [mix(64, 80, offer), mix(46, 10, offer)], brow: 0.4, look: 1, talk: ctx.talk("kharidar") })}
      />
    </Village>
  );
};

// ------------------------------------------------------------------ scene 4: the owner refuses
const Scene4: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  const shakeHead = Math.sin(t * 7) * 5 * (ctx.speaking("malik") ? 1 : 0.3);
  const malik = (extra: Partial<MusafirPose> = {}) => (
    <Musafir
      x={1350}
      y={G + 12}
      flip
      look={ML}
      pose={pose(f, { armF: [-38, 30], armB: [-30, 30], headTilt: 4 + shakeHead, brow: 0.5, mouth: "smile", look: 1, talk: ctx.talk("malik"), ...extra }, 9)}
    />
  );
  const buyer = (extra: Partial<MusafirPose> = {}) => (
    <>
      <Matka x={1080 + 150} y={G - 230} s={0.62} t={t} />
      <Musafir x={1080} y={G + 12} look={KH} pose={pose(f, { armF: [88, 8], armB: [80, 10], look: 1, ...extra })} />
    </>
  );
  if (f < S4 + 70) {
    const cam: Cam = { x: 1350, y: G - 320, zoom: kf(f, [[S4, 3.0], [S4 + 70, 3.3]]) };
    return (
      <Village cam={cam} mood="day" t={t} door={1}>
        {buyer()}
        {malik()}
      </Village>
    );
  }
  if (f < S4 + 120) {
    const cam: Cam = { x: 1090, y: G - 320, zoom: kf(f, [[S4 + 70, 3.0], [S4 + 120, 3.4]]) };
    return (
      <Village cam={cam} mood="day" t={t} door={1}>
        {malik()}
        {buyer({ eyeOpen: 1, brow: 1, mouth: "open", headTilt: -6 })}
      </Village>
    );
  }
  const cam: Cam = { x: 1215, y: G - 210, zoom: kf(f, [[S4 + 120, 1.8], [S5, 1.95]]) };
  return (
    <Village cam={cam} mood="day" t={t} door={1}>
      {buyer({ brow: 0.8, mouth: "open" })}
      {malik({ armF: [80, 0], armB: [-30, 30] })}
    </Village>
  );
};

// ------------------------------------------------------------------ scene 5: nobody wants the gold
const Scene5: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  if (f < S5 + 90) {
    // circular move: strong parallax sweep + push-in around the two of them
    const k = kf(f, [[S5, 0], [S5 + 90, 1]]);
    const cam: Cam = { x: 1215 + Math.sin(k * Math.PI) * 120 - 60 + k * 60, y: G - 220, zoom: mix(1.7, 2.1, k), rot: Math.sin(k * Math.PI) * 2 };
    const push = Math.sin(t * 3.2);
    const potX = 1215 + push * 45;
    return (
      <Village cam={cam} mood="day" t={t} door={1}>
        <Matka x={potX} y={G + 10} s={0.62} t={t} />
        <Musafir x={1080} y={G + 12} look={KH} pose={pose(f, { armF: [push > 0 ? 70 : 30, 10], lean: push > 0 ? 12 : 4, brow: -0.2, mouth: "open", look: 1 })} />
        <Musafir x={1350} y={G + 12} flip look={ML} pose={pose(f, { armF: [push < 0 ? 70 : 30, 10], lean: push < 0 ? 12 : 4, brow: -0.2, mouth: "open", look: 1 }, 9)} />
      </Village>
    );
  }
  // they bring it to the elder: low angle, light from above
  const walkK = kf(f, [[S5 + 90, 0], [S6 - 20, 1]]);
  const xa = mix(3700, 3470, walkK);
  const xb = mix(3860, 3620, walkK);
  const walking = walkK < 1 ? 1 : 0;
  const cam: Cam = { x: 3380, y: G - 170, zoom: kf(f, [[S5 + 90, 1.45], [S6, 1.6]]) };
  return (
    <Village cam={cam} mood="day" t={t}>
      <Musafir x={3150} y={G + 30} look={BZ} back pose={pose(f, { kneel: 1, lean: 4, armF: [30, 40], armB: [20, 40] })} />
      <Matka x={xa - 92 + 0} y={G - 160} s={0.62} t={t} />
      <Musafir x={xa} y={G + 12} flip look={KH} pose={pose(f, { walk: walking, step: (xa / 110) * Math.PI, armF: [72, 46], armB: [64, 46], look: 1, brow: 0.2 })} />
      <Musafir x={xb} y={G + 12} flip look={ML} pose={pose(f, { walk: walking, step: (xb / 110) * Math.PI + 1, look: 1, brow: 0.2 }, 9)} />
      <LightRays x={3250} y={G - 1300} t={t} o={0.16} />
    </Village>
  );
};

// ------------------------------------------------------------------ scene 6: the judgement
const Scene6: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  const elderTalk = ctx.speaking("buzurg");
  const gesture = elderTalk ? 60 + Math.sin(t * 5) * 12 : 25;
  const nodK = ctx.speaking("kharidar") ? Math.abs(Math.sin(t * 8)) * 10 : 0;
  const nodM = ctx.speaking("malik") ? Math.abs(Math.sin(t * 8)) * 10 : 0;
  const happy = f > S6 + 70;
  const people = (
    <>
      <Musafir x={3150} y={G + 30} look={BZ} back pose={pose(f, { kneel: 1, lean: 6, armF: [gesture, 30], armB: [20, 40] })} />
      <Matka x={3330} y={G + 20} s={0.62} glow={happy ? 0.6 : 0.2} t={t} />
      <Musafir x={3470} y={G + 12} flip look={KH} pose={pose(f, { headTilt: nodK, brow: happy ? 0.8 : 0.2, mouth: happy ? "smile" : "neutral", look: 1, talk: ctx.talk("kharidar") })} />
      <Musafir x={3620} y={G + 12} flip look={ML} pose={pose(f, { headTilt: nodM, brow: happy ? 0.8 : 0.2, mouth: happy ? "smile" : "neutral", look: 1, talk: ctx.talk("malik") }, 9)} />
    </>
  );
  if (f < S6 + 70) {
    const cam: Cam = { x: 3260, y: G - 190, zoom: kf(f, [[S6, 2.2], [S6 + 70, 2.4]]) };
    return (
      <Village cam={cam} mood="evening" t={t}>
        {people}
        <LightRays x={3250} y={G - 1300} t={t} o={0.2} />
      </Village>
    );
  }
  if (f < S6 + 120) {
    const cam: Cam = { x: 3545, y: G - 280, zoom: kf(f, [[S6 + 70, 2.4], [S6 + 120, 2.6]]) };
    return (
      <Village cam={cam} mood="evening" t={t}>
        {people}
      </Village>
    );
  }
  // slow pull-back to the whole village at sunset
  const k = kf(f, [[S6 + 120, 0], [END - 20, 1]]);
  const cam: Cam = { x: mix(3380, 3330, k), y: mix(G - 190, G - 470, k), zoom: mix(1.7, 0.95, k) };
  return (
    <Village cam={cam} mood="evening" t={t}>
      {people}
      <LightRays x={3250} y={G - 1300} t={t} o={0.18} />
    </Village>
  );
};

// ------------------------------------------------------------------ sound (nominal frames)
const s = (file: string, at: number, volume = 0.8) => ({ file: `sfx/${file}`, at, volume });
const SFX: FilmVisuals["sfx"] = [
  s("whoosh.wav", S1 + 6, 0.5),
  s("dig.wav", S1 + 16, 0.9),
  s("tak.wav", S1 + 16, 0.9),
  s("impact.wav", S1 + 16, 0.8),
  s("whoosh.wav", S1 + 33, 0.45),
  s("riser.wav", S1 + 45, 0.55),
  s("dig.wav", S1 + 70, 0.4),
  s("dig.wav", S1 + 86, 0.4),
  s("whoosh.wav", S2 - 2, 0.45),
  s("dig.wav", S2 + 10, 0.5),
  s("lid.wav", S2 + 47, 0.8),
  s("shimmer.wav", S2 + 58, 0.75),
  s("impact.wav", S2 + 80, 0.5),
  s("whoosh.wav", S3 - 2, 0.45),
  ...[0, 15, 30, 45].map((d) => s("step.wav", S3 + 4 + d, 0.35)),
  s("birds.wav", S3 + 10, 0.4),
  s("knock.wav", S3 + 64, 0.8),
  s("door.wav", S3 + 80, 0.6),
  s("whoosh.wav", S3 + 109, 0.35),
  s("whoosh.wav", S4 - 2, 0.35),
  s("whoosh.wav", S4 + 69, 0.35),
  s("impact.wav", S5 + 2, 0.45),
  s("whoosh.wav", S5 + 89, 0.45),
  s("birds.wav", S5 + 100, 0.35),
  s("pad.wav", S6 + 10, 0.55),
  s("shimmer.wav", S6 + 72, 0.4),
  s("chime.wav", END - 90, 0.6),
];

// ------------------------------------------------------------------ hook + end text
const Overlay: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const hook = interpolate(f, [S1 + 62, S1 + 70, S2 - 6, S2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hookPop = interpolate(f, [S1 + 62, S1 + 70], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const end1 = interpolate(f, [END - 110, END - 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const end2 = interpolate(f, [END - 80, END - 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #1d120a", paintOrder: "stroke fill", textAlign: "center" as const };
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 260, opacity: hook }}>
        <div style={{ ...big, fontSize: 96, color: "#ffd34d", transform: `scale(${hookPop}) rotate(-3deg)`, lineHeight: 1.1, padding: "0 40px" }}>{tr(lang, { ur: "Zameen ke andar KHAZANA?!", en: "TREASURE under the ground?!" })}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230 }}>
        <div style={{ ...big, fontSize: 70, color: "#ffe9b0", opacity: end1, lineHeight: 1.15, padding: "0 50px" }}>{tr(lang, { ur: "Imaandari ka sabse khoobsurat waqia", en: "The most beautiful story of honesty" })}</div>
        <div style={{ ...big, fontSize: 52, color: "#ffffff", opacity: end2, marginTop: 30, lineHeight: 1.2, padding: "0 60px", WebkitTextStroke: "8px #1d120a" }}>
          {tr(lang, { ur: "Apne liye nahi… sach ke liye jeena seekho.", en: "Live not for yourself… but for the truth." })}
        </div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 34, color: "#fff6e0", opacity: end2, marginTop: 24, textShadow: "0 2px 6px #000" }}>
          Sahih al-Bukhari 3472 · Sahih Muslim 1721
        </div>
      </AbsoluteFill>
    </>
  );
};

export const soneKaMatkaVisuals: FilmVisuals = {
  scenes: {
    "s1-khazana": { nominal: [S1, S2], render: (f, ctx) => <Scene1 f={f} ctx={ctx} /> },
    "s2-matka-khulta-hai": { nominal: [S2, S3], render: (f, ctx) => <Scene2 f={f} ctx={ctx} /> },
    "s3-imaandari": { nominal: [S3, S4], render: (f, ctx) => <Scene3 f={f} ctx={ctx} /> },
    "s4-pehla-malik": { nominal: [S4, S5], render: (f, ctx) => <Scene4 f={f} ctx={ctx} /> },
    "s5-twist": { nominal: [S5, S6], render: (f, ctx) => <Scene5 f={f} ctx={ctx} /> },
    "s6-faisla": { nominal: [S6, END], render: (f, ctx) => <Scene6 f={f} ctx={ctx} /> },
  },
  ambience: { file: "sfx/village-ambience.mp3", volume: 0.35 },
  sfx: SFX,
  overlay: (f, lang) => <Overlay f={f} lang={lang} />,
};
