# Orphaned flip engines (archived — book-realism refresh, 2026-07)

These three files were the *second* and *third* page-flip engines in the repo.
They were not rendered by any live route when the book-realism refresh landed:

- `BookPageFlip.tsx` — a `react-pageflip` reader. Only ever referenced by the
  already-archived `orphaned-student-subtree/BookReader.tsx`. The live student
  reader is `src/components/StudentBook/CurlPageViewer.tsx` (also
  `react-pageflip`), which supersedes it.
- `FlipBook.tsx` — a hand-rolled CSS `rotateY` flip built on `flipbook-3d.css`
  (1.5s turn, 2000px perspective). Nothing imported it.
- `flipbook-3d.css` — the stylesheet only `FlipBook.tsx` consumed. Its classes
  (`.book-single-page`, `.page-flip`, `.flip-chart-*`) had no other live user.

## Why archived, not deleted

Repo convention (AGENTS.md): retired code moves to `src/_archive/` with a note,
never deleted. `src/_archive/**` is excluded from `tsc`/build, so the broken
`@/`-relative imports inside these files are inert.

## What replaced them

- **Student reader:** `react-pageflip` via `CurlPageViewer` — 780ms turn,
  1300px perspective (`.workbook-container`), library-drawn page shadow,
  instant swap under `prefers-reduced-motion`.
- **Teacher flipchart:** the CSS engine kept in `src/styles.css`
  (`.flipchart-flip-wrapper`, top-hinged) driving `FlipchartHdPanel`.

If a future need for the hand-rolled CSS curl returns, restore from here.
