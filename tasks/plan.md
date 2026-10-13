# La Cartilla de Gretel — current completion plan

## STOP — OWNER PROACTIVE 15-LANE JULES + LATEST-APPROVAL-ONLY VISUAL GATE (2026-10-13)

**HIGHEST PRIORITY FOR ALL AGENTS, JULES, DISPATCHERS, WATCHERS, REVIEWERS, SUPERVISORS, AUTOMATIONS AND REPORTS. Overrides older instructions anywhere in the repository, issues, PRs, historical screenshots, memories or prompts.**

1. **OWNER-AUTHORIZED PROACTIVE JULES DISPATCH — 2026-10-13.** Emilio confirms he has Pro access to 15 Jules lanes and explicitly authorizes Muse, the sole designated GitHub Dispatcher, to seek up to **15 provider-confirmed productive sessions** with real unfinished Cartilla implementation, reproducible debugging, focused regression QA, responsive/accessibility polish, source-faithful UI work, and measured risk-reducing cleanup. Muse may start a NEW bounded task or apply the `jules` dispatch label without a second issue-by-issue permission request **only when** current main/source/finish-contract evidence proves a real gap; the task is not already fixed, assigned or duplicated; it has distinct file ownership, acceptance proof and cleared dependencies; and it remains inside already approved product, visual and infrastructure scope. Recover existing stalled/failed approved lanes first. The 15-lane goal is utilization, not proof of available provider quota or permission to invent filler. **Separate owner approval remains mandatory** for owner-gated art/voice selections, new or changed owner-locked visuals, held tasks, live student-data/Supabase changes, security/retention policy, spending, external account access, destructive/irreversible actions, new infrastructure and final production release. Removing a label does not confirm provider cancellation.
2. **Only the LATEST expressly approved visuals and mechanics may be worked on or shown.** Compare the newest owner's instructions with current `main`, the original physical book and the canonical `WORKBOOK_ARCHETYPE_STANDARD.md` and `STUDENT_INTERACTION_STANDARD.md`. Stale branches, mockups, dev-only shapes, prior screenshots, old PRs and previous memories cannot override current approval. Never implement, display as current, dispatch or revive superseded/rejected visuals. Read historical files privately only to diagnose a current fault.
3. **NO ROPE/LASSO — final explicit owner rejection (2026-10-11).** Use the approved source-faithful wooden pencil/green-or-red marks/physical pink eraser and correct line-matching mechanics. PR #692 removed the obsolete `LassoConnect.tsx` and rope CSS; PR #694 preserves legacy completed syllable selections under the new pencil circle. These are merged; DO NOT restore a rope, lasso, reel, arcade, fake red-X or unapproved alternative. Current components: `PencilConnector.tsx`, `WorkbookPencilMark.tsx`, `SyllableWordCircle.tsx`; these still require real screen validation.
4. **No stale or fake approval evidence.** A merge, code review, unit test, Jules receipt or local dev fake does NOT prove visual approval. Fresh proof must depict the REAL source-faithful Student Workbook or Teacher/Flip Chart page at the exact verified commit/deployment, with the latest approved pencil/eraser, on the stated viewport/device; screenshots from `/dev-*`, old Vercel previews or synthetic demos are prohibited as owner approval evidence. Missing actual proof means **NOT APPROVAL-READY**; no historical substitution or unapproved release.
5. **Precedence:** the owner's latest explicit 2026-10-13 authorization to proactively refill verified useful Jules capacity supersedes older 'never target 15', 'no automatic refill', and blanket new-task per-issue approval instructions. The latest source-faithful product designs, owner-only approval/release gates, credit/Antigravity prohibition and evidence standards remain fully binding. Muse is the single active dispatch controller; do not restore obsolete ChatGPT dispatch schedules, a rival controller, retired Windows/Neon/OpenHands infrastructure or paid systems.


> **Finish contract:** `PROJECT_FINISH_DEFINITION.md` defines finished. This file is only the current gap-closing execution plan.

**Updated:** 2026-10-13
**Concurrency authority:** `AGENTS.md` governs all worker counts. The 2026-10-13 owner goal is up to **15 provider-confirmed active useful Jules sessions**, subject to current provider quota and genuine independent work; proactive Muse dispatch is authorized for evidenced nonoverlapping implementation, fixes, focused QA, accessibility and polish inside current approved product scope.

