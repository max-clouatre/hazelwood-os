# hazelwood-os

An offline, touch-first learning and play space for Hazel (7) and Violet (3), built as an installable PWA for an old Samsung Galaxy Tab A. Inspired by [Greia](https://github.com/frozenpepper/Greia) (MPL-2.0). No Greia name, art, or audio is used; all art here is emoji or original.

**Live:** https://max-clouatre.github.io/hazelwood-os/ · **Setup guide:** open `guide.html`

## What's in it
| Who | Activities |
| --- | --- |
| Violet (3) | **Animal Game** (act like the animal that is shouted every 20 s, 7 categories), **Count Friends** (touch to count cats, unicorns, puppies; later "pick exactly N"), **Letter Pals** (find the letter; later "what does this start with?"), **Trace It** (finger-trace letters and numbers), **Coloring Book**, Sparkle Paint, My Stickers |
| Hazel (7) | **Animal Game**, **Hazelwild** (creature collecting: explore, catch, name, evolve, duel), **Spelling Unicorn** (editable list, repeats missed words, rainbow every 5 words), **Sink or Float?** (22 items, streak bonus), **Magnet Mystery**, **Color Lab** (mix potions incl. pastels, hints), **Color by Number**, Sparkle Paint (rainbow brush, sizes, undo), My Stickers |

- **Coloring (same 8 original pictures: unicorn, kitty, puppy, castle, butterfly, flowers, rocket, rainbow):**
  - *Violet* gets the free **Coloring Book**: pick any of 12 colors (spoken aloud) and tap a shape. Finishing a page gives a star.
  - *Hazel* gets **Color by Number**: every shape shows a number, a numbered color key matches them, and shapes of the chosen number glow pale yellow. A wrong tap says which number that shape is. Finishing a picture gives 2 stars.
  - Progress is saved per child. Art and number keys live in `app/src/coloring/pages.ts`; the number placement is computed at runtime, so a new page only needs shapes and a number for each shape.
- **Hazelwild:** Hazel's creature-collection game. 38 procedurally drawn species (each a recognizable animal: fox, otter, owl, panda, narwhal, axolotl...) in 6 **families** (Sproutkin, Tidefolk, Emberkin, Dawnkin, Duskkin, Skykin). Every creature grows through 3 forms, getting visibly more complex each time, and its **final form branches**: day foods (🍯🥕) make a **Sunlit** form, night foods (🍪🍬) a **Moonlit** form (152 forms to discover), plus special colors: ✨ shiny and 🌟 golden, ⚡ storm, 🌑 shadow, 🍂 autumn. Also: 5 biomes, a timing-ring catch game, shiny variants, a family-grouped Wilddex with badges, a home meadow where friends wander, eggs that hatch from ⭐ stars earned elsewhere, a Daily Visitor, daily goals, and friendly element duels. **Berries** come from stars (3 each), a berry bush in every biome, the Wishing Tree, daily goals, duels and badges; tap the 🍓 counter anywhere in the game for a guide. Design notes: `project/DESIGN-HAZELWILD.md`.
- **Game modes and Camp (beta):** each zone has mode tabs. **Explore** is the main game. **Camp** is an idle mode: friends work and make ✨ Glow (even while the tablet is off, up to a cap), and Glow buys camp upgrades and **training levels (Lv 1-10)** for friends. Catching duplicates earns **Species Mastery ★** (3, 8, 20, 50, 100 catches), which makes that species work faster; every ⭐ from other activities gives a **Star Boost**. Camp can be switched off in the Grown-up area. Plan and next phases: `project/PLAN-INCREMENTAL.md`; all balance numbers: `app/src/wilds/camp.ts`.
- **Music:** generative songs per zone, a calm menu theme and a duel theme, synthesized live (no audio files). Audition them at `#music` after the address.
- **Updating the tablet:** Grown-up area (⚙️ Grown-ups on the profile screen, or long-press the title) → *Check for updates*.
- **Rewards:** every star counts toward the next sticker (one per 5 stars, 24 per child), with a "New sticker!" celebration.
- **Voices** use the tablet's built-in text-to-speech. Stars, stickers and the spelling list are saved on the device (`localStorage`); nothing leaves the tablet.
- **Grown-up area:** press and hold the "Who is playing?" title for 1.5 seconds, then answer the multiplication question. There you can set a daily play limit per child (a gentle break screen appears when it's reached), edit Hazel's spelling list, see which words she needs again, and reset progress.

## Look and feel
Flat color, bold ink outlines and hard offset shadows (no gradients), one rounded font (Fredoka, bundled so it works offline), and layouts checked at phone, tablet and landscape sizes. The global style lives in `app/src/index.css` and the palette in `app/tailwind.config.js`.

## Working on this project (humans and Claude)
This repo is run as a **delivery factory with durable state**. Start with:
- `CLAUDE.md`: the rules and the 8-station loop (intake, triage, plan, build, verify, ship, record, report).
- `STATE.md`: where we are and what to do next ("Resume here").
- `project/`: `BACKLOG.md`, `FEEDBACK.md` (Max's play-test notes), `DECISIONS.md`, `CHANGELOG.md`, `REQUIREMENTS.md`, `ENVIRONMENT.md`, design docs.
- `tests/`: Playwright end-to-end suite (`npm run test:e2e` from `app/`). `.claude/`: hooks and slash commands (`/resume`, `/ship`, `/log-feedback`, `/new-mode`).

## Layout
- `app/`: source (Vite + React + TypeScript + Tailwind 3, `vite-plugin-pwa`).
- `docs/`: **built output**, committed so GitHub Pages can serve `main` + `/docs`. Never edit by hand.
- `tests/`, `scripts/harness.js`, `.claude/`, `project/`: the factory (see above).
- `guide.html`: beginner guide for hosting, installing, testing, pinning, and updating.
- `tools/make_icons.py`: regenerates the placeholder icons (needs Pillow).

## Develop
```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then writes the PWA to ../docs
```
Commit the regenerated `docs/` and push to `main`; Pages republishes in about a minute. The service worker is generated with auto-update, so no manual version bump is needed.

## Add an activity
Create a component in `app/src/activities/`, add an entry to `registry.ts` (title, emoji, which profiles). It receives `{ profile }`. Use `addStar(profile)` to reward, `say()` for speech, and `chime()`/`oops()` for sounds.
