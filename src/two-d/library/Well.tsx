// Well assets (library). Reusable in any story that has a well.
//  - WellBack / WellFront: exterior, split so a character can stand *inside* the well
//  - WellTopDown: looking straight down the shaft
//  - WellShaft: cut-away low-angle view of the inside, looking up to the light
//  - WellOpening: close view over the rim into the dark (for over-the-shoulder shots)

import React from "react";
import { LINE, OUT } from "../kit";

const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const STONE = ["#d8b18a", "#cfa67e", "#c79c74"];

/** Back half: far rim + dark inside. Draw before a character inside the well. */
export const WellBack: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={190} ry={22} fill="#7a4a24" opacity={0.25} />
    <rect x={-138} y={-330} width={18} height={170} rx={4} fill="#8a5a36" {...stroke} />
    <rect x={120} y={-330} width={18} height={170} rx={4} fill="#8a5a36" {...stroke} />
    <rect x={-150} y={-342} width={300} height={20} rx={6} fill="#9c6a42" {...stroke} />
    <ellipse cx={0} cy={-170} rx={150} ry={34} fill="#b88c66" {...stroke} />
    <ellipse cx={0} cy={-170} rx={118} ry={22} fill="#3b2516" {...stroke} />
  </g>
);

/** Front wall: covers whatever is inside the well below the rim. */
export const WellFront: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -150 -170 A 150 34 0 0 0 150 -170 L 150 -10 Q 0 30 -150 -10 Z" fill="#c9a07a" {...stroke} />
    {[0, 1, 2, 3].map((row) =>
      Array.from({ length: 5 }, (_, i) => {
        const xx = -150 + i * 60 + (row % 2 ? 0 : 30) - 30;
        const x0 = Math.max(-146, xx + 3);
        const x1 = Math.min(146, xx + 57);
        if (x1 - x0 < 12) return null;
        const yy = -150 + row * 36;
        return <rect key={`${row}-${i}`} x={x0} y={yy} width={x1 - x0} height={30} rx={9} fill={STONE[(row + i) % 3]} stroke="#9c7552" strokeWidth={3} />;
      }),
    )}
    {/* front lip of the rim */}
    <path d="M -150 -170 A 150 34 0 0 0 150 -170 A 150 28 0 0 1 -150 -170 Z" fill="#c49a72" {...stroke} />
  </g>
);

/** Looking straight down: rings of stone falling into darkness, water glinting at the bottom. */
export const WellTopDown: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <radialGradient id="shaftDark">
        <stop offset="0" stopColor="#163b4a" />
        <stop offset="0.35" stopColor="#0e1f26" />
        <stop offset="1" stopColor="#3a2618" />
      </radialGradient>
    </defs>
    <rect x={-2000} y={-2000} width={4000} height={4000} fill="#f2c785" />
    {Array.from({ length: 18 }, (_, i) => (
      <path key={i} d={`M ${-900 + (i % 6) * 320} ${-450 + Math.floor(i / 6) * 330} q 50 -14 100 0`} fill="none" stroke="#e0ad6c" strokeWidth={5} strokeLinecap="round" />
    ))}
    <circle r={470} fill="#b88c66" {...stroke} />
    {/* rim stones */}
    {Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2;
      return (
        <rect
          key={i}
          x={-40}
          y={-24}
          width={80}
          height={48}
          rx={14}
          fill={STONE[i % 3]}
          stroke="#9c7552"
          strokeWidth={4}
          transform={`translate(${Math.cos(a) * 420} ${Math.sin(a) * 420}) rotate(${(a * 180) / Math.PI + 90})`}
        />
      );
    })}
    <circle r={375} fill="url(#shaftDark)" {...stroke} />
    {/* receding stone rings */}
    {[0.8, 0.62, 0.46, 0.33].map((k, i) => (
      <circle key={i} r={375 * k} fill="none" stroke="#5a3e2a" strokeWidth={6 - i} opacity={0.7 - i * 0.12} strokeDasharray={`${30 * k} ${14 * k}`} />
    ))}
    {/* water at the bottom */}
    <circle r={95} fill="#2f7f9c" opacity={0.95} />
    <circle r={95} fill="none" stroke="#8fd3f0" strokeWidth={3} opacity={0.6} />
    <ellipse cx={-20 + Math.sin(t * 2) * 6} cy={-25} rx={30} ry={10} fill="#d8f4ff" opacity={0.55 + Math.sin(t * 3) * 0.2} />
  </g>
);

