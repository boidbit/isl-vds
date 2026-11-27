// "Baadal Aur Baagh Ka Raaz" (Sahih Muslim 2984a): 9:16 Short, ~60 s. Nominal timeline at 30 fps.
// Look: "bright gouache storybook": thick warm outline, hot sun-bleached plain (ochre/sand) → cool grey rain →
// deep green dappled garden, gold at the end. New front close-ups (FrontBust) for every emotional peak.
// Islamic rules: the voice in the cloud is never given a face, figure or voice acting; only soft rings and the
// narrator. No Prophet or Companion is shown.

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { tr } from "../film/types";
import type { Lang } from "../film/schema";
import type { FilmVisuals, SceneCtx } from "../film/types";
import { blink, clamp01, easeBack, kf, layerTransform, mix, VH, VW, type Cam } from "../kit";
import { FrontBust, type BustPose } from "../FrontBust";
import { Butterfly, GrassTufts, HarvestBasket, OrchardTree, RainCloud, SoilBeds, WaterChannel } from "../library/Garden";
import { DryLeaf, DustMotes, PalmShadow, PerchedBird } from "../library/Courtyard";
import { Chatai } from "../library/Interior";
import { MountainSky, Peaks, Rain, RainSplashes, RockyGround } from "../library/Mountain";
import { Birds, LightRays, Sparkle } from "../library/Village";
import { BASE_POSE, LOOKS, Musafir, type MusafirPose } from "../Musafir";

const G = 1500; // ground line
const MU = LOOKS["musafir-baadal"];
const MA = LOOKS["baagh-malik"];

const S1 = 0;
const S2 = 120;
const S3 = 390;
const S4 = 630;
const S5 = 900;
const S6 = 1110;
const S7 = 1410;
const END = 1800;

// ------------------------------------------------------------------ helpers
const L: React.FC<{ cam: Cam; depth: number; blur?: number; children: React.ReactNode }> = ({ cam, depth, blur = 0, children }) => (
  <g transform={layerTransform(cam, depth, VW, VH)} filter={blur >= 0.5 ? `url(#blur${Math.min(10, Math.round(blur))})` : undefined}>
    {children}
  </g>
);

const pose = (f: number, p: Partial<MusafirPose>, seed = 0): MusafirPose => ({ ...BASE_POSE, time: f / 30, eyeOpen: blink(f, seed), ...p });
const bust = (f: number, p: Partial<BustPose>, seed = 0): Partial<BustPose> => ({ eyeOpen: blink(f, seed), ...p });

/** Screen-space colour grade + vignette. */
const Grade: React.FC<{ tint: string; k?: number; vig?: number; warm?: boolean }> = ({ tint, k = 0.4, vig = 0.45, warm }) => (
  <g>
    <defs>
      <radialGradient id="bvig" cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor={warm ? "#3a1a00" : "#0a1020"} stopOpacity={vig} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={VW} height={VH} fill={tint} style={{ mixBlendMode: "multiply" }} opacity={k} />
    <rect x={0} y={0} width={VW} height={VH} fill="url(#bvig)" />
  </g>
);

/** Hot stony plain under a big sky. `rain` 0..1 greys the light; cloud passed as `cloud`. */
const Plain: React.FC<{ cam: Cam; t: number; rain?: number; wind?: number; cloud?: React.ReactNode; children?: React.ReactNode; front?: React.ReactNode; shadowX?: number }> = ({
  cam,
  t,
  rain = 0,
  wind = 10,
  cloud,
  children,
  front,
  shadowX,
}) => (
  <>
    <L cam={cam} depth={0}>
      <MountainSky mood="clear" t={t} sunX={1500} w={4400} h={2600} />
      <rect x={-2000} y={-1000} width={8000} height={5000} fill="#6c7890" opacity={rain * 0.45} />
    </L>
    <L cam={cam} depth={0.12}>
      <Birds t={t} x={-200} y={420} n={2} />
    </L>
    <L cam={cam} depth={0.25} blur={1}>
      <Peaks mood="clear" y={1560} />
    </L>
    <L cam={cam} depth={0.4}>{cloud}</L>
    <L cam={cam} depth={1}>
      <RockyGround mood="clear" y={G} wet={rain} />
      {/* bleached plain tint + scattered stones */}
      <path d={`M -2000 ${G} L 5000 ${G} L 5000 ${G + 1800} L -2000 ${G + 1800} Z`} fill="#e9c88a" opacity={0.35 * (1 - rain)} />
      {Array.from({ length: 26 }, (_, i) => {
        const sx = -900 + ((i * 263) % 4800);
        const sy = G + 30 + ((i * 97) % 520);
        const r = 18 + (i % 4) * 10;
        return (
          <g key={i}>
            <ellipse cx={sx} cy={sy} rx={r * 1.4} ry={r * 0.8} fill={i % 2 ? "#a99a86" : "#bcae98"} stroke="#3d2a1e" strokeWidth={3} />
            <ellipse cx={sx - r * 0.3} cy={sy - r * 0.3} rx={r * 0.5} ry={r * 0.2} fill="#ffffff" opacity={0.35 + rain * 0.3} />
          </g>
        );
      })}
      {shadowX !== undefined && <ellipse cx={shadowX} cy={G + 220} rx={900} ry={160} fill="#2a2a40" opacity={0.18} />}
      <GrassTufts x0={-900} x1={3800} y={G + 10} t={t} n={22} wind={wind} dry={1} spread={500} />
      <DustMotes t={t} x={-200} y={G - 500} w={2400} h={600} n={20} o={0.5 * (1 - rain)} />
      {children}
    </L>
    <L cam={cam} depth={1.35}>
      <GrassTufts x0={-600} x1={3000} y={G + 640} t={t + 1} n={8} wind={wind * 1.2} dry={1} s={1.8} spread={80} />
      {front}
    </L>
    {rain > 0.01 && <Rain t={t} w={VW} h={VH} n={Math.round(140 * rain)} o={0.45 * rain} wind={0.12} />}
    <Grade tint={rain > 0.3 ? "#b4bfd4" : "#ffe2b0"} k={0.25 + rain * 0.2} />
  </>
);

