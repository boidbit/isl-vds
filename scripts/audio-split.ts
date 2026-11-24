// Cut one long TTS take into its lines. Silences inside a line ("…", commas) can be
// as long as the pauses between lines, so cuts are aligned to where each line is
// expected to end (by text length), preferring long silences near those points.

export const SR = 24000;
export type Pcm = Int16Array;

/** Silent stretches (>= minSec) as [startSample, endSample]. */
export const silences = (pcm: Pcm, minSec = 0.22, thresholdDb = -40) => {
  const win = Math.round(SR * 0.02);
  const thr = 32768 * Math.pow(10, thresholdDb / 20);
  const out: [number, number][] = [];
  let start = -1;
  for (let i = 0; i < pcm.length; i += win) {
    let sum = 0;
    const end = Math.min(pcm.length, i + win);
    for (let j = i; j < end; j++) sum += pcm[j] * pcm[j];
    const rms = Math.sqrt(sum / Math.max(1, end - i));
    if (rms < thr) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      if (i - start >= minSec * SR) out.push([start, i]);
      start = -1;
    }
  }
  if (start >= 0 && pcm.length - start >= minSec * SR) out.push([start, pcm.length]);
  return out;
};

export const trim = (pcm: Pcm) => {
  const s = silences(pcm, 0.05, -45);
  let a = 0;
  let b = pcm.length;
  if (s.length && s[0][0] === 0) a = Math.max(0, s[0][1] - Math.round(SR * 0.05));
  const last = s[s.length - 1];
  if (last && last[1] >= pcm.length - 1) b = Math.min(pcm.length, last[0] + Math.round(SR * 0.08));
  return pcm.slice(a, Math.max(a + 1, b));
};

/** Weight of a text for timing (pauses in "…" and punctuation count too). */
const weight = (text: string) => text.replace(/<[^>]+>/g, "").length + (text.match(/…|\.\.\./g)?.length ?? 0) * 6 + (text.match(/[,।!?—]/g)?.length ?? 0) * 3;

/**
 * Choose n-1 cut points among the inner silences with dynamic programming:
 * cost = distance from the expected boundary - bonus for long silences.
 */
export const splitAligned = (pcm: Pcm, texts: string[]): Pcm[] | null => {
  const n = texts.length;
  if (n === 1) return [trim(pcm)];
  const cands = silences(pcm).filter(([a, b]) => a > SR * 0.2 && b < pcm.length - SR * 0.2);
  if (cands.length < n - 1) return null;
  // speech span (ignore leading/trailing silence) for expected positions
  const all = silences(pcm, 0.05);
  const s0 = all.length && all[0][0] === 0 ? all[0][1] : 0;
  const lastS = all[all.length - 1];
  const s1 = lastS && lastS[1] >= pcm.length - 1 ? lastS[0] : pcm.length;
  const w = texts.map(weight);
  const total = w.reduce((x, y) => x + y, 0);
  const expected: number[] = [];
  let acc = 0;
  for (let k = 0; k < n - 1; k++) {
    acc += w[k];
    expected.push(s0 + ((s1 - s0) * acc) / total);
  }
  const mid = cands.map(([a, b]) => (a + b) / 2);
  const len = cands.map(([a, b]) => (b - a) / SR);
  const cost = (k: number, c: number) => Math.abs(mid[c] - expected[k]) / SR - 1.2 * len[c];
  const M = cands.length;
  const dp: number[][] = Array.from({ length: n - 1 }, () => Array(M).fill(Infinity));
  const prev: number[][] = Array.from({ length: n - 1 }, () => Array(M).fill(-1));
  for (let c = 0; c < M; c++) dp[0][c] = cost(0, c);
  for (let k = 1; k < n - 1; k++) {
    for (let c = k; c < M; c++) {
      for (let p = k - 1; p < c; p++) {
        const v = dp[k - 1][p] + cost(k, c);
        if (v < dp[k][c]) {
          dp[k][c] = v;
          prev[k][c] = p;
        }
      }
    }
  }
  let best = -1;
  for (let c = n - 2; c < M; c++) if (best < 0 || dp[n - 2][c] < dp[n - 2][best]) best = c;
  if (best < 0 || !isFinite(dp[n - 2][best])) return null;
  const chosen: number[] = [];
  for (let k = n - 2, c = best; k >= 0; k--) {
    chosen.unshift(c);
    c = prev[k][c];
  }
  const cuts = chosen.map((c) => Math.round(mid[c]));
  const parts: Pcm[] = [];
  let p0 = 0;
  [...cuts, pcm.length].forEach((c) => {
    parts.push(trim(pcm.slice(p0, c)));
    p0 = c;
  });
  // sanity: each part within a factor of its expected length
  const ok = parts.every((part, i) => {
    const exp = ((s1 - s0) * w[i]) / total;
    return part.length > SR * 0.25 && part.length < exp * 2.6 + SR * 0.8 && part.length > exp * 0.3;
  });
  return ok ? parts : null;
};
