# Missing Assets Audit

## RESOLVED 2026-07-17 — student-side "still gray" bug (root cause + fix)
Owner reported the student pages were still missing color after an earlier
pass (the pass below, dated 2026-07-16, only wired empty slots — it never
colored anything). Root-caused and fixed properly this time:

**What was wrong:** the book prints these pages in gray/teal duotone. There
is no color version of the book's own drawings anywhere in the repo. Two
distinct bugs existed on top of that:
1. 13 words (`manzana`, `libro`, `árbol`, `taza`, `pera`, `pájaro`, `globo`,
   `dulce`, `ola`, `ardilla`, `erizo`, `iguana`, `igual`) had **empty**
   `illustrationSrc` slots — these showed "ilustración pendiente".
2. A second, larger group had a **filled but still-gray** `illustrationSrc`
   (so they never showed as "pendiente" and were invisible to the earlier
   pass): `uniforme`, `iglú`, `abeja`, `aguja`, `escalera`, `escuela`,
   `maíz`, `arco`, `pez`, `remolino`, `niño`(via `niñito`), plus one
   consonant-lesson word (`vela`) that had a real color flipchart crop
   available but was never used.
3. Two of the gray-and-filled files (`vocal-e/escalera.webp`,
   `vocal-e/escuela.webp`) were not the book's drawings at all — one was an
   unrelated stock-photo-style ladder image, the other a generic clipart
   schoolhouse+kids graphic. Both replaced with real crops of the book's
   own drawings (student workbook page-010/012 grids), colored.
4. A third bug, found while tracing the above: several consonant-lesson
   vocab words in `consonants.json` / `page-layouts.json` (`tapa`, `tomate`,
   `tina`, `tulipán`, `dona`, `lobo`, `loro`, `vaca`, `vino`, `volcán`,
   `pino`, `bici`, `yegua`) had `illustrationSrc` pointing at crops that
   were either blank or showed unrelated handwriting-practice text — because
   **these words don't exist as pictures anywhere in this book at all**
   (verified by inspecting every real source page for lessons P/T/D/L/B/V/Y).
   Whoever built the vocab lists picked letter-appropriate words without
   checking they were actually illustrated in this specific book. Fix:
   removed the bad `illustrationSrc` so the app's existing emoji fallback
   renders instead of broken/wrong content — no invented art added.

**Fix applied:** cropped the real drawings from the HD workbook/flipchart
scans and added color while preserving the exact line art (never redrawn),
same technique as the 2026-07-16 recovery. All new/replaced files verified
live in-browser (Lección 1, Vocal A/E/I pages): 0 "ilustración pendiente"
placeholders, 0 gray-only real-word cells remaining on those pages.

Branch: `fix/student-art-color`.

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

**2026-07-20 correction:** the above described state as of 2026-07-16.
Re-verified against the current repo + the color-QA pass's `qa-results.json`
(committed 2026-07-19): 12 of these 13 words now have real, re-cropped,
PASS-graded, wired art — `libro`, `dulce`, `igual`, `iguana`, `ardilla`
(vocal-a), `manzana`, `pera`, `pajaro`, `erizo` (vocal-e), `taza`, `arbol`
are all wired and correct in `page-layouts.json`/`consonants.json` today.
Only **`globo`** (`leccion-1/globo.webp`) is still genuinely broken — it
QA-FAILed for a real paint-bleed defect (a stray red line across the top,
unrelated to the balloon) and was pulled from live use this session, so it
is back to showing the honest pendiente placeholder rather than the bad
crop.

**2026-07-20, page-layout gap batch:** worked the page-layout-only gap list
(`aguja`, `oruga`, `abrigo`, `globo`, `remolino`, `carro`, `guitarra`,
`galleta`, `faro`, `foca`, `fuente`, `zanahoria`). `carro` fixed — a real
PASS-graded crop (`leccion-1/carro.webp`) was sitting unused, now wired.
`guitarra`/`galleta`/`faro`/`foca`/`fuente`/`zanahoria` turned out not to be
art gaps at all — they only appear in text-only exercises (no picture-grid
cell, no `illustrationSrc` field in that schema). `abrigo`/`aguja`/`remolino`
have real grayscale book line art (exact page + crop box now documented in
`ART_BACKLOG.md`) but need coloring, not just wiring — out of scope for this
pass. `oruga` and `globo` still have no located clean source; see
`ART_BACKLOG.md`'s 2026-07-20 section for the full trail (including which
62 flipchart pages remain unchecked).

- `public/cartilla/art/faithful/leccion-22-g-j/gato.webp`
  - Source blob: `fdc667d1e8b14be65b1b465177614b6bfe356cd9`
  - Source commit: Historic blob (from `leccion-19-g/gato.webp`)
  - Processing performed: Extracted exact original blob, verified visually as color illustration of two cats.

## PENDING — NO VERIFIED SOURCE FOUND

**RESOLVED 2026-07-18, stale entry removed**: `leccion-1/abeja.webp` used to be
listed here, but "abeja" is live and correctly colored at a different path,
`public/cartilla/art/faithful/vocal-a/abeja.webp` (wired in `src/content/lessons.json`,
confirmed a real yellow/black bee visually and enforced by
`scripts/validate-art-color.mjs`'s color guard). This search list was for the
old `leccion-1/` path specifically and never got updated once the word moved —
same "documented as done ≠ verified against the live file" trap as everywhere
else in this project's history.

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
