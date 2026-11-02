import { useStore } from "../lib/store";
import { ModeIcon } from "./Icons";
import type { Biome } from "./species";

export type Mode = "explore" | "camp";
/** The game modes of a zone. To try a new loop: add it here, add its screen in Zone.tsx, and give it a switch in the Grown-up area. */
export const MODES: { id: Mode; name: string; beta?: boolean; flag?: "camp" }[] = [
  { id: "explore", name: "Explore" },
  { id: "camp", name: "Camp", beta: true, flag: "camp" },
];

/** Zone name plus the row of mode tabs. */
export function ModeTabs({ biome, mode, onMode }: { biome: Biome; mode: Mode; onMode: (m: Mode) => void }) {
  const { wilds: w } = useStore();
  const shown = MODES.filter((m) => !m.flag || w.modes[m.flag]);
  return (
    <div className="absolute inset-x-0 top-14 flex flex-col items-center gap-1 px-3">
      <p className="text-xl font-bold drop-shadow sm:text-2xl"><span className="emoji">{biome.emoji}</span> {biome.name}</p>
      {shown.length > 1 && (
        <div className="flex gap-2">
          {shown.map((m) => (
            <button key={m.id} onClick={() => onMode(m.id)} aria-label={`${m.name} mode`}
              className={`flex items-center gap-1 rounded-full px-4 py-1 text-lg font-bold active:scale-95 ${m.id === mode ? "bg-mustard text-black" : "bg-white/85 text-emerald-900"}`}>
              <ModeIcon kind={m.id} className="h-6 w-6" /> {m.name}{m.beta && <span className="ml-1 rounded-full bg-black/20 px-1.5 text-xs">beta</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
