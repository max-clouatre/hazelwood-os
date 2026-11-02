import { useState } from "react";
import { Burst } from "../components/Burst";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { BerryPill } from "./BerryGuide";
import { assignedZone, CREW_MAX, CREW_MIN, homeCrew, pendingGlow, workersOf } from "./camp";
import { GlowPill } from "./Camp";
import { Creature } from "./Creature";
import { addBerries, biomeUnlocked, collected, dailyVisitorSpecies, pet, petsLeft, setWilds, stageFor, TOTAL_FORMS, totalFormsFound, wildOfDay } from "./game";
import { Goals } from "./Goals";
import { Roamers } from "./Roamers";
import { Scene } from "./Scene";
import { BIOMES, COLLECTABLE, ELEMENTS, PERSONALITIES, SPECIES_BY_ID } from "./species";
import type { Biome } from "./species";
import type { Owned, Wilds } from "./types";

export type Nav = "wilds" | "dex" | "eggs" | "duel";
type Panel = null | "map" | "today" | "crew";

/** The landing screen: her meadow with the crew she chose wandering around, and everything else one tap away. */
export function Landing({ w, onExplore, onVisitor, onNav, onTips }: {
  w: Wilds; onExplore: (b: Biome) => void; onVisitor: () => void; onNav: (n: Nav) => void; onTips: () => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(null);
  const [hearts, setHearts] = useState(0);
  const crew = homeCrew(w);
  const have = collected(w);
  const eggReady = w.eggs.some((e) => e.have >= e.need);
  const todayNew = !w.visitorDone || !w.treeDone || w.goals.list.some((g) => g.have >= g.target && !g.claimed);
  const mapNew = w.modes.camp && BIOMES.some((b) => pendingGlow(w, b.id) >= 1);
  const dock = "relative flex flex-1 flex-col items-center justify-center rounded-2xl bg-white/90 py-1.5 text-sm font-bold text-emerald-900 shadow-lg active:scale-95 sm:text-lg";
  const dot = (on: boolean) => on && <span className="absolute right-1 top-0.5 h-4 w-4 rounded-full border-2 border-white bg-red-500" />;

  const petIt = (o: Owned) => {
    const r = pet(o.id);
    const l = PERSONALITIES[o.pers].pet; const text = r.ok ? l[Math.floor(Math.random() * l.length)] : `${o.name} is all cuddled out today!`;
    setBubble({ id: o.id, text }); say(text); if (r.ok) setHearts((h) => h + 1);
    setTimeout(() => setBubble((b) => (b && b.id === o.id ? null : b)), 2600);
  };

  return (
    <div className="absolute inset-0">
      <Scene biome={BIOMES[0]} />
      <div className="absolute inset-x-0 top-2 z-10 flex flex-wrap items-center justify-center gap-2 px-2">
        <BerryPill n={w.berries} />
        {w.modes.camp && <GlowPill n={w.glow} className="!px-3 !text-lg" />}
        <span className="rounded-full bg-black/30 px-3 py-1 text-lg font-bold"><span className="emoji">📖</span> {have.size}/{COLLECTABLE.length}</span>
        <span className="hidden rounded-full bg-black/30 px-3 py-1 text-lg font-bold sm:inline"><span className="emoji">🌳</span> Forms {totalFormsFound(w)}/{TOTAL_FORMS}</span>
        <button onClick={onTips} aria-label="How to play" className="rounded-full bg-white/90 px-3 py-1 text-lg font-bold text-emerald-900 active:scale-95">? Help</button>
      </div>
      {w.fromStars > 0 && (
        <button onClick={() => setWilds(() => ({ fromStars: 0 }))} className="anim-pop absolute left-1/2 top-14 z-20 -translate-x-1/2 rounded-2xl bg-yellow-300 px-4 py-2 text-base font-bold text-black shadow-lg active:scale-95">
          Your ⭐ stars turned into +{w.fromStars} 🍓 berries! (tap)
        </button>
      )}

      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }} data-testid="landing-crew">
        <Roamers list={crew} size="h-20 w-20 sm:h-28 sm:w-28" top={[40, 58]} label onTap={petIt}
          extra={(o) => (<>{petsLeft(o) > 0 && <span className="emoji absolute -right-1 top-0 text-lg">💖</span>}{bubble?.id === o.id && <span className="anim-pop absolute -top-10 left-1/2 z-20 w-40 -translate-x-1/2 rounded-xl bg-white px-2 py-1 text-center text-sm font-bold leading-tight text-emerald-900">{bubble.text}</span>}</>)} />
      </div>
      {hearts > 0 && <Burst key={hearts} emojis={["💖", "💗", "✨"]} />}

      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-1.5 px-2 pb-2">
        <button onClick={() => setPanel("map")} className="relative mx-auto flex items-center gap-2 rounded-3xl border-[3px] border-ink bg-mustard px-8 py-2 text-2xl font-bold text-black shadow-xl ring-4 ring-white active:scale-95">
          <span className="emoji">🗺️</span> Adventure! {dot(mapNew)}
        </button>
        <div className="flex gap-1.5">
          <button onClick={() => setPanel("today")} className={dock}><span className="emoji text-2xl">🎯</span>Today{dot(todayNew)}</button>
          <button onClick={() => onNav("wilds")} className={dock}><span className="emoji text-2xl">🎒</span>Friends</button>
          <button onClick={() => setPanel("crew")} className={dock}><span className="emoji text-2xl">🏡</span>Crew</button>
          <button onClick={() => onNav("dex")} className={dock}><span className="emoji text-2xl">📖</span>Dex</button>
          <button onClick={() => onNav("eggs")} className={dock}><span className="emoji text-2xl">🥚</span>Eggs{dot(eggReady)}</button>
          <button onClick={() => onNav("duel")} className={dock}><span className="emoji text-2xl">⚔️</span>Duel</button>
        </div>
      </div>

      {panel === "map" && <MapPanel w={w} have={have.size} onClose={() => setPanel(null)} onPick={(b) => { setPanel(null); onExplore(b); }} />}
      {panel === "today" && <TodayPanel w={w} have={have} onClose={() => setPanel(null)} onVisitor={() => { setPanel(null); onVisitor(); }} />}
      {panel === "crew" && <CrewPanel w={w} onClose={() => setPanel(null)} />}
    </div>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col gap-2 bg-forest p-3">
      <div className="flex items-center justify-between gap-2"><p className="text-2xl font-bold">{title}</p><button onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-xl font-bold text-black active:scale-95">Close</button></div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function MapPanel({ w, have, onClose, onPick }: { w: Wilds; have: number; onClose: () => void; onPick: (b: Biome) => void }) {
  const [lockMsg, setLockMsg] = useState("");
  return (
    <Sheet title="🗺️ Where to explore?" onClose={onClose}>
      <div className="flex flex-wrap justify-center gap-3">
        {BIOMES.map((b) => {
          const open = biomeUnlocked(b.id, w);
          const crew = w.modes.camp ? workersOf(w, b.id) : [];
          const glow = w.modes.camp ? Math.floor(pendingGlow(w, b.id)) : 0;
          return (
            <button key={b.id} onClick={() => (open ? onPick(b) : setLockMsg(`${b.name} opens when you've met ${b.need} different Wilds! (${have}/${b.need})`))}
              className={`relative flex w-40 flex-col items-center rounded-3xl border-[3px] border-ink p-2 shadow-xl active:scale-95 ${open ? "" : "grayscale"}`}
              style={{ background: b.ground }}>
              <span className="emoji text-5xl">{open ? b.emoji : "🔒"}</span>
              <span className="text-center text-base font-bold leading-tight text-white drop-shadow">{b.name}</span>
              {!open && <span className="text-xs text-white">Meet {b.need} Wilds</span>}
              {open && crew.length > 0 && (
                <span className="mt-1 flex -space-x-3" data-testid={`zone-workers-${b.id}`}>
                  {crew.map((o) => <Creature key={o.id} species={SPECIES_BY_ID[o.sp]} stage={stageFor(o.xp)} shiny={o.shiny} variant={o.variant} branch={o.branch} seed={o.seed} personality={o.pers} className="h-10 w-10" />)}
                </span>
              )}
              {glow >= 1 && <span className="absolute -right-2 -top-2 rounded-full border-2 border-ink bg-mustard px-2 text-sm font-bold text-black">✨ {glow}</span>}
            </button>
          );
        })}
      </div>
      {lockMsg && <p className="anim-pop mx-auto mt-3 w-fit rounded-xl bg-black/50 px-4 py-1 text-center text-base">{lockMsg}</p>}
    </Sheet>
  );
}

