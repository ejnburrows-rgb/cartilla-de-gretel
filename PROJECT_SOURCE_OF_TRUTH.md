# PROJECT SOURCE OF TRUTH — La Cartilla de Gretel

**Status:** Active project entry point  
**Last verified:** 2026-10-03

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
2. Read `ASSET_FIDELITY_POLICY.md` before touching images, verified color transfer, or motion; read `STUDENT_INTERACTION_STANDARD.md` before changing student Workbook interactions; read `repo.md` before generating any Workbook or Flip Chart background.
3. Lessons 8–24 must match the physical Workbook **word for word** and in the correct order.
4. Digital interaction may change the physical gesture, not the lesson content or educational objective.
5. A student cannot advance with **Next** until the required work on the current page is completed.
6. Workbook and Flip Chart are separate experiences:
   - Workbook = student interaction.
   - Flip Chart/Presenter = teacher classroom presentation.
7. Gretel uses the exact approved master identified by `src/data/gretel-approved-master.json` and the existing character system. Final voice/TTS direction is deferred until the owner explicitly approves it.
8. Google Flow's current production scope is one owner-approved 5–6 second silent welcome loop from the exact approved final still. In-app lesson reactions use the existing Gretel state system; no 31-clip requirement remains.
9. Automatic Vercel deployment stays off during active work. Do not use production deployment as a test runner.
10. Do not reopen historical audits/branches unless current source or a failing test proves a current problem.

## Current work

Current product-completion execution is intentionally parallel where scopes are isolated.

Active independent lanes include:
- direct cloud release verification;
- production foreground art remediation with verified source-preserving color transfer;
- Gretel behavior/motion discipline;
- welcome-media readiness/integration;
- the current student-activity stage.

The student activity chain remains dependency-ordered:
`#445 → #446 → #447 → #448 → #449`.

Final gates follow with whole-Workbook regression, teacher/Flip Chart validation, performance, welcome-media integration, and final assembled-product release proof.

Supabase/live-auth work is deferred from the current product-completion path.

## Proof rule

No task is "done" without visible or test evidence:
- what changed;
- what source it was checked against;
- relevant test/build result;
- rendered/screenshotted proof for visual work;
- remaining blockers, if any.

## Do not waste time on

- another full repository or visual-source audit without a specific new defect/source gap;
- another rewrite/replatform;
- repeated Vercel previews;
- new duplicate Gretel systems;
- speculative database work before the instructional product is correct;
- stale branches or superseded handoff documents.
