import { useEffect, useRef, useState } from "react";
import { PETS, petById } from "../activities/pets/data";
import type { Room } from "../activities/pets/scene";
import type { PetWorld } from "./splatpet";

// Pets preview lab (Grown-up area): the live Cloheart Pets look (PS1 style, three.js) next to a new look made with ink-studio
// (sculpted solids baked to pixel-art Gaussian splats, warm lighting, puppet animation). A demo: the live pets the girls use are not changed.
// ink-studio is MIT licensed (public/ink/LICENSE.txt) and is loaded only when this screen opens.

/* eslint-disable @typescript-eslint/no-explicit-any */
type View = "both" | "ps1" | "splat";
const RES = [{ n: "Chunky", w: 240 }, { n: "Normal", w: 320 }, { n: "Fine", w: 480 }];

const loadScript = (src: string) => new Promise<void>((resolve, reject) => { const s = document.createElement("script"); s.src = src; s.onload = () => resolve(); s.onerror = () => reject(new Error("could not load " + src)); document.head.appendChild(s); });
let inkPromise: Promise<void> | null = null;
/** Loads the toolkit (classic script that sets window.__INK__) and the WebGL2 renderer (window.InkWebGL). Tries again if it failed. */
export function loadInk(): Promise<void> {
  if (!inkPromise) {
    const base = document.baseURI; const w = window as any;
    inkPromise = (w.__INK__ && w.InkWebGL ? Promise.resolve() : loadScript(new URL("ink/ink-studio.js", base).href).then(() => loadScript(new URL("ink/ink-webgl.js", base).href)))
      .then(() => { if (!w.__INK__ || !w.InkWebGL) throw new Error("the graphics toolkit did not start"); }).catch((e) => { inkPromise = null; throw e; });
  }
  return inkPromise;
}
const chromeVersion = () => { const m = /Chrome\/(\d+)/.exec(navigator.userAgent); return m ? Number(m[1]) : 0; };

