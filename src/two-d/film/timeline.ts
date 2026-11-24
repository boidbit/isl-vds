// Scene lengths come from the narration audio: a scene is as long as its nominal
// design or as long as its voice line needs, whichever is longer.
import type { Film, Timing } from "./schema";
import type { FilmVisuals } from "./types";

export const LEAD_SECONDS = 0.35; // pause before the narrator starts
export const TAIL_SECONDS = 0.6; // breath after the line

export type PlannedScene = {
  id: string;
  start: number; // actual frames
  duration: number;
  nominal: [number, number];
  voice?: { file: string; frames: number };
  subtitle?: { text: string; from: number; to: number }; // local frames
};

export const planFilm = (film: Film, visuals: FilmVisuals, timing?: Timing | null) => {
  const fps = film.fps;
  let cursor = 0;
  const scenes: PlannedScene[] = film.scenes.map((sc) => {
    const vis = visuals.scenes[sc.id];
    if (!vis) throw new Error(`Scene "${sc.id}" has no visuals`);
    const nominalLen = vis.nominal[1] - vis.nominal[0];
    const v = film.voice.enabled ? timing?.scenes[sc.id] : undefined;
    const voiceFrames = v ? Math.ceil(v.seconds * fps) : 0;
    const lead = Math.round(LEAD_SECONDS * fps);
    const need = v ? lead + voiceFrames + Math.round(TAIL_SECONDS * fps) : 0;
    const duration = Math.max(nominalLen, Math.ceil(need / (sc.subtitleMax ?? 1)));
    const subEnd = v ? lead + voiceFrames : Math.floor(duration * (sc.subtitleMax ?? 1)) - 10;
    const planned: PlannedScene = {
      id: sc.id,
      start: cursor,
      duration,
      nominal: vis.nominal,
      voice: v ? { file: v.file, frames: voiceFrames } : undefined,
      subtitle: sc.narration ? { text: sc.narration, from: Math.min(lead, 12), to: subEnd } : undefined,
    };
    cursor += duration;
    return planned;
  });
  return { scenes, totalFrames: cursor };
};

/** Map an absolute nominal frame (e.g. a sound cue) to the real timeline. */
export const nominalToActual = (scenes: PlannedScene[], nominal: number) => {
  for (const s of scenes) {
    if (nominal >= s.nominal[0] && nominal < s.nominal[1]) {
      return s.start + Math.round(((nominal - s.nominal[0]) * s.duration) / (s.nominal[1] - s.nominal[0]));
    }
  }
  return null;
};
