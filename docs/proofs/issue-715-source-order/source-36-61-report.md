# Issue #715 — source fidelity, native indexes36–61

Reviewed exact main `64666e84aa5e3e080de1fde6c1366f1f30b8aa50`. READ-ONLY; specialist changed no repository files, wrote no Notion/GitHub content, used no external/paid provider, and deployed nothing.

## Outcome

**Verified:** all26 actual source scans were inspected. All9 drill sheets have the source syllable order in both the legacy native model and the active replica model. All9 vocabulary sheets retain source3+2 label arrangement; all9 drill sheets retain source3×5 word columns and passage-below arrangement. No word or syllable swap found. Source wording has two literal discrepancies, plus one stanza-position gap and one typographic normalization. This is not an all-sheet real-browser fidelity clearance.

## Mapping

The lower-right printed number is scan/native index−2 on every inspected sheet. Thus native36–61 means printed34–59. Examples: native36=printed34(Vv vocabulary), native38=printed36(Mi bote de vela), native60=printed58(Zz vocabulary), native61=printed59(Zz drill). The supplied source scans establish this mapping. PDF was not separately downloaded, so PDF byte-page numbering is not independently certified. Printed60 is native62(outside assigned range); the source book has60 instructional printed sheets, not a printed61.

## New findings

1. **Native47 / printed45 — stanza position gap, not order failure.** Actual source visibly separates the second stanza after `y la engatusó.`. Source-layer Y spacing87.70 vs regular66.16(1.326×). Active replica baseline spacing is66.15 for both, collapsing the source stanza gap. `evenLines` in `src/lib/flipchart-replica.ts:182–198` splits stanzas only beyond1.45×median pitch. Fresh real-app screenshot confirms the collapsed gap; all8 verse lines remain in the correct order.
2. **Native44 / printed42 — separate text-source finding.** Printed final line is `arrebatado.`; JSON and both current models render `arrebatado`. Enlarged source crop and real-app screenshot confirm. Existing native coverage test line92 explicitly expects the missing-period version.
3. **Native60 / printed58 — separate exact-source editorial finding.** Source picture label is `zepelin` (plaini); current digital text is `zepelín`. Native61 / printed59 DOES print `zepelín`. Do not apply a blanket accent removal. Source crop and actual app prove the distinction.
4. **Native50 / printed48 — typographic normalization only.** Printed three dots become U+2026 ellipsis in the four short `Fu/fa/fe/fi` lines. Wording, line order and positions remain. Not a syllable/word-position failure.

**Preserve:** source52 / printed50 actually prints `le espuma de jabón.`; do not “correct” this to`la` while claiming exact-source fidelity. Source55 similarly prints `El vive` without an accent. No teacher-content editing inferred from grammar.

## Smallest safe proposal

- **Do not change the native row-grouping algorithm again.** #734 already supplies the expected order; tests should lock the9 inspected drill sequences on37/40/43/46/49/52/55/58/61, in both native and replica models. Include the3-syllable exceptions46/55 rather than assuming5 everywhere.
- For the observed position defect47, make `evenLines` accept a source-confirmed stanza boundary for that page only, before `–Gatita gordita`, preserving its original second-stanza first baseline. Do not globally lower1.45 or re-space unrelated pages. Regression: sheet47 stanza gap must remain~87.70 source units/>1.2×regular pitch, while first-stanza/second-stanza line spacing stays~66.15 and text order unchanged. Add representative unchanged stanza checks38/44/53/59. The active renderer is`FlipchartReplicaSheet`, so a fix only in`flipchart-native.ts` cannot fix this visible gap.
- If controller includes literal text repairs in authorized scope, smallest edits are the single data token44(`arrebatado`→`arrebatado.`) and its matching test; treat60 accent discrepancy separately against any approved editorial evidence. Preserve all other text, art, page transitions, projector styling and approved behavior.
- Recheck only the affected app pages at1920×1080 after a patch. No full artwork sweep, no unrelated redesign, and no paid/provider dispatch.

## Per-sheet source/model checks

