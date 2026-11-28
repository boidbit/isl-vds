// Transitions and effects (library), drawn in SCREEN space (w x h) on top of a shot. Built for
// "samundar-mein-1000-dinar", reusable. Each takes `k` (0..1 progress) so a film keys it with kf().
// Pick on purpose: rewind = into a flashback, flash = a shock/reveal, whip = time/place jump, water wipe = sea cut,
// iris = close on a detail, light leak = warm/hopeful end, lens flare = a glint of gold, splash = impact in water.

import React from "react";
import { mix } from "../kit";

/** Into a flashback: sepia tint, scan lines, fast horizontal streaks, a rewind icon. k 0..1..0 (peak in the middle). */
export const RewindFx: React.FC<{ k: number; t: number; w: number; h: number }> = ({ k, t, w, h }) => {
  if (k <= 0.001) return null;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#c89a5a" opacity={0.45 * k} style={{ mixBlendMode: "multiply" }} />
      <rect x={0} y={0} width={w} height={h} fill="#fff4d8" opacity={0.18 * k} />
      {Array.from({ length: Math.ceil(h / 6) }).map((_, i) => (
        <rect key={i} x={0} y={i * 6} width={w} height={2} fill="#000" opacity={0.12 * k} />
      ))}
      {Array.from({ length: 14 }).map((_, i) => {
        const yy = ((i * 211 + t * 2600) % (h + 200)) - 100;
        return <rect key={`s${i}`} x={0} y={yy} width={w} height={6 + (i % 3) * 8} fill="#ffffff" opacity={0.35 * k * ((i % 4) / 4 + 0.2)} />;
      })}
      <g transform={`translate(${w * 0.12} ${h * 0.1})`} opacity={k}>
        <path d="M 60 0 L 0 34 L 60 68 Z M 120 0 L 60 34 L 120 68 Z" fill="#ffffff" stroke="#1d120a" strokeWidth={6} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** White (or coloured) flash, k 0..1. */
export const FlashFx: React.FC<{ k: number; w: number; h: number; color?: string }> = ({ k, w, h, color = "#ffffff" }) =>
  k > 0.001 ? <rect x={0} y={0} width={w} height={h} fill={color} opacity={k} /> : null;

/** Horizontal speed streaks for a whip pan (dir 1 = to the right). */
export const WhipFx: React.FC<{ k: number; t: number; w: number; h: number; dir?: 1 | -1 }> = ({ k, t, w, h, dir = 1 }) => {
  if (k <= 0.001) return null;
  return (
    <g opacity={k}>
      <rect x={0} y={0} width={w} height={h} fill="#ffffff" opacity={0.12} />
      {Array.from({ length: 26 }).map((_, i) => {
        const yy = (i * 97.3) % h;
        const len = 300 + (i % 5) * 160;
        const xx = (((i * 331 + dir * t * 5200) % (w + len)) + (w + len)) % (w + len) - len;
        return <rect key={i} x={xx} y={yy} width={len} height={4 + (i % 4) * 3} rx={4} fill="#ffffff" opacity={0.5} />;
      })}
    </g>
  );
};

/** Iris: everything outside a circle at (x, y) goes dark. r 0 = closed. */
export const IrisFx: React.FC<{ x: number; y: number; r: number; w: number; h: number; color?: string }> = ({ x, y, r, w, h, color = "#000" }) => (
  <path d={`M 0 0 H ${w} V ${h} H 0 Z M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`} fill={color} fillRule="evenodd" />
);

/** Water rising over the frame (k 0..1 covers it): a sea cut between two shores. */
export const WaterWipe: React.FC<{ k: number; t: number; w: number; h: number; color?: string }> = ({ k, t, w, h, color = "#2f6f8c" }) => {
  if (k <= 0.001) return null;
  const top = mix(h + 120, -220, k);
  let d = `M -60 ${h + 120} L -60 ${top}`;
  for (let x = -60; x <= w + 60; x += 30) d += ` L ${x} ${top + Math.sin(x / 90 + t * 3) * 46}`;
  d += ` L ${w + 60} ${h + 120} Z`;
  return (
    <g>
      <path d={d} fill={color} />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={16} opacity={0.65} />
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={i} cx={(i * 71) % w} cy={top + 20 + ((i * 37) % 60)} r={8 + (i % 3) * 5} fill="#ffffff" opacity={0.5} />
      ))}
    </g>
  );
};

