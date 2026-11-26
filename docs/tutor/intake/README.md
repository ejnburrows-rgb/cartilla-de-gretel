# Tutor Automated Recording Intake & Lip-Sync Pipeline

Milestone 4 pipeline in `scripts/tutor-intake/` and generalized `scripts/build-tutor-visemes.mjs`.

## Private Originals & Repository Guard

- Raw owner recordings (MP3, WAV, M4A, and video — single clips and continuous batches) are stored outside the git repository in `~/GretelVoicePrivate/` (overrideable with `GRETEL_VOICE_PRIVATE_DIR` for testing, never inside the repo).
- `.gitignore` explicitly excludes `GretelVoicePrivate/`, `**/GretelVoicePrivate/`, `.gretel-voice-private/`, and `public/audio/private/`.
- `scripts/tutor-intake/guard.mjs` enforces that no private directory or raw intake asset exists inside the repo, and permanently blocks:
  - `Gretel_67_Audio_Lecciones_Listo.zip` and any `rec_gretel_*` / `67_Audio` / `Audio_Lecciones_Listo` clip
  - `nina-sordita.mp3` (by filename/path, transcript `"sordita"`, and SHA-256 `40400ef648db825bf5da6b732db97bc66b097192f3f6288b7bdb44d6788bbc91`)
  - TinyWow compromised recordings

## Pipeline Stages

1. **SHA-256 Checksum & Dedup (`checksum.mjs`)**: hashes incoming media, rejects prohibited sources, deduplicates against `~/GretelVoicePrivate/index.json`, and stores originals outside the repo.
2. **Audio Extraction & Resampling (`media.mjs`)**: discovers `ffmpeg`/`ffprobe`/`rhubarb` from explicit flags, `<repo>/.tools/`, or `PATH`; extracts and resamples to 16 kHz mono PCM16 WAV (with pure-JS WAV/MP3 inspection fallbacks).
3. **Batch Matching & Needleman-Wunsch Alignment (`alignment.mjs`)**: matches continuous batches by transcript similarity (never assuming `nth` spoken sentence equals `nth` script line) and aligns tokens with Needleman-Wunsch global DP to flag missing, repeated, reordered, and wrong lines.
4. **Measured-Silence Cut Points (`silence.mjs`)**: locates real silence intervals via frame RMS/dBFS and snaps batch cut boundaries strictly inside measured silences (refusing blind mid-speech cuts).
5. **Audio QC (`qc.mjs`)**: checks digital clipping, noise floor & SNR, background music/continuous bed energy, transcript & acoustic stutters, and duration bounds.
6. **Runtime MP3 Export & Rhubarb Visemes (`media.mjs`, `visemes.mjs`, `build-tutor-visemes.mjs`)**: exports mono 24 kHz 48 kbps runtime MP3s and generates Rhubarb visemes (`-r phonetic -f json --extendedShapes GX`) for shapes `A–H, X`.
7. **Authorized Manifest Gate & Report (`manifest.mjs`, `report.mjs`)**: updates `src/content/tutor-lines.json` or `src/content/tutor-dialogue/*.json` **only** when a clip is mapped, QC-passed, and explicitly authorized; writes `docs/tutor/intake/<date>-<batch>.md`.

## CLI Usage

```bash
# Verify .gitignore, private-dir isolation, and zero rejected sources
node scripts/tutor-intake/cli.mjs check-guard

# Prove pipeline against the 43 existing approved recordings (non-destructive dry-run)
node scripts/tutor-intake/cli.mjs prove-approved

# Verify or rebuild Rhubarb visemes across v1 + v2 manifests
node scripts/build-tutor-visemes.mjs --dry-run
node scripts/build-tutor-visemes.mjs --all
```
