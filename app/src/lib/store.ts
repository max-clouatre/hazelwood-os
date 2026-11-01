import { useSyncExternalStore } from "react";
import { STARS_PER_STICKER, STICKERS } from "./stickers";

export type ProfileId = "hazel" | "violet";
type PerKid<T> = Record<ProfileId, T>;

export const DEFAULT_SPELLING = [
  "because", "friend", "school", "people", "again", "little",
  "where", "would", "ocean", "plant", "magnet", "rainbow",
];

interface State {
  stars: PerKid<number>;
  stickers: PerKid<number>; // how many stickers unlocked
  newSticker: { profile: ProfileId; index: number } | null; // celebration waiting to be shown
  letterRight: number; // Violet: grows the letter pool
  countRight: number; // Violet: grows the counting range
  traceRight: number; // Violet: grows the trace pool
  spelling: string[]; // Hazel's list (editable in the parent area)
  misses: Record<string, number>; // spelling word -> how often she needs it again
  coloring: PerKid<Record<string, Record<string, string>>>; // page -> region -> color
  colored: PerKid<Record<string, boolean>>; // pages already rewarded with a star
  limitMin: PerKid<number>; // daily play limit in minutes, 0 = none
  played: PerKid<{ day: string; sec: number }>;
  sound: boolean;
}

const KEY = "hwos:v1"; // same key as before: older saves load and fill in new fields
const initial: State = {
  stars: { hazel: 0, violet: 0 },
  stickers: { hazel: 0, violet: 0 },
  newSticker: null,
  letterRight: 0,
  countRight: 0,
  traceRight: 0,
  spelling: DEFAULT_SPELLING,
  misses: {},
  coloring: { hazel: {}, violet: {} },
  colored: { hazel: {}, violet: {} },
  limitMin: { hazel: 0, violet: 0 },
  played: { hazel: { day: "", sec: 0 }, violet: { day: "", sec: 0 } },
  sound: true,
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Old saves lack the per-kid fields above; merge each object so nothing is undefined.
      return {
        ...initial, ...saved,
        stars: { ...initial.stars, ...saved.stars },
        stickers: { ...initial.stickers, ...saved.stickers },
        coloring: { ...initial.coloring, ...saved.coloring },
        colored: { ...initial.colored, ...saved.colored },
        limitMin: { ...initial.limitMin, ...saved.limitMin },
        played: { ...initial.played, ...saved.played },
      };
    }
  } catch { /* storage unavailable: run in memory */ }
  return initial;
}

let state: State = load();
const listeners = new Set<() => void>();

export function update(patch: (s: State) => Partial<State>) {
  state = { ...state, ...patch(state) };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state,
  );
}

export const getState = () => state;

/** +1 star. Every STARS_PER_STICKER stars unlocks the next sticker and queues a celebration. */
export function addStar(p: ProfileId, n = 1) {
  update((s) => {
    const stars = s.stars[p] + n;
    const earned = Math.min(Math.floor(stars / STARS_PER_STICKER), STICKERS[p].length);
    const gained = earned > s.stickers[p];
    return {
      stars: { ...s.stars, [p]: stars },
      stickers: { ...s.stickers, [p]: Math.max(earned, s.stickers[p]) },
      newSticker: gained ? { profile: p, index: earned - 1 } : s.newSticker,
    };
  });
}

export const today = () => new Date().toDateString();
export const playedToday = (s: State, p: ProfileId) => (s.played[p].day === today() ? s.played[p].sec : 0);

export function addPlayTime(p: ProfileId, sec: number) {
  update((s) => ({ played: { ...s.played, [p]: { day: today(), sec: playedToday(s, p) + sec } } }));
}

export function noteSpellingResult(word: string, missed: boolean) {
  update((s) => {
    const cur = s.misses[word] ?? 0;
    const next = missed ? Math.min(cur + 1, 5) : Math.max(cur - 1, 0);
    const misses = { ...s.misses };
    if (next === 0) delete misses[word]; else misses[word] = next;
    return { misses };
  });
}

export function setFill(p: ProfileId, page: string, region: string, color: string | null) {
  update((s) => {
    const pages = { ...s.coloring[p] };
    const fills = { ...(pages[page] ?? {}) };
    if (color === null) delete fills[region]; else fills[region] = color;
    pages[page] = fills;
    return { coloring: { ...s.coloring, [p]: pages } };
  });
}

export function clearPage(p: ProfileId, page: string) {
  update((s) => {
    const pages = { ...s.coloring[p] }; delete pages[page];
    const colored = { ...s.colored[p] }; delete colored[page];
    return { coloring: { ...s.coloring, [p]: pages }, colored: { ...s.colored, [p]: colored } };
  });
}

export const markColored = (p: ProfileId, page: string) =>
  update((s) => ({ colored: { ...s.colored, [p]: { ...s.colored[p], [page]: true } } }));
