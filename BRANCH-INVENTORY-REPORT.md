# Branch Inventory Report

_Generated 2026-07-22 by the branch-inventory pass (`claude/branch-inventory-report`)._

## Plain-language summary (for the owner)

Over months of AI-assisted work this repository piled up **239 branches** — a
"branch" is just a separate copy of the code where one change was worked on
before being folded into the real app. The real app lives on the **`main`**
branch. Almost all of the 239 are finished work that's *already in* `main`, so
their branch copies are dead weight cluttering the branch list.

This report sorts every branch into three piles:

| Pile | What it means | Count | Action |
|---|---|---|---|
| **A — Safe to delete** | Its change was already merged into `main`. Deleting the branch loses nothing (GitHub can even restore it). | **167** | Delete |
| **B1 — Closed, never merged** | Someone opened a request for it but closed it *without* merging — abandoned or replaced by other work. | **37** | You decide (keep as history, or delete) |
| **B2 — No request on record** | Orphan branches with no merge request; leftovers from experiments. Two of these are **live open drafts** (keep them). | **34** (32 orphans + 2 live PRs) | You decide (mostly deletable) |

### ⚠️ Why the 167 weren't deleted automatically in this session
The owner approved deleting everything proven safe. I tried — but **this cloud
execution environment blocks branch deletion**: every delete attempt returns
`HTTP 403` from the security proxy (the token this environment runs under is not
allowed to delete branches), there is no "delete branch" tool available here, and
there is no `gh` command line in this box either. Deletion is genuinely
impossible from *here*. So instead I produced the ready-to-run script
`scratch/delete-merged-branches.sh` — it deletes exactly those 167 branches and
runs in one go from any machine/session that has normal GitHub delete permission.
See the OPERATOR-QUEUE at the bottom.

---

## How "safe to delete" was determined
The repo uses **squash-merges** (each merged request becomes one brand-new commit
on `main`), so a branch's original commits never literally appear in `main` — a
plain `git branch --merged` check finds nothing. The reliable signal is instead:
**was this branch the head of a pull request that was actually merged?** Every
branch in Pile A maps to a merged PR (its number and merge date are listed). Piles
B1/B2 are kept, never deleted, because they were *not* merged.

