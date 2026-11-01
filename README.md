# hazelwood-os

An offline, touch-first learning and play space for Hazel (7) and Violet (3), built as an installable PWA for an old Samsung Galaxy Tab A. Inspired by [Greia](https://github.com/frozenpepper/Greia) (MPL-2.0). No Greia name, art, or audio is used; all art here is emoji or original.

**Live:** https://max-clouatre.github.io/hazelwood-os/ · **Setup guide:** open `guide.html`

## What's in it
| Who | Activity |
| --- | --- |
| Violet | Count Friends (tap to count cats, unicorns, puppies), Letter Pals (find the letter, letter + picture + voice), Sparkle Paint |
| Hazel | Spelling Unicorn (spelling list, editable), Sink or Float? (science), Color Lab (mixing colors), Sparkle Paint |

Voices use the tablet's built-in text-to-speech. Stars and the spelling list are saved on the device (`localStorage`); nothing leaves the tablet.

**Edit Hazel's spelling list:** open Spelling Unicorn and press and hold the faint ⚙️ in the bottom right for 1.5 seconds.

## Layout
- `app/`: source (Vite + React + TypeScript + Tailwind 3, `vite-plugin-pwa`).
- `docs/`: **built output**, committed so GitHub Pages can serve `main` + `/docs`. Never edit by hand.
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
