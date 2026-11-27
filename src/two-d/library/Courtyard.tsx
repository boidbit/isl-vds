// Old-basti courtyard + street props (library). Built for "billi-aur-aurat", reusable.
// Everything natural moves on its own from `t` (seconds): flames, smoke, cloth, birds, swaying lamps.

import React from "react";
import { LINE, OUT, mix } from "../kit";

const st = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, k: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, k)))).join(",")})`;
};
/** Colour along day(0) -> sunset(1) -> night(2) -> morning(3). */
export const timeColor = (stops: [string, string, string, string], time: number) => {
  const tt = Math.max(0, Math.min(3, time));
  const i = Math.min(2, Math.floor(tt));
  return mixC(stops[i], stops[i + 1], tt - i);
};
const smooth = (a: number, b: number, v: number) => {
  const k = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
/** 0..1 how "night" it is (lamps lit, stars, crickets). */
export const nightK = (time: number) => smooth(1.3, 1.9, time) * (1 - smooth(2.5, 2.95, time));

// ------------------------------------------------------------------ sky through the day
export const TimeSky: React.FC<{ time: number; t: number; x0?: number; x1?: number; y0?: number; y1?: number }> = ({ time, t, x0 = -1500, x1 = 4500, y0 = -800, y1 = 1600 }) => {
  const top = timeColor(["#5fb0e8", "#4a3f7a", "#0b1430", "#9cc0dc"], time);
  const mid = timeColor(["#a9d8f2", "#e9875a", "#1a2752", "#e8d6c4"], time);
  const low = timeColor(["#e4f3f8", "#ffc777", "#2a3a66", "#ffe2bc"], time);
  const n = nightK(time);
  const sunK = time < 1.6 ? time / 1.6 : -1; // day -> set
  const riseK = time > 2.5 ? (time - 2.5) / 0.5 : -1; // morning rise
  const sun = sunK >= 0 ? { x: mix(500, 1500, sunK), y: mix(250, 1250, sunK * sunK), c: mixC("#fff6c8", "#ff9a4a", sunK) } : riseK >= 0 ? { x: mix(-100, 200, riseK), y: mix(1300, 1050, riseK), c: "#ffe9b8" } : null;
  return (
    <g>
      <defs>
        <linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.6" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <radialGradient id="tsun">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#ffe9a0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#tsky)" />
      {n > 0.01 &&
        Array.from({ length: 60 }, (_, i) => {
          const sx = x0 + ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * (x1 - x0);
          const sy = y0 + ((Math.sin(i * 78.233) * 12543.11) % 1 + 1) % 1 * (y1 - y0) * 0.7;
          const tw = 0.6 + 0.4 * Math.sin(t * 3 + i);
          return <circle key={i} cx={sx} cy={sy} r={2 + (i % 3)} fill="#fffbe8" opacity={n * tw} />;
        })}
      {n > 0.01 && (
        <g opacity={n}>
          <circle cx={350} cy={420} r={190} fill="url(#tsun)" opacity={0.5} />
          <circle cx={350} cy={420} r={60} fill="#f4f1dc" {...st} />
          <circle cx={372} cy={404} r={52} fill={top} />
        </g>
      )}
      {sun && (
        <g>
          <circle cx={sun.x} cy={sun.y} r={300} fill="url(#tsun)" />
          <circle cx={sun.x} cy={sun.y} r={70} fill={sun.c} stroke="#ffd77a" strokeWidth={6} />
        </g>
      )}
      {/* two slow clouds */}
      {[0, 1].map((i) => {
        const cx = x0 + (((t * 12 + i * 1300) % (x1 - x0)) + (x1 - x0)) % (x1 - x0);
        const cy = 380 + i * 260;
        return (
          <g key={i} opacity={0.75 - n * 0.5} transform={`translate(${cx} ${cy})`}>
            <ellipse cx={0} cy={0} rx={150} ry={46} fill={timeColor(["#ffffff", "#ffd2a8", "#3a4a78", "#fff1e0"], time)} />
            <ellipse cx={-70} cy={12} rx={90} ry={34} fill={timeColor(["#ffffff", "#ffd2a8", "#3a4a78", "#fff1e0"], time)} />
            <ellipse cx={80} cy={14} rx={100} ry={30} fill={timeColor(["#f2f6fa", "#f6c09a", "#33426e", "#f8e6d2"], time)} />
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ far houses beyond the wall (windows glow at night)
export const FarHouses: React.FC<{ y: number; time?: number; t?: number; x0?: number; n?: number }> = ({ y, time = 0, t = 0, x0 = -600, n = 9 }) => {
  const wall = timeColor(["#d9a978", "#e0965e", "#3e3a52", "#d8b898"], time);
  const shade = timeColor(["#b98a5c", "#b66e40", "#2c2a40", "#b89878"], time);
  const lit = nightK(time);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const w = 300 + ((i * 97) % 140);
        const h = 260 + ((i * 53) % 180);
        const x = x0 + i * 380;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect x={0} y={-h} width={w} height={h} fill={i % 2 ? wall : shade} {...st} />
            <rect x={-8} y={-h - 18} width={w + 16} height={22} fill={shade} {...st} />
            {[0.25, 0.65].map((k, j) => (
              <g key={j}>
                <rect x={w * k - 24} y={-h * 0.62} width={48} height={64} rx={20} fill={mixC("#4a3424", "#ffcf6a", lit * (0.8 + 0.2 * Math.sin(t * 5 + i + j)))} {...st} />
                {lit > 0.05 && <circle cx={w * k} cy={-h * 0.62 + 32} r={70} fill="#ffcf6a" opacity={lit * 0.18} />}
              </g>
            ))}
            {[0.15, 0.5, 0.85].map((k, j) => (
              <rect key={j} x={w * k - 6} y={-h - 4} width={12} height={36} fill="#7a5a3c" {...st} strokeWidth={2} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ courtyard floor and wall
/** Old stone-flag floor from y down, in perspective: flat wide flags, thin soft joints, lighter far away. */
export const StoneFloor: React.FC<{ y: number; x0?: number; x1?: number; time?: number; depth?: number }> = ({ y, x0 = -1200, x1 = 4200, time = 0, depth = 900 }) => {
  const base = timeColor(["#d2b48c", "#cf9c70", "#4c4c64", "#cbb49a"], time);
  const a = timeColor(["#dcc29c", "#dcaa80", "#55566e", "#d6c0a6"], time);
  const b = timeColor(["#c4a47a", "#bf8a60", "#424258", "#bca48a"], time);
  const joint = timeColor(["#a8865e", "#a06c46", "#34344a", "#a08a72"], time);
  const rows: React.ReactNode[] = [];
  let yy = y;
  for (let r = 0; yy < y + depth; r++) {
    const h = 26 + r * 12; // rows grow towards the camera
    const w = h * 4.2;
    for (let x = x0 - ((r * 97) % w); x < x1; x += w * (0.8 + (((x * 13 + r * 7) | 0) % 5) * 0.08)) {
      const k = Math.sin((x + r * 31) * 0.013);
      const ww = w * 0.96;
      rows.push(
        <path
          key={`${r}-${x}`}
          d={`M ${x + 6} ${yy + 3} L ${x + ww - 4} ${yy + 2} Q ${x + ww + 2} ${yy + h / 2} ${x + ww - 2} ${yy + h - 3} L ${x + 4} ${yy + h - 2} Q ${x - 2} ${yy + h / 2} ${x + 6} ${yy + 3} Z`}
          fill={k > 0.3 ? a : k < -0.4 ? b : base}
          stroke={joint}
          strokeWidth={2.5}
        />,
      );
      if (((x * 7 + r * 13) | 0) % 6 === 0) rows.push(<path key={`c${r}-${x}`} d={`M ${x + ww * 0.3} ${yy + 5} l ${ww * 0.1} ${h * 0.4} l -${ww * 0.04} ${h * 0.4}`} fill="none" stroke={joint} strokeWidth={2} opacity={0.7} />);
    }
    yy += h;
  }
  return (
    <g>
      <defs>
        <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6e6" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#fff6e6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={x0} y={y} width={x1 - x0} height={depth + 400} fill={joint} />
      {rows}
      <rect x={x0} y={y} width={x1 - x0} height={depth} fill="url(#floorFade)" />
    </g>
  );
};

/** Sandy village street: soft gradient, wheel tracks, pebbles, grass tufts that sway. */
export const DirtGround: React.FC<{ y: number; t?: number; x0?: number; x1?: number; depth?: number }> = ({ y, t = 0, x0 = -1500, x1 = 4500, depth = 1200 }) => (
  <g>
    <defs>
      <linearGradient id="dirtG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e9cf9e" />
        <stop offset="1" stopColor="#d2ad74" />
      </linearGradient>
    </defs>
    <rect x={x0} y={y} width={x1 - x0} height={depth} fill="url(#dirtG)" />
    <path d={`M ${x0} ${y + 2} L ${x1} ${y + 2}`} stroke="#c9a46e" strokeWidth={6} />
    {[0.22, 0.5].map((k, i) => (
      <path key={i} d={`M ${x0} ${y + depth * k} Q ${(x0 + x1) / 2} ${y + depth * k - 30} ${x1} ${y + depth * k + 10}`} fill="none" stroke="#c49c64" strokeWidth={8 + i * 6} opacity={0.5} strokeLinecap="round" />
    ))}
    {Array.from({ length: 70 }, (_, i) => {
      const px = x0 + ((((Math.sin(i * 12.9898) * 43758.5) % 1) + 1) % 1) * (x1 - x0);
      const k = (((Math.sin(i * 78.233) * 12543.1) % 1) + 1) % 1;
      const py = y + 20 + k * k * depth * 0.8;
      const r = 4 + k * 12;
      return i % 4 === 0 ? (
        <g key={i} transform={`translate(${px} ${py})`}>
          {[-1, 0, 1].map((d) => (
            <path key={d} d={`M ${d * 6} 0 q ${d * 4 + Math.sin(t * 2 + i) * 3} ${-10 - r} ${d * 10 + Math.sin(t * 2 + i) * 5} ${-16 - r * 1.4}`} fill="none" stroke="#8aa64a" strokeWidth={3 + k * 2} strokeLinecap="round" />
          ))}
        </g>
      ) : (
        <ellipse key={i} cx={px} cy={py} rx={r} ry={r * 0.55} fill={i % 3 ? "#bf9a66" : "#a98656"} stroke="#8e6e44" strokeWidth={1.5} />
      );
    })}
  </g>
);

/** Low mud boundary wall with a wooden gate (doors open 0..1). Top at y - h. */
export const CourtWall: React.FC<{ x0: number; x1: number; y: number; h?: number; gateX?: number; gateW?: number; gate?: number; time?: number }> = ({ x0, x1, y, h = 230, gateX = 2300, gateW = 260, gate = 1, time = 0 }) => {
  const wall = timeColor(["#d6a06e", "#dc8c56", "#4a4360", "#d4ad8c"], time);
  const shade = timeColor(["#b88354", "#b46c3e", "#363148", "#b48f70"], time);
  const top = timeColor(["#e8b885", "#eea06a", "#58506e", "#e4c0a0"], time);
  const gl = gateX - gateW / 2;
  const gr = gateX + gateW / 2;
  const seg = (a: number, b: number) => (
    <g>
      <rect x={a} y={y - h} width={b - a} height={h} fill={wall} {...st} />
      <rect x={a} y={y - h - 14} width={b - a} height={22} rx={8} fill={top} {...st} />
      <rect x={a} y={y - 26} width={b - a} height={26} fill={shade} {...st} />
      {Array.from({ length: Math.floor((b - a) / 160) }, (_, i) => (
        <g key={i}>
          <path d={`M ${a + 60 + i * 160} ${y - h + 50} l 10 30 l -6 26`} fill="none" stroke={shade} strokeWidth={3} />
          {i % 3 === 1 && <rect x={a + 100 + i * 160} y={y - h + 90} width={46} height={22} rx={4} fill={shade} stroke={OUT} strokeWidth={2} />}
        </g>
      ))}
    </g>
  );
  const doorW = gateW / 2 - 6;
  const door = (hx: number, dir: 1 | -1) => (
    <g transform={`translate(${hx} 0) scale(${dir * Math.max(0.12, Math.cos(gate * 1.25))} 1)`}>
      <rect x={0} y={y - 300} width={doorW} height={300} fill="#8a5a34" {...st} />
      {[0.25, 0.5, 0.75].map((k) => (
        <path key={k} d={`M ${doorW * k} ${y - 296} L ${doorW * k} ${y - 4}`} stroke="#6e4426" strokeWidth={4} />
      ))}
      {[y - 250, y - 60].map((yy) => (
        <rect key={yy} x={0} y={yy} width={doorW} height={16} fill="#5a5a5e" {...st} strokeWidth={2} />
      ))}
    </g>
  );
  return (
    <g>
      {seg(x0, gl - 30)}
      {seg(gr + 30, x1)}
      {/* gate pillars + lintel */}
      <rect x={gl - 40} y={y - 360} width={44} height={360} fill={shade} {...st} />
      <rect x={gr - 4} y={y - 360} width={44} height={360} fill={shade} {...st} />
      <rect x={gl - 60} y={y - 390} width={gateW + 120} height={40} rx={6} fill={top} {...st} />
      {door(gl + 2, 1)}
      {door(gr - 2, -1)}
    </g>
  );
};

/** Soft shadow of a palm swaying on the floor/wall (multiply). */
export const PalmShadow: React.FC<{ x: number; y: number; t: number; s?: number; o?: number; skew?: number }> = ({ x, y, t, s = 1, o = 0.22, skew = 0 }) => (
  <g transform={`translate(${x} ${y}) skewX(${skew}) scale(${s} ${s * 0.45})`} opacity={o} style={{ mixBlendMode: "multiply" }}>
    <path d="M -10 0 Q 10 -300 40 -560 L 60 -556 Q 30 -300 12 0 Z" fill="#2a1a3a" />
    <g transform={`translate(50 -560) rotate(${Math.sin(t * 1.3) * 6})`}>
      {[-160, -120, -80, -40, 0, 30, 200, 160].map((a, i) => (
        <g key={i} transform={`rotate(${a + Math.sin(t * 1.7 + i) * 4})`}>
          <path d="M 0 0 Q 110 -60 260 16 Q 140 6 0 22 Z" fill="#2a1a3a" />
        </g>
      ))}
    </g>
  </g>
);

// ------------------------------------------------------------------ kitchen veranda
/** Open veranda (chhappar) with wooden posts, palm-leaf roof with a swaying fringe and a warm back wall. */
export const Veranda: React.FC<{ x0: number; x1: number; y: number; h?: number; t: number; time?: number; warm?: number }> = ({ x0, x1, y, h = 560, t, time = 0, warm = 1 }) => {
  const back = timeColor(["#c98a58", "#c07446", "#3e3450", "#c49a78"], time);
  const roofY = y - h;
  return (
    <g>
      <rect x={x0} y={roofY} width={x1 - x0} height={h - 120} fill={back} {...st} />
      <rect x={x0} y={roofY} width={x1 - x0} height={h - 120} fill="#ff9a3c" opacity={0.18 * warm} />
      {/* shelf with small pots */}
      <rect x={x0 + 60} y={roofY + 170} width={300} height={16} fill="#7a5032" {...st} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${x0 + 90 + i * 90} ${roofY + 170} q -22 -10 -16 -40 h 32 q 6 30 -16 40 Z`} fill={i % 2 ? "#b45f34" : "#c97a48"} {...st} />
      ))}
      {/* roof */}
      <path d={`M ${x0 - 60} ${roofY + 20} L ${x1 + 80} ${roofY + 60} L ${x1 + 80} ${roofY - 20} L ${x0 - 60} ${roofY - 60} Z`} fill="#a8824e" {...st} />
      {Array.from({ length: Math.floor((x1 - x0 + 140) / 26) }, (_, i) => {
        const fx = x0 - 60 + i * 26;
        const fy = roofY + 20 + ((fx - x0 + 60) / (x1 - x0 + 140)) * 40;
        const sw = Math.sin(t * 2.2 + i * 0.7) * 6;
        return <path key={i} d={`M ${fx} ${fy - 4} q ${sw * 0.5} 20 ${sw} 44`} fill="none" stroke={i % 2 ? "#8e6a3a" : "#c49a5e"} strokeWidth={6} strokeLinecap="round" />;
      })}
      <rect x={x0 - 60} y={roofY - 14} width={x1 - x0 + 140} height={20} fill="#7a5032" {...st} />
      {[x0 + 10, x1 - 10].map((px) => (
        <g key={px}>
          <rect x={px - 16} y={roofY} width={32} height={h + 40} fill="#8a5a34" {...st} />
          <path d={`M ${px - 6} ${roofY + 60} L ${px - 6} ${y}`} stroke="#6e4426" strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

/** Clay chulha with fire, iron tawa + roti, rising smoke. puff 0..1 = roti puffing up. */
export const Chulha: React.FC<{ x: number; y: number; t: number; s?: number; fire?: number; puff?: number; roti?: boolean }> = ({ x, y, t, s = 1, fire = 1, puff = 0, roti = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* smoke */}
    {[0, 1, 2, 3, 4].map((i) => {
      const k = ((t * 0.35 + i * 0.2) % 1 + 1) % 1;
      return <circle key={i} cx={-10 + Math.sin(k * 6 + i) * 30 + k * 40} cy={-150 - k * 420} r={24 + k * 50} fill="#e8e2dc" opacity={(1 - k) * 0.45 * fire} />;
    })}
    <path d="M -120 0 Q -130 -110 -90 -130 L 90 -130 Q 130 -110 120 0 Z" fill="#b8784a" {...st} />
    <path d="M -110 -20 Q -112 -90 -86 -110" fill="none" stroke="#d89a68" strokeWidth={8} strokeLinecap="round" />
    {/* fire mouth */}
    <path d="M -54 0 L -54 -60 Q 0 -100 54 -60 L 54 0 Z" fill="#3a1a0e" {...st} />
    <circle cx={0} cy={-40} r={90} fill="#ff9a3c" opacity={0.25 * fire} />
    {[-28, 0, 26].map((fx, i) => {
      const fl = 1 + Math.sin(t * 14 + i * 2) * 0.18 + Math.sin(t * 23 + i) * 0.1;
      return (
        <g key={i} transform={`translate(${fx} -4) scale(${0.9 * fire} ${fl * fire})`}>
          <path d="M -16 0 Q -20 -30 0 -62 Q 20 -30 16 0 Z" fill="#ff8a2a" />
          <path d="M -8 0 Q -10 -18 0 -38 Q 10 -18 8 0 Z" fill="#ffe27a" />
        </g>
      );
    })}
    {[-30, -6, 20, 38].map((ex, i) => (
      <circle key={i} cx={ex} cy={-6} r={6} fill="#ff5a1a" opacity={0.6 + 0.4 * Math.sin(t * 9 + i)} />
    ))}
    {/* tawa */}
    <ellipse cx={0} cy={-136} rx={112} ry={22} fill="#2e2a2a" {...st} />
    <ellipse cx={-20} cy={-142} rx={50} ry={6} fill="#5a5452" opacity={0.6} />
    {roti && (
      <g transform={`translate(0 ${-148 - puff * 10}) scale(1 ${1 + puff * 0.9})`}>
        <ellipse cx={0} cy={0} rx={76} ry={14} fill="#e8c088" {...st} />
        {[[-30, -2], [10, 2], [36, -3], [-6, -5]].map(([dx, dy], i) => (
          <ellipse key={i} cx={dx} cy={dy} rx={8} ry={3} fill="#a8703c" />
        ))}
      </g>
    )}
  </g>
);

/** Plate of fresh rotis with steam. */
export const RotiStack: React.FC<{ x: number; y: number; t: number; s?: number; n?: number; steam?: number }> = ({ x, y, t, s = 1, n = 4, steam = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={90} ry={22} fill="#c97a48" {...st} />
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 6 - 3} ${-10 - i * 9})`}>
        <ellipse cx={0} cy={0} rx={70} ry={15} fill={i === n - 1 ? "#efcb92" : "#e2b478"} {...st} />
        {i === n - 1 && [[-26, -2], [8, 3], [30, -4], [-4, -6]].map(([dx, dy], j) => <ellipse key={j} cx={dx} cy={dy} rx={7} ry={3} fill="#a8703c" />)}
      </g>
    ))}
    {steam > 0 &&
      [0, 1, 2].map((i) => {
        const k = ((t * 0.5 + i * 0.33) % 1 + 1) % 1;
        return <path key={i} d={`M ${-30 + i * 30} ${-50 - k * 120} q 14 -20 0 -40 q -14 -20 0 -40`} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={(1 - k) * 0.6 * steam} />;
      })}
  </g>
);

/** Woven basket with dates, grapes and a pomegranate. */
export const FruitBasket: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-40, -70, "#7a3a1e"], [-14, -78, "#8a4422"], [12, -74, "#7a3a1e"], [36, -68, "#8a4422"]].map(([dx, dy, c], i) => (
      <ellipse key={i} cx={dx as number} cy={dy as number} rx={14} ry={20} fill={c as string} {...st} strokeWidth={3} />
    ))}
    {[[-56, -60], [-62, -50], [-50, -48], [-58, -40]].map(([dx, dy], i) => (
      <circle key={i} cx={dx} cy={dy} r={10} fill="#7a4a8a" {...st} strokeWidth={2.5} />
    ))}
    <circle cx={50} cy={-62} r={24} fill="#c83a3a" {...st} />
    <path d="M 46 -88 l 4 -8 l 4 8" fill="#c83a3a" {...st} strokeWidth={2.5} />
    <path d="M -80 -56 Q -84 0 -50 4 L 50 4 Q 84 0 80 -56 Z" fill="#c9a060" {...st} />
    {[-40, -16, 8].map((yy) => (
      <path key={yy} d={`M -80 ${yy} Q 0 ${yy + 10} 80 ${yy}`} fill="none" stroke="#9a7440" strokeWidth={4} />
    ))}
    {[-50, -20, 10, 40].map((xx) => (
      <path key={xx} d={`M ${xx} -54 L ${xx + 4} 2`} stroke="#9a7440" strokeWidth={3} />
    ))}
  </g>
);

/** Low wooden table (lakdi ki mez). Top surface at y - h. */
export const LowTable: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 300, h = 110 }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-w / 2 + 24, w / 2 - 40].map((lx) => (
      <rect key={lx} x={lx} y={-h} width={18} height={h} fill="#6e4426" {...st} />
    ))}
    <rect x={-w / 2} y={-h - 20} width={w} height={26} rx={6} fill="#9a6a40" {...st} />
    <path d={`M ${-w / 2 + 20} ${-h - 8} L ${w / 2 - 30} ${-h - 10}`} stroke="#7a5032" strokeWidth={3} />
  </g>
);

/** Wooden chest (sandook) with metal bands and studs. */
export const WoodChest: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 220, h = 140 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={8} fill="#8a5a34" {...st} />
    <path d={`M ${-w / 2} ${-h} Q 0 ${-h - 40} ${w / 2} ${-h} Z`} fill="#9a6a40" {...st} />
    {[-w / 2 + 30, w / 2 - 42].map((bx) => (
      <rect key={bx} x={bx} y={-h - 18} width={12} height={h + 18} fill="#7a7672" {...st} strokeWidth={2} />
    ))}
    <rect x={-14} y={-h + 18} width={28} height={30} rx={4} fill="#c9a24a" {...st} strokeWidth={2.5} />
    {[-w / 2 + 14, w / 2 - 14].flatMap((sx) => [-h + 20, -24].map((sy) => <circle key={`${sx}${sy}`} cx={sx} cy={sy} r={4} fill="#c9a24a" />))}
  </g>
);

/** Rope with drying clothes fluttering in the wind, on two poles. */
export const ClothesLine: React.FC<{ x0: number; x1: number; y: number; g: number; t: number; wind?: number }> = ({ x0, x1, y, g, t, wind = 1 }) => {
  const sag = 40;
  const ry = (x: number) => y + sag * (1 - ((2 * (x - x0)) / (x1 - x0) - 1) ** 2);
  const cols = ["#d94a5a", "#f2c84a", "#4a8ad9", "#f6f0e0", "#3aa07a", "#e07a3a"];
  return (
    <g>
      {[x0, x1].map((px) => (
        <rect key={px} x={px - 10} y={y - 40} width={20} height={g - y + 40} fill="#7a5032" {...st} />
      ))}
      <path d={`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`} fill="none" stroke="#5a4632" strokeWidth={4} />
      {cols.map((c, i) => {
        const cx = x0 + ((i + 0.7) / (cols.length + 0.4)) * (x1 - x0);
        const cy = ry(cx);
        const fl = Math.sin(t * 3 + i * 1.3) * 10 * wind;
        const w = i % 2 ? 110 : 140;
        const h = i % 3 === 0 ? 170 : 130;
        return (
          <g key={i} transform={`translate(${cx} ${cy}) skewX(${fl}) rotate(${fl * 0.3})`}>
            {i % 3 === 0 ? (
              <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2 + 20} 50 L ${w / 2 - 6} 60 L ${w / 2 - 10} ${h} L ${-w / 2 + 10} ${h} L ${-w / 2 + 6} 60 L ${-w / 2 - 20} 50 Z`} fill={c} {...st} />
            ) : (
              <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2 + fl} ${h} Q 0 ${h + 12 + fl} ${-w / 2 + fl} ${h} Z`} fill={c} {...st} />
            )}
            <path d={`M ${-w / 2 + 14} 20 L ${w / 2 - 14} 20`} stroke="#000" strokeOpacity={0.12} strokeWidth={8} />
            {[-w / 2 + 12, w / 2 - 12].map((px) => (
              <rect key={px} x={px - 4} y={-10} width={8} height={22} fill="#c9a060" stroke={OUT} strokeWidth={2} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ cage, bowl, lamp
/**
 * Wooden cage. Draw layer="back" before the animal and layer="front" after it.
 * door 0 closed .. 1 open (right part swings); latch 0 open .. 1 bolt slid shut. Origin = ground centre.
 */
export const WoodCage: React.FC<{ x: number; y: number; w?: number; h?: number; door?: number; latch?: number; layer: "back" | "front"; dark?: number; time?: number }> = ({
  x,
  y,
  w = 340,
  h = 290,
  door = 0,
  latch = 1,
  layer,
  dark = 1,
  time = 0,
}) => {
  const wood = timeColor(["#a8743e", "#b07040", "#4a3e48", "#a88866"], time);
  const woodS = timeColor(["#86572c", "#8a5430", "#3a3038", "#86684c"], time);
  const woodH = timeColor(["#c8945a", "#d08e58", "#5a4c58", "#c4a684"], time);
  const L = -w / 2;
  const R = w / 2;
  const T = -h;
  if (layer === "back") {
    return (
      <g transform={`translate(${x} ${y})`}>
        <defs>
          <linearGradient id="cageDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c0806" />
            <stop offset="1" stopColor="#2a1c12" />
          </linearGradient>
        </defs>
        <rect x={L + 10} y={T + 10} width={w - 20} height={h - 16} fill="url(#cageDark)" opacity={0.35 + 0.35 * dark} />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={L + 30 + i * ((w - 60) / 4)} y={T + 14} width={8} height={h - 24} fill={woodS} opacity={0.35} />
        ))}
        {/* straw on the floor */}
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${L + 20 + i * 22} ${-8} l ${12 + (i % 3) * 6} ${-6 - (i % 2) * 4}`} stroke="#c9a85a" strokeWidth={3} opacity={0.7} />
        ))}
      </g>
    );
  }
  const bars = Math.max(3, Math.round((w * 0.62) / 52));
  const dx0 = R - w * 0.38; // door left edge
  const dx1 = R - 22; // hinge on the right post
  const doorScale = Math.max(0.08, Math.cos(door * 1.35));
  const bar = (bx: number, key: string | number) => (
    <g key={key}>
      <rect x={bx - 5} y={T + 8} width={10} height={h - 30} fill={wood} {...st} strokeWidth={2.5} />
      <path d={`M ${bx - 1} ${T + 14} L ${bx - 1} ${-26}`} stroke={woodH} strokeWidth={2} opacity={0.8} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* fixed bars */}
      {Array.from({ length: bars }, (_, i) => L + 34 + (i * (dx0 - L - 40)) / (bars - 1)).map((bx, i) => bar(bx, i))}
      {/* frame */}
      <rect x={L - 16} y={T - 26} width={w + 32} height={34} rx={6} fill={woodH} {...st} />
      <path d={`M ${L - 6} ${T - 14} L ${R + 2} ${T - 18}`} stroke={woodS} strokeWidth={3} />
      <rect x={L - 6} y={-30} width={w + 12} height={30} rx={4} fill={wood} {...st} />
      <rect x={L - 14} y={T - 10} width={28} height={h + 10} rx={5} fill={woodS} {...st} />
      <rect x={R - 14} y={T - 10} width={28} height={h + 10} rx={5} fill={woodS} {...st} />
      {[L, R].map((px) => [T + 6, -16].map((ny) => <circle key={`${px}${ny}`} cx={px} cy={ny} r={4} fill="#5a5a5e" />))}
      {/* door panel, hinged at the right post */}
      <g transform={`translate(${dx1} 0) scale(${doorScale} 1) translate(${-dx1} 0)`}>
        <rect x={dx0} y={T + 14} width={dx1 - dx0} height={20} fill={woodH} {...st} strokeWidth={3} />
        <rect x={dx0} y={-52} width={dx1 - dx0} height={20} fill={woodH} {...st} strokeWidth={3} />
        {[0.15, 0.5, 0.85].map((k, i) => bar(dx0 + k * (dx1 - dx0), `d${i}`))}
      </g>
      {/* latch: a wooden bolt on the left post that slides across the door edge */}
      <rect x={dx0 - 46} y={T + h * 0.45} width={34} height={44} rx={5} fill={woodS} {...st} strokeWidth={3} />
      <rect x={dx0 - 40 + latch * 34} y={T + h * 0.45 + 12} width={52} height={20} rx={8} fill="#7a5032" {...st} strokeWidth={3} />
      <circle cx={dx0 - 30 + latch * 34} cy={T + h * 0.45 + 22} r={5} fill="#c9a24a" />
    </g>
  );
};