- Live branches on the server: **239** (incl. `main` + this report's branch)
- Merged pull requests found: **246** (204 distinct branch names)
- Currently open PRs: **#304** (`agent/wave2-student-e2e-smoke`, draft) and
  **#305** (`agent/wave3-lint-cleanup`, draft) — both kept.

---

## Pile A — Safe to delete (167 branches, already merged into `main`)

Run `scratch/delete-merged-branches.sh` to remove all of these at once.

| Branch | Merged PR | Merged on |
|---|---|---|
| `agent/wave2-darkmode-contrast` | #252 | 2026-07-21 |
| `agent/wave2-homepage-theme-control` | #253 | 2026-07-21 |
| `agent/wave2-remove-english-toggle` | #251 | 2026-07-21 |
| `agent/wave2-theme-toggle-a11y` | #250 | 2026-07-21 |
| `antigravity/integrate-branch-triage-report` | #205 | 2026-07-14 |
| `art/batch2-wire-in` | #56 | 2026-07-03 |
| `art/batch4-wire-in` | #58 | 2026-07-03 |
| `art/born-digital-center-workbook` | #287 | 2026-07-22 |
| `art/born-digital-illustration-depth` | #288 | 2026-07-22 |
| `art/born-digital-parallax` | #290 | 2026-07-22 |
| `art/flipchart-reduced-motion` | #289 | 2026-07-22 |
| `art/leccion1-batch` | #50 | 2026-07-03 |
| `art/urna-una-fixes` | #63 | 2026-07-03 |
| `art/wire-final-6-words` | #66 | 2026-07-03 |
| `art/wire-remaining-16-words` | #214 | 2026-07-16 |
| `chore-remove-console-log-15152885274475508630` | #216 | 2026-07-17 |
| `chore/archive-orphaned-i18n-toggle` | #292 | 2026-07-22 |
| `chore/archive-orphaned-language-toggle` | #295 | 2026-07-22 |
| `chore/archive-orphaned-teacher-v2` | #160 | 2026-07-11 |
| `chore/fix-ci-lockfile` | #217 | 2026-07-16 |
| `chore/gitignore-prod-secrets` | #197 | 2026-07-13 |
| `claude/branch-status-review-iz7j6j` | #204 | 2026-07-14 |
| `claude/cartilla-color-qa-pdodzt` | #234 | 2026-07-19 |
| `claude/cartilla-otto-audit-0jisf8` | #286 | 2026-07-22 |
| `claude/colorization-ni7494` | #229 | 2026-07-18 |
| `claude/continue-previous-session-4q4ncd` | #230 | 2026-07-18 |
| `claude/finish-app-batch1` | #236 | 2026-07-20 |
| `claude/full-sweep-analysis` | #242 | 2026-07-21 |
| `claude/jules-consolidation` | #276 | 2026-07-21 |
| `claude/loop-files-to-100` | #278 | 2026-07-21 |
| `claude/merge-team-protocol` | #275 | 2026-07-21 |
| `claude/page-layout-art-gap` | #237 | 2026-07-20 |
| `claude/polish-entrar-cta` | #256 | 2026-07-21 |
| `claude/polish-entrar-teacher-green` | #257 | 2026-07-21 |
| `claude/polish-remove-cloud-blobs` | #258 | 2026-07-21 |
| `claude/polish-remove-dead-theme-toggle` | #274 | 2026-07-21 |
| `claude/seed-teacher-report-numbers` | #279 | 2026-07-21 |
| `claude/seed-teacher-report-numbers-kai9w2` | #285 | 2026-07-22 |
| `claude/simplify-cleanup` | #255 | 2026-07-21 |
| `claude/toolkit-and-docs-standard` | #238 | 2026-07-21 |
| `claude/wave1-complete-directly` | #249 | 2026-07-21 |
| `claude/wave1-review-wave2-launch` | #246 | 2026-07-21 |
| `claude/wave2-progress-record` | #254 | 2026-07-21 |
| `claude/welcome-splash` | #235 | 2026-07-20 |
| `docs/agents-contract-and-art-backlog` | #61 | 2026-07-03 |
| `docs/always-answer-and-ask` | #76 | 2026-07-04 |
| `docs/antigravity-prompt-format` | #54 | 2026-07-03 |
| `docs/art-backlog-full-reaudit` | #73 | 2026-07-04 |
| `docs/art-backlog-verification-pass` | #222 | 2026-07-17 |
| `docs/close-art-backlog` | #64 | 2026-07-03 |
| `docs/colorful-games-direction` | #62 | 2026-07-03 |
| `docs/concise-answers` | #80 | 2026-07-04 |
| `docs/consolidate-loop` | #306 | 2026-07-22 |
| `docs/decide-dont-bounce-back` | #79 | 2026-07-04 |
| `docs/frame-requests-status` | #185 | 2026-07-13 |
| `docs/interactive-redesign-decisions` | #57 | 2026-07-03 |
| `docs/lasso-interaction-mockup` | #78 | 2026-07-04 |
| `docs/login-e2e-test-plan` | #148 | 2026-07-10 |
| `docs/memorize-owner-feedback-garden-gretel` | #92 | 2026-07-05 |
| `docs/refresh-operator-needs` | #202 | 2026-07-14 |
| `docs/spec-close-sentence-writing-gap` | #146 | 2026-07-10 |
| `docs/spec-update-turn-close` | #144 | 2026-07-09 |
| `docs/status-report-format` | #75 | 2026-07-04 |
| `docs/talk-plain-language` | #51 | 2026-07-03 |
| `docs/update-status-interactive-exercises` | #91 | 2026-07-05 |
| `docs/wording-change-note` | #59 | 2026-07-03 |
| `ejnburrows-rgb-patch-1` | #208 | 2026-07-14 |
| `feat/activity-mechanics-professional` | #180 | 2026-07-13 |
| `feat/aesthetics-flipchart-crm-polish` | #182 | 2026-07-13 |
| `feat/consonant-art-l10-l12` | #113 | 2026-07-07 |
| `feat/consonant-art-l7-mama-mono` | #111 | 2026-07-06 |
| `feat/consonant-art-lane1-l8-l11` | #112 | 2026-07-06 |
| `feat/consonant-vocab-art-partial` | #98 | 2026-07-05 |
| `feat/curl-rollout-all-lessons` | #228 | 2026-07-18 |
| `feat/elearning-crm-ui` | #171 | 2026-07-12 |
| `feat/faithful-page-premium-pass` | #71 | 2026-07-04 |
| `feat/faithful-pages` | #48 | 2026-07-02 |
| `feat/flipbook-garden-scene` | #88 | 2026-07-05 |
| `feat/frame-requests-fulfillment` | #177 | 2026-07-13 |
| `feat/gretel-full-pose-library` | #188 | 2026-07-13 |
| `feat/gretel-full-presence-voice` | #181 | 2026-07-13 |
| `feat/gretel-premium-polish` | #87 | 2026-07-05 |
| `feat/gretel-real-avatar` | #81 | 2026-07-05 |
| `feat/gretel-spoken-feedback` | #94 | 2026-07-05 |
| `feat/guia-json-clean` | #159 | 2026-07-11 |
| `feat/home-face-lift-book-pastel` | #184 | 2026-07-13 |
| `feat/home-hero-gretel-no-sticker` | #183 | 2026-07-13 |
| `feat/illustration-motion-everywhere` | #74 | 2026-07-04 |
| `feat/interactive-page-exercises` | #68 | 2026-07-03 |
| `feat/lesson-activities-selection` | #225 | 2026-07-17 |
| `feat/lessons-17-24-completion` | #173 | 2026-07-13 |
| `feat/living-art` | #176 | 2026-07-13 |
| `feat/merge-correctness-with-latest-main` | #67 | 2026-07-03 |
| `feat/page-paper-garden-tint` | #96 | 2026-07-05 |
| `feat/progreso-real-progress` | #219 | 2026-07-17 |
| `feat/reading-polish` | #223 | 2026-07-17 |
| `feat/real-garden-art-background` | #95 | 2026-07-05 |
| `feat/real-page-curl` | #227 | 2026-07-18 |
| `feat/recovery-plan` | #210 | 2026-07-15 |
| `feat/remaining-hd-art-slots-sprint` | #196 | 2026-07-13 |
| `feat/restore-pipeline` | #291 | 2026-07-22 |
| `feat/sentence-writing-draw-box` | #145 | 2026-07-10 |
| `feat/syllable-match-fill-in-blank-interactive` | #77 | 2026-07-04 |
| `feat/tap-verbs-and-pencil-cursor` | #226 | 2026-07-17 |
| `feat/teacher-chrome-book-warmth` | #190 | 2026-07-13 |
| `feat/teacher-complete-package` | #179 | 2026-07-13 |
| `feat/teacher-reconstructed-view` | #53 | 2026-07-03 |
| `feat/unified-art-manifest` | #44 | 2026-06-24 |
| `feat/vocab-art-wiring` | #97 | 2026-07-05 |
| `feat/vocab-real-art` | #65 | 2026-07-03 |
| `feat/workbook-scan-cleanup` | #161 | 2026-07-11 |
| `feature/docs-proposals` | #105 | 2026-07-14 |
| `fix-validators` | #141 | 2026-07-09 |
| `fix/abanico-wrong-crop` | #203 | 2026-07-14 |
| `fix/ardilla-crop` | #89 | 2026-07-05 |
| `fix/art-abanico-manual` | #82 | 2026-07-05 |
| `fix/art-abeja-maiz-manual` | #83 | 2026-07-05 |
| `fix/art-crop-tighten-batch` | #85 | 2026-07-05 |
| `fix/art-escalera-manual` | #84 | 2026-07-05 |
| `fix/art-globo-pera-final` | #86 | 2026-07-05 |
| `fix/audit-mobile-overflow-lesson15-sync` | #198 | 2026-07-13 |
| `fix/bad-art-crops` | #52 | 2026-07-03 |
| `fix/colorea-paint-routing` | #187 | 2026-07-13 |
| `fix/colorize-grayscale-illustrations` | #199 | 2026-07-14 |
| `fix/console-warn-stripped-from-build` | #147 | 2026-07-10 |
| `fix/consonant-vocab-book-match` | #186 | 2026-07-13 |
| `fix/consonant-vocab-wrong-content` | #221 | 2026-07-17 |
| `fix/consonants-vocab-and-teacher-guide` | #195 | 2026-07-13 |
| `fix/draw-box-wiring` | #142 | 2026-07-09 |
| `fix/gretel-liveavatar-bubble` | #110 | 2026-07-06 |
| `fix/gretel-nav-overlap` | #201 | 2026-07-14 |
| `fix/home-gretel-presence-no-hallucinations` | #193 | 2026-07-13 |
| `fix/lane-b-piano-buildword-motion` | #69 | 2026-07-03 |
| `fix/launch-qa-emoji-object-hints` | #192 | 2026-07-13 |
| `fix/leftover-escoba-ref` | #55 | 2026-07-03 |
| `fix/notion-curl-diagnostic-collisions` | #303 | 2026-07-22 |
| `fix/page-fidelity-and-plan-closeout` | #213 | 2026-07-16 |
| `fix/production-hardening` | #175 | 2026-07-13 |
| `fix/recover-weak-crops-lineart` | #191 | 2026-07-13 |
| `fix/redirect-remaining-lane-a-links` | #70 | 2026-07-03 |
| `fix/remove-garden-flowers` | #93 | 2026-07-05 |
| `fix/rescue-155-and-cleanup` | #156 | 2026-07-11 |
| `fix/rr-digraph-tracing` | #200 | 2026-07-14 |
| `fix/security-crypto-codes-chart-xss` | #300 | 2026-07-22 |
| `fix/student-art-color` | #220 | 2026-07-17 |
| `fix/student-login-dead-link` | #49 | 2026-07-03 |
| `fix/student-routing-v2` | #158 | 2026-07-11 |
| `fix/teacher-flipchart-shows-real-flipchart` | #118 | 2026-07-08 |
| `fix/tile-scan-lines` | #224 | 2026-07-17 |
| `fix/validator-false-positive-v2` | #143 | 2026-07-09 |
| `fix/vowel-workbook-page-inventory` | #90 | 2026-07-05 |
| `fix/wire-real-art-vocab-game` | #72 | 2026-07-04 |
| `fix/workbook-art-slots-in-repo` | #189 | 2026-07-13 |
| `jules/wave1-supabase-go-live-kit` | #247 | 2026-07-21 |
| `jules/wave1-teacher-functions-coverage` | #248 | 2026-07-21 |
| `main-11903241481115466817` | #231 | 2026-07-18 |
| `ops/confirm-bootstrap-teacher-login-mrjpm67o` | #194 | 2026-07-13 |
| `qa/task-7.1-final-verification` | #218 | 2026-07-16 |
| `refactor/book-faithful-helpers` | #302 | 2026-07-22 |
| `test-downloads-component-6857359563983852859` | #215 | 2026-07-17 |
| `test/adaptive-badges-profile` | #298 | 2026-07-22 |
| `test/core-logic-coverage` | #296 | 2026-07-22 |
| `test/exercise-stats-coverage` | #293 | 2026-07-22 |
| `test/more-pure-logic` | #297 | 2026-07-22 |
| `test/page-progress-coverage` | #299 | 2026-07-22 |
| `test/reapply-jules-coverage` | #301 | 2026-07-22 |
| `test/student-logic-coverage` | #294 | 2026-07-22 |

---

## Pile B1 — Closed without merging (37 branches — your call)

These had a pull request that was **closed but not merged** — abandoned attempts
or work that got superseded by a later branch. Their code is *not* guaranteed to
be in `main`. Safe to delete if you don't want the history, but not auto-deleted.

| Branch |
|---|
| `antigravity/cartilla-missing-assets-recovery` |
| `art/quality-qa-pass` |
| `chore/fix-xxx-placeholder-8197252096883356690` |
| `chore/remove-inert-duplicate-files` |
| `chore/update-xxx-placeholders-e2e-16330921704955813720` |
| `claude/cartilla-gretel-audit-9il1mp` |
| `claude/la-cartilla-notion-connector-0rqv7b` |
| `claude/paperback-to-crm-digitization-0vaqwi` |
| `demo/full-show-jul13` |
| `feat/content-extraction` |
| `feat/faithful-page-pilot` |
| `feat/functional-crm-completion` |
| `feat/grok-final-cartilla` |
| `feat/interactive-schema-correctness` |
| `feat/lineart-fallback-chain` |
| `feat/living-workbook-engine` |
| `feat/living-workbook-pipeline` |
| `feat/teacher-crm-overhaul` |
| `feat/ui-dark-mode-i18n` |
| `feat/workbook-manifest-pipeline` |
| `fix-insecure-random-17803870054984274286` |
| `fix-random-crypto-9697015070081128867` |
| `fix/chart-xss-vulnerability-6098537141952617340` |
| `fix/notion-pdf-curl-concurrent-diagnostics-8271459038098255795` |
| `jules-12237919791216105257-099eb4c5` |
| `jules-3274260411137799638-e4b2577f` |
| `jules-3622316119338198795-d3f69a6d` |
| `jules-7603488331973991513-eb60421e` |
| `jules-bugfix-interactive-minigames-18212473743626376195` |
| `jules-tests-error-page-5776327163915500342` |
| `main-11580880407568310308` |
| `refactor/book-faithful-statusForTextBlocks-8522825324577095480` |
| `refactor/get-workbook-pages-for-lesson-7662599923040847631` |
| `task-blocked-wrong-repo-16942958078693082538` |
| `test-random-with-seed-4687100930159217859` |
| `test/date-helpers-startofweek-6741146907823033920` |
| `test/workbook-interactions-coverage-2684163748842893879` |

---

## Pile B2 — No merge request on record (34 branches — your call)

Orphan/leftover branches with no PR, **plus the 2 live open drafts** (keep those).
The orphans are almost certainly deletable but were left untouched because there's
no merge record proving their content is in `main`. Spot-check any you care about
before deleting.

| Branch | Note |
|---|---|
| `agent/wave2-student-e2e-smoke` | **OPEN PR #304** (draft) — keep |
| `agent/wave3-lint-cleanup` | **OPEN PR #305** (draft) — keep |
| `art/batch3-wire-in` | no PR on record — orphan/abandoned |
| `art/final-6-words` | no PR on record — orphan/abandoned |
| `art/restore-pipeline` | no PR on record — orphan/abandoned |
| `art/vocab-vowels` | no PR on record — orphan/abandoned |
| `art/vocab-vowels-fixed` | no PR on record — orphan/abandoned |
| `chore/ci-ghost-verify` | no PR on record — orphan/abandoned |
| `chore/gha-startup-probe` | no PR on record — orphan/abandoned |
| `facelift-and-activity-fixes` | no PR on record — orphan/abandoned |
| `feat/art-extraction-consonants` | no PR on record — orphan/abandoned |
| `feat/art-vocales` | no PR on record — orphan/abandoned |
| `feat/consonant-art-l13-l14` | no PR on record — orphan/abandoned |
| `feat/consonant-art-l13-l16` | no PR on record — orphan/abandoned |
| `feat/consonant-art-l15-l16` | no PR on record — orphan/abandoned |
| `feat/consonant-art-l17-l20` | no PR on record — orphan/abandoned |
| `feat/consonant-art-l21-l24` | no PR on record — orphan/abandoned |
| `feat/crm-supabase-migration` | no PR on record — orphan/abandoned |
| `feat/verify-and-wire-consonants` | no PR on record — orphan/abandoned |
| `feature/gretel-poses` | no PR on record — orphan/abandoned |
| `fix-instruction-verbs` | no PR on record — orphan/abandoned |
| `fix-vocabulary-crops` | no PR on record — orphan/abandoned |
| `fix/art-extraction-batch` | no PR on record — orphan/abandoned |
| `fix/qa-audit` | no PR on record — orphan/abandoned |
| `fix/validator-shared-pages-false-positive` | no PR on record — orphan/abandoned |
| `grok-final/cloud-preview` | no PR on record — orphan/abandoned |
| `grok-final/validation` | no PR on record — orphan/abandoned |
| `grok-swarm/activities` | no PR on record — orphan/abandoned |
| `grok-swarm/art-color` | no PR on record — orphan/abandoned |
| `grok-swarm/crm` | no PR on record — orphan/abandoned |
| `grok-swarm/presentation` | no PR on record — orphan/abandoned |
| `grok-swarm/validation` | no PR on record — orphan/abandoned |
| `grok-swarm/workbook` | no PR on record — orphan/abandoned |
| `rules/faithful-restoration-standard` | no PR on record — orphan/abandoned |

---

## Open pull requests (do NOT delete their branches)

| PR | Branch | State | What it is | Recommendation |
|---|---|---|---|---|
| **#305** | `agent/wave3-lint-cleanup` | open · draft | Formatting-only lint cleanup (111 prettier fixes); typecheck/test/build green. | Review & merge, then its branch joins Pile A. |
| **#304** | `agent/wave2-student-e2e-smoke` | open · draft | Adds a Playwright student happy-path smoke test; unit tests green. E2E run blocked in its sandbox (dev server killed) — needs a fresh env to confirm green. | Re-run `pnpm test:e2e` in a clean env; if green, merge. |

---

## Follow-up / handoff prompts

### ▶ Paste to the NEXT Claude session (finish the cleanup + triage)
```
Branch cleanup follow-up for cartilla-de-gretel.

1. DELETE THE 167 MERGED BRANCHES. This session's environment blocked branch
   deletion (HTTP 403 from the proxy; no gh CLI; no delete-branch tool). Run
   scratch/delete-merged-branches.sh from an environment that CAN delete refs
   (gh CLI authenticated, or a PAT with contents:write). It deletes exactly the
   167 branches proven merged into main. Verify with `git ls-remote --heads
   origin | wc -l` before/after — the count should drop by ~167.

2. TRIAGE PILE B1 (37 closed-unmerged branches, listed in BRANCH-INVENTORY-
   REPORT.md). For each, decide keep-for-history vs delete. Default: delete the
   test-*/jules-*/chore-* placeholder branches; keep anything that looks like a
   real unfinished feature (feat/living-workbook-*, feat/teacher-crm-overhaul).

3. TRIAGE PILE B2 (34 branches). Keep the 2 open-PR heads (#304, #305). The
   other 32 are orphan/abandoned (grok-swarm/*, art/*, feat/consonant-art-*) —
   spot-check that their work landed via another merged PR, then delete.

4. Handle the 2 open draft PRs: review/merge #305 (lint), and re-run #304's
   Playwright E2E in a clean env, merge if green.

Do NOT delete: main, any open-PR head, or anything you can't prove is merged.
```

### ▶ Paste to the owner's own next session (plain language)
```
Branch cleanup is analyzed and ready. 167 finished-and-merged branches are
verified safe to delete and a one-click script (scratch/delete-merged-branches.sh)
is ready — it just couldn't run inside the cloud agent (that environment isn't
allowed to delete branches). Ask your next coding session (or run it yourself
where GitHub delete permission exists) to run that script. Then it'll triage the
~70 leftover branches and finish the 2 open draft PRs (#304 test, #305 lint).
Full breakdown: BRANCH-INVENTORY-REPORT.md.
```

---

## OPERATOR-QUEUE (needs the owner / an env with delete permission)
- **Delete the 167 merged branches** — IMPOSSIBLE from this cloud execution
  environment: `git push --delete` → `HTTP 403` (proxy egress/token policy denies
  ref deletion; confirmed on a single-branch attempt, branch stayed live); no
  `delete-branch`/`delete-ref` tool is exposed by the GitHub MCP here; no `gh`
  CLI installed; a raw REST `DELETE` can't be authenticated from here (git auth is
  proxy-injected, no token in hand). Fix: run `scratch/delete-merged-branches.sh`
  from a session/machine with GitHub delete permission (gh CLI or PAT with
  contents:write). This is the ONLY blocked item; everything else is done.
