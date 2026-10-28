# AGENTS.md — mandatory, every session, no exceptions

> **LATEST OWNER EXECUTION / PROVISIONAL APPROVAL — October 28, 2026.** Owner: “Go ahead and approve everything for now until you finish. Then anything that I want to change, I will change.” Treat remaining routine visual and implementation decisions within the existing Cartilla completion scope as provisionally approved, including the shown Lesson 3 direction (card E); A–D are already accepted. Continue material work without returning routine approval cards or making the owner repeatedly say continue. Keep versioned proof and present the assembled result for later changes. Preserve explicit rejections, authentic workbook/art/voice decisions, existing assignments and destructive/security/cost holds; this does not authorize new services or reviewer access, bypass protected-main review, or authorize production deployment. Merge/release authorization remains separately scoped.


> **OWNER OVERRIDE — October 28, 2026: controller ownership.** ChatGPT/Codex in the owner's current Cartilla conversation is the primary controller and single owner-facing entry point. Muse is a supporting source of history and records, not an independent controller or dispatcher. This supersedes all older Muse-only, Muse/Instinct dual-controller, and owner-carried prompt-routing instructions, including the October 13 controller allocation.
>
> Use the existing October 28 Cartilla Master Completion Plan; prioritize independent review and authorized integration of delivered fixes before new coding. Recover existing assignments and proof; do not duplicate work, reopen resolved issues, launch a new audit, or rebuild the workflow. Codex retains artwork ownership; Jules and other existing specialists retain their assigned work until the controller reconciles ownership. No new infrastructure or automatic schedules are authorized.
>
> The controller handles technical coordination through available tools. Report one concise dashboard: finished, confirmed active now, blocked, next, and owner decisions; distinguish verified evidence from reported status and development from production. Never imply background execution without confirmation. If access truly blocks progress, state the exact blocker and the single necessary owner action. Preserve source/workbook fidelity, existing approvals, independent review and branch protection. Merges require applicable exact-change owner authorization; deployment requires explicit owner authorization. No self-approval or bypass. Preserve all existing art, voice, privacy, security and spending gates.


> **MANDATORY OWNER DIRECTIVES (2026-10-22, every agent / Muse / Instinct / Jules):** Read [PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md](PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md) and [ARTWORK_REPORT_VERIFICATION_AND_SINGLE_SOURCE_CLEANUP.md](ARTWORK_REPORT_VERIFICATION_AND_SINGLE_SOURCE_CLEANUP.md) before investigating, changing, certifying or dispatching artwork work. Only the latest authentic owner-approved updated art may be used; delete proven obsolete wrong crops from current production after switching and verifying all references. Do not create competing inventories, silently relax tests, or report file presence as correct rendered art. Existing owner-only merge/deploy gates remain in force. These Markdown directives define the obligation; actual implementation and tests are required before claiming enforcement.

## REPORT FORMAT, "DONE" RULE, MERGE AND DEPLOY RULE — EVERY AGENT (owner order 2026-10-22)

Applies to every agent, worker, reviewer and watcher, and to every report, PR description, closeout and chat message.

1. **Every report lists three headed sections, always in this order: WORKS, DOES NOT WORK, NOT VERIFIED.** Write "none" under a heading that is empty. Do not leave a heading out.
2. **Each item carries proof.** WORKS items link a screenshot or video of the real running build. DOES NOT WORK items link what was seen failing. NOT VERIFIED items say what was not checked and why.
3. **The words "done", "working", "fixed", "complete" or "ready" may only be used for an item that was functionally tested in the real running build and has a screenshot or video as proof.** Reading code, a passing unit test, a build passing, a PR existing, an agent's own summary or text in a commit message is not functional testing and is not proof.
4. **A still image is not proof of anything that moves.** Games, animation, audio, taps and navigation need a recorded play-through (video) showing the behavior.
5. **Anything not functionally tested goes under NOT VERIFIED.** Never move an item to WORKS on assumption, and never leave a failure out of the report.
6. **An agent's work does not exist until it is pushed to the real repo (a branch is fine).** Keep work pushed as it goes. Any report without a link to the repo (branch, commit or PR) says NOT VERIFIED.

**Merge and deploy (owner rule, 2026-10-22):**

7. Agents may merge to `main`, but only finished and tested work. Work that is still being worked on or tested (for example specific artwork or games) stays on its branch until it is finished and tested, so `main` does not pile up.
8. A merge must not trigger a deployment by itself, because Vercel limits deployments. Do not add or change any setting that makes a merge deploy.
9. Deploys are batched. A deploy runs only when the owner says so, in his own words. No agent starts a deploy on its own.

## NEWER OWNER CORRECTION — REJECT 67-CLIP MUSIC/STUTTER SOURCE (2026-10-15)

**Overrides the earlier 2026-10-15 note wherever it mentioned 67 clips as potential playable recordings.** The owner listened to the former stitched demonstrations from `Gretel_67_Audio_Lecciones_Listo.zip` and explicitly rejected them: stuttering, background music, wrong source. The existence of 67 valid MP3 files is **not approval to play them**. They are archived evidence only. Never silently replay, auto-recommend, restitch, or deploy them, even if URLs exist in the branch.

**Use only the existing original master recording** `Gretel_558674_Original.m4a` for current recovery and alignment (source SHA256 `239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d`). It has 151 source-boundary-verified speech segments, but the text actually spoken and workbook page associations are **NOT YET VERIFIED**; do not equate `gr_0001` recording segment with `GR0001` book script. Corrected exports preserve original continuous speech and authentic pauses; do not join bad clip fragments or add music. Review auditory quality, verify each transcript and page/event mapping before approved runtime playback. PR #769 holds the implementation in DRAFT; don't merge/deploy until verified. Owner already supplied the voice and audio; do not propose any new generation, cloning, or recording.


## LATEST OWNER AUDIO SOURCE CORRECTION — REJECT WRONG STUTTERING/MUSIC TRACKS (2026-10-15)

**Supersedes the earlier 2026-10-15 statement that the 67 indexed recordings are automatically acceptable for playback.** Owner explicitly rejected the prior stitched demonstrations: "The stitching is wrong. It stutters. It has music in the background. That's not the one that you're supposed to use. So do it again."

- The 67 short-clip ZIP / `rec_gretel_*.mp3` material and earlier concatenated examples are **REJECTED FOR LEARNER PLAYBACK** until the owner explicitly reapproves individually cleaned and listened-to files. Preserve all originals and associated metadata; **do not automatically play these clips or merge the existing 67-file mapping as a completed solution**.
- The previously supplied **original full-length audio tracks** `Gretel_558674_Original.m4a` (32m 28s), `Gretel_558473_Original.m4a` (4m 36s), and `Gretel_558607_Original.m4a` (54s) are distinct existing source files. Source `558674` has known acoustic segment boundaries, but **not verified word-level transcripts or exact printed-page matches**. Never turn segment ID `gr_0001` into script ID `GR0001` without hearing/transcribing the actual words.
- Repair must favor exact continuous spoken phrases from the original recordings, preserve original word order and natural pauses, trim on verified utterance boundaries, and use gentle fades to prevent clicks. Avoid joins that repeat fragments or stitch disjoint sentences to impersonate printed book text. **Background music must be removed/checked by listening; a filter or silence analysis alone does not certify a music-free result**.
- Confirm source phrase transcript and printed page/event before enabling audio, and test on actual workbook. Do not claim clean sound, 100% coverage, or integrated playback based only on MP3 installation. No new recording, cloning, or alternative speech generator. Existing integration stays draft/held pending corrected sources and real verification.
- Owner repeatedly said not to revisit generator selection or ask them to repeat already-supplied recordings. This correction is specific to rejecting the wrong audio mix, **not revoking the underlying real recordings**.


## OVERRIDING OWNER DIRECTIVE — USE THE EXISTING FINISHED AUDIO (2026-10-15)

**Newest owner-approved source-of-truth correction, effective immediately. Applies to all agents, Muse, Jules, reviewers, schedulers, and every future session. Supersedes older proposals/options elsewhere in this repository.**

