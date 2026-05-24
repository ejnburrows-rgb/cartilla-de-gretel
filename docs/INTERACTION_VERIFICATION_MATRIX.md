# Interaction Verification Matrix

Date: 2026-05-23
Repo: `C:\Users\enovo\OneDrive\Desktop\cartilla-de-gretel-live`
Base commit audited: `9414e7a77a001db95e3b5523279edbd724719fd0`

## Classification Rules

- `verified`: backed by current source data and safe to remain in official student interactions.
- `likely but not verified`: present in current data, but missing official page/art mapping evidence.
- `unsafe/unverified`: absent from current source data or explicitly plausible/unverified.
- `should remain`: safe in current role.
- `should be downgraded`: keep only with pending status, not as a verified art-backed activity.
- `should be removed from student activity`: remove until official evidence exists.

## Lesson 9

| Item | Current evidence | Classification | Recommendation |
| --- | --- | --- | --- |
| `es` | `workbook-interactions.json` `l9-p27-sight-words`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` | verified | should remain |
| `de` | `workbook-interactions.json` `l9-p27-sight-words`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` | verified | should remain |
| `un` | `workbook-interactions.json` `l9-p27-sight-words`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` | verified | should remain |
| `esta` | `workbook-interactions.json` `l9-p27-sight-words`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` as accented `esta` in the file encoding | verified | should remain |
| `en` | `workbook-interactions.json` `l9-p27-sight-words`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` | verified | should remain |
| `la` | `workbook-interactions.json` `l9-p27-sight-words`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` | verified | should remain |
| `el` | `workbook-interactions.json` `l9-p27-sight-words`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` | verified | should remain |
| `sa` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `se` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `si` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `so` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `su` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `sopa` | `workbook-interactions.json` `l9-p28-word-reveal`; `sourceStatus: needs-art-mapping`; `transcriptionStatus: verified`; no `assetRef`; no verified coordinates | likely but not verified as art | should be downgraded until art mapped |
| `silla` | `workbook-interactions.json` `l9-p28-word-reveal`; `sourceStatus: needs-art-mapping`; `transcriptionStatus: verified`; no `assetRef`; no verified coordinates | likely but not verified as art | should be downgraded until art mapped |
| `sol` | `workbook-interactions.json` `l9-p28-word-reveal`; `sourceStatus: needs-art-mapping`; `transcriptionStatus: verified`; no `assetRef`; no verified coordinates | likely but not verified as art | should be downgraded until art mapped |
| `saco` | Was present only in removed `l9-p29-tap-obj`; teacher notes said plausible/not verified; not found in Lesson 9 examples | unsafe/unverified | removed from student activity |
| `seta` | Was present only in removed `l9-p29-tap-obj`; teacher notes said plausible/not verified; not found in Lesson 9 examples | unsafe/unverified | removed from student activity |
| `seis` | Was present only in removed `l9-p29-tap-obj`; teacher notes said plausible/not verified; not found in Lesson 9 examples | unsafe/unverified | removed from student activity |

## Lesson 17

| Item | Current evidence | Classification | Recommendation |
| --- | --- | --- | --- |
| `bien` | `workbook-interactions.json` `l17-p59-sight-word-bien`; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/data/lessons.json` | verified | should remain |
| `ra` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `re` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `ri` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `ro` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `ru` | `workbook-interactions.json` syllable/read-aloud records; `sourceStatus: book-derived`; `transcriptionStatus: verified`; also in `src/content/consonants.json` | verified as syllable text | should remain |
| `rama` | `workbook-interactions.json` `l17-p61-word-reveal-r`; `sourceStatus: needs-art-mapping`; `transcriptionStatus: verified`; no `assetRef`; no verified coordinates | likely but not verified as art | should be downgraded until art mapped |
| `rana` | `workbook-interactions.json` `l17-p61-word-reveal-r`; `sourceStatus: needs-art-mapping`; `transcriptionStatus: verified`; no `assetRef`; no verified coordinates | likely but not verified as art | should be downgraded until art mapped |
| `rosa` | `workbook-interactions.json` `l17-p61-word-reveal-r`; `sourceStatus: needs-art-mapping`; `transcriptionStatus: verified`; no `assetRef`; no verified coordinates | likely but not verified as art | should be downgraded until art mapped |

## Student-Facing Safety Decision

Current safe student-facing official items are the `book-derived` sight-word, syllable, and read-aloud interactions, plus art-pending word-reveal items that clearly state image mapping is pending. No audited object/image interaction has verified official art or verified hotspot coordinates.

The removed `saco/seta/seis` interaction should not be reintroduced until the official workbook page scan verifies those exact words/objects.