/** The garden: orchard rows, soil beds, channel entering from the left. */
const Garden: React.FC<{ cam: Cam; t: number; flow?: number; drip?: number; children?: React.ReactNode; front?: React.ReactNode; edge?: boolean }> = ({ cam, t, flow = 1, drip = 0, children, front, edge = true }) => (
  <>
    <L cam={cam} depth={0}>
      <MountainSky mood="clear" t={t} sunX={2200} w={4400} h={2600} />
    </L>
    <L cam={cam} depth={0.12}>
      <Birds t={t} x={200} y={360} n={4} />
    </L>
    <L cam={cam} depth={0.3} blur={2}>
      <Peaks mood="clear" y={1500} />
      {[300, 900, 1500, 2100, 2700, 3300].map((x, i) => (
        <OrchardTree key={i} x={x} y={G - 120} s={0.6} t={t} kind={i % 2 ? "lemon" : "pomegranate"} seed={i} sway={Math.sin(t + i) * 1.2} />
      ))}
    </L>
    <L cam={cam} depth={0.6}>
      <rect x={-2000} y={G - 140} width={8000} height={600} fill="#7d9a4a" />
      {[0, 640, 1280, 1920, 2560, 3200].map((x, i) => (
        <OrchardTree key={i} x={x} y={G - 60} s={0.85} t={t} kind={i % 2 ? "pomegranate" : "fig"} seed={i + 9} sway={Math.sin(t * 0.9 + i) * 1.5} drip={drip} />
      ))}
    </L>
    <L cam={cam} depth={1}>
      <SoilBeds x0={-1600} x1={4600} y={G} t={t} rows={4} wet={0.7} />
      {edge && (
        // stony edge of the plain on the left, garden wall of packed earth
        <g>
          <path d={`M -1600 ${G - 10} L 250 ${G - 10} Q 300 ${G + 300} 200 ${G + 1800} L -1600 ${G + 1800} Z`} fill="#c2a47a" stroke="#3d2a1e" strokeWidth={4} />
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx={-1400 + i * 170} cy={G + 60 + ((i * 83) % 400)} rx={34} ry={18} fill="#a99a86" stroke="#3d2a1e" strokeWidth={3} />
          ))}
          <GrassTufts x0={-1500} x1={200} y={G + 20} t={t} n={10} wind={6} spread={400} />
        </g>
      )}
      <WaterChannel d={`M -1700 ${G + 300} Q 0 ${G + 250} 800 ${G + 262} Q 1500 ${G + 272} 2400 ${G + 250} Q 3400 ${G + 228} 4400 ${G + 240}`} t={t} w={64} flow={flow} speed={1.2} />
      {/* side branch the owner opens with his spade */}
      <WaterChannel d={`M 1480 ${G + 272} Q 1560 ${G + 400} 1780 ${G + 520} Q 2000 ${G + 640} 2300 ${G + 700}`} t={t} w={44} flow={clamp01((flow - 0.8) * 5)} />
      <PalmShadow x={900} y={G + 420} t={t} s={1.2} o={0.16} />
      <PalmShadow x={2400} y={G + 460} t={t + 2} s={1.3} o={0.16} skew={10} />
      {children}
    </L>
    <L cam={cam} depth={1.3}>
      {front}
    </L>
    <LightRays x={VW * 0.7} y={-200} t={t} o={0.14} />
    <Grade tint="#fff0c8" k={0.25} warm />
  </>
);

