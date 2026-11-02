# Plan: Village mode (Camp grows into a builder) — idea from Max, 2026-11-02

**Max's words:** "what if camp mode was more like a small village builder she could actually build and design her camp village with different buildings, resources that all convert to glow, etc. So many ideas!" (inspired by Forager's look and feel).

## Why it fits
Camp already has workers, Glow, upgrades, Star Boost, mastery, family and home-zone bonuses, and (with Pixel meadow) an island, a tent and a campfire. A village turns "numbers going up" into **a place she designs**. Kids-first rules still hold: progress only goes up, nothing is lost or punished, no timers that pressure, no purchases.

## STATUS 2026-11-02: phase 0 built (see CHANGELOG). Decisions Max delegated: sits next to Camp; starter buildings Glow Well, Berry Patch, Lumber Hut, Workshop + decor Flower Bed and Lantern; decoration included as free-ish extras.

## Proof of concept (POC), smallest slice that tests the idea
- **Where:** a new mode, "Village" tab inside a zone beside Explore and Camp (`/new-mode`), switch in the Grown-up area, off by default. Needs Pixel meadow's engine, so it is drawn on the pixel island of that zone (reuse `wilds/pixel/`); flat fallback is a simple grid view.
- **Grid:** the zone's island has about 12 build plots (the walkable cells). Tap an empty plot, pick a building, it appears (little pop, sparkle).
- **Buildings (4 to start):** Berry Patch (makes 🍓), Glow Well (makes ✨ directly), Workshop (turns berries into ✨ faster), Cozy Hut (adds a worker slot, a friend lives there and waves). Each has 3 levels and a clear picture per level.
- **Resources → Glow:** buildings make *stuff* (berries, wood, flowers) in a small pile you tap to collect, and a conversion step turns stuff into ✨. Glow still buys upgrades, training and new buildings, so nothing breaks.
- **Friends:** a friend assigned to a building works there (walks to it, visible), reusing camp worker math (`CAMP_TUNING`). Home-zone and family bonuses apply per building.
- **Design:** move and rotate buildings, paths and fences/flowers as pure decoration (free, no pressure). Layout saved in `wilds.village[zone]`.
- **Offline gain:** same capped idle gain as Camp.

## Data (saves are sacred)
New optional field `wilds.village?: Record<zone, { plots: { x: number; z: number; kind: string; level: number }[]; stock: Record<string, number>; since: number }>`; default `{}`; old saves load unchanged; no existing field renamed.

## Open questions for Max
1. Should Village replace Camp or sit next to it? (Recommended: next to it for the POC, merge later once she picks a favourite.)
2. Which buildings would Hazel want first? (Her ideas beat ours.)
3. Is decoration (paths, fences, flowers) as important as production?

## Acceptance for the POC
Build 3 buildings on the Meadow island, assign two friends, see them walk and work, collect stock, convert to ✨, leave and come back with capped offline gains; works with Pixel meadow off (flat grid) and with an old save; test file `tests/e2e/village.js`; screenshots at phone and tablet.
