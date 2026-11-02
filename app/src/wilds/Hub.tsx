import { Creature } from "./Creature";
import { ELEMENTS, SPECIES_BY_ID } from "./species";
import type { Species } from "./species";
import { say } from "../lib/speech";

export const STARTERS = ["mossling", "bubbo", "embit"];

export function Starter({ onPick }: { onPick: (sp: Species) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 overflow-y-auto bg-forest p-4 text-center">
      <p className="text-3xl font-bold drop-shadow">Welcome to the Hazelwild! 🌿</p>
      <p className="max-w-xl text-xl">Wild creatures live here. Pick your very first friend, then explore to find and catch more!</p>
      <div className="flex flex-wrap justify-center gap-4">
        {STARTERS.map((id) => {
          const sp = SPECIES_BY_ID[id];
          return (
            <button key={id} onClick={() => { say(sp.names[0]); onPick(sp); }} className="rounded-3xl bg-white/15 p-3 shadow-xl active:scale-95">
              <Creature species={sp} stage={1} seed={11} className="anim-bob mx-auto h-40 w-40" />
              <p className="text-2xl font-bold">{sp.names[0]}</p>
              <p className="text-lg"><span className="emoji">{ELEMENTS[sp.element].emoji}</span> {ELEMENTS[sp.element].name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

