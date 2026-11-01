import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { say } from "../lib/speech";
import { addStar } from "../lib/store";
import { pick } from "../lib/util";
import type { ActivityProps } from "./types";

const DROPS: Record<string, string> = { red: "#ef4444", yellow: "#facc15", blue: "#3b82f6" };
const MIX: Record<string, { name: string; hex: string }> = {
  "red+yellow": { name: "orange", hex: "#fb923c" },
  "blue+yellow": { name: "green", hex: "#22c55e" },
  "blue+red": { name: "purple", hex: "#a855f7" },
};
const TARGETS = ["orange", "green", "purple"];

export default function ColorLab({ profile }: ActivityProps) {
  const [target, setTarget] = useState(() => pick(TARGETS));
  const [picks, setPicks] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [burst, setBurst] = useState(0);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { say(`The unicorn needs a ${target} potion! Mix two colors.`); }, [target]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const mixed = picks.length === 2
    ? (picks[0] === picks[1] ? { name: picks[0], hex: DROPS[picks[0]] } : MIX[[...picks].sort().join("+")])
    : null;
  const fill = mixed ? mixed.hex : picks.length === 1 ? DROPS[picks[0]] : "transparent";

  const drop = (c: string) => {
    if (busy.current || picks.length >= 2) return;
    note(picks.length * 2);
    const np = [...picks, c];
    setPicks(np);
    if (np.length < 2) { setMsg(`${c} …add one more!`); return; }
    busy.current = true;
    const res = np[0] === np[1] ? { name: np[0] } : MIX[[...np].sort().join("+")];
    const ok = res.name === target;
    setMsg(`${np[0]} + ${np[1]} = ${res.name}!`);
    later(() => {
      if (ok) { chime(); setBurst((b) => b + 1); addStar(profile); say(`${np[0]} and ${np[1]} make ${res.name}! The unicorn loves it!`); }
      else { oops(); say(`${np[0]} and ${np[1]} make ${res.name}. Try again for ${target}!`); }
    }, 900);
    later(() => {
      busy.current = false;
      setPicks([]); setMsg("");
      if (ok) setTarget(pick(TARGETS.filter((t) => t !== target)));
    }, ok ? 3200 : 2800);
  };

  return (
    <div className="flex h-full flex-col items-center justify-between px-4 pb-4">
      <p className="text-center text-3xl font-bold drop-shadow">
        <span className="emoji">🦄</span> The unicorn needs a <span className="underline">{target}</span> potion!
      </p>

      <div className="flex items-end gap-8">
        <div className="relative h-56 w-40 overflow-hidden rounded-b-[3rem] rounded-t-lg border-4 border-white/80 bg-white/10">
          <div className="absolute inset-x-0 bottom-0 transition-all duration-700" style={{ height: picks.length ? "70%" : "0%", background: fill }} />
        </div>
        <div className="max-w-[16rem] text-2xl">{msg || "Tap two color drops to mix them."}</div>
      </div>

      <div className="flex gap-6">
        {Object.entries(DROPS).map(([name, hex]) => (
          <button key={name} onClick={() => drop(name)} aria-label={name}
            className="flex h-28 w-24 flex-col items-center justify-center rounded-[2.5rem] border-4 border-white/80 text-xl font-bold text-black shadow-xl active:scale-90"
            style={{ background: hex }}>
            <span className="emoji text-4xl">💧</span>{name}
          </button>
        ))}
      </div>
      {burst > 0 && <Burst key={burst} emojis={["⭐", "🦄", "🌈", "💜"]} />}
    </div>
  );
}
