# Page 1 natural motion (owner-approved 2026-10-06)

Builds the self-animated `*-alive.svg` pictures for Workbook Page 1:

- oso: breathes, blinks, the bee loops around its head (wings flutter)
- elefante: trunk swings, ears flap, both eyes blink
- oveja: blinks, ear flick
- abeja: wings flutter
- abanico: opens and closes slightly
- iman: sparks flicker
- olla: steam rises
- avion: nose propeller spins

Everything else on the page stays still. Under reduced motion the app shows the
original still drawing (`LivingIllustration` + `aliveSrc` in `src/lib/living-actor-registry.ts`).

Rebuild:

1. Extract the embedded PNG of each still SVG (`oso, elefante, oveja, abanico, avion, iman, olla`
   from `public/cartilla/art/optimized/workbook/leccion-1/`, `abeja` from
   `public/cartilla/art/faithful/leccion-1/wb-p1/`) to `$LIVING_SRC/<name>.png`.
2. `LIVING_SRC=/path/to/pngs python3 scripts/living-motion/all.py /path/to/out [names...]`
3. Copy `<name>-alive.svg` next to the still SVG.

Requires Python 3 with numpy, opencv-python-headless and Pillow.
