// Close-up and nature assets (library), reusable across stories.

import React from "react";
import { LINE, OUT, mix } from "../kit";
import { VillageTree } from "./Village";

const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const SKIN = "#e2a774";
const SKIN_SHADE = "#c98c5c";
const ROBE = "#f4ead6";
const ROBE_SHADE = "#dccbaa";

/** Lush rounded tree that gives shade (the "hara-bhara ped"): the detailed neem from the village library. */
export const GreenTree: React.FC<{ x: number; y: number; s?: number; sway?: number; t?: number }> = (p) => <VillageTree kind="neem" {...p} />;

/** Dark damp patch of sand next to the well. */
export const WetMud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -90 0 Q -80 -16 -30 -18 Q 30 -24 80 -10 Q 100 4 60 14 Q 0 22 -60 14 Q -100 8 -90 0 Z" fill="#b07a48" />
    <path d="M -50 -2 Q -10 -10 30 -4" fill="none" stroke="#8f5e34" strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** Water surface seen from inside the well, with expanding ripples at (rx, ry). */
export const WaterCloseup: React.FC<{ t: number; ripples: { x: number; age: number }[] }> = ({ t, ripples }) => (
  <g>
    <defs>
      <linearGradient id="wellWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3f5b60" />
        <stop offset="1" stopColor="#1f3035" />
      </linearGradient>
      <linearGradient id="waterDeep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3fa0bf" />
        <stop offset="1" stopColor="#0f3442" />
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={2320} height={1480} fill="url(#wellWall)" />
    {Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 6 }, (_, i) => (
        <rect key={`${row}-${i}`} x={-100 + i * 360 + (row % 2) * 180} y={-120 + row * 150} width={340} height={136} rx={30} fill={["#4c6a6e", "#456368", "#557478"][(row + i) % 3]} stroke="#24363a" strokeWidth={5} />
      )),
    )}
    {/* light falling from the opening */}
    <path d="M 700 -200 L 1300 -200 L 1500 700 L 500 700 Z" fill="#fff6d0" opacity={0.08} />
    <rect x={-200} y={640} width={2320} height={700} fill="url(#waterDeep)" />
    <path d={`M -200 640 Q 300 ${630 + Math.sin(t * 2) * 6} 960 640 Q 1500 ${650 + Math.sin(t * 2 + 1) * 6} 2120 640`} fill="none" stroke="#bfeaf8" strokeWidth={6} />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={400 + i * 520 + Math.sin(t + i) * 30} cy={700 + i * 40} rx={140} ry={8} fill="#8fd3f0" opacity={0.25} />
    ))}
    {ripples.map((r, i) =>
      [0, 1, 2].map((k) => {
        const a = r.age - k * 0.25;
        if (a <= 0 || a > 1.6) return null;
        return <ellipse key={`${i}-${k}`} cx={r.x} cy={645} rx={60 + a * 260} ry={10 + a * 30} fill="none" stroke="#e4f8ff" strokeWidth={5} opacity={Math.max(0, 0.9 - a * 0.6)} />;
      }),
    )}
  </g>
);

/** Two cupped hands (big close-up). `water` 0..1 shows water held in the palms. */
export const CuppedHands: React.FC<{ x: number; y: number; water: number; t: number }> = ({ x, y, water, t }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* sleeves coming from above */}
    <path d="M -330 -620 L -200 -140 L -60 -160 L -150 -620 Z" fill={ROBE_SHADE} {...stroke} />
    <path d="M 330 -620 L 200 -140 L 60 -160 L 150 -620 Z" fill={ROBE} {...stroke} />
    {/* palms joined like a bowl */}
    <path d="M -230 -150 Q -260 40 -40 70 Q 0 74 40 70 Q 260 40 230 -150 Q 120 -100 0 -110 Q -120 -100 -230 -150 Z" fill={SKIN} {...stroke} />
    <path d="M 0 -110 L 0 64" stroke={SKIN_SHADE} strokeWidth={6} strokeLinecap="round" />
    {[-1, 1].map((side) => (
      <g key={side}>
        {[0, 1, 2, 3].map((f) => (
          <path key={f} d={`M ${side * (70 + f * 40)} -118 Q ${side * (78 + f * 40)} -170 ${side * (100 + f * 38)} -150`} fill="none" stroke={SKIN_SHADE} strokeWidth={5} strokeLinecap="round" />
        ))}
        <path d={`M ${side * 225} -150 Q ${side * 270} -210 ${side * 210} -230 Q ${side * 180} -200 ${side * 190} -150 Z`} fill={SKIN} {...stroke} />
      </g>
    ))}
    {water > 0.02 && (
      <g opacity={water}>
        <path d="M -190 -112 Q 0 -80 190 -112 Q 150 30 0 40 Q -150 30 -190 -112 Z" fill="#7fc9e6" stroke="#4c9cc0" strokeWidth={4} />
        <ellipse cx={-50 + Math.sin(t * 3) * 10} cy={-80} rx={70} ry={10} fill="#e4f8ff" opacity={0.7} />
        {[0, 1, 2].map((i) => {
          const yy = 60 + ((t * 300 + i * 70) % 260);
          return <path key={i} transform={`translate(${-120 + i * 110} ${yy})`} d="M 0 -14 Q 9 2 0 10 Q -9 2 0 -14 Z" fill="#bfeaf8" stroke="#4c9cc0" strokeWidth={3} />;
        })}
      </g>
    )}
  </g>
);

