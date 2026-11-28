// Sea world (library). Built for "samundar-mein-1000-dinar", reusable for any sea / harbour story.
// Everything natural moves on its own from `t` (seconds): waves, foam, rope, sail, gulls, cloth.

import React from "react";
import { LINE, OUT, mix } from "../kit";

const st = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type SeaMood = "sun" | "grey" | "warm";
const SKY: Record<SeaMood, [string, string, string]> = {
  sun: ["#6fb6e6", "#a9d8f2", "#f6edd2"],
  grey: ["#8c9aac", "#b3bcc6", "#d8d6cf"],
  warm: ["#f0b27a", "#f7d29c", "#fff0d2"],
};
const WATER: Record<SeaMood, [string, string, string]> = {
  sun: ["#4f9fc9", "#2f78a8", "#1f5a86"],
  grey: ["#6f8796", "#55707f", "#3e5866"],
  warm: ["#6aa8c0", "#3f86a8", "#2a6488"],
};

// ------------------------------------------------------------------ sky
/** Sky over the sea: gradient, sun (sun/warm) or a cloud deck (grey), drifting clouds. */
export const SeaSky: React.FC<{ mood: SeaMood; t: number; x0?: number; x1?: number; y0?: number; y1?: number; sunX?: number; sunY?: number }> = ({
  mood,
  t,
  x0 = -1500,
  x1 = 4500,
  y0 = -800,
  y1 = 1700,
  sunX = 800,
  sunY = 500,
}) => {
  const [a, b, c] = SKY[mood];
  const id = `seasky-${mood}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.65" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fffbe8" stopOpacity={1} />
          <stop offset="0.35" stopColor="#fff2c0" stopOpacity={0.7} />
          <stop offset="1" stopColor="#fff2c0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={`url(#${id})`} />
      {mood !== "grey" && <circle cx={sunX} cy={sunY} r={300} fill={`url(#${id}-sun)`} />}
      {mood !== "grey" && <circle cx={sunX} cy={sunY} r={70} fill="#fff8de" />}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const cx = x0 + (((i * 900 + t * (14 + i * 3)) % (x1 - x0)) + (x1 - x0)) % (x1 - x0);
        const cy = y0 + 500 + (i % 3) * 230;
        const k = mood === "grey" ? 1.5 : 1;
        const fill = mood === "grey" ? (i % 2 ? "#9aa5b2" : "#a7b1bc") : "#ffffff";
        return (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${k * (0.8 + (i % 3) * 0.25)})`} opacity={mood === "grey" ? 0.95 : 0.85}>
            <ellipse cx={0} cy={0} rx={190} ry={52} fill={fill} />
            <ellipse cx={-70} cy={-30} rx={90} ry={56} fill={fill} />
            <ellipse cx={60} cy={-40} rx={110} ry={66} fill={fill} />
          </g>
        );
      })}
      {mood === "grey" && <rect x={x0} y={y0} width={x1 - x0} height={900} fill="#7f8b99" opacity={0.35} />}
    </g>
  );
};

// ------------------------------------------------------------------ water
const wavePath = (x0: number, x1: number, y: number, amp: number, len: number, ph: number, bottom: number) => {
  let d = `M ${x0} ${bottom} L ${x0} ${y}`;
  for (let x = x0; x <= x1; x += 40) d += ` L ${x} ${y + Math.sin(x / len + ph) * amp + Math.sin(x / (len * 0.43) + ph * 1.7) * amp * 0.35}`;
  return d + ` L ${x1} ${bottom} Z`;
};

/** Open sea from the horizon `y` down to `y1`: wave bands that roll, sun glints, white caps. */
export const Sea: React.FC<{ y: number; y1?: number; x0?: number; x1?: number; t: number; mood?: SeaMood; rough?: number }> = ({
  y,
  y1 = 3400,
  x0 = -1500,
  x1 = 4500,
  t,
  mood = "sun",
  rough = 1,
}) => {
  const [a, b, c] = WATER[mood];
  const bands = 7;
  return (
    <g>
      <rect x={x0} y={y} width={x1 - x0} height={y1 - y} fill={a} />
      <path d={`M ${x0} ${y} L ${x1} ${y}`} stroke="#ffffff" strokeWidth={3} opacity={0.5} />
      {Array.from({ length: bands }).map((_, i) => {
        const k = i / (bands - 1);
        const yy = y + Math.pow(k, 1.6) * (y1 - y) * 0.9 + 20;
        const col = k < 0.4 ? mix(0, 1, k) : 1;
        return (
          <path
            key={i}
            d={wavePath(x0, x1, yy, (6 + k * 30) * rough, 70 + k * 120, t * (0.8 + k * 0.9) + i * 1.3, y1)}
            fill={k < 0.3 ? b : k < 0.7 ? (i % 2 ? b : c) : c}
            opacity={0.55 + col * 0.25}
          />
        );
      })}
      {/* glints and white caps */}
      {Array.from({ length: 40 }).map((_, i) => {
        const gx = x0 + ((i * 397.3 + t * (20 + (i % 5) * 9)) % (x1 - x0));
        const k = ((i * 0.618) % 1) ** 1.4;
        const gy = y + 20 + k * (y1 - y) * 0.8;
        const a = Math.max(0, Math.sin(t * 2.2 + i * 1.7));
        return <path key={i} d={`M ${gx - 18 - k * 30} ${gy} Q ${gx} ${gy - 5 - k * 8} ${gx + 18 + k * 30} ${gy}`} fill="none" stroke="#ffffff" strokeWidth={3 + k * 5} strokeLinecap="round" opacity={a * (mood === "grey" ? 0.45 : 0.75)} />;
      })}
    </g>
  );
};

/** Foam that rolls in and out along a shore line / around stones (x0..x1 at y). */
export const ShoreFoam: React.FC<{ x0: number; x1: number; y: number; t: number; reach?: number }> = ({ x0, x1, y, t, reach = 1 }) => {
  const k = (Math.sin(t * 1.3) + 1) / 2;
  const yy = y - k * 24 * reach;
  let d = `M ${x0} ${yy + 40}`;
  for (let x = x0; x <= x1; x += 36) d += ` Q ${x + 18} ${yy - 14 - Math.sin(x * 0.05 + t * 2) * 8} ${x + 36} ${yy}`;
  d += ` L ${x1} ${yy + 60} L ${x0} ${yy + 60} Z`;
  return (
    <g>
      <path d={d} fill="#ffffff" opacity={0.85} />
      {Array.from({ length: Math.round((x1 - x0) / 60) }).map((_, i) => (
        <circle key={i} cx={x0 + i * 60 + 20 + Math.sin(t + i) * 10} cy={yy + 30 + Math.sin(i * 3.1) * 10} r={6 + (i % 3) * 3} fill="#ffffff" opacity={0.6} />
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ stone steps (ghar wala kinara)
/** Height of the step tread at world x for StoneSteps placed at (x, y) with run/rise (for walking down). */
export const stepTopAt = (x: number, y: number, run: number, rise: number, n: number, wx: number) => {
  const i = Math.max(0, Math.min(n - 1, Math.floor((wx - x) / run)));
  return wx < x ? y : y + i * rise;
};

/** Stone stairs going down to the water (top-left to bottom-right), side wall, moss at the waterline, splash. */
export const StoneSteps: React.FC<{ x: number; y: number; n?: number; run?: number; rise?: number; bottom?: number; waterY?: number; t?: number }> = ({
  x,
  y,
  n = 9,
  run = 130,
  rise = 52,
  bottom = 2600,
  waterY,
  t = 0,
}) => {
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const sx = x + i * run;
    const sy = y + i * rise;
    const shade = i % 2 ? "#cdb08a" : "#d8bc96";
    blocks.push(
      <g key={i}>
        <rect x={sx} y={sy} width={run + 6} height={bottom - sy} fill={shade} {...st} />
        <rect x={sx} y={sy} width={run + 6} height={14} fill="#ead2ae" {...st} strokeWidth={3} />
        <path d={`M ${sx + run * 0.5} ${sy + 14} L ${sx + run * 0.5} ${sy + rise + 10}`} stroke="#a98a62" strokeWidth={3} />
        <path d={`M ${sx + 12} ${sy + 40} q 10 6 22 2`} fill="none" stroke="#a98a62" strokeWidth={3} />
      </g>,
    );
  }
  return (
    <g>
      {blocks}
      {/* side wall stones */}
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M ${x - 10} ${y + 120 + i * 120} L ${x + n * run} ${y + 120 + i * 120 + (i % 2) * 6}`} stroke="#a98a62" strokeWidth={3} opacity={0.6} />
      ))}
      {waterY !== undefined && (
        <>
          <rect x={x} y={waterY - 18} width={n * run + 10} height={36} fill="#5e7a3c" opacity={0.55} />
          <ShoreFoam x0={x + Math.max(0, Math.floor((waterY - y) / rise)) * run - 80} x1={x + n * run + 200} y={waterY} t={t} reach={0.6} />
        </>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ wooden pier (doosra kinara)
/** Wooden pier deck from x0 to x1 at height y, posts into the water, end post with a slack rope that swings. */
export const WoodPier: React.FC<{ x0: number; x1: number; y: number; waterY: number; t: number; rope?: number }> = ({ x0, x1, y, waterY, t, rope = 1 }) => {
  const posts: number[] = [];
  for (let px = x0 + 40; px < x1; px += 220) posts.push(px);
  posts.push(x1 - 30);
  const sw = Math.sin(t * 1.6) * 26 * rope;
  return (
    <g>
      {posts.map((px, i) => (
        <g key={i}>
          <rect x={px - 22} y={y} width={44} height={waterY - y + 140} fill="#6e4a2e" {...st} />
          <path d={`M ${px - 10} ${y + 30} L ${px - 8} ${waterY}`} stroke="#5a3a22" strokeWidth={4} />
          <rect x={px - 24} y={waterY - 40} width={48} height={60} fill="#4f6b3a" opacity={0.5} />
        </g>
      ))}
      {/* deck planks */}
      <rect x={x0} y={y - 34} width={x1 - x0} height={38} fill="#a87a4e" {...st} />
      {Array.from({ length: Math.ceil((x1 - x0) / 90) }).map((_, i) => (
        <path key={i} d={`M ${x0 + i * 90} ${y - 34} L ${x0 + i * 90} ${y + 4}`} stroke="#7a5432" strokeWidth={3} />
      ))}
      <path d={`M ${x0} ${y - 22} L ${x1} ${y - 22}`} stroke="#c89a68" strokeWidth={4} opacity={0.7} />
      {/* end post (bollard) with rope */}
      <rect x={x1 - 48} y={y - 170} width={40} height={140} rx={8} fill="#7a5232" {...st} />
      <rect x={x1 - 52} y={y - 130} width={48} height={18} rx={6} fill="#c8a46a" {...st} strokeWidth={3} />
      <path d={`M ${x1 - 30} ${y - 120} Q ${x1 + 40 + sw} ${y + 60} ${x1 + 10 + sw * 0.6} ${y + 160} Q ${x1 - 10 + sw * 0.3} ${y + 230} ${x1 - 60} ${y + 120}`} fill="none" stroke="#c8a46a" strokeWidth={9} strokeLinecap="round" />
      <path d={`M ${x1 - 30} ${y - 120} Q ${x1 + 40 + sw} ${y + 60} ${x1 + 10 + sw * 0.6} ${y + 160}`} fill="none" stroke={OUT} strokeWidth={2} opacity={0.4} />
    </g>
  );
};

// ------------------------------------------------------------------ boat
/** Wooden sail boat (waterline at y). `layer` back = mast/sail/inside, front = hull side (draw people between). */
export const Boat: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean; sail?: boolean; layer?: "back" | "front" | "all"; rock?: number }> = ({
  x,
  y,
  s = 1,
  t,
  flip,
  sail = true,
  layer = "all",
  rock = 1,
}) => {
  const r = Math.sin(t * 1.4) * 2.5 * rock;
  const bob = Math.sin(t * 1.4 + 0.6) * 8 * rock;
  const fl = Math.sin(t * 3) * 10;
  const back = (
    <>
      <path d="M -300 -60 Q 0 -40 300 -70 L 280 -40 Q 0 -10 -280 -30 Z" fill="#5a3a22" {...st} />
      {sail && (
        <>
          <rect x={-14} y={-560} width={20} height={520} fill="#6e4a2e" {...st} />
          <path d={`M -2 -540 Q ${200 + fl} -360 ${230 + fl * 0.5} -120 L -2 -110 Z`} fill="#f2e6cc" {...st} />
          <path d={`M -2 -420 Q ${120 + fl * 0.7} -330 ${150 + fl * 0.4} -230`} fill="none" stroke="#d8c8a6" strokeWidth={4} />
          <path d="M -2 -540 L -200 -60" stroke="#c8a46a" strokeWidth={3} />
        </>
      )}
    </>
  );
  const front = (
    <>
      <path d="M -320 -70 Q -300 40 -120 60 L 140 60 Q 310 40 340 -80 Q 0 -40 -320 -70 Z" fill="#8a5a34" {...st} />
      <path d="M -300 -30 Q 0 0 330 -40" fill="none" stroke="#6e4628" strokeWidth={4} />
      <path d="M -270 10 Q 0 36 300 6" fill="none" stroke="#6e4628" strokeWidth={4} />
      <path d="M -330 -74 Q 0 -44 344 -84" fill="none" stroke="#c8925a" strokeWidth={8} strokeLinecap="round" />
      <path d="M -120 60 Q 0 70 140 60" fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.6} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${r}) scale(${flip ? -s : s} ${s})`}>
      {layer !== "front" && back}
      {layer !== "back" && front}
    </g>
  );
};

// ------------------------------------------------------------------ gull
/** Sea gull flying (flap) or gliding. */
export const Seagull: React.FC<{ x: number; y: number; t: number; s?: number; flip?: boolean; glide?: boolean }> = ({ x, y, t, s = 1, flip, glide }) => {
  const w = glide ? Math.sin(t * 2) * 6 : Math.sin(t * 9) * 34;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d={`M 0 0 Q -40 ${-24 - w} -86 ${-10 - w * 1.2}`} fill="none" stroke="#f6f6f2" strokeWidth={12} strokeLinecap="round" />
      <path d={`M 0 0 Q 40 ${-24 - w} 86 ${-10 - w * 1.2}`} fill="none" stroke="#f6f6f2" strokeWidth={12} strokeLinecap="round" />
      <path d={`M 0 0 Q -40 ${-24 - w} -86 ${-10 - w * 1.2} M 0 0 Q 40 ${-24 - w} 86 ${-10 - w * 1.2}`} fill="none" stroke={OUT} strokeWidth={3} opacity={0.7} />
      <path d={`M -76 ${-10 - w * 1.2} l -12 4 M 76 ${-10 - w * 1.2} l 12 4`} stroke="#3a3a3a" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={0} cy={2} rx={24} ry={11} fill="#ffffff" {...st} strokeWidth={3} />
      <circle cx={22} cy={-2} r={9} fill="#ffffff" {...st} strokeWidth={3} />
      <path d="M 30 -2 L 42 0 L 30 3 Z" fill="#f0b030" />
    </g>
  );
};

// ------------------------------------------------------------------ the log with the crooked knot
/** Firewood log with a crooked knot (recognisable from both sides).
 * cut 0..1 = saw kerf depth (a glint shows inside once deep), open 0..1 = right piece slides off and the hollow
 * with coins (+ letter) shows, glint 0..1, wet 0..1 = darker with drips, sealed = plug on the end. */
export const KnotLog: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  t?: number;
  cut?: number;
  cutX?: number;
  open?: number;
  letter?: boolean;
  glint?: number;
  wet?: number;
  sealed?: boolean;
  hollowEnd?: number;
}> = ({ x, y, s = 1, rot = 0, t = 0, cut = 0, cutX = 40, open = 0, letter = true, glint = 0, wet = 0, sealed = false, hollowEnd = 0 }) => {
  const bark = wet > 0.5 ? "#6a4a32" : "#8f6440";
  const barkD = wet > 0.5 ? "#4e3422" : "#6e4a2e";
  const R = 64;
  const L0 = -220;
  const L1 = 220;
  const shift = open * 170;
  const tilt = open * 10;
  const piece = (a: number, b: number, leftEnd: boolean, rightEnd: boolean) => (
    <g>
      <path d={`M ${a} ${-R} L ${b} ${-R} ${rightEnd ? `Q ${b + 26} 0 ${b} ${R}` : `L ${b} ${R}`} L ${a} ${R} ${leftEnd ? `Q ${a - 26} 0 ${a} ${-R}` : "Z"}`} fill={bark} {...st} />
      {[-40, -12, 18, 44].map((gy, i) => (
        <path key={i} d={`M ${a + 14} ${gy} Q ${(a + b) / 2} ${gy + (i % 2 ? 10 : -8)} ${b - 14} ${gy + 4}`} fill="none" stroke={barkD} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      ))}
      <path d={`M ${a + 10} ${-R + 12} L ${b - 10} ${-R + 12}`} stroke="#b08458" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
    </g>
  );
  const coin = (cx: number, cy: number, i: number) => (
    <g key={i}>
      <ellipse cx={cx} cy={cy} rx={13} ry={9} fill="#d9a520" stroke={OUT} strokeWidth={2} />
      <ellipse cx={cx - 2} cy={cy - 2} rx={8} ry={4} fill="#ffe27a" opacity={0.6 + Math.sin(t * 6 + i) * 0.4} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={R + 10} rx={240} ry={16} fill="#000" opacity={0.18} />
      {/* left piece */}
      {piece(L0, open > 0 ? cutX : L1, true, open <= 0)}
      {/* crooked knot (left half, always visible) */}
      <g transform="translate(-90 -18) rotate(-24)">
        <ellipse cx={0} cy={0} rx={34} ry={22} fill="#5a3a22" {...st} />
        <path d="M -22 2 Q -6 -16 10 -6 Q 22 4 6 10 Q -6 12 -4 2" fill="none" stroke="#c89a68" strokeWidth={4} strokeLinecap="round" />
        <path d="M 30 8 Q 52 22 46 42" fill="none" stroke="#4e3422" strokeWidth={6} strokeLinecap="round" />
        <circle cx={2} cy={0} r={5} fill="#2e1e12" />
      </g>
      {/* left end: tree rings, or the sealed plug */}
      <g transform={`translate(${L0} 0)`}>
        <ellipse cx={0} cy={0} rx={22} ry={R - 2} fill={sealed ? "#7a5232" : "#d9b47e"} {...st} />
        {!sealed && <ellipse cx={0} cy={0} rx={12} ry={R * 0.55} fill="none" stroke="#b08458" strokeWidth={3} />}
        {sealed && <path d="M -6 -30 L 6 -26 M -8 0 L 6 4 M -6 28 L 6 30" stroke="#4e3422" strokeWidth={4} />}
        {hollowEnd > 0 && <ellipse cx={0} cy={0} rx={12 * hollowEnd} ry={34 * hollowEnd} fill="#2e1e12" />}
      </g>
      {/* kerf */}
      {cut > 0 && open <= 0 && (
        <g>
          <path d={`M ${cutX - 4} ${-R} L ${cutX - 4} ${-R + cut * 2 * R} L ${cutX + 4} ${-R + cut * 2 * R} L ${cutX + 4} ${-R} Z`} fill="#1a0f08" />
          {glint > 0 && (
            <g opacity={glint}>
              <rect x={cutX - 3} y={-28} width={6} height={56} fill="#ffd34d" />
              <circle cx={cutX} cy={0} r={30 * glint} fill="#fff2a0" opacity={0.5} />
              <path d={`M ${cutX} -70 L ${cutX + 6} -6 L ${cutX + 70} 0 L ${cutX + 6} 6 L ${cutX} 70 L ${cutX - 6} 6 L ${cutX - 70} 0 L ${cutX - 6} -6 Z`} fill="#fffbe0" transform={`rotate(${t * 40} ${cutX} 0) scale(${0.4 + glint * 0.6})`} style={{ transformOrigin: `${cutX}px 0px` }} />
            </g>
          )}
        </g>
      )}
      {/* opened: the cut face of the left piece with the hollow, coins and the letter; right piece slides away */}
      {open > 0 && (
        <>
          <g>
            <ellipse cx={cutX} cy={0} rx={24} ry={R - 2} fill="#e2c08a" {...st} />
            <ellipse cx={cutX} cy={0} rx={14} ry={36} fill="#2a1a0e" />
            {[-20, 0, 18].map((cy, i) => coin(cutX + 2, cy, i))}
            {letter && <rect x={cutX - 6} y={-30} width={12} height={20} rx={3} fill="#f3e6c4" stroke={OUT} strokeWidth={2} />}
          </g>
          <g transform={`translate(${shift} ${-open * 14}) rotate(${tilt} ${cutX} 0)`}>
            {piece(cutX, L1, false, true)}
            <ellipse cx={cutX} cy={0} rx={22} ry={R - 2} fill="#d2ae78" {...st} />
            <ellipse cx={cutX} cy={0} rx={12} ry={32} fill="#3a2614" />
          </g>
          {/* spilled coins in the gap */}
          {[0, 1, 2, 3, 4].map((i) => coin(cutX + 30 + i * 26 * open, R - 6 - (i % 2) * 10, i + 5))}
          <circle cx={cutX + 40} cy={0} r={90 * open} fill="#fff2a0" opacity={0.18 + Math.sin(t * 4) * 0.06} />
        </>
      )}
      {wet > 0 && [0, 1, 2].map((i) => <circle key={i} cx={-120 + i * 110} cy={R + 4 + ((t * 40 + i * 13) % 20)} r={5} fill="#bfe9ff" opacity={wet * 0.8} />)}
    </g>
  );
};

/** Top-down insert: the hollowed log on a flat stone; coins pour into the hollow (coins 0..1), the letter slides in
 * (letter 0..1), the plug closes it (plug 0..1). Size w x h, screen space. */
export const HollowLogTop: React.FC<{ t: number; w: number; h: number; coins: number; letter: number; plug?: number; chips?: number }> = ({ t, w, h, coins, letter, plug = 0, chips = 1 }) => {
  const cx = w / 2;
  const cy = h * 0.48;
  const pile = (n: number, ox: number, oy: number, k: number) =>
    Array.from({ length: n }).map((_, i) => {
      const a = i * 2.39;
      const rr = Math.sqrt(i) * 16;
      const px = ox + Math.cos(a) * rr;
      const py = oy + Math.sin(a) * rr * 0.7;
      const inX = cx - 120 + (i % 9) * 30;
      const inY = cy - 10 + Math.floor(i / 9) * 14;
      const kk = Math.max(0, Math.min(1, k * 1.6 - (i / n) * 0.6));
      return (
        <g key={i} transform={`translate(${mix(px, inX, kk)} ${mix(py, inY, kk)})`}>
          <ellipse cx={0} cy={0} rx={20} ry={14} fill="#d9a520" stroke={OUT} strokeWidth={2.5} />
          <ellipse cx={-3} cy={-3} rx={12} ry={6} fill="#ffe27a" opacity={0.55 + Math.sin(t * 5 + i) * 0.35} />
        </g>
      );
    });
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#8d8a80" />
      {/* flat stones */}
      <path d={`M -40 ${h * 0.12} Q ${w * 0.4} ${h * 0.04} ${w + 40} ${h * 0.16} L ${w + 40} ${h * 0.86} Q ${w * 0.5} ${h * 0.94} -40 ${h * 0.82} Z`} fill="#b7ae9c" {...st} />
      <path d={`M ${w * 0.1} ${h * 0.7} Q ${w * 0.3} ${h * 0.66} ${w * 0.42} ${h * 0.74}`} fill="none" stroke="#968e7c" strokeWidth={5} />
      {/* log from above */}
      <rect x={cx - 360} y={cy - 110} width={720} height={220} rx={110} fill="#8f6440" {...st} strokeWidth={6} />
      {[-60, -20, 30, 70].map((gy, i) => (
        <path key={i} d={`M ${cx - 330} ${cy + gy} Q ${cx} ${cy + gy + (i % 2 ? 12 : -10)} ${cx + 330} ${cy + gy}`} fill="none" stroke="#6e4a2e" strokeWidth={5} opacity={0.7} />
      ))}
      <g transform={`translate(${cx - 230} ${cy - 50}) rotate(-24)`}>
        <ellipse cx={0} cy={0} rx={40} ry={26} fill="#5a3a22" {...st} />
        <path d="M -24 2 Q -6 -18 12 -6 Q 24 4 6 12" fill="none" stroke="#c89a68" strokeWidth={5} />
      </g>
      {/* hollow */}
      <rect x={cx - 160} y={cy - 50} width={320} height={100} rx={46} fill="#3a2614" {...st} strokeWidth={5} />
      <rect x={cx - 150} y={cy - 44} width={300} height={22} rx={10} fill="#e2c08a" opacity={0.45} />
      {/* coins pile on the stone -> into the hollow */}
      {pile(22, cx + 40, h * 0.78, coins)}
      {/* letter: folded paper slides in */}
      <g transform={`translate(${mix(cx - 260, cx + 60, letter)} ${mix(h * 0.8, cy + 4, letter)}) rotate(${mix(-18, 0, letter)})`}>
        <rect x={-80} y={-36} width={160} height={72} rx={6} fill="#f3e6c4" stroke={OUT} strokeWidth={4} />
        <path d="M -80 -36 L 0 6 L 80 -36" fill="none" stroke="#c9b48a" strokeWidth={4} />
        <path d="M -10 -36 L -10 36 M 10 -36 L 10 36" stroke="#8a3a2a" strokeWidth={5} />
      </g>
      {/* plug */}
      {plug > 0 && <rect x={cx - 170} y={cy - 56 - (1 - plug) * 140} width={340} height={112} rx={50} fill="#a87a4e" {...st} strokeWidth={5} opacity={Math.min(1, plug * 2)} />}
      {/* wood chips that drift */}
      {chips > 0 &&
        Array.from({ length: 10 }).map((_, i) => {
          const px = (i * 173 + t * (18 + i * 4)) % (w + 200) - 100;
          const py = h * 0.2 + ((i * 97) % (h * 0.6));
          return <path key={i} d={`M ${px} ${py} q 14 -8 26 0 q -12 8 -26 0 Z`} fill="#d9b47e" stroke={OUT} strokeWidth={2} transform={`rotate(${i * 40 + t * 30} ${px + 13} ${py})`} opacity={chips} />;
        })}
    </g>
  );
};

// ------------------------------------------------------------------ small props
/** Folded letter tied with a red thread; open 0..1 unfolds it (scribble lines, no readable text). */
export const FoldedLetter: React.FC<{ x: number; y: number; s?: number; rot?: number; open?: number }> = ({ x, y, s = 1, rot = 0, open = 0 }) => {
  const h = mix(60, 190, open);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-80} y={-h / 2} width={160} height={h} rx={6} fill="#f3e6c4" stroke={OUT} strokeWidth={4} />
      {open < 0.5 ? (
        <path d="M -12 -30 L -12 30 M 12 -30 L 12 30" stroke="#8a3a2a" strokeWidth={5} />
      ) : (
        Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M -60 ${-h / 2 + 30 + i * 24} q 20 -6 40 0 t 40 0 t 40 0`} fill="none" stroke="#5a4a3a" strokeWidth={3} opacity={(open - 0.5) * 2} />
        ))
      )}
      <path d={`M -80 ${-h / 2 + h * 0.5} L 80 ${-h / 2 + h * 0.5}`} stroke="#d8c8a0" strokeWidth={3} opacity={open} />
    </g>
  );
};

