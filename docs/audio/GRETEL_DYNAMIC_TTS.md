# Gretel — Dynamic voice integration (draft, not released)

## Exact status

- The owner provided **32:28 of audio**. The original M4A and an archive of
  **151 segmented, UNALIGNED WAV clips** are stored in the owner's **private**
  file Library. Neither belongs in this PUBLIC GitHub repository.
- This PR adds a **dynamic** TTS request/response path for arbitrary new Spanish
  text, not a prerecorded word dictionary.
- The custom voice MODEL HAS NOT BEEN TRAINED, and no generated audio has
  been accepted as Gretel's voice. The Python endpoint uses the existing
  Chatterbox Multilingual inference loader with a PRIVATE reference WAV; this
  is an inference candidate, **not supervised adaptation of all 32 minutes**.
- Without a configured running endpoint, production retains the existing
  browser speech baseline. Do not call that the owner's custom Gretel voice.

## Connected app paths

- `src/lib/gretel-voice.ts`: single speech owner, mute, cancel, speaking events.
- `src/lib/gretel-dynamic-tts.ts`: POST arbitrary text; receive audio/wav;
  abort fetch and playback on cancellation. Never use a generic fallback when
  a configured custom engine fails.
- `src/lib/speak.ts`: workbook words, lesson read-aloud, and vowels use the
  custom engine when configured, preserving existing behavior otherwise.
- `src/lib/picture-audio.ts`: validated picture words use the custom engine
  when `AUDIO_POLICY.allowTts` permits it; otherwise original audio policy.
- Reward messages also route through the Gretel speech owner.
- `src/routes/cartilla/voces.tsx`: test a never-recorded sentence when custom
  engine is configured; preserve the custom voice after leaving this route.

## Private local development only

On an explicitly authorized computer with the open-source Chatterbox model
weights and its Python dependencies already installed:

```shell
python scripts/audio/gretel_live_tts.py \
  --reference /PRIVATE/PATH/gretel_reference.wav \
  --device cpu \
  --host 127.0.0.1 --port 8765 --allowed-origin http://localhost:5173
```

For Vite development, configure (locally only):

```text
VITE_GRETEL_TTS_ENDPOINT=http://127.0.0.1:8765/api/gretel/tts
```

Do NOT expose this developer service as a public API: origin checks are
not authentication. Production needs an authorized private model host,
HTTPS, abuse control, and proper CORS/authorization boundary.

## Verification already possible versus outstanding

Tests for the transport only can run without model weights:
```shell
python -m unittest discover -s scripts/audio -p 'test_gretel_live_tts.py'
pnpm exec vitest run src/lib/__tests__/gretel-dynamic-tts.test.ts
```

**Outstanding for acceptance:** align and verify the 151 transcripts; validate
speaker and recording rights; choose/license suitable fine-tuning model;
adapt using authorized no-fee compute; synthesize NEVER-RECORDED Spanish words
and sentences (`ñ`, `rr`, `gü`, accents); owner-listen for timbre, clarity,
pacing, and fidelity; run app/browser tests against a REAL running model;
confirm safe production hosting and zero-cost operation.

Never treat synthetic waveform/unit tests as real Gretel speech evidence.
Do not publish private recordings, merge as complete, or deploy until the
above voice and runtime verification is real and owner-approved.
