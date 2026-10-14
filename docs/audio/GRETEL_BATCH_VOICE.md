# Gretel premium voice — self-hosted recordings, no per-play charges

**Implementation evidence, not finished audio:** The owner supplied a cloned Gretel MP3 on October 14, 2026. The approved source audio remains private and is not committed in this public repo. This PR stages an offline, resumable generator and workbook playback integration. It does not claim real Chatterbox synthesis, owner audio approval, or deployment.

Model: [Resemble AI's MIT-licensed Chatterbox multilingual TTS](https://github.com/resemble-ai/chatterbox). Official Python cloning API uses ChatterboxMultilingualTTS.from_pretrained() and generate(text, language_id="es", audio_prompt_path=...). No hosted Resemble membership or paid audio-generation API is used. Model weights and compute are separate dependencies; they require explicit authorization if a provider would charge or consume paid credits. The local script does not automatically contact a paid provider.

The reference WAV was prepared from the uploaded KikiVoice-cloned Gretel recording and delivered separately to the owner (10.4 seconds, mono, 24 kHz). Check the originating service's commercial distribution and voice-cloning terms before distributing generated recordings. Do not commit the reference into the public repository.

**Run only on an authorized machine with installed Python, ffmpeg, NumPy, PyTorch and chatterbox-tts.** Do not run cloud jobs, hosted CI/GitHub Actions, Antigravity or credit-based services without task-specific permission. The model's first run may need Internet to obtain open-source model weights.

1. Prepare the existing owner-approved GUION_GRABACION.csv (1,639 text entries) and the private Gretel reference WAV.
2. Validate without compute: python scripts/audio/generate_gretel.py --script /path/to/GUION_GRABACION.csv --dry-run
3. When an authorized GPU is available, generate **three** real samples before the full run: python scripts/audio/generate_gretel.py --script /path/to/GUION_GRABACION.csv --reference /private/Gretel_Approved_Voice_Reference_10s.wav --device cuda --limit 3
4. Check those actual MP3s for Gretel identity, vowels, letter sounds, prosody and Spanish accent. Only after owner approval, rerun without --limit to resume generation.

Each script entry is split only between words into <=240-character segments and named with its clip ID and a hash of the text. Completed clips are checkpointed in src/data/gretel-recorded-manifest.json after each entry. Output MP3s go in public/audio/gretel/clips/. If the job stops, rerunning skips already complete recordings. Text changes invalidate the affected clip's hash. Pages 86 and 87 lack authoritative book scans and are intentionally skipped.

**Playback:** GretelRecordedPageButton appears by a workbook page number only when a matching prerecorded file is registered. It plays existing MP3 files sequentially with the existing one-owner speech cancellation state, respects mute, and shows no empty fake buttons. Proposed guide text is not treated as verbatim book material. Inference never occurs in a child's browser and there are no per-play AI requests.

**Tests:** pytest -q scripts/audio/test_generate_gretel.py checks batch/encoding/resume with a synthetic test waveform — NOT a cloned voice. Vitest tests source category filtering, safe local URLs and pages 86-87. Actual voice fidelity, browser playback and complete recorded-asset coverage remain unverified. See issue #589 for owner voice approval.
