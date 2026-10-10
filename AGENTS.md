# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it.

## STOP — MANDATORY EVIDENCE-FIRST DISPATCH GATE (EVERY AGENT, EVERY SESSION)

**This applies to EVERY coding agent, Jules worker, controller, supervisor, reviewer, and AI assistant reading or operating on this repository. Re-read this section from CURRENT `main` before creating an issue, task, prompt, session, test assignment or PR, and before reassigning any work. Do not rely on another agent remembering it.**

**NEVER create work to appear productive, to fill a capacity target, or to satisfy a report.** Do not invent defects, generic cleanup/optimization/QA, made-up acceptance criteria, speculative tasks, or unnecessary research. **Prove there is valuable unfinished work BEFORE dispatching it.** In one focused existing-work check:

1. **Compare against the actual finish requirements and current code.** Identify an observable user-facing defect, reproducible regression, real security/accessibility/performance problem, or explicit unfulfilled requirement, with exact file/source evidence and meaningful expected result.
2. **Check existing ownership and proof FIRST:** current `main`, recent merged PRs, open issues/PR heads and diffs, Jules session/task receipts and review state, existing passing tests/screenshots, dependencies, owner decisions and exclusive file ownership. If already fixed, verified, assigned, under review, owner-gated or superseded, **DO NOT dispatch again**. A stale issue title is not evidence of unfinished work.
3. **Prefer advancing the existing lane:** review real changed files, validate targeted results, request the *specific missing correction on the same issue/PR/session*, or integrate independently verified work when allowed. A new task requires a proven separate gap that cannot be completed in a currently owned lane, with a nonoverlapping file scope and concrete acceptance test.
4. **Only then dispatch** via the established authorized Jules GitHub trigger once; confirm the provider's bot task receipt, and later actual material code/tests/browser proof. A label, acknowledgement, new issue, prompt, completed-but-empty PR or activity report alone **does not count as accomplishment**.
5. **If no genuinely independent ready work is proven: assign nothing.** Report `NO VERIFIED READY WORK` and the actual reason. **15 is a utilization ceiling/target, not a minimum number of jobs**; idle slots are correct when tasks would be redundant, speculative or irrelevant.

**Required pre-dispatch decision:** `REAL GAP + CURRENT EVIDENCE + NOT ALREADY OWNED/DONE + DISTINCT VALUE + ACCEPTANCE PROOF`; if any term is missing, do not issue a prompt or create/label a task. Existing `AGENTS.md` concurrency, owner approvals, safety, and finish contracts remain fully binding.

---

## OWNER SUPERSEDING DIRECTIVE — ACTIVE TOOLS ONLY (2026-10-10)

- **Latest owner clarification, October 10, 2026: distinguish TWO systems.** The old local Windows `CartillaJulesAutoRunner` script and its Vercel/Neon/OpenHands paths remain retired, disabled, and forbidden as current Cartilla infrastructure; preserve them only as history. The owner **explicitly re-enabled the existing hourly ChatGPT CLOUD `Cartilla Jules Continuity` task** after a mistaken disable. That separate scheduled task is authorized for **GitHub-native coordination only**, with no PC-script dependency, paid services, extra controller, or deployment. Its enabled setting confirms only its schedule, **not a Jules worker actually running**. Do not disable the cloud task on the authority of older retire-all instructions. Never restart the old local or database-backed system without another explicit owner instruction.
- **No invented continuity.** A saved prompt, plugin skill, watcher label, enabled check, completed task, or successful exit code is not proof that autonomous work is happening. Only actual current GitHub changes, authorized official Jules provider receipts, relevant test evidence and real PR outcomes count. Do not claim background dispatch, a working webhook, or occupied agent capacity without live independent evidence.
- **Current means current.** Before acting, read today's owner directives and the current `main` versions of this file and its canonical instructions. Superseded issue text, stale branch `AGENTS.md`, old Engram entries and historic assumptions do not regain authority. Do not use outdated tools or workflow instructions.
- **Use Jules directly for work actually ready.** In ordinary authorized conversations, check current independent work, existing task/PR ownership, actual Jules session state and relevant proof; dispatch genuine nonoverlapping implementation, targeted QA and visual proof through the existing official Jules GitHub integration where permitted. Never create filler tasks, rerun valid tests, or represent a label as a running worker. Only the owner-approved existing hourly ChatGPT cloud Jules coordination is authorized; this document does not authorize another scheduler or production deployment.
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

