# Gretel Tutor demo checks

Open `/cartilla/lecciones` on the approved preview. Use **Gestionar Alumnos y Maestros** to select a demo student. **Aprender con Gretel** opens the 24-lesson Tutor picker. The same choice in a lesson's demo panel opens that lesson directly. The Tutor uses the active synthetic student in the current tab. It saves completed vocabulary items on this device and begins at the first item without a saved result when that student returns.

## Workbook and Flip Chart

Run `node scripts/verify-tutor-pages.mjs --sources-only tutor-pages.json` for the expected page list with source, lesson, text, speech references and teaching action. The source check reconciles 90 printed Workbook IDs and 62 Flip Chart IDs. Workbook 86–87 are absent. The remaining 150 pages have source files.

Run `node scripts/verify-tutor-pages.mjs https://PREVIEW tutor-pages.json` from a checkout with the project's Playwright Chromium installed. The browser check walks the actual complete Workbook and teacher presentation at 1366 × 768 and 390 × 844 with reduced motion so all page IDs and navigation can be enumerated. It checks the Workbook bookmark and writes each result to the same row as the expectation. Review both viewports in normal motion separately. The script does not substitute a visible page ID for a visual or listening check.

## Playback walkthrough

- Start at Demo Mode. Open Lesson 3 and check the required target, then submit a wrong answer and a correct answer. Use the transcript's typed input for a reproducible fallback and test microphone permissions independently.
- Reach **abeja** through the normal prompts. Confirm the silent board clip starts only after a correct response, then the real recording controls the mouth and returns it to rest. Repeat, interrupt, and run once with reduced motion. The existing fully painted board film is specific to this Lesson 3 item.
- Check a different target in Lesson 4. **erizo** is an exact match to an owner-approved recording with Rhubarb cues. The isolated vowels stay captioned until exact, approved vowel recordings are matched.
- Exercise call, split, movable and resizable picture-in-picture, and guided practice. Reopen the same lesson for the same demo student and then switch to a different demo student. Prepare the offline pack online and repeat on the offline device. Record microphone and camera denial outcomes separately.

## Recordings

Use the [existing intake instructions](intake/README.md) for continuous owner takes. Match each cut to the exact approved text before changing the dialogue status. Keep source takes private. Use `node scripts/build-tutor-visemes.mjs --all` for approved dialogue and `node scripts/build-tutor-picture-models.mjs` for additional picture models already approved in the picture bank and matched by the curriculum. The latter preserves cue timings when the recording's checksum matches and regenerates them if the recording changes.

Run the Tutor line, viseme, and book-fidelity validators after changing recordings. Review the affected lessons through the Demo Mode path and check the actual recording with the underlying media clock, muted behavior, replay, interruption, and offline preparation. Log the revision, viewport, result, and remaining gaps in issue #877.
