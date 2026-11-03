# PROJECT SOURCE OF TRUTH — La Cartilla de Gretel

This document governs approved product content and presentation, not agent orchestration.

For permanent working rules use [AGENTS.md](AGENTS.md). For current work, approvals and proof use [GitHub #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877). This specification does not assign workers or define execution order.

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
   - Flip Chart/Presenter = teacher classroom presentation with the owner-approved rich, optimized presentation, faithful to the original book. Clean paper is the default page *background* (no default scenic wallpaper), not a direction to flatten or remove approved art, source scenes, composition, visual hierarchy, polished finish, or purposeful motion.
   - The **six visual manifestation guides presented and approved by the owner** remain the presentation references for their corresponding sections. Match the approved visual result for each applicable section; do not treat those guides as optional or redesign physical-book structure, text, artwork identity, relationships, sequence or educational meaning. Approved refinements in layout quality, typography, color/finish, layering, responsiveness, projector readability and restrained motion remain allowed within the source/asset fidelity contracts.
   - Preserve historic scenic assets on disk, but do not mount them as *default* Flip Chart wallpaper. This default does not revoke any **specifically approved** page/context background treatment under `repo.md`.
7. Gretel uses the exact approved master in `src/data/gretel-approved-master.json`. For newly wired audio use only `Gretel_558674_Original.m4a` with verified transcript match. Never use `rec_gretel_*`, synthetic/device TTS or invented recordings; missing audio remains silent/unavailable. Historical #769 recovery is not a license to substitute unapproved clips.
8. Google Flow's current production scope is one owner-approved 5–6 second silent welcome loop from the exact approved final still. In-app lesson reactions use the existing Gretel state system; no 31-clip requirement remains.
9. Automatic Vercel deployment stays off (`vercel.json` `git.deploymentEnabled:false`). Never deploy until the owner explicitly says "deploy it"; product PR merge permission is separate.
10. Student activity families must reuse one shared interaction kernel rather than independently re-implementing pencil/eraser feedback, timing, Gretel feedback events, persistence, or reduced motion.
11. Page advancement must use the owner-approved physical-paper transition system: Workbook pages turn side-bound across the spine; Flip Chart sheets flip upward over the top binding. The animation is presentation only and never bypasses completion/save/navigation logic.
12. Do not reopen historical audits/branches unless current source or a failing test proves a current problem.

## Approved Workbook visual system

The owner locked the recurring Student Workbook visual system on 2026-10-06 in `WORKBOOK_ARCHETYPE_STANDARD.md`. The eight canonical visual archetypes are: (1) picture grid / circle-X, (2) vowel/letter + row choices, (3) multi-pair matching/connect, (4) single central target + surrounding pictures, (5) handwriting/tracing + open drawing, (6) syllable recognition/circle, (7) phonics/reading practice, and (8) complete-the-word + sentence writing. The numbered teal title bars on the reference board are annotations only and never appear in production.

The old Page-1-only golden visual gate is superseded by this owner-approved eight-archetype system. Page 1 remains the representative source for archetype 1, while each other archetype has its own canonical repeated design. The exact physical Workbook page still controls wording, artwork, content order, source wave/outline, markers, and spatial relationships.

Current mapping evidence identifies page 3 as archetype 3 and pages 5, 8, 11, 14, and 17 as archetype 4. Page 17 Uu is the canonical visual reference for archetype 4. Printed pages 86–87 are conclusively absent from the supplied authoritative Student Workbook scan: the scan jumps from printed 85 to 88, source images 086/087 are absent, and 085/088 exist. Keep 86–87 SOURCE_BLOCKED with no inferred text, artwork, region types, or archetype; this documented absence is an allowed finish exception under PROJECT_FINISH_DEFINITION.md.

The shared student interaction kernel remains the dependency for common Pencil/Eraser feedback. Visual archetype work, source mapping, responsive styling, and isolated adapters may proceed concurrently whenever files and dependencies do not overlap. AGENTS.md alone controls current worker concurrency; this file defines no fixed numeric Jules implementation cap.

Historical verification references: #587 and #389 record earlier harness work; #454 and #588 record earlier artwork work. They are not current assignments. Use #877 for current ownership, authentic source holds and the next eligible action; reuse only still-valid source-preserving evidence.

**Existing verification is not a new assignment:** #450/#641 and earlier teacher/Flip Chart, performance, Gretel and page-turn records are historical proof; check continuing applicability rather than restarting them. Earlier #458/#588/#589 records do not assign current work. #877 owns current release/art/audio routing; original Gretel audio recovery uses existing #769. The finish contract still governs full-product proof; the optional welcome loop does not block completion.

**Approved visual direction must be retained:** the richer Flip Chart and related section presentations refer to the **six owner-presented, owner-approved visual manifestation guides**, not to an instruction to add default scenic wallpaper or redesign the curriculum. These guides establish the intended polished, optimized, living-book appearance for their respective sections while keeping the physical source books authoritative for content, structure, original artwork and educational meaning. Preserve the approved look and approved page-specific exceptions; do not replace them with a stripped-down, generic clean-paper screen.

Supabase/live-auth expansion remains deferred from the current product-completion path for demo/non-real-data pilot use. Current real-data security/privacy issues must be resolved before any production/school pilot uses real child/student data; deferral alone is not a real-data release clearance.

## Verification and execution references

[AGENTS.md](AGENTS.md) owns execution, review, reporting and approval rules. [GitHub #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877) owns current work and proof. [PROJECT_FINISH_DEFINITION.md](PROJECT_FINISH_DEFINITION.md) owns completion. SonarCloud/SonarQube is advisory and non-blocking; actual defects and required safeguards remain gates.

## Preserved owner decisions

These are product decisions, not current assignment or completion claims. Newer explicit owner chat decisions prevail.
- Product: Spanish K–2 reading book and classroom app; retain both Workbook and teacher experience.
- Games: retain Cow, Rima, Palabras por minuto, Chano and Mariposas. Accepted Chano direction does not prove the delivered gameplay. Preserve existing work; reconcile overlapping candidates before any integration.
- Voice: recover existing authentic recordings rather than defaulting to owner rerecording or generated speech. Lesson narration remains silent when a verified phrase is missing.
- Artwork: present each proposed picture beside its authentic original for owner acceptance before page integration. The seven Flip Chart fixes accepted October 20 remain approved decisions, not a current wiring claim.
- Wording: singular `ojo` with `ojo.png` in both approved positions; the conflicting `ojos` proposal requires an explicit owner reversal.
- Presentation: cream background; pencil pages 7–8 stay separate.
- Existing technical context is Vite, React, TypeScript, TanStack Router, Supabase and Vercel; verify current implementation rather than treating this list as a new technology mandate.
