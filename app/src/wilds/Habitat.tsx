import { useState } from "react";
import { Burst } from "../components/Burst";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { Back } from "./Collection";
import { pet, petsLeft, stageFor } from "./game";
import { Creature } from "./Creature";
import { Scene } from "./Scene";
import { BIOMES, PERSONALITIES, SPECIES_BY_ID } from "./species";

const VARIANTS = ["wanderA", "wanderB", "wanderC"];

/** Her friends living and wandering together. Tap one to pet it. */
export function Habitat({ onBack }: { onBack: () => void }) {
  const { wilds: w } = useStore();
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(null);
  const [hearts, setHearts] = useState(0);
  // show up to 10: favorites first (most grown)
  const crew = [...w.owned].sort((a, b) => b.xp - a.xp).slice(0, 10);
  return (
    <div className="absolute inset-0">
      <Scene biome={BIOMES[0]} />
      <div className="absolute inset-x-0 top-2 flex items-center justify-between px-3"><Back onClick={onBack} /><p className="rounded-full bg-black/40 px-4 py-1 text-xl font-bold">🏡 Home Meadow</p><span className="w-20" /></div>
      {crew.map((o, i) => {
        const sp = SPECIES_BY_ID[o.sp];
        const left = 6 + ((i * 37) % 58), top = 46 + ((i * 23) % 38);
        return (
          <div key={o.id} className="absolute" style={{ left: `${left}%`, top: `${top}%`, zIndex: Math.round(top) }}>
            <button onClick={() => {
              const r = pet(o.id);
              const l = PERSONALITIES[o.pers].pet; const text = r.ok ? l[Math.floor(Math.random() * l.length)] : `${o.name} is all cuddled out today!`;
              setBubble({ id: o.id, text }); say(text); if (r.ok) setHearts((h) => h + 1);
            }} className="relative block active:scale-95" style={{ animation: `${VARIANTS[i % 3]} ${16 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `-${i * 3}s` }}>
              <Creature species={sp} stage={stageFor(o.xp)} shiny={o.shiny} seed={o.seed} personality={o.pers} branch={o.branch} className="h-24 w-24 sm:h-28 sm:w-28" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-2 text-xs font-bold">{o.name} {petsLeft(o) > 0 && "💖"}</span>
              {bubble?.id === o.id && <span className="anim-pop absolute -top-10 left-1/2 w-40 -translate-x-1/2 rounded-xl bg-white px-2 py-1 text-center text-sm font-bold leading-tight text-emerald-900">{bubble.text}</span>}
            </button>
          </div>
        );
      })}
      {hearts > 0 && <Burst key={hearts} emojis={["💖", "💗", "✨"]} />}
      <p className="absolute inset-x-0 bottom-2 text-center text-sm text-white drop-shadow">Tap a friend to pet it! Each friend can be petted 3 times a day.</p>
    </div>
  );
}
