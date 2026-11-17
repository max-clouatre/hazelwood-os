// A pet's care state. Stored in its own key so the main save is never touched. Everything is gentle: values drift down slowly in real
// time but never below a floor (a pet is "peckish" or "wants a cuddle", never sick, sad for good, or gone), and nothing is ever taken away.
export interface PetState { fullness: number; joy: number; at: number; pats: number; feeds: number; firstSeen: number }
export const CARE = {
  fullnessFloorH: 8, fullnessFloor: 25,   // hours to drift from 100 to the floor, and the floor
  joyFloorH: 12, joyFloor: 30,
  feedAdds: 45, patAdds: 9,
  full: 92,                                // at or above this the pet says "I'm full!"
};
const KEY = "hwos:pets";
type Store = Record<string, PetState>;
const load = (): Store => { try { const j = JSON.parse(localStorage.getItem(KEY) || "{}"); return j && typeof j === "object" ? j : {}; } catch { return {}; } };
const save = (s: Store) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable: run in memory */ } };
const fresh = (now: number): PetState => ({ fullness: 60, joy: 60, at: now, pats: 0, feeds: 0, firstSeen: now });

/** The pet as it is right now: drift applied for the time since it was last looked after. */
export function stateOf(id: string, now = Date.now()): PetState {
  const s = load()[id] ?? fresh(now); const h = Math.max(0, (now - s.at) / 3600000);
  const drift = (v: number, floor: number, hours: number) => (v <= floor ? v : Math.max(floor, v - ((100 - floor) / hours) * h));
  return { ...s, fullness: drift(s.fullness, CARE.fullnessFloor, CARE.fullnessFloorH), joy: drift(s.joy, CARE.joyFloor, CARE.joyFloorH), at: now };
}
export type Mood = "happy" | "peckish" | "cuddly" | "content";
export function moodOf(s: PetState): Mood { if (s.fullness < 45) return "peckish"; if (s.joy < 45) return "cuddly"; return s.fullness >= 70 && s.joy >= 70 ? "happy" : "content"; }
/** 0..1 happiness for animation (tail wag). */
export const happiness = (s: PetState) => Math.max(0, Math.min(1, (s.fullness * 0.4 + s.joy * 0.6) / 100));
const put = (id: string, fn: (s: PetState) => PetState) => { const all = load(); const cur = stateOf(id); all[id] = fn(cur); save(all); return all[id]; };
export const feed = (id: string): PetState => put(id, (s) => ({ ...s, fullness: Math.min(100, s.fullness + CARE.feedAdds), joy: Math.min(100, s.joy + 5), feeds: s.feeds + 1 }));
export const pat = (id: string): PetState => put(id, (s) => ({ ...s, joy: Math.min(100, s.joy + CARE.patAdds), pats: s.pats + 1 }));
export const isFull = (id: string) => stateOf(id).fullness >= CARE.full;
