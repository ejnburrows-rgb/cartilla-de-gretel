# Lesson 1 — wide-screen design proof (2026-10-18)

Wide-screen redesign for Lesson 1 (pages 3–6), following the owner-approved Lesson 3 design language (template: PR #927 Lesson 21).
Added: `lc-lesson-1` scope class in the lesson shell for lesson 1, an appended `.lc-lesson-1` block in `src/styles/lesson-fit.css`
(cream paper, slimmer teal spine, teal glow on Lesson 1's boxed surfaces: p3/p4 `.fp-ix-cell` picture tiles, p5
`.am-direct-pencil__card` line-match cards, p6 `.fp-writing-line--trace/--freehand` tracing lines and the drawing paper,
plus garden-palette letter classes), a new `src/components/cartilla/lesson1/Lesson1GardenText.tsx` component wired into
`FaithfulPageRenderer.tsx` so instruction text renders in rotating garden colors for `lessonNumber === 1`.
Lesson-gated and additive: no other lesson's files, no Lesson 3 files, no artwork, no audio. Draft PR only, not merged.
