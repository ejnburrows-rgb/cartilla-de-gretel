# Current checkpoint — READY Vercel preview and complete printed instructions

This checkpoint supersedes the older blocked-preview/40-line statuses below. The owner's latest request is every instruction printed on pages 7–9, verified against `src/data/book-transcription/lessons-01-07.json`.

- **Step 1 DONE:** Vercel preview `dpl_BNkH36PQD7ZbzFRKqmEUmni87T8v`, commit `93933ba228df572467208ebe9c90d0c09fde570c`, is **READY**: https://cartilla-de-gretel-bk3cwc6of-ejn.vercel.app/cartilla/leccion/3 . Vercel authentication requires the temporary share link in the PR, valid through October 17. No Render fallback needed.
- `package.json` adds `build:preview`, preserving prebuild, art preparation, asset verification, TypeScript and bundling while omitting tests. `vercel.json` selects it only when `VERCEL_ENV=preview`; production/unset environments select normal `pnpm build`, which retains tests. All three branches were checked. Automatic Git deployment remains disabled. Only these two build configuration files changed; the shared audit/test/fixture and lesson layouts were not edited.
- The exact preview build passed locally and on Vercel; [build output](preview-build.txt), [deployment receipt](preview-deployment.json). Asset generation's incidental tracked delivery changes were reverted locally and excluded from commits.
- **Step 2 DONE:** All four transcription instructions exactly match the already generated/wired free Spanish clips, including punctuation. File SHA256s verified. Reused those valid MP3s instead of generating duplicates; updated manifest with source file/hash and exact JSON pointers. No additional instruction sentence exists in those three transcription pages. [Coverage proof](transcription-audio-proof.json).
- Live deployed Chromium at 390×844 passed **15 checks**: all four instructions completed actual playback, real correct answers on pages 7/8 played “Muy bien” completely, picture taps interrupted instructions, and no runtime exceptions occurred. [Live browser proof](preview-live-browser-proof.json); live screenshots: [7](lesson3-preview-live-7.png), [8](lesson3-preview-live-8.png), [9](lesson3-preview-live-9.png). These are the hosted build, not a local dev server.
- **Step 3 DONE — exact printed lines:**
  - Page 7: Marca con una x los dibujos de las palabras que comienzan con A a.
  - Page 8: Traza una línea desde la vocal Aa hasta el dibujo de la palabra que comienza con Aa.
  - Page 9: Escribe con tu mejor letra.
  - Page 9: Haz un dibujo que represente una palabra que comienza con a.

The deployed app code and all audio files are identical to the subsequent evidence/manifest-only commit. The deployed metadata JSON predates the added transcription pointers; these do not change playback. Existing 15 focused tests remain applicable to unchanged playback code. No full-suite passing claim: the central fixture test still fails and is deliberately skipped only by the preview build. Physical phone/Safari, voice quality/pronunciation acceptance, amber proposal approval and full page-9 activity completion remain owner/device verification gaps. No merge, paid service or production deploy.

---

# Earlier checkpoints (historical statuses)

# Lesson 3 proof — 16 October 2026

Continues draft PR #866. Before screenshots: original draft `a501d77d049af90038f42e3dce582cb64b2cd367`. Current-main baseline incorporated before implementation: `f9645c4c9681d8ced8710e323c997812e41a061f` (includes owner-approved #873 assets). No production merge/release.

## Actual proof

