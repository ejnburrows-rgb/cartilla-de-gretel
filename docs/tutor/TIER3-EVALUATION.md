# Gretel Tutor — Milestone 11: Tier 3 Optional Capabilities Evaluation

> **Status**: Evaluation complete · **Shipping policy**: **ZERO Tier 3 models shipped by default.**  
> **Architectural guarantee**: Tier 1 (offline recorded-audio tutor, visemes, deterministic curriculum brain, Flip Chart choreography, Workbook/Game supervised practice, structured replay) and Tier 2 (on-device Vosk Spanish STT `vosk-model-small-es-0.42`, opt-in local camera preview, consent-gated local MediaRecorder) are **100% independent** of Tier 3. Disabling or omitting every Tier 3 slot has zero effect on Tier 1/2 functionality, offline readiness, or child safety.

---

## 1. Evaluation Criteria & Classroom Constraints

Target deployment devices for *La Cartilla de Gretel* include school-issued Chromebooks (4 GB RAM), budget Android tablets (3–4 GB RAM, mid-range ARM SoCs), iPads (Safari/WebKit WebGPU/WASM memory ceilings), and parent smartphones (390×844 viewport, intermittent or absent Wi-Fi).

Every Tier 3 candidate is evaluated against five non-negotiable criteria:

1. **Download & Storage Size**: Must fit within mobile PWA cache budgets without triggering OS cache eviction of Tier 1/2 assets (~45 MB total today).
2. **Runtime Memory (RAM / GPU)**: Must stay well below iOS Safari's ~1.2–1.5 GB per-tab ceiling and 4 GB Chromebook multi-tab pressure.
3. **Mobile Performance & Thermal Impact**: Latency must feel responsive for a 5–7 year-old learner without overheating or freezing animations/audio.
4. **Spanish Early-Literacy Quality**: Must handle 5–7 year-old Spanish speech, beginning handwriting, and exact *La Cartilla de Gretel* pedagogy without hallucinations, invented letters, or false negative discouragement.
5. **License, Privacy & Governance**: Permissive OSI license (Apache-2.0 / MIT / BSD), 100% on-device execution (zero cloud leakage of child voice, image, or handwriting), and explicit owner approval before any binary is bundled.

---

## 2. Capability-by-Capability Honest Evaluation

### 2.1 Snapshot-Only Local Letter & Handwriting Vision (`tier3-vision-handwriting`)

**Concept**: Child holds up their paper workbook or writes a letter/syllable; on an explicit button tap (never continuous video analysis), a single camera frame is captured locally and inspected for letter/syllable recognition.

| Dimension | Honest Assessment |
|---|---|
| **Candidate Stack** | Custom lightweight ONNX/WASM CNN (EMNIST + Spanish diacritics `ñ`, `á`, `é`, `í`, `ó`, `ú`) or Tesseract.js (`spa.traineddata` fast) via WebAssembly. |
| **Download Size** | ~4–12 MB (custom quantized CNN + ONNX Runtime WASM) or ~15–22 MB (Tesseract.js WASM + `spa` fast model). |
| **Memory Footprint** | 80–220 MB transient peak during single-frame inference; releasable after snapshot. |
| **Mobile Performance** | 300 ms–1.8 s per snapshot on mid-range mobile CPU/WASM; acceptable for explicit snapshot-only flow (unacceptable for continuous video). |
| **Spanish Quality** | **High risk on real child handwriting**: Tesseract.js is trained on printed text and performs poorly on 5–7 year-old pencil strokes, skewed paper, uneven classroom lighting, and cursive/manuscript variants. Even EMNIST-based models struggle with `ñ` tilde placement and multi-letter syllables without domain-specific child handwriting training data. False rejections can discourage early readers. |
| **License & Privacy** | ONNX Runtime (MIT), Tesseract.js (Apache-2.0). Fully local if snapshot never leaves memory. |
| **Verdict** | **DEFER (Opt-in R&D slot only — NOT shipped by default).** Requires a curated child-handwriting validation set and a strict "never auto-grade / gentle hint only" UX before enabling. |

