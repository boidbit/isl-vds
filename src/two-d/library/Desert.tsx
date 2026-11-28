// Desert camp world (library). Built for "laal-patti-aur-cheel", reusable for any Arab tribe / desert story.
// Bedouin goat-hair tents (and a small cream khaima), far dunes, rippled sand with dry shrubs, a kite (cheel) that
// glides, flaps, dives and carries things in its talons, its shadow, a red leather sash with stones, sand puffs and
// a drop spindle. Everything natural moves on its own from `t` (seconds).

import React from "react";
import { LINE, OUT, mix } from "../kit";

const st = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const rnd = (i: number, k = 12.9898) => ((((Math.sin(i * k) * 43758.5453) % 1) + 1) % 1);

// ------------------------------------------------------------------ far dunes
export type DuneTone = "gold" | "dawn" | "dusk";
const DUNES: Record<DuneTone, [string, string, string, string]> = {
  // far, mid, near, crest light
  gold: ["#f2cfa4", "#e8b47e", "#dc9c62", "#fff0d0"],
  dawn: ["#ead0c6", "#dcb29a", "#cc9474", "#fff2e4"],
  dusk: ["#ecb08e", "#d88e66", "#bc7048", "#ffd8b0"],
};

/** Three layers of smooth dunes to the horizon, crest light on top, haze in the far band. */
export const DuneBands: React.FC<{ y: number; x0?: number; x1?: number; tone?: DuneTone }> = ({ y, x0 = -1500, x1 = 4500, tone = "gold" }) => {
  const c = DUNES[tone];
  const band = (base: number, amp: number, per: number, ph: number) => {
    const pts: string[] = [];
    for (let x = x0; x <= x1; x += 40) {
      const yy = base - amp * (0.5 + 0.5 * Math.sin(x / per + ph)) - amp * 0.35 * Math.sin(x / (per * 0.37) + ph * 2);
      pts.push(`${x} ${yy.toFixed(1)}`);
    }
    return pts;
  };
  const layers: [number, number, number, number, string][] = [
    [y - 70, 80, 260, 0.4, c[0]],
    [y, 60, 190, 1.7, c[1]],
    [y + 70, 46, 150, 2.9, c[2]],
  ];
  return (
    <g>
      {layers.map(([b, a, p, ph, col], i) => {
        const pts = band(b, a, p, ph);
        return (
          <g key={i}>
            <path d={`M ${x0} ${y + 900} L ${pts.join(" L ")} L ${x1} ${y + 900} Z`} fill={col} />
            <path d={`M ${pts.join(" L ")}`} fill="none" stroke={c[3]} strokeWidth={3 + i} opacity={0.55} />
          </g>
        );
      })}
      {/* haze on the horizon */}
      <rect x={x0} y={y - 140} width={x1 - x0} height={130} fill={c[3]} opacity={0.18} />
    </g>
  );
};

// ------------------------------------------------------------------ sand ground
const SAND: Record<DuneTone, [string, string, string]> = {
  gold: ["#ecc392", "#d9a066", "#bf8448"],
  dawn: ["#e4c4a8", "#cfa482", "#b38262"],
  dusk: ["#e2a87c", "#c98a5c", "#a86a40"],
};

/** Dry shrub tuft that sways. */
export const DryShrub: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const sw = Math.sin(t * 1.6 + x * 0.01) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={4} cy={2} rx={46} ry={8} fill="#6a4020" opacity={0.2} />
      {[-34, -20, -8, 6, 18, 30].map((a, i) => (
        <path key={i} d={`M 0 0 Q ${a * 0.6 + sw * 0.5} -30 ${a + sw} ${-46 - (i % 3) * 10}`} fill="none" stroke={i % 2 ? "#8a7a44" : "#a08c52"} strokeWidth={4} strokeLinecap="round" />
      ))}
      {[-26, 8, 26].map((a, i) => (
        <circle key={i} cx={a + sw} cy={-48 - i * 6} r={3.5} fill="#c8b070" />
      ))}
    </g>
  );
};

