# Gretel Tutor — implementation and acceptance checkpoint

Scope: existing PR #1073, lessons 1–3 only. Draft; no merge, deployment, student-data service, new voice, or new artwork activated. README and the owner source-of-truth documents are unchanged.

## What changed

- Offline readiness now requires an exact-build manifest, service-worker control, every required resource, and verified byte counts/SHA-256. A fresh immutable cache is committed through one pointer update; failure discards only the staged generation. Previous verified packs and unrelated app/progress caches survive.
- The build supplies and rechecks the pinned official Spanish model. It is still a gzipped tar archive, served as `.bin` to prevent Vite/static servers treating its archive compression as HTTP Content-Encoding. The manifest hashes the final files after Vite finishes CSS processing, including lazy chunks. Production builds reject the scripted microphone override.
- Each voice call has its own result and cancellation. Stop, mute, replacement and unmount settle pending loads and pause/release media. Speaking starts on the actual `playing` event. Rhubarb `mouthCues[].value` is parsed correctly, and visemes follow media time. The unsupported fixed-speed letter timer was removed; the intact whole word remains readable.
- Partial character layers cannot replace the body. Activation needs approved composition metadata, the actual 1086×1448 canvas, approved layers and either explicit overlays or a complete base stack. Broken/mismatched images fall back to the intact master. The shipped layer manifest remains empty.
- Landscape layout, back/sound/replay controls, visible pending-audio wording, bounded natural Spanish help/repeat intents, corrupt/denied storage handling, and separate local-memory deletion are implemented. Anonymous progress clearing does not remove the offline pack.
- Vosk cancellation handles permission/model waits and stops late-arriving microphone tracks. Recognition errors/timeouts now settle model initialization; closing the Tutor terminates its owned worker even during loading. With vosk-browser pinned at 0.0.8, worker termination uses its inspected runtime `worker` member because public termination cannot safely terminate an uninitialized model.

## GRT checklist

| Requirement | Current implementation | Acceptance still needed |
|---|---|---|
| GRT-01 | Real built UI screenshots at all four requested sizes; same existing branch | Phone-opening isolated preview and complete interaction recording |
| GRT-02 | Atomic required-file pack, full dependency manifest, model delivery/integrity, recovery tests | Physical-device offline spoken lessons/storage endurance; see runtime evidence below |
| GRT-03 | Voice lifecycle repaired; all 43 approved MP3s decode; original 32-minute source recovered and hash checked | Heard phrase/timestamp alignment for pending lines, actual audible playback matrix and owner acceptance |
| GRT-04 | Explicit overlay/complete composition gate, frame checks and intact fallback; regression tests | Approved real layers and their visual comparison; no new layer activated |
| GRT-05 | Playback-position viseme wiring and intact source dimensions corrected | Prepare expression/arm/underpaint pieces, show comparisons/motion, obtain per-piece approval |
| GRT-06 | Local-only engine retained; error/cancel/permission-wait and worker disposal repaired | Real speech on desktop/Android/tablet/iPad; actual 41-item and confusion accuracy |
| GRT-07 | Natural help/repeat/uncertainty variants and off-topic exclusion tested, with existing model/visible fallback | Real-device scenario demonstrations and recorded instruction coverage |
| GRT-08 | Responsive stage + controls; all four real Chromium viewports fit without page overflow; mic 96×96 | Physical touch/keyboard/audio acceptance, unavailable-state and long-word screens on target devices |
| GRT-09 | Corrupt/denied storage and seat isolation tests; progress/memory deletion independent of pack | Owner retention/contact decision before any real-student pilot |
| GRT-10 | Targeted regressions/typecheck/lint/build and original voice/viseme validators pass; production stub guard | Remaining actual-device reliability/recognition acceptance; no unrelated art changes |
| GRT-11 | Separate source/unit/build/browser evidence retained | Full physical-device matrix, owner-playable proof and final release approval |

## Evidence and its limits

- Unit: 334 Tutor-specific tests across 13 files pass. TypeScript and scoped ESLint pass. Production Vite bundle builds. Original voice and viseme validators pass (43 approved, 77 pending; 43 timing files).
- All 43 approved recordings decode with ffmpeg. `audio-decode.json` records each file. This is file/decoder evidence, **not** human auditory approval or verified phone playback.
- Real Chromium 145.0.7632.6 screenshots: [390×844](../proofs/tutor-2026-10-21/tutor-390x844.png), [844×390](../proofs/tutor-2026-10-21/tutor-844x390.png), [1280×800](../proofs/tutor-2026-10-21/tutor-1280x800.png), [1366×768](../proofs/tutor-2026-10-21/tutor-1366x768.png). These are desktop Chromium viewports, **not physical phones/tablets**. The page dimensions match each viewport and the microphone stays 96×96.
- The production offline-pack/eviction browser check passed (`offline-pack-and-eviction.txt`). A real browser prepared 220 resources (~54 MB), then opened all three lesson screens with the context offline. The failed-update browser check preserves the prior cache pointer. A persistent Chromium profile was then closed entirely, restarted offline, and all three Tutor lesson documents were served by the service worker with zero page errors; see `offline-browser-restart.txt`. This proves screen/app cold startup, not spoken lesson completion.
- This execution environment's direct `navigator.mediaDevices.getUserMedia({audio:true})` did not return within 10 seconds even with a permitted fake capture device. Consequently actual microphone capture, Vosk recognition accuracy, human speech, classroom noise, iPad support and offline spoken completion are **not verified**. No scripted result is represented as real speech.
- Intermediate browser runs exposed the final-CSS checksum and HTTP archive decompression defects, which were fixed. Other intermediate runs were invalidated by source hot reload or Chromium process/context crashes in this restricted environment. They are not passing acceptance evidence. The final frozen-source Lección 1 check passed under reduced motion: 24 scripted answers, 24 mic taps, one correct result per item, and the completion screen (90.0 seconds). `scripted-lesson.txt` is explicitly StubEars evidence, not human recognition. The final wrong-then-correct, three-misses, silence, and route-exit cases also passed as separate isolated browser runs; their logs are attached.
- Original recovery: `Gretel_558674_Original.m4a`, 47,122,635 bytes, 1,948.168688 seconds, SHA-256 `239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d`. Original remains private and is not published. `VOICE-SOURCE-RECOVERY.json` retains each of the 77 pending line IDs/roles/intended text with **no invented timecodes/transcript**. Recovery is not voice alignment or approval.

## Scoped security triage

Current PR review comments concern the two manifest validators and PATH resolution in `build-tutor-visemes.mjs`. The validators are developer-operated, read-only local tools; they do not receive browser input, publish contents, execute manifest strings, or write student data. The build script runs fixed unzip/ffmpeg/Rhubarb commands via argument arrays, without a shell; the manifest and generated filenames are repository-controlled. No remotely reachable exploit was demonstrated by these comments. PATH/tool installation and untrusted-manifest execution remain developer-environment trust boundaries; no blanket security certification is claimed. No Supabase migration, analytics or student-data writer was enabled. Sonar's rating remains advisory under repository policy.

## Privacy wording for owner decision (not applied as policy)

A truthful Spanish description of current implementation is: “El progreso y la memoria permanecen en este navegador mientras se conserven sus datos. El historial conserva como máximo los 500 eventos de progreso más recientes. Puedes borrar el progreso y la memoria del tutor sin eliminar el material preparado para usar sin internet. No se guardan grabaciones ni transcripciones.”

The owner must decide whether to retain this manual-deletion behavior or authorize a timed retention rule, and provide the published contact. The existing privacy placeholders remain; real-student rollout stays held. No retention interval/contact was invented.
