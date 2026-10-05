# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it.

---

## CANONICAL INSTRUCTION HIERARCHY

There are nine active repo-wide instruction files:

1. AGENTS.md — execution, safety, Git, and deployment rules.
2. PROJECT_FINISH_DEFINITION.md — canonical owner-locked definition of what must be true for the entire project to be finished.
3. PROJECT_SOURCE_OF_TRUTH.md — current product state, priorities, and owner-decided scope.
4. CARTILLA_DIGITAL_DIRECTIVE.md — authoritative Cartilla structure, content, fidelity, and presentation rules.
5. ASSET_FIDELITY_POLICY.md — active artwork, image, color-transfer, and motion rules.
6. STUDENT_INTERACTION_STANDARD.md — canonical owner-approved student Workbook interaction and motion language.
7. DESIGN.md — durable visual system and taste contract for Workbook, Flip Chart, shared school-tool UI, and page-turn presentation.
8. UX-CONTRACT.md — observable interaction/state contract, including the shared student interaction kernel and physical page-turn behavior.
9. repo.md — authoritative, locked method for Workbook and Flip Chart background-only generation.

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

- **Maximum concurrent implementation-worker lanes: 2.**
- **Maximum concurrent independent read-only specialist investigations: 3.**
- Controller, supervisor, and watchdog activity does not consume either implementation-worker slot.
- Dependency chains and overlapping file ownership remain sequential even when capacity exists.
- Unused capacity is not a reason to invent work.
- Other active documents may describe current allocation or sequencing, but they must not define a competing numeric concurrency rule.

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

## AVAILABLE DEVELOPMENT TOOLS — USE THEM AUTOMATICALLY

EJN should not have to choose or manually invoke engineering tools. When the current agent environment exposes specialist skills, MCPs, connectors, browser tools, or coding workers that materially improve the task, use the narrowest relevant capability automatically.

- Use direct GitHub/repository tooling for current repository facts instead of guessing from old prompts or reports.
- When framework/library/API behavior matters, verify it against current authoritative documentation using the available documentation-retrieval capability.
- Use upstream developer search only when maintainer issues/PRs or external evidence could materially change the conclusion.
- For bugs, use root-cause debugging before changing code.
- For security-sensitive work, use the available security/hardening specialist.
- For measurable performance problems, use the available performance specialist.
- For visible UI work, verify the real rendered application with the available browser/runtime tools; code inspection alone is not sufficient.
- Use independent review for meaningful changes as required elsewhere in this file.
- Run at most 3 genuinely independent **read-only specialist investigations** when they do not share mutable state or sequential dependencies. Implementation-worker concurrency is governed only by the Execution Control Contract above.
- Reuse still-valid evidence instead of repeating unchanged audits, tests, reviews, or browser checks.
- If a preferred specialist is unavailable, use the strongest safe equivalent. Do not block work merely because one optional tool is missing.
- Do not add a new account, paid service, plugin, framework, or workflow unless the existing stack materially cannot meet a real current need and EJN approves any consequential cost or lock-in.

These tools support the repository rules; they do not override `AGENTS.md`, `PROJECT_SOURCE_OF_TRUTH.md`, owner decisions, or current verified repository/runtime evidence.

### EXTERNAL CODING AGENT ORCHESTRATION — JULES-FIRST FOR PARALLEL IMPLEMENTATION

Jules is an approved primary implementation worker for Cartilla because the owner has available Jules capacity. Use that capacity aggressively for **parallel, isolated coding work** instead of leaving it idle.

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
- For Student Workbook visual work, Jules must preserve the owner-approved clean digital-canvas distinction: dense learner exercises do not use full scenic wallpaper; existing scenic assets stay preserved for the teacher Flip Chart and other explicitly approved contexts. Do not delete/regenerate those assets or simplify the Flip Chart as part of a Workbook UI task.
- For the #495 Workbook visual realignment, Jules must follow the golden-page gate: implement and verify #496 (Workbook page 1) first. Do not begin #498 broad page-family rollout until the controller records #496 as visually accepted. A #496 worker must not absorb #497 living-motion debugging or #454 foreground-color remediation; those remain separate lanes.

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

For ordinary implementation work, Jules and other implementation workers MUST NOT run:
- `pnpm prepare:art`;
- `pnpm build`;
- `pnpm build:app`;
- `pnpm verify:release`;
- `pnpm dev`.

Those commands are allowed only when the task explicitly owns production-art generation or is a dedicated clean-checkout release-verification task.

Ordinary implementation workers use:
- the narrow targeted Vitest/Playwright test(s) or checks for the changed behavior;
- `pnpm typecheck` when relevant;
- `pnpm verify:worker` when a broader non-mutating repository check is useful;
- `pnpm dev:worker` for browser/runtime work without invoking art generation.

A dedicated verification-only Jules session may run `pnpm verify:release` in a clean checkout when full release verification is itself the assigned job. In that case it must not export/regard regenerated delivery assets or manifests as implementation changes; it reports the verification result only.

For ordinary implementation lanes, the controller/release verifier runs the mutating/full production pipeline in a clean verification checkout after the implementation PR has been persisted. Generated release artifacts from that verification checkout are verification output, not worker-scope changes unless the owning issue explicitly requires them.

#### Verification boundary

Jules should use its environment to prove its **own bounded change** with targeted tests/checks and, for visible work, representative browser evidence when practical.

