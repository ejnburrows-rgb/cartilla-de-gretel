#!/usr/bin/env bash
# Deletes all 169 branches confirmed safe after a full inventory + salvage review:
#   117 exact-merged (byte-identical to a merged PR's head commit)
#  + 16 closed-without-merging (real rejected/superseded proposals)
#  +   6 "diverged" branches (merged once, received more commits after — each
#        individually reviewed this session; nothing left worth porting, see
#        inline comments below)
#  +  30 never-had-a-PR branches (salvage-scanned for real art/content first —
#        see inline comments below for what was checked and why nothing ported)
# After running this, the repo should have exactly 4 branches left: main,
# feat/content-extraction (excluded on purpose — the live Anti-Gravity
# channel), and the 2 currently-open PR branches.
# Run from a machine with the GitHub CLI (gh) authenticated, or paste into GitHub's web UI one by one.
set -e
REPO=ejnburrows-rgb/cartilla-de-gretel
gh api -X DELETE "repos/$REPO/git/refs/heads/antigravity/integrate-branch-triage-report"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/batch2-wire-in"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/batch4-wire-in"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/leccion1-batch"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/urna-una-fixes"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/wire-final-6-words"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/wire-remaining-16-words"
gh api -X DELETE "repos/$REPO/git/refs/heads/chore-remove-console-log-15152885274475508630"
gh api -X DELETE "repos/$REPO/git/refs/heads/chore/archive-orphaned-teacher-v2"
gh api -X DELETE "repos/$REPO/git/refs/heads/chore/fix-ci-lockfile"
gh api -X DELETE "repos/$REPO/git/refs/heads/chore/gitignore-prod-secrets"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/agents-contract-and-art-backlog"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/always-answer-and-ask"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/antigravity-prompt-format"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/art-backlog-full-reaudit"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/art-backlog-verification-pass"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/close-art-backlog"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/colorful-games-direction"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/concise-answers"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/decide-dont-bounce-back"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/frame-requests-status"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/interactive-redesign-decisions"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/lasso-interaction-mockup"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/login-e2e-test-plan"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/memorize-owner-feedback-garden-gretel"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/refresh-operator-needs"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/spec-close-sentence-writing-gap"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/spec-update-turn-close"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/status-report-format"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/talk-plain-language"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/update-status-interactive-exercises"
gh api -X DELETE "repos/$REPO/git/refs/heads/docs/wording-change-note"
gh api -X DELETE "repos/$REPO/git/refs/heads/ejnburrows-rgb-patch-1"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/activity-mechanics-professional"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/aesthetics-flipchart-crm-polish"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-l10-l12"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-l7-mama-mono"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-lane1-l8-l11"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-vocab-art-partial"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/curl-rollout-all-lessons"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/elearning-crm-ui"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/faithful-page-premium-pass"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/faithful-pages"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/flipbook-garden-scene"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/frame-requests-fulfillment"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/gretel-full-pose-library"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/gretel-full-presence-voice"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/gretel-premium-polish"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/gretel-real-avatar"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/gretel-spoken-feedback"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/guia-json-clean"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/home-face-lift-book-pastel"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/home-hero-gretel-no-sticker"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/illustration-motion-everywhere"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/interactive-page-exercises"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/lesson-activities-selection"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/lessons-17-24-completion"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/living-art"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/merge-correctness-with-latest-main"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/page-paper-garden-tint"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/progreso-real-progress"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/reading-polish"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/real-garden-art-background"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/real-page-curl"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/remaining-hd-art-slots-sprint"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/sentence-writing-draw-box"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/syllable-match-fill-in-blank-interactive"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/tap-verbs-and-pencil-cursor"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/teacher-chrome-book-warmth"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/teacher-complete-package"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/teacher-reconstructed-view"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/vocab-art-wiring"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/vocab-real-art"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/workbook-scan-cleanup"
gh api -X DELETE "repos/$REPO/git/refs/heads/feature/docs-proposals"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix-validators"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/abanico-wrong-crop"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/ardilla-crop"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/art-abanico-manual"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/art-abeja-maiz-manual"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/art-crop-tighten-batch"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/art-escalera-manual"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/art-globo-pera-final"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/audit-mobile-overflow-lesson15-sync"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/bad-art-crops"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/colorea-paint-routing"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/colorize-grayscale-illustrations"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/console-warn-stripped-from-build"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/consonant-vocab-book-match"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/consonant-vocab-wrong-content"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/consonants-vocab-and-teacher-guide"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/draw-box-wiring"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/gretel-liveavatar-bubble"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/gretel-nav-overlap"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/home-gretel-presence-no-hallucinations"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/lane-b-piano-buildword-motion"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/launch-qa-emoji-object-hints"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/leftover-escoba-ref"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/page-fidelity-and-plan-closeout"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/production-hardening"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/recover-weak-crops-lineart"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/redirect-remaining-lane-a-links"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/remove-garden-flowers"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/rescue-155-and-cleanup"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/rr-digraph-tracing"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/student-art-color"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/student-login-dead-link"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/student-routing-v2"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/teacher-flipchart-shows-real-flipchart"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/tile-scan-lines"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/validator-false-positive-v2"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/vowel-workbook-page-inventory"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/wire-real-art-vocab-game"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/workbook-art-slots-in-repo"
gh api -X DELETE "repos/$REPO/git/refs/heads/ops/confirm-bootstrap-teacher-login-mrjpm67o"
gh api -X DELETE "repos/$REPO/git/refs/heads/qa/task-7.1-final-verification"
gh api -X DELETE "repos/$REPO/git/refs/heads/test-downloads-component-6857359563983852859"

