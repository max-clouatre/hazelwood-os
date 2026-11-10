# Changelog (newest first)

Verification column: **F** = fast e2e suite passed, **S** = slow suite passed, **B** = built only, **-** = not run.

## 2026-11-10: Hazel's new spelling list (test Tue Nov 10)
- New school list: page, germ, digit, gray, space, face, cell, center, carpet, are. It lives in `lib/spellinglists.ts` (`WEEKLY_LIST` with an id). When the tablet updates, a list with a newer id replaces the saved one **once** (stars, stickers and everything else untouched; words she still needs are kept if on the new list); edits made in the Grown-up area afterwards stick until the next id ships. Bug caught by the test: the default masked the missing id in old saves. Test `spelling-list`.
- **Weekly routine:** Max sends the list, we change `WEEKLY_LIST` (new id = date, new words), ship; Max taps Check for updates.

## 2026-11-07: Piano (new activity, Hazel and Violet)
- **Piano** with three parts: **Free Play** (rainbow keys, letters, two octaves, Low/High buttons, multi-touch), **Lessons** (8 short lessons: hello, find middle C, C D E, five-finger walk, black keys, A and B, Hot Cross Buns, Mary Had a Little Lamb; each step is spoken, glowing keys show what to press, mistakes only get a hint, a star per lesson) and **Songs** with falling notes in three modes: **Follow me** (the song waits for her), **Play along** (notes keep falling, hits sparkle, no fail, slow or normal), **Listen** (it plays itself). A star for finishing a song.
- **Song book** (all traditional or public domain): 11 kids' songs (Twinkle, Mary, Hot Cross Buns, Row Row Row, Happy Birthday, Old MacDonald, Itsy Bitsy Spider, London Bridge, Frère Jacques, Yankee Doodle, Oh! Susanna), 2 holiday songs (Jingle Bells, We Wish You a Merry Christmas) and **Dads' Corner** (Ode to Joy, Für Elise, Greensleeves, The Entertainer, Auld Lang Syne).
- **My Songs:** a grown-up (math gate) types in any song as notes (`E4 D4 C4:2 R:1 F#4`); it is checked as you type and saved only on the tablet (`hwos:songs`). This is how copyrighted songs such as Mad World get in without being published in the public repo. Progress (finished lessons/songs) in `hwos:piano`.
- Sound: a small additive piano voice (`lib/piano.ts`). Songs are data in `activities/piano/songs.ts` (`parseSong` format documented in `lib/piano.ts`).
- Test `piano` (both profiles, phone and tablet; Follow me played to the end, Play along timed on a fake clock, Listen, gate, typed song, restart). Not verified: how the piano sound feels on the tablet speaker; whether the classical melodies match the real pieces note for note (they are simplified from memory; tell me any wrong notes).

## 2026-11-05: Animal Game (new activity, Hazel and Violet)
- "Animal Game": pick a category (Mix it up, Pets, Farm, Jungle, Water, Birds & Bugs, Woods; 50 animals) and press Start. Every 20 seconds (10 or 30 selectable) it shouts a new animal ("cow! Chew chew and swish your tail!"), shows it big with a movement animation (hop, waddle, stomp, fly, swim, crawl, sway, run) inside a countdown ring, and shouts the animal's sound halfway. Pause, Next, Done. Every animal comes up once before any repeats. A star every 5 finished animals (feeds Hazelwild like other stars). No winning or losing. Animals are data in `activities/animals.ts`.
- Test `animal-game` (fake clock; both profiles; phone and tablet). Not verified: how the voice sounds on the tablet; whether 20 seconds suits the girls.

