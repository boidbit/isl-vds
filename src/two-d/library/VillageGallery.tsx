// Preview sheet for the village library (house, goats, trees). Composition "library-village".

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FarmGround, Goat, Hills, MudHouse, VillageSky, VillageTree } from "./Village";

export const VillageGallery: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const G = 900;
  return (
    <AbsoluteFill style={{ background: "#cfeaff" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <VillageSky mood="day" sunX={1500} />
        <Hills mood="day" />
        <FarmGround mood="day" y={760} />
        <VillageTree x={260} y={G - 20} s={1.05} t={t} kind="neem" nest />
        <VillageTree x={1640} y={G - 40} s={0.95} t={t} kind="kikar" />
        <MudHouse x={950} y={G - 30} w={620} h={400} door={0.35} t={t} />
        <Goat x={430} y={G + 120} t={t} s={1.3} coat="white" />
        <Goat x={820} y={G + 140} t={t + 1} s={1.2} coat="brown" graze={1} flip />
        <Goat x={1450} y={G + 120} t={t + 2} s={1.25} coat="black" bleat={1} />
      </svg>
    </AbsoluteFill>
  );
};
