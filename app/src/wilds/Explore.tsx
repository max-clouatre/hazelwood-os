import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { chime, note } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { BerryPill } from "./BerryGuide";
import { addBerries, BUSH_BERRIES, bump, bushWait, gainBond, giveEgg, makeOwned, markSeen, pickBush, pickSpawn, rollShiny, rollVariant, setWilds, wilds } from "./game";
import { Badge, PopIcon, SpotIcon } from "./Icons";
import type { PopKind } from "./Icons";
import { Scene } from "./Scene";
import type { Biome } from "./species";
import type { Owned } from "./types";

/** Five spots across the screen: columns keep them apart, alternating rows keep them off each other,
 *  and nothing goes below 76% so they never sit under the bottom buttons. */
function makeSpots(): [number, number][] {
  const xs = [14, 32, 50, 68, 86];
  const flip = Math.random() < 0.5;
  return xs.map((x, i) => {
    const high = (i % 2 === 0) !== flip;
    return [x + (Math.random() - 0.5) * 4, (high ? 54 : 68) + Math.random() * 8] as [number, number];
  });
}
const NOTHING = ["A butterfly flutters by. 🦋", "Just a friendly breeze.", "Something giggled... but ran off!", "You found a shiny pebble.", "A tiny footprint! Keep looking."];
export const LURE_COST = 8;

interface Pop { id: number; x: number; y: number; icon: PopKind; text: string; good: boolean }

