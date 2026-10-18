# Lesson 6 (Uu) wide-screen design — 2026-10-18

Owner order 2026-10-18: wide-screen redesign of Lesson 6 ("La vocal U", printed pages 16 and 18), modeled on the approved Lesson 21 wide design (PR #927).

What changed, Lesson 6 only (all additive and lesson-gated):
- `src/routes/cartilla/-leccion-view.tsx`: shell div gains `lc-lesson-6` when `n === 6`.
- `src/styles/lesson-fit.css`: appended a scoped `.lc-lesson-6` block — classic cream paper (#faf2df), slimmer teal spine (4.5%), teal glow around the lesson's boxed work surfaces (page 16 mark-with-X picture tiles `.fp-ix-cell`; page 18 tracing surfaces `.fp-trace__svg` and drawing paper `.am-dibuja__paper`), teal navigation/next button and focus ring.
- `src/components/cartilla/lesson6/Lesson6GardenText.tsx` (new): renders instruction text letter-by-letter in rotating garden-palette colors (leaf, rose, sun, sky, lavender) without changing any wording; wired into `FaithfulPageRenderer.tsx` for `lessonNumber === 6`, same pattern as Lesson 21.
- Lesson 6's accent color switched to the shared teal `#167A72` (design language) instead of its purple catalog color.

Scope: draft PR only, no merge. No artwork touched (`public/cartilla/art/**`), no audio added, no Lesson 3 or other-lesson files changed. Pencil/eraser mechanics untouched.

Proofs: `lesson-6-390x844.png`, `lesson-6-844x390.png`, `lesson-6-1366x900.png` (all `/cartilla/leccion/6`, page 16; page 18 inspected via `/cartilla/pilot-faithful/18` DOM).