---

### 2.2 Optional Local LLM for Curriculum Q&A (`tier3-local-llm-qa`)

**Concept**: On-device small language model (SLM) answering parent/teacher or student questions grounded strictly in *La Cartilla de Gretel* lessons.

| Dimension | Honest Assessment |
|---|---|
| **Candidate Stack** | WebLLM / Transformers.js running 4-bit quantized Qwen2.5-0.5B-Instruct / Qwen2.5-1.5B-Instruct or SmolLM2-1.7B via WebGPU (with WASM fallback). |
| **Download Size** | **350 MB – 1.1 GB** (4-bit quantized weights + tokenizer + WebGPU runtime). 8×–25× larger than the entire Tier 1+2 offline pack. |
| **Memory Footprint** | **600 MB – 2.2 GB** VRAM/RAM. Routinely crashes iOS Safari tabs and 4 GB Android/Chromebook devices with OOM kills. |
| **Mobile Performance** | WebGPU is unavailable or unstable on older Android WebViews and many school Chromebooks; WASM fallback drops to 1–4 tokens/sec (10–30 s per short answer), which breaks child attention completely. |
| **Spanish Quality** | Sub-2B models frequently hallucinate phonics rules, mix up Spanish syllabification, drift into English, or produce unapproved wording outside *La Cartilla de Gretel*'s owner-approved script policy. Cannot be voiced because Gretel's voice is **recorded human audio only** (no TTS). |
| **License & Privacy** | Qwen2.5-0.5B/1.5B (Apache-2.0), SmolLM2 (Apache-2.0). Local execution preserves privacy, but output safety/curriculum fidelity cannot be guaranteed without deterministic guardrails. |
| **Verdict** | **DO NOT SHIP BY DEFAULT (Opt-in desktop/high-RAM slot only, currently `unavailable` until verified).** The deterministic curriculum graph + recorded dialogue bank already covers all 24 lessons safely with 0% hallucination risk. |

---

### 2.3 Hands-Free Voice Interruption / Barge-In (`tier3-handsfree-vad`)

**Concept**: Continuous local Voice Activity Detection (VAD) allowing a child to interrupt Gretel mid-sentence without tapping the microphone or interrupt button.

| Dimension | Honest Assessment |
|---|---|
| **Candidate Stack** | Silero VAD v5 (ONNX Runtime Web / AudioWorklet) + browser WebRTC Acoustic Echo Cancellation (`echoCancellation: true`). |
| **Download Size** | ~2–4 MB (Silero VAD ONNX ~1.8 MB + minimal WASM runtime). |
| **Memory Footprint** | 25–50 MB steady-state AudioWorklet + WASM heap. |
| **Mobile Performance** | Moderate continuous CPU drain (5–12% on low-end ARM) + continuous microphone indicator active. **Major classroom issue**: on tablets/phones without hardware AEC, Gretel's own speaker playback triggers false barge-in loops, and background classroom chatter triggers constant unwanted interruptions. |
| **Spanish Quality** | Language-agnostic speech detection, but child voices (higher pitch, softer volume, hesitant pauses) suffer from high false-negative / false-cut rates in noisy classrooms compared to push-to-talk. |
| **License & Privacy** | Silero VAD (MIT). Fully local; requires keeping the mic open continuously, which conflicts with the conservative "mic only opens when the child taps" privacy posture unless explicitly opted in. |
| **Verdict** | **DEFER (Opt-in slot only — NOT shipped by default).** Tier 1/2 push-to-talk + explicit "Interrumpir" button is far more reliable in classrooms and prevents speaker-to-mic echo loops. |

---

### 2.4 Opt-In MediaRecorder Audiovisual Recording (`tier3-av-recorder`)

**Concept**: Local browser `MediaRecorder` recording of a tutoring session (audio or audio+video) for parent/teacher review, strictly behind explicit consent controls.

