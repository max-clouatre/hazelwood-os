import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note } from "../lib/audio";
import { addStar } from "../lib/store";
import { say } from "../lib/speech";
import { shuffle } from "../lib/util";
import { ALL_ANIMALS, CATEGORIES } from "./animals";
import type { Animal } from "./animals";
import type { ActivityProps } from "./types";

const SPEEDS = [10, 20, 30]; // seconds per animal (20 is the family's usual)
const STAR_EVERY = 5;       // a star after every 5 animals she acts out
const MIX = { id: "mix", name: "Mix it up!", emoji: "🎲", color: "#d95a50", animals: ALL_ANIMALS };

/** "Be a frog!": press Start, a new animal is shouted every few seconds and the kids act it out. No winning or losing. */
export default function AnimalGame({ profile }: ActivityProps) {
  const [cat, setCat] = useState<string>("mix");
  const [secs, setSecs] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [left, setLeft] = useState(0);          // ms left for this animal
  const [done, setDone] = useState(0);          // animals finished this session
  const [lastTotal, setLastTotal] = useState(0);
  const [burst, setBurst] = useState(0);
  const bag = useRef<Animal[]>([]);
  const sounded = useRef(false);
  const state = useRef({ left: 0, done: 0, secs: 20, paused: false });
  const cur = useRef<Animal | null>(null);

  const group = cat === "mix" ? MIX : CATEGORIES.find((c) => c.id === cat) ?? MIX;
  // a shuffled bag: every animal comes up once before any repeats
  const next = (): Animal => {
    if (!bag.current.length) {
      bag.current = shuffle(group.animals);
      // never show the same animal twice in a row when the bag refills
      const top = bag.current.length - 1; if (bag.current.length > 1 && bag.current[top].name === cur.current?.name) { const j = Math.floor(Math.random() * top); [bag.current[top], bag.current[j]] = [bag.current[j], bag.current[top]]; }
    }
    return bag.current.pop()!;
  };
  const announce = (a: Animal) => { cur.current = a; setAnimal(a); sounded.current = false; note(Math.floor(Math.random() * 5)); say(`${a.name}! ${a.act}`, 0.85); };
  const begin = () => {
    bag.current = []; state.current = { left: secs * 1000, done: 0, secs, paused: false };
    setDone(0); setPaused(false); setLeft(secs * 1000); setPlaying(true); announce(next());
  };
  const skip = () => { state.current.left = state.current.secs * 1000; setLeft(state.current.left); announce(next()); };
  const stop = () => { window.speechSynthesis?.cancel?.(); setLastTotal(state.current.done); setPlaying(false); setAnimal(null); };

  // the clock: counts down, shouts the animal's sound halfway, and moves on at zero
  useEffect(() => {
    if (!playing) return;
    let last = Date.now();
    const t = window.setInterval(() => {
      const now = Date.now(), dt = Math.min(500, now - last); last = now;
      if (state.current.paused) return;
      state.current.left -= dt; setLeft(state.current.left);
      const half = state.current.secs * 500;
      if (!sounded.current && state.current.left <= half) { sounded.current = true; if (cur.current) say(cur.current.sound, 0.85); }
      if (state.current.left <= 0) {
        state.current.done += 1; setDone(state.current.done);
        if (state.current.done % STAR_EVERY === 0) { addStar(profile); chime(); setBurst((b) => b + 1); say("Great acting! You earned a star!"); }
        state.current.left = state.current.secs * 1000; setLeft(state.current.left);
        announce(next());
      }
    }, 250);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);
  useEffect(() => () => { window.speechSynthesis?.cancel?.(); }, []);
  const togglePause = () => { state.current.paused = !state.current.paused; setPaused(state.current.paused); if (state.current.paused) window.speechSynthesis?.cancel?.(); };

  if (!playing || !animal) {
    return (
      <div className="flex h-full flex-col items-center gap-3 overflow-y-auto bg-[#2b2d62] p-4 text-center">
        <p className="text-4xl font-bold drop-shadow">🎭 Animal Game</p>
        <p className="text-xl">Pick animals, press Start, and act like each one!</p>
        {lastTotal > 0 && <p className="anim-pop rounded-2xl bg-yellow-300 px-4 py-2 text-xl font-bold text-black">You acted like {lastTotal} animal{lastTotal === 1 ? "" : "s"}! Wow!</p>}
        <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4" data-testid="animal-cats">
          {[MIX, ...CATEGORIES].map((c) => (
            <button key={c.id} onClick={() => { setCat(c.id); note(Math.floor(Math.random() * 5)); say(c.name); }} aria-pressed={cat === c.id} aria-label={`Category ${c.name}`}
              className={`relative flex flex-col items-center rounded-3xl p-3 text-white shadow-xl active:scale-95 ${cat === c.id ? "scale-105 ring-8 ring-yellow-300" : "opacity-80"}`} style={{ background: c.color }}>
              {cat === c.id && <span className="absolute -right-2 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-yellow-300 text-xl font-bold text-black">✓</span>}<span className="emoji text-6xl">{c.emoji}</span><span className="text-xl font-bold leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
        <button onClick={begin} aria-label="Start" className="rounded-3xl bg-mustard px-16 py-5 text-4xl font-bold text-black shadow-xl ring-8 ring-white active:scale-95">▶ Start!</button>
        <div className="flex items-center gap-2 text-lg"><span>New animal every</span>
          {SPEEDS.map((s) => <button key={s} onClick={() => setSecs(s)} aria-pressed={secs === s} aria-label={`${s} seconds`} className={`rounded-xl px-4 py-1 font-bold active:scale-95 ${secs === s ? "bg-mustard text-black" : "bg-white/20"}`}>{s}s</button>)}
        </div>
      </div>
    );
  }

  const frac = Math.max(0, Math.min(1, left / (secs * 1000)));
  const R = 118, C = 2 * Math.PI * R;
  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden p-3 text-center" style={{ background: group.color }} data-testid="animal-play">
      <div className="flex w-full items-center justify-between text-xl font-bold"><span className="rounded-full bg-black/30 px-3 py-1">{group.emoji} {group.name}</span><span className="rounded-full bg-black/30 px-3 py-1" data-testid="animal-count">⭐ {done % STAR_EVERY}/{STAR_EVERY} · {done} done</span></div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <svg viewBox="0 0 260 260" className="absolute h-[min(62vh,70vw)] w-[min(62vh,70vw)] -rotate-90" aria-hidden>
          <circle cx={130} cy={130} r={R} fill="#ffffff" fillOpacity={0.9} stroke="#2b2540" strokeWidth={8} />
          <circle cx={130} cy={130} r={R} fill="none" stroke="#f2b84b" strokeWidth={14} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
        </svg>
        <div key={animal.name + done + (paused ? "p" : "")} className="emoji relative text-[min(34vh,38vw)] leading-none" style={{ animation: paused ? "none" : `mv-${animal.move} ${animal.move === "crawl" ? 2.2 : 1.1}s ease-in-out infinite` }} data-testid="animal-pic">{animal.e}</div>
      </div>
      <p className="text-5xl font-bold drop-shadow" data-testid="animal-name">{paused ? "Paused" : `Be a ${animal.name}!`}</p>
      <p className="text-2xl font-bold drop-shadow">{animal.act}</p>
      <div className="mt-2 flex gap-3">
        <button onClick={togglePause} aria-label={paused ? "Resume" : "Pause"} className="rounded-2xl bg-white px-6 py-3 text-2xl font-bold text-black shadow-xl active:scale-95">{paused ? "▶ Go" : "⏸ Pause"}</button>
        <button onClick={skip} aria-label="Next animal" className="rounded-2xl bg-mustard px-6 py-3 text-2xl font-bold text-black shadow-xl active:scale-95">⏭ Next</button>
        <button onClick={stop} aria-label="Stop" className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-bold text-black shadow-xl active:scale-95">⏹ Done</button>
      </div>
      {burst > 0 && <Burst key={burst} emojis={["⭐", "✨", "🎉"]} />}
    </div>
  );
}
