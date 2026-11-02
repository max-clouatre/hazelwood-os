// Worlds: the high-level container above regions (zones). A world owns a set of regions, an art style, and (through the species
// that live in its regions) its creatures. Modes (Explore, Camp, Village...) work per region and so work in every world.
// To add a world: add an entry here with its region ids, add the regions to BIOMES in species.ts (species list their `biomes`),
// and, for a new art style, add a renderer (see project/EXTENDING.md). Nothing else in the game needs to change.
import { BIOMES } from "./species";
import type { Biome } from "./species";
import type { Wilds } from "./types";

/** How a world is drawn. "flat" = the original 2D scenes. "pixel" = the 3D pixel diorama engine (wilds/pixel). */
export type ArtStyle = "flat" | "pixel";

export interface World {
  id: string; name: string; emoji: string; art: ArtStyle; blurb: string;
  regions: string[];   // region (biome) ids, in the order shown on the map
  soon?: boolean;      // announced but not built yet: shown as a "coming soon" card, cannot be entered
  unlock?: { worlds?: string[]; caught?: number }; // future: what opens it (kept as data so rules can grow)
}

export const WORLDS: World[] = [
  { id: "hazelwild", name: "Hazelwild", emoji: "🌿", art: "flat", blurb: "Where it all began: five regions, from the first hill to the stars.", regions: ["meadow", "forest", "shore", "cave", "peak"] },
  { id: "pixel-isles", name: "Pixel Isles", emoji: "🧊", art: "pixel", blurb: "A chain of floating pixel islands with new friends. Being built!", regions: [], soon: true },
];
export const WORLD_BY_ID: Record<string, World> = Object.fromEntries(WORLDS.map((x) => [x.id, x]));
export const DEFAULT_WORLD = "hazelwild";

export const regionsOf = (world: World): Biome[] => world.regions.map((id) => BIOMES.find((b) => b.id === id)).filter(Boolean) as Biome[];
export const worldOfRegion = (regionId: string): World => WORLDS.find((x) => x.regions.includes(regionId)) ?? WORLDS[0];
export const currentWorld = (w: Wilds): World => { const x = w.world && WORLD_BY_ID[w.world]; return x && !x.soon ? x : WORLD_BY_ID[DEFAULT_WORLD]; };
/** Every region of every playable world (what the old BIOMES list was used for: camps, glow badges, berry guide). */
export const allRegions = (): Biome[] => WORLDS.filter((x) => !x.soon).flatMap(regionsOf);
