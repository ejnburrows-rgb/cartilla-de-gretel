# Lesson 10 (Tt) — wide-screen design (2026-10-18)

DRAFT-only wide-screen redesign of Lesson 10 pages 31–34, modeled on the
owner-approved Lesson 3 design language (template: PR #927, Lesson 21):
classic cream paper background, slimmer teal spine, teal glow around the
boxed work surfaces, and instruction letters rendered in the garden palette
(green/rose/gold/sky/lavender) instead of plain dark ink.

Scope is additive and strictly Lesson 10–gated: a `lc-lesson-10` shell class in
`-leccion-view.tsx`, a scoped block in `src/styles/lesson-fit.css` covering
Lesson 10's actual exercise types (trace tiles, freehand writing line,
drawing canvases, syllable-circling tiles, letter card, syllable chips,
vocabulary tiles, sight-word tiles, fill wordboxes/choices/blanks, sentence
writing surfaces), and a new `Lesson10GardenText` component wired into
`FaithfulPageRenderer.tsx` for `lessonNumber === 10`. Pencil mechanics,
artwork, audio, and all other lessons are untouched. Draft only — no merge.
