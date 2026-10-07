# La Cartilla de Gretel — current completion plan

> **Finish contract:** `PROJECT_FINISH_DEFINITION.md` defines finished. This file is only the current gap-closing execution plan.

**Updated:** 2026-10-07  
**Baseline main before this documentation refresh:** `54443d8e91ea16443bd7252d652cc9a1a2e25f28`  
**Concurrency authority:** `AGENTS.md` only. There is **no fixed numeric cap** on concurrent Jules implementation lanes.

## Workbook candidate qualification — 2026-10-07

Continue PR #539 (`codex/workbook-clean-archetypes`), not a new rollout branch.
Latest owner direction in DESIGN.md / WORKBOOK_ARCHETYPE_STANDARD.md removes the default side Gretel and Flipchart background images; preserve instructional foreground art and existing learner state.
The p24 gate failure was an outdated immediate-click test: the shared pencil locks each group until its draw/hold finishes. The corrected integration test waits for that feedback, asserts every committed circle and keeps Siguiente locked until the final answer. All 12 gate tests and 3 syllable tests pass; connector/completion foundation adds 21 passing tests.
Real Chrome p24 proof passed at normal feedback timing: all 30 circles committed, Siguiente stayed locked until the last answer, 30 circles restored after reload, and navigation reached p25 with zero page errors. Reading pages 21/25/89 retained all 15 vocabulary words in exact order.
Cloud qualification passed asset verification (477 checked, no errors), TypeScript, all 122 Vitest files (1529 passed, 2 existing expected failures), and the production bundle. The full release command then failed installing Playwright Chrome: the environment received a truncated archive. Full E2E and final release qualification remain unproven; existing native lesson E2E fixtures also contain stale completion/order assumptions and require reconciliation under #389. PR #538 overlaps connector files and must be reviewed separately before integration. No merge/deploy authorized by this handoff.
Current-main documentation refresh 7a75b4e was incorporated into this candidate. PROJECT_SOURCE_OF_TRUTH.md now records the latest background-free Flip Chart and uncapped independent-worker direction; this session did not independently edit that protected file.

## Current verified reality

- The eight canonical Student Workbook archetypes are already encoded page-by-page in `src/data/workbook-archetypes.ts` for printed pages 1–90.
- `FaithfulPageRenderer` resolves each printed page through `archetypeMappingForPage(pageNumber)` and applies the matching archetype class(es). Shared family styling therefore follows an explicit page map; workers must not guess which family a page belongs to.
- Exact page content/regions still come from the verified page layout/source data. Shared archetype treatment must not overwrite page-specific wording, artwork, ordering, activity logic, saved work, or completion semantics.
- Current main already contains the clean digital Workbook archetype rollout foundations and the approved shared Pencil/Eraser / syllable-circle work.
- Draft PR #539 is the current clean-layout candidate for: centered Workbook page, navigation below, no default side Gretel, page growth instead of nested clipping, and a background-image-free Flip Chart while retaining source instructional foreground art and useful motion.
- PR #538 is the current Pencil Line candidate for printed pages 3, 5, 8, 11, 14 and 17.
- PRs #538 and #539 overlap in `LassoConnect.tsx`, `faithfulAdapters.tsx`, and `FaithfulPageRenderer.tsx`; the controller must reconcile them as one integration sequence, not merge them independently.
- Independent open candidates currently include #531 (Gretel interaction/motion), #532 (Workbook + Flip Chart physical page turn), #533 (book.pdf precache/provenance), #534 (teacher-route first-paint performance), and #537 (foreground-art classification/audit). Their file sets do not overlap #538/#539 or each other based on the current PR file lists, but every merge still requires exact-head review and appropriate proof.
- Issue #389 remains the direct-cloud release-verification lane and is runnable independently.
- Issue #540 was traced to an outdated immediate-click test, not a confirmed product completion defect. PR #539 corrects that proof and real-browser p24 completion/restore passed. Its runnable Jules label has been removed to prevent duplicate implementation; integrate the existing test correction before closing the issue.
- Final premium Gretel voice/TTS is still not owner-locked. It remains required by `PROJECT_FINISH_DEFINITION.md`; no worker may invent a paid provider or final voice choice.
- Welcome video is not a completion blocker under the finish contract.
- Live Supabase/multi-user expansion remains deferred for the current demo/non-real-data pilot finish line.

