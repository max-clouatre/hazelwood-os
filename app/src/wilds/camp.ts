import { getState } from "../lib/store";
import { SPECIES_BY_ID } from "./species";
import { setWilds, stageFor, wilds } from "./game";
import { MASTERY_BONUS, masteryStars } from "./mastery";
import type { Camp, Owned, Wilds } from "./types";

// ------------------------------------------------------------------ every Camp number lives here
export const CAMP_TUNING = {
  baseRate: 0.6,                  // ✨ per minute for a baby worker
  formMult: [1, 1, 1.6, 2.4],     // by form (index 1..3)
  levelBonus: 0.12,               // +12% per training level above 1
  homeBonus: 1.5,                 // x1.5 in a zone where the species lives
  familyBonus: 0.1, familyMax: 3, // +10% per other worker of the same family (max +30%)
  speedBonus: 0.25,               // +25% per "faster work" level
  baseSlots: 2, slotCosts: [40, 120, 360],
  baseMinutes: 60, basketMinutes: 30, basketMax: 6, basketCost: (l: number) => Math.round(30 * Math.pow(1.7, l)),
  speedMax: 8, speedCost: (l: number) => Math.round(50 * Math.pow(1.8, l)),
  levelMax: 10, trainCost: (l: number) => Math.round(20 * Math.pow(1.55, l - 1)), // cost to go from level l to l+1
  boostMult: 2, boostMinutesPerStar: 10, boostStoreMinutes: 60,
};
const T = CAMP_TUNING;

export const emptyCamp = (now = Date.now()): Camp => ({ workers: [], extra: 0, basket: 0, speed: 0, since: now });
export const campOf = (w: Wilds, zone: string): Camp => w.camps[zone] ?? emptyCamp(0);
export const slotsOf = (c: Camp) => T.baseSlots + c.extra;
/** The friends currently working at a zone's camp (shown on screen, on the map and in the camp yard). */
export const workersOf = (w: Wilds, zone: string): Owned[] => campOf(w, zone).workers.map((id) => w.owned.find((o) => o.id === id)).filter(Boolean) as Owned[];
export const levelOf = (o: Owned) => o.level ?? 1;
export const capMinutes = (c: Camp) => T.baseMinutes + T.basketMinutes * c.basket;

/** ✨ per minute one friend makes in a zone, and the parts that make up the number (for showing why). */
export function workerBreakdown(w: Wilds, zone: string, o: Owned, teammates: Owned[]) {
  const sp = SPECIES_BY_ID[o.sp];
  const form = T.formMult[stageFor(o.xp)];
  const level = 1 + T.levelBonus * (levelOf(o) - 1);
  const stars = masteryStars(w, o.sp);
  const mastery = 1 + MASTERY_BONUS * stars;
  const home = sp.biomes.includes(zone) ? T.homeBonus : 1;
  const sameFamily = teammates.filter((t) => t.id !== o.id && SPECIES_BY_ID[t.sp].element === sp.element).length;
  const family = 1 + T.familyBonus * Math.min(T.familyMax, sameFamily);
  return { rate: T.baseRate * form * level * mastery * home * family, form, level, mastery, stars, home, family, sameFamily };
}
export function campRate(w: Wilds, zone: string): number {
  const c = campOf(w, zone), team = workersOf(w, zone);
  return team.reduce((n, o) => n + workerBreakdown(w, zone, o, team).rate, 0) * (1 + T.speedBonus * c.speed);
}

/** Minutes of the last `elapsedMin` that fall inside the Star Boost window. */
function boostOverlapMin(w: Wilds, now: number, elapsedMin: number): number {
  const start = now - elapsedMin * 60000;
  const a = Math.max(start, w.boost.from), b = Math.min(now, w.boost.until);
  return Math.max(0, (b - a) / 60000);
}
export function boostLeftMs(w: Wilds, now = Date.now()) { return Math.max(0, w.boost.until - now); }

/** Glow waiting in a camp's basket right now. */
export function pendingGlow(w: Wilds, zone: string, now = Date.now()): number {
  const c = w.camps[zone]; if (!c || !c.workers.length) return 0;
  const elapsed = Math.min(Math.max(0, (now - c.since) / 60000), capMinutes(c));
  return campRate(w, zone) * (elapsed + (T.boostMult - 1) * boostOverlapMin(w, now, elapsed));
}
/** Minutes until the basket is full (0 when full or no workers). */
export function minutesToFull(w: Wilds, zone: string, now = Date.now()): number {
  const c = w.camps[zone]; if (!c || !c.workers.length) return 0;
  return Math.max(0, capMinutes(c) - (now - c.since) / 60000);
}

