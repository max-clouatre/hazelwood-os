import { useEffect, useState } from "react";
import { Burst } from "../components/Burst";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { Creature } from "./Creature";
import { ELEMENTS, RARITY_LABEL, SPECIES_BY_ID } from "./species";
import type { Owned } from "./types";

/** "You got a new friend!" Name it and welcome it home. */
export function Reveal({ draft, headline, legendary, onDone }: { draft: Owned; headline: string; legendary?: boolean; onDone: (name: string) => void }) {
  const sp = SPECIES_BY_ID[draft.sp];
  const [name, setName] = useState(draft.name);
  useEffect(() => { chime(); const t = setTimeout(() => say(`${headline} ${sp.names[0]}!`), 400); return () => clearTimeout(t); }, [headline, sp]);
  const el = ELEMENTS[sp.element];
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-1 overflow-y-auto bg-indigo-950/90 p-3 text-center sm:flex-row sm:gap-6">
      <Burst emojis={draft.shiny ? ["✨", "⭐", "💖", "🌟"] : ["⭐", "💖", "✨"]} />
      <div className="anim-pop shrink-0"><Creature species={sp} stage={legendary ? 3 : 1} shiny={draft.shiny} seed={draft.seed} personality={draft.pers} className="anim-bob h-44 w-44 sm:h-72 sm:w-72" /></div>
      <div className="flex max-w-md flex-col items-center gap-1">
        <p className="text-2xl font-bold sm:text-3xl">{headline}</p>
        {draft.shiny && <p className="anim-pop rounded-full bg-yellow-300 px-4 py-1 text-xl font-bold text-black">✨ A shiny one! ✨</p>}
        <p className="text-xl"><span className="emoji">{el.emoji}</span> <b>{sp.names[0]}</b> · {RARITY_LABEL[sp.rarity]}</p>
        <p className="text-base text-white/80">{sp.blurb}</p>
        <label className="mt-1 flex items-center gap-2 text-lg">Name:
          <input value={name} maxLength={14} onChange={(e) => setName(e.target.value)} autoCapitalize="words" spellCheck={false}
            className="w-44 rounded-xl bg-white px-3 py-2 text-center text-2xl font-bold text-purple-800 sm:w-52" />
        </label>
        <button onClick={() => onDone(name.trim() || draft.name)} className="mt-1 rounded-2xl bg-emerald-400 px-8 py-3 text-2xl font-bold text-black shadow-xl active:scale-95">Welcome home! 💖</button>
      </div>
    </div>
  );
}
