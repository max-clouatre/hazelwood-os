import { getState, update } from "../lib/store";
import { hashString, mulberry32 } from "./colors";
import { BIOMES, COLLECTABLE, ELEMENTS, FAMILIES, FOOD_COST, FOOD_SIDE, FORM_KEYS, LEGACY_NAMES, SPECIES_BY_ID, STAGE_AT, familyMembers } from "./species";
import type { ElementId, FoodId, FormKey, Personality, Species, VariantId } from "./species";
import type { Branch, Egg, Goal, GoalKind, Owned, Wilds } from "./types";

export const todayKey = () => new Date().toDateString();
const pickOf = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
export const PERS_LIST: Personality[] = ["gentle", "zippy", "sleepy", "brave", "shy", "silly"];

export function wilds(): Wilds { return getState().wilds; }
export function setWilds(fn: (w: Wilds) => Partial<Wilds>) {
  update((s) => ({ wilds: { ...s.wilds, ...fn(s.wilds) } }));
}
export const addBerries = (n: number) => setWilds((w) => ({ berries: w.berries + n }));

// ---------------------------------------------------------------- daily rollover, Wild of the Day
export function rollDay() {
  const w = wilds();
  // Names changed to plain animal names: rename friends that still carry an old default name.
  if (w.owned.some((o) => LEGACY_NAMES[o.sp]?.includes(o.name))) {
    setWilds((x) => ({ owned: x.owned.map((o) => { const old = LEGACY_NAMES[o.sp]; if (!old?.includes(o.name)) return o; return { ...o, name: SPECIES_BY_ID[o.sp].names[stageFor(o.xp) - 1] }; }) }));
  }
  // Older saves: fully grown friends without a final form get one (and the food tally field).
  if (w.owned.some((o) => !o.foods || (stageFor(o.xp) === 3 && !o.branch && SPECIES_BY_ID[o.sp].rarity < 4))) {
    setWilds((x) => ({ owned: x.owned.map((o) => ({ ...o, foods: o.foods ?? [0, 0], branch: o.branch ?? (stageFor(o.xp) === 3 && SPECIES_BY_ID[o.sp].rarity < 4 ? (o.seed % 2 ? "sun" : "moon") : undefined) })) }));
  }
  if (w.day !== todayKey()) setWilds(() => ({ day: todayKey(), visitorDone: false, treeDone: false }));
  if (w.goals.day !== todayKey()) setWilds((x) => ({ goals: { day: todayKey(), list: makeGoals(x) } }));
}
export const wildOfDay = (): Species => COLLECTABLE[hashString(todayKey() + "w") % COLLECTABLE.length];
export const dailyVisitorSpecies = (): Species => {
  const pool = COLLECTABLE.filter((s) => s.rarity >= 2 && s.id !== wildOfDay().id);
  return pool[hashString(todayKey() + "v") % pool.length];
};

// ---------------------------------------------------------------- collection helpers
export const collected = (w: Wilds) => new Set(w.owned.map((o) => o.sp));
export const biomeUnlocked = (id: string, w: Wilds) => collected(w).size >= (BIOMES.find((b) => b.id === id)?.need ?? 0);

export function stageFor(xp: number): 1 | 2 | 3 { return xp >= STAGE_AT[2] ? 3 : xp >= STAGE_AT[1] ? 2 : 1; }
export function bond(xp: number): { stage: 1 | 2 | 3; pct: number; toNext: number } {
  const st = stageFor(xp);
  if (st === 3) return { stage: 3, pct: 1, toNext: 0 };
  const lo = STAGE_AT[st - 1], hi = STAGE_AT[st];
  return { stage: st, pct: (xp - lo) / (hi - lo), toNext: hi - xp };
}

