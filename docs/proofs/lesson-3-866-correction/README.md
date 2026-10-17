# PR 866 — owner-requested correction

Scope: Lesson 3 only, printed pages 7–9. Current draft runtime source `0704c041da6e237dfaf5988b0f5e22353ea0474b`; hosted runtime `1997d2aacc8801ad2ed10f0f2c29c65914465747` has identical application/configuration/assets Git trees. No merge, production deploy, payment, or changes to the three prohibited shared files.

## Preview access

Vercel project authentication protection was explicitly disabled for this preview task. The original preview and the first updated preview were anonymously fetched as HTTP 200 without a login redirect. The final preview includes the recorded-word playback correction described below.

## Artwork

Inspected all 69 originals from the owner-intake manifest and the existing MASTER-MAPPING.csv. The CSV contains older faithful/optimized candidates outside the requested 69-original set; several explicitly report incomplete, clipped, different, or unselected artwork. They are not substitutes for this request. In the 69 originals the matching standalone needle exists; no matching standalone originals for the other 17 words were found. Composite illustrations containing bees, trees, or characters are different drawings and were not cropped or substituted.

The complete brown needle/thread original is used byte-for-byte on both pages. The blue needle/thread transfer variant is distinct and unused. No new/generated/recolored images. Missing slots retain the activity word and explicitly show MISSING. Their answer keys and progress storage remain unchanged. Page 9 has no activity pictures.

| Word | Pages | File used | Original source |
|---|---|---|---|
| abanico | 7 | MISSING | No matching standalone original found in the 69 |
| oruga | 7 | MISSING | No matching standalone original found in the 69 |
| aro | 7, 8 | MISSING | No matching standalone original found in the 69 |
| imán | 7 | MISSING | No matching standalone original found in the 69 |
| oveja | 7 | MISSING | No matching standalone original found in the 69 |
| abeja | 7, 8 | MISSING | No matching standalone original found in the 69 |
| árbol | 7 | MISSING | No matching standalone original found in the 69 |
| elefante | 7 | MISSING | No matching standalone original found in the 69 |
| uno | 7 | MISSING | No matching standalone original found in the 69 |
| alas | 7, 8 | MISSING | No matching standalone original found in the 69 |
| estrella | 7 | MISSING | No matching standalone original found in the 69 |
| ardilla | 7 | MISSING | No matching standalone original found in the 69 |
| ojos | 7 | MISSING | No matching standalone original found in the 69 |
| avión | 7, 8 | MISSING | No matching standalone original found in the 69 |
| aguja | 7, 8 | `cartilla/art/owner-intake/2026-10-14/originals/primary/1fL90gBqcHNP1todBSQCr0WaHzT4B04ka.png` | Same unmodified original; SHA256 `4ba149ff3aafb06091ad14fd55d02cf525744ae27cb054da62ddd2943e935a31` |
| oso | 7, 8 | MISSING | No matching standalone original found in the 69 |
| iglú | 8 | MISSING | No matching standalone original found in the 69 |
| maíz | 8 | MISSING | No matching standalone original found in the 69 |

## Voice

Replaced all five eSpeak MP3s with free Microsoft Edge Read Aloud `es-MX-DaliaNeural`, rate -10%. No key, paid API, subscription, cloning, or browser speech fallback. The repo has vocabulary recordings but no installed owner master or verified exact printed instruction recordings. Printed text remains byte-for-byte unchanged. Only spoken letter pairs expand to “A mayúscula, a minúscula”. Human listening/pronunciation acceptance is not claimed.

