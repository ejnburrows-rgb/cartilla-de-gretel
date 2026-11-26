# Gretel Tutor — Reconciled Priority Recording Package

> **Purpose:** Start small and verify end-to-end before recording all 30 batches (`1,368` lines).
> Record **just these 2 priority scripts (`83` lines, ~`10.3` minutes)** first: universal core dialogue + ONE complete representative lesson (Lesson 1: *Las hermanitas vocales*). Once you hear Gretel speak Lesson 1 end-to-end and approve the voice, pacing, and intake alignment, proceed to the remaining 28 batches (`B002`–`B006` and `B008`–`B030`).

---

## What Is in the Priority Package

| Priority Script | Canonical Batch | Manifest File | Lines | Words | Est. Time (~110 wpm) | Manifest IDs in `RECORDING-INDEX.csv` |
|---|---|---|---:|---:|---:|---|
| [`PRIORITY-B001-universal.txt`](./PRIORITY-B001-universal.txt) | `B001` (`B001-universal.txt`) | `src/content/tutor-dialogue/universal.json` | 36 | 436 | ~4.0 min | `v2-b001-greet-first-01` … `v2-b001-closing-04` (`B001-001.mp3`–`B001-036.mp3`) |
| [`PRIORITY-B002-lesson-01.txt`](./PRIORITY-B002-lesson-01.txt) | `B007` (`B007-lesson-01.txt`) | `src/content/tutor-dialogue/lesson-01.json` | 47 | 695 | ~6.3 min | `v2-l01-01-greeting-first` … `v2-l01-47-atlas-workbook` (`B007-001.mp3`–`B007-047.mp3`) |
| **Total Priority Package** | **2 batches** | **Universal + Lesson 1** | **83** | **1,131** | **~10.3 min** | Exact 1-to-1 match with [`RECORDING-INDEX.csv`](./RECORDING-INDEX.csv) |

### Why These Two Batches First?
1. **`PRIORITY-B001-universal.txt` (36 lines):** Covers every core conversational beat Gretel uses across all 24 lessons — greetings, praise, gentle retry, close-miss coaching, silence nudges, and closings.
2. **`PRIORITY-B002-lesson-01.txt` (47 lines):** Covers one complete lesson from opening greeting through flipchart poem (*Las hermanitas vocales*, Lámina 3), distinct letter-name vs. phonetic-sound models, 3-level progressive hints, workbook guidance (pp. 1–3, PDF sheets 7–9), games, assessment, and PR #1322's verified flipchart comprehension + workbook onset checks.
3. **Zero Duplicate Recordings:** Every utterance in the reconciled catalog is deduplicated by normalized Spanish text (`0` duplicates across all `1,368` lines). Identical wording shares a single clip across contexts via `sourceContexts`.
4. **Strict Book & Audio Safety:**
   - All `1,368` lines start at `status: "scripted"` with **zero active audio** until you record, review, and approve them.
   - All `43` owner-approved word models in `src/content/tutor-lines.json` remain intact and playable alongside `77` pending legacy IDs (`120` legacy `lineId`s preserved unchanged).
   - Zero references to absent Workbook pages 86–87, zero quarantined audio (`nina-sordita.mp3`, `rec_gretel_*`, 67-clip ZIP), and zero invented book sentences.

---

## Step-by-Step Recording Workflow (ElevenReader / Studio Take)

1. **Open the clean Spanish-only script:**
   - Start with [`PRIORITY-B001-universal.txt`](./PRIORITY-B001-universal.txt) (36 lines).
   - Next, record [`PRIORITY-B002-lesson-01.txt`](./PRIORITY-B002-lesson-01.txt) (47 lines).
   - Both files contain **clean Spanish ONLY** — one utterance per line, zero IDs, zero line numbers, zero stage directions, ready to paste directly into ElevenReader or read in a continuous studio take.
2. **Voice & pacing guidelines:**
   - Neutral Latin American Spanish with natural *seseo* (`c` before `e/i` and `z` pronounced as `/s/`) and pure Spanish vowels (`a, e, i, o, u`).
   - Warm, patient, encouraging tone (~115–125 wpm). Leave ~500 ms clean silence between lines.
   - Read naturally as written — never splice syllables or read punctuation symbols aloud.
3. **Save raw takes outside Git:**
   - Save raw audio masters in your private local vault (`~/GretelVoicePrivate/` — never commit raw masters or private recordings into Git).
4. **Run local intake alignment & QC before approving:**
   - Align against [`RECORDING-INDEX.csv`](./RECORDING-INDEX.csv) using the local intake pipeline (`scripts/tutor-intake/`).
   - Review extracted clips for timing, clipping, and pronunciation accuracy. Only owner-approved clips move from `status: "scripted"` to `status: "approved"`.
5. **Continue to full 30-batch library when satisfied:**
   - Because `PRIORITY-B001-universal.txt` = `B001-universal.txt` and `PRIORITY-B002-lesson-01.txt` = `B007-lesson-01.txt` line-for-line, you will **never re-record** these 83 lines when completing the remaining 28 batches (`B002`–`B006`, `B008`–`B030`) listed in [`RECORDING-INDEX.md`](./RECORDING-INDEX.md).

---

## Related References

- Full 30-batch recording index: [`RECORDING-INDEX.md`](./RECORDING-INDEX.md)
- Machine-readable line & ID index: [`RECORDING-INDEX.csv`](./RECORDING-INDEX.csv)
- Reconciliation report (PR #1073 + PR #1322 + PR #1323): [`../CATALOG-RECONCILIATION.md`](../CATALOG-RECONCILIATION.md)
