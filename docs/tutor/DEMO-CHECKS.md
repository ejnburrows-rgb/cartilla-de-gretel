# Gretel Tutor demo checks

Open `/cartilla/lecciones` on the approved preview. Use **Gestionar Alumnos y Maestros** to select a demo student. **Aprender con Gretel** opens the 24-lesson Tutor picker. The same choice in a lesson's demo panel opens that lesson directly. The Tutor uses the active synthetic student in the current tab. It saves completed vocabulary items on this device and begins at the first item without a saved result when that student returns.

## Workbook and Flip Chart

Run `node scripts/verify-tutor-pages.mjs --sources-only tutor-pages.json` for the expected page list with source, lesson, text, speech references and teaching action. The source check reconciles 90 printed Workbook IDs and 62 Flip Chart IDs. Workbook 86–87 are absent. The remaining 150 pages have source files.

Run `node scripts/verify-tutor-pages.mjs https://PREVIEW tutor-pages.json` from a checkout with the project's Playwright Chromium installed. The browser check walks the actual complete Workbook and teacher presentation at 1366 × 768 and 390 × 844 with reduced motion so all page IDs and navigation can be enumerated. It compares displayed text regions against the source transcriptions, checks the Workbook bookmark and writes each result to the same row as the expectation. Review both viewports in normal motion separately. Use the results to locate any page that needs visual or listening review.

### Verified preview evidence

[Demo Mode at revision `225055009ef57a8ba8deedde3ba1bdbab3aea1a1`](https://cartilla-de-gretel-ehdibv5ff-ejn.vercel.app/cartilla/lecciones).

- [Every-page results](coverage/DEMO-PAGES.tsv) include 152 expected IDs. At 1366 × 768 and simulated 390 × 844, the automated browser sweep reached all 88 available Workbook pages and all 62 Flip Chart sheets. All corresponding source text regions were found in the rendered content. The comparison normalizes case, punctuation and layout spaces, and retains accents. The Workbook skipped unavailable pages 86–87, resumed at 90 after reload and went back to 89. The Flip Chart went back from 62 to 61. This checks navigation and text presence. Speech, artwork and interactions still require page-specific review.
- Walkthroughs starting in Demo Mode captured the real desktop Lesson 3 exchange for `a` in **abeja** and the simulated phone Lesson 4 exchange for `e` followed by **elefante**. The MP4s were delivered privately. A browser check also went through reduced-motion Lesson 7 **ma** → **me** and interrupted the board turn for **o** in Lesson 2. Lesson 3's eight vocabulary clips each started and ended on their expected prompts in the browser.
- The earlier capture showed isolated vowels as captions. All five takes have since been located in the original voice master. See [source windows and timing](recording/ISOLATED-VOWELS.md). The Tutor uses a verified take of [“¡Muy bien!” from the original voice master](recording/PRAISE.md).

## Playback walkthrough

- Start at Demo Mode. Open Lesson 3 and check the required target, then submit a wrong answer and a correct answer. Use the transcript's typed input for a reproducible fallback and test microphone permissions independently.
- Reach **abeja** through the normal prompts. Confirm board teaching starts only after a correct response, uses the painted classroom with the current app-controlled target, and erases where the felt moves. The underlying recording controls the mouth and returns it to rest. Test another vowel, a consonant syllable and interruption. Run the automated sequence from the project with `node scripts/verify-tutor-exchange.mjs https://PREVIEW`. The test includes typing during correction and keeping the phone classroom visible with the transcript open.
- Check a different target in Lesson 4. **erizo** is an exact match to an owner-approved recording with Rhubarb cues. Run `node scripts/verify-tutor-vowels.mjs https://PREVIEW` to check the five isolated-vowel models in their lessons, replay, the active mouth cue and return to rest.
- Watch the centered portrait while Gretel waits and responds. The expression atlas transfers the study's gaze and smile onto the approved still and uses blink frames from the original listening plate. The posture strip draws from that same listening plate. Both use the 1280 × 720 still as their coordinate system. During speech the expression layer stops above the recorded mouth shapes. The board canvas supplies the full teaching poses. Reduced motion keeps the still portrait and the recorded mouth timing.
- Exercise call, split, movable and resizable picture-in-picture, and guided practice. Reopen the same lesson for the same demo student and then switch to a different demo student. Prepare the offline pack online and repeat on the offline device. Record microphone and camera denial outcomes separately.

## Recordings

Use the [existing intake instructions](intake/README.md) for continuous owner takes. Match each cut to the exact approved text before changing the dialogue status. Keep source takes private. Use `node scripts/build-tutor-visemes.mjs --all` for approved dialogue and `node scripts/build-tutor-picture-models.mjs` for additional picture models already approved in the picture bank and matched by the curriculum. The latter preserves cue timings when the recording's checksum matches and regenerates them if the recording changes.

Run the Tutor line, viseme, and book-fidelity validators after changing recordings. Review the affected lessons through the Demo Mode path and check the actual recording with the underlying media clock, muted behavior, replay, interruption, and offline preparation. Log the revision, viewport, result, and remaining gaps in issue #877.

### Offline playback check

The full pack should contain `/tutor` and the 24 lesson routes, plus the classroom media, approved recordings and Spanish recognition model. Preparing the pack and seeing the ready badge checks download completion. Close the old Tutor tab, disconnect from the server, and reopen a saved lesson beyond Lesson 3. On Lesson 4, answer `e`, watch the board sequence and replay **elefante**. The service worker must supply partial cached video reads so the browser can seek through the board poses offline.

In a production build of the fixes, this passed with the test web server stopped and unreachable. Chrome loaded Lesson 4 from the service worker, completed all six board phases, and played and replayed **elefante**. The preview test in `tests/e2e/tutor-offline-pack.spec.ts` checks all 24 cached lesson URLs, representative offline cold launches and a partial read from the cached classroom video.
