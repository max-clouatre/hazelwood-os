---
description: Capture playtest feedback durably, then triage it into the backlog
---
The user's message is feedback from a play session (or a new request). Do this first, before building:

1. Append a dated entry to `project/FEEDBACK.md`: who/what, their words (keep the meaning, trim only filler), and the screen or feature involved.
2. Triage each point into `project/BACKLOG.md` with an id, priority (P0 bug that blocks play, P1 requested, P2 idea) and a one-line acceptance test.
3. Reproduce bugs before fixing (write or extend a test in `tests/e2e/` so it cannot return). Note the root cause in `project/DECISIONS.md` if it teaches something lasting (like the old-Chrome rules).
4. Commit the records. Then ask or proceed according to what the user asked.
