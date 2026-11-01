import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, oops, tone } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar } from "../lib/store";
import { shuffle } from "../lib/util";
import type { ActivityProps } from "./types";

interface Item { e: string; name: string; sticks: boolean; why: string }
// Emoji limited to older Unicode releases so they draw on Android 11.
const ITEMS: Item[] = [
  { e: "📎", name: "paper clip", sticks: true, why: "Paper clips are made of steel, and steel has iron in it. Magnets pull on iron." },
  { e: "🍎", name: "apple", sticks: false, why: "Apples have no iron in them, so a magnet ignores them." },
  { e: "🔧", name: "wrench", sticks: true, why: "A wrench is steel, and steel has iron in it." },
  { e: "🍃", name: "leaf", sticks: false, why: "Leaves have no iron, so nothing happens." },
  { e: "🔩", name: "nut and bolt", sticks: true, why: "Steel nuts and bolts have iron in them, so the magnet grabs them." },
  { e: "✏️", name: "wooden pencil", sticks: false, why: "Wood is not magnetic." },
  { e: "⚙️", name: "steel gear", sticks: true, why: "Steel has iron in it, so a magnet pulls on it." },
  { e: "🦆", name: "rubber duck", sticks: false, why: "Rubber and plastic are not magnetic." },
  { e: "🔨", name: "hammer", sticks: true, why: "The head of a hammer is steel, so the magnet sticks to it." },
  { e: "💎", name: "gem", sticks: false, why: "Gems are minerals, but not magnetic ones." },
  { e: "⛓️", name: "steel chain", sticks: true, why: "A steel chain has iron in it, so a magnet pulls on it." },
  { e: "⚽", name: "soccer ball", sticks: false, why: "A ball is made of plastic and air, which are not magnetic." },
  { e: "🍪", name: "cookie", sticks: false, why: "Cookies are yummy, not magnetic." },
  { e: "🎈", name: "balloon", sticks: false, why: "Rubber and air are not magnetic." },
];

export default function MagnetMystery({ profile }: ActivityProps) {
  const queue = useRef<Item[]>(shuffle(ITEMS));
  const [item, setItem] = useState<Item>(() => queue.current.pop()!);
  const [guess, setGuess] = useState<boolean | null>(null);
  const [pulled, setPulled] = useState(false); // animation: the magnet comes in
  const [burst, setBurst] = useState(0);
  const [streak, setStreak] = useState(0);
  const timer = useRef<number[]>([]);

  useEffect(() => { say(`Will the magnet stick to the ${item.name}?`); }, [item]);
  useEffect(() => () => timer.current.forEach(clearTimeout), []);

  const choose = (sticks: boolean) => {
    if (guess !== null) return;
    setGuess(sticks);
    setPulled(true);
    const right = sticks === item.sticks;
    timer.current.push(window.setTimeout(() => tone(item.sticks ? 880 : 200, 0, 0.2, "square", 0.12), 900));
    timer.current.push(window.setTimeout(() => {
      const ns = right ? streak + 1 : 0;
      setStreak(ns);
      if (right) { chime(); setBurst((b) => b + 1); addStar(profile); if (ns % 3 === 0) addStar(profile); } else oops();
      const bonus = right && ns % 3 === 0 ? " Three in a row! Bonus star!" : "";
      say(`${right ? cheer() + " " : "Surprise! "}${item.sticks ? "It sticks!" : "It does not stick."} ${item.why}${bonus}`, 0.9);
    }, 1300));
  };

  const next = () => {
    if (queue.current.length === 0) queue.current = shuffle(ITEMS.filter((i) => i !== item));
    setItem(queue.current.pop()!);
    setGuess(null); setPulled(false);
  };

  const answered = guess !== null;
  const right = answered && guess === item.sticks;
  // The magnet slides in from the right. If the item is magnetic, the item slides to the magnet.
  const magnetX = pulled ? "4rem" : "12rem";
  const itemX = pulled && item.sticks ? "5rem" : "0rem"; // magnetic items jump over to the magnet

  return (
    <div className="flex h-full flex-col items-center justify-between px-4 pb-4">
      <p className="text-center text-3xl font-bold drop-shadow">
        Will the magnet stick to the {item.name}?
        {streak > 0 && <span className="ml-3 rounded-full bg-black/30 px-3 py-1 text-xl"><span className="emoji">🔥</span> {streak} in a row</span>}
      </p>

      <div className="relative flex h-56 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl border-4 border-white/70 bg-white/10">
        <span className="emoji absolute text-8xl transition-transform duration-700 ease-in" style={{ transform: `translateX(calc(-4rem + ${itemX}))` }}>{item.e}</span>
        <span className="emoji absolute text-8xl transition-transform duration-700 ease-in" style={{ transform: `translateX(${magnetX})` }}>🧲</span>
      </div>

      {!answered ? (
        <div className="flex gap-5">
          <button onClick={() => choose(true)} className="rounded-3xl bg-emerald-300 px-8 py-5 text-4xl font-bold text-emerald-900 shadow-xl active:scale-95">
            <span className="emoji">🧲</span> Sticks
          </button>
          <button onClick={() => choose(false)} className="rounded-3xl bg-orange-300 px-8 py-5 text-4xl font-bold text-orange-900 shadow-xl active:scale-95">
            <span className="emoji">🙅</span> No stick
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-xl items-center gap-4">
          <p className="anim-pop flex-1 rounded-2xl bg-white/90 p-3 text-xl text-purple-900">
            <b>{right ? "You got it! " : "Surprise! "}{item.sticks ? "It sticks!" : "It does not stick."}</b> {item.why}
          </p>
          <button onClick={next} className="rounded-3xl bg-yellow-300 px-6 py-5 text-3xl font-bold text-black shadow-xl active:scale-95">Next ➜</button>
        </div>
      )}
      {burst > 0 && <Burst key={burst} emojis={["⭐", "🧲", "🦄"]} />}
    </div>
  );
}
