# Extending the game: recipes

Each recipe lists the files to touch. Everything is data-first; rules never depend on how things are drawn.

## Add a creature
`wilds/species.ts`: one `SPECIES` entry (names for 3 forms, element, body/ears/tail/extras recipe, `biomes: [region ids]`, rarity). Art is drawn from the recipe automatically (flat SVG; the pixel engine samples that SVG).

## Add a region (zone) to a world
1. `wilds/species.ts` `BIOMES`: id, name, emoji, unlock `need`, colours, blurb. 2. `wilds/worlds.ts`: add the id to a world's `regions`. 3. Give species that live there the id in `biomes`. 4. (Optional) a song in `lib/music.ts` and a `SpotIcon` in `Icons.tsx`. Camp and Village work in the new region with no more code.

## Add a world
`wilds/worlds.ts`: a `World` entry (`art`, `blurb`, `regions`, optional `unlock`). Set `soon: true` while it is only announced. If the art style is new, see "Add an art style".

## Add a game mode (a tab per region)
Use `/new-mode`. In short: `ModeTabs.tsx` (`Mode` + `MODES` + flag), a screen, `Zone.tsx` route, a Grown-up switch in `components/ParentArea.tsx`, `modes.<flag>` default in `wilds/types.ts`. Village (`VillageMode.tsx`, `village.ts`) is the newest worked example.

## Add a Village building
`wilds/village.ts` `BUILDINGS`: id, name, kind (`produce` | `convert` | `decor`), `makes`, `rate[level]`, `cost`, `max`, and add the id to `BUILD_ORDER`. `wilds/pixel/buildings.ts` `shapeOf(id, level)`: its boxes. Tune numbers in `VILLAGE_TUNING` / the entry. A new *resource* is a new `Resource` value plus a `RESOURCE_NAME`.

## Add an art style
A style is a renderer for the same data. Pixel (`wilds/pixel/`) is the template: `engine.ts` (draw pipeline), `sprite.ts` (creature -> mesh), `island.ts` (scene), `buildings.ts` (shapes), `meadow.ts` (living scene). Rules: lazy-load it, wrap it so failure falls back to flat (see `PixelMeadow.tsx` `onFail`), degrade by itself when slow, keep it offline, original art only.

## Add a test
`tests/e2e/<name>.js`, register in `tests/run.js` (`fast: true` only if it takes seconds; WebGL tests are in the full suite). Seed saves through `tests/lib.js`; old-shaped saves must load.
