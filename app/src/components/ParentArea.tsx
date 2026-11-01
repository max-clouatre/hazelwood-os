import { useState } from "react";
import { DEFAULT_SPELLING, playedToday, update, useStore } from "../lib/store";
import type { ProfileId } from "../lib/store";
import { STICKERS } from "../lib/stickers";

const LIMITS = [0, 15, 20, 30, 45, 60];

function Editor({ words }: { words: string[] }) {
  const [text, setText] = useState(words.join("\n"));
  const [saved, setSaved] = useState(false);
  const save = () => {
    const list = Array.from(new Set(text.split(/[\s,;]+/).map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter((w) => w.length >= 2 && w.length <= 14)));
    update(() => ({ spelling: list.length ? list : DEFAULT_SPELLING }));
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };
  return (
    <div className="flex flex-col gap-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7}
        className="rounded-xl bg-white p-3 text-xl text-black" autoCapitalize="none" spellCheck={false} />
      <div className="flex items-center gap-3">
        <button onClick={save} className="rounded-xl bg-emerald-400 px-5 py-2 text-lg font-bold text-black">Save list</button>
        <button onClick={() => setText(DEFAULT_SPELLING.join("\n"))} className="rounded-xl bg-white/20 px-4 py-2 text-lg">Starter list</button>
        {saved && <span className="text-emerald-300">Saved ✓</span>}
      </div>
    </div>
  );
}

export function ParentArea({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [confirm, setConfirm] = useState(false);
  const kids: [ProfileId, string][] = [["hazel", "Hazel"], ["violet", "Violet"]];
  const hard = Object.entries(s.misses).sort((a, b) => b[1] - a[1]).map(([w]) => w);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-indigo-950 p-5 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Grown-up area</h1>
          <button onClick={onClose} className="rounded-xl bg-white px-6 py-3 text-xl font-bold text-indigo-900">Done</button>
        </div>

        <section className="rounded-2xl bg-white/10 p-4">
          <h2 className="mb-2 text-xl font-bold">Daily play time</h2>
          {kids.map(([id, name]) => (
            <div key={id} className="mb-3">
              <p className="mb-1">{name}: played <b>{Math.round(playedToday(s, id) / 60)} min</b> today · <b>{s.stars[id]}</b> stars · <b>{s.stickers[id]}/{STICKERS[id].length}</b> stickers</p>
              <div className="flex flex-wrap gap-2">
                {LIMITS.map((m) => (
                  <button key={m} onClick={() => update((st) => ({ limitMin: { ...st.limitMin, [id]: m } }))}
                    className={`rounded-xl px-4 py-2 text-lg ${s.limitMin[id] === m ? "bg-yellow-300 font-bold text-black" : "bg-white/20"}`}>
                    {m === 0 ? "No limit" : `${m} min`}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-sm text-white/70">When the limit is reached the app shows a gentle break screen until tomorrow, or until you change the limit here.</p>
        </section>

        <section className="rounded-2xl bg-white/10 p-4">
          <h2 className="mb-2 text-xl font-bold">Hazel's spelling list (one word per line)</h2>
          <Editor words={s.spelling} />
          <p className="mt-3 text-lg">Words she needs again soon: {hard.length ? <b>{hard.join(", ")}</b> : <span className="text-white/70">none yet</span>}</p>
        </section>

        <section className="rounded-2xl bg-white/10 p-4">
          <h2 className="mb-2 text-xl font-bold">Reset</h2>
          {!confirm ? (
            <button onClick={() => setConfirm(true)} className="rounded-xl bg-red-400/80 px-5 py-2 text-lg font-bold">Reset stars and stickers…</button>
          ) : (
            <div className="flex items-center gap-3">
              <span>Erase all stars, stickers, and progress?</span>
              <button onClick={() => { update(() => ({ stars: { hazel: 0, violet: 0 }, stickers: { hazel: 0, violet: 0 }, newSticker: null, letterRight: 0, countRight: 0, traceRight: 0, misses: {} })); setConfirm(false); }}
                className="rounded-xl bg-red-500 px-5 py-2 text-lg font-bold">Yes, erase</button>
              <button onClick={() => setConfirm(false)} className="rounded-xl bg-white/20 px-5 py-2 text-lg">Cancel</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
