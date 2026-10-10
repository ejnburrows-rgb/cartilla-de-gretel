# La Cartilla de Gretel — current completion plan

> **Finish contract:** `PROJECT_FINISH_DEFINITION.md` defines finished. This file is only the current gap-closing execution plan.

**Updated:** 2026-10-10
**Concurrency authority:** `AGENTS.md` only. There is **no fixed numeric cap** on concurrent Jules implementation lanes.

## Current verified reality

- CURRENT `main` must be resolved live from GitHub at the start of every session; do not persist a main SHA here because merging this file would immediately make it stale.
- Cross-session coordination is now governed by the mandatory live-coordination contract in `AGENTS.md`: every material worker/controller change must leave a structured handoff on the existing issue/PR, and controllers refresh this file when lane state/order materially changes.
- The eight canonical Student Workbook archetypes remain encoded page-by-page in `src/data/workbook-archetypes.ts`.
- Live GitHub confirms merged lanes: #531 (Gretel), #532 (page turns), #533 (PDF precache/provenance), #534 (teacher-route performance), #537 (art classification), #538 (Pencil Line + clean Workbook integration), #551 (Workbook fidelity candidate reconciliation), #618 (Page 1 picture motion polish), #624 (perf image loading regressions), #625 (student route smoke), #626 (#616 Workbook page turns + #617 Flip Chart corner flips), #627 (art audit timeout), #628 (Flip Chart pre-final regression, closing #571), #630 (Student audio/mute behavior, closing #567), #631 (Workbook device readiness preflight, closing #561), #632 (Teacher + Flip Chart classroom regression, closing #562), #633 (Flip Chart picture motion pilot, closing #615), #634 (Class Roster accessibility), #636 (Gretel voice abstraction seam, closing #570), #637 (perf budget React 19 recalibration), #638 (owner-proof capture harness, closing #585; #597 closed as superseded), #641 (Workbook assembled regression suite, closing #450), #642 (Flip Chart corner cancel, reduced motion and keyboard navigation, closing #457), #643 (Living-art motion regression proof, closing #560), #646 (owner foreground-image intake tooling, closing #579), and #648 (owner art intake tooling resilience). Do not dispatch or merge those lanes again.
- #539 is closed as superseded: its frozen head `802d237aca9f439dde062402caac8a092eaf9f42` was deliberately preserved in #538.
- #553 is the owner-locked large close-up pencil/eraser baseline. #516 is closed unmerged and superseded; do not restore it. The small StudentCursor is a separate approved pointer, not an obsolete marking actor.
- #389 remains the dedicated direct-cloud release-verification lane. The `playwright.config.ts` cross-platform launcher is verified resolved on `main` (process.platform === "win32" conditional).
- #454 remains open: merging the #537 classification audit does not certify that every production artwork slot is correct or that pending owner artwork is supplied.
- #450 is verified and closed via #641: full assembled Workbook regression suite passing across all 8 archetypes, save/restore, completion gating, device matrix, and source-blocked pages 86–87.
- #457 is verified and closed via #642: pointer cancel resets without turning, reduced-motion drag omits 3D transform, and Enter/Space keyboard navigation operates cleanly.
- #560 is verified and closed via #643: Page 1 and Flip Chart Lesson 7 living motion verified with natural `-alive.svg` SVGs and static fallback under reduced motion.
- #579 is verified and closed via #646 and #648: deterministic owner foreground-image intake tooling, sanity validation, dry-run report, and Windows test resilience.
- Active independent Jules implementation lanes in flight:
  - #587: Current-main clean release verification baseline (active with Jules task 658944131750853263)
- #540 remains a timing diagnosis, not a runtime repair lane. Fresh current-main focused verification passed all 62 tests across 7 suites, including the p24 completion gate; this is not whole-product browser/release proof.
- Final premium Gretel voice/TTS technical abstraction is verified and merged (#636); owner choice among candidates (#589) remains open.
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

1. **#389 / #587 — trustworthy direct-cloud release harness and clean release baseline**
   - Cross-platform launcher verified on `main`. Clean verification checkout can run `pnpm verify:release`.
   - Record exact typecheck, Vitest, production build, and Playwright results on current main.
   - No GitHub Actions, paid runners, weakened/skipped tests, or asset-output implementation commits.

2. **#616 + #617 + #618 + #615 — page turns & living motion integrated**
   - Merged into `main` via #626, #618, and #633. Teacher hand mode, corner flips, Workbook real-paper page turns, Page 1 continuous motion, and Lesson 7 Flip Chart picture motion pilot are verified on `main`.

3. **Current Pre-Final Regressions & Active Implementation batch (in flight)**
   - Pre-final regressions verified and merged: #571 (#628), #567 (#630), #561 (#631), #562 (#632), #570 (#636), #585 (#638), #450 (#641), #457 (#642), #560 (#643), #579 (#646).
   - In flight with Jules:
     - #587: Current-main clean release verification baseline.
   - Final foreground-art correctness stays in #454. Classification or a green Sonar badge alone cannot close it.

### Final gates after dependencies are verified and integrated

4. **#450 & #457 — final Student Workbook & Teacher/Flip Chart regression (VERIFIED & CLOSED)**
   - Merged into `main` via #641 (#450) and #642 (#457). Full 8-archetype coverage, save/restore, completion gating, device fit, source-blocked pages 86–87, pointer cancel, reduced motion, and keyboard navigation verified.

5. **#579 & #588 — foreground artwork intake tooling & final owner art drop**
   - #579 verified and merged via #646: deterministic intake validation tooling and dry-run report (`scripts/validate-owner-art-package.mjs`, `tests/owner-art-intake.test.mjs`, `docs/OWNER_ART_INTAKE.md`).
   - #588 (owner-gated): integrate final supplied owner foreground art drop using the verified intake tool.

6. **#570 & #589 — resolve final premium Gretel voice/TTS**
   - #636 (closing #570) verified and merged: technical abstraction seam, single speech ownership, volume/mute enforcement, `/cartilla/voces` preview.
   - #589 (owner-gated): owner decision on candidate voice (Cartilla local neural voice vs. cloud edge TTS).

7. **#389 / #587 — trustworthy direct-cloud release harness & clean release baseline**
   - Cross-platform launcher verified on `main`. Clean cloud verification checkout runs `pnpm verify:release`.
   - Records exact typecheck, Vitest, build, and Playwright execution counts without mutating release assets.

8. **#458 — assembled-product proof and release**
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
