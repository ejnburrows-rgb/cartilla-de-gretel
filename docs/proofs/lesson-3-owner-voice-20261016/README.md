# Proof — Lesson 3 owner-voice only (2026-10-16)

Owner order: Lesson 3 speaks ONLY with the owner's original recordings. No generated voice.

## What this change does

- **Reverts the generated voice from PR #866**: deletes `public/audio/lesson-3-tts/`
  (manifest.json + 5 mp3s) and every `lesson-3-tts` reference in code, tests, and docs.
  Search result on this branch: zero references (see the PR description).
- **Adds the authenticity manifest** `audio/OWNER-RECORDINGS.md`: the allow-list for
  Lesson 3 audio. Forensic inventory (2026-10-16) verified ZERO owner recordings for
  any of the 5 Lesson 3 lines — all 5 are documented MISSING there.
- **Adds the build test** `src/lib/__tests__/lesson-3-owner-voice.test.ts`: fails the
  build if any Lesson 3 audio file is not listed in the manifest, or if the
  generated `lesson-3-tts` voice reappears. (The test allows the honest silent state:
  an absent/empty owner-audio directory and zero wired `/audio/` paths pass; anything
  present must be manifest-listed.)
- **Makes Lesson 3 honestly silent**: `playLesson3Audio` is a no-op,
  `Lesson3InstructionAudio` renders nothing, `lesson3PictureAudioProps` unchanged.

## Status: NOT finished

All 5 lines (p7-instr, p8-instr, p9-instr1, p9-instr2, muy-bien) are SILENT — no owner
recording exists for any of them. Nothing was synthesized to fill the gaps.
The owner's recordings are needed before Lesson 3 can speak.

## Files in this directory

- `screenshots/p7.png`, `p8.png`, `p9.png` — Lesson 3 pages 7/8/9 at 390px mobile
  width, rendered from this branch: instruction regions show with NO listen button.
- `playback-log.md` — per-line playback log: all 5 lines SILENT, no file played.