/** Rippled sand from y downwards: wind ripples (closer near the horizon), pebbles, dry shrubs. */
export const SandGround: React.FC<{ y: number; t: number; x0?: number; x1?: number; depth?: number; tone?: DuneTone; shrubs?: boolean }> = ({ y, t, x0 = -1500, x1 = 4500, depth = 1400, tone = "gold", shrubs = true }) => {
  const c = SAND[tone];
  const id = `sand-${tone}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c[0]} />
          <stop offset="1" stopColor={c[1]} />
        </linearGradient>
      </defs>
      <rect x={x0} y={y} width={x1 - x0} height={depth} fill={`url(#${id})`} />
      {Array.from({ length: 16 }, (_, i) => {
        const yy = y + 10 + Math.pow(i, 1.55) * 16;
        const pts: string[] = [];
        for (let x = x0; x <= x1; x += 60) pts.push(`${x} ${(yy + Math.sin(x / (70 + i * 6) + i * 1.3) * (3 + i * 0.5)).toFixed(1)}`);
        return <path key={i} d={`M ${pts.join(" L ")}`} fill="none" stroke={c[2]} strokeWidth={1.5 + i * 0.25} opacity={0.28} />;
      })}
      {Array.from({ length: 70 }, (_, i) => {
        const px = x0 + rnd(i) * (x1 - x0);
        const py = y + 20 + Math.pow(rnd(i, 78.233), 1.4) * (depth - 40);
        const r = 2 + rnd(i, 3.7) * 5 * (1 + (py - y) / 600);
        return <ellipse key={i} cx={px} cy={py} rx={r * 1.4} ry={r} fill={i % 3 ? c[2] : "#f6dcb4"} opacity={0.55} />;
      })}
      {shrubs &&
        Array.from({ length: 9 }, (_, i) => {
          const px = x0 + 300 + i * 680 + rnd(i, 5.1) * 200;
          const py = y + 60 + rnd(i, 9.3) * 260;
          return <DryShrub key={i} x={px} y={py} s={0.7 + (py - y) / 500} t={t} />;
        })}
    </g>
  );
};

// ------------------------------------------------------------------ bedouin tent / small khaima
export type TentTone = "black" | "brown" | "cream";
const TENT: Record<TentTone, { base: string; shade: string; light: string; stripe: string }> = {
  black: { base: "#33281f", shade: "#211a14", light: "#54463a", stripe: "#cdb89a" },
  brown: { base: "#6a4a32", shade: "#4e3624", light: "#8a6448", stripe: "#e0d0b0" },
  cream: { base: "#e6d6b8", shade: "#c8b48e", light: "#f6eedc", stripe: "#b5643c" },
};

/**
 * Bedouin goat-hair tent seen from the front (long side): poles, sagging roof with woven stripes, fluttering front
 * valance, open front with a rug and cushions, guy ropes and stakes. `poles` 1 = a small peaked khaima.
 * `open` 0..1 rolls the front curtain up; `door` leaves a gap in the middle of the curtain.
 */
