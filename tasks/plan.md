# La Cartilla de Gretel — current completion plan

> **Finish contract:** `PROJECT_FINISH_DEFINITION.md` defines finished. This file is only the current gap-closing execution plan.

**Updated:** 2026-10-09
**Concurrency authority:** `AGENTS.md` only. There is **no fixed numeric cap** on concurrent Jules implementation lanes.

## Current verified reality

- CURRENT `main` must be resolved live from GitHub at the start of every session; do not persist a main SHA here because merging this file would immediately make it stale.
- Cross-session coordination is now governed by the mandatory live-coordination contract in `AGENTS.md`: every material worker/controller change must leave a structured handoff on the existing issue/PR, and controllers refresh this file when lane state/order materially changes.
- The eight canonical Student Workbook archetypes remain encoded page-by-page in `src/data/workbook-archetypes.ts`.
- Live GitHub confirms #531 (Gretel), #532 (page turns), #533 (PDF precache/provenance), #534 (teacher-route performance), #537 (art classification), and #538 (Pencil Line + clean Workbook integration) are merged. Do not dispatch or merge those lanes again.
- #539 is closed as superseded: its frozen head `802d237aca9f439dde062402caac8a092eaf9f42` was deliberately preserved in #538. The former #538/#539 reconciliation is no longer an outstanding task.
- #553 is the owner-locked large close-up pencil/eraser baseline. #516 is closed unmerged and superseded; do not restore it. The small StudentCursor is a separate approved pointer, not an obsolete marking actor.
- #389 remains the dedicated direct-cloud release-verification lane. Current-main Playwright webServer commands still unconditionally invoke PowerShell, blocking Linux startup. Existing #616/#617 candidates contain a POSIX branch; reconcile this shared config deliberately with the existing #389 recovery rather than creating another harness lane.
- #454 remains open: merging the #537 classification audit does not certify that every production artwork slot is correct or that pending owner artwork is supplied.
- #450 remains dependency-gated by the existing integrated-art/source/interaction requirements. Preserve its 2026-10-09 owner-locked acceptance baseline and negative regression proof; do not start a duplicate final-regression worker.
- #457 is open again: #548 fixed only teacher-note context isolation and did not prove the full teacher/Flip Chart validation contract.
- Current open finish candidates include #616 Workbook page turn, #617 Flip Chart corner/hand-mode turn, and #618 Page-1 picture motion. #616/#617 overlap in DESIGN.md, UX-CONTRACT.md, playwright.config.ts, and living-motion.ts; reconcile them as one deliberate integration chain.
- Controller safety probes on #617 head `30533c21e6152a289e446a6b4b83b3f55e25fd4c` reproduced three blockers: pointer cancellation commits a turn; reduced-motion dragging creates a 3D layer; focused corner Enter does not activate. Scoped repair was requested on the existing PR. Any new head requires fresh exact-head proof.
- Existing proof/support candidates: #599 source-order/86–87 guards; #602/#603/#604/#606 eight-archetype proof; #593 student smoke; #595 Flip Chart regression; #600 accessibility; #607 route health; #609/#610/#611 teacher smoke/guides/printing; #591/#605 performance; #597 owner-proof capture; #608 voice preparation. They are candidates, not verified finish closures. Resolve current heads/checks/comments before review; do not duplicate them.
- #540 remains a timing diagnosis, not a runtime repair lane. Fresh current-main focused verification passed all 62 tests across 7 suites, including the p24 completion gate; this is not whole-product browser/release proof.
- Final premium Gretel voice/TTS is still an owner-required unresolved finish item.
- Welcome video remains non-blocking.
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

### Advance existing candidates; do not restart merged lanes

1. **#389 — trustworthy direct-cloud release harness**
   - Resolve the verified Linux PowerShell startup blocker in the existing recovery chain; coordinate the shared config changes already in #616/#617.
   - Prove both safe local web servers start, then run the existing `pnpm verify:release` path in a clean verification checkout.
   - No GitHub Actions, paid runners, weakened/skipped tests, or asset-output implementation commits.

2. **#616 + #617 — current page-turn integration**
   - Existing workers supply exact-head task/rendered proof; repair #617's reproduced cancellation, reduced-motion, and keyboard defects in its current branch.
   - Controller deliberately reconciles the four shared files; preserve both Workbook completion/save behavior and teacher hand-mode/laser-pointer behavior.
   - Verify the integrated exact head with focused behavior tests and required release qualification. Sonar is optional and cannot block dispatch or merging; real defects still require repair. No overlapping independent merges.

3. **#618 and independent existing proof/performance/teacher candidates**
   - Review only fresh, current-main-reconciled heads against source/owner requirements.
   - Preserve the #553 pencil/eraser baseline, approved art, and all other active lanes. Obtain real rendered motion/device evidence and required owner visual approval.
   - Final foreground-art correctness stays in #454. Classification or a green Sonar badge alone cannot close it.

### Final gates after dependencies are verified and integrated

4. **#450 — final Student Workbook regression**
   - Verify all recurring families, save/restore, completion, keyboard, reduced motion, source fidelity, responsive fit, page turns, Gretel, and large pencil/eraser acceptance including negative regression proof.
   - Reuse existing coverage first; add only missing meaningful checks. Do not weaken expected behavior to fit a candidate.

5. **#457 — final teacher / Flip Chart validation**
   - Run alongside #450 only when runtime/file ownership permits.
   - Verify teacher navigation/guides, printing/reports, source art/text/page order, projector fit, hand modes, interruption/cancellation, keyboard/reduced motion, and assembled turns.
   - A bounded teacher-note fix or preflight PR does not satisfy this whole gate.

6. **Resolve final premium Gretel voice/TTS**
   - #608 prepares the existing architecture only; it does not select the final voice.
   - Present evidence-backed quality/cost/privacy choices for the owner's explicit decision. Do not buy or silently choose a service.

7. **#458 — assembled-product proof and release**
   - Exact integrated head; full release gate; final Student and teacher regressions; phone/tablet/laptop/projector proof.
   - Required owner-visible archetype and assembled-product approvals remain open until actual rendered evidence is shown and accepted.
   - Preserve the production alias during ordinary work. Deploy only after intentional final owner authorization and approval, then verify the actual deployed product.

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

## Owner orchestration update — 2026-10-07

Jules implements; ChatGPT/Codex reviews and dispatches. Use EJNRCGPLm / ejnrcgplm@gmail.com exclusively. Follow the API-first, no browser orchestration, and explicit-request-only Desktop Commander policy in AGENTS.md. No authenticated direct Jules API connection was established in this controller session. Existing GitHub dispatch comments are delivery evidence, not proof of an authenticated API session or active worker. Do not infer completion from an open PR or bot acknowledgement. Preserve all exact-head merge/release gates.