// ------------------------------------------------------------------ scene 1: the stop + the hook
const Scene1: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const STOP = 18;
  if (f < 46) {
    // low-angle medium: the traveller's step stops mid-stride, his head jerks up to the cloud
    const walk = 1 - clamp01((f - STOP + 4) / 8);
    const x = kf(f, [[0, 760], [STOP, 900]], (v) => v);
    const up = kf(f, [[STOP + 4, 0], [STOP + 12, 1]], easeBack);
    const cam: Cam = { x: 900 + Math.sin(t * 2) * 6, y: G - 520, zoom: kf(f, [[0, 1.25], [46, 1.35]]), rot: -2 };
    return (
      <Plain
        cam={cam}
        t={t}
        cloud={<RainCloud x={1100} y={420} s={1.1} t={t} dark={0.25} pulse={f > STOP ? 0.6 : 0} />}
        shadowX={1000}
      >
        <Musafir x={x} y={G + 20} look={MU} pose={pose(f, { walk, step: x / 34, lean: mix(6, -10, up), headTilt: -26 * up, look: 1, brow: up, eyeOpen: up > 0.2 ? 1 : blink(f), mouth: up > 0.5 ? "open" : "neutral", armF: [mix(20, 10, up), mix(10, 30, up)], armB: [-10, 8] })} />
        {f > STOP && f < STOP + 20 && [0, 1, 2].map((i) => <circle key={i} cx={x + 20 + i * 24} cy={G + 10 - (f - STOP) * 2} r={14 + (f - STOP) * 1.6} fill="#e2cfa8" opacity={0.6 * (1 - (f - STOP) / 20)} />)}
      </Plain>
    );
  }
  // hard cut: front close-up, eyes wide, looks up at the cloud then straight into the lens
  const k = f - 46;
  const toLens = kf(f, [[66, 0], [80, 1]]);
  const cam: Cam = { x: VW / 2, y: VH / 2, zoom: 1 + k * 0.0012 };
  const pop = kf(f, [[46, 0.94], [54, 1]], easeBack);
  return (
    <>
      <L cam={cam} depth={0}>
        <MountainSky mood="clear" t={t} sunX={900} w={VW * 2} h={VH * 2} />
      </L>
      <L cam={cam} depth={0.3} blur={2}>
        <RainCloud x={540} y={300} s={0.95} t={t} dark={0.3} pulse={0.8} />
        <Birds t={t + 3} x={0} y={640} n={2} />
      </L>
      <L cam={cam} depth={1}>
        <g transform={`translate(${VW / 2} ${VH}) scale(${pop}) translate(${-VW / 2} ${-VH})`}>
          <FrontBust
            x={VW / 2}
            y={VH + 80}
            s={1.75}
            t={t}
            look={MU}
            shade={0.6}
            pose={bust(f, { wide: 1, brow: 0.6, mouth: "open", lookY: mix(-1, 0, toLens), lookX: 0, nod: mix(-0.8, 0, toLens), tilt: Math.sin(t * 1.5) * 1.5 })}
          />
        </g>
      </L>
      <L cam={cam} depth={1.2}>
        <DustMotes t={t} x={0} y={600} w={VW} h={900} n={14} o={0.5} />
      </L>
      <Grade tint="#ffe2b0" k={0.18} />
    </>
  );
};

// ------------------------------------------------------------------ scene 2: the voice
const Scene2: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const VOICE = S2 + 120; // "…falan shakhs ke baagh ko paani do"
  const pulse = clamp01((f - VOICE + 10) / 10) * (1 - clamp01((f - VOICE - 110) / 20));
  if (f < S2 + 100) {
    // over-the-shoulder POV: the traveller from behind, low, the cloud drifts from the top to the centre
    const k = (f - S2) / 100;
    const cy = kf(f, [[S2, 160], [S2 + 100, 520]]);
    const cam: Cam = { x: 1000, y: kf(f, [[S2, G - 900], [S2 + 100, G - 760]]), zoom: 0.9 + k * 0.05 };
    return (
      <Plain cam={cam} t={t} wind={14} cloud={<RainCloud x={1050} y={cy} s={1.3} t={t} dark={0.35 + k * 0.1} />}>
        <Musafir x={700} y={G + 250} scale={1.5} back look={MU} pose={pose(f, { headTilt: -18 })} />
      </Plain>
    );
  }
  if (f < S2 + 190) {
    // side medium: cloth flutters, grass bends, the cloud shadow slides over him; the voice rings
    const cam: Cam = { x: kf(f, [[S2 + 100, 940], [S2 + 190, 1020]]), y: G - 600, zoom: 1.45 };
    const shadowX = kf(f, [[S2 + 100, 400], [S2 + 190, 1300]]);
    return (
      <Plain cam={cam} t={t} wind={16} shadowX={shadowX} cloud={<RainCloud x={1200} y={460} s={1.2} t={t} dark={0.45} pulse={pulse} />}>
        <Musafir x={900} y={G + 20} look={MU} pose={pose(f, { headTilt: -24, look: 1, brow: 0.8, mouth: f > VOICE ? "open" : "neutral", armF: [24, 40], armB: [-10, 12], lean: -6 })} />
        {pulse > 0.1 && [0, 1, 2].map((i) => <Sparkle key={i} x={1200 + (i - 1) * 260} y={420 + i * 40} s={1 + i * 0.3 + Math.sin(t * 6 + i) * 0.3} a={t * 120 + i * 30} />)}
      </Plain>
    );
  }
  // front close-up, slow push-in: wonder, the cloud's light on his face
  const k = (f - S2 - 190) / 80;
  const cam: Cam = { x: VW / 2, y: VH / 2 + 60 - k * 60, zoom: 1.02 + k * 0.1 };
  return (
    <>
      <L cam={cam} depth={0}>
        <MountainSky mood="clear" t={t} sunX={200} w={VW * 2} h={VH * 2} />
      </L>
      <L cam={cam} depth={0.3} blur={2}>
        <RainCloud x={620} y={360} s={0.9} t={t} dark={0.5} pulse={pulse} />
      </L>
      <L cam={cam} depth={1}>
        <FrontBust x={VW / 2} y={VH + 80} s={1.7} t={t} look={MU} shade={0.45} wind={1.4} pose={bust(f, { wide: 0.6, brow: 0.8, mouth: "neutral", lookY: -0.8, lookX: 0.3, nod: -0.5, tilt: -3 + Math.sin(t) * 1.5 }, 3)} />
      </L>
      <L cam={cam} depth={1.3}>
        <GrassTufts x0={-100} x1={1200} y={VH - 60} t={t} n={8} wind={14} s={2.2} spread={60} />
      </L>
      <Grade tint="#e8dcc8" k={0.25} />
    </>
  );
};

