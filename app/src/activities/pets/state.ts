// A pet's care state. Stored in its own key so the main save is never touched. Everything is gentle: values drift down slowly in real
// time but never below a floor (a pet is "a little hungry", "messy" or "sleepy", never sick, sad for good, or gone), and nothing is ever taken away.
export interface PetState {
  fullness: number; joy: number; clean: number; rest: number; at: number; firstSeen: number;
  pats: number; feeds: number; plays: number; baths: number; naps: number; tricks: number; acc: string;
}
export const CARE = {
  fullnessFloorH: 8, fullnessFloor: 25,   // hours to drift from 100 to the floor, and the floor
  joyFloorH: 12, joyFloor: 30,
  cleanFloorH: 14, cleanFloor: 30,
  restFloorH: 10, restFloor: 35,
  feedAdds: 45, patAdds: 9, playAdds: 14, bathJoy: 6, trickAdds: 8, napAdds: 60, full: 92,
  wellRested: 85, squeaky: 90,
};
const KEY = "hwos:pets", ROOM_KEY = "hwos:pets:room";
type Store = Record<string, Partial<PetState>>;
const load = (): Store => { try { const j = JSON.parse(localStorage.getItem(KEY) || "{}"); return j && typeof j === "object" ? j : {}; } catch { return {}; } };
const save = (s: Store) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable: run in memory */ } };
const fresh = (now: number): PetState => ({ fullness: 60, joy: 60, clean: 70, rest: 75, at: now, firstSeen: now, pats: 0, feeds: 0, plays: 0, baths: 0, naps: 0, tricks: 0, acc: "none" });

/** The pet as it is right now: drift applied for the time since it was last looked after. Older saves get defaults for newer fields. */
export function stateOf(id: string, now = Date.now()): PetState {
  const s: PetState = { ...fresh(now), ...(load()[id] ?? {}) }; const h = Math.max(0, (now - s.at) / 3600000);
  const drift = (v: number, floor: number, hours: number) => (v <= floor ? v : Math.max(floor, v - ((100 - floor) / hours) * h));
  return { ...s, fullness: drift(s.fullness, CARE.fullnessFloor, CARE.fullnessFloorH), joy: drift(s.joy, CARE.joyFloor, CARE.joyFloorH), clean: drift(s.clean, CARE.cleanFloor, CARE.cleanFloorH), rest: drift(s.rest, CARE.restFloor, CARE.restFloorH), at: now };
}
export type Mood = "happy" | "peckish" | "cuddly" | "messy" | "sleepy" | "content";
export function moodOf(s: PetState): Mood {
  if (s.fullness < 45) return "peckish"; if (s.rest < 45) return "sleepy"; if (s.clean < 45) return "messy"; if (s.joy < 45) return "cuddly";
  return s.fullness >= 70 && s.joy >= 70 ? "happy" : "content";
}
/** 0..1 happiness for animation (tail wag). */
export const happiness = (s: PetState) => Math.max(0, Math.min(1, (s.fullness * 0.3 + s.joy * 0.5 + s.clean * 0.1 + s.rest * 0.1) / 100));
export const bondOf = (s: PetState) => s.pats + s.feeds + s.plays + s.baths + s.naps + s.tricks;
const put = (id: string, fn: (s: PetState) => PetState) => { const all = load(); const next = fn(stateOf(id)); all[id] = next; save(all); return next; };
const up = (v: number, n: number) => Math.min(100, v + n);
export const feed = (id: string) => put(id, (s) => ({ ...s, fullness: up(s.fullness, CARE.feedAdds), joy: up(s.joy, 5), feeds: s.feeds + 1 }));
export const pat = (id: string) => put(id, (s) => ({ ...s, joy: up(s.joy, CARE.patAdds), pats: s.pats + 1 }));
export const played = (id: string) => put(id, (s) => ({ ...s, joy: up(s.joy, CARE.playAdds), plays: s.plays + 1 }));
export const bathed = (id: string, full = true) => put(id, (s) => ({ ...s, clean: full ? 100 : up(s.clean, 40), joy: up(s.joy, CARE.bathJoy), baths: s.baths + 1 }));
export const rested = (id: string, amount = CARE.napAdds) => put(id, (s) => ({ ...s, rest: up(s.rest, amount), naps: s.naps + 1 }));
export const trickDone = (id: string) => put(id, (s) => ({ ...s, joy: up(s.joy, CARE.trickAdds), tricks: s.tricks + 1 }));
export const setAcc = (id: string, acc: string) => put(id, (s) => ({ ...s, acc }));
export const isFull = (id: string) => stateOf(id).fullness >= CARE.full;
export const isRested = (id: string) => stateOf(id).rest >= CARE.wellRested;
export const getRoom = (): string => { try { return localStorage.getItem(ROOM_KEY) || "cozy"; } catch { return "cozy"; } };
export const setRoom = (t: string) => { try { localStorage.setItem(ROOM_KEY, t); } catch { /* ignore */ } };
/** How dark the room is for this hour: 0 in the day, up to 1 late at night. */
export const nightAt = (hour: number): number => (hour >= 20 || hour < 6 ? 1 : hour >= 18 ? 0.5 : hour < 7 ? 0.5 : 0);
