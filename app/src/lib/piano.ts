// Piano sound and note helpers. Notes are written like "C4", "F#4", "Bb3" (C4 = middle C = MIDI 60).
import { audioCtx } from "./audio";
import { getState } from "./store";

const OFF: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const BLACK_PCS = [1, 3, 6, 8, 10];
export const isBlack = (m: number) => BLACK_PCS.includes(((m % 12) + 12) % 12);
export const pcOf = (m: number) => ((m % 12) + 12) % 12;
export const nameOf = (m: number) => NAMES[pcOf(m)] + (Math.floor(m / 12) - 1);
export const letterOf = (m: number) => NAMES[pcOf(m)];

/** "C#4" -> 61. Returns null for anything that is not a note. */
export function parseNote(s: string): number | null {
  const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(s.trim()); if (!m) return null;
  const v = 12 * (Number(m[3]) + 1) + OFF[m[1].toUpperCase()] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  return v >= 24 && v <= 108 ? v : null;
}

export interface SongNote { midi: number; start: number; dur: number }
/** "C4 D4:2 R:1 E4:.5" -> notes with start/length in beats. `R` is a rest, `:n` is how many beats (default 1), `|` is ignored. */
export function parseSong(text: string): { notes: SongNote[]; beats: number; error?: string } {
  const notes: SongNote[] = []; let t = 0;
  for (const tok of text.replace(/\|/g, " ").split(/\s+/).filter(Boolean)) {
    const [n, d] = tok.split(":"); const dur = d === undefined ? 1 : Number(d);
    if (!(dur > 0) || dur > 16) return { notes, beats: t, error: `"${tok}": the length after : must be a number like 1 or 0.5` };
    if (n.toUpperCase() === "R") { t += dur; continue; }
    const midi = parseNote(n); if (midi === null) return { notes, beats: t, error: `"${tok}" is not a note. Use letters like C4, F#4, Bb3, or R for a rest` };
    notes.push({ midi, start: t, dur }); t += dur;
  }
  return { notes, beats: t, error: notes.length ? undefined : "Type some notes first" };
}

let bus: { ctx: AudioContext; out: AudioNode } | null = null;
function output(): { ctx: AudioContext; out: AudioNode } | null {
  const ctx = audioCtx(); if (!ctx) return null;
  if (!bus || bus.ctx !== ctx) { const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200; const g = ctx.createGain(); g.gain.value = 0.9; lp.connect(g).connect(ctx.destination); bus = { ctx, out: lp }; }
  return bus;
}
/** A soft piano-like note: a few harmonics with a quick bright start that settles and fades. `hold` is how long the key is held (seconds). */
export function pianoNote(midi: number, hold = 0.6, vel = 0.85) {
  if (!getState().sound) return;
  const o = output(); if (!o) return; const { ctx, out } = o; const t = ctx.currentTime;
  const f = 440 * Math.pow(2, (midi - 69) / 12);
  const env = ctx.createGain(); env.connect(out);
  const peak = 0.3 * vel, end = t + Math.max(0.5, hold) + 0.9;
  env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(peak, t + 0.008);
  env.gain.exponentialRampToValueAtTime(peak * 0.45, t + 0.3); env.gain.exponentialRampToValueAtTime(0.0001, end);
  [[1, "triangle", 1], [2, "sine", 0.4], [3, "sine", 0.16], [4, "sine", 0.06]].forEach(([mult, type, amp]) => {
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = type as OscillatorType; osc.frequency.value = f * (mult as number);
    g.gain.value = amp as number; osc.connect(g).connect(env); osc.start(t); osc.stop(end + 0.05);
  });
}
