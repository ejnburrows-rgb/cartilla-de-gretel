# Execution control: what is enforced, what is not

Written 2026-10-19 on branch `controls/execution-gate-20261019`, based on `main` 85ba286. Status words are limited to the four the owner set:
**ENFORCED AND VERIFIED**, **IMPLEMENTED, NOT YET ACTIVE**, **DOCUMENTED ONLY**, **BLOCKED / UNAVAILABLE**.

Nothing in this change is ENFORCED AND VERIFIED: it is an unmerged draft, and the real dispatcher is outside this repository. NO PROOF = NOT ENFORCED.

## Stage 1 inventory (inspected, not assumed)

| Question | Finding (evidence) |
|---|---|
| What starts a Jules task? | Not in this repo. AGENTS.md says "the established authorized Jules GitHub trigger" but never names it. Closed issues #667-#707 carry label `jules`; open PR branches look like `jules-<id>` and `motion/l4-lane-<id>`. Real trigger lives in Muse's tooling: UNVERIFIED. |
| Is Muse's dispatcher accessible/editable? | No. No dispatcher code exists in `main`. BLOCKED / UNAVAILABLE. |
| Can Instinct invoke or bypass it? | Instinct has no Jules connection by owner design. It can post to #877 and email Muse (instructions only, no technical gate). |
| Other task-creation routes? | Owner's swarm agent, ChatGPT, Opus, Jules itself (`jules-*` branches). All 84 open PRs show author `ejnburrows-rgb` (shared account), so authorship cannot identify a lane. |
| How is ownership recorded? | `docs/JOBS.md` (hand-edited, stale), issue #877 (500+ comments), `tasks/plan.md` (stale). No machine-readable record, no reservation. |
| Existing validations | `scripts/check-merge-policy.mjs` (Sonar-policy doc check, `assessMerge`) and its test. Called by hand only. Reused and extended here; no duplicate mechanism. |
| Two agents claim the same work | Nothing happens. No claim step exists. |
| Validation fails / GitHub unavailable | Undefined before this change. Now: unknown state is BLOCKED, never accepted (only inside the gate). |
| Can assignment proceed without validation? | Yes, nothing technical stops it. Still true for every path that does not use the gate. |
| Admin-dependent protections | `main` reports protected=true but required status checks are `off` with no contexts, repository rulesets list is empty, no CODEOWNERS. PRs #996 and #997 were merged into `main` by the shared account `ejnburrows-rgb` at 07:11 and 07:12 ET on 2026-10-19 (merge commits 77964b9 and 85ba286), so no server-side rule separated that account from an agent; who clicked merge is not visible from GitHub. Protection details, collaborators and Actions permissions need the owner's admin (API returns 401 to Instinct). |

## What was built (reuse first)

* `scripts/dispatch-gate.mjs` (new, dependency-free). `validateAssignment` returns ACCEPTED / REJECTED / BLOCKED with reason codes, per-file classification (independent, shared dependency, exclusive conflict, uncertain), policy revision (`mainSha`). `reserve` takes ownership atomically. `dispatch` is the controlled pathway: validate, reserve, then run the launch command; the command is never started if either step fails, and the reservation is released if the launch fails. `audit` lists open PRs that have no reservation (bypass detection).
  * Local backend: one `O_EXCL` file per work item and per exclusive file, with rollback. Race-safe on one shared filesystem only.
  * Git-ref backend: one `git push --atomic` creating `refs/reservations/<key>` on a shared remote. A second creator is rejected by the remote. Tested against a real local bare repository; NOT tested against GitHub (needs push rights to `refs/reservations/*`, which Instinct does not have).
* `scripts/check-merge-policy.mjs` (extended, existing file): `assessCompletion` checks a completion claim against live PR data (PR number, head SHA, changed files, reserved paths, tests with counts for that head, render proof URL for that head, lifecycle stage evidence). `assessMerge` now requires an owner approval bound to the PR number and the current head SHA; a new commit invalidates it.
* AGENTS.md: removed the four lines that let the controller merge; added a short pointer section (no new rule engine in prose).
* `tasks/plan.md`: rebuilt from verified state.
* No second database, no service, no GitHub Actions, no Instinct controller.

