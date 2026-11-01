# Tutor architecture — La Cartilla de Gretel

Concise architecture of the Gretel tutor (Lecciones 1–3), per build spec
§2, §4, §5, §18. Owner decisions below are final and dated; see the build
spec §0 for the full decision table.

## Routes

- `/tutor` — lesson picker for Lecciones 1–3.
- `/tutor/$n` — one session screen (Gretel appears only on tutor routes).
- `/privacy/tutor` — Spanish-first privacy stub (ES then EN).

## Ears (on-device only — owner decision, EJN 2026-10-21)

- `tutor-ears-vosk.ts` — **VoskEars** (primary): Vosk WASM in a Web Worker,
  16 kHz mono from `getUserMedia`, grammar-limited per item (lesson items,
  same-page distractors, the 5 vowels + aliases, command words, `[unk]`).
  Model `vosk-model-small-es-0.42` is fetched at build time and served from
  our own site.
- `tutor-ears-chrome-local.ts` — **ChromeLocalEars**: extra opinion only when
  Chrome reports on-device Spanish as `available`; never cloud, never
  `downloadable` mid-session.
- `tutor-ears-stub.ts` — **StubEars**: scripted transcripts for tests/e2e.
- The mic opens only inside `listen()`, only after a child tap. Audio stays
  in memory and is discarded after each attempt — never storage, never the
  network. No Gemini, no cloud listening (owner, 2026-10-21).

## Brain

- `tutor-brain.ts` — pure state machine:
  `GREET → MODEL → LISTEN → MATCH → RESPOND → CELEBRATE / ENDED`
  with deterministic matching (`tutor-match.ts`) and deterministic line
  selection (`tutor-line-picker.ts`). No LLM anywhere on the default path.
- `tutor-intent.ts` — transcript → intent (TARGET, CLOSE, OTHER_VOWEL,
  OTHER_WORD, REPEAT, DONT_KNOW, HELP, SILENCE, NOISE, OFF_SCRIPT).
- `tutor-memory.ts` — per-slot local memory; no names, audio, or transcripts.

## Voice (recorded audio only — no TTS path reachable)

- `tutor-voice.ts` installs a `recorded-audio` provider into
  `speakAsGretel`; `speechSynthesis` is never called on any tutor path.
- Line bank: `src/content/tutor-lines.json` (approved entries only;
  pending lines play gentle silence). Audio sources are the owner's
  already-supplied recordings and the 43 approved picture-name recordings;
  never the rejected 67-clip ZIP. New wording is DRAFT until the owner
  approves.
- Viseme JSON (Rhubarb, offline) times the "talking" state; amplitude
  fallback when absent.

## Face

- `TutorGretelPuppet` — layered SVG puppet driven by the existing
  `gretelMachine`, animated with `framer-motion` (already installed). No
  Rive, no paid tools (owner, 2026-10-21).
- Until the owner approves the layer pack
  (`docs/gretel/LAYER-PACK-SPEC.md`), `layers/manifest.json` is empty and the
  puppet shows the approved master intact with whole-figure motion only.
  Approved layers drop in with **no code change**.

## Progress (on-device only — owner decision, EJN 2026-10-21)

- Event: `{ session_id, lesson_id, item_id, result, attempts, created_at }`
  — one per finished item; never audio, names, or transcripts.
- `session_id` = UUIDv5(namespace, `${classCode}:${slot}`); class code + slot
  (1–40) come from a tutor-only picker. Anonymous, not secret.
- Storage: `localStorage` key `cartilla.tutor.progress.v1`, bounded 500 events
  FIFO (`src/lib/tutor-progress.ts`).
- **No Supabase writer is built.** The migration file
  `supabase/migrations/20261021_tutor_progress.sql` ships for later and is
  NOT applied (Supabase work is owner-gated and deferred).

## Offline pack (spec §18.1)

- Teacher-side control **"Preparar sin internet"**
  (`src/components/tutor/TutorOfflinePack.tsx`) downloads the Tutor pack once
  into a dedicated, versioned service-worker cache `cartilla:tutor:<version>`
  — never mixed into the app's existing caches.
- Pack contents: `/tutor` app code (discovered from the /tutor document),
  the Vosk model, Lecciones 1–3 line audio + viseme JSON (derived from
  `tutor-lines.json`), the picture recordings, and the puppet layers or the
  approved master.
- Status: downloading (bytes) / "Listo sin internet" (+ version) /
  "Hay que preparar de nuevo" when storage was cleared — never a broken
  screen. `navigator.storage.persist()` is requested.
- `public/sw.js` serves pack entries cache-first; with no pack, every
  existing strategy behaves exactly as before.

## Privacy boundaries

- Progress events only, on-device only (fields above).
- Child audio: processed on-device, never stored or sent.
- No analytics, no third-party cookies, no external fonts on tutor routes.
- Retention and contact: `[OWNER TO SET]` (see `docs/privacy/DATA-RETENTION.md`
  and `/privacy/tutor`). Periods are never invented.

## Test surface

- Unit: `tutor-match`, `tutor-brain`, `tutor-lines-manifest`,
  `tutor-content`, `tutor-progress`, `tutor-offline-pack` (mocked caches
  API), plus intent fixtures.
- e2e (Playwright, StubEars): full runs, offline run after pack download,
  storage-cleared path, mic-denied and no-recognizer gentle states.