// Village mode, phase 0. A region has plots; each plot holds a building; buildings make piles you collect; everything ends as ✨ Glow.
// This file is pure game rules (no drawing), so any art style can show it. To add a building: one entry in BUILDINGS here, plus its
// shape in pixel/buildings.ts. All numbers live in VILLAGE_TUNING and BUILDINGS.
import { getState } from "../lib/store";
import { assignedZone, CAMP_TUNING, workerBreakdown } from "./camp";
import { setWilds, wilds } from "./game";
import type { Owned, Village, VPlot, Wilds } from "./types";

export const VILLAGE_TUNING = {
  plots: 8, capMinutes: 45, gift: 30,
  upgradeMult: [0, 1, 2.5, 6],      // upgrade to level L costs base * upgradeMult[L]  (index 1 = build cost)
  workerBonus: 0.25,                // +25% of the friend's work ratio (a baby is 1, a trained friend is 3 or more)
  convertRate: [0, 2, 3, 4],        // Workshop: ✨ per stock unit by Workshop level
};
export type Resource = "glow" | "berries" | "wood";
export const RESOURCE_NAME: Record<Resource, string> = { glow: "✨ Glow", berries: "🍓 berries", wood: "🪵 wood" };

export type Kind = "produce" | "convert" | "decor";
export interface BuildingDef { id: string; name: string; blurb: string; kind: Kind; makes?: Resource; rate: number[]; cost: number; max: number }
/** Rates are units per minute at level 1, 2, 3 (index 0 unused). */
export const BUILDINGS: Record<string, BuildingDef> = {
  glowwell: { id: "glowwell", name: "Glow Well", blurb: "Makes ✨ Glow all by itself.", kind: "produce", makes: "glow", rate: [0, 0.5, 0.9, 1.5], cost: 15, max: 3 },
  berrypatch: { id: "berrypatch", name: "Berry Patch", blurb: "Grows 🍓 berries for the village stock.", kind: "produce", makes: "berries", rate: [0, 1.2, 2, 3.2], cost: 20, max: 3 },
  lumberhut: { id: "lumberhut", name: "Lumber Hut", blurb: "Chops 🪵 wood for the village stock.", kind: "produce", makes: "wood", rate: [0, 0.9, 1.5, 2.4], cost: 20, max: 3 },
  workshop: { id: "workshop", name: "Workshop", blurb: "Turns all the stock into ✨ Glow. Tap it!", kind: "convert", rate: [0, 0, 0, 0], cost: 40, max: 3 },
  flowers: { id: "flowers", name: "Flower Bed", blurb: "Just pretty. Make your village yours!", kind: "decor", rate: [0, 0, 0, 0], cost: 5, max: 1 },
  lantern: { id: "lantern", name: "Lantern", blurb: "A cozy glow at night. Just pretty!", kind: "decor", rate: [0, 0, 0, 0], cost: 8, max: 1 },
};
export const BUILD_ORDER = ["glowwell", "berrypatch", "lumberhut", "workshop", "flowers", "lantern"];

export const emptyVillage = (): Village => ({ plots: Array.from({ length: VILLAGE_TUNING.plots }, () => null), stock: {}, gift: false });
export const villageOf = (w: Wilds, zone: string): Village => w.village?.[zone] ?? emptyVillage();
export const buildCost = (kind: string) => BUILDINGS[kind].cost;
export const upgradeCost = (p: VPlot) => (p.level >= BUILDINGS[p.kind].max ? null : Math.round(BUILDINGS[p.kind].cost * VILLAGE_TUNING.upgradeMult[p.level + 1]));

/** The friend assigned to a plot, if any. */
export const workerOf = (w: Wilds, p: VPlot | null): Owned | undefined => (p?.worker ? w.owned.find((o) => o.id === p.worker) : undefined);
/** Work multiplier from the assigned friend: 1 with nobody, up from there using the same math as Camp (form, training, mastery, home zone). */
export function workMult(w: Wilds, zone: string, p: VPlot): number {
  const o = workerOf(w, p); if (!o) return 1;
  return 1 + VILLAGE_TUNING.workerBonus * (workerBreakdown(w, zone, o, [o]).rate / CAMP_TUNING.baseRate);
}
export const rateOf = (w: Wilds, zone: string, p: VPlot) => BUILDINGS[p.kind].rate[p.level] * workMult(w, zone, p);
/** Units waiting in a producer's pile (capped, so being away is never punished or endless). */
export function pileOf(w: Wilds, zone: string, p: VPlot | null, now = Date.now()): number {
  if (!p || BUILDINGS[p.kind].kind !== "produce") return 0;
  const r = rateOf(w, zone, p); return Math.min(r * VILLAGE_TUNING.capMinutes, (r * Math.max(0, now - p.at)) / 60000);
}
export const stockTotal = (v: Village) => Object.values(v.stock).reduce((a, b) => a + b, 0);

