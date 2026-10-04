# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it.

---

## EXECUTION GATEWAY — EVERY TRIGGER, EVERY CONTROLLER RUN

`AGENTS.md` is the single mandatory entrypoint for all Cartilla engineering work. Do not begin by reading a random issue, old PR, old handoff, or archived document. Start here, then route to only the scope-specific sources below.

### Trigger loop

Every new request, scheduled controller run, Jules result, failed verification, PR update, or owner correction must execute this loop in order:

1. **READ CURRENT STATE**
   - Read CURRENT `main` and record its exact SHA.
   - Read this `AGENTS.md` first.
   - Read `EMILIO_QUALITY_ROUTER.md` for the cross-project Controller/Worker/termination/review standard.
   - Read the latest owner/controller directive on the relevant issue.
   - Inspect the current PR head, actual diff/files, Jules bot/task evidence, and verification evidence.

2. **ROUTE BY SCOPE**
   - Always read `PROJECT_SOURCE_OF_TRUTH.md`.
   - Page/content/layout fidelity: also read `CARTILLA_DIGITAL_DIRECTIVE.md`.
   - Foreground art/color/source work: also read `ASSET_FIDELITY_POLICY.md`.
   - Student interactions: also read `STUDENT_INTERACTION_STANDARD.md`, `DESIGN.md`, and `UX-CONTRACT.md`.
   - Workbook/Flip Chart page turns: also read `DESIGN.md` and `UX-CONTRACT.md`.
   - Scenic background generation only: also read `repo.md`.
   - Do not reread unrelated canonical files merely to create activity; scope-routing is deliberate.

3. **DECIDE BEFORE DELEGATING**
   The controller must choose exactly one next state:
   - **MERGE/ADVANCE** — only if exact-head review and all required proof pass.
   - **CONTROLLER FIX** — if a real defect exists and the controller has tools/write access to fix it safely.
   - **DELEGATE ONCE** — only for a new, clearly scoped implementation task or when the controller cannot perform the implementation directly.
   - **WAIT/BLOCK** — only for a genuine dependency, external result, or unavoidable owner-only action.

4. **CONTROLLER-FIRST REMEDIATION**
   - If Jules or another worker returns defective/incomplete work and the controller can fix it, the controller fixes it directly.
   - Do **not** send the same defect back to the same worker for repeated remediation.
   - One worker crash before producing work may receive one safe relaunch.
   - A second material failure in the same lane ends worker-led remediation; controller takeover or a different execution path is required.
   - A new SHA is not progress unless the tree materially changed.
   - Empty commits, check reruns, metadata-only changes, and timestamp churn never count as remediation.

### Execution failover ladder — mandatory before reporting a blocker

One unavailable tool, agent, device, sandbox, or execution channel is never sufficient reason to stop. The controller must exhaust the applicable safe, authorized, non-paid paths in this order before classifying execution as blocked:

1. Native connected GitHub tools for repository truth, branch writes, PR review, comments, and merges.
2. Composio cloud shell for direct repository checkout, focused tests, typecheck, build, and release commands.
3. Firecrawl Interact clean verifier using an exact-head source archive when the primary shell is unhealthy or unavailable.
4. Composio Browser Tool for actual rendered UI navigation, interaction, and screenshots.
5. Firecrawl Interact/browser as the browser fallback when Composio Browser cannot complete the required proof.
6. Other already-authorized cloud execution connectors that do not add cost or deploy production.

Operational rules:
- A timeout, offline device, failed worker, broken sandbox, or one connector error is a **channel failure**, not a project blocker.
- Long commands must be split into bounded deterministic stages, or detached and polled when the environment safely supports that pattern.
- Preserve and reuse accepted evidence from unchanged exact heads; do not rerun passing work merely because the channel changed.
- If one lane is waiting on an external dependency, continue every other independent actionable lane in the same run.
- Jules is never a required dependency for Cartilla completion. If Jules is disabled or fails repeatedly, the controller continues directly.
- Report a blocker only after the applicable ladder above has actually been attempted and no independent actionable lane remains.

5. **VERIFY INDEPENDENTLY**
   - Worker self-review is not controller review.
   - Meaningful code/behavior changes require exact-head controller review + SonarQube Cloud + task-specific verification + complete `pnpm verify:release`.
   - Visual/UI work also requires actual browser proof for the states owned by the issue.
   - If the head changes materially, repeat exact-head review and verification.

6. **STOP ONLY AT A VALID TERMINAL STATE**
   A controller run may end only when one of these is true:
   - verified work was merged/advanced;
   - the controller made a concrete repair and sent that exact head to independent verification;
   - the lane is genuinely waiting on a declared dependency;
   - an unavoidable owner-only action blocks further safe work.

   **Invalid terminal state:** “I found the problem and told Jules/another agent to fix it.”

### Worker role

Jules and other coding agents are workers, not project controllers. They do not decide scope, merge policy, dependency activation, or whether their own work is acceptable. Controller-owned repair branches are read-only to workers unless the controller explicitly hands that exact branch/head back for implementation.

---

## CANONICAL INSTRUCTION HIERARCHY

`AGENTS.md` is the repository entrypoint. `EMILIO_QUALITY_ROUTER.md` supplies the cross-project execution standard; the files below are canonical scope references loaded through the Execution Gateway routing rules:

1. `AGENTS.md` — execution, safety, Git, and deployment rules.
2. `PROJECT_SOURCE_OF_TRUTH.md` — current product state, priorities, and owner-decided scope.
3. `CARTILLA_DIGITAL_DIRECTIVE.md` — authoritative Cartilla structure, content, fidelity, and presentation rules.
4. `ASSET_FIDELITY_POLICY.md` — active artwork, image, color-transfer, and motion rules.
5. `STUDENT_INTERACTION_STANDARD.md` — canonical owner-approved student Workbook interaction and motion language.
6. `DESIGN.md` — durable visual system and taste contract for Workbook, Flip Chart, shared school-tool UI, and page-turn presentation.
7. `UX-CONTRACT.md` — observable interaction/state contract, including the shared student interaction kernel and physical page-turn behavior.
8. `repo.md` — authoritative, locked method for Workbook and Flip Chart background-only generation.

Anything under `docs/archive/` is historical reference only and must not override any file above.

### JULES PREFLIGHT — mandatory on every Jules task

Jules must treat CURRENT `main` as the instruction baseline, not the task's start-time snapshot, old issue comments, old PR descriptions, archived documents, or prior agent memory.

Before reviewing, coding, or resuming any Cartilla task, Jules must:
1. sync/read CURRENT `main`;
2. follow the Execution Gateway scope-routing rules above and read the relevant canonical files for that task;
3. inspect the issue's latest owner/queue-controller directives;
4. compare any existing task branch/PR against CURRENT `main` before continuing;
5. stop and correct course if older task context conflicts with CURRENT `main` or a newer owner directive.

Canonical repo files and newer owner directives override stale Jules plans, earlier bot comments, earlier recommendations, and task-start snapshots. Do not implement a remembered or previously proposed interaction when `STUDENT_INTERACTION_STANDARD.md` now specifies another one.

Jules must stay inside the issue scope. Do not opportunistically change adjacent activities, artwork, Gretel behavior, voice/TTS, auth/Supabase, deployment, or other active lanes unless the issue explicitly owns that scope. Supabase/live-auth remains deferred unless the owner explicitly re-authorizes it.

For application code/assets, Jules must provide task-specific proof and complete direct-cloud `pnpm verify:release`. GitHub Actions/check badges are not proof. Jules never self-merges.

### JULES MATERIAL-PROGRESS CONTRACT

A new commit SHA is **not** progress by itself. After any review, correction, retry, or recovery instruction:

- Compare the candidate tree/diff with the previously reviewed tree before committing or reporting completion.
- If implementation changes were requested and the resulting tree is unchanged, **do not create an empty commit and do not rerun checks as if remediation occurred**. Report the blocker plainly instead.
- Never use an empty commit, timestamp-only change, metadata churn, or check rerun to trigger Sonar/review or represent a fix.
- If a stale task branch conflicts with CURRENT `main`, rebuild the scoped change from CURRENT `main`; do not “remove old scope” by deleting files that CURRENT `main` owns.
- Verification-only/no-op lanes attach evidence to the issue/PR and stop. They do not manufacture a code diff.
- Controller-owned repair branches are read-only to Jules unless the controller explicitly hands that exact branch/head back for implementation.
- When Jules is assigned verification of a controller PR, verify the **exact supplied PR head SHA**. Do not substitute the issue branch, task-start snapshot, or another head.
- If the requested change cannot be made safely, report the exact blocker without committing. A blocker is preferable to false progress.

### MANDATORY DUAL REVIEW — meaningful code/behavior PRs

Before any meaningful code, behavior, security, data, or application-asset PR is merged, the exact current PR head must pass two independent review layers:

1. **Controller/assistant review:** independently inspect the actual PR diff against the issue requirements and CURRENT canonical Cartilla files. Jules self-review does not count.
2. **SonarQube Cloud PR analysis:** use the connected SonarQube Cloud project for `ejnburrows-rgb/cartilla-de-gretel` on the free plan. CodeRabbit is not required.

Reconcile SonarQube findings rather than accepting them mechanically. Confirm real issues, identify false positives/noise, and require fixes for every real blocker or major regression. Existing baseline findings on `main` do not automatically block a scoped PR; the merge gate is new/worsened PR-introduced risk plus any substantive regression independently confirmed by the controller.

After any substantive fix or any head-SHA change, repeat BOTH the controller review and SonarQube PR analysis against the new head. Then rerun task-specific verification and complete direct-cloud `pnpm verify:release` for application code/assets.

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

## CARTILLA DIGITAL DIRECTIVE — HIGHEST PRIORITY, NO EXCEPTIONS

Before doing any work on the Cartilla Workbook or teacher Flip Chart, read
`CARTILLA_DIGITAL_DIRECTIVE.md`. It is the canonical directive and overrides
all prior layout/fidelity instructions.

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
- **CONTENT** (text, images) → MUST match the book. Approved foreground art stays source-faithful; only the narrow source-preserving color-transfer exception in `ASSET_FIDELITY_POLICY.md` is allowed. Scenic backgrounds follow `repo.md`.
- **PRESENTATION** (styling, interactions) → MODERN digital, your judgment

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
- Multiple Jules/coding lanes may run in parallel when their scopes are genuinely isolated. Dependency chains that touch the same activity family remain sequential. Before merge, every parallel PR must be rechecked against current `main`; stale/conflicting work must be updated before merge.
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

Authorized Cartilla queue exception: for issues explicitly placed in the owner-authorized completion queue, the queue controller may merge after independent verification and advance the next dependency automatically. This is not permission for Jules to self-merge.


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
