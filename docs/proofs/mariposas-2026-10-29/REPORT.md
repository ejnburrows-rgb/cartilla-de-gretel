# Scoped Mariposas release qualification — October 29, 2026

## WORKS

- Production baseline: existing teacher-publish-surgical-20261025 at 3c9d3911aa6ff97d45b7efb053127e6d271f51bf, READY deployment dpl_3Spzfw5iSzFPSYNvnuH6hrnYdy25. Its published teacher fixes remain unchanged. This is not a deployment of current main.
- Material release revision f9e00ee: 33 original game graphics and three game modules match independently reviewed 02514b183b8916b110c7bbd17519d42cf2d15dea; source-scope assertion passes. Game route gets only the reviewed Mariposas early return, shared CSS only the namespaced bfg block. No source audio or artwork was redrawn, replaced or regenerated.
- Existing build preparation now verifies immutable finished inputs using the already-reviewed main verifier. Sixty-seven ignored/generated delivery inputs missing from the historical checkout were recovered from the immutable currently deployed baseline; manifest byte counts and hashes are recorded in retained-production-inputs.json. These are already-published pixels, not new art selection.
- Node 24.22.1 matches the existing Vercel project's Node 24 target: asset verification passes 477 checks; TypeScript passes; all 119 unit suites / 1,507 tests pass, with two existing expected failures; Vite production build passes. Raw logs include the earlier assertion failure, corrected test entry, worker timeouts and successful serial run. No failed result was rewritten as a pass.
- Six built-browser journeys PASS against the scoped release preview at http://127.0.0.1:5188: desktop six-word result and reload, normal-motion phone touch/wrong answer/help, tablet/laptop/projector fit and original served-image hashes, visible keyboard focus, help focus trap/Escape/restore, and viewport rotation during both delivery and retrieval. See scoped-browser.txt, actual screenshots and six named recordings.
- Browser harness: reused the existing main checkout's Playwright 1.63 runner with the exact unchanged butterfly-garden.spec.ts, because historical baseline Playwright 1.52 stalled before test collection on local Node 24/26. The runner and test collection were diagnosed separately; no product dependencies or assertions were changed. Test cwd/output and preview were the scoped release checkout.
- Vercel git auto-deploy remains disabled. The existing October 28 authorization covers this Mariposas-only release; no paid service/settings or full-main release is included.

## DOES NOT WORK

- Earlier full-run worker startup timeouts and the initial lazy-route test timeout are retained in raw logs; the corrected targeted checks and complete serial run pass. Historical Playwright 1.52 did not execute tests locally; its empty/stalled runner logs are retained.

## NOT VERIFIED

- This local qualification is not evidence of a new live deployment. Deployment ID, exact Git SHA, canonical alias and live behavior will be recorded after the authorized publish.
- Physical phone/Safari and full classroom readiness, original Gretel voice alignment, the remaining source artwork and all 24 lesson activity flows are not established here.
- Rollback baseline remains dpl_3Spzfw5iSzFPSYNvnuH6hrnYdy25. No rollback is performed unless required by a verified regression.
