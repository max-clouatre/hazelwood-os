import { hashString, mulberry32 } from "../wilds/colors";
import { audioCtx } from "./audio";
import { getState } from "./store";

// ---------------------------------------------------------------------------------------------
// A tiny generative music box. Each theme is a handful of settings (tempo, scale, chords, which
// instruments play); every bar is composed on the fly, so the songs loop without ever repeating
// exactly. Everything is synthesized with the Web Audio API: no audio files, works offline.
// ---------------------------------------------------------------------------------------------

export type ThemeId = "hub" | "meadow" | "forest" | "shore" | "cave" | "peak" | "duel";
type Inst = "marimba" | "pluck" | "bell" | "flute";
interface Theme {
  label: string; bpm: number; root: number; scale: number[]; prog: number[][];
  arp: "up" | "updown" | "pulse" | "off"; arpSteps: number[]; arpInst: Inst; arpGain: number;
  mel: { p: number; inst: Inst; oct: number; gain: number };
  bass: "bass" | "drone" | "calypso" | "pump" | "off"; pad: number; swing: number;
  fx: { time: number; fb: number; wet: number }; drums: "none" | "soft" | "drive";
}

const MAJ_PENT = [0, 2, 4, 7, 9], MIN_PENT = [0, 3, 5, 7, 10], LYDIAN = [0, 2, 4, 6, 7, 9, 11], PHRYG_PENT = [0, 1, 5, 7, 8];

export const THEMES: Record<ThemeId, Theme> = {
  hub: { label: "Home base (calm)", bpm: 84, root: 60, scale: MAJ_PENT, prog: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]],
    arp: "up", arpSteps: [0, 2, 4, 6], arpInst: "pluck", arpGain: 0.06, mel: { p: 0.28, inst: "flute", oct: 12, gain: 0.07 },
    bass: "bass", pad: 0.035, swing: 0, fx: { time: 0.32, fb: 0.3, wet: 0.25 }, drums: "none" },
  meadow: { label: "Sunny Meadow (bouncy)", bpm: 112, root: 60, scale: MAJ_PENT, prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]],
    arp: "updown", arpSteps: [0, 1, 2, 3, 4, 5, 6, 7], arpInst: "marimba", arpGain: 0.075, mel: { p: 0.45, inst: "marimba", oct: 12, gain: 0.09 },
    bass: "bass", pad: 0, swing: 0.12, fx: { time: 0.2, fb: 0.2, wet: 0.15 }, drums: "soft" },
  forest: { label: "Misty Forest (mysterious)", bpm: 76, root: 57, scale: MIN_PENT, prog: [[0, 3, 7], [8, 12, 15], [10, 14, 17], [7, 10, 14]],
    arp: "up", arpSteps: [0, 3, 6], arpInst: "pluck", arpGain: 0.06, mel: { p: 0.22, inst: "flute", oct: 12, gain: 0.1 },
    bass: "bass", pad: 0.05, swing: 0, fx: { time: 0.45, fb: 0.42, wet: 0.32 }, drums: "none" },
  shore: { label: "Sparkle Shore (breezy)", bpm: 100, root: 55, scale: MAJ_PENT, prog: [[0, 4, 7], [5, 9, 12], [0, 4, 7], [7, 11, 14]],
    arp: "pulse", arpSteps: [1, 3, 5, 7], arpInst: "marimba", arpGain: 0.08, mel: { p: 0.4, inst: "marimba", oct: 12, gain: 0.09 },
    bass: "calypso", pad: 0, swing: 0.22, fx: { time: 0.22, fb: 0.25, wet: 0.2 }, drums: "soft" },
  cave: { label: "Crystal Cave (echoing)", bpm: 68, root: 50, scale: PHRYG_PENT, prog: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [5, 8, 12]],
    arp: "pulse", arpSteps: [1, 4, 7], arpInst: "bell", arpGain: 0.07, mel: { p: 0.18, inst: "bell", oct: 12, gain: 0.08 },
    bass: "drone", pad: 0.04, swing: 0, fx: { time: 0.5, fb: 0.5, wet: 0.4 }, drums: "none" },
  peak: { label: "Star Peak (dreamy)", bpm: 62, root: 64, scale: LYDIAN, prog: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]],
    arp: "pulse", arpSteps: [0, 2, 4, 6], arpInst: "bell", arpGain: 0.055, mel: { p: 0.3, inst: "bell", oct: 12, gain: 0.07 },
    bass: "bass", pad: 0.06, swing: 0, fx: { time: 0.55, fb: 0.5, wet: 0.45 }, drums: "none" },
  duel: { label: "Duel (fast)", bpm: 132, root: 57, scale: MIN_PENT, prog: [[0, 3, 7], [0, 3, 7], [8, 12, 15], [10, 14, 17]],
    arp: "pulse", arpSteps: [0, 1, 2, 3, 4, 5, 6, 7], arpInst: "pluck", arpGain: 0.07, mel: { p: 0.5, inst: "pluck", oct: 12, gain: 0.09 },
    bass: "pump", pad: 0, swing: 0, fx: { time: 0.15, fb: 0.2, wet: 0.12 }, drums: "drive" },
};

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function blip(ctx: BaseAudioContext, out: AudioNode, type: OscillatorType, f: number, t: number, a: number, d: number, peak: number) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + a + d + 0.05);
}

