// Old-times room interior + small props (library). Built for "gufa-ke-teen" flashbacks, reusable.

import React from "react";
import { LINE, OUT } from "../kit";
import { BASE_POSE, Musafir, type Look } from "../Musafir";

const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const mixC = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(",")})`;
};

/** Small clay oil lamp (diya) with a flickering flame and soft glow. */
export const Diya: React.FC<{ x: number; y: number; t: number; s?: number; burn?: number }> = ({ x, y, t, s = 1, burn = 1 }) => {
  const fl = 1 + Math.sin(t * 11) * 0.1 + Math.sin(t * 17) * 0.06;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-30} r={130 * burn} fill="#ffb84a" opacity={0.12 * burn} />
      <circle cx={0} cy={-30} r={60 * burn} fill="#ffcf6a" opacity={0.18 * burn} />
      <path d="M -34 -6 Q -30 14 0 14 Q 30 14 34 -6 Q 40 -10 44 -16 L 24 -12 Q 0 -4 -34 -6 Z" fill="#b45f34" {...stroke} strokeWidth={3} />
      {burn > 0.05 && (
        <g transform={`translate(34 -16) scale(${fl * burn})`}>
          <path d="M 0 0 Q -10 -14 0 -34 Q 10 -14 0 0 Z" fill="#ffb02e" />
          <path d="M 0 -2 Q -5 -10 0 -22 Q 5 -10 0 -2 Z" fill="#fff2b0" />
        </g>
      )}
    </g>
  );
};

/** Woven reed mat (chatai) on the floor, seen in perspective. */
export const Chatai: React.FC<{ x: number; y: number; w?: number; d?: number }> = ({ x, y, w = 600, d = 90 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-w / 2} 0 L ${-w / 2 + 40} ${-d} L ${w / 2 - 40} ${-d} L ${w / 2} 0 Z`} fill="#d8b878" {...stroke} strokeWidth={3} />
    {Array.from({ length: Math.floor(w / 30) }, (_, i) => {
      const k = i / Math.floor(w / 30);
      return <path key={i} d={`M ${-w / 2 + k * w} 0 L ${-w / 2 + 40 + k * (w - 80)} ${-d}`} stroke="#b8975a" strokeWidth={2.5} />;
    })}
    {[0.33, 0.66].map((k) => (
      <path key={k} d={`M ${-w / 2 + 40 * (1 - k) + 0} ${-d * k} L ${w / 2 - 40 * (1 - k)} ${-d * k}`} stroke="#a8874a" strokeWidth={3} />
    ))}
  </g>
);

/**
 * Mud-walled room seen from inside. Floor at y = g, back wall from x0 to x1. `time` 0 = night (moonlit window,
 * diya bright) .. 1 = morning (sunlit window, warm room). `door` 0..1 opens the door at doorX (night/day outside).
 */
