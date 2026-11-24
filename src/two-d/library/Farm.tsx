// Green farm assets (library): lush field, crops that grow, wooden fence, cow, camel, wage pouch.
// Built for "gufa-ke-teen" (scene of the labourer's wage), reusable for any farm story. Ground at y = 0 per asset.

import React from "react";
import { blink, LINE, OUT } from "../kit";

const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Green field: grass ground with darker strips and flowers, from x0 to x1, top edge at y. */
export const GreenField: React.FC<{ y: number; x0?: number; x1?: number }> = ({ y, x0 = -1500, x1 = 4500 }) => (
  <g>
    <path d={`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y - 40} ${x1} ${y} L ${x1} ${y + 1800} L ${x0} ${y + 1800} Z`} fill="#8fbf5a" />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d={`M ${x0} ${y + 120 + i * 140} Q ${(x0 + x1) / 2} ${y + 90 + i * 140} ${x1} ${y + 120 + i * 140}`} fill="none" stroke="#7fae4c" strokeWidth={36} opacity={0.6} />
    ))}
    {/* dirt path */}
    <path d={`M ${x0} ${y + 260} Q ${x0 + 1400} ${y + 180} ${(x0 + x1) / 2} ${y + 300} Q ${x1 - 1200} ${y + 420} ${x1} ${y + 330} L ${x1} ${y + 420} Q ${x1 - 1200} ${y + 520} ${(x0 + x1) / 2} ${y + 400} Q ${x0 + 1400} ${y + 280} ${x0} ${y + 360} Z`} fill="#c9a272" stroke={OUT} strokeWidth={3} />
    {Array.from({ length: 30 }, (_, i) => (
      <g key={i} transform={`translate(${x0 + 120 + i * 200} ${y + 40 + ((i * 97) % 600)})`}>
        <path d="M -10 0 q 2 -18 6 -22 q 0 14 4 18 q 4 -16 10 -20 q -2 14 0 24 Z" fill="#6f9a3e" stroke={OUT} strokeWidth={2} strokeLinejoin="round" />
        {i % 3 === 0 && <circle cx={4} cy={-26} r={6} fill={i % 2 ? "#ffd34d" : "#ffffff"} stroke={OUT} strokeWidth={1.5} />}
      </g>
    ))}
  </g>
);