| Native / printed | Type and source syllable order                 | Result / gap                                                                                     |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 36 / 34          | Vocabulary: va ve vi vo vu                     | Verified source/model sequence and structural word positions                                     |
| 37 / 35          | Drill: va ve vi vo vu vu vo va ve vi           | Verified source/model sequence and structural word positions                                     |
| 38 / 36          | Reading: source line order retained            | Verified source/model sequence and structural word positions                                     |
| 39 / 37          | Vocabulary: ra re ri ro ru                     | Verified source/model sequence and structural word positions                                     |
| 40 / 38          | Drill: ra re ri ro ru ru ro ra re ri           | Verified source/model sequence and structural word positions                                     |
| 41 / 39          | Reading: source line order retained            | Verified source/model sequence and structural word positions                                     |
| 42 / 40          | Vocabulary: rra rre rri rro rru                | Verified source/model sequence and structural word positions                                     |
| 43 / 41          | Drill: rra rre rri rro rru rru rro rra rre rri | Verified source/model sequence and structural word positions                                     |
| 44 / 42          | Reading: source line order retained            | source final period missing in data and both models; scoped browser capture verified observation |
| 45 / 43          | Vocabulary: ga go gu                           | Verified source/model sequence and structural word positions                                     |
| 46 / 44          | Drill: ga go gu gu go ga                       | Verified source/model sequence and structural word positions                                     |
| 47 / 45          | Reading: source line order retained            | source stanza separation flattened by evenLines; scoped browser capture verified observation     |
| 48 / 46          | Vocabulary: fa fe fi fo fu                     | Verified source/model sequence and structural word positions                                     |
| 49 / 47          | Drill: fa fe fi fo fu fu fo fa fe fi           | Verified source/model sequence and structural word positions                                     |
| 50 / 48          | Reading: source line order retained            | printed three dots represented by typographic ellipsis; wording/sequence preserved               |
| 51 / 49          | Vocabulary: ja je ji jo ju                     | Verified source/model sequence and structural word positions                                     |
| 52 / 50          | Drill: ja je ji jo ju ju jo ja je ji           | Verified source/model sequence and structural word positions                                     |
| 53 / 51          | Reading: source line order retained            | Verified source/model sequence and structural word positions                                     |
| 54 / 52          | Vocabulary: ca co cu                           | Verified source/model sequence and structural word positions                                     |
| 55 / 53          | Drill: ca co cu cu co ca                       | Verified source/model sequence and structural word positions                                     |
| 56 / 54          | Reading: source line order retained            | Verified source/model sequence and structural word positions                                     |
| 57 / 55          | Vocabulary: ya ye yi yo yu                     | Verified source/model sequence and structural word positions                                     |
| 58 / 56          | Drill: ya ye yi yo yu yu yo ya ye yi           | Verified source/model sequence and structural word positions                                     |
| 59 / 57          | Reading: source line order retained            | Verified source/model sequence and structural word positions                                     |
| 60 / 58          | Vocabulary: za ze zi zo zu                     | label text mismatch; scoped browser capture verified observation                                 |
| 61 / 59          | Drill: za ze zi zo zu zu zo za ze zi           | Verified source/model sequence and structural word positions                                     |

## Evidence files

- `raw-evidence.json`:26 records with actual source image SHA-256, printed mapping, source-checked words/reading lines, both model syllables, raw text items, active replica positions and gaps.
- `source-fixture.json`:concise source assertions for focused tests, grounded in inspected source images.
- `models.json`:unaltered model output from exact main code (only import plumbing changed in artifact copies).
- `source-36-39.jpg` through`source-60-61.jpg`:seven actual-source contact sheets.
- `crop-44.jpg`,`crop-47.jpg`,`crop-52.jpg`,`crop-60.jpg`:enlarged decisive source details.
- `runtime-44-1920x1080.png`,`runtime-47-1920x1080.png`,`runtime-60-1920x1080.png`;`browser-evidence.json`:three fresh real-app screenshots and DOM evidence.
- `browser-check.mjs`,`dump.mts`,`make-evidence.py`,`finish-report.py`:reproducible inspection/evidence scripts; they do not edit checkout.

Controller owns durable #715 GitHub checkpoint and any implementation. No claim that all26 sheets are browser-certified or that any fix was made.
