// Village & farm assets (library). Built for "sone-ka-matka", reusable for any village story.

import React from "react";
import { LINE, OUT } from "../kit";

const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type Mood = "morning" | "day" | "evening";
const SKY: Record<Mood, { top: string; mid: string; low: string; sun: string; sunY: number; hill: string; hillShade: string; ground: string; groundShade: string }> = {
  morning: { top: "#9fd0ee", mid: "#ffe3b8", low: "#ffd29a", sun: "#fff1c2", sunY: 520, hill: "#d9b48c", hillShade: "#c49a72", ground: "#d9a874", groundShade: "#c08a58" },
  day: { top: "#7fc4ee", mid: "#cfeaff", low: "#fff2d6", sun: "#fff8d8", sunY: 260, hill: "#cfb08a", hillShade: "#b8966e", ground: "#dcae79", groundShade: "#c49260" },
  evening: { top: "#f29a6b", mid: "#ffc98a", low: "#ffe2b0", sun: "#ffe6a8", sunY: 640, hill: "#c98d6a", hillShade: "#ad7254", ground: "#d49a68", groundShade: "#b77c4e" },
};
export const moodColors = (m: Mood) => SKY[m];

export const VillageSky: React.FC<{ mood: Mood; sunX?: number }> = ({ mood, sunX = 700 }) => {
  const c = SKY[mood];
  return (
    <g>
      <defs>
        <linearGradient id={`vsky-${mood}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="0.6" stopColor={c.mid} />
          <stop offset="1" stopColor={c.low} />
        </linearGradient>
        <radialGradient id={`vsun-${mood}`}>
          <stop offset="0" stopColor={c.sun} stopOpacity="1" />
          <stop offset="0.3" stopColor={c.sun} stopOpacity="0.5" />
          <stop offset="1" stopColor={c.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-3000} y={-3000} width={9000} height={7000} fill={`url(#vsky-${mood})`} />
      <circle cx={sunX} cy={c.sunY} r={330} fill={`url(#vsun-${mood})`} />
      <circle cx={sunX} cy={c.sunY} r={70} fill={c.sun} stroke="#ffd77a" strokeWidth={6} />
    </g>
  );
};

export const Hills: React.FC<{ mood: Mood }> = ({ mood }) => {
  const c = SKY[mood];
  return (
    <g>
      <path d="M -1500 1150 Q -900 900 -300 1060 Q 300 860 900 1040 Q 1500 900 2200 1060 Q 2800 940 3400 1080 L 3400 2600 L -1500 2600 Z" fill={c.hill} />
      <path d="M -300 1060 Q 300 860 900 1040 Q 500 960 -300 1080 Z" fill={c.hillShade} />
      <path d="M 1500 980 Q 2100 920 2200 1060 Q 1800 1000 1500 1000 Z" fill={c.hillShade} />
    </g>
  );
};

export const Birds: React.FC<{ t: number; x: number; y: number; n?: number }> = ({ t, x, y, n = 4 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const bx = x + ((t * 60 + i * 90) % 1600) - 300;
      const by = y + Math.sin(t * 1.5 + i) * 20 + i * 18;
      const flap = Math.sin(t * 10 + i) * 8;
      return <path key={i} d={`M ${bx - 16} ${by - flap} Q ${bx - 6} ${by - 8} ${bx} ${by} Q ${bx + 6} ${by - 8} ${bx + 16} ${by - flap}`} fill="none" stroke="#4a3426" strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);

/** Dry farmland: furrows, cracks, pebbles. */
export const FarmGround: React.FC<{ mood: Mood; y: number }> = ({ mood, y }) => {
  const c = SKY[mood];
  return (
    <g>
      <rect x={-2000} y={y - 60} width={6000} height={3000} fill={c.ground} />
      <path d={`M -2000 ${y - 60} Q 0 ${y - 100} 2000 ${y - 70} Q 3000 ${y - 50} 4000 ${y - 80} L 4000 ${y - 40} L -2000 ${y - 40} Z`} fill={c.groundShade} opacity={0.6} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M -1500 ${y + 40 + i * 70} Q 500 ${y + 20 + i * 74} 3500 ${y + 46 + i * 70}`} fill="none" stroke={c.groundShade} strokeWidth={8 + i} strokeLinecap="round" opacity={0.55} />
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const cx = -900 + i * 330 + (i % 3) * 60;
        const cy = y + 120 + (i % 4) * 140;
        return <path key={`c${i}`} d={`M ${cx} ${cy} l 30 14 l -10 26 l 34 10 M ${cx + 30} ${cy + 14} l 26 -12`} fill="none" stroke="#9c6c42" strokeWidth={3} strokeLinecap="round" opacity={0.6} />;
      })}
      {Array.from({ length: 18 }, (_, i) => (
        <ellipse key={`p${i}`} cx={-1000 + i * 260 + (i % 2) * 90} cy={y + 60 + (i % 5) * 110} rx={10 + (i % 3) * 5} ry={7 + (i % 3) * 3} fill="#b9916a" {...stroke} strokeWidth={2.5} />
      ))}
    </g>
  );
};

export const Bush: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={70} ry={10} fill="#6b4422" opacity={0.25} />
    <circle cx={-30} cy={-30} r={34} fill="#8a9a4a" {...stroke} />
    <circle cx={20} cy={-40} r={40} fill="#9aab55" {...stroke} />
    <circle cx={46} cy={-20} r={26} fill="#7f8f44" {...stroke} />
  </g>
);

export const Stone: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 0 Q -44 -26 -16 -36 Q 16 -44 36 -24 Q 46 -8 40 0 Z" fill="#b8a48a" {...stroke} />
    <path d="M 4 -38 Q 26 -32 36 -14 Q 24 -22 8 -26 Z" fill="#d2c0a6" />
  </g>
);

/** Flat-roofed mud house with beam ends, small window and an optional door that swings open. */
export const MudHouse: React.FC<{ x: number; y: number; w?: number; h?: number; door?: number; tone?: number; doorX?: number }> = ({
  x,
  y,
  w = 520,
  h = 360,
  door,
  tone = 0,
  doorX = 0,
}) => {
  const wall = ["#d9a873", "#cf9c68", "#e0b382"][tone % 3];
  const wallShade = ["#bf8c58", "#b5824f", "#c99a68"][tone % 3];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={w * 0.55} ry={16} fill="#6b4422" opacity={0.25} />
      <path d={`M ${-w / 2} 0 L ${-w / 2 + 6} ${-h} Q 0 ${-h - 14} ${w / 2 - 6} ${-h} L ${w / 2} 0 Z`} fill={wall} {...stroke} />
      <path d={`M ${w / 2 - 70} ${-h + 4} L ${w / 2 - 6} ${-h} L ${w / 2} 0 L ${w / 2 - 50} 0 Z`} fill={wallShade} />
      {/* roof beams sticking out */}
      {[-0.35, -0.1, 0.15, 0.4].map((k, i) => (
        <rect key={i} x={w * k - 10} y={-h - 22} width={20} height={30} rx={6} fill="#8a5a36" {...stroke} />
      ))}
      {/* plaster texture */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${-w / 2 + 40 + i * 110} ${-h + 80 + (i % 2) * 90} q 30 -10 60 0`} fill="none" stroke={wallShade} strokeWidth={5} strokeLinecap="round" />
      ))}
      <rect x={w * 0.18} y={-h * 0.72} width={70} height={70} rx={10} fill="#4a2e1c" {...stroke} />
      <path d={`M ${w * 0.18 + 35} ${-h * 0.72} L ${w * 0.18 + 35} ${-h * 0.72 + 70} M ${w * 0.18} ${-h * 0.72 + 35} L ${w * 0.18 + 70} ${-h * 0.72 + 35}`} stroke="#8a5a36" strokeWidth={6} />
      {door !== undefined && (
        <g transform={`translate(${doorX - 80} 0)`}>
          {/* doorway (dark interior) */}
          <path d="M 0 0 L 0 -190 Q 80 -240 160 -190 L 160 0 Z" fill="#3a2414" {...stroke} />
          {/* door leaf swinging inward: narrows as it opens */}
          <g transform={`scale(${1 - door * 0.82} 1)`}>
            <path d="M 0 0 L 0 -190 Q 80 -240 160 -190 L 160 0 Z" fill="#9c6a42" {...stroke} />
            {[40, 80, 120].map((dx) => (
              <path key={dx} d={`M ${dx} -10 L ${dx} -200`} stroke="#7a4f2e" strokeWidth={5} />
            ))}
            <circle cx={130} cy={-100} r={7} fill="#d9b25a" {...stroke} strokeWidth={2} />
          </g>
        </g>
      )}
    </g>
  );
};