/** Big leather sock held from above by a hand; `fill` 0..1 is the water level inside, `dip` sinks it into water. */
export const KhuffFilling: React.FC<{ x: number; y: number; fill: number; t: number }> = ({ x, y, fill, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <clipPath id="khuffInside">
        <path d="M -95 -60 L -100 250 Q -100 360 20 360 L 200 360 Q 270 360 270 300 Q 270 240 170 225 L 95 210 L 92 -60 Z" />
      </clipPath>
    </defs>
    {/* arm holding the top */}
    <path d="M -40 -640 L -70 -90 L 70 -90 L 80 -640 Z" fill={ROBE} {...stroke} />
    <path d="M -95 -60 L -100 250 Q -100 360 20 360 L 200 360 Q 270 360 270 300 Q 270 240 170 225 L 95 210 L 92 -60 Z" fill="#8f5a33" {...stroke} />
    <g clipPath="url(#khuffInside)">
      <rect x={-120} y={360 - fill * 420} width={420} height={420} fill="#5aa9cf" opacity={0.55} />
    </g>
    <path d="M -60 20 Q -70 150 -50 260" fill="none" stroke="#a8703f" strokeWidth={10} strokeLinecap="round" />
    <ellipse cx={0} cy={-60} rx={96} ry={30} fill="#5b3820" {...stroke} />
    <ellipse cx={0} cy={-58} rx={80} ry={20} fill={fill > 0.6 ? "#7fc9e6" : "#3a2414"} />
    <path d="M -60 -70 Q -40 -110 0 -96 Q 40 -112 60 -70" fill={SKIN} {...stroke} />
    {/* bubbles while filling */}
    {fill > 0.05 &&
      fill < 0.98 &&
      [0, 1, 2, 3].map((i) => {
        const yy = 260 - ((t * 220 + i * 60) % 300);
        return <circle key={i} cx={-40 + i * 30 + Math.sin(t * 5 + i) * 8} cy={yy} r={8 + (i % 2) * 4} fill="none" stroke="#e4f8ff" strokeWidth={3} />;
      })}
  </g>
);

/** Man seen from behind: turban and shoulders, used in the foreground of over-the-shoulder shots. */
export const BackShoulder: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -420 400 Q -400 80 -200 20 Q 0 -20 200 20 Q 380 80 400 400 Z" fill={ROBE} {...stroke} />
    <path d="M -300 380 Q -280 160 -160 80" fill="none" stroke={ROBE_SHADE} strokeWidth={18} strokeLinecap="round" />
    <rect x={-60} y={-60} width={120} height={100} rx={30} fill={SKIN_SHADE} {...stroke} />
    <ellipse cx={0} cy={-160} rx={170} ry={170} fill="#3b2a20" {...stroke} />
    <path d="M -175 -190 Q -180 -390 0 -400 Q 180 -400 178 -190 Q 90 -230 0 -232 Q -90 -230 -175 -190 Z" fill="#ffffff" {...stroke} />
    <path d="M -150 -260 Q 0 -310 150 -260" fill="none" stroke="#e2ddd2" strokeWidth={16} strokeLinecap="round" />
    <path d="M -140 -320 Q 0 -370 130 -322" fill="none" stroke="#e2ddd2" strokeWidth={16} strokeLinecap="round" />
    <path d="M -40 -200 Q -80 -60 -50 60 L 10 60 Q -20 -60 20 -200 Z" fill="#e2ddd2" {...stroke} />
  </g>
);

/** Man seen from directly above (turban circle, shoulders, reaching arms). */
export const TopDownMan: React.FC<{ x: number; y: number; s: number; reach: number }> = ({ x, y, s, reach }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((side) => (
      <g key={side} transform={`rotate(${side * (20 + reach * 25)})`}>
        <rect x={side * 95 - 22} y={-30} width={44} height={150 + reach * 40} rx={22} fill={ROBE_SHADE} {...stroke} />
        <circle cx={side * 95} cy={130 + reach * 40} r={24} fill={SKIN} {...stroke} />
      </g>
    ))}
    <ellipse cx={0} cy={0} rx={130} ry={75} fill={ROBE} {...stroke} />
    <circle cx={0} cy={-8} r={70} fill="#ffffff" {...stroke} />
    <circle cx={0} cy={-8} r={46} fill="none" stroke="#e2ddd2" strokeWidth={10} />
    <circle cx={0} cy={-8} r={20} fill="#e2ddd2" />
  </g>
);

