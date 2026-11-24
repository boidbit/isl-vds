// Scene lengths come from the voice: a scene is as long as its nominal design or as
// long as its spoken lines need, whichever is longer.
import { lineKey, sceneLines, type Film, type Timing } from "./schema";
import type { FilmVisuals } from "./types";

export const LEAD_SECONDS = 0.3; // pause before the first line
export const GAP_SECONDS = 0.2; // between lines
export const TAIL_SECONDS = 0.45; // breath after the last line

export type PlannedLine = { speaker: string; text: string; from: number; frames: number; file?: string; env: number[] };

export type PlannedScene = {
  id: string;
  start: number;
  duration: number;
  nominal: [number, number];
  lines: PlannedLine[];
};

/** Rough speaking time when there is no audio yet (keeps previews realistic). */
const estimateSeconds = (text: string) => 0.4 + text.length / 14;

export const planFilm = (film: Film, visuals: FilmVisuals, timing?: Timing | null) => {
  const fps = film.fps;
  let cursor = 0;
  const scenes: PlannedScene[] = film.scenes.map((sc) => {
    const vis = visuals.scenes[sc.id];
    if (!vis) throw new Error(`Scene "${sc.id}" has no visuals`);
    const nominalLen = vis.nominal[1] - vis.nominal[0];
    let t = Math.round(LEAD_SECONDS * fps);
    const lines: PlannedLine[] = sceneLines(sc).map((l, i) => {
      const v = film.voice.enabled ? timing?.lines[lineKey(sc.id, i)] : undefined;
      const frames = Math.ceil((v ? v.seconds : estimateSeconds(l.text)) * fps);
      const planned: PlannedLine = { speaker: l.speaker, text: l.text, from: t, frames, file: v?.file, env: v?.env ?? [] };
      t += frames + Math.round(GAP_SECONDS * fps);
      return planned;
    });
    const need = lines.length ? t + Math.round((TAIL_SECONDS - GAP_SECONDS) * fps) : 0;
    const duration = Math.max(nominalLen, Math.ceil(need / (sc.subtitleMax ?? 1)));
    const planned: PlannedScene = { id: sc.id, start: cursor, duration, nominal: vis.nominal, lines };
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

/** Split a line into short caption chunks (2-4 words), timed by character count. */
export const captionChunks = (line: PlannedLine) => {
  const words = line.text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let cur: string[] = [];
  words.forEach((w) => {
    cur.push(w);
    const len = cur.join(" ").length;
    if (cur.length >= 4 || len > 18 || /[.,!?…—]$/.test(w)) {
      chunks.push(cur.join(" "));
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur.join(" "));
  const total = chunks.reduce((n, c) => n + c.length + 2, 0);
  let at = line.from;
  return chunks.map((text) => {
    const frames = Math.max(6, Math.round(((text.length + 2) / total) * line.frames));
    const c = { text, from: at, to: at + frames };
    at += frames;
    return c;
  });
};
