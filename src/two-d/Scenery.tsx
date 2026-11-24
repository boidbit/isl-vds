// Painted 2D desert scenery, split into parallax layers.
import React from "react";
import { LINE, OUT } from "./kit";

export const GROUND_Y = 820;
const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Sky: React.FC<{ warm: number }> = ({ warm }) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={warm > 0.5 ? "#f2a36a" : "#8fd0f2"} />
        <stop offset="0.65" stopColor={warm > 0.5 ? "#fcd79a" : "#d7efff"} />
        <stop offset="1" stopColor={warm > 0.5 ? "#ffe9c2" : "#fff1d2"} />
      </linearGradient>
      <radialGradient id="sunGlow">
        <stop offset="0" stopColor="#fff6d0" stopOpacity="0.95" />
        <stop offset="0.35" stopColor="#ffe9a8" stopOpacity="0.45" />
        <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x={-2000} y={-2000} width={8000} height={6000} fill="url(#sky)" />
  </g>
);

export const Sun: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r={260} fill="url(#sunGlow)" />
    <circle cx={x} cy={y} r={62} fill="#fff4c4" stroke="#ffd77a" strokeWidth={6} />
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.95}>
    <path d="M -110 20 Q -120 -20 -70 -22 Q -60 -66 -6 -56 Q 30 -86 70 -46 Q 120 -50 116 0 Q 130 24 96 28 L -96 28 Q -124 28 -110 20 Z" fill="#fffdf6" stroke="#f0dcc0" strokeWidth={5} />
  </g>
);

export const Clouds: React.FC = () => (
  <g>
    <Cloud x={300} y={170} s={1} />
    <Cloud x={1300} y={120} s={0.8} />
    <Cloud x={2300} y={200} s={1.15} />
    <Cloud x={3300} y={140} s={0.9} />
  </g>
);

export const FarMountains: React.FC = () => (
  <g>
    {/* rounded desert hills and flat-topped mesas (not pyramids), extended downward so no gap shows when zooming */}
    {[
      { x: -200, w: 1000, h: 260, c: "#e7ad7c", s: "#d4925f", mesa: false },
      { x: 650, w: 900, h: 330, c: "#eab584", s: "#d69a66", mesa: true },
      { x: 1500, w: 1100, h: 240, c: "#e3a874", s: "#cf8d59", mesa: false },
      { x: 2450, w: 1000, h: 360, c: "#ebb789", s: "#d79b68", mesa: true },
      { x: 3350, w: 1100, h: 280, c: "#e5aa78", s: "#d1905c", mesa: false },
    ].map((m, i) => {
      const top = 760 - m.h;
      const d = m.mesa
        ? `M ${m.x} 1300 L ${m.x} 760 Q ${m.x + m.w * 0.12} ${top + 40} ${m.x + m.w * 0.25} ${top + 6} L ${m.x + m.w * 0.7} ${top} Q ${m.x + m.w * 0.85} ${top + 30} ${m.x + m.w} 760 L ${m.x + m.w} 1300 Z`
        : `M ${m.x} 1300 L ${m.x} 760 Q ${m.x + m.w * 0.25} ${top + m.h * 0.15} ${m.x + m.w * 0.5} ${top} Q ${m.x + m.w * 0.75} ${top + m.h * 0.15} ${m.x + m.w} 760 L ${m.x + m.w} 1300 Z`;
      const shade = m.mesa
        ? `M ${m.x + m.w * 0.7} ${top} Q ${m.x + m.w * 0.85} ${top + 30} ${m.x + m.w} 760 L ${m.x + m.w * 0.78} 760 Q ${m.x + m.w * 0.76} ${top + 60} ${m.x + m.w * 0.7} ${top} Z`
        : `M ${m.x + m.w * 0.5} ${top} Q ${m.x + m.w * 0.75} ${top + m.h * 0.15} ${m.x + m.w} 760 L ${m.x + m.w * 0.72} 760 Q ${m.x + m.w * 0.64} ${top + m.h * 0.4} ${m.x + m.w * 0.5} ${top} Z`;
      return (
        <g key={i}>
          <path d={d} fill={m.c} />
          <path d={shade} fill={m.s} />
          {m.mesa && <path d={`M ${m.x + m.w * 0.27} ${top + 30} L ${m.x + m.w * 0.68} ${top + 26}`} stroke={m.s} strokeWidth={6} strokeLinecap="round" />}
        </g>
      );
    })}
  </g>
);

