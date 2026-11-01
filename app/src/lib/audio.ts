import { getState } from "./store";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new C();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch { return null; }
}

export function tone(freq: number, when = 0, dur = 0.4, type: OscillatorType = "sine", vol = 0.22) {
  if (!getState().sound) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
export const note = (i?: number) => tone(PENTA[(i ?? Math.floor(Math.random() * PENTA.length)) % PENTA.length]);
export const chime = () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.45));
export const oops = () => { tone(220, 0, 0.25, "triangle", 0.18); tone(196, 0.12, 0.3, "triangle", 0.18); };

/** Browsers block audio until a touch. Call once from a pointerdown handler. */
export const unlockAudio = () => { ac(); };