/** Cut-away view of the shaft from below, walls converging upward to a bright opening. */
export const WellShaft: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="shaftLight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3cf" />
        <stop offset="0.25" stopColor="#7fb6c4" />
        <stop offset="1" stopColor="#163240" />
      </linearGradient>
    </defs>
    <rect x={-400} y={-1600} width={2720} height={3400} fill="url(#shaftLight)" />
    {/* sky through the opening */}
    <ellipse cx={960} cy={-1180} rx={330} ry={70} fill="#bfe6ff" stroke="#fff6da" strokeWidth={10} />
    {/* light shaft */}
    <path d="M 640 -1180 L 1280 -1180 L 1500 1500 L 420 1500 Z" fill="#fff4c8" opacity={0.12} />
    {/* stone walls on both sides (perspective: wider at the bottom) */}
    {[-1, 1].map((side) => (
      <g key={side}>
        <path
          d={side < 0 ? "M -400 -1600 L 630 -1180 L 300 1800 L -400 1800 Z" : "M 2320 -1600 L 1290 -1180 L 1620 1800 L 2320 1800 Z"}
          fill="#4f6a6e"
          {...stroke}
        />
        {Array.from({ length: 16 }, (_, row) => {
          const y0 = -1160 + row * 190;
          const inner = side < 0 ? 630 - ((y0 + 1180) / 2980) * 330 : 1290 + ((y0 + 1180) / 2980) * 330;
          return (
            <g key={row}>
              {Array.from({ length: 4 }, (_, i) => {
                const w = 150 + row * 6;
                const x = side < 0 ? inner - (i + 1) * (w + 8) + (row % 2) * 40 : inner + i * (w + 8) + 8 - (row % 2) * 40;
                return <rect key={i} x={x} y={y0} width={w} height={150 + row * 2} rx={26} fill={["#5f7d80", "#56746f", "#6a8783"][(row + i) % 3]} stroke="#2e4245" strokeWidth={4} />;
              })}
            </g>
          );
        })}
      </g>
    ))}
    {/* water far below */}
    <ellipse cx={960} cy={1700} rx={700} ry={90} fill="#2f7f9c" />
    <ellipse cx={960 + Math.sin(t * 2) * 20} cy={1690} rx={300} ry={20} fill="#8fd3f0" opacity={0.4} />
  </g>
);

/** Close view over the rim into the well (for over-the-shoulder). */
export const WellOpening: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <radialGradient id="openDark" cx="0.5" cy="0.6" r="0.6">
        <stop offset="0" stopColor="#1d4654" />
        <stop offset="0.4" stopColor="#10202a" />
        <stop offset="1" stopColor="#2e1c10" />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={2720} height={1880} fill="#f2c785" />
    <ellipse cx={1060} cy={760} rx={820} ry={330} fill="#b88c66" {...stroke} />
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return <ellipse key={i} cx={1060 + Math.cos(a) * 760} cy={760 + Math.sin(a) * 290} rx={90} ry={45} fill={STONE[i % 3]} stroke="#9c7552" strokeWidth={4} />;
    })}
    <ellipse cx={1060} cy={770} rx={640} ry={235} fill="url(#openDark)" {...stroke} />
    <ellipse cx={1060} cy={800} rx={120} ry={38} fill="#2f7f9c" opacity={0.85} />
    <ellipse cx={1030 + Math.sin(t * 2) * 8} cy={792} rx={45} ry={9} fill="#d8f4ff" opacity={0.5} />
  </g>
);
