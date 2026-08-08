# ChatGPT continuation — authentic workbook art repair

Read this immediately after `AGENTS.md`. Do not restart the audit from old
backlogs, generated-art folders, crop manifests, issues, or filenames.

## Repository state

- Repository: `ejnburrows-rgb/cartilla-de-gretel`
- Branch: `repair/authentic-flipchart-art`
- Draft PR: https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/399
- Base: `main`
- Production: untouched
- Authoritative evidence: `docs/AUTHENTIC-FLIPCHART-ART-AUDIT.md`

## The source fact that prevents another wasted audit

The official product contains a separate 62-page teacher flip chart and
92-page student book. The student book reinforces the flip chart, but not every
student distractor is repeated there in color. The two repository teacher sets
were machine-mapped 62/62 and are duplicate exports of the same complete flip
chart—not alternate editions or shuffled pages.

Use this order:

1. Exact student-workbook drawing identifies the cell.
2. Identical teacher drawing, when present, supplies authentic color.
3. If it is absent after the recorded exhaustive checks, use the exact lossless
   student-workbook crop.
4. Never generate, redraw, recolor, vectorize, use a look-alike, expose an answer
   word, or alter the page/activity.

## Complete focused mapping

| Drawing | Student pages | Source | Final asset |
|---|---|---|---|
| aro | 1, 7, 8 | teacher page 5 | `faithful/vocal-a/aro.webp` |
| iglú | 4, 5, 8, 10, 13, 14 | teacher page 7 | `faithful/vocal-i/iglu.webp` |
| abrigo | 1, 11 | workbook page 1 | `faithful/leccion-1/abrigo.webp` |
| globo | 2 | workbook page 2 | `faithful/leccion-1/globo.webp` |
| abeja | 1, 7, 8, 10, 11, 14, 16 | workbook page 7 | `faithful/vocal-a/abeja.webp` |
| oruga | 7 | workbook page 7 | `faithful/vocal-o/oruga.webp` |
| aguja | 7, 8, 10 | workbook page 7 | `faithful/vocal-a/aguja.webp` |

All 14 formerly blank cells for the five workbook-only drawings are wired in
`src/data/page-layouts.json`. Generated replacements remain inactive.

## Continuation prompt

```text
Use @GitHub and @Vercel. Inspect ejnburrows-rgb/cartilla-de-gretel branch
repair/authentic-flipchart-art and draft PR #399. Do not touch main or
production.

Read AGENTS.md first, then docs/AUTHENTIC-FLIPCHART-ART-AUDIT.md. Those files
override every older backlog, manifest, issue, and filename. Do not repeat the
already completed 62-page search.

Verify the branch build and browser-test the mapped workbook pages. Preserve
layout, interactions, hidden answers, curriculum, auth, database, and security.
Never generate or recolor lesson art.
```

An agent cannot see the user's remaining ChatGPT usage percentage. The branch,
PR, and these files preserve the exact state for continuation.
