// Scene lengths come from the voice: a scene is as long as its nominal design or as
// long as its spoken lines need, whichever is longer.
import { lineKey, localLine, sceneLines, type Film, type Lang, type Timing } from "./schema";
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
  /** Piecewise-linear map (nominal frame, local frame), increasing in both; from the scene's `beats`. */
  knots: [number, number][];
};

const makeKnots = (nominal: [number, number], duration: number, lines: PlannedLine[], beats?: (number | null)[]): [number, number][] => {
  const knots: [number, number][] = [[nominal[0], 0]];
  (beats ?? []).forEach((b, i) => {
    const l = lines[i];
    if (b === null || b === undefined || !l) return;
    const [pn, pl] = knots[knots.length - 1];
    if (b > pn && b < nominal[1] && l.from > pl && l.from < duration) knots.push([b, l.from]);
  });
  knots.push([nominal[1], duration]);
  return knots;
};

/** Nominal frame (what the scene was designed on) for a local frame of the real scene. */
export const localToNominal = (s: PlannedScene, local: number) => {
  const k = s.knots;
  for (let i = 1; i < k.length; i++) {
    if (local < k[i][1] || i === k.length - 1) {
      const [n0, l0] = k[i - 1];
      const [n1, l1] = k[i];
      return n0 + ((local - l0) * (n1 - n0)) / (l1 - l0);
    }
  }
  return s.nominal[0];
};

/** Local frame of the real scene for a nominal frame. */
export const nominalToLocal = (s: PlannedScene, nominal: number) => {
  const k = s.knots;
  for (let i = 1; i < k.length; i++) {
    if (nominal < k[i][0] || i === k.length - 1) {
      const [n0, l0] = k[i - 1];
      const [n1, l1] = k[i];
      return l0 + ((nominal - n0) * (l1 - l0)) / (n1 - n0);
    }
  }
  return 0;
};

/** Rough speaking time when there is no audio yet (keeps previews realistic). */
const estimateSeconds = (text: string) => 0.4 + text.length / 14;

export const planFilm = (film: Film, visuals: FilmVisuals, timing?: Timing | null, lang: Lang = "ur") => {
  const fps = film.fps;
  let cursor = 0;
  const scenes: PlannedScene[] = film.scenes.map((sc) => {
    const vis = visuals.scenes[sc.id];
    if (!vis) throw new Error(`Scene "${sc.id}" has no visuals`);
    const nominalLen = vis.nominal[1] - vis.nominal[0];
    let t = Math.round(LEAD_SECONDS * fps);
    const lines: PlannedLine[] = sceneLines(sc).map((raw, i) => {
      const l = localLine(raw, lang);
      const v = film.voice.enabled ? timing?.lines[lineKey(sc.id, i)] : undefined;
      const frames = Math.ceil((v ? v.seconds : estimateSeconds(l.text)) * fps);
      const planned: PlannedLine = { speaker: l.speaker, text: l.text, from: t, frames, file: v?.file, env: v?.env ?? [] };
      t += frames + Math.round(GAP_SECONDS * fps);
      return planned;
    });
    const need = lines.length ? t + Math.round((TAIL_SECONDS - GAP_SECONDS) * fps) : 0;
    const duration = Math.max(nominalLen, Math.ceil(need / (sc.subtitleMax ?? 1)));
    const planned: PlannedScene = { id: sc.id, start: cursor, duration, nominal: vis.nominal, lines, knots: makeKnots(vis.nominal, duration, lines, vis.beats) };
    cursor += duration;
    return planned;
  });
  return { scenes, totalFrames: cursor };
};

/** Map an absolute nominal frame (e.g. a sound cue) to the real timeline. */
export const nominalToActual = (scenes: PlannedScene[], nominal: number) => {
  for (const s of scenes) {
    if (nominal >= s.nominal[0] && nominal < s.nominal[1]) {
      return s.start + Math.round(nominalToLocal(s, nominal));
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
