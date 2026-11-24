// Preview sheet for the mountain/cave, room and farm assets + the "gufa-ke-teen" cast. Composition "library-mountain".

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BASE_POSE, LOOKS, Musafir } from "../Musafir";
import { Camel, Cow, CropRows, Fence, GreenField, WagePouch } from "./Farm";
import { GoldCoins, MilkBowl, MudRoom, Sleeper } from "./Interior";
import { Boulder, CaveInside, CliffCave, Lightning, MountainSky, Peaks, Puddle, Rain, RainSplashes, RockyGround } from "./Mountain";
import { Goat, VillageSky } from "./Village";

const Panel: React.FC<{ x: number; y: number; vb: string; children: React.ReactNode }> = ({ x, y, vb, children }) => (
  <svg x={x} y={y} width={960} height={540} viewBox={vb} preserveAspectRatio="xMidYMid slice">
    {children}
  </svg>
);

export const MountainGallery: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const p = (extra = {}) => ({ ...BASE_POSE, time: t, ...extra });
  return (
    <AbsoluteFill style={{ background: "#222" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <Panel x={0} y={0} vb="-600 300 3400 1912">
          <MountainSky mood="storm" t={t} flash={0.3} />
          <Peaks mood="storm" />
          <Lightning x={2200} y={300} k={1} />
          <RockyGround mood="storm" y={1500} wet={1} />
          <CliffCave cx={1000} g={1500} mood="storm" />
          <Boulder x={1900} y={700} r={480} rot={30} />
          <Puddle x={300} y={1640} t={t} />
          <RainSplashes t={t} x0={-600} x1={2800} y={1520} />
          {["musafir1", "musafir2", "musafir3"].map((k, i) => (
            <Musafir key={k} x={-200 + i * 260} y={1560 + i * 20} look={LOOKS[k]} pose={p({ walk: 1, step: i * 2, lean: 10, brow: -0.6, mouth: "open" })} />
          ))}
          <g transform="translate(-600 300) scale(3.15)">
            <Rain t={t} w={1080} h={620} n={120} />
          </g>
        </Panel>
        <Panel x={960} y={0} vb="-300 500 2600 1462">
          <CaveInside cx={1000} g={1500} open={0.2} t={t} layer="back" />
          {["musafir1", "musafir2", "musafir3"].map((k, i) => (
            <Musafir key={k} x={500 + i * 330} y={1560} look={LOOKS[k]} flip={i === 2} pose={p({ armF: [70, 80], armB: [60, 80], brow: -0.8, mouth: "sad", look: -0.5 })} />
          ))}
          <CaveInside cx={1000} g={1500} open={0.2} t={t} layer="front" />
        </Panel>
        <Panel x={0} y={540} vb="-200 500 2600 1462">
          <MudRoom g={1500} t={t} time={0.2} door={0.4} />
          <Sleeper x={1100} y={1580} look={LOOKS.pita} t={t} blanket="#6a5a8a" />
          <Sleeper x={1700} y={1640} look={LOOKS.maa} t={t} blanket="#8a4a5a" />
          <Musafir x={300} y={1600} look={LOOKS.musafir1} pose={p({ armF: [60, 70], armB: [50, 70], look: 1 })} />
          <MilkBowl x={420} y={1330} s={0.9} t={t} />
          <Musafir x={2200} y={1600} flip look={LOOKS.aurat} pose={p({ kneel: 1, armF: [80, 20], brow: -0.5 })} />
          <GoldCoins x={1900} y={1700} s={0.8} t={t} />
        </Panel>
        <Panel x={960} y={540} vb="-300 500 2900 1631">
          <VillageSky mood="day" sunX={1700} />
          <Peaks mood="clear" y={1400} />
          <GreenField y={1450} />
          <Fence x0={-300} x1={2600} y={1480} />
          <CropRows x0={-200} x1={700} y={1560} grow={0.9} t={t} />
          <Camel x={1900} y={1700} t={t} s={0.9} />
          <Cow x={1200} y={1680} t={t} s={0.9} />
          <Cow x={600} y={1820} t={t} s={0.8} coat="brown" graze={1} flip />
          <Goat x={2300} y={1860} t={t} coat="black" graze={1} />
          <Musafir x={0} y={1900} look={LOOKS.musafir3} pose={p({ armF: [70, 20], look: 1 })} />
          <Musafir x={300} y={1900} flip look={LOOKS.mazdoor} pose={p({ brow: 1, mouth: "open" })} />
          <WagePouch x={160} y={1700} t={t} open={1} />
          <Musafir x={2500} y={1900} flip look={LOOKS.maa} pose={p({})} />
        </Panel>
      </svg>
    </AbsoluteFill>
  );
};
