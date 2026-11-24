// Mountain, storm and cave assets (library). Built for "gufa-ke-teen", reusable for any mountain/cave story.
// World units: ground line passed as `y`/`g`, cave mouth centred on `cx`. Facing conventions as in Village.tsx.

import React from "react";
import { LINE, OUT } from "../kit";

const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type SkyMood = "storm" | "dawn" | "clear";
const SKIES: Record<SkyMood, { top: string; mid: string; low: string; cloud: string; cloudShade: string; peak: string; peakShade: string; far: string; rock: string; rockShade: string; rockLight: string; ground: string; groundShade: string }> = {
  storm: { top: "#1d2433", mid: "#2f3a4f", low: "#4a556b", cloud: "#3a4458", cloudShade: "#262e3e", peak: "#3e4a5a", peakShade: "#2d3746", far: "#56627a", rock: "#5d6470", rockShade: "#434956", rockLight: "#78808c", ground: "#4a4a44", groundShade: "#36362f" },
  dawn: { top: "#6f8fc0", mid: "#f3b27a", low: "#ffd9a0", cloud: "#f7c99a", cloudShade: "#d9997a", peak: "#8a7a8a", peakShade: "#6e5f72", far: "#b49aa4", rock: "#9a8676", rockShade: "#7a6858", rockLight: "#c2aa92", ground: "#8f7a5c", groundShade: "#6e5c44" },
  clear: { top: "#6fb8ea", mid: "#bfe2fa", low: "#fff0cf", cloud: "#ffffff", cloudShade: "#dfeaf3", peak: "#8fa6a0", peakShade: "#718a84", far: "#b4c8cc", rock: "#a8927a", rockShade: "#86725c", rockLight: "#c9b398", ground: "#93a35a", groundShade: "#76864a" },
};
export const skyColors = (m: SkyMood) => SKIES[m];

/** Sky with layered clouds; `flash` 0..1 lights it up (lightning), `glow` adds a sunrise glow at sunX. */
export const MountainSky: React.FC<{ mood: SkyMood; t: number; flash?: number; sunX?: number; w?: number; h?: number }> = ({ mood, t, flash = 0, sunX = 700, w = 4000, h = 2600 }) => {
  const c = SKIES[mood];
  const id = `msky-${mood}`;
  const cloud = (cx: number, cy: number, s: number, i: number) => (
    <g key={i} transform={`translate(${cx + ((t * (mood === "storm" ? 40 : 8) + i * 60) % 400)} ${cy}) scale(${s})`}>
      {[
        [-160, 10, 110],
        [-40, -40, 150],
        [110, -10, 120],
        [220, 30, 90],
        [-260, 40, 80],
      ].map(([x, y, r], j) => (
        <circle key={j} cx={x} cy={y} r={r} fill={j % 2 ? c.cloudShade : c.cloud} />
      ))}
      <rect x={-300} y={40} width={560} height={90} rx={45} fill={c.cloudShade} />
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="0.55" stopColor={c.mid} />
          <stop offset="1" stopColor={c.low} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fff6d0" stopOpacity={0.95} />
          <stop offset="0.3" stopColor="#ffd98a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-1500} y={-600} width={w + 3000} height={h + 1200} fill={`url(#${id})`} />
      {mood !== "storm" && (
        <>
          <circle cx={sunX} cy={mood === "dawn" ? 980 : 420} r={600} fill={`url(#${id}-sun)`} />
          <circle cx={sunX} cy={mood === "dawn" ? 980 : 420} r={95} fill="#fff4c8" />
        </>
      )}
      {(mood === "storm" ? [[-400, 200, 1.6], [500, 80, 1.9], [1500, 260, 1.7], [2500, 120, 2], [3300, 240, 1.6]] : [[-200, 300, 0.9], [1400, 220, 0.8], [2600, 340, 1]]).map(([x, y, s], i) =>
        cloud(x, y, s, i),
      )}
      {mood === "storm" && <rect x={-1500} y={-600} width={w + 3000} height={h + 1200} fill="#e8f0ff" opacity={flash * 0.55} />}
    </g>
  );
};

