import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { say, speechSupported } from "../lib/speech";
import { addStar, DEFAULT_SPELLING, update, useStore } from "../lib/store";
import { rand, shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

interface Tile { id: number; ch: string }
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function makeTiles(word: string): Tile[] {
  const extras = shuffle(ALPHABET.split("").filter((c) => !word.includes(c))).slice(0, 2); // two decoys
  return shuffle([...word.split(""), ...extras]).map((ch, id) => ({ id, ch }));
}

function Editor({ words, onClose }: { words: string[]; onClose: () => void }) {
  const [text, setText] = useState(words.join("\n"));
  const save = () => {
    const list = Array.from(new Set(text.split(/[\s,;]+/).map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter((w) => w.length >= 2 && w.length <= 14)));
    update(() => ({ spelling: list.length ? list : DEFAULT_SPELLING }));
    onClose();
  };
  return (
    <div className="absolute inset-0 z-30 flex flex-col gap-3 bg-indigo-950/95 p-5">
      <h2 className="text-2xl font-bold">Spelling list (one word per line)</h2>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        className="flex-1 rounded-xl bg-white p-3 text-2xl text-black" autoCapitalize="none" spellCheck={false} />
      <div className="flex gap-3">
        <button onClick={save} className="rounded-xl bg-emerald-400 px-6 py-3 text-xl font-bold text-black">Save</button>
        <button onClick={() => setText(DEFAULT_SPELLING.join("\n"))} className="rounded-xl bg-white/20 px-6 py-3 text-xl">Reset to starter list</button>
        <button onClick={onClose} className="rounded-xl bg-white/20 px-6 py-3 text-xl">Cancel</button>
      </div>
    </div>
  );
}

export default function SpellingUnicorn({ profile }: ActivityProps) {
  const { spelling } = useStore();
  const words = useMemo(() => (spelling.length ? spelling : DEFAULT_SPELLING), [spelling]);
  const [word, setWord] = useState(() => words[rand(words.length)]);
  const [tiles, setTiles] = useState(() => makeTiles(word));
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [peek, setPeek] = useState(false);
  const [done, setDone] = useState(0);
  const [editing, setEditing] = useState(false);
  const last = useRef(word);
  const timers = useRef<number[]>([]);
  const hold = useRef<number>();
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => () => { timers.current.forEach(clearTimeout); window.clearTimeout(hold.current); }, []);

  const nextWord = useCallback(() => {
    let w = words[rand(words.length)];
    if (words.length > 1) while (w === last.current) w = words[rand(words.length)];
    last.current = w;
    setWord(w); setTiles(makeTiles(w)); setPlaced([]); setDone(0); setPeek(false);
  }, [words]);

  useEffect(() => { say(`Spell the word: ${word}`); }, [word]);
  // If the word list changes while editing, make sure the current word is still on it.
  useEffect(() => { if (!words.includes(word)) nextWord(); }, [words, word, nextWord]);

  const tap = (t: Tile) => {
    if (done || placed.some((p) => p.id === t.id)) return;
    if (t.ch === word[placed.length]) {
      const np = [...placed, t];
      setPlaced(np); note(np.length);
      if (np.length === word.length) {
        setDone((d) => d + 1);
        chime(); say(`${word}! You spelled ${word}!`);
        addStar(profile);
        later(nextWord, 2800);
      }
    } else {
      oops(); setShake(t.id); later(() => setShake(null), 400);
    }
  };

  const showWord = peek || done > 0 || !speechSupported;
  const used = new Set(placed.map((p) => p.id));

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-4 pb-4">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <button onClick={() => say(word, 0.7)} className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-bold text-purple-700 shadow-lg active:scale-95">
            <span className="emoji">🔊</span> Hear it
          </button>
          {speechSupported && (
            <button onClick={() => { setPeek(true); later(() => setPeek(false), 2500); }}
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

      <button aria-label="Edit spelling list (hold)"
        onPointerDown={() => { hold.current = window.setTimeout(() => setEditing(true), 1500); }}
        onPointerUp={() => window.clearTimeout(hold.current)} onPointerLeave={() => window.clearTimeout(hold.current)}
        className="absolute bottom-2 right-2 h-10 w-10 rounded-full text-xl opacity-30">⚙️</button>

      {done > 0 && <Burst key={done} emojis={["⭐", "🦄", "🌈", "✨"]} />}
      {editing && <Editor words={words} onClose={() => setEditing(false)} />}
    </div>
  );
}
