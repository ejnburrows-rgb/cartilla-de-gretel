# Branch Consolidation Report — 2026-07-22

**Goal reached: the remote repository now has exactly one branch — `main`.**
All 91 other branches were deleted after triage. GitHub can restore any deleted
branch from its UI if something is ever missed.

Plain language: a "branch" is a separate working copy of the code. Everything
valuable had already been folded into `main` (the real app) — the rest were
finished copies, abandoned experiments, or superseded drafts. This report lists
every branch and why it went.

Companion document: `BRANCH-INVENTORY-REPORT.md` (the earlier pass that removed
167 already-merged branches, 239 → 82) — this pass finished the job, 92 → 1.

## Merged today, then deleted (work IS in main)

| Branch | Why |
|---|---|
| `art/restore-b1` … `art/restore-b7` | Art restoration batches, squash-merged as PRs #321–#327 |
| `fix/lint-245` | Lint pass (277 → 0 errors), merged as #331 |
| `docs/inventory-report-update` | Final inventory report, merged as #329 |
| `jules-8083368422732617598-85f399a5` | Security-audit doc, verified + merged as #316 |
| `qa-unit-tests-utils-1708483087079131842` | 28 unit tests, verified green + merged as #317 |
| `jules-12670580107264829638-0b2aa23d` | Form-a11y labels, verified green + merged as #318 |

## Landed earlier via other PRs, then deleted (content already in main)

| Branch | Why |
|---|---|
| `docs/owner-prereqs-supabase-live` | Landed as #319 (loop-doc prereqs update) |
| `docs/land-branch-inventory-report` | Superseded by #329 (same report, landed there) |
| `claude/branch-inventory-report-2c93h5` | Draft of the same report; superseded by #329 |
| `docs/loop-status-304`, `docs/loop-status-308`, `docs/loop-status-311` | Status-log lines already folded into `docs/AGENT-LOOP.md` |
| `agent/wave2-student-e2e-smoke` | Merged as #304 |
| `agent/wave3-lint-cleanup` | Merged as #305 |
| `chore/lint-safe-followup` | Merged as #308 |
| `test/teacher-crm-e2e-smoke` | Merged as #311 |
| `rules/faithful-restoration-standard` | Standard already written into `AGENTS.md` (Task A, verified 2026-07-22) |
| `feat/consonant-art-l13-l14`, `feat/consonant-art-l13-l16`, `feat/consonant-art-l17-l20`, `fix/qa-audit` | Zero diff vs main — fully contained |
| `main-11580880407568310308` | **Special case checked per instruction:** its only unique commit was a README rewrite + teacher quickstart; `docs/GUIA-RAPIDA-DOCENTE.md` already exists on main and main's README is the newer version (with live URL + AGENTS.md pointer). Nothing missing. |

## Superseded security/test/refactor drafts, then deleted

These were closed-without-merge PR branches whose valuable content was
**reapplied on current main by later merged PRs** (see inventory report Pile A:
#300 security, #301 tests, #302 refactor, #303 script):

`fix-insecure-random-17803870054984274286`, `fix-random-crypto-9697015070081128867`,
`fix/chart-xss-vulnerability-6098537141952617340`, `fix/notion-pdf-curl-concurrent-diagnostics-8271459038098255795`,
`test-random-with-seed-4687100930159217859`, `test/date-helpers-startofweek-6741146907823033920`,
`test/workbook-interactions-coverage-2684163748842893879`, `refactor/book-faithful-statusForTextBlocks-8522825324577095480`,
`refactor/get-workbook-pages-for-lesson-7662599923040847631`, `jules-12237919791216105257-099eb4c5`,
`jules-3274260411137799638-e4b2577f`, `jules-3622316119338198795-d3f69a6d`,
`jules-7603488331973991513-eb60421e`, `jules-bugfix-interactive-minigames-18212473743626376195`,
`jules-tests-error-page-5776327163915500342`, `chore/fix-xxx-placeholder-8197252096883356690`,
`chore/update-xxx-placeholders-e2e-16330921704955813720`, `task-blocked-wrong-repo-16942958078693082538`

## Abandoned experiments / superseded eras, then deleted

The app's current art pipeline (restored-first fallback chain, B0–B7) and current
CRM/workbook architecture supersede all of these older attempts. None contained
work compatible with today's codebase that isn't already done better on main:

- **Old art era:** `art/batch3-wire-in`, `art/final-6-words`, `art/vocab-vowels`, `art/vocab-vowels-fixed`, `art/quality-qa-pass`, `art/restore-pipeline` (early draft of what landed as #291), `feat/art-extraction-consonants`, `feat/art-vocales`, `feat/consonant-art-l15-l16`, `feat/consonant-art-l21-l24`, `feat/verify-and-wire-consonants`, `fix-vocabulary-crops`, `fix/art-extraction-batch`, `fix-instruction-verbs` |
- **Grok experiment era (2026-07-12):** `feat/grok-final-cartilla`, `grok-final/cloud-preview`, `grok-final/validation`, `grok-swarm/activities`, `grok-swarm/art-color`, `grok-swarm/crm`, `grok-swarm/presentation`, `grok-swarm/validation`, `grok-swarm/workbook` |
- **Pre-current-architecture drafts:** `feat/content-extraction`, `feat/crm-supabase-migration` (real go-live is queue item D2), `feat/faithful-page-pilot`, `feat/functional-crm-completion`, `feat/interactive-schema-correctness`, `feat/lineart-fallback-chain`, `feat/living-workbook-engine`, `feat/living-workbook-pipeline`, `feat/teacher-crm-overhaul`, `feat/ui-dark-mode-i18n` (i18n was deliberately REMOVED — app is Spanish-only per D5), `feat/workbook-manifest-pipeline`, `feature/gretel-poses`, `facelift-and-activity-fixes`, `fix/validator-shared-pages-false-positive` |
- **One-off audits/demos/infra:** `antigravity/cartilla-missing-assets-recovery`, `claude/cartilla-gretel-audit-9il1mp`, `claude/la-cartilla-notion-connector-0rqv7b`, `claude/paperback-to-crm-digitization-0vaqwi`, `demo/full-show-jul13`, `chore/ci-ghost-verify`, `chore/gha-startup-probe`, `chore/remove-inert-duplicate-files` |

## Note on local clones

Old local checkouts of some of these branches may still exist on the owner's
machines; they are inert and can be pruned any time with
`git fetch --prune` + `git branch -d`.
