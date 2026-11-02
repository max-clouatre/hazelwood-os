import { Camp } from "./Camp";
import { Explore } from "./Explore";
import { VillageMode } from "./VillageMode";
import { ModeTabs } from "./ModeTabs";
import type { Mode } from "./ModeTabs";
import type { Biome } from "./species";
import type { Owned } from "./types";

/** One zone, in whichever game mode is selected. The mode tabs are shared so switching is instant. */
export function Zone({ biome, mode, onMode, onEncounter, onBack }: { biome: Biome; mode: Mode; onMode: (m: Mode) => void; onEncounter: (draft: Owned, lure: boolean) => void; onBack: () => void }) {
  if (mode === "village") return <VillageMode biome={biome} mode={mode} onMode={onMode} onBack={onBack} />;
  if (mode === "camp") return <Camp biome={biome} mode={mode} onMode={onMode} onBack={onBack} />;
  return <Explore biome={biome} onEncounter={onEncounter} onBack={onBack} tabs={<ModeTabs biome={biome} mode={mode} onMode={onMode} />} />;
}