/** Which of the four forms (baby, grown, sunlit, moonlit) this creature has reached. */
export function formKeysOf(o: Owned): FormKey[] {
  const st = stageFor(o.xp);
  const out: FormKey[] = ["1"];
  if (st >= 2) out.push("2");
  if (st === 3) out.push(o.branch === "moon" ? "3m" : "3s");
  return out;
}
export function formsFound(w: Wilds, spId: string): Set<FormKey> {
  const s = new Set<FormKey>();
  w.owned.filter((o) => o.sp === spId).forEach((o) => formKeysOf(o).forEach((k) => s.add(k)));
  return s;
}
export const totalFormsFound = (w: Wilds) => COLLECTABLE.reduce((n, sp) => n + formsFound(w, sp.id).size, 0);
export const TOTAL_FORMS = COLLECTABLE.length * FORM_KEYS.length;

// ---------------------------------------------------------------- spawns and catching
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

const VAR_BASE: Record<VariantId, number> = { golden: 1 / 60, storm: 1 / 32, shadow: 1 / 32, autumn: 1 / 20 };
const VAR_BOOST: Record<string, Partial<Record<VariantId, number>>> = {
  meadow: { autumn: 2 }, forest: { autumn: 2, shadow: 2 }, shore: { storm: 2 }, cave: { shadow: 2 }, peak: { storm: 2, shadow: 1.5 },
};
/** Special colors turn up more in some places: shadow in dark places, storm by the sea and peaks, autumn in forests. */
export function rollVariant(biome?: string): VariantId | undefined {
  let r = Math.random();
  for (const id of Object.keys(VAR_BASE) as VariantId[]) {
    const p = VAR_BASE[id] * ((biome && VAR_BOOST[biome]?.[id]) || 1);
    if (r < p) return id;
    r -= p;
  }
  return undefined;
}
/** Which special colors of a species she has found ("shiny" counts too). */
export function colorsFound(w: Wilds, spId: string): Set<string> {
  const s = new Set<string>();
  w.owned.filter((o) => o.sp === spId).forEach((o) => { if (o.shiny) s.add("shiny"); if (o.variant) s.add(o.variant); });
  return s;
}

export function makeOwned(sp: Species, shiny: boolean, name?: string, variant?: VariantId): Owned {
  const w = wilds();
  return {
    id: `${Date.now().toString(36)}${w.seq}`, sp: sp.id, name: name || sp.names[0], shiny,
    seed: 1 + Math.floor(Math.random() * 100000), pers: pickOf(PERS_LIST), xp: 0, got: todayKey(), pet: { day: "", n: 0 }, foods: [0, 0], variant,
  };
}
export function markSeen(spId: string) { setWilds((w) => ({ seen: { ...w.seen, [spId]: (w.seen[spId] ?? 0) + 1 } })); }

/** Adds a creature. Returns true if this completed the Wilddex and unlocked the legendary. */
export function addOwned(o: Owned): boolean {
  setWilds((w) => ({ owned: [...w.owned, o], seq: w.seq + 1, seen: { ...w.seen, [o.sp]: Math.max(1, w.seen[o.sp] ?? 0) } }));
  let legend = false;
  const w = wilds();
  if (!w.legend && collected(w).size >= COLLECTABLE.length) {
    const sp = SPECIES_BY_ID.hazelwisp;
    setWilds((x) => ({ legend: true, owned: [...x.owned, { ...makeOwned(sp, false, "Hazelwisp"), pers: "gentle", xp: 40, branch: undefined }] }));
    legend = true;
  }
  checkBadges();
  return legend;
}
export const rename = (id: string, name: string) =>
  setWilds((w) => ({ owned: w.owned.map((o) => (o.id === id ? { ...o, name: name.trim().slice(0, 14) || o.name } : o)) }));

// ---------------------------------------------------------------- bond, food, evolution
/** Adds bond points. Crossing into form 3 locks in the final form from what it was fed. */
function grow(c: Owned, gain: number, food?: FoodId): Owned {
  const sp = SPECIES_BY_ID[c.sp];
  const before = stageFor(c.xp);
  const foods: [number, number] = [...(c.foods ?? [0, 0])] as [number, number];
  if (food) foods[FOOD_SIDE[food] === "sun" ? 0 : 1] += 1;
  const xp = Math.min(80, c.xp + gain);
  const after = stageFor(xp);
  let branch: Branch | undefined = c.branch;
  if (after === 3 && !branch && sp.rarity < 4) branch = foods[0] > foods[1] ? "sun" : foods[1] > foods[0] ? "moon" : c.seed % 2 ? "sun" : "moon";
  const name = after > before && c.name === sp.names[before - 1] ? sp.names[after - 1] : c.name;
  return { ...c, xp, foods, branch, name };
}

