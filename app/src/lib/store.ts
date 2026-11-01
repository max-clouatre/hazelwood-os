import { useSyncExternalStore } from "react";

export type ProfileId = "hazel" | "violet";

export const DEFAULT_SPELLING = [
  "because", "friend", "school", "people", "again", "little",
  "where", "would", "ocean", "plant", "magnet", "rainbow",
];

interface State {
  stars: Record<ProfileId, number>;
  letterRight: number; // Violet's letter progress, grows the letter pool
  countRight: number; // Violet's counting progress, grows the max number
  spelling: string[]; // Hazel's spelling list (editable)
  sound: boolean;
}

const KEY = "hwos:v1";
const initial: State = {
  stars: { hazel: 0, violet: 0 },
  letterRight: 0,
  countRight: 0,
  spelling: DEFAULT_SPELLING,
  sound: true,
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
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
export const addStar = (p: ProfileId) => update((s) => ({ stars: { ...s.stars, [p]: s.stars[p] + 1 } }));
