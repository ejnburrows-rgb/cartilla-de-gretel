# Gretel Tutor demo checks

Open `/cartilla/lecciones` on the approved preview. Use **Gestionar Alumnos y Maestros** to select a demo student. **Aprender con Gretel** opens the 24-lesson Tutor picker. The same choice in a lesson's demo panel opens that lesson directly. The Tutor uses the active synthetic student in the current tab. It saves completed vocabulary items on this device and begins at the first item without a saved result when that student returns.

## Workbook and Flip Chart

Run `node scripts/verify-tutor-pages.mjs --sources-only tutor-pages.json` for the expected page list with source, lesson, text, speech references and teaching action. The source check reconciles 90 printed Workbook IDs and 62 Flip Chart IDs. Workbook 86–87 are absent. The remaining 150 pages have source files.

Run `node scripts/verify-tutor-pages.mjs https://PREVIEW tutor-pages.json` from a checkout with the project's Playwright Chromium installed. The browser check walks the actual complete Workbook and teacher presentation at 1366 × 768 and 390 × 844 with reduced motion so all page IDs and navigation can be enumerated. It checks the Workbook bookmark and writes each result to the same row as the expectation. Review both viewports in normal motion separately. The script does not substitute a visible page ID for a visual or listening check.

### November 27 preview record

Runtime: `ca9755d891c0fda87b5d12c2b20c233c2bdc16c4`. [Demo Mode preview](https://cartilla-de-gretel-ngxo623ud-ejn.vercel.app/cartilla/lecciones).

- [Every-page results](coverage/DEMO-PAGES.tsv) record 150/150 available page IDs observed in Chrome on desktop and 150/150 at a simulated 390 × 844. The sweep used reduced motion. Desktop advanced through the Workbook and teacher presentation, and the phone sweep navigated backward. The Workbook jumped from 85 to 88. Reload resumed at 90 and Back reached 89. These results establish page IDs and navigation. Content, audio and teaching gestures still require per-page acceptance.
- In Demo Mode, selected a demo student and opened Lesson 3 through the picker. Typed the wrong vowel `o`, saw Gretel's correction and hint, then answered `a` and advanced. Walked all eight vocabulary prompts. The `abeja` answer started the existing chalkboard video, and the lesson advanced to `árbol` in the speaking state. Leaving and reopening this student resumed at `aguja`.
- At simulated phone size, opened Lesson 4 from the real picker and saw the `e` prompt and 365 × 205 classroom frame. The Lesson 3 board video was hidden in Lesson 4. Audible and lip-sync acceptance, full board actions for other targets, and the remaining interruption, permissions and offline checks are open.
- The recovery delivery contains 40 Workbook instruction cuts and five Lesson 3 cuts. Its `muy-bien.mp3` matches the file from the audio recovery branch by checksum. The supplied notes mark it a candidate pending auditory approval. No isolated vowel take was identified among these cuts. Reconcile the longer voice master and any remaining device delivery before requesting new recordings.

## Playback walkthrough

- Start at Demo Mode. Open Lesson 3 and check the required target, then submit a wrong answer and a correct answer. Use the transcript's typed input for a reproducible fallback and test microphone permissions independently.
- Reach **abeja** through the normal prompts. Confirm the silent board clip starts only after a correct response, then the real recording controls the mouth and returns it to rest. Repeat, interrupt, and run once with reduced motion. The existing fully painted board film is specific to this Lesson 3 item.
- Check a different target in Lesson 4. **erizo** is an exact match to an owner-approved recording with Rhubarb cues. The isolated vowels stay captioned until exact, approved vowel recordings are matched.
- Exercise call, split, movable and resizable picture-in-picture, and guided practice. Reopen the same lesson for the same demo student and then switch to a different demo student. Prepare the offline pack online and repeat on the offline device. Record microphone and camera denial outcomes separately.

## Recordings

Use the [existing intake instructions](intake/README.md) for continuous owner takes. Match each cut to the exact approved text before changing the dialogue status. Keep source takes private. Use `node scripts/build-tutor-visemes.mjs --all` for approved dialogue and `node scripts/build-tutor-picture-models.mjs` for additional picture models already approved in the picture bank and matched by the curriculum. The latter preserves cue timings when the recording's checksum matches and regenerates them if the recording changes.

Run the Tutor line, viseme, and book-fidelity validators after changing recordings. Review the affected lessons through the Demo Mode path and check the actual recording with the underlying media clock, muted behavior, replay, interruption, and offline preparation. Log the revision, viewport, result, and remaining gaps in issue #877.
