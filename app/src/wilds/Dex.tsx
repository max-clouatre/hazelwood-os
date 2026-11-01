import { useState } from "react";
import { useStore } from "../lib/store";
import { badgeInfo, collected, formsFound, TOTAL_FORMS, totalFormsFound } from "./game";
import { Creature } from "./Creature";
import { COLLECTABLE, ELEMENTS, FAMILIES, FOODS, FORM_KEYS, RARITY_LABEL, SPECIES_BY_ID, familyMembers, formName, BIOMES } from "./species";
import type { ElementId, FoodId, Species } from "./species";
import { Back } from "./Collection";

export function Dex({ onBack }: { onBack: () => void }) {
  const { wilds: w } = useStore();
  const [sel, setSel] = useState<Species | null>(null);
  const have = collected(w);
  const fams = Object.keys(FAMILIES) as ElementId[];
  return (
    <div className="relative flex h-full flex-col gap-2 bg-forest p-3">
      <div className="flex items-center justify-between"><Back onClick={onBack} /><p className="text-xl font-bold sm:text-2xl">📖 Wilddex {have.size}/{COLLECTABLE.length} · 🌳 Forms {totalFormsFound(w)}/{TOTAL_FORMS}</p><span className="w-4" /></div>
      <div className="flex-1 overflow-y-auto">
        {fams.map((el) => {
          const members = familyMembers(el);
          const got = members.filter((s) => have.has(s.id)).length;
          const done = w.badges.includes(`family:${el}`);
          return (
            <div key={el} className="mb-3">
              <p className="mb-1 flex items-center gap-2 text-lg font-bold">
                <span className="emoji">{ELEMENTS[el].emoji}</span> {FAMILIES[el].name} Family <span className="text-sm font-normal text-white/80">{got}/{members.length}</span>
                {done ? <span className="rounded-full bg-yellow-300 px-2 text-sm text-black">🏅 complete</span> : <span className="text-xs font-normal text-white/70">meet them all: +20 🍓</span>}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {members.map((sp) => {
                  const seen = (w.seen[sp.id] ?? 0) > 0 || have.has(sp.id);
                  const own = have.has(sp.id);
                  const forms = formsFound(w, sp.id);
                  const best = Math.max(0, ...w.owned.filter((o) => o.sp === sp.id).map((o) => o.xp));
                  const bo = w.owned.filter((o) => o.sp === sp.id && o.xp === best)[0];
                  return (
                    <button key={sp.id} onClick={() => seen && setSel(sp)} className={`rounded-2xl p-1 text-center ${own ? "bg-white/20" : "bg-black/25"} active:scale-95`}>
                      <Creature species={sp} stage={own ? (best >= 40 ? 3 : best >= 14 ? 2 : 1) : 1} branch={bo?.branch} silhouette={!seen} className={`mx-auto h-20 w-20 ${seen && !own ? "opacity-60" : ""}`} />
                      <p className="truncate text-sm font-bold">{seen ? sp.names[0] : "???"}</p>
                      <p className="text-xs text-white/80">{own ? <>{FORM_KEYS.map((k) => <span key={k} className={forms.has(k) ? "" : "opacity-30"}>●</span>)} <span className="ml-1">{forms.size}/4</span></> : seen ? "seen" : ""}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {w.legend ? (
          <button onClick={() => setSel(SPECIES_BY_ID.hazelwisp)} className="mb-3 w-full rounded-2xl bg-yellow-300/30 p-2 text-center text-lg font-bold">🌟 Legendary: Hazelwisp</button>
        ) : (
          <p className="mb-3 rounded-2xl bg-black/25 p-2 text-center text-sm text-yellow-200">🌟 Meet all {COLLECTABLE.length} creatures for a legendary surprise!</p>
        )}
        {w.badges.length > 0 && (
          <p className="mb-2 text-center text-base"><b>Badges:</b> {w.badges.map((b) => <span key={b} title={badgeInfo(b).title} className="emoji mx-0.5 text-2xl">{badgeInfo(b).emoji}</span>)}</p>
        )}
      </div>
      {sel && (
        <button onClick={() => setSel(null)} className="anim-pop absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-3">
          <div className="max-h-full max-w-md overflow-y-auto rounded-3xl bg-indigo-950 p-3 text-center shadow-2xl">
            <p className="text-xl font-bold">{sel.rarity === 4 ? sel.names[0] : `The ${sel.names[0]} line`}</p>
            {sel.rarity < 4 ? (
              <div className="grid grid-cols-4 gap-1">
                {FORM_KEYS.map((k) => {
                  const ok = formsFound(w, sel.id).has(k);
                  return (
                    <div key={k} className={`rounded-xl p-1 ${ok ? "bg-white/15" : "bg-black/30"}`}>
                      <Creature species={sel} stage={k === "1" ? 1 : k === "2" ? 2 : 3} branch={k === "3s" ? "sun" : k === "3m" ? "moon" : undefined} teaser={!ok} className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />
                      <p className="text-[11px] font-bold leading-tight">{ok ? formName(sel, k) : "???"}</p>
                    </div>
                  );
                })}
              </div>
            ) : <Creature species={sel} stage={3} className="mx-auto h-40 w-40" />}
            <p className="mt-1 text-base"><span className="emoji">{ELEMENTS[sel.element].emoji}</span> {FAMILIES[sel.element].name} · {RARITY_LABEL[sel.rarity]}</p>
            <p className="text-base text-white/90">{sel.blurb}</p>
            <p className="mt-1 text-base">Lives in: {sel.biomes.length ? sel.biomes.map((id) => BIOMES.find((b) => b.id === id)?.emoji).join(" ") : "🌟 Secret place"}</p>
            <p className="text-base">Loves: {w.favs[sel.id] ? `${FOODS[w.favs[sel.id] as FoodId].emoji} ${FOODS[w.favs[sel.id] as FoodId].name}` : "??? (feed one to find out!)"}</p>
            {sel.rarity < 4 && <p className="mt-1 text-sm text-white/70">☀️ day foods 🍯🥕 → Sunlit · 🌙 night foods 🍪🍬 → Moonlit</p>}
            <p className="mt-2 text-sm text-white/60">tap to close</p>
          </div>
        </button>
      )}
    </div>
  );
}
