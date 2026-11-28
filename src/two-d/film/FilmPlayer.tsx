import { CameraMotionBlur } from "@remotion/motion-blur";
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FILMS } from "../films";
import { H, VH, VW, W } from "../kit";
import { BlurDefs } from "./BlurDefs";
import { voiceDir, type Lang, type Timing } from "./schema";
import { sfxPath } from "./sfx";
import { LookGrade, lookOf } from "./looks";
import { captionChunks, localToNominal, nominalToActual, planFilm, type PlannedScene } from "./timeline";
import type { SceneCtx } from "./types";

export type FilmPlayerProps = { filmId: string; timing: Timing | null; lang?: Lang };

const usePlan = (filmId: string, timing: Timing | null, lang: Lang = "ur") => {
  const { film, visuals } = FILMS[filmId];
  return useMemo(() => ({ film, visuals, plan: planFilm(film, visuals, timing, lang) }), [film, visuals, timing, lang]);
};

const sceneAt = (scenes: PlannedScene[], frame: number) => scenes.find((s) => frame >= s.start && frame < s.start + s.duration) ?? scenes[scenes.length - 1];

const makeCtx = (scene: PlannedScene, local: number): SceneCtx => {
  const active = (speaker: string) => scene.lines.find((l) => l.speaker === speaker && local >= l.from && local < l.from + l.frames);
  return {
    local,
    duration: scene.duration,
    speaking: (speaker) => !!active(speaker),
    talk: (speaker) => {
      const l = active(speaker);
      if (!l) return 0;
      const i = local - l.from;
      if (l.env.length) return l.env[Math.min(l.env.length - 1, i)] ?? 0;
      return 0.35 + 0.35 * Math.abs(Math.sin(i * 0.9)); // preview without audio
    },
  };
};

/** The picture only: rendered several times per frame when motion blur is on. */
const Picture: React.FC<FilmPlayerProps & { w: number; h: number; at?: number }> = ({ filmId, timing, lang, w, h, at }) => {
  const current = useCurrentFrame();
  const frame = at ?? current;
  const { visuals, plan } = usePlan(filmId, timing, lang);
  const scene = sceneAt(plan.scenes, frame);
  const local = frame - scene.start;
  const nominal = localToNominal(scene, local);
  return (
    <AbsoluteFill>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <BlurDefs />
        {visuals.scenes[scene.id].render(nominal, makeCtx(scene, local))}
      </svg>
    </AbsoluteFill>
  );
};