1. **Generator already solved.** The owner has a functioning generator that creates any Spanish sentence requested. **Do not research, clone, train, replace, deploy, self-host, or recommend another generator, TTS model, Colab voice setup, GPU, paid provider, or new recordings.** Do not reopen older "choose final Gretel voice" tasks.
2. **Real finished source assets already supplied.** On **2026-10-14**, the owner generated and provided **more than one hour of actual recordings**, including recordings in video files. They are completed audio outputs; **not** voice-cloning reference material or merely recording prompts. Do not request re-recording or have the owner repeat explanations/uploads.
3. **Exact authorized job:** find/recover the previously supplied assets through accessible authorized sources; extract audio from existing videos where necessary; use the real existing recordings to map to **every authentic workbook page instruction, applicable narration, alerts, correct-answer compliments, incorrect-answer and "try again" reactions, and all other recorded responses**. Map by actual spoken content and source pages (no invented alignment, words, or coverage). Install valid playable audio and connect it to appropriate events. Check real page-by-page browser playback, audio correctness, keyboard accessibility, mute/stop, and completeness. Preserve existing approved sound and unrelated behavior.
4. **Evidence boundary:** PR #769 is an existing draft integration effort with **67 indexed MP3 cues and a 1,639-entry script** in its 2026-10-15 description, but it reported that its needed MP3 binaries were *not installed* on the running app, its exact-page active manifest was empty, and runtime playback was not proven. Recover this work; do not duplicate it. Recheck latest PR before making a new claim. **The recordings are usable source material; missing local tool access or uninstalled repo assets are an ACCESS/INTEGRATION blocker, never evidence that the recordings cannot be used.**
5. **Never say "100% integrated" without proof** that the actual audio is accessible and installed and every claimed workbook page and response has correctly mapped, verified playback. Separate owner-supplied recording duration, extracted cue count, script entries, installed assets, mapped coverage, and live playback.
6. **Stop unsolicited discussion of voice.** Only discuss the remaining integration/proof task if the owner explicitly asks. Preserve all standing permissions, no-paid-services rule, and owner-only production release gate. No unapproved merges/releases/assets deletion.



## OVERRIDING OWNER DECISION — do not re-open workbook pages 86–87 (2026-10-14)

Printed workbook pages **86–87 are missing from the owner's actual PDF** (85 jumps to 88). **Final owner instruction: STOP repeatedly asking for scans, do not generate fake pages, and do not block completion.** Student lessons must show only authentic existing printed pages: Lección 23 **83,84,85**; Lección 24 **88,89,90**. Whole Workbook already skips 86–87. Keep original printed numbering and internal `SOURCE_BLOCKED` documentation, not learner placeholders. Preserve existing work/save progress. **Never invent missing content or represent artificial reconstructions as book originals.** Canonical decision details: `PROJECT_SOURCE_OF_TRUTH.md`.

**Current design task order:** owner wants interactive GrillMe about the existing practice activities and session mechanics **before** discussion/implementation of Piano placement. Do not pick Piano placement or add unrelated activity pathways without owner decision. No repetitive audits, extra agents, duplicate issues or design handoffs.


## REQUIRED: NO REPEAT AUDITS + GITHUB CHECKPOINT WRITEBACK (2026-10-14)

**Owner's permanent execution rule — applies to Opus 5.5, Muse, Jules, watchdogs, supervisors and any agent accessing this repo.** Consult this rule before any new project-wide investigation or worker handoff. It supplements the existing coordination/QA contract, without overriding safety or approval gates.