/** Jagged lightning bolt from (x, y) downward, visible while `k` > 0. */
export const Lightning: React.FC<{ x: number; y: number; len?: number; k: number; seed?: number }> = ({ x, y, len = 900, k, seed = 1 }) => {
  if (k <= 0) return null;
  const pts: string[] = [`${x} ${y}`];
  let px = x;
  for (let i = 1; i <= 9; i++) {
    px += Math.sin(i * 7.3 + seed * 3.1) * 70;
    pts.push(`${px.toFixed(0)} ${(y + (len * i) / 9).toFixed(0)}`);
  }
  const d = `M ${pts.join(" L ")}`;
  return (
    <g opacity={k}>
      <path d={d} fill="none" stroke="#9fc4ff" strokeWidth={26} strokeLinejoin="round" opacity={0.35} />
      <path d={d} fill="none" stroke="#e8f2ff" strokeWidth={9} strokeLinejoin="round" />
      <path d={`M ${pts[4]} L ${Number(pts[4].split(" ")[0]) + 120} ${y + len * 0.62}`} fill="none" stroke="#e8f2ff" strokeWidth={5} />
    </g>
  );
};

/** Layered mountain range behind the action (far + near peaks, snow caps only when clear). */
export const Peaks: React.FC<{ mood: SkyMood; y?: number }> = ({ mood, y = 1300 }) => {
  const c = SKIES[mood];
  return (
    <g transform={`translate(0 ${y - 1300})`}>
      <path d="M -1500 1200 L -900 520 L -500 860 L 0 380 L 500 900 L 1000 460 L 1500 820 L 2100 340 L 2700 880 L 3300 500 L 4200 1100 L 4200 2400 L -1500 2400 Z" fill={c.far} />
      <path d="M 0 380 L 140 540 L 60 520 L -40 600 Z M 2100 340 L 2260 520 L 2160 500 L 2050 580 Z M 1000 460 L 1120 600 L 1010 580 Z" fill={mood === "storm" ? "#7a869c" : "#f4f7fa"} opacity={0.85} />
      <path d="M -1500 1300 L -700 760 L -200 1040 L 400 700 L 1000 1060 L 1700 680 L 2300 1080 L 2900 780 L 4200 1240 L 4200 2400 L -1500 2400 Z" fill={c.peak} />
      <path d="M 400 700 L 560 860 L 520 1000 L 1000 1060 L 400 760 Z M 1700 680 L 1900 880 L 2300 1080 L 1720 760 Z" fill={c.peakShade} />
    </g>
  );
};

/** Falling rain (screen-space): `n` streaks, slanted by `wind`. `w`/`h` = frame size. */
export const Rain: React.FC<{ t: number; w: number; h: number; n?: number; wind?: number; o?: number; len?: number }> = ({ t, w, h, n = 160, wind = 0.25, o = 0.55, len = 70 }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const speed = 2200 + (i % 7) * 260;
      const y = ((t * speed + i * 397) % (h + 300)) - 150;
      const x = ((i * 137.5) % (w + 400)) - 200 + y * wind;
      const l = len * (0.6 + (i % 5) * 0.15);
      return <path key={i} d={`M ${x} ${y} l ${-l * wind} ${-l}`} stroke={i % 3 ? "#c9d8ee" : "#ffffff"} strokeWidth={i % 4 === 0 ? 4 : 2.5} strokeLinecap="round" />;
    })}
  </g>
);

