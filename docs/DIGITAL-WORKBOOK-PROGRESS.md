# Born-digital Workbook migration

The colored reconstructed masters remain unchanged under
`public/cartilla/art/reconstructed/workbook/`. Only a page with
`digitalStatus: "verified"` in `src/data/page-layouts.json` uses the fixed
`FaithfulPageRenderer` on `/cartilla/cuaderno`; all other pages use the
reconstructed-image fallback.

## Verified pilot: printed page 2

- Reference: `page-002.png`, SHA-256
  `f91ca5395e17b841aa8e955a0f0c6541aea3aa88303a8dcf6d24d7cd8fe0af14`.
- Geometry measured from that master. The grid begins at normalized
  `(0.1439, 0.1820)` and retains all 20 cells in the original order and
  proportions. Live instructions, five live vowel letters, CSS rules, and
  live footer replace raster page furniture.
- Fifteen illustration crops come from the same locked master. This matters
  because at least one older `faithful` asset depicted different artwork.
- Desktop, tablet, and phone portrait kept the grid at the same normalized
  page position (observed x 0.145–0.146 and y 0.182–0.183). The page did
  not reflow or overflow horizontally. Visual comparison found the same
  artwork, order, margins, and grid structure with the scan border removed.
- Wrong and correct taps, Gretel feedback, horizontal controls, keyboard
  arrows, vertical page list, and fallback navigation were exercised locally.

## Prepared, awaiting visual QA: printed page 1

Twenty authentic illustration crops and measured geometry are recorded.
`digitalStatus` remains `batch-pending-visual-qa`, so production continues
to show its reconstructed master. Verify the live grid, instructions,
check action, Gretel placement, and three responsive sizes before promoting
this page to `verified`.

## Next batches

Convert 1–3 related pages at a time. For each page, derive region geometry
from its locked master, reuse its authentic artwork, render live rules and
text, compare the settled digital page with the reference at three viewport
sizes, exercise existing interactions, then set `digitalStatus` to
`verified`. Writing and drawing pages need a fixed-layout treatment of
their existing interactive components before promotion.
