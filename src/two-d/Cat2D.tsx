// 2D cut-out cat puppet. Origin = ground under the body, facing right. Built for "billi-aur-aurat", reusable.
// Modes blend: stand/walk (default) -> sit (sit=1) -> lie curled (lie=1). Expressive ears, eyes, tail.

import React from "react";
import { LINE, OUT, mix } from "./kit";

export type CatPose = {
  sit: number; // 0..1 sitting on its haunches
  lie: number; // 0..1 lying down, curled (overrides sit)
  walk: number; // 0..1 walk amplitude (standing mode)
  step: number; // walk phase (radians)
  headUp: number; // 0..1 looks up (hope)
  headDown: number; // 0..1 head low (tired / drinking)
  ears: number; // 1 perked .. 0 flat/droopy
  eyeOpen: number; // 0..1 (0 = peaceful closed arcs)
  sad: number; // 0..1 worried brows
  meow: number; // 0..1 mouth open
  paw: number; // 0..1 near front paw reaches forward
  lap: number; // 0..1 drinking motion (tongue + head bob)
  tail: number; // 0..1 tail energy (raised / swishing)
  thin: number; // 0..1 weak, thinner body, slower breath
  look: number; // -1..1 pupils left/right
  time: number; // seconds
};

export const CAT_BASE: CatPose = { sit: 0, lie: 0, walk: 0, step: 0, headUp: 0, headDown: 0, ears: 1, eyeOpen: 1, sad: 0, meow: 0, paw: 0, lap: 0, tail: 0.5, thin: 0, look: 0.3, time: 0 };

export const CAT_COATS = {
  orange: { fur: "#f2a356", shade: "#d9853c", stripe: "#c06a2a", white: "#fff8ee", whiteShade: "#ecdcc6", nose: "#f08f9c", iris: "#9ad35e", inner: "#f6b6b8" },
  grey: { fur: "#a9a7a4", shade: "#8c8986", stripe: "#6c6966", white: "#fbfaf6", whiteShade: "#e2dfd8", nose: "#e895a0", iris: "#e8c24a", inner: "#f1b4b8" },
};
export type CatCoat = keyof typeof CAT_COATS;

const st = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/**
 * part="all" draws the whole cat; with `pawOut` the near front paw is left out so the film can draw it again
 * with part="paw" in front of cage bars (paw reaching through the bars).
 */
