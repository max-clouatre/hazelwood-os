import { duck } from "./music";
import { getState } from "./store";

export const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

let voice: SpeechSynthesisVoice | null = null;
function pickVoice() {
  if (!speechSupported || voice) return;
  const vs = speechSynthesis.getVoices();
  voice = vs.find((v) => /en[-_]US/i.test(v.lang)) ?? vs.find((v) => /^en/i.test(v.lang)) ?? null;
}
if (speechSupported) {
  pickVoice();
  speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

/** Hazelwild can switch the narrator off without touching sounds, music or other activities. */
let narrator = true;
export const setNarrator = (on: boolean) => { narrator = on; if (!on && speechSupported) { try { speechSynthesis.cancel(); } catch { /* ignore */ } } };

/** Speak text with the tablet's built-in voice (works offline if an offline voice is installed). */
export function say(text: string, rate = 0.85) {
  if (!speechSupported || !narrator || !getState().sound) return;
  try {
    duck(Math.min(5000, 1200 + text.length * 70));
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = 1.15;
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

const CHEERS = ["Great job!", "Wow!", "You did it!", "Awesome!", "Hooray!", "Fantastic!", "Super!"];
export const cheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];
