import { useMemo, useState } from "react";
import { PixelMeadow } from "./PixelMeadow";
import { SPECIES } from "./species";
import type { Owned } from "./types";
import type { PostOpts } from "./pixel/engine";

// Experiment page in the Grown-up area: the pixel diorama with every dial exposed, and a live fps number.
const PICKS = SPECIES.filter((s) => s.rarity < 4);
const mk = (sp: string, i: number, xp: number): Owned => ({ id: "lab" + i, sp, name: sp, shiny: false, seed: 21 + i * 7, pers: "gentle", xp, got: "x", pet: { day: "", n: 0 }, foods: [0, 0] });

export function PixelLab({ onClose }: { onClose: () => void }) {
  const [first, setFirst] = useState(PICKS[0].id);
  const [ps, setPs] = useState(0); // 0 = auto
  const [post, setPost] = useState<PostOpts>({ palette: true, outline: true, dither: true });
  const [fps, setFps] = useState(0);
  const [failed, setFailed] = useState("");
  const [tap, setTap] = useState("");
  const crew = useMemo(() => [first, ...PICKS.filter((s) => s.id !== first).slice(2, 7).map((s) => s.id)].map((sp, i) => mk(sp, i, i % 3 === 0 ? 10 : i % 3 === 1 ? 30 : 60)), [first]);
  const workers = useMemo(() => PICKS.slice(10, 12).map((s, i) => mk(s.id, 20 + i, 30)), []);
  const chip = (on: boolean) => `rounded-xl px-3 py-1 text-base font-bold active:scale-95 ${on ? "bg-mustard text-black" : "bg-white/20"}`;
  const tog = (k: keyof PostOpts, label: string) => <button key={k} aria-pressed={post[k]} onClick={() => setPost({ ...post, [k]: !post[k] })} className={chip(post[k])}>{label}</button>;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col gap-2 bg-night p-3 text-white" data-testid="pixel-lab">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xl font-bold">🧊 Pixel Lab <span className="hidden text-sm font-normal text-white/70 sm:inline">tap a friend · arrows turn the view</span></p>
        <span className="rounded-full bg-black/40 px-3 py-1 text-lg font-bold" data-testid="pixel-fps">{fps} fps</span>
        <button onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-lg font-bold text-black active:scale-95">Close</button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border-[3px] border-ink">
        {failed ? <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-lg">This device could not run the 3D lab ({failed}). Nothing is wrong with the game.</p>
          : <PixelMeadow crew={crew} workers={workers} post={post} pixelSize={ps || undefined} adaptive={false} onFps={setFps} onFail={setFailed} onTap={(o, _x, _y, wk) => setTap(`${o.name}${wk ? " is working" : ""}`)} />}
        {tap && <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-base font-bold">{tap}</p>}
      </div>
      <div className="flex max-h-[28%] flex-wrap items-center gap-2 overflow-y-auto">
        <label className="flex items-center gap-2 text-base font-bold">Pixel size <input type="range" min={1} max={6} value={ps || 3} onChange={(e) => setPs(Number(e.target.value))} aria-label="Pixel size" className="w-28" /> {ps || "auto"}</label>
        {tog("palette", "Palette")}{tog("dither", "Dither")}{tog("outline", "Outlines")}
        <span className="mx-1 text-white/50">|</span>
        {PICKS.slice(0, 12).map((s) => <button key={s.id} onClick={() => setFirst(s.id)} aria-pressed={first === s.id} className={chip(first === s.id)}>{s.names[0]}</button>)}
      </div>
    </div>
  );
}
