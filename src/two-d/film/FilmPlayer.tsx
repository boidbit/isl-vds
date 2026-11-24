import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FILMS } from "../films";
import { H, W } from "../kit";
import { BlurDefs } from "./BlurDefs";
import type { Timing } from "./schema";
import { nominalToActual, planFilm } from "./timeline";

export type FilmPlayerProps = { filmId: string; timing: Timing | null };

export const FilmPlayer: React.FC<FilmPlayerProps> = ({ filmId, timing }) => {
  const frame = useCurrentFrame();
  const { film, visuals } = FILMS[filmId];
  const plan = useMemo(() => planFilm(film, visuals, timing), [film, visuals, timing]);
  const scene = plan.scenes.find((s) => frame >= s.start && frame < s.start + s.duration) ?? plan.scenes[plan.scenes.length - 1];
  const local = frame - scene.start;
  const nominal = scene.nominal[0] + (local * (scene.nominal[1] - scene.nominal[0])) / scene.duration;
  const vis = visuals.scenes[scene.id];

  const sub = scene.subtitle && local >= scene.subtitle.from && local < scene.subtitle.to ? scene.subtitle : null;
  const subO = sub ? Math.min(1, (local - sub.from) / 8, (sub.to - local) / 8) : 0;
  const end = plan.totalFrames;
  const black = Math.max(
    interpolate(frame, [0, 12], [1, 0], { extrapolateRight: "clamp" }),
    interpolate(frame, [end - 22, end], [0, 1], { extrapolateLeft: "clamp" }),
  );
  const dip = plan.scenes.slice(1).reduce((m, s) => Math.max(m, 1 - Math.min(1, Math.abs(frame - s.start) / 4)), 0) * 0.55;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {visuals.ambience && <Audio src={staticFile(visuals.ambience.file)} volume={visuals.ambience.volume} loop />}
      {visuals.sfx.map((s, i) => {
        const at = nominalToActual(plan.scenes, s.at);
        return at === null ? null : (
          <Sequence key={i} from={at} durationInFrames={30}>
            <Audio src={staticFile(s.file)} volume={s.volume} />
          </Sequence>
        );
      })}
      {plan.scenes.map((s) =>
        s.voice ? (
          <Sequence key={`v-${s.id}`} from={s.start + Math.round(0.35 * film.fps)} durationInFrames={s.voice.frames + 15}>
            <Audio src={staticFile(s.voice.file)} volume={1} />
          </Sequence>
        ) : null,
      )}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <BlurDefs />
        {vis.render(nominal)}
      </svg>
      {visuals.overlay?.(nominal)}
      {sub && (
        <div style={{ position: "absolute", bottom: 56, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: subO }}>
          <div style={{ maxWidth: "80%", textAlign: "center", fontFamily: "Inter, 'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 42, color: "#fff", background: "rgba(40,24,12,0.62)", padding: "12px 28px", borderRadius: 16 }}>
            {sub.text}
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(black, dip) }} />
    </AbsoluteFill>
  );
};

/** Load voice timing (if the voice step ran) and size the composition to it. */
export const loadFilmMetadata = async (filmId: string) => {
  const { film, visuals } = FILMS[filmId];
  let timing: Timing | null = null;
  if (film.voice.enabled) {
    try {
      const res = await fetch(staticFile(`voice/${filmId}/timing.json`));
      if (res.ok) timing = (await res.json()) as Timing;
    } catch {
      timing = null;
    }
  }
  return { timing, durationInFrames: planFilm(film, visuals, timing).totalFrames, fps: film.fps };
};
