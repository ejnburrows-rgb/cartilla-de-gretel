# Mariposas continuation — October 29, 2026

Existing PR: [#1079](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1079), branch `butterfly-garden-mariposas-p`. Existing repair work #1043 / #1166 was recovered rather than replaced. Current main `a8884eb12c8202d1c0416f2c392b45db4e35bd91` is incorporated at `acfa6d21668da67bf45a8ffeda91eb47a28a787f`.

## WORKS

- Real **production Vite output**, served at `http://127.0.0.1:5178`, passes [all three recorded browser journeys](built-browser-tests.txt). Product source is the unchanged game tree from `8629b724db57438b8210a9ed574649f587d938ab`; subsequent source changes repair test entry points and Windows text fingerprints. Final production output was built by the successful full `pnpm build` gate on frozen material candidate `acfa6d21668da67bf45a8ffeda91eb47a28a787f`; later commits add proof files only. A final repeat against that output passes [all three journeys](release-browser-tests.txt).
- Desktop 1280×720: all six original words completed; exactly one `game:mariposas-p` exercise result recorded, six hits out of six, repeated check did not duplicate it, result survived reload. Keyboard Enter retained watering-can focus. Wrong syllable returned. Reduced-motion delivery used exactly two endpoint transforms. [Screenshot](desktop-completed.png), [recorded round](desktop-round.webm).
- Phone 390×844 with emulated touchscreen: animated delivery, wrong-card retrieval, correct `mapa`, instructions open/close and next word, with no page exceptions. [Screenshot](phone-correct.png), [recording](phone-touch.webm). This is browser touch emulation, not physical-device or Safari evidence.
- Tablet 768×1024, laptop 1366×768, projector 1920×1080: all required controls remain inside the viewport, all images load, no page exceptions. [Tablet](viewport-768.png), [laptop](viewport-1366.png), [projector](viewport-1920.png).
- Network-fetched `currentSrc` bytes identify **all 33 original game masters** without alteration. [Served hashes and master filenames](served-original-image-hashes.json). No artwork or recordings were modified by this continuation.

## DOES NOT WORK

- Initial exact-head preview failed three artwork/identity/inventory tests. [Previous Vercel build](https://vercel.com/ejn/cartilla-de-gretel/E95rJ9yqtZWu1sq9Mvz95poPgjj7).
- Two local full runs exposed Windows-only text fingerprint/lazy-fixture failures and a cold performance-build timeout. Their raw failures are retained: [first](initial-full-build.txt), [second](second-full-build.txt). Follow-up targeted regression evidence: [20 checks](build-regressions.txt), [10 Workbook resume checks](resume-regressions.txt). Assertions and performance budgets remain intact.
- Dev-server browser attempts exposed cold fixture/load timing and harness assumptions about a moving control. [Initial](initial-browser-tests.txt), [retry](dev-browser-retry.txt). The built-app journeys above exercise the actual moving touchscreen control and pass; no forced click or fabricated completion is used.

## NOT VERIFIED

- **Full build passes:** 203 suites, 2,064 tests passed, two pre-existing expected failures; TypeScript, 584 asset checks, fresh performance budgets and final Vite production compilation pass. [Raw full gate](full-build.txt). [Policy gate](policy-tests.txt): 20/20 checks and all governing docs pass. These are engineering results, not whole-product classroom acceptance.
- Integration and deployment have not occurred. GitHub protection requires resolved conversations; required approval count is zero. Existing independent review findings were repaired, but fresh independent review of the material change remains outstanding. No protection was altered and no self-approval was submitted.
- Original Gretel audio remains deferred specifically for this game's hooks by its existing owner decision; no TTS or rejected clips were enabled. Whole-product original-voice integration remains required by the finish definition.
- This is scoped Mariposas verification, not assembled acceptance of all 24 lessons, the teacher CRM, Flip Chart, physical phones, Safari, real child data, or full Cartilla release.

## Changes and retained evidence

- Recover #1166 Page 1 bee/ring fingerprints, concrete-reference scanner, LF text fingerprints, SVG motion freshness and progress-component test entry point. Regenerate existing audit/inventory from current approved bytes. Preserve canonical mapping, nine native PASS rows and 158 pending rows; inventory contains 108 concrete referenced assets and zero path errors.
- Address the three existing independent game findings: complete-round progress, reduced-motion JavaScript flight, stable landscape button identity/focus. [Game regressions: 10/10](game-tests.txt), [art metadata regressions: 16/16](art-metadata-tests.txt).
- Preserve both existing game candidates (#1079 and #1010), original graphics, original curriculum, singular-eye decision and deployment settings. `git.deploymentEnabled` remains false.

Next: obtain required independent review; resolve only actually addressed conversations; merge/deploy only when all applicable gates are satisfied. Continue original independent completion lanes while any integration gate remains open.
