// Garden / orchard world + open-sky weather (built for "baadal-aur-baagh-ka-raaz", reusable).
// Rain cloud (no face, ever), grass tufts that bend in the wind, a water channel that fills along a path,
// orchard fruit trees, harvest baskets, a butterfly and garden soil beds. Everything moves by itself via `t`.

import React from "react";
import { LINE, OUT } from "../kit";

const st = { stroke: OUT, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const rnd = (i: number) => ((((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1);

/**
 * Big rain cloud. `dark` 0..1 (white → grey rain cloud), `rain` 0..1 (rain shafts falling to `rainTo` px below
 * the cloud), `pulse` 0..1 = soft rings spreading out of the cloud (a voice heard in it; no face or figure).
 */
export const RainCloud: React.FC<{ x: number; y: number; s?: number; t: number; dark?: number; rain?: number; rainTo?: number; pulse?: number; w?: number }> = ({
  x,
  y,
  s = 1,
  t,
  dark = 0.3,
  rain = 0,
  rainTo = 1400,
  pulse = 0,
  w = 1,
}) => {
  const mixC = (a: [number, number, number], b: [number, number, number], k: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
  const top = mixC([255, 255, 255], [196, 204, 218], dark);
  const mid = mixC([236, 240, 247], [158, 168, 186], dark);
  const low = mixC([206, 214, 228], [118, 128, 148], dark);
  const puffs: [number, number, number][] = [
    [-330, 40, 130],
    [-200, -40, 170],
    [-20, -100, 210],
    [170, -50, 180],
    [320, 30, 140],
    [-90, 40, 160],
    [120, 50, 150],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * w} ${s})`}>
      {rain > 0.01 && (
        <g opacity={Math.min(1, rain * 1.4)}>
          <path d={`M -360 90 L 360 90 L ${420} ${rainTo} L ${-300} ${rainTo} Z`} fill={low} opacity={0.28 * rain} />
          {Array.from({ length: Math.round(70 * rain) + 6 }, (_, i) => {
            const sp = 1700 + (i % 5) * 300;
            const yy = 90 + ((t * sp + i * 311) % rainTo);
            const xx = -360 + rnd(i) * 720 + (yy - 90) * 0.08;
            const l = 60 + (i % 4) * 18;
            return yy < rainTo ? <path key={i} d={`M ${xx} ${yy} l ${-l * 0.08} ${-l}`} stroke={i % 3 ? "#dfe8f6" : "#ffffff"} strokeWidth={i % 4 ? 3 : 4.5} strokeLinecap="round" opacity={0.85} /> : null;
          })}
        </g>
      )}
      {pulse > 0.01 &&
        [0, 1, 2].map((i) => {
          const k = ((t * 0.9 + i / 3) % 1);
          return <ellipse key={i} cx={0} cy={-10} rx={380 + k * 420} ry={190 + k * 210} fill="none" stroke="#fff6d8" strokeWidth={10 * (1 - k)} opacity={pulse * (1 - k) * 0.7} />;
        })}
      {/* body: low shade, then puffs with soft tops */}
      <path d="M -440 70 Q -460 140 -360 150 L 380 150 Q 470 140 440 60 Z" fill={low} {...st} />
      {puffs.map(([px, py, r], i) => {
        const wob = Math.sin(t * 0.7 + i * 1.7) * 6;
        return <circle key={i} cx={px + wob} cy={py - wob * 0.5} r={r + Math.sin(t * 0.5 + i) * 4} fill={i % 2 ? mid : top} {...st} />;
      })}
      {/* inner overlap (hides outlines inside the body) */}
      <ellipse cx={0} cy={40} rx={380} ry={100} fill={mid} />
      <path d="M -400 110 Q 0 160 400 110 L 400 150 L -400 150 Z" fill={low} />
      <path d="M -440 70 Q -460 140 -360 150 L 380 150 Q 470 140 440 60" fill="none" {...st} />
      {/* highlights */}
      {[[-200, -120, 70], [-20, -200, 90], [170, -140, 60]].map(([hx, hy, r], i) => (
        <path key={i} d={`M ${hx - r} ${hy + 30} Q ${hx} ${hy - 20} ${hx + r} ${hy + 20}`} fill="none" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" opacity={0.7 * (1 - dark * 0.6)} />
      ))}
    </g>
  );
};

/** Row of grass tufts on a ground line; bend with `wind` (degrees) and quiver by themselves. `dry` = straw colour. */
export const GrassTufts: React.FC<{ x0: number; x1: number; y: number; t: number; n?: number; wind?: number; dry?: number; s?: number; spread?: number }> = ({
  x0,
  x1,
  y,
  t,
  n = 14,
  wind = 8,
  dry = 1,
  s = 1,
  spread = 120,
}) => {
  const c1 = dry > 0.5 ? "#c9a24e" : "#6f9a3a";
  const c2 = dry > 0.5 ? "#a98234" : "#557d2a";
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + rnd(i + 3) * (x1 - x0);
        const yy = y + rnd(i + 9) * spread;
        const sc = s * (0.7 + rnd(i + 5) * 0.6);
        const bend = wind + Math.sin(t * 2.4 + i * 1.3) * 6;
        return (
          <g key={i} transform={`translate(${x} ${yy}) scale(${sc})`}>
            {[-2, -1, 0, 1, 2].map((b) => {
              const h = 70 - Math.abs(b) * 12;
              const a = ((b * 14 + bend * (1 + Math.abs(b) * 0.1)) * Math.PI) / 180;
              return <path key={b} d={`M ${b * 5} 0 Q ${b * 8 + Math.sin(a) * h * 0.5} ${-h * 0.55} ${b * 6 + Math.sin(a) * h} ${-Math.cos(a) * h}`} fill="none" stroke={b % 2 ? c2 : c1} strokeWidth={6} strokeLinecap="round" />;
            })}
          </g>
        );
      })}
    </g>
  );
};

/**
 * Narrow water channel (naali) along an SVG path `d`. `flow` 0..1 = how far the water has run along it;
 * the water shimmers and its highlights stream downhill (`speed`). `w` = water width. Leave `flow` at 1 for a full channel.
 */
export const WaterChannel: React.FC<{ d: string; t: number; w?: number; flow?: number; speed?: number; bank?: string; bed?: string; water?: string; edge?: number }> = ({
  d,
  t,
  w = 60,
  flow = 1,
  speed = 1,
  bank = "#8a6a48",
  bed = "#5a4330",
  water = "#7cc4e4",
  edge = 36,
}) => {
  const k = Math.max(0, Math.min(1, flow));
  const id = `wch-${React.useId().replace(/:/g, "")}`;
  return (
    <g>
      <path d={d} fill="none" stroke={OUT} strokeWidth={w + edge + 8} strokeLinecap="round" />
      <path d={d} fill="none" stroke={bank} strokeWidth={w + edge} strokeLinecap="round" />
      <path d={d} fill="none" stroke={bed} strokeWidth={w + 8} strokeLinecap="round" />
      {k > 0 && (
        <>
          <path d={d} pathLength={1000} fill="none" stroke={water} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${k * 1000} 1000`} />
          <path d={d} pathLength={1000} fill="none" stroke="#bfe6f6" strokeWidth={w * 0.32} strokeLinecap="round" strokeDasharray={`${k * 1000} 1000`} opacity={0.55} />
          <mask id={id} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={12000} height={12000}>
            <path d={d} pathLength={1000} fill="none" stroke="#fff" strokeWidth={w} strokeDasharray={`${k * 1000} 1000`} />
          </mask>
          <path d={d} pathLength={1000} fill="none" stroke="#ffffff" strokeWidth={w * 0.16} strokeLinecap="round" strokeDasharray="14 46" strokeDashoffset={-t * 90 * speed} opacity={0.75} mask={`url(#${id})`} />
        </>
      )}
    </g>
  );
};

