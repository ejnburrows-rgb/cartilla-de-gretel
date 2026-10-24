# Owner instruction recordings, 2026-10-19

Draft only. No main merge or production release.

Source: owner WhatsApp resends on October 19 at 14:53 ET. Master `audio-b10640b9.mp3` is 286.677 seconds and has 40 numbered instructions. Lesson 3 source `audio-cfcac090.mp3` is 28.331 seconds and has five phrases. The M/ma sample, intro sample, rejected tinywow recording, and PR 769 audio are not used.

40 continuous master phrases were cut with 120 ms leading and 160 ms trailing padding and 15/25 ms edge fades. Spoken numbers were removed. No words synthesized, no speech fragments rearranged, no denoising or music subtraction. Each cut was separately transcribed after export. The full text, source boundaries, duration, SHA256 and explicit printed-page mappings are in `src/content/instruction-recordings.json`. CSV listing: `INSTRUCTION-LINES.csv`.

All 109 instruction regions currently present in canonical page-layouts are mapped to recordings. Case and punctuation are normalized; the five printed doubled vowel forms (Aa, Oo, etc.) have explicit equivalent spoken-letter mappings. Unmatched wording has no player and stays silent. Shared sentences reuse one recording. The two printed sentences "Escribe oraciones. Usa las sílabas que aprendiste." play lines 17 and 18 sequentially, not stitched together. Lesson 3's five separately supplied phrases are also preserved under `public/audio/leccion3`; its p7/p8 mappings prefer those explicit uppercase/lowercase phrases. The success cue is preserved but not automatically bound to a grading event.

The existing instruction speaker now uses recorded audio, never device TTS. Tap again stops. Playback shares speech ownership, respects both mute settings and volume, stops on visibility loss, pagehide or unmount, and blocks further sequence clips after cancellation.

## Verification limits

All 40 cuts and five Lesson 3 cuts were checked by separate transcription. No incomplete phrase or retained spoken numbering was detected. Mean loudness ranges from -20.9 to -18.2 dBFS in the master cuts. Per-clip mean and peak levels: `INSTRUCTION-CUT-MEASUREMENTS.json`. These measurements do not distinguish music from speech and do not prove music-free playback. Human auditory quality approval remains pending. No claim of final voice approval, full lesson narration, whole-app audio coverage, deployed playback or live-site installation is made.

Focused tests cover mapped inventory, unknown-text silence, sequencing, real audio playback and cancellation. TypeScript check passes. Browser playback and visual verification remain separate release checks.
