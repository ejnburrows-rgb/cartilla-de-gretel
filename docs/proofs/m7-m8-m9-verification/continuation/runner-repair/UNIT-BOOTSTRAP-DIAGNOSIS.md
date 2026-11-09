# Unit-runner bootstrap: bounded observations

No dependencies, application code, assertions, pool, startup limit or test timeout changed in these diagnostics. Root's prior default-fork Node26/24 failures remain in `continuation/unit-runner-repair/`; this report does not relabel them.

| Diagnostic | Actual result |
|---|---|
| Installed Vitest jsdom environment.setup(globalThis,{}) in separate fork children; empty document, no app/test imports | Both pass with clean teardown:Node26~4.63s setup/4.82s total;Node24~6.87s setup/7.02s total. |
| Actual installed workers/forks.js, immediate minimal real start message, jsdom, traces off; no app/test/setup imports | started~2708ms, stopped~2719ms, exit0~2780ms. |
| Actual parent, default config, collection-only scratch fixture importing only Vitest | Raw exit0; one diagnostic fixture discovered, zero product assertions. Standard setup imports Vitest/testing-library. See procedural disclosure below; this collection is not accepted passing receipt evidence. |
| Approved instrumented ORIGINAL page-completion-gate.test.tsx in integration checkout e65f401b294f76f9a8e926821876a177ff1bb621; default forks/maxWorkers1 | **12PASS/0FAIL/0PENDING, exit0.** Actual started response~3.73s; run/testfileFinished/stopped observed.27.78s duration; real p24syllable case17.997s within existing45s. Valid canonical evaluator_changed reservation against root's failed Node24receipt, accepted and verified in shared state. |

Both checkouts have identical `vite.config.ts` SHA256 `0f69d9f1fb3785616f99fad834dcc421bcfd197ebba65648a3dfd8e049b6a4d9` and the same node_modules junction target. Actual original-file fork capture records `viteModuleRunner:true`, `nodeLoader:true`, `isAgent:true`, traces disabled, no trace SDK, serialized defines present, and no NODE_OPTIONS. Worker arguments include experimental-import-meta-resolve, installed suppress-warnings preload and node/development conditions. Safe allowlisted environment fields are NODE_ENV=test,VITEST=true,VITEST_MODE=RUN,TEST=true. No complete environment, config, credentials or RPC payload was logged.

The original startup failure's cause remains **UNEXPLAINED**. These passing boundaries and the actual original-file pass rule out several broad explanations for these runs; they do not prove that instrumentation repaired Vitest. Parent instrumentation only observes fork/start/run/response/exit fields through a temporary preload and syncBuiltinESMExports, without dependency edits or permanent settings.

## Procedural failures preserved

The first parent-collection attempt failed before a fork because the diagnostic preload was inherited by Vite's loader thread and attempted exclusive creation of the same audit file. Exact `Vite.loadConfigFromFile` catch records EEXIST and preload stack in `parent-config-cause/`. The helper was repaired to operate only in its owning main thread/process.

The repaired collection's attempted typed invalidation used a noncanonical invalidation_id. Anti-Churn recorded `block_this_local_action`; the shell checked the CLI exit code rather than its decision and incorrectly continued into collection. The later acceptance correctly refused. No retroactive reservation/acceptance or product pass is claimed for that run. The subsequent original-file run independently used canonical invalidation fingerprinting and an explicit decision assertion; its valid passing receipt is separate.

The committed bounded runner now enforces reservation authorization at the actual process-launch boundary: explicit allow/allow_reexecution, outcome pending, evidence_accepted false, no prior acceptance, readable valid JSON. It rejects before output-directory creation and rechecks immediately before Popen. Missing/malformed/blocked/reused/advisory/nonpending receipts cannot start a child. Six focused tests cover these cases with no-spawn assertions and untouched sentinels, plus actual dummy-child success for both permitted decisions; traversal/cwd/existing-output preservation tests remain. This structural repair precedes the phone replay and any further full job.

Diagnostic source is copied under `unit-bootstrap-probes/`. The fixture is stored as `.ts.fixture` and the scratch `.test.ts` was renamed after collection, so no diagnostic case adds to normal unit discovery. Source/evidence scripts record local Windows byte identities; Git newline-normalized artifact bytes are a separate domain, as documented by integration owner.

No complete unit gate, full353 E2E, merge, deployment or production completion is claimed. Next: original affected CRM phone replay, then root's one frozen complete gate with safe phase instrumentation and unchanged requirements.