// ------------------------------------------------------------------ scene 3: the rain finds one channel
const CH = `M -400 ${G + 520} Q 300 ${G + 380} 900 ${G + 420} Q 1500 ${G + 470} 2000 ${G + 360} Q 2600 ${G + 240} 3400 ${G + 300}`;
const Scene3: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const rainK = kf(f, [[S3 + 10, 0], [S3 + 50, 1]]);
  if (f < S3 + 80) {
    // wide: the cloud slides aside and opens over the stony ground; the traveller watches from the left
    const cx = kf(f, [[S3, 1000], [S3 + 80, 1700]]);
    const cam: Cam = { x: kf(f, [[S3, 1100], [S3 + 80, 1300]]), y: G - 700, zoom: 0.7 };
    return (
      <Plain cam={cam} t={t} rain={rainK * 0.5} wind={8} cloud={<RainCloud x={cx} y={520} s={1.5} t={t} dark={0.6} rain={rainK} rainTo={1500} />}>
        <WaterChannel d={CH} t={t} flow={rainK * 0.15} />
        {rainK > 0.3 && <RainSplashes t={t} x0={cx - 600} x1={cx + 700} y={G + 40} n={40} spread={500} />}
        <Musafir x={520} y={G + 60} look={MU} pose={pose(f, { headTilt: -18, look: 1, brow: 0.6, armF: [16, 30], lean: -4 })} />
      </Plain>
    );
  }
  if (f < S3 + 150) {
    // tilt down to ground level: rivulets between the stones join the channel; the traveller in the back
    const k = (f - S3 - 80) / 70;
    const cam: Cam = { x: 1300 + k * 120, y: kf(f, [[S3 + 80, G - 300], [S3 + 110, G + 160]]), zoom: 1.6 };
    const runs = [0, 1, 2].map((i) => { const x = 760 + i * 330; return `M ${x} ${G + 110 + (i % 2) * 30} C ${x + 90} ${G + 170}, ${x - 70} ${G + 230}, ${x + 30} ${G + 290} S ${x + 60} ${G + 380}, ${x + 110 - i * 40} ${G + 430}`; });
    return (
      <Plain cam={cam} t={t} rain={0.7} wind={4} cloud={<RainCloud x={1500} y={300} s={1.4} t={t} dark={0.65} rain={1} rainTo={1700} />}>
        <Musafir x={1450} y={G + 30} scale={0.8} look={MU} pose={pose(f, { headTilt: 10, look: 0.6, brow: 0.6, mouth: "open" })} />
        {runs.map((d, i) => (
          <WaterChannel key={i} d={d} t={t} w={12} edge={6} flow={clamp01(k * 1.6 - i * 0.2)} speed={2} bank="#a08a70" bed="#6a5a48" />
        ))}
        <WaterChannel d={CH} t={t} flow={0.2 + k * 0.4} speed={1.5} />
        <RainSplashes t={t} x0={900} x1={1800} y={G + 160} n={30} spread={320} />
      </Plain>
    );
  }
  // ground-level track with the water: a dry leaf rides it, the traveller walks along, following
  const k = (f - S3 - 150) / 90;
  const camX = kf(f, [[S3 + 150, 1400], [S3 + 240, 2200]], (v) => v);
  const cam: Cam = { x: camX, y: G + 120, zoom: 1.35 };
  const leafX = mix(1250, 2500, k);
  const leafY = G + 470 - (leafX - 900) * 0.11 + Math.sin(t * 5) * 6;
  const walkX = mix(1350, 2050, k);
  return (
    <Plain cam={cam} t={t} rain={0.4} wind={6} cloud={<RainCloud x={2600} y={260} s={1.3} t={t} dark={0.55} rain={0.6} rainTo={1700} />}>
      <WaterChannel d={CH} t={t} flow={1} speed={2} />
      <DryLeaf x={leafX} y={leafY} rot={Math.sin(t * 3) * 25} s={1.4} tone={1} />
      <RainSplashes t={t} x0={camX - 600} x1={camX + 600} y={G + 100} n={20} spread={300} />
      <Musafir x={walkX} y={G + 60} look={MU} pose={pose(f, { walk: 1, step: walkX / 30, lean: 10, headTilt: 14, look: 0.8, brow: 0.4, armF: [20, 16], armB: [-16, 10] })} />
    </Plain>
  );
};