/** Shallow clay bowl. water/food 0..1; wobble = rotate in degrees (pawed). */
export const CatBowl: React.FC<{ x: number; y: number; s?: number; water?: number; t?: number; wobble?: number; dry?: boolean }> = ({ x, y, s = 1, water = 0, t = 0, wobble = 0, dry }) => (
  <g transform={`translate(${x} ${y}) rotate(${wobble}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={66} ry={10} fill="#000" opacity={0.18} />
    <path d="M -60 -26 Q -54 4 0 6 Q 54 4 60 -26 Z" fill="#b8683a" {...st} />
    <ellipse cx={0} cy={-26} rx={60} ry={14} fill="#c97a48" {...st} />
    <ellipse cx={0} cy={-24} rx={48} ry={9} fill={water > 0 ? mixC("#6a3a22", "#7fc6e6", water) : "#6a3a22"} />
    {water > 0 &&
      [0, 1].map((i) => {
        const k = ((t * 0.8 + i * 0.5) % 1 + 1) % 1;
        return <ellipse key={i} cx={0} cy={-24} rx={10 + k * 36} ry={2 + k * 6} fill="none" stroke="#e8f6fc" strokeWidth={2} opacity={(1 - k) * water} />;
      })}
    {water > 0 && <ellipse cx={-16} cy={-27} rx={14} ry={2.5} fill="#fff" opacity={0.6 * water} />}
    {dry && <path d="M -30 -24 l 12 2 l 8 -3 M 10 -22 l 14 2" stroke="#4a2814" strokeWidth={2} />}
    <path d="M -50 -14 Q 0 0 50 -14" fill="none" stroke="#8e4523" strokeWidth={3} />
  </g>
);

/** Hanging lantern (laalten): swings, flame flickers, glow when lit. Origin = hook. */
export const Laalten: React.FC<{ x: number; y: number; t: number; s?: number; lit?: number; swing?: number; rope?: number }> = ({ x, y, t, s = 1, lit = 0, swing = 1, rope = 40 }) => {
  const a = Math.sin(t * 1.6) * 5 * swing;
  const fl = 1 + Math.sin(t * 13) * 0.12 + Math.sin(t * 21) * 0.08;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      {lit > 0.02 && (
        <>
          <defs>
            <radialGradient id="lglow">
              <stop offset="0" stopColor="#ffd27a" stopOpacity="0.8" />
              <stop offset="1" stopColor="#ffb04a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={0} cy={rope + 70} r={240 * fl} fill="url(#lglow)" opacity={lit} />
        </>
      )}
      <path d={`M 0 0 L 0 ${rope}`} stroke="#3a2a1e" strokeWidth={4} />
      <path d={`M -16 ${rope + 6} Q 0 ${rope - 14} 16 ${rope + 6}`} fill="none" stroke="#5a5a5e" strokeWidth={5} />
      <path d={`M -26 ${rope + 22} L 26 ${rope + 22} L 18 ${rope + 6} L -18 ${rope + 6} Z`} fill="#6a6662" {...st} strokeWidth={3} />
      <path d={`M -24 ${rope + 22} Q -36 ${rope + 70} -24 ${rope + 118} L 24 ${rope + 118} Q 36 ${rope + 70} 24 ${rope + 22} Z`} fill={mixC("#cfd6d8", "#ffe7a0", lit)} opacity={0.85} {...st} strokeWidth={3} />
      {lit > 0.02 && (
        <g transform={`translate(0 ${rope + 96}) scale(${lit} ${fl * lit})`}>
          <path d="M -9 0 Q -10 -18 0 -34 Q 10 -18 9 0 Z" fill="#ff9a2a" />
          <path d="M -4 0 Q -5 -10 0 -20 Q 5 -10 4 0 Z" fill="#fff2a0" />
        </g>
      )}
      {[-24, 0, 24].map((wx) => (
        <path key={wx} d={`M ${wx * 0.9} ${rope + 22} L ${wx * 0.9} ${rope + 118}`} stroke="#5a5a5e" strokeWidth={3} />
      ))}
      <rect x={-30} y={rope + 116} width={60} height={22} rx={6} fill="#6a6662" {...st} strokeWidth={3} />
    </g>
  );
};

// ------------------------------------------------------------------ street life
/** Date stall: table, striped awning that flutters, baskets of dates. shut 0..1 = cloth lowered (closing up). */
export const DateStall: React.FC<{ x: number; y: number; t: number; s?: number; shut?: number; time?: number }> = ({ x, y, t, s = 1, shut = 0, time = 0 }) => {
  const fl = Math.sin(t * 2.4) * 6;
  const cloth = timeColor(["#d94a4a", "#d9583a", "#5a3048", "#c86a5a"], time);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-170, 170].map((px) => (
        <rect key={px} x={px - 8} y={-380} width={16} height={380} fill="#7a5032" {...st} />
      ))}
      <path d={`M -200 -380 L 200 -380 L 214 -310 Q 0 ${-296 + fl} -214 -310 Z`} fill={cloth} {...st} />
      {[-150, -50, 50, 150].map((sx) => (
        <path key={sx} d={`M ${sx} -380 L ${sx + 6} -304`} stroke="#f6f0e0" strokeWidth={22} opacity={0.85} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${-200 + i * 50} -310 q ${fl * 0.4} 14 0 26`} fill="none" stroke="#f2c84a" strokeWidth={5} strokeLinecap="round" />
      ))}
      <rect x={-190} y={-140} width={380} height={30} rx={6} fill="#9a6a40" {...st} />
      <rect x={-180} y={-110} width={360} height={110} fill="#7a5032" {...st} />
      {[-110, 0, 110].map((bx, i) => (
        <g key={bx} transform={`translate(${bx} -140)`}>
          <path d="M -48 -40 Q -50 0 -36 2 L 36 2 Q 50 0 48 -40 Z" fill="#c9a060" {...st} />
          {Array.from({ length: 6 }, (_, j) => (
            <ellipse key={j} cx={-30 + j * 12} cy={-44 - (j % 2) * 8} rx={9} ry={13} fill={i === 1 ? "#5a2a14" : "#7a3a1e"} stroke={OUT} strokeWidth={2} />
          ))}
        </g>
      ))}
      {shut > 0.01 && <rect x={-200} y={-306} width={400} height={300 * shut} fill={cloth} {...st} opacity={0.97} />}
    </g>
  );
};

