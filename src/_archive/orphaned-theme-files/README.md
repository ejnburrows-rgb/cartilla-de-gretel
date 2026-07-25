# Orphaned theme files (archived 2026-07-25, issue #348)

`design-system.css` and `themes.css` were moved here from `src/styles/`.

## Why

The phase-0 audit for the book-realism refresh (#336) established that **neither file
is imported anywhere** — not by `src/main.tsx`, not by any component, not by
`index.html`. They never loaded in the running app, so the "competing palettes"
they appeared to define (`#c98c4f` tan, an alternate token set) were never
actually in effect.

Re-verified before archiving: a repo-wide search for `design-system.css`,
`styles/themes.css` and `themes.css` outside `src/_archive/` returns nothing.

Keeping dead stylesheets next to the live one is a trap — the next person to
search for a colour token finds three definitions and has to work out which one
the browser actually sees.

## What is still live

**`src/styles.css` is the single source of truth** for the palette and for the
theme modes. It carries the warm book palette (orange `#d4541a`, green
`#2a7d4f`, gold `#e8a820`), the `.dark` theme, and the `html.a11y-*`
accessibility modes. It was **not touched** by this archival.

Note that `themes.css` also contained the only `@font-face` for OpenDyslexic —
that was already fixed in #337, which moved the real declaration into the live
`styles.css`. Nothing here is still needed.

## Restoring

These are moved, not deleted (repo convention: never delete, archive). If a
token in here is ever wanted, copy it into `src/styles.css` rather than
re-importing these files, so there stays exactly one live palette.