function TodayPanel({ w, have, onClose, onVisitor }: { w: Wilds; have: Set<string>; onClose: () => void; onVisitor: () => void }) {
  const wod = wildOfDay();
  const visitor = dailyVisitorSpecies();
  return (
    <Sheet title="🎯 Today" onClose={onClose}>
      <div className="mx-auto flex max-w-xl flex-col gap-2">
        <Goals goals={w.goals.list} />
        <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-1">
          <Creature species={wod} stage={2} seed={5} mystery={!have.has(wod.id)} className="h-16 w-16" />
          {have.has(wod.id)
            ? <div className="text-left leading-tight"><p className="text-sm text-white/80">Wild of the Day</p><p className="text-lg font-bold">{wod.names[0]}</p><p className="text-xs text-white/80">appears more often today!</p></div>
            : <div className="text-left leading-tight"><p className="text-sm text-white/80">Wild of the Day</p><p className="text-lg font-bold">??? Mystery</p><p className="text-xs text-white/80">Hint: <span className="emoji">{ELEMENTS[wod.element].emoji}</span> {ELEMENTS[wod.element].name} type · lives in {wod.biomes.map((id) => BIOMES.find((b) => b.id === id)?.emoji).join(" ")}</p></div>}
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
    </Sheet>
  );
}