function note(ctx: BaseAudioContext, out: AudioNode, inst: Inst, midi: number, t: number, len: number, gain: number) {
  const f = hz(midi);
  switch (inst) {
    case "marimba": blip(ctx, out, "sine", f, t, 0.004, 0.32, gain); blip(ctx, out, "sine", f * 4, t, 0.002, 0.08, gain * 0.25); break;
    case "pluck": blip(ctx, out, "triangle", f, t, 0.006, 0.28, gain); break;
    case "bell": blip(ctx, out, "sine", f, t, 0.004, 1.6, gain); blip(ctx, out, "sine", f * 2.76, t, 0.004, 0.9, gain * 0.35); blip(ctx, out, "sine", f * 5.4, t, 0.004, 0.45, gain * 0.15); break;
    case "flute": {
      const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(f, t); lfo.frequency.value = 5; lg.gain.value = f * 0.006; lfo.connect(lg).connect(o.frequency);
      const hold = Math.max(0.3, len);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + hold);
      o.connect(g).connect(out); o.start(t); lfo.start(t); o.stop(t + hold + 0.05); lfo.stop(t + hold + 0.05);
      break;
    }
  }
}

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();
function noise(ctx: BaseAudioContext): AudioBuffer {
  let b = noiseCache.get(ctx);
  if (!b) { b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; noiseCache.set(ctx, b); }
  return b;
}
function hat(ctx: BaseAudioContext, out: AudioNode, t: number, g: number) {
  const s = ctx.createBufferSource(); s.buffer = noise(ctx);
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
  const e = ctx.createGain(); e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(hp).connect(e).connect(out); s.start(t); s.stop(t + 0.08);
}
function snare(ctx: BaseAudioContext, out: AudioNode, t: number, g: number) {
  const s = ctx.createBufferSource(); s.buffer = noise(ctx);
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800;
  const e = ctx.createGain(); e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  s.connect(bp).connect(e).connect(out); s.start(t); s.stop(t + 0.16);
  blip(ctx, out, "triangle", 190, t, 0.002, 0.08, g * 0.5);
}
function kick(ctx: BaseAudioContext, out: AudioNode, t: number, g: number) {
  const o = ctx.createOscillator(), e = ctx.createGain();
  o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(e).connect(out); o.start(t); o.stop(t + 0.2);
}

/** Compose and schedule one 4-beat bar. Deterministic for a given theme and bar number. */
export function scheduleBar(ctx: BaseAudioContext, out: AudioNode, id: ThemeId, bar: number, t0: number, tempoMul = 1) {
  const th = THEMES[id];
  const rng = mulberry32(hashString(id) + bar * 7919);
  const spb = 60 / (th.bpm * tempoMul);
  const step = spb / 2;
  const chord = th.prog[bar % th.prog.length];
  const when = (s: number) => t0 + s * step + (s % 2 === 1 ? step * th.swing : 0);
  const tones = chord.map((c) => th.root + c);

  // bass
  const bassNote = th.root + chord[0] - 24;
  if (th.bass === "bass") { note(ctx, out, "pluck", bassNote, when(0), spb, 0.16); note(ctx, out, "pluck", bassNote, when(4), spb, 0.13); }
  else if (th.bass === "calypso") { [0, 3, 4, 7].forEach((s) => note(ctx, out, "pluck", bassNote + (s === 3 ? 7 : 0), when(s), spb * 0.5, 0.14)); }
  else if (th.bass === "pump") { [0, 2, 4, 6].forEach((s) => note(ctx, out, "pluck", bassNote, when(s), spb * 0.4, 0.14)); }
  else if (th.bass === "drone") {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = hz(bassNote); f.type = "lowpass"; f.frequency.value = 260;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.6); g.gain.setValueAtTime(0.07, t0 + step * 7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + step * 8);
    o.connect(f).connect(g).connect(out); o.start(t0); o.stop(t0 + step * 8 + 0.05);
  }

  // soft pad on the chord
  if (th.pad > 0) tones.forEach((m) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = hz(m); o.detune.value = (rng() - 0.5) * 8;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(th.pad, t0 + step * 2); g.gain.setValueAtTime(th.pad, t0 + step * 6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + step * 8);
    o.connect(g).connect(out); o.start(t0); o.stop(t0 + step * 8 + 0.05);
  });

  // arpeggio
  if (th.arp !== "off") th.arpSteps.forEach((s, k) => {
    const order = th.arp === "updown" ? [0, 1, 2, 1] : th.arp === "up" ? [0, 1, 2, 3] : [0, 2, 1, 2];
    const idx = order[k % order.length] % tones.length;
    note(ctx, out, th.arpInst, tones[idx] + 12, when(s), step, th.arpGain);
  });

  // melody: wanders gently up and down the scale
  let pos = Math.floor(rng() * th.scale.length);
  for (let s = 0; s < 8; s++) {
    const strong = s === 0 || s === 4;
    if (rng() > th.mel.p * (strong ? 1.5 : 1) || (s % 2 === 1 && rng() < 0.5)) continue;
    pos = Math.max(0, Math.min(th.scale.length * 2 - 1, pos + (rng() < 0.5 ? -1 : 1) * (rng() < 0.7 ? 1 : 2)));
    const octShift = Math.floor(pos / th.scale.length) * 12;
    note(ctx, out, th.mel.inst, th.root + th.mel.oct + th.scale[pos % th.scale.length] + octShift, when(s), step * (1 + Math.floor(rng() * 3)), th.mel.gain);
  }

  // drums
  if (th.drums !== "none") {
    const drive = th.drums === "drive";
    [0, 4].forEach((s) => kick(ctx, out, when(s), drive ? 0.22 : 0.14));
    if (drive) [2, 6].forEach((s) => kick(ctx, out, when(s), 0.16));
    [2, 6].forEach((s) => snare(ctx, out, when(s), drive ? 0.1 : 0.05));
    for (let s = 0; s < 8; s++) if (drive || s % 2 === 1) hat(ctx, out, when(s), drive ? 0.05 : 0.03);
  }
}

