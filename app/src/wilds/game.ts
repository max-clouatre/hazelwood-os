import { getState, update } from "../lib/store";
import { hashString } from "./colors";
import { BIOMES, COLLECTABLE, FOOD_COST, SPECIES_BY_ID, STAGE_AT } from "./species";
import type { FoodId, Personality, Species } from "./species";
import type { Egg, Owned, Wilds } from "./types";

export const todayKey = () => new Date().toDateString();
const pickOf = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
export const PERS_LIST: Personality[] = ["gentle", "zippy", "sleepy", "brave", "shy", "silly"];

export function wilds(): Wilds { return getState().wilds; }
export function setWilds(fn: (w: Wilds) => Partial<Wilds>) {
  update((s) => ({ wilds: { ...s.wilds, ...fn(s.wilds) } }));
}

/** Reset the once-a-day things when a new day starts. */
export function rollDay() {
  if (wilds().day !== todayKey()) setWilds(() => ({ day: todayKey(), visitorDone: false, treeDone: false }));
}

export const wildOfDay = (): Species => COLLECTABLE[hashString(todayKey() + "w") % COLLECTABLE.length];
export const dailyVisitorSpecies = (): Species => {
  const pool = COLLECTABLE.filter((s) => s.rarity >= 2 && s.id !== wildOfDay().id);
  return pool[hashString(todayKey() + "v") % pool.length];
};

export const collected = (w: Wilds) => new Set(w.owned.map((o) => o.sp));
export const biomeUnlocked = (id: string, w: Wilds) => collected(w).size >= (BIOMES.find((b) => b.id === id)?.need ?? 0);

/** Weighted random species for a biome. A lure removes the commons. Wild of the Day is 3x as likely. */
export function pickSpawn(biomeId: string, opts: { lure?: boolean } = {}): Species {
  const wod = wildOfDay().id;
  const pool = COLLECTABLE.filter((s) => s.biomes.includes(biomeId) && (!opts.lure || s.rarity >= 2));
  const list = pool.length ? pool : COLLECTABLE.filter((s) => s.biomes.includes(biomeId));
  const weights = list.map((s) => ({ 1: 6, 2: 3, 3: 1, 4: 0 }[s.rarity] * (s.id === wod ? 3 : 1)));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { r -= weights[i]; if (r <= 0) return list[i]; }
  return list[0];
}

export const rollShiny = (extra = 0) => Math.random() < 1 / 16 + extra;

export function catchChance(sp: Species, quality: "great" | "nice" | "ok" | "miss", berry: boolean, bonus = 0): number {
  const base = { 1: 0.7, 2: 0.58, 3: 0.45, 4: 0.3 }[sp.rarity];
  const q = { great: 0.25, nice: 0.12, ok: 0, miss: -0.4 }[quality];
  return Math.max(0.05, Math.min(0.96, base + q + (berry ? 0.15 : 0) + bonus));
}

export function makeOwned(sp: Species, shiny: boolean, name?: string): Owned {
  const w = wilds();
  return {
    id: `${Date.now().toString(36)}${w.seq}`, sp: sp.id, name: name || sp.names[0], shiny,
    seed: 1 + Math.floor(Math.random() * 100000), pers: pickOf(PERS_LIST), xp: 0, got: todayKey(), pet: { day: "", n: 0 },
  };
}

export function markSeen(spId: string) {
  setWilds((w) => ({ seen: { ...w.seen, [spId]: (w.seen[spId] ?? 0) + 1 } }));
}

/** Adds a creature. Returns true if this completed the Wilddex and unlocked the legendary. */
export function addOwned(o: Owned): boolean {
  setWilds((w) => ({ owned: [...w.owned, o], seq: w.seq + 1, seen: { ...w.seen, [o.sp]: Math.max(1, w.seen[o.sp] ?? 0) } }));
  const w = wilds();
  if (!w.legend && collected(w).size >= COLLECTABLE.length) {
    const sp = SPECIES_BY_ID.hazelwisp;
    setWilds((x) => ({ legend: true, owned: [...x.owned, { ...makeOwned(sp, false, "Hazelwisp"), pers: "gentle", xp: 40 }] }));
    return true;
  }
  return false;
}

