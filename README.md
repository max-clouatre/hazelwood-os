# hazelwood-os

An offline, touch-first learning and play space for Hazel (7) and Violet (3), built as an installable PWA for an old Samsung Galaxy Tab A. Inspired by [Greia](https://github.com/frozenpepper/Greia) (MPL-2.0). No Greia name, art, or audio is used; all art here is emoji or original.

**Live:** https://max-clouatre.github.io/hazelwood-os/ · **Setup guide:** open `guide.html`

## What's in it
| Who | Activities |
| --- | --- |
| Violet (3) | **Count Friends** (touch to count cats, unicorns, puppies; later "pick exactly N"), **Letter Pals** (find the letter; later "what does this start with?"), **Trace It** (finger-trace letters and numbers), **Coloring Book**, Sparkle Paint, My Stickers |
| Hazel (7) | **Spelling Unicorn** (editable list, repeats missed words, rainbow every 5 words), **Sink or Float?** (22 items, streak bonus), **Magnet Mystery**, **Color Lab** (mix potions incl. pastels, hints), **Coloring Book**, Sparkle Paint (rainbow brush, sizes, undo), My Stickers |

- **Coloring Book:** 8 original line-art pictures (unicorn, kitty, puppy, castle, butterfly, flowers, rocket, rainbow). Tap a shape to fill it; the color name is spoken. Each girl's colored pages are saved, and finishing a page earns a star. Art lives in `app/src/coloring/pages.ts` (shapes are generated from small helpers, so adding a page is a few lines).
- **Rewards:** every star counts toward the next sticker (one per 5 stars, 24 per child), with a "New sticker!" celebration.
- **Voices** use the tablet's built-in text-to-speech. Stars, stickers and the spelling list are saved on the device (`localStorage`); nothing leaves the tablet.
- **Grown-up area:** press and hold the "Who is playing?" title for 1.5 seconds, then answer the multiplication question. There you can set a daily play limit per child (a gentle break screen appears when it's reached), edit Hazel's spelling list, see which words she needs again, and reset progress.

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