export const MudWall: React.FC<{ x: number; y: number; w: number; h?: number }> = ({ x, y, w, h = 160 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M 0 0 L 4 ${-h} Q ${w / 2} ${-h - 12} ${w - 4} ${-h} L ${w} 0 Z`} fill="#d4a26e" {...stroke} />
    {Array.from({ length: Math.floor(w / 120) }, (_, i) => (
      <path key={i} d={`M ${30 + i * 120} ${-h + 50 + (i % 2) * 40} q 26 -8 52 0`} fill="none" stroke="#b9875a" strokeWidth={5} strokeLinecap="round" />
    ))}
  </g>
);

export const Charpai: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-80} width={300} height={40} rx={8} fill="#e8d3a4" {...stroke} />
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={`M ${-140 + i * 35} -78 L ${-120 + i * 35} -42`} stroke="#c9ad74" strokeWidth={4} />
    ))}
    {[-140, 130].map((lx) => (
      <rect key={lx} x={lx} y={-84} width={16} height={84} rx={5} fill="#8a5a36" {...stroke} />
    ))}
  </g>
);

export const ClayPots: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i * 70} 0) scale(${1 - i * 0.15})`}>
        <path d="M -30 0 Q -50 -50 -20 -80 L -16 -96 L 16 -96 L 20 -80 Q 50 -50 30 0 Z" fill={i % 2 ? "#c06a3c" : "#b45f34"} {...stroke} />
        <path d="M -24 -60 Q 0 -54 24 -60" fill="none" stroke="#8e4523" strokeWidth={4} />
      </g>
    ))}
  </g>
);