/** Donkey with saddle bags. walk 0..1, origin = ground under the body, faces right. */
export const Donkey: React.FC<{ x: number; y: number; t: number; s?: number; flip?: boolean; walk?: number; load?: boolean; bray?: number }> = ({ x, y, t, s = 1, flip, walk = 1, load = true, bray = 0 }) => {
  const ph = t * 7;
  const bob = Math.abs(Math.sin(ph)) * 6 * walk;
  const fur = "#9a948e";
  const shade = "#7e7872";
  const leg = (lx: number, a: number, fill: string, key: string) => (
    <g key={key} transform={`translate(${lx} -110) rotate(${a})`}>
      <rect x={-11} y={0} width={22} height={110} rx={10} fill={fill} {...st} />
      <rect x={-12} y={96} width={24} height={16} rx={4} fill="#3a3430" {...st} strokeWidth={3} />
    </g>
  );
  const ear = Math.sin(t * 0.8) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={130} ry={14} fill="#000" opacity={0.15} />
      {leg(-80, Math.sin(ph) * 20 * walk, shade, "a")}
      {leg(80, -Math.sin(ph) * 20 * walk, shade, "b")}
      <g transform={`translate(0 ${-bob})`}>
        <path d={`M -120 -150 Q -150 ${-130 + Math.sin(t * 3) * 10} -150 -90`} fill="none" stroke={OUT} strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={0} cy={-160} rx={130} ry={62} fill={fur} {...st} />
        <ellipse cx={0} cy={-128} rx={100} ry={26} fill="#d8d2ca" opacity={0.6} />
        {load && (
          <>
            <rect x={-70} y={-238} width={140} height={40} rx={10} fill="#a04a3a" {...st} />
            <path d="M -90 -200 Q -100 -120 -60 -110 L 60 -110 Q 100 -120 90 -200 Z" fill="#c9a060" {...st} />
            <path d="M -70 -170 L 70 -170" stroke="#9a7440" strokeWidth={4} />
          </>
        )}
        <g transform={`translate(110 -190) rotate(${-20 + Math.sin(ph) * 3 * walk})`}>
          <path d="M 0 30 L -10 -40 L 40 -50 L 50 20 Z" fill={fur} {...st} />
          <path d="M -6 -36 L 30 -48" stroke="#4a403a" strokeWidth={10} strokeLinecap="round" />
          <g transform={`translate(20 -60) rotate(${-30 + ear})`}>
            <ellipse cx={0} cy={-40} rx={12} ry={46} fill={fur} {...st} />
            <ellipse cx={0} cy={-40} rx={5} ry={32} fill="#e8b8b0" />
          </g>
          <g transform={`translate(40 -56) rotate(${10 - ear})`}>
            <ellipse cx={0} cy={-36} rx={11} ry={42} fill={shade} {...st} />
          </g>
          <g transform="translate(66 -10) rotate(20)">
            <rect x={-30} y={-26} width={74} height={56} rx={26} fill={fur} {...st} />
            <rect x={14} y={-18} width={34} height={46} rx={18} fill="#d8d2ca" {...st} strokeWidth={3} />
            <circle cx={36} cy={-2} r={4} fill={OUT} />
            {bray > 0.05 && <ellipse cx={36} cy={24} rx={10} ry={4 + bray * 8} fill="#5a2a2a" {...st} strokeWidth={2} />}
            <circle cx={-6} cy={-6} r={6} fill="#1c1410" />
            <circle cx={-8} cy={-8} r={2} fill="#fff" />
          </g>
        </g>
      </g>
      {leg(-60, -Math.sin(ph) * 20 * walk, fur, "c")}
      {leg(100, Math.sin(ph) * 20 * walk, fur, "d")}
    </g>
  );
};

