# Cartilla — Activate GitHub PR Quality Gates (Controlled Handoff)

**Repository:** `ejnburrows-rgb/cartilla-de-gretel`  
**Existing execution queue:** [Issue #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877)  
**Purpose:** Make verified code-quality checks run when a pull request targets `main`, while keeping expensive full visual verification focused and owner-controlled.

> **OWNER APPROVAL GATE:** The current `AGENTS.md` and both workflow files explicitly prohibit running GitHub Actions/hosted runners without new owner authorization. **This document is a proposed handoff, not authorization.** Do not edit operating policy, enable Actions, run hosted workflows, or change GitHub protection settings until the owner explicitly authorizes GitHub Actions for PR checks. Do not merge, deploy, spend money, or alter Vercel deployment settings.

## Existing system — reuse it

- `.github/workflows/verify.yml`: manual-only `workflow_dispatch`, currently runs `pnpm install --frozen-lockfile` and `pnpm build`. The build already checks production assets, TypeScript and unit tests before Vite compilation.
- `.github/workflows/visual-audit.yml`: manual-only comprehensive browser/visual verification; includes an additional build and screenshot capture. It is substantially heavier than basic PR verification.
- `AGENTS.md`: current agent instructions; `PROJECT_FINISH_DEFINITION.md`: release requirements; #877: live assignments/evidence. These remain authoritative.
- `vercel.json`: automatic deployments disabled; preserve this setting.

## Proposed implementation — only after explicit owner approval

### 1. Update the EXISTING `verify.yml` (lightweight required PR check)

Change **only the trigger**, initially; retain the current jobs, dependency versions, read-only token, and build script:

```yaml
on:
  pull_request:
    branches: [main]
  workflow_dispatch:
```

Continue using `permissions: contents: read`. Do not use `pull_request_target` for running PR code. Do not add secrets or production database credentials. Confirm the workflow executes on a test PR and that a deliberately broken check fails as expected. If the existing 15-minute timeout is insufficient, measure why before adjusting it.

### 2. Keep full `visual-audit.yml` owner-triggered initially

Do **not** run the full Workbook/Flip Chart screenshot audit on every PR by default. It repeats a full build and browser setup, and may be expensive in time. Retain `workflow_dispatch` as the initial trigger. Run it on the approved candidate before release, after the owner has authorized hosted Actions. Visual changes must still have targeted screenshot proof from their implementation agent on each PR.

Only if measured need justifies it, propose a separate *targeted* PR visual check for affected pages. Do not make a path-filtered or optionally skipped visual workflow a required status check: it can leave PRs pending.

### 3. Align existing `AGENTS.md`, without creating a second rulebook

After authorization, make one small change recording the actual policy:

> For pull requests into `main`, the GitHub `Verify / build` check must succeed for the current PR head, along with existing targeted tests, real-route evidence, independent review, and the owner's separate explicit merge approval. The full visual audit runs only for owner-approved release candidates or other expressly authorized cases. No passing check authorizes deployment.

Do **not** replace any other owner controls or the existing Jules verification process.

### 4. Make the check an actual merge gate in GitHub

After a successful test PR run, have an authorized repository administrator inspect **Settings → Branches → Branch protection rules** (or the currently active ruleset). For `main`, require pull-request reviews and require the exact successful check **`build`** from workflow **`Verify`** (select the GitHub Actions source if offered). Preserve existing protection rules and explicit owner approval; do not create conflicting overlapping rules.

**Note:** The connected GitHub integration can read the workflow YAML, but its request to read branch protection returned HTTP 403. Effective protection settings therefore must be inspected by an authorized administrator, not assumed.

### 5. Prove the automation really works

Use a safe test PR targeting `main`; no production deployment or real student data.

- A PR opening or new commit automatically generates `Verify / build`.
- The job runs `pnpm install --frozen-lockfile` and `pnpm build` against the PR code and reports the result.
- A deliberately invalid **test-branch-only** change causes the job to fail; the protected branch rejects merging while the required check fails. Restore that test change; do not merge it.
- A corrected commit triggers a new run. Confirm the check is tied to the current revision.
- Confirm full visual audit is not automatically running on every PR, and existing Jules exact-head evidence and owner merge/deploy holds still apply.

## Return only this proof

Owner-facing replies and completion handbacks must follow `AGENTS.md` section 12: begin with an actual visual diagram and use only **DONE and live / DONE but not live / WAITING / NOT TESTED**. The technical proof fields below support that handback; they do not replace it.

**STATUS:** Use the applicable `AGENTS.md` status label and name any authorization blocker
**FILES CHANGED:** Exact YAML and agent-instruction diff  
**CHECKS:** Links to successful and deliberately failed PR runs and exact head SHAs  
**MERGE RULE:** Screenshot or verified setting for required `build` check and independent review  
**COST:** Confirm standard public-repository runner entitlement and any unexpected usage implications *before* activation  
**REMAINING:** Any failing check or permissions limitation

**Do not call this fixed merely because this Markdown file exists.** It is fixed only when the authorized automation executes and an actual failing check blocks integration.