/** Rain hitting the ground along a line: little crowns that pop and fade. */
export const RainSplashes: React.FC<{ t: number; x0: number; x1: number; y: number; n?: number; spread?: number }> = ({ t, x0, x1, y, n = 40, spread = 160 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const period = 0.5 + (i % 5) * 0.11;
      const k = ((t + i * 0.137) % period) / period;
      const x = x0 + ((i * 211.7) % (x1 - x0));
      const yy = y + ((i * 53) % spread);
      return (
        <g key={i} opacity={(1 - k) * 0.8}>
          <ellipse cx={x} cy={yy} rx={6 + k * 22} ry={2 + k * 6} fill="none" stroke="#dbe7f5" strokeWidth={2.5} />
          {k < 0.5 && <path d={`M ${x - 6} ${yy - k * 30} l -4 -8 M ${x + 6} ${yy - k * 30} l 4 -8`} stroke="#e9f1fb" strokeWidth={2.5} strokeLinecap="round" />}
        </g>
      );
    })}
  </g>
);

/** Puddle with sky reflection and ripples from the rain. */
export const Puddle: React.FC<{ x: number; y: number; w?: number; t: number; tint?: string; rain?: boolean }> = ({ x, y, w = 260, t, tint = "#7c8aa3", rain = true }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={w / 2} ry={w / 9} fill={tint} stroke={OUT} strokeWidth={3} />
    <ellipse cx={-w * 0.12} cy={-w * 0.02} rx={w * 0.28} ry={w * 0.03} fill="#ffffff" opacity={0.35} />
    {rain &&
      [0, 1, 2].map((i) => {
        const k = ((t * 1.4 + i * 0.33) % 1);
        return <ellipse key={i} cx={(i - 1) * w * 0.25} cy={(i % 2) * 6} rx={6 + k * w * 0.12} ry={2 + k * w * 0.03} fill="none" stroke="#e2ecf8" strokeWidth={2} opacity={1 - k} />;
      })}
  </g>
);

/** Rocky ground with stones and tufts; `wet` darkens it and adds shine. */
export const RockyGround: React.FC<{ mood: SkyMood; y: number; wet?: number; x0?: number; x1?: number }> = ({ mood, y, wet = 0, x0 = -1500, x1 = 4500 }) => {
  const c = SKIES[mood];
  return (
    <g>
      <path d={`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y - 30} ${x1} ${y} L ${x1} ${y + 1800} L ${x0} ${y + 1800} Z`} fill={c.ground} />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M ${x0 + 200 + i * 420} ${y + 60 + (i % 3) * 90} q 60 -14 120 0`} fill="none" stroke={c.groundShade} strokeWidth={6} strokeLinecap="round" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`translate(${x0 + 300 + i * 500} ${y + 40 + ((i * 70) % 260)})`}>
          <path d="M -30 0 Q -34 -22 -10 -28 Q 18 -32 30 -14 Q 36 -4 30 0 Z" fill={c.rock} stroke={OUT} strokeWidth={3} />
          <path d="M 0 -26 Q 18 -24 26 -12 Q 14 -18 2 -20 Z" fill={c.rockLight} />
        </g>
      ))}
      {wet > 0 && <rect x={x0} y={y} width={x1 - x0} height={1800} fill="#1c2638" opacity={wet * 0.25} />}
      {wet > 0 &&
        Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${x0 + 400 + i * 560} ${y + 120 + (i % 4) * 70} l 90 0`} stroke="#c9d6ea" strokeWidth={4} strokeLinecap="round" opacity={wet * 0.5} />
        ))}
    </g>
  );
};

/**
 * Mountain cliff with a big dark cave mouth (arch) at `cx`, base on ground `g`. A rocky shoulder on the right
 * makes the slope a boulder can roll down. `glow` 0..1 lights the inside (when the cave opens at dawn).
 */
