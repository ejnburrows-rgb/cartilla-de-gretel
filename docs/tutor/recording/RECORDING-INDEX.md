# Gretel Tutor — Recording Index (Authoritative Reconciled v2 Manifest)

> **Status policy:** Every line in this index starts with `status: "scripted"` and **no active audio**. Audio is activated only after owner recording, intake alignment/QC, and approval. Never use the rejected 67-clip ZIP (`Gretel_67_Audio_Lecciones_Listo.zip`, `rec_gretel_*`) or `nina-sordita.mp3`.
>
> **Catalog reconciliation:** This index is the **single authoritative recording catalog** reconciling PR #1073 (`1,288` lines), PR #1322 (`1,047` distinct utterances / `1,208` source-linked context mappings) + PR #1323's private intake workflow, and Interactive Conversation Batch `B031` (`50` lines). All `1,208` PR #1322 context mappings (`workbookPage`, `workbookPdfSheet`, `flipchartSheet`, `expectedAnswer`, `commonError`) are preserved in `src/content/tutor-dialogue/`, deduplicated by normalized Spanish text so identical text shares one clip across contexts (**0 duplicate recordings**). See [CATALOG-RECONCILIATION.md](../CATALOG-RECONCILIATION.md), [GRETEL-LINGUISTIC-STANDARD.md](../GRETEL-LINGUISTIC-STANDARD.md), and [PRIORITY-PACKAGE.md](./PRIORITY-PACKAGE.md).
>
> **Curriculum & linguistic fidelity:** Pages 86 and 87 do not exist in the available student workbook scan (`absent-in-source`) and are strictly omitted from Lessons 23 and 24. Legacy `src/content/tutor-lines.json` (43 approved word models + 77 pending lines = 120 intact `lineId`s) remains intact alongside these v2 scripts. Spoken lines follow Gretel's permanent linguistic standard (elegant, natural, grammatically correct Spanish without slang, unnecessary diminutives, or excessive exclamation marks), teach naturally through visible illustrations, letters, syllables, words, and stories without reading sheet or page numbers aloud, and avoid unsupported claims about concentration, pronunciation clarity scoring, or unseen camera vision.

## Start Here — Priority Recording Package

Before recording all 31 batches, start with the **3-batch Priority Recording Package** (`133` lines, ~`15.8` minutes):
1. [`PRIORITY-B001-universal.txt`](./PRIORITY-B001-universal.txt) — Universal Core (`B001`, 36 lines)
2. [`PRIORITY-B002-lesson-01.txt`](./PRIORITY-B002-lesson-01.txt) — Complete Lesson 1: Las hermanitas vocales (`B007`, 47 lines)
3. [`PRIORITY-B003-interactive-conversation.txt`](./PRIORITY-B003-interactive-conversation.txt) — Interactive Conversation & Layout/Camera Coaching (`B031`, 50 lines)

See [PRIORITY-PACKAGE.md](./PRIORITY-PACKAGE.md) for ElevenReader setup and exact manifest ID mapping.

## Summary

- **Total batches:** 31 (`B001`–`B031`)
- **Total unique scripted lines:** 1418 (0 duplicate normalized Spanish texts)
- **Legacy `tutor-lines.json` intact:** 120 (`43` approved + `77` pending)
- **Total merged manifest entries:** 1538
- **Preserved PR #1322 source-linked context mappings:** 1208 (168 shared texts covering 1079 contexts, saving 911 duplicate recordings)
- **Total spoken words:** 20723
- **Estimated studio reading time (~110 wpm + pauses):** ~188.4 minutes
- **Recording script format (`.txt`):** Clean Spanish ONLY — one utterance per line, zero IDs, zero line numbers, zero stage directions.

## Recording Guidelines

1. **Voice & Dialect:** Neutral Latin American Spanish with natural *seseo* (`c` before `e/i` and `z` pronounced as `/s/`) and pure Spanish vowels (`a, e, i, o, u`) without English diphthong glides.
2. **Tone & Pacing:** Warm, cultured, natural teacher voice (~115–125 wpm) following [GRETEL-LINGUISTIC-STANDARD.md](../GRETEL-LINGUISTIC-STANDARD.md). Leave ~500 ms clean silence between lines in continuous takes.
3. **Pronunciation Integrity:** Never splice syllables or read punctuation symbols aloud. Read each line naturally as written.
4. **Private Master Storage:** Raw takes go in `~/GretelVoicePrivate/` (outside git) and pass through `scripts/tutor-intake/` before any manifest update.

