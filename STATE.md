# STATE: where we are

*Last updated: 2026-11-02. Rules are in `CLAUDE.md`. Backlog: `project/BACKLOG.md`. Max's feedback history: `project/FEEDBACK.md`.*
*Read the whole file once per session (2 minutes). Rewrite **Resume here** at the end of every session.*

## Resume here
**Situation.** Hazel (7) and Violet (3) play on a family Samsung Galaxy Tab A (Android 11, **old Chrome, below version 88**). Hazel
played Hazelwild for the first time on 2026-11-02 and loved the catch-and-discover loop. Since then we shipped fixes and a lot of new
features that **Max has not yet seen on the tablet** (list below). The newest work (this commit) fixes gray boxes behind creatures,
makes creatures a **mystery shadow until caught**, and adds this durable-project harness (rules, hooks, tests, state files).

**Ask Max to confirm on the real tablet** (we can only simulate the old browser here):
1. **Gray boxes gone** around creatures in Home Meadow and capture icons (root cause: old Chrome drops Tailwind's `:where()` button reset; fixed in `app/src/index.css`, guarded by `tests/e2e/old-chrome.js`).
2. **Mystery capture**: a dark shadow and "A wild ??? appeared!", reveal only after the catch.
3. **Update button** (Grown-up area > Check for updates). The tablet needs **one manual update first** (unpin, open the app online, fully close it, reopen) to receive the button; after that use the button.
4. **Music** (7 generative songs; levels were measured, how they *sound* is unverified) and the **Camp** tab (idle mode, beta).

**Next work, in this order unless Max says otherwise** (details in `project/BACKLOG.md`):
- **B-02** staging channel (`/next/`) so experiments can be tried on Max's phone without reaching the kids' tablet.
- **B-10** performance probe page (frames per second on the tablet and phone) to decide whether 3D is feasible.
- **B-03** a different catch loop per zone; **B-05** tune Camp numbers from real play; then incremental phases 2 to 4 (`project/PLAN-INCREMENTAL.md`).
Do **not** start big new systems before hearing playtest feedback. When feedback arrives, run `/log-feedback` first.

## Product in one paragraph
An offline web app (PWA, no accounts, nothing leaves the device) that the family tablet boots straight into (screen-pinned).
Two profiles. **Violet (3):** Count Friends, Letter Pals, Trace It, Coloring Book, Sparkle Paint, My Stickers. **Hazel (7):** Hazelwild
(creature collecting), Spelling Unicorn (editable word list), Sink or Float?, Magnet Mystery, Color Lab, Color by Number, Sparkle Paint,
My Stickers. Stars earned in any activity become berries and a Star Boost in Hazelwild, so learning fuels the game. A Grown-up area
(hold the title, or the visible gear, then a math question) has play-time limits, spelling list, game-mode switches, updates, diagnostics.

## Commands (run from `app/`)
```bash
npm install                 # first time
npm run dev                 # dev server
npm run build               # typecheck + build into ../docs  (BUILD_ID env var overrides the build id)
npm run test:e2e            # fast end-to-end suite (about 3 min)
npm run test:e2e:full       # everything (about 12 min)
npm run verify              # build + fast suite
npm run state               # prints this file's Resume section + git status
```
Run long things in the background and poll `tests/out/*.log` (tool calls time out; see `project/ENVIRONMENT.md`).

## Deployment
GitHub Pages serves `main`, folder `/docs` at **https://max-clouatre.github.io/hazelwood-os/** (repo is public). `docs/` is **generated**: rebuild,
commit it with the code, push. Push the session branch **and** main: `git push origin <branch> <branch>:main`. The tablet updates through
the Grown-up area (compares `version.json` with the installed build id, installs the new service-worker files, restarts, keeps saves).

## What exists
**Platform:** Vite 5 + React 18 + TypeScript + Tailwind 3 + `vite-plugin-pwa` (autoUpdate, skipWaiting). Font Fredoka (bundled). Flat look
with ink outlines and hard shadows (`index.css`, palette in `tailwind.config.js`). Layouts checked from 390x844 phone to tablet landscape.
Error boundary around every activity + crash log shown in the Grown-up area. Shims for old Chrome (`lib/shims.ts`).

**Hazelwild (Hazel's creature game, `app/src/wilds/`, entry `activities/Hazelwild.tsx`):**
- **38 species** (+ legendary Hazelwisp for completing the Wilddex), each a real animal (Fox, Otter, Owl, Panda, Narwhal, Axolotl...), in **6 families** (Sproutkin, Tidefolk, Emberkin, Dawnkin, Duskkin, Skykin). Art is **procedural SVG** from recipes in `species.ts`, drawn by `Creature.tsx` (body, ears, tail, extras, face parts, patterns, personality eyes). Data entry = new species.
- **Evolution:** 3 forms getting visibly richer (bond 14 and 40), and the final form **branches by food**: day foods (honey, carrot) give **Sunlit**, night foods (cookie, candy) give **Moonlit**. 152 forms total. Teaser silhouettes of unreached forms.
- **Special colors:** shiny 1 in 16; golden, storm, shadow, autumn (biome-weighted).
- **Zones:** Meadow, Forest (4 species to unlock), Shore (8), Cave (12), Peak (16). Each zone has mode tabs: **Explore** (default) and **Camp** (beta).
- **Explore/catch:** tap rustling spots (zone-specific vector icons); big result message at the tap; finds: creature 50%, berries 24%, friend-snack bond 10%, egg 4%. **Creatures are a mystery shadow until caught**; hints: sparkle if shiny/rare/special color. Timing-ring throw, 3 tries, sweet berry +15%. Berry bush (+2 per 2 min per zone), lure (8 berries).
- **Care:** pet (3 per day each), feed (2 berries, favorite food +5, secret favorite), rename, Friends list, **Home meadow** where friends wander.
- **Collection:** Wilddex by family with ??? tiles that hint where to look; badges: family (+20 berries), form master (+10), **Species Mastery ★** at 3/8/20/50/100 catches.
- **Economy:** ⭐ = 3 berries; berry guide on the 🍓 pill everywhere; daily Wishing Tree (+5), Daily Visitor, Wild of the Day (mystery), 3 daily goals, duel wins, badges.
- **Eggs:** 15 berries, hatch after 5 ⭐ earned anywhere. **Duels:** 6-element wheel with science reasons.
- **Camp (beta, incremental):** friends work per zone and make ✨ Glow (offline up to 60+ min), upgrades (workers, basket, speed), training Lv 1 to 10, home-zone and family bonuses, Mastery bonus, **Star Boost** (each ⭐ = 10 min of 2x). All numbers in `wilds/camp.ts`.
- **Music:** 7 generative songs (hub, 5 zones, duel) synthesized with Web Audio (`lib/music.ts`); dev page `#music`. Dev page `#wilds-gallery` shows all creatures.

## Architecture map
```
app/src/App.tsx            profile picker > home > activity; time limit; update check; ErrorBoundary
app/src/activities/        one file per activity + registry.ts (cards) + types.ts
app/src/wilds/             Hazelwild: species.ts (data), Creature.tsx (art), game.ts (rules), camp.ts + mastery.ts (incremental),
                           Hub / Zone / Explore / Camp / Catch / Reveal / Collection / Dex / Eggs / Duel / Habitat / Overlays / BerryGuide / Goals
app/src/lib/               store.ts (all saved state), audio.ts, music.ts, speech.ts, update.ts, errlog.ts, shims.ts
app/src/components/        TopBar, ParentArea (Grown-up), ParentGate, BreakScreen, ErrorBoundary, Burst, StickerOverlay
app/src/coloring/          SVG coloring pages + color-by-number keys
tests/                     Playwright suite: run.js, lib.js, e2e/*.js     scripts/harness.js  hooks logic     .claude/  hooks + slash commands
docs/                      BUILT output served by Pages (do not edit)     guide.html  tablet setup guide for Max
```

## Data model (saves)
`localStorage["hwos:v1"]` = `{ stars, stickers, newSticker, letterRight, countRight, traceRight, spelling, misses, limitMin, played, coloring,
colored, sound, music, wilds }`. `wilds` (`wilds/types.ts`): `started, owned[], seen, berries, fromStars, eggs, day, visitorDone, treeDone,
duelDay, favs, legend, seq, duelWins, goals, badges, newBadge, bushAt, tipSeen, glow, camps{zone}, boost, caught{species}, modes{camp}`.
Each owned friend: `id, sp, name, shiny, variant?, seed, pers, xp, got, pet, foods[2], branch?, level?`. Other keys: `hwos:lasterror`. **Every new field needs a default so old saves load.**

## Quality gates (see CLAUDE.md section 3)
Fast suite (`tests/run.js`): layout (all screens, phone + tablet), old-chrome (simulated tablet browser), mystery, creatures-ui, camp (idle math checked by hand), update (hermetic build of two versions), music (levels). Full adds: catch-flow, progression (evolution branches, badges, goals, eggs), color-by-number, duel.
**Last full verification: see `project/CHANGELOG.md` top entry.**

## Known issues and unverified items
- **Unverified on the real tablet:** gray-box fix (verified by simulating the old CSS parser), mystery capture, music sound quality, text-to-speech voice quality (depends on the tablet's engine), real-play balance of Camp.
- Tablet **graphics performance never measured**; 3D is blocked on the performance probe (B-10).
- Zone unlock thresholds were raised (4/8/12/16) when species doubled: a save that unlocked a zone earlier may re-lock until it catches more.
- Legendary needs all 38 species (long goal on purpose). The Wilddex only reveals a species after a catch (mystery), so "seen but not caught" no longer exists.
- Per-zone differences are so far: song, spot icon, scene colors, spawn pool. Distinct catch loops per zone are not built (B-03).
- No CI; tests are run by hand. The sandbox cannot reach github.io, so the live site cannot be checked from here.
- The GitHub repo was renamed from `obviously` to `hazelwood-os`; the local folder is still named `obviously`.

## Open questions for Max
- Is the Camp tab pulling Hazel in, or ignored? Does Glow fill too fast or too slowly?
- Staging channel for experiments (B-02): yes?
- Recorded voices from you or Victoria instead of the robot voice (B-11)?
- Does Violet want a creature game too (B-12)?
