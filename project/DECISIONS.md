# Decisions (short ADRs, oldest first)

**D-01 Build our own PWA, not port Greia.** Greia is x86 Linux; the tablet is ARM Android with a locked bootloader. A web app installs from Chrome, works offline, and can be updated remotely. (2026-10-31)

**D-02 Host on GitHub Pages from `main` `/docs`; commit the build.** Free, no CI needed, `docs/` is generated. Repo made public because Pages on private repos costs money. (2026-11-01)

**D-03 Vite + React + TypeScript + Tailwind 3 + vite-plugin-pwa.** Tailwind 3 (not 4) for older browsers. **Lesson (2026-11-02):** even Tailwind 3 emits `:where()` rules that old Chrome drops (gray button faces). We re-write the important resets in plain CSS in `index.css` and test with a simulated old browser. See D-11.

**D-04 Everything offline, saved in `localStorage["hwos:v1"]`; no accounts, no network.** Privacy for kids and works without Wi-Fi. The only request is `version.json` for updates.

**D-05 Creatures are procedural SVG from species recipes** (`species.ts` + `Creature.tsx`). Gives unlimited variety, original art, no licensing, tiny size. Variants are palette transforms.

**D-06 Evolution = bond (feeding and petting), 3 forms at 14 and 40 points; the final form branches by food** (day foods give Sunlit, night foods give Moonlit). Hazel loves evolving; the branch makes feeding a real choice. Babies are visibly plainer than later forms ("simple to complex").

**D-07 Stars become berries (3:1) and a Star Boost; Camp makes a separate currency, Glow.** Keeps the learning-to-game link meaningful. Berries buy food, eggs, lures; Glow buys camp upgrades and training.

**D-08 Gentle mechanics.** Progress only goes up; idle gains are capped; no real-money purchases; the parent play-time limit applies to everything.

**D-09 Grown-up area behind a math gate**, reachable by long-pressing the title or the visible gear. Holds limits, spelling list, mode switches, update, diagnostics, reset.

**D-10 Flat look: ink outlines, hard offset shadows, Fredoka (bundled), no gradients.** Max disliked the gradient "AI slop" look. Gameplay icons are drawn SVG, not emoji, because emoji fonts differ per device.

**D-11 Target the old tablet browser (Chrome below 88).** Rules in `CLAUDE.md` section 4; shims in `lib/shims.ts`; `tests/e2e/old-chrome.js` simulates it. Root causes found so far: `Array.prototype.at` (Friends crash, Chrome 92+) and Tailwind's `:where()` button reset (gray boxes, Chrome 88+).

**D-12 Errors never blank the screen.** Error boundary around every activity and the root, crash log shown in the Grown-up area.

**D-13 Update mechanism:** each build writes `version.json` with a build id; the Grown-up button compares it with the installed id, updates the service worker, and reloads. Hard fallback "Refresh app files" clears caches but keeps saves. The tablet needs one manual update to get the first button.

**D-14 Music is generated live with Web Audio** (no audio files): per-zone tempo, scale, instruments; ducks under speech. Quality measured (levels), not heard by Claude.

**D-15 New loops are game modes** behind switches (`ModeTabs.tsx`, `Zone.tsx`, Grown-up "Game modes"). Explore stays default and must work with everything off.

**D-16 Deliver to `main` every time** (Max's request), plus the session branch. Never force-push, no pull requests unless asked.

**D-17 3D is deferred until a performance probe runs on the tablet (B-10).** Unknown GPU speed; a bad first impression would hurt more than flat art.

**D-18 Camp numbers** (rate 0.6 Glow/min base, forms x1/1.6/2.4, +12% per level, +15% per Mastery ★, x1.5 home zone, +10% per same-family worker up to 30%) are a first guess to tune from play (B-05). Mastery ★ at 3/8/20/50/100 catches.

**D-19 Creatures are a mystery until caught** (dark shadow, "???"). Wilddex reveals a species only after a catch; ??? tiles show where to look. Sparkling shadow hints at shiny, rare, or special-color creatures without naming them.

**D-20 The project is a delivery factory with durable state.** `CLAUDE.md` (rules), `STATE.md` (where we are), `project/*` (backlog, feedback, decisions, changelog), a Playwright suite in `tests/`, and hooks (`.claude/settings.json` + `scripts/harness.js`) that load state at session start and block finishing with unsaved work. (2026-11-02)

## D-21: one landing screen instead of Hub + Home (2026-11-02)
Max asked to merge them. The landing is her meadow with a chosen crew wandering (alive first, menus second); Today/Map/Crew are sheets over it so there is one place to be. Crew is saved as ids in `wilds.homeCrew` (default `[]` = auto top 5 by growth). Friends assigned to a Camp are not in the home crew, because they are visibly working elsewhere. Min 5 / max 10 keeps the meadow lively without crowding a small tablet.

## D-22: one music chain at a time (2026-11-02)
Overlap came from echo/feedback loops that were never disconnected, plus the song restarting on every catch. `makeChain` returns a handle whose `kill()` fades and disconnects every node; only one chain lives; the zone song keeps playing through a catch. Guard: `tests/e2e/music-switching.js`.

## D-23: Pixel meadow is a mode, with a cheap palette (2026-11-02)
Max liked a pixel-diorama prompt. Adopted: low-res render, fixed palette with ordered dither, depth outlines, iso camera. Not adopted: OKLab nearest-colour (a 64-iteration shader loop is a risk on the Tab A GPU, per-channel 8-step snapping costs nothing), CDN scripts (offline rule), big multi-agent contract (too heavy for one scene). It is behind a Grown-up switch, lazy-loaded, capped at 30 fps and degrades by itself (drop effects, then bigger pixels, and falls back to the flat meadow without WebGL). Creature sprites are meshed with visible faces only (about 3k triangles each) because instancing one cube per voxel was 6x heavier.
