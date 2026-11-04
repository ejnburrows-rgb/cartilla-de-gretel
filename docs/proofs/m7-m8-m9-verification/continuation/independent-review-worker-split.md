# Independent review of worker route splitting

Reviewed configuration commit: `ca5d14f9ba18cac4a06ce2726a68f661e877bf9d`. Reviewed focused evidence: `runner-repair/worker-split-repair-final`, completed on 2026-11-03 at 21:49:07 UTC. Reviewer: `independent_review`, on the original review branch.

**DONE but not live:** the configuration and completed transform proof are accepted within the scope below. No material defect was found in the reviewed change. This is not browser readiness, full browser qualification, or formal release approval.

The worker configuration retains the TanStack plugin and automatic route splitting. The installed generator populates its map by normalized route-file paths, and the splitter transforms those route references. The application can therefore keep importing its committed `src/routeTree.gen.ts` while the worker generator writes its separate tree outside source. The plugin remains before React transformation. Production and Vitest options are unchanged; the alternate generated-tree destination applies only to worker mode, separately for open and gated lanes.

Both completed lanes contain lazy `tsr-split` references for the welcome and workbook routes. Their parsed static imports contain neither WelcomeSplash nor NativeLessonViewer. Generated route IDs match the committed tree. The recorded before and after maps contain the same 96 tracked route/tree files, with every SHA-256 and modification time unchanged. This addresses the specific generator mutation concern for the recorded run; it does not promise future route edits can never trigger generator canonicalization.

The diagnostic explicitly uses middleware mode and disables dependency discovery. It proves the selected transforms under that evaluator. It does not prove the normal dependency optimizer, HTTP startup, or the original CRM phone journey. Those remain separate runtime requirements under normal worker settings and unchanged assertions/limits.

The final script awaits each Vite close before recording final route checks. It then records remaining imported-plugin resources and explicitly exits the standalone process. The actual terminal record reports exit 0 and passed true. This supports completed transform execution, not a claim that imported plugins naturally release every process resource. Earlier syntax, unsettled-await, watchdog and terminated-residual-process attempts remain preserved failures.

The independent reviewer ran only receipt verification and read-only evidence checks. The accepted receipt verifier returns PASS. Recomputed work key, event fingerprint and acceptance-to-reservation link match. The evaluator-change invalidation fingerprint is canonical. The completion file hashes to its accepted evidence digest. The prior typecheck record has the same configuration head and reports typecheck exit 0; its actual hash matches the reused typecheck reference. That earlier record also reports a failed transform attempt, which is not presented as passing proof. No test, transform, browser, typecheck or build was rerun by the reviewer.

## Inspected byte identities

These SHA-256 values identify the actual local evidence bytes inspected by the reviewer. Git newline normalization may produce different text-blob byte hashes after publication. The completion receipt binds the terminal record; it does not itself include the result-file digest, so the independently inspected result and transform hashes are recorded here explicitly.

| File | SHA-256 |
|---|---|
| completion.json | `11915253d98ca8eabffa20fd1b6bd390267635885eeaf73ce399f750ccf60509` |
| result.json | `895beb2dd955b1414ffc542b4f1e31a3046d8e7295f6ac6275ebf7e12f6278bb` |
| verify-worker-split.mjs | `75cb426540107f729b2144ff02446e5dcc5ed8e7a5a88aba97e51acd1d21a415` |
| open-welcome.js and gated-welcome.js | `8c8ff1a2987ae83a036caedd9bb5026e51f67313aa82a8778b8e667937bd743d` |
| open-workbook.js and gated-workbook.js | `6ddde8666cd56f85d7d16264d85140817aaefba53cfbd327cd1178a7bd1a1721` |

The archived diagnostic drivers retain historical paths and accepted identities. They are execution provenance and must not be replayed as fresh launch authority.

**WAITING:** the original CRM phone runtime result under normal settings, complete browser qualification, outstanding source decisions, physical-device proof, and eligible formal review of the final combined version. The reviewer made no application edits or publication decision.
