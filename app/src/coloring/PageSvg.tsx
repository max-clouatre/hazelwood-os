import type { Page } from "./pages";

const OUTLINE = "#3b2a5a";

/** Renders one coloring page. Each region draws a stroke layer then a fill layer, so overlapping
 *  shapes (like a cloud made of circles) show only one clean outline. */
export function PageSvg({ page, fills, onFill, className }: {
  page: Page; fills: Record<string, string>; onFill?: (regionId: string) => void; className?: string;
}) {
  return (
    <svg viewBox="0 -8 400 308" className={className} preserveAspectRatio="xMidYMid meet" style={{ touchAction: "manipulation" }}>
      <rect x="-10" y="-20" width="420" height="330" fill="#fffdf8" />
      {page.regions.map((r) => (
        <g key={r.id} transform={r.t}>
          <path d={r.d} fill="none" stroke={OUTLINE} strokeWidth={8} strokeLinejoin="round" />
          <path d={r.d} fill={fills[r.id] ?? "#ffffff"} stroke="none"
            onPointerUp={onFill ? () => onFill(r.id) : undefined} style={{ cursor: onFill ? "pointer" : "default" }} />
        </g>
      ))}
      {page.lines.map((l, i) => (
        <path key={i} d={l.d} fill="none" stroke={OUTLINE} strokeWidth={l.w ?? 4} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
      ))}
    </svg>
  );
}
