// 2D cut-out "puppet" of the traveller. Every body part is a separate shape
// rotated around its joint, like Adobe Animate / Toon Boom rigs.
// Local coordinates: feet at (0,0), facing right (+x), y grows downward.

import React from "react";
import { LINE, OUT } from "./kit";

export type Mouth = "neutral" | "smile" | "open" | "pant" | "sad";

export type MusafirPose = {
  step: number; // walk phase (radians); 0 amplitude when standing
  walk: number; // 0..1 walk amplitude
  kneel: number; // 0..1
  lean: number; // degrees, + leans forward
  headTilt: number; // degrees, + nods down/forward
  armF: [number, number]; // front arm: shoulder, elbow (degrees, + forward/up)
  armB: [number, number];
  eyeOpen: number; // 0..1
  brow: number; // -1 sad/worried .. 0 .. +1 happy/raised
  mouth: Mouth;
  look: number; // -1..1 pupil direction
  sweat: number; // 0..1 visibility of a sweat drop
  khuff: "none" | "hand" | "mouth";
  pour: boolean;
  time: number; // seconds, for small secondary motion
  talk?: number; // 0..1 mouth opening from the voice envelope (lip-flap)
  hold?: "hoe" | null; // tool in the front hand
};

export const BASE_POSE: MusafirPose = {
  step: 0,
  walk: 0,
  kneel: 0,
  lean: 0,
  headTilt: 0,
  armF: [8, 10],
  armB: [-6, 8],
  eyeOpen: 1,
  brow: 0,
  mouth: "neutral",
  look: 0.3,
  sweat: 0,
  khuff: "none",
  pour: false,
  time: 0,
};

export type Look = typeof C & {
  headwear: "turban" | "cap" | "scarf"; // "scarf" = woman's headscarf (hijab) framing the face
  beardLength: number; // 0 = no beard or moustache
  vest?: string; // waistcoat over the kurta
  shoulderCloth?: string; // cloth over the front shoulder (labourer)
};

const C = {
  skin: "#e2a774",
  skinShade: "#c98c5c",
  robe: "#f4ead6",
  robeShade: "#dccbaa",
  sash: "#b5643c",
  turban: "#ffffff",
  turbanShade: "#e2ddd2",
  beard: "#4a3426",
  sandal: "#7a4b2c",
  khuff: "#8f5a33",
  water: "#8fd3f0",
};

const DEFAULT_LOOK: Look = { ...C, headwear: "turban", beardLength: 1 };

