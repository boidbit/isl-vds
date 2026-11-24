// Village & farm assets (library). Built for "sone-ka-matka", reusable for any village story.

import React from "react";
import { blink, LINE, OUT } from "../kit";

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

/**
 * Detailed flat-roofed mud house: plinth + step, parapet with roof beams, hay on the roof, water spout,
 * plaster cracks and bare-brick patches, lime border, wall niche with a diya, wooden window with half-open
 * shutters and bars, door frame with lintel, planked door with studs and a ring (swings open with `door` 0..1).
 */
export const MudHouse: React.FC<{ x: number; y: number; w?: number; h?: number; door?: number; tone?: number; doorX?: number; t?: number }> = ({
  x,
  y,
  w = 520,
  h = 360,
  door,
  tone = 0,
  doorX = 0,
  t = 0,
}) => {
  const wall = ["#d9a873", "#cf9c68", "#e0b382"][tone % 3];
  const wallShade = ["#bf8c58", "#b5824f", "#c99a68"][tone % 3];
  const wallLight = ["#e8c08f", "#deb07f", "#eec79a"][tone % 3];
  const brick = "#b46a44";
  const wood = "#8a5a36";
  const woodDark = "#6a4226";
  const hw = w / 2;
  const winX = w * 0.18;
  const winY = -h * 0.72;
  const nicheX = -w * 0.34;
  const flame = 1 + Math.sin(t * 9) * 0.12;
  const Bricks: React.FC<{ bx: number; by: number; rows: number; cols: number }> = ({ bx, by, rows, cols }) => (
    <g transform={`translate(${bx} ${by})`}>
      <path d={`M -6 -4 Q ${cols * 15} -14 ${cols * 30 + 6} -2 L ${cols * 30 + 2} ${rows * 16 + 4} Q ${cols * 14} ${rows * 16 + 12} -4 ${rows * 16 + 2} Z`} fill={wallShade} />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect key={`${r}-${c}`} x={c * 30 + (r % 2) * 14 - 4} y={r * 16} width={26} height={12} rx={2} fill={brick} stroke={OUT} strokeWidth={2} />
        )),
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={10} rx={w * 0.6} ry={18} fill="#6b4422" opacity={0.25} />
      {/* hay bundle on the roof (behind parapet) */}
      <g transform={`translate(${-hw * 0.55} ${-h - 8})`}>
        <path d="M -60 0 Q -56 -40 -10 -50 Q 40 -54 62 -18 L 64 0 Z" fill="#d8b45a" {...stroke} />
        {[-40, -20, 0, 20, 40].map((k) => (
          <path key={k} d={`M ${k} -4 q 4 -22 12 -38`} fill="none" stroke="#b8923e" strokeWidth={3} strokeLinecap="round" />
        ))}
      </g>
      {/* main wall */}
      <path d={`M ${-hw} 0 L ${-hw + 6} ${-h} L ${hw - 6} ${-h} L ${hw} 0 Z`} fill={wall} {...stroke} />
      {/* sunlit top-left wash and shaded right side */}
      <path d={`M ${-hw + 10} ${-h + 10} L ${-hw * 0.2} ${-h + 10} Q ${-hw * 0.5} ${-h * 0.6} ${-hw + 14} ${-h * 0.35} Z`} fill={wallLight} opacity={0.7} />
      <path d={`M ${hw - 70} ${-h + 4} L ${hw - 6} ${-h} L ${hw} 0 L ${hw - 50} 0 Z`} fill={wallShade} />
      {/* shadow under the roof slab */}
      <path d={`M ${-hw + 6} ${-h + 2} L ${hw - 6} ${-h + 2} L ${hw - 8} ${-h + 18} Q 0 ${-h + 26} ${-hw + 8} ${-h + 18} Z`} fill={wallShade} opacity={0.8} />
      {/* parapet with rounded mud bumps */}
      <path
        d={`M ${-hw - 8} ${-h + 4} L ${-hw - 6} ${-h - 18} ${Array.from({ length: 6 }, (_, i) => {
          const x0 = -hw - 6 + ((w + 12) / 6) * i;
          const x1 = x0 + (w + 12) / 6;
          return `Q ${(x0 + x1) / 2} ${-h - 32 - (i % 2) * 4} ${x1} ${-h - 18}`;
        }).join(" ")} L ${hw + 8} ${-h + 4} Z`}
        fill={wallLight}
        {...stroke}
      />
      <path d={`M ${-hw - 4} ${-h - 2} L ${hw + 4} ${-h - 2}`} stroke={wallShade} strokeWidth={5} strokeLinecap="round" />
      {/* roof beams sticking out, with end grain */}
      {[-0.36, -0.12, 0.12, 0.36].map((k, i) => (
        <g key={i}>
          <rect x={w * k - 11} y={-h - 4} width={22} height={22} rx={6} fill={wood} {...stroke} />
          <circle cx={w * k} cy={-h + 7} r={5} fill="none" stroke={woodDark} strokeWidth={2.5} />
        </g>
      ))}
      {/* water spout (parnala) with a stain below */}
      <path d={`M ${hw - 30} ${-h + 22} Q ${hw - 26} ${-h * 0.5} ${hw - 34} ${-h * 0.2}`} fill="none" stroke={wallShade} strokeWidth={14} strokeLinecap="round" opacity={0.7} />
      <path d={`M ${hw - 40} ${-h + 10} L ${hw + 26} ${-h + 4} L ${hw + 28} ${-h + 16} L ${hw - 40} ${-h + 24} Z`} fill={woodDark} {...stroke} strokeWidth={3} />
      {/* plaster swirls */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${-hw + 40 + i * (w / 4.6)} ${-h + 80 + (i % 2) * 90} q 30 -10 60 0`} fill="none" stroke={wallShade} strokeWidth={5} strokeLinecap="round" />
      ))}
      {/* cracks */}
      <path d={`M ${-hw + 30} ${-h + 40} l 14 22 l -6 16 l 12 20 m -12 -20 l -14 10`} fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
      <path d={`M ${winX + 80} ${winY + 76} l 10 18 l -4 14 l 10 16`} fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
      {/* bare-brick patches where plaster fell */}
      <Bricks bx={-hw * 0.62} by={-h * 0.3} rows={2} cols={3} />
      <Bricks bx={hw * 0.52} by={-h * 0.42} rows={3} cols={2} />
      {/* lime-wash border along the base */}
      <path d={`M ${-hw + 2} -34 L ${hw - 2} -34`} stroke="#f3e6cf" strokeWidth={6} />
      {Array.from({ length: Math.floor(w / 40) }, (_, i) => (
        <path key={i} d={`M ${-hw + 14 + i * 40} -34 l 10 -12 l 10 12`} fill="none" stroke="#f3e6cf" strokeWidth={4} strokeLinejoin="round" />
      ))}
      {/* wall niche (aala) with an oil lamp */}
      <g transform={`translate(${nicheX} ${-h * 0.55})`}>
        <path d="M -24 24 L -24 -10 Q 0 -38 24 -10 L 24 24 Z" fill="#5a3a22" {...stroke} strokeWidth={3} />
        <path d="M -16 24 Q 0 14 16 24 Z" fill="#b45f34" stroke={OUT} strokeWidth={2} />
        <ellipse cx={0} cy={6} rx={5 * flame} ry={9 * flame} fill="#ffcf5a" />
        <ellipse cx={0} cy={9} rx={2.5} ry={4} fill="#fff4c2" />
        <path d="M -30 26 L 30 26" stroke={wallLight} strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* wooden pegs with a hanging rope coil */}
      <g transform={`translate(${-hw * 0.12} ${-h * 0.62})`}>
        <rect x={-6} y={-4} width={14} height={8} rx={3} fill={wood} stroke={OUT} strokeWidth={2} />
        <ellipse cx={2} cy={20} rx={14} ry={22} fill="none" stroke="#c9ad74" strokeWidth={5} />
        <ellipse cx={2} cy={22} rx={9} ry={18} fill="none" stroke="#b39459" strokeWidth={3} />
      </g>
      {/* window: frame, lintel, bars, half-open shutters, sill */}
      <g transform={`translate(${winX} ${winY})`}>
        <rect x={-10} y={-16} width={90} height={14} rx={4} fill={wood} {...stroke} strokeWidth={3} />
        <rect x={0} y={0} width={70} height={70} rx={6} fill="#3a2414" {...stroke} />
        <rect x={6} y={6} width={58} height={58} rx={4} fill="#4a2e1c" />
        {[18, 35, 52].map((bx) => (
          <path key={bx} d={`M ${bx} 2 L ${bx} 68`} stroke="#5a5048" strokeWidth={4} />
        ))}
        <path d="M 0 0 L -24 8 L -24 64 L 0 70 Z" fill="#9c6a42" {...stroke} strokeWidth={3} />
        <path d="M 70 0 L 92 6 L 92 66 L 70 70 Z" fill="#8f5f3a" {...stroke} strokeWidth={3} />
        <path d="M -12 12 L -12 60 M 81 12 L 81 60" stroke={woodDark} strokeWidth={3} />
        <rect x={-14} y={70} width={98} height={10} rx={4} fill={wallLight} {...stroke} strokeWidth={3} />
      </g>
      {/* plinth (chabutra) */}
      <path d={`M ${-hw - 14} 6 L ${-hw - 10} -20 L ${hw + 10} -20 L ${hw + 14} 6 Z`} fill={wallShade} {...stroke} />
      <path d={`M ${-hw - 8} -14 L ${hw + 6} -14`} stroke={wall} strokeWidth={4} opacity={0.8} />
      {door !== undefined && (
        <g transform={`translate(${doorX - 80} 0)`}>
          {/* step */}
          <path d="M -26 10 L -20 -8 L 180 -8 L 186 10 Z" fill={wallLight} {...stroke} />
          {/* door frame (chaukhat) + lintel */}
          <path d="M -14 -8 L -14 -196 Q 80 -254 174 -196 L 174 -8 Z" fill={wood} {...stroke} />
          <rect x={-30} y={-250} width={220} height={22} rx={5} fill={woodDark} {...stroke} />
          {[-10, 30, 70, 110, 150].map((dx) => (
            <circle key={dx} cx={dx + 10} cy={-239} r={4} fill="#d9b25a" />
          ))}
          {/* doorway (dark interior) */}
          <path d="M 0 -8 L 0 -190 Q 80 -240 160 -190 L 160 -8 Z" fill="#2e1c10" {...stroke} />
          <path d="M 10 -10 L 10 -150 Q 30 -170 50 -176 L 50 -10 Z" fill="#4a2e1c" opacity={0.6 * (door ?? 0)} />
          {/* door leaf swinging inward: narrows as it opens */}
          <g transform={`scale(${1 - door * 0.82} 1)`}>
            <path d="M 0 -8 L 0 -190 Q 80 -240 160 -190 L 160 -8 Z" fill="#9c6a42" {...stroke} />
            {[32, 64, 96, 128].map((dx) => (
              <path key={dx} d={`M ${dx} -12 L ${dx} -196`} stroke="#7a4f2e" strokeWidth={5} />
            ))}
            {[-50, -150].map((by) => (
              <g key={by}>
                <rect x={6} y={by - 6} width={148} height={12} rx={3} fill="#6a4226" stroke={OUT} strokeWidth={2} />
                {[18, 50, 82, 114, 142].map((sx) => (
                  <circle key={sx} cx={sx} cy={by} r={3.5} fill="#3a3430" />
                ))}
              </g>
            ))}
            <circle cx={132} cy={-100} r={11} fill="none" stroke="#c9a24a" strokeWidth={4} />
            <circle cx={132} cy={-111} r={4} fill="#d9b25a" stroke={OUT} strokeWidth={2} />
          </g>
        </g>
      )}
      {/* grass tufts and straw at the base */}
      {[-hw - 6, -hw * 0.45, hw * 0.4, hw + 4].map((gx, i) => (
        <path key={i} d={`M ${gx - 12} 8 q 4 -20 6 -26 q 2 14 6 20 q 4 -18 10 -24 q 0 16 2 30 Z`} fill={i % 2 ? "#8a9a4a" : "#9aab55"} stroke={OUT} strokeWidth={2.5} strokeLinejoin="round" />
      ))}
      <path d={`M ${hw * 0.1} 10 l 30 -6 M ${hw * 0.14} 12 l 24 2 M ${hw * 0.2} 8 l 18 -10`} stroke="#d8b45a" strokeWidth={3} strokeLinecap="round" />
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

const GOAT_COATS = {
  white: { base: "#f4efe4", shade: "#ddd3c2", patch: "#c99a6a", nose: "#d9a5a0", beard: "#e6dccb", horn: "#a8977c" },
  brown: { base: "#b5794a", shade: "#96603a", patch: "#f2e6d2", nose: "#6e4a36", beard: "#7a5236", horn: "#8f8068" },
  black: { base: "#4a3f3a", shade: "#352c28", patch: "#e9e1d3", nose: "#2e2522", beard: "#2e2522", horn: "#9c8c74" },
};
export type GoatCoat = keyof typeof GOAT_COATS;

/**
 * Detailed desi goat (bakri): floppy ears, curved ridged horns, slit pupils with blink, beard, collar + bell,
 * coat patch and belly fur, wagging tail. `t` in seconds drives chewing/ear flicks; `graze` 0..1 lowers the head
 * to the ground, `bleat` 0..1 opens the mouth, `walk` 0..1 swings the legs. `coat`: white / brown / black.
 */
export const Goat: React.FC<{
  x: number;
  y: number;
  t: number;
  s?: number;
  flip?: boolean;
  coat?: GoatCoat;
  graze?: number;
  bleat?: number;
  walk?: number;
}> = ({ x, y, t, s = 1, flip, coat = "white", graze = 0, bleat = 0, walk = 0 }) => {
  const c = GOAT_COATS[coat];
  const chew = bleat > 0.05 ? 0 : Math.sin(t * 6) * 3;
  const open = bleat * 10;
  const f = Math.round(t * 30);
  const eye = blink(f, Math.round(x) % 50);
  const ear = Math.sin(t * 1.7) * 4 + (Math.sin(t * 0.9) > 0.92 ? Math.sin(t * 40) * 10 : 0);
  const wag = Math.sin(t * 5) * 14;
  const breathe = 1 + Math.sin(t * 2.4) * 0.015;
  const headTilt = Math.sin(t * 0.8) * 5 * (1 - graze) - bleat * 12;
  const bob = walk * Math.abs(Math.sin(t * 8)) * -3;
  const Leg: React.FC<{ lx: number; phase: number; far?: boolean }> = ({ lx, phase, far }) => (
    <g transform={`rotate(${Math.sin(t * 8 + phase) * 16 * walk} ${lx} -48)`}>
      <path d={`M ${lx} -52 Q ${lx + 3} -30 ${lx + 1} -22 L ${lx} -6`} fill="none" stroke={OUT} strokeWidth={15} strokeLinecap="round" />
      <path d={`M ${lx} -52 Q ${lx + 3} -30 ${lx + 1} -22 L ${lx} -6`} fill="none" stroke={far ? c.shade : c.base} strokeWidth={9} strokeLinecap="round" />
      <circle cx={lx + 1} cy={-24} r={4} fill={c.shade} />
      <path d={`M ${lx - 7} 0 L ${lx - 5} -9 L ${lx + 6} -9 L ${lx + 8} 0 Z`} fill="#3a2e26" stroke={OUT} strokeWidth={2} strokeLinejoin="round" />
      <path d={`M ${lx + 1} -8 L ${lx + 1} 0`} stroke="#5a4a3e" strokeWidth={1.5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={4} cy={4} rx={76} ry={11} fill="#6b4422" opacity={0.25} />
      <Leg lx={-34} phase={Math.PI} far />
      <Leg lx={40} phase={0} far />
      <g transform={`translate(0 ${bob})`}>
        {/* tail */}
        <g transform={`rotate(${wag} -62 -88)`}>
          <path d="M -62 -88 Q -76 -102 -70 -116 Q -58 -104 -54 -90 Z" fill={c.base} {...stroke} strokeWidth={3} />
        </g>
        {/* body */}
        <g transform={`translate(0 -66) scale(1 ${breathe}) translate(0 66)`}>
          <path d="M -66 -70 Q -70 -98 -40 -100 Q 0 -92 40 -102 Q 72 -104 76 -76 Q 80 -50 56 -40 Q 30 -30 0 -32 Q -30 -30 -54 -40 Q -72 -50 -66 -70 Z" fill={c.base} {...stroke} />
          <path d="M -56 -44 Q 0 -26 58 -44 Q 30 -50 0 -48 Q -30 -48 -56 -44 Z" fill={c.shade} />
          <path d="M -34 -90 Q -6 -98 10 -82 Q 14 -60 -12 -54 Q -38 -58 -38 -76 Z" fill={c.patch} opacity={0.85} />
          {/* fur strokes */}
          {[
            [-56, -78],
            [24, -90],
            [20, -76],
            [44, -72],
            [30, -58],
            [-50, -58],
          ].map(([fx, fy], i) => (
            <path key={i} d={`M ${fx} ${fy} l 4 7 M ${fx + 7} ${fy - 1} l 4 7`} fill="none" stroke={c.shade} strokeWidth={3} strokeLinecap="round" />
          ))}
          {/* belly hair tufts */}
          {[-40, -24, -8, 8, 24, 40].map((hx) => (
            <path key={hx} d={`M ${hx} -34 l -3 8 l 6 -4`} fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </g>
        <Leg lx={-48} phase={0} />
        <Leg lx={28} phase={Math.PI} />
        {/* neck + head (pivot at the shoulders for grazing) */}
        <g transform={`rotate(${graze * 80} 48 -80)`}>
          <path d="M 32 -96 Q 46 -114 60 -124 L 84 -104 Q 86 -80 72 -60 Q 56 -58 42 -70 Z" fill={c.base} {...stroke} />
          <path d="M 70 -110 Q 80 -90 70 -66" fill="none" stroke={c.shade} strokeWidth={4} strokeLinecap="round" />
          {/* collar with bell */}
          <path d="M 46 -104 Q 64 -92 82 -100" fill="none" stroke={OUT} strokeWidth={9} strokeLinecap="round" />
          <path d="M 46 -104 Q 64 -92 82 -100" fill="none" stroke="#c0392b" strokeWidth={5} strokeLinecap="round" />
          <g transform={`rotate(${Math.sin(t * 5) * 10} 66 -96)`}>
            <path d="M 59 -94 Q 58 -80 66 -78 Q 74 -80 73 -94 Z" fill="#d9a83a" stroke={OUT} strokeWidth={2.5} />
            <circle cx={66} cy={-79} r={2.5} fill={OUT} />
          </g>
          <g transform={`translate(76 -120) rotate(${headTilt})`}>
            {/* far horn + far ear */}
            <path d="M -2 -20 Q -12 -46 -32 -52 Q -24 -40 -12 -16 Z" fill={c.horn} opacity={0.75} {...stroke} strokeWidth={3} />
            <g transform={`rotate(${-ear * 0.6} -6 -6)`}>
              <path d="M -4 -6 Q -22 2 -22 26 Q -12 30 -6 18 Q -2 6 -2 -6 Z" fill={c.shade} {...stroke} strokeWidth={3} />
            </g>
            {/* head */}
            <path d="M -18 -10 Q -10 -28 10 -24 Q 30 -18 40 0 Q 48 14 40 22 Q 30 28 18 22 Q 0 14 -12 8 Q -22 0 -18 -10 Z" fill={c.base} {...stroke} />
            <path d="M 4 -20 Q 18 -16 26 -6" fill="none" stroke={c.patch} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
            {/* muzzle, nostril, mouth */}
            <ellipse cx={38} cy={12} rx={8} ry={6} fill={c.nose} />
            <path d="M 38 8 q 4 1 4 5" fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
            {open > 1 ? (
              <path d={`M 26 ${21} Q 34 ${22 + open} 40 ${20}`} fill="#5a2a2a" stroke={OUT} strokeWidth={2.5} />
            ) : (
              <path d={`M 28 ${22 + chew * 0.4} Q 34 ${24 + chew * 0.4} 40 ${20}`} fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
            )}
            {/* eye with slit pupil */}
            <ellipse cx={14} cy={-8} rx={7} ry={6 * eye} fill="#f0d98a" stroke={OUT} strokeWidth={2.5} />
            {eye > 0.4 && <rect x={10.5} y={-9.2} width={7} height={2.4} rx={1} fill={OUT} />}
            <path d="M 6 -15 Q 14 -18 22 -13" fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
            {/* near horn with ridges */}
            <path d="M 2 -20 Q -4 -48 -26 -58 Q -18 -46 -6 -14 Z" fill={c.horn} {...stroke} strokeWidth={3} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${-2 - i * 6} ${-28 - i * 8} l 7 -2`} stroke="#7d6e58" strokeWidth={2} strokeLinecap="round" />
            ))}
            {/* near floppy ear */}
            <g transform={`rotate(${ear} -4 -4)`}>
              <path d="M -2 -4 Q -18 6 -16 32 Q -4 36 2 22 Q 6 10 4 -4 Z" fill={c.base} {...stroke} strokeWidth={3} />
              <path d="M -2 2 Q -10 12 -10 26" fill="none" stroke={c.nose} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
            </g>
            {/* beard */}
            <g transform={`rotate(${Math.sin(t * 2) * 6 + chew} 24 22)`}>
              <path d="M 18 20 Q 18 40 26 48 Q 32 36 32 22 Z" fill={c.beard} {...stroke} strokeWidth={3} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
};

