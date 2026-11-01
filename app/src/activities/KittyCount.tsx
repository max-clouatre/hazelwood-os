import { useCallback, useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { say } from "../lib/speech";
import { addStar, update, useStore } from "../lib/store";
import { pick, rand, shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const CRITTERS = [
  { e: "🐱", name: "kitties" },
  { e: "🦄", name: "unicorns" },
  { e: "🐶", name: "puppies" },
];

interface Round { n: number; critter: (typeof CRITTERS)[number]; choices: number[] }

function makeRound(max: number): Round {
  const n = 1 + rand(max);
  const others = shuffle(Array.from({ length: max + 1 }, (_, i) => i + 1).filter((x) => x !== n && x <= 10)).slice(0, 2);
  return { n, critter: pick(CRITTERS), choices: shuffle([n, ...others]) };
}

export default function KittyCount({ profile }: ActivityProps) {
  const { countRight } = useStore();
  const max = Math.min(3 + Math.floor(countRight / 4), 10); // starts with 1-3, grows as she gets them right
  const [round, setRound] = useState<Round>(() => makeRound(max));
  const [counted, setCounted] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [won, setWon] = useState(0); // bump to replay the burst
  const locked = useRef(false);
  const timer = useRef<number>();

  useEffect(() => { say(`Count the ${round.critter.name}!`); }, [round]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = useCallback(() => {
    locked.current = false;
    setCounted([]); setWrong(null); setWon(0);
    setRound(makeRound(max));
  }, [max]);

  const tapCritter = (i: number) => {
    if (counted.includes(i)) return;
    const k = counted.length + 1;
    setCounted((c) => [...c, i]);
    note(k);
    say(WORDS[k]);
  };

  const answer = (v: number) => {
    if (locked.current) return;
    if (v === round.n) {
      locked.current = true;
      chime(); say(`Yes! ${WORDS[v]}!`);
      setWon((w) => w + 1);
      addStar(profile);
      update((s) => ({ countRight: s.countRight + 1 }));
      timer.current = window.setTimeout(next, 2200);
    } else {
      oops(); setWrong(v);
      say("Let's count them!");
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 px-4 pb-4">
      <p className="text-center text-3xl font-bold drop-shadow">How many {round.critter.name}? Touch to count!</p>
      <div className="flex max-w-3xl flex-1 flex-wrap content-center items-center justify-center gap-3">
        {Array.from({ length: round.n }, (_, i) => (
          <button key={`${round.n}-${i}`} onClick={() => tapCritter(i)} aria-label={`${round.critter.name} ${i + 1}`}
            className="relative h-28 w-28 rounded-3xl bg-white/20 active:scale-90">
            <span className={`emoji text-7xl ${counted.includes(i) ? "" : "anim-bob"}`}>{round.critter.e}</span>
            {counted.includes(i) && (
              <span className="anim-pop absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 text-2xl font-bold text-black">
                {counted.indexOf(i) + 1}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-5">
        {round.choices.map((c) => (
          <button key={c} onClick={() => answer(c)}
            className={`h-28 w-28 rounded-3xl bg-white text-6xl font-bold text-fuchsia-700 shadow-xl active:scale-95 ${wrong === c ? "anim-shake !bg-red-200" : ""}`}>
            {c}
          </button>
        ))}
      </div>
      {won > 0 && <Burst key={won} emojis={["⭐", "🐱", "🦄", "💖"]} />}
    </div>
  );
}
