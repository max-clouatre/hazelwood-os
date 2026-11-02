---
description: Verify, record and deliver the current work (the SHIP and RECORD stations)
---
Deliver the current work. Do every step; stop and report if a gate fails.

1. **Gates:** `cd app && npm run build` (typecheck + build). Then `npm run test:e2e` (fast suite). For a big release or anything touching shared code, use `npm run test:e2e:full`. For UI changes, open the screenshots in `tests/out/shots/` and look at them at phone (390x844) and tablet (960x600) size. Fix failures; never weaken a test to pass.
2. **Record:** update `STATE.md` (Resume here, what exists, known issues, build id), `project/CHANGELOG.md` (one entry), `project/BACKLOG.md` (tick or add items), `project/DECISIONS.md` (any non-obvious choice), `project/FEEDBACK.md` (status of feedback addressed).
3. **Commit:** one commit with code, rebuilt `docs/`, and the records together. Message: short imperative title, a body of what and why, then the attribution lines the session asks for.
4. **Push:** the session branch, and `main` (this repo deploys from `main` /docs): `git push origin <session-branch> <session-branch>:main`. Never force-push.
5. **Report** to the user in plain words: what changed, how to get it (Grown-up area > Check for updates), what was verified, and what could NOT be verified (real tablet, audio quality, voices).