/** Reverb-ish echo bus feeding `dest`. */
export function makeChain(ctx: BaseAudioContext, fx: Theme["fx"], dest: AudioNode): GainNode {
  const bus = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 1;
  const delay = ctx.createDelay(1.5); delay.delayTime.value = fx.time;
  const fb = ctx.createGain(); fb.gain.value = fx.fb;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
  const wet = ctx.createGain(); wet.gain.value = fx.wet;
  bus.connect(dry).connect(dest);
  bus.connect(delay); delay.connect(lp); lp.connect(fb).connect(delay); lp.connect(wet).connect(dest);
  return bus;
}

/** Render a theme off-screen (used by the music test page to check levels). */
export async function renderTheme(id: ThemeId, bars: number, tempoMul = 1) {
  const sr = 22050;
  const spb = 60 / (THEMES[id].bpm * tempoMul);
  const len = Math.ceil((bars * 4 * spb + 3) * sr);
  const ctx = new OfflineAudioContext(1, len, sr);
  const master = ctx.createGain(); master.gain.value = 0.95; master.connect(ctx.destination);
  const bus = makeChain(ctx, THEMES[id].fx, master);
  for (let b = 0; b < bars; b++) scheduleBar(ctx, bus, id, b, 0.1 + b * 4 * spb, tempoMul);
  const buf = await ctx.startRendering();
  const d = buf.getChannelData(0);
  let peak = 0, sum = 0, nonSilent = 0;
  for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; sum += d[i] * d[i]; if (a > 0.003) nonSilent++; }
  return { peak, rms: Math.sqrt(sum / d.length), seconds: d.length / sr, activeShare: nonSilent / d.length };
}

// ------------------------------------------------------------------ live playback
let live: { id: ThemeId; intense: boolean; bus: GainNode; next: number; bar: number } | null = null;
let master: GainNode | null = null;
let timer: number | undefined;
let duckUntil = 0;

const enabled = () => getState().sound && getState().music && !document.hidden;

function ensureMaster(ctx: AudioContext) {
  if (!master) { master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination); }
  return master;
}

function tick() {
  const ctx = audioCtx(); if (!ctx || !live || !master) return;
  const want = enabled() ? (Date.now() < duckUntil ? 0.22 : 0.95) : 0;
  master.gain.setTargetAtTime(want, ctx.currentTime, 0.12);
  if (!want) { live.next = Math.max(live.next, ctx.currentTime + 0.2); return; }
  const mul = live.intense ? 1.14 : 1;
  const barLen = 4 * 60 / (THEMES[live.id].bpm * mul);
  while (live.next < ctx.currentTime + 1.2) { scheduleBar(ctx, live.bus, live.id, live.bar, live.next, mul); live.next += barLen; live.bar++; }
}

/** Start (or switch to) a theme. Safe to call again with the same theme. */
export function playTheme(id: ThemeId, intense = false) {
  const ctx = audioCtx(); if (!ctx) return;
  if (live && live.id === id && live.intense === intense) return;
  const m = ensureMaster(ctx);
  if (live) { const old = live.bus; old.gain.setTargetAtTime(0, ctx.currentTime, 0.2); setTimeout(() => old.disconnect(), 1500); }
  const bus = makeChain(ctx, THEMES[id].fx, m);
  live = { id, intense, bus, next: ctx.currentTime + 0.15, bar: 0 };
  if (timer === undefined) timer = window.setInterval(tick, 250);
  tick();
}

export function stopMusic() {
  const ctx = audioCtx();
  if (live && ctx) { const old = live.bus; old.gain.setTargetAtTime(0, ctx.currentTime, 0.15); setTimeout(() => old.disconnect(), 1200); }
  live = null;
  if (timer !== undefined) { clearInterval(timer); timer = undefined; }
}

/** Turn the music down while a voice is talking. */
export function duck(ms = 2500) { duckUntil = Date.now() + ms; }
