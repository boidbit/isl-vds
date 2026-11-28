// Suspense thumbnail: one frame of the film, zoomed on the emotion, with big hook text and a red circle/arrow on
// the mystery. Rendered as a still: `npx remotion still src/index.ts thumb-<id>[-en] out/<name>-thumb.png`.
import React from "react";
import { AbsoluteFill } from "remotion";
import { FILMS } from "../films";
import { H, VH, VW, W } from "../kit";
import { BlurDefs } from "./BlurDefs";
import type { Lang } from "./schema";
import type { SceneCtx } from "./types";
import { LookGrade, lookOf } from "./looks";

export type ThumbnailProps = { filmId: string; lang?: Lang };

/** Output size: Shorts 1080x1920, landscape films 1280x720. */
export const thumbnailSize = (filmId: string) => (FILMS[filmId].film.format === "short" ? { width: VW, height: VH } : { width: 1280, height: 720 });

const RED = "#ff2b2b";

export const Thumbnail: React.FC<ThumbnailProps> = ({ filmId, lang = "ur" }) => {
  const { film, visuals } = FILMS[filmId];
  const t = film.thumbnail;
  if (!t) return <AbsoluteFill style={{ background: "#222" }} />;
  const short = film.format === "short";
  const [sw, sh] = short ? [VW, VH] : [W, H]; // scene coordinates
  const { width, height } = thumbnailSize(filmId);
  const entry = Object.entries(visuals.scenes).find(([, v]) => t.at >= v.nominal[0] && t.at < v.nominal[1]) ?? Object.entries(visuals.scenes)[0];
  const [, scene] = entry;
  const ctx: SceneCtx = { local: t.at - scene.nominal[0], duration: scene.nominal[1] - scene.nominal[0], speaking: () => false, talk: () => 0 };
  // zoom around focus, clamped so the frame stays filled
  const z = t.zoom;
  const tx = Math.min(0, Math.max(sw - sw * z, sw / 2 - t.focus[0] * sw * z));
  const ty = Math.min(0, Math.max(sh - sh * z, sh / 2 - t.focus[1] * sh * z));
  const text = lang === "en" && t.text.en ? t.text.en : t.text.ur;
  const k = width / 1080; // text scale
  const top = t.textAt === "top";
  // circle / arrow are in output (zoomed) coordinates 0..1
  const arrow = t.arrow;
  const ang = ((arrow?.from ?? 0) * Math.PI) / 180;
  const alen = 0.2 * width;
  const look = lookOf(film.look);
  const tc = look?.thumb ?? { text: "#ffd83a", stroke: "#120a04", accent: "" };

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookGrade look={look} frame={0} w={width} h={height}>
        <svg width={width} height={height} viewBox={`0 0 ${sw} ${sh}`} preserveAspectRatio="xMidYMid slice">
          <BlurDefs />
          <g transform={`translate(${tx} ${ty}) scale(${z})`}>{scene.render(t.at, ctx)}</g>
        </svg>
      </LookGrade>
      {/* punchier colour + vignette + dark band behind the text */}
      <AbsoluteFill style={{ backdropFilter: "saturate(1.25) contrast(1.08)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill
        style={{
          background: top ? "linear-gradient(rgba(0,0,0,0.62), rgba(0,0,0,0) 38%)" : "linear-gradient(rgba(0,0,0,0) 60%, rgba(0,0,0,0.65))",
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="tglow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation={10 * k} floodColor="#000" floodOpacity="0.7" />
          </filter>
        </defs>
        {t.circle && (
          <g filter="url(#tglow)">
            <circle cx={t.circle.at[0] * width} cy={t.circle.at[1] * height} r={t.circle.r * width} fill="none" stroke="#fff" strokeWidth={26 * k} />
            <circle cx={t.circle.at[0] * width} cy={t.circle.at[1] * height} r={t.circle.r * width} fill="none" stroke={RED} strokeWidth={16 * k} />
          </g>
        )}
        {arrow && (
          <g
            filter="url(#tglow)"
            transform={`translate(${arrow.at[0] * width} ${arrow.at[1] * height}) rotate(${(ang * 180) / Math.PI})`}
          >
            <path
              d={`M0 0 L${60 * k} ${-46 * k} L${56 * k} ${-18 * k} L${alen} ${-16 * k} L${alen} ${16 * k} L${56 * k} ${18 * k} L${60 * k} ${46 * k} Z`}
              fill={RED}
              stroke="#fff"
              strokeWidth={8 * k}
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
      {tc.accent && <AbsoluteFill style={{ boxShadow: `inset 0 0 0 ${14 * k}px ${tc.accent}` }} />}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [top ? "top" : "bottom"]: (short ? 150 : 34) * k,
          display: "flex",
          justifyContent: "center",
          padding: `0 ${40 * k}px`,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "'DejaVu Sans', Inter, sans-serif",
            fontWeight: 900,
            fontSize: (short ? 132 : 96) * k * (text.length > 16 ? 0.82 : 1),
            lineHeight: 1.02,
            color: tc.text,
            WebkitTextStroke: `${16 * k}px ${tc.stroke}`,
            paintOrder: "stroke fill",
            textShadow: `0 ${10 * k}px ${24 * k}px rgba(0,0,0,0.6)`,
            transform: "rotate(-3deg)",
            textTransform: "uppercase",
            letterSpacing: -1 * k,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