| Page | Printed line | Spoken line | File |
|---|---|---|---|
| 7–9 feedback | Muy bien. | Muy bien. | `/audio/lesson-3-tts/muy-bien.mp3` |
| 7 | Marca con una x los dibujos de las palabras que comienzan con A a. | Marca con una x los dibujos de las palabras que comienzan con A mayúscula, a minúscula. | `/audio/lesson-3-tts/p7-instr.mp3` |
| 8 | Traza una línea desde la vocal Aa hasta el dibujo de la palabra que comienza con Aa. | Traza una línea desde la vocal A mayúscula, a minúscula hasta el dibujo de la palabra que comienza con A mayúscula, a minúscula. | `/audio/lesson-3-tts/p8-instr.mp3` |
| 9 | Escribe con tu mejor letra. | Escribe con tu mejor letra. | `/audio/lesson-3-tts/p9-instr1.mp3` |
| 9 | Haz un dibujo que represente una palabra que comienza con a. | Haz un dibujo que represente una palabra que comienza con a. | `/audio/lesson-3-tts/p9-instr2.mp3` |

## Verification

24 focused tests passed: audio lifecycle/mute, Lesson 3 retry, pencil connector and saved progress. TypeScript passed. Runtime/screenshot results and deployment receipt are recorded beside this file. Full suite is not claimed green; authorized preview build skips the known central artwork fixture mismatch. Before/after captures use actual app at 390×844, reduced motion. Shared fixture, lesson-meta.ts and consonants.json remain unchanged.

Current-source validation uses f5610b8bf515f374000066e4d049fb5f6a40b316. The initial local build log and initial before screenshots came from the equivalent local implementation before the concurrent source update; final hosted proof is authoritative for current source.

Current source passes all 16 browser checks, all 24 focused tests, and TypeScript. Initial preview URL: https://cartilla-de-gretel-5p9fza1ex-ejn.vercel.app/cartilla/leccion/3 . Deployment ID dpl_9SdtZsG3khkV2VcRg1kwbWhgUwqW.

Initial hosted verification: all 16 checks passed at 390×844 on the READY public preview. All four instructions and the correct-answer Muy bien reached ended events, keyboard activation worked, and zero runtime exceptions occurred. Anonymous app GET returned HTTP 200, no login redirect, and all five deployed audio hashes exactly matched current source. See live-browser.json, live-7/8/9.png, public-fetch.json, current-audio-hashes.json, and deployment.json. No physical phone/Safari or subjective listening acceptance is claimed.


## Final continuation

The only subsequent runtime delta is a 12-line Lesson 3 correction preserving approved recorded word playback when originals-only artwork uses a new image path or MISSING label. All other lessons retain their existing behavior. Draft source `0704c041da6e237dfaf5988b0f5e22353ea0474b` and deployed runtime `1997d2aacc8801ad2ed10f0f2c29c65914465747` have identical non-document Git trees. Existing artwork, printed text, voice MP3s and screenshots are unchanged and reused; no merge or production release.

Final revision: TypeScript passed; five focused audio/retry tests passed. Local Chromium at 390px verified complete recorded-word playback by keyboard for aguja plus oruga on page 7 and aguja plus oso on page 8. The wider earlier book-fidelity test is not green: `src/lib/__tests__/book-fidelity-lessons-01-07.test.ts:96`, `abanico art: expected '' to be truthy`. That test requires every drawing, so it cannot pass while the explicitly authorized MISSING cells exist. It was not weakened or skipped in the normal build. The prior shared fixture mismatch also remains outside this lane.

Final public preview: https://cartilla-de-gretel-g6twrbg6z-ejn.vercel.app/cartilla/leccion/3 . Vercel deployment `dpl_JDhygAYwNVq4t6Bp2nafc2Bd37nh` completed. Anonymous GET returned Spanish app HTML, HTTP 200, identical final URL and no login redirect. All five deployed MP3 hashes match the current manifest. Four final hosted keyboard checks confirm recorded aguja/oruga playback on page 7 and aguja/oso playback on page 8. See `public-fetch-final.json` and `final-word-playback.json`.

The 18-check instruction/artwork browser proof is in `instruction-browser-18-checks.json`; screenshots and instruction/success playback are reused from unchanged f5610b8 visuals/audio. `final-focused-tests.txt` and `final-typecheck.txt` cover the 12-line correction. Remaining artwork limitation: 17 unique words / 22 placements are MISSING; only aguja has a matching standalone supplied original (two placements). No substitute drawings, scans or older variants are rendered.
