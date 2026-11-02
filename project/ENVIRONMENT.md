# Environment facts and gotchas

## Devices
- **Family tablet:** Samsung Galaxy Tab A, Android 11, Chrome older than 88 (no `:where()`, no `aspect-ratio`, no `Array.at`, maybe no `inset`). Pinned with Samsung "Pin windows". The app is installed from Chrome (Add to Home screen, Install). The tablet's own TTS engine speaks (Max switched it to Google Speech Services).
- **Max's phone:** modern Chrome, used to test.
- Hosting: GitHub Pages, branch `main`, folder `/docs`. Public repo `max-clouatre/hazelwood-os`.

## Claude cloud sandbox
- Working copy at `/home/user/obviously` (the repo was renamed on GitHub; folder name unchanged). Git pushes work through a proxy; the GitHub MCP tools may be partly unavailable. Create a PR only if asked.
- **Cannot reach github.io** (outbound proxy): the live site cannot be checked from here.
- **Playwright + Chromium are preinstalled globally** (`require('playwright')` works anywhere). Do not run `playwright install`.
- Node 22, npm 10, Python 3 with Pillow (used by `tools/make_icons.py`).
- `app/node_modules` must be installed with `cd app && npm install` in a fresh clone.

## Command gotchas (each one cost time once)
- **`pkill -f "text"` kills its own shell** if the command line contains `text`. Do not use `pkill -f` with a pattern that appears in the same command; start servers with `setsid nohup <cmd> > /dev/null 2>&1 < /dev/null &` and stop them by pid file if needed.
- Foreground tool calls time out (default 2 min, max 10). Run long jobs in the background writing to a log (`tests/out/*.log`) and poll.
- Do not `cat > file` without a heredoc (it waits on stdin forever).
- A `sleep` of a minute or more is blocked: use a background run and poll.
- A service worker serves cached CSS/JS on reload, hiding changes you route/rewrite in tests: use `serviceWorkers: 'block'` in the Playwright context when rewriting responses.
- `rm` of root-level paths is blocked by a safety check; keep scratch files in `tests/out/` or the session scratchpad.
- Test screenshots go to `tests/out/shots/` (git-ignored). Look at them.
- Tests must not modify `docs/`. The update test builds into a temp folder with `--outDir`.

## Reproducing the old tablet browser in tests
Rewrite CSS so Tailwind's `:where()` button rule is unreadable (see `tests/e2e/old-chrome.js`), delete/trap `Array.prototype.at`, block service workers. This is how the gray-box and Friends-crash bugs were reproduced.
