# LEGACY candidate only — prerecorded audio is not Gretel custom dynamic TTS (PR #769)

**Superseded for the owner’s final voice requirement (October 14, 2026).** This document concerns earlier draft recorded-MP3 generation and 17-second reference prompts. It is NOT the implementation or acceptance path for the full 32:28 recording, owner-requested dynamic text-to-speech, or a trained reusable Gretel voice. Do not use a dry run, stitched/recorded word library, or three zero-shot sample clips as proof that the 32-minute custom voice has been trained. See `GRETEL_DYNAMIC_TTS.md` and the current PR description. Preserve existing work without deploying as Gretel’s approved speech synthesis.

**Status: candidate pipeline implemented; premium voice NOT established.** Do not mark the Cartilla voice finished, merge this draft as finished, release new voices, or confuse a synthetic Python test with real speech.

## Current available source material

- Approved-context owner recordings and a local reference WAV, kept in a private file library; never commit or serve those references publicly.
- `GUION_GRABACION.csv`: 1,639 entries across 24 lessons, with categories marking existing text versus proposed copy. The unverified workbook pages 86–87 are excluded.
- Existing isolated Gretel recordings may be reviewed and reused with proven rights; they are not evidence of newly synthesized sentences.

## How to run without paid APIs

Work ONLY on a machine explicitly authorized to use its own local compute, with Python, NumPy, ffmpeg, PyTorch and the open-source Chatterbox Multilingual model installed. The first install or model-weight download requires Internet; never use Google Antigravity, paid GPU credits, GitHub Actions, or hosted inference.

1. Dry-run with the private source CSV:
   `python scripts/audio/generate_gretel.py --script /private/GUION_GRABACION.csv --dry-run`
2. Once the open-source model and approved reference are present on authorized hardware, run a SMALL batch in **private staging**:
   `python scripts/audio/generate_gretel.py --script /private/GUION_GRABACION.csv --reference /private/Gretel_Reference_17s.wav --device cuda --limit 3`
3. For **offline transcription checks**, install and supply existing local faster-whisper model weights through `--asr-model /private/models/whisper`. Without ASR, candidates remain `needs_transcript_review` rather than being approved. Chatterbox is the voice generator; faster-whisper is only an offline quality check.
4. Review genuine generated audio side by side with Gretel's existing recordings: identity, neutral LatAm Spanish, letter NAMES versus phonemes, consonants and ñ, vowels/syllables, classroom pacing, complete last words, and lack of choppiness. ASR-pass is NOT a listener's approval.
5. Rerun the same command to resume. The job checkpoints after each part, fully decodes MP3s, compares transcripts when local ASR is installed, retries up to `--max-attempts 3`, and regenerates only changed, missing or rejected parts. `--regenerate-ids GR0001 GR0004` explicitly requests rerecording particular entries.

**Data safety:** MP3 candidates go to `artifacts/gretel/candidates/`; QC manifest goes to `artifacts/gretel/quality-manifest.json`. They are not public website assets. Input voice-reference identity (SHA-based fingerprint) participates in output naming, so a reference change cannot silently reuse an old clip. The published manifest `src/data/gretel-recorded-manifest.json` remains empty until a separate approved-publication step, with status `approved`, `audio_verified: true`, and actual files in `public/audio/gretel/clips/`. **No command in this document authorizes publication**; recording rights and specific owner voice approval in #589 must be verified first.

**Playback:** The native Workbook uses previously approved MP3 assets, never in-browser inference. A page Listen button requires an approved verified manifest entry plus an HTTP HEAD check proving each served local MP3 exists and has a valid audio content type. A missing file or route fallback must hide the button; mute, cancellation and page unmount remain enforced.

**Technical checks:** `pytest -q scripts/audio/test_gretel_quality.py scripts/audio/test_generate_gretel.py` for offline logic; `pnpm exec vitest run src/lib/__tests__/gretel-recorded-clips.test.ts` in an installed checkout. Separately test the actual browser for rendered playback. This suite may use synthetic waveforms to validate controls; it does NOT prove quality, voice fidelity, speaker consistency, or that real Chatterbox/Qwen3-TTS sentences have been produced.

**Blocked:** No authorized model weights/GPU/ASR in the assistant's current execution environment; no 3-model real-sentence A/B test; no owner-approved new audio; no browser evidence on the draft PR. Keep these explicitly open until proved.
