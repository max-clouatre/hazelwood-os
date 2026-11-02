# Changelog (newest first)

Verification column: **F** = fast e2e suite passed, **S** = slow suite passed, **B** = built only, **-** = not run.

## 2026-11-02: living landing, Camp yard, workers on the map
- Landing and Home meadow merged into one screen: her meadow with a crew she chooses (5 to 10, saved in `homeCrew`; automatic top 5 for old saves; friends working at a camp stay at camp). Bottom dock: Adventure!, Today, Friends, Crew, Dex, Eggs, Duel. Today panel holds goals, Wild of the Day, Daily Visitor, Wishing Tree. Map panel lists zones with their workers and a ✨ badge when Glow waits. `Habitat.tsx` removed.
- Camp has a yard where workers wander and hop, a ✨ rises from them, and the basket pops with +1 when Glow ticks up. Workers also wander (tap-through, behind bushes) on their zone's Explore scene.
- Verified: fast suite (9 files) and slow suite (progression 26, catch-flow, color-by-number, duel) green; screenshots checked at phone and tablet. A real bug found by the suite: the crew layer blocked taps on the top pills (fixed, guarded). Not verified: real tablet, how it feels to play, sound on the tablet.
- Tests: new `landing` (30 checks, phone + tablet); `progression`, `old-chrome`, `camp` and others updated for the new navigation.

## 2026-11-02: sound overlap fix
- Music engine now keeps exactly one song chain alive (old echo loops are disconnected after a quick fade); catching a creature no longer restarts the zone song; leaving Hazelwild silences everything. Test `music-switching` (chain count, silence on exit). Verified: F on that test only; **not verified on the real tablet**.

## 2026-11-02: durable harness, gray-box fix, mystery capture (this delivery)
- Fixed gray boxes behind creatures and capture icons on the old tablet browser (Tailwind `:where()` button reset dropped). Regression test `old-chrome`.
- Creatures are now a mystery shadow until caught; Wild of the Day mystery; Wilddex ??? tiles hint where to look. Test `mystery`.
- Project harness: `CLAUDE.md`, `STATE.md`, `project/*`, Playwright suite moved into `tests/`, `scripts/harness.js` + `.claude/settings.json` hooks, slash commands `/resume /ship /log-feedback /new-mode`.
- Verified: **F + S**, all green on 2026-11-02: fast suite 7 files / 74 checks; slow suite 4 files / 39 checks (progression re-run after making one animation-timing check wait for the animation). Not verified: real tablet, how music sounds, voices.

## 2026-11-02: Phase 1 incremental systems (`81b0ef6`)
Game modes (Explore/Camp tabs, Grown-up switch), Camp per zone (Glow, upgrades, training Lv 1-10, Star Boost), Species Mastery stars, plan in `PLAN-INCREMENTAL.md`. Verified: Camp suite (18 checks), regression. 

## 2026-11-02: update button, zone music, vector capture icons (`7bea750`)
Grown-up update button + `version.json`; seven generative songs + `#music` lab; vector zone icons. Verified: update flow with two real builds, music levels.

## 2026-11-02: 38 species, variants, clearer info, tap feedback (`59c6a98`)
Doubled species with animal names, golden/storm/shadow/autumn colors, labeled info screens, pop-ups at the tap, new finds. Fixed bushes under buttons, double-tap encounters, wild creature mismatch.

## 2026-11-02: hotfix, Friends screen crash (`7ed6733`)
`Array.at` missing on the old tablet Chrome. Removed, shimmed, error boundary and crash log added.

## 2026-11-01: Hazelwild v2 (`97ff0fe`)
Families, Sunlit/Moonlit branches, berry guide and income, daily goals, home meadow, flat re-skin, how-to-play.

## 2026-11-01: Hazelwild (`cab3f64`)
Creature collection game: 19 species, 3 forms, 5 zones, catch ring, eggs, duels, Wilddex.

## 2026-11-01: Color by Number for Hazel (`29fd022`), Coloring Book (`6333c6e`)
Eight original pictures; auto-placed numbers; stars on completion.

## 2026-11-01: level up every activity (`66ee4a4`), React rebuild (`51359ee`)
Stickers, Grown-up area, time limits, Trace It, Magnet Mystery, profile picker, six activities.

## 2026-11-01: repo rename docs (`1d2e4e1`), Tab A compatibility (`6fc61f1`)

## 2026-10-31: MVP (`f9b5c06`)
Play Pad: tap shapes and notes, drag to paint, installable and offline, with the tablet setup guide.