## Batches (`B001`–`B031`)

| Batch | Script File | Scope & Focus | Lines | Words | Est. Time | Status |
|---|---|---|---:|---:|---:|---|
| `B001` | [B001-universal.txt](./B001-universal.txt) | Universal Core (Greetings, Praise, Retry, Silence, Closing) | 36 | 426 | ~3.9 min | `scripted` |
| `B002` | [B002-universal-coaching.txt](./B002-universal-coaching.txt) | Universal Coaching & Role Variations | 42 | 507 | ~4.6 min | `scripted` |
| `B003` | [B003-adaptive-coaching.txt](./B003-adaptive-coaching.txt) | Adaptive Coaching, Scaffolding Hints, Clarify & Understanding Checks | 40 | 449 | ~4.1 min | `scripted` |
| `B004` | [B004-pronunciation.txt](./B004-pronunciation.txt) | Pronunciation-Isolated Letter-Name vs Phonetic-Sound | 42 | 573 | ~5.2 min | `scripted` |
| `B005` | [B005-camera-technical.txt](./B005-camera-technical.txt) | Camera, Microphone, Offline, Privacy & Technical Recovery | 42 | 493 | ~4.5 min | `scripted` |
| `B006` | [B006-games-and-workbook.txt](./B006-games-and-workbook.txt) | Workbook Archetypes, Live Games & Interactive Choices | 38 | 437 | ~4.0 min | `scripted` |
| `B007` | [B007-lesson-01.txt](./B007-lesson-01.txt) | Lección 1: Las hermanitas vocales (pp. 1, 2, 3; Láminas 3) | 47 | 680 | ~6.2 min | `scripted` |
| `B008` | [B008-lesson-02.txt](./B008-lesson-02.txt) | Lección 2: Oo (pp. 4, 5, 6; Láminas 4) | 47 | 698 | ~6.3 min | `scripted` |
| `B009` | [B009-lesson-03.txt](./B009-lesson-03.txt) | Lección 3: Aa (pp. 7, 8, 9; Láminas 5) | 47 | 726 | ~6.6 min | `scripted` |
| `B010` | [B010-lesson-04.txt](./B010-lesson-04.txt) | Lección 4: Ee (pp. 10, 11, 12; Láminas 6) | 47 | 679 | ~6.2 min | `scripted` |
| `B011` | [B011-lesson-05.txt](./B011-lesson-05.txt) | Lección 5: Ii (pp. 13, 14, 15; Láminas 7) | 47 | 690 | ~6.3 min | `scripted` |
| `B012` | [B012-lesson-06.txt](./B012-lesson-06.txt) | Lección 6: Uu (pp. 16, 17, 18; Láminas 8) | 47 | 711 | ~6.5 min | `scripted` |
| `B013` | [B013-lesson-07.txt](./B013-lesson-07.txt) | Lección 7: Mm (pp. 19, 20, 21, 22; Láminas 9, 10, 11) | 47 | 697 | ~6.3 min | `scripted` |
| `B014` | [B014-lesson-08.txt](./B014-lesson-08.txt) | Lección 8: Pp (pp. 23, 24, 25, 26; Láminas 12, 13, 14) | 47 | 716 | ~6.5 min | `scripted` |
| `B015` | [B015-lesson-09.txt](./B015-lesson-09.txt) | Lección 9: Ss (pp. 27, 28, 29, 30; Láminas 15, 16, 17) | 47 | 706 | ~6.4 min | `scripted` |
| `B016` | [B016-lesson-10.txt](./B016-lesson-10.txt) | Lección 10: Tt (pp. 31, 32, 33, 34; Láminas 18, 19, 20) | 47 | 721 | ~6.6 min | `scripted` |
| `B017` | [B017-lesson-11.txt](./B017-lesson-11.txt) | Lección 11: Dd (pp. 35, 36, 37, 38; Láminas 21, 22, 23) | 47 | 693 | ~6.3 min | `scripted` |
| `B018` | [B018-lesson-12.txt](./B018-lesson-12.txt) | Lección 12: Ll (pp. 39, 40, 41, 42; Láminas 24, 25, 26) | 47 | 722 | ~6.6 min | `scripted` |
| `B019` | [B019-lesson-13.txt](./B019-lesson-13.txt) | Lección 13: Nn (pp. 43, 44, 45, 46; Láminas 27, 28, 29) | 47 | 712 | ~6.5 min | `scripted` |
| `B020` | [B020-lesson-14.txt](./B020-lesson-14.txt) | Lección 14: Ññ (pp. 47, 48, 49, 50; Láminas 30, 31, 32) | 47 | 757 | ~6.9 min | `scripted` |
| `B021` | [B021-lesson-15.txt](./B021-lesson-15.txt) | Lección 15: Bb (pp. 51, 52, 53, 54; Láminas 33, 34, 35) | 47 | 733 | ~6.7 min | `scripted` |
| `B022` | [B022-lesson-16.txt](./B022-lesson-16.txt) | Lección 16: Vv (pp. 55, 56, 57, 58; Láminas 36, 37, 38) | 47 | 713 | ~6.5 min | `scripted` |
| `B023` | [B023-lesson-17.txt](./B023-lesson-17.txt) | Lección 17: R inicial (pp. 59, 60, 61, 62; Láminas 39, 40, 41) | 47 | 733 | ~6.7 min | `scripted` |
| `B024` | [B024-lesson-18.txt](./B024-lesson-18.txt) | Lección 18: rr (pp. 63, 64, 65, 66; Láminas 42, 43, 44) | 47 | 713 | ~6.5 min | `scripted` |
| `B025` | [B025-lesson-19.txt](./B025-lesson-19.txt) | Lección 19: Gg (pp. 67, 68, 69, 70; Láminas 45, 46, 47) | 47 | 730 | ~6.6 min | `scripted` |
| `B026` | [B026-lesson-20.txt](./B026-lesson-20.txt) | Lección 20: Ff (pp. 71, 72, 73, 74; Láminas 48, 49, 50) | 47 | 724 | ~6.6 min | `scripted` |
| `B027` | [B027-lesson-21.txt](./B027-lesson-21.txt) | Lección 21: Jj (pp. 75, 76, 77, 78; Láminas 51, 52, 53) | 47 | 757 | ~6.9 min | `scripted` |
| `B028` | [B028-lesson-22.txt](./B028-lesson-22.txt) | Lección 22: Cc (pp. 79, 80, 81, 82; Láminas 54, 55, 56) | 47 | 718 | ~6.5 min | `scripted` |
| `B029` | [B029-lesson-23.txt](./B029-lesson-23.txt) | Lección 23: Yy (pp. 83, 84, 85; Láminas 57, 58, 59) | 47 | 749 | ~6.8 min | `scripted` |
| `B030` | [B030-lesson-24.txt](./B030-lesson-24.txt) | Lección 24: Zz (pp. 88, 89, 90; Láminas 60, 61, 62) | 47 | 726 | ~6.6 min | `scripted` |
| `B031` | [B031-interactive-conversation.txt](./B031-interactive-conversation.txt) | Interactive Conversation, Layout Transitions, Flip Chart, Workbook, Honest Camera & Coaching | 50 | 634 | ~5.8 min | `scripted` |

## Machine-Readable Index

- Priority recording guide: [PRIORITY-PACKAGE.md](./PRIORITY-PACKAGE.md)
- Permanent linguistic standard: [GRETEL-LINGUISTIC-STANDARD.md](../GRETEL-LINGUISTIC-STANDARD.md)
- Catalog reconciliation report: [CATALOG-RECONCILIATION.md](../CATALOG-RECONCILIATION.md)
- Full line-by-line metadata: [RECORDING-INDEX.csv](./RECORDING-INDEX.csv)
- JSON manifests: `src/content/tutor-dialogue/universal.json` and `src/content/tutor-dialogue/lesson-01.json`–`lesson-24.json`
- Schema: `src/content/tutor-dialogue/schema.ts`
- Merged loader: `src/lib/tutor-dialogue-manifest.ts`
- Book-fidelity & linguistic validator: `scripts/validate-tutor-book-fidelity.mjs`
- Recording sync tool: `scripts/sync-tutor-recording-batches.mjs`