// ------------------------------------------------------------------ scene 4: to the garden
const MALIK_X = 1640;
const hoeSwing = (f: number) => {
  // one strike every 36 frames: lift (anticipation) → chop → pull the earth
  const ph = ((f % 36) + 36) % 36;
  const up = kf(ph, [[0, 0], [12, 1]]);
  const down = kf(ph, [[12, 0], [17, 1]], Easing.in(Easing.quad));
  const back = kf(ph, [[22, 0], [34, 1]]);
  const a = mix(mix(mix(30, 120, up), 20, down), 30, back);
  return { a, lean: mix(mix(10, -4, up), 26, down) - back * 14, hit: ph === 17 };
};
const Malik: React.FC<{ f: number; x?: number; flip?: boolean; dig?: boolean; extra?: Partial<MusafirPose> }> = ({ f, x = MALIK_X, flip = true, dig = true, extra = {} }) => {
  const h = hoeSwing(f);
  return (
    <Musafir
      x={x}
      y={G + 140}
      flip={flip}
      look={MA}
      pose={pose(f, dig ? { hold: "hoe", lean: h.lean, headTilt: 14, armF: [h.a, 6], armB: [h.a - 14, 10], look: 1, ...extra } : { hold: "hoe", armF: [20, 30], armB: [-8, 10], ...extra }, 21)}
    />
  );
};

const Scene4: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  if (f < S4 + 55) {
    // low-angle tracking beside his feet: quick steps along the channel, stone → green
    const x = kf(f, [[S4, 700], [S4 + 55, 1150]], (v) => v);
    const cam: Cam = { x: x + 60, y: G - 300, zoom: 1.6, rot: -1.5 };
    return (
      <Plain cam={cam} t={t} rain={0.15} wind={8} front={<GrassTufts x0={x - 500} x1={x + 600} y={G + 260} t={t} n={6} s={1.6} spread={60} dry={0} />}>
        <WaterChannel d={`M -400 ${G + 160} Q 800 ${G + 100} 2000 ${G + 140}`} t={t} w={60} speed={2} />
        <Musafir x={x} y={G + 40} look={MU} pose={pose(f, { walk: 1, step: x / 26, lean: 14, headTilt: 4, look: 1, brow: 0.3, mouth: "neutral", armF: [34, 20], armB: [-30, 16] })} />
      </Plain>
    );
  }
  if (f < S4 + 190) {
    // pull back to wide: the garden opens up; the owner turns the water with his spade
    const k = kf(f, [[S4 + 55, 0], [S4 + 170, 1]]);
    const cam: Cam = { x: mix(400, 1100, k), y: mix(G - 200, G - 520, k), zoom: mix(1.4, 0.82, k) };
    const mx = kf(f, [[S4 + 55, -300], [S4 + 170, 380]], (v) => v);
    return (
      <Garden cam={cam} t={t} flow={1} front={<OrchardTree x={-500} y={G + 900} s={1.6} t={t} sway={Math.sin(t) * 2} seed={4} />}>
        <PerchedBird x={260} y={G - 6} t={t} s={1.1} />
        <Malik f={f} />
        <Musafir x={mx} y={G + 260} look={MU} pose={pose(f, { walk: k < 0.95 ? 1 : 0, step: mx / 28, lean: 6, headTilt: 0, look: 1, brow: 0.5 })} />
      </Garden>
    );
  }
  // medium on the spade: chop, the earth wall opens, water turns into the side channel
  const cam: Cam = { x: MALIK_X - 40, y: G - 180, zoom: 1.7 };
  return (
    <Garden cam={cam} t={t} flow={1} edge={false} front={<Butterfly x={1300} y={G - 520} t={t} s={1.1} path={160} />}>
      <PerchedBird x={1300} y={G + 40} t={t + 1} s={1.2} flip />
      <Malik f={f} />
      {/* spray of wet earth on each hit */}
      {[0, 1, 2, 3].map((i) => {
        const ph = ((f % 36) + 36) % 36;
        const k = clamp01((ph - 17) / 12);
        return k > 0 && k < 1 ? <circle key={i} cx={MALIK_X - 300 - i * 30 - k * 60} cy={G + 150 - Math.sin(k * Math.PI) * (60 + i * 20)} r={9 - i} fill="#5a4330" /> : null;
      })}
    </Garden>
  );
};

