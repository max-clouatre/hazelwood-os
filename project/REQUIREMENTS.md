# Standing requirements and preferences (from Max)

Keep these true in every change. Add new ones as they appear.

## Who and where
- Users: **Hazel (7, 2nd grade; loves unicorns, science experiments, spelling; loves creature-collection games, especially evolving them from simple to complex)** and **Violet (3; loves puppies, cats, unicorns; learning letters and numbers)**.
- Device: old Samsung Galaxy Tab A, Android 11, old Chrome (below 88), screen-pinned. Max tests on his phone. He is a full-stack developer (TypeScript, React, Tailwind, Python, AWS), so technical detail is fine; **tablet setup steps must be spelled out**.

## Product
- Fully **offline**, nothing leaves the device, no accounts, no ads, no purchases.
- **Core loop first**: finding and catching new creatures is what Hazel loves. New ideas are experiments (modes) behind switches.
- Learning stays connected: stars from learning activities feed the creature game. Spelling words come from Hazel's school list (editable).
- It should feel like "the only app they use" (an OS-like home; kiosk wrapper is a later idea).
- Parent controls: gate (math question), daily limits per child, spelling list, switches for experiments, update button, diagnostics.
- **Clear, not confusing**: what she just got must be shown right where she tapped; berries must have obvious ways to earn them; info screens must be easy to read.
- Mystery and discovery are valued (unknown creatures, ??? tiles).
- Names should be close to the real animal (Foxy, Otty), not made-up mashups.
- Variety: more creatures, forms, special colors.

## Look and feel
- **No "AI slop gradient look".** Flat color, bold outlines, intentional, themed per zone. Music per zone. Different icons per zone. Eventually richer (3D) graphics, but only if the old tablet can run them.
- Original art only. **No Greia name, logo, art or audio.**

## How Max wants to work with Claude
- "This is your game to grow, do everything you see fit." Take initiative, but keep the core loop safe.
- **Be honest** about what was and was not verified. Ask for a photo or specific observation when stuck.
- Deliver to `main` (the live site) each time; he updates the tablet himself.
- Keep project state durable in the repo so any session can continue (this harness).