export const CliffCave: React.FC<{ cx: number; g: number; mood: SkyMood; mw?: number; mh?: number; glow?: number }> = ({ cx, g, mood, mw = 760, mh = 700, glow = 0 }) => {
  const c = SKIES[mood];
  const hw = mw / 2;
  return (
    <g>
      {/* cliff mass */}
      <path
        d={`M ${cx - 1700} ${g} L ${cx - 1500} ${g - 900} L ${cx - 1100} ${g - 1250} L ${cx - 500} ${g - 1500} L ${cx + 200} ${g - 1600} L ${cx + 900} ${g - 1450} L ${cx + 1500} ${g - 1150} L ${cx + 1900} ${g - 600} L ${cx + 2200} ${g} Z`}
        fill={c.rock}
        {...stroke}
      />
      {/* strata and facets */}
      <path d={`M ${cx - 1500} ${g - 900} L ${cx - 900} ${g - 820} L ${cx - 1100} ${g - 1250} Z`} fill={c.rockShade} />
      <path d={`M ${cx + 900} ${g - 1450} L ${cx + 1200} ${g - 900} L ${cx + 1900} ${g - 600} L ${cx + 1500} ${g - 1150} Z`} fill={c.rockShade} />
      <path d={`M ${cx - 500} ${g - 1500} L ${cx - 260} ${g - 1180} L ${cx + 200} ${g - 1600} Z`} fill={c.rockLight} opacity={0.7} />
      {[
        [cx - 1300, g - 600, 500],
        [cx - 800, g - 1050, 420],
        [cx + 500, g - 1200, 520],
        [cx + 1100, g - 700, 480],
        [cx - 1000, g - 300, 380],
        [cx + 700, g - 250, 420],
      ].map(([x, y, l], i) => (
        <path key={i} d={`M ${x} ${y} q ${l / 2} ${-24 + (i % 2) * 40} ${l} ${8}`} fill="none" stroke={c.rockShade} strokeWidth={8} strokeLinecap="round" />
      ))}
      {/* the slope ridge the boulder rolls along */}
      <path d={`M ${cx + 700} ${g - 1330} Q ${cx + 1000} ${g - 900} ${cx + 560} ${g - 620}`} fill="none" stroke={c.rockShade} strokeWidth={14} strokeLinecap="round" />
      {/* grass + shrubs clinging to ledges */}
      {[
        [cx - 1200, g - 1000],
        [cx + 300, g - 1380],
        [cx + 1300, g - 860],
        [cx - 700, g - 560],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle cx={-20} cy={-10} r={30} fill={mood === "storm" ? "#3f5a3a" : "#6f9a4a"} stroke={OUT} strokeWidth={3} />
          <circle cx={20} cy={-16} r={34} fill={mood === "storm" ? "#4a6a42" : "#82ad55"} stroke={OUT} strokeWidth={3} />
        </g>
      ))}
      {/* cave mouth: dark arch with inner depth rings */}
      <path d={`M ${cx - hw - 40} ${g} L ${cx - hw - 30} ${g - mh * 0.5} Q ${cx - hw} ${g - mh - 60} ${cx} ${g - mh - 70} Q ${cx + hw} ${g - mh - 60} ${cx + hw + 30} ${g - mh * 0.5} L ${cx + hw + 40} ${g} Z`} fill={c.rockShade} {...stroke} />
      <path d={`M ${cx - hw} ${g} L ${cx - hw + 6} ${g - mh * 0.5} Q ${cx - hw + 30} ${g - mh} ${cx} ${g - mh} Q ${cx + hw - 30} ${g - mh} ${cx + hw - 6} ${g - mh * 0.5} L ${cx + hw} ${g} Z`} fill="#140f0c" {...stroke} />
      <path d={`M ${cx - hw * 0.7} ${g} Q ${cx - hw * 0.6} ${g - mh * 0.8} ${cx} ${g - mh * 0.82} Q ${cx + hw * 0.6} ${g - mh * 0.8} ${cx + hw * 0.7} ${g} Z`} fill="#0a0706" />
      {glow > 0 && <path d={`M ${cx - hw} ${g} L ${cx - hw + 6} ${g - mh * 0.5} Q ${cx - hw + 30} ${g - mh} ${cx} ${g - mh} Q ${cx + hw - 30} ${g - mh} ${cx + hw - 6} ${g - mh * 0.5} L ${cx + hw} ${g} Z`} fill="#ffcf7a" opacity={glow * 0.35} />}
      {/* hanging teeth of rock at the top of the mouth */}
      {[-0.5, -0.2, 0.15, 0.45].map((k, i) => (
        <path key={i} d={`M ${cx + k * mw - 26} ${g - mh + 8 + Math.abs(k) * 80} L ${cx + k * mw} ${g - mh + 70 + (i % 2) * 30 + Math.abs(k) * 80} L ${cx + k * mw + 22} ${g - mh + 8 + Math.abs(k) * 80} Z`} fill={c.rockShade} stroke={OUT} strokeWidth={3} />
      ))}
    </g>
  );
};

