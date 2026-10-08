# La Cartilla de Gretel — current completion plan

> **Finish contract:** `PROJECT_FINISH_DEFINITION.md` defines finished. This file is only the current gap-closing execution plan.

**Updated:** 2026-10-08 UTC
**Concurrency authority:** `AGENTS.md` only. There is **no fixed numeric cap** on concurrent Jules implementation lanes.

## Current verified reality

- CURRENT `main` must be resolved live from GitHub at the start of every session; do not persist a main SHA here because merging this file would immediately make it stale.
- Cross-session coordination is now governed by the mandatory live-coordination contract in `AGENTS.md`: every material worker/controller change must leave a structured handoff on the existing issue/PR, and controllers refresh this file when lane state/order materially changes.
- The eight canonical Student Workbook archetypes remain encoded page-by-page in `src/data/workbook-archetypes.ts`.
- Current independent open candidates and exact heads:
  - #531 Gretel interaction/motion — `49f55f389588d4283a13f5fbd2ff0f87f3fd37f3`.
  - #532 physical page-turn system — `a297f72e669605d5b727419b344157cd6204b072`.
  - #533 PDF precache/provenance — `50fedb3d5b3fa4d30846bf2e8f2739f8526885b4`.
  - #534 teacher-route first-paint performance — `9914f850a4e4941023702a3a09d0fb171c2bafb7`.
  - #537 foreground-art classification/audit — `704ff1244a3573aa618dcd3665e0869f3033f28d`.
  - #538 Pencil Line mechanics — `44fc3ef228d233685bb1a2081253d8d5cabcf429`.
  - #539 clean repeating Workbook archetypes/background-free Flip Chart — frozen reference `802d237aca9f439dde062402caac8a092eaf9f42`.
- #538 and #539 still overlap in shared interaction/rendering files and must be reconciled deliberately rather than merged independently.
- #389 remains the dedicated direct-cloud release-verification lane.
- #545 / PR #546: separate durable controller live; mandatory continuation workflow is in `controller/README.md` on `watchdog/event-coordinator`. Continue webhook processing, ten-minute reconciliation, polling, validation and safe recovery while owner-gated lanes wait.
- #389 bounded harness collision fix: PR #547 at `2580991ea9d121326ef4b0fc5acc59df91cc1651` independently verified (4/4 regression tests, negative control, exact-head trusted SonarCloud). Full release verification remains outstanding; no merge or product deployment performed.
- Initial two OpenHands conversations finished. Emilio authorized ongoing automatic starts: hard ceiling two new conversations per UTC day, capacity one; single-job restriction cleared. Safe scoped work dispatches automatically when quota, capacity and dependencies allow. No increase without owner authorization.
- #540 remains a test-timing diagnosis, not a runtime repair lane absent a new reproducible defect.
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

### Run now in parallel

1. **#540 — retain verified p24 evidence**
   - Preserve the existing timing-aware test correction when reconciling #538 with #539.
   - Requalify only impacted behavior after integration; no duplicate runtime repair lane.

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

## Owner orchestration update — 2026-10-07

Jules implements; ChatGPT/Codex reviews and dispatches. Use EJNRCGPLm / ejnrcgplm@gmail.com exclusively. Follow the API-first, no browser orchestration, and explicit-request-only Desktop Commander policy in AGENTS.md. Direct Jules API connection is not yet authenticated in this environment; no API key is available. Existing GitHub dispatch comments are delivery evidence, not proof of an authenticated API session or active worker. Do not infer completion from an open PR or bot acknowledgement. Preserve all exact-head merge/release gates.