- Real `/cartilla/leccion/3`, Chromium 151 headless, 390 × 844 CSS pixels, fresh anonymous learner storage. Screenshots are browser output, not mockups.
- `browser-proof.json`: 33 passing browser checks; all 24 picture placements (18 distinct vocabulary words) reached the browser's actual MP3 `playing` event; no speech synthesis calls. Replay after selection, keyboard Enter, three incorrect attempts per picture, and incomplete-page navigation gates checked on pages 7 and 8.
- Before/after full-page screenshots of printed pages 7, 8 and 9; additional right-scrolled screenshots preserve the original columns. Owner selected sideways activity scrolling on phones rather than a two-column rearrangement.
- After screenshots include measured header 18px, instructions 22px, picture targets at least 104 × 104px, regular buttons at least 56px, navigation 64px. The page scrolls vertically; the picture areas scroll sideways. Screenshots marked `top` show the initial 390 × 844 viewport; full-page screenshots include content below it.
- `lesson3-pencil-proof.mp4`: actual normal-motion picture tap, shared pencil/eraser retry, correct mark and sideways scroll. Browser video does not include an audio track; actual media playback evidence is recorded separately in the JSON.
- TypeScript check passed; 56 focused tests passed across vocabulary audio, pencil connector/progress, pencil marks, drawing host and the Lesson 3 retry policy. Vite production bundle built with `--mode worker`, avoiding generated-route/art mutations. Existing bundle-size warning remains advisory.

## Layout edits, exhaustively

No new edits to `page-layouts.json` in this continuation. The original draft's five placements/four drawing changes remain:

1. Page 7, abanico: faithful/vocal-a/abanico.webp → optimized/workbook/leccion-1/abanico.svg.
2. Page 7, oveja: faithful/vocal-o/oveja.webp → optimized/workbook/leccion-1/oveja.svg.
3. Page 7, uno: faithful/vocal-u/uno.webp → optimized/workbook/leccion-1/uno.svg.
4. Page 7, oso: faithful/vocal-o/oso.webp → optimized/flipchart-native/p004-oso.png.
5. Page 8, oso: faithful/vocal-o/oso.webp → optimized/flipchart-native/p004-oso.png.

Paths above are relative to `/cartilla/art/`. No other lesson's layout or illustration selection changed. Approved aguja, manzana and p003-scene are inherited unchanged from current main, not reauthored by this PR. No owner-intake originals changed. No Jirafa, Carro or p056 caramelos used in Lesson 3.

## Honest limits

- The existing MASTER-MAPPING was reused. No remapping or new optimization was performed. Page 7 keeps oruga, aro, imán, árbol, elefante, alas, ardilla, ojos, avión and abeja: no certified optimized match selected for those exact placements. Page 8 keeps iglú, alas, aro, abeja and avión for the same reason. Some source files already contain clipped lines/table rules; CSS `contain` cannot reconstruct missing pixels. Aguja uses the newer owner-approved file from #873 despite the older mapping's pending entry.
- `pez.webp` is the established airplane identity under the existing map; no relabeling or filename-based inference was made.
- No vocabulary clip is missing among the 18 picture words. Browser playback is proven; human auditory quality/word-content confirmation and playback on a physical phone/Safari are not independently certified by this run. The separately described 48-recording master set was not used or claimed.
- Updated by the subsequent owner-authorized TTS finish below: all four source instruction regions on pages 7–9 and “Muy bien” now have synthetic Spanish MP3s. The requested 40-line script was not found; 36 additional lines were not invented. Original vocabulary recordings remain unchanged.
- The warm amber wobble/pencil-and-pink-eraser treatment remains a proposal awaiting the owner's decision. Three tries are per incorrect picture; after its third incorrect selection it remains available for audio replay, while other answers remain available and completion is still earned normally.
- Lesson 3 is a vowel lesson; it contains no syllable-reading strip requiring a red vowel inside syllables.
- Page 9 retains the existing trace/write/draw activities. Their full end-to-end completion, drawing restoration, physical-phone gesture behavior, all computed text contrast combinations and the full application regression suite were not verified in this bounded job.

## Preview build checkpoint

The Vercel preview for `d5d2bd9` failed the repository-wide suite (4 failed, 1877 passed, 2 expected-fail). Three failures were caused by this change: two learner-resume tests saw an extra `role="status"`, and one pencil source guard expected the existing `markType={mark}` forwarding form. Both were repaired without changing rendered pixels or the selected mark: the feedback retains `aria-live`, and the Lesson 3 mark is computed before forwarding it. The 13 tests in those two affected test files now pass; TypeScript passes. The existing 33-check visual/audio proof remains applicable to this nonvisual repair.

