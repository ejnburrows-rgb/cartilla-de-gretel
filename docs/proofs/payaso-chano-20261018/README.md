# Payaso Chano — final browser evidence

Game source SHA256: `4c2e92e331d4ea57a396bf9475f264cf20af76f98331b9484418e13e1a958f3b`.

Reuses the existing 13-word implementation and recovered reviewed HTML. All five supplied embedded preview art identities matched; the full original Chano was then recovered from `Juego Payaso Chano.docx`, `word/media/hdphoto4.wdp` (JPEG-XR). Its 600×689 RGB source was losslessly decoded. The previous preview PNG alpha had removed hat/glove contours. The game embeds recovered source pixels unchanged, using an SVG viewport/outline to separate the original clown from scanned paper and the independent spring. No generated or repainted foreground artwork.

## Actual final test results

Chromium 153.0.8010.0 on Linux, all 13 words at every size:

| Viewport | Native browser input | Assertions |
|---|---|---:|
|390×844|CDP touch drag, tap and cancel|202|
|667×375|CDP touch drag, tap and cancel|202|
|844×390|CDP touch drag, tap and cancel|202|
|1366×768|Mouse drag/click and Tab/Enter|200|
|1920×1080|Mouse drag/click and Tab/Enter|200|
|768×1024|CDP touch drag, tap and cancel|202|

**1208 matrix assertions plus 11 focused Space-key/animation/structure assertions passed, zero failures.** `browser-results.json` contains exact source hash, timings, coverage and audio-output measurements. Tests use native CDP touch input and real browser mouse/keyboard input; they do not call state-mutating game hooks or dispatch synthetic DOM pointer events. The game exposes read-only diagnostics.

Each round tests an incorrect full answer, umbrella check, error state, locked advance, spring reset, correct syllable placement, correct check, success/laugh, and advance. All 13 finish. Also checked: continuous Chano/ball motion, live juggling syllables, reduced motion, disabled listening explanation, no nested buttons, viewport containment and instruction separation, no horizontal scroll/internal clipping, music output/mute, touch cancellation, zero JavaScript exceptions and zero external HTTP requests. The source is self-contained HTML; the React app and unrelated files are unchanged. Existing React-to-standalone progress tracking is outside this isolated game repair and is not claimed fixed.

The final test found and fixed a real timing bug: an earlier success timeout could prematurely cancel the next round's laugh. It also caught and fixed CSS specificity overriding reduced motion after the juggling update.

`before-*` are real browser renders of merged-main game source at `99f378ffa65159b7038cf364a6f514f88ba022d0`, not mockups. `after-*`, `correct-*` and `incorrect-*` are real browser renders of the exact hashed final source. Runtime screenshots are unchanged captures.

## Sound and usage provenance

Optional music is the source-authored 12-bar 3/4 miniature at 72 BPM already introduced in #948, played by local Web Audio oscillators. No recording, third-party sample, external voice API, browser speech or imported commercial track is used. Source composition and tone definitions are visible in the game. No third-party music license is required for an imported track because none was imported. Original artwork comes from the owner's supplied Word document; no new artwork ownership claim is made.

`music-output.webm` captures 4.2 seconds from the actual running game's audio graph. `audio-results.json` verifies that music mute produced zero output samples. Snap sound is generated locally on ball placement.

Existing audio manifest/word bank and repository audio-source restrictions were inspected. No exact spoken-content/authorization mapping for these 13 words was verified, so listening remains disabled with a visible explanation, as requested. Existing master recordings are not declared missing or unusable.

## Coverage boundaries

Real-device iPhone Safari: **NOT VERIFIED**. No authorized physical iPhone was available. Chromium mobile emulation is not a real-device claim. Subjective music listening on a physical device is not claimed; actual output samples and captured runtime sound are supplied. No merge or production deployment performed; owner-controlled release gates and rollback #947 remain untouched.

## Reproduce

With Playwright installed and a compatible Chromium executable, run from the repository root:

`CHANO_BROWSER_EXECUTABLE=/path/to/chromium node docs/proofs/payaso-chano-20261018/verify.cjs`

Set `CHANO_BASELINE_FILE` to a local copy of the stated merged-main HTML if baseline screenshots are also wanted. `CHANO_REPO_ROOT` optionally selects the checkout root. The test works from a local file URL and makes no external requests.