/**
 * Huge boulder (radius r) with cracks, facets and moss. Rotation `rot` in degrees (rolling), centre at (x, y).
 * `rim` 0..1 draws a thin light rim on one side (light leaking around it).
 */
export const Boulder: React.FC<{ x: number; y: number; r?: number; rot?: number; mood?: SkyMood; rim?: number; rimSide?: 1 | -1 }> = ({ x, y, r = 480, rot = 0, mood = "storm", rim = 0, rimSide = -1 }) => {
  const c = SKIES[mood];
  const k = r / 480;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={r * 0.98} rx={r * 0.95} ry={r * 0.1} fill="#000" opacity={0.25} />
      <g transform={`rotate(${rot}) scale(${k})`}>
        <path d="M -470 40 Q -480 -240 -280 -400 Q -60 -500 200 -440 Q 430 -330 470 -80 Q 500 200 330 380 Q 120 500 -140 470 Q -400 400 -470 40 Z" fill={c.rock} {...stroke} strokeWidth={LINE * 1.6} />
        {/* big facets */}
        <path d="M 200 -440 Q 430 -330 470 -80 Q 500 200 330 380 Q 300 120 180 -40 Q 160 -260 200 -440 Z" fill={c.rockShade} />
        <path d="M -470 40 Q -480 -240 -280 -400 Q -200 -260 -260 -60 Q -340 60 -470 40 Z" fill={c.rockLight} opacity={0.6} />
        <path d="M -140 470 Q 120 500 330 380 Q 100 340 -60 360 Z" fill={c.rockShade} opacity={0.8} />
        {/* cracks */}
        <path d="M -60 -430 L -30 -300 L -90 -200 L -40 -80 M -90 -200 L -180 -160" fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 120 120 L 200 200 L 170 300 M 200 200 L 300 220" fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -300 200 L -200 260 L -230 360" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
        {/* pits */}
        {[
          [60, -260, 22],
          [-200, 80, 16],
          [260, -120, 14],
          [-20, 120, 18],
          [-330, -180, 12],
        ].map(([px, py, pr], i) => (
          <ellipse key={i} cx={px} cy={py} rx={pr} ry={pr * 0.7} fill={c.rockShade} stroke={OUT} strokeWidth={3} />
        ))}
        {/* moss patches */}
        <path d="M -260 -380 Q -160 -430 -60 -420 Q -120 -380 -150 -340 Q -210 -350 -260 -380 Z" fill={mood === "storm" ? "#4c6a45" : "#7aa055"} stroke={OUT} strokeWidth={3} />
        <path d="M 300 330 Q 360 280 400 220 Q 380 300 330 360 Z" fill={mood === "storm" ? "#4c6a45" : "#7aa055"} stroke={OUT} strokeWidth={3} />
      </g>
      {rim > 0 && (
        <path
          d={`M ${rimSide * r * 0.98} ${-r * 0.5} Q ${rimSide * r * 1.05} 0 ${rimSide * r * 0.92} ${r * 0.55}`}
          fill="none"
          stroke="#ffe7a8"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={rim}
        />
      )}
    </g>
  );
};

