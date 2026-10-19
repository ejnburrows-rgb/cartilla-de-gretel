# Lesson 4 (Ee) wide-screen design — 2026-10-18

Draft-only redesign of `/cartilla/leccion/4` (printed pages 10–12) in the
owner-approved Lesson 3 design language, templated on PR #927 (Lesson 21):
cream paper page, slimmer teal spine, teal glow around the boxed work
surfaces, and garden-palette instruction letters. Page 10's "Marca con una x"
picture tiles (`.fp-ix-cell`), page 11's vowel line-match cards and target
tiles (`.am-direct-pencil__card` / `__target`, `.am-pencil-mark-grid__item`),
and page 12's tracing SVG, writing lines and draw-box paper
(`.fp-trace__svg`, `.fp-writing-line`, `.am-dibuja__paper`) all get the teal
glow; instruction text renders letter-by-letter in rotating garden colors via
`src/components/cartilla/lesson4/Lesson4GardenText.tsx`, wired in
`FaithfulPageRenderer.tsx` for `lessonNumber === 4` only. Lesson 4 has no owner
voice recordings, so no audio was added. Scope is strictly Lesson 4: no Lesson
3 files touched, no artwork files touched, additive lesson-gated changes only.
No merge — draft PR only.

## Screenshots

- `lesson-4-390x844.png` — phone portrait
- `lesson-4-844x390.png` — phone landscape
- `lesson-4-1366x900.png` — desktop

All three were opened and inspected. 390x844 and 1366x900: VERIFIED — the
real Lesson 4 page 10 ("Instrucciones: Marca con una x los dibujos de las
palabras que comienzan con E e.") with its 16 picture tiles, cream paper,
slimmer teal spine, teal glow tiles, and garden-palette instruction letters.
844x390: the same page renders, but the tile grid stays tiny and its images
don't decode — verified IDENTICAL on unmodified main at this size, so this
is pre-existing shared fit-system behavior at phone-landscape size, not a
regression from this redesign.
