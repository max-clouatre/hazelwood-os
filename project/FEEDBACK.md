# Feedback and requests log (newest at the bottom)

Max's own words, lightly trimmed. Status: ✅ done · 🟡 partly · ⏳ open · 📝 noted. Ids in brackets point to `BACKLOG.md`.
Add new entries the moment they arrive (`/log-feedback`).

## 2026-10-31: the brief (handoff)
- Turn an unused Samsung (Android) tablet into a "Greia-like" offline learning device for his daughters (about 7 and 3). Inspiration: github.com/frozenpepper/Greia. ✅ (built as our own PWA)
- Beginner-friendly guide for hosting, installing, testing, screen-pinning. ✅ (`guide.html`)
- Greia's name, logo, art, audio must not be used (trademark/licensing). ✅ noted as a rule.
- Profile picker, big activity cards, Home button, parent area, per-child time limits, all data on device. ✅

## 2026-10-31 to 2026-11-01: setup conversation
- The tablet is a **Samsung Tab A**, Android 11, found after his grandpa passed. Wiped it. 📝 (old Chrome follows from this)
- Repo name: wanted something better than "obviously"; liked **hazelwood-os** and the idea that this is the ONLY app they use ("operating system perspective"). ✅ renamed. Later: launcher/kiosk wrapper idea. ⏳ [B-20]
- Does not want to pay for GitHub: made the repo public so Pages is free. ✅
- "Everything is working, pinned." ✅ MVP proven on the tablet.
- "They love it so far... Coloring books also huge hit for both." ✅ Coloring Book.
- "Hazel prefers Color by Number experiences, can you adjust hers." ✅
- Voice sounds robotic: did option 1 himself (switched the tablet to Google Speech Services). 🟡 voice picker / recorded voices [B-11]
- "Hazel loves creature collection games, especially Aniimo... design something she would actually play and come back to." ✅ Hazelwild.
- "UI redesign to get rid of this **AI slop gradient look**, theme more appropriately with updated 3D graphics and gameplay experiences. **Core loop more important.**" 🟡 flat re-skin done; 3D pending performance probe [B-10]
- "Lean into **families and evolutions**... she loves the evolve functionality to take something from simple to complex. It's **not clear how to get more strawberries/food**; needs clear ways. This is your game to grow." ✅ families, Sunlit/Moonlit, berry guide, bushes, goals, habitat.

## 2026-11-02: first real play session of Hazelwild (Hazel loved the loop)
- "The loop of catching something and finding something new, she absolutely loves." 📝 protect this loop.
- **Friends screen crashed the whole app**, had to restart. ✅ fixed (old Chrome had no `Array.at`); error boundary + crash log added.
- When she taps a bush and gets berries/creature, she did not look up to the top bar to see what she got. Show **what she got right next to the capture area**; mix variety of finds. ✅ pop-ups at the tap, new finds.
- Zones are nice. **Future:** theme music per zone ✅; different icons per zone 🟡 spot icons only [B-04]; capture loops a little different in each zone ⏳ [B-03].
- **Creature variety:** double the number of creatures ✅ (19 to 38); make the info screen easier to understand ✅; names closer to the real animal ("Foxy", not "Fox-lid") ✅; special color variants (golden, thunderstorm, dark, autumn) ✅; more versions of each thing ✅.

## 2026-11-02: follow-ups
- "We need a **better update method**. Add a button... in a parent area, admin settings." ✅ Grown-up area > Check for updates; visible gear on the profile screen.
- "Yes, do songs." ✅ generative zone music (listening quality unverified).
- "Fix the capture icons, they have **empty white boxes** around them." 🟡 first fix (vector icons) was the wrong cause; see next entry.
- **Incremental idea:** leveling like an incremental game (catch a certain amount of a creature, feed them); plan it, execute phase 1; "different modes when you open a map to switch between game loops so we can experiment safely." ✅ Camp mode, Mastery, training, mode tabs (phase 1). Later phases ⏳ [B-06..B-08]
- "**Make all progress durable in the repo** to pick up where we are, and build a core harness directive to always maintain project state durable, as a delivery factory with Claude.md rules." ✅ this harness.

## 2026-11-02: photo from the tablet (Home Meadow)
- "**Why the white box around them!?** Also make sure to add **unknowns so it's a mystery** what they are trying to capture."
  - Photo showed light gray rectangles behind every creature. Reproduced: old Chrome (before 88) cannot parse Tailwind's `:where()` button reset, drops the whole rule, and every button without a background gets the default gray face. ✅ fixed + regression test.
  - Mystery: capture screen shows a dark shadow, "???"; Wild of the Day mystery; Wilddex hints where to look. ✅ (needs Max's eyes on the tablet)

## 2026-11-02 (evening): after Max tried the harness delivery on the tablet
- "Yup, it all worked it seems." 📝 (gray boxes fixed, mystery capture, update button, Camp: no complaints) [B-01]
- **Sound bug:** "the map sounds and home screen sounds are all running together, like the landing page sounds don't stop and the map sounds play on top." ⏳ [B-21 P0]
- **Camp:** "workers should be shown on the screen moving around and an animation should happen when they produce a glow." ⏳ [B-22]
- "Adding workers to the **map camps also show them**, think that's a really good idea." ⏳ [B-23]
- **Home area:** "I want her to be able to **choose which 5 or more friends are wandering** around her home area. Feels like the **home area and the landing page could be merged**... reimagine the flow and experience a bit." ⏳ [B-24]

## 2026-11-02 (late): Pixel Lab result
- Max: "I'm seeing 46-51 fps" in the Pixel Lab. Device unstated (phone vs Tab A). Status: recorded; B-10 partly answered.

## 2026-11-02 (late): Pixel meadow result
- Max: "incredible, so good. looks to be steady around 25 fps" (Pixel meadow on the Tab A; cap is 30). Status: liked; fps is under the 30 cap, above the auto-degrade line (22). Option: tune for a steady 30 (B-25).

## 2026-11-02 (night): tuning and a new idea
- Max: do performance tuning for a steady 30 fps (was ~25); lighten the pixel area, greens too dark and heavy, picture Forager (bright, fresh). Status: done in code, awaiting the tablet (B-25).
- Max: Camp as a small **village builder** she designs and builds (buildings, resources that all convert to Glow). Status: planned, `project/PLAN-VILLAGE.md`, B-26.

## 2026-11-05: Animal Game request
- Max: both girls love the family "Animal Game" (someone shouts an animal, they act it out). Wants it as an activity: press Start, a new animal every 20 seconds, with categories (easy ones: frogs, elephants, dogs, cats). Make it fun. Status: built (`AnimalGame.tsx`), awaiting play.
