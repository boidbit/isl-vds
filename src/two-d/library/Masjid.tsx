// Early Madinah masjid (library). Built for "laal-patti-aur-cheel", reusable.
// Mud-brick walls, palm-trunk pillars holding a palm-leaf roof (shade with light coming through the gaps), a pebbled
// sand floor, and the outside wall with a simple doorway full of light. Places only: never put a figure in the
// masjid who could be taken for the Prophet ﷺ or a named Companion (Islamic rules in CLAUDE.md).

import React from "react";
import { LINE, OUT } from "../kit";
import { Palm } from "../Scenery";
import { mixC } from "./Courtyard";

const st = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const rnd = (i: number, k = 12.9898) => ((((Math.sin(i * k) * 43758.5453) % 1) + 1) % 1);

const wallC = (warm: number) => ({ base: mixC("#d2ab80", "#dba36a", warm), shade: mixC("#b48a60", "#b97e48", warm), line: mixC("#a87c52", "#a86e3c", warm) });

/** Brick pattern defs (one id per tone). */
const Bricks: React.FC<{ id: string; line: string }> = ({ id, line }) => (
  <defs>
    <pattern id={id} width={84} height={40} patternUnits="userSpaceOnUse">
      <path d="M 0 39 H 84 M 0 19 H 84 M 20 0 V 19 M 62 20 V 39" stroke={line} strokeWidth={2.5} fill="none" opacity={0.55} />
    </pattern>
  </defs>
);