/** Rows of wheat/crops from x0 to x1 on line y; `grow` 0..1 = sprouts .. tall golden ears; `t` sways them. */
export const CropRows: React.FC<{ x0: number; x1: number; y: number; grow: number; t: number; rows?: number }> = ({ x0, x1, y, grow, t, rows = 3 }) => {
  const h = 20 + grow * 150;
  const col = grow < 0.6 ? "#7fb24a" : grow < 0.85 ? "#b8c24a" : "#e0b84a";
  return (
    <g>
      {Array.from({ length: rows }, (_, r) => (
        <g key={r} transform={`translate(0 ${r * 50})`}>
          <path d={`M ${x0} ${y + 6} L ${x1} ${y + 6}`} stroke="#8a6a44" strokeWidth={16} strokeLinecap="round" />
          {Array.from({ length: Math.floor((x1 - x0) / 34) }, (_, i) => {
            const x = x0 + 17 + i * 34 + (r % 2) * 17;
            const sw = Math.sin(t * 2 + i * 0.4 + r) * 6 * grow;
            return (
              <g key={i}>
                <path d={`M ${x} ${y} Q ${x + sw * 0.5} ${y - h * 0.5} ${x + sw} ${y - h}`} fill="none" stroke={OUT} strokeWidth={7} strokeLinecap="round" />
                <path d={`M ${x} ${y} Q ${x + sw * 0.5} ${y - h * 0.5} ${x + sw} ${y - h}`} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" />
                {grow > 0.5 && <ellipse cx={x + sw} cy={y - h - 10} rx={7} ry={18 * grow} fill={col} stroke={OUT} strokeWidth={2} transform={`rotate(${sw} ${x + sw} ${y - h})`} />}
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};

/** Wooden rail fence (baad) from x0 to x1, posts every ~140 px. */
export const Fence: React.FC<{ x0: number; x1: number; y: number; h?: number }> = ({ x0, x1, y, h = 150 }) => {
  const n = Math.max(2, Math.round((x1 - x0) / 140));
  return (
    <g>
      {[0.3, 0.7].map((k) => (
        <path key={k} d={`M ${x0} ${y - h * k} L ${x1} ${y - h * k + 6}`} stroke={OUT} strokeWidth={18} strokeLinecap="round" />
      ))}
      {[0.3, 0.7].map((k) => (
        <path key={`r${k}`} d={`M ${x0} ${y - h * k} L ${x1} ${y - h * k + 6}`} stroke="#a0703f" strokeWidth={11} strokeLinecap="round" />
      ))}
      {Array.from({ length: n + 1 }, (_, i) => {
        const x = x0 + ((x1 - x0) * i) / n;
        return (
          <g key={i}>
            <path d={`M ${x - 12} ${y + 6} L ${x - 10} ${y - h - 6} L ${x} ${y - h - 20} L ${x + 10} ${y - h - 6} L ${x + 12} ${y + 6} Z`} fill="#8a5a36" {...stroke} strokeWidth={3} />
            <path d={`M ${x - 4} ${y - h * 0.5} l 2 30`} stroke="#6a4226" strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

const Leg: React.FC<{ x: number; top: number; len: number; w: number; fill: string; swing: number; hoof?: string }> = ({ x, top, len, w, fill, swing, hoof = "#3a2e26" }) => (
  <g transform={`rotate(${swing} ${x} ${top})`}>
    <path d={`M ${x} ${top} L ${x + 2} ${top + len * 0.55} L ${x} ${top + len - 8}`} fill="none" stroke={OUT} strokeWidth={w + 6} strokeLinecap="round" />
    <path d={`M ${x} ${top} L ${x + 2} ${top + len * 0.55} L ${x} ${top + len - 8}`} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" />
    <path d={`M ${x - w / 2 - 2} ${top + len} L ${x - w / 2} ${top + len - 12} L ${x + w / 2} ${top + len - 12} L ${x + w / 2 + 2} ${top + len} Z`} fill={hoof} stroke={OUT} strokeWidth={2} strokeLinejoin="round" />
  </g>
);

/** Village cow (gaay): patches, horns, ears, dewlap, tail swish, chewing, blink. Faces right; `graze` lowers the head. */
export const Cow: React.FC<{ x: number; y: number; t: number; s?: number; flip?: boolean; graze?: number; walk?: number; coat?: "white" | "brown" }> = ({
  x,
  y,
  t,
  s = 1,
  flip,
  graze = 0,
  walk = 0,
  coat = "white",
}) => {
  const base = coat === "white" ? "#f3efe6" : "#a8683c";
  const shade = coat === "white" ? "#d9d2c4" : "#8a5230";
  const patch = coat === "white" ? "#6a4a36" : "#f3e6d0";
  const eye = blink(Math.round(t * 30), Math.round(x) % 40);
  const sw = (ph: number) => Math.sin(t * 6 + ph) * 14 * walk;
  const tail = Math.sin(t * 2.2) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={150} ry={16} fill="#3a2a10" opacity={0.22} />
      <Leg x={-90} top={-110} len={110} w={20} fill={shade} swing={sw(Math.PI)} />
      <Leg x={80} top={-110} len={110} w={20} fill={shade} swing={sw(0)} />
      {/* tail */}
      <g transform={`rotate(${tail} -128 -170)`}>
        <path d="M -128 -170 Q -150 -120 -146 -70" fill="none" stroke={OUT} strokeWidth={9} strokeLinecap="round" />
        <path d="M -128 -170 Q -150 -120 -146 -70" fill="none" stroke={base} strokeWidth={5} strokeLinecap="round" />
        <path d="M -154 -76 Q -146 -50 -138 -76 Q -146 -84 -154 -76 Z" fill="#3a2a20" stroke={OUT} strokeWidth={2} />
      </g>
      {/* body */}
      <path d="M -130 -170 Q -140 -210 -90 -214 Q 0 -206 90 -216 Q 136 -214 140 -170 Q 146 -110 110 -96 Q 0 -84 -100 -96 Q -136 -110 -130 -170 Z" fill={base} {...stroke} />
      <path d="M -60 -206 Q -10 -214 10 -180 Q 0 -140 -50 -140 Q -86 -160 -60 -206 Z" fill={patch} />
      <path d="M 70 -210 Q 110 -206 110 -170 Q 90 -150 60 -170 Z" fill={patch} />
      <path d="M -100 -100 Q 0 -86 110 -100 Q 60 -112 0 -110 Q -60 -112 -100 -100 Z" fill={shade} />
      {/* udder */}
      <path d="M -30 -94 Q -20 -70 0 -72 Q 20 -70 26 -94 Z" fill="#f0b8b0" stroke={OUT} strokeWidth={2.5} />
      {/* hump */}
      <path d="M 70 -214 Q 90 -246 120 -224 Q 122 -214 112 -212 Z" fill={base} {...stroke} strokeWidth={3} />
      <Leg x={-110} top={-110} len={110} w={20} fill={base} swing={sw(0)} />
      <Leg x={100} top={-110} len={110} w={20} fill={base} swing={sw(Math.PI)} />
      {/* neck + head */}
      <g transform={`rotate(${graze * 55 + Math.sin(t * 0.7) * 3} 120 -180)`}>
        <path d="M 100 -206 Q 150 -214 176 -190 L 186 -130 Q 160 -110 120 -120 Z" fill={base} {...stroke} />
        {/* dewlap */}
        <path d="M 130 -120 Q 150 -84 176 -120" fill={shade} stroke={OUT} strokeWidth={3} />
        <g transform="translate(196 -170)">
          <path d="M -10 -14 L -30 -46 Q -20 -50 -6 -26 Z M 22 -16 L 34 -50 Q 42 -46 30 -16 Z" fill="#d8ccb0" stroke={OUT} strokeWidth={3} />
          <path d="M -28 -6 Q -56 -14 -60 4 Q -40 10 -24 6 Z" fill={shade} stroke={OUT} strokeWidth={3} />
          <path d="M -24 -20 Q 0 -34 28 -20 Q 40 20 30 50 Q 0 62 -16 48 Q -30 20 -24 -20 Z" fill={base} {...stroke} />
          <path d="M -4 -28 L 4 -6 L 12 -28 Z" fill={patch} opacity={0.8} />
          <ellipse cx={8} cy={48} rx={26} ry={16} fill="#e8b0a0" stroke={OUT} strokeWidth={3} />
          <ellipse cx={0} cy={48} rx={3} ry={4} fill={OUT} />
          <ellipse cx={16} cy={48} rx={3} ry={4} fill={OUT} />
          <path d={`M -2 ${62 + Math.sin(t * 5) * 2} q 10 4 20 0`} fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
          <ellipse cx={20} cy={0} rx={6} ry={7 * eye} fill="#2a1a12" />
          <path d="M 12 -10 q 8 -4 16 0" fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

/** Camel (oont): long legs, hump with saddle cloth, curved neck, sleepy lids, tail flick. Faces right. */
export const Camel: React.FC<{ x: number; y: number; t: number; s?: number; flip?: boolean; walk?: number; saddle?: boolean }> = ({ x, y, t, s = 1, flip, walk = 0, saddle = true }) => {
  const base = "#d4a668";
  const shade = "#b8884c";
  const sw = (ph: number) => Math.sin(t * 5 + ph) * 16 * walk;
  const bob = walk * Math.sin(t * 10) * 4;
  const eye = blink(Math.round(t * 30), Math.round(x) % 50);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={170} ry={18} fill="#3a2a10" opacity={0.22} />
      <Leg x={-90} top={-230} len={230} w={18} fill={shade} swing={sw(Math.PI)} hoof="#8a6a44" />
      <Leg x={90} top={-230} len={230} w={18} fill={shade} swing={sw(0)} hoof="#8a6a44" />
      <g transform={`translate(0 ${bob})`}>
        <path d="M -150 -300 Q -170 -240 -130 -220" fill="none" stroke={OUT} strokeWidth={8} strokeLinecap="round" transform={`rotate(${Math.sin(t * 2) * 10} -150 -300)`} />
        {/* body + hump */}
        <path d="M -150 -300 Q -150 -340 -100 -350 Q -60 -460 20 -440 Q 80 -420 100 -350 Q 150 -346 160 -300 Q 160 -230 120 -220 Q 0 -206 -120 -222 Q -156 -240 -150 -300 Z" fill={base} {...stroke} />
        <path d="M -120 -226 Q 0 -212 120 -226 Q 80 -240 0 -238 Q -80 -240 -120 -226 Z" fill={shade} />
        <path d="M -60 -430 Q -20 -460 40 -436" fill="none" stroke="#e8c28a" strokeWidth={10} strokeLinecap="round" />
        {saddle && (
          <>
            <path d="M -110 -350 Q -40 -330 60 -360 L 80 -270 Q -20 -250 -110 -270 Z" fill="#b5363a" {...stroke} />
            <path d="M -104 -290 Q -20 -270 74 -292" fill="none" stroke="#f2c94c" strokeWidth={8} />
            {[-90, -50, -10, 30, 66].map((tx) => (
              <path key={tx} d={`M ${tx} -270 l 0 22`} stroke="#f2c94c" strokeWidth={5} strokeLinecap="round" />
            ))}
          </>
        )}
        {/* neck + head */}
        <path d="M 120 -330 Q 210 -320 220 -420 Q 226 -470 260 -480 L 300 -470 Q 280 -440 260 -380 Q 240 -270 150 -250 Z" fill={base} {...stroke} />
        <g transform={`translate(280 -480) rotate(${Math.sin(t * 0.9) * 4})`}>
          <path d="M -30 -10 Q -20 -40 20 -36 Q 70 -30 80 0 Q 84 24 60 26 Q 20 26 -10 16 Q -34 8 -30 -10 Z" fill={base} {...stroke} />
          <path d="M -14 -34 L -20 -54 L -2 -40 Z" fill={shade} stroke={OUT} strokeWidth={2.5} />
          <ellipse cx={18} cy={-14} rx={8} ry={7 * eye} fill="#2a1a12" />
          <path d="M 8 -20 Q 18 -26 30 -20" fill="none" stroke={OUT} strokeWidth={3} strokeLinecap="round" />
          <path d="M 64 -4 q 8 2 10 8" fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M 50 ${20 + Math.sin(t * 4) * 2} Q 66 ${24} 78 ${18}`} fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      </g>
      <Leg x={-120} top={-230} len={230} w={18} fill={base} swing={sw(0)} hoof="#8a6a44" />
      <Leg x={120} top={-230} len={230} w={18} fill={base} swing={sw(Math.PI)} hoof="#8a6a44" />
    </g>
  );
};

/** Small cloth pouch of wages tied with a string; coins peek out when `open`. */
export const WagePouch: React.FC<{ x: number; y: number; s?: number; open?: number; t?: number }> = ({ x, y, s = 1, open = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 0 Q -70 -50 -30 -80 L -24 -96 L 24 -96 L 30 -80 Q 70 -50 50 0 Z" fill="#c9a26e" {...stroke} />
    <path d="M -30 -40 Q 0 -30 30 -40" fill="none" stroke="#a8824e" strokeWidth={4} />
    <path d="M -28 -84 Q 0 -74 28 -84" fill="none" stroke="#7a2a35" strokeWidth={7} strokeLinecap="round" />
    <path d="M 22 -82 q 14 6 10 22 M 22 -82 q 22 -2 24 14" fill="none" stroke="#7a2a35" strokeWidth={5} strokeLinecap="round" />
    {open > 0 &&
      [-16, 4, 22].map((cx, i) => (
        <g key={i} transform={`translate(${cx} ${-100 - open * (10 + i * 6)})`}>
          <ellipse cx={0} cy={0} rx={14} ry={6} fill="#d9a520" stroke={OUT} strokeWidth={2} />
          <ellipse cx={0} cy={-2} rx={10} ry={3.5} fill="#ffd34d" opacity={0.6 + Math.sin(t * 6 + i) * 0.4} />
        </g>
      ))}
  </g>
);
