import { useEffect, useRef, useState } from "react";
import { note } from "../lib/audio";
import { pick } from "../lib/util";
import type { ActivityProps } from "./types";

const COLORS = ["#fbbf24", "#34d399", "#f472b6", "#60a5fa", "#c084fc", "#ffffff"];
const STAMPS: Record<string, string[]> = {
  violet: ["🐱", "🦄", "⭐", "🐶", "💜", "🌈"],
  hazel: ["🦄", "⭐", "🌈", "✨", "💜", "🌸"],
};
const BG = "#1e1b4b";

export default function SparklePaint({ profile }: ActivityProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0]);
  const colorRef = useRef(color);
  colorRef.current = color;
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let dpr = 1;
    const fit = () => {
      const old = document.createElement("canvas");
      old.width = c.width; old.height = c.height;
      if (c.width) old.getContext("2d")!.drawImage(c, 0, 0);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, c.width, c.height);
      if (old.width) ctx.drawImage(old, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const pts = new Map<number, { x: number; y: number; sx: number; sy: number; moved: boolean }>();
    const rect = () => c.getBoundingClientRect();
    const down = (e: PointerEvent) => {
      c.setPointerCapture(e.pointerId);
      const r = rect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
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
      ctx.strokeStyle = colorRef.current; ctx.lineWidth = 22 * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(p.x * dpr, p.y * dpr); ctx.lineTo(x * dpr, y * dpr); ctx.stroke();
      p.x = x; p.y = y;
    };
    const up = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (p && !p.moved && e.type === "pointerup") {
        ctx.font = `${72 * dpr}px "Noto Color Emoji", sans-serif`;
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

  const clear = () => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, c.width, c.height);
  };

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="absolute inset-0 h-full w-full touch-none" />
      {hint && <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-3xl text-white/80">Tap ✨ Drag to paint</p>}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 p-3">
        {COLORS.map((c) => (
          <button key={c} aria-label={`color ${c}`} onClick={() => setColor(c)}
            className={`h-16 w-16 rounded-full border-4 shadow-lg ${c === color ? "scale-125 border-white" : "border-white/70"}`}
            style={{ background: c }} />
        ))}
        <button onClick={clear} aria-label="Clear" className="emoji h-16 w-16 rounded-full bg-white text-3xl text-black shadow-lg active:scale-95">🧽</button>
      </div>
    </div>
  );
}