export const FilmPlayer: React.FC<FilmPlayerProps> = ({ filmId, timing, lang = "ur" }) => {
  const frame = useCurrentFrame();
  const { film, visuals, plan } = usePlan(filmId, timing, lang);
  const short = film.format === "short";
  const [w, h] = short ? [VW, VH] : [W, H];
  const scene = sceneAt(plan.scenes, frame);
  const local = frame - scene.start;
  const nominal = localToNominal(scene, local);
  const look = lookOf(film.look);
  const end = plan.totalFrames;
  // Shorts loop: no black at the start/end; the last frames blend into frame 0 so the replay is seamless.
  const loop = short && film.loopEnding;
  const LOOP = 14;
  const loopMix = loop ? interpolate(frame, [end - LOOP, end - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }) : 0;
  const black = loop
    ? 0
    : Math.max(
        interpolate(frame, [0, 8], [1, 0], { extrapolateRight: "clamp" }),
        interpolate(frame, [end - 18, end], [0, 1], { extrapolateLeft: "clamp" }),
      );
  const dip = short ? 0 : plan.scenes.slice(1).reduce((m, s) => Math.max(m, 1 - Math.min(1, Math.abs(frame - s.start) / 4)), 0) * 0.55;
  const line = scene.lines.find((l) => local >= l.from && local < l.from + l.frames + 6);
  const chunk = line && short ? captionChunks(line).find((c) => local >= c.from && local < c.to + 4) : null;
  const pop = chunk ? Math.min(1, (local - chunk.from) / 4) : 0;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {visuals.ambience && <Audio src={staticFile(sfxPath(visuals.ambience.file))} volume={visuals.ambience.volume} loop />}
      {visuals.sfx.map((s, i) => {
        const at = nominalToActual(plan.scenes, s.at);
        if (at === null) return null;
        const stop = s.until !== undefined ? nominalToActual(plan.scenes, s.until) : null;
        const len = Math.max(2, Math.min(film.fps * 6, stop !== null ? stop - at : film.fps * (s.dur ?? 6)));
        return (
          <Sequence key={i} from={at} durationInFrames={Math.round(len)}>
            <Audio
              src={staticFile(sfxPath(s.file))}
              volume={(f) => {
                const fade = Math.max(1, film.fps * (s.fade ?? 0.25));
                return s.volume * Math.max(0, Math.min(1, (len - f) / fade));
              }}
            />
          </Sequence>
        );
      })}
      {plan.scenes.flatMap((s) =>
        s.lines.map((l, i) =>
          l.file ? (
            <Sequence key={`v-${s.id}-${i}`} from={s.start + l.from} durationInFrames={l.frames + 10}>
              <Audio src={staticFile(l.file)} volume={1} />
            </Sequence>
          ) : null,
        ),
      )}
      <LookGrade look={look} frame={frame} w={w} h={h}>
        {film.motionBlur > 1 ? (
          <CameraMotionBlur samples={film.motionBlur} shutterAngle={180}>
            <Picture filmId={filmId} timing={timing} lang={lang} w={w} h={h} />
          </CameraMotionBlur>
        ) : (
          <Picture filmId={filmId} timing={timing} lang={lang} w={w} h={h} />
        )}
      </LookGrade>
      {visuals.overlay?.(nominal, lang)}
      {short && chunk && (
        <div style={{ position: "absolute", top: "75%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              maxWidth: "88%",
              textAlign: "center",
              fontFamily: "'DejaVu Sans', Inter, sans-serif",
              fontWeight: 900,
              fontSize: 78,
              lineHeight: 1.15,
              color: line?.speaker === "narrator" ? "#ffffff" : "#ffe066",
              WebkitTextStroke: "10px #1d120a",
              paintOrder: "stroke fill",
              textShadow: "0 8px 18px rgba(0,0,0,0.45)",
              transform: `scale(${0.82 + pop * 0.18})`,
            }}
          >
            {chunk.text}
          </div>
        </div>
      )}
      {!short && line && (
        <div style={{ position: "absolute", bottom: 56, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ maxWidth: "80%", textAlign: "center", fontFamily: "Inter, 'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 42, color: "#fff", background: "rgba(40,24,12,0.62)", padding: "12px 28px", borderRadius: 16 }}>
            {line.text}
          </div>
        </div>
      )}
      {loopMix > 0 && (
        <AbsoluteFill style={{ opacity: loopMix }}>
          <LookGrade look={look} frame={0} w={w} h={h}>
            <Picture filmId={filmId} timing={timing} lang={lang} w={w} h={h} at={0} />
          </LookGrade>
          {visuals.overlay?.(plan.scenes[0].nominal[0], lang)}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(black, dip) }} />
    </AbsoluteFill>
  );
};

/** Load voice timing (if the voice step ran) and size the composition to it. */
export const loadFilmMetadata = async (filmId: string, lang: Lang = "ur") => {
  const { film, visuals } = FILMS[filmId];
  let timing: Timing | null = null;
  if (film.voice.enabled) {
    try {
      const res = await fetch(staticFile(`${voiceDir(filmId, lang)}/timing.json`));
      if (res.ok) {
        const json = await res.json();
        timing = json && json.lines ? (json as Timing) : null;
      }
    } catch {
      timing = null;
    }
  }
  const short = film.format === "short";
  return {
    timing,
    durationInFrames: planFilm(film, visuals, timing, lang).totalFrames,
    fps: film.fps,
    width: short ? VW : W,
    height: short ? VH : H,
  };
};
