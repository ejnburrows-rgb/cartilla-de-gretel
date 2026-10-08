# Page 1 natural motion (owner-approved 2026-10-06)

Builds the self-animated `*-alive.svg` pictures for Workbook Page 1:

- oso: breathes, blinks, the bee loops around its head (wings flutter)
- elefante: trunk swings, ears flap, both eyes blink
- oveja: blinks, ear flick
- abeja: wings flutter
- abanico: opens and closes slightly
- iman: paper clips are pulled in and stick to the poles, field lines flow, sparks flicker
- olla: gray-blue steam curls rise above the lid
- avion: propeller spins, air streaks rush past, the whole plane gently glides

Everything else on the page stays still. Under reduced motion the app shows the
original still drawing (`LivingIllustration` + `aliveSrc` in `src/lib/living-actor-registry.ts`).

Rebuild (one command, from the repo root):

    python3 scripts/living-motion/build.py            # all pictures
    python3 scripts/living-motion/build.py iman olla  # just some

It reads each still picture, writes `<name>-alive.svg` next to it, and records the
still's fingerprint in `manifest.json`.

## When you replace a picture with new art

1. Put the new still picture in place (same file name), e.g. `.../leccion-1/olla.svg`
   (SVG with an embedded PNG, like the current ones).
2. The test `src/lib/__tests__/living-alive-freshness.test.ts` will now FAIL on purpose,
   naming the picture — so old motion is never left on top of new art.
3. Then either:
   - **Keep motion:** re-check the coordinates for that picture in `all.py` (where the
     propeller / lid / poles / ears sit in the new drawing), then run `build.py <name>`; or
   - **Show it still for now:** delete that picture's `aliveSrc` line in
     `src/lib/living-actor-registry.ts` and its entry in `manifest.json`.

New pictures (not in the list) need their own motion recipe in `all.py` and an
entry in `STILLS` in `build.py` before they can move.

Requires Python 3 with numpy, opencv-python-headless and Pillow.
