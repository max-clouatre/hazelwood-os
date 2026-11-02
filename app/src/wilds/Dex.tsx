import { useState } from "react";
import { useStore } from "../lib/store";
import { badgeInfo, collected, colorsFound, formsFound, TOTAL_FORMS, totalFormsFound } from "./game";
import { Creature } from "./Creature";
import { COLLECTABLE, ELEMENTS, FAMILIES, FOODS, FORM_KEYS, RARITY_LABEL, SPECIES_BY_ID, VARIANTS, familyMembers, formName, BIOMES } from "./species";
import type { ElementId, FoodId, Species, VariantId } from "./species";
import { Back } from "./Collection";
import { MASTERY_AT, MASTERY_BONUS, masteryNext } from "./mastery";

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
                      <p className="text-xs text-white/80">{!seen ? <span className="emoji">{sp.biomes.map((id) => BIOMES.find((b) => b.id === id)?.emoji).join(" ")}</span> : own ? <>{FORM_KEYS.map((k) => <span key={k} className={forms.has(k) ? "" : "opacity-30"}>●</span>)} <span className="ml-1">{forms.size}/4</span></> : seen ? "seen" : ""}</p>
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
          <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl bg-indigo-950 p-3 text-left shadow-2xl">
            <p className="text-center text-2xl font-bold">{sel.rarity === 4 ? sel.names[0] : `${sel.kind}: ${sel.names[0]}`}</p>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5 text-base">
              <span className="rounded-full bg-white/15 px-3 py-0.5"><span className="emoji">{ELEMENTS[sel.element].emoji}</span> {ELEMENTS[sel.element].name}</span>
              <span className="rounded-full bg-white/15 px-3 py-0.5">{FAMILIES[sel.element].name}</span>
              <span className="rounded-full bg-white/15 px-3 py-0.5">{RARITY_LABEL[sel.rarity]}</span>
            </div>
            <p className="mt-1 text-center text-base italic text-white/85">{sel.blurb}</p>

            {sel.rarity < 4 ? (
              <div className="mt-2 rounded-2xl bg-black/30 p-2">
                <p className="text-lg font-bold">🌱 How it grows</p>
                <div className="flex items-center justify-center gap-1">
                  {(["1", "2"] as const).map((k, i) => {
                    const ok = formsFound(w, sel.id).has(k);
                    return (
                      <div key={k} className="flex items-center gap-1">
                        {i > 0 && <span className="text-xl text-white/70">➜</span>}
                        <div className={`w-[4.6rem] rounded-xl p-1 text-center ${ok ? "bg-white/15" : "bg-black/30"}`}>
                          <Creature species={sel} stage={k === "1" ? 1 : 2} teaser={!ok} className="mx-auto h-14 w-14" />
                          <p className="text-[11px] font-bold leading-tight">{ok ? sel.names[+k - 1] : "???"}</p>
                        </div>
                      </div>
                    );
                  })}
                  <span className="text-xl text-white/70">➜</span>
                  <div className="flex flex-col gap-1">
                    {(["3s", "3m"] as const).map((k) => {
                      const ok = formsFound(w, sel.id).has(k);
                      return (
                        <div key={k} className={`flex items-center gap-1 rounded-xl px-1 ${ok ? "bg-white/15" : "bg-black/30"}`}>
                          <Creature species={sel} stage={3} branch={k === "3s" ? "sun" : "moon"} teaser={!ok} className="h-11 w-11" />
                          <p className="pr-1 text-[11px] font-bold leading-tight">{ok ? formName(sel, k) : k === "3s" ? "☀️ Sunlit ???" : "🌙 Moonlit ???"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="mt-1 text-center text-sm text-white/80">☀️ day foods 🍯🥕 → Sunlit · 🌙 night foods 🍪🍬 → Moonlit</p>
              </div>
            ) : <Creature species={sel} stage={3} className="mx-auto h-40 w-40" />}

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-black/30 p-2"><p className="text-lg font-bold">🗺️ Lives in</p><p className="text-base">{sel.biomes.length ? sel.biomes.map((id) => { const bi = BIOMES.find((x) => x.id === id)!; return <span key={id} className="mr-2 whitespace-nowrap"><span className="emoji">{bi.emoji}</span> {bi.name.split(" ").pop()}</span>; }) : "🌟 A secret place"}</p></div>
              <div className="rounded-2xl bg-black/30 p-2"><p className="text-lg font-bold">💕 Loves</p><p className="text-base">{w.favs[sel.id] ? <><span className="emoji">{FOODS[w.favs[sel.id] as FoodId].emoji}</span> {FOODS[w.favs[sel.id] as FoodId].name}</> : "??? Feed one to find out!"}</p></div>
            </div>
            {sel.rarity < 4 && (() => { const m = masteryNext(w, sel.id); return (
              <div className="mt-2 rounded-2xl bg-black/30 p-2">
                <p className="text-lg font-bold">🎯 Mastery <span className="ml-1 text-amber-300">{"★".repeat(m.stars)}<span className="text-white/30">{"★".repeat(MASTERY_AT.length - m.stars)}</span></span></p>
                <p className="text-base">You've caught <b>{m.have}</b> {sel.kind}{m.have === 1 ? "" : "s"}.{m.goal ? <> Catch <b>{m.goal - m.have}</b> more for the next ★!</> : " Mastered! 🎉"}</p>
                {m.goal && <div className="mt-1 h-3 overflow-hidden rounded-full bg-black/40"><div className="h-full bg-amber-300" style={{ width: `${Math.min(100, (m.have / m.goal) * 100)}%` }} /></div>}
                {w.modes.camp && <p className="mt-1 text-sm text-white/80">Each ★ makes this friend work {Math.round(MASTERY_BONUS * 100)}% faster in the Camp.</p>}
              </div>); })()}
            {sel.rarity < 4 && (
              <div className="mt-2 rounded-2xl bg-black/30 p-2">
                <p className="text-lg font-bold">🎨 Special colors found</p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-base">
                  {(["shiny", "golden", "storm", "shadow", "autumn"] as const).map((k) => {
                    const ok = colorsFound(w, sel.id).has(k);
                    const label = k === "shiny" ? "✨ Shiny" : `${VARIANTS[k as VariantId].emoji} ${VARIANTS[k as VariantId].name}`;
                    return <span key={k} className={`rounded-full px-3 py-0.5 ${ok ? "bg-white font-bold text-indigo-900" : "bg-white/10 text-white/50"}`}>{ok ? label : "? ???"}</span>;
                  })}
                </div>
              </div>
            )}
            <p className="mt-2 text-center text-sm text-white/60">tap anywhere to close</p>
          </div>
        </button>
      )}
    </div>
  );
}
