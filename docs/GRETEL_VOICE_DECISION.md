# Gretel Voice Architecture & Final Owner Decision Packet

## 1. Executive Summary

This document establishes the Gretel voice readiness architecture for **La Cartilla de Gretel** without selecting a paid provider, making any purchases, cloning a voice, or changing the owner's final decision.

All speech entry points in the application are centralized through `src/lib/gretel-voice.ts`. The codebase guarantees single-owner speech playback, mute/cancel cleanup on navigation, event synchronization for Gretel animations, and zero code changes required at call sites when swapping the underlying voice engine.

---

## 2. Gretel Speech Entry Points Map

Every speech call site in the application uses one of two centralized functions:
- `speakAsGretel(text, handlers)` in `src/lib/gretel-voice.ts`
- `speakGretelPhrase(phrase)` in `src/lib/gretel-tts.ts` (which delegates directly to `speakAsGretel`)

| Component / Call Site | Source File | Function Used | Purpose |
| :--- | :--- | :--- | :--- |
| **Gretel Presence Host** | `src/components/gretel/GretelPresence.tsx` | `speakAsGretel` | Spoken page introductions & idle guidance |
| **Gretel Live Avatar** | `src/components/gretel/GretelLiveAvatar.tsx` | `speakAsGretel` | Spoken dialogue for live Gretel reactions |
| **Gretel Cinematic** | `src/components/gretel/GretelCinematic.tsx` | `speakAsGretel` | Spoken scripts during lesson story scenes |
| **Gretel Mirror** | `src/components/cartilla/GretelMirror.tsx` | `speakAsGretel` | Spoken instruction repetition |
| **Sound Search Game** | `src/components/cartilla/SoundSearch.tsx` | `speakAsGretel` | Spoken target phonemes & sound prompts |
| **Interaction Feedback (Lasso, Workbook)** | `src/cartilla/interactions/LassoConnect.tsx` | `speakGretelPhrase` | Encouraging success/retry phrases |
| **Gretel Event Listener** | `src/components/gretel/useGretelEvents.ts` | `speakGretelPhrase` | Global interaction event speech reactions |
| **Voice Audition Route** | `src/routes/cartilla/voces.tsx` | `speakAsGretel` | Live audition of candidate voices |

---

## 3. Concurrency, Mute, & Navigation Cleanup

- **Single-Owner Playback:** Speech concurrency is governed by `src/lib/speech-playback.ts`. Calling `claimSpeech('gretel')` automatically cancels any ongoing speech utterance (whether picture audio, reading text, or prior Gretel speech), ensuring only one Gretel utterance owns playback at any time.
- **Event Synchronization:** `speakAsGretel` dispatches `gretel:speak_start` and `gretel:speak_stop` window events, keeping Gretel's mouth and avatar animations synchronized with active audio playback.
- **Mute & Cancel Policy:** Calling `setGretelVoiceMuted(true)` or `cancelGretelSpeech()` instantly cancels active playback and dispatches cleanup events. Navigation hooks in `GretelPresence` and `VoiceAudition` execute `cancelGretelSpeech()` on unmount.

---

## 4. Centralized Pluggable Provider Architecture

The voice architecture in `src/lib/gretel-voice.ts` supports four pluggable provider models without changing call sites:

```ts
export type GretelVoiceProviderType = "browser-tts" | "recorded-audio" | "cloud-tts" | "custom";

export interface GretelVoiceProviderConfig {
  type: GretelVoiceProviderType;
  name: string;
  primaryVoiceName?: string;
  fallbackVoiceName?: string;
  pitch?: number;
  rate?: number;
  speakFn?: (text: string, handlers: GretelVoiceHandlers) => Promise<void>;
}
```

By default, the application runs on `"browser-tts"` using free, offline-capable neutral Latin American Spanish voices (`Leda` / `Sulafat` / `es-MX`).

---

## 5. Audition Route (`/cartilla/voces`)

The route `/cartilla/voces` serves as the owner's audition page:
- Reads available OS/browser Spanish voices dynamically via `getAvailableGretelVoices()`.
- Reads exact Lección 1 printed text ("Presiona los dibujos de las palabras en cada línea horizontal que comienzan con el mismo sonido.").
- Plays candidate voices using `speakAsGretel` and `setGretelVoiceProviderConfig`.
- Exposes neutral LatAm vs. non-neutral locales and natural vs. pitch-tuned candidate options.

---

## 6. Exact Owner Decision Choices & Trade-Offs

The final premium Gretel voice selection remains **100% gated by EJN (Owner)**. The remaining options are:

### Option A: Free Browser-Native Web Speech TTS (Current Default)
- **Description:** Uses built-in browser/OS Spanish voice engines (e.g. Google, Microsoft, Apple voices).
- **Pros:** $0 cost, offline capable, no external dependencies, zero latency.
- **Cons:** Built-in voices are adult female voices. Pitch tuning makes them lighter, but they do not sound like a genuine young girl.

### Option B: Cloud Neural TTS (Google Cloud Text-to-Speech / Azure Speech / AWS Polly)
- **Description:** Server/API-backed neural text-to-speech with high naturalness.
- **Pros:** Natural pronunciation, neural quality, highly reliable.
- **Cons:** Character-based usage fees (~$4–$16 USD per 1M characters), requires API key management / backend proxy.

### Option C: Paid Premium Child Voice Provider (e.g. ElevenLabs)
- **Description:** Dedicated AI voice synthesis with realistic child voice profiles.
- **Pros:** Expressive, authentic young child voice tone.
- **Cons:** Monthly subscription cost ($5–$22+ USD/mo), potential network latency for dynamic synthesis, requires API key.

### Option D: Studio Pre-recorded Audio Clips (Real Child Voice Actor)
- **Description:** High-quality studio audio files recorded by a real young voice actor for all lesson instructions and feedback phrases.
- **Pros:** 100% natural, ideal pedagogical quality for early childhood literacy, $0 recurring API cost once recorded.
- **Cons:** Requires recording session and asset management for all required phrases.

---

## 7. Confirmation of Non-Intervention

- **No paid provider** has been chosen or subscribed to.
- **No money** has been spent.
- **No voice clone** or external AI service key was added.
- **No owner preference** has been altered.
- **Default fallback** remains fully operational.
