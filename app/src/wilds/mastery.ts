import type { Wilds } from "./types";

/** Catches needed for ★1 to ★5 of a species, and the berries each ★ gives. */
export const MASTERY_AT = [3, 8, 20, 50, 100];
export const MASTERY_REWARD = [5, 10, 20, 30, 50];
export const MASTERY_BONUS = 0.15; // +15% camp work per ★ for that species

export const caughtCount = (w: Wilds, spId: string) => w.caught[spId] ?? 0;
export const masteryStars = (w: Wilds, spId: string) => MASTERY_AT.filter((n) => caughtCount(w, spId) >= n).length;
/** Progress to the next ★: how many she has, what the next goal is (null when maxed). */
export function masteryNext(w: Wilds, spId: string): { have: number; goal: number | null; stars: number } {
  const have = caughtCount(w, spId), stars = masteryStars(w, spId);
  return { have, goal: stars >= MASTERY_AT.length ? null : MASTERY_AT[stars], stars };
}