/** Small sparrow sitting on a wall: head bobs, tail flicks; fly 0..1 = arriving/leaving (moves along dir). */
export const PerchedBird: React.FC<{ x: number; y: number; t: number; s?: number; fly?: number; dir?: 1 | -1; flip?: boolean }> = ({ x, y, t, s = 1, fly = 0, dir = 1, flip }) => {
  const k = Math.max(0, Math.min(1, fly));
  const fx = x + dir * k * 700;
  const fy = y - k * 520 - Math.sin(k * 3) * 40;
  const flap = k > 0.01 ? Math.sin(t * 40) * 50 : 0;
  const peck = k < 0.01 ? Math.max(0, Math.sin(t * 2.2)) ** 6 * 20 : 0;
  return (
    <g transform={`translate(${fx} ${fy}) scale(${flip ? -s : s} ${s})`}>
      <path d="M -26 -18 L -50 -28 L -46 -12 Z" fill="#6a4a32" {...st} strokeWidth={3} transform={`rotate(${Math.sin(t * 5) * 8} -26 -18)`} />
      <ellipse cx={0} cy={-20} rx={28} ry={20} fill="#a87a52" {...st} strokeWidth={3} />
      <ellipse cx={6} cy={-14} rx={16} ry={10} fill="#efe2cc" />
      <g transform={`translate(-4 -24) rotate(${-flap})`}>
        <path d="M 0 0 Q -20 -6 -34 6 Q -16 10 0 6 Z" fill="#7a5638" {...st} strokeWidth={3} />
      </g>
      <g transform={`translate(22 -36) rotate(${peck})`}>
        <circle cx={0} cy={0} r={14} fill="#8a6040" {...st} strokeWidth={3} />
        <path d="M 12 -2 L 24 2 L 12 6 Z" fill="#e8b84a" {...st} strokeWidth={2} />
        <circle cx={4} cy={-3} r={3} fill="#1c1410" />
      </g>
      {k < 0.01 && <path d="M -4 0 L -4 8 M 6 0 L 6 8" stroke={OUT} strokeWidth={3} />}
    </g>
  );
};