// ------------------------------------------------------------------ scene 5: the same name
const Scene5: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  const talk = ctx.talk("narrator");
  const ANSWER = S5 + 75;
  if (f < S5 + 110) {
    // eye-level two-shot by the channel bend: he asks, the owner pauses the spade and answers
    const cam: Cam = { x: kf(f, [[S5, 1250], [S5 + 110, 1300]]), y: G - 300, zoom: 1.45 };
    const ask = f < ANSWER;
    return (
      <Garden cam={cam} t={t} edge={false} front={<Butterfly x={1050} y={G - 560} t={t} s={1.2} path={200} seed={2} />}>
        <Musafir x={1000} y={G + 140} look={MU} pose={pose(f, { headTilt: 4, look: 1, brow: ask ? 0.3 : 0.6, armF: ask ? [50, 50] : [14, 20], talk: ask ? talk : 0, mouth: "neutral" })} />
        <Malik f={f} x={1560} dig={false} extra={{ lean: ask ? -4 : 2, headTilt: ask ? -6 : 4, brow: ask ? 0.5 : 0.2, talk: ask ? 0 : talk, look: 1 }} />
      </Garden>
    );
  }
  // front close-up: the name lands, his eyes open wide, straight into the lens; dapple light; world hushes
  const k = (f - S5 - 110) / 100;
  const cam: Cam = { x: VW / 2, y: VH / 2, zoom: kf(f, [[S5 + 110, 1.0], [S5 + 118, 1.12]], easeBack) + k * 0.04 };
  return (
    <>
      <L cam={cam} depth={0}>
        <rect x={-500} y={-500} width={VW + 1000} height={VH + 1000} fill="#9cc06a" />
      </L>
      <L cam={cam} depth={0.3} blur={3}>
        {[100, 700].map((x, i) => (
          <OrchardTree key={i} x={x} y={1300} s={1.1} t={t} seed={i + 3} sway={Math.sin(t + i) * 2} />
        ))}
      </L>
      <L cam={cam} depth={1}>
        <FrontBust x={VW / 2} y={VH + 80} s={1.8} t={t} look={MU} dapple={1} wind={0.5} pose={bust(f, { wide: 1, brow: 1, mouth: "open", lookX: 0, lookY: 0, tilt: Math.sin(t * 2) * 1 }, 5)} />
      </L>
      {[0, 1, 2, 3].map((i) => (
        <Sparkle key={i} x={200 + i * 230} y={500 + (i % 2) * 120} s={1.1 + Math.sin(t * 5 + i) * 0.4} a={t * 120 + i * 40} />
      ))}
      <Grade tint="#fff0c8" k={0.2} warm />
    </>
  );
};

// ------------------------------------------------------------------ scene 6: the question and the answer
const Scene6: React.FC<{ f: number; ctx: SceneCtx }> = ({ f, ctx }) => {
  const t = f / 30;
  const talk = ctx.talk("narrator");
  if (f < S6 + 100) {
    // over the traveller's shoulder: the owner asks why; leaf shadows slide, drops fall from the leaves
    const cam: Cam = { x: kf(f, [[S6, 1300], [S6 + 100, 1340]]), y: G - 330, zoom: 1.7 };
    return (
      <Garden cam={cam} t={t} drip={1} edge={false} front={<Musafir x={1060} y={G + 420} scale={1.5} back look={MU} pose={pose(f, { headTilt: 2 })} />}>
        <Malik f={f} x={1560} dig={false} extra={{ lean: 4, headTilt: 2, brow: 0.6, talk, armB: [30, 60], look: 1 }} />
      </Garden>
    );
  }
  const MALIK_BG = (blurK: number) => (
    <>
      <L cam={{ x: VW / 2, y: VH / 2, zoom: 1 }} depth={0}>
        <rect x={-500} y={-500} width={VW + 1000} height={VH + 1000} fill="#8fb862" />
      </L>
      <L cam={{ x: VW / 2, y: VH / 2, zoom: 1 }} depth={0.3} blur={blurK}>
        {[150, 950].map((x, i) => (
          <OrchardTree key={i} x={x} y={1350} s={1.2} t={t} seed={i + 11} drip={1} sway={Math.sin(t + i) * 2} />
        ))}
      </L>
    </>
  );
  if (f < S6 + 200) {
    // the traveller tells him about the cloud: front close-up, earnest, talking; leaves drip behind him
    const k = (f - S6 - 100) / 100;
    const cam: Cam = { x: VW / 2, y: VH / 2, zoom: 1.02 + k * 0.06 };
    return (
      <>
        {MALIK_BG(3)}
        <L cam={cam} depth={1}>
          <FrontBust x={VW / 2} y={VH + 80} s={1.75} t={t} look={MU} dapple={0.8} wind={0.6} pose={bust(f, { wide: 0.2, brow: -0.3, talk, lookX: 0.5, turn: 0.35, tilt: Math.sin(t * 1.2) * 2 }, 7)} />
        </L>
        <Grade tint="#fff0c8" k={0.2} warm />
      </>
    );
  }
  // the owner hears it: surprise first, then calm; a short look into the lens before he answers
  const k = (f - S6 - 200) / 100;
  const calm = kf(f, [[S6 + 235, 0], [S6 + 260, 1]]);
  const toLens = kf(f, [[S6 + 255, 0], [S6 + 268, 1]]);
  const cam: Cam = { x: VW / 2, y: VH / 2 - k * 40, zoom: 1.04 + k * 0.1 };
  return (
    <>
      {MALIK_BG(4)}
      <L cam={cam} depth={1}>
        <FrontBust x={VW / 2} y={VH + 80} s={1.75} t={t} look={MA} dapple={1} wind={0.4} pose={bust(f, { wide: mix(0.9, 0, calm), brow: mix(0.9, 0.2, calm), mouth: calm < 0.5 ? "open" : "neutral", smile: calm * 0.7, lookX: mix(-0.6, 0, toLens), turn: mix(-0.4, 0, toLens), tilt: Math.sin(t * 0.8) * 2, nod: Math.sin(t * 1.4) * 0.15 }, 9)} />
      </L>
      <L cam={cam} depth={1.3}>
        <LightRays x={VW * 0.8} y={-100} t={t} o={0.16} />
      </L>
      <Grade tint="#ffe8c0" k={0.22} warm />
    </>
  );
};

