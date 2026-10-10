# PROJECT SOURCE OF TRUTH — La Cartilla de Gretel

> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Status:** Active project entry point  
**Last verified:** 2026-10-06

## Goal

Finish La Cartilla de Gretel as a **school-pilot-ready e-learning platform** based directly on the physical Student Workbook and teacher Flip Chart.

Under the currently deferred live-auth/Supabase scope, "school-pilot-ready" means demo/pilot use with **non-real student data** until real-data security/privacy blockers are resolved. A real-child/student-data pilot cannot pass final release merely by declaring backend work deferred.

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

1. Read `CARTILLA_DIGITAL_DIRECTIVE.md` for page/content/presentation rules and `WORKBOOK_ARCHETYPE_STANDARD.md` for the owner-locked recurring Student Workbook visual families.
2. Read `ASSET_FIDELITY_POLICY.md` before touching images or source-preserving color transfer; read `STUDENT_INTERACTION_STANDARD.md`, `DESIGN.md`, and `UX-CONTRACT.md` before changing student Workbook interactions or page transitions; read `repo.md` before generating any Workbook or Flip Chart background.
3. Lessons 8–24 must match the physical Workbook **word for word** and in the correct order.
4. Digital interaction may change the physical gesture, not the lesson content or educational objective.
5. A student cannot advance with **Next** until the required work on the current page is completed.
6. Workbook and Flip Chart are separate experiences:
   - Workbook = student interaction on a clean digital canvas. Dense learner exercises do not use full scenic wallpaper; source structure/content and foreground art remain book-faithful.
   - Flip Chart/Presenter = teacher classroom presentation on a clean paper surface with no default scenic/background-image layer. Source instructional foreground scenes/art and useful approved motion remain when source-appropriate.
   - Existing scenic background assets may remain preserved in the repository/history but are not mounted as default Flip Chart backgrounds under the latest owner direction; do not delete them merely for this presentation change.
7. Gretel uses the exact approved master identified by `src/data/gretel-approved-master.json` and the existing character system. Final voice/TTS direction is deferred until the owner explicitly approves it.
8. Google Flow's current production scope is one owner-approved 5–6 second silent welcome loop from the exact approved final still. In-app lesson reactions use the existing Gretel state system; no 31-clip requirement remains.
9. Automatic Vercel deployment stays off during active work. Do not use production deployment as a test runner.
10. Student activity families must reuse one shared interaction kernel rather than independently re-implementing pencil/eraser feedback, timing, Gretel feedback events, persistence, or reduced motion.
11. Page advancement must use the owner-approved physical-paper transition system: Workbook pages turn side-bound across the spine; Flip Chart sheets flip upward over the top binding. The animation is presentation only and never bypasses completion/save/navigation logic.
12. Do not reopen historical audits/branches unless current source or a failing test proves a current problem.

## Current work

Current product-completion execution remains intentionally parallel where scopes are isolated.

As of 2026-10-04, current open controller PRs include:
- #476 — shared student interaction kernel + Workbook p1/p2;
- #477 — Gretel behavior and motion discipline;
- #478 — welcome-media code integration; the owner-supplied 5–6 second silent MP4 remains an external dependency;
- #479 — physical Workbook and Flip Chart page-turn transitions.

The owner locked the recurring Student Workbook visual system on 2026-10-06 in `WORKBOOK_ARCHETYPE_STANDARD.md`. The eight canonical visual archetypes are: (1) picture grid / circle-X, (2) vowel/letter + row choices, (3) multi-pair matching/connect, (4) single central target + surrounding pictures, (5) handwriting/tracing + open drawing, (6) syllable recognition/circle, (7) phonics/reading practice, and (8) complete-the-word + sentence writing. The numbered teal title bars on the reference board are annotations only and never appear in production.

The old Page-1-only golden visual gate is superseded by this owner-approved eight-archetype system. Page 1 remains the representative source for archetype 1, while each other archetype has its own canonical repeated design. The exact physical Workbook page still controls wording, artwork, content order, source wave/outline, markers, and spatial relationships.

Current mapping evidence identifies page 3 as archetype 3 and pages 5, 8, 11, 14, and 17 as archetype 4. Page 17 Uu is the canonical visual reference for archetype 4. Printed pages 86–87 are conclusively absent from the supplied authoritative Student Workbook scan: the scan jumps from printed 85 to 88, source images 086/087 are absent, and 085/088 exist. Keep 86–87 SOURCE_BLOCKED with no inferred text, artwork, region types, or archetype; this documented absence is an allowed finish exception under PROJECT_FINISH_DEFINITION.md.

The shared student interaction kernel remains the dependency for common Pencil/Eraser feedback. Visual archetype work, source mapping, responsive styling, and isolated adapters may proceed concurrently whenever files and dependencies do not overlap. AGENTS.md alone controls current worker concurrency; this file defines no fixed numeric Jules implementation cap.

Direct cloud release verification remains tracked in #389. Production foreground-art remediation with verified source-preserving color transfer also remains part of the product-completion path.

Final gates follow with whole-Workbook regression (#450), teacher/Flip Chart validation, performance, welcome-media integration, and final assembled-product release proof. The clean Workbook surface, foreground-art remediation, living-art motion, Gretel behavior, and page-turn system must be integrated before the final Workbook validation gate. The Flip Chart keeps its independently verified richer presentation.

Supabase/live-auth expansion remains deferred from the current product-completion path for demo/non-real-data pilot use. Current real-data security/privacy issues must be resolved before any production/school pilot uses real child/student data; deferral alone is not a real-data release clearance.

## Proof rule

For meaningful code/behavior PRs, the controller independently reviews the material diff and current head, reuses relevant Jules test and UI evidence, confirms scope/approvals, and fixes independently confirmed serious defects. SonarCloud/SonarQube analysis stays available as **advisory and non-blocking** information: its quality gate, duplication threshold, missing report, or failed status alone never blocks dispatch or merge. A confirmed substantive defect still blocks the affected change. Recheck only evidence invalidated by a material change; unrelated documentation/head movement does not invalidate focused proof. The lightweight `node scripts/check-merge-policy.mjs --docs` consistency check detects contradictory policy, while `--evidence <receipt.json>` evaluates a particular proposed merge without running product tests.

No task is "done" without visible or test evidence:
- what changed;
- what source it was checked against;
- relevant test/build result;
- rendered/screenshotted proof for visual work, including milestone screenshots before final completion;
- remaining blockers, if any.

## Do not waste time on

- another full repository or visual-source audit without a specific new defect/source gap;
- another rewrite/replatform;
- repeated Vercel previews;
- new duplicate Gretel systems;
- speculative database work before the instructional product is correct;
- stale branches or superseded handoff documents.
