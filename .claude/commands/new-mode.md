---
description: Add a new experimental game mode (a tab inside each zone) safely
---
Add a game mode named by the user. Follow `project/PLAN-INCREMENTAL.md` and the pattern used by Camp.

1. Add the mode id to `Mode` and `MODES` in `app/src/wilds/ModeTabs.tsx` with `beta: true` and a flag name; add the flag to `Wilds.modes` in `app/src/wilds/types.ts` (default value in `initialWilds`; old saves must still load).
2. Build the screen as its own component and route it in `app/src/wilds/Zone.tsx`. Put all tuning numbers in one table at the top of its logic file.
3. Add a checkbox for the flag in the "Game modes" section of `app/src/components/ParentArea.tsx`.
4. Add a test in `tests/e2e/` (register it in `tests/run.js`), run `/ship`.
5. Explore must remain the default mode and must keep working with the new mode switched off.
