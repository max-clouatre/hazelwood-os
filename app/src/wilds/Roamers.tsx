import type { ReactNode } from "react";
import { stageFor } from "./game";
import { Creature } from "./Creature";
import { SPECIES_BY_ID } from "./species";
import type { Owned } from "./types";

const VARIANTS = ["wanderA", "wanderB", "wanderC"];

/** Friends wandering about inside a positioned parent. Position is spread by index so they do not stack.
 *  `sparkle` makes a small ✨ float up from each friend now and then (working friends make Glow).
 *  `interactive` false lets taps pass through (used behind the bushes on the map). */
export function Roamers({ list, size = "h-20 w-20", top = [38, 72], onTap, sparkle = false, interactive = true, label, extra }: {
  list: Owned[]; size?: string; top?: [number, number]; onTap?: (o: Owned) => void; sparkle?: boolean; interactive?: boolean;
  label?: boolean; extra?: (o: Owned) => ReactNode;
}) {
  const n = Math.max(1, list.length);
  return (
    <>
      {list.map((o, i) => {
        const sp = SPECIES_BY_ID[o.sp];
        const left = 6 + ((i + 0.5) / n) * 76; // spread across the width
        const t = top[0] + ((i * 29) % 100) / 100 * (top[1] - top[0]);
        const art = <Creature species={sp} stage={stageFor(o.xp)} shiny={o.shiny} variant={o.variant} branch={o.branch} seed={o.seed} personality={o.pers} className={size} />;
        const inner = (
          <span className="relative block" style={{ animation: `${VARIANTS[i % 3]} ${14 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `-${i * 3}s` }}>
            <span className="block" style={sparkle ? { animation: "hopstep 1.4s ease-in-out infinite", animationDelay: `-${(i * 0.45) % 1.4}s` } : undefined}>{art}</span>
            {sparkle && <span aria-hidden className="emoji pointer-events-none absolute left-1/2 top-0 text-2xl" style={{ animation: "glowrise 3.2s ease-out infinite", animationDelay: `${(i * 0.9) % 3.2}s`, opacity: 0 }}>✨</span>}
            {label && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-2 text-xs font-bold">{o.name}</span>}
            {extra?.(o)}
          </span>
        );
        return (
          <div key={o.id} className="absolute" style={{ left: `${left}%`, top: `${t}%`, zIndex: Math.round(t), pointerEvents: interactive ? "auto" : "none" }}>
            {interactive && onTap ? <button onClick={() => onTap(o)} className="block active:scale-95" style={{ background: "none", border: "none", padding: 0 }}>{inner}</button> : inner}
          </div>
        );
      })}
    </>
  );
}
