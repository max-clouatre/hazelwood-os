import { useEffect, useRef, useState } from "react";
import type { Owned } from "./types";
import type { Meadow } from "./pixel/meadow";
import type { PostOpts } from "./pixel/engine";

const AUTO_PS = (w: number, h: number) => Math.max(2, Math.round(Math.max(w, h) / 380));

/** The pixel diorama. Loads three.js on demand. If anything goes wrong (no WebGL, old GPU) it calls onFail so the caller shows the flat meadow instead. */
export function PixelMeadow({ crew, workers, onTap, onFail, pixelSize, post, adaptive = true, onFps }: {
  crew: Owned[]; workers: Owned[]; onTap?: (o: Owned, xPct: number, yPct: number, worker: boolean) => void; onFail?: (why: string) => void;
  pixelSize?: number; post?: PostOpts; adaptive?: boolean; onFps?: (fps: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const meadow = useRef<Meadow | null>(null);
  const psRef = useRef(pixelSize ?? 0);
  const tapRef = useRef(onTap); tapRef.current = onTap;
  const failRef = useRef(onFail); failRef.current = onFail;
  const [ready, setReady] = useState(false);
  const sig = crew.map((o) => o.id).join(",") + "|" + workers.map((o) => o.id).join(",");
  const pending = useRef({ crew, workers }); pending.current = { crew, workers };

  useEffect(() => {
    let dead = false; let ro: ResizeObserver | null = null; let timer = 0; let canvas: HTMLCanvasElement | null = null;
    (async () => {
      try {
        const THREE = await import("three");
        const { createMeadow } = await import("./pixel/meadow");
        if (dead || !box.current) return;
        const el = box.current; canvas = document.createElement("canvas");
        canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;display:block";
        el.appendChild(canvas);
        const dims = () => { const r = el.getBoundingClientRect(); const ps = psRef.current || AUTO_PS(r.width, r.height); return [Math.floor(r.width / ps), Math.floor(r.height / ps)]; };
        const [w0, h0] = dims();
        const m = createMeadow(THREE, canvas, w0, h0, { post, onTap: (o, x, y, wk) => tapRef.current?.(o, x, y, wk) });
        meadow.current = m;
        await m.setActors(pending.current.crew, pending.current.workers);
        if (dead) { m.dispose(); return; }
        setReady(true);
        const refit = () => { const [w, h] = dims(); m.resize(w, h); };
        if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(refit); ro.observe(el); } else window.addEventListener("resize", refit);
        (window as unknown as { __pixel?: unknown }).__pixel = { stats: () => ({ ...m.stats(), ps: psRef.current || AUTO_PS(el.clientWidth, el.clientHeight) }), screenOf: m.screenOf, rotate: m.rotate };
        // If the picture crawls, quietly trade effects for speed: first drop the post pass, then use bigger pixels.
        let bad = 0;
        timer = window.setInterval(() => {
          const s = m.stats(); onFps?.(s.fps);
          if (!adaptive || s.fps === 0) return;
          bad = s.fps < 22 ? bad + 1 : 0;
          if (bad >= 3) { bad = 0; if (s.post.palette || s.post.outline || s.post.dither) m.setPost({ palette: false, outline: false, dither: false }); else if ((psRef.current || AUTO_PS(el.clientWidth, el.clientHeight)) < 6) { psRef.current = (psRef.current || AUTO_PS(el.clientWidth, el.clientHeight)) + 1; refit(); } }
        }, 1000);
      } catch (e) { if (!dead) failRef.current?.(e instanceof Error ? e.message : String(e)); }
    })();
    return () => { dead = true; ro?.disconnect(); window.clearInterval(timer); meadow.current?.dispose(); meadow.current = null; canvas?.remove(); setReady(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { meadow.current?.setActors(crew, workers); }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (post) meadow.current?.setPost(post); }, [post]);
  useEffect(() => { if (pixelSize) { psRef.current = pixelSize; const el = box.current; if (el && meadow.current) { const r = el.getBoundingClientRect(); meadow.current.resize(Math.floor(r.width / pixelSize), Math.floor(r.height / pixelSize)); } } }, [pixelSize]);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-[#8fd0f0]" data-testid="pixel-meadow">
      {!ready && <p className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white drop-shadow">Building the meadow…</p>}
      {ready && (
        <div className="absolute right-2 top-14 z-10 flex flex-col gap-2">
          <button aria-label="Turn the view left" onClick={() => meadow.current?.rotate(-1)} className="h-12 w-12 rounded-2xl border-[3px] border-ink bg-white/90 text-2xl font-bold text-emerald-900 shadow-lg active:scale-95">↺</button>
          <button aria-label="Turn the view right" onClick={() => meadow.current?.rotate(1)} className="h-12 w-12 rounded-2xl border-[3px] border-ink bg-white/90 text-2xl font-bold text-emerald-900 shadow-lg active:scale-95">↻</button>
        </div>
      )}
    </div>
  );
}
