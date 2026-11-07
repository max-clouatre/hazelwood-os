import { useState } from "react";
import { ParentGate } from "../../components/ParentGate";
import { parseSong } from "../../lib/piano";
import { loadMine, saveMine } from "./progress";
import type { MySong } from "./progress";

const HELP = "Type notes separated by spaces: C4 D4 E4. Add :2 for a long note (C4:2) or :.5 for a short one. F#4 is F sharp, Bb3 is B flat, R is a rest, and C4 is middle C.";

/** Grown-up tools: add songs by typing their notes (kept only on this tablet). Songs that are under copyright are never bundled with the app. */
export function MySongsAdmin({ onChange }: { onChange: () => void }) {
  const [gate, setGate] = useState(false);
  const [adult, setAdult] = useState(false);
  const [editing, setEditing] = useState<MySong | null>(null);
  const [list, setList] = useState<MySong[]>(loadMine());
  const refresh = (l: MySong[]) => { saveMine(l); setList(l); onChange(); };
  const parsed = editing ? parseSong(editing.notes) : null;
  const save = () => {
    if (!editing || !editing.title.trim() || !parsed || parsed.error) return;
    const s = { ...editing, title: editing.title.trim(), bpm: Math.min(240, Math.max(30, Math.round(editing.bpm) || 100)) };
    refresh(list.some((x) => x.id === s.id) ? list.map((x) => (x.id === s.id ? s : x)) : [...list, s]); setEditing(null);
  };
  return (
    <div className="mx-auto mt-3 w-full max-w-2xl rounded-2xl bg-white/10 p-3 text-left">
      {!adult ? <button onClick={() => setGate(true)} aria-label="Grown-up tools" className="rounded-xl bg-white/20 px-4 py-2 text-lg font-bold active:scale-95">🔒 Grown-up tools: add a song</button>
        : !editing ? (<div className="flex flex-col gap-2"><div className="flex flex-wrap gap-2"><button onClick={() => setEditing({ id: "my" + Date.now(), title: "", bpm: 100, notes: "" })} aria-label="Add a song" className="rounded-xl bg-mustard px-4 py-2 text-lg font-bold text-black active:scale-95">➕ Add a song</button><button onClick={() => setAdult(false)} className="rounded-xl bg-white/20 px-4 py-2 text-lg font-bold">Lock</button></div>
          {list.map((s) => <div key={s.id} className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-1"><span className="min-w-0 flex-1 truncate text-lg font-bold">{s.title}</span><button onClick={() => setEditing(s)} className="rounded-lg bg-white/20 px-3 py-1">Edit</button><button onClick={() => { if (window.confirm(`Delete "${s.title}"?`)) refresh(list.filter((x) => x.id !== s.id)); }} className="rounded-lg bg-red-300 px-3 py-1 text-red-900">Delete</button></div>)}</div>)
        : (<div className="flex flex-col gap-2">
          <p className="text-sm text-white/80">{HELP}</p>
          <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Song name" aria-label="Song name" className="rounded-xl bg-white p-2 text-xl text-black" />
          <label className="flex items-center gap-2 text-lg">Speed (beats per minute) <input type="number" value={editing.bpm} onChange={(e) => setEditing({ ...editing, bpm: Number(e.target.value) })} aria-label="Tempo" className="w-24 rounded-xl bg-white p-2 text-black" /></label>
          <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={5} placeholder="E4 D4 C4:2 ..." aria-label="Notes" autoCapitalize="none" spellCheck={false} className="rounded-xl bg-white p-2 font-mono text-lg text-black" />
          <p className={`text-sm font-bold ${parsed?.error ? "text-red-300" : "text-emerald-300"}`} data-testid="song-check">{parsed?.error ?? `${parsed?.notes.length} notes, ${parsed?.beats} beats`}</p>
          <div className="flex gap-2"><button onClick={save} disabled={!!parsed?.error || !editing.title.trim()} aria-label="Save song" className="rounded-xl bg-emerald-400 px-5 py-2 text-lg font-bold text-black disabled:opacity-40">Save</button><button onClick={() => setEditing(null)} className="rounded-xl bg-white/20 px-5 py-2 text-lg font-bold">Cancel</button></div></div>)}
      {gate && <ParentGate onPass={() => { setGate(false); setAdult(true); }} onCancel={() => setGate(false)} />}
    </div>
  );
}
