import type { ElementId, Personality, VariantId } from "./species";

export type Branch = "sun" | "moon";

export interface Owned {
  id: string; sp: string; name: string; shiny: boolean; seed: number; pers: Personality;
  xp: number; got: string; pet: { day: string; n: number };
  foods?: [number, number]; // day foods and night foods fed so far; decides the final form
  branch?: Branch; // final form (decided when it reaches form 3)
  variant?: VariantId; // special color: golden, storm, shadow, autumn
}
export type GoalKind = "catch" | "catchEl" | "feed" | "pet" | "explore" | "duel" | "evolve";
export interface Goal { id: string; kind: GoalKind; el?: ElementId; target: number; have: number; reward: number; claimed: boolean }
export interface Egg { id: string; need: number; have: number }
export interface Wilds {
  started: boolean; // picked a first friend
  owned: Owned[];
  seen: Record<string, number>; // species id -> times seen
  berries: number;
  fromStars: number; // berries earned from stars since the hub last told her about it
  eggs: Egg[];
  day: string; visitorDone: boolean; treeDone: boolean; duelDay: string;
  favs: Record<string, string>; // species id -> discovered favorite food
  legend: boolean; seq: number; duelWins: number;
  goals: { day: string; list: Goal[] };
  badges: string[]; newBadge: string | null;
  bushAt: Record<string, number>; // biome -> time its berry bush is ready again
  tipSeen: boolean;
}
export const initialWilds: Wilds = {
  started: false, owned: [], seen: {}, berries: 10, fromStars: 0, eggs: [], day: "", visitorDone: false,
  treeDone: false, duelDay: "", favs: {}, legend: false, seq: 0, duelWins: 0,
  goals: { day: "", list: [] }, badges: [], newBadge: null, bushAt: {}, tipSeen: false,
};
