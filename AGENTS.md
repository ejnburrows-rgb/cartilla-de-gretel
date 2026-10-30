# AGENTS.md — La Cartilla de Gretel (active operating rules)
Updated 2026-10-30. This is the short, controlling agent instruction. Historical AGENTS.md instructions remain recoverable from Git history, but do not govern new work.

## Active owner scope — TWO authorized tracks (2026-10-30)

The owner's October 30 decision in [canonical issue #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877) **lifts the October 29 "Tutor #1073 only" freeze** and supersedes "organization-only" restrictions. Two tracks may proceed concurrently with non-overlapping file ownership:

- **Track A — finish product PRs:** ChatGPT/Codex coordinates the authorized existing PRs and Jules lanes J1–J13 exactly as defined in #877. Reuse each original branch/PR. Jules account **EJNRCGPLm only**; obtain a real session ID before claiming a lane was dispatched. Art owner-approval YES means wire the unchanged original; NO means report picture and reason. No speculative PRs, parallel changes to the same files or repeated work.
- **Track B — Tutor #1073:** Its **existing specialist** alone continues `feat/gretel-tutor-l1-3`. Track A must **not edit Tutor files**. Tutor integration waits for the owner's physical-phone microphone test.

**Integration priority:** Correct existing PR **#1218** to reflect this decision; secure **independent exact-head review and owner's explicit merge yes**; only then integrate approved PRs **one at a time**, running `pnpm typecheck` and affected tests after each. Order: **#1218 → #1227 → (#1203, #1213, #1178) → (#1077, #1081) → #1225 → #1229 → #1226 → #1180 → #1230 → #1073 after owner phone-mic test**. #1228 is covered inside #1230; #1157 must be reduced to verified missing deltas or proposed for owner-approved closure. Keep main's `AGENTS.md` during #1203/#1213/#1178 rebases and main's `tasks/plan.md` during Tutor conflict resolution.

**Absolute approval boundaries:** Every merge requires both an **independent review** and the owner's **explicit yes for that PR**; a test or comment alone is not merge authorization. **No deployment without the owner's words "deploy it".** Leave `vercel.json` `git.deploymentEnabled:false` unchanged. No spending or deletions. Never invent/change original art or voice, use device TTS/`speechSynthesis`, edit Mariposas assets, invent pages 86–87 or use `rec_gretel_*` recordings. Use only `Gretel_558674_Original.m4a` with a **verified matching transcript** for authorized audio. Unavailable audio remains silent, hidden or marked unavailable.

The canonical #877 supplies individual J1–J13 scopes, tests, two-viewport real-route screenshot/video proof, owner holds and the mandatory session footer. Older single-track or organization-only instructions are superseded, not live limits.

