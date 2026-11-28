// Front view of the Musafir puppet, chest up: face to camera for emotional close-ups (eye contact).
// Same LOOKS as the side puppet (colours, headwear, beard, vest, shoulder cloth, shawl).
// Local coordinates: (0, 0) = bottom centre of the chest; the head centre sits at about (0, -330).
// Built for "samundar-mein-1000-dinar"; reusable for every film.

import React from "react";
import { LINE, OUT } from "./kit";
import type { Look, Mouth } from "./Musafir";

const st = { stroke: OUT, strokeWidth: LINE + 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const DEF = {
  skin: "#e2a774",
  skinShade: "#c98c5c",
  robe: "#f4ead6",
  robeShade: "#dccbaa",
  sash: "#b5643c",
  turban: "#ffffff",
  turbanShade: "#e2ddd2",
  beard: "#4a3426",
  headwear: "turban" as Look["headwear"],
  beardLength: 1,
};

export type FrontPose = {
  eyeOpen: number; // 0..1 (blink)
  lookX: number; // -1..1 pupils left/right (0 = into the lens)
  lookY: number; // -1..1 pupils up/down
  brow: number; // -1 worried .. 0 .. +1 raised
  wide: number; // 0..1 eyes wide open in wonder/shock
  mouth: Mouth;
  talk: number; // 0..1 lip-flap
  tilt: number; // degrees head tilt
  turn: number; // -1..1 small head turn (features shift, 3/4 feel)
  t: number; // seconds (breathing, cloth)
  hands?: "none" | "dua" | "letter" | "chin";
  handsUp?: number; // 0..1 how far the hands are raised
};

export const FRONT_BASE: FrontPose = { eyeOpen: 1, lookX: 0, lookY: 0, brow: 0, wide: 0, mouth: "neutral", talk: 0, tilt: 0, turn: 0, t: 0, hands: "none", handsUp: 1 };

const Eye: React.FC<{ x: number; y: number; p: FrontPose }> = ({ x, y, p }) => {
  const rx = 21 + p.wide * 4;
  const ry = (16 + p.wide * 8) * Math.max(0.08, p.eyeOpen);
  const pr = 10 - p.wide * 2;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fffaf0" {...st} strokeWidth={4} />
      {p.eyeOpen > 0.3 && (
        <>
          <circle cx={x + p.lookX * 9} cy={y + p.lookY * 6} r={pr + 2} fill="#4a2e1c" />
          <circle cx={x + p.lookX * 9} cy={y + p.lookY * 6} r={pr - 3} fill="#120c08" />
          <circle cx={x + p.lookX * 9 - 4} cy={y + p.lookY * 6 - 4} r={3.4} fill="#ffffff" />
        </>
      )}
      {/* upper lid line */}
      <path d={`M ${x - rx - 2} ${y - 1} Q ${x} ${y - ry - 7} ${x + rx + 2} ${y - 1}`} fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

const Hand: React.FC<{ x: number; y: number; rot: number; skin: string; shade: string; flip?: boolean }> = ({ x, y, rot, skin, shade, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`}>
    {/* open palm facing up/inward, fingers together (dua) */}
    <path d="M -34 30 Q -44 -10 -34 -54 Q -28 -74 -14 -70 L -6 -40 L -2 -78 Q 6 -92 16 -80 L 18 -40 L 26 -70 Q 36 -80 42 -64 L 38 -20 Q 46 -30 52 -22 Q 50 6 30 30 Z" fill={skin} {...st} strokeWidth={4} />
    <path d="M -20 10 Q 6 22 30 8" fill="none" stroke={shade} strokeWidth={5} strokeLinecap="round" />
  </g>
);

export const MusafirFront: React.FC<{ x: number; y: number; s?: number; look?: Partial<Look> & { shawl?: string }; pose: Partial<FrontPose>; letter?: React.ReactNode }> = ({
  x,
  y,
  s = 1,
  look,
  pose,
  letter,
}) => {
  const C = { ...DEF, ...look } as typeof DEF & Partial<Look> & { shawl?: string };
  const p: FrontPose = { ...FRONT_BASE, ...pose };
  const breathe = 1 + Math.sin(p.t * 1.6) * 0.012;
  const fx = p.turn * 22; // features shift for a small turn
  const hx = 0;
  const hy = -330;
  const browY = -42 - p.wide * 10 - Math.max(0, p.brow) * 8;
  const browIn = p.brow < 0 ? -p.brow * 10 : 0; // worried: inner ends up
  const mouthY = 52;
  const talkO = p.talk > 0.06 ? 4 + p.talk * 16 : 0;
  const mouthEl = () => {
    if (talkO) return <ellipse cx={fx} cy={mouthY + 2} rx={15} ry={talkO} fill="#6e1f1f" {...st} strokeWidth={4} />;
    switch (p.mouth) {
      case "smile":
        return <path d={`M ${fx - 22} ${mouthY - 3} Q ${fx} ${mouthY + 18} ${fx + 22} ${mouthY - 3}`} fill="#8b2f2f" {...st} strokeWidth={4} />;
      case "open":
        return <ellipse cx={fx} cy={mouthY + 2} rx={12} ry={15} fill="#6e1f1f" {...st} strokeWidth={4} />;
      case "sad":
        return <path d={`M ${fx - 18} ${mouthY + 6} Q ${fx} ${mouthY - 6} ${fx + 18} ${mouthY + 6}`} fill="none" {...st} strokeWidth={4} />;
      default:
        return <path d={`M ${fx - 16} ${mouthY} Q ${fx} ${mouthY + 3} ${fx + 16} ${mouthY}`} fill="none" {...st} strokeWidth={4} />;
    }
  };
  const beard = C.beardLength ?? 1;
  const shawl = C.shawl;
  const up = p.handsUp ?? 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* shoulders + chest */}
      <g transform={`scale(1 ${breathe})`}>
        <path d="M -250 0 Q -250 -170 -150 -205 Q -80 -228 0 -230 Q 80 -228 150 -205 Q 250 -170 250 0 Z" fill={C.robe} {...st} />
        <path d="M -190 -10 Q -200 -120 -150 -190" fill="none" stroke={C.robeShade} strokeWidth={12} strokeLinecap="round" opacity={0.8} />
        <path d="M 190 -10 Q 200 -120 150 -190" fill="none" stroke={C.robeShade} strokeWidth={12} strokeLinecap="round" opacity={0.6} />
        {/* neckline placket */}
        <path d="M -40 -226 Q 0 -150 40 -226" fill={C.robeShade} {...st} strokeWidth={4} />
        <path d="M 0 -170 L 0 -40" stroke={C.robeShade} strokeWidth={6} />
        {[-140, -110, -80].map((by) => (
          <circle key={by} cx={0} cy={by} r={5} fill={C.sash} stroke={OUT} strokeWidth={2} />
        ))}
        {C.vest && (
          <>
            <path d="M -250 0 Q -250 -170 -150 -205 Q -100 -222 -60 -226 Q -50 -110 -70 0 Z" fill={C.vest} {...st} />
            <path d="M 250 0 Q 250 -170 150 -205 Q 100 -222 60 -226 Q 50 -110 70 0 Z" fill={C.vest} {...st} />
          </>
        )}
        {C.shoulderCloth && (
          // cloth thrown over the right shoulder (viewer's left), falling down the chest
          <path
            d={`M -210 -150 Q -150 -222 -60 -222 Q -40 -160 -60 -60 Q -70 ${-10 + Math.sin(p.t * 2) * 4} -110 0 L -200 0 Q -230 -80 -210 -150 Z`}
            fill={C.shoulderCloth}
            {...st}
          />
        )}
        {shawl && (
          // shawl over both shoulders, open in front
          <>
            <path d="M -250 0 Q -255 -170 -150 -212 Q -90 -232 -48 -228 Q -70 -150 -96 -60 Q -104 -20 -100 0 Z" fill={shawl} {...st} />
            <path d="M 250 0 Q 255 -170 150 -212 Q 90 -232 48 -228 Q 70 -150 96 -60 Q 104 -20 100 0 Z" fill={shawl} {...st} />
            <path d={`M -96 -60 Q -120 ${-30 + Math.sin(p.t * 1.7) * 3} -150 -40`} fill="none" stroke="#00000022" strokeWidth={8} />
            <path d="M -200 -30 L -200 0 M -170 -24 L -170 0 M 200 -30 L 200 0 M 170 -24 L 170 0" stroke="#00000030" strokeWidth={5} />
          </>
        )}
      </g>
      {/* neck */}
      <path d="M -46 -270 L -48 -214 Q 0 -192 48 -214 L 46 -270 Z" fill={C.skinShade} {...st} strokeWidth={4} />
      {/* head */}
      <g transform={`translate(${hx} ${hy}) rotate(${p.tilt})`}>
        {C.headwear === "scarf" && <path d="M -150 -40 Q -160 -170 0 -178 Q 160 -170 150 -40 Q 150 80 120 130 L -120 130 Q -150 80 -150 -40 Z" fill={C.turbanShade} {...st} />}
        {/* ears */}
        {C.headwear !== "scarf" && (
          <>
            <ellipse cx={-110 + fx * 0.3} cy={-6} rx={20} ry={30} fill={C.skinShade} {...st} strokeWidth={4} />
            <ellipse cx={110 + fx * 0.3} cy={-6} rx={20} ry={30} fill={C.skinShade} {...st} strokeWidth={4} />
          </>
        )}
        <ellipse cx={0} cy={0} rx={108} ry={124} fill={C.skin} {...st} />
        {/* cheek shading on the turned-away side */}
        <path d={`M ${p.turn > 0 ? -96 : 96} -30 Q ${p.turn > 0 ? -104 : 104} 30 ${p.turn > 0 ? -70 : 70} 90`} fill="none" stroke={C.skinShade} strokeWidth={16} strokeLinecap="round" opacity={0.35 + Math.abs(p.turn) * 0.4} />
        {/* beard (around the jaw) */}
        {beard > 0 && (
          <g transform={`translate(${fx * 0.6} 0) scale(1 ${0.7 + beard * 0.3})`}>
            <path d="M -104 0 Q -110 90 -60 128 Q 0 160 60 128 Q 110 90 104 0 Q 92 56 60 70 Q 30 40 0 44 Q -30 40 -60 70 Q -92 56 -104 0 Z" fill={C.beard} {...st} strokeWidth={4} />
            {C.beardGrey && (
              <>
                <path d="M -60 96 Q -50 116 -36 128" fill="none" stroke="#f1ece4" strokeWidth={6} strokeLinecap="round" />
                <path d="M 8 120 Q 10 136 14 146" fill="none" stroke="#f1ece4" strokeWidth={6} strokeLinecap="round" />
                <path d="M 62 92 Q 54 112 44 124" fill="none" stroke="#f1ece4" strokeWidth={5} strokeLinecap="round" />
              </>
            )}
          </g>
        )}
        {beard === 0 && (
          <>
            <ellipse cx={-64 + fx} cy={34} rx={20} ry={12} fill="#e88a7a" opacity={0.35} />
            <ellipse cx={64 + fx} cy={34} rx={20} ry={12} fill="#e88a7a" opacity={0.35} />
          </>
        )}
        {mouthEl()}
        {beard > 0 && <path d={`M ${fx - 40} ${mouthY - 8} Q ${fx - 14} ${mouthY - 22} ${fx} ${mouthY - 14} Q ${fx + 14} ${mouthY - 22} ${fx + 40} ${mouthY - 8}`} fill="none" stroke={C.beard} strokeWidth={13} strokeLinecap="round" />}
        {/* nose */}
        <path d={`M ${fx - 4} -18 Q ${fx - 16} 18 ${fx - 10} 24 Q ${fx + 2} 30 ${fx + 14} 22`} fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
        <Eye x={-44 + fx} y={-12} p={p} />
        <Eye x={44 + fx} y={-12} p={p} />
        {/* brows */}
        <path d={`M ${-72 + fx} ${browY + 6} Q ${-48 + fx} ${browY - 8} ${-22 + fx} ${browY - browIn}`} fill="none" stroke={C.beard} strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${72 + fx} ${browY + 6} Q ${48 + fx} ${browY - 8} ${22 + fx} ${browY - browIn}`} fill="none" stroke={C.beard} strokeWidth={10} strokeLinecap="round" />
        {/* headwear */}
        {C.headwear === "turban" && (
          <>
            <path d="M -118 -40 Q -130 -168 0 -176 Q 130 -168 118 -40 Q 60 -70 0 -70 Q -60 -70 -118 -40 Z" fill={C.turban} {...st} />
            <path d="M -110 -76 Q 0 -126 110 -76" fill="none" stroke={C.turbanShade} strokeWidth={9} strokeLinecap="round" />
            <path d="M -100 -116 Q 0 -150 100 -116" fill="none" stroke={C.turbanShade} strokeWidth={9} strokeLinecap="round" />
            <path d="M -30 -168 Q 10 -110 60 -72" fill="none" stroke={C.turbanShade} strokeWidth={8} strokeLinecap="round" />
          </>
        )}
        {C.headwear === "cap" && <path d="M -100 -60 Q -96 -150 0 -154 Q 96 -150 100 -60 Q 0 -80 -100 -60 Z" fill={C.turban} {...st} />}
        {C.headwear === "scarf" && (
          <path d="M -118 60 Q -130 -150 0 -150 Q 130 -150 118 60 Q 110 -60 0 -84 Q -110 -60 -118 60 Z" fill={C.turban} {...st} />
        )}
      </g>
      {/* hands */}
      {p.hands === "dua" && (
        <g transform={`translate(0 ${(1 - up) * 160})`}>
          <Hand x={-62} y={-120} rot={-12} skin={C.skin} shade={C.skinShade} />
          <Hand x={62} y={-120} rot={12} skin={C.skin} shade={C.skinShade} flip />
        </g>
      )}
      {p.hands === "letter" && (
        <g transform={`translate(0 ${(1 - up) * 180})`}>
          {letter}
          <ellipse cx={-110} cy={-90} rx={34} ry={28} fill={C.skin} {...st} strokeWidth={4} />
          <ellipse cx={110} cy={-90} rx={34} ry={28} fill={C.skin} {...st} strokeWidth={4} />
        </g>
      )}
      {p.hands === "chin" && (
        <g transform={`translate(0 ${(1 - up) * 200})`}>
          <path d="M 40 -40 Q 30 -150 60 -200 Q 90 -214 110 -196 Q 120 -150 110 -40 Z" fill={C.robe} {...st} />
          <ellipse cx={80} cy={-210} rx={40} ry={32} fill={C.skin} {...st} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};