# --- The 16 branches behind closed-and-explicitly-rejected/superseded PRs.
# Confirmed each still exists as a remote branch (git ls-remote) and that its
# PR was closed without merging. NOTE: feat/content-extraction is EXCLUDED —
# its PR (#140) was also closed unmerged, but this branch is CLAUDE.md's live
# Anti-Gravity channel (checked every turn), not abandoned work.
gh api -X DELETE "repos/$REPO/git/refs/heads/antigravity/cartilla-missing-assets-recovery"
gh api -X DELETE "repos/$REPO/git/refs/heads/chore/remove-inert-duplicate-files"
gh api -X DELETE "repos/$REPO/git/refs/heads/claude/cartilla-gretel-audit-9il1mp"
gh api -X DELETE "repos/$REPO/git/refs/heads/claude/la-cartilla-notion-connector-0rqv7b"
gh api -X DELETE "repos/$REPO/git/refs/heads/claude/paperback-to-crm-digitization-0vaqwi"
gh api -X DELETE "repos/$REPO/git/refs/heads/demo/full-show-jul13"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/faithful-page-pilot"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/functional-crm-completion"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/grok-final-cartilla"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/interactive-schema-correctness"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/lineart-fallback-chain"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/living-workbook-engine"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/living-workbook-pipeline"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/teacher-crm-overhaul"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/ui-dark-mode-i18n"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/workbook-manifest-pipeline"

# --- The 6 "diverged" branches (merged once, then received more commits after).
# Each individually reviewed this session; nothing left worth porting:
#   - claude/colorization-ni7494: its 2 real unique commits (vocab lists,
#     perro/rana) were independently verified and already ported to main
#     (commits fbdcd83, 0ea083a). Nothing left on the branch.
#   - claude/continue-previous-session-4q4ncd: its 1 unique commit (garden-
#     world UI) was already manually ported to main (commits b37656b, ffafc77).
#   - main-11903241481115466817: its 1 "new" commit is empty (no file changes).
#   - feat/recovery-plan: its PLAN.md is an OLDER, less complete version than
#     what's already on main — porting it would be a regression.
#   - claude/branch-status-review-iz7j6j, feat/unified-art-manifest: ancient
#     branches (diff 1100-1900 files vs main); the handful of "missing" words
#     found only exist under an abandoned old lesson-numbering scheme and
#     aren't needed by the current curriculum (confirmed via consonants.json).
gh api -X DELETE "repos/$REPO/git/refs/heads/claude/colorization-ni7494"
gh api -X DELETE "repos/$REPO/git/refs/heads/claude/continue-previous-session-4q4ncd"
gh api -X DELETE "repos/$REPO/git/refs/heads/main-11903241481115466817"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/recovery-plan"
gh api -X DELETE "repos/$REPO/git/refs/heads/claude/branch-status-review-iz7j6j"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/unified-art-manifest"

# --- The 30 never-had-a-PR branches. Salvage-scanned before adding here:
#   - feature/gretel-poses: its only asset (garden background jpgs) is
#     generic AI-clipart flower/meadow art — the exact "little girl CRM"
#     look already explicitly rejected by the owner (PR #88/#93 feedback).
#     Not real book art. Not ported.
#   - The 14 art-extraction/consonant-art/vocab-crop branches below: spot-
#     checked several of their crops directly (moto.webp = a floral border
#     decoration, vaca.webp = a drinking-glass fragment) — these are the
#     same already-documented-and-rejected "best effort heuristic" batch
#     from commit bb3a458 (see ART_BACKLOG.md's "confirmed BAD, not just
#     unverified" section). Not ported.
#   - facelift-and-activity-fixes, fix-instruction-verbs,
#     feat/crm-supabase-migration, fix/qa-audit,
#     fix/validator-shared-pages-false-positive, chore/ci-ghost-verify,
#     chore/gha-startup-probe: all ancient (1100-2200 files diff vs main);
#     each describes work (instruction wording, Supabase CRM migration,
#     workbook art) that main's current, more complete implementation
#     already supersedes.
#   - The 8 grok-swarm/grok-final branches: a separate, never-reviewed
#     multi-agent experiment; several commits self-flag "HARD_BLOCKED".
# (demo/full-show-jul13 is handled above in the closed-unmerged-16 block —
# it was PR #174, "do not merge" in its own title.)
gh api -X DELETE "repos/$REPO/git/refs/heads/feature/gretel-poses"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/batch3-wire-in"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/final-6-words"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/vocab-vowels"
gh api -X DELETE "repos/$REPO/git/refs/heads/art/vocab-vowels-fixed"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/art-extraction-consonants"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/art-vocales"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-l13-l14"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-l13-l16"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-l15-l16"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-l17-l20"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/consonant-art-l21-l24"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/verify-and-wire-consonants"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix-vocabulary-crops"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/art-extraction-batch"
gh api -X DELETE "repos/$REPO/git/refs/heads/facelift-and-activity-fixes"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix-instruction-verbs"
gh api -X DELETE "repos/$REPO/git/refs/heads/feat/crm-supabase-migration"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/qa-audit"
gh api -X DELETE "repos/$REPO/git/refs/heads/fix/validator-shared-pages-false-positive"
gh api -X DELETE "repos/$REPO/git/refs/heads/chore/ci-ghost-verify"
gh api -X DELETE "repos/$REPO/git/refs/heads/chore/gha-startup-probe"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-final/cloud-preview"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-final/validation"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-swarm/activities"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-swarm/art-color"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-swarm/crm"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-swarm/presentation"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-swarm/validation"
gh api -X DELETE "repos/$REPO/git/refs/heads/grok-swarm/workbook"

echo "All 169 branches processed. Remaining after this: main, feat/content-extraction, and the 2 open-PR branches (task-blocked-wrong-repo-16942958078693082538, main-11580880407568310308)."