export const MudRoom: React.FC<{ g: number; x0?: number; x1?: number; time?: number; t: number; door?: number; doorX?: number; winX?: number; diyaX?: number; diyaBurn?: number }> = ({
  g,
  x0 = -400,
  x1 = 2400,
  time = 0,
  t,
  door = 0,
  doorX = 200,
  winX = 1300,
  diyaX = 860,
  diyaBurn = 1,
}) => {
  const wall = mixC("#7a5a40", "#d4a574", time);
  const wallShade = mixC("#5a4030", "#b88a5c", time);
  const floor = mixC("#5e4532", "#b88d60", time);
  const outside = mixC("#1d2a4a", "#ffd99a", time);
  const winLight = mixC("#a8c4ff", "#ffe2a0", time);
  const top = g - 1100;
  return (
    <g>
      {/* back wall */}
      <rect x={x0 - 600} y={top - 600} width={x1 - x0 + 1200} height={1700} fill={wall} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${x0 + 100 + i * 330} ${top + 300 + (i % 3) * 180} q 50 -14 100 0`} fill="none" stroke={wallShade} strokeWidth={6} strokeLinecap="round" />
      ))}
      <path d={`M ${x0 + 300} ${top + 520} l 20 30 l -8 26 l 16 30`} fill="none" stroke={OUT} strokeWidth={2.5} opacity={0.5} />
      {/* wooden ceiling: beams + planks */}
      <rect x={x0 - 600} y={top - 600} width={x1 - x0 + 1200} height={640} fill={mixC("#4a3020", "#8a5a36", time)} />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M ${x0 - 600 + i * 260} ${top - 600} L ${x0 - 600 + i * 260} ${top + 40}`} stroke={mixC("#3a2418", "#6a4226", time)} strokeWidth={5} />
      ))}
      <rect x={x0 - 600} y={top + 20} width={x1 - x0 + 1200} height={50} fill={mixC("#3a2418", "#6a4226", time)} {...stroke} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={x0 - 200 + i * 420} cy={top + 45} r={10} fill={mixC("#2a1a10", "#4a2e1c", time)} />
      ))}
      {/* window with shutters and the light outside (moon or sun) */}
      <g transform={`translate(${winX} ${top + 300})`}>
        <rect x={-20} y={-30} width={300} height={24} rx={4} fill="#6a4226" {...stroke} strokeWidth={3} />
        <rect x={0} y={0} width={260} height={240} rx={8} fill={outside} {...stroke} />
        <circle cx={time < 0.5 ? 180 : 70} cy={time < 0.5 ? 70 : 170} r={time < 0.5 ? 34 : 44} fill={time < 0.5 ? "#f4f1dc" : "#fff4c8"} opacity={time < 0.5 ? 1 - time * 2 : (time - 0.5) * 2} />
        {time < 0.6 && [[40, 50], [110, 30], [220, 140], [60, 160]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill="#fff" opacity={(0.6 - time) * 1.4} />)}
        {[86, 172].map((bx) => (
          <path key={bx} d={`M ${bx} 4 L ${bx} 236`} stroke="#4a3a30" strokeWidth={6} />
        ))}
        <path d="M 0 0 L -70 16 L -70 228 L 0 240 Z" fill="#9c6a42" {...stroke} strokeWidth={3} />
        <path d="M 260 0 L 326 14 L 326 228 L 260 240 Z" fill="#8f5f3a" {...stroke} strokeWidth={3} />
        <rect x={-30} y={240} width={320} height={18} rx={5} fill={wallShade} {...stroke} strokeWidth={3} />
      </g>
      {/* light shaft from the window onto the floor */}
      <path d={`M ${winX} ${top + 300} L ${winX + 260} ${top + 300} L ${winX + 520 - time * 300} ${g + 80} L ${winX - 120 - time * 300} ${g + 80} Z`} fill={winLight} opacity={0.16 + time * 0.12} />
      {/* doorway (outside visible when open) */}
      <g transform={`translate(${doorX} ${g})`}>
        <path d="M -150 0 L -150 -560 L 150 -560 L 150 0 Z" fill="#6a4226" {...stroke} />
        <rect x={-130} y={-540} width={260} height={540} fill={outside} />
        <rect x={-130} y={-120} width={260} height={120} fill={mixC("#2a2a30", "#c9a070", time)} />
        <g transform={`translate(-130 0) scale(${1 - door * 0.85} 1)`}>
          <rect x={0} y={-540} width={260} height={540} fill="#8a5a36" {...stroke} />
          {[65, 130, 195].map((dx) => (
            <path key={dx} d={`M ${dx} -530 L ${dx} -10`} stroke="#6a4226" strokeWidth={5} />
          ))}
          <circle cx={225} cy={-270} r={9} fill="#c9a24a" stroke={OUT} strokeWidth={2} />
        </g>
      </g>
      {/* niche with the diya */}
      <g transform={`translate(${diyaX} ${top + 560})`}>
        <path d="M -70 60 L -70 -40 Q 0 -110 70 -40 L 70 60 Z" fill={mixC("#3a2618", "#7a5232", time)} {...stroke} />
        <Diya x={-10} y={56} t={t} s={1.2} burn={diyaBurn} />
      </g>
      {/* floor */}
      <rect x={x0 - 600} y={g - 4} width={x1 - x0 + 1200} height={1400} fill={floor} />
      <path d={`M ${x0 - 600} ${g - 4} L ${x1 + 600} ${g - 4}`} stroke={OUT} strokeWidth={LINE} />
      <rect x={x0 - 600} y={g - 60} width={x1 - x0 + 1200} height={56} fill={wallShade} opacity={0.6} />
      {/* clay pots in the corner + hanging rope */}
      <g transform={`translate(${x1 - 200} ${g + 10})`}>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 90 - 90} ${i === 1 ? 20 : 0}) scale(${i === 1 ? 1.2 : 0.95})`}>
            <path d="M -40 0 Q -66 -66 -26 -106 L -20 -126 L 20 -126 L 26 -106 Q 66 -66 40 0 Z" fill={i % 2 ? "#a85a30" : "#b8683a"} {...stroke} />
            <path d="M -32 -80 Q 0 -72 32 -80" fill="none" stroke="#7e3f1f" strokeWidth={5} />
          </g>
        ))}
      </g>
      {/* diya glow tint over the whole room at night */}
      <circle cx={diyaX} cy={top + 600} r={900} fill="#ffb050" opacity={0.08 * (1 - time) * diyaBurn} />
    </g>
  );
};

/**
 * A person lying asleep on the back (head to the left, face up), under a blanket, on a pillow.
 * Uses the Musafir puppet rotated, so looks match the standing characters. (x, y) = floor point under the hips.
 */
export const Sleeper: React.FC<{ x: number; y: number; look: Partial<Look>; t: number; s?: number; blanket?: string; breathe?: boolean }> = ({ x, y, look, t, s = 1, blanket = "#8a6a8a", breathe = true }) => {
  const b = breathe ? Math.sin(t * 1.6) * 4 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={300} ry={20} fill="#000" opacity={0.2} />
      {/* pillow */}
      <ellipse cx={-215} cy={-34} rx={105} ry={38} fill="#efe6d4" {...stroke} />
      <g transform="translate(160 -84) rotate(-90)">
        <Musafir x={0} y={0} look={look} noShadow pose={{ ...BASE_POSE, eyeOpen: 0.05, armF: [-4, 0], armB: [-4, 0], mouth: "neutral", time: t, look: 0 }} />
      </g>
      {/* blanket over the body, rising and falling */}
      <path d={`M -120 ${-150 - b} Q 0 ${-196 - b} 110 ${-170 - b * 0.6} Q 200 -150 214 -70 L 220 0 L -132 0 Z`} fill={blanket} {...stroke} />
      <path d={`M -110 ${-140 - b} Q 0 ${-182 - b} 100 ${-160 - b * 0.6}`} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.25} />
      {[-60, 20, 100, 170].map((sx) => (
        <path key={sx} d={`M ${sx} ${-140 - b * 0.7} q 10 60 0 130`} fill="none" stroke={OUT} strokeWidth={2.5} opacity={0.35} />
      ))}
      {/* Zzz */}
      {breathe &&
        [0, 1].map((i) => {
          const k = (t * 0.5 + i * 0.5) % 1;
          return (
            <text key={i} x={-200 + k * 60} y={-200 - k * 120} fontFamily="'DejaVu Sans', sans-serif" fontWeight={800} fontSize={40 + i * 10} fill="#e9e4ff" opacity={(1 - k) * 0.7}>
              z
            </text>
          );
        })}
    </g>
  );
};

/** Clay bowl of milk (katora). `fill` 0..1 milk level; tiny ripple with `t`. Held at (x, y) = bowl bottom. */
export const MilkBowl: React.FC<{ x: number; y: number; s?: number; t?: number; fill?: number; steam?: boolean }> = ({ x, y, s = 1, t = 0, fill = 0.85, steam = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 -50 Q -56 -4 0 0 Q 56 -4 60 -50 Z" fill="#b8683a" {...stroke} />
    <path d="M -46 -30 Q 0 -18 46 -30" fill="none" stroke="#8e4523" strokeWidth={4} />
    <ellipse cx={0} cy={-50} rx={60} ry={14} fill="#8e4523" {...stroke} />
    {fill > 0 && <ellipse cx={0} cy={-50 + (1 - fill) * 8} rx={52 * (0.7 + fill * 0.3)} ry={10 * (0.7 + fill * 0.3)} fill="#fbf8f0" />}
    {fill > 0 && <ellipse cx={-14 + Math.sin(t * 2) * 4} cy={-52 + (1 - fill) * 8} rx={16} ry={3} fill="#ffffff" />}
    {steam &&
      [0, 1].map((i) => (
        <path key={i} d={`M ${-14 + i * 26} -66 q -10 -20 0 -40 q 10 -20 0 -40`} fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.3 + Math.sin(t * 2 + i) * 0.15} />
      ))}
  </g>
);

/** Little pile of gold coins on a cloth; `shine` adds glints. */
export const GoldCoins: React.FC<{ x: number; y: number; s?: number; t?: number; shine?: number }> = ({ x, y, s = 1, t = 0, shine = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={150} ry={34} fill="#7a2a35" {...stroke} />
    <path d="M -150 0 Q -120 22 -60 26 M 150 0 Q 120 22 60 26" fill="none" stroke="#5e1f2a" strokeWidth={4} />
    {[
      [-60, -14],
      [-20, -20],
      [20, -14],
      [60, -10],
      [-40, -30],
      [0, -36],
      [40, -28],
      [-20, -48],
      [20, -50],
      [0, -64],
      [-90, -4],
      [90, -2],
    ].map(([cx, cy], i) => (
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx={26} ry={10} fill="#d9a520" stroke={OUT} strokeWidth={2.5} />
        <ellipse cx={cx} cy={cy - 3} rx={20} ry={6} fill="#ffd34d" />
      </g>
    ))}
    {shine > 0 &&
      [0, 1, 2].map((i) => {
        const k = (t * 0.8 + i * 0.37) % 1;
        const gx = [-30, 25, 0][i];
        const gy = [-40, -26, -66][i];
        return <path key={i} d={`M ${gx} ${gy - 18} L ${gx + 4} ${gy - 4} L ${gx + 18} ${gy} L ${gx + 4} ${gy + 4} L ${gx} ${gy + 18} L ${gx - 4} ${gy + 4} L ${gx - 18} ${gy} L ${gx - 4} ${gy - 4} Z`} fill="#fffbe0" opacity={Math.sin(k * Math.PI) * shine} />;
      })}
  </g>
);
