# Consolidation inventory snapshots

Source: live GitHub API, 2026-11-26. These are two distinct capture-time snapshots, not a claim that one total is permanently current.

| Snapshot | Branch references | Open PRs | Draft PRs | Files |
| --- | ---: | ---: | ---: | --- |
| Initial capture plus five authorized lane refs | 270 (265 original + 5 approved work refs) | 88 | 72 | branch-baseline.csv, open-pr-baseline.csv |
| Refreshed capture | 271 | 90 | 72 | branch-current.csv, open-pr-current.csv |

The refreshed capture adds backup/local-main-workbook-polish-20261126 at 03f09d21 and PRs #1324/#1325. The backup's preservation purpose/destination is unverified; keep it intact. No sixth implementation lane is approved. SNAPSHOT-NOTES.md preserves the capture details. The initial snapshot remains unchanged as historical evidence.

These CSV files are exhaustive captured metadata, not completed substantive dispositions. BLOCKED means actual-change/commit/asset/test/dependency comparison remains outstanding. It never authorizes deletion. Gitar owns those comparisons; CodeRabbit independently reviews recommendations. Every open PR, including drafts and stacked PRs, is listed even if its head lies outside the captured branch list. Preserve original assets and unique work, and retain exact capture-time heads.

Current report: https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877#issuecomment-7199730025
