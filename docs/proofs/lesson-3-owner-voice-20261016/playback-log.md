# Worker 6 — Lesson 3 voice playback log

Decisive forensics context (Worker 1): ZERO usable owner recordings exist for any
Lesson 3 line — the only upload on the VM is a voice-model demo, not the owner's
voice. Per the owner's Step 5 rule, all five Lesson 3 lines stay SILENT.
`playLesson3Audio` is now a silent no-op and `Lesson3InstructionAudio` renders null.

| Line key | Expected behavior | File played | Verified by |
|---|---|---|---|
| p7-instr | SILENT | NONE (no owner recording) | Code inspection: `playLesson3Audio` constructs no `Audio`, references no `/audio/` path; unit test asserts zero `Audio` constructions across all five keys; rendered page 7 shows no Escuchar button (0 in DOM) |
| p8-instr | SILENT | NONE (no owner recording) | Code inspection (same as above); rendered page 8 shows no Escuchar button (0 in DOM) |
| p9-instr1 | SILENT | NONE (no owner recording) | Code inspection (same as above); rendered page 9 shows no Escuchar button (0 in DOM) |
| p9-instr2 | SILENT | NONE (no owner recording) | Code inspection (same as above); rendered page 9 shows no Escuchar button (0 in DOM) |
| muy-bien | SILENT | NONE (no owner recording) | Code inspection (same as above); `-leccion-view.tsx` still calls `playLesson3Audio("muy-bien")` after correct answers on pages 7/8/9 — the call is kept (importers unchanged) but executes as a silent no-op |

Notes:
- No `lesson-3-tts` string anywhere in the new `Lesson3Audio.tsx`; no new audio paths; no TTS, no generated/synthesized voice, no Microsoft/eSpeak/browser voice.
- `lesson3PictureAudioProps` is byte-for-byte behavior-identical (approved recorded word playback for vocabulary pictures is untouched).
- Screenshots: `screenshots/p7.png`, `p8.png`, `p9.png` — student-view (digital) sections of `/cartilla/pilot-faithful/7|8|9` at 390px mobile width, each showing the instruction text with no listen button.
- Observation for follow-up (out of Worker 6 scope, file not touched): `FaithfulPageRenderer.tsx` still emits `data-recording-status="synthetic-spanish"` on Lesson 3 instruction paragraphs — stale label now that Lesson 3 is silent.
