# Illustration status — focused authentic-art repair

**Current source of truth:** `docs/AUTHENTIC-FLIPCHART-ART-AUDIT.md`

No cell in the focused seven-drawing audit remains blank.

| Drawing | Student pages | Final source | Status |
|---|---|---|---|
| aro | 1, 7, 8 | authentic teacher page 5 crop | wired |
| iglú | 4, 5, 8, 10, 13, 14 | authentic teacher page 7 crop | wired |
| abrigo | 1, 11 | exact workbook crop | wired |
| globo | 2 | exact workbook crop | wired |
| abeja | 1, 7, 8, 10, 11, 14, 16 | exact workbook crop | wired |
| oruga | 7 | exact workbook crop | wired |
| aguja | 7, 8, 10 | exact workbook crop | wired |

The complete 62-page teacher flip chart does not contain the last five exact
student-book drawings. They are not “missing source”; they are student-book-only
distractors. Do not restart generated-art, recoloring, or look-alike work.

Older unresolved lists below this point were removed because they caused agents
to repeat a completed audit.

## Lessons 1–5 restoration gate

Lessons 1–5 use the already-audited authentic sources above. This review batch
adds no art, no generated alternatives, and no new illustration status entries.
The next work begins only after the owner visually approves this batch.

## 2026-08-09 display correction

The Lesson 1 `traje` slot reuses the existing mapped authentic `uniforme` asset. This was a source-wiring and presentation fix only: no new artwork was made, and unverified answer-key metadata no longer applies grayscale or opacity to any original illustration.


## 2026-09-08 — Existing-source illustration repair

- Repaired 44 existing runtime crops and added a page-specific single-eye crop: 24 teacher-color crops and 21 exact student-workbook crops.
- Reviewed all 62 teacher pages. The 21 workbook-only drawings have no identical teacher counterpart; differently drawn cars, airplanes and houses were rejected. Search records and source hashes are in `docs/source-art-repair-2026-09-08.json`.
- The complete Lessons 1–5 art check passes: 53 images, 27 authentic teacher-color matches, 26 verified workbook-only crops, zero unresolved failures. The first 44 new crops also passed exact source-pixel comparisons; 20 deliberately altered workbook copies were rejected by the strengthened source check.
- Physical page 1 now uses its exact single-eye drawing, while later pages retain their pair of eyes.
- Corrected the final cell of physical workbook page 7 from an extra hoop to the original bear, including its non-A answer classification.
- The existing build checks now share the verified workbook-crop evidence instead of recognizing only the five older, date-specific records. No color threshold was relaxed.
- Changes are being saved on the existing Lessons 1–5 release branch. Preview build and browser review are pending at this checkpoint; production is not claimed updated.
