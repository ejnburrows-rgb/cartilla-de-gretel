# Lesson 13 + 21 polish — proof (2026-10-18)

Branch: `lessons/13-21-polish`. Draft PR only, no merge.

## Lesson 13 (Nn) — PR #961 verification

Ported from `muse/lesson-13-wide-20261018` (commit 56755bb). Rendered on this
branch via local vite dev server; all pages render clean:

- `l13-p43-390x844.png` / `l13-p43-844x390.png` / `l13-p43-1366x900.png` — page 43
  (tracing + draw) at phone portrait, phone landscape, desktop. Cream paper,
  garden instruction letters, teal glow boxes, "Lección 13" pill, diamond 43.
- `l13-p44-1366x900.png` — page 44 (syllable circle-match), desktop.
- `l13-p45-1366x900.png` — page 45 (reading practice), desktop.
- `l13-p46-1366x900.png` — page 46 (complete-the-word + sentence writing), desktop.

No cut-off boxes, no overlapping diamonds, nothing cropped at 390x844.

## Lesson 21 (Jj) — text-color fix

Ported from `swarm/lesson-21-wide-20261018` (design 1cda96b, text-color fix
7c3407d, diamond fix a741a40; junk test commits skipped).

**The text-color problem:** the shared `native-lesson.css` rule
`.native-lesson-viewer__content .fp-native-letter-page .fp-region--reading-sentences`
colors the page-77 reading card text maroon (#70263b). The fix strengthens the
lesson-scoped selector to 4 classes so dark ink (#25313a) always wins:

```css
.lc-lesson-21 .native-lesson-viewer__content .fp-native-letter-page .fp-region--reading-sentences {
  ...
  color: #25313a;
}
```

**Verified on this branch:** computed style of `.fp-region--reading-sentences`
on page 77 = `rgb(37, 49, 58)` (#25313a) on `rgb(253, 248, 236)` cream.
Screenshots:

- `l21-p77-390x844.png` / `l21-p77-844x390.png` / `l21-p77-1366x900.png` — page 77
  at phone portrait, phone landscape, desktop. Reading text is dark ink, not maroon.
- `l21-p75-1366x900.png`, `l21-p76-1366x900.png`, `l21-p78-1366x900.png` — pages
  75, 76, 78 desktop. No text-color issues.

`tsc --noEmit` clean. Only Lesson 13 and Lesson 21 files touched.
