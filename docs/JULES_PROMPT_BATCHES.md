# Jules prompt batches — Cartilla controller

These prompts are a manual fallback for the Cartilla Controller. Do not paste a batch when the controller already has an active Jules or OpenHands attempt for the same bounded job.

## Batch 0 — session operating contract

You are the implementation worker for the existing La Cartilla de Gretel repository.

Repository: ejnburrows-rgb/cartilla-de-gretel

Before changing anything:
1. Read current main.
2. Read AGENTS.md, PROJECT_FINISH_DEFINITION.md, PROJECT_SOURCE_OF_TRUTH.md, and tasks/plan.md.
3. Read the exact GitHub issue/PR named in the task.
4. Treat current runtime/repo evidence as newer than old comments or memory.

Rules:
- Work only on the bounded issue and exact allowed paths.
- Do not redesign the controller or re-audit unrelated work.
- Do not touch files outside the allowed paths.
- Do not merge.
- Do not deploy.
- Do not change secrets, production configuration, permissions, billing, or infrastructure.
- Do not create another task/session when an existing Jules session or PR can be repaired.
- Persist one material checkpoint early.
- Use current main as the starting point unless the task explicitly names another base.
- Create/update one PR only.
- Never claim completion from your own output. The controller independently verifies exact-head checks, review, release proof, and merge readiness.

If any requested claim cannot be proven from current repository evidence, leave it explicitly unverified instead of inferring it.

## Batch 1 — current #555 provenance task

Continue issue #555 only.

Goal:
Implement deterministic provenance verification for the 167 Flip Chart-native outputs using existing repository source material. The rejected PRs #556 and #557 proved that manifest metadata, file existence, filename similarity, or declared crop coordinates alone are not proof.

Allowed paths only:
- scripts/audit-foreground-art.mjs
- docs/production-art-classification-audit.json
- src/lib/__tests__/production-art-audit.test.ts

Required behavior:
- Compare the optimized output against the declared canonical source page/crop using deterministic evidence available in the repository.
- Only mark a row PASS when the repository evidence affirmatively proves the output corresponds to that declared source crop.
- If deterministic comparison cannot prove the row, keep it PENDING NO VERIFIED SOURCE and state exactly what evidence is missing.
- Never default missing verification to true.
- Never infer provenance from filename similarity.
- Do not modify image files.
- Do not regenerate or recolor artwork.
- Preserve all faithful-audit classifications exactly.
- Preserve current production/UI behavior.

Proof:
- Add/update the focused regression test first and prove the old logic fails it.
- Run the focused production-art audit test.
- Run pnpm typecheck.
- Report before/after counts.
- Report the exact rows whose classification changed and the deterministic evidence used.
- Update one PR only; do not merge.

If the current PR already exists, repair that PR in this same Jules session instead of creating a replacement.

## Batch 2 — repair a failed check or independent review

Continue the SAME Jules session and SAME PR. Do not create a new task, branch, or PR.

The controller/reviewer rejected the current PR for the following exact evidence:

[PASTE ONLY THE CURRENT FAILED CHECK OR REVIEW FINDING HERE]

Instructions:
1. Re-read the current PR head and current main.
2. Reproduce the exact failure with the narrowest deterministic test/check possible.
3. Fix only the root cause within the issue's allowed paths.
4. Do not weaken, delete, skip, mock away, or bypass the failing validation.
5. Do not broaden scope.
6. Push the repair to the existing PR branch.
7. Re-run only the checks invalidated by the new commit plus the issue-required checks.
8. Report the new exact PR head SHA and the evidence that directly addresses the rejection.

Do not merge. The controller will independently verify the new head.

## Batch 3 — stale-main / rebase repair

Continue the SAME Jules session and SAME PR.

The controller reports that main or the PR head changed after prior verification.

Instructions:
1. Fetch current main and current PR head.
2. Preserve the bounded issue scope.
3. Bring the existing PR branch forward safely onto current main without discarding unrelated valid upstream work.
4. Resolve only conflicts within the issue's allowed paths.
5. Do not reintroduce superseded/stale files from an older tree.
6. Re-run the targeted tests/checks required by the issue.
7. Push the updated existing PR branch.
8. Report the new exact head SHA.

Do not create a replacement PR and do not merge.

## Batch 4 — final worker handoff

Continue the SAME Jules session and SAME PR.

Before handing control back to the controller:
1. Confirm the PR is non-draft and references the correct bounded issue.
2. Confirm changed files are only the allowed paths.
3. Confirm the latest commit contains the intended fix and no stale/generated/unrelated files.
4. Run the issue-required focused tests and typecheck where applicable.
5. Read current check results, but do not treat missing/not-yet-published checks as failures.
6. Report:
   - PR number
   - exact head SHA
   - changed paths
   - tests run and results
   - remaining known uncertainty, if any

Stop there. Do not merge. The controller owns independent review, exact-head Sonar/release verification, and GitHub merge.

## Batch 5 — next bounded issue after #555/#454

Use this only after the controller proves the prior dependency is complete and makes the next issue runnable.

Work on issue #[ISSUE_NUMBER] only.

Read the live issue body and its cartilla-controller JSON block. Treat that block as the authoritative bounded scope.

Implement:
[ACTION FROM CURRENT ISSUE]

Allowed paths:
[PATHS FROM CURRENT ISSUE]

Dependencies:
[CURRENT DEPENDENCIES]

Required checks:
[CURRENT REQUIRED CHECKS]

Rules:
- Do not infer that a dependency is complete; verify it from GitHub/controller state.
- If dependencies are not satisfied, stop without changing code.
- If an active external attempt already exists for this same job, continue that attempt instead of creating another.
- Use one branch/PR for the bounded issue.
- Do not merge.

## Batch 6 — controller/Jules API debugging

Use only when the controller's direct Jules API lane itself is broken.

Repository: ejnburrows-rgb/cartilla-de-gretel
Canonical controller branch: watchdog/event-coordinator
Controller issue: #545
Controller PR: #552

First verify:
- current controller branch SHA
- production deployment SHA
- controller /api/status
- current Neon ledger state
- current JULES_ENABLED and presence (not value) of JULES_API_KEY

Expected architecture:
- JULES_API_KEY authenticates Jules requests via X-Goog-Api-Key.
- The controller discovers the exact Jules source matching ejnburrows-rgb/cartilla-de-gretel.
- A new bounded implementation job creates one Jules session with AUTO_CREATE_PR.
- The Jules session ID is stored as the durable external_id.
- Polling reads that same session until a PR output appears.
- Failed CI/review repair should use sessions/{id}:sendMessage on that same session rather than creating a duplicate session.
- If direct Jules API is unavailable, the existing safe OpenHands fallback may run without consuming the intended implementation retry budget.
- Unknown/ambiguous create outcomes must fail closed until reconciled.
- Jules never self-merges; the controller/GitHub merge lane merges only after exact-head gates pass.

Do not replace the controller. Fix the smallest proven defect, add a regression test first, run focused tests, then the full controller suite.
