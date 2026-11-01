import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar } from "../lib/store";
import { pick } from "../lib/util";
import type { ActivityProps } from "./types";

const DROPS: Record<string, string> = { red: "#ef4444", yellow: "#facc15", blue: "#3b82f6", white: "#ffffff" };
const MIX: Record<string, { name: string; hex: string }> = {
  "red+yellow": { name: "orange", hex: "#fb923c" },
  "blue+yellow": { name: "green", hex: "#22c55e" },
  "blue+red": { name: "purple", hex: "#a855f7" },
  "red+white": { name: "pink", hex: "#f9a8d4" },
  "blue+white": { name: "light blue", hex: "#93c5fd" },
  "white+yellow": { name: "light yellow", hex: "#fef08a" },
};
const TARGETS = ["orange", "green", "purple", "pink", "light blue"];
const RECIPE: Record<string, [string, string]> = {
  orange: ["red", "yellow"], green: ["blue", "yellow"], purple: ["red", "blue"], pink: ["red", "white"], "light blue": ["blue", "white"],
};

function mixOf(a: string, b: string) {
  return a === b ? { name: a, hex: DROPS[a] } : MIX[[a, b].sort().join("+")];
}

export default function ColorLab({ profile }: ActivityProps) {
  const [target, setTarget] = useState(() => pick(TARGETS));
  const [picks, setPicks] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [burst, setBurst] = useState(0);
  const [misses, setMisses] = useState(0);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { say(`The unicorn needs a ${target} potion! Mix two colors.`); }, [target]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const mixed = picks.length === 2 ? mixOf(picks[0], picks[1]) : null;
  const fill = mixed ? mixed.hex : picks.length === 1 ? DROPS[picks[0]] : "transparent";
  const hint = misses >= 2 ? RECIPE[target] : null; // after two misses, glow the right drops

  const drop = (c: string) => {
    if (busy.current || picks.length >= 2) return;
    note(picks.length * 2);
    const np = [...picks, c];
    setPicks(np);
    if (np.length < 2) { setMsg(`${c} … add one more!`); return; }
    busy.current = true;
    const res = mixOf(np[0], np[1]);
    const ok = res.name === target;
    setMsg(`${np[0]} + ${np[1]} = ${res.name}!`);
    later(() => {
      if (ok) { chime(); setBurst((b) => b + 1); addStar(profile); say(`${cheer()} ${np[0]} and ${np[1]} make ${res.name}! The unicorn loves it!`); }
      else { oops(); setMisses((m) => m + 1); say(`${np[0]} and ${np[1]} make ${res.name}. Try again for ${target}!`); }
    }, 900);
    later(() => {
      busy.current = false;
      setPicks([]); setMsg("");
      if (ok) { setMisses(0); setTarget(pick(TARGETS.filter((t) => t !== target))); }
    }, ok ? 3200 : 2800);
  };

  return (
    <div className="flex h-full flex-col items-center justify-between px-4 pb-4">
      <p className="text-center text-3xl font-bold drop-shadow">
        <span className="emoji">🦄</span> The unicorn needs a <span className="underline">{target}</span> potion!
      </p>

      <div className="flex items-end gap-8">
        <div className="relative h-52 w-40 overflow-hidden rounded-b-[3rem] rounded-t-lg border-4 border-white/80 bg-white/10">
          <div className="absolute inset-x-0 bottom-0 transition-all duration-700" style={{ height: picks.length ? "70%" : "0%", background: fill }} />
        </div>
        <div className="max-w-[16rem] text-2xl">{msg || (hint ? "Try the glowing drops! 💡" : "Tap two color drops to mix them.")}</div>
      </div>

      <div className="flex gap-2 sm:gap-4">
        {Object.entries(DROPS).map(([name, hex]) => (
          <button key={name} onClick={() => drop(name)} aria-label={name}
            className={`flex h-24 w-[4.4rem] flex-col items-center justify-center rounded-[2rem] border-4 text-base font-bold sm:h-28 sm:w-24 sm:rounded-[2.5rem] sm:text-xl text-black shadow-xl active:scale-90 ${hint?.includes(name) && !busy.current ? "animate-pulse border-yellow-300 ring-4 ring-yellow-300" : "border-white/80"}`}
            style={{ background: hex }}>
            <span className="emoji text-4xl">💧</span>{name}
          </button>
        ))}
      </div>
      {burst > 0 && <Burst key={burst} emojis={["⭐", "🦄", "🌈", "💜"]} />}
    </div>
  );
}
