import { useEffect, useRef, useState } from "react";
import { note } from "../lib/audio";
import { pick } from "../lib/util";
import type { ActivityProps } from "./types";

const COLORS = ["#fbbf24", "#34d399", "#f472b6", "#60a5fa", "#c084fc", "#ffffff", "rainbow"];
const SIZES = [12, 22, 40];
const STAMPS: Record<string, string[]> = {
  violet: ["🐱", "🦄", "⭐", "🐶", "💜", "🌈"],
  hazel: ["🦄", "⭐", "🌈", "✨", "💜", "🌸"],
};
const BG = "#1e1b4b";
const MAX_UNDO = 6;

export default function SparklePaint({ profile }: ActivityProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(1);
  const [hint, setHint] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const live = useRef({ color, size });
  live.current = { color, size };
  const history = useRef<ImageData[]>([]);
  const undoRef = useRef<() => void>(() => {});
  const clearRef = useRef<() => void>(() => {});

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    let dpr = 1;
    let hue = 0;
    const fit = () => {
      const old = document.createElement("canvas");
      old.width = c.width; old.height = c.height;
      if (c.width) old.getContext("2d")!.drawImage(c, 0, 0);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, c.width, c.height);
      if (old.width) ctx.drawImage(old, 0, 0);
      history.current = []; setCanUndo(false); // snapshots no longer match the canvas size
    };
    fit();
    window.addEventListener("resize", fit);

    const snapshot = () => {
      history.current.push(ctx.getImageData(0, 0, c.width, c.height));
      if (history.current.length > MAX_UNDO) history.current.shift();
      setCanUndo(true);
    };
    undoRef.current = () => {
      const s = history.current.pop();
      if (s) ctx.putImageData(s, 0, 0);
      setCanUndo(history.current.length > 0);
    };
    clearRef.current = () => { snapshot(); ctx.fillStyle = BG; ctx.fillRect(0, 0, c.width, c.height); };

    const pts = new Map<number, { x: number; y: number; sx: number; sy: number; moved: boolean }>();
    const strokeColor = () => (live.current.color === "rainbow" ? `hsl(${(hue = (hue + 6) % 360)} 90% 60%)` : live.current.color);
    const rect = () => c.getBoundingClientRect();
    const down = (e: PointerEvent) => {
      c.setPointerCapture(e.pointerId);
      const r = rect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (pts.size === 0) snapshot(); // one undo step per gesture, however many fingers
      pts.set(e.pointerId, { x, y, sx: x, sy: y, moved: false });
      setHint(false);
    };
    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const r = rect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (!p.moved && Math.hypot(x - p.sx, y - p.sy) < 10) return;
      p.moved = true;
      ctx.strokeStyle = strokeColor(); ctx.lineWidth = SIZES[live.current.size] * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(p.x * dpr, p.y * dpr); ctx.lineTo(x * dpr, y * dpr); ctx.stroke();
      p.x = x; p.y = y;
    };
    const up = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (p && !p.moved && e.type === "pointerup") {
        ctx.font = `${(60 + SIZES[live.current.size] * 1.5) * dpr}px "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(pick(STAMPS[profile]), p.sx * dpr, p.sy * dpr);
        note();
      }
      pts.delete(e.pointerId);
    };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("resize", fit);
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
    };
  }, [profile]);

  const btn = "emoji h-14 w-14 rounded-full bg-white text-2xl text-black shadow-lg active:scale-95";
  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="absolute inset-0 h-full w-full touch-none" />
      {hint && <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-3xl text-white/80">Tap ✨ Drag to paint</p>}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 p-3">
        {COLORS.map((c) => (
          <button key={c} aria-label={`color ${c}`} onClick={() => setColor(c)}
            className={`h-14 w-14 rounded-full border-4 shadow-lg ${c === color ? "scale-125 border-white" : "border-white/70"}`}
            style={{ background: c === "rainbow" ? "conic-gradient(red, orange, yellow, green, cyan, blue, violet, red)" : c }} />
        ))}
        <span className="mx-1 w-px self-stretch bg-white/30" />
        {SIZES.map((s, i) => (
          <button key={s} aria-label={`brush size ${i + 1}`} onClick={() => setSize(i)}
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg ${i === size ? "ring-4 ring-yellow-300" : ""}`}>
            <span className="rounded-full bg-indigo-900" style={{ width: 8 + i * 9, height: 8 + i * 9 }} />
          </button>
        ))}
        <span className="mx-1 w-px self-stretch bg-white/30" />
        <button onClick={() => undoRef.current()} disabled={!canUndo} aria-label="Undo" className={`${btn} ${canUndo ? "" : "opacity-40"}`}>↩️</button>
        <button onClick={() => clearRef.current()} aria-label="Clear" className={btn}>🧽</button>
      </div>
    </div>
  );
}