## Traceability: RULE -> EXISTING -> CHANGE -> ENFORCEMENT POINT -> TEST -> STATUS

| Rule (owner) | Existing implementation | Code change | Enforcement point | Test | Status |
|---|---|---|---|---|---|
| Every merge into main needs the owner's own yes, tied to the exact PR head | AGENTS.md lines 598/613 (text); `assessMerge` boolean `ownerGateSatisfied` | `assessMerge` requires `ownerApproval` bound to PR number + current head SHA; four AGENTS.md lines that let a controller merge removed | `check-merge-policy.mjs --evidence` (controller runs by hand). GitHub server side: nothing | check-merge-policy tests: missing, agent-authored, wrong PR, stale head, older SHA | Script: IMPLEMENTED, NOT YET ACTIVE. Server-side block: BLOCKED / UNAVAILABLE (owner admin). Text: DOCUMENTED ONLY |
| Only Muse dispatches | AGENTS.md text | `requester` must be `muse` | `dispatch-gate.mjs` validate | UNAUTHORIZED_DISPATCHER, bypass test | IMPLEMENTED, NOT YET ACTIVE (Muse's dispatcher does not call it: BLOCKED / UNAVAILABLE) |
| No duplicate work | AGENTS.md "inspect ownership first" | duplicate id / open PR / reservation check, atomic reservation | `dispatch-gate.mjs reserve|dispatch` | duplicate tests, 8-way concurrent test on local ledger and git remote | IMPLEMENTED, NOT YET ACTIVE |
| No conflicting file edits | AGENTS.md prose | exclusive-file reservation + classification; uncertain files block only themselves | same | exclusive conflict, partial-block, loser-holds-no-locks tests | IMPLEMENTED, NOT YET ACTIVE |
| Evidence-first dispatch (real gap, scope, acceptance) | AGENTS.md "MANDATORY EVIDENCE-FIRST DISPATCH GATE" (text) | required fields: gap+evidence, scopeRef approved by owner, acceptance kind+ref, reuse refs, instruction refs, policy revision | `validateAssignment` | missing-field, scope, acceptance, stale-revision tests | IMPLEMENTED, NOT YET ACTIVE |
| Dependencies satisfied before work | prose | dependency state check | `validateAssignment` | blocked / unknown / satisfied | IMPLEMENTED, NOT YET ACTIVE |
| Only provider-confirmed capacity; no filler | AGENTS.md capacity census (text) | provider availability + free slots must be verified; unknown = BLOCKED | `validateAssignment` | provider tests | IMPLEMENTED, NOT YET ACTIVE. Real Jules session state: BLOCKED / UNAVAILABLE (no provider API access from here) |
| No Antigravity | AGENTS.md deny gate | provider denylist | `validateAssignment` | PROVIDER_DENIED | IMPLEMENTED, NOT YET ACTIVE for gated path; Antigravity on the owner's machine: DOCUMENTED ONLY |
| Completion needs real proof | AGENTS.md prose; `assessMerge` self-asserted flags | `assessCompletion` compares claim to live PR | `check-merge-policy.mjs --completion` | 17 tests (empty, wrong SHA, fake PR, files mismatch, placeholder render proof, investigation distinct, stage evidence) | IMPLEMENTED, NOT YET ACTIVE |
| No GitHub Actions / paid CI / new services | workflow files marked manual-only | none (nothing enabled) | Actions settings are owner-side | none | DOCUMENTED ONLY (workflows are `workflow_dispatch` only; Actions permission state not readable by Instinct: BLOCKED / UNAVAILABLE) |
| No deploy without owner | AGENTS.md deployment section | none | Vercel settings (git deploys reported off on 2026-10-19; not re-read here) | none | DOCUMENTED ONLY |
| Stale ownership cannot authorize work | none | TTL + heartbeat; stale blocks until provider state is verified dead, then forced reclaim and atomic re-reserve | `validateAssignment` / `dispatch` | stale + reclaim test | IMPLEMENTED, NOT YET ACTIVE |

## Authorized routes and their classification

| Route | Covered by executable enforcement? | Class |
|---|---|---|
| Muse creates / triggers a Jules task | No: dispatcher not in repo or editable | NOT ENFORCED (gate exists: TESTED BUT NOT ACTIVE) |
| Anyone with the shared GitHub account adds a trigger label or opens a PR | No | NOT ENFORCED (`audit` can detect after the fact: TESTED BUT NOT ACTIVE) |
| Owner's swarm agent / ChatGPT / Opus open PRs directly | No | NOT ENFORCED |
| Reserve ownership | Gate local ledger and git-ref backend | TESTED BUT NOT ACTIVE; shared remote needs push rights: OWNER CONFIGURATION REQUIRED |
| Report implementation complete | `--completion` | TESTED BUT NOT ACTIVE |
| Mark merge-ready | `--evidence` | TESTED BUT NOT ACTIVE |
| Modify `main` | GitHub server side | OWNER CONFIGURATION REQUIRED (nothing blocks it today; #996/#997 merged 07:11-07:12 ET by the shared account) |
| Trigger deployment | Vercel git deploys reported off | NOT ENFORCED by this repo; setting is owner-side |

The audit of the real repository (`audit` against 84 open PRs, empty ledger) reports all 84 as unreserved: that is the correct, honest result before any dispatcher uses the gate.

## Owner actions required (PENDING until independently confirmed; verify each in GitHub Settings, option names can differ)

This is a personal repository, not an organization. Two things that are NOT available or not enough here: classic branch protection "Restrict who can push to matching branches" (organization repositories only), and a fine-grained token limited to certain branches (fine-grained tokens are scoped to repositories and permissions, not to branches).

1. Shared account problem: every agent writes as `ejnburrows-rgb`, so GitHub cannot tell the owner from an agent, and the owner account is admin (admins can merge their own PRs and bypass rules). Smallest fix: a second GitHub account for Muse/Jules, added as a collaborator with the Write role (not Admin), using a fine-grained token limited to this one repository with Contents: write and Pull requests: write.
2. Settings > Rules > Rulesets (works on personal public repositories) > new branch ruleset targeting `main`: require a pull request before merging with 1 required approval, dismiss stale approvals when new commits are pushed (this makes approval SHA-bound on GitHub's side), block force pushes and deletions, and restrict updates so only the bypass list can write to `main`. Keep the bypass list empty or limited to the owner's admin role. A Write-role agent account cannot approve its own PRs or bypass, and the owner approves from his own account. Without step 1, a rule on the shared account does not separate the owner from the agents.
3. Optional, for the git-ref reservation backend: the dispatcher identity needs push access to `refs/reservations/*`. A ruleset or the write role may already allow it; otherwise use the local ledger on a single machine.
4. Muse: route every assignment through `node scripts/dispatch-gate.mjs dispatch ... -- <jules trigger command>` and supply a fresh, complete state snapshot. Required sections: `capturedAt`, `mainSha`, `openPRs` (each with `files`), `reservations` (from the ledger, with `token`), `workItems`, `fileOwnership`, `authorizations` (each with owner message provenance), `providers` (`available`, `totalSlots`, `externalBusy`). A missing section is BLOCKED, never treated as empty. Until Muse does this, dispatch is NOT ENFORCED. Replacing Muse as dispatcher is not proposed.
5. Merge this PR yourself after review; it does not protect anything before that.

## Known limits (stated so nothing is over-claimed)

* Owner approval records (merge readiness, completion stage "approved", scope authorizations) are checked for well-formed provenance: owner, a channel message id in the channel's real format, timestamp not in the future and after the head commit, a quote, and binding to the exact PR number and head SHA. The checker cannot prove the message is real. Whoever presents the approval must confirm it against the owner's own channel.
* Completion scope comes from the live reservation (`actual.reservation`), never from the claimant.
* Provider capacity is reserved atomically as numbered slots (`totalSlots - externalBusy`), but `externalBusy` is only as accurate as the snapshot Muse supplies.
* A stale reservation is reclaimed only with `providerVerifiedDead: [{id, token}]` naming the exact reservation token; release is compare-and-swap on that token, so a newer reservation for the same work is never removed.
* Racing conflicting file claims: both racers may back off and retry with jitter. At most one keeps the claim; a loser is rejected.