export const Cat2D: React.FC<{ x: number; y: number; flip?: boolean; scale?: number; pose: CatPose; coat?: CatCoat; part?: "all" | "paw"; pawOut?: boolean; noShadow?: boolean }> = ({
  x,
  y,
  flip,
  scale = 1,
  pose: p,
  coat = "orange",
  part = "all",
  pawOut = false,
  noShadow,
}) => {
  const C = CAT_COATS[coat];
  const t = p.time;
  const l = Math.min(1, Math.max(0, p.lie));
  const s = Math.min(1, Math.max(0, p.sit)) * (1 - l);
  const breathRate = mix(3.2, 1.6, p.thin);
  const breath = 1 + Math.sin(t * breathRate) * mix(0.025, 0.012, p.thin);

  // body ellipse: stand -> sit -> lie
  const bx = mix(mix(0, -20, s), -6, l);
  const by = mix(mix(-64, -58, s), -24, l);
  const brx = mix(mix(64, 40, s), 66, l) * (1 - p.thin * 0.05);
  const bry = mix(mix(30, 54, s), 24, l) * (1 - p.thin * 0.16) * breath;
  const brot = mix(-18 * s, 0, l);

  // head
  const walkBob = Math.abs(Math.sin(p.step)) * 4 * p.walk;
  const hx = mix(mix(62, 20, s), 62, l) + p.headDown * 6;
  const hy = mix(mix(-98, -124, s), -38, l) + p.headDown * 22 + walkBob + Math.max(0, Math.sin(t * 14)) * 5 * p.lap;
  const hrot = p.headDown * 18 - p.headUp * 16 + Math.sin(t * 0.9) * 2;

  const mode = l > 0.5 ? "lie" : s > 0.5 ? "sit" : "stand";
  const legW = 19;

  const leg = (lx: number, ly: number, len: number, ang: number, fill: string, key: string) => (
    <g key={key} transform={`translate(${lx} ${ly}) rotate(${ang})`}>
      <rect x={-legW / 2} y={-6} width={legW} height={len + 6} rx={legW / 2} fill={fill} {...st} />
      <ellipse cx={3} cy={len - 2} rx={13} ry={8} fill={C.white} {...st} />
    </g>
  );

  // near front paw (can reach forward with p.paw)
  const nearFront = () => {
    if (mode === "sit") return leg(16, -66, 64, -p.paw * 72, C.fur, "nf");
    if (mode === "lie") return <ellipse key="nf" cx={58 + p.paw * 40} cy={-9} rx={22} ry={10} fill={C.white} {...st} />;
    const a = Math.sin(p.step) * 26 * p.walk - p.paw * 60;
    return leg(40, -48, 46, a, C.fur, "nf");
  };

  if (part === "paw") {
    return <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>{nearFront()}</g>;
  }

  const farLegs = () => {
    if (mode === "sit") return [leg(30, -62, 60, 0, C.shade, "ff")];
    if (mode === "lie") return [<ellipse key="ff" cx={66} cy={-6} rx={20} ry={9} fill={C.whiteShade} {...st} />];
    return [leg(-44, -48, 46, -Math.sin(p.step) * 26 * p.walk, C.shade, "fb"), leg(48, -48, 46, -Math.sin(p.step + 1) * 26 * p.walk, C.shade, "ff")];
  };
  const nearBack = () => {
    if (mode === "sit")
      return (
        <g key="nb">
          <ellipse cx={-30} cy={-30} rx={32} ry={30} fill={C.fur} {...st} />
          <ellipse cx={-6} cy={-6} rx={18} ry={8} fill={C.white} {...st} />
        </g>
      );
    if (mode === "lie") return <ellipse key="nb" cx={-30} cy={-20} rx={28} ry={18} fill={C.fur} {...st} />;
    return leg(-34, -48, 46, Math.sin(p.step + 1) * 26 * p.walk, C.fur, "nb");
  };

  // tail: base at the rear of the body
  const swish = Math.sin(t * mix(1.2, 3, p.tail)) * mix(6, 22, p.tail);
  const tb = { x: mix(mix(-58, -46, s), -66, l), y: mix(mix(-74, -18, s), -22, l) };
  const tip =
    mode === "stand"
      ? { x: -100 + swish * 0.4, y: mix(-60, -150, p.tail) + swish }
      : mode === "sit"
        ? { x: 30 + swish * 0.5, y: -8 - Math.abs(swish) * 0.3 }
        : { x: 46 + swish * 0.2, y: -4 };
  const tc = mode === "stand" ? { x: -120, y: -80 } : mode === "sit" ? { x: -70, y: 4 } : { x: -70, y: 10 };
  const tailD = `M ${tb.x} ${tb.y} Q ${tc.x} ${tc.y} ${tip.x} ${tip.y}`;

  // ears
  const earRot = (1 - p.ears) * 38 + Math.max(0, Math.sin(t * 0.7 + 1.3) - 0.96) * 300; // occasional flick
  const eo = Math.max(0, Math.min(1, p.eyeOpen));
  const eye = (ex: number, ey: number, rx: number, key: string) =>
    eo < 0.25 ? (
      <path key={key} d={`M ${ex - rx} ${ey} Q ${ex} ${ey + 7} ${ex + rx} ${ey}`} fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
    ) : (
      <g key={key}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={13 * eo} fill={C.iris} {...st} />
        <ellipse cx={ex + p.look * rx * 0.35} cy={ey + 1} rx={rx * 0.42} ry={10 * eo} fill="#1c1410" />
        <circle cx={ex - rx * 0.3} cy={ey - 5 * eo} r={3.6} fill="#fff" />
        <circle cx={ex + rx * 0.25} cy={ey + 4 * eo} r={1.8} fill="#fff" opacity={0.8} />
        {/* upper lid follows sadness */}
        {p.sad > 0.05 && <path d={`M ${ex - rx - 2} ${ey - 12 * eo + p.sad * 4} L ${ex + rx + 2} ${ey - 12 * eo + (key === "en" ? -2 : 2) * p.sad * 3}`} stroke={C.fur} strokeWidth={6 * p.sad} strokeLinecap="round" />}
      </g>
    );

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {!noShadow && <ellipse cx={0} cy={2} rx={mix(70, 80, l)} ry={10} fill="#000" opacity={0.18} />}
      {/* tail */}
      <path d={tailD} fill="none" stroke={OUT} strokeWidth={26} strokeLinecap="round" />
      <path d={tailD} fill="none" stroke={C.fur} strokeWidth={18} strokeLinecap="round" />
      <path d={tailD} fill="none" stroke={C.stripe} strokeWidth={18} strokeLinecap="butt" strokeDasharray="10 22" opacity={0.6} />
      {farLegs()}
      {/* body */}
      <g transform={`translate(${bx} ${by}) rotate(${brot})`}>
        <ellipse cx={0} cy={0} rx={brx} ry={bry} fill={C.fur} {...st} />
        <ellipse cx={brx * 0.1} cy={bry * 0.45} rx={brx * 0.7} ry={bry * 0.42} fill={C.shade} opacity={0.35} />
        <ellipse cx={brx * 0.55} cy={bry * 0.25} rx={brx * 0.38} ry={bry * 0.55} fill={C.white} />
        {[-0.45, -0.15, 0.15].map((k, i) => (
          <path key={i} d={`M ${brx * k - 8} ${-bry * 0.95} q 8 ${bry * 0.4} 0 ${bry * 0.7}`} fill="none" stroke={C.stripe} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        ))}
        {/* soft fur tufts on the back */}
        <path d={`M ${-brx * 0.7} ${-bry * 0.7} q 6 -8 12 0 q 6 -8 12 0`} fill="none" stroke={C.shade} strokeWidth={3} />
      </g>
      {nearBack()}
      {!pawOut && nearFront()}
      {/* head */}
      <g transform={`translate(${hx} ${hy}) rotate(${hrot})`}>
        {/* ears */}
        <g transform={`translate(-16 -22) rotate(${-10 - earRot * 0.8})`}>
          <path d="M -12 6 L -2 -30 L 12 4 Z" fill={C.shade} {...st} />
        </g>
        <g transform={`translate(12 -24) rotate(${12 + earRot})`}>
          <path d="M -13 6 L 0 -32 L 13 4 Z" fill={C.fur} {...st} />
          <path d="M -6 2 L 0 -20 L 6 2 Z" fill={C.inner} />
        </g>
        {/* cheek fluff + head */}
        <path d="M -38 4 L -44 12 L -34 14 L -38 22 L -24 22" fill={C.fur} {...st} />
        <ellipse cx={0} cy={0} rx={38} ry={32} fill={C.fur} {...st} />
        {[-10, 0, 10].map((dx, i) => (
          <path key={i} d={`M ${dx - 4} -30 q 2 8 4 12`} fill="none" stroke={C.stripe} strokeWidth={5} strokeLinecap="round" />
        ))}
        <ellipse cx={16} cy={14} rx={22} ry={14} fill={C.white} />
        {/* eyes: far one smaller (3/4 view) */}
        {eye(-6, -2, 9, "ef")}
        {eye(19, -2, 11, "en")}
        {/* worried brows */}
        {p.sad > 0.05 && (
          <>
            <path d={`M -14 ${-17 + p.sad * 2} L -1 ${-20 - p.sad * 5}`} stroke={OUT} strokeWidth={3.5} strokeLinecap="round" opacity={p.sad} />
            <path d={`M 12 ${-20 - p.sad * 5} L 28 ${-17 + p.sad * 2}`} stroke={OUT} strokeWidth={3.5} strokeLinecap="round" opacity={p.sad} />
          </>
        )}
        {/* nose + mouth */}
        <path d="M 30 8 L 38 8 L 34 14 Z" fill={C.nose} {...st} strokeWidth={2.5} />
        {p.meow > 0.05 ? (
          <ellipse cx={33} cy={22} rx={6} ry={3 + p.meow * 8} fill="#7a2f34" {...st} strokeWidth={3} />
        ) : (
          <path d="M 34 14 q -3 6 -9 5 M 34 14 q 3 6 8 4" fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
        )}
        {p.lap > 0.05 && <ellipse cx={36} cy={24 + Math.max(0, Math.sin(t * 14)) * 6} rx={5} ry={6} fill="#f07c8c" {...st} strokeWidth={2} />}
        {/* whiskers */}
        {[-4, 2, 8].map((dy, i) => (
          <path key={i} d={`M 38 ${12 + dy} Q 56 ${10 + dy * 1.6 + Math.sin(t * 2 + i) * 1.5} 70 ${12 + dy * 2.4}`} fill="none" stroke="#f8f0e4" strokeWidth={2} opacity={0.9} />
        ))}
      </g>
    </g>
  );
};