/** Ready-made looks; any field can be overridden per film. */
export const LOOKS: Record<string, Partial<Look>> = {
  musafir: {},
  kisan: { robe: "#e9d9b8", robeShade: "#cdb88f", sash: "#5f7a3a", turban: "#e8c77a", turbanShade: "#cfa95a", beard: "#3a2a1e", skin: "#d99a66", skinShade: "#bd8150" },
  malik: { robe: "#d8e2e6", robeShade: "#b5c3c9", sash: "#7b4a8c", turban: "#ffffff", turbanShade: "#dfe3e6", beard: "#2e231b", skin: "#e0a370", skinShade: "#c48756" },
  // "Gufa mein phanse 3 insaan" cast
  musafir1: { robe: "#f1e6cc", robeShade: "#d9c9a6", sash: "#8a5a36", vest: "#7a4b2c", turban: "#ffffff", turbanShade: "#e2ddd2", beard: "#3a2a1e" },
  musafir2: { robe: "#33507f", robeShade: "#263d64", sash: "#c9a86a", turban: "#e6d4ab", turbanShade: "#cbb688", beard: "#2a1e16", skin: "#d99a66", skinShade: "#bd8150" },
  musafir3: { robe: "#6f7a3a", robeShade: "#596230", sash: "#c9a86a", turban: "#8a5a36", turbanShade: "#6e4628", beard: "#4a3426", skin: "#e0a370", skinShade: "#c48756" },
  pita: { robe: "#a3a8ad", robeShade: "#868b91", sash: "#6e6a62", headwear: "cap", turban: "#f4f1ea", turbanShade: "#ddd8cc", beard: "#f2efe9", beardLength: 1.6, skin: "#dfa97c", skinShade: "#c59066" },
  maa: { robe: "#dcc6a2", robeShade: "#c2aa84", sash: "#a07a4c", headwear: "scarf", turban: "#7a4b2c", turbanShade: "#5e3820", beard: "#6a5a4a", beardLength: 0, skin: "#e2ad82", skinShade: "#c8936a" },
  aurat: { robe: "#7a2a35", robeShade: "#5e1f2a", sash: "#5e1f2a", headwear: "scarf", turban: "#6a2430", turbanShade: "#4e1a24", beard: "#3a2a1e", beardLength: 0, skin: "#e6b088", skinShade: "#cc9670" },
  mazdoor: { robe: "#8a6a4a", robeShade: "#6e523a", sash: "#5a4632", headwear: "cap", turban: "#d8c8a0", turbanShade: "#bfae84", shoulderCloth: "#d8c8a0", beard: "#2e231b", skin: "#c98a58", skinShade: "#a8703f" },
  // "Billi aur Aurat" cast
  "aurat-beige": { robe: "#7a2a35", robeShade: "#5e1f2a", sash: "#c9ac82", headwear: "scarf", turban: "#e3cfae", turbanShade: "#c8b08a", beard: "#3a2a1e", beardLength: 0, sandal: "#6a4026", skin: "#e6b088", skinShade: "#cc9670" },
  bachcha: { robe: "#4f9a6a", robeShade: "#3c7d54", sash: "#e0b04a", headwear: "cap", turban: "#fdf6e6", turbanShade: "#e6dcc4", beard: "#2e231b", beardLength: 0, skin: "#e8b48a", skinShade: "#cf9a70" },
  buzurg: { robe: "#f6f1e4", robeShade: "#ddd3bd", sash: "#a07a3c", turban: "#ffffff", turbanShade: "#e6e1d6", beard: "#efece6", skin: "#e4ad80", skinShade: "#c99268", beardLength: 1.5 },
};

const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Arm: React.FC<{ x: number; y: number; a: [number, number]; back?: boolean; khuff?: boolean; pour?: boolean; time: number; c: Look; hoe?: boolean }> = ({
  x,
  y,
  a,
  back,
  khuff,
  pour,
  time,
  c: C,
  hoe,
}) => {
  const robe = back ? C.robeShade : C.robe;
  return (
    <g transform={`translate(${x} ${y}) rotate(${-a[0]})`}>
      <path d="M -15 -6 Q -19 30 -17 62 L 17 62 Q 19 30 15 -6 Q 0 -14 -15 -6 Z" fill={robe} {...stroke} />
      <g transform={`translate(0 56) rotate(${-a[1]})`}>
        {/* bell sleeve */}
        <path d="M -16 0 Q -20 30 -24 56 Q 0 64 24 56 Q 20 30 16 0 Z" fill={robe} {...stroke} />
        {hoe && (
          // kudal: long handle through the fist, iron blade at the end
          <g transform="translate(0 66) rotate(-90)">
            <rect x={-150} y={-6} width={230} height={12} rx={6} fill="#a0703f" {...stroke} />
            <path d="M -150 -8 L -176 -8 L -186 46 Q -170 54 -154 46 L -150 8 Z" fill="#7d8a90" {...stroke} />
          </g>
        )}
        <circle cx={0} cy={66} r={12} fill={back ? C.skinShade : C.skin} {...stroke} />
        {khuff && (
          <g transform={`translate(0 70) rotate(${pour ? 115 : 0})`}>
            {/* leather sock: the man's only vessel */}
            <path d="M -11 -4 L -12 34 Q -12 50 6 50 L 26 50 Q 34 50 34 42 Q 34 34 22 32 L 12 30 L 11 -4 Z" fill={C.khuff} {...stroke} />
            <ellipse cx={0} cy={-4} rx={12} ry={5} fill="#5b3820" {...stroke} />
            {pour && (
              <g transform={`rotate(-115) translate(${Math.sin(time * 20)} 0)`}>
                <path d={`M -2 -8 Q 2 40 0 ${110} L 6 ${110} Q 6 40 5 -8 Z`} fill={C.water} stroke="#5aa9cf" strokeWidth={2} opacity={0.9} />
                {[0, 1, 2].map((i) => {
                  const yy = 20 + ((time * 160 + i * 33) % 90);
                  return <circle key={i} cx={4 + Math.sin(i * 3) * 4} cy={yy} r={3} fill="#d8f2ff" />;
                })}
              </g>
            )}
          </g>
        )}
      </g>
    </g>
  );
};

