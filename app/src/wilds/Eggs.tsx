import { useState } from "react";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { buyEgg, EGG_COST, EGG_NEED, hatchSpecies, makeOwned, removeEgg, rollShiny } from "./game";
import { Back } from "./Collection";
import { Reveal } from "./Reveal";
import type { Owned } from "./types";

export function Eggs({ onBack, onAdopt }: { onBack: () => void; onAdopt: (o: Owned, name: string) => void }) {
  const { wilds: w } = useStore();
  const [shaking, setShaking] = useState<string | null>(null);
  const [hatch, setHatch] = useState<{ egg: string; draft: Owned } | null>(null);
  const [msg, setMsg] = useState("");

  const tap = (id: string, ready: boolean) => {
    if (!ready) { setMsg("Not ready yet! Earn ⭐ stars in any activity to warm it up."); say("Earn stars to warm it up!"); return; }
    setShaking(id); chime();
    window.setTimeout(() => {
      const sp = hatchSpecies();
      setHatch({ egg: id, draft: makeOwned(sp, rollShiny(1 / 16)) });
      setShaking(null);
    }, 1400);
  };

  return (
    <div className="relative flex h-full flex-col gap-2 bg-gradient-to-b from-emerald-700 to-teal-900 p-3">
      <div className="flex items-center justify-between"><Back onClick={onBack} /><p className="text-2xl font-bold">🥚 Eggs</p><span className="rounded-full bg-black/30 px-3 py-1 text-xl font-bold"><span className="emoji">🍓</span> {w.berries}</span></div>
      <p className="text-center text-lg">Every ⭐ star you earn in any activity warms your eggs. A hatched egg is always something special!</p>
      <div className="flex flex-1 flex-wrap content-start items-start justify-center gap-4 overflow-y-auto">
        {w.eggs.length === 0 && <p className="mt-6 text-center text-xl text-white/80">No eggs yet. Find them in the wild, or buy one below!</p>}
        {w.eggs.map((e) => {
          const ready = e.have >= e.need;
          return (
            <button key={e.id} onClick={() => tap(e.id, ready)} className="flex w-40 flex-col items-center rounded-3xl bg-white/15 p-3 shadow-xl active:scale-95">
              <span className={`emoji text-7xl ${ready ? "animate-pulse" : ""} ${shaking === e.id ? "anim-wobble" : ""}`} style={shaking === e.id ? { animationIterationCount: 6 } : undefined}>🥚</span>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-black/30"><div className="h-full bg-yellow-300" style={{ width: `${(e.have / e.need) * 100}%` }} /></div>
              <p className="text-base font-bold">{ready ? "Ready! Tap to hatch!" : `${e.have}/${e.need} ⭐`}</p>
            </button>
          );
        })}
      </div>
      {msg && <p className="anim-pop text-center text-base text-yellow-200">{msg}</p>}
      <button onClick={() => { if (w.eggs.length >= 3) setMsg("You can carry 3 eggs at a time!"); else if (!buyEgg()) setMsg(`An egg costs ${EGG_COST} 🍓. Earn stars or explore for more berries!`); else { chime(); setMsg(`New egg! Earn ${EGG_NEED} ⭐ to hatch it.`); } }}
        className="mx-auto rounded-2xl bg-yellow-300 px-6 py-3 text-xl font-bold text-black shadow-xl active:scale-95"><span className="emoji">🥚</span> Buy an egg · {EGG_COST} <span className="emoji">🍓</span></button>
      {hatch && <Reveal draft={hatch.draft} headline="Your egg hatched!" onDone={(name) => { removeEgg(hatch.egg); onAdopt(hatch.draft, name); setHatch(null); }} />}
    </div>
  );
}
