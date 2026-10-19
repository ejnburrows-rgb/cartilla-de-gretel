# Lesson 14 (Ññ) wide cream-paper redesign — proof set (2026-10-18)

Scope: Student Workbook pages 47–50 only, delivered in draft PR branch
`lesson-14-wide-20261018`. Nothing merged, nothing deployed, no generated art
or voice, no changes to any other lesson, the shared kernel, `lesson-meta.ts`,
`consonants.json`, or `page-layouts.json`.

## What to reproduce

Run the app and the committed capture script:

```sh
pnpm dev:worker                 # or any dev server on BASE_URL
BASE_URL=http://localhost:5173 \
CHROMIUM_PATH=/usr/bin/chromium \
node scripts/capture-lesson-14-wide.mjs
```

It writes 12 PNGs (4 printed pages × 3 viewports: 390×844, 844×390,
1366×900) plus `capture-summary.json` into this folder.

**PNGs are intentionally not committed** (binary-safe commit rule: binary PNG
pushes through the GitHub tooling corrupt files). They are delivered as session
attachments in the agent report instead. The committed script is the
reproducible generator of the exact proof set.

## Pages captured

| Printed page | Archetype (workbook-archetypes.ts) | What the wide design shows |
| --- | --- | --- |
| 47 | Handwriting/tracing + open drawing | Cream paper, slim teal spine, teal-glow tracing + draw boxes, single-teal instruction |
| 48 | Syllable recognition / circle | 5 teal syllable groups with pencil-circle words (2 rows × 3), glow boxes, side-by-side groups on wide screens |
| 49 | Phonics / reading practice | Ññ letter card at the LEFT edge, garden-palette syllable chips, vocabulary grid, reading-sentences box, printed sight word "del" |
| 50 | Complete-the-word + sentence writing | Glowing fill-in word boxes + choices, sentence-writing box with the bottom edge on screen |

Lesson 14 printed pages 47–50 are all present in the source scan (no pages
skipped). None of the four pages contains pictures in the printed source, so the
picture rules of the wide design (moving pictures, picture boxes, 4×2 circle
grids) have nothing to attach to in this lesson; no art was invented.