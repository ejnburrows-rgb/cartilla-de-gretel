# Teacher's Guide Scan Inventory (Exhaustive & Evidenced)

This document details the exhaustive search for scans, PDFs, or images of "La cartilla de Gretel: Guía del profesor" pages 59-90.

## Folders Checked

1. **`public/cartilla/images/teacher-flipchart/**` and `public/cartilla/art/hd/flipchart/**` (and raw)**
   - **What it actually contains**: Scans of the **FLIP CHART**. Includes images named `teacher-page-01.jpg` through `teacher-page-62.jpg` (along with remastered `v2` versions).
   - **Verdict**: This is the flip chart, not the Teacher's Guide booklet.

2. **`public/cartilla/art/hd/evals/**` (and raw)**
   - **What it actually contains**: Empty or containing only resources related to the student **EVALUATIONS**.
   - **Verdict**: Does not contain the Teacher's Guide.

3. **`public/cartilla/art/hd/workbook/**` (and raw)**
   - **What it actually contains**: Scans of the student workbook. Includes images named `page-001.png` to `page-092.png`.
   - **Verdict**: This is the student workbook, not the Teacher's Guide.

4. **`public/cartilla/images/source/**`**
   - **What it actually contains**: 99 individual files (verified via recursive search) organized by letter/sound (`a`, `b`, `c`, `m`, `vocales`, etc.) containing individual cropped image assets (`*-page-*.jpg`/`.png`) for interactive activities, plus a single `tmp-29.jpg`.
   - **Verdict**: Does not contain the Teacher's Guide.

## Repo-Wide and Git History Checks

5. **`find . -iname '*.pdf'` (Anywhere in repo)**
   - **What it actually contains**: Found only `example.pdf` inside `node_modules/`.
   - **Verdict**: No Teacher's Guide PDF currently exists anywhere on disk.

6. **`git log --all` for `*.pdf`, `*.zip`, and image extensions with keywords (`guia`, `guide`, `profesor`, `teacher`)**
   - **What it actually contains**: The history reveals commits adding `public/book/book.pdf` (the student workbook) and `public/book/flipchart-source/*.pdf`. The only files matching `teacher` are the flip chart JPGs.
   - **Verdict**: No Teacher's Guide PDF or image was ever committed and subsequently removed.

## The Definitive Proof: Commit `d9703bfd`

The text `AWAITING-SOURCE-SCAN` mentioned in the task prompt does not exist on the current `feat/content-extraction` branch. However, a deep search across all git remotes reveals it was introduced in commit `d9703bfdd7433c0bf7747ba76aab9f15678f8173` on branch `remotes/origin/claude/branch-status-review-iz7j6j`. 

The author of that commit explicitly stated the following in the commit message:

> "Notion's own canonical Teacher's Guide page confirms pages 59-90 (L17-24) are 'pending transcription... add when source is available' -- **no repo scan or Notion content exists to transcribe from**, so the stub text in lesson-17.tsx through lesson-24.tsx now says AWAITING-SOURCE-SCAN..."

## Final Verdict

CONFIRMED: no such scan exists anywhere in this repo or its git history.
