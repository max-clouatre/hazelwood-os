import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { cheer, say, speechSupported } from "../lib/speech";
import { addStar, DEFAULT_SPELLING, getState, noteSpellingResult, useStore } from "../lib/store";
import { rand, shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

interface Tile { id: number; ch: string }
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const ROUND = 5; // words per rainbow
const RAINBOW = ["#ef4444", "#fb923c", "#facc15", "#22c55e", "#3b82f6"];

function makeTiles(word: string): Tile[] {
  const extras = shuffle(ALPHABET.split("").filter((c) => !word.includes(c))).slice(0, 2); // two decoys
  return shuffle([...word.split(""), ...extras]).map((ch, id) => ({ id, ch }));
}

/** Words she missed come up more often: weight = 1 + 2 per recent miss. */
function chooseWord(words: string[], avoid: string): string {
  const misses = getState().misses;
  const pool = words.length > 1 ? words.filter((w) => w !== avoid) : words;
  const bag = pool.flatMap((w) => Array<string>(1 + 2 * (misses[w] ?? 0)).fill(w));
  return bag[rand(bag.length)];
}

export default function SpellingUnicorn({ profile }: ActivityProps) {
  const { spelling } = useStore();
  const words = useMemo(() => (spelling.length ? spelling : DEFAULT_SPELLING), [spelling]);
  const [word, setWord] = useState(() => chooseWord(words, ""));
  const [tiles, setTiles] = useState(() => makeTiles(word));
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [peek, setPeek] = useState(false);
  const [done, setDone] = useState(0);
  const [rainbow, setRainbow] = useState(0); // words completed in this round
  const [roundDone, setRoundDone] = useState(false);
  const missed = useRef(false);
  const last = useRef(word);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const nextWord = useCallback((resetRound: boolean) => {
    const w = chooseWord(words, last.current);
    last.current = w; missed.current = false;
    setWord(w); setTiles(makeTiles(w)); setPlaced([]); setDone(0); setPeek(false);
    if (resetRound) { setRainbow(0); setRoundDone(false); }
  }, [words]);

  useEffect(() => { say(`Spell the word: ${word}`); }, [word]);
  // If the list changes, make sure the current word is still on it.
  useEffect(() => { if (!words.includes(word)) nextWord(false); }, [words, word, nextWord]);

  const tap = (t: Tile) => {
    if (done || roundDone || placed.some((p) => p.id === t.id)) return;
    if (t.ch === word[placed.length]) {
      const np = [...placed, t];
      setPlaced(np); note(np.length); say(t.ch, 1);
      if (np.length === word.length) {
        setDone((d) => d + 1);
        noteSpellingResult(word, missed.current);
        addStar(profile);
        const count = rainbow + 1;
        setRainbow(count);
        if (count >= ROUND) {
          later(() => { chime(); say(`${word}! A whole rainbow! ${cheer()}`); addStar(profile, 2); setRoundDone(true); }, 400);
          later(() => nextWord(true), 4200);
        } else {
          later(() => { chime(); say(`${word}! ${cheer()}`); }, 400);
          later(() => nextWord(false), 2800);
        }
      }
    } else {
      oops(); setShake(t.id); later(() => setShake(null), 400);
      missed.current = true;
    }
  };

  const showWord = peek || done > 0 || !speechSupported;
  const used = new Set(placed.map((p) => p.id));

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-4 pb-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1" aria-label={`Word ${Math.min(rainbow + 1, ROUND)} of ${ROUND}`}>
          {RAINBOW.map((c, i) => <span key={i} className="h-4 w-12 rounded-full" style={{ background: i < rainbow ? c : "rgba(255,255,255,.25)" }} />)}
        </div>
        <div className="flex gap-3">
          <button onClick={() => say(word, 0.7)} className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-bold text-purple-700 shadow-lg active:scale-95">
            <span className="emoji">🔊</span> Hear it
          </button>
          {speechSupported && (
            <button onClick={() => { setPeek(true); missed.current = true; later(() => setPeek(false), 2500); }}
              className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-bold text-purple-700 shadow-lg active:scale-95">
              <span className="emoji">👀</span> Peek
            </button>
          )}
        </div>
        <p className="h-12 text-4xl font-bold tracking-widest drop-shadow">{showWord ? word : ""}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {word.split("").map((ch, i) => (
          <div key={i} className={`flex h-20 w-16 items-center justify-center rounded-2xl border-4 text-5xl font-bold ${placed[i] ? "anim-pop border-yellow-300 bg-white text-purple-700" : "border-dashed border-white/60 bg-white/10"}`}>
            {placed[i] ? ch : ""}
          </div>
        ))}
      </div>

      <div className="flex max-w-3xl flex-wrap justify-center gap-3">
        {tiles.map((t) => (
          <button key={t.id} onClick={() => tap(t)} disabled={used.has(t.id)}
            className={`h-20 w-20 rounded-2xl bg-fuchsia-100 text-5xl font-bold text-fuchsia-700 shadow-lg active:scale-90 ${used.has(t.id) ? "invisible" : ""} ${shake === t.id ? "anim-shake !bg-red-200" : ""}`}>
            {t.ch}
          </button>
        ))}
        <button onClick={() => setPlaced((p) => p.slice(0, -1))} aria-label="Undo"
          className="emoji h-20 w-20 rounded-2xl bg-white/20 text-4xl active:scale-90">⌫</button>
      </div>

      {roundDone && (
        <div className="anim-pop absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/50">
          <span className="emoji text-[8rem] leading-none">🌈</span>
          <span className="text-4xl font-bold">Rainbow complete! +2 <span className="emoji">⭐</span></span>
        </div>
      )}
      {done > 0 && <Burst key={`${done}-${rainbow}`} emojis={["⭐", "🦄", "🌈", "✨"]} />}
    </div>
  );
}