export const rename = (id: string, name: string) =>
  setWilds((w) => ({ owned: w.owned.map((o) => (o.id === id ? { ...o, name: name.trim().slice(0, 14) || o.name } : o)) }));

export function stageFor(xp: number): 1 | 2 | 3 { return xp >= STAGE_AT[2] ? 3 : xp >= STAGE_AT[1] ? 2 : 1; }
/** 0..1 progress toward the next form, and a label. */
export function bond(xp: number): { stage: 1 | 2 | 3; pct: number; toNext: number } {
  const st = stageFor(xp);
  if (st === 3) return { stage: 3, pct: 1, toNext: 0 };
  const lo = STAGE_AT[st - 1], hi = STAGE_AT[st];
  return { stage: st, pct: (xp - lo) / (hi - lo), toNext: hi - xp };
}

/** Adds bond points. If the creature still has its default name, it takes its new form's name. */
function grow(c: Owned, gain: number): Owned {
  const sp = SPECIES_BY_ID[c.sp];
  const before = stageFor(c.xp);
  const xp = Math.min(80, c.xp + gain);
  const after = stageFor(xp);
  return { ...c, xp, name: after > before && c.name === sp.names[before - 1] ? sp.names[after - 1] : c.name };
}

export function feed(id: string, food: FoodId): { ok: boolean; fav: boolean; evolved: boolean } {
  const w = wilds();
  const o = w.owned.find((x) => x.id === id);
  if (!o || w.berries < FOOD_COST) return { ok: false, fav: false, evolved: false };
  const sp = SPECIES_BY_ID[o.sp];
  const fav = sp.fav === food;
  const before = stageFor(o.xp);
  const gain = fav ? 5 : 2;
  setWilds((x) => ({
    berries: x.berries - FOOD_COST,
    owned: x.owned.map((c) => (c.id === id ? grow(c, gain) : c)),
    favs: fav ? { ...x.favs, [o.sp]: food } : x.favs,
  }));
  return { ok: true, fav, evolved: stageFor(o.xp + gain) > before };
}

export function pet(id: string): { ok: boolean; evolved: boolean } {
  const o = wilds().owned.find((x) => x.id === id);
  if (!o) return { ok: false, evolved: false };
  const today = todayKey();
  const n = o.pet.day === today ? o.pet.n : 0;
  if (n >= 3) return { ok: false, evolved: false };
  const before = stageFor(o.xp);
  setWilds((x) => ({ owned: x.owned.map((c) => (c.id === id ? { ...grow(c, 1), pet: { day: today, n: n + 1 } } : c)) }));
  return { ok: true, evolved: stageFor(o.xp + 1) > before };
}
export const petsLeft = (o: Owned) => 3 - (o.pet.day === todayKey() ? o.pet.n : 0);

export function gainBond(ids: string[], n: number) {
  setWilds((x) => ({ owned: x.owned.map((c) => (ids.includes(c.id) ? grow(c, n) : c)) }));
}

export const EGG_COST = 15;
export const EGG_NEED = 5;
export function buyEgg(): boolean {
  if (wilds().berries < EGG_COST) return false;
  setWilds((w) => ({ berries: w.berries - EGG_COST, eggs: [...w.eggs, { id: `e${Date.now().toString(36)}${w.seq}`, need: EGG_NEED, have: 0 } as Egg], seq: w.seq + 1 }));
  return true;
}
export const giveEgg = () => setWilds((w) => ({ eggs: [...w.eggs, { id: `e${Date.now().toString(36)}${w.seq}`, need: EGG_NEED, have: 0 }], seq: w.seq + 1 }));

/** Egg hatchlings are never common. */
export function hatchSpecies(): Species {
  const pool = COLLECTABLE.filter((s) => s.rarity >= 2);
  const wts = pool.map((s) => (s.rarity === 3 ? 1 : 3));
  let r = Math.random() * wts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= wts[i]; if (r <= 0) return pool[i]; }
  return pool[0];
}
export const removeEgg = (id: string) => setWilds((w) => ({ eggs: w.eggs.filter((e) => e.id !== id) }));
export const addBerries = (n: number) => setWilds((w) => ({ berries: w.berries + n }));