/** Palm-leaf roof slab with a hanging fringe that sways, and beam ends. */
const LeafRoof: React.FC<{ x0: number; x1: number; y: number; t: number; th?: number }> = ({ x0, x1, y, t, th = 64 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={th} fill="#7a6438" {...st} />
    {Array.from({ length: Math.floor((x1 - x0) / 26) }, (_, i) => {
      const fx = x0 + i * 26 + 8;
      return <path key={i} d={`M ${fx} ${y + 6} q 10 ${th * 0.4} ${2} ${th - 6}`} fill="none" stroke={i % 2 ? "#5e4a28" : "#94804a"} strokeWidth={4} />;
    })}
    {Array.from({ length: Math.floor((x1 - x0) / 18) }, (_, i) => {
      const fx = x0 + i * 18;
      const sw = Math.sin(t * 2 + i * 0.7) * 4;
      const l = 22 + rnd(i) * 26;
      return <path key={`f${i}`} d={`M ${fx} ${y + th - 4} q ${sw} ${l * 0.5} ${sw * 1.6 + 4} ${l}`} fill="none" stroke={i % 3 ? "#6a8a3a" : "#8a7a40"} strokeWidth={5} strokeLinecap="round" />;
    })}
    {Array.from({ length: Math.floor((x1 - x0) / 140) }, (_, i) => (
      <circle key={`b${i}`} cx={x0 + 70 + i * 140} cy={y + th * 0.5} r={13} fill="#a07a52" stroke={OUT} strokeWidth={3} />
    ))}
  </g>
);

/** Palm-trunk pillar. */
const TrunkPillar: React.FC<{ x: number; y0: number; y1: number; w?: number }> = ({ x, y0, y1, w = 46 }) => (
  <g>
    <rect x={x - w / 2} y={y1} width={w} height={y0 - y1} fill="#8a6448" {...st} />
    {Array.from({ length: Math.floor((y0 - y1) / 26) }, (_, i) => (
      <path key={i} d={`M ${x - w / 2 + 4} ${y1 + 14 + i * 26} l ${w / 2 - 4} 10 l ${w / 2 - 4} -10`} fill="none" stroke="#654630" strokeWidth={3} />
    ))}
    <rect x={x + w * 0.12} y={y1 + 4} width={w * 0.18} height={y0 - y1 - 8} fill="#b08a62" opacity={0.5} />
  </g>
);

/**
 * Inside the masjid courtyard looking at the qibla side: date palms beyond the mud-brick wall, a palm-leaf roof on
 * palm-trunk pillars with shade beneath and light shafts through its gaps. Base (wall foot) at `g`. `warm` 0 cool
 * morning .. 1 golden afternoon.
 */
export const MasjidCourt: React.FC<{ g: number; t: number; x0?: number; x1?: number; warm?: number; rays?: number }> = ({ g, t, x0 = -1400, x1 = 3400, warm = 0, rays = 1 }) => {
  const c = wallC(warm);
  const id = `mbrick${Math.round(warm * 10)}`;
  const roofY = g - 470;
  return (
    <g>
      <Bricks id={id} line={c.line} />
      {[-900, -300, 420, 1180, 1900, 2600].map((px, i) => (
        <Palm key={i} x={px} y={g - 420} s={1.5 + (i % 2) * 0.25} lean={i % 2 ? -0.6 : 0.8} sway={Math.sin(t * 0.9 + i) * 4} />
      ))}
      {/* back wall */}
      <rect x={x0} y={g - 560} width={x1 - x0} height={560} fill={c.base} {...st} />
      <rect x={x0} y={g - 560} width={x1 - x0} height={560} fill={`url(#${id})`} />
      <rect x={x0} y={g - 590} width={x1 - x0} height={34} rx={10} fill={c.shade} {...st} />
      {/* shade under the roof */}
      <rect x={x0} y={roofY} width={x1 - x0} height={g - roofY + 30} fill="#3a2214" opacity={0.3} />
      {/* pillars */}
      {Array.from({ length: Math.ceil((x1 - x0) / 300) }, (_, i) => (
        <TrunkPillar key={i} x={x0 + 150 + i * 300} y0={g + 24} y1={roofY + 40} />
      ))}
      {/* light shafts through the gaps in the roof + spots on the floor */}
      {rays > 0 &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const rx = x0 + 420 + i * 560 + rnd(i) * 120;
          const o = (0.16 + 0.06 * Math.sin(t * 0.8 + i * 1.7)) * rays;
          return (
            <g key={i} style={{ mixBlendMode: "screen" }}>
              <path d={`M ${rx} ${roofY + 50} L ${rx + 26} ${roofY + 50} L ${rx + 170} ${g + 40} L ${rx + 90} ${g + 40} Z`} fill="#fff2c8" opacity={o} />
              <ellipse cx={rx + 130} cy={g + 40} rx={56} ry={14} fill="#fff2c8" opacity={o * 1.6} />
            </g>
          );
        })}
      <LeafRoof x0={x0} x1={x1} y={roofY} t={t} />
    </g>
  );
};

