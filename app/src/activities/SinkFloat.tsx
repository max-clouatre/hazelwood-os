import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, oops, tone } from "../lib/audio";
import { addStar } from "../lib/store";
import { cheer, say } from "../lib/speech";
import { shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

interface Item { e: string; name: string; floats: boolean; why: string }
// Emoji limited to older Unicode releases so they draw on Android 11.
const ITEMS: Item[] = [
  { e: "🍎", name: "apple", floats: true, why: "Apples have tiny air pockets inside, so an apple is lighter than the same amount of water." },
  { e: "⚓", name: "anchor", floats: false, why: "An anchor is heavy metal packed into a small space. That is denser than water." },
  { e: "🦆", name: "rubber duck", floats: true, why: "A rubber duck is hollow and full of air, which is much lighter than water." },
  { e: "🔑", name: "key", floats: false, why: "Metal is denser than water, so a key sinks." },
  { e: "🍊", name: "orange", floats: true, why: "The peel is full of tiny air pockets. Peel the orange and it often sinks!" },
  { e: "🔨", name: "hammer", floats: false, why: "The metal head is heavy for its size, so the hammer sinks." },
  { e: "🏀", name: "basketball", floats: true, why: "A ball is mostly air, and air is much lighter than water." },
  { e: "🔩", name: "nut and bolt", floats: false, why: "Steel is about 8 times heavier than the same amount of water." },
  { e: "🍃", name: "leaf", floats: true, why: "A leaf is thin and light, with tiny air spaces inside." },
  { e: "💎", name: "gem", floats: false, why: "Gems are dense minerals. They are heavier than water for their size." },
  { e: "✏️", name: "pencil", floats: true, why: "Wood is a little lighter than water, so a wooden pencil floats." },
  { e: "🔔", name: "bell", floats: false, why: "Bells are made of dense metal, so they sink." },
  { e: "🕯️", name: "candle", floats: true, why: "Wax is a little lighter than water." },
  { e: "🍴", name: "fork and knife", floats: false, why: "Metal silverware is denser than water." },
  { e: "🎈", name: "balloon", floats: true, why: "A balloon is full of air, which is very light." },
  { e: "⚽", name: "soccer ball", floats: true, why: "Mostly air inside, so it floats." },
  { e: "🍌", name: "banana", floats: true, why: "Bananas are a little lighter than water, so they float." },
  { e: "🍋", name: "lemon", floats: true, why: "A lemon with its peel on floats, because the peel traps tiny air pockets." },
  { e: "🥕", name: "carrot", floats: false, why: "A carrot is denser than water, so it sinks." },
  { e: "🥔", name: "potato", floats: false, why: "A raw potato is packed tighter than water, so it sinks." },
  { e: "🥚", name: "egg", floats: false, why: "A fresh egg sinks. As an egg gets old, it gains air inside and can float!" },
  { e: "⛵", name: "sailboat", floats: true, why: "A boat floats because of its shape. It holds lots of air and pushes aside lots of water." },
];

export default function SinkFloat({ profile }: ActivityProps) {
  const queue = useRef<Item[]>(shuffle(ITEMS));
  const [item, setItem] = useState<Item>(() => queue.current.pop()!);
  const [guess, setGuess] = useState<boolean | null>(null); // true = guessed floats
  const [burst, setBurst] = useState(0);
  const [streak, setStreak] = useState(0);
  const timer = useRef<number>();

  useEffect(() => { say(`Will the ${item.name} sink or float?`); }, [item]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const choose = (floats: boolean) => {
    if (guess !== null) return;
    setGuess(floats);
    const right = floats === item.floats;
    tone(floats ? 600 : 200, 0, 0.3); // splash!
    timer.current = window.setTimeout(() => {
      const ns = right ? streak + 1 : 0;
      setStreak(ns);
      if (right) { chime(); setBurst((b) => b + 1); addStar(profile); if (ns > 0 && ns % 3 === 0) addStar(profile); } else oops();
      const bonus = right && ns % 3 === 0 ? " Three in a row! Bonus star!" : "";
      say(`${right ? cheer() + " " : "Surprise! "}It ${item.floats ? "floats" : "sinks"}. ${item.why}${bonus}`, 0.9);
    }, 1400);
  };

  const next = () => {
    if (queue.current.length === 0) queue.current = shuffle(ITEMS.filter((i) => i !== item));
    setItem(queue.current.pop()!);
    setGuess(null);
  };

  const answered = guess !== null;
  const right = answered && guess === item.floats;
  const pos = !answered ? "0px" : item.floats ? "calc(30% - 44px)" : "calc(100% - 84px)";

  return (
    <div className="flex h-full flex-col items-center justify-between px-4 pb-4">
      <p className="text-center text-3xl font-bold drop-shadow">
        Will the {item.name} sink or float?
        {streak > 0 && <span className="ml-3 rounded-full bg-black/30 px-3 py-1 text-xl"><span className="emoji">🔥</span> {streak} in a row</span>}
      </p>

      <div className="relative h-72 w-full max-w-md overflow-hidden rounded-3xl border-4 border-white/70 bg-sky-200/20">
        <div className="absolute inset-x-0 bottom-0 top-[30%] bg-sky-500/70" />
        <div className="absolute inset-x-0 top-[30%] h-2 bg-sky-200/80" />
        <span className={`emoji absolute left-1/2 -translate-x-1/2 text-7xl ${answered && item.floats ? "anim-bob" : ""}`}
          style={{ top: pos, transition: answered ? `top ${item.floats ? 1 : 1.4}s ease-in` : "none" }}>{item.e}</span>
      </div>

      {!answered ? (
        <div className="flex gap-5">
          <button onClick={() => choose(true)} className="rounded-3xl bg-emerald-300 px-8 py-5 text-4xl font-bold text-emerald-900 shadow-xl active:scale-95">
            <span className="emoji">⬆️</span> Floats
          </button>
          <button onClick={() => choose(false)} className="rounded-3xl bg-orange-300 px-8 py-5 text-4xl font-bold text-orange-900 shadow-xl active:scale-95">
            <span className="emoji">⬇️</span> Sinks
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-xl items-center gap-4">
          <p className="anim-pop flex-1 rounded-2xl bg-white/90 p-3 text-xl text-purple-900">
            <b>{right ? "You got it! " : "Surprise! "}It {item.floats ? "floats" : "sinks"}.</b> {item.why}
          </p>
          <button onClick={next} className="rounded-3xl bg-yellow-300 px-6 py-5 text-3xl font-bold text-black shadow-xl active:scale-95">Next ➜</button>
        </div>
      )}
      {burst > 0 && <Burst key={burst} emojis={["⭐", "💧", "🦄"]} />}
    </div>
  );
}
