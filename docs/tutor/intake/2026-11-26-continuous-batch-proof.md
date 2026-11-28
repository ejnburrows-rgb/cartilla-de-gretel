# Tutor Recording Intake Report — continuous-batch-proof (2026-11-26)

- **Mode:** `apply`
- **Authorization:** `authorized`
- **Private Originals Directory:** `/Users/ejn/GretelVoicePrivate`
- **Repository Guard:** `PASS`
- **Discovered Binaries:** ffmpeg=`/Users/ejn/Desktop/Gretel/gretel-tutor/.tools/bin/ffmpeg`, ffprobe=`/Users/ejn/Desktop/Gretel/gretel-tutor/.tools/bin/ffprobe`, rhubarb=`/Users/ejn/Desktop/Gretel/gretel-tutor/.tools/bin/rhubarb`
- **Staging Export Directory:** `/tmp/gretel-intake-proof/exports` (manifestWrite=false)
- **Silence Segmentation (`continuous-batch.m4a`):** engine=`ffmpeg-silencedetect`, intervals=13, duration=32.055s

## 1. Source Checksums & Deduplication

| Source | Status | Dedup | Bytes | SHA-256 (first 16) | Notes |
| :--- | :--- | :--- | ---: | :--- | :--- |
| `continuous-batch.m4a` | stored | new | 235587 | `6e76ce596082968a` | /Users/ejn/GretelVoicePrivate/originals/continuous-batch-proof/6e76ce596082-continuous-batch.m4a |

## 2. Transcript Matching & Needleman-Wunsch Alignment

- Expected lines: **12**
- Heard segments: **12**
- Matched primary: **11**
- Missing lines: **1**
- Repeated lines: **1**
- Reordered lines: **1**
- Wrong / deviated segments: **0**

### Missing Lines
- `l1-model-escoba`: escoba

### Repeated Lines
- `l1-model-dulce`: 2 takes (segments 9, 10; chosen #10)

### Reordered Lines
- `l1-model-abeja` (segment #2, expected index 1 appeared after 2)

## 3. Cut Points, QC, Visemes & Manifest Gate

| Line ID | Cut Window | QC | Peak (dBFS) | Noise (dBFS) | SNR (dB) | Flatness | Visemes | Manifest |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| `l1-model-abanico` | 1.062s–2.539s | PASS | -15.02 | -84.15 | 55.96 | 0.0016 | built (8 cues) | staged-approved-gate |
| `l1-model-abrigo` | 3.919s–5.279s | PASS | -13.72 | -88.22 | 60.13 | 0.0015 | built (10 cues) | staged-approved-gate |
| `l1-model-abeja` | 6.526s–7.769s | PASS | -13.56 | -75.98 | 47.37 | 0.0349 | built (10 cues) | staged-approved-gate |
| `l1-model-anillo` | 9.240s–10.536s | PASS | -11.32 | -85.3 | 61.03 | 0.0019 | built (7 cues) | staged-approved-gate |
| `l1-model-araña` | 11.712s–12.849s | PASS | -10.85 | -73.09 | 46.05 | 0.0024 | built (5 cues) | staged-approved-gate |
| `l1-model-aro` | 14.182s–15.052s | PASS | -10.1 | -83.57 | 57.78 | 0.0034 | built (9 cues) | staged-approved-gate |
| `l1-model-avión` | 16.453s–17.671s | PASS | -12.46 | -86.64 | 58.46 | 0.001 | built (10 cues) | staged-approved-gate |
| `l1-model-carro` | 19.113s–20.074s | PASS | -13.77 | -79.8 | 51.3 | 0.0082 | built (7 cues) | staged-approved-gate |
| `l1-model-casa` | 21.390s–22.429s | PASS | -11.69 | -85.53 | 58.07 | 0.0567 | built (6 cues) | staged-approved-gate |
| `l1-model-dulce` | 23.959s–25.113s | PASS | -15.52 | -77.28 | 49 | 0.0663 | skipped | gated-hold |
| `l1-model-dulce` | 26.645s–27.799s | PASS | -15.53 | -77.12 | 48.84 | 0.0652 | built (9 cues) | staged-approved-gate |
| `l1-model-elefante` | 29.369s–31.053s | PASS | -7.68 | -87.31 | 63.47 | 0.0519 | built (11 cues) | staged-approved-gate |

## 4. Manifest Update Summary

- Applied updates: **11** (staging/dry-run — 0 repository manifest files modified)
- Skipped / gated updates: **1**

- Skipped `l1-model-dulce`: not-mapped

