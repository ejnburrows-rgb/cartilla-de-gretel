# Batch 3 — shared picture-name playback

Implemented after the user accepted proceeding from Batch 2. Continued PR #436 on its existing branch; no merge or deployment performed.

## Shipped behavior

One shared picture service resolves verified content names. Static pictures support direct tap and Enter/Space; pictures within existing answer buttons use the same answer gesture. Drag movement suppresses only the vocabulary click. Playback does not emit answer, grading, completion, help or progress events. TapToHear no longer completes an activity by listening. Reading pages remain ungated.

A single speech owner coordinates pictures, Gretel and reading speech. New playback cancels previous playback and pending browser speech; delayed Gretel starts check ownership after awaiting voice readiness. Both existing mute controls are respected. Page-turn start, router navigation, pagehide, visibility hide and teardown cancel picture playback and clean listeners/media handlers.

## Audio limitation

There are **zero approved vocabulary recordings** and **199 deduplicated missing final recordings** in [the inventory](../../audio/MISSING_PICTURE_RECORDINGS.csv). Current policy prohibits TTS (`allowTts: false`). No voice service, synthesized assets, fake vocabulary recordings or artwork changes were introduced. Product picture taps currently show an unavailable-audio message. Actual spoken-name quality cannot be verified until approved recordings exist.

## Verification

Type checking and direct Vite production build passed. 115 Vitest files passed: **1,489 tests passed plus two existing expected failures**. Ten new focused tests cover name verification, recorded playback, cancellation, future policy-permitted TTS without queues, Gretel coordination, mute, navigation, static keyboard interaction, drag preservation and zero learning/progress writes.

Five Chromium scenarios passed using the committed Playwright specifications with a local Vite server:

1. Actual shipped policy: reading picture taps and keyboard activation create no speech, recording playback, learning events or progress writes; the unavailable message appears.
2. Explicit approved-recording test fixture: rapid taps stop previous media; picture/Gretel speech cancels each other; mute and navigation stop playback. The fixture intercepts metadata and mocks Audio. **It is not an approved recording or real pronunciation proof.**
3. Actual policy: one direct answer tap still grades correctly; muted picture support does not affect grading, wrong counts or help counts. Five correct answers preserve page completion.
4. P2 direct tap + keyboard, wrong attempt retained, completion and reload.
5. P5 example + five answers, assisted partial reload, follow-up, leave/return and completed reload.

TTS was enabled only in a unit-test policy fixture to verify the conditional path; it remains OFF in shipped content. No live student data was used.

## Screenshots

- [Reading remains ungated; missing audio is explicit](recording-pending-reading-ungated.png)
- [Direct taps still grade while muted](direct-tap-still-grades.png)

Screenshots were visually inspected. Existing image assets, backgrounds, handwriting and page mappings are untouched. Batch 2 feedback/progress regression tests remain passing.
