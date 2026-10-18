# Lesson 12 (Ll) wide cream-paper redesign — proof set (2026-10-18)

Scope: Student Workbook printed pages 39–42 only, delivered in draft PR branch
`muse/lesson-12-wide-20261018`. Nothing merged, nothing deployed, no generated
art or voice, no changes to any other lesson, the shared kernel,
`lesson-meta.ts`, `consonants.json`, or `page-layouts.json`. Lesson 3 is
locked and untouched.

## What to reproduce

Run the app and the committed capture script:

```sh
pnpm dev:worker                 # or any dev server on BASE_URL
BASE_URL=http://localhost:5173 \
node scripts/capture-lesson-12-wide.mjs
```

It writes 12 PNGs (4 printed pages × 3 viewports: 390×844, 844×390,
1366×900) plus `capture-summary.json` into this folder.

**PNGs are intentionally not committed** (binary-safe commit rule: binary PNG
pushes through the GitHub tooling corrupt files). They are delivered as session
attachments in the agent report instead. The committed script is the
reproducible generator of the exact proof set.

## Pages captured

| Printed page | What the wide design shows |
| --- | --- |
| 39 | Handwriting: teal model letters, teal-glow writing lines + draw paper, garden-palette instruction letters on the teal instruction line |
| 40 | Circle page: 5 teal syllable groups (la/le/li/lo/lu) side-by-side on wide paper, pencil-circle word tiles |
| 41 | Letter page: Ll letter card at the LEFT edge, garden-palette syllable chips, vocabulary grid, printed sight word "también", reading-sentences box |
| 42 | Completa: teal-glow fill-in word boxes, lined sentence-writing paper |

## Design notes

- Cream paper `#faf2df`, slim (~4.5%) teal spine, teal instruction line
  `#0d9488`, garden-palette instruction letters (leaf/rose/sun/sky/lavender),
  teal glow around every exercise box. All CSS is scoped to `.lc-lesson-12`
  (applied to the lesson shell by `-leccion-view.tsx` only when the lesson
  number is 12); the shared fit-to-screen system still sizes the page.
- The pencil marks stay the approved pencil circle / tap-and-X; every page
  block rises into place from page load (`prefers-reduced-motion` disables it).
- Printed pages 39–42 contain **no picture regions** (verified in
  `page-layouts.json` — no `illustrationSrc` on any of them), so the wide
  design's boxed-picture and moving-picture rules have nothing to attach to in
  this lesson; the owner-approved `LivingIllustration` motion is untouched and
  no art was invented.