function CrewPanel({ w, onClose }: { w: Wilds; onClose: () => void }) {
  const crew = homeCrew(w);
  const sel = new Set(crew.map((o) => o.id));
  const free = w.owned.filter((o) => !assignedZone(w, o.id));
  const min = Math.min(CREW_MIN, free.length);
  const [msg, setMsg] = useState(`Pick ${CREW_MIN} to ${CREW_MAX} friends to wander around your meadow.`);
  const toggle = (o: Owned) => {
    const ids = crew.map((c) => c.id);
    if (sel.has(o.id)) {
      if (ids.length <= min) { setMsg(`Keep at least ${min} friends in your meadow.`); return; }
      setWilds(() => ({ homeCrew: ids.filter((i) => i !== o.id) }));
    } else {
      if (ids.length >= CREW_MAX) { setMsg(`The meadow is full (${CREW_MAX}). Tap a friend to send them off first.`); return; }
      setWilds(() => ({ homeCrew: [...ids, o.id] }));
    }
    chime();
  };
  const busy = w.owned.filter((o) => assignedZone(w, o.id));
  return (
    <Sheet title={`🏡 My meadow crew (${crew.length}/${CREW_MAX})`} onClose={onClose}>
      <p className="mb-2 text-center text-base">{msg}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {free.map((o) => {
          const on = sel.has(o.id);
          return (
            <button key={o.id} onClick={() => toggle(o)} aria-pressed={on} className={`relative rounded-2xl p-1 text-center text-emerald-950 active:scale-95 ${on ? "bg-mustard ring-4 ring-white" : "bg-white/80"}`}>
              <Creature species={SPECIES_BY_ID[o.sp]} stage={stageFor(o.xp)} shiny={o.shiny} variant={o.variant} branch={o.branch} seed={o.seed} personality={o.pers} className="mx-auto h-16 w-16" />
              <p className="truncate text-sm font-bold leading-tight">{o.name}</p>
              {on && <span className="emoji absolute right-1 top-0 text-xl">✅</span>}
            </button>
          );
        })}
      </div>
      {busy.length > 0 && <p className="mt-3 text-center text-sm">{busy.map((o) => o.name).join(", ")} {busy.length === 1 ? "is" : "are"} working at a camp, so not at home right now.</p>}
    </Sheet>
  );
}
