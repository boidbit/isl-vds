// Preview sheet for the desert camp + early masjid library (tents, kite, red sash, sand, masjid, the cast).
// Composition "library-desert".

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BlurDefs } from "../film/BlurDefs";
import { MusafirFront } from "../FrontFace";
import { BASE_POSE, LOOKS, Musafir } from "../Musafir";
import { TimeSky } from "./Courtyard";
import { Cheel, CheelShadow, DuneBands, RedSash, SandGround, SandPuff, Spindle, Tent } from "./Desert";
import { MasjidCourt, MasjidFloor, MasjidGate } from "./Masjid";

export const DesertGallery: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const G = 760;
  const cast = ["khatoon", "khatoon-madinah", "bachchi", "qabeele-aurat", "sardar", "qabeele-jawan"];
  return (
    <AbsoluteFill style={{ background: "#f2cfa4" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <BlurDefs />
        <TimeSky time={0.7} t={t} x0={0} x1={1920} y0={0} y1={700} />
        <DuneBands y={560} x0={0} x1={1920} />
        <SandGround y={600} t={t} x0={0} x1={1920} depth={480} />
        <Tent x={300} y={G} w={520} h={230} t={t} />
        <Tent x={820} y={G} w={300} h={210} t={t} tone="cream" poles={1} open={0.3} />
        <CheelShadow x={1100} y={G + 40} s={1.2} t={t} />
        <Cheel x={1150} y={180} s={0.9} t={t} flap={1} />
        <Cheel x={1450} y={200} s={0.9} t={t} talons={1} grab={1} held={<RedSash x={0} y={0} t={t} s={0.55} mode="hang" drag={0.4} />} rot={-8} />
        <Cheel x={1750} y={160} s={0.7} t={t} view="below" heading={20} />
        <Cheel x={1000} y={420} s={0.8} t={t} fold={1} rot={35} talons={1} grab={0} />
        <RedSash x={1250} y={G + 60} t={t} s={1} mode="lie" glint={1} />
        <RedSash x={1600} y={520} t={t} s={0.9} mode="fall" rot={20} />
        <SandPuff x={1500} y={G + 80} age={8} />
        {cast.map((k, i) => (
          <Musafir key={k} x={130 + i * 150} y={1040} scale={k === "bachchi" ? 0.36 : 0.55} look={LOOKS[k]} pose={{ ...BASE_POSE, time: t, armF: [30, 20] }} light="l" />
        ))}
        <g transform="translate(1180 1070)">
          <MusafirFront x={0} y={0} s={0.75} look={LOOKS.khatoon} pose={{ t, tear: 0.5, brow: -0.8, mouth: "sad" }} light="l" />
        </g>
        <g transform="translate(1520 1070)">
          <MusafirFront x={0} y={0} s={0.75} look={LOOKS["khatoon-madinah"]} pose={{ t, mouth: "smile", hands: "hold", holdW: 130 }} held={<RedSash x={0} y={-10} t={t} s={0.5} mode="held" w={260} />} light="r" />
        </g>
        <g transform="translate(1700 760) scale(0.12)">
          <rect x={-1400} y={-1100} width={4800} height={2400} fill="#bfe0f2" />
          <MasjidCourt g={300} t={t} x0={-1400} x1={3400} />
          <MasjidFloor y={300} x0={-1400} x1={3400} depth={600} />
          <Spindle x={200} y={-200} t={t} s={1.5} />
        </g>
        <g transform="translate(1700 960) scale(0.1)">
          <rect x={-1400} y={-1300} width={4800} height={1400} fill="#cfe4f0" />
          <MasjidGate x={600} g={0} t={t} glow={1} x0={-1400} x1={3400} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
