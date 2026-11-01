import { useCallback, useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, oops } from "../lib/audio";
import { say } from "../lib/speech";
import { addStar, update, useStore } from "../lib/store";
import { pick, shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

// Emoji are limited to older Unicode releases so they render on Android 11.
const PICTURES: Record<string, [string, string]> = {
  A: ["🍎", "apple"], B: ["🐻", "bear"], C: ["🐱", "cat"], D: ["🐶", "dog"], E: ["🐘", "elephant"],
  F: ["🐟", "fish"], G: ["🍇", "grapes"], H: ["🐴", "horse"], I: ["🍦", "ice cream"], J: ["✈️", "jet"],
  K: ["🔑", "key"], L: ["🦁", "lion"], M: ["🌙", "moon"], N: ["👃", "nose"], O: ["🐙", "octopus"],
  P: ["🐶", "puppy"], Q: ["👸", "queen"], R: ["🌈", "rainbow"], S: ["☀️", "sun"], T: ["🐢", "turtle"],
  U: ["🦄", "unicorn"], V: ["💜", "Violet"], W: ["🐳", "whale"], X: ["🦊", "fox"], Y: ["💛", "yellow"], Z: ["🦓", "zebra"],
};
// Start with letters from things she loves, then the rest in ABC order.
const ORDER = ["V", "C", "U", "P", "A", "B", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "Q", "R", "S", "T", "W", "X", "Y", "Z"];

function makeRound(pool: string[]) {
  const target = pick(pool);
  const others = shuffle(ORDER.filter((l) => l !== target)).slice(0, 2);
  return { target, choices: shuffle([target, ...others]) };
}

export default function LetterPals({ profile }: ActivityProps) {
  const { letterRight } = useStore();
  const poolSize = Math.min(6 + Math.floor(letterRight / 3) * 2, ORDER.length);
  const pool = ORDER.slice(0, poolSize);
  const [round, setRound] = useState(() => makeRound(pool));
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number>();
  const poolRef = useRef(pool);
  poolRef.current = pool;

  useEffect(() => { say(`Find the letter ${round.target}`); }, [round]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = useCallback(() => {
    setFound(false); setWrong(null);
    setRound(makeRound(poolRef.current));
  }, []);

  const choose = (l: string) => {
    if (found) return;
    if (l === round.target) {
      const [, word] = PICTURES[l];
      setFound(true); setBurst((b) => b + 1);
      chime(); say(`${l} is for ${word}!`);
      addStar(profile);
      update((s) => ({ letterRight: s.letterRight + 1 }));
      timer.current = window.setTimeout(next, 3000);
    } else {
      oops(); setWrong(l);
      say(`That's ${l}. Find ${round.target}!`);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  const [emoji, word] = PICTURES[round.target];
  return (
    <div className="flex h-full flex-col items-center justify-between px-4 pb-4">
      <div className="flex flex-1 flex-col items-center justify-center">
        {found ? (
          <div className="anim-pop text-center">
            <div className="emoji text-[8rem] leading-none">{emoji}</div>
            <p className="mt-2 text-5xl font-bold drop-shadow">{round.target} is for {word}!</p>
          </div>
        ) : (
          <button onClick={() => say(`Find the letter ${round.target}`)} className="text-center active:scale-95">
            <p className="text-3xl drop-shadow">Find the letter</p>
            <p className="text-[9rem] font-bold leading-none drop-shadow">{round.target}</p>
            <p className="emoji text-2xl">🔊</p>
          </button>
        )}
      </div>
      <div className="flex gap-5">
        {round.choices.map((l) => (
          <button key={l} onClick={() => choose(l)}
            className={`h-32 w-32 rounded-3xl bg-white text-7xl font-bold text-fuchsia-700 shadow-xl active:scale-95 ${wrong === l ? "anim-shake !bg-red-200" : ""} ${found && l === round.target ? "!bg-yellow-200" : ""}`}>
            {l}
          </button>
        ))}
      </div>
      {burst > 0 && <Burst key={burst} emojis={["⭐", emoji, "💖"]} />}
    </div>
  );
}
