// 2D cartoon demo: "Pyase Kutte Ki Kahani" in 5 shots, showing walk cycle,
// facial expressions, kneeling/pouring/drinking actions and film camerawork
// (pan, push-in, pull-out, tilt) with multi-layer parallax.

import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Dog2D, type DogPose } from "./Dog2D";
import { blink, clamp01, kf } from "./kit";
import { BASE_POSE, Musafir, type MusafirPose } from "./Musafir";
import { Clouds, FarMountains, GROUND_Y, Grass, Ground, MidDunes, Palm, Rock, Sky, Sun, Well } from "./Scenery";

export const DEMO_2D_FRAMES = 690;
const W = 1920;
const H = 1080;

type Cam = { x: number; y: number; zoom: number };

/** Parallax layer: depth 0 = sky (fixed), 1 = action plane, >1 = foreground. */
const Layer: React.FC<{ cam: Cam; depth: number; children: React.ReactNode }> = ({ cam, depth, children }) => {
  const z = 1 + (cam.zoom - 1) * depth;
  const tx = -cam.x * depth - (W / 2) * (1 - depth);
  const ty = -cam.y * depth - (H / 2) * (1 - depth);
  return <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${tx} ${ty})`}>{children}</g>;
};

// ---------------------------------------------------------------- shot timing
const A = 0; // establishing walk
const B = 150; // close-up: thirst
const C = 240; // sees the dog, camera pans
const D = 390; // gives water
const E = 570; // happy dog, pull-out to sky
const END = DEMO_2D_FRAMES;

const shotCam = (f: number): Cam => {
  if (f < B) return { x: kf(f, [[A, 880], [B, 1260]]), y: 560, zoom: kf(f, [[A, 0.92], [B, 1.0]]) };
  if (f < C) return { x: 1352, y: kf(f, [[B, 470], [C, 482]]), zoom: kf(f, [[B, 2.3], [C, 2.85]]) };
  if (f < D)
    return {
      x: kf(f, [[C, 1420], [C + 40, 1420], [C + 105, 2560], [D, 2580]]),
      y: kf(f, [[C, 560], [C + 40, 560], [C + 105, 660], [D, 660]]),
      zoom: kf(f, [[C, 1.45], [C + 40, 1.45], [C + 105, 1.75], [D, 1.8]]),
    };
  if (f < E) return { x: kf(f, [[D, 2470], [E, 2485]]), y: kf(f, [[D, 610], [E, 640]]), zoom: kf(f, [[D, 1.3], [E, 1.6]]) };
  return {
    x: kf(f, [[E, 2470], [E + 50, 2470], [END, 2300]]),
    y: kf(f, [[E, 690], [E + 50, 690], [END, 330]]),
    zoom: kf(f, [[E, 2.5], [E + 50, 2.5], [END, 0.95]]),
  };
};

// ---------------------------------------------------------------- acting
const musafirAt = (f: number): { x: number; flip: boolean; pose: MusafirPose } => {
  const time = f / 30;
  const base = { ...BASE_POSE, time, eyeOpen: blink(f) };
  if (f < B) {
    const x = kf(f, [[A, 640], [B, 1340]], (t) => t);
    return {
      x,
      flip: false,
      pose: { ...base, walk: 1, step: (x / 70) * Math.PI, lean: 9, headTilt: 8, armF: [Math.sin((x / 70) * Math.PI) * 14, 14], armB: [-Math.sin((x / 70) * Math.PI) * 14, 10], eyeOpen: 0.55 * blink(f), brow: -0.6, mouth: "pant" },
    };
  }
  if (f < C) {
    const wipe = clamp01(kf(f, [[B + 40, 0], [B + 55, 1], [B + 75, 1], [B + 88, 0]]));
    return {
      x: 1340,
      flip: false,
      pose: {
        ...base,
        lean: 7,
        headTilt: 10 - wipe * 8,
        eyeOpen: (0.42 + wipe * 0.1) * blink(f, 20),
        brow: -0.9,
        mouth: "pant",
        armF: [10 + wipe * 168, 12 + wipe * 98],
        sweat: ((f - B) % 45) / 45,
        look: 0,
      },
    };
  }
  if (f < D) {
    const notice = clamp01(kf(f, [[C + 20, 0], [C + 34, 1]]));
    const sad = clamp01(kf(f, [[C + 110, 0], [C + 130, 1]]));
    return {
      x: 1340,
      flip: false,
      pose: {
        ...base,
        lean: 4 - notice * 4,
        headTilt: 6 - notice * 6,
        eyeOpen: (0.5 + notice * 0.5) * blink(f, 40),
        brow: notice * 0.8 - sad * 1.6,
        mouth: sad > 0.5 ? "sad" : notice > 0.5 ? "open" : "pant",
        look: 1,
        armF: [notice * 70 * (1 - sad), notice * 20],
      },
    };
  }
  const pourOn = f > D + 28;
  const k = clamp01(kf(f, [[D, 0.75], [D + 18, 1]]));
  const smile = clamp01(kf(f, [[D + 90, 0], [D + 110, 1]]));
  return {
    x: 2340,
    flip: false,
    pose: {
      ...base,
      kneel: k,
      lean: 22,
      headTilt: 16,
      eyeOpen: (0.75 + smile * 0.15) * blink(f, 7),
      brow: -0.3 + smile * 0.8,
      mouth: smile > 0.5 ? "smile" : "neutral",
      look: 0.6,
      armF: [kf(f, [[D, 30], [D + 25, 62]]), kf(f, [[D, 30], [D + 25, 18]])],
      armB: [28, 30],
      khuff: "hand",
      pour: pourOn && f < E - 10,
    },
  };
};

const dogAt = (f: number): { x: number; pose: DogPose } => {
  const time = f / 30;
  const base: DogPose = { lie: 1, headDown: 0.25, headUp: 0, tongue: 1, pant: 1, wag: 0, eyeOpen: 0.55 * blink(f, 33), happy: 0, ears: 0, lap: 0, time };
  if (f < D) return { x: 2640, pose: base };
  if (f < E) {
    const look = clamp01(kf(f, [[D + 10, 0], [D + 30, 1]]));
    const stand = clamp01(kf(f, [[D + 40, 0], [D + 62, 1]]));
    const drink = clamp01(kf(f, [[D + 62, 0], [D + 75, 1]]));
    const revive = clamp01(kf(f, [[D + 90, 0], [E, 1]]));
    return {
      x: 2640,
      pose: {
        ...base,
        lie: 1 - stand,
        headUp: look * (1 - drink) * 0.8,
        headDown: drink * 1.0 + (1 - drink) * 0.25 * (1 - look),
        lap: drink,
        tongue: 1,
        pant: 1 - revive * 0.7,
        eyeOpen: (0.55 + look * 0.4) * blink(f, 33),
        happy: revive,
        wag: revive,
        ears: revive * 0.6,
      },
    };
  }
  return { x: 2640, pose: { ...base, lie: 0, headUp: 0.55, headDown: 0, tongue: 0.6, pant: 0.25, wag: 1, happy: 1, ears: 0.7, eyeOpen: blink(f, 33) } };
};

// ---------------------------------------------------------------- overlays
const SUBS: { from: number; to: number; text: string }[] = [
  { from: 50, to: 145, text: "Ek musafir registan mein safar kar raha tha..." },
  { from: 160, to: 235, text: "Raaste mein use sakht pyaas lagi." },
  { from: 290, to: 385, text: "Kuen ke paas ek kutta pyaas se haanp raha tha." },
  { from: 405, to: 565, text: "Usne apne moze mein paani bhar kar kutte ko pilaya." },
];

const Subtitle: React.FC<{ f: number }> = ({ f }) => {
  const s = SUBS.find((x) => f >= x.from && f < x.to);
  if (!s) return null;
  const o = Math.min(1, (f - s.from) / 8, (s.to - f) / 8);
  return (
    <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: "Inter, 'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 44, color: "#fff", background: "rgba(40,24,12,0.6)", padding: "12px 28px", borderRadius: 16, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
        {s.text}
      </div>
    </div>
  );
};

export const Demo2D: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const cam = shotCam(f);
  const man = musafirAt(f);
  const dog = dogAt(f);
  const warm = f >= E ? 1 : 0;
  const puddle = clamp01(kf(f, [[D + 30, 0], [D + 80, 1]]));
  const titleO = interpolate(f, [15, 35, 110, 135], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const endO = interpolate(f, [E + 70, E + 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const black = Math.max(interpolate(f, [0, 12], [1, 0], { extrapolateRight: "clamp" }), interpolate(f, [END - 15, END], [0, 1], { extrapolateLeft: "clamp" }));
  // quick dip at each cut softens the edit
  const cutDip = [B, C, D, E].reduce((m, c) => Math.max(m, 1 - Math.min(1, Math.abs(f - c) / 4)), 0) * 0.5;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("sfx/desert-wind.mp3")} volume={0.35} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Layer cam={cam} depth={0}>
          <Sky warm={warm} />
        </Layer>
        <Layer cam={cam} depth={0.05}>
          <Sun x={warm ? 1500 : 1550} y={warm ? 520 : 230} />
        </Layer>
        <Layer cam={cam} depth={0.12}>
          <g transform={`translate(${t * 12} 0)`}>
            <Clouds />
          </g>
        </Layer>
        <Layer cam={cam} depth={0.3}>
          <FarMountains />
        </Layer>
        <Layer cam={cam} depth={0.6}>
          <MidDunes />
          <Palm x={400} y={760} s={0.7} sway={Math.sin(t) * 2} />
          <Palm x={3300} y={740} s={0.75} lean={-1} sway={Math.sin(t + 1) * 2} />
        </Layer>
        <Layer cam={cam} depth={1}>
          <Ground />
          <Palm x={1950} y={GROUND_Y - 10} s={1.15} sway={Math.sin(t * 0.9) * 3} />
          <Palm x={2050} y={GROUND_Y - 30} s={0.9} lean={-0.6} sway={Math.sin(t * 0.9 + 2) * 3} />
          <Rock x={1000} y={GROUND_Y + 10} s={0.8} />
          <Rock x={2950} y={GROUND_Y + 30} s={1.2} />
          <Grass x={1700} y={GROUND_Y + 20} s={1} t={t} />
          <Grass x={2800} y={GROUND_Y + 5} s={1.1} t={t} />
          <Well x={2200} y={GROUND_Y + 10} />
          {/* puddle forming under the stream */}
          {puddle > 0 && <ellipse cx={2475} cy={GROUND_Y + 6} rx={70 * puddle} ry={14 * puddle} fill="#8fd3f0" stroke="#5aa9cf" strokeWidth={3} />}
          <Dog2D x={dog.x} y={GROUND_Y + 10} flip pose={dog.pose} />
          <Musafir x={man.x} y={GROUND_Y + 12} flip={man.flip} pose={man.pose} />
        </Layer>
        <Layer cam={cam} depth={1.35}>
          <Grass x={1100} y={GROUND_Y + 220} s={1.8} t={t} />
          <Rock x={1650} y={GROUND_Y + 260} s={1.6} />
          <Grass x={2900} y={GROUND_Y + 240} s={2} t={t} />
        </Layer>
      </svg>

      {/* title */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 120, opacity: titleO }}>
        <div style={{ fontFamily: "'DejaVu Serif', Georgia, serif", fontWeight: 700, fontSize: 92, color: "#fff7e6", WebkitTextStroke: "3px #6b3a1c", textShadow: "0 6px 0 #8a4b22, 0 10px 24px rgba(0,0,0,0.35)" }}>
          Pyase Kutte Ki Kahani
        </div>
      </AbsoluteFill>
      {/* moral at the end */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: endO }}>
        <div style={{ textAlign: "center", fontFamily: "'DejaVu Serif', Georgia, serif", color: "#fffaf0", textShadow: "0 3px 10px rgba(60,30,10,0.7)" }}>
          <div style={{ fontSize: 58, fontWeight: 700 }}>"Har jaandaar par reham karne mein ajr hai."</div>
          <div style={{ fontSize: 34, marginTop: 18 }}>Sahih al-Bukhari 2363 · Sahih Muslim 2244</div>
        </div>
      </AbsoluteFill>
      <Subtitle f={f} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(black, cutDip) }} />
    </AbsoluteFill>
  );
};
