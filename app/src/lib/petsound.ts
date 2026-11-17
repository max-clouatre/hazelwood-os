// Tiny synthesized pet sounds (no audio files). They respect the Sound switch like every other sound in the app.
import { audioCtx } from "./audio";
import { getState } from "./store";

function env(ctx: AudioContext, t: number, dur: number, vol: number): GainNode { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); g.connect(ctx.destination); return g; }
function glide(ctx: AudioContext, type: OscillatorType, f0: number, f1: number, t: number, dur: number, vol: number, lp = 2400) {
  const o = ctx.createOscillator(), f = ctx.createBiquadFilter(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  f.type = "lowpass"; f.frequency.value = lp; o.connect(f).connect(env(ctx, t, dur, vol)); o.start(t); o.stop(t + dur + 0.05);
}
const ok = () => (getState().sound ? audioCtx() : null);
export const bark = () => { const c = ok(); if (!c) return; const t = c.currentTime; glide(c, "sawtooth", 420, 190, t, 0.13, 0.2, 1500); glide(c, "sawtooth", 470, 210, t + 0.2, 0.15, 0.2, 1500); };
export const meow = () => { const c = ok(); if (!c) return; const t = c.currentTime; glide(c, "triangle", 520, 900, t, 0.22, 0.2, 3000); glide(c, "triangle", 900, 560, t + 0.22, 0.3, 0.2, 2800); };
export const purr = () => { const c = ok(); if (!c) return; const t = c.currentTime; for (let i = 0; i < 9; i++) glide(c, "sawtooth", 70, 62, t + i * 0.085, 0.06, 0.11, 500); };
export const crunch = () => { const c = ok(); if (!c) return; const t = c.currentTime; for (let i = 0; i < 4; i++) glide(c, "square", 180 + i * 20, 90, t + i * 0.09, 0.05, 0.12, 900); };
export const pop = () => { const c = ok(); if (!c) return; glide(c, "sine", 500, 900, c.currentTime, 0.12, 0.16); };
