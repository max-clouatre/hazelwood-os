import { useCallback, useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar, update, useStore } from "../lib/store";
import { pick } from "../lib/util";
import { LETTER_ORDER } from "./LetterPals";
import type { ActivityProps } from "./types";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const COLORS = ["#f472b6", "#a78bfa", "#34d399", "#fbbf24", "#60a5fa"];
const NEED = 0.7; // fraction of the glyph that must be covered
const SPOKEN: Record<string, string> = { "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine" };

export default function TraceIt({ profile }: ActivityProps) {
  const { traceRight } = useStore();
  // Pool grows: first her favorite letters and the numbers 1-3, then more of both.
  const pool = [...LETTER_ORDER.slice(0, Math.min(4 + Math.floor(traceRight / 2), 26)), ...DIGITS.slice(0, Math.min(3 + Math.floor(traceRight / 3), 9))];
  const poolRef = useRef(pool);
  poolRef.current = pool;

  const [glyph, setGlyph] = useState(() => pick(pool));
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const ref = useRef<HTMLCanvasElement>(null);
  const timer = useRef<number>();
  const doneRef = useRef(false);
  const color = useRef(pick(COLORS));

  useEffect(() => { say(`Trace the ${/\d/.test(glyph) ? "number" : "letter"} ${SPOKEN[glyph] ?? glyph}`); }, [glyph]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = useCallback(() => {
    doneRef.current = false; setDone(0); setPct(0);
    color.current = pick(COLORS);
    setGlyph(pick(poolRef.current));
    setResetKey((k) => k + 1); // new canvas even if the same glyph comes up twice
  }, []);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (c.width = c.clientWidth * dpr), h = (c.height = c.clientHeight * dpr);
    const size = Math.min(w, h) * 0.85;
    const font = `bold ${size}px "Comic Sans MS", "Chalkboard SE", sans-serif`;
    const cx = w / 2, cy = h / 2 + size * 0.03;

    const mk = () => { const o = document.createElement("canvas"); o.width = w; o.height = h; return o; };
    // mask: the glyph shape. paint: everything the child draws. fx: paint clipped to the glyph.
    const mask = mk(), paint = mk(), fx = mk();
    const mctx = mask.getContext("2d")!, pctx = paint.getContext("2d")!, fctx = fx.getContext("2d")!;
    mctx.font = font; mctx.textAlign = "center"; mctx.textBaseline = "middle"; mctx.fillStyle = "#000";
    mctx.fillText(glyph, cx, cy);

    // Sample points inside the glyph once, to measure coverage cheaply later.
    const md = mctx.getImageData(0, 0, w, h).data;
    const pts: number[] = [];
    const step = Math.max(4, Math.round(8 * dpr));
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (md[(y * w + x) * 4 + 3] > 128) pts.push(x, y);
    const total = pts.length / 2;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(glyph, cx, cy);
      fctx.clearRect(0, 0, w, h);
      fctx.globalCompositeOperation = "source-over"; fctx.drawImage(paint, 0, 0);
      fctx.globalCompositeOperation = "destination-in"; fctx.drawImage(mask, 0, 0);
      ctx.drawImage(fx, 0, 0);
      ctx.save();
      ctx.setLineDash([14 * dpr, 12 * dpr]); ctx.lineWidth = 3 * dpr; ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.strokeText(glyph, cx, cy);
      ctx.restore();
    };
    draw();

    let raf = 0;
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
    const coverage = () => {
      const pd = pctx.getImageData(0, 0, w, h).data;
      let hit = 0;
      for (let i = 0; i < pts.length; i += 2) if (pd[(pts[i + 1] * w + pts[i]) * 4 + 3] > 40) hit++;
      return total ? hit / total : 0;
    };

    const last = new Map<number, { x: number; y: number }>();
    const pos = (e: PointerEvent) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr }; };
    const dot = (x: number, y: number) => { pctx.fillStyle = color.current; pctx.beginPath(); pctx.arc(x, y, 20 * dpr, 0, Math.PI * 2); pctx.fill(); };
    const down = (e: PointerEvent) => { c.setPointerCapture(e.pointerId); const p = pos(e); last.set(e.pointerId, p); dot(p.x, p.y); schedule(); };
    const move = (e: PointerEvent) => {
      const l = last.get(e.pointerId); if (!l) return;
      const p = pos(e);
      pctx.strokeStyle = color.current; pctx.lineWidth = 40 * dpr; pctx.lineCap = "round";
      pctx.beginPath(); pctx.moveTo(l.x, l.y); pctx.lineTo(p.x, p.y); pctx.stroke();
      last.set(e.pointerId, p); schedule();
    };
    const up = (e: PointerEvent) => {
      last.delete(e.pointerId);
      if (doneRef.current) return;
      const cov = coverage();
      setPct(cov);
      if (cov >= NEED) {
        doneRef.current = true;
        setDone((d) => d + 1);
        chime(); note(3);
        say(`${cheer()} ${SPOKEN[glyph] ?? glyph}!`);
        addStar(profile);
        update((s) => ({ traceRight: s.traceRight + 1 }));
        timer.current = window.setTimeout(next, 2600);
      }
    };
    c.addEventListener("pointerdown", down); c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("pointerdown", down); c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up); c.removeEventListener("pointercancel", up);
    };
  }, [glyph, resetKey, profile, next]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="absolute inset-0 h-full w-full touch-none" />
      <div className="absolute left-1/2 top-2 h-3 w-48 -translate-x-1/2 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-yellow-300 transition-all" style={{ width: `${Math.min(100, (pct / NEED) * 100)}%` }} />
      </div>
      <button onClick={() => { setPct(0); doneRef.current = false; setResetKey((k) => k + 1); }} aria-label="Start over"
        className="emoji absolute bottom-3 right-3 h-16 w-16 rounded-full bg-white text-3xl shadow-lg active:scale-95">🧽</button>
      <button onClick={() => say(`Trace the ${/\d/.test(glyph) ? "number" : "letter"} ${SPOKEN[glyph] ?? glyph}`)} aria-label="Hear it"
        className="emoji absolute bottom-3 left-3 h-16 w-16 rounded-full bg-white text-3xl shadow-lg active:scale-95">🔊</button>
      {done > 0 && <Burst key={done} emojis={["⭐", "✨", "💖"]} />}
    </div>
  );
}
