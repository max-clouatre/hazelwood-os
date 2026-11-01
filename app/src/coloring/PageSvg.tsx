import { useLayoutEffect, useRef, useState } from "react";
import type { Page } from "./pages";

const OUTLINE = "#3b2a5a";
interface Label { x: number; y: number; size: number }

const STEP = 4; // grid cell size in SVG units
const X0 = 0, Y0 = -8, W = 400, H = 308;
const COLS = W / STEP, ROWS = H / STEP;

function placeLabels(root: SVGSVGElement): Record<string, Label> {
  const els = Array.from(root.querySelectorAll<SVGPathElement>("path[data-region]")); // bottom to top
  const info = els.map((el) => {
    const g = el.parentNode as SVGGElement;
    const items = g.transform.baseVal;
    const m = items.numberOfItems ? items.consolidate()!.matrix : new DOMMatrix();
    const bb = el.getBBox();
    const corners = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]
      .map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
    return {
      el, inv: m.inverse(),
      x0: Math.min(...corners.map((c) => c.x)) - 1, x1: Math.max(...corners.map((c) => c.x)) + 1,
      y0: Math.min(...corners.map((c) => c.y)) - 1, y1: Math.max(...corners.map((c) => c.y)) + 1,
    };
  });

  // owner[cell] = index of the topmost region covering that cell, or -1
  const owner = new Int16Array(COLS * ROWS).fill(-1);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const gx = X0 + (c + 0.5) * STEP, gy = Y0 + (r + 0.5) * STEP;
      for (let k = info.length - 1; k >= 0; k--) {
        const q = info[k];
        if (gx < q.x0 || gx > q.x1 || gy < q.y0 || gy > q.y1) continue;
        if (q.el.isPointInFill(new DOMPoint(gx, gy).matrixTransform(q.inv))) { owner[r * COLS + c] = k; break; }
      }
    }
  }

  // For each region: distance (3-4 chamfer) from every visible cell to the nearest non-visible cell.
  const out: Record<string, Label> = {};
  const INF = 1e9;
  const d = new Float32Array(COLS * ROWS);
  info.forEach((q, k) => {
    for (let i = 0; i < d.length; i++) d[i] = owner[i] === k ? INF : 0;
    const at = (r: number, c: number) => (r < 0 || c < 0 || c >= COLS || r >= ROWS ? INF : d[r * COLS + c]);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c; if (!d[i]) continue;
      d[i] = Math.min(d[i], at(r, c - 1) + 3, at(r - 1, c - 1) + 4, at(r - 1, c) + 3, at(r - 1, c + 1) + 4);
    }
    for (let r = ROWS - 1; r >= 0; r--) for (let c = COLS - 1; c >= 0; c--) {
      const i = r * COLS + c; if (!d[i]) continue;
      d[i] = Math.min(d[i], at(r, c + 1) + 3, at(r + 1, c + 1) + 4, at(r + 1, c) + 3, at(r + 1, c - 1) + 4);
    }
    // Skip cells near the picture's edge so a number is never cut off (e.g. the ground strip).
    const M = 4;
    let best = 0, bi = -1;
    for (let i = 0; i < d.length; i++) {
      const r = Math.floor(i / COLS), c = i % COLS;
      if (r < M || c < M || r >= ROWS - M || c >= COLS - M) continue;
      if (d[i] < INF / 2 && d[i] > best) { best = d[i]; bi = i; }
    }
    if (bi < 0) return;
    const radius = (best / 3) * STEP - 3; // leave room for the outline
    out[q.el.dataset.region!] = {
      x: X0 + ((bi % COLS) + 0.5) * STEP, y: Y0 + (Math.floor(bi / COLS) + 0.5) * STEP,
      size: Math.max(10, Math.min(30, radius * 1.7)),
    };
  });
  return out;
}

/** Renders one coloring page. Each region draws a stroke layer then a fill layer, so overlapping
 *  shapes (like a cloud made of circles) show only one clean outline.
 *  With `numbers`, unfilled regions show their number (color by number). */
export function PageSvg({ page, fills, onFill, className, numbers, tint, bad }: {
  page: Page;
  fills: Record<string, string>;
  onFill?: (regionId: string) => void;
  className?: string;
  numbers?: Record<string, number>; // region id -> number to print
  tint?: (regionId: string) => boolean; // regions to highlight (pale yellow)
  bad?: string | null; // region to flash red (wrong tap)
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [labels, setLabels] = useState<Record<string, Label>>({});

  // Work out where each number goes: the roomiest spot in the part of the shape that is actually
  // visible (not covered by shapes drawn on top of it), and a font size that fits there.
  useLayoutEffect(() => {
    if (!numbers || !svg.current) return;
    try { setLabels(placeLabels(svg.current)); } catch { setLabels({}); }
  }, [page, numbers]);

  return (
    <svg ref={svg} viewBox="0 -8 400 308" className={className} preserveAspectRatio="xMidYMid meet" style={{ touchAction: "manipulation" }}>
      <rect x="-10" y="-20" width="420" height="330" fill="#fffdf8" />
      {page.regions.map((r) => (
        <g key={r.id} transform={r.t}>
          <path d={r.d} fill="none" stroke={OUTLINE} strokeWidth={8} strokeLinejoin="round" />
          <path d={r.d} data-region={r.id} fill={fills[r.id] ?? (tint?.(r.id) ? "#fff2a8" : "#ffffff")} stroke="none"
            onPointerUp={onFill ? () => onFill(r.id) : undefined} style={{ cursor: onFill ? "pointer" : "default" }} />
        </g>
      ))}
      {page.lines.map((l, i) => (numbers && l.for && !fills[l.for] ? null : (
        <path key={i} d={l.d} fill="none" stroke={OUTLINE} strokeWidth={l.w ?? 4} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
      )))}
      {numbers && page.regions.map((r) => {
        const lab = labels[r.id];
        if (!lab || fills[r.id]) return null;
        return (
          <text key={r.id} x={lab.x} y={lab.y} fontSize={lab.size} fontWeight="bold" textAnchor="middle" dominantBaseline="central"
            fill={bad === r.id ? "#dc2626" : OUTLINE} pointerEvents="none" fontFamily="system-ui, sans-serif">
            {numbers[r.id]}
          </text>
        );
      })}
    </svg>
  );
}
