import { useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { BerryPill, openGuide } from "./BerryGuide";
import { bond, feed, formKeysOf, formsFound, pet, petsLeft, rename, stageFor, wilds } from "./game";
import { Creature } from "./Creature";
import { ELEMENTS, FAMILIES, FOODS, FOOD_COST, FOOD_SIDE, PERSONALITIES, RARITY_LABEL, SPECIES_BY_ID, VARIANTS, formName } from "./species";
import type { FoodId, FormKey } from "./species";
import type { Owned } from "./types";

const lastForm = (o: Owned) => { const k = formKeysOf(o); return k[k.length - 1]; };

export const Back = ({ onClick, label = "◀ Back" }: { onClick: () => void; label?: string }) => (
  <button onClick={onClick} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-emerald-900 shadow active:scale-95">{label}</button>
);

export function MyWilds({ onOpen, onBack }: { onOpen: (id: string) => void; onBack: () => void }) {
  const { wilds: w } = useStore();
  const list = [...w.owned].reverse();
  return (
    <div className="flex h-full flex-col gap-2 bg-forest p-3">
      <div className="flex items-center justify-between"><Back onClick={onBack} /><p className="text-2xl font-bold">🎒 My Friends ({list.length})</p><span className="w-20" /></div>
      <div className="grid flex-1 grid-cols-3 content-start gap-3 overflow-y-auto sm:grid-cols-4">
        {list.map((o) => {
          const sp = SPECIES_BY_ID[o.sp];
          const st = stageFor(o.xp);
          return (
            <button key={o.id} onClick={() => onOpen(o.id)} className="relative rounded-3xl bg-white/15 p-1 text-center shadow-lg active:scale-95">
              <Creature species={sp} stage={st} shiny={o.shiny} variant={o.variant} seed={o.seed} personality={o.pers} branch={o.branch} className="mx-auto h-24 w-24 sm:h-28 sm:w-28" />
              <p className="truncate text-lg font-bold leading-tight">{o.name}</p>
              <p className="truncate text-xs text-white/80"><span className="emoji">{ELEMENTS[sp.element].emoji}</span> {sp.rarity === 4 ? sp.names[0] : formName(sp, lastForm(o))}</p>
              <div className="mx-auto mt-1 h-2 w-3/4 overflow-hidden rounded-full bg-black/30"><div className="h-full bg-pink-400" style={{ width: `${bond(o.xp).pct * 100}%` }} /></div>
              {o.shiny && <span className="emoji absolute right-1 top-1 text-xl">✨</span>}
              {(o.level ?? 1) > 1 && <span className="absolute bottom-6 right-1 rounded-full bg-mustard px-1.5 text-xs font-bold text-black">Lv {o.level}</span>}
              {o.variant && <span className="emoji absolute left-1 top-1 text-xl">{VARIANTS[o.variant].emoji}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Detail({ id, onBack }: { id: string; onBack: () => void }) {
  const { wilds: w } = useStore();
  const o = w.owned.find((x) => x.id === id) as Owned | undefined;
  const [line, setLine] = useState("");
  const [tray, setTray] = useState(false);
  const [hearts, setHearts] = useState(0);
  const [evo, setEvo] = useState<{ key: FormKey; stage: 1 | 2 | 3; branch?: "sun" | "moon"; isNew: boolean; name: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const evoTimer = useRef<number>();
  if (!o) { return <div className="p-4"><Back onClick={onBack} /></div>; }

  const sp = SPECIES_BY_ID[o.sp];
  const el = ELEMENTS[sp.element];
  const st = stageFor(o.xp);
  const b = bond(o.xp);
  const favKnown = w.favs[o.sp];
  const reached = new Set(formKeysOf(o));
  const [sunN, moonN] = o.foods ?? [0, 0];
  const lean = sunN > moonN ? "Sunlit" : moonN > sunN ? "Moonlit" : "either";
  const legendary = sp.rarity === 4;

  const afterAction = (known: Set<FormKey>, evolved: boolean) => {
    if (!evolved) return;
    // read the creature again to see which form it became
    const o2 = wilds().owned.find((x) => x.id === o.id);
    if (!o2) return;
    const key = lastForm(o2);
    chime(); say(`${o2.name} evolved!`);
    setEvo({ key, stage: stageFor(o2.xp), branch: o2.branch, isNew: !known.has(key), name: o2.name });
    window.clearTimeout(evoTimer.current); evoTimer.current = window.setTimeout(() => setEvo(null), 4200);
  };

  const doPet = () => {
    const known = formsFound(w, o.sp);
    const r = pet(o.id);
    if (!r.ok) { setLine("I'm all cuddled out for today! Come back tomorrow."); return; }
    const l = PERSONALITIES[o.pers].pet; const text = l[Math.floor(Math.random() * l.length)];
    setLine(text); say(text); setHearts((h) => h + 1);
    afterAction(known, r.evolved);
  };
  const doFeed = (f: FoodId) => {
    if (w.berries < FOOD_COST) { setLine("Not enough berries! Tap the 🍓 to see how to get more."); setTray(false); openGuide(); return; }
    const known = formsFound(w, o.sp);
    const r = feed(o.id, f);
    setTray(false);
    if (!r.ok) return;
    setHearts((h) => h + 1);
    const text = r.fav ? `${FOODS[f].emoji} My favorite!! I love it!` : `${FOODS[f].emoji} Yum! Thank you!`;
    setLine(text); say(r.fav ? "My favorite! I love it!" : "Yum! Thank you!");
    afterAction(known, r.evolved);
  };

  return (
    <div className="relative flex h-full flex-col gap-2 bg-forest p-3">
      <div className="flex items-center justify-between">
        <Back onClick={onBack} label="◀ Friends" />
        <BerryPill n={w.berries} />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 sm:overflow-visible">
        <div className="relative flex min-h-[11rem] flex-col items-center justify-center rounded-3xl bg-white/10 sm:min-h-[15rem]">
          <button onClick={doPet} className="active:scale-95"><Creature species={sp} stage={st} shiny={o.shiny} variant={o.variant} seed={o.seed} personality={o.pers} branch={o.branch} mood={line.includes("tomorrow") ? "sleep" : "happy"} className="anim-bob h-40 w-40 sm:h-64 sm:w-64" /></button>
          {line && <p className="anim-pop absolute inset-x-2 top-2 rounded-2xl bg-white px-3 py-2 text-center text-lg font-bold text-emerald-900">{line}</p>}
          {hearts > 0 && <Burst key={hearts} emojis={["💖", "💗", "✨"]} />}
        </div>
        <div className="flex min-h-0 flex-col gap-2 sm:overflow-y-auto">
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <input value={draft} maxLength={14} autoFocus onChange={(e) => setDraft(e.target.value)} className="w-40 rounded-xl bg-white px-3 py-1 text-2xl font-bold text-emerald-900" />
                <button onClick={() => { rename(o.id, draft); setEditing(false); }} className="rounded-xl bg-emerald-400 px-3 py-2 text-lg font-bold text-black">Save</button>
              </>
            ) : (
              <>
                <p className="truncate text-3xl font-bold">{o.name}</p>
                <button onClick={() => { setDraft(o.name); setEditing(true); }} aria-label="Rename" className="emoji rounded-full bg-white/20 px-3 py-1 text-xl">✏️</button>
              </>
            )}
          </div>
          {/* quick facts */}
          <div className="flex flex-wrap gap-1.5 text-base">
            <span className="rounded-full bg-white/15 px-3 py-0.5"><span className="emoji">🐾</span> {sp.kind}</span>
            <span className="rounded-full bg-white/15 px-3 py-0.5"><span className="emoji">{el.emoji}</span> {el.name}</span>
            <span className="rounded-full bg-white/15 px-3 py-0.5">{FAMILIES[sp.element].name}</span>
            <span className="rounded-full bg-white/15 px-3 py-0.5">{RARITY_LABEL[sp.rarity]}</span>
            <span className="rounded-full bg-white/15 px-3 py-0.5">{PERSONALITIES[o.pers].label}</span>
            {w.modes.camp && <span className="rounded-full bg-mustard px-3 py-0.5 font-bold text-black">Lv {o.level ?? 1}</span>}
            {o.shiny && <span className="rounded-full bg-yellow-300 px-3 py-0.5 font-bold text-black">✨ Shiny</span>}
            {o.variant && <span className="rounded-full bg-white px-3 py-0.5 font-bold text-indigo-900">{VARIANTS[o.variant].emoji} {VARIANTS[o.variant].name}</span>}
          </div>
          <p className="text-base italic text-white/85">{sp.blurb}</p>

          <div className="rounded-2xl bg-black/25 p-2">
            <p className="text-lg font-bold">💕 Favorite food</p>
            {favKnown
              ? <p className="text-xl"><span className="emoji text-3xl">{FOODS[favKnown as FoodId].emoji}</span> {FOODS[favKnown as FoodId].name} <span className="text-sm text-white/70">(+5 💖)</span></p>
              : <p className="text-base text-white/90">Not discovered yet. Feed it different foods to find out!</p>}
          </div>

          {!legendary && (
            <div className="rounded-2xl bg-black/25 p-2">
              <p className="text-lg font-bold">🌱 Growing up</p>
              <p className="text-base">{st === 3 ? <>Fully grown! <b>{formName(sp, lastForm(o))}</b> 💖</> : <><b>{b.toNext}</b> more 💖 to become <b>{sp.names[st]}</b></>}</p>
              <div className="my-1 h-4 overflow-hidden rounded-full bg-black/30"><div className="h-full bg-pink-400 transition-all" style={{ width: `${b.pct * 100}%` }} /></div>
              <div className="flex items-center justify-center gap-1">
                {([["1"], ["2"]] as const).map(([k], i) => (
                  <div key={k} className="flex items-center gap-1">
                    {i > 0 && <span className="text-xl text-white/70">➜</span>}
                    <div className={`w-[4.2rem] rounded-xl p-0.5 text-center ${reached.has(k) ? "bg-white/20" : "bg-black/20"}`}>
                      <Creature species={sp} stage={k === "1" ? 1 : 2} seed={o.seed} personality={o.pers} shiny={o.shiny} variant={o.variant} teaser={!reached.has(k)} className="mx-auto h-14 w-14" />
                      <p className="truncate text-[11px] font-bold leading-tight">{reached.has(k) ? sp.names[+k - 1] : "???"}</p>
                    </div>
                  </div>
                ))}
                <span className="text-xl text-white/70">➜</span>
                <div className="flex flex-col gap-1">
                  {(["3s", "3m"] as const).map((k) => (
                    <div key={k} className={`flex items-center gap-1 rounded-xl px-1 ${reached.has(k) ? "bg-white/20" : "bg-black/20"}`}>
                      <Creature species={sp} stage={3} branch={k === "3s" ? "sun" : "moon"} seed={o.seed} personality={o.pers} shiny={o.shiny} variant={o.variant} teaser={!reached.has(k)} className="h-10 w-10" />
                      <p className="pr-1 text-[11px] font-bold leading-tight">{k === "3s" ? "☀️ Sunlit" : "🌙 Moonlit"}</p>
                    </div>
                  ))}
                </div>
              </div>
              {st < 3 ? (
                <div className="mt-1 grid grid-cols-2 gap-1 text-center text-sm">
                  <p className="rounded-xl bg-amber-300/25 px-1 py-1 leading-tight"><b>☀️ Day foods</b><br /><span className="emoji">🍯🥕</span> → Sunlit</p>
                  <p className="rounded-xl bg-indigo-300/25 px-1 py-1 leading-tight"><b>🌙 Night foods</b><br /><span className="emoji">🍪🍬</span> → Moonlit</p>
                </div>
              ) : <p className="mt-1 text-center text-sm text-white/80">{o.branch === "moon" ? "🌙 Raised on night foods" : "☀️ Raised on day foods"}</p>}
              {st < 3 && <p className="mt-1 text-center text-base">Fed so far: ☀️ <b>{sunN}</b> · 🌙 <b>{moonN}</b> → leaning <b>{lean === "either" ? "either one" : lean}</b></p>}
            </div>
          )}
          <div className="mt-auto flex gap-2">
            <button onClick={doPet} className="flex-1 rounded-2xl bg-pink-300 px-3 py-3 text-xl font-bold text-pink-950 shadow-lg active:scale-95"><span className="emoji">💖</span> Pet<span className="block text-xs font-normal">{petsLeft(o)} left today</span></button>
            <button onClick={() => setTray((t) => !t)} className="flex-1 rounded-2xl bg-yellow-300 px-3 py-3 text-xl font-bold text-black shadow-lg active:scale-95"><span className="emoji">🍽️</span> Feed<span className="block text-xs font-normal">{FOOD_COST} 🍓 each</span></button>
          </div>
          {tray && (
            <div className="anim-pop grid grid-cols-4 gap-2 rounded-2xl bg-black/30 p-2">
              {(Object.keys(FOODS) as FoodId[]).map((f) => (
                <button key={f} onClick={() => doFeed(f)} className="rounded-xl bg-white/90 p-1 text-center text-emerald-900 active:scale-95">
                  <span className="emoji text-3xl">{FOODS[f].emoji}</span>
                  <span className="block text-xs font-bold leading-tight">{FOODS[f].name}</span>
                  <span className="block text-xs">{FOOD_SIDE[f] === "sun" ? "☀️ day" : "🌙 night"}</span>
                  {favKnown === f && <span className="text-xs">💕 loves it</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {evo && (
        <div className="anim-pop absolute inset-0 z-30 flex flex-col items-center justify-center gap-1 bg-indigo-950/90 text-center">
          <Burst emojis={["⭐", "✨", "💖", "🌟"]} />
          <p className="text-3xl font-bold">✨ {evo.name} evolved! ✨</p>
          {evo.isNew && <p className="anim-pop rounded-full bg-yellow-300 px-4 py-1 text-xl font-bold text-black">🌟 New form discovered! 🌟</p>}
          <Creature species={sp} stage={evo.stage} branch={evo.branch} shiny={o.shiny} variant={o.variant} seed={o.seed} personality={o.pers} className="anim-bob h-60 w-60" />
          <p className="text-2xl">It's now <b>{formName(sp, evo.key)}</b>!</p>
          {evo.stage === 3 && <p className="text-base text-white/80">{evo.branch === "sun" ? "☀️ Raised on day foods" : "🌙 Raised on night foods"}</p>}
        </div>
      )}
    </div>
  );
}
