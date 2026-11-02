import { useEffect, useMemo, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { BerryPill } from "./BerryGuide";
import { assignedZone, levelOf, workerBreakdown } from "./camp";
import { GlowPill } from "./Camp";
import { Creature } from "./Creature";
import { stageFor } from "./game";
import { GlowIcon } from "./Icons";
import { ModeTabs } from "./ModeTabs";
import type { Mode } from "./ModeTabs";
import { PixelMeadow } from "./PixelMeadow";
import type { VillageView } from "./pixel/meadow";
import { Scene } from "./Scene";
import { SPECIES_BY_ID } from "./species";
import type { Biome } from "./species";
import type { Owned } from "./types";
import { assign, BUILD_ORDER, BUILDINGS, build, buildCost, collect, convert, openVillage, pileOf, rateOf, RESOURCE_NAME, rest, stockTotal, upgrade, upgradeCost, villageOf, VILLAGE_TUNING, workerOf } from "./village";
import type { Resource } from "./village";

const fmt = (n: number) => (n >= 100 ? Math.floor(n).toString() : n.toFixed(1).replace(/\.0$/, ""));
const DECOR_NOTE = "Just pretty. It makes your village yours!";

/** Village mode: tap a plot to build, tap a building to collect, upgrade, or give it a friend to work with. All rules are in village.ts. */
export function VillageMode({ biome, mode, onMode, onBack }: { biome: Biome; mode: Mode; onMode: (m: Mode) => void; onBack: () => void }) {
  const { wilds: w } = useStore();
  const zone = biome.id;
  const [now, setNow] = useState(Date.now());
  const [sel, setSel] = useState<number | null>(null);
  const [pop, setPop] = useState<{ id: number; text: string } | null>(null);
  const [burst, setBurst] = useState(0);
  const [failed, setFailed] = useState(false);
  const say2 = (text: string, speak = true) => { const id = Date.now(); setPop({ id, text }); setTimeout(() => setPop((p) => (p && p.id === id ? null : p)), 1900); if (speak) say(text); };
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const g = openVillage(zone); if (g) say2(`Welcome to your village! Here are ${g} ✨ to start building.`); }, [zone]); // eslint-disable-line react-hooks/exhaustive-deps

  const v = villageOf(w, zone);
  const view: VillageView = useMemo(() => ({
    plots: v.plots.map((p) => {
      if (!p) return null;
      const def = BUILDINGS[p.kind]; const ready = def.kind === "produce" ? (pileOf(w, zone, p, now) >= 1 ? def.makes! : null) : def.kind === "convert" ? (stockTotal(v) >= 1 ? "glow" : null) : null;
      return { kind: p.kind, level: p.level, ready };
    }),
    workers: v.plots.flatMap((p, i) => { const o = workerOf(w, p); return o ? [{ owned: o, plot: i }] : []; }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [JSON.stringify(v), Math.floor(now / 4000), w.owned.length]);

  const plot = sel !== null ? v.plots[sel] : null;
  const stock = v.stock;
  const chips = (["berries", "wood"] as Resource[]).filter((r) => (stock[r] ?? 0) > 0);

  return (
    <div className="absolute inset-0">
      {failed ? <Scene biome={biome} /> : <PixelMeadow crew={[]} workers={[]} village={view} adaptive onFail={() => setFailed(true)} onPlot={(i) => setSel(i)} />}
      <div className="absolute inset-x-0 top-2 z-10 flex items-center justify-between gap-2 px-3">
        <button onClick={onBack} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-purple-800 active:scale-95">◀ Map</button>
        <span className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
          {chips.map((r) => <span key={r} className="rounded-full bg-black/40 px-3 py-1 text-lg font-bold">{RESOURCE_NAME[r].split(" ")[0]} {Math.floor(stock[r] ?? 0)}</span>)}
          <GlowPill n={w.glow} className="!bg-black/40" />
          <BerryPill n={w.berries} className="!bg-black/40" />
        </span>
      </div>
      <div className="relative z-10"><ModeTabs biome={biome} mode={mode} onMode={onMode} /></div>

      {failed && (
        <div className="absolute inset-x-0 bottom-24 top-40 z-10 mx-auto grid max-w-md grid-cols-4 content-center gap-2 px-3" data-testid="village-flat">
          {v.plots.map((p, i) => (
            <button key={i} onClick={() => setSel(i)} className={`flex h-20 flex-col items-center justify-center rounded-2xl border-[3px] border-ink text-center text-sm font-bold leading-tight active:scale-95 ${p ? "bg-[#f2d6a2] text-emerald-950" : "bg-white/40"}`}>
              {p ? <>{BUILDINGS[p.kind].name}<span className="text-xs">Lv {p.level}</span></> : <span className="text-3xl">+</span>}
            </button>
          ))}
        </div>
      )}
      {!failed && sel === null && <p className="pointer-events-none absolute inset-x-0 bottom-3 z-10 text-center text-base font-bold drop-shadow">Tap a glowing + to build · tap a building to use it</p>}
      {pop && <div key={pop.id} className="pointer-events-none absolute left-1/2 top-[40%] z-30 max-w-[85%] -translate-x-1/2 rounded-2xl border-[3px] border-ink bg-[#fff7d6] px-4 py-2 text-center text-xl font-bold text-ink shadow-xl" style={{ animation: "floatup 1.9s ease-out forwards" }}>{pop.text}</div>}
      {burst > 0 && <Burst key={burst} emojis={["✨", "⭐", "💛"]} />}

      {sel !== null && (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[62%] overflow-y-auto rounded-t-3xl border-t-[3px] border-ink bg-white p-3 text-emerald-950 shadow-2xl" data-testid="village-sheet">
          {!plot ? <BuildMenu glow={w.glow} onClose={() => setSel(null)} onBuild={(kind) => { if (build(zone, sel, kind)) { chime(); setBurst((b) => b + 1); say2(`Built a ${BUILDINGS[kind].name}!`); setSel(null); } else { oops(); say2("Not enough ✨ Glow yet.", false); } }} />
            : <PlotSheet zone={zone} i={sel} now={now} onClose={() => setSel(null)} onMsg={(t, party) => { say2(t); if (party) setBurst((b) => b + 1); }} />}
        </div>
      )}
    </div>
  );
}

function BuildMenu({ glow, onBuild, onClose }: { glow: number; onBuild: (kind: string) => void; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between"><p className="text-xl font-bold">🔨 What shall we build?</p><button onClick={onClose} className="rounded-xl bg-gray-100 px-4 py-1 text-lg font-bold">Close</button></div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {BUILD_ORDER.map((k) => {
          const d = BUILDINGS[k], can = glow >= buildCost(k);
          return (
            <button key={k} onClick={() => onBuild(k)} aria-label={`Build ${d.name}`} className={`flex items-center gap-2 rounded-2xl p-2 text-left active:scale-95 ${can ? "bg-emerald-50 ring-2 ring-emerald-300" : "bg-gray-100 text-gray-500"}`}>
              <div className="min-w-0 flex-1 leading-tight"><p className="text-lg font-bold">{d.name} {d.kind === "decor" && <span className="rounded-full bg-pink-200 px-2 text-xs text-pink-900">decor</span>}</p><p className="text-sm">{d.blurb}</p></div>
              <span className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-lg font-bold ${can ? "bg-mustard text-black" : "bg-gray-200"}`}><GlowIcon className="h-5 w-5" /> {d.cost}</span>
            </button>
          );
        })}
      </div>
      {glow < 5 && <p className="mt-2 text-center text-sm">Make ✨ Glow in the Camp tab to build more!</p>}
    </>
  );
}

function PlotSheet({ zone, i, now, onClose, onMsg }: { zone: string; i: number; now: number; onClose: () => void; onMsg: (t: string, party?: boolean) => void }) {
  const { wilds: w } = useStore();
  const [picking, setPicking] = useState(false);
  const v = villageOf(w, zone), p = v.plots[i]; if (!p) return null;
  const def = BUILDINGS[p.kind], o = workerOf(w, p), up = upgradeCost(p), pile = Math.floor(pileOf(w, zone, p, now)), units = Math.floor(stockTotal(v));
  const free = w.owned.filter((q) => !assignedZone(w, q.id)).map((q) => ({ q, r: workerBreakdown(w, zone, q, [q]).rate })).sort((a, b) => b.r - a.r).slice(0, 12);
  const art = (q: Owned, cls: string) => <Creature species={SPECIES_BY_ID[q.sp]} stage={stageFor(q.xp)} shiny={q.shiny} variant={q.variant} branch={q.branch} seed={q.seed} personality={q.pers} className={cls} />;
  return (
    <>
      <div className="flex items-center justify-between"><p className="text-xl font-bold">{def.name} <span className="text-base font-normal">Lv {p.level}/{def.max}</span></p><button onClick={onClose} className="rounded-xl bg-gray-100 px-4 py-1 text-lg font-bold">Close</button></div>
      <p className="text-sm">{def.kind === "decor" ? DECOR_NOTE : def.blurb}</p>
      {def.kind === "produce" && (
        <div className="my-2 rounded-2xl bg-emerald-50 p-2">
          <p className="text-sm">Makes <b>{fmt(rateOf(w, zone, p))}</b> {RESOURCE_NAME[def.makes!]}/min{o ? ` (with ${o.name})` : ""} · pile fills for {VILLAGE_TUNING.capMinutes} min</p>
          <button onClick={() => { const r = collect(zone, i); if (r) { chime(); onMsg(r.what === "glow" ? `+${r.n} ✨ Glow!` : `+${r.n} ${RESOURCE_NAME[r.what]} for the stock!`, r.what === "glow"); } else { oops(); onMsg("Nothing to collect yet. Keep working!"); } }} disabled={pile < 1}
            className={`mt-1 w-full rounded-2xl py-3 text-xl font-bold active:scale-95 ${pile >= 1 ? "bg-mustard text-black ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>Collect {pile >= 1 ? `${pile} ${RESOURCE_NAME[def.makes!]}` : "(growing…)"}</button>
        </div>
      )}
      {def.kind === "convert" && (
        <div className="my-2 rounded-2xl bg-emerald-50 p-2">
          <p className="text-sm">Stock: 🍓 {Math.floor(v.stock.berries ?? 0)} · 🪵 {Math.floor(v.stock.wood ?? 0)} · each unit becomes <b>{VILLAGE_TUNING.convertRate[p.level]}</b> ✨</p>
          <button onClick={() => { const g = convert(zone, i); if (g) { chime(); onMsg(`+${g} ✨ Glow!`, true); } else { oops(); onMsg("No stock yet. Build a Berry Patch or Lumber Hut!"); } }} disabled={units < 1}
            className={`mt-1 w-full rounded-2xl py-3 text-xl font-bold active:scale-95 ${units >= 1 ? "bg-mustard text-black ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>Turn stock into ✨ {units >= 1 ? `(+${units * VILLAGE_TUNING.convertRate[p.level]})` : ""}</button>
        </div>
      )}
      {def.kind !== "decor" && (
        <div className="my-2 flex items-center gap-2 rounded-2xl bg-sky-50 p-2">
          {o ? (<>{art(o, "h-14 w-14 shrink-0")}<div className="min-w-0 flex-1 leading-tight"><p className="truncate text-lg font-bold">{o.name} is working here</p><p className="text-sm">Lv {levelOf(o)} · work ×{fmt(rateOf(w, zone, p) / def.rate[p.level])}</p></div>
            <button onClick={() => { rest(zone, i); onMsg(`${o.name} is resting.`); }} className="rounded-xl bg-red-200 px-3 py-2 text-base font-bold text-red-900 active:scale-95">Rest</button></>)
            : <button onClick={() => setPicking(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-4 border-dashed border-sky-300 py-2 text-lg font-bold active:scale-95"><span className="text-3xl">+</span> Add a friend to work here</button>}
        </div>
      )}
      {picking && (
        <div className="mb-2 grid grid-cols-3 gap-1 rounded-2xl bg-gray-50 p-1 sm:grid-cols-4">
          {free.length === 0 && <p className="col-span-full p-2 text-center">All friends are busy elsewhere!</p>}
          {free.map(({ q, r }) => (
            <button key={q.id} onClick={() => { if (assign(zone, i, q.id)) { note(2); onMsg("Off to work!"); } setPicking(false); }} className="rounded-xl bg-white p-1 text-center active:scale-95">{art(q, "mx-auto h-12 w-12")}<p className="truncate text-xs font-bold">{q.name}</p><p className="text-xs">×{fmt(1 + VILLAGE_TUNING.workerBonus * (r / 0.6))}</p></button>
          ))}
        </div>
      )}
      {up !== null && <button onClick={() => { if (upgrade(zone, i)) { chime(); onMsg(`${def.name} is now level ${p.level + 1}!`, true); } else { oops(); onMsg("Not enough ✨ Glow yet.", false); } }} className={`flex w-full items-center justify-center gap-2 rounded-2xl py-2 text-lg font-bold active:scale-95 ${w.glow >= up ? "bg-emerald-300" : "bg-gray-200 text-gray-500"}`}>⬆️ Upgrade to Lv {p.level + 1} · <GlowIcon className="h-5 w-5" /> {up}</button>}
    </>
  );
}