## 2026-11-02: Worlds layer and Village mode (phase 0)
- **Worlds:** `wilds/worlds.ts` registry above regions; Map shows a world bar (Hazelwild playable, Pixel Isles "soon"); `wilds.world` saved; code that looped over all regions now uses `allRegions()`. Docs: `PLAN-WORLDS.md`, `EXTENDING.md` (recipes for creature, region, world, mode, building, art style).
- **Village mode (beta, Grown-up switch, off by default):** third tab per region. 8 plots on the pixel island (flat grid fallback without WebGL). Build a Glow Well, Berry Patch, Lumber Hut, Workshop, or decorations (Flower Bed, Lantern); producers fill a pile (capped at 45 minutes, offline safe) you tap to collect; berries and wood go to village stock and the Workshop turns stock into ✨; buildings upgrade to level 3 and a friend assigned to a building works it (uses Camp worker math), visibly beside it. A friend is busy if at a camp or a village plot. 30 ✨ starter gift on first visit. Rules in `village.ts`, shapes in `pixel/buildings.ts`.
- Tests: new `village` (23 checks incl. the berries/wood -> Workshop -> Glow chain, offline pile, flat fallback, old save, hidden-until-switched); `landing` checks the world bar. Phone layout fix: three mode tabs now wrap.
- Not verified: real tablet speed/feel of Village, balance of the numbers, whether Hazel enjoys it.

## 2026-11-02: Pixel meadow, lighter and faster
- **Bug found and fixed:** the post pass showed colors darker than designed (sRGB target read as linear). That was a big part of the "dark, heavy greens". Colors now come out as designed; palette re-tuned to a bright Forager-like set (fresh greens, warm sand dirt, light sky and water), lighter toon bands, sprite colors snapped to the palette so creatures are crisp instead of grainy.
- **Speed:** hidden dirt/underside blocks no longer drawn (about 60% fewer island boxes), fewer particles and no particle upload when none are alive, medium-precision shaders, no stencil. The picture size now adapts: under 27 fps for 3 seconds it makes pixels bigger first (looks the same, much cheaper), and only then drops effects; the size it settles on is remembered on that device (`hwos:pixelps`).
- Not verified: real tablet fps (was about 25; target steady 30).
- Village mode idea written up: `project/PLAN-VILLAGE.md`.

## 2026-11-02: Hazelwild narrator off by default
- The talking voice in Hazelwild is now **off by default** (it was "way too busy"); music and sound effects are unchanged. A 🗣️/🤐 button in the landing top bar turns it on or off (saved as `wilds.voice`). Other activities (Spelling, Violet's games) keep their voice. Test `narrator`. Verified: narrator, landing, camp, pixel-meadow, progression, music-switching pass; not verified on the real tablet.

## 2026-11-02: Pixel meadow mode (beta, off by default)
- Grown-up area > Game modes > **Pixel meadow**: the landing becomes a floating 3D pixel island (turnable in quarter turns). Her chosen crew wander, hop, sleep with z's and are petted by tapping; friends working at camps stand by a striped tent and campfire and sparkle Glow. Clouds, butterflies, a pond, flowers, wishing-tree sparkles. Dock, Map, Today and Crew work as before over it. If WebGL fails it falls back to the flat meadow; if it runs slow (< 22 fps for 3 s) it drops effects, then uses bigger pixels.
- New pixel engine (`wilds/pixel/`): low-res render target, fixed 512-color palette with Bayer dither, ink outlines from depth jumps, banded toon light on the island; creatures are sampled from their SVG to 40x40, inflated into pillows and meshed with only visible faces (about 3k triangles each). Rendering is capped at 30 pictures a second.
- Pixel Lab rebuilt on the same engine: pixel size 1-6, palette/dither/outline switches, friend picker, fps.
- Tests `pixel-meadow` and `pixel-lab` (full suite). Software GL here, so **real tablet fps/feel unverified**.
- Lessons taken from the tennis-diorama prompt: low-res target + palette snap + dither + depth outlines (adopted); fixed iso camera with quarter turns (adopted); a written module contract and parallel agents (not needed at this size); CDN three r128 (not allowed, we bundle); OKLab palette snap (replaced by cheap per-channel steps because the old tablet GPU matters more); day/dusk/night and cutaway walls (future ideas).

## 2026-11-02: Pixel Lab experiment (Grown-up area)
- Grown-up area > Labs > **Pixel Lab**: our SVG creatures sampled to 36x36 pixel art, built from cubes in a three.js scene drawn at low resolution (Chunky/Classic/Fine) and enlarged with hard edges; live fps counter doubles as the first tablet performance probe (B-10). three.js is lazy-loaded (separate 670 KB chunk, not used by the game). Test `pixel-lab` (slow list; software GL ~13 fps here, **real tablet fps unknown**).

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
