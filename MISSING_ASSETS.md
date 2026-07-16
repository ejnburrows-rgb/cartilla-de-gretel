# Missing Assets Audit

## RECOVERED
- `public/cartilla/art/faithful/leccion-1/ojos.webp`
  - Source blob: `cf0d6c7d4792d6d9154102f29b8e08b4dd706275`
  - Source commit: Historic blob (previously added to git history)
  - Processing performed: Extracted exact original blob, verified visually as green eyes.
  - **2026-07-16 update:** this recovery was documented here but the file was
    never actually re-materialized on disk, and `manifest.json`/`page-layouts.json`
    still pointed at a different, bad stub file (`vocal-o/ojos.webp`, 780 bytes,
    visually near-blank). Re-extracted the same blob, placed it at this path,
    corrected `manifest.json`'s `src`, and wired it into all 4 real slot
    instances (student workbook pages 1, 4, 5, 7). Verified live in-browser.

- `public/cartilla/art/faithful/leccion-1/oruga.webp`
  - Source blob: `8941582b380f7b0e8204c593e3d04b60192b18cf`
  - Source commit: Historic blob (from `vocal-o/oruga.webp`)
  - Processing performed: Copied from already-recovered `vocal-o/oruga.webp` (visually confirmed caterpillar).
  - **2026-07-16 update:** `vocal-o/oruga.webp` is on disk and real; wired it
    into the one real empty slot instance that needed it (student workbook
    page 7). Verified live in-browser.

## STILL PENDING despite existing on-disk files — bad crops, not wiring gaps
A 2026-07-16 pass found 30 empty illustration-slot instances (17 unique words)
across the student workbook. `manifest.json` metadata suggested most already
had usable art; direct visual inspection of every candidate file (not just
byte-size/existence checks) found most were unusable:
- **Wrong content entirely**: `leccion-1/libro.webp` (a letter/grid fragment,
  not a book — matches this doc's own earlier REJECTED-CANDIDATES note),
  `leccion-1/dulce.webp` (mirrored instruction text, not candy — also matches
  an earlier REJECTED-CANDIDATES note), `extracted/pajaro.webp` (a coat, not
  a bird — also previously rejected).
- **Blank/near-blank stubs** (well under any usable size): `vocal-i/igual.webp`
  (72b), `vocal-i/iguana.webp` (352b), `leccion-1/globo.webp` (608b, thin line
  fragment), `vocal-a/ardilla.webp` (898b, partial shape fragment).
- **Washed-out / uncolored, shape-recognizable but not real color art**:
  `leccion-1/manzana.webp` (gray, not red), `leccion-1/pera.webp` (pale,
  nearly white), `leccion-1/pajaro.webp` (grayscale sketch), `vocal-a/arbol.webp`
  (partial gray sketch), `vocal-e/erizo.webp` (tiny partial texture crop).
  A cleaner `extracted/manzana.webp` git-history blob exists but is still
  gray, not red — same verdict.
- **Real art exists but isn't a clean single-item crop**: `extracted/arbol.webp`,
  `extracted/ardilla.webp`, and `extracted/iguana.webp` are all an identical
  187×175 crop window from what looks like a shared sprite sheet — each shows
  the right subject plus 2-3 unrelated neighboring items bleeding into frame.
  Wiring these as-is would show a jumbled multi-item image in a single-item
  slot. Needs an actual re-crop (out of scope for a wiring-only pass — this is
  new art-extraction work, not a JSON fix).
- **Borderline, held back on the project's own quality gate**: a cleaner
  `extracted/taza.webp` git-history blob (1050 bytes) is visually a real,
  correctly-shaped mug crop, but falls under the 1500-byte "stub" floor this
  repo's own `validate-content.mjs` / `art-slots-integrity.test.ts` enforce.
  Not overridden here on a single visual judgment call — flagged for a human
  or a follow-up pass to explicitly bless (raise the floor for this one file,
  or accept a slightly-under-floor real crop) rather than silently bypassed.

All of the above stay showing the honest "ilustración pendiente" placeholder.

- `public/cartilla/art/faithful/leccion-22-g-j/gato.webp`
  - Source blob: `fdc667d1e8b14be65b1b465177614b6bfe356cd9`
  - Source commit: Historic blob (from `leccion-19-g/gato.webp`)
  - Processing performed: Extracted exact original blob, verified visually as color illustration of two cats.

## PENDING — NO VERIFIED SOURCE FOUND
- `public/cartilla/art/faithful/leccion-1/abeja.webp`
  - Locations searched: Git history blobs for `abeja.webp`, `abeja.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-18-c/caballo.webp`
  - Locations searched: Git history blobs for `caballo.webp`, `caballo.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-18-c/cama.webp`
  - Locations searched: Git history blobs for `cama.webp`, `cama.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-19-ch/chaleco.webp`
  - Locations searched: Git history blobs for `chaleco.webp`, `chaleco.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-19-ch/chile.webp`
  - Locations searched: Git history blobs for `chile.webp`, `chile.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-20-f/fila.webp`
  - Locations searched: Git history blobs for `fila.webp`, `fila.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-21-y-ll/llanta.webp`
  - Locations searched: Git history blobs for `llanta.webp`, `llanta.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-21-y-ll/llave.webp`
  - Locations searched: Git history blobs for `llave.webp`, `llave.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-22-g-j/gota.webp`
  - Locations searched: Git history blobs for `gota.webp`, `gota.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-23-h-z/hielo.webp`
  - Locations searched: Git history blobs for `hielo.webp`, `hielo.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-23-h-z/hoja.webp`
  - Locations searched: Git history blobs for `hoja.webp`, `hoja.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-24-k-w-x/kiwi.webp`
  - Locations searched: Git history blobs for `kiwi.webp`, `kiwi.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-24-k-w-x/koala.webp`
  - Locations searched: Git history blobs for `koala.webp`, `koala.png`, `hd` and `raw` folders.

## REJECTED CANDIDATES
- `leccion-1/carro.webp`
  - Rejection reason: Candidate blobs are either a stock vector image or a fragment showing '9' and 'e', not the faithful scan.
- `leccion-1/casa.webp`
  - Rejection reason: Candidate blobs show letters 'ca', 'co', 'CO', 'CU' or a man with a rake, not a house.
- `leccion-1/dulce.webp`
  - Rejection reason: Candidate blobs show the text "Lección" and a blank space.
- `leccion-1/iglesia.webp`
  - Rejection reason: Candidate blobs show a fragment of a roof in black-and-white.
- `leccion-1/libro.webp`
  - Rejection reason: Candidate blobs show a grayscale book, not the faithful color scan.
- `leccion-1/pajaro.webp`
  - Rejection reason: Candidate blobs show a bear with a bee, or a uniform suit.