/** Ellipse outline made of leafy bumps (for tree canopies). */
const scallop = (cx: number, cy: number, rx: number, ry: number, grow = 0) => {
  const n = Math.max(8, Math.round((Math.PI * (rx + ry)) / 46));
  const pt = (a: number, k: number) => `${(cx + Math.cos(a) * (rx + grow) * k).toFixed(1)} ${(cy + Math.sin(a) * (ry + grow) * k).toFixed(1)}`;
  let d = `M ${pt(0, 1)}`;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    d += ` Q ${pt((a0 + a1) / 2, 1.13)} ${pt(a1, 1)}`;
  }
  return d + " Z";
};
type Clump = [number, number, number, number?]; // cx, cy, rx, ry (ry defaults to rx)
const TREE_KINDS: Record<"neem" | "kikar", { back: Clump[]; mid: Clump[]; dark: string; mid1: string; mid2: string; light: string; flower?: string }> = {
  neem: {
    back: [[-160, -250, 95], [160, -262, 95], [0, -390, 110], [-100, -372, 95], [108, -372, 95], [-200, -316, 72], [210, -322, 72]],
    mid: [[-112, -270, 100], [0, -320, 125], [112, -282, 104], [-52, -228, 88], [72, -224, 84], [-64, -392, 80], [62, -402, 80]],
    dark: "#4f8a3c", mid1: "#6aa84f", mid2: "#7dbb5a", light: "#a6d77e",
  },
  kikar: {
    back: [[-210, -300, 120, 44], [0, -350, 170, 54], [200, -312, 120, 44], [-90, -398, 110, 40], [110, -392, 100, 38]],
    mid: [[-180, -290, 100, 34], [10, -332, 150, 44], [180, -300, 96, 34], [-70, -384, 88, 30], [100, -380, 82, 28]],
    dark: "#5f7f34", mid1: "#7b9a42", mid2: "#8aab4c", light: "#b6cf74", flower: "#f2c94c",
  },
};

