import React from "react";

/** SVG blur filters blur1..blur10 used for depth of field / rack focus. */
export const BlurDefs: React.FC = () => (
  <defs>
    {Array.from({ length: 10 }, (_, i) => (
      <filter key={i} id={`blur${i + 1}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={i + 1} />
      </filter>
    ))}
  </defs>
);