export type OrchardKind = "pomegranate" | "lemon" | "fig";
const FRUIT: Record<OrchardKind, string> = { pomegranate: "#c8323a", lemon: "#f0cf3a", fig: "#7a3f6a" };

/** Round orchard fruit tree. `sway` in degrees, `drip` 0..1 = rain drops falling from the leaves. */
export const OrchardTree: React.FC<{ x: number; y: number; s?: number; t: number; kind?: OrchardKind; sway?: number; drip?: number; seed?: number }> = ({
  x,
  y,
  s = 1,
  t,
  kind = "pomegranate",
  sway = 0,
  drip = 0,
  seed = 0,
}) => {
  const a = sway + Math.sin(t * 1.1 + seed) * 1.6;
  const blobs: [number, number, number, string][] = [
    [-150, -360, 130, "#4f7d34"],
    [140, -370, 135, "#4f7d34"],
    [0, -470, 170, "#5f9140"],
    [-80, -300, 120, "#6aa048"],
    [90, -300, 120, "#6aa048"],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={200} ry={26} fill="#2e3a1a" opacity={0.25} />
      <path d="M -26 0 Q -18 -140 -30 -250 L 30 -250 Q 18 -140 28 0 Z" fill="#7a5134" {...st} />
      <path d="M -6 -200 Q -60 -250 -110 -280 M 8 -210 Q 60 -260 110 -290" fill="none" stroke="#7a5134" strokeWidth={18} strokeLinecap="round" />
      <path d="M -8 -40 Q -4 -120 -12 -220" fill="none" stroke="#5a3a22" strokeWidth={5} />
      <g transform={`rotate(${a} 0 -240)`}>
        {blobs.map(([bx, by, r, c], i) => (
          <circle key={i} cx={bx + Math.sin(t * 1.6 + i + seed) * 3} cy={by} r={r} fill={c} {...st} />
        ))}
        {/* leaf texture + fruit */}
        {Array.from({ length: 16 }, (_, i) => {
          const fx = -200 + rnd(i + seed * 7) * 400;
          const fy = -560 + rnd(i + 40 + seed) * 320;
          return <path key={i} d={`M ${fx} ${fy} q 12 -10 24 0`} fill="none" stroke="#3e6628" strokeWidth={5} strokeLinecap="round" />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const fx = -170 + rnd(i * 3 + 1 + seed) * 340;
          const fy = -520 + rnd(i * 5 + 2 + seed) * 280;
          return (
            <g key={i}>
              <circle cx={fx} cy={fy} r={20} fill={FRUIT[kind]} {...st} strokeWidth={3} />
              <circle cx={fx - 6} cy={fy - 6} r={5} fill="#ffffff" opacity={0.5} />
            </g>
          );
        })}
      </g>
      {drip > 0.01 &&
        Array.from({ length: 6 }, (_, i) => {
          const per = 0.9 + (i % 3) * 0.3;
          const k = ((t + i * 0.37) % per) / per;
          const dx = -180 + rnd(i + 70 + seed) * 360;
          return <path key={i} d={`M ${dx} ${-260 + k * 260} q 6 10 0 16 q -6 -6 0 -16 Z`} fill="#cfe9f8" stroke="#6aa9c8" strokeWidth={2} opacity={drip * (1 - k * 0.6)} />;
        })}
    </g>
  );
};

