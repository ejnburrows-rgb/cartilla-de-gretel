# Lesson 24 (Zz) — wide cream-paper redesign: capture instructions

Owner-approved wide cream-paper redesign for Lesson 24 (La consonante Zz),
printed pages 88–90 (pages 86–87 are not in the scan and are out of scope).

## What this is

- `scripts/capture-lesson-24-wide.mjs` reproduces the real-browser PNG proof
  for every Lesson 24 page at the three owner-required sizes:
  - phone portrait 390×844
  - phone landscape 844×390
  - desktop 1366×900
- Binary PNGs are **never committed** to GitHub (the connected GitHub write
  tools mangle binaries). Run the script locally; it writes the PNGs to
  `docs/proofs/lesson-24-wide-20261018/`.

## How to run

```bash
pnpm install
pnpm dev            # serves http://127.0.0.1:5173
node scripts/capture-lesson-24-wide.mjs
```

Environment overrides: `BASE_URL`, `OUT_DIR`, and `CHROMIUM_PATH`
(any Chromium/Chrome executable, used when the Playwright browser bundle is
not installed — for example `CHROMIUM_PATH=/usr/local/bin/chromium`).

Output per run: 9 screenshots named
`lesson-24-<printed-page>-<viewport>.png` plus `capture-summary.json`.

## Scope notes

- The script only seeds local browser storage so Lesson 24 is unlocked and
  its exercise pages count as complete — that lets the "Siguiente" button
  turn pages for capture. It does not modify app code, data, audio, or art.
- Design changes are scoped to the Lesson 24 student route
  (`data-lesson-n="24"` in `src/routes/cartilla/-leccion-view.tsx`, all rules
  in `src/styles/lesson-24-wide.css`). No shared kernel, data file
  (`lesson-meta.ts`, `consonants.json`, `page-layouts.json`), other lesson,
  or artwork/audio file is touched.
- Instruction lines render in a single teal; the pencil-circle and
  tap-and-X interaction behavior is unchanged.
