# Lesson 3 production drawing continuation — October 28, 2026

Source commit: `3e8cb02e6d44bf4c240ac5ad672b553dca272c2a` on existing PR #1206 branch `prototype/lesson-3-a-20261027`.
Baseline: `63072dac3183be7c3eebd77275a22cbff4c7d323`. This is a scoped shared-production-component repair, not prototype rollout or final assembled verification.

## WORKS

- On actual `/cartilla/leccion/3`, printed page 9, activity `page-9-p9-write-a`, undo of the only stroke leaves zero decoded ink and disables Listo. [Phone](375-production.webm), [tablet](768-production.webm), [desktop](1280-production.webm); [raw checks](results.json).
- All three 375/768/1280 by900 Chromium journeys verify blank gating, drawing eligibility, undo-empty rejection, completion across reload, B starts empty, A restores, erasing all ink revokes persisted page activity completion, eraser-only motion cannot finish, interrupted drawing reload, route return and A→B→A separation. Synthetic learners only; auth/rest routes blocked. No page exceptions. Resume page was seeded to isolate page9; no activity completion was seeded.
- Undo snapshots now retain point eligibility with pixel data. Eraser movement adds no drawing credit. Empty erased canvas removes the completion marker through the existing activity retry event. Existing storage and learner keys reused; no parallel persistence layer or backend changes.
- [16 focused checks](unit-after.txt) in existing DibujaHost and keyboard-navigation suites pass. New undo regression failed on baseline (Listo remained enabled), then passed after repair; new erase regression also passes. [TypeScript](typecheck.txt) passes. These checks do not replace runtime evidence.

## DOES NOT WORK

- Baseline actual route:20 move events draw1622 ink pixels; undo gives0 ink pixels but Listo stays enabled. [Baseline recording](baseline-undo.webm), [screenshot](baseline-undo.png), [raw output](baseline-browser.txt). This observed defect is repaired by the source commit above.

## NOT VERIFIED

- Browser uses mouse pointer input in touch-capable contexts; no touch-only, physical phone, Safari or acoustic claim. Original prototype375px touch-only evidence remains valid for its unchanged implementation.
- This new proof now covers all three production freehand regions on page9: `page-9-p9-write-a`, `page-9-p9-write-a2`, and `page-9-p9-draw`, each at375/768/1280×900 (nine journeys). [Second line raw checks](activity-1/results.json), [drawing raw checks](activity-2/results.json); recordings/screenshots sit alongside each. Uppercase tracing and all other production activities remain outside this proof. Prototype artwork/layout was not rolled into production by this repair.
- Completion of all page9 activities/lesson3, incorrect matching/drops,24-lesson rollout and full production-route journey are not certified. Resume was seeded; navigation completion was not tested.
- No source art, curriculum, phone toolbar CSS, trace-reset CSS or protected held deletion changed. Existing #1022 older shared DibujaHost ownership/history remains preserved; this small new production defect is delivered in the currently authorized #1206 continuation. Existing worker live status is not assumed.
- No independent formal approval, merge, assembled candidate or deployment. Main unchanged. No repeated routine owner approval needed.

Reproducer: `node scripts/proofs/check-lesson-three-production.mjs`, against the local worker app at127.0.0.1:5173 with demo-only data; PLAYWRIGHT_CHROMIUM_PATH may select installed Chromium. Exact recorded input is in results.json. Screens show existing production layout, not the isolated approved prototype.

Supplemental runs used `node scripts/proofs/check-lesson-three-production.mjs 1` and `2`; these cover previously untested production regions. The already-passing first-region run was reused. The runner-only extension selects a region and separate proof directory; shared production source is unchanged from3e8cb02. Original prototype and its memory-only state remain unchanged.
