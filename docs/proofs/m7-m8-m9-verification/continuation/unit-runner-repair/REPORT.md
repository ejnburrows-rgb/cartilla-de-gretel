# Isolated unit-runner startup diagnosis

Root owns integration; test_repairs continues bounded runner diagnosis. No broad suite was restarted.

| Check | Actual completed result |
|---|---|
| Original page-completion file, default forks, one worker, Node 26.2.0 | Exit 1; zero tests; worker-start response timeout at the existing 60-second limit. No transform/setup/import/test time recorded. |
| Same file/pool/worker count/limits, existing Node 24.22.1 | Exit 1; zero tests; same startup timeout. Runtime-only explanation is not established. |
| Plain advanced-serialization fork IPC, no app imports | Both runtimes pass; round-trip and normal exit, 112/107 ms. |
| Actual installed Vitest `workers/forks.js` import in a fork child, no start message or app imports | Both runtimes pass; before/after-import records and normal exit, 480/565 ms. |

Full command, candidate identity, raw output, JSON, terminal exit and accepted receipt are in `node26-isolated/` and `node24-isolated/`. The Node 24 comparison used an explicit single-use `environment_changed` invalidation bound to the earlier failed receipt and changed identities. Two local reservation preflights were rejected before any test launch (event identifier collision, then missing typed invalidation); the corrected reservation is retained. No passing result is inferred from these preflights or a zero-test run.

`bootstrap-probes/` retains the diagnostic source, raw results and accepted receipts. These probes establish working basic IPC and package import, not successful Vitest environment initialization or application tests. They deliberately create only their own probe children; a bounded timeout may terminate only that child.

Installed source inspection shows that Vitest sends `started` only after traces and `setupBaseEnvironment` finish, including jsdom environment initialization. Consequently the generic startup error does not establish an application assertion failure or a broken basic IPC channel. The next bounded check is exact jsdom setup/start-message handling, with no app/test imports. The execution slot has been transferred to test_repairs for that check.

The earlier complete suite remains failed/incomplete. No assertion, test timeout, startup limit, full-suite coverage, production art/audio, dependency, Node installation or permanent machine setting changed in this diagnosis. A supported thread-pool page-completion pass from the earlier checkpoint remains attributed to its original version; it does not relabel these default-fork failures or prove a complete gate.
