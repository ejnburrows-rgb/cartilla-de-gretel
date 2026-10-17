# Gretel — one owner-supplied Spanish TTS voice (draft)

## Decision

The owner has already supplied the full **32:28** reference recording and explicitly
rejected external voice-creation applications and the previously attempted model.
Do not ask for a new recording or replace Gretel with browser-native voices, Azure
presets, a prerecorded dictionary, or stitched sound fragments.

Use the existing central `speakAsGretel` lesson pipeline and the direct open-weight
model adapter `scripts/audio/gretel_voice_engine.py`. The baseline supports Spanish
and creates a **single reusable private speaker profile** from Gretel's recording.
This is reference-conditioned text synthesis. It is **not** supervised fine-tuning
on all 32 minutes, and it has **not yet generated an accepted Gretel audio file**.

## One inference path — no hosting needed for audio proof

Keep the owner reference WAV and model weights outside the public GitHub repo.

Install the free open-source Python `qwen-tts` package and its weights on a
computer that can access the model repository. With a genuine Gretel WAV already
prepared (24 kHz mono), generate a new sentence directly:

```sh
python scripts/audio/gretel_live_tts.py \
  --reference /PRIVATE/GRETEL_REFERENCE.wav \
  --device cpu \
  --proof-only \
  --proof-output /PRIVATE/GRETEL_NEW_SENTENCE.wav \
  --proof-text "Mañana el pingüino soñará con una montaña pequeña."
```

`--model-path /PRIVATE/MODEL` permits downloaded model weights without new
network access. CPU synthesis may be slow. This command runs a model inference
and exits; **it does not start a web server** or publish a user's recording.

The script must fail if model weights/dependencies are missing; there is no
synthetic audio, prerecorded clip, or generic browser voice fallback. A real
generated WAV must be playable and reviewed for speaker identity, accent,
rhythm, ñ/rr/gü, and word completeness before it counts as proof.

## Workbook connection already built (in draft PR #769)

- `src/main.tsx` conditionally initializes the custom speech provider.
- `src/lib/gretel-voice.ts` owns mute, cancellation and speaking state.
- `src/lib/gretel-dynamic-tts.ts` connects new words, instruction text and
  reactions to a real synthesis endpoint, without substituting browser voices
  on a custom-engine failure.
- `src/lib/speak.ts`, picture audio, lesson listen buttons, Piano, rewards,
  and `/cartilla/voces` have custom voice call sites.
- `scripts/audio/gretel_live_tts.py` can optionally serve the SAME model
  via the existing local endpoint after voice proof is accepted.

A future dynamic lesson session needs access to the model where it runs, but
**producing and listening to the proof WAV does not require hosting**.

## Audio/data safeguards

- The 32-minute master and 151 unaligned segment files remain PRIVATE.
- `gretel_voice_profile.py` selects a high-quality conditioning sample from
  the complete set; **selection does not equal full-corpus fine-tuning**.
- Training against all 32 minutes additionally requires per-segment verified
  Spanish transcripts and actual model adaptation.
- No voice reference, child data, model checkpoints or unapproved samples
  may be published in this PUBLIC repository.
- Simulated-waveform/unit tests only establish program correctness. They are
  not human-voice evidence; do not merge as a finished voice feature.