export const Goat: React.FC<{ x: number; y: number; t: number; s?: number; flip?: boolean }> = ({ x, y, t, s = 1, flip }) => {
  const chew = Math.sin(t * 6) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="#6b4422" opacity={0.25} />
      {[-40, -26, 30, 44].map((lx, i) => (
        <rect key={i} x={lx} y={-50} width={12} height={50} rx={5} fill={i % 2 ? "#f2ede2" : "#ded6c6"} {...stroke} strokeWidth={3} />
      ))}
      <ellipse cx={0} cy={-62} rx={64} ry={32} fill="#f4efe4" {...stroke} />
      <path d="M -62 -70 Q -80 -84 -76 -96" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
      <g transform={`translate(54 -86) rotate(${Math.sin(t * 0.8) * 6})`}>
        <ellipse cx={18} cy={0} rx={26} ry={20} fill="#f4efe4" {...stroke} />
        <path d="M 10 -16 Q 4 -40 -12 -46" fill="none" stroke="#8a7a62" strokeWidth={6} strokeLinecap="round" />
        <path d="M 2 -6 Q -18 4 -14 16 Q -2 10 6 4 Z" fill="#d9cfbd" {...stroke} strokeWidth={3} />
        <circle cx={22} cy={-4} r={3.5} fill={OUT} />
        <path d={`M 36 ${10 + chew} Q 40 ${24 + chew} 32 ${30 + chew}`} fill="none" stroke="#bdb09a" strokeWidth={5} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Clay pot (matka). `lid` 0..1 slides the lid off, `dirt` dusts it, `glow` lights it from inside. */
export const Matka: React.FC<{ x: number; y: number; s?: number; lid?: number; dirt?: number; glow?: number; t?: number }> = ({ x, y, s = 1, lid = 0, dirt = 0, glow = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={-120} r={160 + Math.sin(t * 6) * 10} fill="#ffd34d" opacity={glow * 0.35} />}
    <ellipse cx={0} cy={4} rx={80} ry={12} fill="#6b4422" opacity={0.3} />
    <path d="M -70 -10 Q -100 -80 -60 -120 L -44 -136 L 44 -136 L 60 -120 Q 100 -80 70 -10 Q 0 10 -70 -10 Z" fill="#b45f34" {...stroke} />
    <path d="M -60 -92 Q 0 -80 60 -92" fill="none" stroke="#8e4523" strokeWidth={6} />
    <path d="M -50 -60 Q 0 -50 50 -60" fill="none" stroke="#8e4523" strokeWidth={4} />
    <path d="M 40 -110 Q 70 -80 56 -30" fill="none" stroke="#d27a4a" strokeWidth={8} strokeLinecap="round" />
    <ellipse cx={0} cy={-136} rx={46} ry={12} fill={glow > 0 ? "#ffcf3a" : "#5b2c14"} {...stroke} />
    {glow > 0 &&
      [0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={-30 + i * 15} cy={-140 + (i % 2) * 4} r={9} fill="#ffd34d" stroke="#b7831a" strokeWidth={2.5} />
      ))}
    {dirt > 0 && (
      <g opacity={dirt}>
        <path d="M -66 -40 Q -40 -20 -10 -36 Q 20 -14 64 -40 L 70 -10 Q 0 10 -70 -10 Z" fill="#8e6a44" />
        <circle cx={-30} cy={-90} r={12} fill="#9c7650" />
        <circle cx={30} cy={-70} r={16} fill="#9c7650" />
      </g>
    )}
    {/* lid */}
    <g transform={`translate(${lid * 120} ${-136 + lid * 30}) rotate(${lid * 40})`}>
      <ellipse cx={0} cy={-6} rx={54} ry={16} fill="#a45530" {...stroke} />
      <ellipse cx={0} cy={-16} rx={14} ry={9} fill="#8e4523" {...stroke} />
      {dirt > 0 && <ellipse cx={-10} cy={-8} rx={30} ry={8} fill="#8e6a44" opacity={dirt} />}
    </g>
  </g>
);