/**
 * Detailed village tree. `kind` "neem" (dense round shade tree) or "kikar" (flat-topped thorny acacia with
 * yellow flowers). Trunk with root flares, bark lines and a knot; branches showing between leaf masses;
 * three-tone canopy with one outer outline, leaf flicks and highlights; leaves flutter with `t`, canopy rocks
 * with `sway` (degrees). `nest` adds a small bird nest. Ground at y = 0.
 */
export const VillageTree: React.FC<{ x: number; y: number; s?: number; sway?: number; t?: number; kind?: "neem" | "kikar"; nest?: boolean; flip?: boolean }> = ({
  x,
  y,
  s = 1,
  sway = 0,
  t = 0,
  kind = "neem",
  nest = false,
  flip = false,
}) => {
  const k = TREE_KINDS[kind];
  const bark = "#8a5a36";
  const barkDark = "#6a4226";
  const wob = (i: number) => `translate(${Math.sin(t * 1.6 + i * 1.3) * 2.5} ${Math.cos(t * 1.3 + i) * 1.5})`;
  const clumps = (list: Clump[], fill: string, outline: boolean, off = 0) =>
    list.map(([cx, cy, rx, ry], i) => (
      <g key={i} transform={wob(i + off)}>
        <path d={scallop(cx, cy, rx, ry ?? rx, outline ? LINE : 0)} fill={outline ? OUT : fill} />
      </g>
    ));
  const neem = kind === "neem";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={6} rx={240} ry={28} fill="#5a3a1c" opacity={0.25} />
      {/* trunk with root flares */}
      {neem ? (
        <path d="M -54 4 Q -30 -6 -26 -30 Q -18 -120 -40 -230 L -10 -236 Q 6 -150 4 -110 Q 30 -170 70 -214 L 88 -198 Q 40 -150 26 -90 Q 22 -30 38 -8 Q 56 2 60 6 Z" fill={bark} {...stroke} />
      ) : (
        <path d="M -40 4 Q -14 -8 -14 -60 Q -18 -140 -60 -230 Q -100 -280 -150 -300 L -140 -316 Q -86 -292 -44 -250 Q -20 -220 -6 -180 Q 0 -260 -10 -330 L 12 -334 Q 20 -250 12 -170 Q 40 -240 140 -300 L 150 -284 Q 60 -230 24 -130 Q 18 -40 40 4 Z" fill={bark} {...stroke} />
      )}
      {/* bark lines + knot */}
      <path d="M -12 -20 Q -6 -70 -14 -120 M 10 -30 Q 14 -60 8 -96 M -20 -150 Q -18 -180 -24 -200" fill="none" stroke={barkDark} strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={4} cy={-70} rx={7} ry={11} fill={barkDark} stroke={OUT} strokeWidth={2.5} />
      <path d="M -40 2 q 8 -6 14 -2 M 30 2 q 8 -6 14 0" fill="none" stroke={barkDark} strokeWidth={3} strokeLinecap="round" />
      <g transform={`rotate(${sway} 0 -260)`}>
        {/* back leaf mass: one outline pass, then fills */}
        {clumps(k.back, "", true)}
        {clumps(k.back, k.dark, false)}
        {/* branches peeking between leaves */}
        {neem ? (
          <path d="M -6 -230 Q -60 -280 -150 -290 M 40 -200 Q 100 -250 170 -270 M -10 -236 Q 0 -300 -30 -370" fill="none" stroke={barkDark} strokeWidth={9} strokeLinecap="round" />
        ) : (
          <path d="M -150 -300 Q -200 -310 -250 -296 M 140 -300 Q 190 -320 240 -310 M -10 -330 Q -20 -370 -60 -396" fill="none" stroke={barkDark} strokeWidth={6} strokeLinecap="round" />
        )}
        {/* front leaf mass */}
        {k.mid.map(([cx, cy, rx, ry], i) => (
          <g key={i} transform={wob(i + 7)}>
            <path d={scallop(cx, cy, rx, ry ?? rx)} fill={i % 2 ? k.mid1 : k.mid2} stroke={k.dark} strokeWidth={3} strokeLinejoin="round" />
            {/* highlight on the sunny upper-left */}
            <path d={scallop(cx - rx * 0.22, cy - (ry ?? rx) * 0.28, rx * 0.5, (ry ?? rx) * 0.45)} fill={k.light} opacity={0.5} />
            {/* leaf flicks along the top edge */}
            {[-150, -120, -90, -60, -30].map((a, j) => {
              const r = (a * Math.PI) / 180;
              const lx = cx + Math.cos(r) * rx * 0.86;
              const ly = cy + Math.sin(r) * (ry ?? rx) * 0.86;
              const flick = Math.sin(t * 4 + i * 2 + j) * 8;
              return (
                <path
                  key={j}
                  d={`M ${lx} ${ly} q ${8 + flick * 0.3} -10 18 -2 q -8 8 -18 2 Z`}
                  fill={k.light}
                  stroke={k.dark}
                  strokeWidth={2}
                  transform={`rotate(${a + 90 + flick} ${lx} ${ly})`}
                />
              );
            })}
          </g>
        ))}
        {/* small leaf clusters for texture */}
        {k.mid.map(([cx, cy, rx], i) => (
          <path key={i} d={`M ${cx + rx * 0.2} ${cy + rx * 0.1} l 10 -12 m -10 12 l 14 -2 M ${cx - rx * 0.4} ${cy + rx * 0.3} l 8 -11 m -8 11 l 13 -3`} fill="none" stroke={k.dark} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        ))}
        {k.flower &&
          k.mid.flatMap(([cx, cy, rx], i) =>
            [0, 1, 2, 3].map((j) => <circle key={`${i}-${j}`} cx={cx + Math.cos(i * 3 + j * 1.7) * rx * 0.7} cy={cy + Math.sin(i * 2 + j * 2.3) * 20} r={5} fill={k.flower} stroke={OUT} strokeWidth={1.5} />),
          )}
        {nest && (
          <g transform={`translate(${neem ? 120 : 150} ${neem ? -250 : -296})`}>
            <path d="M -30 0 Q -26 22 0 24 Q 26 22 30 0 Z" fill="#9c7444" {...stroke} strokeWidth={3} />
            <path d="M -26 6 l 52 -4 M -22 14 l 44 4 M -18 2 l 10 18 M 10 2 l -6 20" stroke="#6a4a26" strokeWidth={2.5} strokeLinecap="round" />
            <ellipse cx={-8} cy={-2} rx={7} ry={5} fill="#e8f0f4" stroke={OUT} strokeWidth={2} />
            <ellipse cx={8} cy={-3} rx={7} ry={5} fill="#dfeaf0" stroke={OUT} strokeWidth={2} />
          </g>
        )}
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
