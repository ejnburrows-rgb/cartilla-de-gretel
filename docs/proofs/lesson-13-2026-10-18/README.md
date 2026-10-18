# Lesson 13 (Nn) wide-screen design — 2026-10-18

Draft-only redesign of `/cartilla/leccion/13` (printed pages 43–46) in the
owner-approved Lesson 3 design language, templated on draft PR #955 (Lesson 4):
cream paper page, slimmer teal spine, teal instruction line, teal glow around
the boxed work surfaces, and garden-palette instruction letters.

Lesson 13 (accent #F4A261, letter Nn, syllables na/ne/ni/no/nu, keywords
nata/negro/nido/mono/nudo) covers: handwriting/tracing rows + draw box
(page 43), syllable circle-match (page 44), phonics/reading practice
(page 45), and complete-the-word + sentence writing (page 46).

Changed files (lesson-13 only; no Lesson 3, no other lesson, no art files):
- `src/components/cartilla/lesson13/Lesson13GardenText.tsx` (new) — instruction
  text rendered letter-by-letter in rotating garden colors (l13-leaf/rose/sun/
  sky/lavender). Text content is never changed.
- `src/styles/lesson-fit.css` — appended scoped block under `.lesson-13-wide`:
  cream paper #faf2df, slim teal spine (4.5%), teal glow on writing lines,
  syllable-match words, syllable bubbles, fill-in-blank word boxes, draw
  paper, and picture boxes; teal instruction line #0d9488; boxed pictures
  capped at 8 per screen (4×2 grid, extras flow into a scrollable strip so no
  picture is dropped); gentle 8s float loop from page load
  (prefers-reduced-motion respected); tap feedback on top.
- `src/routes/cartilla/-leccion-view.tsx` — shell adds `lesson-13-wide` when
  `n === 13` (same pattern as lesson 4).
- `src/components/cartilla/FaithfulPageRenderer.tsx` — instruction regions for
  `lessonNumber === 13` render via `Lesson13GardenText` (same pattern as
  lesson 4). No TTS, no generated voice, no generated art.

No merge — draft PR only.

## Screenshots

- `lesson-13-390x844.png` — phone portrait
- `lesson-13-844x390.png` — phone landscape
- `lesson-13-1366x900.png` — desktop

All three were opened and inspected: VERIFIED — the real Lesson 13 page 43
("Escribe con tu mejor letra." tracing + "Haz un dibujo que represente una
palabra que comienza con n." draw box), cream paper, slimmer teal spine, teal
glow boxes, garden-palette instruction letters, nothing cropped or cut off at
any size.

Pages 44–46 were not individually screenshot: the viewer resumes at the saved
page (page 43) and paging requires clicks this lane cannot perform, but all
four pages share the same `.lesson-13-wide` shell and the same
`lessonNumber === 13` instruction wiring.
