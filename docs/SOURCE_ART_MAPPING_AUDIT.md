# Source Art Mapping Audit

Date: 2026-05-23
Repo: `C:\Users\enovo\OneDrive\Desktop\cartilla-de-gretel-live`
Base commit audited: `9414e7a77a001db95e3b5523279edbd724719fd0`

## Summary

The live repo is closer to an exact workbook replica than the stale local checkout: it has the official PDF, a source-art inventory, workbook interaction data, and an interactive workbook layer. It is still not an exact digital replica because no object-level source-art mappings or verified hotspot coordinates exist yet. The current interaction layer correctly marks art-dependent activities as pending, with one unsafe plausible interaction removed during this audit.

## 1. Official Source Assets That Exist

Present in `public/book`:

- `public/book/book.pdf` (47,994,539 bytes)
- `public/book/version.txt`

Present in `public/cartilla/images`:

- `cover.png`
- `vowel-a.svg`
- `vowel-e.svg`
- `vowel-i.svg`
- `vowel-o.svg`
- `vowel-u.svg`

Present in `public/cartilla/images/original`:

- `cover.jpg`
- `student-book.jpg`
- `flipchart.jpg`
- `syllabic-charts.jpg`
- `homework.jpg`
- `evaluations.jpg`

Present source data:

- `src/data/source-art-inventory.json`
- `src/data/workbook-interactions.json`
- `src/lib/workbook-interactions.ts`

Important gap: `src/lib/workbook-source.ts` still hard-codes `getWorkbookPdfStatus().isPresentInRepo` to `false`, even though `public/book/book.pdf` exists.

## 2. Gretel / Source Art Exists?

Partial.

- General official kit/source assets exist.
- `source-art-inventory.json` marks the cover, student book, syllabic chart, teacher materials, and `/book/book.pdf` as present.
- `BookReader.tsx` uses the cover image with `alt="Gretel"`, but there is no verified standalone Gretel character crop.
- `GretelFeedback.tsx` still states its avatar is a placeholder to be swapped with original drawings.

There is no verified Gretel source-art cutout or object-level Gretel mapping.

## 3. Original Images Wired Into Drag/Drop Reveals?

Not yet.

- `DragWordReveal.tsx` supports `interaction.assetRef`.
- `workbook-interactions.json` currently has no `assetRef` on the audited drag-word interactions.
- `source-art-inventory.json` has `"activityAssetMappings": []`.
- `source-art-inventory.json` explicitly says no original image is mapped to any drag/drop or tap-object activity.

Result: drag/drop reveals words and pending-source status, not real source art.

## 4. Current Drag/Drop: Real Art Or Placeholders?

For the official interaction layer, current drag/drop is a safe pending placeholder when art is required.

- Lesson 9 `sopa/silla/sol`: `sourceStatus: "needs-art-mapping"`; no verified coordinates; no `assetRef`.
- Lesson 17 `rama/rana/rosa`: `sourceStatus: "needs-art-mapping"`; no verified coordinates; no `assetRef`.
- `DragWordReveal.tsx` shows the word label plus "Imagen pendiente de mapeo del libro" when no `assetRef` exists.

Legacy/non-official practice still exists:

- `DragBuildWord.tsx` contains generated target words and distractors.
- `Ejercicios.tsx` and vowel lesson paths still use emoji matching.

## 5. Page-Turn Behavior Exists?

Yes.

`OfficialWorkbookLessonView.tsx` contains page chips, previous/next buttons, and Framer Motion page transition variants. It also accepts `belowPage` for the interactive layer. This file was inspected but not modified.

## 6. Emoji / Fake Art Exists?

Yes, outside the official source-art interaction layer.

Examples:

- `src/content/lessons.json` uses emoji for vowel vocabulary.
- `src/routes/cartilla/leccion.$n.tsx` hard-codes intro emoji words.
- `src/components/cartilla/Ejercicios.tsx` contains emoji word matching.
- `src/lib/badges.ts` and `src/lib/profile.ts` use emoji for UI/profile affordances.

These are not valid substitutes for official workbook art. They should stay out of exact-replica activities unless explicitly labeled supplemental practice.

## 7. Invented Text Exists?

Yes, mostly in supplemental/non-source lesson content.

Examples:

- `src/content/lessons.json` contains invented vowel character descriptions.
- `src/content/consonants.json` contains example words and sentences without page-level source citations.
- `src/routes/cartilla/leccion.$n.tsx` contains explanatory practice copy and answer-key prompts.
- `DragBuildWord.tsx` contains generated word targets and distractors.

The official interaction layer is better controlled because it records `sourceStatus`, `transcriptionStatus`, `studentFacingStatus`, and teacher notes. During this audit, the unverified `saco/seta/seis` tap-object placeholder was removed from `workbook-interactions.json` so those plausible words are no longer rendered as a student activity.

No `La Rana Rosa` string was found in the inspected source paths.

## 8. Safe Interaction Items

Safe as official interaction text:

- Lesson 9 sight words: `es`, `de`, `un`, `esta`, `en`, `la`, `el`
- Lesson 9 syllables: `sa`, `se`, `si`, `so`, `su`
- Lesson 17 sight word: `bien`
- Lesson 17 syllables: `ra`, `re`, `ri`, `ro`, `ru`

Safe as word labels only, but art pending:

- Lesson 9: `sopa`, `silla`, `sol`
- Lesson 17: `rama`, `rana`, `rosa`

Reason: these word labels are present in current source data and tracked in `workbook-interactions.json`, but they are not art-mapped.

## 9. Items Requiring Verification

Require official page/object verification before use as art-backed activities:

- `sopa`, `silla`, `sol`
- `rama`, `rana`, `rosa`

Removed from student activity pending verification:

- `saco`
- `seta`
- `seis`

Reason: these were explicitly marked plausible/unverified in teacher notes and were not found in `src/content/consonants.json` for Lesson 9.

## 10. Exact Next Coding Tasks

1. Update `src/lib/workbook-source.ts` so `getWorkbookPdfStatus()` reflects that `public/book/book.pdf` is present, or generate that status from a build-time manifest.
2. Add page-level rendered image refs or PDF page evidence into `src/data/lessons.json` instead of leaving `sourcePages`, `originalImages`, and `remasteredImages` empty.
3. Create object-level records in `src/data/source-art-inventory.json` for each verified crop/hotspot, including page number, item label, asset path, reviewer, and verification date.
4. Add `assetRef` only to interactions with verified source-art crops.
5. Add hotspot coordinates only when measured from the official page scan; keep `coordinatesVerified: false` until then.
6. Keep `saco`, `seta`, and `seis` out of `workbook-interactions.json` until official source evidence exists.
7. Add a schema/test that fails when `sourceStatus: "verified"` has no verified coordinates or source asset where the activity requires art.
8. Add a schema/test that fails when `sourceStatus: "needs-transcription"` interactions contain student-facing invented labels.
9. Move emoji-based practice into a clearly supplemental mode, or gate it away from exact-replica lesson surfaces.
10. Replace placeholder Gretel feedback art with verified original artwork only after source-art inventory records exist.