Jules is **not required to consume its session running the entire project release gate** before handing back a candidate implementation. The controller owns:
- independent diff review;
- SonarQube reconciliation;
- full `pnpm verify:release`;
- cross-lane regression verification;
- final browser/device proof;
- merge readiness and merge;
- dependency activation and release.

The controller may ask Jules to run broader verification when that is itself the assigned task, but full-release verification must not be mechanically appended to every coding session.

#### Failure handling

- Do not repeatedly relaunch the same failed Jules instruction unchanged.
- On a worker failure, the controller diagnoses from the returned evidence and either narrows/corrects the next Jules task, assigns a different isolated lane, or takes over directly.
- One failed Jules lane must never stall independent Jules lanes or controller-owned work.
- Jules never self-merges and never deploys production.
- Owner intervention is required only for a genuine owner-only decision, asset, authentication step, or irreversible action.

### MANDATORY DUAL REVIEW — meaningful code/behavior PRs

Before any meaningful code, behavior, security, data, or application-asset PR is merged, the exact current PR head must pass two independent review layers:

1. **Controller/assistant review:** independently inspect the actual PR diff against the issue requirements and CURRENT canonical Cartilla files. Jules self-review does not count.
2. **SonarQube Cloud PR analysis:** use the connected SonarQube Cloud project for `ejnburrows-rgb/cartilla-de-gretel` on the free plan. CodeRabbit is not required.

Reconcile SonarQube findings rather than accepting them mechanically. Confirm real issues, identify false positives/noise, and require fixes for every real blocker or major regression. Existing baseline findings on `main` do not automatically block a scoped PR; the merge gate is new/worsened PR-introduced risk plus any substantive regression independently confirmed by the controller.

After any substantive fix or any head-SHA change, repeat BOTH the controller review and SonarQube PR analysis against the new head. Then rerun task-specific verification and complete direct-cloud `pnpm verify:release` for application code/assets.

#### Current-main gate for existing PRs

Before controller review, Sonar analysis, task proof, or release qualification of an existing PR:
1. compare the PR head to CURRENT `main`;
2. if it is behind, diverged, or conflicting, reconcile it first;
3. only then run exact-head controller review, Sonar, task proof, and release qualification;
4. any head-SHA change invalidates prior exact-head proof.

Before merge, add a concise PR proof comment containing:
- reviewed head SHA;
- controller-independent review result;
- SonarQube Quality Gate/result and relevant issue counts/severities for that PR/head;
- confirmed, false-positive, and deferred Sonar findings;
- exact task-specific verification evidence;
- exact `pnpm verify:release` result when required;
- the exact statement: `DUAL REVIEW VERIFIED FOR THIS HEAD`.

Merge only when the PR head SHA exactly matches the dual-reviewed SHA. Documentation-only or trivial metadata-only PRs may skip SonarQube when they contain no executable behavior/code/security/data change, but still require the controller's independent review.

---

## CARTILLA BOOK FIDELITY DIRECTIVE — HIGHEST PRIORITY FOR STRUCTURE / CONTENT / PRESENTATION FIDELITY

Before doing any work on the Cartilla Workbook or teacher Flip Chart, read
`CARTILLA_DIGITAL_DIRECTIVE.md`. It is the canonical Cartilla structure/content/presentation directive within that domain. It does not outrank newer explicit owner decisions or `AGENTS.md` execution/safety policy, but it supersedes older layout/fidelity instructions.

Before changing student Workbook interactions, also read and follow `STUDENT_INTERACTION_STANDARD.md`, `DESIGN.md`, and `UX-CONTRACT.md`.

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
- **PRESENTATION** (styling, interactions) → MODERN digital, your judgment. Dense Student Workbook exercises use the clean digital canvas rather than full scenic wallpaper; the teacher Flip Chart may retain richer source-appropriate scenery.

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

For dense learner exercises, the active Workbook surface is the owner-approved clean digital canvas: do not render a full scenic image as wallpaper behind the exercise and do not use opaque white contrast slabs that make the page read like a pasted print artifact. Preserve any existing scenic assets rather than deleting or regenerating them; they remain available for the teacher Flip Chart and any other explicitly approved context.

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
- Use direct verification, local/sandbox testing, or other available tools instead.
- Do not recommend upgrading GitHub solely to enable Actions unless EJN explicitly asks about paid options.

---

## NON-TECHNICAL OWNER WORKFLOW — MANDATORY

EJN does not review code or GitHub internals. Agents own the technical judgment and must show proof in chat.

- Never put unfinished or unverified work into `main`.
- One branch per active job. No backup, experiment, duplicate, or unrelated branches.
- Multiple coding-agent lanes may run in parallel when their scopes are genuinely isolated. Dependency chains that touch the same activity family remain sequential. Before merge, every parallel PR must be rechecked against current `main`; stale/conflicting work must be updated before merge.
- Make normal technical choices yourself. Do not ask EJN to choose libraries, Git methods, file structure, or test methods unless it changes what he will actually see or use.
- Before asking for approval, fix obvious issues, run relevant tests, confirm the project builds, check the actual feature/screen, and address known important review findings.
- Preserve unrelated working parts of the project. Do not reorganize or modernize outside the task.
- Do not claim success without verification.

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

For visible UI work, publish milestone browser screenshots before final completion. Show the real implemented state, not mockups, including representative normal, success, retry/error, distinctive tool/motion states, and relevant responsive views. These are early direction proof and do not replace final browser QA or release verification.