/** Sparkle star. */
export const Sparkle: React.FC<{ x: number; y: number; s: number; a: number }> = ({ x, y, s, a }) => (
  <path transform={`translate(${x} ${y}) scale(${s}) rotate(${a})`} d="M 0 -20 Q 3 -3 20 0 Q 3 3 0 20 Q -3 3 -20 0 Q -3 -3 0 -20 Z" fill="#fff6c8" stroke="#ffd34d" strokeWidth={2} />
);

/** Insert shot looking into the opened pot: piles of gold coins, rays and sparkles. */
export const GoldInside: React.FC<{ t: number; open: number; w: number; h: number }> = ({ t, open, w, h }) => {
  const cx = w / 2;
  const cy = h * 0.55;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#2b170c" />
      {/* rays */}
      <g opacity={open} transform={`translate(${cx} ${cy}) rotate(${t * 8})`}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} transform={`rotate(${i * 30})`} d="M -30 0 L 30 0 L 120 -1400 L -120 -1400 Z" fill="#ffd970" opacity={0.18} />
        ))}
      </g>
      {/* pot mouth */}
      <ellipse cx={cx} cy={cy} rx={w * 0.46} ry={w * 0.32} fill="#b45f34" {...stroke} strokeWidth={8} />
      <ellipse cx={cx} cy={cy} rx={w * 0.38} ry={w * 0.25} fill="#3b1d0d" {...stroke} strokeWidth={6} />
      {/* coins */}
      <g opacity={Math.min(1, open * 1.5)}>
        {Array.from({ length: 34 }, (_, i) => {
          const a = i * 2.39;
          const r = Math.sqrt(i / 34) * w * 0.33;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r * 0.62 - (1 - i / 34) * 30;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={34} ry={22} fill={i % 3 ? "#ffcf3a" : "#f2b51f"} stroke="#a8740f" strokeWidth={4} />
              <ellipse cx={x - 6} cy={y - 5} rx={12} ry={6} fill="#fff1a8" opacity={0.8} />
            </g>
          );
        })}
      </g>
      {Array.from({ length: 10 }, (_, i) => {
        const ph = (t * 1.4 + i * 0.37) % 1;
        const sc = Math.sin(ph * Math.PI) * 2.2 * open;
        return <Sparkle key={i} x={cx + Math.cos(i * 2.1) * w * 0.3} y={cy + Math.sin(i * 1.7) * w * 0.18 - 30} s={sc} a={t * 90 + i * 20} />;
      })}
      {/* lid sliding off the top edge */}
      <g transform={`translate(${cx + open * w * 0.9} ${cy - w * 0.05})`}>
        <ellipse cx={0} cy={0} rx={w * 0.42} ry={w * 0.28} fill="#a45530" {...stroke} strokeWidth={8} />
        <ellipse cx={0} cy={-20} rx={70} ry={44} fill="#8e4523" {...stroke} strokeWidth={6} />
      </g>
    </g>
  );
};