// ------------------------------------------------------------------ hand inserts (top view), built for samundar-mein-1000-dinar
const hst = { stroke: OUT, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Wooden table top seen from above, filling w x h (planks, grain, knots, warm light streak). */
export const TableTop: React.FC<{ w: number; h: number; tone?: string }> = ({ w, h, tone = "#a87648" }) => (
  <g>
    <rect x={0} y={0} width={w} height={h} fill={tone} />
    {Array.from({ length: Math.ceil(h / 220) }).map((_, i) => (
      <g key={i}>
        <path d={`M 0 ${i * 220} L ${w} ${i * 220}`} stroke="#5a3a22" strokeWidth={6} />
        {[0, 1, 2].map((j) => (
          <path key={j} d={`M -20 ${i * 220 + 50 + j * 50} Q ${w * 0.3} ${i * 220 + 40 + j * 50 + (i % 2 ? 14 : -10)} ${w * 0.6} ${i * 220 + 54 + j * 50} T ${w + 20} ${i * 220 + 48 + j * 50}`} fill="none" stroke="#8a5a34" strokeWidth={4} opacity={0.6} />
        ))}
      </g>
    ))}
    <ellipse cx={w * 0.78} cy={h * 0.32} rx={22} ry={12} fill="#6e4426" opacity={0.7} />
  </g>
);

/** An arm reaching into the frame from `from` to `to` (screen coords), hand seen from above.
 * mode: flat = palm down (pushing / touching), grip = closed on something, point = one finger. k 0..1 = how far in. */
export const HandReach: React.FC<{ from: [number, number]; to: [number, number]; k?: number; skin?: string; sleeve?: string; mode?: "flat" | "grip" | "point"; s?: number }> = ({
  from,
  to,
  k = 1,
  skin = "#e0a370",
  sleeve = "#6f7a3f",
  mode = "flat",
  s = 1,
}) => {
  const hx = mix(from[0], to[0], k);
  const hy = mix(from[1], to[1], k);
  const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  return (
    <g>
      <path d={`M ${from[0]} ${from[1]} L ${hx} ${hy}`} stroke={OUT} strokeWidth={150 * s} strokeLinecap="round" />
      <path d={`M ${from[0]} ${from[1]} L ${hx} ${hy}`} stroke={sleeve} strokeWidth={138 * s} strokeLinecap="round" />
      <g transform={`translate(${hx} ${hy}) rotate(${ang}) scale(${s})`}>
        <ellipse cx={-30} cy={0} rx={60} ry={70} fill={sleeve} {...hst} strokeWidth={5} />
        <path d="M -20 -36 Q 20 -46 50 -34 Q 70 -10 64 30 Q 40 44 -20 38 Z" fill={skin} {...hst} strokeWidth={5} />
        {mode === "flat" && (
          <g>
            {/* fingers together (mitten) with three separations, nails at the tips */}
            <path d="M 50 -40 L 112 -40 Q 134 -38 134 -8 L 134 6 Q 134 38 112 40 L 50 42 Z" fill={skin} {...hst} strokeWidth={5} />
            {[-20, 0, 20].map((fy) => (
              <path key={fy} d={`M 70 ${fy} L 132 ${fy}`} stroke={OUT} strokeWidth={3} />
            ))}
            {[-30, -10, 10, 30].map((fy) => (
              <ellipse key={`n${fy}`} cx={124} cy={fy} rx={6} ry={5} fill="#f4c8a8" opacity={0.8} />
            ))}
          </g>
        )}
        {mode === "point" && (
          <>
            <path d="M 56 -24 L 140 -26" stroke={OUT} strokeWidth={24} strokeLinecap="round" />
            <path d="M 56 -24 L 140 -26" stroke={skin} strokeWidth={16} strokeLinecap="round" />
            <path d="M 50 -6 Q 80 6 60 30" fill={skin} {...hst} strokeWidth={5} />
          </>
        )}
        {mode === "grip" && <path d="M 50 -36 Q 96 -30 90 4 Q 92 36 50 38 Z" fill={skin} {...hst} strokeWidth={5} />}
        {mode !== "point" && <path d="M 0 -36 Q 30 -70 60 -58" stroke={OUT} strokeWidth={24} strokeLinecap="round" fill="none" />}
        {mode !== "point" && <path d="M 0 -36 Q 30 -70 60 -58" stroke={skin} strokeWidth={16} strokeLinecap="round" fill="none" />}
      </g>
    </g>
  );
};
