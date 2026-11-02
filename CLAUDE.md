# CLAUDE.md: the Hazelwood OS delivery factory

Hazelwood OS is an **offline, touch-first learning and play app** for two children (Hazel, 7, and Violet, 3), built by their
parent Max (a full-stack developer) with Claude. It runs as an installable web app (PWA) on an old **Samsung Galaxy Tab A
(Android 11, an old Chrome, screen-pinned)**, and Max tests on his phone. Hazel's main game is **Hazelwild**, a creature-collection game.
Live: https://max-clouatre.github.io/hazelwood-os/ (GitHub Pages serves `main`, folder `/docs`).

This file is the operating manual. **Follow it every session.** The repo is the project's memory; chat is not.

---

## 0. Start of every session (non-negotiable)
1. Read `STATE.md`, especially **Resume here**. Then skim `project/BACKLOG.md` and the newest entries of `project/FEEDBACK.md`.
2. Run `git status -sb` and `git log --oneline -8`. Work on the branch you were assigned. If the tree is dirty, earlier work was not saved: look, then commit it.
3. (The SessionStart hook in `.claude/settings.json` prints this summary for you. `/resume` does it on demand.)
4. If the user's message is feedback from a play session, run `/log-feedback` **first**, then act on it.

## 1. The factory loop (every change passes all eight stations)
| Station | What you do | Artifact |
| --- | --- | --- |
| 1. INTAKE | Capture the user's words (feedback, ideas, bugs) | `project/FEEDBACK.md` |
| 2. TRIAGE | Turn them into backlog items with priority and an acceptance test | `project/BACKLOG.md` |
| 3. PLAN | For anything bigger than a fix, write the plan and the *why* before coding | `project/PLAN-*.md`, `project/DECISIONS.md` |
| 4. BUILD | Small steps in `app/src/` | code |
| 5. VERIFY | Typecheck, build, tests, and **look at screenshots** | `tests/e2e/`, `tests/out/shots/` |
| 6. SHIP | Commit with the rebuilt `docs/`, push the session branch and `main` | git |
| 7. RECORD | Update state files in the *same commit* | `STATE.md`, `project/CHANGELOG.md` |
| 8. REPORT | Tell the user what changed, how to get it, what was and was not verified | chat |

Bugs: **reproduce first**, then fix, then add a test that fails without the fix. (Example: the gray-box bug is reproduced and guarded by `tests/e2e/old-chrome.js`.)

## 2. Durable state rules (the harness)
- **Nothing important lives only in chat.** Decisions, user requirements, learned facts, promises, open questions go in files, committed with the work.
- Files and what each one holds:

| File | Holds | Update when |
| --- | --- | --- |
| `STATE.md` | Where we are: **Resume here**, what exists, how it fits together, known issues, unverified items | every session, always |
| `project/BACKLOG.md` | Open work with ids, priority, acceptance test | when work is added, started, finished |
| `project/FEEDBACK.md` | The user's play-session feedback and requests, dated, with status | the moment it arrives |
| `project/DECISIONS.md` | Why we chose things (short ADRs), including lessons from bugs | when a choice is non-obvious |
| `project/CHANGELOG.md` | One entry per delivery | every ship |
| `project/REQUIREMENTS.md` | Standing requirements and preferences from Max | when new ones appear |
| `project/ENVIRONMENT.md` | Sandbox and device facts, command gotchas | when learned |
| `project/PLAN-INCREMENTAL.md`, `project/DESIGN-HAZELWILD.md` | Design documents | when design changes |

- **Never end a session with unsaved work.** A *WIP commit* is fine if you are pausing for the user. Push the session branch every time.
- **Hooks enforce this**: the Stop hook (`scripts/harness.js stop`) blocks finishing if the tree is dirty, commits are unpushed, or `STATE.md` is older than the code. Set `HARNESS_OFF=1` to disable for a session. Do not work around it; fix the cause.
- Keep `STATE.md` honest and short enough to read in two minutes. Rewrite **Resume here** at the end of every session so a stranger can continue.

## 3. Definition of done (all must be true to ship)
1. `cd app && npm run build` passes (it typechecks first). `docs/` is rebuilt and committed (never hand-edit `docs/`).
2. `npm run test:e2e` passes (fast suite). Use `npm run test:e2e:full` for releases and for changes to shared code (store, Creature, styles, routing).
3. **UI changes were looked at**: open screenshots in `tests/out/shots/` at phone (390x844) and tablet (960x600). Tests cannot judge beauty or clarity.
4. New behavior has a test. A bug fix has a regression test.
5. Old saves still load (see section 4, saves).
6. `STATE.md`, `CHANGELOG.md`, `BACKLOG.md` updated in the same commit.
7. The report says what was verified and what was **not**.

