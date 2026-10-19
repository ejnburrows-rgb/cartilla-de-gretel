# Lesson 9 (Ss) wide-screen redesign — 2026-10-18

Additive, lesson-gated wide-screen design for Lesson 9 (printed pages 27–30),
modeled on the Lesson 21 template (PR #927). Changed files: `src/routes/cartilla/-leccion-view.tsx`
(`lc-lesson-9` scope class on the shell), `src/styles/lesson-fit.css` (scoped cream-paper,
slimmer teal spine, teal-glow work boxes, garden-palette letter classes), new
`src/components/cartilla/lesson9/Lesson9GardenText.tsx` (garden-color instruction letters,
wired into `FaithfulPageRenderer` for `lessonNumber === 9` only). Screenshots in this folder
(phone portrait 390x844, phone landscape 844x390, desktop 1366x900) show page 27 of
/cartilla/leccion/9 rendered with the new design. No art, audio, or other lessons touched.
Draft only, no merge.
