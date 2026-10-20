# Owner voice recordings — slot manifest

The owner records every voice line himself. **No TTS, no synthesized voice, no
AI voice may ever read these slots.** If a file is missing, the line stays
silent — never fall back to speech synthesis.

## Lesson 3 instruction lines (delivered 2026-10-17, verified MP3s)

Source: `owner-voice-lesson3-5-lines.mp3` (28.3 s, 128 kbps stereo) — the 5
Lesson 3 instruction lines in order. Split 2026-10-17 on this branch by
silence-gap analysis (inter-line gaps 0.55–0.67 s, 0.1 s padding, 0.08 s
gentle fades to prevent clicks). **Word-level boundaries not verified by ear.**

| Slot | File | Wired on | Source segment |
|---|---|---|---|
| `p7-instr` | `public/audio/leccion3/p7-instr.mp3` (6.7 s) | Lesson 3 wide page 7 (`Lesson3WidePage7`) | 1.33 → 8.07 s |
| `p8-instr` | `public/audio/leccion3/p8-instr.mp3` (9.8 s) | Lesson 3 wide page 8 (`Lesson3WidePage8`) | 8.53 → 18.33 s |
| `p9-instr1` | `public/audio/leccion3/p9-instr1.mp3` (2.1 s) | Slot ready — page-9 draft consumes it | 18.70 → 20.84 s |
| `p9-instr2` | `public/audio/leccion3/p9-instr2.mp3` (4.5 s) | Slot ready — page-9 draft consumes it | 21.31 → 25.81 s |
| `muy-bien` | `public/audio/leccion3/muy-bien.mp3` (1.2 s) | Slot ready — draft success path consumes it | 26.26 → 27.50 s |

Playback path: `Lesson3WideAudio` (`src/components/cartilla/lesson3-wide/`)
plays the file directly with `HTMLAudioElement`. Slot constants live in
`lesson3-wide-data.ts` as `LESSON3_AUDIO`.

## Intro line (stored only — NOT wired)

`public/audio/leccion3/intro-line.mp3` (10.6 s, "Hola, vamos a leer juntos...").
Owner order 2026-10-17: store it, do not wire it anywhere until he says where
it goes. Constant: `LESSON3_INTRO_LINE_UNWIRED` (deliberately unused).

## Master 40-line recording (stored only — NOT split, NOT wired)

`owner-voice-master-40-lines.mp3` (4.6 MB, 286.7 s) — job #910 master, all 40
instruction lines in order. Awaiting the owner's go-ahead before splitting or
wiring per line number.
