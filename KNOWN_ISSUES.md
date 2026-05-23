# Known issues

A truthful inventory of what is not yet verified or done. Update this file in the same commit that resolves an item.

## Verification I cannot run from the current tooling

These need a local shell or CI to verify; the GitHub contents API alone cannot:

- [x] `npm run typecheck` — PASS (2026-05-23, 0 errors).
- [x] `npm run lint` — PASS (2026-05-23, 0 errors, 9 pre-existing warnings in shadcn/ui and Ejercicios).
- [x] `npm run build` — PASS (2026-05-23, ✓ built in ~11s).


When you run these locally, paste any failures here verbatim.

## Deploy

- [x] Vercel production is serving commit `3901508f61e620c8b22b9d9683a629168302eea0` on `main`, verified via `/robots.txt` on 2026-05-23.
- [x] Lesson 9 smoke test passed on production: `/cartilla/leccion/9` renders directly, shows Letra S s / páginas 27-30, sight-word chips `es, de, un, está, en, la, el`, and `aria-label="Palabra de vista: es"` is present.
- [x] Lesson 17 smoke test passed on production: `/cartilla/leccion/17` renders directly, shows Letra R r / páginas 59-62, and the banner `Esta lección tiene un mini-cuento.` is present.
- [ ] GitHub Pages is not enabled. Vercel is the verified production path for now.

## Live lesson route integration

- [x] `BookFaithfulOverlay` is wired into `src/routes/cartilla/leccion.$n.tsx` and production smoke tests confirm the book-faithful overlay renders on direct lesson routes.
- [x] Student side workbook shell implemented for live lesson pages.
- [x] Student side official workbook source layer implemented for live lesson pages; it renders connected PDF/image pages when available and a pending-source state when not available.
- [x] Teacher side presentation shell implemented at `/cartilla/teacher/presentacion`.
- [x] Background/theme B improved with lesson-aware CRM theme variables, student workbook shell, and teacher presentation shell.
- [x] Exact source-art page reproduction remains pending where exact page assets/content are not present.

## Interactive workbook activity layer

- [x] `src/lib/workbook-interactions.ts` implemented — defines `WorkbookInteraction`, `InteractionKind`, `InteractionSourceStatus`, and all accessor functions.
- [x] `src/data/workbook-interactions.json` created — safe, metadata-derived interactions for Lessons 9 (pages 27-30) and 17 (pages 59-62).
- [x] `src/components/cartilla/DragWordReveal.tsx` implemented — drag-and-reveal word activity with tappable fallback.
- [x] `src/components/cartilla/TapObjectActivity.tsx` implemented — tap-object activity with verified-hotspot mode and fallback list mode.
- [x] `src/components/cartilla/InteractiveWorkbookLayer.tsx` implemented — orchestrates all activity kinds per active page.
- [x] `OfficialWorkbookLessonView` updated — exposes `onPageChange` callback and `belowPage` render-prop slot for the activity layer.
- [x] `leccion.$n.tsx` updated — wires `InteractiveWorkbookLayer` into the `belowPage` slot, activities visible below the PDF viewer.
- [x] `cartilla.teacher.presentacion.tsx` updated — shows interaction readiness badge (total / ready / pending-art / pending-transcription) per lesson card.
- [ ] Exact object-hotspot coordinates are NOT yet verified for any lesson page. All tap-object activities currently use the fallback list/tap mode. Enabling overlay mode requires official page scan mapping — this must NOT be done from synthesized data.
- [ ] Additional lessons (beyond L9 and L17) need interaction entries in `workbook-interactions.json`.
- [ ] `drag-word-to-image` activities will show a placeholder image panel until official art mapping is completed.


## Notion side (parked unless explicitly reopened)

- [ ] Revoke public share on the Workbook PDF Notion page once the PDF mirror is confirmed working in CI.
- [ ] Archive the zip-import dump page and its 140-row Unreferenced Attachments database (workspace clutter).
- [ ] Update the project Hub callouts ("Live & Deployed", "Codex renderer PR open", "12 routes 200 OK") to reflect verified state. The "Codex PR open" claim is false (zero PRs have ever been opened on this repo as of the audit).

## Content gaps (will not be auto-invented)

- [ ] `src/data/lessons.json` `lessons[]` page scaffolding has empty `textBlocks[]` for every page. Filling these requires a paginated transcription pass over the real workbook. Do not synthesize.
- [ ] Exact page text transcription is still pending where verified workbook text is not available.
- [ ] Exact source-art/object hotspot mapping is still pending; interactive overlays are not yet aligned to official page objects.
- [ ] PDF mirror is still pending unless separately verified; this pass does not modify the PDF mirror.
- [ ] No per-lesson hero illustrations in `public/cartilla/images/` (only grouped scans). Will not be auto-generated.
- [x] `src/data/teacher-guide.json` exists as a 24-lesson TODO skeleton. The actual teacher-guide content is not transcribed and must not be invented.
- [x] `.env.example` exists with Supabase public environment variable placeholders.

## consonants.json audit (D4 result, no edit needed)

Audited at commit `abc271b5`. Each entry verified against ground truth:

- Letter order matches consonant order: M, P, S, T, D, L, N, Ñ, B, V, R, rr, G, F, J, C, Y, Z.
- Lesson numbers run 7 through 24 contiguously.
- Page ranges are 4 pages each, starting at p19 for M (L7) and ending at p90 for Z (L24).
- Each entry has the full a/e/i/o/u syllable set in alphabetical syllable order (e.g. ma, me, mi, mo, mu), and the `examples` object has matching keys.
- G uses gue/gui (correct for hard /g/ before front vowels); C uses que/qui (correct for hard /k/ before front vowels); Z uses ce/ci for the soft sound (correct).

No deviation from ground truth found. No edit emitted.
