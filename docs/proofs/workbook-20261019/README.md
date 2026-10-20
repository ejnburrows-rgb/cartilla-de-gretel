# Workbook lane B proofs - lessons 9, 13, 15, 17, 18 (2026-10-19)

Branch: workbook/pages-B-20261019, rebased on workbook/pages-A-20261019 @ 3755f877 (full-width sideways rule + nav-clear).

## What changed
- src/styles/lesson-local/workbook-fill-lane-b.css - full-viewport fill rule for
  lessons 9/13/15/17/18, mirroring lane A's workbook-fill-1-7.css @ 3755f877:
  edge-to-edge page, cream bottom strip reserved for the nav buttons,
  full-width sideways with in-page vertical scroll at short landscape.
- src/styles/lesson-local/lesson-{9,13,15,17,18}-local.css - per-lesson fit
  rules (scoped by data-lesson + printed-page activity id): phone portrait
  390x844 renders every region in a two-column grid with nothing clipped.
  Short landscape 844x390 uses the shared fill rule (page scrolls, natural
  trace/draw sizes - no more shrunken trace letters).
- src/styles/lesson-local/index.css - imports the lane-B files.
- src/cartilla/interactions/__tests__/lesson-local-styles.test.ts - scoping
  invariants for the files above.

## Evidence
- after/<viewport>/lesson-<N>-page-<P>.png - every printed page of the five
  lessons at desktop 1440x900, tablet 1280x800, phone portrait 390x844 and
  phone landscape 844x390, shot on the real lesson route
  (/cartilla/leccion/N, pages opened via the learner-resume bookmark).
- after/_problems.txt - automated checks: horizontal overflow and page-number
  diamond per shot. Result: none ("OK").
- sidebyside/sbs-L<N>-p<P>-<viewport>.png - original book scan page next to
  the rendered digital page at desktop, portrait and landscape (60 composites).
- scripts/ - the exact screenshot and stitching scripts used.

## Status per page
All 20 pages (L9: 27-30, L13: 43-46, L15: 51-54, L17: 59-62, L18: 63-66):
rendered in the shared cream-paper design with garden-letter instruction
lines (lane A commits d7bf003 + 5159f0a), four page-type activities present
(trace-and-draw, syllable circle, keyword/reading, fill-in), no horizontal
overflow at any of the four viewports. PASS for fit and activity presence.

## Resolved since the previous round
- Short landscape: trace letters back to natural size; the page scrolls
  vertically inside the screen (lane A's 3755f877 pattern, mirrored).
- Nav buttons sit in a reserved cream strip under the page; page-number
  diamond and bottom-right content move clear of them on sideways phones.

## Resolved since the previous round (2)
- Desktop/tablet/portrait: the Dibuja "Listo" button no longer sits under
  the page-number diamond - the draw toolbar keeps 120px clear on the right
  (lane B's workbook-fill-lane-b.css).
- Short landscape: the page body keeps 120px clear on the right so
  instruction text, trace rows and toolbars never run under the nav arrows.

## Known open
- None in lane B scope.
All four viewports re-shot after the 3755f877 mirror; every shot passes
  the automated overflow checks ("OK").

## Not verified
- Full-repo typecheck/test/build output: see the lane report (runs in
  progress at push time); the lane's own test file passes 17/17 locally.

## 2026-10-20 full 10-lesson re-shoot (4401a425)
- `after2/`: 160 screenshots (40 pages x 4 viewports) via `scripts/shot-all.mjs`; script result OK: no horizontal overflow, page diamonds correct everywhere.
- `sidebyside2/`: 120 composites (original scan vs app; desktop / phone portrait / phone landscape) via `scripts/sidebyside.mjs`.
- Lane spec 32/32 green on 4401a425.
- Picture inventory: all 40 original scans checked (contact sheets); no subject pictures on any lane B page - nothing to prepare.
- Known cosmetic note: portrait escribe swatches stack vertically (Chrome zoom+flex percentage bug); all controls visible/tappable.
