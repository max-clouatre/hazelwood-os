# Plan: Cuddle Run (a gentle "survivors" game for Hazel) — idea from Max, 2026-11-12

**Max's brief:** Vampire Survivors style but non-violent. Creatures come to you to be petted; some take longer and take away your energy (health); when you run low you must go rest (the run ends). Integrate with the creature collection game: she collects core creatures as pets who join her runs and help her tend the wild animals that come for help. A game a 7-year-old would like and her mom would let her play: nothing violent. Learning elements.

## The pitch (what Hazel sees)
"Helper Hazel" looks after a meadow where wild animals come asking for love. Drag to walk. Stand near an animal and you automatically pet it; a heart ring fills; when it is full the animal is happy, floats a happy ✨ at you, and wanders off. Little ones are quick and free. Big ones take longer and tire you out. Too many cuddles at once and you get sleepy: when your energy runs out it is **Nap time** and the run ends kindly (you keep everything you earned). Your helper friends (up to 3, her own creatures) each help in their own gentle way.

## Why it is non-violent and kind (rules)
- Nothing is attacked, hurt, or defeated. "Enemies" are animals that want attention. Success = a happy animal. Failure = Hazel is sleepy, she naps, the day ends. Nobody loses anything; progress only goes up.
- No gore, no fear sounds, no timers that punish. The "day" is about 4 minutes and ends with a sunset.
- Rewards are berries, bond with her helper pets (they evolve closer), field notes, and new friends.

## Core loop (VS-shaped)
1. **Move** (drag anywhere / arrow keys). 2. **Auto-care**: animals inside your reach get petted automatically, up to a few at a time (attention is limited; the rest wait and cling, which slows you a little). 3. **Collect** the sparkles happy animals leave (XP) and snacks (energy). 4. **Level up** every few animals: answer a small question, choose 1 of 3 upgrade cards. 5. **Survive the day**: more and bigger animals arrive as the day goes on. 6. **Energy** is the health bar: big and "needy" animals drain it while you tend them; resting spots, snacks and some helpers restore it.

## Helper pets = her creature families (collection integration)
Pick up to 3 of her friends before a run. Each family has one ability, and the friend's **form (1 to 3)** sets its starting level, so evolving friends makes them better helpers:
| Family | Helper does |
| --- | --- |
| Sproutkin (leaf) | **Cozy Patch**: plants flower patches; standing in one restores your energy |
| Tidefolk (water) | **Splash Hello**: a gentle splash calms nearby animals (they slow down, tire you less) |
| Emberkin (fire) | **Warm Cuddles**: animals in its glow get petted faster |
| Dawnkin (sun) | **Sunbeam**: tends the nearest animal by itself, with no energy cost to you (the "auto-attack") |
| Duskkin (moon) | **Lullaby**: animals near it are sleepier, so they drain less energy |
| Skykin (star) | **Star Breeze**: pulls sparkles and snacks toward you, and makes you a bit faster |
Level-up cards can also upgrade a helper (up to level 5).
**Wild animals** are the species that live in that region (Worlds/regions: Cuddle Run is a per-region mode like Explore, Camp, Village). Size comes from rarity and form: tiny (quick, free) to giant (slow, tiring).
**Befriending:** at the end of a run, an animal she helped (that she does not own yet) may ask to join: it goes through the normal Reveal/naming and counts for the Wilddex. First ever run guarantees one. Helpers also gain bond (growth) from every run.

## Learning (light, inside the play)
- **Math at level-up** ("The bunnies need 7 carrots plus 5 more. How many?"): add within 10, then within 20, then take-away, then times tables. Right = pick from 3 cards; wrong = the answer is shown kindly and you pick from 2. Never blocks play.
- **Field notes**: the first time she helps each species she gets a true "Did you know?" fact (otters hold hands, a narwhal's tusk is a tooth). Notes are collected and saved (`wilds.cuddle.notes`).
- Later ideas (B-29): spelling-list "word wishes" from the weekly list, reading name tags, counting groups, habitat matching.

## Tech and rules
- New mode `cuddle` (tab "Cuddle Run") per region, Grown-up switch (default on, can be turned off), flat 2D canvas art (works on the old tablet; sprites are the same procedural SVG creatures rasterized once).
- Engine is pure rules (`wilds/cuddle/game.ts`) with a tuning table (`data.ts`), drawing in `draw.ts`, UI in `CuddleRun.tsx`. Same pattern as Village: rules never depend on drawing, so a pixel version can reuse the engine.
- Saves: `wilds.cuddle?: { runs, helped, best, notes, team }`, defaults for old saves.
- Performance: canvas 2D, sprites pre-rendered, about 36 animals max, 30 to 60 fps target on the Tab A; adaptive quality if slow.

## Phase 0 (this build) vs later
Built: engine, 6 helper abilities, 8 upgrade cards, math questions, field notes, nap/sunset results, rewards, befriending, tutorial, tests, balance simulation. Later (B-29): pixel/3D skin using the pixel engine, more arenas per region (per-region themes and music), boss-like "grand visitors" (a giant needing a whole team), helper leveling across runs, daily challenges, spelling and reading content.