/** Warm light leak drifting over the frame (screen blend), k = strength. */
export const LightLeak: React.FC<{ k: number; t: number; w: number; h: number; color?: string; color2?: string }> = ({ k, t, w, h, color = "#ffb24a", color2 = "#ff6a3a" }) => {
  if (k <= 0.001) return null;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={k}>
      <defs>
        <radialGradient id="leakA">
          <stop offset="0" stopColor={color} stopOpacity={0.9} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="leakB">
          <stop offset="0" stopColor={color2} stopOpacity={0.7} />
          <stop offset="1" stopColor={color2} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={w * (0.1 + 0.15 * Math.sin(t * 0.7))} cy={h * 0.25} rx={w * 0.6} ry={h * 0.35} fill="url(#leakA)" />
      <ellipse cx={w * (0.95 - 0.1 * Math.sin(t * 0.5))} cy={h * (0.7 + 0.05 * Math.sin(t))} rx={w * 0.5} ry={h * 0.3} fill="url(#leakB)" />
    </g>
  );
};

/** Lens flare at (x, y): star rays + ghosts towards the frame centre. k = strength. */
export const LensFlare: React.FC<{ x: number; y: number; k: number; t?: number; w: number; h: number; color?: string }> = ({ x, y, k, t = 0, w, h, color = "#fff2b0" }) => {
  if (k <= 0.001) return null;
  const cx = w / 2;
  const cy = h / 2;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={k}>
      <circle cx={x} cy={y} r={120} fill={color} opacity={0.35} />
      <circle cx={x} cy={y} r={40} fill="#ffffff" />
      <g transform={`translate(${x} ${y}) rotate(${t * 20})`}>
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x={-360} y={-3} width={720} height={6} rx={3} fill="#ffffff" opacity={a % 90 ? 0.35 : 0.8} transform={`rotate(${a})`} />
        ))}
      </g>
      {[0.35, 0.6, 0.85, 1.3].map((g, i) => (
        <circle key={i} cx={mix(x, cx, g * 1.4)} cy={mix(y, cy, g * 1.4)} r={20 + i * 22} fill={i % 2 ? "#9ad8ff" : color} opacity={0.18} />
      ))}
    </g>
  );
};

/** Water splash burst at (x, y): drops fly up and fall (age 0..1). */
export const SplashFx: React.FC<{ x: number; y: number; age: number; s?: number }> = ({ x, y, age, s = 1 }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - age * 0.8}>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (-160 + (i / 13) * 140) * (Math.PI / 180);
        const v = 260 + (i % 4) * 70;
        const px = Math.cos(a) * v * age;
        const py = Math.sin(a) * v * age + 520 * age * age;
        return <ellipse key={i} cx={px} cy={py} rx={10} ry={14} fill="#e6f6ff" stroke="#5aa9cf" strokeWidth={2} />;
      })}
      <path d={`M -120 0 Q -60 ${-160 * (1 - age)} 0 ${-220 * (1 - age)} Q 60 ${-160 * (1 - age)} 120 0 Z`} fill="#ffffff" opacity={0.7} />
      <ellipse cx={0} cy={6} rx={140 + age * 160} ry={18 + age * 10} fill="none" stroke="#ffffff" strokeWidth={6} />
    </g>
  );
};

/** Slow motion inside a shot: maps local frame l to a slower story time between a..b (factor < 1 = slower). */
export const slowmo = (l: number, a: number, b: number, factor: number) => (l <= a ? l : l >= b ? a + (b - a) * factor + (l - b) : a + (l - a) * factor);
