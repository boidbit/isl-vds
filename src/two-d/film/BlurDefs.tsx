import React from "react";

/** Cel shading: a soft shade band on the side away from the light + a warm rim on the lit side.
 * `celR` = shade on the right (light from the left), `celL` = shade on the left. `Big` versions for close-ups. */
const Cel: React.FC<{ id: string; dir: 1 | -1; d: number; shade?: string; rim?: string }> = ({ id, dir, d, shade = "#2a1640", rim = "#fff2c8" }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
    <feOffset in="SourceAlpha" dx={-dir * d} dy={-d * 0.3} result="off" />
    <feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
    <feGaussianBlur in="edge" stdDeviation={d * 0.35} result="edgeB" />
    <feComposite in="edgeB" in2="SourceAlpha" operator="in" result="edgeIn" />
    <feFlood floodColor={shade} floodOpacity={0.34} />
    <feComposite in2="edgeIn" operator="in" result="shadeBand" />
    <feOffset in="SourceAlpha" dx={dir * d * 0.45} dy={0} result="off2" />
    <feComposite in="SourceAlpha" in2="off2" operator="out" result="rimEdge" />
    <feFlood floodColor={rim} floodOpacity={0.28} />
    <feComposite in2="rimEdge" operator="in" result="rimBand" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="shadeBand" />
      <feMergeNode in="rimBand" />
    </feMerge>
  </filter>
);

/** SVG blur filters blur1..blur10 used for depth of field / rack focus, plus cel-shading filters. */
export const BlurDefs: React.FC = () => (
  <defs>
    {Array.from({ length: 10 }, (_, i) => (
      <filter key={i} id={`blur${i + 1}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={i + 1} />
      </filter>
    ))}
    <Cel id="celR" dir={1} d={12} />
    <Cel id="celL" dir={-1} d={12} />
    <Cel id="celRBig" dir={1} d={30} />
    <Cel id="celLBig" dir={-1} d={30} />
    {/* memory / flashback: warm sepia, almost no colour */}
    <filter id="memory" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.42 0.62 0.16 0 0.04  0.36 0.56 0.14 0 0.03  0.27 0.44 0.11 0 0.02  0 0 0 1 0" />
    </filter>
  </defs>
);
