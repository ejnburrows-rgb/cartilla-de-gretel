# PROJECT SOURCE OF TRUTH — La Cartilla de Gretel

**Status:** Active project entry point  
**Last verified:** 2026-09-30

## Goal

Finish La Cartilla de Gretel as a **school-pilot-ready e-learning platform** based directly on the physical Student Workbook and teacher Flip Chart.

The digital product must:
- preserve the books' instructional structure, sequence, wording, exercises, and approved artwork;
- remove non-instructional filler such as blank/credits-only pages from the learner flow;
- use digital-native interactions where the physical gesture is awkward on screen;
- look polished and premium rather than like a scan or generic children's app.

## Authoritative sources

Google Drive originals:
- `La Cartilla de Gretel Flip Chart.pdf`
- `Libro del alumno - Rescan and Optimize (2).pdf`

For curriculum, wording, page order, exercise content, and source-page structure, the physical books win.

## Active rules

1. Read `CARTILLA_DIGITAL_DIRECTIVE.md` for page/content/presentation rules.
2. Read `ASSET_FIDELITY_POLICY.md` before touching images or motion.
3. Lessons 8–24 must match the physical Workbook **word for word** and in the correct order.
4. Digital interaction may change the physical gesture, not the lesson content or educational objective.
5. A student cannot advance with **Next** until the required work on the current page is completed.
6. Workbook and Flip Chart are separate experiences:
   - Workbook = student interaction.
   - Flip Chart/Presenter = teacher classroom presentation.
7. Gretel uses the approved Gretel 2.0 direction and the existing character system. Final voice is deferred until the owner supplies it.
8. Google Flow is for a small approved motion set (about 31 clips), using approved static art; clips play once on page open unless explicitly defined otherwise; reduced-motion uses a still.
9. Automatic Vercel deployment stays off during active work. Do not use production deployment as a test runner.
10. Do not reopen historical audits/branches unless current source or a failing test proves a current problem.

## Current work

Active implementation branch:
`fix/lessons-08-24-book-fidelity`

Current priority:
- restore Lessons 8–24 from the physical Workbook;
- enforce fidelity with tests;
- then finish premium Workbook, Flip Chart/Presenter, Gretel, motion, and final school-pilot QA.

## Proof rule

No task is "done" without visible or test evidence:
- what changed;
- what source it was checked against;
- relevant test/build result;
- rendered/screenshotted proof for visual work;
- remaining blockers, if any.

## Do not waste time on

- another full repository audit;
- another rewrite/replatform;
- repeated Vercel previews;
- new duplicate Gretel systems;
- speculative database work before the instructional product is correct;
- stale branches or superseded handoff documents.