const Eye: React.FC<{ cx: number; cy: number; open: number; look: number }> = ({ cx, cy, open, look }) => {
  const ry = 11 * Math.max(0.08, open);
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={9.5} ry={ry} fill="#fff" stroke={OUT} strokeWidth={2.5} />
      {open > 0.25 && <circle cx={cx + 3 + look * 2.5} cy={cy + 1} r={Math.min(5.5, ry * 0.6)} fill="#2a1a12" />}
      {open > 0.25 && <circle cx={cx + 4.5 + look * 2.5} cy={cy - 1.5} r={1.6} fill="#fff" />}
      {open < 0.7 && (
        // heavy upper lid for a tired look
        <path d={`M ${cx - 11} ${cy - ry + 1} Q ${cx} ${cy - ry - 3} ${cx + 11} ${cy - ry + 1}`} fill="none" stroke={OUT} strokeWidth={3} strokeLinecap="round" />
      )}
    </g>
  );
};

const BackHead: React.FC<{ c: Look }> = ({ c: C }) =>
  C.headwear === "scarf" ? (
    <g>
      <path d="M -50 -60 Q -50 -120 6 -124 Q 62 -120 62 -60 Q 64 0 72 12 L -58 12 Q -50 0 -50 -60 Z" fill={C.turban} {...stroke} />
      <path d="M -20 -110 Q -36 -50 -30 8 M 30 -112 Q 44 -50 40 8" fill="none" stroke={C.turbanShade} strokeWidth={6} strokeLinecap="round" />
    </g>
  ) : (
  // Seen from behind: no face at all, only turban, back of the head and beard edge.
  <g>
    <rect x={-12} y={-18} width={24} height={22} rx={6} fill={C.skinShade} {...stroke} />
    <ellipse cx={6} cy={-58} rx={44} ry={50} fill={C.skinShade} {...stroke} />
    <path d="M -36 -40 Q -30 -4 6 2 Q 42 -4 48 -40 Q 30 -26 6 -26 Q -18 -26 -36 -40 Z" fill={C.beard} opacity={0.9} {...stroke} />
    <path d="M -40 -84 Q -44 -128 4 -134 Q 50 -136 54 -84 Q 30 -100 6 -100 Q -18 -100 -40 -84 Z" fill={C.turban} {...stroke} />
    <path d="M -34 -104 Q 6 -118 48 -104" fill="none" stroke={C.turbanShade} strokeWidth={5} strokeLinecap="round" />
    <path d="M -10 -96 Q -24 -50 -14 -6 L 8 -8 Q 0 -50 12 -94 Z" fill={C.turbanShade} {...stroke} />
  </g>
);