/** Dry leaf (falls/drifts when the film moves x, y, rot). */
export const DryLeaf: React.FC<{ x: number; y: number; rot?: number; s?: number; tone?: number }> = ({ x, y, rot = 0, s = 1, tone = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -24 0 Q -10 -16 18 -6 Q 30 0 18 6 Q -10 16 -24 0 Z" fill={["#c9903a", "#a8682a", "#d9a84a"][tone % 3]} {...st} strokeWidth={2.5} />
    <path d="M -24 0 L 22 0" stroke="#7a4a1e" strokeWidth={2} />
  </g>
);

/** Floating dust motes in a light beam (screen or world space). */
export const DustMotes: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number; o?: number }> = ({ t, x, y, w, h, n = 24, o = 0.5 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const px = x + ((((Math.sin(i * 12.9898) * 43758.5) % 1) + 1) % 1) * w + Math.sin(t * 0.6 + i) * 20;
      const py = y + ((((Math.sin(i * 78.233) * 12543.1) % 1) + 1) % 1 * h - t * 8 * (1 + (i % 3)) + h * 10) % h;
      return <circle key={i} cx={px} cy={py} r={2 + (i % 3)} fill="#fff1c8" opacity={o * (0.5 + 0.5 * Math.sin(t * 2 + i))} />;
    })}
  </g>
);
