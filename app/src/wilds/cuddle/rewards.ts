// What a Cuddle Run gives back. Everything only goes up: berries, bond with her helper friends, field notes, and sometimes a new friend.
import { ELEMENTS, SPECIES_BY_ID } from "../species";
import { addBerries, collected, gainBond, makeOwned, rollShiny, rollVariant, setWilds, stageFor, wilds } from "../game";
import type { CuddleSave, Owned, Wilds } from "../types";
import { CUDDLE as C } from "./data";
import type { Summary } from "./game";

export const cuddleOf = (w: Wilds): CuddleSave => w.cuddle ?? { runs: 0, helped: 0, best: 0, notes: {}, team: [] };
export const modeOn = (w: Wilds) => w.modes.cuddle !== false; // on unless switched off in the Grown-up area

/** Her best three helpers by default: one per family first (so abilities differ), most grown first. */
export function defaultTeam(w: Wilds): string[] {
  const sorted = [...w.owned].filter((o) => SPECIES_BY_ID[o.sp]).sort((a, b) => b.xp - a.xp);
  const out: string[] = [], seen = new Set<string>();
  for (const o of sorted) { const el = SPECIES_BY_ID[o.sp].element; if (!seen.has(el) && out.length < 3) { seen.add(el); out.push(o.id); } }
  for (const o of sorted) if (out.length < 3 && !out.includes(o.id)) out.push(o.id);
  return out;
}
export const teamOf = (w: Wilds): Owned[] => {
  const ids = cuddleOf(w).team.filter((id) => w.owned.some((o) => o.id === id)); const use = ids.length ? ids : defaultTeam(w);
  return use.map((id) => w.owned.find((o) => o.id === id)!).filter(Boolean);
};

export interface Rewards { berries: number; bond: number; friendOffered: boolean; notes: string[] }
export function applyRun(s: Summary, team: Owned[], zone: string): Rewards {
  const w = wilds(); const cs = cuddleOf(w);
  const berries = Math.min(C.berriesCap, Math.floor(s.helped / 2) * C.berriesPerTwo) + (s.reason === "sunset" ? C.sunsetBonus : 0);
  const bond = s.helped > 0 ? C.bondBase + Math.floor(s.helped / 10) * C.bondPerTen : 0;
  if (berries) addBerries(berries);
  if (bond && team.length) gainBond(team.map((o) => o.id), bond);
  // a new friend? only animals she helped and does not have yet; the very first run always offers one
  let pending = cs.pending;
  if (!pending) {
    const have = collected(wilds());
    const cands = Object.keys(s.species).filter((id) => SPECIES_BY_ID[id] && SPECIES_BY_ID[id].rarity < 4 && !have.has(id));
    if (cands.length && (cs.runs === 0 || Math.random() < (s.reason === "sunset" ? C.befriendSunset : C.befriend(s.helped)))) {
      const total = cands.reduce((a, id) => a + s.species[id], 0); let r = Math.random() * total, pick = cands[0];
      for (const id of cands) { r -= s.species[id]; if (r <= 0) { pick = id; break; } }
      pending = makeOwned(SPECIES_BY_ID[pick], rollShiny(0.04), undefined, rollVariant(zone));
    }
  }
  const notes = { ...cs.notes }; s.newNotes.forEach((id) => { notes[id] = true; });
  setWilds((x) => ({ cuddle: { ...cuddleOf(x), runs: cs.runs + 1, helped: cs.helped + s.helped, best: Math.max(cs.best, s.helped), notes, pending } }));
  return { berries, bond, friendOffered: !!pending, notes: s.newNotes };
}
export const savePick = (team: string[]) => setWilds((x) => ({ cuddle: { ...cuddleOf(x), team } }));
export const clearPending = () => setWilds((x) => ({ cuddle: { ...cuddleOf(x), pending: undefined } }));
export const familyLine = (o: Owned) => { const sp = SPECIES_BY_ID[o.sp]; return `${ELEMENTS[sp.element].emoji} Lv ${stageFor(o.xp)}`; };
