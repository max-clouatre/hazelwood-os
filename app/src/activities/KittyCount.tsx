import { useCallback, useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar, update, useStore } from "../lib/store";
import { pick, rand, shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const CRITTERS = [
  { e: "🐱", name: "kitties" },
  { e: "🦄", name: "unicorns" },
  { e: "🐶", name: "puppies" },
];
type Critter = (typeof CRITTERS)[number];

interface Round { kind: "count" | "give"; n: number; critter: Critter; choices: number[]; total: number }

function makeRound(max: number, allowGive: boolean): Round {
  const n = 1 + rand(max);
  const others = shuffle(Array.from({ length: Math.min(max + 1, 10) }, (_, i) => i + 1).filter((x) => x !== n)).slice(0, 2);
  const kind = allowGive && Math.random() < 0.45 ? "give" : "count";
  return { kind, n, critter: pick(CRITTERS), choices: shuffle([n, ...others]), total: Math.min(n + 2 + rand(3), 12) };
}

export default function KittyCount({ profile }: ActivityProps) {
  const { countRight } = useStore();
  const max = Math.min(3 + Math.floor(countRight / 4), 10); // starts with 1-3, grows as she gets them right
  const allowGive = countRight >= 3; // "Pick exactly N" unlocks after a few rounds
  const [round, setRound] = useState<Round>(() => makeRound(max, allowGive));
  const [counted, setCounted] = useState<number[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [won, setWon] = useState(0);
  const locked = useRef(false);
  const timer = useRef<number>();

  useEffect(() => {
    say(round.kind === "count" ? `Count the ${round.critter.name}!` : `Pick ${WORDS[round.n]} ${round.critter.name}!`);
  }, [round]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = useCallback(() => {
    locked.current = false;
    setCounted([]); setPicked([]); setWrong(null); setWon(0);
    setRound(makeRound(max, allowGive));
  }, [max, allowGive]);

  const win = () => {
    locked.current = true;
    chime(); say(`${cheer()} ${WORDS[round.n]}!`);
    setWon((w) => w + 1);
    addStar(profile);
    update((s) => ({ countRight: s.countRight + 1 }));
    timer.current = window.setTimeout(next, 2400);
  };
  const lose = (msg: string) => { oops(); say(msg); };

  const tapCritter = (i: number) => {
    if (locked.current) return;
    if (round.kind === "count") {
      if (counted.includes(i)) return;
      const k = counted.length + 1;
      setCounted((c) => [...c, i]); note(k); say(WORDS[k]);
    } else {
      const has = picked.includes(i);
      const np = has ? picked.filter((x) => x !== i) : [...picked, i];
      setPicked(np); note(np.length);
      if (!has) say(WORDS[np.length]);
    }
  };

  const answer = (v: number) => {
    if (locked.current) return;
    if (v === round.n) win();
    else { setWrong(v); lose("Let's count them!"); window.setTimeout(() => setWrong(null), 500); }
  };

  const done = () => {
    if (locked.current) return;
    if (picked.length === round.n) win();
    else lose(picked.length < round.n ? `Pick ${WORDS[round.n]}. You have ${WORDS[picked.length] || "none"}.` : `That's too many. Pick ${WORDS[round.n]}.`);
  };

  const count = round.kind === "count";
  const items = count ? round.n : round.total;
  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 px-4 pb-4">
      <p className="text-center text-3xl font-bold drop-shadow">
        {count ? `How many ${round.critter.name}? Touch to count!` : `Pick ${round.n} ${round.critter.name}!`}
      </p>
      <div className="flex max-w-3xl flex-1 flex-wrap content-center items-center justify-center gap-3">
        {Array.from({ length: items }, (_, i) => {
          const isOn = count ? counted.includes(i) : picked.includes(i);
          const badge = count ? counted.indexOf(i) + 1 : picked.indexOf(i) + 1;
          return (
            <button key={`${round.kind}-${round.n}-${i}`} onClick={() => tapCritter(i)} aria-label={`${round.critter.name} ${i + 1}`}
              className={`relative rounded-3xl active:scale-90 ${count ? "h-28 w-28" : "h-24 w-24"} ${isOn && !count ? "bg-yellow-200/70 ring-4 ring-yellow-300" : "bg-white/20"}`}>
              <span className={`emoji ${count ? "text-7xl" : "text-6xl"} ${isOn ? "" : "anim-bob"}`}>{round.critter.e}</span>
              {isOn && (
                <span className="anim-pop absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 text-2xl font-bold text-black">{badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {count ? (
        <div className="flex gap-5">
          {round.choices.map((c) => (
            <button key={c} onClick={() => answer(c)}
              className={`h-28 w-28 rounded-3xl bg-white text-6xl font-bold text-fuchsia-700 shadow-xl active:scale-95 ${wrong === c ? "anim-shake !bg-red-200" : ""}`}>{c}</button>
          ))}
        </div>
      ) : (
        <button onClick={done} className="rounded-3xl bg-emerald-300 px-10 py-4 text-4xl font-bold text-emerald-900 shadow-xl active:scale-95">
          <span className="emoji">✅</span> Done
        </button>
      )}
      {won > 0 && <Burst key={won} emojis={["⭐", round.critter.e, "💖"]} />}
    </div>
  );
}
