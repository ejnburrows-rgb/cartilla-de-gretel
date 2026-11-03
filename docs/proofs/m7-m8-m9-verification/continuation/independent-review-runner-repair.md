# Independent bounded runner and teacher-control review

Exact reviewed worker commit: `267965c9c94a999fe0daa357bc5e0d43c32db39f`. Root reports the identical changed files integrated as `90ae9417`; this review's direct source identity is the worker commit. Reviewer: `independent_review`, review-only on the original review branch.

## Material conclusions

The default Playwright configuration retains both projects, both 5173/5174 servers, the original test match/ignore split and unchanged expectations/timeouts. Its recorded discovery JSON contains 353 tests; the explicit `PLAYWRIGHT_OPEN_ACCESS_ONLY=1` option excludes the two gated tests and their unused server only for bounded work. This optional mode is not the full release gate. Discovery output's 353 skipped records reflect listing, not 353 executed skips or passing coverage.

The page8 phone test now inherits the project's baseURL and uses the existing openBook setup. Its real touch sequence and two-line result assertion remain intact; finally closes the context even after failure. The welcome test targets the approved semantic level-one heading rather than the stale DOM ID, with exact accessible name retained.

The thumbnail tablist implements one selected Tab stop plus Arrow/Home/End focus and selection. Its events stop propagation, preserving the existing distinction between native-control keystrokes and stage-level shortcuts. The accessibility test now verifies each thumbnail's focus, selected state and sheet counter before moving focus to the stage and separately checking global arrows. No meaningful navigation expectation is removed. The existing turn machinery, drag thresholds, hinge and transform paths are unchanged. The 25/25 completed unit results include three new boundary/tab tests; their reduced-motion mock proves immediate selection/focus behavior, not animated physical-turn browser proof.

Unavailable page corners are outside Tab order, hidden and excluded from pointer hit testing; enabled-corner direction remains hand-mode dependent. This prevents a nonexistent single-sheet navigation target intercepting the audio artwork. An initial concern about removal of the inner laser tabIndex condition was withdrawn: the enclosing `!laserPointerActive` condition unmounts both corner controls. No reachable laser-mode regression is established.

The preserved diagnostic stderr identifies the selected Playwright headless-shell executable and a renderer termination caused by the missing `media.mojom.OnDeviceSpeechRecognition` binder, bad IPC123. The full Chromium channel selection retains explicit executable overrides and does not disable the application's speech probe or change its audio policy. Its browser repair still requires completed affected replay; a readiness fixture alone does not prove the workbook journey. Low-memory correlation is not promoted to a demonstrated crash cause. The old broad-run interruption remains unexplained.

## Confirmed issue requiring repair

`runner-repair/run-bounded.py` derives a directory from an unchecked caller label, uses `exist_ok=True`, and opens its completion/stdout/stderr destinations for replacement. Reusing a label can erase a preserved failed run and make stale results appear to belong to a later attempt. A traversal/absolute label can also redirect this local evidence writer outside its intended folder. Root and test_repairs were notified. Require a simple run label, an anchored/confined output root and refusal of an already existing run directory before any record/log/process write. Verify rejection preserves existing sentinel evidence without launching a browser.

**WAITING:** that narrowly confirmed runner issue, completed full-Chromium affected replay, and actual rendered proof for the changed teacher controls. No test/browser/build job was started by the reviewer. This is not final assembled-product or formal GitHub approval; source decisions, broader required checks, real devices and eligible exact-final-head formal review remain separate.

## Follow-up acceptance at 6204907

Exact reviewed follow-up commit: `6204907271c25be7f2a0c86e7e8a8493ee84d3e9`. **DONE but not live:** the confirmed runner preservation issue is repaired. No material defect was found in this bounded follow-up.

The wrapper now derives the checkout from its own script location, checks `.git` and matching cwd, accepts only a simple 1–64-character run label, verifies canonical output containment, refuses an existing run directory, and creates log files exclusively. Its three completed no-browser boundary tests reject path labels before mutation, reject the wrong cwd, and prove replay leaves the existing failure sentinel unchanged. These results were inspected and reused; no runner or browser was launched by this reviewer. Hostile concurrent filesystem replacement and compromised executables are not covered by this local-operator assessment.