/** Top-down: hands brushing soil away until the pot lid is revealed. */
export const DigTopDown: React.FC<{ t: number; reveal: number; w: number; h: number }> = ({ t, reveal, w, h }) => {
  const cx = w / 2;
  const cy = h / 2;
  const sweep = Math.sin(t * 7) * 60;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#c08a58" />
      {Array.from({ length: 40 }, (_, i) => (
        <ellipse key={i} cx={(i * 197) % w} cy={(i * 331) % h} rx={18 + (i % 4) * 8} ry={10 + (i % 3) * 5} fill={i % 2 ? "#a8784a" : "#d19b66"} />
      ))}
      {/* hole */}
      <ellipse cx={cx} cy={cy} rx={330} ry={300} fill="#8a5a34" {...stroke} />
      <ellipse cx={cx} cy={cy} rx={290} ry={260} fill="#6e4426" />
      {/* lid appears as soil clears */}
      <g opacity={reveal}>
        <circle cx={cx} cy={cy} r={170} fill="#a45530" {...stroke} strokeWidth={6} />
        <circle cx={cx} cy={cy} r={60} fill="#8e4523" {...stroke} />
        <path d={`M ${cx - 120} ${cy - 60} Q ${cx - 60} ${cy - 130} ${cx + 20} ${cy - 140}`} fill="none" stroke="#c9774a" strokeWidth={14} strokeLinecap="round" />
      </g>
      {/* soil covering, thinning out */}
      {Array.from({ length: 26 }, (_, i) => {
        const a = i * 2.39;
        const r = Math.sqrt(i / 26) * 240;
        const push = reveal * (200 + (i % 5) * 40);
        const x = cx + Math.cos(a) * (r + push);
        const y = cy + Math.sin(a) * (r + push);
        return <ellipse key={i} cx={x} cy={y} rx={46} ry={30} fill={i % 2 ? "#8a5a34" : "#9c6a40"} stroke="#5e3a1e" strokeWidth={3} opacity={1 - reveal * 0.6} />;
      })}
      {/* two hands brushing (from the bottom) */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${cx + side * 180 + (side > 0 ? sweep : -sweep)} ${h * 0.86})`}>
          <rect x={-55} y={0} width={110} height={600} rx={50} fill="#e9d9b8" {...stroke} />
          <ellipse cx={0} cy={-20} rx={62} ry={78} fill="#d99a66" {...stroke} />
          {[-36, -12, 12, 36].map((fx) => (
            <ellipse key={fx} cx={fx} cy={-92} rx={14} ry={28} fill="#d99a66" {...stroke} strokeWidth={3} />
          ))}
        </g>
      ))}
    </g>
  );
};

/** Big close-up: hoe blade striking the ground, with dirt flying and a spark on impact. */
export const HoeStrike: React.FC<{ t: number; swing: number; impact: number; w: number; h: number }> = ({ t, swing, impact, w, h }) => {
  const gy = h * 0.66;
  return (
    <g>
      <rect x={0} y={0} width={w} height={gy} fill="#f3d6a6" />
      <rect x={0} y={gy} width={w} height={h - gy} fill="#c08a58" />
      <path d={`M 0 ${gy} Q ${w / 2} ${gy - 20} ${w} ${gy}`} fill="#a8784a" />
      <circle cx={w * 0.2} cy={h * 0.2} r={380} fill="#fff1c2" opacity={0.5} />
      <path d={`M 0 ${gy - 220} Q ${w * 0.3} ${gy - 300} ${w * 0.6} ${gy - 230} Q ${w * 0.85} ${gy - 180} ${w} ${gy - 240} L ${w} ${gy} L 0 ${gy} Z`} fill="#e3bf8a" />
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse key={i} cx={(i * 173) % w} cy={gy + 40 + (i % 5) * 80} rx={22 + (i % 3) * 12} ry={12 + (i % 2) * 6} fill={i % 2 ? "#a8784a" : "#8f6038"} stroke="#5e3a1e" strokeWidth={3} />
      ))}
      {[0.08, 0.86, 0.3].map((k, i) => (
        <g key={`g${i}`} transform={`translate(${w * k} ${gy + 10}) scale(${1.6 - i * 0.3})`}>
          {[-24, -12, 0, 12, 24].map((a, j) => (
            <path key={j} d={`M ${a * 0.4} 0 Q ${a} -40 ${a * 1.8} ${-70 - (j % 2) * 20 + Math.sin(t * 2 + j) * 4}`} fill="none" stroke={j % 2 ? "#8aa24a" : "#a6b85a"} strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      ))}
      {/* the hoe comes down from the top-right */}
      <g transform={`translate(${w * 0.55} ${gy - 30 - (1 - swing) * 420}) rotate(${-25 + swing * 25})`}>
        <rect x={-14} y={-900} width={28} height={900} rx={12} fill="#a0703f" {...stroke} strokeWidth={6} />
        <path d="M -16 -30 L -150 -20 L -170 40 Q -90 60 -10 30 Z" fill="#7d8a90" {...stroke} strokeWidth={6} />
        <path d="M -140 -10 L -40 -18" stroke="#b9c6cc" strokeWidth={8} strokeLinecap="round" />
      </g>
      {impact > 0 && (
        <g>
          {Array.from({ length: 12 }, (_, i) => {
            const a = -Math.PI / 2 + (i - 6) * 0.22;
            const d = impact * (160 + (i % 4) * 70);
            return <ellipse key={i} cx={w * 0.47 + Math.cos(a) * d} cy={gy - 10 + Math.sin(a) * d + impact * impact * 200} rx={16 + (i % 3) * 6} ry={12} fill="#8a5a34" stroke="#5e3a1e" strokeWidth={3} opacity={1 - impact * 0.7} />;
          })}
          <g opacity={Math.max(0, 1 - impact * 2.2)}>
            <Sparkle x={w * 0.47} y={gy - 10} s={3.2} a={t * 200} />
          </g>
          <ellipse cx={w * 0.47} cy={gy} rx={240 * impact + 60} ry={40 * impact + 10} fill="#e0c7a0" opacity={(1 - impact) * 0.7} />
        </g>
      )}
      <text x={w * 0.62} y={gy - 160} fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={150} fill="#fff" stroke={OUT} strokeWidth={10} paintOrder="stroke" opacity={impact > 0 && impact < 0.8 ? 1 : 0} transform={`rotate(-8 ${w * 0.62} ${gy - 160})`}>
        TAK!
      </text>
    </g>
  );
};

/** Extreme close-up of a hand gripping the hoe handle, freezing in surprise. */
export const HandGrip: React.FC<{ t: number; freeze: number; w: number; h: number }> = ({ t, freeze, w, h }) => {
  const tremble = (1 - freeze) * Math.sin(t * 30) * 4;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#e8c08c" />
      <circle cx={w * 0.7} cy={h * 0.25} r={500} fill="#fff1c2" opacity={0.35} />
      <rect x={w / 2 - 50} y={-100} width={100} height={h + 200} rx={40} fill="#a0703f" {...stroke} strokeWidth={8} transform={`rotate(-12 ${w / 2} ${h / 2})`} />
      <g transform={`translate(${w / 2 + tremble} ${h * 0.52}) rotate(-12) scale(${1 + freeze * 0.04})`}>
        <path d="M -300 120 Q -320 -60 -140 -150 L 160 -160 Q 230 -150 230 -60 L 230 90 Q 220 180 120 190 L -200 200 Z" fill="#d99a66" {...stroke} strokeWidth={8} />
        {[-110, -40, 30, 100].map((y, i) => (
          <path key={i} d={`M -40 ${y} Q 140 ${y - 30 + freeze * 40} 200 ${y + 20}`} fill="none" stroke="#b77a48" strokeWidth={8} strokeLinecap="round" />
        ))}
        <path d="M -900 20 L -300 0 L -290 160 L -900 200 Z" fill="#e9d9b8" {...stroke} strokeWidth={8} />
      </g>
    </g>
  );
};

/** Elder's place: reed mat and cushion in the shade. */
export const SeatMat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={260} ry={40} fill="#d8bc7c" {...stroke} />
    {[-180, -100, -20, 60, 140].map((dx) => (
      <path key={dx} d={`M ${dx} -30 L ${dx + 30} 30`} stroke="#b89c5c" strokeWidth={5} />
    ))}
    <ellipse cx={-90} cy={-20} rx={90} ry={34} fill="#8c3b3b" {...stroke} />
  </g>
);

/** Soft golden light rays from above (overlay). */
export const LightRays: React.FC<{ x: number; y: number; t: number; o?: number }> = ({ x, y, t, o = 0.18 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {[-28, -14, 0, 14, 28].map((a, i) => (
      <path key={i} transform={`rotate(${a + Math.sin(t * 0.6 + i) * 2})`} d="M -30 0 L 30 0 L 200 2400 L -200 2400 Z" fill="#fff3c4" />
    ))}
  </g>
);