/** Hand saw (blade + wooden handle). */
export const HandSaw: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -20 L 320 -34 L 320 10 L 0 20 Z" fill="#c9ccd0" {...st} />
    <path d={Array.from({ length: 22 }).map((_, i) => `${i ? "L" : "M"} ${i * 14.5} ${20 - i * 0.5 + (i % 2 ? 8 : 0)}`).join(" ")} fill="none" stroke={OUT} strokeWidth={3} />
    <path d="M 20 -12 L 300 -24" stroke="#ffffff" strokeWidth={4} opacity={0.7} />
    <path d="M 300 -50 Q 380 -60 390 -10 Q 392 30 320 26 Z" fill="#8a5a34" {...st} />
    <ellipse cx={350} cy={-12} rx={18} ry={14} fill="#3a2614" />
  </g>
);

/** Sawdust falling from (x, y) while `on` > 0, settling on `floor`. */
export const Sawdust: React.FC<{ x: number; y: number; t: number; on: number; floor?: number; n?: number }> = ({ x, y, t, on, floor = 140, n = 18 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const ph = ((t * 1.6 + i / n) % 1 + 1) % 1;
      const px = x + Math.sin(i * 7.1) * 26 + ph * Math.sin(i * 3.3) * 30;
      const py = y + ph * floor;
      return <circle key={i} cx={px} cy={py} r={2.5 + (i % 3)} fill="#e8c890" opacity={on * (1 - ph * 0.6)} />;
    })}
    <ellipse cx={x} cy={y + floor + 4} rx={60} ry={10} fill="#e8c890" opacity={0.7} />
  </g>
);

