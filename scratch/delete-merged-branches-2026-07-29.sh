#!/usr/bin/env bash
# Deletes the 29 branches whose work is already on `main`, as verified on
# 2026-07-29. See docs/BRANCH-INVENTORY-REPORT.md, section "Re-inventory —
# 2026-07-29", for the full record.
#
# Each branch below passed BOTH checks:
#   1. GitHub records a pull request with this branch as head and a real
#      merged_at timestamp;
#   2. that request's squash commit was found on `main` by its (#NNN) suffix.
#
# GitHub keeps deleted branches restorable for 90 days, so this is reversible.
#
# Run from a machine signed in with the GitHub CLI:  bash <this file>
# (The automated environment cannot run it — `git push --delete` and the API
# both come back HTTP 403 from the git proxy there.)
set -euo pipefail
REPO=ejnburrows-rgb/cartilla-de-gretel

del() { echo "deleting $1"; gh api -X DELETE "repos/$REPO/git/refs/heads/$1"; }

del chore/cleanup                              # PR #371
del chore/housekeeping-archive-branches        # PR #352
del chore/loop-status-e1                       # PR #350
del claude/book-realism-refresh-trsceb         # PRs #336 #337 #338
del docs/allow-generated-splash-art            # PR #342
del docs/d7-gate-done                          # PR #362
del docs/d7-live-db-status                     # PR #360
del docs/owner-launch-decisions                # PR #340
del docs/reconcile-e2-e3-status                # PR #375
del docs/retire-antigravity                    # PR #339
del docs/stale-claims-cleanup                  # PR #370
del docs/tool-agnostic-agents                  # PR #369
del feat/admin-live-gate                       # PR #361
del feat/admin-live-rls                        # PR #355
del feat/block-weak-passwords                  # PR #366
del feat/delete-teacher-account                # PR #368
del feat/input-adaptive-letter-trace           # PR #341
del feat/live-attention-count                  # PR #364
del feat/student-cloud-progress                # PR #334
del feat/student-pencil-cursor                 # PR #349
del feat/syllable-word-builder                 # PR #351
del feat/teacher-backend-live                  # PR #335
del feat/welcome-splash-scene-wiring           # PR #354
del fix/admin-overview-paging                  # PR #365
del fix/lock-down-seeding-function             # PR #363
del fix/word-builder-decoys                    # PR #373
del perf/lazy-route-split                      # PR #372
del perf/slow-network-loading                  # PR #353
del task-2-enforcement-layer                   # PR #377

# ---------------------------------------------------------------------------
# NOT deleted — these need an owner decision first. Uncomment to include.
# ---------------------------------------------------------------------------
# Pile B — never merged. Both look dead, but neither has a merge record, so
# neither is deleted automatically.
# del feat/professional-prelogin-splash        # PR #374 withdrawn; would only remove live splash files
# del claude/repos-progress-action-plan-hgdybu # superseded by #371 + five-day-stale doc edits

# Pile C — open pull request. Do NOT delete while the request is open.
# claude/branch-inventory-report-2c93h5 -> PR #376 (this report). Delete it
# after #376 merges.

echo "Done. Remaining branches:"
gh api "repos/$REPO/branches?per_page=100" --jq '.[].name'
