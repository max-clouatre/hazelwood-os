# Hazelwild: design notes

A creature-collection game for Hazel (7), living inside Hazelwood OS. Inspired by the genre (Aniimo, Pokémon, Tamagotchi-style care). All art is original and generated in code; no third-party creatures, names, or assets.

## Goal
Something she *chooses* to play and returns to, that also pulls her toward the learning activities without feeling like homework.

## Why it should stick
| Hook | How it shows up |
| --- | --- |
| **Discovery** | Rustling bushes in 5 biomes; "what is it?" before every encounter; 1-in-16 **shiny** versions; rare species; the Wild of the Day. |
| **Unique, hers** | Every creature is procedurally drawn: 19 species × 3 forms × personality × pattern × hue variation. She names each one. |
| **Skill, not slots** | Catching is a timing mini-game (tap when the ring meets the circle), 3 tries. Better timing = better odds. |
| **Growth** | Bond with pets and foods. Each species has a *secret favorite food* she has to figure out. Evolves through 3 forms (14 and 40 bond points). |
| **Completion** | The Wilddex shows silhouettes for undiscovered species. Collecting all 19 summons the legendary **Hazelwisp**. |
| **Mastery** | Friendly Duels use a 6-element wheel with real-science reasons (water puts out fire, the Moon blocks the Sun in an eclipse). |
| **A reason to come back tomorrow** | Daily Visitor (special free encounter), Wishing Tree (+5 berries), a new Wild of the Day, pets refresh daily (3 per creature), eggs warming. No streak guilt: nothing is lost by skipping a day. |

## The tie to learning (without being "chocolate-covered broccoli")
Every ⭐ Hazel earns in *any* other activity does two things in Hazelwild: **+3 berries** (food, lures, eggs) and **+1 progress on every egg**. The creature game never asks her a quiz. She earns the fuel by playing the activities she already likes, and the hub tells her when her stars "turned into berries".

## Core loop
Explore → find a creature → catch → name → feed/pet → it evolves → new biomes unlock (collect 3, 6, 9, 12 species) → duel → repeat.

## Economy (tiny on purpose)
- 🍓 **Berries**: from stars (3 each), exploring (1–3), Wishing Tree (5/day), duels (6 for a win).
- Food: 2 🍓 each. Favorite food = +5 bond, other = +2. Pet = +1 (3/day per creature).
- Lure: 8 🍓, skips the common species for one find.
- Egg: 15 🍓, hatches after 5 ⭐ from anywhere; hatchlings are never common; carry up to 3.
- Sweet berry when catching: 1 🍓 for +15% catch chance.

## Safety and kindness
- Offline, no accounts, no ads, no purchases, no timers that punish. Play time is capped by the grown-up area like everything else.
- No creature can be lost or die. Duels have no injury: fainted friends "need a nap". Losing still gives berries and bond.
- Grown-ups can reset the creature game from the grown-up area.

## Elements
Leaf > Water > Fire > Leaf, and Moon > Sun > Star > Moon.

## Files
- `app/src/wilds/species.ts`: species, elements, biomes, foods (add a species by adding an entry).
- `app/src/wilds/Creature.tsx`: the SVG creature generator (body, ears, tail, extras per form, patterns, personality eyes, shiny).
- `app/src/wilds/game.ts`: spawn tables, catch odds, care, eggs, daily systems. State lives in the shared store under `wilds`.
- Screens: `Hub`, `Explore`, `Catch`, `Reveal`, `Collection` (My Wilds + creature page), `Dex`, `Eggs`, `Duel`.
- Dev art preview: open the app address followed by `#wilds-gallery`.

## Ideas for later
- Violet's version: a gentle pet-park (cuddle, feed, dress up), sharing the same creature art.
- Send a creature to Violet's pet park / let sisters "visit" each other.
- Seasonal Wild of the Month, more biomes and species, accessories, a home habitat to decorate.
- Spelling mini-quest to *name* a creature (spell its name to give it a nickname).
- Real recorded voices for the creatures' lines.
