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
- The 40 spoken instruction lines are not installed. Lesson 3 instruction elements expose stable `data-instruction-audio-key` identifiers and `data-recording-status="pending"`. Feedback exposes a pending recording hook. No synthetic instruction or feedback speech was added. A verified “Muy bien” recording was not found, so the success message/star/chord work but Gretel does not yet speak that phrase.
- The warm amber wobble/pencil-and-pink-eraser treatment remains a proposal awaiting the owner's decision. Three tries are per incorrect picture; after its third incorrect selection it remains available for audio replay, while other answers remain available and completion is still earned normally.
- Lesson 3 is a vowel lesson; it contains no syllable-reading strip requiring a red vowel inside syllables.
- Page 9 retains the existing trace/write/draw activities. Their full end-to-end completion, drawing restoration, physical-phone gesture behavior, all computed text contrast combinations and the full application regression suite were not verified in this bounded job.