/** Cloth curtain in a doorway (top at y), fluttering in the breeze; lift 0..1 raises a corner. */
export const DoorCurtain: React.FC<{ x: number; y: number; w?: number; h?: number; t: number; color?: string; stripe?: string; lift?: number }> = ({
  x,
  y,
  w = 220,
  h = 360,
  t,
  color = "#b8553a",
  stripe = "#e8c07a",
  lift = 0,
}) => {
  const n = 6;
  let d = `M ${x} ${y}`;
  d += ` L ${x + w} ${y}`;
  const hemPts = Array.from({ length: n + 1 }).map((_, i) => {
    const k = i / n;
    const px = x + w - k * w + Math.sin(t * 2.2 + k * 4) * 12;
    const py = y + h - Math.sin(t * 1.7 + k * 3) * 8 - (k > 0.6 ? lift * (k - 0.6) * 300 : 0);
    return `${px} ${py}`;
  });
  d += ` L ${hemPts[0]}`;
  for (let i = 1; i <= n; i++) d += ` L ${hemPts[i]}`;
  d += " Z";
  return (
    <g>
      <path d={d} fill={color} {...st} />
      {[0.25, 0.5, 0.75].map((k, i) => (
        <path key={i} d={`M ${x + k * w} ${y + 6} Q ${x + k * w + Math.sin(t * 2 + i) * 10} ${y + h * 0.5} ${x + k * w + Math.sin(t * 2.2 + k * 4) * 12} ${y + h - 10}`} fill="none" stroke="#00000030" strokeWidth={6} />
      ))}
      <path d={`M ${x} ${y + 40} L ${x + w} ${y + 40}`} stroke={stripe} strokeWidth={12} />
      <rect x={x - 14} y={y - 12} width={w + 28} height={14} rx={6} fill="#6e4426" {...st} strokeWidth={3} />
    </g>
  );
};

/** Stack of firewood sticks. */
export const Woodpile: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[
      [-80, -20, 0],
      [0, -20, 0],
      [80, -20, 0],
      [-40, -60, 0],
      [40, -60, 0],
      [0, -100, 0],
    ].map(([cx, cy], i) => (
      <g key={i}>
        <rect x={cx - 150} y={cy - 20} width={150} height={40} rx={18} fill={i % 2 ? "#7a5232" : "#8f6440"} {...st} />
        <ellipse cx={cx} cy={cy} rx={14} ry={20} fill="#d9b47e" {...st} strokeWidth={3} />
        <circle cx={cx} cy={cy} r={6} fill="none" stroke="#b08458" strokeWidth={2} />
      </g>
    ))}
  </g>
);