export type BasketKind = "pomegranate" | "dates" | "grain";

/** Woven harvest basket heaped with produce. `glow` 0..1 = warm focus light behind it (for "this one" beats). */
export const HarvestBasket: React.FC<{ x: number; y: number; s?: number; t?: number; kind?: BasketKind; glow?: number; lift?: number }> = ({ x, y, s = 1, t = 0, kind = "pomegranate", glow = 0, lift = 0 }) => {
  const heap = () => {
    if (kind === "grain")
      return (
        <g>
          <path d="M -110 -70 Q 0 -170 110 -70 Z" fill="#e2bd62" {...st} />
          {Array.from({ length: 18 }, (_, i) => (
            <ellipse key={i} cx={-80 + rnd(i) * 160} cy={-80 - rnd(i + 20) * 60 * (1 - Math.abs(-80 + rnd(i) * 160) / 130)} rx={6} ry={3.5} fill="#b88a32" />
          ))}
          {/* a few seedlings: a third goes back into the garden */}
          {[-40, 10, 55].map((sx, i) => (
            <g key={i} transform={`translate(${sx} -110) rotate(${Math.sin(t * 2 + i) * 6})`}>
              <path d="M 0 0 L 0 -50" stroke="#4f7d34" strokeWidth={6} strokeLinecap="round" />
              <path d="M 0 -30 Q -26 -44 -30 -24 Q -12 -20 0 -30 Z M 0 -44 Q 24 -60 30 -40 Q 12 -34 0 -44 Z" fill="#6aa048" {...st} strokeWidth={2.5} />
            </g>
          ))}
        </g>
      );
    if (kind === "dates")
      return (
        <g>
          {Array.from({ length: 16 }, (_, i) => {
            const row = Math.floor(i / 6);
            const dx = -95 + (i % 6) * 38 + row * 18;
            const dy = -80 - row * 30;
            return <ellipse key={i} cx={dx} cy={dy} rx={16} ry={24} transform={`rotate(${(i % 3) * 20 - 20} ${dx} ${dy})`} fill={i % 2 ? "#7a3a1e" : "#8e4824"} {...st} strokeWidth={3} />;
          })}
        </g>
      );
    return (
      <g>
        {[[-70, -86], [-20, -96], [30, -92], [78, -84], [-45, -130], [5, -138], [52, -128], [-10, -172]].map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={30} fill={i % 3 ? "#c8323a" : "#b02a32"} {...st} strokeWidth={3} />
            <path d={`M ${px - 6} ${py - 30} l 6 -10 l 6 10`} fill="#b02a32" {...st} strokeWidth={2.5} />
            <circle cx={px - 9} cy={py - 9} r={7} fill="#fff" opacity={0.4} />
          </g>
        ))}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y - lift}) scale(${s})`}>
      {glow > 0.01 && <ellipse cx={0} cy={-80} rx={210} ry={170} fill="#fff0b8" opacity={glow * 0.55} />}
      <ellipse cx={0} cy={lift / s + 4} rx={150} ry={24} fill="#3a2614" opacity={0.25} />
      {heap()}
      <path d="M -140 -80 Q -150 0 -100 10 L 100 10 Q 150 0 140 -80 Z" fill="#c9a060" {...st} />
      <path d="M -146 -82 Q 0 -60 146 -82" fill="none" stroke="#9a7440" strokeWidth={16} strokeLinecap="round" />
      <path d="M -146 -82 Q 0 -60 146 -82" fill="none" stroke={OUT} strokeWidth={3} />
      {[-50, -24].map((yy) => (
        <path key={yy} d={`M -140 ${yy} Q 0 ${yy + 14} 140 ${yy}`} fill="none" stroke="#9a7440" strokeWidth={5} />
      ))}
      {[-90, -45, 0, 45, 90].map((xx) => (
        <path key={xx} d={`M ${xx} -70 L ${xx * 0.8} 6`} stroke="#9a7440" strokeWidth={4} />
      ))}
    </g>
  );
};

/** Butterfly flying a looping path from (x, y); `t` seconds. `path` = how far it wanders (px). */
export const Butterfly: React.FC<{ x: number; y: number; t: number; s?: number; path?: number; color?: string; seed?: number }> = ({ x, y, t, s = 1, path = 300, color = "#f2a23a", seed = 0 }) => {
  const px = x + Math.sin(t * 0.8 + seed) * path + t * 40;
  const py = y + Math.sin(t * 1.9 + seed) * path * 0.3 + Math.sin(t * 6) * 10;
  const flap = Math.abs(Math.cos(t * 22 + seed));
  const dir = Math.cos(t * 0.8 + seed) >= 0 ? 1 : -1;
  return (
    <g transform={`translate(${px} ${py}) scale(${s * dir} ${s})`}>
      <g transform={`scale(${0.25 + flap * 0.75} 1)`}>
        <path d="M 0 0 Q -46 -52 -60 -18 Q -58 6 0 0 Z M 0 0 Q -40 30 -30 44 Q -12 46 0 0 Z" fill={color} {...st} strokeWidth={2.5} />
        <path d="M 0 0 Q 46 -52 60 -18 Q 58 6 0 0 Z M 0 0 Q 40 30 30 44 Q 12 46 0 0 Z" fill={color} {...st} strokeWidth={2.5} />
        <circle cx={-34} cy={-20} r={7} fill="#fff4dc" />
        <circle cx={34} cy={-20} r={7} fill="#fff4dc" />
      </g>
      <ellipse cx={0} cy={6} rx={5} ry={22} fill="#3d2a1e" />
      <path d="M 0 -14 Q -8 -30 -14 -34 M 0 -14 Q 8 -30 14 -34" fill="none" stroke="#3d2a1e" strokeWidth={2.5} />
    </g>
  );
};

/** Garden soil with planted beds: dark wet earth, raised furrows with small plants that sway. Ground line `y`. */
export const SoilBeds: React.FC<{ x0: number; x1: number; y: number; t: number; rows?: number; wet?: number }> = ({ x0, x1, y, t, rows = 4, wet = 0.6 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={1800} fill="#7a5a3a" />
    <rect x={x0} y={y} width={x1 - x0} height={1800} fill="#3a2a1a" opacity={wet * 0.35} />
    {Array.from({ length: rows }, (_, r) => {
      const yy = y + 50 + r * 120 * (1 + r * 0.25);
      return (
        <g key={r}>
          <path d={`M ${x0} ${yy} Q ${(x0 + x1) / 2} ${yy - 20} ${x1} ${yy} L ${x1} ${yy + 30} Q ${(x0 + x1) / 2} ${yy + 10} ${x0} ${yy + 30} Z`} fill="#8e6a44" stroke={OUT} strokeWidth={3} />
          {Array.from({ length: Math.round((x1 - x0) / 110) }, (_, i) => {
            const px = x0 + 50 + i * 110 + (r % 2) * 50;
            return (
              <g key={i} transform={`translate(${px} ${yy - 4}) scale(${0.7 + r * 0.2}) rotate(${Math.sin(t * 1.8 + i * 0.7 + r) * 7})`}>
                <path d="M 0 0 L 0 -34" stroke="#4f7d34" strokeWidth={5} strokeLinecap="round" />
                <path d="M 0 -20 Q -22 -34 -26 -14 Q -10 -10 0 -20 Z M 0 -30 Q 22 -46 26 -26 Q 10 -22 0 -30 Z" fill="#6aa048" stroke={OUT} strokeWidth={2} />
              </g>
            );
          })}
        </g>
      );
    })}
  </g>
);
