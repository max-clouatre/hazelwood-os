import { useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { bond, feed, pet, petsLeft, rename, stageFor } from "./game";
import { Creature } from "./Creature";
import { ELEMENTS, FOODS, FOOD_COST, PERSONALITIES, RARITY_LABEL, SPECIES_BY_ID, STAGE_AT } from "./species";
import type { FoodId } from "./species";
import type { Owned } from "./types";

export const Back = ({ onClick, label = "◀ Back" }: { onClick: () => void; label?: string }) => (
  <button onClick={onClick} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-emerald-900 shadow active:scale-95">{label}</button>
);

export function MyWilds({ onOpen, onBack }: { onOpen: (id: string) => void; onBack: () => void }) {
  const { wilds: w } = useStore();
  const list = [...w.owned].reverse();
  return (
    <div className="flex h-full flex-col gap-2 bg-gradient-to-b from-emerald-700 to-teal-900 p-3">
      <div className="flex items-center justify-between"><Back onClick={onBack} /><p className="text-2xl font-bold">🎒 My Wilds ({list.length})</p><span className="w-20" /></div>
      <div className="grid flex-1 grid-cols-3 content-start gap-3 overflow-y-auto sm:grid-cols-4">
        {list.map((o) => {
          const sp = SPECIES_BY_ID[o.sp];
          const st = stageFor(o.xp);
          return (
            <button key={o.id} onClick={() => onOpen(o.id)} className="relative rounded-3xl bg-white/15 p-1 text-center shadow-lg active:scale-95">
              <Creature species={sp} stage={st} shiny={o.shiny} seed={o.seed} personality={o.pers} className="mx-auto h-28 w-28" />
              <p className="truncate text-lg font-bold leading-tight">{o.name}</p>
              <p className="text-xs text-white/80"><span className="emoji">{ELEMENTS[sp.element].emoji}</span> {sp.names[st - 1]}</p>
              <div className="mx-auto mt-1 h-2 w-3/4 overflow-hidden rounded-full bg-black/30"><div className="h-full bg-pink-400" style={{ width: `${bond(o.xp).pct * 100}%` }} /></div>
              {o.shiny && <span className="emoji absolute right-1 top-1 text-xl">✨</span>}
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
  const [evo, setEvo] = useState<{ stage: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const evoTimer = useRef<number>();
  if (!o) { return <div className="p-4"><Back onClick={onBack} /></div>; }

  const sp = SPECIES_BY_ID[o.sp];
  const el = ELEMENTS[sp.element];
  const st = stageFor(o.xp);
  const b = bond(o.xp);
  const favKnown = w.favs[o.sp];
  const evolved = (stage: number) => {
    chime(); setEvo({ stage }); say(`${o.name} evolved!`);
    window.clearTimeout(evoTimer.current); evoTimer.current = window.setTimeout(() => setEvo(null), 3200);
  };

  const doPet = () => {
    const r = pet(o.id);
    if (!r.ok) { setLine("I'm all cuddled out for today! Come back tomorrow."); return; }
    const l = PERSONALITIES[o.pers].pet; const text = l[Math.floor(Math.random() * l.length)];
    setLine(text); say(text); setHearts((h) => h + 1);
    if (r.evolved) evolved(stageFor(o.xp + 1));
  };
  const doFeed = (f: FoodId) => {
    if (w.berries < FOOD_COST) { setLine("Not enough berries! Earn ⭐ stars or explore to find more."); setTray(false); return; }
    const r = feed(o.id, f);
    setTray(false);
    if (!r.ok) return;
    setHearts((h) => h + 1);
    const text = r.fav ? `${FOODS[f].emoji} My favorite!! I love it!` : `${FOODS[f].emoji} Yum! Thank you!`;
    setLine(text); say(r.fav ? "My favorite! I love it!" : "Yum! Thank you!");
    if (r.evolved) evolved(stageFor(o.xp + (r.fav ? 5 : 2)));
  };

  return (
    <div className="relative flex h-full flex-col gap-2 bg-gradient-to-b from-emerald-700 to-teal-900 p-3">
      <div className="flex items-center justify-between">
        <Back onClick={onBack} label="◀ My Wilds" />
        <span className="rounded-full bg-black/30 px-4 py-1 text-xl font-bold"><span className="emoji">🍓</span> {w.berries}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        <div className="relative flex flex-col items-center justify-center rounded-3xl bg-white/10">
          <button onClick={doPet} className="active:scale-95"><Creature species={sp} stage={st} shiny={o.shiny} seed={o.seed} personality={o.pers} mood={line.includes("tomorrow") ? "sleep" : "happy"} className="anim-bob h-56 w-56 sm:h-64 sm:w-64" /></button>
          {line && <p className="anim-pop absolute inset-x-2 top-2 rounded-2xl bg-white px-3 py-2 text-center text-lg font-bold text-emerald-900">{line}</p>}
          {hearts > 0 && <Burst key={hearts} emojis={["💖", "💗", "✨"]} />}
        </div>
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
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
          <p className="text-lg"><span className="emoji">{el.emoji}</span> {sp.names[st - 1]} · {RARITY_LABEL[sp.rarity]} {o.shiny && "· ✨ Shiny"}</p>
          <p className="text-base text-white/90">Personality: <b>{PERSONALITIES[o.pers].label}</b> · Loves: <b>{favKnown ? `${FOODS[favKnown as FoodId].emoji} ${FOODS[favKnown as FoodId].name}` : "??? (try different foods!)"}</b></p>
          <div>
            <p className="text-sm">Bond · Form {st}/3</p>
            <div className="relative h-5 overflow-hidden rounded-full bg-black/30"><div className="h-full bg-pink-400 transition-all" style={{ width: `${b.pct * 100}%` }} /></div>
            <p className="text-sm text-white/80">{st === 3 ? "Fully grown! 💖" : `${b.toNext} more 💖 until it grows into ${sp.names[st]}!`}</p>
            <div className="mt-1 flex gap-1 text-xs text-white/70">{sp.names.map((n, i) => <span key={n + i} className={`rounded-full px-2 ${i < st ? "bg-pink-400/60" : "bg-black/30"}`}>{i < st ? n : "???"}</span>)}</div>
          </div>
          <p className="text-sm italic text-white/80">{sp.blurb}</p>
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
                  {favKnown === f && <span className="text-xs">💕 loves it</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {evo && (
        <div className="anim-pop absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-indigo-950/90 text-center">
          <Burst emojis={["⭐", "✨", "💖", "🌟"]} />
          <p className="text-3xl font-bold">✨ {o.name} evolved! ✨</p>
          <Creature species={sp} stage={evo.stage as 1 | 2 | 3} shiny={o.shiny} seed={o.seed} personality={o.pers} className="anim-bob h-64 w-64" />
          <p className="text-2xl">It's now <b>{sp.names[evo.stage - 1]}</b>!</p>
          <p className="text-sm text-white/70">Forms unlock at {STAGE_AT[1]} and {STAGE_AT[2]} bond points.</p>
        </div>
      )}
    </div>
  );
}