The original p2 journey has a finished results file and terminal receipt: one pass, zero failures/skips, exit0, at application/runner commit `267965c9`. Browser launch stderr identifies full `chromium-1243/chrome-win64/chrome.exe`, whereas the preserved failing diagnostic identifies the separate headless shell and its missing binder. The original interaction expectations and application on-device probe remain unchanged. This is completed evidence for that selected journey; it does not turn the interrupted 353-test run into a pass.

The teacher selected job likewise has finished results and exit1: four pass, one fail. The passing cases cover thumbnail/global keyboard navigation, mute, navigation teardown and the all-teacher-plates/projector browser geometry/image/native-board check. The reviewer viewed the committed teacher-tabs/global-keyboard screenshot: the real lesson7 page, complete sheet and navigation controls are visible. This screenshot is supporting route evidence, not a physical projector test or new artwork approval. Animated physical-turn evidence and other device coverage remain separate.

The failing ownership test had asked the recorded-only default to speak an arbitrary unrecorded sentence. The repaired test first verifies that this default produces no TTS and does not seize picture playback, then explicitly configures a mocked recorded provider and retains the original picture-pause assertion, adding recorded-play and zero-TTS assertions. This preserves the ownership requirement and makes the precondition meaningful. Its fixture uses TestAudio rather than approving a recording, playing authentic audio or altering production audio policy. At this review, replay of the repaired ownership case and laptop/tablet/CRM cases was still underway; none is claimed passed here.

The final-candidate test delta only adds bounded failure diagnostics; existing assertions remain. The report explicitly discloses fixed screenshot destinations overwritten before byte backups were introduced. Lost intermediate image bytes are not represented as preserved; original failure contexts/logs/results remain. Future evidence preservation must cover those fixed screenshot destinations as well as immutable wrapper run directories.

**WAITING:** completed later selected results, outstanding real defects and required integrated/full/device/formal-review evidence. No merge/deployment or final product approval is implied by this acceptance.

## Demo CRM return repair at 610727d

Exact reviewed follow-up: `610727d749f018c49826e2b5f31f7df84953b453`. **DONE but not live:** the two-file application repair is independently accepted at source level; rendered replay remains required. No material source defect was found.

The failure evidence shows the fixed lesson-selector header intercepting the actual `Volver al CRM` link after the demo activity/persistence work. The repair adds a stable class to the existing demo banner and changes only the lesson header immediately following that banner into a normal-flow row. Exact route source places those two elements as adjacent direct children. With no demo banner, the original fixed-header selector remains unchanged. The existing flex main container still measures the remaining height; artwork, source text, canvas structure and ordinary lesson behavior are untouched. No forced click, removed assertion or extended timeout conceals the overlap.

The preceding selected run at `6204907` is completed **two pass / two fail, exit1**, not an overall pass. The recorded-provider arbitration fixture and all-teacher-plates laptop check pass. The CRM failure is the genuine interception addressed here. The tablet failure diagnostics identify `/cartilla/presentar/22`, four failed Vite source-module requests with `net::ERR_INSUFFICIENT_RESOURCES`, no recorded application pageerror and an empty stage. This supports a failed loader observation, not an inferred missing artwork defect or passing tablet journey. A fresh tablet-only job and the repaired CRM replay were not complete at this review and are not credited as passing.

The completed output-preservation manifest reports 43 byte-copied and hash-verified affected files before that selected run; it includes the previously dirty CRM output. The report also removes accidentally tracked generated bytecode from version control while retaining local history and ignores future bytecode. Neither is a source-art or product change.

Root separately reports a default-fork unit attempt that failed during worker startup after 60 seconds with zero tests. It is not an assertion result or passing unit evidence and does not establish a defect in this CSS repair. No repeat unit/browser/build job was launched by this reviewer.

**WAITING:** actual repaired CRM browser proof, completed tablet observation and required integrated qualification. This remains bounded technical review, not formal final-head approval or release acceptance.