## 4. Engineering rules for this codebase
**The target device is old.** The family tablet's Chrome is older than version 88, and probably older than 92.
- Do not use: `Array.prototype.at`, `replaceAll`, `Object.hasOwn`, `structuredClone`, CSS `:where()`/`:is()` in our own CSS, container queries, `color-mix`, `@property`, CSS nesting. `aspect-ratio` and `inset` need fallbacks (see the bottom of `app/src/index.css`). `app/src/lib/shims.ts` shims a few JS features.
- Tailwind v3's built-in `:where()` rules are dropped by old Chrome, which once gave **every button a gray box**. Base resets that matter are re-written in plain CSS in `index.css`. Do not delete them. `tests/e2e/old-chrome.js` simulates this browser; keep it green.
- Build target is `es2019`. Any new web API: check its Chrome version first; if above 87, add a fallback or avoid it.
- Wrap risky features in the error boundary (`components/ErrorBoundary.tsx` already wraps every activity). A crash must never leave a blank screen.

**Saves (a child's progress) are sacred.** Everything is in `localStorage["hwos:v1"]` (shape: `app/src/lib/store.ts`, `app/src/wilds/types.ts`).
- Every new field gets a default in `initialWilds`/`initial` so old saves load. Put migrations in `rollDay()` in `app/src/wilds/game.ts`. Never rename or remove saved fields without a migration.
- Test a change with an old-shaped save (see seeds in `tests/lib.js`).

**Offline and private.** No network calls except fetching `version.json` for updates. No accounts, ads, analytics, or external fonts/CDNs. Fonts are bundled.

**Kids first.**
- Gentle mechanics: progress only goes up, nothing is lost or punished, idle gains are capped, no timers that pressure, no purchases.
- Every ⭐ from the learning activities feeds the creature game (stars become berries and Star Boost). Keep that link.
- 3-year-old screens: big targets, voice, no reading required. 7-year-old: short, clear text.
- The parent gate (math question) and the daily play limit apply to everything. New experimental modes get a switch in the Grown-up area.
- No Greia name, art, or audio. Art is original: SVG drawn in code. No third-party creature names.

**Look.** Flat color, bold ink outlines, hard offset shadows, Fredoka font, palette tokens in `tailwind.config.js`. **No gradients, no glassy translucent cards, no AI-slop look.** Gameplay icons are drawn SVG (`wilds/Icons.tsx`), not emoji (emoji fonts vary by device). Creature art comes from `wilds/Creature.tsx` recipes; adding a species is a data entry in `wilds/species.ts`.

**Layout.** Check phone (390x844), tablet landscape (960x600), portrait (600x960), and small landscape (800x480). Nothing may overflow horizontally.

**Tuning numbers live in one table per system** (`wilds/camp.ts` `CAMP_TUNING`, `wilds/mastery.ts`, costs in `wilds/game.ts`). Do not scatter magic numbers.

**New experiments are modes**, not edits to the core loop. Explore stays the default and must work with every experiment off. Use `/new-mode`.

**Tests.** `tests/` is a Playwright suite (see `tests/README.md`). Add a test file to `tests/e2e/` and register it in `tests/run.js`. Test files print `PASS`/`FAIL` lines. Tests seed saves through `localStorage` and must not change `docs/`.

## 5. Delivery
- Work on the session branch you were given. **This repo deploys from `main`**; Max has asked for every delivered change to go to `main` too: `git push origin <session-branch> <session-branch>:main`. Never force-push. Never create a pull request unless asked.
- Commit messages: short imperative title, a body of what and why, then the attribution lines the session asks for.
- GitHub Pages republishes in about a minute. The family tablet updates through **Grown-up area > Check for updates** (built in; shows installed vs newest build). Say so in your report.
- You cannot reach github.io from the sandbox, so you cannot verify the live site. Say that, do not claim it.

## 6. Reporting style
Plain words, short. Lead with what changed and how to get it. Separate **verified** (tests, screenshots) from **not verified** (real tablet, how music sounds, how voices sound, real play balance). Never claim an unverified thing works. Ask Max for the specific observation you need (a photo of the screen helped solve the gray-box bug).

## 7. Environment gotchas
Read `project/ENVIRONMENT.md`. Top ones: never put `pkill -f "<text>"` in a command whose own text contains `<text>` (it kills itself); start servers with `setsid nohup ... &`; foreground tool calls time out at 2 to 10 minutes (use background runs and poll a log); the sandbox cannot reach github.io; Playwright and Chromium are preinstalled globally.