export const MidDunes: React.FC = () => (
  <g>
    <path d="M -600 790 Q 200 640 900 720 Q 1500 790 2100 690 Q 2800 600 3500 720 Q 4100 800 4800 700 L 4800 1300 L -600 1300 Z" fill="#f0c07f" />
    <path d="M -600 790 Q 200 640 900 720 Q 1200 755 1500 760 Q 1100 740 900 735 Q 300 690 -600 805 Z" fill="#f8d49a" />
    <path d="M 2100 690 Q 2800 600 3500 720 Q 3000 650 2500 680 Z" fill="#f8d49a" />
  </g>
);

export const Palm: React.FC<{ x: number; y: number; s: number; lean?: number; sway: number }> = ({ x, y, s, lean = 1, sway }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -14 0 Q ${-10 + 30 * lean} -200 ${30 * lean} -380 L ${50 * lean} -378 Q ${10 + 30 * lean} -200 14 0 Z`} fill="#9a6b45" {...stroke} />
    {[60, 120, 180, 240, 300].map((yy) => (
      <path key={yy} d={`M ${-12 + (yy / 380) * 34 * lean} ${-yy} L ${14 + (yy / 380) * 34 * lean} ${-yy - 6}`} stroke="#6f4a2e" strokeWidth={4} />
    ))}
    <g transform={`translate(${40 * lean} -380) rotate(${sway})`}>
      {[-150, -110, -70, -30, 10, 200, 160].map((a, i) => (
        <g key={i} transform={`rotate(${a})`}>
          <path d="M 0 0 Q 70 -40 150 10 Q 90 0 0 14 Z" fill={i % 2 ? "#5f9a3c" : "#78b04a"} {...stroke} />
        </g>
      ))}
      <circle cx={0} cy={6} r={14} fill="#b5642c" {...stroke} />
    </g>
  </g>
);

export const Ground: React.FC = () => (
  <g>
    <rect x={-600} y={GROUND_Y - 40} width={5400} height={800} fill="#f2c785" />
    <path d={`M -600 ${GROUND_Y - 40} Q 1200 ${GROUND_Y - 70} 2400 ${GROUND_Y - 45} Q 3600 ${GROUND_Y - 20} 4800 ${GROUND_Y - 50} L 4800 ${GROUND_Y - 30} L -600 ${GROUND_Y - 30} Z`} fill="#f7d39c" />
    {/* wind ripples */}
    {Array.from({ length: 34 }, (_, i) => {
      const x = -400 + i * 150 + (i % 3) * 40;
      const y = GROUND_Y + 30 + (i % 5) * 38;
      return <path key={i} d={`M ${x} ${y} Q ${x + 40} ${y - 10} ${x + 90} ${y}`} fill="none" stroke="#e0ad6c" strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);

export const Rock: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 Q -64 -40 -30 -54 Q 10 -70 42 -46 Q 66 -26 60 0 Z" fill="#c98a5c" {...stroke} />
    <path d="M 10 -60 Q 44 -48 56 -18 Q 40 -30 16 -36 Z" fill="#dca070" />
  </g>
);

export const Grass: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) skewX(${Math.sin(t * 1.5 + x) * 4})`}>
    {[-24, -12, 0, 12, 24].map((a, i) => (
      <path key={i} d={`M ${a * 0.4} 0 Q ${a} -30 ${a * 1.8} ${-50 - (i % 2) * 18}`} fill="none" stroke={i % 2 ? "#8aa24a" : "#a6b85a"} strokeWidth={6} strokeLinecap="round" />
    ))}
  </g>
);

export const Well: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={190} ry={22} fill="#7a4a24" opacity={0.25} />
    <path d="M -150 -170 L -150 -10 Q 0 30 150 -10 L 150 -170 Z" fill="#c9a07a" {...stroke} />
    {/* stones */}
    {[0, 1, 2, 3].map((row) =>
      Array.from({ length: 5 }, (_, i) => {
        const w = 60;
        const xx = -150 + i * w + (row % 2) * 30 - (row % 2 ? 30 : 0);
        const yy = -165 + row * 40;
        return <rect key={`${row}-${i}`} x={Math.max(-148, xx + 3)} y={yy} width={Math.min(w - 6, 148 - Math.max(-148, xx + 3))} height={34} rx={10} fill={(row + i) % 2 ? "#d8b18a" : "#cfa67e"} stroke="#9c7552" strokeWidth={3} />;
      }),
    )}
    <ellipse cx={0} cy={-170} rx={150} ry={34} fill="#b88c66" {...stroke} />
    <ellipse cx={0} cy={-170} rx={118} ry={22} fill="#3b2516" {...stroke} />
    {/* wooden frame */}
    <rect x={-138} y={-330} width={18} height={170} rx={4} fill="#8a5a36" {...stroke} />
    <rect x={120} y={-330} width={18} height={170} rx={4} fill="#8a5a36" {...stroke} />
    <rect x={-150} y={-342} width={300} height={20} rx={6} fill="#9c6a42" {...stroke} />
  </g>
);