// ------------------------------------------------------------------ actions (each returns a short result for the screen to show)
function edit(zone: string, fn: (v: Village, w: Wilds) => { v: Village; glow?: number } | null): boolean {
  const w = wilds(); const out = fn(villageOf(w, zone), w); if (!out) return false;
  setWilds((x) => ({ glow: x.glow + (out.glow ?? 0), village: { ...(x.village ?? {}), [zone]: out.v } })); return true;
}
/** First visit: a small gift of ✨ so the loop can start even before Camp has paid anything. */
export function openVillage(zone: string): number {
  const w = wilds(); const v = villageOf(w, zone); if (v.gift) return 0;
  edit(zone, (vv) => ({ v: { ...vv, gift: true }, glow: VILLAGE_TUNING.gift })); return VILLAGE_TUNING.gift;
}
export function build(zone: string, i: number, kind: string): boolean {
  const def = BUILDINGS[kind]; if (!def) return false;
  return edit(zone, (v, w) => {
    if (v.plots[i] || w.glow < def.cost) return null;
    const plots = v.plots.slice(); plots[i] = { kind, level: 1, at: Date.now() };
    return { v: { ...v, plots }, glow: -def.cost };
  });
}
/** Collect a producer's pile: ✨ goes straight to your Glow, other resources go into the village stock. */
export function collect(zone: string, i: number): { what: Resource; n: number } | null {
  let res: { what: Resource; n: number } | null = null;
  edit(zone, (v, w) => {
    const p = v.plots[i]; if (!p) return null; const def = BUILDINGS[p.kind]; const n = Math.floor(pileOf(w, zone, p));
    if (def.kind !== "produce" || n < 1 || !def.makes) return null;
    const plots = v.plots.slice(); plots[i] = { ...p, at: Date.now() };
    res = { what: def.makes, n };
    return def.makes === "glow" ? { v: { ...v, plots }, glow: n } : { v: { ...v, plots, stock: { ...v.stock, [def.makes]: (v.stock[def.makes] ?? 0) + n } } };
  });
  return res;
}
/** The Workshop turns every unit of stock into ✨ (more per unit as it is upgraded). */
export function convert(zone: string, i: number): number {
  let gained = 0;
  edit(zone, (v) => {
    const p = v.plots[i]; if (!p || BUILDINGS[p.kind].kind !== "convert") return null;
    const units = Math.floor(stockTotal(v)); if (units < 1) return null;
    gained = units * VILLAGE_TUNING.convertRate[p.level];
    return { v: { ...v, stock: {} }, glow: gained };
  });
  return gained;
}
export function upgrade(zone: string, i: number): boolean {
  return edit(zone, (v, w) => {
    const p = v.plots[i]; if (!p) return null; const cost = upgradeCost(p); if (cost === null || w.glow < cost) return null;
    const plots = v.plots.slice(); const pile = Math.floor(pileOf(w, zone, p));
    // keep what was already made: bank the pile into the new level's clock by moving the start time back
    plots[i] = { ...p, level: p.level + 1, at: Date.now() - (pile / Math.max(0.01, BUILDINGS[p.kind].rate[p.level + 1] * workMult(w, zone, p))) * 60000 };
    return { v: { ...v, plots }, glow: -cost };
  });
}
export function assign(zone: string, i: number, ownedId: string): boolean {
  if (assignedZone(wilds(), ownedId)) return false;
  return edit(zone, (v, w) => {
    const p = v.plots[i]; if (!p || p.worker || BUILDINGS[p.kind].kind === "decor") return null;
    // bank the pile before the rate changes so nothing is lost
    const plots = v.plots.slice(); const pile = pileOf(w, zone, p); const next = { ...p, worker: ownedId };
    const r = rateOf({ ...w, village: { ...(w.village ?? {}), [zone]: { ...v, plots: v.plots.map((q, k) => (k === i ? next : q)) } } }, zone, next);
    plots[i] = { ...next, at: Date.now() - (pile / Math.max(0.01, r)) * 60000 }; return { v: { ...v, plots } };
  });
}
export function rest(zone: string, i: number): boolean {
  return edit(zone, (v, w) => {
    const p = v.plots[i]; if (!p || !p.worker) return null;
    const plots = v.plots.slice(); const pile = pileOf(w, zone, p); const next = { ...p, worker: undefined };
    const r = BUILDINGS[p.kind].rate[p.level];
    plots[i] = { ...next, at: Date.now() - (pile / Math.max(0.01, r)) * 60000 }; return { v: { ...v, plots } };
  });
}
export const villageModeOn = () => !!getState().wilds.modes.village;