/** Pebbled sand floor of the masjid from y downwards. */
export const MasjidFloor: React.FC<{ y: number; x0?: number; x1?: number; depth?: number; warm?: number }> = ({ y, x0 = -1400, x1 = 3400, depth = 1400, warm = 0 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={depth} fill={mixC("#e8d2aa", "#e8c08a", warm)} />
    <rect x={x0} y={y} width={x1 - x0} height={60} fill="#3a2214" opacity={0.12} />
    {Array.from({ length: 120 }, (_, i) => {
      const px = x0 + rnd(i) * (x1 - x0);
      const py = y + 10 + Math.pow(rnd(i, 78.233), 1.3) * (depth - 20);
      const r = 2 + rnd(i, 3.1) * 4 * (1 + (py - y) / 500);
      return <ellipse key={i} cx={px} cy={py} rx={r * 1.3} ry={r} fill={i % 4 ? "#c8ae86" : "#a8987e"} opacity={0.6} />;
    })}
  </g>
);

/**
 * The masjid from outside: mud-brick wall with a simple doorway (palm-beam lintel, an open wooden door), the
 * palm-leaf roof peeking over the wall, date palms. `glow` 0..1 fills the doorway with light spilling out.
 */
export const MasjidGate: React.FC<{ x: number; g: number; t: number; x0?: number; x1?: number; glow?: number; warm?: number }> = ({ x, g, t, x0 = -1400, x1 = 3400, glow = 0, warm = 0.3 }) => {
  const c = wallC(warm);
  const id = `mgbrick${Math.round(warm * 10)}`;
  const dw = 170;
  const dh = 280;
  return (
    <g>
      <Bricks id={id} line={c.line} />
      {[x - 700, x - 260, x + 380, x + 900].map((px, i) => (
        <Palm key={i} x={px} y={g - 300} s={1.6 + (i % 2) * 0.3} lean={i % 2 ? 0.7 : -0.5} sway={Math.sin(t * 0.8 + i * 1.3) * 5} />
      ))}
      <LeafRoof x0={x + 180} x1={x1} y={g - 470} t={t} th={50} />
      <path d={`M ${x0} ${g} L ${x0} ${g - 400} L ${x1} ${g - 400} L ${x1} ${g} L ${x + dw / 2} ${g} L ${x + dw / 2} ${g - dh} L ${x - dw / 2} ${g - dh} L ${x - dw / 2} ${g} Z`} fill={c.base} {...st} />
      <path d={`M ${x0} ${g} L ${x0} ${g - 400} L ${x1} ${g - 400} L ${x1} ${g} L ${x + dw / 2} ${g} L ${x + dw / 2} ${g - dh} L ${x - dw / 2} ${g - dh} L ${x - dw / 2} ${g} Z`} fill={`url(#${id})`} />
      <rect x={x0} y={g - 120} width={x1 - x0} height={120} fill={c.shade} opacity={0.45} />
      <rect x={x0} y={g - 426} width={x1 - x0} height={30} rx={8} fill={c.shade} {...st} />
      {[[x - 520, -230], [x + 330, -300], [x + 760, -170]].map(([cx, cy], i) => (
        <path key={i} d={`M ${cx} ${g + cy} l 26 22 l -8 30 l 22 20`} fill="none" stroke={c.line} strokeWidth={3} />
      ))}
      {/* doorway: light inside, open door leaf, posts and palm-beam lintel */}
      <defs>
        <linearGradient id="mgdoor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixC("#6a4a30", "#fff4d2", glow)} />
          <stop offset="1" stopColor={mixC("#4a3020", "#ffd890", glow)} />
        </linearGradient>
      </defs>
      <rect x={x - dw / 2} y={g - dh} width={dw} height={dh} fill="url(#mgdoor)" />
      <path d={`M ${x - dw / 2 + 6} ${g - dh + 6} L ${x - dw / 2 + 46} ${g - dh + 20} L ${x - dw / 2 + 46} ${g - 6} L ${x - dw / 2 + 6} ${g} Z`} fill="#7a5232" {...st} />
      <circle cx={x - dw / 2 + 36} cy={g - dh / 2} r={5} fill="#3a2a1e" />
      <rect x={x - dw / 2 - 14} y={g - dh} width={16} height={dh} fill="#8a6448" {...st} />
      <rect x={x + dw / 2 - 2} y={g - dh} width={16} height={dh} fill="#8a6448" {...st} />
      <rect x={x - dw / 2 - 40} y={g - dh - 30} width={dw + 80} height={32} rx={14} fill="#9a7450" {...st} />
      {glow > 0.01 && (
        <g style={{ mixBlendMode: "screen" }} opacity={glow}>
          <path d={`M ${x - dw / 2} ${g} L ${x + dw / 2} ${g} L ${x + dw * 1.6} ${g + 360} L ${x - dw * 1.6} ${g + 360} Z`} fill="#fff0c0" opacity={0.35} />
          {[-2, -1, 0, 1, 2].map((i) => (
            <path key={i} d={`M ${x + i * 30} ${g - dh * 0.6} L ${x + i * 150 + Math.sin(t + i) * 10} ${g + 420}`} stroke="#fff6d8" strokeWidth={26} opacity={0.18} />
          ))}
        </g>
      )}
    </g>
  );
};
