# Corrected full E2E attempt — RELEASE HOLD

**INCOMPLETE. No complete E2E counts or passing release gate are claimed.**

The existing worktree remained at `c1e5e4c392c2c59a6404475a9677c2e6d8e2ef3f`. Its 2,404 tracked source/public/scripts/tests/config/package/lock blobs exactly match root application head `49747c7ef5fdff5926d463f491fad7c186b69d26`; the common listing SHA256 is `233ec74f27c94a5fac8fbdc14887340741699705729fcc144149eb36d9bb5af2`. Source/config working diff is empty under Git normalization. Existing newline-only metadata dirt was preserved.

The corrected attempt began after the integration owner closed its unit/build/browser jobs, demonstrated roughly9s no-app browser readiness, and included the rapid-practice visible-model fix. It used one worker instead of two, with every existing assertion, configured timeout and test preserved. No build or source edit occurred in this run. Both configured dev servers retained dead localhost Supabase54321/fake demo data. Matching Playwright1.63.0 Chromium1243/headless-shell was used.

Command: `pnpm test:e2e --workers=1 '--reporter=line,json' --output=work/release-e2e-sequential-artifacts`, with installed-supported `PLAYWRIGHT_JSON_OUTPUT_FILE` pointing to `work/release-e2e-sequential-results.json`. The line reporter supplied actual progress; the final JSON file was not emitted. A preceding command-format failure is separately retained: PowerShell turned an unquoted comma into reporter name `line json`; it failed before collection/server/test startup. Only shell quoting was repaired before this intended execution.

The runner announced353 planned tests. Last recorded scheduling was **100/353**, the existing thirty-minute Workbook lessons1–12 journey. The line log last changed at2026-11-03T16:43:40.455986Z. There are **63 partial failure reports**, retained individually and in a derived classification. These are not complete suite counts, and100 scheduled does not mean100 completed or imply37 passes. At later reconciliation there was no owned runner/worker/server process, no final JSON and no corrected-run terminal receipt. The former unified-exec session was unavailable. The interruption cause is unknown; a tool interruption was observed, but no causal termination link is established. The separate command-format exit1 is not represented as this run's exit code.

Bounded classifications of the63 recorded reports:

| Observed error category | Reports |
| --- | ---: |
| Browser `Page crashed` protocol/runtime failure | 42 |
| Other timeout or missing locator | 16 |
| Other assertion/runtime failure | 3 |
| Flip Chart ArrowRight page-counter mismatch | 1 |
| Welcome heading selector-contract mismatch | 1 |

The welcome check sought `h1#lc-welcome-title`. Flip Chart keyboard navigation expected `Hoja 2 de 3` but retained `Hoja 1 de 3`. Workbook completion/archetype cases repeatedly reported page crashes. Additional audio, CRM and final teacher-plate assertions failed. Raw expected/received values, stack traces and contexts remain attached. Categories describe errors, not certified root causes; this attempt does not dismiss behavior failures or attribute all failures to host conditions, tests, or the performance change.

During execution the host temporarily had647,612KiB physical and1,912,468KiB commit free; a later reading recovered to1,389,508KiB physical/3,264,912KiB commit free. Only one current browser tree was observed; no browser swarm was established. Memory snapshots/top-process readings were retained without closing unrelated apps. These observations do not certify crash causality. The runner continued while advancing and resource conditions recovered, following the integration owner's instruction.

The final JSON is absent and remaining coverage is unverified. No broad retry followed. Preserve the prior incomplete two-worker attempt separately. Reconcile recorded assertion/runtime failures and the execution interruption before choosing a bounded repair or a new eligible gate; do not manufacture a green release result.

Only this new evidence directory is committed. Automated specs also wrote their existing historical proof image/PDF output paths; those working files remain uncommitted and were not deleted, substituted or represented as acceptance evidence. Original app/test/config/budget files remain unchanged.