export function PetsPreviewLab({ onClose }: { onClose: () => void }) {
  const [petId, setPetId] = useState("nova"); const [view, setView] = useState<View>("both"); const [res, setRes] = useState(1); const [night, setNight] = useState(false);
  const [info, setInfo] = useState({ fpsA: 0, fpsB: 0, buildMs: 0, splats: 0, cpuMs: 0, note: "", splatErr: "" }); const [loadingSplat, setLoadingSplat] = useState(false);
  const boxA = useRef<HTMLDivElement>(null), boxB = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null), splatRef = useRef<PetWorld | null>(null); const nightRef = useRef(0); nightRef.current = night ? 1 : 0;
  const tr = petById(petId);

  // ---- left: the live PS1-style room
  useEffect(() => {
    if (view === "splat") return; let dead = false; let canvas: HTMLCanvasElement | null = null; let ro: ResizeObserver | null = null; let poll = 0;
    (async () => {
      try {
        const THREE = await import("three"); const { createRoom } = await import("../activities/pets/scene"); if (dead || !boxA.current) return; const el = boxA.current;
        canvas = document.createElement("canvas"); canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;display:block"; el.appendChild(canvas);
        const dims = () => { const r = el.getBoundingClientRect(); const ps = Math.max(2, Math.round(Math.max(r.width, r.height) / 330)); return [Math.floor(r.width / ps), Math.floor(r.height / ps)]; };
        const [w0, h0] = dims(); const rm = createRoom(THREE, canvas, w0, h0, { traits: tr, theme: "cozy", accessory: "none", mood: () => 0.7, night: () => nightRef.current }); roomRef.current = rm;
        const refit = () => { const [w, h] = dims(); rm.resize(w, h); }; if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(refit); ro.observe(el); }
        poll = window.setInterval(() => setInfo((i) => ({ ...i, fpsA: rm.stats().fps })), 800);
      } catch (e) { setInfo((i) => ({ ...i, note: "The live pets could not start here: " + (e instanceof Error ? e.message : String(e)) })); }
    })();
    return () => { dead = true; ro?.disconnect(); window.clearInterval(poll); roomRef.current?.dispose(); roomRef.current = null; canvas?.remove(); };
  }, [petId, view]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- right: the splat version (ink-studio)
  useEffect(() => {
    if (view === "ps1") return; let dead = false; let canvas: HTMLCanvasElement | null = null; let raf = 0; let renderer: any = null; setLoadingSplat(true); setInfo((i) => ({ ...i, splatErr: "" }));
    (async () => {
      try {
        await loadInk(); const { buildPetWorld } = await import("./splatpet"); if (dead || !boxB.current) return; const el = boxB.current; const K = (window as any).__INK__;
        const pw = buildPetWorld(K, tr); splatRef.current = pw;
        canvas = document.createElement("canvas"); canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;display:block"; el.appendChild(canvas);
        renderer = (window as any).InkWebGL.createRenderer(canvas, { toolkit: { KIT: K.KIT, PixelLook: K.PixelLook } });
        setInfo((i) => ({ ...i, buildMs: Math.round(pw.buildMs), splats: pw.splats })); setLoadingSplat(false);
        let cpu = 0; let last = performance.now(), t = 0, n = 0, acc = 0, lastNight = -1, relight: any = pw.relight();
        const frame = (ts: number) => {
          raf = requestAnimationFrame(frame); const real = (ts - last) / 1000; const dt = Math.min(0.05, real); last = ts; t += dt;
          const r = el.getBoundingClientRect(); const W = RES[res].w, H = Math.max(120, Math.round((W * r.height) / Math.max(1, r.width)));
          if (nightRef.current !== lastNight) { lastNight = nightRef.current; pw.setNight(lastNight); relight = pw.relight(); }
          const c0 = performance.now(); pw.update(dt, t); renderer.render(pw.world, { width: W, height: H, time: t, relighting: relight }); cpu += performance.now() - c0;
          n++; acc += real; if (acc >= 1) { const fps = Math.round(n / acc); const cpuMs = Math.round((cpu / n) * 10) / 10; n = 0; acc = 0; cpu = 0; setInfo((i) => ({ ...i, fpsB: fps, cpuMs })); }
        };
        raf = requestAnimationFrame(frame);
      } catch (e) { if (!dead) { setLoadingSplat(false); setInfo((i) => ({ ...i, splatErr: e instanceof Error ? e.message : String(e) })); } }
    })();
    return () => { dead = true; cancelAnimationFrame(raf); try { renderer?.dispose?.(); } catch { /* ignore */ } splatRef.current = null; canvas?.remove(); };
  }, [petId, view, res]); // eslint-disable-line react-hooks/exhaustive-deps

  const tapA = (e: React.MouseEvent) => { const rm = roomRef.current; if (!rm) return; const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const s = rm.screenOf(); if (Math.hypot(s.x - (e.clientX - r.left), s.y - (e.clientY - r.top)) < Math.max(64, r.height * 0.2)) rm.patPet(); };
  const doPet = () => { roomRef.current?.patPet(); splatRef.current?.pet(); };
  const doFeed = () => { roomRef.current?.feed(); splatRef.current?.feed(); };
  const chip = (on: boolean) => `rounded-xl border-[3px] border-ink px-3 py-1 text-base font-bold active:scale-95 ${on ? "bg-mustard text-black" : "bg-white/85 text-purple-900"}`;
  const ver = chromeVersion();
  return (
    <div className="fixed inset-0 z-[60] flex flex-col gap-1.5 bg-night p-2 text-white" data-testid="pets-lab">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-bold">🔬 Pets preview lab <span className="hidden text-sm font-normal text-white/70 sm:inline">a test of new graphics, the girls' pets are unchanged</span></p>
        <button onClick={onClose} className="rounded-xl bg-white px-4 py-1 text-lg font-bold text-black active:scale-95">Close</button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {PETS.map((p) => <button key={p.id} onClick={() => setPetId(p.id)} aria-pressed={p.id === petId} aria-label={`Lab pet ${p.name}`} className={chip(p.id === petId)}>{p.name}</button>)}
        <span className="mx-1 text-white/40">|</span>
        {([["both", "Side by side"], ["ps1", "Current"], ["splat", "New"]] as [View, string][]).map(([v, n]) => <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={`View ${n}`} className={chip(view === v)}>{n}</button>)}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 sm:flex-row">
        {view !== "splat" && (
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border-[3px] border-ink bg-[#2a2540]" data-testid="lab-ps1">
            <div ref={boxA} className="absolute inset-0" onClick={tapA} />
            <p className="pointer-events-none absolute left-2 top-1 rounded-full bg-black/60 px-3 py-0.5 text-sm font-bold">Current (PS1 look) · {info.fpsA} fps</p>
          </div>
        )}
        {view !== "ps1" && (
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border-[3px] border-ink bg-[#2a2540]" data-testid="lab-splat">
            <div ref={boxB} className="absolute inset-0" onClick={doPet} />
            <p className="pointer-events-none absolute left-2 top-1 rounded-full bg-black/60 px-3 py-0.5 text-sm font-bold" data-testid="lab-splat-label">New (ink-studio splats) · {info.fpsB} fps</p>
            {loadingSplat && <p className="absolute inset-0 flex items-center justify-center bg-black/40 p-4 text-center text-lg font-bold">Loading the new graphics (about 1.6 MB)…</p>}
            {info.splatErr && <p className="absolute inset-0 flex items-center justify-center bg-[#2a2540] p-4 text-center text-lg font-bold" data-testid="lab-splat-error">The new graphics can't run on this device ({info.splatErr}). Nothing is wrong with the app.{ver ? ` (Chrome ${ver})` : ""}</p>}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={doFeed} aria-label="Feed in the lab" className="rounded-2xl border-[3px] border-ink bg-mustard px-4 py-1 text-lg font-bold text-black active:scale-95">🍖 Feed</button>
        <button onClick={doPet} aria-label="Pet it in the lab" className="rounded-2xl border-[3px] border-ink bg-pink-300 px-4 py-1 text-lg font-bold text-pink-950 active:scale-95">✋ Pet</button>
        <button onClick={() => setNight((n) => !n)} aria-pressed={night} aria-label="Night lighting" className={chip(night)}>🌙 Night</button>
        <span className="mx-1 text-white/40">|</span>
        {RES.map((r, i) => <button key={r.n} onClick={() => setRes(i)} aria-pressed={res === i} aria-label={`New quality ${r.n}`} className={chip(res === i)}>{r.n} {r.w}</button>)}
        <span className="text-sm text-white/80" data-testid="lab-info">{info.splats ? `${info.splats.toLocaleString()} splats · built in ${info.buildMs} ms · CPU ${info.cpuMs} ms/frame · ` : ""}Chrome {ver || "?"}{info.note ? ` · ${info.note}` : ""}</span>
      </div>
    </div>
  );
}
