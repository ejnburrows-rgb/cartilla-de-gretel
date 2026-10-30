# Page-entry navigation proof — October 29, 2026

## WORKS

- Reviewed material revision: e1a82cc14475b13a07bb5f034babf926ca0aae59, including main fcac0a23ba8749198b4fa64dbd2150cc606a04e0. Curl viewer implementation and missing-page regression exactly preserve independently reviewed 3b05982, removing the reintroduced f644fe3 defect. Fresh independent Codex review of e1a82cc reported no major issues.
- 11 contract/storage checks pass. The regression checks next/previous array-entry movement around 85→88 in spread and single-page modes; persisted activity contents stay attached to their page. See unit.txt.
- TypeScript and production Vite build pass. See typecheck.txt and build.txt.
- Real built route /cartilla/cuaderno: 390×900 and 1366×900, normal motion, actual next/previous button clicks: 85→88→89→90→89→88→85, then reload stays 85. Sixteen page/view checkpoints; no page errors. Only the resume pointer was initialized; no answers or activity completion were fabricated. See results.json, browser.txt, screenshots and both navigation.webm recordings. Scripts/proofs/check-page-gap.mjs reproduces this against a supplied base URL.
- The source does not contain pages 86–87; no pages or original artwork were invented or changed.

## DOES NOT WORK

- SonarCloud reports duplication on new code (10.5% at e1a82cc). It is an advisory failed check under the current effective branch protection, which has no required status checks; do not report every remote check as passing.

## NOT VERIFIED

- The legacy CurlPageViewer spread is not the current /cartilla/cuaderno runtime; its contract is unit-verified, not presented as a mounted-route recording.
- Physical phone, Safari, all 24 activity-completion journeys and production deployment are not established by these checks. This is navigation/storage scope evidence only.
