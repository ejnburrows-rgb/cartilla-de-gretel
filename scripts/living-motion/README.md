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

## Workbook vowel-review pages (Lessons 2–6)

The first page of Lessons 2–6 shows the faithful vowel pictures
(`public/cartilla/art/faithful/vocal-*/…webp`). Eight of them are the same drawings
as the approved Page 1 pictures (oso, elefante and abeja are mirrored), so they get
the same approved part motion, rebuilt for these scans in `wb_vowels.py`:

| name | still | motion |
| --- | --- | --- |
| vocal-o-oso | vocal-o/oso.webp | breathes, blinks, the bee's wings buzz (the bee stays put) |
| vocal-o-oveja | vocal-o/oveja.webp | blinks, ear flick |
| vocal-e-elefante | vocal-e/elefante.webp | trunk swings, ears flap, both eyes blink |
| vocal-a-abeja | vocal-a/abeja.webp | wings flutter |
| vocal-a-abanico | vocal-a/abanico.webp | the fan opens and closes slightly |
| vocal-i-iman | vocal-i/iman.webp | paper clips pulled to the poles, field lines flow, sparks |

Each Page 1 coordinate is carried over with a measured similarity transform
(`FITS` in `wb_vowels.py`: SIFT feature match + RANSAC, Page 1 still → vowel still).
The vowel still is embedded byte-for-byte (original WebP), never re-encoded, and
the motion maps are stored at 1/3 size (they are smooth, so this is lossless in
practice and keeps each file ~60–240 KB).

    python3 scripts/living-motion/build.py vocal-o-oso vocal-e-elefante   # etc.

### Redrawn Lesson 3 pictures (2026-10-17, picture PR #888)

The redrawn pictures are new drawings, so the old `FITS` do not apply. Their recipes
live in `redrawn_*.py` with coordinates measured on the new still (shared helpers in
`redrawn_common.py`); `all.py` imports them after `wb_vowels.py` so they win.

- `vocal-a-abanico`, `vocal-a-abeja`: rebuilt in `redrawn_vocal_a.py`.
- `vocal-o-oso`, `vocal-o-oveja`: rebuilt in `redrawn_vocal_o.py` (the old-bear
  `oso-blink.webp` swap is unlinked; the new bear blinks inside its rig).
- `vocal-o/olla.webp` stays **still**: the new pot has no steam drawn.
- `vocal-a/avion.webp` stays **still**: the new jet has no propeller and is painted
  on its own blue sky, so no part can move on its own.
