# Independent production-runtime repair review and correction

Reviewed implementation: `bfab98b6a22b691d9d80754285d25d4c1f7167f2`. Reviewed evidence: `production-runtime-gate-bfab98b6`, completed on 2026-11-03 at 22:04:07 UTC. Reviewer: `independent_review`, on the original review branch.

**DONE but not live:** the bounded build-environment repair, eight-test gate and captured production-runtime artifact are independently accepted. No material defect was found in the two-file implementation. Complete browser qualification and formal final review remain separate.

## Correction to the earlier artifact qualification

The complete 324b1383 unit result remains verified: 223 reported files, 2,195 ordinary passes, two unchanged pre-existing expected failures, and no unexpected failures or skips. Its seven existing performance assertions passed on a freshly generated Vite artifact. However, that build inherited `NODE_ENV=test` through the performance script. The captured artifact contained development React and development JSX. My earlier review's broader wording calling that artifact a fresh production build or production-qualified entry artifact was incorrect and is superseded here. Original reports, hashes and accepted receipts remain historical evidence; they are not silently rewritten into different bytes.

Read-only inspection of the old artifact's CPU profile found `react_stack_bottom_frame` and `Bs.jsxDEV` in its React vendor. The profile's single built-entry heading assertion passes with profiling enabled. Its sampled entry/CRM execution weight supports further diagnosis, but that diagnostic does not prove the original complete phone journey or establish the exact cause of the earlier deadline failure. The repository's BUILD-RUNTIME-QUALIFICATION-CORRECTION.md makes the same distinction and preserves the old artifact identity.

## Repair and completed verification

The performance script now forces `NODE_ENV=production` in the child Vite build's environment while preserving the test parent's environment. It leaves all seven existing budget, isolation and lazy-chunk checks and their limits intact. The new regression requires the parent to remain in the test environment and reads the real compiled CRM chunk to reject `jsxDEV`. This directly covers the demonstrated inherited-environment defect rather than mocking the build call. No application artwork, audio, route behavior or backend access changes are part of this implementation.

The completed focused run uses the original default-fork configuration with one worker and records eight passes, zero failures/pending cases, success true and process exit 0. Its before/after head is exactly bfab98b6 and its tracked source diff stays empty. The new production-JSX assertion and all seven original assertions pass. The build log records a fresh Vite build completed in 2 minutes 27 seconds.

The reviewer ran only receipt verification and read-only artifact reconciliation. The accepted receipt verifier returns PASS. Recomputed event fingerprint, work key and acceptance-to-reservation linkage match. Actual completion SHA-256 is `4ba1a6beed258c15b7744a202cb13b3e2689e1e0ea4c2b907f20c7cad1783379`, matching the accepted digest. Actual results SHA-256 is `4aab10cf7c4f301944f044a6b5dfebfa555e4aed750f395c8f70767db20503de`, matching the terminal record.

The captured manifest SHA-256 is `0b9229bd2551239ac843108ac102c0246392832fa64d74be679a6a6a882ea91b`. It names bfab98b6, links that exact gate completion and lists 445 files. Independent hashing of every listed current dist file found no mismatch. The current compiled CRM chunk `crm.index.lazy.BmInR15E.js` and React vendor `react-vendor.D492bSYW.js` contain neither `jsxDEV` nor `react_stack_bottom_frame`. The nested `.gitattributes` marks this evidence as binary/text-neutral (`* -text`) to preserve its exact receipt bytes.

This is a capture immediately after the completed focused build gate, with no intervening build reported. It does not retroactively replace the old 456-file artifact or its timing observations. The archived launcher is execution provenance with historical paths and identities, not fresh launch authority.

**WAITING:** the original full CRM phone journey against the captured build, complete browser qualification, remaining source decisions, physical-device verification and eligible formal review of the final combined version. The first temporary preview-config attempt failed before browser startup because its server cwd was missing; the corrected run was still active at review and is not credited as a pass. No test, browser, build, application edit, merge or deployment was performed by the reviewer.
