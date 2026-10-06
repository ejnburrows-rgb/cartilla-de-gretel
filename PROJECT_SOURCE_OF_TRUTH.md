# PROJECT SOURCE OF TRUTH — La Cartilla de Gretel

> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Status:** Active project entry point  
**Last verified:** 2026-10-05

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

1. Read `CARTILLA_DIGITAL_DIRECTIVE.md` for page/content/presentation rules.
2. Read `ASSET_FIDELITY_POLICY.md` before touching images or source-preserving color transfer; read `STUDENT_INTERACTION_STANDARD.md`, `DESIGN.md`, and `UX-CONTRACT.md` before changing student Workbook interactions or page transitions; read `repo.md` before generating any Workbook or Flip Chart background.
3. Lessons 8–24 must match the physical Workbook **word for word** and in the correct order.
4. Digital interaction may change the physical gesture, not the lesson content or educational objective.
5. A student cannot advance with **Next** until the required work on the current page is completed.
6. Workbook and Flip Chart are separate experiences:
   - Workbook = student interaction on a clean digital canvas. Dense learner exercises do not use full scenic wallpaper; source structure/content and foreground art remain book-faithful.
   - Flip Chart/Presenter = teacher classroom presentation and may retain the richer scenic presentation when source-appropriate.
   - Existing scenic background assets are preserved for the Flip Chart and other explicitly approved contexts; this presentation rule does not delete or regenerate them.
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

The owner-approved Workbook visual realignment is tracked in #495:
- #496 — build and visually approve Workbook printed page 1 as the clean digital-canvas golden reference;
- #497 — reproduce and fix the existing living-art motion path where approved motion is registered but not visibly running;
- #498 — roll the accepted clean Workbook surface across representative page families only after #496 is accepted;
- #499 — keep active documentation aligned with this distinction.

The owner explicitly approved this factual documentation realignment on 2026-10-05.

The student activity chain remains dependency-ordered:
`#445 → #446 → #447 → #448 → #449`.
#445 is represented by the current #476 candidate and must be verified/merged before dependent activity-family work advances.

Direct cloud release verification remains tracked in #389. Production foreground-art remediation with verified source-preserving color transfer also remains part of the product-completion path.

Final gates follow with whole-Workbook regression (#450), teacher/Flip Chart validation, performance, welcome-media integration, and final assembled-product release proof. The clean Workbook surface, foreground-art remediation, living-art motion, Gretel behavior, and page-turn system must be integrated before the final Workbook validation gate. The Flip Chart keeps its independently verified richer presentation.

Supabase/live-auth expansion remains deferred from the current product-completion path for demo/non-real-data pilot use. Current real-data security/privacy issues must be resolved before any production/school pilot uses real child/student data; deferral alone is not a real-data release clearance.

## Proof rule

For meaningful code/behavior PRs, merge proof also requires dual independent review of the exact current head: controller/assistant review plus SonarQube Cloud PR analysis. CodeRabbit is not required. Any head change invalidates prior dual-review proof and requires both reviews again. Documentation-only or trivial metadata-only changes may skip SonarQube but still require independent controller review.

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