## Authority and current facts
1. **Different sources answer different questions.** Latest explicit owner decisions govern approved scope. `PROJECT_FINISH_DEFINITION.md` sets the finish bar. The original physical Workbook/Flip Chart and their authorized asset policies control curriculum, pages, wording and source art. `AGENTS.md` governs execution/safety. GitHub [#877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877) holds current assignments and decisions. Verified `main`, exact PR heads and running deployments establish **what currently exists**, not what is correct. Older reports are historical.
2. This file governs **how** agents operate, not what the workbook teaches. `tasks/plan.md` is a routing index, never an independent task board. Other Markdown files are scoped product specifications, not competing controllers. A stale task description does not override a verified current PR, source file or deployment.
3. At session start, compare actual `main`, relevant open/merged PRs, linked proof, current deployment and *directly observed* Codex/Jules sessions with #877. Do not describe a worker as running without live session evidence. No full-repo audit when a current scoped checkpoint suffices.

## Owner control and execution
- The owner controls product priorities, accepted visuals, spending, destructive changes, security/privacy, exact-change merge authority and releases. The owner may inspect every stage; never conceal GitHub state or tests. Present clear results with links and real screenshots/video instead of requiring the owner to review code.
- Tool discipline: GitHub owns code, PRs and the queue; direct authenticated provider sessions establish actual worker activity; use existing Vitest/Playwright/build commands for proof. Anti-churn is this file's reuse/checkpoint rule, not an additional framework. Consult Context7 only for uncertain version-specific third-party library APIs. Do not install Superpowers, Matt skill packs or overlapping MCP collections to perform existing work.
- Jules account: use **EJNRCGPLm / ejnrcgplm@gmail.com** exclusively; never use **EJnRCG / ejnrcg@gmail.com**. Verify actual authenticated provider identity before operating a session.
- ChatGPT/Codex is the single owner-facing coordinator for Cartilla. Jules and existing specialists keep their actual assignments. Muse is historical evidence only. Do not install new controllers, services, paid APIs or automations; do not invoke Antigravity without new explicit authorization.
- **One active assignment = one bounded deliverable**, not one deliverable per session. Reuse the original session, PR, branch, original approved artwork and valid evidence. Do not duplicate jobs, branches, dashboards, audits, or prompt handoffs.
- **Within each authorized Track A or Track B task:** inspect current code and exact PR head, fix only proven defects, run affected tests, attach real-route proof, then obtain independent review; do not create replacement work.
- **If a step is blocked**, report its exact hold; immediately continue the next independent eligible task in the same available session, strictly within the authorized non-overlapping tracks. Never claim unverified background activity or duplicate ownership.
- Routine in-scope owner visual decisions A–E are already accepted. Do not ask again or expand those approvals to unapproved source changes, cost, deletion, security, merges or releases.

## Active tracks, integration and evidence
1. **Track A** is active for existing product PRs and Jules J1–J13, with the file scopes and dependency gates in #877; **Track B** is active only through the Tutor #1073 existing worker. Neither track may modify the other's owned files. Do not change Tutor architecture into cloud/LLM services.
2. Preserve the owner's order: #1218 FIRST, then #1227, #1203/#1213/#1178, #1077/#1081, #1225, #1229, #1226, #1180, #1230; Tutor #1073 is last after owner's phone-mic test. For #1230 require #1180 first; #1228 is covered. Do not merge #1157 wholesale.
3. Every PR: current head / affected tests + typecheck / authentic route screenshots at 390x844 and 1366x768 (moving content requires video) / independent review / **explicit owner yes** / one merge / post-merge typecheck + affected tests. `/dev-*` is not production-route proof.
4. After each material change add **one** checkpoint in #877: TASK / CURRENT HEAD / CHANGE / TESTS / REAL PROOF / OPEN ISSUE / NEXT ACTION. Track actual Jules provider session IDs, never inferred activity.
5. Do not edit originals or invent voice; retain original-books curriculum, excluded Workbook pages 86–87, authentic recording policy, Mariposas assets and disabled auto-deployment.

## Evidence and gates
- Use only **DONE and live / DONE but not live / WAITING / NOT TESTED**. Mark a feature working only with reproducible behavior in the actual built app and matching screenshot; motion, audio, gameplay and navigation require playable recording or equivalent observed run. A PR, commit, test count or code review alone does not prove deployed functionality.
- Test proportionately: first run affected unit/integration/regression checks; run relevant Playwright/browser flows and visual/audio proof; before a full release, verify the integrated student and teacher paths across all required 24 lessons and devices. Reuse still-valid exact-version evidence rather than repeating clean tests for reassurance.
- **SonarCloud/SonarQube is advisory and non-blocking**. Confirmed serious defects, missing relevant tests, source/art fidelity failures and required GitHub protections still block the affected merge or release.
- **Independent formal GitHub review of the exact head and independent material technical review** are required for every merge, as well as effective GitHub branch protections and the owner's **explicit yes for that specific PR**. No self-approval or bypass. A review is not an owner merge yes.
- **Never deploy unless the owner says exactly "deploy it".** Keep `vercel.json` `git.deploymentEnabled:false` unchanged; never assume a permitted merge authorizes release. The prior Mariposas-only release is not blanket authorization.
- No paid/credit-consuming tools, destructive deletions, real student data use, new authentication backend, security weakening, or unapproved visual/source replacement.

## Product non-negotiables (specifics live in linked source files)
- `PROJECT_FINISH_DEFINITION.md` is the actual finish contract, covering the Student Workbook **and** Teacher/Flip Chart, all required activities, navigation, learner persistence, access, authentic Gretel audio and final verification. Do not declare finished from merged PRs or counts.
- The physical curriculum is authoritative for lesson order, page structure, words and artwork. Preserve originals; use `ASSET_FIDELITY_POLICY.md`, `ARTWORK_REPORT_VERIFICATION_AND_SINGLE_SOURCE_CLEANUP.md` and `PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md` for art work. Do not invent the source-missing printed pages 86–87.
- For active work, only use `Gretel_558674_Original.m4a` for a recording when its transcript match has been verified; otherwise omit playback. Do not use `rec_gretel_*`, device TTS/`speechSynthesis`, cloned voice or rejected synthetic/stutter clips. Existing #769 historical context does not authorize audio substitutions.
- **Mariposas is included; its assets must not be edited.** Keep existing verified work and do not duplicate or revert it.
- The demo/non-real-data pilot scope does not permit real student data while privacy/security requirements are unverified.

## When reporting to the owner
Give a short current-state display: **DONE and live / DONE but not live / WAITING / NOT TESTED**. For each decision show the actual result, proof, recommendation and exactly what the owner's Yes/No authorizes. Then continue other eligible work without waiting for unnecessary confirmations.

This file is intentionally concise. If a historical instruction conflicts with it or with newer verified owner decisions, ignore the historical instruction rather than adding another override paragraph.
