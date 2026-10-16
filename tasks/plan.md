# End-to-End Delivery Plan — Cartilla de Gretel (Workbook Proof)

**Date Updated:** 2026-10-16

This plan defines the sequence of work required to satisfy `PROJECT_FINISH_DEFINITION.md` specifically for the interactive Student Workbook and Teacher Flip Chart proof.

## Core Rules

1. **Follow `AGENTS.md` and the 2026-10-13 autonomous controller directive:** Autonomous controllers and dispatchers (Muse) may refill up to 15 useful active Jules lanes with independent, ready work supported by a real gap without re-requesting owner approval per issue, provided no owner-only gates (release, payment, unapproved redesign, artwork approval) are crossed.
2. **Never duplicate work.** Inspect actual GitHub branches, existing PRs, and live provider sessions. If another agent is assigned a task, do not dispatch a duplicate to another worker. Reuse proof (Vitest/Playwright/types) when valid. A test run is needed only for *new* changes or *missing* final release bounds.
3. **Show exact visual evidence.** The owner demands source-faithful render proof in chat (screenshot/video/direct reproduction URL) when artwork or layout is changed. GitHub PR diffs or `playwright.config.ts` console output are not acceptance proof for visual tasks.
4. **Follow `PROJECT_SOURCE_OF_TRUTH.md`.** Do not reconstruct source-blocked pages. Do not hallucinate missing book content.
5. **No active Supabase connection yet.** Do not expand real user data until authorized (post-pilot).
6. **Sonar is advisory.** Do not block execution on warnings. True regressions block; theoretical quality gate drops do not.

## Consolidated Execution Checkpoint

**Evidence already obtained — DO NOT REDO:**
- Four completed broad artwork audits. PR #751 provides the canonical 201 drawing groups/330 placements reconciliation (draft evidence only).
- Merged #733 Piano Hablador designs/logic, #743 Workbook physical page turn, #744 printed 60-sheet Flip Chart top-bound page turn, #726 approved pencil/eraser.
- Verification PRs merged: #641 (full assembled Workbook regression, closed #450), #642 (keyboard/pointer access, closed #457), #643 (living motion bounds, closed #560), #646/648 (artwork intake tooling, closed #579), #636 (Gretel voice abstract, closed #570).
- #713 authorization-gate reconciliations into `WORKBOOK_ARCHETYPE_STANDARD.md` and `STUDENT_INTERACTION_STANDARD.md` already merged.

**Remaining integration (not yet independently proven complete):**
- PR #739 (one-native-page whole Workbook plus student resume/handwriting).
- PR #735 (motion of 8 Workbook images).
- PR #737 (5 Flip Chart images).
- PR #769 (DRAFT, owner-gated — voice work MOOT per owner 2026-10-15: voice research stopped, the 48 recorded Gretel clips locked FINAL (commit e7d3bf2c). The 67 local MP3 cues are REJECTED stuttering/music source — archival evidence only, never map, replay, restitch, or deploy them. Audio recovery uses only `Gretel_558674_Original.m4a` with auditory/transcript/page verification per the repo AGENTS.md audio corrections; playback stays held until verification is complete.)

## Final Gates & Execution Order

1. **Advance existing candidates; do not restart merged lanes**
   - Muse reconciles live Opus assignments and active Jules sessions. Recover unfinished #739/#735/#737 lanes, no duplicate PRs. (#769 voice work is moot per owner 2026-10-15 — do not recover or restart it.)
   - Opus continues assigned difficult cross-component Workbook implementation (reader, erase persistence, turns).
   - Jules completes or validates existing #735/#737 and installs exact approved masters once authorized by the owner.
   - For audio: no new voice discussion, generation, or provider selection — the owner already supplied finished audio (2026-10-15) and prohibited revisiting it. The 67 MP3 cues are rejected/archival-only; do not map or replay them. Recovery = `Gretel_558674_Original.m4a` only, with auditory/transcript/page verification per the repo AGENTS.md audio corrections; keep playback held until verification is complete.

2. **#588 — Final owner art drop**
   - Owner-gated: integrate final supplied owner foreground art drop using the verified intake tool from #579.

3. **#589 — Gretel voice: RESOLVED by owner 2026-10-15**
   - Owner locked the 48 recorded Gretel clips as FINAL (commit e7d3bf2c) and stopped all voice research; generator/provider selection is not to be revisited. This gate now tracks recovery, mapping, and verification of the existing assets only — no local-neural vs cloud-TTS decision pending.

4. **#587 — Current clean-main Jules release baseline**
   - Reuse existing acknowledged session; require actual output.
   - Cross-platform launcher verified on `main`.
   - Records exact typecheck, Vitest, build, and Playwright execution counts without mutating release assets.

5. **#458 — Assembled-product proof and release**
   - Exact integrated head; full release gate; final Student and teacher regressions.
   - Required owner-visible archetype and assembled-product approvals remain open until actual rendered evidence is shown.
   - Deploy only after intentional final owner authorization.

## Printed pages 86–87 — resolved source status

Printed Workbook pages **86 and 87 are not blank pages that still need conversion**. They are absent from the authoritative supplied Student Workbook scan. Keep printed pages 86–87 as `SOURCE_BLOCKED` with no inferred text, artwork, regions, or archetype. Do **not** reconstruct them.

## Definition of this plan being complete

This plan is complete only when all real gaps against `PROJECT_FINISH_DEFINITION.md` are closed with objective evidence. Merged PRs, completed Jules sessions, a successful build, or a clean issue list alone do not equal product completion.
