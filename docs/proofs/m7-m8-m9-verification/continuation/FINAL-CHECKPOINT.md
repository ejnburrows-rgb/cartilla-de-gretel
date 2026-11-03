# PR #1247 — current checkpoint, 2026-11-03

**WAITING: nothing merged or deployed.** Owner authorization for merge, CC0 sound retention, and manual production deployment is accepted ([record](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877#issuecomment-6606568478)). Technical, source and review gates remain unsatisfied. Automatic deployment stays disabled; the configured build still requires the full test gate. [Canonical coordination: #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877).

Current application/test identity: **49747c7ef5fdff5926d463f491fad7c186b69d26**. The practice-model source correction is26f70514e2d195006601e6aaff25c3dac512e7c9; later commits contain evidence only. Root remains the sole integration owner. The full default gate ran at580e8ddb760a9574f4795410da2b5b658f6f0c86, before the visual-model correction; newer checks identify the newer revision explicitly.

| Workstream | Owner / exact work identity | Changed files / evidence | Status, issue and next action |
|---|---|---|---|
| Performance | test_repairs; implementation649d0fd072cf50fe8580c8629376f9f6349af44a; model correction worker c1e5e4c392c2c59a6404475a9677c2e6d8e2ef3f matches current integrated app |13 app/test files below; [attribution/repair](PERFORMANCE-REPAIR.md), [raw focused log](performance-repair/performance-focused.log), [latest sizes](release-refresh/final-production-measurements.json), [replay](release-refresh/targeted-replay.json) | **DONE but not live.** Seven original performance assertions pass; thresholds unchanged. Full default gate remains failed/incomplete. |
| Source | source_recovery; b324ecba33783bd859ca2f32447194a7b966313b; integrated577b12d1bb5ead1dd44868e583d6bd1ad3e90c5f | Findings only: [source-recovery.md](source-recovery.md); bounded new-location delta found no originals; no artwork changes | **WAITING.** Pages35/41/47/53 need clean complete originals or precise caption-preserving placement decisions, below. No repeated flattened-PDF search. |
| Review | independent_review; published2dfdf53fe0b5155be1c7362398b246520c2fa9a3; accepted source delta26f70514 | [performance delta](independent-review-performance-delta.md), [helper review](independent-review-helper-guards.md), [security repair](HELPER-SECURITY-REPAIR.md);12/12 observed helper discussions reconciled/resolved | **WAITING.** Final delivery-head HOLD and eligible formal GitHub review required. Existing Graphify review targets61a6bd7b and is not current approval. No self-approval. |
| Runtime | root; built580e8ddb, corrected model49747c7e | [affected checks](release-refresh/runtime/results.json), [model after repair](release-refresh/runtime/practice-model-after.json), [console records](release-refresh/runtime/console-records.json), adjacent screenshots | **DONE but not live.** Cold startup defers practice/cloud client; trusted touch opens lessons, navigates presenter, loads approved audio and static p006 art. Visible model and correct-answer increment verified. Physical phone/projector **NOT TESTED**. |
| Integration/release | root; app49747c7ef5fdff5926d463f491fad7c186b69d26; delivery head recorded in #877 | [summary](release-refresh/summary.json), [full gate](release-refresh/gate-results.json), [newer typecheck/build](release-refresh/model-build-results.json) | **WAITING.** Corrected353-test single-worker E2E running at matching worker c1e5e4c3, final totals pending. Failed/incomplete gate, source holds and missing formal review prevent merge/deploy. |

## Current verification

- Policy, canonical prebuild, art preparation, asset verification (**584 checked, zero errors**) and typecheck pass. Production Vite build passes, including newer model revision. This does not establish a passing configured build with its mandatory test stage.
- Default isolated-fork full suite: **2,138 passed, one failed, zero reported skipped;218 files recorded; exit1**. Five discovered files containing54 baseline cases are absent, not reported skipped: performance7, ardilla tamper5, production art7, FlipchartHdPanel22, Workbook persistence13. [JSON](release-refresh/full-suite.json), [log](release-refresh/full-suite.txt). Page24 completion failed after74,958ms with STACK_TRACE_ERROR; JSON alone does not establish an assertion mismatch.
- Narrow default-fork replay: **seven files /60 assertions pass, zero failures/skips; process exit1**, because the page-completion worker failed to start (timeout waiting for response). This covers the54 missing cases and new practice regression. [Log](release-refresh/targeted-replay.txt). It is not a green process or replacement full gate.
- One-file page-completion replay using the supported thread pool: **12/12 pass, exit0**, page24 in5,324ms. [JSON](release-refresh/page-completion-thread.json), [log](release-refresh/page-completion-thread.txt). An alternate-pool pass does not relabel the default full gate.
- Production bytes raw/gzip: entry JS **244,153/57,241**; CSS **291,582/47,411**; first-paint JS **522,364/145,656**. Unchanged limits respectively512,000/128,000;307,200/51,200;1,003,520/276,480. Original test-environment build also has zero violations. No budgets, measured payload, assertions or timeouts were weakened.
- Browser proof uses trusted-touch emulation390x844 and viewport fit1366x768/1920x1080. Audio has playing/ended evidence, not human listening certification. TTS observations empty; zero console errors; initial unconfigured-Supabase warnings retained. Teacher/admin smoke uses demo fixtures: real backend authentication **NOT TESTED**. Earlier19 observations retain their original freeze identity.
- Initial corrected E2E invocation had reporter quoting failure before collection; the corrected invocation is one actual353-test attempt. Earlier interrupted attempt/readiness probes remain preserved. Eventual probe success over30seconds was not called fixture readiness. Final artifacts must distinguish actual assertions from browser crashes; transient host memory pressure does not establish the cause of every failure.

## Current narrow changes and source holds

Performance work moves the existing practice view behind its lazy route, defers existing cloud-client imports after existing guards, and limits CSS scanning to production sources. Access/redirect decisions remain unchanged. Targeted rendering found the pre-existing rapid-practice instruction lacked its visual model: the existing syllable is now shown with a polite atomic live region and meaningful regression coverage. No new artwork, audio or curriculum wording.

The13 app/test files: src/lib/auth-role.ts; src/routeTree.gen.ts; src/routes/cartilla/-practica-view.tsx; src/routes/cartilla/__tests__/practica-games.test.tsx; src/routes/cartilla/imprimir.$n.tsx; imprimir.all.tsx; practica.lazy.tsx; practica.tsx; presentar.$n.tsx; src/routes/teacher/admin.tsx; teacher/route.tsx; src/styles.css; tests/practica.test.tsx.

Four local proof helpers now share bounded CLI/path/output guards with eight boundary tests including a Windows junction. Restoration preflights destinations/source bytes and was not executed. This addresses observed helper findings, not global security clearance or concurrent hostile-filesystem certification. Public assets, configuration/packages/lockfile, restored ground, static holds, Tutor #1073, Mariposas and Workbook86–87 restrictions preserved.

Exact remaining source needs:

- **35:** complete Bebo/cloud-ball/ground; crop cuts body/cloud/ball; original caption intersects ground.
- **41:** full mouse/rose/wheel/lizard/flourish; title crosses ground/lizard.
- **47:** both cats, flowers, dish and full ground; title intersects scene.
- **53:** whole girl/turtle/bee/tub/ground including upper trail; caption/ground flattened together.

Each requires a provenance-backed complete clean original or an exact caption-preserving placement decision. No hidden pixels/replacement scenes invented. Source remains WAITING.

---

# Historical checkpoint — superseded by current section above

Retained historical evidence. Its old performance failures, totals, deployment-authorization wording and E2E status are not current conclusions.

# PR #1247 continuation — published qualification

Integration owner: Codex root. Application/test freeze: **`48dfec7d6a5ec3ac26171d745ea811621ad659db`**. Subsequent candidate commits contain evidence and the corrected bounded capture harness; they do not change application code, artwork, production metadata or executable unit tests. The published PR head and exact final reviews are recorded in [canonical #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877).

Owner approval to merge PR #1247 and retain the CC0 OwlStorm page-turn sound remains recorded and accepted. It is not repeated or expanded into deployment permission. **Nothing deployed.** `vercel.json` remains unchanged with `git.deploymentEnabled:false`.

| Workstream | Owner and exact work identity | Changed files / evidence | Remaining issue / next action |
|---|---|---|---|
| Independent review | independent_review; final candidate SHA in [final review](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/continuation/1247-review/docs/proofs/m7-m8-m9-verification/continuation/independent-review-final.md); source repair independently verified at3519b0e273c60935b16b5c9fa4c9e2f1414ead24 | `independent-review-baseline.md`, `independent-review-source-alpha.*`, `independent-review-ground-after.*`; reviewer branch final report changes no candidate implementation | Technical findings repaired; formal current-head GitHub review is recorded separately in PR timeline. Required gates still govern merge. |
| Test repairs | test_repairs, implementation4b4103164d140ecf7e4602d23f5d8be5a7cd64a3 plus1ab22cfa3097daf650895ca4baf22aeb8fa22dba; integrated freeze above | [Repair/classification ledger](TEST-REPAIRS.md), [54 passes](test-repairs-after-focused.json), [7 audit passes](test-repairs-art-audit-final.json), [complete suite](final-full-suite-forks.json) | Focused61/61 pass. Complete suite: **2189 passed / 4 failed / 0 skipped**. Resolve actual remaining failures; do not loosen budgets or assertions. |
| Source recovery | source_recovery, baseline d613b78ba553c3c5786afdf7d589305a3080f1cf; delivery cec30be6b72a6535cac64046e2517ccab43fac27 | [Four-page source search](source-recovery.md), `source-recovery-results.json`, comparison; [seven-asset source chain](lesson4-source-provenance.md), replay and JSON | **WAITING:** clean original scenes or exact caption-preserving placement decisions for35/41/47/53. Additional PDFs are flattened scans, not hidden clean layers. No substitute installed. |
| Targeted runtime | Codex root; application `48dfec7d6a5ec3ac26171d745ea811621ad659db`, Chromium trusted-touch emulation | [19 checks](runtime/results.json), [navigation recording](runtime/page@3e8cf599ac9d7bb2a6b412ae7868c1df.webm), [static/fit recording](runtime/page@07ba7aaa26df6d9b027e93b0ae92b9ee.webm),9 targeted screenshots, `runtime-check.mjs` | **DONE but not live:** taps and corner drags both directions, overlay clearance, five scenes static, seven p006 assets static, three viewport fits,0 console errors. Physical phone/projector **NOT TESTED**. |

## Actual implementation changes

- Seven `motionDisabled:true` flags in `src/data/flipchart-native-assets.json` hold old animation geometry still until it is reviewed against expanded source crops.
- `public/cartilla/art/optimized/flipchart-native/p006-scene.png` and `.webp`: restored source-exact opaque bottom band `[0,900,950,1250]`; no inferred pixels. All RGBA above y900 remains identical to baseline. [Reproduction and hashes](lesson4-ground-restoration.json), [independent after check](independent-review-ground-after.md).
- `src/data/workbook-page1-art.json`: historical source archive/revision pointers; displayed SVG art and its embedded hashes unchanged. Three exact pre-replacement PNGs and `superseded-sources.json` preserve real source evidence.
- Narrow tests: `scripts/__tests__/verify-production-assets.test.ts`, `scripts/__tests__/ardilla-tamper-resistance.test.ts`; `src/lib/__tests__/current-art-precedence.test.ts`, `digital-pilot.test.ts`, `living-page-by-page-coverage.test.ts`, `production-art-audit.test.ts`, `lesson4-source-motion-hold.test.ts`; retained historical `tests/adversarial-living-motion.test.ts`, `adversarial-workbook-pencil.test.tsx`, `empirical-pencil-flight-stress.test.tsx`. Historical broken-relative-import cover snapshot is preserved with unchanged content under Git LF normalization as `WelcomeSplash.test.tsx.fixture`.
- `docs/production-art-classification-audit.json` mechanically refreshed against integrated assets; thresholds unchanged. Current Ema is pending and page29's restored scene meets the existing crop correspondence checks. This normalized classifier does not certify exact original RGB or alpha preservation.
- Seven page6 WEBPs are retained non-runtime derivatives, not pre-PDF archive art. The runtime-source exclusion test preserves them and prevents their accidental use.

## Frozen gate and limits

- Policy, asset verification and typecheck: exit0. [Recorded commands/results](final-gate.json).
- Complete suite using repository-default isolated forks, maximum2 workers: **2189 passed / 4 failed / 0 skipped**. [Raw JSON](final-full-suite-forks.json), [raw log](final-full-suite-forks.txt).
- Production Vite build completed successfully inside the performance test hook. Builds ran sequentially. Existing CSS/chunk warnings remain; this is not a passing `pnpm build`/release qualification claim.
- Initial thread-pool full run exited native0xC0000005 before JSON; no counts inferred. Only the incomplete suite was rerun with the normal isolated workers. Passed policy/assets/typecheck reused. [Incomplete run](final-full-suite.txt).
- Full release-level E2E: **NOT TESTED** in this scoped continuation; the broader audit was not restarted.
- Runtime uses actual built `/cartilla/presentar/12,13,14,16,24,4`,390x844 touch, plus1366x768 and1920x1080 presentation viewports. No physical device/projector evidence is claimed. [390 presentation](runtime/presentation-390.png), [1366 presentation](runtime/presentation-1366.png), [1920 presentation](runtime/presentation-1920.png).
- Capture harness initially assumed right-hand default, then tried phone-hidden thumbnails. Those were harness errors, not proven product defects. Failed raw logs/video are retained. Navigation subsequently passed9 checks with shipped left-hand default; that exact-head segment was reused while only remaining static/fit checks ran. Final report contains19 passing observations and0 console errors. Runtime helper's bounded waits/visible-control correction is evidence-only.
- Original JPEG95 extraction is authentic but lossy. All seven visible RGB chains are reproduced; original-PDF byte/RGB equality is explicitly false. Alpha uncertainty elsewhere is not silently certified. The concrete deleted-ground defect was repaired and independently cleared.
- Tutor #1073, Mariposas assets, Workbook86–87 restrictions, original text/audio and unrelated untracked original-checkout files are preserved. No Jules navigation/dispatch, new controller, hosted Actions dispatch or deployment.

## Remaining complete-suite failures

- `tests/performance-budget.test.mjs`: Local Performance Budget & Teacher Route Chunking passes all budget checks without violations; Local Performance Budget & Teacher Route Chunking keeps Entry JS within raw and gzipped size budgets; Local Performance Budget & Teacher Route Chunking keeps Entry CSS within raw and gzipped size budgets; Local Performance Budget & Teacher Route Chunking keeps total first-paint JS payload within budget

[Exact existing-build size measurements](current-performance-failures.json): entry JavaScript1233.1KiB raw /269.4KiB gzip (limits500/125); entry CSS311.1/51.3KiB (limits300/50); first-paint JavaScript1740.2/424.6KiB (limits980/270). All six violations remain real and all budget assertions remain unchanged. Existing #877 performance work and #1241/#1242 already track four performance-budget failures; this is not a new duplicate startup-restructuring assignment. Next: reconcile that existing performance ownership and repair startup delivery there, then reassess affected checks here. No provider activity is inferred from old session records.

**Merge status:** owner yes is retained; merge remains conditional on these actual gate outcomes and independent current-head review. No bypass, self-approval or product-readiness claim.
