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

/** Speak text with the tablet's built-in voice (works offline if an offline voice is installed). */
export function say(text: string, rate = 0.85) {
  if (!speechSupported || !getState().sound) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = 1.15;
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