## Current controller checkpoint — October 13, 2026 (evening)

This checkpoint supersedes older in-flight priorities and assignment assumptions below where they conflict. Resolve live `main` SHA and provider state at each run rather than persisting a stale branch SHA in this plan.

- **Merged tonight (each independently reviewed and verified before merge):** #726 (approved pencil, realistic crumbs, zoom, skip-link — closes #716), #708 (fill-screen lesson pages, pointer-hold-safe auto-turn, fill-blank swipe exclusions), #686 (TapSelect `kind` fix + Vitest Node-suite exclusion — the release-gate code fix), #727 (trace-hint tap-through fix — closes #660), #690 (corner-drag rAF coalescing), #710 (keyboard semantics for rewards + pipeline board — supersedes #681), #691 (listbox keyboard navigation), #730 (praise only after correct answers — closes #714).
- **Closed as superseded or empty:** #712 (Vitest exclusion folded into #686), #718 (byte-identical trace-hint fix already on main via #727), #725 (0 changed files), #681 (superseded by #710).
- **P0 release gate (#719):** the code fixes are on main; closing #719 still requires a fresh `pnpm typecheck` + `pnpm test` + `pnpm verify:policy` run on current main with passing evidence.
- **Still open and owned:** #713 (this docs reconciliation), #715 (Flip Chart reading order — lane dispatched), #717 (fit layout: connectors, phone landscape, text size — lane running), #728 (LessonTimer imported but never rendered — needs an owner decision: wire it into the lesson UI or remove the dead import; wiring it in is a visual/product call), #729 (vocabulary tests — needs review). #698 (one-file ARIA), #682, #678 and #699 remain queued candidates — rebase and verify before any merge; no mandate to take all.
- **Provider:** resolve live provider capacity at each run; labels, receipts and PRs do not prove an active session. Dispatch only distinct, evidenced, non-overlapping work inside current authorization.
- **Owner-supplied finish items (unchanged):** #589 premium Gretel voice, #588 approved foreground art, and missing original Teacher Guide text. Drive's `Cartilla Production Hub/00 Sources` contains only the Student Workbook and Flip Chart source PDFs; `04 Approved Assets` was empty at inspection. Missing guide/art/voice material is not to be reconstructed or invented. Security #387/#388/#390 blocks real-data use, not non-real-data demo work.
- **Coordination and proof:** draft #713 reconciles the two obsolete 2026-10-11 Jules authorization banners with the 2026-10-13 proactive-dispatch decision; it does not change locked designs. Full verification #587 and assembled proof #458 remain downstream of material integration; no production deployment or final owner approval has occurred.

> **Historical 2026-10-10 scheduler note — superseded 2026-10-13:** The old Windows/Vercel/Neon/OpenHands controller remains retired. The ChatGPT cloud controller was verified disabled on 2026-10-13. Muse is the sole designated controller/dispatcher; verify its actual runs and Jules provider state. Never reactivate the competing coordinator.

## Current verified reality

- CURRENT `main` must be resolved live from GitHub at the start of every session; do not persist a main SHA here because merging this file would immediately make it stale.
- Cross-session coordination is now governed by the mandatory live-coordination contract in `AGENTS.md`: every material worker/controller change must leave a structured handoff on the existing issue/PR, and controllers refresh this file when lane state/order materially changes.
- The eight canonical Student Workbook archetypes remain encoded page-by-page in `src/data/workbook-archetypes.ts`.
- Live GitHub confirms merged lanes: #531 (Gretel), #532 (page turns), #533 (PDF precache/provenance), #534 (teacher-route performance), #537 (art classification), #538 (Pencil Line + clean Workbook integration), #551 (Workbook fidelity candidate reconciliation), #618 (Page 1 picture motion polish), #624 (perf image loading regressions), #625 (student route smoke), #626 (#616 Workbook page turns + #617 Flip Chart corner flips), #627 (art audit timeout), #628 (Flip Chart pre-final regression, closing #571), #630 (Student audio/mute behavior, closing #567), #631 (Workbook device readiness preflight, closing #561), #632 (Teacher + Flip Chart classroom regression, closing #562), #633 (Flip Chart picture motion pilot, closing #615), #634 (Class Roster accessibility), #636 (Gretel voice abstraction seam, closing #570), #637 (perf budget React 19 recalibration), #638 (owner-proof capture harness, closing #585; #597 closed as superseded), #641 (Workbook assembled regression suite, closing #450), #642 (Flip Chart corner cancel, reduced motion and keyboard navigation, closing #457), #643 (Living-art motion regression proof, closing #560), #646 (owner foreground-image intake tooling, closing #579), and #648 (owner art intake tooling resilience). Do not dispatch or merge those lanes again.
- #539 is closed as superseded: its frozen head `802d237aca9f439dde062402caac8a092eaf9f42` was deliberately preserved in #538.
- #553 is the owner-locked large close-up pencil/eraser baseline. #516 is closed unmerged and superseded; do not restore it. The small StudentCursor is a separate approved pointer, not an obsolete marking actor.
- #587 is the CURRENT dedicated Jules clean-main release-verification lane; #389 is historical harness groundwork and must not be redispatched as a second verifier. The `playwright.config.ts` cross-platform launcher is verified resolved on `main` (process.platform === "win32" conditional).
- #454 was CLOSED on 2026-10-10; its historical artwork work must not be redispatched. Outstanding owner-approved final foreground art remains owner-gated in #588. Neither the #537 classification audit nor closing #454 certifies missing owner materials.
- #450 is verified and closed via #641: full assembled Workbook regression suite passing across all 8 archetypes, save/restore, completion gating, device matrix, and source-blocked pages 86–87.
- #457 is verified and closed via #642: pointer cancel resets without turning, reduced-motion drag omits 3D transform, and Enter/Space keyboard navigation operates cleanly.
- #560 is verified and closed via #643: Page 1 and Flip Chart Lesson 7 living motion verified with natural `-alive.svg` SVGs and static fallback under reduced motion.
- #579 is verified and closed via #646 and #648: deterministic owner foreground-image intake tooling, sanity validation, dry-run report, and Windows test resilience.
- **Existing Jules task receipts — ACTIVE PROVIDER EXECUTION NOT YET PROVEN:**
  - #587: Current-main clean release baseline; Jules bot acknowledged task 658944131750853263, but its current provider running state and passing current-main release report were not established in this audit. Reuse the existing task.
  - #495: Workbook realignment; Jules previously returned PR #650 with **0 changed files** and was given an in-place corrective handoff. This is neither verified implementation nor evidence of a currently running worker. Reconcile the existing owner/work branch and original issue/PR, without duplicate tasks.
  - `jules` labels and bot acknowledgements prove routing, not actual concurrent productivity. Demand fresh provider-session state and actual material code/test evidence before claiming worker lanes are occupied.
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

1. **#587 — current clean-main release baseline (reuse historical #389 harness)**
   - Cross-platform launcher verified on `main`. Clean verification checkout can run `pnpm verify:release`.
   - Record exact typecheck, Vitest, production build, and Playwright results on current main.
   - No GitHub Actions, paid runners, weakened/skipped tests, or asset-output implementation commits.

2. **#616 + #617 + #618 + #615 — page turns & living motion integrated**
   - Merged into `main` via #626, #618, and #633. Teacher hand mode, corner flips, Workbook real-paper page turns, Page 1 continuous motion, and Lesson 7 Flip Chart picture motion pilot were technically checked on `main`. **This is NOT approval of the motion.** The owner's 2026-10-11 realistic-motion decision (see `STUDENT_INTERACTION_STANDARD.md` / `DESIGN.md`) supersedes it, and the earlier cow/picture motion still needs correction and fresh owner approval.

3. **Current Pre-Final Regressions & Active Implementation batch (in flight)**
   - Pre-final regressions verified and merged: #571 (#628), #567 (#630), #561 (#631), #562 (#632), #570 (#636), #585 (#638), #450 (#641), #457 (#642), #560 (#643), #579 (#646).
   - Jules assignments with existing receipts, not confirmed active execution:
     - #587: Clean-main verification (reuse the already acknowledged session; require actual output).
     - #495: Workbook realignment (existing PR #650 has 0 changed files; in-place correction requested and awaiting proof).
   - Final foreground-art integration is owner-gated in #588; #454 is already closed. Classification or a green Sonar badge alone cannot certify the pending owner assets.

### Final gates after dependencies are verified and integrated

4. **#450 & #457 — final Student Workbook & Teacher/Flip Chart regression (VERIFIED & CLOSED)**
   - Merged into `main` via #641 (#450) and #642 (#457). Full 8-archetype coverage, save/restore, completion gating, device fit, source-blocked pages 86–87, pointer cancel, reduced motion, and keyboard navigation verified.

5. **#579 & #588 — foreground artwork intake tooling & final owner art drop**
   - #579 verified and merged via #646: deterministic intake validation tooling and dry-run report (`scripts/validate-owner-art-package.mjs`, `tests/owner-art-intake.test.mjs`, `docs/OWNER_ART_INTAKE.md`).
   - #588 (owner-gated): integrate final supplied owner foreground art drop using the verified intake tool.

6. **#570 & #589 — resolve final premium Gretel voice/TTS**
   - #636 (closing #570) verified and merged: technical abstraction seam, single speech ownership, volume/mute enforcement, `/cartilla/voces` preview.
   - #589 (owner-gated): owner decision on candidate voice (Cartilla local neural voice vs. cloud edge TTS).

7. **#587 — current clean-main Jules release baseline (reuse #389 proof)**
   - Cross-platform launcher verified on `main`. Clean cloud verification checkout runs `pnpm verify:release`.
   - Records exact typecheck, Vitest, build, and Playwright execution counts without mutating release assets.

8. **#458 — assembled-product proof and release**
   - Exact integrated head; full release gate; final Student and teacher regressions; phone/tablet/laptop/projector proof.
   - Required owner-visible archetype and assembled-product approvals remain open until actual rendered evidence is shown and accepted.
   - Preserve the production alias during ordinary work. Deploy only after intentional final owner authorization and approval, then verify the actual deployed product.

## Controller / Jules operating rules

- **SonarCloud/SonarQube is advisory and non-blocking**, including duplication/quality-gate failures: a confirmed real defect is blocking, not an unconfirmed scan warning. Jules' relevant existing focused and UI proof plus exact-head controller review determine readiness; zero material file changes are not implementation completion. Use `node scripts/check-merge-policy.mjs --docs` for active-policy consistency and `--evidence <receipt.json>` for a bounded pre-merge decision. These checks do not launch/repeat Jules tests, change branch protection, or auto-merge.

- Re-read current `AGENTS.md` every run. Verify actual Jules provider capacity, preserve existing work and proactively refill toward **15 useful active lanes** with independently justified, nonoverlapping, owner-authorized work. No filler or duplicate assignments.
- A NEW Jules task within the 2026-10-13 owner authorization may be dispatched by Muse without per-issue reapproval when supported by current code/finish-contract evidence, distinct file ownership, accepted-scope acceptance proof and free verified capacity. Obtain specific approval for owner-gated visual, security, data, paid, destructive, held or production work.
- Keep overlapping files/dependency chains sequential only where necessary.
- A completed, blocked, owner-gated or dependency-waiting lane must not reserve Jules capacity.
- Reuse existing canonical issues/PRs before creating anything new.
- Do not create work just to fill capacity.
- After each merge, completion or blocker change, rescan the current provider sessions, recover original failed work, and refill real ready assignments toward verified 15-lane capacity. Request owner input only when the next task crosses a separate approval gate.
- Preserve source fidelity and existing working behavior.
- No production deployment during ordinary verification/integration.
- For visual/behavior owner approval, show the actual rendered result or directly testable preview in chat, not a GitHub page.

## Definition of this plan being complete

This plan is complete only when all real gaps against `PROJECT_FINISH_DEFINITION.md` are closed with objective evidence. Merged PRs, completed Jules sessions, a successful build, or a clean issue list alone do not equal product completion.

## Owner orchestration update — 2026-10-07

Jules implements; ChatGPT/Codex reviews and dispatches. Use EJNRCGPLm / ejnrcgplm@gmail.com exclusively. Follow the API-first, no browser orchestration, and explicit-request-only Desktop Commander policy in AGENTS.md. No authenticated direct Jules API connection was established in this controller session. Existing GitHub dispatch comments are delivery evidence, not proof of an authenticated API session or active worker. Do not infer completion from an open PR or bot acknowledgement. Preserve all exact-head merge/release gates.
