import { lazy, Suspense, useState } from "react";
import { DEFAULT_SPELLING, playedToday, update, useStore } from "../lib/store";
import { initialWilds } from "../wilds/types";
import { clearError, lastError } from "../lib/errlog";
import { BUILD, latestKnown, refreshAppFiles, updateNow, useUpdateInfo } from "../lib/update";
import type { ProfileId } from "../lib/store";
import { STICKERS } from "../lib/stickers";

const PixelLab = lazy(() => import("../wilds/PixelLab").then((m) => ({ default: m.PixelLab })));
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
  const [lab, setLab] = useState(false);
  const [confirmW, setConfirmW] = useState(false);
  const [, setTick] = useState(0);
  const [upd, setUpd] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const newer = useUpdateInfo();
  const check = async () => {
    setBusy(true); setUpd("Checking...");
    const r = await updateNow();
    setBusy(false);
    setUpd(r === "current" ? "You have the newest version. ✓" : r === "offline" ? "No internet right now. Connect to Wi-Fi and try again." : "Update found! Restarting...");
  };
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
          <h2 className="mb-2 text-xl font-bold">Game modes (experiments)</h2>
          <p className="mb-2 text-sm text-white/70">Explore is always on. New ways to play appear as tabs inside each zone. Turn an experiment off if it isn't working.</p>
          <label className="flex items-center gap-3 text-lg"><input type="checkbox" className="h-6 w-6" checked={s.wilds.modes.camp} onChange={(e) => update((st) => ({ wilds: { ...st.wilds, modes: { ...st.wilds.modes, camp: e.target.checked } } }))} />
            <span><b>🏕️ Camp</b> (beta): friends work and make Glow while she's away; train them up.</span></label>
          <label className="mt-2 flex items-center gap-3 text-lg"><input type="checkbox" className="h-6 w-6" checked={!!s.wilds.modes.pixel} onChange={(e) => update((st) => ({ wilds: { ...st.wilds, modes: { ...st.wilds.modes, pixel: e.target.checked } } }))} />
            <span><b>🧊 Pixel meadow</b> (beta): the home screen becomes a little 3D pixel island where her crew wanders and camp workers work. Falls back to the flat meadow on a device that can't show it.</span></label>
        </section>

        <section className="rounded-2xl bg-white/10 p-4">
          <h2 className="mb-2 text-xl font-bold">Labs (try-outs for you)</h2>
          <p className="mb-2 text-sm text-white/70">Experiments that are not part of the kids' game. Opening one loads extra code only then.</p>
          <button onClick={() => setLab(true)} className="rounded-xl bg-mustard px-5 py-3 text-xl font-bold text-black active:scale-95">🧊 Pixel Lab (3D pixel art)</button>
        </section>

        <section className="rounded-2xl bg-white/10 p-4">
          <h2 className="mb-2 text-xl font-bold">App update</h2>
          <p className="text-base">Installed version: <b>{BUILD}</b></p>
          <p className="text-base">Newest on the server: <b>{latestKnown() ?? "not checked yet"}</b> {newer && <span className="ml-1 rounded-full bg-yellow-300 px-2 text-sm font-bold text-black">update ready</span>}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button onClick={check} disabled={busy} className="rounded-xl bg-emerald-400 px-5 py-3 text-xl font-bold text-black active:scale-95 disabled:opacity-50">⬇️ Check for updates</button>
            {upd && <span className="text-base text-yellow-200">{upd}</span>}
          </div>
          <details className="mt-2 text-sm text-white/80">
            <summary className="cursor-pointer">Something not working? Refresh the app files</summary>
            <p className="mt-1">Downloads everything fresh. Friends, stars and settings are kept. Needs Wi-Fi.</p>
            <button onClick={() => { if (window.confirm("Refresh the app files? Saved progress is kept.")) void refreshAppFiles(); }} className="mt-1 rounded-xl bg-white/20 px-4 py-2 text-base">Refresh app files</button>
          </details>
        </section>

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
          <h2 className="mb-2 text-xl font-bold">Diagnostics</h2>
          {(() => { const e = lastError(); return e ? (
            <div className="text-sm"><p className="break-words">Last problem ({e.at.slice(0, 16).replace("T", " ")}): <b>{e.msg}</b></p><p className="mt-1 break-words text-white/60">{e.stack}</p><p className="mt-1 break-words text-white/60">{e.ua}</p>
              <button onClick={() => { clearError(); setTick((t) => t + 1); }} className="mt-2 rounded-xl bg-white/20 px-4 py-2 text-base">Clear</button></div>
          ) : <p className="text-white/70">No problems recorded. 👍</p>; })()}
        </section>

        <section className="rounded-2xl bg-white/10 p-4">
          <h2 className="mb-2 text-xl font-bold">Reset</h2>
          {confirmW ? (
            <div className="flex items-center gap-3">
              <span>Release all of Hazel's creatures and eggs?</span>
              <button onClick={() => { update(() => ({ wilds: initialWilds })); setConfirmW(false); }} className="rounded-xl bg-red-500 px-5 py-2 text-lg font-bold">Yes, reset</button>
              <button onClick={() => setConfirmW(false)} className="rounded-xl bg-white/20 px-5 py-2 text-lg">Cancel</button>
            </div>
          ) : !confirm ? (
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setConfirm(true)} className="rounded-xl bg-red-400/80 px-5 py-2 text-lg font-bold">Reset stars and stickers…</button>
              <button onClick={() => setConfirmW(true)} className="rounded-xl bg-red-400/80 px-5 py-2 text-lg font-bold">Reset Hazel's creatures…</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span>Erase all stars, stickers, and progress?</span>
              <button onClick={() => { update(() => ({ stars: { hazel: 0, violet: 0 }, stickers: { hazel: 0, violet: 0 }, newSticker: null, letterRight: 0, countRight: 0, traceRight: 0, misses: {}, colored: { hazel: {}, violet: {} } })); setConfirm(false); }}
                className="rounded-xl bg-red-500 px-5 py-2 text-lg font-bold">Yes, erase</button>
              <button onClick={() => setConfirm(false)} className="rounded-xl bg-white/20 px-5 py-2 text-lg">Cancel</button>
            </div>
          )}
        </section>
      </div>
      {lab && <Suspense fallback={<div className="fixed inset-0 z-[60] flex items-center justify-center bg-night text-xl">Loading…</div>}><PixelLab onClose={() => setLab(false)} /></Suspense>}
    </div>
  );
}
