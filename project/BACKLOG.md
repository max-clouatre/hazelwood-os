# Backlog

Priority: **P0** blocks play or loses data · **P1** Max asked for it · **P2** idea. Status: ⏳ open · 🔧 in progress · 👀 shipped, awaiting Max's check on the tablet · ✅ done.
Each item has an acceptance test. Add items from `FEEDBACK.md`; keep this list short and ordered.

## Verify on the real tablet (Max)
- **B-01 👀 P0: check the recent fixes on the tablet.** Gray boxes gone (Home Meadow, capture icons); mystery shadow in the catch screen; update button works (first update must be manual); music plays; Camp tab works. *Accept:* Max says so, or sends a photo.

## Requested 2026-11-02 evening
- **B-21 ✅ fixed, awaiting Max's ear (test `music-switching`) P0: music from different screens plays at once.** Landing/menu music keeps playing when a zone's song starts. *Accept:* switching screens leaves exactly one song audible (test measures the song scheduler and real output level).
- **B-22 🔧 P1: Camp shows its workers moving around and animates each Glow they produce.** *Accept:* workers visible and moving in Camp; a visible sparkle when Glow is produced; basket reacts when Glow arrives.
- **B-23 🔧 P1: workers also show on the map** (their zone's scene and the zone card on the map). *Accept:* assigned workers visible in that zone's Explore scene and on its map card.
- **B-24 🔧 P1: merge Home meadow and landing page; Hazel chooses 5 or more friends who wander at home; rethink the flow** (Home as the landing screen, Map for zones, a "Today" panel for daily things). *Accept:* landing screen is the living meadow with her chosen crew; she can change the crew; all old features still reachable.

## Next up
- **B-02 ⏳ P1: staging channel.** Publish a second build to `/hazelwood-os/next/` (same Pages site) so experiments can be tried on Max's phone without reaching the kids' tablet. *Accept:* `next/` loads, has its own service worker scope and save key, and `main` build is unaffected; documented in `CLAUDE.md`.
- **B-10 ⏳ P1: performance probe page** (`#perf`): small 3D scene that reports frames per second, GPU string, memory; used on the tablet and phone to decide whether 3D is feasible. *Accept:* a number from the tablet; decision recorded in `DECISIONS.md`.
- **B-03 ⏳ P1: a different catch loop per zone** (e.g. forest ring is faster, shore creature drifts side to side, cave light flickers, peak creature hops). *Accept:* each zone's catch feels different; all still use the same ring rules; test per zone.
- **B-05 ⏳ P1: tune Camp from real play** (`wilds/camp.ts` `CAMP_TUNING`). *Accept:* Max reports Glow pacing feels right.
- **B-04 ⏳ P1: richer zone art** (distinct scenery per zone beyond the spot icon and colors).

## Incremental phases (see `PLAN-INCREMENTAL.md`)
- **B-06 ⏳ P2:** Phase 2, food chains: camp buildings that make the four foods; feeding spends stock.
- **B-07 ⏳ P2:** Phase 3, expeditions (timed team trips for rare finds and eggs).
- **B-08 ⏳ P2:** Phase 4, zone research sheets, weekly events, achievements.
- **B-09 ⏳ P2:** Phase 5, gentle "Grand Camp" reset loop (only if she loves Camp).

## Quality of life and polish
- **B-11 ⏳ P2: voices.** Voice picker with preview, speed and pitch; later, record lines in Max's or Victoria's voice (falls back to text-to-speech).
- **B-12 ⏳ P2: Violet's creature game** (a gentle pet park using the same creature art).
- **B-13 ⏳ P2: CI** (GitHub Actions: typecheck, build, fast suite). Needs a token with workflow scope.
- **B-14 ⏳ P2:** more spelling tools; **B-15** color-by-sums for Hazel; **B-16** more activities (clocks, shapes for Violet; sums, solar system for Hazel).
- **B-17 ⏳ P2:** play log per child in the Grown-up area (where time goes, where she quits).
- **B-18 ⏳ P2:** voice for the key labels on screens the 3-year-old uses.
- **B-19 ⏳ P2:** more mystery (silhouette tiles with clues, "who's that" events).
- **B-20 ⏳ P2:** launcher/kiosk wrapper (Capacitor) so the tablet boots straight into the app (levels in `PLAN` / earlier chat: pinned PWA, then home-launcher APK, then device-owner kiosk; the last needs a Google-account-free device setup).

## Watch list (risks, not tasks)
- Zone unlock thresholds were raised (4/8/12/16): a save that unlocked a zone earlier may re-lock. Fix with a grandfather rule if Max reports it.
- Old Chrome: any new CSS or JS feature must be checked against Chrome 87. See `CLAUDE.md` section 4.
- Saves: every new field needs a default and, if needed, a migration in `rollDay()`.