1. **Reuse before checking.** Read the latest `tasks/plan.md` checkpoint and the latest relevant existing issue/PR evidence. Existing **four artwork audits are already completed**, and PR #751's 201-drawing-group/330-placement reconciliation is the established artwork map. DO NOT redo it, restart a repo-wide audit, create a fifth mapping, or repeat unchanged tests or screenshots.
2. **Check ONLY the delta.** Compare exact affected file/PR revision, changed requirements, relevant test/proof coverage and dependency state since last valid evidence. An unrelated docs commit never invalidates focused proof. If no material change exists, write `NO MATERIAL DELTA — REUSE PROOF`; no rerun.
3. **Write back every genuine scoped audit or meaningful QA/implementation checkpoint.** Post one concise, durable update on the EXISTING relevant GitHub PR/issue (use #458 for the assembled-product checkpoint): UTC time/date; reviewed exact SHA and affected scope; link to reused previous audit/check; actual changed facts or `NO MATERIAL DELTA`; observed evidence and missing verification; next executable step and named owner. A GH issue/PR comment **is the repo audit ledger**; avoid a new issue, separate recurring infrastructure, or docs commit for every mere visit. When identical no-delta evidence was already logged, reference that existing checkpoint instead of posting identical comments. If the agent actually found something new, it MUST record it before ending.
4. **Refresh `tasks/plan.md` only for material handoff changes**, replacing stale ownership, progress or blockage claims in place (no stack of contradictory snapshots); separate owner-only source-of-truth editing rule continues. Preserve the existing Jules dispatch integration and do not create a competing controller.
5. **Never conflate:** found/mapped vs optimized vs installed on the correct page vs moving appropriately vs owner-approved vs rendered/tested vs merged/released. Existing Opus assignments and actual Jules provider capacity must be confirmed before claiming them running. Open draft PR does not equal implemented final app.
6. **Finish rather than inventory:** existing #739 native Workbook with reliable learner save/return; #735 Workbook and #737 Flip Chart source-faithful animations; use #751 already-verified artwork master map for real original optimization, exact placements and runtime integration only when owner approval allows; live page defects, Gretel voice, teacher tools, Piano, responsive/keyboard/reduced-motion; continuous bounded Jules testing and final assembled product proof. The ChatGPT/Codex controller coordinates productive provider-confirmed Jules sessions (up to 15), recovering existing work and avoiding all file collisions. Opus 5.5 continues its prior assigned cross-component implementation; three Opus assignments are owner-reported but their provider ownership is not yet proven. No duplicate fourth job by default.
7. **Respect existing gates:** current approved wooden pencil/pink eraser, no rope/lasso; original artwork fidelity; owner-only final art/voice/visual approvals, no invented source pages 86–87; no Antigravity, new paid API, unauthorized Supabase/data/security work or production release.

**Canonical sources:** current `AGENTS.md`, `PROJECT_FINISH_DEFINITION.md`, `PROJECT_SOURCE_OF_TRUTH.md`, `tasks/plan.md`, then exact-head issue/PR and real runtime proof. Always check changed source rather than treating a historical checkpoint as current code.


## Current artwork reconciliation routing — 2026-10-14

The **current source-evidenced artwork reconciliation** is in [PR #751](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/751), [MASTER-MAPPING.md](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/MASTER-MAPPING.md), and its 330-row CSV/201-group JSON. **The PR is a draft evidence branch, not installed on `main`, not deployed, and not a production-art approval.** Every agent, including Muse/Jules/controller/reviewer, must read the current PR head and its evidence **before** making artwork availability, candidate or owner-missing claims; do not restart the four completed artwork audits. No automatic Jules job is created by this pointer.

90 faithful optimized drawing masters available by group (186 placements), 108 groups need actual optimization (141 placements), 3 unresolved frontmatter composite groups (3 placements). **115 exact placement matches** recorded; **71 READY group placements** have no individually selected exact master. **Eight** selected candidate files are documented only inside owner-local archives; they are not live GitHub assets. **50** withheld hashes cannot be associated with specific drawings. Ownership approval, runtime integration, book fidelity and release checks remain separate gates.

**Visual identity override:** `DRAW-WB-10-1` depicts **avión (airplane)** despite five legacy `PEZ` IDs/filenames. Real source image and proposed match were directly inspected; never rename it *pez* based on filename, nor alter legacy placement IDs. Optimize/restore only source-faithful originals, preserve all approved assets, and remove no evidence or app dependency without a specific negative reference/dependency check. Older summaries or locally generated copies cannot supersede the cited live GitHub evidence.

## OWNER DIRECTIVE — CONTROLLER OWNERSHIP UPDATED OCTOBER 28; HISTORICAL 15-LANE CAPACITY AUTHORIZATION (2026-10-13)

Owner now designates ChatGPT/Codex as the single GitHub/Jules controller: inspect actual session capacity, existing PR/issue ownership, current main and finish gaps at every scheduled checkpoint; recover approved lanes, proactively dispatch distinct evidence-backed work toward 15 confirmed active Jules tasks, independently review and integrate eligible changes, and request owner input only for defined owner-gated decisions. Scheduling must be proven by real execution logs.

The 2026-10-13 owner direction supersedes prior new-task per-issue approval and ban on targeting 15 **within already approved Cartilla scope**. The ChatGPT/Codex controller may dispatch nonoverlapping, specific, verified tasks; the owner-only product/design/security/spending/release gates in the current documents remain binding.

The previous ChatGPT Cartilla GitHub Controller was verified disabled on 2026-10-13; keep it disabled to avoid a second dispatcher. Muse is supporting historical evidence, not a current dispatcher. Do not assume any scheduler or worker ran without a live receipt.

ChatGPT/Codex coordinates and dispatches existing work, reviews evidence and integrates only with required approvals; Jules implements and runs applicable tests. Muse supplies supporting records. No competing worker infrastructure is authorized.

---

## STOP — OWNER CREDIT / ANTIGRAVITY DENY-BY-DEFAULT GATE (2026-10-11)

**Applies to every agent, dispatcher, Jules worker, reviewer, scheduled observer, connector and desktop/CLI operator. Overrides ALL older instructions suggesting Antigravity as a fallback or authorizing its launcher.**

- **Google Antigravity / Google Gravity is FORBIDDEN by default**: never start, connect, invoke, route tasks through, or consume its weekly quota via the GUI, CLI, PowerShell launcher, models, plugins, or indirect agent/workflow calls.
- Access to the user's PC/CLI, DeepSeek harness, GitHub, Jules, Desktop Commander, or older Antigravity integration does **NOT** grant Antigravity authorization. Do not invoke Antigravity even to check remaining quota, troubleshoot usage, or test this prohibition.
- **Before** using Antigravity, require a **new, explicit, task-specific advance owner approval** naming Antigravity and the intended scope. Silence, historical permission, a tool being connected, fallback logic and broad "continue working" instructions are NOT approvals. Where permission is unknown, DENY, do not try the tool, and continue only with independently approved non-Antigravity paths.
- For any other new paid, credit-consuming or quota-limited service outside previously authorized scope, stop and obtain explicit owner approval before an operation that could spend credits. No automatic provider escalation.
- If a task cannot proceed without prohibited access, report the precise dependency rather than silently using the connected launcher. Any pre-existing local Antigravity launcher/agent must stay unused until the owner grants new explicit permission.
- This repository rule **does not itself technically disable the laptop launcher**; verify the laptop execution path separately before claiming a technical block.


## STOP — OWNER PROACTIVE 15-LANE JULES + LATEST-APPROVAL-ONLY VISUAL GATE (2026-10-13)

**HIGHEST PRIORITY FOR ALL AGENTS, JULES, DISPATCHERS, WATCHERS, REVIEWERS, SUPERVISORS, AUTOMATIONS AND REPORTS. Overrides older instructions anywhere in the repository, issues, PRs, historical screenshots, memories or prompts.**

1. **OWNER-AUTHORIZED PROACTIVE JULES DISPATCH — 2026-10-13.** Emilio confirms he has Pro access to 15 Jules lanes and explicitly authorizes ChatGPT/Codex, the designated primary controller and GitHub dispatcher, to seek up to **15 provider-confirmed productive sessions** with real unfinished Cartilla implementation, reproducible debugging, focused regression QA, responsive/accessibility polish, source-faithful UI work, and measured risk-reducing cleanup. The ChatGPT/Codex controller may start a NEW bounded task or apply the `jules` dispatch label without a second issue-by-issue permission request **only when** current main/source/finish-contract evidence proves a real gap; the task is not already fixed, assigned or duplicated; it has distinct file ownership, acceptance proof and cleared dependencies; and it remains inside already approved product, visual and infrastructure scope. Recover existing stalled/failed approved lanes first. The 15-lane goal is utilization, not proof of available provider quota or permission to invent filler. **Separate owner approval remains mandatory** for owner-gated art/voice selections, new or changed owner-locked visuals, held tasks, live student-data/Supabase changes, security/retention policy, spending, external account access, destructive/irreversible actions, new infrastructure and final production release. Removing a label does not confirm provider cancellation.
2. **Only the LATEST expressly approved visuals and mechanics may be worked on or shown.** Compare the newest owner's instructions with current `main`, the original physical book and the canonical `WORKBOOK_ARCHETYPE_STANDARD.md` and `STUDENT_INTERACTION_STANDARD.md`. Stale branches, mockups, dev-only shapes, prior screenshots, old PRs and previous memories cannot override current approval. Never implement, display as current, dispatch or revive superseded/rejected visuals. Read historical files privately only to diagnose a current fault.
3. **NO ROPE/LASSO — final explicit owner rejection (2026-10-11).** Use the approved source-faithful wooden pencil/green-or-red marks/physical pink eraser and correct line-matching mechanics. PR #692 removed the obsolete `LassoConnect.tsx` and rope CSS; PR #694 preserves legacy completed syllable selections under the new pencil circle. These are merged; DO NOT restore a rope, lasso, reel, arcade, fake red-X or unapproved alternative. Current components: `PencilConnector.tsx`, `WorkbookPencilMark.tsx`, `SyllableWordCircle.tsx`; these still require real screen validation.
4. **No stale or fake approval evidence.** A merge, code review, unit test, Jules receipt or local dev fake does NOT prove visual approval. Fresh proof must depict the REAL source-faithful Student Workbook or Teacher/Flip Chart page at the exact verified commit/deployment, with the latest approved pencil/eraser, on the stated viewport/device; screenshots from `/dev-*`, old Vercel previews or synthetic demos are prohibited as owner approval evidence. Missing actual proof means **NOT APPROVAL-READY**; no historical substitution or unapproved release.
5. **Precedence:** the owner's latest explicit 2026-10-13 authorization to proactively refill verified useful Jules capacity supersedes older 'never target 15', 'no automatic refill', and blanket new-task per-issue approval instructions. The latest source-faithful product designs, owner-only approval/release gates, credit/Antigravity prohibition and evidence standards remain fully binding. ChatGPT/Codex is the single primary dispatch controller; do not restore obsolete ChatGPT dispatch schedules, a rival controller, retired Windows/Neon/OpenHands infrastructure or paid systems.


You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it.

## STOP — MANDATORY EVIDENCE-FIRST DISPATCH GATE (EVERY AGENT, EVERY SESSION)

**This applies to EVERY coding agent, Jules worker, controller, supervisor, reviewer, and AI assistant reading or operating on this repository. Re-read this section from CURRENT `main` before creating an issue, task, prompt, session, test assignment or PR, and before reassigning any work. Do not rely on another agent remembering it.**

**Aim for 15 useful, independently justified, provider-confirmed Jules sessions, never filler.** Do not invent defects, generic cleanup/optimization/QA, made-up acceptance criteria, speculative tasks, or unnecessary research. **Prove there is valuable unfinished work BEFORE dispatching it.** In one focused existing-work check:

1. **Compare against the actual finish requirements and current code.** Identify an observable user-facing defect, reproducible regression, real security/accessibility/performance problem, or explicit unfulfilled requirement, with exact file/source evidence and meaningful expected result.
2. **Check existing ownership and proof FIRST:** current `main`, recent merged PRs, open issues/PR heads and diffs, Jules session/task receipts and review state, existing passing tests/screenshots, dependencies, owner decisions and exclusive file ownership. If already fixed, verified, assigned, under review, owner-gated or superseded, **DO NOT dispatch again**. A stale issue title is not evidence of unfinished work.
3. **Prefer advancing the existing lane:** review real changed files, validate targeted results, request the *specific missing correction on the same issue/PR/session*, or integrate independently verified work when allowed. A new task requires a proven separate gap that cannot be completed in a currently owned lane, with a nonoverlapping file scope and concrete acceptance test.
4. **Only then dispatch** via the established authorized Jules GitHub trigger once; confirm the provider's bot task receipt, and later actual material code/tests/browser proof. A label, acknowledgement, new issue, prompt, completed-but-empty PR or activity report alone **does not count as accomplishment**.
5. **Fill every verified available Jules slot with genuine independent eligible work.** If fewer than 15 such assignments exist, leave the remainder empty and report the exact reason, not a fabricated occupancy count. Never schedule duplicate, speculative, owner-held or dependency-blocked work.

**Required pre-dispatch decision:** `REAL GAP + CURRENT EVIDENCE + NOT ALREADY OWNED/DONE + DISTINCT VALUE + CLEAR SCOPE + ACCEPTANCE PROOF + WITHIN OWNER AUTHORIZATION`; if any term is missing, do not issue a prompt or create/label a task. Owner authorizes routine bounded Jules work by category under the 2026-10-13 top-of-file gate; owner-only product, security, cost and release approvals remain binding.

### Ownership uncertainty is FILE-LOCAL, not a blanket execution stop — owner correction 2026-10-13

**Applies to an ALREADY AUTHORIZED implementation session (Opus, Jules or other worker).** The pre-dispatch controller capacity/ownership check above determines whether the ChatGPT/Codex controller may start a **new Jules task**; it is **not** an additional requirement that every existing worker must personally authenticate to Jules before editing any disjoint file. A missing provider connector, unverified old session status, broad issue title, historic branch, or closed/zero-diff PR must not be treated as proof that every file in a multi-part task is locked.

1. **Split the assigned deliverable by actual files and dependencies.** Compare current code, active PR changed-file lists, explicit live ownership/handoffs, and existing agent reservations. Mark each part `CLEAR` (no evidenced collision), `CONFLICT` (same files or state truly owned), or `UNCERTAIN` (specific possible overlap). Do not claim definitive provider status from GitHub alone.
2. **Continue `CLEAR` implementation immediately in the EXISTING authorized session**: make a focused code change, add/run directly affected regression tests, and persist the material patch/PR where allowed. A potential conflict in another part does not cancel independent work. Do not create another agent, issue, session, or duplicate scope to get around the check.
3. **Pause only `CONFLICT`/`UNCERTAIN` files or coupled changes that would overwrite another active lane.** Send the ChatGPT/Codex controller the exact paths, candidate owner/issue, evidence, and smallest ownership decision needed. Keep working on disjoint code/tests while Muse reconciles. Do not presume a historical owner has relinquished a file merely because their PR is closed; do not presume an active lock merely because an issue is open.
4. **If no safe executable part remains**, show a concrete per-file conflict matrix and the specific unresolved owner dependency, along with any useful finished patch/test evidence. Only then report that the entire session is blocked. `No Jules connection` alone is never a sufficient all-work blocker.
5. **After the ChatGPT/Codex controller resolves ownership**, resume the held portion on the SAME session/branch when authorized; reconcile the latest `main` before integration. Owner-only art/voice/security/release and payment gates remain intact. Never edit a known-conflicting file, falsify exclusive ownership, or bypass an explicit hold.

**Concrete boundary example:** If Workbook issue #495 may own `src/routes/cartilla/-leccion-view.tsx` or `src/routes/cartilla/cuaderno.tsx`, hold changes to those route files pending controller ownership reconciliation. That uncertainty **does not by itself block** independent `src/components/cartilla/WorkbookWritingResponse.tsx` corrections and focused tests when current evidence shows no conflicting owner. Confirm this exact example against current PR/file ownership before acting; it is a rule illustration, not proof of today's Jules sessions.

**Required worker outcome:** `IMPLEMENTED + FOCUSED PROOF` for every safely actionable portion; `HELD + EXACT FILE/OWNER REASON` only for the overlapping portion. A full `FAILED/BLOCKED, ZERO CHANGES` outcome requires evidence that *every* material portion is actually unsafe or otherwise impossible within approved constraints.

---

## OWNER SUPERSEDING DIRECTIVE — ACTIVE TOOLS ONLY (2026-10-10)

- **Historical owner clarification, October 10, 2026 — superseded scheduler authority.** The old local Windows `CartillaJulesAutoRunner` script and its Vercel/Neon/OpenHands paths remain retired, disabled and forbidden. The separate hourly ChatGPT cloud coordination task was briefly enabled in October, but is now verified disabled; ChatGPT/Codex is the current authorized controller and dispatcher. Historical enabled states are not evidence of active sessions or an instruction to restart.
- **No invented continuity.** A saved prompt, plugin skill, watcher label, enabled check, completed task, or successful exit code is not proof that autonomous work is happening. Only actual current GitHub changes, authorized official Jules provider receipts, relevant test evidence and real PR outcomes count. Do not claim background dispatch, a working webhook, or occupied agent capacity without live independent evidence.
- **Current means current.** Before acting, read today's owner directives and the current `main` versions of this file and its canonical instructions. Superseded issue text, stale branch `AGENTS.md`, old Engram entries and historic assumptions do not regain authority. Do not use outdated tools or workflow instructions.
- **Use Jules proactively for distinct ready work.** Check current main, existing PR/issue ownership, actual Jules provider sessions and remaining quota; recover existing work first; then dispatch nonoverlapping implementation, debugging, focused QA and relevant visual polish up to 15 actual productive sessions through the authorized GitHub/Jules integration. A label is not a running worker. Do not revive any retired scheduler or deploy production without approval.
- Historical uses of **controller, supervisor and watchdog** below describe review/coordination responsibilities only; they **do not authorize** resurrection or invocation of the retired infrastructure. This owner directive takes precedence over any older execution language while preserving the existing product acceptance and security rules.

## CANONICAL INSTRUCTION HIERARCHY

There are ten active repo-wide instruction files:

1. AGENTS.md — execution, safety, Git, and deployment rules.
2. PROJECT_FINISH_DEFINITION.md — canonical owner-locked definition of what must be true for the entire project to be finished.
3. PROJECT_SOURCE_OF_TRUTH.md — current product state, priorities, and owner-decided scope.
4. CARTILLA_DIGITAL_DIRECTIVE.md — authoritative Cartilla structure, content, fidelity, and presentation rules.
5. WORKBOOK_ARCHETYPE_STANDARD.md — owner-locked visual system for recurring Student Workbook exercise families.
6. ASSET_FIDELITY_POLICY.md — active artwork, image, color-transfer, and motion rules.
7. STUDENT_INTERACTION_STANDARD.md — canonical owner-approved student Workbook interaction and motion language.
8. DESIGN.md — durable visual system and taste contract for Workbook, Flip Chart, shared school-tool UI, and page-turn presentation.
9. UX-CONTRACT.md — observable interaction/state contract, including the shared student interaction kernel and physical page-turn behavior.
10. repo.md — authoritative, locked method for Workbook and Flip Chart background-only generation.

### PROJECT FINISH DEFINITION — MANDATORY

PROJECT_FINISH_DEFINITION.md is the canonical owner-locked finish contract.

- Read it before planning meaningful Cartilla work.
- Every run/session must reason from **FINISHED GOAL → CURRENT VERIFIED STATE → REAL GAPS → PROOF REQUIRED**.
- Issues, PRs, Jules sessions, and task prompts are work units, not the product goal.
- Advance existing canonical work that closes a real finish gap before creating another lane.
- Never lower, reinterpret, or silently move the finish bar.
- Never claim the **project** is finished until every required criterion in PROJECT_FINISH_DEFINITION.md has objective proof.
- New explicit owner decisions may update the finish contract; ordinary implementation discoveries update the current gap plan instead.

Anything under `docs/archive/` is historical reference only and must not override any file above.

## EXECUTION CONTROL CONTRACT — GLOBAL POLICY

`AGENTS.md` is the only place that defines global execution policy and numeric concurrency. No issue, PR, comment, bot/Jules prompt, task file, automation, or historical document may silently override this contract.

### Definitions

- **Controller** — chooses scope/order, integrates, reviews, and merges. It is not a worker lane.
- **Supervisor** — scheduled controller/dispatcher. It is not a worker lane.
- **Watchdog** — fallback controller. It is not a worker lane.
- **Implementation worker lane** — one active external coding-agent session doing implementation or worker-level verification.
- **Read-only specialist investigation** — analysis/research/review that does not modify repository state.
- **PR** — persisted candidate work. An open PR does not equal an active worker lane.
- **Ready for review / completed Jules session** — not an active worker lane.
- **Verification-only Jules session** — counts as an implementation worker lane while actively running.
- **One session = one bounded deliverable.** This is per-session scope, not a global concurrency limit.

### Worker concurrency

- **15 PRODUCTIVE ACTIVE JULES LANES IS THE OWNER'S UTILIZATION TARGET, not a mandatory quota.** Owner confirms Pro/15-lane access; still verify live provider quota and count. Refill only with unique, proven, dependency-ready work within the 2026-10-13 dispatch authorization. Never invent work, bypass owner-only gates, upgrade plans or spend credits.
- **Automatically refill verified idle slots from distinct eligible work** after inspecting actual Jules sessions, exact PRs/issues, dependencies and source evidence; resume existing valid sessions first. A new task needs a documented current gap and nonoverlapping bounded acceptance, but does NOT require repeat issue-specific permission when within the owner's 2026-10-13 approved scope.
- **Maximum concurrent independent read-only specialist investigations: 3.**
- Controller, supervisor, and watchdog activity does not consume implementation-worker capacity.
- Dependency chains and overlapping file ownership remain sequential even when Jules capacity exists.
- A blocked, completed, owner-gated or dependency-waiting lane must not count as active Jules utilization. Reconcile/cancel provider state when authorized, then fill available capacity only with distinct eligible work. Do not dispatch against a held issue.
- Seek 15 productive sessions by surfacing real code/finish-contract gaps, not by manufacturing tasks. Only source-backed independent work qualifies.
- Other active documents may describe current allocation or sequencing, but they must not define a competing numeric concurrency rule.


### Jules capacity census and evidence-first proactive dispatch — owner-authorized 2026-10-13

The owner explicitly **RESTORED productive refill toward up to 15 active Jules sessions on 2026-10-13**. Superseded 2026-10-11 ban and blanket issue-by-issue new-task gate are no longer operative within authorized Cartilla implementation, bugfix, focused QA, accessibility and verified polish scope.

Mandatory controller actions (provider verification first):

1. **Count actual provider states** from the authorized Jules account's real session/task listing, cross-checked with GitHub issues, receipts, branches, PRs and exact heads. A `jules` label, bot acknowledgement, open PR, old branch or numeric target is NOT evidence of a running worker.
2. **Report available capacity honestly and fill qualified openings**; never infer available quota from a plan label, a scheduled observer or a GitHub `jules` label.
3. **Recover stalled or failed work only on its EXISTING owner-approved lane/issue.** Do not open a competing session.
4. **A NEW Jules task** may be dispatched by the ChatGPT/Codex controller if the existing finish contract/current main proves a distinct unfinished requirement, no other lane owns it, it stays within the owner-authorized scope, and there is confirmed provider capacity. Document the exact source evidence, file boundaries and acceptance. Do not dispatch owner-gated/held work without specific owner permission.

**Safety and finish boundary:** target utilization never bypasses owner-gated approvals, final-art/voice restrictions, merge/release verification, Jules-only normal tests, cost controls or the no-duplicate-work contract. Do not start purposeless audits, reopen verified merged work or delete historical branches to make a count look better.

### Continuous development, testing and visual polishing — JULES-FIRST, ZERO DUPLICATE WORK

Every controller, supervisor, watchdog, dispatcher, reviewer and worker must **consider three streams** while planning, assigning and handing off material work: (1) implementation/repair; (2) focused tests of available implementation; (3) actual rendered UI proof and visual polishing when relevant. **Consider does not mean redo.** Check existing issue/PR evidence and its exact code revision FIRST; reuse completed, still-valid test results, screenshots, reviews and fixes without rerunning or redispatching them.

**Jules is the default hands-on test/verification and UI-browser-check executor.** Jules tests its own changes; separate verified, nonoverlapping QA/device proof or polishing slices may run concurrently when independently useful and within the 2026-10-13 owner authorization. Other agents may inspect GitHub evidence, triage, coordinate and review but must not needlessly duplicate test runs. Avoid rerunning unchanged full audits. An unusually long distinct agentic test may use another authorized worker only when justified, approved and not duplicative.

**Act without delay, never repeat:** compare existing proof to its relevant code/fixtures/test/config/browser inputs, not blindly to the global main SHA. Unrelated docs-only commits or unrelated changes do NOT invalidate still-applicable focused evidence. If an affected behavior changed, a real failure emerged, or a distinct final release check is required, give only that missing test or UI-proof slice to Jules on its EXISTING lane with exact source commit, missing coverage, and a clear expected result. If existing valid focused test/screenshots cover it, record `DONE — REUSE PROOF` and move on; no duplicate session. A PR with zero material file changes or only a Jules 'done' claim is NOT implementation completion: reconcile the already-existing owner/work branch and demand actual diff or an explicit verified no-change finding.

**Compact handoff for every material assignment:** state what is being built; what **already passed** with exact source/revision; what additional Jules test or UI polish (if any) remains; Jules task/owner and next action. Write `DONE — REUSE PROOF` or `NOT APPLICABLE` instead of scheduling redundant work. No three-agent mandate, no additional reviewer/test gate beyond the required evidence-first dispatch decision, no obsolete two-worker cap, no duplicated Jira/GitHub tasks, no mandatory full-suite run on every worker, no waiting for optional reviewers or tools.

**Fail fast without blocking:** if a non-Jules executor encounters repeated memory/time/browser failures, stop futile retries and give Jules the surviving work and concise reproduction/evidence. If Jules is unavailable, rate-limited or has a failed run, leave exactly one pending check on its existing lane, keep unrelated implementation/coordination moving, and do not present unverified work as tested or merge/release work whose required evidence is missing. Diagnose once and correct the existing task; do not create an endless redispatch loop. Only exceptionally long, specifically justified agentic tests may use another authorized test worker.

### Early, nonduplicative QA and proactive refill — owner-authorized 2026-10-13

**Aim for up to 15 provider-confirmed useful Jules sessions.** Do not manufacture activity. At session start, worker checkpoint, completion/failure, merge or dependency-unblock event, refresh current `main`, issues/PRs and actual provider sessions; recover original lane first, then dispatch available independent eligible work. Labels, acknowledged tasks, old branches or open PRs do not prove active utilization.

At each refresh consider (1) implementation/repair; (2) focused code inspection and regression QA; (3) rendered UI/device proof, accessibility, and visual polish. Reuse valid completed proof FIRST. The ChatGPT/Codex controller may start a NEW independent task within the 2026-10-13 owner-authorized scope after documenting its distinct evidence and ownership; otherwise request specific owner approval. Do not duplicate existing lanes or weaken product tests.

**Early handoff, not final-day QA:** as soon as Jules has a material, targeted-checked implementation checkpoint, publish its actual diff/PR and assess independent QA, code-quality, accessibility and rendered-proof slices. Existing owner work receives corrections on the same lane; independently proven disjoint tasks may be assigned concurrently under the 2026-10-13 authorization. True dependency chains remain sequential.

**Empty slots are an invitation to inspect for real independent unfinished work, not permission to invent tasks.** If fewer than 15 qualified scopes exist, report the actual shortfall and owner/dependency reasons. Count only provider-confirmed running sessions and material progress.

**Historical-branch safety:** every worker resuming a non-`main` branch must fetch **CURRENT `main` versions** of `AGENTS.md`, `PROJECT_FINISH_DEFINITION.md`, `PROJECT_SOURCE_OF_TRUTH.md`, and `tasks/plan.md` before work or merge. Old snapshots, issue bodies, controller branches, and saved memory never reinstate a SonarCloud-required merge gate, retired Neon/OpenHands dispatch architecture, obsolete two-worker caps, duplicate testing, or owner-blocked work. Preserve old branches as history; do not mass-merge/rebase them merely to modernize prompts.

### Precedence: two different questions

**WHAT CURRENTLY EXISTS**

1. Current live/runtime evidence when relevant.
2. Current code/configuration on the relevant branch.
3. Current canonical documentation.
4. Active task/PR evidence.
5. Historical evidence.

**WHAT THE PRODUCT SHOULD BECOME**

1. Latest explicit owner decision.
2. `AGENTS.md` for execution/safety.
3. `PROJECT_FINISH_DEFINITION.md` for the owner-locked finished-state contract.
4. `PROJECT_SOURCE_OF_TRUTH.md` for current product goal/scope.
5. The canonical domain document for the subject.
6. `tasks/plan.md` for current coordination/order only.
7. Issue body for issue-specific scope only.
8. PR descriptions/comments/worker output as evidence only.
9. Historical/reference docs.

The physical source PDFs remain authoritative for source fidelity, curriculum, page structure, wording, and source content within their domain. Derived runtime data does not replace that source authority.

Documentation under `docs/proofs/`, `docs/completion/`, `docs/research/`, and other evidence/reference areas is not active project policy unless the canonical hierarchy explicitly says otherwise. Archived material is historical only.

### PROJECT SOURCE OF TRUTH MAINTENANCE — OWNER APPROVAL REQUIRED

`PROJECT_SOURCE_OF_TRUTH.md` is the canonical current-state snapshot for this project.

- Read it before meaningful project work.
- After a **significant verified milestone**, check whether it has become materially stale.
- Significant milestones include a major feature or phase becoming verified complete, an owner-approved scope or product decision changing, a major blocker appearing or being resolved, architecture/deployment direction materially changing, or the project moving to a new major phase.
- Routine commits, formatting, minor fixes, ordinary PR progress, small refactors, test maintenance, and temporary experiments do **not** justify updating it.
- If an update is warranted, prepare the smallest factual correction and show it to EJN for approval. Do not change or merge the source-of-truth update without EJN's explicit approval unless the currently approved owner task specifically includes that source-of-truth update.
- Current verified code/runtime behavior and newer explicit owner decisions override stale statements in the file. Flag the stale statement and propose the correction rather than silently following it.
- Keep the file as a concise current snapshot, not a changelog, task tracker, or history log.

## MANDATORY LIVE COORDINATION CONTRACT — EVERY SESSION

GitHub live state is the shared handoff between agents. Memory, chat summaries, Miro, scheduled-task prompts, and stale documentation are never sufficient by themselves.

### Start-of-session read
Before any meaningful Cartilla work, every controller, reviewer, supervisor, watchdog, and implementation worker must resolve and read:
1. CURRENT `main` SHA;
2. the current `AGENTS.md`, `PROJECT_FINISH_DEFINITION.md`, `PROJECT_SOURCE_OF_TRUTH.md`, and `tasks/plan.md`;
3. the relevant existing issue and PR, including the latest comments, exact head SHA, changed-file set, checks, and material diff;
4. other open PRs/issues only far enough to detect overlap, dependencies, supersession, or newly unblocked work.

Do not begin from an old chat/session summary when current GitHub state is available.

### Mandatory publish-after-change
After any MATERIAL change, the agent that caused or verified the change must publish a compact handoff to the EXISTING relevant issue or PR before ending the session. Do not create a duplicate coordination issue merely to report status.

A material change includes:
- a real code/content diff;
- a new blocker or blocker resolution;
- a changed PR head that invalidates prior proof;
- a review finding that changes merge readiness;
- a merge, closure, supersession, or newly unblocked dependency;
- a completed verification result that materially changes project status;
- an owner decision that changes scope/order.

The handoff must state, when applicable:
- STATUS: DISPATCHED / ACKNOWLEDGED / ACTUALLY RUNNING / MATERIAL WORK PRODUCED / VERIFIED / BLOCKED / MERGED;
- exact issue/PR and head SHA;
- exact material files changed, or explicit `0 material files`;
- checks/proof actually completed;
- blocker, if any;
- next action and owner of that next action.
- continuous build / focused test / visual polish status for the affected slice: reuse valid proof as `DONE — REUSE PROOF`; otherwise identify the bounded Jules assignment or `NOT APPLICABLE`. The note never triggers duplicate checks or delays unrelated work.

Empty commits, timestamp-only changes, metadata churn, repeated test reruns, bot acknowledgements, open PRs, and head-SHA changes with 0 material files are NOT progress and must be reported as such.

### Canonical coordination snapshot
`tasks/plan.md` is the concise current coordination snapshot, not a history log.
- A controller/supervisor must refresh it whenever lane ownership/order, blockers, merge readiness, or current-main baseline materially changes.
- Do not update it for trivial worker chatter or every commit.
- Every refresh must use CURRENT GitHub state and remove stale lane claims rather than appending contradictory history.
- New sessions must treat live GitHub issue/PR evidence as newer than a stale `tasks/plan.md` line and must reconcile the file when coordination materially changed.

### No silent session exit
A worker or coordinator may not finish a session after material work without leaving the GitHub handoff above.
If no material work occurred, say so explicitly on the existing lane when a prior dispatch/acknowledgement could otherwise be mistaken for progress.

## AVAILABLE DEVELOPMENT TOOLS — USE THEM AUTOMATICALLY

EJN should not have to choose or manually invoke engineering tools. When the current agent environment exposes specialist skills, MCPs, connectors, browser tools, or coding workers that materially improve the task, use the narrowest relevant capability automatically.

- Use direct GitHub/repository tooling for current repository facts instead of guessing from old prompts or reports.
- When framework/library/API behavior matters, verify it against current authoritative documentation using the available documentation-retrieval capability.
- Use upstream developer search only when maintainer issues/PRs or external evidence could materially change the conclusion.
- For bugs, use root-cause debugging before changing code.
- For security-sensitive work, use the available security/hardening specialist.
- For measurable performance problems, use the available performance specialist.
- For visible UI work, rely on current Jules-produced real-browser proof, and assign missing or invalidated rendered checks to Jules; code inspection alone is not sufficient. Do not duplicate an existing valid screenshot/test run.
- Independently review meaningful diffs and existing exact-head evidence as required; this does not authorize duplicate test/browser execution by coordinators.
- Run at most 3 genuinely independent **read-only specialist investigations** when they do not share mutable state or sequential dependencies. Implementation-worker concurrency is governed only by the Execution Control Contract above.
- Reuse still-valid evidence instead of repeating unchanged audits, tests, reviews, or browser checks.
- If a preferred specialist is unavailable, use the strongest safe equivalent. Do not block work merely because one optional tool is missing.
- Do not add a new account, paid service, plugin, framework, or workflow unless the existing stack materially cannot meet a real current need and EJN approves any consequential cost or lock-in.

These tools support the repository rules; they do not override `AGENTS.md`, `PROJECT_SOURCE_OF_TRUTH.md`, owner decisions, or current verified repository/runtime evidence.

### EXTERNAL CODING AGENT ORCHESTRATION — JULES-FIRST FOR PARALLEL IMPLEMENTATION

Jules is an approved primary implementation worker for Cartilla because the owner has available Jules capacity. Use verified capacity for **parallel, isolated coding work that passes the evidence-first dispatch gate**; do not invent tasks or treat idle slots as evidence of missing assignments.

Jules is a worker, not the project controller. The controller owns scope selection, dependency ordering, review, release verification, merges, and recovery.

#### How to assign Jules

- Prefer Jules for concrete implementation, bug fixes, focused refactors, targeted tests, and narrow UI work that can run independently in its own environment.
- Run multiple Jules sessions in parallel when their file ownership and dependencies are genuinely isolated.
- One session = one bounded deliverable. Do not combine unrelated lanes or a long dependency chain into one session.
- **Persist progress early:** after the first material implementation change passes its narrow targeted check, commit/push that material checkpoint and open or update the task PR immediately. Do not wait until the end of the session to create the PR. Continue subsequent work on that same branch/PR so a later session failure cannot erase useful progress.
- **Supervisor export checkpoint:** Jules supports exporting work to GitHub before a task finishes. When a substantial Jules session has produced its first material, targeted-checked change and no remote branch/PR exists yet, the controller/supervisor must use Jules' **Export at any time** GitHub control to publish that checkpoint immediately. Do not depend on end-of-session export for substantial work.
- Reuse the existing issue/branch/PR when one already exists. Do not create duplicate competing work.
- Give each session explicit owned files/behavior and explicit forbidden scope.
- Start from CURRENT `main` and current repo instructions. Older task snapshots, prior bot comments, and archived docs never override current truth.
- For Student Workbook visual work, Jules must preserve the owner-approved clean digital-canvas distinction: dense learner exercises do not use full scenic wallpaper; existing scenic assets remain preserved on disk but are **not** default teacher Flip Chart backgrounds; the Flip Chart uses clean paper while retaining source instructional foreground scenes. Do not delete/regenerate assets or alter the Flip Chart as part of a Workbook UI task.
- For Student Workbook visual realignment, Jules must read and obey `WORKBOOK_ARCHETYPE_STANDARD.md`. The owner has approved the eight recurring archetype designs as the visual system; the old Page-1-only golden gate is superseded. Page 1 remains the representative source for archetype 1, not a global blocker. Reuse one canonical implementation per archetype, preserve each exact physical source page, keep pages 86–87 source-blocked, and do not absorb #497 living-motion debugging or the closed historical #454 color-remediation work or the owner-gated final-art #588 lane into archetype work.

#### Early checkpoint and recovery contract

A Jules session must establish viability early before spending most of its run:

1. confirm the target branch/PR and CURRENT `main`;
2. confirm the required files are accessible;
3. identify the intended material code change;
4. run the narrowest relevant pre-change check or reproduction;
5. begin the actual implementation.

If Jules cannot access the required branch/files, hits a tool/quota/auth/environment failure, discovers a scope conflict, or cannot make the required material change, it must report that blocker immediately rather than spending the rest of the session on generic inspection or full-suite testing.

A session that produces no material tree change when implementation was requested is not progress. Empty commits, timestamp changes, metadata churn, repeated test reruns, or review-trigger commits are prohibited.

#### Jules-safe verification rule

Implementation sessions must NOT run commands that mutate the tracked asset tree merely to prove unrelated code work.

For ordinary implementation work, Jules workers MUST NOT run:
- `pnpm prepare:art`;
- `pnpm build`;
- `pnpm build:app`;
- `pnpm verify:release`;
- `pnpm dev`.

Those commands are allowed only when the task explicitly owns production-art generation or is a dedicated clean-checkout release-verification task.

Jules implementation workers use:
- the narrow targeted Vitest/Playwright test(s) or checks for the changed behavior;
- `pnpm typecheck` when relevant;
- `pnpm verify:worker` when a broader non-mutating repository check is useful;
- `pnpm dev:worker` for browser/runtime work without invoking art generation.

A dedicated verification-only Jules session may run `pnpm verify:release` in a clean checkout when full release verification is itself the assigned job. In that case it must not export/regard regenerated delivery assets or manifests as implementation changes; it reports the verification result only.

For ordinary implementation lanes, the **dedicated Jules release-verification worker** (not the controller) runs the mutating/full production pipeline **only when a necessary assembled-release gate is actually due**, in a clean verification checkout after the implementation PR is persisted. The controller reads that worker's raw results and reviews merge readiness; it does not run another copy of the tests/browser checks. Generated release artifacts from that verification checkout are verification output, not worker-scope changes unless the owning issue explicitly requires them. The exceptional long-test alternative in the non-blocking rule above is the only alternate test executor.

#### Verification boundary

Jules should use its environment to prove its **own bounded change** with targeted tests/checks and, for visible work, representative browser evidence when practical.

Jules is **not required to consume its session running the entire project release gate** before handing back a candidate implementation. The controller owns:
- independent diff review;
- reconciliation of actual reproduced defects and test evidence;
- coordination of final `pnpm verify:release` performed by a dedicated Jules verification lane, or a specifically justified unusually long test runner;
- review of Jules-produced cross-lane regression evidence, not duplicate reruns;
- review and sharing of Jules-produced final browser/device proof;
- merge readiness and merge;
- dependency activation and release.

The controller assigns missing final or cross-lane verification to Jules as a dedicated bounded task, reuses all still-valid evidence, and does not mechanically append the full release suite to every coding session. A genuinely unusually long agentic test may be assigned to a suitable isolated runner only if Jules is impractical for that specific test.

#### Failure handling

- Do not repeatedly relaunch the same failed Jules instruction unchanged.
- On a worker failure, the controller diagnoses once from existing results and corrects the SAME Jules task or assigns unrelated available implementation work. A controller may fix coordination/code within its authority, but must not take over Jules-owned testing/browser runs or launch duplicate test lanes.
- One failed Jules lane must never stall independent Jules lanes or controller-owned work.
- Jules never self-merges and never deploys production.
- Owner intervention is required only for a genuine owner-only decision, asset, authentication step, or irreversible action.

### WORKER PROOF + WATCHDOG SAFETY — code/behavior PRs (owner decision 2026-10-09)

**Jules is the implementation and focused-test worker.** The GitHub dispatcher routes tasks; the watchdog/controller reconciles scope, dependencies, actual code changes, necessary tests and merges. Antigravity is **prohibited by default under the owner credit gate above**, never a fallback or prerequisite for Jules, GitHub dispatch, testing, merging or the watchdog.

- **SonarCloud/SonarQube is ADVISORY and NON-BLOCKING.** Keep the existing analysis visible; no quality gate, scan status, unavailable integration, bot comment, duplication percentage, or Sonar signoff is required for dispatch, continuation, or merge. A substantive defect independently confirmed by review or Jules proof still blocks the affected change. This owner-approved policy supersedes older mandatory-Sonar wording in historical comments or Engram. Do NOT restore Sonar as a required GitHub check.
- **Small executable pre-merge evidence check:** The designated controller uses `node scripts/check-merge-policy.mjs --evidence <receipt.json>` to assess the current PR's material file list, current-head and test validity, existing independent review, owner authorization, UI proof applicability, and confirmed serious defects; Sonar result is recorded only as advice. Document-only PRs require controller review but no Jules product-test rerun. Reuse the existing Jules proof; no duplicate tests, new worker, GitHub Actions, or new infrastructure. This CLI is a local/controller decision check, NOT a GitHub server-enforced restriction; do not claim it prevents an unrelated actor from bypassing the script. Before a final release check, `pnpm verify:policy` verifies the four active policy documents.
- Jules must commit **material file changes** and provide the exact PR head SHA and focused raw test results; do not count an empty commit, bot acknowledgement or Jules Completed state as verified work.
- The watchdog/controller must inspect current `main`, the material PR diff, overlap, scope and dependencies, and Jules' existing raw focused-test outcomes without repeating the tests. Require existing or newly assigned Jules browser/device evidence where visible interaction actually changed. Reuse valid evidence across unrelated/doc-only commits; never gate a disjoint implementation lane on unrelated tests or a failed service.
- Antigravity is **not a permitted fallback**. Do not launch its CLI/watchdog even to test availability or usage; continue with independently authorized GitHub/Jules work and preserve owner-only authorization boundaries.
- Before merging an existing PR, reconcile current `main`, verify the exact head and the relevant behavioral proof; after a material head change rerun only the evidence it invalidates. Fix actual serious bugs, regressions and conflicts, not tool status artifacts.
- Before merge, record exact head SHA, material changed-file list, applicable test command/results, observable UI proof if relevant, concrete unresolved problems and the merge decision. No Sonar-specific or second-reviewer signoff language is required.
- Full assembled-product `pnpm verify:release`, final browser/device validation and owner-gated approvals still apply to the eventual product release, **not** to every implementation task or unrelated PR. Preserve all applicable safety, source fidelity, security and owner approval rules.


---

## CARTILLA BOOK FIDELITY DIRECTIVE — HIGHEST PRIORITY FOR STRUCTURE / CONTENT / PRESENTATION FIDELITY

Before doing any work on the Cartilla Workbook or teacher Flip Chart, read
`CARTILLA_DIGITAL_DIRECTIVE.md`. It is the canonical Cartilla structure/content/presentation directive within that domain. It does not outrank newer explicit owner decisions or `AGENTS.md` execution/safety policy, but it supersedes older layout/fidelity instructions.

Before changing Student Workbook visual/layout treatment, read and follow `WORKBOOK_ARCHETYPE_STANDARD.md`. Before changing student Workbook interactions, also read and follow `STUDENT_INTERACTION_STANDARD.md`, `DESIGN.md`, and `UX-CONTRACT.md`.

Before generating or designing any Workbook or Flip Chart background, also
read and follow `repo.md`. It is the authoritative method for background-only
generation.

Before changing Workbook or Flip Chart navigation/page transitions, read and follow `DESIGN.md` and `UX-CONTRACT.md`. The physical page-turn behavior is presentation only; it must never bypass completion, save/restore, source fidelity, or teacher navigation rules.

**In brief:** Every page must have the same layout STRUCTURE as the physical
book (same elements, same arrangement, same order, same content) — but as a
modern, digitized, user-friendly, interactive digital product. NOT inch-for-inch
identical. The book defines WHAT goes WHERE. You define HOW it looks and feels
digitally.

The three layers:
- **STRUCTURE** (what goes where) → MUST match the book
- **CONTENT** (text, images) → MUST match the book. Approved foreground art stays source-faithful; only the narrow source-preserving color-transfer exception in `ASSET_FIDELITY_POLICY.md` is allowed. Scenic background generation, when explicitly approved, follows `repo.md`.
- **PRESENTATION** (styling, interactions) → MODERN digital. For recurring Student Workbook exercise families, the owner-locked presentation is defined by `WORKBOOK_ARCHETYPE_STANDARD.md`; agents do not invent a competing family style. Dense Student Workbook exercises use the clean digital canvas rather than full scenic wallpaper; the teacher Flip Chart uses clean paper without default background-image scenery while preserving original foreground scenes.

**Recognition test:** Would the teacher recognize this as that page from the book? If yes on structure, you got it right — even if the visual style is modern.

Authoritative source files (define the layout structure):

`Google Drive > Cartilla Production Hub > 01 Source Documents`

- `La Cartilla de Gretel Flip Chart.pdf`
- `Libro del alumno - Rescan and Optimize (2).pdf`

### Teacher Flip Chart / flipbook
The digital teacher Flip Chart must have the same layout as the source Flip
Chart. Same structure, same element positions, same reading order — presented
as a modern, interactive digital experience.

Match the source page's:
- layout structure and composition (where elements go);
- text, wording, line breaks, and reading order;
- illustration identity and placement.

Modern digital presentation is welcome: smooth interactions, responsive
behavior, clean modern styling. The layout follows the book; the finish is
modern.

### Student Workbook
The digital student Workbook must have the same layout as the source student
Workbook. Same exercise structure, same element positions — presented as a
modern, interactive digital experience.

Match the same layout structure, text placement, exercise flow, illustration
placement, and page sequence. Modern digital presentation is welcome.

For dense learner exercises, the active Workbook surface is the owner-approved clean digital canvas: do not render a full scenic image as wallpaper behind the exercise and do not use opaque white contrast slabs that make the page read like a pasted print artifact. Preserve existing scenic assets on disk instead of deleting or regenerating them; they may be used only in an explicitly owner-approved context, not as the teacher Flip Chart's default background.

### Images are source-locked
The approved/corrected/cropped book images are the artwork.

DO NOT:
- regenerate them;
- redraw them;
- replace them with similar artwork;
- remaster or "modernize" their style;
- change their line art, internal geometry, composition, pose, proportions, object count, identity, or educational meaning;
- guess or invent colors.

Two owner-approved exceptions exist:

1. **Source-preserving color transfer.** For an existing Workbook drawing, verified color may be transferred from an exact mapped Flip Chart/canonical counterpart while preserving the Workbook drawing exactly. Follow `ASSET_FIDELITY_POLICY.md`; if the counterpart cannot be verified, leave the asset pending.
2. **Background-only generation.** New scenic backgrounds may be created only under `repo.md`; foreground art and lesson content remain unchanged.

Uniform responsive scaling of the whole page is allowed.

### Conflict rule
The two source PDFs define the layout. They override derived JSON, old prompts,
old modernization plans, comments, manifests, screenshots, and prior agent
instructions whenever there is a layout conflict.

If implementation and source book disagree on LAYOUT, the source book wins.

Do not infer a page design from memory or from another page. Compare against
the matching source PDF page.

"Digitized" means the same layout as the book, in a modern, user-friendly,
interactive digital form. Not inch-for-inch identical — same structure, modern
finish.

---

## DEPLOYMENT DISCIPLINE — mandatory, no exceptions

Automatic Vercel Git deployment must remain disabled during active Cartilla
work. Do not use Vercel as a test runner.

- Work and verify before deployment.
- Batch related changes.
- Do not deploy after each commit.
- A commit is not a deploy request.
- Deploy only at an intentional final checkpoint requested by EJN.
- Verify the real production result only after that deliberate deployment.

### School-pilot data safety

Until real-data security/privacy blockers are resolved, Cartilla may be tested as a demo/pilot only with non-real student data. A production or school pilot using real child/student data cannot pass final release solely because Supabase/live-auth work is deferred. Do not invent retention periods, licensing rules, or new security-policy choices here; unresolved real-data risks remain owner-policy/release blockers for any real-data pilot.

## GITHUB ACCOUNT LIMITS

- EJN uses a free GitHub account and does not have GitHub Actions available.
- Do not depend on GitHub Actions, required CI checks, or hosted Actions runners to complete or verify work.
- Use existing Jules worker/sandbox verification and its raw reports, or a specifically justified exceptionally long-test runner, rather than duplicating those runs through coordinator tools.
- Do not recommend upgrading GitHub solely to enable Actions unless EJN explicitly asks about paid options.

---

## NON-TECHNICAL OWNER WORKFLOW — MANDATORY

EJN does not review code or GitHub internals. Agents own the technical judgment and must show proof in chat.

- Never put unfinished or unverified work into `main`.
- One branch per active job. No backup, experiment, duplicate, or unrelated branches.
- Multiple coding-agent lanes may run in parallel when their scopes are genuinely isolated. Dependency chains that touch the same activity family remain sequential. Before merge, every parallel PR must be rechecked against current `main`; stale/conflicting work must be updated before merge.
- Make normal technical choices yourself. Do not ask EJN to choose libraries, Git methods, file structure, or test methods unless it changes what he will actually see or use.
- Before asking for approval, ensure Jules has supplied relevant focused tests, build results and actual feature/screen proof; assign only missing or invalidated checks to Jules. Fix obvious issues and address important review findings without rerunning valid evidence.
- Preserve unrelated working parts of the project. Do not reorganize or modernize outside the task.
- Do not claim success without verification.

### OWNER APPROVAL PROOF — CHAT FIRST, NO GITHUB HUNTING

EJN must never be asked to inspect GitHub, a PR, branch, issue, commit, CI page, or repository file in order to approve work.

Before asking EJN for any approval:

- **Show the actual result in chat first.**
- For visible/visual work, provide the real implemented screenshot/image inline in chat whenever technically possible.
- When multiple views materially matter, show the representative views needed for the decision (for example phone/tablet/desktop or before/after).
- Do not substitute code, a PR description, a worker status message, or a GitHub link for rendered proof.
- If an inline image is technically impossible, provide a directly viewable rendered artifact or preview that opens the actual result; do not send EJN to GitHub to find it.
- GitHub issue/PR/task numbers and links are supporting references only.
- After the proof is visible, ask for a simple **Yes / No** decision unless the owner genuinely needs more than a binary choice.
- If the required proof is unavailable, the work is **not ready for owner approval**. Recover or regenerate the proof first.
- Never claim that EJN has seen or approved a visual result unless that exact rendered result was actually shown to him.

This rule applies to controllers, reviewers, Jules workers, watchdogs, and future agents.

### Proof shown to EJN
For visual work, show screenshots/images or before-and-after proof in chat. For functional work, explain in plain English what works and what was tested. EJN should not need to open GitHub.

When work is ready, report exactly:

```
RESULT:
What changed in plain English.

PROOF:
What was checked and the result. Include visible proof when appropriate.

KNOWN LIMITATIONS:
Anything unfinished, blocked, or uncertain. Write "None" if there are none.

READY TO PUSH:
Yes or No.
```

For ad-hoc work without prior merge authorization, stop and wait. Merges to main need the owner's own explicit yes on his own channel; agents never merge on their own.

### Meaning of "Push it"
When EJN says **"Push it"**, put the completed, tested work into `main`, confirm it is there, let the finished branch be removed when safe, and report back. EJN should never have to merge, rebase, cherry-pick, resolve conflicts, or supervise GitHub.

"Push it" does **not** mean deploy publicly. Do not deploy, publish, spend money, change production data, delete data, or take another hard-to-reverse external action without explicit authorization. If updating `main` would automatically deploy production, warn EJN first and wait.

Never merge work with known serious bugs, unresolved important review findings, a broken build, missing relevant testing, or a real conflict with another active lane. Fix those issues first.

Do not enable automatic merging. Do not depend on GitHub Actions or paid GitHub features; use direct verification instead.

If something goes wrong after "Push it", diagnose the cause, repair it if clearly within the approved task, verify the repair, and show the result without making EJN perform Git operations.

Normal ad-hoc workflow: EJN asks → agent builds safely → agent tests → agent shows proof → EJN says "Push it" → agent puts finished work in `main` → agent confirms it.

Merges to main need the owner's own explicit yes on his own channel; agents never merge on their own.


## UI IMPLEMENTATION COHERENCE — mandatory

For student-facing Workbook work, do not create activity-local copies of shared feedback behavior. The shared interaction kernel owns:
- the classic wooden pencil and matching school eraser treatment;
- common mark/draw/erase motion and timing;
- retry/success state transitions;
- Gretel feedback events;
- reduced-motion behavior;
- persistence/completion integration hooks.

Activity families implement only their source-faithful Workbook gesture/layout adapter unless the owning issue explicitly authorizes a kernel change.

For visible UI work, the owning Jules worker publishes needed milestone browser screenshots before final completion. Show the real implemented state, not mockups, including representative normal, success, retry/error, distinctive tool/motion states, and relevant responsive views. Reuse existing still-valid visual proof; do not recapture it for unrelated commits. These are early direction proof and do not replace distinct final browser QA or release verification when actually needed.

## OWNER TOOL AND ACCOUNT DIRECTIVE — 2026-10-07

- Use Jules account **EJNRCGPLm / ejnrcgplm@gmail.com** exclusively. Never use **EJnRCG / ejnrcg@gmail.com**. A browser tab index, GitHub login, Markdown file, or bot reaction does not establish the Jules account identity.
- Prefer direct authenticated Jules API/MCP, native GitHub tools, repository commands, and authoritative API documentation. Do not use Playwright or browser automation to operate accounts or external services. Do not use Desktop Commander unless EJN explicitly requests it.
- Jules implements and runs focused tests; GitHub is the primary dispatch surface; the watchdog/controller performs essential integration and real-evidence checks. Antigravity is prohibited without new, task-specific owner authorization; it is not an available fallback. Sonar is advisory; no additional external reviewer is required beyond the existing independent controller diff review. Preserve important product tests and final release proof.
- A Markdown instruction does not start a Jules session. Dispatch through an authenticated API/MCP or existing authorized GitHub Jules workflow, and distinguish delivery, acknowledgement, running, and verified completion.
- Do not claim a direct Jules connection until credentials are securely configured and a harmless authenticated request succeeds. Never commit API keys or request secrets in chat.
- Reuse unchanged exact-head evidence. On unchanged state, exit without repeated tests, browser tours, new artifacts, or duplicate workers. Review changed heads and report precise remaining gaps.