One unrelated failure remains: `src/lib/__tests__/production-art-audit.test.ts`, “reproduces the committed audit and locks the native evidence schema.” A focused reproduction still fails on the committed artwork fixture (including the #873 p003-scene delta / canonical-mapping metadata). The audit script, fixture and all art bytes are unchanged from baseline `f9645c4`; this job does not repair the centrally owned fixture. The free Render fallback was not created because its tool required explicit workspace confirmation; the later finish request does not require another Render attempt. No green preview exists. No production deploy or merge is authorized/performed.


## Four-step finish — owner-authorized free TTS

The owner's later instruction explicitly authorized free synthetic speech for this Lesson 3 pass, superseding the earlier recorded-only request **for these five files only**. Global `AUDIO_POLICY.allowTts` remains false; existing vocabulary recordings are untouched. This is eSpeak NG 1.51 `es-419`, a male Latin American Spanish formant voice, **not Gretel's human recording or a cloned voice**. No API, account, paid service or app dependency was added. Engine source/license and exact text, order, hashes, settings and durations are in `public/audio/lesson-3-tts/manifest.json`.

1. **BLOCKED:** Current main `b22ac29def997b6958e993d260f6795781fff78d` and PR HEAD have zero diff in `scripts/audit-foreground-art.mjs`, `docs/production-art-classification-audit.json`, `src/lib/__tests__/production-art-audit.test.ts`, and `public/cartilla/art/`. Reused the exact reproduced failure; these shared files are unchanged. Error: `AssertionError: expected { counts: { …(4) }, …(2) } to deeply equal { _canonicalMapping: { …(8) }, …(3) }`, test line **105:25**, `expect(generated).toEqual(committed);`. Full prior reproduction: [tts-baseline-fixture.txt](tts-baseline-fixture.txt). Did not repeat the unchanged expensive full build.
2. **DONE:** Generated `muy-bien.mp3` (1.254 seconds) with free offline Spanish synthesis and wired it only to Lesson 3 non-restored correct/activity-complete events. It waits 2.5 seconds to let the tapped vocabulary finish; another tap/key, page turn, hidden tab or unmount cancels a queued compliment. Muting and shared speech ownership are respected.
3. **BLOCKED on count, four installed:** The authoritative page layouts contain exactly four instruction regions in pages 7–9, not 40 (109 across the whole workbook). Generated in order `p7-instr`, `p8-instr`, `p9-instr1`, `p9-instr2` from exact source text; each has an explicit 104×56px minimum tap/keyboard Escuchar button. No verified 40-line script found. No other lesson instructions generated or wired.
4. **Checks/publish attempted:** TypeScript passes; 15 focused tests pass; production Vite worker-mode bundle passes (existing bundle-size warning only). New real Chromium phone-width run passes **15 checks**. All four instruction files reached actual `playing` and `ended` events; real correct answers on pages 7 and 8 played “Muy bien” to completion. Picture taps interrupted instructions and played original vocabulary. No runtime exceptions. Vercel's existing preview remains `ERROR`, `BUILD_UTILS_SPAWN_1`: `Command "pnpm prebuild && pnpm prepare:art && pnpm verify:assets && pnpm typecheck && pnpm test && vite build" exited with 1`. Automatic Git deployments remain disabled, as configured. No paid or production deployment, no merge.

New screenshots: [page 7](lesson3-tts-after-7.png), [page 8](lesson3-tts-after-8.png), [page 9](lesson3-tts-after-9.png). These supersede the earlier after screenshots for the instruction controls; original before screenshots and the previous silent pencil video remain valid historical proof. New observations: [tts-browser-proof.json](tts-browser-proof.json); checks: [tests](tts-tests.txt), [TypeScript](tts-typecheck.txt), [bundle](tts-build.txt).

**Not proven:** human listening/voice quality and pronunciation acceptance, physical phone/Safari, full page-9 activity completion and its success trigger, or 40-line coverage. Browser evidence proves media playback, not owner approval. Amber feedback remains pending the owner's decision. Need the exact 40-line script/placement if that count is still intended, central fixture repair outside this lane, and owner phone/voice review.