## Printed pages 86–87 — resolved source status

Printed Workbook pages **86 and 87 are not blank pages that still need conversion**. They are absent from the authoritative supplied Student Workbook scan:

- the supplied PDF visibly jumps from printed page **85** to printed page **88**;
- repo source image `page-085.jpg` exists;
- `page-086.jpg` and `page-087.jpg` do not exist;
- `page-088.jpg` exists.

Therefore keep printed pages 86–87 as `SOURCE_BLOCKED` with no inferred text, artwork, regions, or archetype. Do **not** reconstruct them from surrounding patterns. Under `PROJECT_FINISH_DEFINITION.md`, this documented source absence is an allowed finish exception and does not block final completion. If a genuine physical/source scan of those printed pages is later supplied, import and map it then.

Do not confuse printed page numbers with PDF file indices. Historical mapping files that use fields such as `student_pdf_page` refer to PDF indices, not the printed number shown on the book page.

## Fastest safe execution order

### Run now in parallel

1. **#540 — verified p24 test correction in #539**
   - Reuse the committed correction and accepted real-browser completion/restore proof.
   - Do not dispatch a duplicate product-fix worker for the old immediate-click test failure.
   - Close only after the existing correction is integrated.

2. **#389 — trustworthy direct-cloud release harness**
   - Run the existing `pnpm verify:release` path.
   - Repair only real harness/baseline failures.
   - No GitHub Actions, paid runners, or weakened/skipped tests.

3. **Controller exact-head review of independent ready PRs**
   - #531 Gretel interaction/motion.
   - #532 physical page-turn system.
   - #533 PDF precache/provenance.
   - #534 teacher-route performance split.
   - #537 foreground-art evidence.
   - Merge only when current proof supports the claimed gap closure. A worker PR body alone is not proof.

4. **Controller reconciliation of #538 + #539**
   - Preserve #538 Pencil Line behavior and persistence/accessibility.
   - Preserve #539 clean Workbook family presentation and background-free Flip Chart direction.
   - Resolve their three-file overlap deliberately.
   - Do not duplicate either lane.

### Immediately after the integrated candidate is stable

5. **#450 — final Student Workbook regression**
   - Run all activity families, save/restore, completion gates, keyboard, reduced motion, responsive fit, source fidelity, page turns, Gretel behavior, and known-defect checks.

6. **#457 — final teacher / Flip Chart validation**
   - Run in parallel with #450 when file ownership/runtime work permits.
   - Verify teacher navigation/guides, presentation, printing/reports in current scope, projector fit, source text/art/page order, and #532 page-turn behavior.

7. **Resolve final premium Gretel voice/TTS**
   - Owner decision is required before declaring the project finished.
   - Present an evidence-backed choice with cost/privacy/quality tradeoff; do not add paid services without explicit authorization.

8. **#458 — assembled-product proof and release**
   - Exact integrated head.
   - Full release gate.
   - Final Student + teacher regressions.
   - Final phone/tablet/laptop/projector proof.
   - Required owner-visible approval.
   - Production deployment only after explicit authorization, followed by live smoke verification.

## Controller / Jules operating rules

- Re-read current `AGENTS.md` every run. Never restore the obsolete two-worker cap.
- Dispatch every genuinely independent, dependency-ready, non-owner-gated implementation lane that current Jules capacity permits.
- Keep overlapping files/dependency chains sequential only where necessary.
- A completed, blocked, owner-gated or dependency-waiting lane must not reserve Jules capacity.
- Reuse existing canonical issues/PRs before creating anything new.
- Do not create work just to fill capacity.
- After each merge/completion/blocker change, rescan in the same controller run and immediately dispatch newly unblocked real work.
- Preserve source fidelity and existing working behavior.
- No production deployment during ordinary verification/integration.
- For visual/behavior owner approval, show the actual rendered result or directly testable preview in chat, not a GitHub page.

## Definition of this plan being complete

This plan is complete only when all real gaps against `PROJECT_FINISH_DEFINITION.md` are closed with objective evidence. Merged PRs, completed Jules sessions, a successful build, or a clean issue list alone do not equal product completion.