- **Owner-directed Jules utilization target: up to 15 concurrent genuinely active sessions**, or fewer if the authenticated Jules account's live provider quota/capacity is lower. This supersedes the obsolete two-lane/no-target rules; it is not proof that this account currently has 15 available slots and does not authorize an upgrade, paid usage, or inventing work.
- At every controller/supervisor/coordinator checkpoint, proactively refill available slots with independent, dependency-ready, non-owner-gated work until the **15-active-session target** or the verified provider limit is reached, or no genuine eligible work remains. Do not wait for EJN to ask why slots are idle.
- **Maximum concurrent independent read-only specialist investigations: 3.**
- Controller, supervisor, and watchdog activity does not consume implementation-worker capacity.
- Dependency chains and overlapping file ownership remain sequential even when Jules capacity exists.
- A blocked, completed, owner-gated, or dependency-waiting lane must not reserve Jules capacity; remove its runnable `jules` label/state and immediately activate the next eligible independent lane.
- Unused Jules capacity is not a reason to invent work: concurrency must come from real finish gaps already supported by the canonical plan/issues.
- Other active documents may describe current allocation or sequencing, but they must not define a competing numeric concurrency rule.


### Mandatory Jules capacity census and 15-lane refill — every session (owner directive 2026-10-10)

**Every agent accessing this repo** must check or explicitly retrieve the latest capacity/ownership snapshot before claiming Jules utilization or choosing new work. The **authorized controller, supervisor, or existing hourly ChatGPT cloud coordinator** owns dispatch; Jules workers and read-only reviewers may flag unowned opportunities but must not independently create competing sessions.

1. **Count actual provider states first.** Query the authenticated, authorized Jules account's current session/task listing (official Jules API/CLI when available) and cross-check current GitHub issues, bot receipts, branches, open PRs, comments and exact heads. Report separate counts for **confirmed running**, **accepted/queued but not proven running**, **awaiting review**, **finished/failed/paused**, **owner/dependency blocked**, and **unknown**. Deduplicate by provider session ID and issue/PR ownership; one issue label, bot acknowledgement, draft PR or completed session is **not** one active worker. A known 15-session plan is not evidence of account entitlement or 15 currently free places. If authenticated provider status is inaccessible, mark running/available **UNKNOWN**, avoid blind relabels/new competing tasks, and still perform useful GitHub-only work discovery.
2. **Calculate headroom honestly:** utilization target **15**; confirmed dispatch headroom is at most `min(15 - confirmed_running - reserved_queued_sessions, provider_confirmed_available_slots, provider_remaining_task_quota)`, and never negative. Never treat an unknown count as zero running, and do not confuse rolling-day task allowance with simultaneous concurrency.
3. **Refill on every checkpoint** (session start, finished/failed worker, PR update/merge, newly resolved dependency, scheduled hourly run). Recover genuinely stalled or failed work **on its existing Jules task/issue** before adding a new one. Then look for distinct ready finish gaps in this order: (a) uncovered product bugs/implementation, (b) confirmed regressions and bounded code correctness/accessibility/security issues relevant to the demo, (c) rendered phone/tablet/laptop/projector defects and polish, (d) **specific evidence-backed** code cleanup or performance improvement with an identified file/symptom, a measurable or observable outcome, and narrow regression proof. Inspect merged work, existing tests/proofs and assigned sessions to exclude repeats; do not invent cleanup just to fill a number.
4. **Dispatch every independently owned, disjoint, ready slice** through the existing authorized Jules route until verified headroom is used, real work is exhausted, or provider refusal/limit is confirmed. Use one issue/task per scoped deliverable; explicitly assign exclusive files/behavior, existing passing evidence to reuse, only missing Jules testing/browser proof, exact expected result and forbidden overlap. Check the **provider task/session receipt** after each handoff; only call it `ACTUALLY RUNNING` after fresh provider status proves running. Do not relabel an already dispatched issue, trigger the same instruction twice, spawn an extra controller/worker or revive retired infrastructure.
5. **Recheck immediately** after a confirmed completion/merge/failure/dependency change; do not wait for the next hourly run if already executing. When fewer than 15 sessions are active, report the exact cause of unused **confirmed** available slots (no distinct eligible work, provider cap, task quota, unverified provider state, overlap, owner decision) rather than implying idle lanes are running. Only a controller action verified by a provider receipt or actual code/PR output counts as dispatch/progress; record one compact handoff on affected GitHub issues/PRs when material state changes. A repository rule or enabled scheduled task does not itself run sessions between executions.

**Safety and finish boundary:** the target does not bypass owner approvals, final-art/voice restrictions, merge/release verification, Jules-only normal tests, cost controls or the no-duplicate-work contract. Do not start purposeless audits, reopen verified merged work or delete historical branches to make the count look better.

### Continuous development, testing and visual polishing — JULES-FIRST, ZERO DUPLICATE WORK

Every controller, supervisor, watchdog, dispatcher, reviewer and worker must **consider three streams** while planning, assigning and handing off material work: (1) implementation/repair; (2) focused tests of available implementation; (3) actual rendered UI proof and visual polishing when relevant. **Consider does not mean redo.** Check existing issue/PR evidence and its exact code revision FIRST; reuse completed, still-valid test results, screenshots, reviews and fixes without rerunning or redispatching them.

