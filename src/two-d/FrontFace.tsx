// Front view of the Musafir puppet, chest up: face to camera for emotional close-ups (eye contact).
// Same LOOKS as the side puppet (colours, headwear, beard, vest, shoulder cloth, shawl, face/nose/eyes/age variety).
// Local coordinates: (0, 0) = mid chest; the head centre sits at about (0, -330). The body continues far below
// (to y = +900) so a close-up never shows a cut-off bust: place it so the frame bottom crosses the body.
// Arms hang at the sides and come up for dua / holding a letter / holding a prop with closed fists.
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
  /** none = arms down; dua = open palms raised; letter/hold = two fists holding `held` at the chest; chin = hand on chin. */
  hands?: "none" | "dua" | "letter" | "hold" | "chin";
  handsUp?: number; // 0..1 how far the hands are raised
  holdW?: number; // half width between the two fists for "hold"/"letter"
};

export const FRONT_BASE: FrontPose = { eyeOpen: 1, lookX: 0, lookY: 0, brow: 0, wide: 0, mouth: "neutral", talk: 0, tilt: 0, turn: 0, t: 0, hands: "none", handsUp: 1, holdW: 120 };

const Eye: React.FC<{ x: number; y: number; p: FrontPose; s: number; blind?: number }> = ({ x, y, p, s, blind = 0 }) => {
  const rx = (21 + p.wide * 4) * s;
  const ry = (16 + p.wide * 8) * s * Math.max(0.08, p.eyeOpen) * (1 - blind * 0.3);
  const pr = (10 - p.wide * 2) * s;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fffaf0" {...st} strokeWidth={4} />
      {blind > 0.02 && <ellipse cx={x} cy={y} rx={rx - 3} ry={Math.max(1, ry - 2)} fill="#d6dee6" opacity={blind * 0.92} />}
      {p.eyeOpen > 0.3 && blind < 0.98 && (
        <g opacity={1 - blind}>
          <circle cx={x + p.lookX * 9} cy={y + p.lookY * 6} r={pr + 2} fill="#4a2e1c" />
          <circle cx={x + p.lookX * 9} cy={y + p.lookY * 6} r={Math.max(2, pr - 3)} fill="#120c08" />
          <circle cx={x + p.lookX * 9 - 4} cy={y + p.lookY * 6 - 4} r={3.4} fill="#ffffff" />
        </g>
      )}
      <path d={`M ${x - rx - 2} ${y - 1} Q ${x} ${y - ry - 7} ${x + rx + 2} ${y - 1}`} fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/** Open palm (dua). */
const Palm: React.FC<{ x: number; y: number; rot: number; skin: string; shade: string; flip?: boolean }> = ({ x, y, rot, skin, shade, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`}>
    <path d="M -34 30 Q -44 -10 -34 -54 Q -28 -74 -14 -70 L -6 -40 L -2 -78 Q 6 -92 16 -80 L 18 -40 L 26 -70 Q 36 -80 42 -64 L 38 -20 Q 46 -30 52 -22 Q 50 6 30 30 Z" fill={skin} {...st} strokeWidth={4} />
    <path d="M -20 10 Q 6 22 30 8" fill="none" stroke={shade} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** Closed fist seen from the front, fingers wrapped forward (over a held thing), thumb on top. */
const Fist: React.FC<{ x: number; y: number; skin: string; flip?: boolean }> = ({ x, y, skin, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-34} y={-30} width={68} height={62} rx={24} fill={skin} {...st} strokeWidth={4} />
    <path d="M -30 -8 L 30 -8 M -30 8 L 30 8" stroke={OUT} strokeWidth={3} />
    <path d="M -20 -30 Q -4 -46 22 -38" fill={skin} {...st} strokeWidth={4} />
  </g>
);

/** Sleeve from the shoulder to the hand (elbow bends outward). */
const Sleeve: React.FC<{ sx: number; sy: number; ex: number; ey: number; hx: number; hy: number; robe: string; shade: string }> = ({ sx, sy, ex, ey, hx, hy, robe, shade }) => (
  <g>
    <path d={`M ${sx} ${sy} L ${ex} ${ey}`} stroke={OUT} strokeWidth={66} strokeLinecap="round" />
    <path d={`M ${sx} ${sy} L ${ex} ${ey}`} stroke={robe} strokeWidth={56} strokeLinecap="round" />
    <path d={`M ${ex} ${ey} L ${hx} ${hy}`} stroke={OUT} strokeWidth={62} strokeLinecap="round" />
    <path d={`M ${ex} ${ey} L ${hx} ${hy}`} stroke={robe} strokeWidth={52} strokeLinecap="round" />
    <path d={`M ${(ex + hx) / 2} ${(ey + hy) / 2 - 10} L ${hx} ${hy}`} stroke={shade} strokeWidth={14} strokeLinecap="round" opacity={0.6} />
  </g>
);

export const MusafirFront: React.FC<{
  x: number;
  y: number;
  s?: number;
  look?: Partial<Look>;
  pose: Partial<FrontPose>;
  /** What the fists hold for hands "letter" / "hold" (drawn between the fists, local coords at the chest). */
  held?: React.ReactNode;
  /** @deprecated use held */
  letter?: React.ReactNode;
  /** Cel shading: light from the left ("l") or right ("r") of the screen. */
  light?: "l" | "r";
}> = ({ x, y, s = 1, look, pose, held, letter, light }) => {
  const C = { ...DEF, ...look } as typeof DEF & Partial<Look>;
  const p: FrontPose = { ...FRONT_BASE, ...pose };
  const breathe = 1 + Math.sin(p.t * 1.6) * 0.012;
  const fx = p.turn * 22;
  const hy = -330;
  const browY = -42 - p.wide * 10 - Math.max(0, p.brow) * 8;
  const browIn = p.brow < 0 ? -p.brow * 10 : 0;
  const mouthY = 52;
  const talkO = p.talk > 0.06 ? 4 + p.talk * 16 : 0;
  const es = C.eyes ?? 1;
  const bw = C.brows ?? 1;
  const width = C.build ?? 1;
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
  const up = p.handsUp ?? 1;
  const hw = p.holdW ?? 120;
  const holding = p.hands === "letter" || p.hands === "hold";
  const thing = held ?? letter;
  // hand targets (raised) and rest (down at the sides, off-frame)
  const handY = (target: number) => target + (1 - up) * 520;
  const head = (
    <g transform={`translate(0 ${hy}) rotate(${p.tilt})`}>
      {C.headwear === "scarf" && <path d="M -150 -40 Q -160 -170 0 -178 Q 160 -170 150 -40 Q 150 80 120 130 L -120 130 Q -150 80 -150 -40 Z" fill={C.turbanShade} {...st} />}
      {C.headwear !== "scarf" && (
        <>
          <ellipse cx={-110 + fx * 0.3} cy={-6} rx={20} ry={30} fill={C.skinShade} {...st} strokeWidth={4} />
          <ellipse cx={110 + fx * 0.3} cy={-6} rx={20} ry={30} fill={C.skinShade} {...st} strokeWidth={4} />
        </>
      )}
      {C.face === "long" ? (
        <ellipse cx={0} cy={6} rx={98} ry={136} fill={C.skin} {...st} />
      ) : C.face === "round" ? (
        <ellipse cx={0} cy={4} rx={116} ry={118} fill={C.skin} {...st} />
      ) : C.face === "square" ? (
        <path d="M -106 -40 Q -106 -124 0 -124 Q 106 -124 106 -40 L 100 70 Q 90 124 0 126 Q -90 124 -100 70 Z" fill={C.skin} {...st} />
      ) : (
        <ellipse cx={0} cy={0} rx={108} ry={124} fill={C.skin} {...st} />
      )}
      <path d={`M ${p.turn > 0 ? -96 : 96} -30 Q ${p.turn > 0 ? -104 : 104} 30 ${p.turn > 0 ? -70 : 70} 90`} fill="none" stroke={C.skinShade} strokeWidth={16} strokeLinecap="round" opacity={0.35 + Math.abs(p.turn) * 0.4} />
      {beard > 0 && C.beardStyle !== "goatee" && (
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
      {beard > 0 && C.beardStyle === "goatee" && (
        <path transform={`translate(${fx * 0.6} 0)`} d={`M -40 70 Q -36 ${110 + beard * 30} 0 ${124 + beard * 30} Q 36 ${110 + beard * 30} 40 70 Q 20 82 0 80 Q -20 82 -40 70 Z`} fill={C.beard} {...st} strokeWidth={4} />
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
      {C.nose === "big" ? (
        <path d={`M ${fx - 6} -24 Q ${fx - 26} 22 ${fx - 14} 30 Q ${fx + 2} 38 ${fx + 20} 28`} fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
      ) : C.nose === "hook" ? (
        <path d={`M ${fx + 2} -28 Q ${fx - 20} 4 ${fx - 16} 22 Q ${fx - 4} 34 ${fx + 16} 22 Q ${fx + 8} 16 ${fx + 2} 20`} fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
      ) : C.nose === "small" ? (
        <path d={`M ${fx - 2} 0 Q ${fx - 10} 16 ${fx - 4} 20 Q ${fx + 4} 24 ${fx + 10} 18`} fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      ) : (
        <path d={`M ${fx - 4} -18 Q ${fx - 16} 18 ${fx - 10} 24 Q ${fx + 2} 30 ${fx + 14} 22`} fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      )}
      <Eye x={-44 + fx} y={-12} p={p} s={es} blind={C.blind ?? 0} />
      <Eye x={44 + fx} y={-12} p={p} s={es} blind={C.blind ?? 0} />
      {(C.patches ?? 0) > 0.01 && (
        <g opacity={C.patches} fill="#f3cdb8" stroke="#d9a58a" strokeWidth={3}>
          <path d={`M ${fx - 80} 20 q 20 -18 40 -4 q 10 20 -10 26 q -26 6 -30 -22 Z`} />
          <path d={`M ${fx + 40} -78 q 18 -14 36 -2 q 8 16 -10 20 q -22 2 -26 -18 Z`} />
          <path d={`M ${fx + 58} 40 q 12 -8 22 4 q 2 14 -12 14 q -12 -2 -10 -18 Z`} />
          <path d={`M ${fx - 40} -96 q 10 -8 20 0 q 2 10 -8 12 q -12 0 -12 -12 Z`} />
        </g>
      )}
      <path d={`M ${-72 + fx} ${browY + 6} Q ${-48 + fx} ${browY - 8} ${-22 + fx} ${browY - browIn}`} fill="none" stroke={C.beard} strokeWidth={10 * bw} strokeLinecap="round" />
      <path d={`M ${72 + fx} ${browY + 6} Q ${48 + fx} ${browY - 8} ${22 + fx} ${browY - browIn}`} fill="none" stroke={C.beard} strokeWidth={10 * bw} strokeLinecap="round" />
      {(C.age ?? 0) > 0 && (
        <g opacity={Math.min(1, C.age ?? 0)} fill="none" stroke={C.skinShade} strokeWidth={5} strokeLinecap="round">
          <path d={`M ${fx - 50} -82 Q ${fx} -92 ${fx + 50} -82 M ${fx - 38} -70 Q ${fx} -77 ${fx + 38} -70`} />
          <path d={`M ${fx - 82} -18 l -14 -6 M ${fx - 82} -8 l -14 4 M ${fx + 82} -18 l 14 -6 M ${fx + 82} -8 l 14 4`} />
          <path d={`M ${fx - 34} 34 Q ${fx - 44} 52 ${fx - 36} 66 M ${fx + 34} 34 Q ${fx + 44} 52 ${fx + 36} 66`} />
        </g>
      )}
      {C.headwear === "turban" && (
        <>
          <path d="M -118 -40 Q -130 -168 0 -176 Q 130 -168 118 -40 Q 60 -70 0 -70 Q -60 -70 -118 -40 Z" fill={C.turban} {...st} />
          <path d="M -110 -76 Q 0 -126 110 -76" fill="none" stroke={C.turbanShade} strokeWidth={9} strokeLinecap="round" />
          <path d="M -100 -116 Q 0 -150 100 -116" fill="none" stroke={C.turbanShade} strokeWidth={9} strokeLinecap="round" />
          <path d="M -30 -168 Q 10 -110 60 -72" fill="none" stroke={C.turbanShade} strokeWidth={8} strokeLinecap="round" />
        </>
      )}
      {C.headwear === "cap" && <path d="M -100 -60 Q -96 -150 0 -154 Q 96 -150 100 -60 Q 0 -80 -100 -60 Z" fill={C.turban} {...st} />}
      {C.headwear === "none" &&
        ((C.hair ?? 0) > 0.02 ? (
          <path
            transform={`translate(0 -70) scale(1 ${0.35 + 0.65 * (C.hair ?? 0)}) translate(0 70)`}
            d="M -110 -20 Q -124 -140 0 -142 Q 124 -140 110 -20 Q 96 -84 40 -92 Q 0 -96 -40 -92 Q -96 -84 -110 -20 Z"
            fill={C.beard}
            opacity={Math.min(1, (C.hair ?? 0) * 1.6)}
            {...st}
          />
        ) : (
          <ellipse cx={-26} cy={-96} rx={34} ry={14} fill="#ffffff" opacity={0.5} transform="rotate(-14 -26 -96)" />
        ))}
      {C.headwear === "scarf" && <path d="M -118 60 Q -130 -150 0 -150 Q 130 -150 118 60 Q 110 -60 0 -84 Q -110 -60 -118 60 Z" fill={C.turban} {...st} />}
    </g>
  );
  return (
    <g filter={light ? `url(#cel${light === "l" ? "R" : "L"}Big)` : undefined}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* body: shoulders + chest, continuing far below the frame */}
        <g transform={`scale(${width} ${breathe})`}>
          <path d="M -260 900 L -262 40 Q -258 -170 -150 -205 Q -80 -228 0 -230 Q 80 -228 150 -205 Q 258 -170 262 40 L 260 900 Z" fill={C.robe} {...st} />
          <path d="M -200 600 Q -210 -80 -150 -190" fill="none" stroke={C.robeShade} strokeWidth={14} strokeLinecap="round" opacity={0.8} />
          <path d="M 200 600 Q 210 -80 150 -190" fill="none" stroke={C.robeShade} strokeWidth={14} strokeLinecap="round" opacity={0.6} />
          <path d="M -40 -226 Q 0 -150 40 -226" fill={C.robeShade} {...st} strokeWidth={4} />
          <path d="M 0 -170 L 0 160" stroke={C.robeShade} strokeWidth={6} />
          {[-140, -100, -60, -20, 20].map((by) => (
            <circle key={by} cx={0} cy={by} r={5} fill={C.sash} stroke={OUT} strokeWidth={2} />
          ))}
          <rect x={-262} y={250} width={524} height={44} fill={C.sash} {...st} />
          {C.vest && (
            <>
              <path d="M -262 900 L -262 40 Q -258 -170 -150 -205 Q -100 -222 -60 -226 Q -50 -110 -70 900 Z" fill={C.vest} {...st} />
              <path d="M 262 900 L 262 40 Q 258 -170 150 -205 Q 100 -222 60 -226 Q 50 -110 70 900 Z" fill={C.vest} {...st} />
            </>
          )}
          {C.shoulderCloth && (
            <path d={`M -222 -140 Q -150 -222 -60 -222 Q -40 -160 -60 -60 Q -70 ${80 + Math.sin(p.t * 2) * 6} -110 200 L -230 220 Q -250 -40 -222 -140 Z`} fill={C.shoulderCloth} {...st} />
          )}
          {C.shawl && (
            <>
              <path d="M -262 900 L -264 40 Q -262 -170 -150 -212 Q -90 -232 -48 -228 Q -70 -150 -96 -60 Q -110 200 -100 900 Z" fill={C.shawl} {...st} />
              <path d="M 262 900 L 264 40 Q 262 -170 150 -212 Q 90 -232 48 -228 Q 70 -150 96 -60 Q 110 200 100 900 Z" fill={C.shawl} {...st} />
              <path d={`M -96 -60 Q -120 ${-30 + Math.sin(p.t * 1.7) * 3} -150 -40`} fill="none" stroke="#00000022" strokeWidth={8} />
              <path d="M -230 300 L -230 900 M 230 300 L 230 900" stroke="#00000022" strokeWidth={10} />
            </>
          )}
        </g>
        {/* neck + head */}
        <path d="M -46 -270 L -48 -214 Q 0 -192 48 -214 L 46 -270 Z" fill={C.skinShade} {...st} strokeWidth={4} />
        {head}
        {/* arms */}
        {p.hands === "dua" && (
          <g>
            <Sleeve sx={-200 * width} sy={-150} ex={-190 * width} ey={handY(150)} hx={-80} hy={handY(-30)} robe={C.robe} shade={C.robeShade} />
            <Sleeve sx={200 * width} sy={-150} ex={190 * width} ey={handY(150)} hx={80} hy={handY(-30)} robe={C.robe} shade={C.robeShade} />
            <Palm x={-62} y={handY(-120)} rot={-12} skin={C.skin} shade={C.skinShade} />
            <Palm x={62} y={handY(-120)} rot={12} skin={C.skin} shade={C.skinShade} flip />
          </g>
        )}
        {holding && (
          <g>
            <g transform={`translate(0 ${handY(-40)})`}>{thing}</g>
            <Sleeve sx={-232 * width} sy={-140} ex={-260 * width} ey={handY(160)} hx={-hw} hy={handY(-20)} robe={C.robe} shade={C.robeShade} />
            <Sleeve sx={232 * width} sy={-140} ex={260 * width} ey={handY(160)} hx={hw} hy={handY(-20)} robe={C.robe} shade={C.robeShade} />
            <Fist x={-hw} y={handY(-40)} skin={C.skin} />
            <Fist x={hw} y={handY(-40)} skin={C.skin} flip />
          </g>
        )}
        {p.hands === "chin" && (
          <g>
            <Sleeve sx={232 * width} sy={-140} ex={250 * width} ey={handY(160)} hx={70} hy={handY(-200)} robe={C.robe} shade={C.robeShade} />
            <Fist x={70} y={handY(-230)} skin={C.skin} flip />
          </g>
        )}
        {(p.hands === "none" || p.hands === undefined) && (
          <g fill="none" strokeLinecap="round">
            {/* arms rest at the sides: only the sleeve seams show, the elbows are out of frame */}
            <path d={`M ${-150 * width} -196 Q ${-196 * width} 120 ${-188 * width} 900`} stroke={OUT} strokeWidth={5} />
            <path d={`M ${150 * width} -196 Q ${196 * width} 120 ${188 * width} 900`} stroke={OUT} strokeWidth={5} />
            <path d={`M ${-176 * width} -100 Q ${-210 * width} 200 ${-206 * width} 900`} stroke={C.robeShade} strokeWidth={16} opacity={0.6} />
            <path d={`M ${176 * width} -100 Q ${210 * width} 200 ${206 * width} 900`} stroke={C.robeShade} strokeWidth={16} opacity={0.6} />
          </g>
        )}
      </g>
    </g>
  );
};
