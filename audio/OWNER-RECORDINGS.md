# OWNER-RECORDINGS.md — the owner's own voice, and only his voice

Owner order 2026-10-16: Lesson 3 speaks ONLY with the owner's original recordings.
No Microsoft voice, no eSpeak, no browser voice, no generated voice, no voice-model
demos, no TTS of any kind. The 67-clip ZIP was rejected by the owner — never use it.

This file is the authoritative manifest. The automated test
`src/lib/__tests__/lesson-3-owner-voice.test.ts` FAILS the build if any Lesson 3
audio file on disk, or any `/audio/` path wired in
`src/components/cartilla/Lesson3Audio.tsx`, is not listed in the file-path
column below.

A clip is listed here ONLY if: (a) the audio was actually processed and the words
heard were transcribed, (b) it was checked for background music, other voices, or
synthetic artifacts, (c) its provenance is the owner's own upload / a
forensically-verified recovered original / the approved `public/audio/voz/vocabulario/`
files. File names prove nothing. When in doubt, the clip is EXCLUDED.

## Verified owner recordings — NONE (2026-10-16)

Forensic inventory on 2026-10-16 found NO verified owner recording for any of the
5 Lesson 3 lines. All 5 lines are SILENT until the owner provides his recordings.
(Method: local whisper transcription + spectral music/voice/synthetic checks;
full report in the swarm working copy `~/workspace/voice-swarm/w1/forensics.md`.)

| file path | source | words heard |
|---|---|---|

## The 5 Lesson 3 lines — all MISSING (silent)

- **p7-instr** — expected: "Marca con una x los dibujos de las palabras que comienzan con A mayúscula, a minúscula." → MISSING, silent.
- **p8-instr** — expected: "Traza una línea desde la vocal A mayúscula, a minúscula hasta el dibujo de la palabra que comienza con A mayúscula, a minúscula." → MISSING, silent.
- **p9-instr1** — expected: "Escribe con tu mejor letra." → MISSING, silent.
- **p9-instr2** — expected: "Haz un dibujo que represente una palabra que comienza con a." → MISSING, silent.
- **muy-bien** — expected: "Muy bien." → MISSING, silent.

## Sources examined and EXCLUDED (2026-10-16)

- `/home/hatch/workspace/user/files/558473_0_k4ck.mp4` (owner upload, 47 MB, 276 s) — EXCLUDED.
  Transcribed in full locally. 0–207 s = the 67 phrases of the owner-rejected 67-clip ZIP;
  207–277 s = an English demo narration ("Best clips for testing Gretel's voice… Warmth and
  personality… Diction and precise syllable pronunciation… Thank you for watching"),
  spoken by the same voice (identical F0 profile). The file presents itself as a
  voice-model demonstration, not the owner's field recording. None of the 5 lines occurs
  in it ("muy bien" appears only embedded in longer sentences, never standalone).
- PR #769 branch `feat/gretel-resumable-cloned-voice-20261014`, 67 clips
  (`rec_01..rec_19`, `rec_gretel_01..rec_gretel_48`) — EXCLUDED. The branch catalog marks
  every asset `rejected_wrong_source`; the owner rejected them for stuttering, background
  music, and wrong source. None of the 67 phrases matches any of the 5 lines. The branch's
  TTS/clone generation scripts were not run and their outputs were not used.
- `~/workspace/your_files/gretel-37-recordings/audio/voz/vocabulario/` (37 files) — EXCLUDED.
  Their own MANIFEST.md declares Voice: Candidate B (TTS model avocado_v2). Synthetic by declaration.
- `~/workspace/your_files/tts-voice-samples/`, `tts-compare/`, `tts-compare-v2/` — EXCLUDED.
  Labeled TTS samples (piper, kokoro, clone variants).
- `~/workspace/imagine_media/chorus/` + `fixed-local/bienvenidos-a-la-cartilla-de-gretel.mp3` — EXCLUDED.
  AI-generated song/chorus media, not instruction recordings.
- `~/workspace/your_files/voice-*.mp3` — EXCLUDED. Spoken status updates (TTS), not the owner.
- `Gretel_558674_Original.m4a` / `Gretel_558607_Original.m4a` — NOT FOUND on this VM
  (full filesystem search; no .m4a anywhere). These are the masters the owner named;
  nothing can be forensically anchored until one is recovered from another source.

## Approved but not applicable to these 5 lines

- `public/audio/voz/vocabulario/` (162 files on main) — approved owner voice, but they are
  single-word picture-vocabulary clips (filenames checked: no instruction-line names;
  spot-check confirmed word-level audio). None contains the 5 instruction sentences.
  Not transcribed here; not listed as rows.

## Updates

- 2026-10-16: manifest created. Forensic result: no verified owner recordings for any
  Lesson 3 line. All 5 lines silent pending the owner's recordings.