**Jules is the default and sole hands-on test/verification and UI-browser-check executor.** Jules tests its own changes, and the controller assigns any missing or invalidated targeted checks or visual polishing to Jules through the existing authorized lane. Other agents may inspect current GitHub evidence, triage, coordinate, review the diff, decide merge readiness and share Jules-produced proof, but must **not** duplicate test runs, long browser investigations, or screenshots already available. Do not start a separate test agent, repeat an unchanged full audit, or send Jules a task already active/completed. The sole optional exception is a **genuinely unusually long agentic test** that exceeds Jules' practical capacity: the controller may assign that isolated test to a suitable authorized long-running worker, only after verifying it is needed, not already done and will not block independent work.

**Act without delay, never repeat:** compare existing proof to its relevant code/fixtures/test/config/browser inputs, not blindly to the global main SHA. Unrelated docs-only commits or unrelated changes do NOT invalidate still-applicable focused evidence. If an affected behavior changed, a real failure emerged, or a distinct final release check is required, give only that missing test or UI-proof slice to Jules on its EXISTING lane with exact source commit, missing coverage, and a clear expected result. If existing valid focused test/screenshots cover it, record `DONE — REUSE PROOF` and move on; no duplicate session. A PR with zero material file changes or only a Jules 'done' claim is NOT implementation completion: reconcile the already-existing owner/work branch and demand actual diff or an explicit verified no-change finding.

**Compact handoff for every material assignment:** state what is being built; what **already passed** with exact source/revision; what additional Jules test or UI polish (if any) remains; Jules task/owner and next action. Write `DONE — REUSE PROOF` or `NOT APPLICABLE` instead of scheduling redundant work. No three-agent mandate, no additional reviewer/test gate beyond the required evidence-first dispatch decision, no obsolete two-worker cap, no duplicated Jira/GitHub tasks, no mandatory full-suite run on every worker, no waiting for optional reviewers or tools.

**Fail fast without blocking:** if a non-Jules executor encounters repeated memory/time/browser failures, stop futile retries and give Jules the surviving work and concise reproduction/evidence. If Jules is unavailable, rate-limited or has a failed run, leave exactly one pending check on its existing lane, keep unrelated implementation/coordination moving, and do not present unverified work as tested or merge/release work whose required evidence is missing. Diagnose once and correct the existing task; do not create an endless redispatch loop. Only exceptionally long, specifically justified agentic tests may use another authorized test worker.

### Proactive Jules lane refill and early, nonduplicative QA — owner clarification 2026-10-10

**Work toward the owner-requested 15 real active Jules sessions whenever verified capacity and distinct ready work permit; never manufacture activity to hit the count.** At session start, first material worker checkpoint, provider completion/failure, merge, or dependency-unblock event, the controller/supervisor must refresh current `main`, open issues/PRs, and *actual Jules provider/session state*. Distinguish eligible work from completed/awaiting-review tasks. A `jules` label, bot acknowledgement, open PR, old branch, or numeric local dispatcher target is not evidence of an active worker or confirmed available capacity.

At each refresh consider **all three parallel work streams**, without waiting for a feature's final delivery: (1) scoped implementation/repair; (2) focused code inspection, defect reproduction, regression QA, or code cleanup justified by the current change; (3) real rendered UI/device proof and visual corrections where relevant. Reuse existing, still-valid proof FIRST. Immediately offer each **independent, dependency-ready, authorized, and currently unowned** bounded slice to an existing Jules task/issue, or a new task only when there is a real distinct finish gap and no active owner. Jules owns the actual testing and visual proof; the controller reads and integrates, not reruns. Run disjoint Jules lanes concurrently up to **verified actual provider capacity**; dependent/overlapping work stays on its existing sequential lane. No blanket per-task full audit, no routine duplicate reruns, no placeholder cleanup, no extra mandatory test workers.

**Early handoff, not final-day QA:** as soon as Jules has a material, targeted-checked implementation checkpoint, publish its actual diff/PR and assess available focused QA, code-quality fixes, accessibility or rendered-proof slices. Dispatch disjoint needed work then, not after the entire feature finishes; if a finding touches worker-owned files, put the bounded fix/test request on that **same** lane rather than spawning a racing branch. A real product defect may block the affected merge, but unrelated ready lanes continue.

**Empty slots are not permission to invent tasks.** If the fresh canonical finish-gap scan finds no independent eligible slice, report `NO READY INDEPENDENT JULES TASK — <specific reason>`; do not claim a lane was dispatched or is running unless the provider/GitHub handoff proves it. Recheck when any real dependency changes. The 15-lane utilization target is defined above in this file; schedule flags and labels are not evidence of running agents or free provider capacity.

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

