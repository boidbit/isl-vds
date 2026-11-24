import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { resolveCast } from "./cast";
import { SceneRenderer } from "./SceneRenderer";
import type { Scene, Story } from "./schema";
import { computeStoryTiming, sceneAtFrame } from "./timeline";

const SERIF = "'DejaVu Serif', Georgia, 'Times New Roman', serif";
const SANS = "Inter, 'DejaVu Sans', Arial, sans-serif";

const FADE = 0.6;

const subtitleAt = (scene: Scene, t: number): { text: string; opacity: number } | null => {
  if (!scene.subtitles) return null;
  const list = typeof scene.subtitles === "string" ? [{ text: scene.subtitles }] : scene.subtitles;
  for (const s of list) {
    const start = s.start ?? 0.3;
    const end = s.end ?? scene.duration - 0.15;
    if (t >= start && t < end) {
      const opacity = Math.min(1, (t - start) / 0.3, (end - t) / 0.25);
      return { text: s.text, opacity };
    }
  }
  return null;
};

/** Black level for fade transitions (fade in at start, dips between "fade" scenes, fade out at end). */
const blackness = (story: Story, sceneIndex: number, t: number) => {
  const scene = story.scenes[sceneIndex];
  const next = story.scenes[sceneIndex + 1];
  let k = 0;
  if (sceneIndex === 0 || scene.transition === "fade") k = Math.max(k, 1 - t / FADE);
  if (!next || next.transition === "fade") k = Math.max(k, 1 - (scene.duration - t) / FADE);
  return Math.max(0, Math.min(1, k));
};

const Overlays: React.FC<{ story: Story; scene: Scene; sceneIndex: number; t: number; portrait: boolean }> = ({
  story,
  scene,
  sceneIndex,
  t,
  portrait,
}) => {
  const { width, height } = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const sub = subtitleAt(scene, t);
  const bar = portrait ? 0 : height * 0.075;
  const titleOpacity = scene.title ? Math.min(1, Math.max(0, (t - 0.6) / 0.8), Math.max(0, (scene.duration - 0.8 - t) / 0.6)) : 0;

  return (
    <AbsoluteFill>
      {/* cinematic letterbox (landscape only) */}
      {bar > 0 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, background: "#000" }} />
        </>
      )}
      {scene.title && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: titleOpacity }}>
          <div
            style={{
              fontFamily: SERIF,
              color: "#fff6e6",
              fontSize: 86 * unit,
              letterSpacing: 2 * unit,
              textShadow: `0 ${4 * unit}px ${24 * unit}px rgba(0,0,0,0.55)`,
              textAlign: "center",
              padding: `0 ${60 * unit}px`,
              transform: `translateY(${(1 - titleOpacity) * 12 * unit}px)`,
            }}
          >
            {scene.title}
          </div>
        </AbsoluteFill>
      )}
      {sub && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: bar + (portrait ? height * 0.2 : 36 * unit),
            display: "flex",
            justifyContent: "center",
            opacity: sub.opacity,
          }}
        >
          <div
            style={{
              maxWidth: portrait ? "86%" : "72%",
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: (portrait ? 46 : 40) * unit,
              lineHeight: 1.3,
              color: "#fffaf0",
              textAlign: "center",
              background: "rgba(10,8,6,0.55)",
              padding: `${12 * unit}px ${26 * unit}px`,
              borderRadius: 14 * unit,
              textShadow: "0 2px 6px rgba(0,0,0,0.6)",
            }}
          >
            {sub.text}
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: blackness(story, sceneIndex, t) }} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ lines: string[]; frame: number; fps: number; total: number }> = ({ lines, frame, fps, total }) => {
  const { width, height } = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const fadeOut = interpolate(frame, [total - fps * 0.8, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, #2a1f14 0%, #0b0806 75%)", justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 * unit, alignItems: "center", padding: `0 ${80 * unit}px` }}>
        {lines.map((line, i) => {
          const o = interpolate(frame, [fps * (0.3 + i * 0.6), fps * (1.1 + i * 0.6)], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity: o,
                fontFamily: i === 0 ? SERIF : SANS,
                fontSize: (i === 0 ? 52 : 34) * unit,
                color: i === 0 ? "#f6e7c8" : "#cdbb9b",
                textAlign: "center",
                lineHeight: 1.35,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const StoryVideo: React.FC<{ story: Story }> = ({ story }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const timing = useMemo(() => computeStoryTiming(story), [story]);
  const cast = useMemo(() => resolveCast(story), [story]);
  const current = sceneAtFrame(timing, frame);
  const aspect = width / height;
  const sceneIndex = current ? story.scenes.indexOf(current.scene) : -1;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {story.audio.ambience && <Audio src={staticFile(story.audio.ambience)} volume={story.audio.ambienceVolume} loop />}
      {story.audio.narration && <Audio src={staticFile(story.audio.narration)} />}
      {current ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows="variance"
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            camera={{ fov: 35, near: 0.05, far: 1200, position: [0, 2, 8] }}
          >
            <SceneRenderer scene={current.scene} time={current.localTime} cast={cast} aspect={aspect} />
          </ThreeCanvas>
          <Overlays story={story} scene={current.scene} sceneIndex={sceneIndex} t={current.localTime} portrait={aspect < 1} />
        </>
      ) : story.endCard ? (
        <EndCard lines={story.endCard.lines} frame={frame - timing.endCardStart} fps={fps} total={timing.endCardFrames} />
      ) : null}
    </AbsoluteFill>
  );
};