export function feed(id: string, food: FoodId): { ok: boolean; fav: boolean; evolved: boolean } {
  const w = wilds();
  const o = w.owned.find((x) => x.id === id);
  if (!o || w.berries < FOOD_COST) return { ok: false, fav: false, evolved: false };
  const sp = SPECIES_BY_ID[o.sp];
  const fav = sp.fav === food;
  const gain = fav ? 5 : 2;
  const evolved = stageFor(o.xp + gain) > stageFor(o.xp);
  setWilds((x) => ({
    berries: x.berries - FOOD_COST,
    owned: x.owned.map((c) => (c.id === id ? grow(c, gain, food) : c)),
    favs: fav ? { ...x.favs, [o.sp]: food } : x.favs,
  }));
  bump("feed"); if (evolved) bump("evolve");
  checkBadges();
  return { ok: true, fav, evolved };
}

export function pet(id: string): { ok: boolean; evolved: boolean } {
  const o = wilds().owned.find((x) => x.id === id);
  if (!o) return { ok: false, evolved: false };
  const today = todayKey();
  const n = o.pet.day === today ? o.pet.n : 0;
  if (n >= 3) return { ok: false, evolved: false };
  const evolved = stageFor(o.xp + 1) > stageFor(o.xp);
  setWilds((x) => ({ owned: x.owned.map((c) => (c.id === id ? { ...grow(c, 1), pet: { day: today, n: n + 1 } } : c)) }));
  bump("pet"); if (evolved) bump("evolve");
  checkBadges();
  return { ok: true, evolved };
}
export const petsLeft = (o: Owned) => 3 - (o.pet.day === todayKey() ? o.pet.n : 0);

export function gainBond(ids: string[], n: number) {
  setWilds((x) => ({ owned: x.owned.map((c) => (ids.includes(c.id) ? grow(c, n) : c)) }));
  checkBadges();
}

// ---------------------------------------------------------------- badges: family and form mastery
export interface BadgeInfo { emoji: string; title: string; text: string; reward: number }
export function badgeInfo(id: string): BadgeInfo {
  const [kind, key] = id.split(":");
  if (kind === "family") { const f = FAMILIES[key as ElementId]; return { emoji: ELEMENTS[key as ElementId].emoji, title: `${f.name} Family`, text: `You met every ${f.name}!`, reward: 20 }; }
  const sp = SPECIES_BY_ID[key];
  return { emoji: "🏅", title: `${sp.names[0]} Master`, text: `You found all 4 forms of ${sp.names[0]}!`, reward: 10 };
}
/** Awards any newly earned badges (and their berries). The first new one pops up as a celebration. */
export function checkBadges() {
  const w = wilds();
  const have = new Set(w.badges);
  const fresh: string[] = [];
  (Object.keys(FAMILIES) as ElementId[]).forEach((el) => {
    const id = `family:${el}`;
    if (!have.has(id) && familyMembers(el).every((s) => w.owned.some((o) => o.sp === s.id))) fresh.push(id);
  });
  COLLECTABLE.forEach((sp) => {
    const id = `master:${sp.id}`;
    if (!have.has(id) && formsFound(w, sp.id).size === FORM_KEYS.length) fresh.push(id);
  });
  if (!fresh.length) return;
  const gift = fresh.reduce((n, id) => n + badgeInfo(id).reward, 0);
  setWilds((x) => ({ badges: [...x.badges, ...fresh], berries: x.berries + gift, newBadge: x.newBadge ?? fresh[0] }));
}

