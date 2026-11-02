# Tests

End-to-end tests drive the **built app** (`docs/`) in a real Chromium with Playwright, the way a child would: tapping, dragging, opening screens.
They are the quality gate in `CLAUDE.md` section 3. They cannot judge beauty or clarity, so **also look at the screenshots**.

```bash
cd app
npm run build              # tests run against docs/, so rebuild first (or use: npm run verify)
npm run test:e2e           # fast suite, about 3 minutes
npm run test:e2e:full      # all tests, about 12 minutes
node ../tests/run.js --only=camp,music     # pick files
```
Output: pass/fail lines, a summary, screenshots in `tests/out/shots/` (git-ignored), exit code 1 on any failure.
Needs Playwright with Chromium. In the Claude cloud sandbox it is preinstalled. Locally: `npm i -D playwright && npx playwright install chromium` (run from `app/`).

| File | Proves |
| --- | --- |
| `layout.js` | every screen of every activity fits phone and tablet, for both kids, no console errors (`FULL=1` adds two more sizes) |
| `old-chrome.js` | **regression**: simulated old tablet browser (no `:where()`, no `Array.at`): no gray button faces, Friends screen opens |
| `mystery.js` | creatures are a shadow with ??? until caught; Wild of the Day and Wilddex hints |
| `creatures-ui.js` | pop-ups at the tap, 38 species, renamed friends, info screens, variants, phone layout |
| `camp.js` | Camp idle math checked by hand (59 = 1.98/min x 30 min), Star Boost, 60 minute cap, training, upgrades, Mastery stars, Grown-up switch, a real star from another activity makes a boost |
| `update.js` | builds two versions into a temp folder; the Grown-up button installs the new one, keeps progress |
| `music.js` | every song renders audibly without clipping; switching songs live has no errors |
| `catch-flow.js` | starter, explore, timed throw, catch, reveal |
| `progression.js` | evolution to Sunlit and Moonlit, badges, goals, berry guide, eggs, legend, phone layout |
| `color-by-number.js` | wrong tap never fills; completing pays 2 stars |
| `duel.js` | a duel plays to the end |

## Writing a test
Create `tests/e2e/<name>.js`, print `PASS ...` / `FAIL ...` lines, add it to `TESTS` in `tests/run.js`. Use the helpers in `tests/lib.js`
(`BASE`, `OUT`, `ok`, `owned(...)`, `wildsState(...)` to seed a save in `localStorage["hwos:v1"]`). Tests must not change `docs/`.
For a bug: reproduce it, make the test fail, fix, make it pass.
**Simulate the tablet** with `serviceWorkers: 'block'`, a `page.route` rewrite of the CSS, and an init script that removes `Array.prototype.at` (see `old-chrome.js`).
