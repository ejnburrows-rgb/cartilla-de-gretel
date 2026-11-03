# PR #1247 test repair receipt

State: DONE but not live for narrow implementation; final integrated gate and independent review remain WAITING.

Baseline: `d613b78ba553c3c5786afdf7d589305a3080f1cf` (application `fc3ca94e`). Reused failing-before evidence: [full-suite-results.json](../full-suite-results.json), 30 failed assertions, 11 failed result files, 7 performance checks skipped after a hook failure. This lane did not replay the full audit or run a build.

| Original assertion failures | Repair and retained coverage |
|---|---|
| 2 Windows child-process checks | Use `execFileSync(process.execPath, args)`; force a script path containing spaces in the regression fixture. Preserve both fatal-manifest and missing-Workbook-scan assertions. |
| 2 current-art precedence checks | Explicitly expect the already-quarantined elephant; bind its new full-source 570x540 content bounds. |
| 3 motion coverage checks | Stale registry entries must resolve to null. Preserve registry/action/anatomy checks. Account for exactly seven retained page-6 WebP archive files and assert none is a runtime placement; all current native placements remain covered. |
| 1 Workbook source hash check | Preserve the exact historical elephant/escalera PNGs from pre-ab06 Git objects; keep original hashes and add `sourceRevision` / `sourceArchive` / `supersededBy`. The approved displayed SVG pixels are unchanged. |
| 2 production-art evidence checks | Bind superseded Ema receipt to its exact archived PNG, current bytes separately to the new receipt. Refresh measured audit only after final integration. Preserve the normalized-crop classifier's 55 PASS expectation; this is not original RGB or alpha certification. |
| 7 historical cover assertions | Retain outward-turn checks; reconcile old replacement-vector butterfly, old coordinate frame, blink timing and whole-book motion assumptions against the approved original-cover shader. Assert original source use, mirrored localized wings, bounded motion, exact 1086x1448 alignment and reduced motion. |
| 5 historical pencil assertions | Test two separate ink diagonals plus a lifted connecting hop on one physical pencil, monotone spline segments, and the current queue's `data-workbook-pencil-active` lifecycle. |
| 7 historical pencil stress assertions | Preserve 50-mark and 100-cycle stress, abort, external-state, erasing, cursor and accessibility coverage. Assert serialized ownership and unique filter IDs across three successive owners. Reduced motion removes flight immediately but retains the semantic grading turn until completion. |
| 1 historical Ardilla assertion | Bind successful verification independently to the actual canonical source's digest/size instead of a superseded constant. All four fatal tamper checks remain. Production asset bytes and delivery manifest are unchanged after each test. |

Seven new Lesson-4 `motionDisabled:true` holds prevent old masks moving expanded crops. The dedicated regression binds all seven installed hashes to independent derivative-chain evidence, with the scene's later ground restoration in its own receipt. It explicitly rejects original-RGB equality; alpha correctness is a separate check.

Historical tests were copied from the original dirty checkout without modifying it. The untracked `before/WelcomeSplash.test.tsx` is an archived source snapshot whose relative imports cannot run there. It is preserved byte-for-byte as `before/WelcomeSplash.test.tsx.fixture`, rather than silently discarded or treated as current executable coverage. The current WelcomeSplash contract suite remains in its original location.

Focused results: first executable classification: 58 passed / 3 failed (61 total). Two failures came from the newly strengthened space-path fixture lacking package resolution, and one from an over-narrow 54-vs-55 expected classifier set; both repaired without weakening assertions. Final nine-suite result: **54 passed / 0 failed / 0 skipped**, exact implementation commit `4b4103164d140ecf7e4602d23f5d8be5a7cd64a3`; [raw JSON](test-repairs-after-focused.json), [run log](test-repairs-after-focused.log), [accepted receipt](test-repairs-accepted-receipt.json). The seven production-art audit assertions subsequently passed against the root-refreshed artifact; see addendum below. No full-suite or performance acceptance is claimed by this lane.

Environment failures retained in logs: C-drive exhaustion during isolated dependency preparation; cross-volume junction traversal; missing package files restored additively. Early no-output/worker-timeout attempts collected zero tests and are NOT TESTED, never passing evidence. Original source checkout and unrelated untracked files were preserved.

Integration owner must refresh `docs/production-art-classification-audit.json` against final assets, run the complete required gate once on the frozen head, obtain independent material and formal GitHub review, and retain source/device holds. No deployment.


## Final audit-set repair

DONE but not live: commit `1ab22cfa3097daf650895ca4baf22aeb8fa22dba` reconciles the current classifier set after integration. The superseded Ema receipt still binds to its archived original bytes, but the current Ema PNG stays PENDING (normalized crop match is insufficient). Restored page 29 enters the current PASS set only through its explicit original-source repair receipt, installed SHA-256 and affirmative `rgbMatch`. The expected total remains 55, with every prior PASS/PENDING/schema assertion retained.

The first attempted rerun used the old artifact after a Windows index/line-ending marker blocked its refresh: 5 passed / 2 failed, not accepted. After applying the root's audit-only commit `3afbd1d0` (worker equivalent `356eb5b395c050a056c52f966f32f0248b8427d1`), the exact seven-test suite passed **7/7**, zero skipped. [JSON](test-repairs-art-audit-final.json), [log](test-repairs-art-audit-final.log), [accepted receipt](test-repairs-art-audit-accepted-receipt.json). This closes the lane's focused assertion repair; the complete integrated gate and formal independent review remain separate requirements.