**Jules is the implementation and focused-test worker.** The GitHub dispatcher routes tasks; the watchdog/controller reconciles scope, dependencies, actual code changes, necessary tests and merges. Antigravity is an **optional second-layer fallback**, never a prerequisite for Jules, GitHub dispatch, testing, merging or the watchdog.

- **SonarCloud/SonarQube is ADVISORY and NON-BLOCKING.** Keep the existing analysis visible; no quality gate, scan status, unavailable integration, bot comment, duplication percentage, or Sonar signoff is required for dispatch, continuation, or merge. A substantive defect independently confirmed by review or Jules proof still blocks the affected change. This owner-approved policy supersedes older mandatory-Sonar wording in historical comments or Engram. Do NOT restore Sonar as a required GitHub check.
- **Small executable pre-merge evidence check:** The designated controller uses `node scripts/check-merge-policy.mjs --evidence <receipt.json>` to assess the current PR's material file list, current-head and test validity, existing independent review, owner authorization, UI proof applicability, and confirmed serious defects; Sonar result is recorded only as advice. Document-only PRs require controller review but no Jules product-test rerun. Reuse the existing Jules proof; no duplicate tests, new worker, GitHub Actions, or new infrastructure. This CLI is a local/controller decision check, NOT a GitHub server-enforced restriction; do not claim it prevents an unrelated actor from bypassing the script. Before a final release check, `pnpm verify:policy` verifies the four active policy documents.
- Jules must commit **material file changes** and provide the exact PR head SHA and focused raw test results; do not count an empty commit, bot acknowledgement or Jules Completed state as verified work.
- The watchdog/controller must inspect current `main`, the material PR diff, overlap, scope and dependencies, and Jules' existing raw focused-test outcomes without repeating the tests. Require existing or newly assigned Jules browser/device evidence where visible interaction actually changed. Reuse valid evidence across unrelated/doc-only commits; never gate a disjoint implementation lane on unrelated tests or a failed service.
- A failing, inaccessible, unauthenticated, rate-limited, or unresponsive Antigravity CLI/watchdog fallback must **never block the primary GitHub→Jules workflow**. Record the failure for later recovery and continue with independent eligible tasks. Antigravity must not independently redispatch an existing task or overwrite a worker-owned branch.
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

For ad-hoc work without prior merge authorization, stop and wait. For the owner-authorized Cartilla completion queue, the designated queue controller may merge a fully verified, scope-correct PR and advance its declared dependency chain without a separate per-PR owner prompt.

### Meaning of "Push it"
When EJN says **"Push it"**, put the completed, tested work into `main`, confirm it is there, let the finished branch be removed when safe, and report back. EJN should never have to merge, rebase, cherry-pick, resolve conflicts, or supervise GitHub.

"Push it" does **not** mean deploy publicly. Do not deploy, publish, spend money, change production data, delete data, or take another hard-to-reverse external action without explicit authorization. If updating `main` would automatically deploy production, warn EJN first and wait.

Never merge work with known serious bugs, unresolved important review findings, a broken build, missing relevant testing, or a real conflict with another active lane. Fix those issues first.

Do not enable automatic merging. Do not depend on GitHub Actions or paid GitHub features; use direct verification instead.

If something goes wrong after "Push it", diagnose the cause, repair it if clearly within the approved task, verify the repair, and show the result without making EJN perform Git operations.

Normal ad-hoc workflow: EJN asks → agent builds safely → agent tests → agent shows proof → EJN says "Push it" → agent puts finished work in `main` → agent confirms it.

Authorized Cartilla queue exception: the queue controller may merge only work that the owner has already explicitly authorized as part of the completion queue, and only after every required exact-head gate passes. Implementation workers never self-merge. The mere existence of an issue, `[QUEUE]` text, a `tasks/todo.md` entry, branch, PR, bot comment, or Jules prompt does not create or expand merge authorization. If owner authorization is not explicit enough for a task, do not broaden it during execution. Production deployment remains a separate intentional owner-controlled action and never follows automatically merely because a PR merged.


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
- Jules implements and runs focused tests; GitHub is the primary dispatch surface; the watchdog/controller performs essential integration and real-evidence checks. Antigravity is a non-blocking second-layer fallback. Sonar is advisory; no additional external reviewer is required beyond the existing independent controller diff review. Preserve important product tests and final release proof.
- A Markdown instruction does not start a Jules session. Dispatch through an authenticated API/MCP or existing authorized GitHub Jules workflow, and distinguish delivery, acknowledgement, running, and verified completion.
- Do not claim a direct Jules connection until credentials are securely configured and a harmless authenticated request succeeds. Never commit API keys or request secrets in chat.
- Reuse unchanged exact-head evidence. On unchanged state, exit without repeated tests, browser tours, new artifacts, or duplicate workers. Review changed heads and report precise remaining gaps.