const Head: React.FC<{ p: MusafirPose; c: Look }> = ({ p, c: C }) => {
  // brow angle: sad lifts the inner (front) end
  const browL = (x: number, y: number, inner: 1 | -1) => {
    const lift = p.brow < 0 ? -p.brow * 7 * inner : 0;
    const raise = p.brow > 0 ? -p.brow * 5 : 0;
    return `M ${x - 10} ${y + raise + (inner < 0 ? -lift : 0)} Q ${x} ${y - 4 + raise} ${x + 10} ${y + raise - (inner > 0 ? lift : 0)}`;
  };
  const mouth = () => {
    const mx = 36;
    const my = -30;
    if ((p.talk ?? 0) > 0.06) {
      const o = 2 + (p.talk ?? 0) * 9;
      return <ellipse cx={mx} cy={my + 1} rx={7} ry={o} fill="#6e1f1f" {...stroke} strokeWidth={3} />;
    }
    switch (p.mouth) {
      case "smile":
        return <path d={`M ${mx - 10} ${my - 2} Q ${mx} ${my + 9} ${mx + 10} ${my - 3}`} fill="#8b2f2f" {...stroke} strokeWidth={3} />;
      case "open":
        return <ellipse cx={mx} cy={my} rx={6} ry={8} fill="#6e1f1f" {...stroke} strokeWidth={3} />;
      case "pant": {
        const o = 6 + Math.sin(p.time * 14) * 2;
        return (
          <g>
            <ellipse cx={mx} cy={my} rx={7} ry={o} fill="#6e1f1f" {...stroke} strokeWidth={3} />
            <ellipse cx={mx} cy={my + o * 0.5} rx={4.5} ry={3} fill="#e07a7a" />
          </g>
        );
      }
      case "sad":
        return <path d={`M ${mx - 9} ${my + 3} Q ${mx} ${my - 5} ${mx + 9} ${my + 3}`} fill="none" {...stroke} strokeWidth={3} />;
      default:
        return <path d={`M ${mx - 8} ${my} L ${mx + 8} ${my}`} {...stroke} strokeWidth={3} />;
    }
  };
  return (
    <g>
      <rect x={-12} y={-18} width={24} height={22} rx={6} fill={C.skinShade} {...stroke} />
      {C.headwear === "scarf" ? (
        // headscarf drape behind the head, falling onto the shoulders
        <path d="M 44 -108 Q 6 -128 -34 -106 Q -66 -66 -60 -2 Q -40 22 24 18 Q 56 12 62 -8 Z" fill={C.turbanShade} {...stroke} />
      ) : C.headwear === "turban" ? (
        // turban tail behind
        <path d="M -40 -92 Q -64 -50 -50 -8 L -32 -10 Q -42 -50 -22 -84 Z" fill={C.turbanShade} {...stroke} />
      ) : null}
      {/* head */}
      <ellipse cx={10} cy={-58} rx={44} ry={50} fill={C.skin} {...stroke} />
      {C.headwear !== "scarf" && <ellipse cx={-22} cy={-56} rx={9} ry={12} fill={C.skinShade} {...stroke} />}
      {/* beard + moustache */}
      {C.beardLength > 0 && <path transform={`translate(0 -44) scale(1 ${C.beardLength}) translate(0 44)`} d="M -28 -60 Q -30 -10 8 4 Q 46 8 58 -30 Q 56 -42 50 -44 Q 38 -18 20 -22 Q 0 -26 -6 -56 Z" fill={C.beard} {...stroke} />}
      {C.beardLength === 0 && <ellipse cx={44} cy={-48} rx={8} ry={5} fill="#e88a7a" opacity={0.35} />}
      {mouth()}
      {C.beardLength > 0 && <path d="M 22 -40 Q 36 -46 50 -38" fill="none" stroke={C.beard} strokeWidth={8} strokeLinecap="round" />}
      {/* nose */}
      <path d="M 46 -62 Q 58 -50 46 -44" fill={C.skin} {...stroke} strokeWidth={3} />
      <Eye cx={22} cy={-66} open={p.eyeOpen} look={p.look} />
      <Eye cx={44} cy={-66} open={p.eyeOpen} look={p.look} />
      <path d={browL(22, -84, -1)} fill="none" stroke={C.beard} strokeWidth={5} strokeLinecap="round" />
      <path d={browL(44, -84, 1)} fill="none" stroke={C.beard} strokeWidth={5} strokeLinecap="round" />
      {C.headwear === "scarf" ? (
        // front of the headscarf: covers the hair and the back of the head, wraps under the chin
        <>
          <path d="M 54 -92 Q 30 -124 -20 -114 Q -58 -96 -56 -50 Q -54 -14 -20 0 Q -10 -40 -4 -64 Q 8 -94 54 -92 Z" fill={C.turban} {...stroke} />
          <path d="M -12 2 Q 20 14 56 -12 L 62 -2 Q 30 26 -16 14 Z" fill={C.turban} {...stroke} />
          <path d="M -34 -96 Q -46 -60 -36 -16" fill="none" stroke={C.turbanShade} strokeWidth={5} strokeLinecap="round" />
          <path d="M 50 -94 Q 20 -96 2 -80" fill="none" stroke={C.turbanShade} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : C.headwear === "cap" ? (
        <path d="M -34 -86 Q -30 -122 10 -124 Q 50 -122 54 -86 Q 10 -94 -34 -86 Z" fill={C.turban} {...stroke} />
      ) : (
      <>
      {/* wrapped turban */}
      <path d="M -36 -84 Q -40 -128 6 -134 Q 52 -136 58 -90 Q 30 -98 10 -96 Q -14 -96 -36 -84 Z" fill={C.turban} {...stroke} />
      <path d="M -30 -100 Q 10 -114 54 -100" fill="none" stroke={C.turbanShade} strokeWidth={5} strokeLinecap="round" />
      <path d="M -24 -116 Q 14 -126 46 -114" fill="none" stroke={C.turbanShade} strokeWidth={5} strokeLinecap="round" />
      </>
      )}
      {p.khuff === "mouth" && (
        // held with the teeth while climbing (as in the hadith)
        <g transform="translate(54 -16) rotate(-20)">
          <path d="M -9 -2 L -10 30 Q -10 44 6 44 L 24 44 Q 31 44 31 37 Q 31 30 20 28 L 11 26 L 10 -2 Z" fill="#8f5a33" {...stroke} />
          <ellipse cx={0} cy={-2} rx={10} ry={4} fill="#5b3820" {...stroke} />
        </g>
      )}
      {p.sweat > 0.02 && (
        <path
          transform={`translate(64 ${-82 + p.sweat * 40})`}
          d="M 0 -10 Q 7 2 0 8 Q -7 2 0 -10 Z"
          fill="#bfe9ff"
          stroke="#5aa9cf"
          strokeWidth={2}
          opacity={Math.min(1, (1 - p.sweat) * 3)}
        />
      )}
    </g>
  );
};

export const Musafir: React.FC<{ x: number; y: number; flip?: boolean; scale?: number; pose: MusafirPose; noShadow?: boolean; look?: Partial<Look>; back?: boolean }> = ({
  x,
  y,
  flip,
  scale = 1,
  pose: p,
  noShadow,
  look,
  back: seenFromBehind,
}) => {
  const C: Look = { ...DEFAULT_LOOK, ...look };
  const k = p.kneel;
  const hipY = -165 + k * 92;
  const bob = -Math.abs(Math.sin(p.step)) * 6 * p.walk;
  const sway = Math.sin(p.step) * 10 * p.walk;
  const hem = -14 + k * 4;
  const footF = 18 + Math.sin(p.step) * 26 * p.walk;
  const footB = -12 - Math.sin(p.step) * 26 * p.walk;
  const liftF = -Math.max(0, Math.cos(p.step)) * 9 * p.walk;
  const liftB = -Math.max(0, -Math.cos(p.step)) * 9 * p.walk;
  const back = -k * 55;

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {/* soft contact shadow */}
      {!noShadow && <ellipse cx={back * 0.4} cy={2} rx={95 + k * 30} ry={13} fill="#7a4a24" opacity={0.25} />}
      {/* feet */}
      {k < 0.5 ? (
        <>
          <ellipse cx={footB} cy={-8 + liftB} rx={22} ry={9} fill={C.sandal} {...stroke} />
          <ellipse cx={footF} cy={-8 + liftF} rx={22} ry={9} fill={C.sandal} {...stroke} />
        </>
      ) : (
        <>
          <ellipse cx={-118} cy={-8} rx={10} ry={20} transform="rotate(-70 -118 -8)" fill={C.sandal} {...stroke} />
          <ellipse cx={-100} cy={-6} rx={10} ry={20} transform="rotate(-70 -100 -6)" fill={C.sandal} {...stroke} />
        </>
      )}
      <g transform={`translate(0 ${bob})`}>
        {/* skirt of the robe, sways with the stride and spreads when kneeling */}
        <path
          d={`M -46 ${hipY} C -58 ${hipY + 60} ${-78 + back + sway * 0.4} ${hem - 50} ${-84 + back + sway} ${hem}
              Q 0 ${hem + 10} ${84 + sway} ${hem}
              C ${78 + sway * 0.4} ${hem - 50} 58 ${hipY + 60} 46 ${hipY} Z`}
          fill={C.robe}
          {...stroke}
        />
        <path d={`M ${-30 + back * 0.5} ${hem - 4} Q ${-24 + back * 0.3} ${(hipY + hem) / 2} -18 ${hipY + 30}`} fill="none" stroke={C.robeShade} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${24 + sway * 0.6} ${hem - 4} Q 20 ${(hipY + hem) / 2} 14 ${hipY + 30}`} fill="none" stroke={C.robeShade} strokeWidth={4} strokeLinecap="round" />

        {/* upper body leans around the waist */}
        <g transform={`translate(0 ${hipY + 6}) rotate(${p.lean})`}>
          <Arm x={-6} y={-118} a={p.armB} back time={p.time} c={C} />
          <path d="M -46 4 C -54 -50 -52 -104 -38 -126 Q 0 -140 40 -126 C 54 -104 54 -50 46 4 Z" fill={C.robe} {...stroke} />
          <path d="M -30 -110 Q -40 -60 -34 0" fill="none" stroke={C.robeShade} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
          {C.vest && (
            <>
              <path d="M -46 4 C -54 -50 -52 -104 -38 -126 L -8 -132 Q -2 -60 -6 4 Z" fill={C.vest} {...stroke} />
              <path d="M 46 4 C 54 -50 54 -104 40 -126 L 16 -132 Q 10 -60 14 4 Z" fill={C.vest} {...stroke} />
              {[-100, -70, -40].map((by) => (
                <circle key={by} cx={18} cy={by} r={4} fill="#d9b25a" stroke={OUT} strokeWidth={1.5} />
              ))}
            </>
          )}
          <rect x={-48} y={-12} width={96} height={20} rx={8} fill={C.sash} {...stroke} />
          <path d="M 30 6 L 36 40 L 22 40 Z" fill={C.sash} {...stroke} />
          {C.shoulderCloth && (
            <path d="M -30 -132 Q 20 -142 46 -122 L 44 -50 Q 34 -38 26 -50 L 24 -108 Q -4 -112 -24 -118 Z" fill={C.shoulderCloth} {...stroke} />
          )}
          <g transform={`translate(6 -128) rotate(${p.headTilt})`}>
            {seenFromBehind ? <BackHead c={C} /> : <Head p={p} c={C} />}
          </g>
          <Arm x={12} y={-114} a={p.armF} khuff={p.khuff === "hand"} pour={p.pour} time={p.time} c={C} hoe={p.hold === "hoe"} />
        </g>
      </g>
    </g>
  );
};
