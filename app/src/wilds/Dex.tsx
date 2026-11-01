import { useState } from "react";
import { useStore } from "../lib/store";
import { collected } from "./game";
import { Creature } from "./Creature";
import { BIOMES, COLLECTABLE, ELEMENTS, FOODS, RARITY_LABEL, SPECIES_BY_ID } from "./species";
import type { FoodId, Species } from "./species";
import { Back } from "./Collection";

export function Dex({ onBack }: { onBack: () => void }) {
  const { wilds: w } = useStore();
  const [sel, setSel] = useState<Species | null>(null);
  const have = collected(w);
  const list = w.legend ? [...COLLECTABLE, SPECIES_BY_ID.hazelwisp] : COLLECTABLE;
  return (
    <div className="relative flex h-full flex-col gap-2 bg-gradient-to-b from-emerald-700 to-teal-900 p-3">
      <div className="flex items-center justify-between"><Back onClick={onBack} /><p className="text-2xl font-bold">📖 Wilddex {have.size}/{COLLECTABLE.length}</p><span className="w-20" /></div>
      <div className="grid flex-1 grid-cols-4 content-start gap-2 overflow-y-auto sm:grid-cols-6">
        {list.map((sp) => {
          const seen = (w.seen[sp.id] ?? 0) > 0 || have.has(sp.id);
          const own = have.has(sp.id);
          const best = Math.max(0, ...w.owned.filter((o) => o.sp === sp.id).map((o) => o.xp));
          const stage = best >= 40 ? 3 : best >= 14 ? 2 : 1;
          return (
            <button key={sp.id} onClick={() => seen && setSel(sp)} className={`rounded-2xl p-1 text-center ${own ? "bg-white/20" : "bg-black/25"} active:scale-95`}>
              <Creature species={sp} stage={own ? (stage as 1 | 2 | 3) : 1} silhouette={!seen} className={`mx-auto h-20 w-20 ${seen && !own ? "opacity-60" : ""}`} />
              <p className="truncate text-xs font-bold">{seen ? sp.names[0] : "???"}</p>
              <p className="text-[10px] text-white/70">{own ? `×${w.owned.filter((o) => o.sp === sp.id).length}${w.owned.some((o) => o.sp === sp.id && o.shiny) ? " ✨" : ""}` : seen ? "seen" : ""}</p>
            </button>
          );
        })}
        {!w.legend && <div className="flex aspect-square items-center justify-center rounded-2xl bg-black/25 text-center text-xs text-yellow-200">🌟 Complete the Wilddex for a legendary surprise!</div>}
      </div>
      {sel && (
        <button onClick={() => setSel(null)} className="anim-pop absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-md rounded-3xl bg-indigo-950 p-4 text-center shadow-2xl">
            <div className="flex justify-center gap-1">{sel.names.map((n, i) => <Creature key={n + i} species={sel} stage={(i + 1) as 1 | 2 | 3} className="h-24 w-24" />)}</div>
            <p className="text-2xl font-bold">{sel.names.join(" → ")}</p>
            <p className="text-lg"><span className="emoji">{ELEMENTS[sel.element].emoji}</span> {ELEMENTS[sel.element].name} · {RARITY_LABEL[sel.rarity]}</p>
            <p className="mt-1 text-base text-white/90">{sel.blurb}</p>
            <p className="mt-1 text-base">Lives in: {sel.biomes.length ? sel.biomes.map((id) => BIOMES.find((b) => b.id === id)?.emoji).join(" ") : "🌟 Secret place"}</p>
            <p className="text-base">Loves: {w.favs[sel.id] ? `${FOODS[w.favs[sel.id] as FoodId].emoji} ${FOODS[w.favs[sel.id] as FoodId].name}` : "??? (feed one to find out!)"}</p>
            <p className="mt-2 text-sm text-white/60">tap to close</p>
          </div>
        </button>
      )}
    </div>
  );
}
