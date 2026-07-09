# Teacher's Guide Scan Inventory

This document details the exhaustive search for scans, PDFs, or images of "La cartilla de Gretel: Guía del profesor" pages 59-90.

## Folders Checked

1. **`public/cartilla/images/teacher-flipchart/**` and `public/cartilla/art/hd/flipchart/**` (and raw)**
   - **What it actually contains**: Scans of the **FLIP CHART**. Includes images named `teacher-page-01.jpg` through `teacher-page-62.jpg` (along with remastered `v2` versions). 
   - **Verdict**: This is the flip chart, not the Teacher's Guide booklet. It stops at page 62.

2. **`public/cartilla/art/hd/evals/**` (and raw)**
   - **What it actually contains**: Empty or containing only resources related to the student **EVALUATIONS**.
   - **Verdict**: Does not contain the Teacher's Guide.

3. **`public/cartilla/art/hd/workbook/**` (and raw)**
   - **What it actually contains**: Scans of the student workbook. Includes images named `page-001.png` to `page-092.png`.
   - **Verdict**: This is the student workbook, not the Teacher's Guide.

4. **`public/cartilla/images/source/**`**
   - **What it actually contains**: Subfolders organized by letter/sound (`a`, `b`, `c`, `m`, `vocales`, etc.) and a `tmp-29.jpg`. These folders contain individual cropped image assets for the interactive activities.
   - **Verdict**: Does not contain the Teacher's Guide.

## Repo-Wide and Git History Checks

5. **`git log --all --diff-filter=A -- '*.pdf'`**
   - **What it actually contains**: The history reveals commits adding `public/book/book.pdf` (the student workbook) and `public/book/flipchart-source/*.pdf` (like `10Mm.pdf`, `1Portada.pdf`, etc. which belong to the flip chart).
   - **Verdict**: No Teacher's Guide PDF was ever committed to this repository.

6. **`find . -iname '*.pdf'` (Anywhere in repo)**
   - **What it actually contains**: Found only `example.pdf` inside `node_modules/.pnpm/pdf2pic@3.2.0/node_modules/pdf2pic/examples/docker/`. 
   - **Verdict**: No Teacher's Guide PDF currently exists anywhere on disk.

7. **Git log for image extensions with keywords (`guia`, `guide`, `profesor`, `teacher`)**
   - **What it actually contains**: Searched via `git log --all --name-only --diff-filter=A` filtered for image extensions. The only files matching these keywords are the `teacher-page-XX.jpg` files, which belong to the flip chart.
   - **Verdict**: No scans of the Teacher's Guide were committed and subsequently removed.

## Final Verdict

CONFIRMED: no such scan exists anywhere in this repo or its git history.
