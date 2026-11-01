import type { Personality } from "./species";

export interface Owned {
  id: string; sp: string; name: string; shiny: boolean; seed: number; pers: Personality;
  xp: number; got: string; pet: { day: string; n: number };
}
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
}
export const initialWilds: Wilds = {
  started: false, owned: [], seen: {}, berries: 6, fromStars: 0, eggs: [], day: "", visitorDone: false,
  treeDone: false, duelDay: "", favs: {}, legend: false, seq: 0, duelWins: 0,
};