/**
 * Inside the cave looking out at the mouth (centred on cx, floor at g). The boulder sits outside the arch;
 * `open` 0..1 rolls it aside to the right. Light (and the sky behind) grows with the gap.
 * Render order: call with `layer="back"` (sky + boulder + walls + floor), put characters, then `layer="front"`
 * (light rays, foreground rocks, drips, dark grade).
 */
export const CaveInside: React.FC<{ cx: number; g: number; open: number; t: number; layer: "back" | "front"; sky?: SkyMood; mw?: number; mh?: number }> = ({
  cx,
  g,
  open,
  t,
  layer,
  sky = "storm",
  mw = 760,
  mh = 700,
}) => {
  const hw = mw / 2;
  const arch = `M ${cx - hw} ${g} L ${cx - hw + 6} ${g - mh * 0.5} Q ${cx - hw + 30} ${g - mh} ${cx} ${g - mh} Q ${cx + hw - 30} ${g - mh} ${cx + hw - 6} ${g - mh * 0.5} L ${cx + hw} ${g} Z`;
  const r = 480;
  const bx = cx - 40 + open * 1150;
  const gap = Math.max(0, Math.min(1, (bx - r - (cx - hw)) / mw + 0.06));
  const light = Math.min(1, 0.05 + gap * 1.4);
  const wall = "#3b4150";
  const wallShade = "#272b36";
  const wallLight = "#565d6e";
  const clip = `cave-arch-${cx}`;
  if (layer === "back") {
    return (
      <g>
        <defs>
          <clipPath id={clip}>
            <path d={arch} />
          </clipPath>
        </defs>
        {/* outside, seen through the mouth */}
        <g clipPath={`url(#${clip})`}>
          <rect x={cx - hw - 20} y={g - mh - 20} width={mw + 40} height={mh + 40} fill={sky === "storm" ? "#55627a" : "#ffd89a"} />
          <rect x={cx - hw - 20} y={g - mh * 0.35} width={mw + 40} height={mh} fill={sky === "storm" ? "#3e4756" : "#c9a676"} />
          {sky !== "storm" && <circle cx={cx - 120} cy={g - mh * 0.45} r={70} fill="#fff4c8" opacity={0.9} />}
          <Boulder x={bx} y={g - r + 20} r={r} rot={open * 140} mood={sky === "storm" ? "storm" : "dawn"} />
        </g>
        {/* the edge light leaking in around the boulder */}
        <path d={arch} fill="none" stroke="#ffe7a8" strokeWidth={6} opacity={0.25 + gap * 0.5} />
        {/* cave walls with the arch hole (even-odd) */}
        <path
          fillRule="evenodd"
          d={`M ${cx - 2600} ${g - 2600} L ${cx + 2600} ${g - 2600} L ${cx + 2600} ${g + 400} L ${cx - 2600} ${g + 400} Z ${arch}`}
          fill={wall}
          {...stroke}
        />
        {/* rock lumps and strata on the walls */}
        {[
          [cx - 900, g - 900, 260, 180],
          [cx + 900, g - 1000, 300, 200],
          [cx - 1300, g - 400, 260, 220],
          [cx + 1250, g - 380, 280, 220],
          [cx - 500, g - 1250, 320, 160],
          [cx + 520, g - 1250, 300, 160],
        ].map(([x, y, rx, ry], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? wallShade : wallLight} stroke={OUT} strokeWidth={3} opacity={0.9} />
            <path d={`M ${x - rx * 0.6} ${y - ry * 0.3} q ${rx * 0.5} -30 ${rx} 0`} fill="none" stroke={i % 2 ? wallLight : wallShade} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
        {/* stalactites */}
        {Array.from({ length: 11 }, (_, i) => {
          const x = cx - 1400 + i * 280 + (i % 3) * 30;
          const len = 120 + ((i * 53) % 160);
          const top = g - mh - 260 - ((i * 37) % 200);
          return <path key={i} d={`M ${x - 40} ${top} L ${x} ${top + len} L ${x + 36} ${top} Z`} fill={i % 2 ? wallShade : wallLight} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />;
        })}
        {/* uneven floor */}
        <path d={`M ${cx - 2600} ${g + 10} Q ${cx - 1200} ${g - 30} ${cx} ${g + 4} Q ${cx + 1200} ${g + 30} ${cx + 2600} ${g - 10} L ${cx + 2600} ${g + 1400} L ${cx - 2600} ${g + 1400} Z`} fill="#2f333e" {...stroke} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${cx - 1600 + i * 400} ${g + 80 + (i % 3) * 70} q 70 -16 140 0`} fill="none" stroke="#454b59" strokeWidth={6} strokeLinecap="round" />
        ))}
        {/* wet floor patches reflecting the opening */}
        {[
          [cx - 500, g + 120, 220],
          [cx + 420, g + 200, 260],
        ].map(([x, y, w], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={w} ry={w / 8} fill="#232733" />
            <ellipse cx={x + 40} cy={y - 4} rx={w * 0.5} ry={w / 22} fill="#ffe7a8" opacity={0.12 + light * 0.4} />
            <ellipse cx={x - 60} cy={y + 2} rx={10 + ((t * 30 + i * 13) % 40)} ry={3 + ((t * 8) % 10)} fill="none" stroke="#7f8aa0" strokeWidth={2} opacity={0.6 - ((t * 0.8 + i * 0.4) % 1) * 0.6} />
          </g>
        ))}
      </g>
    );
  }
  // ---- front layer: light shafts, foreground rocks, drips, ambient darkness
  return (
    <g>
      {gap > 0.02 && (
        <path d={`M ${cx - hw + 30} ${g - mh + 40} L ${bx - r + 60} ${g - mh + 80} L ${bx - r + 700 + gap * 600} ${g + 900} L ${cx - hw - 500} ${g + 900} Z`} fill="#ffe2a0" opacity={0.08 + gap * 0.28} />
      )}
      {/* drips from the ceiling */}
      {[cx - 700, cx - 260, cx + 380, cx + 820].map((x, i) => {
        const period = 1.4 + i * 0.3;
        const k = ((t + i * 0.5) % period) / period;
        const top = g - mh - 160;
        return (
          <g key={i}>
            <path d={`M ${x} ${top + k * (mh + 160)} q 6 10 0 18 q -6 -8 0 -18 Z`} fill="#bcd2ea" opacity={k < 0.95 ? 0.85 : 0} />
            {k > 0.92 && <ellipse cx={x} cy={g + 20} rx={(k - 0.92) * 500} ry={(k - 0.92) * 120} fill="none" stroke="#a8b8d0" strokeWidth={2} />}
          </g>
        );
      })}
      {/* foreground boulders framing the shot */}
      <path d={`M ${cx - 2600} ${g + 400} Q ${cx - 1500} ${g + 120} ${cx - 1150} ${g + 300} Q ${cx - 1000} ${g + 380} ${cx - 950} ${g + 600} L ${cx - 2600} ${g + 600} Z`} fill="#1f222b" {...stroke} />
      <path d={`M ${cx + 2600} ${g + 380} Q ${cx + 1600} ${g + 160} ${cx + 1250} ${g + 320} Q ${cx + 1100} ${g + 420} ${cx + 1080} ${g + 600} L ${cx + 2600} ${g + 600} Z`} fill="#1f222b" {...stroke} />
      {/* ambient darkness that lifts as light comes in */}
      <rect x={cx - 3000} y={g - 3000} width={6000} height={5000} fill="#0d1424" opacity={0.26 * (1 - light)} />
    </g>
  );
};