// ------------------------------------------------------------------ scene 7: the three thirds + end card
const B1 = S7 + 85; // sadaqa
const B2 = S7 + 140; // family
const B3 = S7 + 195; // back into the garden
const B4 = S7 + 260; // "as much as for his home… as much in charity": baskets 1 + 2 together
const ENDLINE = S7 + 330;
const Scene7: React.FC<{ f: number; ctx: SceneCtx }> = ({ f }) => {
  const t = f / 30;
  const which = f < B2 ? 0 : f < B3 ? 1 : f < B4 ? 2 : 1;
  const focus = (i: number, at: number, next: number) => clamp01((f - at) / 10) * (1 - clamp01((f - next) / 10));
  const both = focus(0, B4, ENDLINE);
  const g = [Math.max(focus(0, B1, B2), both), Math.max(focus(1, B2, B3), both), focus(2, B3, B4)];
  const bx = [700, 1100, 1500];
  // slight high angle, camera leans toward the basket in focus, then pulls back for the end card
  const pull = kf(f, [[ENDLINE - 20, 0], [END - 20, 1]]);
  const camX = f < B1 ? 1100 : f >= B4 ? mix(900, 1100, pull) : mix(bx[which], 1100, pull);
  const cam: Cam = { x: camX, y: mix(G - 60, G - 420, pull), zoom: mix(f < B1 ? 1.1 : 1.45, 0.92, pull) };
  const point = [0, 1, 2].map((i) => g[i]).reduce((a, v, i) => a + v * (i - 1), 0); // -1..1 which basket the owner points to
  return (
    <Garden cam={cam} t={t} edge={false} front={<PerchedBird x={1780} y={G - 380} t={t} s={1} flip />}>
      <Chatai x={1100} y={G + 300} w={1300} d={110} />
      <Malik f={f} x={1260} dig={false} extra={{ hold: null, lean: 4 + Math.abs(point) * 8, headTilt: 12, armF: [mix(30, 60, Math.abs(point)), 20], armB: [-6, 10], brow: 0.3, mouth: "smile", look: point < 0 ? -0.5 : 0.8 }} />
      <Musafir x={560} y={G + 200} look={MU} pose={pose(f, { headTilt: 10, look: 1, brow: 0.5, mouth: "smile", armF: [10, 20] })} />
      {(["pomegranate", "dates", "grain"] as const).map((kind, i) => (
        <HarvestBasket key={kind} x={bx[i]} y={G + 230} s={0.95} t={t} kind={kind} glow={g[i]} lift={g[i] * 16} />
      ))}
      {g.map((v, i) => (v > 0.4 ? <Sparkle key={i} x={bx[i] + 90} y={G + 80} s={1.4 + Math.sin(t * 6) * 0.3} a={t * 150} /> : null))}
      <Butterfly x={900} y={G - 420} t={t} s={1} path={240} seed={4} color="#f6d04a" />
    </Garden>
  );
};

// ------------------------------------------------------------------ sound (nominal frames)
const s = (file: string, at: number, volume = 0.8) => ({ file: `sfx/${file}`, at, volume });
const every = (file: string, from: number, to: number, gap: number, volume: number) => Array.from({ length: Math.max(0, Math.ceil((to - from) / gap)) }, (_, i) => s(file, from + i * gap, volume));
const SFX: FilmVisuals["sfx"] = [
  // scene 1: wind on the plain, gravel step stopping
  s("breeze.wav", S1, 0.4),
  s("gravel-step.wav", 4, 0.7),
  s("whoosh.wav", 44, 0.35),
  s("riser.wav", 50, 0.3),
  // scene 2: wind gust, the voice moment
  ...every("breeze.wav", S2, S3, 160, 0.4),
  s("shimmer.wav", S2 + 112, 0.45),
  s("chime.wav", S2 + 120, 0.3),
  // scene 3: rain on stones, then the running channel
  s("rain.wav", S3 + 10, 0.35),
  s("rain.wav", S3 + 170, 0.3),
  s("drip.wav", S3 + 90, 0.4),
  s("drip.wav", S3 + 110, 0.35),
  ...every("stream.wav", S3 + 110, S4, 160, 0.35),
  ...[S3 + 165, S3 + 190, S3 + 215].map((at) => s("gravel-step.wav", at, 0.4)),
  // scene 4: quick steps, garden, spade in wet earth, sparrows
  ...[S4 + 6, S4 + 30, S4 + 52].map((at) => s("gravel-step.wav", at, 0.5)),
  ...every("stream.wav", S4, S5, 160, 0.35),
  s("sparrow.wav", S4 + 100, 0.35),
  ...every("hoe-dig.wav", S4 + 107, S5, 72, 0.55),
  s("birds.wav", S4 + 150, 0.3),
  // scene 5: water near, the name → wind drops away, shimmer
  ...every("stream.wav", S5, S5 + 110, 160, 0.35),
  s("whoosh.wav", S5 + 108, 0.35),
  s("shimmer.wav", S5 + 112, 0.55),
  s("stream.wav", S5 + 120, 0.15),
  // scene 6: drops from the leaves, garden air
  ...every("drip.wav", S6 + 10, S6 + 300, 45, 0.25),
  ...every("breeze.wav", S6, S7, 160, 0.25),
  s("stream.wav", S6 + 10, 0.25),
  s("stream.wav", S6 + 170, 0.25),
  // scene 7: the channel, birds, focus chimes, end
  ...every("stream.wav", S7, END, 165, 0.25),
  s("sparrow.wav", S7 + 20, 0.35),
  s("birds.wav", S7 + 200, 0.35),
  ...[B1, B2, B3, B4].map((at) => s("chime.wav", at, 0.3)),
  s("shimmer.wav", ENDLINE, 0.45),
];

