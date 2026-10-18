# Lesson 2 — wide-screen design (2026-10-18)

What changed: Lesson 2 (Oo, printed pages 4–6) gets the owner-approved Lesson 3 wide-screen design language, modeled on the Lesson 21 treatment (PR #927): classic cream paper page, slimmer teal spine, teal glow around the boxed work surfaces, and garden-palette instruction letters. Scope is Lesson 2 only — additive, gated behind the `.lc-lesson-2` shell class and `lessonNumber === 2` checks. Page 4's mark-with-X picture tiles, page 5's vowel line-match chip and cells, and page 6's handwriting trace lines get the teal glow; the interactive accent (pencil/X color) switches from the catalog red to the shared teal, matching the Lesson 21 precedent. No artwork, audio, TTS, or pencil mechanics were touched. Draft only, not merged.

Files changed:
- `src/routes/cartilla/-leccion-view.tsx` — adds `lc-lesson-2` shell class for lesson 2
- `src/styles/lesson-fit.css` — appends scoped `.lc-lesson-2` block
- `src/components/cartilla/lesson2/Lesson2GardenText.tsx` — new garden-palette instruction text component
- `src/components/cartilla/FaithfulPageRenderer.tsx` — wires garden text for `lessonNumber === 2`; teal accent override for lessons 2 (and 21)