| Dimension | Honest Assessment |
|---|---|
| **Candidate Stack** | Native browser `MediaRecorder` API (WebM/Opus or MP4/AAC depending on platform) + local IndexedDB/Blob download. **0 MB external model download.** |
| **Download Size** | **0 MB** (uses built-in browser API; no external weights). |
| **Memory Footprint** | 15–40 MB streaming buffer; storage grows at ~0.5–1.5 MB/min (audio-only) or ~8–25 MB/min (720p video). |
| **Mobile Performance** | Hardware-encoded on modern iOS/Android/Chrome; low CPU overhead for audio-only, moderate battery/storage impact for video. Codec availability differs between Chromium (`video/webm;codecs=vp8,opus`) and Safari (`video/mp4`). |
| **Spanish Quality** | N/A (verbatim local recording of actual child/Gretel audio; no synthesis or transcription distortion). |
| **License & Privacy** | Standard W3C Web API (no third-party license). **High privacy sensitivity**: child audiovisual recordings are biometric/PII-adjacent under COPPA/FERPA. Must remain **OFF by default**, require explicit per-session adult consent (`TutorConsentControls`), display a visible recording indicator, stay strictly local on-device, and be one-click deletable without affecting curriculum progress. |
| **Verdict** | **OPT-IN ONLY (OFF by default, gated by `TutorConsentControls`).** Structured replay (`TutorReplay`, zero video/audio storage) remains the default Tier 1 review mechanism. |

---

## 3. Summary Decision Matrix

| Tier 3 Slot ID | Capability | Est. Model Size | Peak RAM | Mobile Viability | Spanish Pedagogy Quality | Shipped by Default? | Tier 1/2 Dependency |
|---|---|---:|---:|---|---|---|---|
| `tier3-vision-handwriting` | Snapshot-only local handwriting vision | 10–22 MB | 80–220 MB | Medium (snapshot only) | Low–Medium (child pencil variance) | **No** (`opt-in`, `unavailable`) | **None** |
| `tier3-local-llm-qa` | Local SLM for curriculum Q&A | 400–1,100 MB | 600–2,200 MB | Poor on mobile/4 GB | Unverified (hallucination risk) | **No** (`opt-in`, `unavailable`) | **None** |
| `tier3-handsfree-vad` | Continuous VAD voice barge-in | 2–4 MB | 25–50 MB | Medium (echo/classroom noise) | Medium (false triggers on speakers) | **No** (`opt-in`, `unavailable`) | **None** |
| `tier3-av-recorder` | Local MediaRecorder AV capture | 0 MB (Web API) | 15–40 MB | Good (codec-dependent) | Verbatim (high privacy care) | **No** (`opt-in`, consent-gated) | **None** |

---

## 4. Packaging & Isolation Contract

1. **Dedicated Optional Pack Slots**: Every Tier 3 capability is modeled as a separate optional pack slot in `src/lib/tutor-offline-pack.ts` (`optInOnly: true`, `requiredForOfflineCore: false`, `tier: 3`).
2. **Never Bundled by Default**: `scripts/vite-tutor-pack.ts` emits metadata descriptors for Tier 3 slots with `files: []` and `available: false` (except `tier3-av-recorder` which uses the zero-download browser API behind explicit consent). Downloading the offline tutor pack (`Preparar sin internet`) **never** fetches any Tier 3 model weights.
3. **Complete Tier 1/2 Independence**: Core offline readiness (`Listo sin internet`), per-lesson packs (Lessons 1–24), Vosk local Spanish STT, Gretel avatar layers, Flip Chart choreography, Workbook/Games practice, and structured replay operate identically with all Tier 3 slots uninstalled.
4. **Future Promotion Gate**: No Tier 3 model may move from `unavailable` to `available` without: (a) a pinned SHA-256 checksum, (b) verified permissive license documentation, (c) real-device mobile memory/latency benchmark passing on 4 GB hardware, and (d) explicit owner approval.