// ------------------------------------------------------------------ actions
export function collectCamp(zone: string): number {
  const w = wilds(); const n = Math.floor(pendingGlow(w, zone));
  const c = w.camps[zone]; if (!c) return 0;
  setWilds((x) => ({ glow: x.glow + n, camps: { ...x.camps, [zone]: { ...c, since: Date.now() } } }));
  return n;
}
/** Change a camp, collecting what it has made first so no work is lost or double counted. */
function edit(zone: string, fn: (c: Camp) => Camp) {
  const gained = Math.floor(pendingGlow(wilds(), zone));
  setWilds((x) => { const c = x.camps[zone] ?? emptyCamp(); return { glow: x.glow + gained, camps: { ...x.camps, [zone]: { ...fn(c), since: Date.now() } } }; });
  return gained;
}
export const assignedZone = (w: Wilds, ownedId: string) => Object.keys(w.camps).find((z) => w.camps[z].workers.includes(ownedId));
export function assignWorker(zone: string, ownedId: string): boolean {
  const w = wilds(); const c = campOf(w, zone);
  if (c.workers.length >= slotsOf(c) || assignedZone(w, ownedId)) return false;
  edit(zone, (x) => ({ ...x, workers: [...x.workers, ownedId] })); return true;
}
export function removeWorker(zone: string, ownedId: string) { edit(zone, (x) => ({ ...x, workers: x.workers.filter((i) => i !== ownedId) })); }

export type Upgrade = "slot" | "basket" | "speed";
export function upgradeInfo(w: Wilds, zone: string, kind: Upgrade): { level: number; max: number; cost: number | null; text: string } {
  const c = campOf(w, zone);
  if (kind === "slot") { const l = c.extra; return { level: l, max: T.slotCosts.length, cost: T.slotCosts[l] ?? null, text: `${slotsOf(c)} workers → ${slotsOf(c) + 1}` }; }
  if (kind === "basket") { const l = c.basket; return { level: l, max: T.basketMax, cost: l >= T.basketMax ? null : T.basketCost(l), text: `keeps working ${capMinutes(c)} min → ${capMinutes(c) + T.basketMinutes} min` }; }
  const l = c.speed; return { level: l, max: T.speedMax, cost: l >= T.speedMax ? null : T.speedCost(l), text: `+${l * 25}% → +${(l + 1) * 25}% work speed` };
}
export function buyUpgrade(zone: string, kind: Upgrade): boolean {
  const w = wilds(); const info = upgradeInfo(w, zone, kind);
  if (info.cost === null || w.glow < info.cost) return false;
  setWilds((x) => ({ glow: x.glow - info.cost! }));
  edit(zone, (c) => ({ ...c, extra: c.extra + (kind === "slot" ? 1 : 0), basket: c.basket + (kind === "basket" ? 1 : 0), speed: c.speed + (kind === "speed" ? 1 : 0) }));
  return true;
}

export const trainCost = (o: Owned) => (levelOf(o) >= T.levelMax ? null : T.trainCost(levelOf(o)));
export function train(ownedId: string): boolean {
  const w = wilds(); const o = w.owned.find((x) => x.id === ownedId); if (!o) return false;
  const cost = trainCost(o); if (cost === null || w.glow < cost) return false;
  // collect first so the faster rate only counts from now
  const zone = assignedZone(w, ownedId);
  if (zone) edit(zone, (c) => c);
  setWilds((x) => ({ glow: x.glow - cost, owned: x.owned.map((q) => (q.id === ownedId ? { ...q, level: levelOf(q) + 1 } : q)) }));
  return true;
}
export const modeEnabled = (mode: "camp") => getState().wilds.modes[mode];

/** Who wanders on the landing meadow: her chosen crew, else the most grown friends. Friends at work in a camp are busy there.
 *  Always returns at least CREW_MIN (if she owns that many) and at most CREW_MAX. */
export const CREW_MIN = 5, CREW_MAX = 10;
export function homeCrew(w: Wilds): Owned[] {
  const busy = new Set(Object.keys(w.camps).flatMap((z) => w.camps[z].workers));
  const free = w.owned.filter((o) => !busy.has(o.id));
  const chosen = w.homeCrew.map((id) => free.find((o) => o.id === id)).filter(Boolean) as Owned[];
  const rest = free.filter((o) => !chosen.includes(o)).sort((a, b) => b.xp - a.xp);
  return [...chosen, ...rest.slice(0, Math.max(0, CREW_MIN - chosen.length))].slice(0, CREW_MAX);
}
