# Incremental systems plan for Hazelwild

Idea from Max: make leveling feel like an incremental game (catch a certain number of a creature, feed them,
numbers that grow), and add **game modes** on each map so new loops can be tried without touching the core
loop. This plan covers the whole direction; **Phase 1 is built**, the rest is ordered by how much each adds.

## Principles (this is for a 7-year-old)
1. **The core loop stays the star.** Explore, catch, name, grow, evolve is untouched. New loops are *modes* she
   can switch to. Explore stays the default.
2. **Gentle numbers.** Things only go up. Nothing decays, breaks or gets lost. Offline progress is capped (so
   coming back feels like a treat, not a chore) and there is nothing to buy with real money or skip with a timer.
3. **Learning stays the fuel.** Every ⭐ from the other activities gives a **Star Boost** (camp works faster).
   Berries still come from stars, so spelling and science still matter.
4. **Everything is a flag.** Each experiment ships behind a switch in the Grown-up area, so it can be turned
   off without an update.
5. **Clear, big, short.** One new number at a time, introduced with a reason to care.

## Modes (the safe experiment framework)
Opening a zone shows a row of mode tabs under the zone name: **🔎 Explore** (default) and **🏕️ Camp** (beta).
A mode is `{ id, name, icon, beta, component }` in one registry. Adding a mode = one component + one line, and
a toggle in Grown-up → *Game modes*. If a mode is switched off its tab disappears.

## Currencies
- 🍓 **Berries** (existing): food, eggs, lures. Come from stars, bushes, goals, duels, badges.
- ✨ **Glow** (new): made by Camp workers. Spent on Camp upgrades and on **training** friends.
  Kept separate so the star-to-berry link stays meaningful.

## Phase 1 (built now)
**1. Species Mastery ("catch a certain amount").** Every catch or hatch of a species counts. At 3, 8, 20, 50 and
100 catches the species earns a ★ (1–5): berries + a celebration, and **+15% Camp work per ★** for that species.
Duplicates are now useful, and shown in the Wilddex card.
**2. Camp (idle mode, one per zone).** Put friends to work; they make ✨ Glow over time (even while the tablet is
off, up to a cap), and she taps **Collect**.
- Rate per worker = 0.6/min × form (×1 / ×1.6 / ×2.4) × training level (+12% per level) × species Mastery
  (+15% per ★) × **home zone** (×1.5 if the species lives in this zone), then +10% per other worker of the
  **same family** (max +30%).
- Camp upgrades (per zone, paid in ✨): **more workers** (2 → 5: 40/120/360), **bigger basket** (works 60 min +30
  per level, 6 levels), **faster work** (+25% per level, 8 levels).
- **Star Boost:** each ⭐ earned anywhere adds 10 minutes of 2× work (up to 60 minutes stored).
**3. Training.** Friends get a **Level 1–10**, bought with ✨ (20, 31, 48, 74, 115, 178, 276, 428, 663). Levels
are visible on friend cards. Evolution still comes from bond (feeding and petting), not levels.

## Phase 2: food chains
Camp buildings that make the four foods (Honey Hive, Moon Bakery, Star Candy Workshop, Carrot Garden) from the
right element workers; feeding spends *stock* instead of berries. Camp decorations bought with ✨.

## Phase 3: expeditions
Send a team of 1–3 friends out for 30 minutes to 4 hours; they come back with berries, eggs, rare spawns or
a "lure charge". Element-matched teams earn more. Pairs naturally with offline play.

## Phase 4: research and events
Zone research sheets ("catch 5 Leaf friends here") with bigger rewards, weekly zone events, achievements.

## Phase 5 (only if she loves it): gentle "Grand Camp"
An optional reset-for-permanent-bonus loop (prestige), framed as moving to a bigger camp, never losing friends.

## Risks and checks
- **Saves:** all new fields default safely; old saves load untouched.
- **Clock changes:** idle time uses the device clock. Fine for a family tablet; capped anyway.
- **Screen time:** the Grown-up area play limit applies to Camp too. Idle gains need no screen time by design.
- **Balance:** all Camp numbers live in `app/src/wilds/camp.ts` (one table) so they can be tuned from play-testing.
