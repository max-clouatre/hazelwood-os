import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { isBlack, letterOf, pcOf } from "../../lib/piano";

export const RAINBOW = ["#e5534b", "#f2863a", "#f2c94c", "#5fcf62", "#3fa7e0", "#8a6bbf", "#e56fa0"]; // C D E F G A B
const LETTER_IDX: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
export const colorOf = (m: number) => RAINBOW[LETTER_IDX[letterOf(m)[0]]];
const lighten = (hex: string, t: number) => { const n = parseInt(hex.slice(1), 16); const f = (c: number) => Math.round(c + (255 - c) * t); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

export interface Layout { kw: number; bw: number; width: number; whites: number[]; blacks: number[]; x: (m: number) => number; w: (m: number) => number }
export function layoutOf(lo: number, hi: number, kw: number): Layout {
  const whites: number[] = [], blacks: number[] = [];
  for (let m = lo; m <= hi; m++) (isBlack(m) ? blacks : whites).push(m);
  const idx = new Map(whites.map((m, i) => [m, i])); const bw = Math.round(kw * 0.62);
  const x = (m: number) => (isBlack(m) ? (idx.get(m - 1) ?? 0) * kw + kw - bw / 2 : (idx.get(m) ?? 0) * kw);
  return { kw, bw, width: whites.length * kw, whites, blacks, x, w: (m) => (isBlack(m) ? bw : kw) };
}

/** Measures the available width and picks a key width (never narrower than minKw; a narrower screen scrolls sideways inside the box). */
export function PianoStage({ lo, hi, minKw = 40, keyH, fall, kb }: {
  lo: number; hi: number; minKw?: number; keyH: number;
  fall?: (l: Layout, fallH: number) => ReactNode; kb: Omit<KeyboardProps, "layout" | "height">;
}) {
  const wrap = useRef<HTMLDivElement>(null); const fallEl = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600); const [fh, setFh] = useState(200);
  useEffect(() => {
    const f = () => { if (wrap.current) setW(wrap.current.clientWidth); if (fallEl.current) setFh(fallEl.current.clientHeight); };
    f(); const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(f) : null; if (ro) { wrap.current && ro.observe(wrap.current); fallEl.current && ro.observe(fallEl.current); } else window.addEventListener("resize", f);
    return () => { ro?.disconnect(); window.removeEventListener("resize", f); };
  }, []);
  const n = layoutOf(lo, hi, 1).whites.length; const kw = Math.max(minKw, Math.floor(w / n)); const layout = layoutOf(lo, hi, kw);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={wrap} className="flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-hidden" data-testid="piano-stage">
        <div className="flex min-h-0 flex-1 flex-col" style={{ width: Math.max(w, layout.width), margin: "0 auto" }}>
          {fall && <div ref={fallEl} className="relative min-h-0 flex-1 overflow-hidden"><div className="absolute inset-y-0" style={{ left: Math.max(0, (Math.max(w, layout.width) - layout.width) / 2), width: layout.width }}>{fall(layout, fh)}</div></div>}
          <div className="relative mx-auto shrink-0" style={{ width: layout.width, height: keyH }}><Keyboard layout={layout} height={keyH} {...kb} /></div>
        </div>
      </div>
    </div>
  );
}

export interface KeyboardProps {
  layout: Layout; height: number; onDown: (m: number) => void;
  lit?: ReadonlySet<number>;     // keys showing as pressed
  glow?: ReadonlySet<number>;    // keys to press next (pulsing)
  rainbow?: boolean; letters?: boolean;
}
export function Keyboard({ layout: L, height, onDown, lit, glow, rainbow = true, letters = true }: KeyboardProps) {
  const key = (m: number, black: boolean) => {
    const on = lit?.has(m), g = glow?.has(m), c = colorOf(m);
    const bg = black ? (on ? c : g ? c : "#2b2540") : on ? c : g ? lighten(c, 0.35) : rainbow ? lighten(c, 0.78) : "#fff8e8";
    return (
      <button key={m} aria-label={`Piano key ${letterOf(m)}${Math.floor(m / 12) - 1}`} data-midi={m} data-lit={on ? 1 : 0} data-glow={g ? 1 : 0}
        onPointerDown={(e) => { e.preventDefault(); onDown(m); }} onContextMenu={(e) => e.preventDefault()}
        className="absolute flex items-end justify-center text-ink"
        style={{ left: L.x(m), top: 0, width: L.w(m) - (black ? 0 : 2), height: black ? height * 0.6 : height, zIndex: black ? 2 : 1, background: bg, border: "3px solid #2b2540", borderTop: "none", borderRadius: "0 0 10px 10px", touchAction: "none", transform: on ? "translateY(3px)" : undefined, outline: g ? `5px solid ${c}` : undefined, outlineOffset: g ? -2 : undefined, animation: g ? "keyglow 0.8s ease-in-out infinite" : undefined, padding: 0 }}>
        {letters && !black && <span className="mb-1 text-lg font-bold" style={{ color: "#2b2540" }}>{letterOf(m)}</span>}
        {letters && black && <span className="mb-1 text-xs font-bold text-white">{letterOf(m)}</span>}
      </button>
    );
  };
  void pcOf;
  return <>{L.whites.map((m) => key(m, false))}{L.blacks.map((m) => key(m, true))}</>;
}
