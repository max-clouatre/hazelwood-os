# Plan: Worlds (a container above regions) — from Max, 2026-11-02

**Max's words:** "a high level container for [maps], 'worlds' maybe with 3-5 regions and then we can add more expansions with new regions, each with their own progression ... the same way we thought of different game modes that can scale independently, we can think of the creatures and the areas in that same way. Maybe current world regions are bland and 2d, but future ones get the updated graphical representations. Maybe there is a pixel world, different art styles for different worlds."

## The model (three independent axes that multiply)
```
World  (art style, blurb, regions[], unlock rule)          wilds/worlds.ts
  └─ Region (= Biome: name, unlock need, spawn list)       wilds/species.ts BIOMES; species list the regions they live in
       └─ Mode (Explore, Camp, Village, ...) works per region, so every mode works in every world
Art style (flat | pixel | future)  = a renderer for scenes   flat: Scene.tsx / Explore.tsx   pixel: wilds/pixel/
Creatures = species whose `biomes` are regions of a world (so a world's creature set falls out of its regions)
```
Nothing about a mode knows about a world; nothing about a world knows about a mode.

## What exists now (phase 0)
- `wilds/worlds.ts`: `WORLDS` registry. **Hazelwild** (flat art, the five current regions) and **Pixel Isles** (pixel art, "soon", no regions yet, shown as a coming-soon chip on the Map).
- Map shows a world bar, then the regions of the current world. `wilds.world` remembers the chosen world (default Hazelwild; old saves unchanged).
- Per-region state already scales: `camps[region]`, `village[region]`. Progress that is per region carries over to any world automatically.
- `allRegions()` replaces "every biome" wherever the code loops over regions (camp badges, glow dots).

## Not built yet (decide with Max when we get there)
- **Per-world progression** (a world's own unlock gates, goals, mastery, Wilddex page, legendary). Plan: `wilds.worlds?: Record<worldId, { ... }>` with defaults, migrate in `rollDay()`. Unlock rules are data in `World.unlock`.
- **Entering the second world:** needs its regions (Biome entries), species (data entries with `biomes: [...]`), and a pixel Explore scene. First content target: Pixel Isles with 3 regions.
- **Art style per region:** `World.art` says how scenes are drawn; Explore/Catch need pixel versions. Village and the landing already have a pixel renderer with a flat fallback, which is the pattern to follow (renderer chosen by art style, fallback to flat if WebGL fails).
- Music per world, world-specific Wilddex tab, world map art.