// ------------------------------------------------------------------ hook, basket labels, end text
const fade = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Overlay: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const big = { fontFamily: "'DejaVu Sans', Inter, sans-serif", fontWeight: 900, WebkitTextStroke: "10px #1d120a", paintOrder: "stroke fill", textAlign: "center" as const };
  const hook = fade(f, 2, 7, 100, 112);
  const hookPop = interpolate(f, [2, 10], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const labels: [number, number, string][] = [
    [B1, B2, tr(lang, { ur: "1/3 Sadaqa", en: "1/3 Charity" })],
    [B2, B3, tr(lang, { ur: "1/3 Ghar wale", en: "1/3 Family" })],
    [B3, B4, tr(lang, { ur: "1/3 Wapas baagh mein", en: "1/3 Back into the garden" })],
    [B4, ENDLINE, tr(lang, { ur: "Sadaqa = Ghar ka hissa", en: "Charity = Family's share" })],
  ];
  const end1 = interpolate(f, [ENDLINE, ENDLINE + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const endPop = interpolate(f, [ENDLINE, ENDLINE + 10], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
  const end2 = interpolate(f, [ENDLINE + 22, ENDLINE + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = Math.max(0, 1 - Math.abs(f - 46) / 4) * 0.5;
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 500, opacity: hook }}>
        <div style={{ ...big, fontSize: 96, color: "#ffd34d", transform: `scale(${hookPop}) rotate(-3deg)`, lineHeight: 1.08, padding: "0 50px" }}>{tr(lang, { ur: "BAADAL SE AWAAZ?!", en: "A VOICE FROM A CLOUD?!" })}</div>
      </AbsoluteFill>
      {labels.map(([a, b, label]) => {
        const o = fade(f, a + 4, a + 10, b - 8, b);
        const pop = interpolate(f, [a + 4, a + 12], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeBack });
        return o > 0 ? (
          <AbsoluteFill key={label} style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300, opacity: o }}>
            <div style={{ ...big, fontSize: 78, color: "#fff1c0", WebkitTextStroke: "9px #3a1a00", transform: `scale(${pop})` }}>{label}</div>
          </AbsoluteFill>
        ) : null;
      })}
      <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 250 }}>
        <div style={{ ...big, fontSize: 92, color: "#ffe38a", opacity: end1, transform: `scale(${endPop})`, lineHeight: 1.12, padding: "0 60px" }}>{tr(lang, { ur: "Apni Kamai Se Sadaqa Do", en: "Give Charity From What You Earn" })}</div>
        <div style={{ fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 38, color: "#fff6e0", opacity: end2, marginTop: 26, textShadow: "0 2px 8px #000" }}>Sahih Muslim 2984a</div>
      </AbsoluteFill>
    </>
  );
};

export const baadalAurBaaghVisuals: FilmVisuals = {
  scenes: {
    "s1-awaaz": { nominal: [S1, S2], render: (f, ctx) => <Scene1 f={f} ctx={ctx} /> },
    "s2-baagh-ka-naam": { nominal: [S2, S3], render: (f, ctx) => <Scene2 f={f} ctx={ctx} /> },
    "s3-baarish-ka-rasta": { nominal: [S3, S4], render: (f, ctx) => <Scene3 f={f} ctx={ctx} /> },
    "s4-baagh-tak": { nominal: [S4, S5], render: (f, ctx) => <Scene4 f={f} ctx={ctx} /> },
    "s5-wahi-naam": { nominal: [S5, S6], render: (f, ctx) => <Scene5 f={f} ctx={ctx} /> },
    "s6-teen-hisse": { nominal: [S6, S7], render: (f, ctx) => <Scene6 f={f} ctx={ctx} /> },
    "s7-seekh": { nominal: [S7, END], render: (f, ctx) => <Scene7 f={f} ctx={ctx} /> },
  },
  sfx: SFX,
  overlay: (f, lang) => <Overlay f={f} lang={lang} />,
};
