import type { ElementId, Personality, VariantId } from "./species";

export type Branch = "sun" | "moon";

export interface Owned {
  id: string; sp: string; name: string; shiny: boolean; seed: number; pers: Personality;
  xp: number; got: string; pet: { day: string; n: number };
  foods?: [number, number]; // day foods and night foods fed so far; decides the final form
  branch?: Branch; // final form (decided when it reaches form 3)
  variant?: VariantId; // special color: golden, storm, shadow, autumn
  level?: number; // training level 1-10 (bought with Glow in the Camp)
}
export type GoalKind = "catch" | "catchEl" | "feed" | "pet" | "explore" | "duel" | "evolve";
export interface Goal { id: string; kind: GoalKind; el?: ElementId; target: number; have: number; reward: number; claimed: boolean }
/** One zone's camp: friends who work there and its upgrades. */
export interface Camp { workers: string[]; extra: number; basket: number; speed: number; since: number }
/** One built plot in a Village: what stands there, how upgraded it is, when its pile started growing, and which friend works it. */
export interface VPlot { kind: string; level: number; at: number; worker?: string }
/** A region's village: plots (null = empty), shared stock of raw resources, and whether the starter gift was given. */
export interface Village { plots: (VPlot | null)[]; stock: Record<string, number>; gift: boolean }
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
  glow: number; // ✨ made by camps
  camps: Record<string, Camp>; // by zone id
  boost: { from: number; until: number }; // Star Boost window (ms timestamps): camps work 2x inside it
  caught: Record<string, number>; // how many of each species she has caught (Mastery)
  modes: { camp: boolean; pixel?: boolean; village?: boolean }; // which experimental game modes are switched on
  village?: Record<string, Village>; // by region id (Village mode)
  world?: string; // which world the map shows (undefined = hazelwild)
  voice?: boolean; // narrator voice in Hazelwild (undefined = off, it was too busy)
  homeCrew: string[]; // ids of the friends she chose to wander on the landing meadow ([] = automatic)
}
export const initialWilds: Wilds = {
  started: false, owned: [], seen: {}, berries: 10, fromStars: 0, eggs: [], day: "", visitorDone: false,
  treeDone: false, duelDay: "", favs: {}, legend: false, seq: 0, duelWins: 0,
  goals: { day: "", list: [] }, badges: [], newBadge: null, bushAt: {}, tipSeen: false,
  glow: 0, camps: {}, boost: { from: 0, until: 0 }, caught: {}, modes: { camp: true }, homeCrew: [],
};
