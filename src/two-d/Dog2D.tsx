// 2D cut-out dog puppet. Origin = ground under the body, facing right.

import React from "react";
import { LINE, OUT } from "./kit";

export type DogPose = {
  lie: number; // 0 standing .. 1 lying down
  headDown: number; // 0 level .. 1 muzzle to the ground
  headUp: number; // 0..1 lifts head (hope / looking up)
  tongue: number; // 0..1
  pant: number; // 0..1 panting speed / chest heaving
  wag: number; // 0..1 tail wag amount
  eyeOpen: number;
  happy: number; // 0 sad brows .. 1 happy brows
  ears: number; // 0 droopy .. 1 perked
  lap: number; // 0..1 drinking (lapping) motion
  time: number;
};

const C = { fur: "#c98d55", furShade: "#a56c3c", belly: "#ecc996", dark: "#6e4528", nose: "#2b1a10", tongue: "#e86f80" };
const stroke = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Dog2D: React.FC<{ x: number; y: number; flip?: boolean; scale?: number; pose: DogPose }> = ({ x, y, flip, scale = 1, pose: p }) => {
  const t = p.time;
  const breath = Math.sin(t * (4 + p.pant * 14)) * (1 + p.pant * 2.5);
  const bodyY = -96 + p.lie * 58;
  const legLen = 64 * (1 - p.lie * 0.75);
  const wag = Math.sin(t * 16) * 28 * p.wag;
  const tailBase = -10 + p.wag * 40 - p.lie * 25; // raised when happy, tucked when sad
  const headRot = p.headDown * 62 - p.headUp * 22 + Math.max(0, Math.sin(t * 15)) * 6 * p.lap;
  const tongueLen = p.tongue * (16 + Math.max(0, Math.sin(t * 15)) * 8 * p.lap);
  const earRot = 20 - p.ears * 35;

  const leg = (lx: number, back: boolean, phase: number) => {
    const fill = back ? C.furShade : C.fur;
    if (p.lie > 0.5) {
      // folded legs: paws forward along the ground
      return <rect x={lx - 6} y={-22} width={52} height={18} rx={9} fill={fill} {...stroke} />;
    }
    const swing = Math.sin(phase) * 0;
    return (
      <g transform={`translate(${lx} ${bodyY + 18}) rotate(${swing})`}>
        <rect x={-9} y={0} width={18} height={legLen} rx={8} fill={fill} {...stroke} />
        <ellipse cx={5} cy={legLen} rx={14} ry={7} fill={fill} {...stroke} />
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx={0} cy={2} rx={95} ry={12} fill="#7a4a24" opacity={0.25} />
      {leg(-52, true, 0)}
      {leg(46, true, 1)}
      {/* tail */}
      <g transform={`translate(-70 ${bodyY - 10}) rotate(${-tailBase + wag})`}>
        <path d="M 0 0 Q -30 -6 -46 -34 Q -40 -36 -36 -30 Q -24 -14 4 -10 Z" fill={C.fur} {...stroke} />
      </g>
      {/* body with chest heaving */}
      <ellipse cx={0} cy={bodyY} rx={78} ry={34 + breath * 0.6} fill={C.fur} {...stroke} />
      <path d={`M -30 ${bodyY + 22} Q 10 ${bodyY + 40} 50 ${bodyY + 16} Q 40 ${bodyY + 30} 10 ${bodyY + 32} Z`} fill={C.belly} />
      {/* thin ribs show how thirsty and weak he is */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${-4 + i * 14} ${bodyY - 6} Q ${2 + i * 14} ${bodyY + 8} ${-2 + i * 14} ${bodyY + 20}`} fill="none" stroke={C.furShade} strokeWidth={3} strokeLinecap="round" opacity={1 - p.happy * 0.7} />
      ))}
      {leg(-34, false, 2)}
      {leg(62, false, 3)}
      {/* head */}
      <g transform={`translate(62 ${bodyY - 22}) rotate(${headRot})`}>
        <path d="M -18 10 Q -8 -30 18 -34 L 30 -10 Q 14 10 -4 26 Z" fill={C.fur} {...stroke} />
        <g transform="translate(26 -38)">
          <ellipse cx={0} cy={0} rx={32} ry={28} fill={C.fur} {...stroke} />
          <ellipse cx={32} cy={10} rx={26} ry={15} fill={C.belly} {...stroke} />
          <ellipse cx={56} cy={6} rx={8} ry={6.5} fill={C.nose} {...stroke} strokeWidth={2.5} />
          <circle cx={58} cy={4} r={2} fill="#fff" opacity={0.7} />
          {/* mouth + tongue */}
          <path d="M 40 18 Q 30 24 22 18" fill="none" {...stroke} strokeWidth={3} />
          {tongueLen > 1 && (
            <path d={`M 26 20 Q 24 ${20 + tongueLen} 32 ${22 + tongueLen} Q 40 ${20 + tongueLen} 38 20 Z`} fill={C.tongue} {...stroke} strokeWidth={2.5} />
          )}
          {/* eye */}
          <ellipse cx={14} cy={-6} rx={8} ry={9 * Math.max(0.1, p.eyeOpen)} fill="#fff" stroke={OUT} strokeWidth={2.5} />
          {p.eyeOpen > 0.25 && <circle cx={17} cy={-5} r={5} fill="#2a1a12" />}
          {p.eyeOpen > 0.25 && <circle cx={18.5} cy={-7} r={1.6} fill="#fff" />}
          {/* brow: worried when thirsty, soft when happy */}
          <path d={`M 4 ${-18 + p.happy * 2} Q 14 ${-24 + (1 - p.happy) * 4} 24 ${-20 - (1 - p.happy) * 4}`} fill="none" stroke={C.dark} strokeWidth={4} strokeLinecap="round" />
          {/* floppy ear */}
          <g transform={`translate(-14 -18) rotate(${earRot})`}>
            <path d="M 0 0 Q -24 4 -22 40 Q -10 46 2 30 Q 8 12 0 0 Z" fill={C.dark} {...stroke} />
          </g>
        </g>
      </g>
    </g>
  );
};
