// Front-facing chest-up close-up of a Musafir look (same LOOKS as the side puppet): the face looks into the
// camera. Blinks, breathes, lip-flaps from `talk`, pupils move (`lookX/lookY`), eyes widen (`wide`) for shock,
// head tilt + small 3/4 turn, shoulder cloth flutters, cloud shade / leaf dapple light on the face.
// Local coordinates: (0, 0) = bottom centre of the chest, head centre at (0, -430). About 760 px tall at s = 1.

import React from "react";
import { LINE, OUT } from "./kit";
import { LOOKS, type Look, type Mouth } from "./Musafir";

const st = { stroke: OUT, strokeWidth: LINE + 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type BustPose = {
  eyeOpen: number; // 0..1 (blink)
  wide: number; // 0..1 eyes widen + brows up (shock, wonder)
  brow: number; // -1 worried .. +1 raised
  mouth: Mouth;
  talk: number; // 0..1 lip-flap
  lookX: number; // -1..1 pupils left/right (+ = viewer's right)
  lookY: number; // -1 up .. 1 down
  tilt: number; // degrees head roll
  nod: number; // -1 chin up (looking up) .. 1 chin down
  turn: number; // -1..1 small head turn (features shift)
  smile: number; // 0..1 soft calm smile
};

export const BUST_POSE: BustPose = { eyeOpen: 1, wide: 0, brow: 0, mouth: "neutral", talk: 0, lookX: 0, lookY: 0, tilt: 0, nod: 0, turn: 0, smile: 0 };

const BASE = LOOKS.musafir;

export const FrontBust: React.FC<{ x: number; y: number; s?: number; t: number; look?: Partial<Look>; pose?: Partial<BustPose>; shade?: number; dapple?: number; wind?: number }> = ({
  x,
  y,
  s = 1,
  t,
  look,
  pose,
  shade = 0,
  dapple = 0,
  wind = 1,
}) => {
  const C = { skin: "#e2a774", skinShade: "#c98c5c", robe: "#f4ead6", robeShade: "#dccbaa", sash: "#b5643c", turban: "#fff", turbanShade: "#e2ddd2", beard: "#4a3426", headwear: "turban", beardLength: 1, ...BASE, ...look } as Look;
  const p = { ...BUST_POSE, ...pose };
  const breath = 1 + Math.sin(t * 2.1) * 0.012;
  const fx = p.turn * 22; // feature shift for the turn
  const fy = p.nod * 14;
  const eyeY = -440 + fy;
  const open = Math.max(0.06, p.eyeOpen) * (1 + p.wide * 0.35);
  const browUp = p.wide * 16 + Math.max(0, p.brow) * 8;
  const worried = Math.max(0, -p.brow);
  const flutter = Math.sin(t * 5.5) * 10 * wind + Math.sin(t * 9.1) * 4 * wind;

  const eye = (cx: number) => {
    const ry = 22 * open;
    const px = cx + p.lookX * 9;
    const py = eyeY + p.lookY * 8;
    const pr = Math.min(12 - p.wide * 2.5, ry * 0.7);
    return (
      <g>
        <ellipse cx={cx} cy={eyeY} rx={21 + p.wide * 3} ry={ry} fill="#fff" {...st} strokeWidth={3.5} />
        {open > 0.25 && <circle cx={px} cy={py} r={pr} fill="#2a1a12" />}
        {open > 0.25 && <circle cx={px + 3} cy={py - 4} r={3.5} fill="#fff" />}
        {p.eyeOpen < 0.6 && <path d={`M ${cx - 23} ${eyeY - ry + 2} Q ${cx} ${eyeY - ry - 6} ${cx + 23} ${eyeY - ry + 2}`} fill="none" stroke={OUT} strokeWidth={4} />}
      </g>
    );
  };
  const brow = (cx: number, side: -1 | 1) => {
    const by = eyeY - 44 - browUp;
    const inner = cx - side * 22;
    const outer = cx + side * 22;
    const innerY = by - worried * 10 + (p.brow > 0 ? -p.brow * 4 : 0);
    return <path d={`M ${inner} ${innerY} Q ${cx} ${by - 8} ${outer} ${by + 2}`} fill="none" stroke={C.beard} strokeWidth={9} strokeLinecap="round" />;
  };
  const mouth = () => {
    const mx = fx * 0.8;
    const my = -352 + fy;
    if (p.talk > 0.06) {
      const o = 4 + p.talk * 18;
      return (
        <g>
          <ellipse cx={mx} cy={my + 2} rx={16} ry={o} fill="#6e1f1f" {...st} strokeWidth={3.5} />
          {o > 10 && <ellipse cx={mx} cy={my + o * 0.55} rx={8} ry={4} fill="#e07a7a" />}
        </g>
      );
    }
    if (p.mouth === "open") return <ellipse cx={mx} cy={my + 2} rx={13 + p.wide * 3} ry={15 + p.wide * 6} fill="#6e1f1f" {...st} strokeWidth={3.5} />;
    if (p.mouth === "smile" || p.smile > 0.3) {
      const k = Math.max(p.smile, p.mouth === "smile" ? 1 : 0);
      return <path d={`M ${mx - 24} ${my - 4} Q ${mx} ${my + 8 + k * 10} ${mx + 24} ${my - 4}`} fill="none" {...st} strokeWidth={4.5} />;
    }
    if (p.mouth === "sad") return <path d={`M ${mx - 20} ${my + 6} Q ${mx} ${my - 8} ${mx + 20} ${my + 6}`} fill="none" {...st} strokeWidth={4.5} />;
    return <path d={`M ${mx - 16} ${my} Q ${mx} ${my + 4} ${mx + 16} ${my}`} fill="none" {...st} strokeWidth={4.5} />;
  };

  const clip = `bust-${React.useId().replace(/:/g, "")}`;

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={clip}>
          <ellipse cx={fx * 0.3} cy={-430} rx={118} ry={138} />
        </clipPath>
      </defs>
      {/* torso */}
      <g transform={`scale(${breath} ${breath})`}>
        {C.headwear === "scarf" && <path d="M -170 -250 Q -190 -470 0 -560 Q 190 -470 170 -250 Q 200 -120 230 0 L -230 0 Q -200 -120 -170 -250 Z" fill={C.turbanShade} {...st} />}
        <path d="M -300 0 Q -300 -170 -220 -215 Q -150 -250 -70 -262 L 70 -262 Q 150 -250 220 -215 Q 300 -170 300 0 Z" fill={C.robe} {...st} />
        <path d="M -300 0 Q -300 -170 -220 -215 Q -250 -120 -240 0 Z" fill={C.robeShade} />
        <path d="M 300 0 Q 300 -170 220 -215 Q 250 -120 240 0 Z" fill={C.robeShade} />
        {/* collar + placket */}
        <path d="M -62 -260 Q 0 -200 62 -260" fill="none" {...st} />
        <path d="M 0 -214 L 0 -90" stroke={C.robeShade} strokeWidth={10} strokeLinecap="round" />
        {[-180, -140, -100].map((by) => (
          <circle key={by} cx={0} cy={by} r={6} fill={C.sash} stroke={OUT} strokeWidth={2} />
        ))}
        {C.vest && <path d="M -250 0 Q -250 -160 -170 -228 L -70 -150 L -60 0 Z M 250 0 Q 250 -160 170 -228 L 70 -150 L 60 0 Z" fill={C.vest} {...st} />}
        {C.shoulderCloth && (
          <g>
            {/* cloth over the right shoulder (viewer's left), tail flutters in the wind */}
            <path d="M -250 -200 Q -170 -255 -70 -258 Q -110 -170 -180 -40 L -260 -30 Q -280 -130 -250 -200 Z" fill={C.shoulderCloth} {...st} />
            <path d={`M -250 -190 Q -320 -170 ${-350 + flutter} ${-120 + flutter * 0.4} Q ${-330 + flutter * 0.6} -90 -268 -110 Z`} fill={C.shoulderCloth} {...st} />
            <path d="M -200 -230 Q -180 -150 -220 -50" fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
      </g>
      {/* neck */}
      <path d="M -52 -330 L -56 -248 Q 0 -222 56 -248 L 52 -330 Z" fill={C.skinShade} {...st} />
      <g transform={`rotate(${p.tilt} 0 -330)`}>
        {/* turban tail / scarf back */}
        {/* ears */}
        {C.headwear !== "scarf" && (
          <>
            <ellipse cx={-120 + fx * 0.4} cy={-430 + fy} rx={20} ry={32} fill={C.skin} {...st} />
            <ellipse cx={120 + fx * 0.4} cy={-430 + fy} rx={20} ry={32} fill={C.skin} {...st} />
          </>
        )}
        {/* head */}
        <ellipse cx={fx * 0.3} cy={-430} rx={118} ry={138} fill={C.skin} {...st} />
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={fx * 0.3 - 110} cy={-430} rx={60} ry={150} fill={C.skinShade} opacity={0.35} />
          {shade > 0.01 && <rect x={-200} y={-600} width={400} height={400} fill="#3a4a6a" opacity={shade * 0.35} />}
          {dapple > 0.01 &&
            [0, 1, 2, 3, 4].map((i) => {
              const dx = Math.sin(t * 0.9 + i * 2.1) * 70 + (i - 2) * 40;
              const dy = -500 + ((i * 47) % 160) + Math.cos(t * 0.7 + i) * 20;
              return <ellipse key={i} cx={dx} cy={dy} rx={26 + (i % 3) * 10} ry={16 + (i % 2) * 8} fill="#fff4c8" opacity={dapple * 0.35} />;
            })}
        </g>
        {/* cheeks */}
        <ellipse cx={-70 + fx} cy={-380 + fy} rx={22} ry={13} fill="#e88a7a" opacity={0.3} />
        <ellipse cx={70 + fx} cy={-380 + fy} rx={22} ry={13} fill="#e88a7a" opacity={0.3} />
        {/* beard */}
        {C.beardLength > 0 && (
          <path
            transform={`translate(${fx * 0.6} ${fy * 0.5}) translate(0 -380) scale(1 ${0.65 + C.beardLength * 0.35}) translate(0 380)`}
            d="M -116 -420 Q -120 -330 -70 -300 Q 0 -262 70 -300 Q 120 -330 116 -420 Q 100 -350 60 -330 Q 30 -370 0 -370 Q -30 -370 -60 -330 Q -100 -350 -116 -420 Z"
            fill={C.beard}
            {...st}
          />
        )}
        {mouth()}
        {C.beardLength > 0 && <path d={`M ${fx * 0.8 - 42} ${-366 + fy} Q ${fx * 0.8} ${-384 + fy} ${fx * 0.8 + 42} ${-366 + fy}`} fill="none" stroke={C.beard} strokeWidth={13} strokeLinecap="round" />}
        {/* nose */}
        <path d={`M ${fx - 4} ${-440 + fy} Q ${fx - 16} ${-402 + fy} ${fx - 2} ${-394 + fy} Q ${fx + 12} ${-394 + fy} ${fx + 16} ${-404 + fy}`} fill="none" stroke={C.skinShade} strokeWidth={6} strokeLinecap="round" />
        {eye(-46 + fx)}
        {eye(46 + fx)}
        {brow(-46 + fx, -1)}
        {brow(46 + fx, 1)}
        {/* headwear */}
        {C.headwear === "scarf" ? (
          <path d="M -140 -380 Q -150 -590 0 -590 Q 150 -590 140 -380 Q 130 -300 100 -270 Q 120 -420 90 -500 Q 0 -540 -90 -500 Q -120 -420 -100 -270 Q -130 -300 -140 -380 Z" fill={C.turban} {...st} />
        ) : C.headwear === "cap" ? (
          <path d="M -112 -490 Q -110 -585 0 -590 Q 110 -585 112 -490 Q 0 -512 -112 -490 Z" fill={C.turban} {...st} />
        ) : (
          <g>
            <path d="M -130 -480 Q -150 -600 -40 -625 Q 0 -632 40 -625 Q 150 -600 130 -480 Q 70 -505 0 -505 Q -70 -505 -130 -480 Z" fill={C.turban} {...st} />
            <path d="M -122 -520 Q -20 -570 120 -510" fill="none" stroke={C.turbanShade} strokeWidth={10} strokeLinecap="round" />
            <path d="M -110 -565 Q 10 -600 108 -556" fill="none" stroke={C.turbanShade} strokeWidth={10} strokeLinecap="round" />
            <path d="M 20 -500 Q 40 -560 10 -620" fill="none" stroke={C.turbanShade} strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
};
