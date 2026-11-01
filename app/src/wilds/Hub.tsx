import { useState } from "react";
import { BerryPill } from "./BerryGuide";
import { Goals } from "./Goals";
import { addBerries, biomeUnlocked, collected, dailyVisitorSpecies, setWilds, TOTAL_FORMS, totalFormsFound, wildOfDay } from "./game";
import { Creature } from "./Creature";
import { BIOMES, COLLECTABLE, ELEMENTS, SPECIES_BY_ID } from "./species";
import type { Biome, Species } from "./species";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import type { Wilds } from "./types";

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

export type Nav = "wilds" | "dex" | "eggs" | "duel" | "home";

export function Hub({ w, onExplore, onVisitor, onNav, onTips }: {
  w: Wilds; onExplore: (b: Biome) => void; onVisitor: () => void; onNav: (n: Nav) => void; onTips: () => void;
}) {
  const wod = wildOfDay();
  const have = collected(w);
  const [lockMsg, setLockMsg] = useState("");
  const eggReady = w.eggs.some((e) => e.have >= e.need);
  const visitor = dailyVisitorSpecies();
  const nav = "relative flex flex-1 flex-col items-center justify-center rounded-2xl bg-white/90 py-2 text-base font-bold text-emerald-900 shadow-lg active:scale-95 sm:text-lg";

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto bg-forest px-3 pb-5">
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <BerryPill n={w.berries} />
        <span className="rounded-full bg-black/30 px-3 py-1 text-lg font-bold"><span className="emoji">📖</span> {have.size}/{COLLECTABLE.length}</span>
        <span className="rounded-full bg-black/30 px-3 py-1 text-lg font-bold"><span className="emoji">🌳</span> Forms {totalFormsFound(w)}/{TOTAL_FORMS}</span>
        <button onClick={onTips} aria-label="How to play" className="rounded-full bg-white/90 px-3 py-1 text-lg font-bold text-emerald-900 active:scale-95">? Help</button>
      </div>
      <Goals goals={w.goals.list} />
      {w.fromStars > 0 && (
        <button onClick={() => setWilds(() => ({ fromStars: 0 }))} className="anim-pop mx-auto rounded-2xl bg-yellow-300 px-5 py-2 text-lg font-bold text-black shadow-lg active:scale-95">
          Your ⭐ stars turned into +{w.fromStars} 🍓 berries! (tap)
        </button>
      )}

      <div className="flex flex-wrap items-stretch justify-center gap-2">
        <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-1">
          <Creature species={wod} stage={2} seed={5} className="h-16 w-16" />
          <div className="text-left leading-tight"><p className="text-sm text-white/80">Wild of the Day</p><p className="text-lg font-bold">{wod.names[0]}</p><p className="text-xs text-white/80">appears more often today!</p></div>
        </div>
        <button onClick={() => { chime(); onVisitor(); }} disabled={w.visitorDone}
          className={`rounded-2xl px-4 py-2 text-lg font-bold shadow-lg active:scale-95 ${w.visitorDone ? "bg-white/20 text-white/60" : "bg-mustard text-black ring-4 ring-white"}`}>
          <span className="emoji">🌟</span> Daily Visitor{!w.visitorDone && <span className="ml-1 rounded-full bg-red-500 px-2 text-sm text-white">NEW</span>}<span className="block text-xs font-normal">{w.visitorDone ? `${visitor.names[0]} is happy at home! Back tomorrow.` : "A special guest is waiting!"}</span>
        </button>
        <button onClick={() => { addBerries(5); setWilds(() => ({ treeDone: true })); chime(); say("The wishing tree gave you five berries!"); }} disabled={w.treeDone}
          className={`rounded-2xl px-4 py-2 text-lg font-bold shadow-lg active:scale-95 ${w.treeDone ? "bg-white/20 text-white/60" : "bg-pink-300 text-pink-950"}`}>
          <span className="emoji">🌳</span> Wishing Tree<span className="block text-xs font-normal">{w.treeDone ? "Come back tomorrow" : "+5 🍓 free today"}</span>
        </button>
      </div>

      <p className="text-center text-lg font-bold">Where to explore?</p>
      <div className="flex flex-wrap justify-center gap-2">
        {BIOMES.map((b) => {
          const open = biomeUnlocked(b.id, w);
          return (
            <button key={b.id} onClick={() => (open ? onExplore(b) : setLockMsg(`${b.name} opens when you've met ${b.need} different Wilds! (${have.size}/${b.need})`))}
              className={`flex w-36 flex-col items-center rounded-3xl p-2 shadow-xl active:scale-95 ${open ? "" : "grayscale"}`}
              style={{ background: `linear-gradient(to bottom, ${b.sky[0]} 0 55%, ${b.ground} 55%)` }}>
              <span className="emoji text-5xl">{open ? b.emoji : "🔒"}</span>
              <span className="text-center text-base font-bold leading-tight drop-shadow">{b.name}</span>
              {!open && <span className="text-xs">Meet {b.need} Wilds</span>}
            </button>
          );
        })}
      </div>
      {lockMsg && <p className="anim-pop mx-auto rounded-xl bg-black/40 px-4 py-1 text-center text-base">{lockMsg}</p>}

      <div className="mt-auto flex gap-1.5">
        <button onClick={() => onNav("wilds")} className={nav}><span className="emoji text-2xl">🎒</span>Friends</button>
        <button onClick={() => onNav("home")} className={nav}><span className="emoji text-2xl">🏡</span>Home</button>
        <button onClick={() => onNav("dex")} className={nav}><span className="emoji text-2xl">📖</span>Dex</button>
        <button onClick={() => onNav("eggs")} className={nav}><span className="emoji text-2xl">🥚</span>Eggs{eggReady && <span className="absolute right-2 top-1 rounded-full bg-red-500 px-2 text-sm text-white">!</span>}</button>
        <button onClick={() => onNav("duel")} className={nav}><span className="emoji text-2xl">⚔️</span>Duel</button>
      </div>
    </div>
  );
}
