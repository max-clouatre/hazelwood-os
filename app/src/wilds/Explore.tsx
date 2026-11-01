import { useEffect, useMemo, useRef, useState } from "react";
import { chime, note } from "../lib/audio";
import { say } from "../lib/speech";
import { BerryPill } from "./BerryGuide";
import { addBerries, BUSH_BERRIES, bump, bushWait, giveEgg, makeOwned, markSeen, pickBush, pickSpawn, rollShiny, setWilds, wilds } from "./game";
import { Scene } from "./Scene";
import type { Biome, Species } from "./species";
import { useStore } from "../lib/store";

const SPOTS: [number, number][] = [[17, 62], [32, 74], [50, 66], [66, 76], [78, 64], [22, 86], [58, 88], [40, 58]];
const NOTHING = ["A butterfly flutters by. 🦋", "Just a friendly breeze.", "Something giggled... but ran off!", "You found a shiny pebble.", "A tiny footprint! Keep looking."];
export const LURE_COST = 8;

export function Explore({ biome, onEncounter, onBack }: { biome: Biome; onEncounter: (sp: Species, shiny: boolean, lure: boolean) => void; onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [toast, setToast] = useState("Tap a rustling bush to look!");
  const [lure, setLure] = useState(false);
  const { wilds: w } = useStore();
  const spots = useMemo(() => [...SPOTS].sort(() => Math.random() - 0.5).slice(0, 5), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const t = useRef<number>();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => { clearInterval(i); window.clearTimeout(t.current); }; }, []);
  const wait = bushWait(w, biome.id, now);

  const look = () => {
    note(); bump("explore");
    const r = Math.random();
    if (lure || r < 0.52) {
      const sp = pickSpawn(biome.id, { lure });
      const shiny = rollShiny();
      markSeen(sp.id);
      setLure(false);
      onEncounter(sp, shiny, lure);
      return;
    }
    if (r < 0.8) {
      const n = 1 + Math.floor(Math.random() * 3);
      addBerries(n); chime(); setToast(`You found ${n} 🍓 berries!`); say(`You found ${n} berries!`);
    } else if (r < 0.84 && wilds().eggs.length < 3) {
      giveEgg(); chime(); setToast("🥚 You found a mystery egg! Earn ⭐ stars to hatch it!"); say("You found a mystery egg!");
    } else {
      const m = NOTHING[Math.floor(Math.random() * NOTHING.length)]; setToast(m);
    }
    setRound((x) => x + 1);
  };

  const buyLure = () => {
    if (wilds().berries < LURE_COST) { setToast(`A lure costs ${LURE_COST} 🍓. Earn ⭐ to get more!`); return; }
    setWilds((x) => ({ berries: x.berries - LURE_COST }));
    setLure(true); chime(); setToast("🍯 Lure set! The next bush has a special visitor!"); say("Lure set!");
  };

  return (
    <div className="absolute inset-0">
      <Scene biome={biome} />
      <div className="absolute inset-x-0 top-2 flex items-center justify-between gap-2 px-3">
        <button onClick={onBack} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-purple-800 active:scale-95">◀ Map</button>
        <p className="min-w-0 flex-1 truncate rounded-full bg-black/40 px-4 py-1 text-center text-lg font-bold">{toast}</p>
        <BerryPill n={w.berries} className="!bg-black/40" />
      </div>
      <p className="absolute inset-x-0 top-14 text-center text-2xl font-bold drop-shadow"><span className="emoji">{biome.emoji}</span> {biome.name}</p>
      {spots.map(([x, y], i) => (
        <button key={`${round}-${i}`} onClick={look} aria-label="Rustling bush"
          className="anim-pop absolute -translate-x-1/2 -translate-y-1/2 active:scale-90"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 70}ms` }}>
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-900/45 shadow-xl ring-4 ring-white/50">
            <span className="emoji text-6xl" style={{ animation: "wobble 1.6s ease-in-out infinite", display: "inline-block" }}>{lure ? "✨" : "🌿"}</span>
            <span className="emoji anim-bob absolute -right-1 -top-3 text-2xl">❓</span>
          </span>
        </button>
      ))}
      <div className="absolute inset-x-0 bottom-3 flex items-end justify-center gap-3">
        <button onClick={() => { if (pickBush(biome.id)) { chime(); setToast(`You picked ${BUSH_BERRIES} 🍓 from the berry bush!`); say("Berries!"); } else setToast("The berry bush is regrowing. Come back soon!"); }}
          className={`rounded-2xl px-4 py-3 text-lg font-bold shadow-xl active:scale-95 ${wait > 0 ? "bg-white/60 text-emerald-900/70" : "bg-pink-400 text-white ring-4 ring-pink-200"}`}>
          <span className="emoji">🍓</span> Berry Bush
          <span className="block text-xs font-normal">{wait > 0 ? `regrowing ${Math.floor(wait / 60000)}:${String(Math.floor((wait % 60000) / 1000)).padStart(2, "0")}` : `tap for +${BUSH_BERRIES} 🍓`}</span>
        </button>
        <button onClick={buyLure} className={`rounded-2xl px-5 py-3 text-lg font-bold shadow-xl active:scale-95 ${lure ? "bg-yellow-300 text-black ring-4 ring-yellow-100" : "bg-white/90 text-purple-800"}`}>
          <span className="emoji">🍯</span> Lure {lure ? "set!" : <>· {LURE_COST} <span className="emoji">🍓</span></>}<span className="block text-xs font-normal">finds a special visitor</span>
        </button>
      </div>
    </div>
  );
}

export { makeOwned };
