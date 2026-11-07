// What she has finished, and the songs a grown-up typed in. Stored in their own keys so the main save is untouched. Wrapped in try/catch: private mode can block storage.
export interface PianoProgress { lessons: string[]; songs: string[] }
const KEY = "hwos:piano", SONGS_KEY = "hwos:songs";
export function loadProgress(): PianoProgress { try { const j = JSON.parse(localStorage.getItem(KEY) || "{}"); return { lessons: j.lessons ?? [], songs: j.songs ?? [] }; } catch { return { lessons: [], songs: [] }; } }
export function markDone(kind: "lessons" | "songs", id: string) { try { const p = loadProgress(); if (!p[kind].includes(id)) { p[kind].push(id); localStorage.setItem(KEY, JSON.stringify(p)); } } catch { /* ignore */ } }

export interface MySong { id: string; title: string; bpm: number; notes: string }
export function loadMine(): MySong[] { try { const j = JSON.parse(localStorage.getItem(SONGS_KEY) || "[]"); return Array.isArray(j) ? j : []; } catch { return []; } }
export function saveMine(list: MySong[]) { try { localStorage.setItem(SONGS_KEY, JSON.stringify(list)); } catch { /* ignore */ } }
