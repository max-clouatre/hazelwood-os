import { useCallback, useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, oops } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar, update, useStore } from "../lib/store";
import { pick, shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

// Emoji are limited to older Unicode releases so they render on Android 11.
export const PICTURES: Record<string, [string, string]> = {
  A: ["🍎", "apple"], B: ["🐻", "bear"], C: ["🐱", "cat"], D: ["🐶", "dog"], E: ["🐘", "elephant"],
  F: ["🐟", "fish"], G: ["🍇", "grapes"], H: ["🐴", "horse"], I: ["🍦", "ice cream"], J: ["✈️", "jet"],
  K: ["🔑", "key"], L: ["🦁", "lion"], M: ["🌙", "moon"], N: ["👃", "nose"], O: ["🐙", "octopus"],
  P: ["🐶", "puppy"], Q: ["👸", "queen"], R: ["🌈", "rainbow"], S: ["☀️", "sun"], T: ["🐢", "turtle"],
  U: ["🦄", "unicorn"], V: ["💜", "Violet"], W: ["🐳", "whale"], X: ["🦊", "fox"], Y: ["💛", "yellow"], Z: ["🦓", "zebra"],
};
// Start with letters from things she loves, then the rest in ABC order.
export const LETTER_ORDER = ["V", "C", "U", "P", "A", "B", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "Q", "R", "S", "T", "W", "X", "Y", "Z"];

interface Round { kind: "find" | "starts"; target: string; choices: string[] }

function makeRound(pool: string[], allowStarts: boolean): Round {
  const target = pick(pool);
  const others = shuffle(pool.length >= 5 ? pool.filter((l) => l !== target) : LETTER_ORDER.filter((l) => l !== target)).slice(0, 2);
  // "starts" rounds skip X and Y whose pictures don't make the letter sound at the start
  const kind = allowStarts && Math.random() < 0.45 && !"XY".includes(target) ? "starts" : "find";
  return { kind, target, choices: shuffle([target, ...others]) };
}

export default function LetterPals({ profile }: ActivityProps) {
  const { letterRight } = useStore();
  const poolSize = Math.min(6 + Math.floor(letterRight / 3) * 2, LETTER_ORDER.length);
  const pool = LETTER_ORDER.slice(0, poolSize);
  const allowStarts = letterRight >= 4;
  const [round, setRound] = useState(() => makeRound(pool, allowStarts));
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number>();
  const cfg = useRef({ pool, allowStarts });
  cfg.current = { pool, allowStarts };

  const [emoji, word] = PICTURES[round.target];
  const prompt = round.kind === "find" ? `Find the letter ${round.target}` : `What does ${word} start with?`;
  useEffect(() => { say(prompt); }, [prompt, round]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = useCallback(() => {
    setFound(false); setWrong(null);
    setRound(makeRound(cfg.current.pool, cfg.current.allowStarts));
  }, []);

  const choose = (l: string) => {
    if (found) return;
    if (l === round.target) {
      setFound(true); setBurst((b) => b + 1);
      chime(); say(`${cheer()} ${l} is for ${word}!`);
      addStar(profile);
      update((s) => ({ letterRight: s.letterRight + 1 }));
      timer.current = window.setTimeout(next, 3200);
    } else {
      oops(); setWrong(l);
      say(round.kind === "find" ? `That's ${l}. Find ${round.target}!` : `${word} starts with ${round.target}. Try again!`);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-between px-4 pb-4">
      <div className="flex flex-1 flex-col items-center justify-center">
        {found ? (
          <div className="anim-pop text-center">
            <div className="emoji text-[8rem] leading-none">{emoji}</div>
            <p className="mt-2 text-5xl font-bold drop-shadow">{round.target} is for {word}!</p>
          </div>
        ) : round.kind === "find" ? (
          <button onClick={() => say(prompt)} className="text-center active:scale-95">
            <p className="text-3xl drop-shadow">Find the letter</p>
            <p className="text-[9rem] font-bold leading-none drop-shadow">{round.target}</p>
            <p className="emoji text-2xl">🔊</p>
          </button>
        ) : (
          <button onClick={() => say(prompt)} className="text-center active:scale-95">
            <div className="emoji anim-bob text-[8rem] leading-none">{emoji}</div>
            <p className="text-3xl drop-shadow">What does <b>{word}</b> start with? <span className="emoji">🔊</span></p>
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
