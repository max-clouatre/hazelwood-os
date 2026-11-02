import { useEffect, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { BerryPill } from "./BerryGuide";
import { assignedZone, assignWorker, boostLeftMs, buyUpgrade, campOf, campRate, CAMP_TUNING as T, capMinutes, collectCamp, levelOf, minutesToFull, pendingGlow, removeWorker, slotsOf, train, trainCost, upgradeInfo, workerBreakdown } from "./camp";
import type { Upgrade } from "./camp";
import { Creature } from "./Creature";
import { GlowIcon } from "./Icons";
import { stageFor } from "./game";
import { ModeTabs } from "./ModeTabs";
import type { Mode } from "./ModeTabs";
import { Scene } from "./Scene";
import { ELEMENTS, FAMILIES, SPECIES_BY_ID } from "./species";
import type { Biome } from "./species";
import type { Owned } from "./types";

const fmt = (n: number) => (n >= 100 ? Math.floor(n).toString() : n.toFixed(1).replace(/\.0$/, ""));
const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
export const GlowPill = ({ n, className = "" }: { n: number; className?: string }) => (
  <span className={`flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xl font-bold ${className}`}><GlowIcon className="h-6 w-6" /> {Math.floor(n)}</span>
);

export function Camp({ biome, mode, onMode, onBack }: { biome: Biome; mode: Mode; onMode: (m: Mode) => void; onBack: () => void }) {
  const { wilds: w } = useStore();
  const [now, setNow] = useState(Date.now());
  const [picker, setPicker] = useState(false);
  const [card, setCard] = useState<string | null>(null);
  const [toast, setToastRaw] = useState("Friends work here and make ✨ Glow!");
  const [pop, setPop] = useState<{ id: number; text: string } | null>(null);
  // messages float up in the middle of the screen (so they are seen on a phone too) and also show in the top bar on bigger screens
  const setToast = (t: string) => { setToastRaw(t); const id = Date.now(); setPop({ id, text: t }); setTimeout(() => setPop((p) => (p && p.id === id ? null : p)), 1900); };
  const [burst, setBurst] = useState(0);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const camp = campOf(w, biome.id);
  const workers = camp.workers.map((id) => w.owned.find((o) => o.id === id)).filter(Boolean) as Owned[];
  const rate = campRate(w, biome.id);
  const pending = pendingGlow(w, biome.id, now);
  const cap = capMinutes(camp);
  const full = minutesToFull(w, biome.id, now);
  const fillPct = workers.length ? Math.min(100, ((cap - full) / cap) * 100) : 0;
  const boostMs = boostLeftMs(w, now);
  const free = slotsOf(camp) - workers.length;

  const collect = () => {
    const n = collectCamp(biome.id);
    if (n < 1) { setToast("Nothing to collect yet. Keep working!"); return; }
    chime(); setBurst((b) => b + 1); setToast(`You collected ${n} Glow!`); say(`You collected ${n} glow!`);
  };
  const buy = (k: Upgrade) => { if (buyUpgrade(biome.id, k)) { chime(); setToast("Upgraded!"); say("Upgraded!"); } else { oops(); setToast("Not enough Glow yet. Collect more!"); } };

  const upgradeRow = (k: Upgrade, title: string, icon: string) => {
    const info = upgradeInfo(w, biome.id, k);
    const maxed = info.cost === null;
    const can = !maxed && w.glow >= info.cost!;
    return (
      <div key={k} className="flex items-center gap-2 rounded-2xl bg-white/90 p-2 text-emerald-950">
        <span className="emoji w-9 shrink-0 text-center text-3xl">{icon}</span>
        <div className="min-w-0 flex-1 leading-tight"><p className="text-base font-bold">{title} <span className="text-sm font-normal text-emerald-800">Lv {info.level}/{info.max}</span></p><p className="text-sm">{maxed ? "Maxed out!" : info.text}</p></div>
        <button onClick={() => buy(k)} disabled={maxed} className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-base font-bold active:scale-95 ${maxed ? "bg-emerald-200 text-emerald-700" : can ? "bg-mustard text-black ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>
          {maxed ? "✓" : <><GlowIcon className="h-5 w-5" /> {info.cost}</>}
        </button>
      </div>
    );
  };

  return (
    <div className="absolute inset-0">
      <Scene biome={biome} />
      <div className="absolute inset-x-0 top-2 flex items-center justify-between gap-2 px-3">
        <button onClick={onBack} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-purple-800 active:scale-95">◀ Map</button>
        <p className="hidden min-w-0 flex-1 truncate rounded-full bg-black/40 px-4 py-1 text-center text-lg font-bold sm:block">{toast}</p><span className="flex-1 sm:hidden" />
        <GlowPill n={w.glow} className="!bg-black/40" />
        <BerryPill n={w.berries} className="!bg-black/40" />
      </div>
      <ModeTabs biome={biome} mode={mode} onMode={onMode} />

      <div className="absolute inset-x-0 bottom-0 top-[8.6rem] overflow-y-auto px-3 pb-3">
        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
          {/* left: workers + basket */}
          <div className="flex flex-col gap-2">
            <div className="rounded-3xl bg-black/35 p-2">
              <p className="px-1 text-lg font-bold">🧑‍🌾 Workers ({workers.length}/{slotsOf(camp)})</p>
              <div className="flex flex-wrap justify-center gap-2">
                {workers.map((o) => {
                  const b = workerBreakdown(w, biome.id, o, workers);
                  return (
                    <button key={o.id} onClick={() => setCard(o.id)} className="relative w-24 rounded-2xl bg-white/90 p-1 text-center text-emerald-950 active:scale-95">
                      <Creature species={SPECIES_BY_ID[o.sp]} stage={stageFor(o.xp)} shiny={o.shiny} variant={o.variant} branch={o.branch} seed={o.seed} personality={o.pers} className="mx-auto h-16 w-16" />
                      <p className="truncate text-sm font-bold leading-tight">{o.name}</p>
                      <p className="text-xs">Lv {levelOf(o)} · +{fmt(b.rate * (1 + T.speedBonus * camp.speed))}/min</p>
                      {b.home > 1 && <span className="emoji absolute right-0 top-0 text-base">🏠</span>}
                    </button>
                  );
                })}
                {Array.from({ length: free }, (_, i) => (
                  <button key={i} onClick={() => setPicker(true)} className="flex h-[7.6rem] w-24 flex-col items-center justify-center rounded-2xl border-4 border-dashed border-white/70 bg-white/10 text-lg font-bold active:scale-95"><span className="text-4xl">+</span>Add friend</button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white/90 p-3 text-emerald-950">
              <div className="flex items-center justify-between"><p className="text-lg font-bold">🧺 Camp basket</p><p className="text-sm">Making <b>{fmt(rate)}</b> Glow/min{boostMs > 0 && <span className="ml-1 rounded-full bg-yellow-300 px-2 font-bold">⭐ ×{T.boostMult}</span>}</p></div>
              <div className="my-1 flex items-center gap-2">
                <GlowIcon className="h-10 w-10" /><p className="text-4xl font-bold">{Math.floor(pending)}</p>
                <div className="flex-1"><div className="h-4 overflow-hidden rounded-full bg-emerald-200"><div className="h-full bg-mustard transition-all" style={{ width: `${fillPct}%` }} /></div>
                  <p className="text-xs">{!workers.length ? "Add a friend to start working" : full <= 0 ? "Basket is full! Collect it." : `Full in ${Math.ceil(full)} min · works up to ${cap} min`}</p></div>
              </div>
              <button onClick={collect} disabled={pending < 1} className={`w-full rounded-2xl py-3 text-2xl font-bold active:scale-95 ${pending >= 1 ? "bg-mustard text-black ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>Collect ✨</button>
              <p className="mt-1 text-center text-xs">{boostMs > 0 ? `⭐ Star Boost: double speed for ${mmss(boostMs)}` : "⭐ Earn stars in other activities for a Star Boost (double speed)!"}</p>
            </div>
          </div>

          {/* right: upgrades */}
          <div className="flex flex-col gap-2">
            <p className="px-1 text-lg font-bold drop-shadow">⬆️ Camp upgrades</p>
            {upgradeRow("slot", "More workers", "🧑‍🤝‍🧑")}
            {upgradeRow("basket", "Bigger basket", "🧺")}
            {upgradeRow("speed", "Faster work", "⚡")}
            <p className="rounded-2xl bg-black/35 p-2 text-sm">Tips: friends who <b>live here</b> (🏠) work 50% faster. Friends from the <b>same family</b> cheer each other on. Tap a worker to train it up!</p>
          </div>
        </div>
      </div>

      {pop && <div key={pop.id} className="pointer-events-none absolute left-1/2 top-[48%] z-30 max-w-[85%] rounded-2xl border-[3px] border-ink bg-[#fff7d6] px-4 py-2 text-center text-xl font-bold text-ink shadow-xl" style={{ animation: "floatup 1.9s ease-out forwards" }}>{pop.text}</div>}
      {picker && <Picker biome={biome} onClose={() => setPicker(false)} onPick={(id) => { if (assignWorker(biome.id, id)) { note(2); setToast("Off to work!"); } setPicker(false); }} />}
      {card && <WorkerCard biome={biome} ownedId={card} onClose={() => setCard(null)} />}
      {burst > 0 && <Burst key={burst} emojis={["✨", "⭐", "💛"]} />}
    </div>
  );
}

function Picker({ biome, onClose, onPick }: { biome: Biome; onClose: () => void; onPick: (id: string) => void }) {
  const { wilds: w } = useStore();
  const team = campOf(w, biome.id).workers.map((id) => w.owned.find((o) => o.id === id)).filter(Boolean) as Owned[];
  const list = w.owned.filter((o) => !assignedZone(w, o.id)).map((o) => ({ o, b: workerBreakdown(w, biome.id, o, [...team, o]) })).sort((a, b) => b.b.rate - a.b.rate);
  return (
    <div className="absolute inset-0 z-40 flex flex-col gap-2 bg-black/75 p-3">
      <div className="flex items-center justify-between"><p className="text-2xl font-bold">Who should work here?</p><button onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-xl font-bold text-black">Close</button></div>
      <div className="grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto sm:grid-cols-3">
        {list.length === 0 && <p className="col-span-full text-center text-xl">All your friends are busy at other camps!</p>}
        {list.map(({ o, b }) => (
          <button key={o.id} onClick={() => onPick(o.id)} className="flex items-center gap-2 rounded-2xl bg-white/90 p-1 text-left text-emerald-950 active:scale-95">
            <Creature species={SPECIES_BY_ID[o.sp]} stage={stageFor(o.xp)} shiny={o.shiny} variant={o.variant} branch={o.branch} seed={o.seed} personality={o.pers} className="h-16 w-16 shrink-0" />
            <div className="min-w-0 leading-tight"><p className="truncate text-base font-bold">{o.name}</p><p className="text-xs">Lv {levelOf(o)} · <b>+{fmt(b.rate)}</b>/min</p>{b.home > 1 && <p className="text-xs font-bold text-emerald-700">🏠 lives here!</p>}{b.sameFamily > 0 && <p className="text-xs text-emerald-700">family cheer +{b.sameFamily * 10}%</p>}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkerCard({ biome, ownedId, onClose }: { biome: Biome; ownedId: string; onClose: () => void }) {
  const { wilds: w } = useStore();
  const [msg, setMsg] = useState("");
  const o = w.owned.find((x) => x.id === ownedId);
  if (!o) return null;
  const team = campOf(w, biome.id).workers.map((id) => w.owned.find((q) => q.id === id)).filter(Boolean) as Owned[];
  const b = workerBreakdown(w, biome.id, o, team);
  const cost = trainCost(o);
  const sp = SPECIES_BY_ID[o.sp];
  const row = (label: string, val: string, on = true) => <p className={`flex justify-between text-base ${on ? "" : "text-gray-400"}`}><span>{label}</span><b>{val}</b></p>;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-3">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white p-3 text-emerald-950 shadow-2xl">
        <div className="flex items-center gap-2">
          <Creature species={sp} stage={stageFor(o.xp)} shiny={o.shiny} variant={o.variant} branch={o.branch} seed={o.seed} personality={o.pers} className="h-24 w-24" />
          <div><p className="text-2xl font-bold">{o.name}</p><p className="text-lg">Level <b>{levelOf(o)}</b>/{T.levelMax}</p><p className="text-base">Makes <b>{fmt(b.rate * (1 + T.speedBonus * campOf(w, biome.id).speed))}</b> ✨/min</p></div>
        </div>
        <div className="my-2 rounded-2xl bg-emerald-50 p-2">
          {row("Base work", `${T.baseRate}`)}
          {row(`Form ${stageFor(o.xp)}`, `×${b.form}`)}
          {row(`Training level ${levelOf(o)}`, `×${b.level.toFixed(2)}`, levelOf(o) > 1)}
          {row(`Mastery ${"★".repeat(b.stars) || "(none yet)"}`, `×${b.mastery.toFixed(2)}`, b.stars > 0)}
          {row("🏠 Lives in this zone", `×${b.home}`, b.home > 1)}
          {row(`${ELEMENTS[sp.element].emoji} ${FAMILIES[sp.element].name} cheer (${b.sameFamily})`, `×${b.family.toFixed(2)}`, b.sameFamily > 0)}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (train(o.id)) { chime(); setMsg(`${o.name} is now level ${levelOf(o) + 1}!`); say("Level up!"); } else { oops(); setMsg("Not enough Glow yet."); } }} disabled={cost === null}
            className={`flex-1 rounded-2xl py-3 text-xl font-bold active:scale-95 ${cost === null ? "bg-emerald-200" : w.glow >= cost ? "bg-mustard text-black ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>
            {cost === null ? "Max level!" : <>Train → Lv {levelOf(o) + 1} · <GlowIcon className="mb-1 inline-block h-5 w-5" /> {cost}</>}
          </button>
          <button onClick={() => { removeWorker(biome.id, o.id); onClose(); }} className="rounded-2xl bg-red-200 px-4 py-3 text-lg font-bold text-red-900 active:scale-95">Rest</button>
        </div>
        {msg && <p className="anim-pop mt-1 text-center text-base font-bold">{msg}</p>}
        <button onClick={onClose} className="mt-2 w-full rounded-2xl bg-gray-100 py-2 text-lg font-bold">Close</button>
      </div>
    </div>
  );
}