export function Explore({ biome, onEncounter, onBack, tabs }: { biome: Biome; onEncounter: (draft: Owned, lure: boolean) => void; onBack: () => void; tabs?: ReactNode }) {
  const [round, setRound] = useState(0);
  const [toast, setToast] = useState("Tap a rustling spot to look!");
  const [lure, setLure] = useState(false);
  const [pops, setPops] = useState<Pop[]>([]);
  const { wilds: w } = useStore();
  const spots = useMemo(makeSpots, [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const timers = useRef<number[]>([]);
  const busy = useRef(false); // true while an encounter is about to start, so extra taps are ignored
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => { clearInterval(i); timers.current.forEach(clearTimeout); }; }, []);
  const wait = bushWait(w, biome.id, now);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  /** A big message right where she tapped, so she sees what she found. */
  const pop = (x: number, y: number, icon: PopKind, text: string, good = true) => {
    const id = Date.now() + Math.random();
    setPops((p) => [...p, { id, x: Math.min(76, Math.max(24, x)), y: y - 6, icon, text, good }]);
    later(() => setPops((p) => p.filter((q) => q.id !== id)), 1900);
  };

  const look = (x: number, y: number) => {
    if (busy.current) return;
    note(); bump("explore");
    const r = Math.random();
    const owned = wilds().owned;
    if (lure || r < 0.5) {
      const sp = pickSpawn(biome.id, { lure });
      const draft = makeOwned(sp, rollShiny(), undefined, rollVariant(biome.id));
      markSeen(sp.id);
      busy.current = true;
      pop(x, y, "bang", "Something is here!", true); say("Something is here!");
      const wasLure = lure; setLure(false);
      later(() => onEncounter(draft, wasLure), 650);
      return;
    }
    if (r < 0.74) {
      const n = 1 + Math.floor(Math.random() * 3);
      addBerries(n); chime(); pop(x, y, "berry", `+${n} berries!`); setToast(`You found ${n} berries!`); say(`You found ${n} berries!`);
    } else if (r < 0.84 && owned.length) {
      const f = owned[Math.floor(Math.random() * owned.length)];
      gainBond([f.id], 2); chime(); pop(x, y, "heart", `${f.name} found a snack! +2`); setToast(`${f.name} found a snack and grew closer to you!`); say(`${f.name} found a snack!`);
    } else if (r < 0.88 && owned.length && wilds().eggs.length < 3) {
      giveEgg(); chime(); pop(x, y, "egg", "A mystery egg!"); setToast("You found a mystery egg! Earn ⭐ stars to hatch it!"); say("You found a mystery egg!");
    } else {
      const m = NOTHING[Math.floor(Math.random() * NOTHING.length)]; pop(x, y, "dust", "Nothing here...", false); setToast(m);
    }
    setRound((v) => v + 1);
  };

  const buyLure = () => {
    if (wilds().berries < LURE_COST) { setToast(`A lure costs ${LURE_COST} berries. Tap 🍓 to see how to get more!`); return; }
    setWilds((x) => ({ berries: x.berries - LURE_COST }));
    setLure(true); chime(); setToast("Lure set! The next spot has a special visitor!"); say("Lure set!");
  };

  return (
    <div className="absolute inset-0">
      <Scene biome={biome} />
      <div className="absolute inset-x-0 top-2 flex items-center justify-between gap-2 px-3">
        <button onClick={onBack} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-purple-800 active:scale-95">◀ Map</button>
        <p className="min-w-0 flex-1 truncate rounded-full bg-black/40 px-4 py-1 text-center text-lg font-bold">{toast}</p>
        <BerryPill n={w.berries} className="!bg-black/40" />
      </div>
      {tabs ?? <p className="absolute inset-x-0 top-14 text-center text-2xl font-bold drop-shadow"><span className="emoji">{biome.emoji}</span> {biome.name}</p>}
      {spots.map(([x, y], i) => (
        <button key={`${round}-${i}`} onClick={() => look(x, y)} aria-label="Rustling bush"
          className="anim-pop absolute -translate-x-1/2 -translate-y-1/2 active:scale-90"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 70}ms`, background: "none", border: "none", padding: 0 }}>
          <span className="relative block h-20 w-20 sm:h-24 sm:w-24">
            <SpotIcon biome={lure ? "lure" : biome.id} className="h-full w-full" style={{ animation: "wobble 1.8s ease-in-out infinite" }} />
            <Badge kind="q" className="anim-bob absolute -right-2 -top-3 h-8 w-8" />
          </span>
        </button>
      ))}
      {pops.map((p) => (
        <div key={p.id} className="pointer-events-none absolute z-30 whitespace-nowrap rounded-2xl border-[3px] border-ink px-4 py-2 text-2xl font-bold shadow-xl"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animation: "floatup 1.9s ease-out forwards", background: p.good ? "#fff7d6" : "#e8e4f2", color: "#2b2540" }}>
          <PopIcon kind={p.icon} className="mr-2 inline-block h-9 w-9 align-middle" />{p.text}
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-3 flex items-end justify-center gap-3">
        <button onClick={() => { if (pickBush(biome.id)) { chime(); pop(50, 76, "berry", `+${BUSH_BERRIES} berries!`); setToast(`You picked ${BUSH_BERRIES} berries from the berry bush!`); say("Berries!"); } else { pop(50, 76, "hourglass", "Still growing...", false); setToast("The berry bush is regrowing. Come back soon!"); } }}
          className={`rounded-2xl px-4 py-3 text-lg font-bold shadow-xl active:scale-95 ${wait > 0 ? "bg-white/60 text-emerald-900/70" : "bg-pink-400 text-white ring-4 ring-pink-200"}`}>
          <PopIcon kind="berry" className="mr-1 inline-block h-6 w-6 align-middle" /> Berry Bush
          <span className="block text-xs font-normal">{wait > 0 ? `regrowing ${Math.floor(wait / 60000)}:${String(Math.floor((wait % 60000) / 1000)).padStart(2, "0")}` : `tap for +${BUSH_BERRIES} 🍓`}</span>
        </button>
        <button onClick={buyLure} className={`rounded-2xl px-5 py-3 text-lg font-bold shadow-xl active:scale-95 ${lure ? "bg-yellow-300 text-black ring-4 ring-yellow-100" : "bg-white/90 text-purple-800"}`}>
          <PopIcon kind="honey" className="mr-1 inline-block h-6 w-6 align-middle" /> Lure {lure ? "set!" : <>· {LURE_COST} <PopIcon kind="berry" className="inline-block h-5 w-5 align-middle" /></>}<span className="block text-xs font-normal">finds a special visitor</span>
        </button>
      </div>
    </div>
  );
}