// ---------------------------------------------------------------- eggs
export const EGG_COST = 15;
export const EGG_NEED = 5;
const newEgg = (w: Wilds): Egg => ({ id: `e${Date.now().toString(36)}${w.seq}`, need: EGG_NEED, have: 0 });
export function buyEgg(): boolean {
  if (wilds().berries < EGG_COST) return false;
  setWilds((w) => ({ berries: w.berries - EGG_COST, eggs: [...w.eggs, newEgg(w)], seq: w.seq + 1 }));
  return true;
}
export const giveEgg = () => setWilds((w) => ({ eggs: [...w.eggs, newEgg(w)], seq: w.seq + 1 }));
export function hatchSpecies(): Species {
  const pool = COLLECTABLE.filter((s) => s.rarity >= 2);
  const wts = pool.map((s) => (s.rarity === 3 ? 1 : 3));
  let r = Math.random() * wts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= wts[i]; if (r <= 0) return pool[i]; }
  return pool[0];
}
export const removeEgg = (id: string) => setWilds((w) => ({ eggs: w.eggs.filter((e) => e.id !== id) }));

// ---------------------------------------------------------------- berry bushes (always-available income)
export const BUSH_MS = 120_000;
export const BUSH_BERRIES = 2;
export const bushWait = (w: Wilds, biome: string, now = Date.now()) => Math.max(0, (w.bushAt[biome] ?? 0) - now);
export function pickBush(biome: string): boolean {
  if (bushWait(wilds(), biome) > 0) return false;
  setWilds((w) => ({ berries: w.berries + BUSH_BERRIES, bushAt: { ...w.bushAt, [biome]: Date.now() + BUSH_MS } }));
  return true;
}

// ---------------------------------------------------------------- daily goals
export const GOAL_TEXT = (g: Goal) => {
  switch (g.kind) {
    case "catch": return `Catch ${g.target} new friends`;
    case "catchEl": return `Catch a ${ELEMENTS[g.el!].name} friend ${ELEMENTS[g.el!].emoji}`;
    case "feed": return `Feed your friends ${g.target} times`;
    case "pet": return `Pet ${g.target} friends`;
    case "explore": return `Look in ${g.target} bushes`;
    case "duel": return "Win a duel";
    default: return "Help a friend grow up";
  }
};
function makeGoals(w: Wilds): Goal[] {
  const r = mulberry32(hashString(todayKey() + "g"));
  const els = Array.from(new Set(COLLECTABLE.filter((s) => s.biomes.some((b) => biomeUnlocked(b, w))).map((s) => s.element)));
  const all: Goal[] = [
    { id: "catch", kind: "catch", target: 2, have: 0, reward: 8, claimed: false },
    { id: "catchEl", kind: "catchEl", el: els[Math.floor(r() * els.length)], target: 1, have: 0, reward: 10, claimed: false },
    { id: "feed", kind: "feed", target: 3, have: 0, reward: 6, claimed: false },
    { id: "pet", kind: "pet", target: 3, have: 0, reward: 4, claimed: false },
    { id: "explore", kind: "explore", target: 8, have: 0, reward: 5, claimed: false },
    { id: "duel", kind: "duel", target: 1, have: 0, reward: 8, claimed: false },
    { id: "evolve", kind: "evolve", target: 1, have: 0, reward: 12, claimed: false },
  ];
  return all.map((g) => ({ g, k: r() })).sort((a, b) => a.k - b.k).slice(0, 3).map((x) => x.g);
}
export function bump(kind: GoalKind, el?: ElementId, n = 1) {
  setWilds((w) => ({
    goals: { ...w.goals, list: w.goals.list.map((g) => (g.kind === kind && (kind !== "catchEl" || g.el === el) ? { ...g, have: Math.min(g.target, g.have + n) } : g)) },
  }));
}
export function claimGoal(id: string): number {
  const g = wilds().goals.list.find((x) => x.id === id);
  if (!g || g.claimed || g.have < g.target) return 0;
  setWilds((w) => ({ berries: w.berries + g.reward, goals: { ...w.goals, list: w.goals.list.map((x) => (x.id === id ? { ...x, claimed: true } : x)) } }));
  return g.reward;
}