export const Tent: React.FC<{ x: number; y: number; w?: number; h?: number; t: number; tone?: TentTone; open?: number; poles?: number; door?: boolean; flap?: number }> = ({
  x,
  y,
  w = 640,
  h = 260,
  t,
  tone = "black",
  open = 1,
  poles = 3,
  door = true,
  flap = 1,
}) => {
  const c = TENT[tone];
  const px = Array.from({ length: poles }, (_, i) => (poles === 1 ? 0 : -w / 2 + (w * (i + 0.5)) / poles));
  const topY = (i: number) => -h * (poles === 1 || i === Math.floor(poles / 2) ? 1 : 0.9);
  const edgeY = -h * 0.48;
  // front roof edge: edge -> pole tops (sagging between) -> edge
  const front = (dy = 0) => {
    let d = `M ${-w / 2} ${edgeY + dy}`;
    let prev = { x: -w / 2, y: edgeY + dy };
    const tops = px.map((p, i) => ({ x: p, y: topY(i) + dy }));
    [...tops, { x: w / 2, y: edgeY + dy }].forEach((q) => {
      const cx = (prev.x + q.x) / 2;
      const cy = Math.max(prev.y, q.y) + h * 0.07;
      d += ` Q ${cx} ${cy} ${q.x} ${q.y}`;
      prev = q;
    });
    return d;
  };
  const valH = h * 0.14;
  // valance bottom edge with flutter
  const valPts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const vx = -w / 2 + (w * i) / 24;
    const k = Math.abs(vx) / (w / 2);
    const base = -h * (0.92 - 0.42 * k * k) + valH + h * 0.06;
    valPts.push(`${vx.toFixed(1)} ${(base + Math.sin(t * 3.2 + i * 0.9) * 4 * flap + (i % 2) * 3).toFixed(1)}`);
  }
  const insideTop = -h * 0.74;
  const curtain = 1 - Math.max(0, Math.min(1, open));
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* ground shadow */}
      <ellipse cx={20} cy={6} rx={w * 0.62} ry={26} fill="#5a3418" opacity={0.25} />
      {/* guy ropes + stakes */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * w * 0.47} ${edgeY + 6} L ${sd * (w / 2 + 150)} 4`} stroke="#7a5a3a" strokeWidth={2.5} />
          <path d={`M ${px[sd < 0 ? 0 : px.length - 1]} ${topY(sd < 0 ? 0 : px.length - 1) + 8} L ${sd * (w / 2 + 240)} 6`} stroke="#7a5a3a" strokeWidth={2.5} />
          <path d={`M ${sd * (w / 2 + 150)} 10 l ${sd * 6} -22 M ${sd * (w / 2 + 240)} 12 l ${sd * 6} -22`} stroke="#4a3020" strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
      {/* dark inside */}
      <path d={`M ${-w / 2 + 24} 0 L ${-w / 2 + 34} ${insideTop} L ${w / 2 - 34} ${insideTop} L ${w / 2 - 24} 0 Z`} fill="#1e1410" />
      {/* rug + cushions + a chest */}
      <path d={`M ${-w * 0.36} -4 L ${-w * 0.3} -34 L ${w * 0.3} -34 L ${w * 0.36} -4 Z`} fill="#9a2a22" stroke="#1e1410" strokeWidth={2} />
      {[-0.26, -0.1, 0.06, 0.22].map((k, i) => (
        <path key={i} d={`M ${w * k} -6 L ${w * (k + 0.012)} -32`} stroke={i % 2 ? "#e0b04a" : "#2a6a6a"} strokeWidth={6} opacity={0.8} />
      ))}
      <ellipse cx={-w * 0.2} cy={-40} rx={46} ry={22} fill="#b8822e" stroke="#1e1410" strokeWidth={2} />
      <ellipse cx={w * 0.18} cy={-38} rx={42} ry={20} fill="#2a5a7a" stroke="#1e1410" strokeWidth={2} />
      <rect x={w * 0.26} y={-96} width={60} height={50} rx={6} fill="#5a3a22" stroke="#1e1410" strokeWidth={2} />
      {/* poles inside */}
      {px.map((p, i) => (
        <rect key={i} x={p - 5} y={topY(i) + h * 0.08} width={10} height={-topY(i) - h * 0.08} fill="#6e4a2e" stroke="#1e1410" strokeWidth={2} />
      ))}
      {/* side walls (cloth falling to the ground at both ends) */}
      <path d={`M ${-w / 2} ${edgeY} Q ${-w / 2 - 12} ${edgeY * 0.5} ${-w / 2 - 22} 0 L ${-w / 2 + 40} 0 L ${-w / 2 + 34} ${insideTop + 20} Z`} fill={c.shade} {...st} />
      <path d={`M ${w / 2} ${edgeY} Q ${w / 2 + 12} ${edgeY * 0.5} ${w / 2 + 22} 0 L ${w / 2 - 40} 0 L ${w / 2 - 34} ${insideTop + 20} Z`} fill={c.base} {...st} />
      {/* front curtain panels (roll up with `open`) */}
      {curtain > 0.01 && (
        <g>
          {[-1, 1].map((sd) => {
            const gap = door ? 70 : 0;
            const xa = sd < 0 ? -w / 2 + 34 : gap / 2;
            const xb = sd < 0 ? -gap / 2 : w / 2 - 34;
            const top = insideTop + 10;
            const bot = top + (0 - top) * curtain;
            return (
              <g key={sd}>
                <path d={`M ${xa} ${top} L ${xb} ${top} L ${xb + sd * 4} ${bot} Q ${(xa + xb) / 2} ${bot + 6 + Math.sin(t * 2 + sd) * 4} ${xa} ${bot} Z`} fill={c.base} {...st} />
                {[0.33, 0.66].map((k) => (
                  <path key={k} d={`M ${xa + 6} ${top + (bot - top) * k} L ${xb - 6} ${top + (bot - top) * k}`} stroke={c.stripe} strokeWidth={5} opacity={0.6} />
                ))}
              </g>
            );
          })}
        </g>
      )}
      {/* roof top surface + front valance */}
      <path d={`${front(-h * 0.1)} L ${w / 2} ${edgeY} L ${-w / 2} ${edgeY} Z`} fill={c.light} {...st} />
      <path d={`${front()} L ${valPts[valPts.length - 1]} L ${valPts.slice().reverse().join(" L ")} Z`} fill={c.base} {...st} />
      {/* woven stripes along the roof */}
      <path d={front(-h * 0.05)} fill="none" stroke={c.stripe} strokeWidth={5} opacity={0.55} />
      <path d={front(valH * 0.55)} fill="none" stroke={c.stripe} strokeWidth={4} opacity={0.5} />
      <path d={front(-h * 0.1)} fill="none" stroke={OUT} strokeWidth={3} />
      {/* pole tips through the roof */}
      {px.map((p, i) => (
        <path key={i} d={`M ${p} ${topY(i) + 4} L ${p} ${topY(i) - 14}`} stroke="#6e4a2e" strokeWidth={8} strokeLinecap="round" />
      ))}
      {/* a loose corner flapping in the wind */}
      <path d={`M ${w / 2 - 6} ${edgeY + 6} q ${16 + Math.sin(t * 5) * 10} ${10} ${8 + Math.sin(t * 5 + 1) * 12} ${34}`} fill="none" stroke={c.base} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------ kite (cheel)
const KITE = { body: "#6e4c32", shade: "#4c3322", head: "#c2a47e", streak: "#8a6a4c", beak: "#efc23a", tip: "#241a12", feet: "#efc23a", claw: "#1e1610", window: "#c9b08e" };

type V = { x: number; y: number };
const v = (x: number, y: number): V => ({ x, y });
const P = (p: V) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

/** One wing in side view. e = elevation (1 up .. -1 down); fold 0..1 tucks it in for a dive. */
const SideWing: React.FC<{ e: number; fold: number; far?: boolean }> = ({ e, fold, far }) => {
  const len = (far ? 176 : 190) * (1 - fold * 0.5);
  const sh = far ? v(4, -18) : v(10, -10);
  const flat = 1 - Math.abs(e);
  const tip = v(sh.x - 34 - 70 * flat - fold * 60, sh.y - e * len * 0.95 + 26 * flat);
  const dx = tip.x - sh.x;
  const dy = tip.y - sh.y;
  const L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L;
  let ny = dx / L;
  if (nx < 0) {
    nx = -nx;
    ny = -ny;
  }
  const wrist = v(sh.x + dx * 0.45 + nx * L * 0.14, sh.y + dy * 0.45 + ny * L * 0.14);
  const root = v(-46, 6);
  const trailMid = v((tip.x + root.x) / 2 - nx * L * 0.12, (tip.y + root.y) / 2 - ny * L * 0.12);
  const col = far ? KITE.shade : KITE.body;
  const ux = dx / L;
  const uy = dy / L;
  return (
    <g>
      {/* primary "fingers" at the tip */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i - 2) * 0.16;
        const fxv = ux * Math.cos(a) - uy * Math.sin(a);
        const fyv = ux * Math.sin(a) + uy * Math.cos(a);
        const bx = tip.x - ux * (10 + i * 5) + nx * (i - 2) * 6;
        const by = tip.y - uy * (10 + i * 5) + ny * (i - 2) * 6;
        const fl = (46 - Math.abs(i - 2) * 6) * (1 - fold * 0.6);
        return <path key={i} d={`M ${bx} ${by} L ${bx + fxv * fl} ${by + fyv * fl}`} stroke={KITE.tip} strokeWidth={13 - Math.abs(i - 2)} strokeLinecap="round" />;
      })}
      <path d={`M ${P(sh)} Q ${P(wrist)} ${P(tip)} Q ${P(trailMid)} ${P(root)} Z`} fill={col} {...st} />
      {/* pale coverts band + secondary feather scallops */}
      <path d={`M ${P(v(sh.x + dx * 0.1, sh.y + dy * 0.1))} Q ${P(v(wrist.x - nx * 8, wrist.y - ny * 8))} ${P(v(sh.x + dx * 0.8 + nx * 4, sh.y + dy * 0.8 + ny * 4))}`} fill="none" stroke={far ? KITE.body : KITE.window} strokeWidth={9} opacity={0.55} strokeLinecap="round" />
      {[0.3, 0.45, 0.6, 0.75].map((k) => {
        const qx = tip.x + (root.x - tip.x) * k - nx * 14;
        const qy = tip.y + (root.y - tip.y) * k - ny * 14;
        return <path key={k} d={`M ${qx} ${qy} l ${-nx * 10 + ux * 8} ${-ny * 10 + uy * 8}`} stroke={KITE.tip} strokeWidth={3} opacity={0.5} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** Talons: open (reaching) or closed around something. */
const Talons: React.FC<{ x: number; y: number; open: number }> = ({ x, y, open }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-1, 0, 1].map((i) => (
      <path key={i} d={`M 0 0 q ${i * 10 + 6} ${6 + open * 4} ${i * 14 + 10 - (1 - open) * 10} ${18 - (1 - open) * 6}`} fill="none" stroke={KITE.feet} strokeWidth={6} strokeLinecap="round" />
    ))}
    {[-1, 0, 1].map((i) => (
      <circle key={i} cx={i * 14 + 10 - (1 - open) * 10} cy={18 - (1 - open) * 6} r={3} fill={KITE.claw} />
    ))}
    <path d={`M 0 0 q -10 6 -14 16`} fill="none" stroke={KITE.feet} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/**
 * Kite (cheel, black kite) for the sky and the swoop. view "side": profile flying to the right (flip = left), wings
 * flap (`flap` 0 glide .. 1 strong), `fold` tucks them for a dive, `talons` 0 tucked .. 1 reaching forward-down with
 * `grab` 0 open .. 1 closed; `held` is drawn in the talons (local coords at the feet). view "below": the classic
 * soaring silhouette seen from the ground (head up), `heading` in degrees.
 */
export const Cheel: React.FC<{
  x: number;
  y: number;
  s?: number;
  t: number;
  view?: "side" | "below";
  flip?: boolean;
  flap?: number;
  fold?: number;
  talons?: number;
  grab?: number;
  held?: React.ReactNode;
  rot?: number;
  heading?: number;
  speed?: number;
}> = ({ x, y, s = 1, t, view = "side", flip, flap = 1, fold = 0, talons = 0, grab = 1, held, rot = 0, heading = 0, speed = 1 }) => {
  if (view === "below") {
    const e = Math.sin(t * 2 * Math.PI * 1.6 * speed) * flap;
    const span = 1 - Math.abs(e) * 0.22;
    const wingB = (sd: 1 | -1) => {
      const tip = v(sd * 210 * span, -24 + e * 46);
      const wr = v(sd * 96 * span, -40 + e * 18);
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${tip.x - sd * (8 + i * 6)} ${tip.y + i * 7 - 6} l ${sd * (30 - i * 3)} ${-4 + i * 6}`} stroke={KITE.tip} strokeWidth={11} strokeLinecap="round" />
          ))}
          <path d={`M ${sd * 10} -16 Q ${P(wr)} ${P(tip)} Q ${sd * 150 * span} ${30 + e * 30} ${sd * 14} 22 Z`} fill={KITE.body} {...st} />
          <path d={`M ${sd * 120 * span} ${-14 + e * 30} q ${sd * 30} 0 ${sd * 56} ${-4 + e * 6}`} stroke={KITE.window} strokeWidth={14} strokeLinecap="round" opacity={0.75} />
        </g>
      );
    };
    return (
      <g transform={`translate(${x} ${y}) rotate(${heading}) scale(${s})`}>
        {wingB(-1)}
        {wingB(1)}
        <path d="M -12 30 L -34 112 L 0 96 L 34 112 L 12 30 Z" fill={KITE.shade} {...st} />
        <ellipse cx={0} cy={4} rx={20} ry={44} fill={KITE.body} {...st} />
        <circle cx={0} cy={-50} r={16} fill={KITE.head} {...st} />
        <path d="M -5 -64 L 0 -76 L 5 -64 Z" fill={KITE.beak} stroke={OUT} strokeWidth={2} />
      </g>
    );
  }
  const phase = t * 2 * Math.PI * 2.2 * speed;
  const e = fold > 0.5 ? 0.55 : flap > 0.05 ? Math.sin(phase) * 0.85 * flap + 0.12 * (1 - flap) : 0.28 + Math.sin(t * 1.3) * 0.05;
  const footX = 10 + talons * 46;
  const footY = 24 + talons * 34;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${rot})`}>
      <SideWing e={e * 0.92} fold={fold} far />
      {/* forked, barred tail */}
      <path d="M -50 -9 L -142 -24 L -116 -1 L -142 20 L -50 8 Z" fill={KITE.shade} {...st} />
      <path d="M -84 -14 L -82 10 M -108 -18 L -106 14" stroke={KITE.window} strokeWidth={3} opacity={0.5} />
      {/* legs + talons */}
      {(talons > 0.02 || held) && (
        <g>
          <path d={`M 6 12 Q ${footX * 0.6} ${footY * 0.7} ${footX} ${footY}`} fill="none" stroke={KITE.feet} strokeWidth={8} strokeLinecap="round" />
          {held && <g transform={`translate(${footX + 8} ${footY + 12})`}>{held}</g>}
          <Talons x={footX} y={footY} open={1 - grab} />
        </g>
      )}
      {/* body */}
      <path d="M -60 -6 Q -22 -32 30 -22 Q 58 -16 64 -2 Q 54 18 20 20 Q -30 22 -60 6 Z" fill={KITE.body} {...st} />
      {[-30, -12, 6, 22].map((bx, i) => (
        <path key={i} d={`M ${bx} ${6 + (i % 2) * 3} l 9 3`} stroke={KITE.streak} strokeWidth={3} strokeLinecap="round" />
      ))}
      {/* head, eye, hooked beak */}
      <circle cx={60} cy={-12} r={20} fill={KITE.head} {...st} />
      <path d="M 46 -16 q 8 4 22 2" fill="none" stroke={KITE.streak} strokeWidth={3} />
      <path d="M 76 -20 Q 94 -20 96 -8 Q 96 2 89 4 Q 89 -3 83 -6 L 76 -8 Z" fill={KITE.beak} {...st} strokeWidth={3} />
      <path d="M 92 -6 Q 96 0 89 4" fill="none" stroke={KITE.tip} strokeWidth={4} strokeLinecap="round" />
      <circle cx={66} cy={-16} r={6} fill="#f2d24a" stroke={OUT} strokeWidth={2} />
      <circle cx={67.5} cy={-16} r={3.2} fill="#120c08" />
      <circle cx={66} cy={-18} r={1.3} fill="#ffffff" />
      <SideWing e={e} fold={fold} />
    </g>
  );
};

/** Soft shadow of the kite on the ground (stretched, blurred). */
export const CheelShadow: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number; t?: number }> = ({ x, y, s = 1, o = 0.32, rot = -90, t = 0 }) => {
  const e = Math.sin(t * 2 * Math.PI * 1.4) * 0.6;
  const span = 1 - Math.abs(e) * 0.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * 0.42}) rotate(${rot})`} opacity={o} filter="url(#blur6)">
      <path d={`M -10 -16 Q ${-96 * span} ${-40 + e * 18} ${-210 * span} ${-24 + e * 40} Q ${-150 * span} 30 -14 22 Z M 10 -16 Q ${96 * span} ${-40 + e * 18} ${210 * span} ${-24 + e * 40} Q ${150 * span} 30 14 22 Z`} fill="#1a0a04" />
      <path d="M -14 30 L -34 112 L 0 96 L 34 112 L 14 30 Z" fill="#1a0a04" />
      <ellipse cx={0} cy={0} rx={22} ry={50} fill="#1a0a04" />
    </g>
  );
};

