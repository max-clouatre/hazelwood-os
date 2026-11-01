# hazelwood-os (Play Pad MVP)

A tiny offline, touch-first learning/play app for an old Samsung tablet, in the spirit of [Greia](https://github.com/frozenpepper/Greia) but built as an installable PWA. No Greia name, art, or audio is used.

- `docs/`: the app (plain HTML/JS/canvas, no build step). Served by GitHub Pages from `/docs`.
  - `index.html`: tap for shapes and notes, drag to paint, color buttons, clear button
  - `manifest.webmanifest`, `sw.js`: installability and offline cache (bump `VERSION` in `sw.js` on every change)
- `guide.html`: beginner step-by-step guide to hosting, installing, testing, and screen-pinning on the tablet. Open it in a browser.
- `tools/make_icons.py`: regenerates the placeholder icons (needs Pillow).

Run locally: `cd docs && python3 -m http.server 8000`, then open <http://localhost:8000> (localhost counts as secure, so the service worker works).
