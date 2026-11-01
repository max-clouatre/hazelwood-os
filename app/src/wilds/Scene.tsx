import type { ReactNode } from "react";
import type { Biome } from "./species";

const POS: [number, number, number][] = [[8, 12, 44], [22, 36, 34], [78, 14, 48], [90, 40, 36], [48, 8, 40], [64, 30, 30], [34, 18, 30], [12, 52, 38]];

/** A simple painted backdrop for a biome: sky, ground, hills and scattered decorations. */
export function Scene({ biome, children }: { biome: Biome; children?: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${biome.sky[0]}, ${biome.sky[1]} 60%, ${biome.ground} 60%)` }}>
      <div className="absolute -left-20 bottom-[36%] h-40 w-[70%] rounded-[50%] opacity-60" style={{ background: biome.ground, filter: "brightness(.92)" }} />
      <div className="absolute -right-24 bottom-[34%] h-48 w-[70%] rounded-[50%] opacity-60" style={{ background: biome.ground, filter: "brightness(.85)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{ background: biome.ground }} />
      {POS.map(([x, y, s], i) => (
        <span key={i} className="emoji pointer-events-none absolute opacity-80" style={{ left: `${x}%`, top: `${y}%`, fontSize: s }}>{biome.decor[i % biome.decor.length]}</span>
      ))}
      {children}
    </div>
  );
}