// ------------------------------------------------------------------ red leather sash (wishah) with stones
/**
 * Red leather band made of strips, with small stones. mode "lie" = relaxed S on the ground; "hang" = hanging from
 * (x, y) (talons, a hand) and waving, `drag` pulls it back in flight; "fall" = tumbling and fluttering (rot);
 * "held" = a loop between two fists `w` apart (front close-ups). `glint` 0..1 makes the stones sparkle.
 */
export const RedSash: React.FC<{ x: number; y: number; t: number; s?: number; mode?: "lie" | "hang" | "fall" | "held"; rot?: number; drag?: number; glint?: number; len?: number; w?: number }> = ({
  x,
  y,
  t,
  s = 1,
  mode = "lie",
  rot = 0,
  drag = 0,
  glint = 0,
  len = 260,
  w = 240,
}) => {
  const L = len * s;
  const N = 26;
  const pts: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    let p: V;
    if (mode === "lie") p = v(x + (u - 0.5) * L, y + Math.sin(u * Math.PI * 1.6 + 0.4) * 16 * s + (u - 0.5) * 8 * s);
    else if (mode === "hang") p = v(x + Math.sin(u * 4 - t * 9) * 14 * s * u - drag * u * L * 0.7, y + u * L * (1 - 0.45 * Math.abs(drag)));
    else if (mode === "held") p = v(x + (u - 0.5) * w * s, y + Math.sin(u * Math.PI) * 70 * s + Math.sin(t * 3 + u * 5) * 4 * s);
    else {
      const lx = (u - 0.5) * L * 0.85;
      const ly = Math.sin(u * Math.PI * 2 + t * 12) * 24 * s;
      const r = (rot * Math.PI) / 180;
      p = v(x + lx * Math.cos(r) - ly * Math.sin(r), y + lx * Math.sin(r) + ly * Math.cos(r));
    }
    pts.push(p);
  }
  let d = `M ${P(pts[0])}`;
  for (let i = 1; i < pts.length - 1; i++) d += ` Q ${P(pts[i])} ${P(v((pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2))}`;
  d += ` L ${P(pts[pts.length - 1])}`;
  const wR = 30 * s;
  const gems = [0.12, 0.27, 0.42, 0.57, 0.72, 0.87];
  const gemCol = ["#3ac8c0", "#f2c84a", "#f6f0e0"];
  const end = (p: V, q: V) => {
    const ang = Math.atan2(p.y - q.y, p.x - q.x);
    return [-1, 0, 1].map((k) => (
      <path key={k} d={`M ${P(p)} l ${Math.cos(ang + k * 0.35) * 22 * s} ${Math.sin(ang + k * 0.35) * 22 * s}`} stroke="#8a0e18" strokeWidth={5 * s} strokeLinecap="round" />
    ));
  };
  return (
    <g>
      {mode === "lie" && <path d={d} transform={`translate(${5 * s} ${8 * s})`} fill="none" stroke="#3a1a0a" strokeWidth={wR + 4 * s} strokeLinecap="round" opacity={0.25} filter="url(#blur3)" />}
      {end(pts[0], pts[1])}
      {end(pts[N], pts[N - 1])}
      <path d={d} fill="none" stroke={OUT} strokeWidth={wR + 7 * s} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#a8121c" strokeWidth={wR} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#d8222e" strokeWidth={wR * 0.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#ff6a6a" strokeWidth={wR * 0.14} strokeLinecap="round" opacity={0.8} />
      <path d={d} fill="none" stroke="#6a0a10" strokeWidth={2 * s} strokeDasharray={`${6 * s} ${7 * s}`} transform={`translate(0 ${wR * 0.3})`} opacity={0.7} />
      {gems.map((g, i) => {
        const p = pts[Math.round(g * N)];
        const tw = glint > 0 ? Math.max(0, Math.sin(t * 5 + i * 1.7)) * glint : 0;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={6.5 * s} fill={gemCol[i % 3]} stroke={OUT} strokeWidth={2 * s} />
            <circle cx={p.x - 2 * s} cy={p.y - 2 * s} r={2 * s} fill="#ffffff" />
            {tw > 0.05 && (
              <path d={`M ${p.x} ${p.y - 26 * s * tw} L ${p.x + 4 * s} ${p.y} L ${p.x} ${p.y + 26 * s * tw} L ${p.x - 4 * s} ${p.y} Z M ${p.x - 26 * s * tw} ${p.y} L ${p.x} ${p.y - 4 * s} L ${p.x + 26 * s * tw} ${p.y} L ${p.x} ${p.y + 4 * s} Z`} fill="#fffbe0" opacity={tw} />
            )}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ sand puff (something lands, a foot skids)
export const SandPuff: React.FC<{ x: number; y: number; age: number; s?: number }> = ({ x, y, age, s = 1 }) => {
  if (age < 0 || age > 34) return null;
  const k = age / 34;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - k}>
      {[-1, 1].map((sd) => (
        <ellipse key={sd} cx={sd * (30 + k * 120)} cy={-10 - k * 30} rx={50 + k * 70} ry={24 + k * 30} fill="#e9c896" opacity={0.6} />
      ))}
      <ellipse cx={0} cy={-20 - k * 50} rx={40 + k * 60} ry={26 + k * 30} fill="#f2d8ac" opacity={0.5} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = Math.PI * (0.1 + 0.8 * rnd(i, 4.3));
        const sp = 7 + rnd(i, 7.7) * 7;
        const gx = Math.cos(a) * sp * age * (i % 2 ? 1 : -1);
        const gy = -Math.sin(a) * sp * age + 0.45 * age * age;
        return gy < 10 ? <circle key={i} cx={gx} cy={gy} r={3 + (i % 3)} fill="#c89a5e" /> : null;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ drop spindle (takli) hanging from a hand
/** Hanging drop spindle with a wool cop: thread from (x, y) down `len`, whorl spins. Draw it level (world space). */
export const Spindle: React.FC<{ x: number; y: number; t: number; s?: number; len?: number; spin?: number }> = ({ x, y, t, s = 1, len = 150, spin = 1 }) => {
  const sw = Math.sin(t * 1.4) * 4;
  const a = t * 16 * spin;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M 0 0 Q ${sw * 0.5} ${len * 0.5} ${sw} ${len}`} fill="none" stroke="#efe4cc" strokeWidth={2.5} />
      <g transform={`translate(${sw} ${len})`}>
        <path d="M 0 -6 L 0 104" stroke="#8a5a36" strokeWidth={7} strokeLinecap="round" />
        <ellipse cx={0} cy={30} rx={15} ry={26} fill="#efe4cc" stroke={OUT} strokeWidth={3} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${Math.sin(a + i * 2.1) * 13} 10 Q ${Math.sin(a + i * 2.1 + 0.6) * 15} 30 ${Math.sin(a + i * 2.1 + 1.2) * 13} 50`} fill="none" stroke="#d6c8a8" strokeWidth={2} />
        ))}
        <ellipse cx={0} cy={82} rx={28} ry={9} fill="#b5643c" stroke={OUT} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={Math.sin(a + i * 1.57) * 22} cy={82 + Math.cos(a + i * 1.57) * 2} r={3} fill="#f2c84a" opacity={Math.cos(a + i * 1.57) > 0 ? 1 : 0.35} />
        ))}
      </g>
    </g>
  );
};

/** Helper for films: position along a straight swoop with an ease (k 0..1). */
export const swoop = (a: V, b: V, k: number, arc = 0) => v(mix(a.x, b.x, k), mix(a.y, b.y, k) - Math.sin(k * Math.PI) * arc);
