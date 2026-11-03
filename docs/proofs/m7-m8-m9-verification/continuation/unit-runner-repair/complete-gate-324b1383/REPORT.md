# Complete combined unit qualification

> Runtime qualification correction: see [BUILD-RUNTIME-QUALIFICATION-CORRECTION.md](../../BUILD-RUNTIME-QUALIFICATION-CORRECTION.md). The fresh build inherited the test runtime; the completed unit results remain valid.

**DONE but not live.** Frozen candidate `324b1383224d3842a197d67a2469d9bebab647b6`; application repair identity `2a0fc1d8` (same app delta as worker `610727d7`). One complete run, default isolated forks, one worker, Node 26.2.0, with the reviewed safe parent-phase audit preload. No assertion, coverage, startup limit or test timeout changed.

- Policy regressions and policy-doc checks: exit 0.
- Production assets: exit 0.
- Typecheck: exit 0.
- Fresh production Vite build and all seven unchanged performance-budget checks: pass. The build ran inside the existing performance suite; no competing job ran.
- Complete unit process: exit 0; **223/223 discovered files reported**, no missing/unexpected files.
- **2,195 plain passes, two pre-existing expected-failure cases, zero unexpected failures, zero skips**, 2,197 total configured cases. Vitest JSON includes the expected failures in its 2,197 passed count; CLI separates them. `count-disposition.json` identifies both real-timer gesture-helper `it.fails` cases and confirms their source Git blob is unchanged from the supplied 226991ec baseline.
- Head and tracked source diff remained unchanged throughout. No untracked source tests were present at start; the diagnostic fixture was not part of discovery.

Raw commands/PIDs/exits/timestamps and frozen-source checks are in `completion.json`; `discovered-files.json` is reconciled against every result path in `results.json`. Full stdout/stderr and parent start/run/stop audit are retained. The accepted receipt binds the LF-written completion bytes and was verified after acceptance. This is a complete current run, not an aggregation that relabels the earlier failed/incomplete gate.

Earlier startup failures remain unexplained; instrumentation is observation, not a claimed permanent fix. The complete run now supplies finished, passing configured-unit evidence under the recorded evaluator. Existing CSS minifier warnings at lines 318/1374 also occur in the earlier model-build log; no new warning-based product defect is inferred or hidden.

Complete browser qualification, affected phone readiness, four owner source choices, physical-device proof and eligible final-head formal review remain separate requirements. No merge, deployment, production audio approval or whole-product completion is claimed.

## Existing production artifact for entry diagnosis

`post-build-dist-manifest.json` records 456 index/assets file hashes captured after this gate, linked to the immutable completion/build-log hashes. No other build job occurred before capture; production source/configuration and the working source diff remain unchanged from 324b1383. This is post-build capture, not a claimed contemporaneous build-time attestation. The old static `dist/build-version.txt` is disclosed as non-authoritative and is not used to identify this build or a release. Later proof/test-diagnostic changes are outside production Tailwind inputs (`source(none)` plus explicit `../src`, with tests excluded).
