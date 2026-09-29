# HANDOFF — La Cartilla de Gretel: Exact Replica Completion

**Date:** 2026-09-29  
**For:** ChatGPT (coding agent)  
**From:** Muse (full examination)  
**Status:** DO NOT MODIFY THIS FILE. It is the source of truth for what is working, what not to change, what needs to change, and what we are waiting on.

---

## THE #1 RULE (from AGENTS.md — do not modify)

This is an e-learning platform that is a **digitized exact replica** of the physical books. Not a reinterpretation. Not "inspired by." EXACT.

- **The flipbook** must look exactly like the physical flipbook, digitized.
- **The workbook** must look exactly like the physical workbook, digitized.
- **DO NOT touch the images.** They are already fixed and cropped. Never modify, redraw, regenerate, or "improve" any artwork image.
- **What you MAY change:** placements, layout, CSS positioning — ONLY to make each page match the book exactly.
- **Reference PDFs:** `~/workspace/cartilla-reference/flipchart.pdf` (62 pages) and `~/workspace/cartilla-reference/workbook.pdf` (92 pages). These are the physical books. If a page doesn't look like the book, the page is wrong — not the book.

---

## WHAT IS WORKING (do not break)

### 1. Defect 14: ñ vs n bug — FIXED ✅
- **Commit:** `bdd18fb9` (on `main`)
- **File:** `src/lib/flipchart-native.ts`, `normalizeWord()` function
- **What was wrong:** NFD Unicode normalization decomposed ñ into n + combining tilde, then stripped the tilde. This conflated ñ with n. The word "araña" (split as "a" + "raña") normalized "raña" → "rana", falsely matching the frog image from lesson 17.
- **Fix:** Added `.replace(/n\u0303/gi, "ñ")` after NFD and before stripping combining marks.
- **Do not touch:** This fix is correct and verified. Do not modify `normalizeWord()`.

### 2. Flipchart defects 1-9, 17 — FIXED ✅
- All 35 quarantined assets removed from disk (0 remain)
- 32 optimized + 60 hero + 16 native-crop images all present and loading
- 0 broken images across all flipchart sheets
- **Do not touch:** The image files. The asset manifest. The `pageArt()` priority chain.

### 3. Workbook defects 20, 21, 22 — FIXED ✅
- **Defect 20:** L21-24 p2 syllable cards — words moved to correct cards (e.g., L21: jinete/Jimena/jícara→ji, Javi/jamón→ja, juguete→ju, jarra→ja; L22: Quirino→qui, queso/queja→que, etc.)
- **Defect 21:** L14-p3 "araña" row — correct answer `ña` now among options
- **Defect 22:** L16-p3 "vela" row, L17-p3 "rana" row — option buttons aligned with their row
- **Do not touch:** These fixes are verified. Do not modify the syllable card logic or option button positioning.

### 4. 16 native crops — GENERATED ✅
- **Location:** `public/cartilla/art/faithful/flipchart-native/` (16 files: p018-*.webp, p021-*.webp, p024-*.webp, p056-*.webp)
- These were cut from HD scans using coordinates from `flipchart-native-assets.json` to fill missing images (defects 1-5).
- **Do not touch:** These files. They are the source for ChatGPT's optimization (see "Waiting On").

### 5. Vercel cleanup — DONE ✅
- 116 old deployments deleted, 7 kept (4 live + 3 backups). 0 errors.
- **Do not touch:** Deployment configuration.

### 6. EXACT REPLICA rule — IN REPO ✅
- `AGENTS.md` has the EXACT REPLICA section at the top (commits `112c2373`, `c20ec578`)
- Conflicting artwork-modernization docs have been voided
- **Do not touch:** AGENTS.md. The EXACT REPLICA section. This handoff file.

### 7. Exact replica Batches 1-3 (flipchart) — DONE, ON WORK BRANCH ⚠️
- **Branch:** `muse/exact-replica-placements` (4 commits ahead of `origin/main`, NOT yet merged)
- **Batch 1** (`f37b4521`): Single-column flipchart layout, no chrome. Removed "Lámina N" header + meta pill. Art grid: 2 cols → 3 cols. Stripped card styling (no borders/radius/gradients/shadows). White page background. Word labels: black bold rounded sans. Printed page number bottom-right.
- **Batch 2** (`8c0bd1be`): Red-letter rule for vowel pages. Word labels: red initial vowel ONLY on pages 3-6 (a,e,i,o,u lessons). All consonant pages: 100% black labels.
- **Batch 3** (`977398cf`): Empty-middle-cell for 5-item vocab pages. Type B consonant pages: bottom row has 2 items (left + right, middle empty).
- **Files changed:** `src/components/cartilla/FlipchartNativeBoard.tsx`, `src/styles/flipchart-presenter.css`
- **Do not touch:** The logic of these batches. They are correct per the spec.

---

## WHAT NOT TO CHANGE (explicit prohibitions)

1. **DO NOT modify any image file** in `public/cartilla/art/` — not the faithful, optimized, native, or delivery derivatives. The user said: "I don't want you to touch the images because they're already fixed and cropped."

2. **DO NOT modify AGENTS.md** — especially the EXACT REPLICA section. It is the #1 rule.

3. **DO NOT modify this handoff file** (`HANDOFF-EXACT-REPLICA.md`).

4. **DO NOT modify the layout spec files:**
   - `~/workspace/cartilla-reference/flipchart-layout-spec.md`
   - `~/workspace/cartilla-reference/workbook-layout-spec.md`
   These are the source of truth for placements. Read them, follow them, don't change them.

5. **DO NOT push to `main`** without explicit user approval. The user has a HARD RULE: never push to production without FIRST explaining in plain non-technical language WHY and getting explicit go-ahead. Work on a branch.

6. **DO NOT redesign, modernize, or reinterpret** any layout. The book is the design. If the book has it, replicate it. If the book doesn't have it, remove it.

---

## WHAT NEEDS TO CHANGE (your task list)

### PRIORITY 1: Verify and merge the 4 work-branch commits
**Branch:** `muse/exact-replica-placements`  
**Commits to verify:**
1. `977398cf` — Batch 3: empty-middle-cell
2. `8c0bd1be` — Batch 2: red-letter rule  
3. `f37b4521` — Batch 1: single-column layout
4. `c20ec578` — Void conflicting docs

**What to do:**
1. Check out the branch: `git checkout muse/exact-replica-placements`
2. Start dev server: `npm run dev` (Vite, port 5173)
3. Visually verify flipchart sheets against the spec (`~/workspace/cartilla-reference/flipchart-layout-spec.md`):
   - Sheet 3 (Type A vowel page): scene top-left, pastel panel top-right, 3×2 grid, red vowels in labels
   - Sheet 12 (Type B consonant page): scene left, red "Pp" center, crescent right, 3-col grid, black labels, bottom row 2 items (left+right)
   - Sheet 18 (Type B, 5 items): verify empty middle cell on bottom row
   - Check: NO "Lámina N" header, NO meta pill, NO card borders/shadows, white background, page number bottom-right
4. Run tests: `npm test -- --run` — all must pass
5. If verified: merge to `main` (do NOT push to origin/main without user approval — open a PR or wait for instruction)
6. If issues found: fix on the branch, do not merge until clean

### PRIORITY 2: Workbook exact replica (NOT STARTED)
**Spec:** `~/workspace/cartilla-reference/workbook-layout-spec.md`  
**Reference PDF:** `~/workspace/cartilla-reference/workbook.pdf` (92 pages)

**Current state:** The workbook app does NOT match the book. It has garden-painted backgrounds, top nav bars, progress dots, card-based layouts — NONE of which exist in the book.

**What the book actually looks like:**
- **Page chrome (every page):** Teal wavy vertical stripe on outer edge only (right on odd pages, left on even). Page number in pale-teal diamond at bottom outer corner. "Lección N" small text at bottom inner corner. Plain white background — no illustrations, no gradients.
- **Exercise templates:**
  1. "Instrucciones:" — bold label + regular instruction text, top-left
  2. Picture grid — teal-bordered cells (5×4), images centered with padding
  3. Line-matching — center vertical teal box with letters + teal dot anchors, pictures left/right
  4. "Completa las palabras" — 2 blocks × 3 columns: word-in-teal-box → blank-line version → syllable choices; horizontal rule between blocks; "Escribe oraciones..." + handwriting lines at bottom
  5. "Encierra en un círculo" — syllable in large teal bold left, leader lines to words, 3 cols × 2 rows
  6. Handwriting — solid top + dashed teal midline + solid baseline; model letter with stroke-order arrows; drawing prompt + large teal-bordered empty box
  7. Letter intro page — "Ff" in teal oval halo, two syllable bars, 3×5 word columns, full-width sight-word box, reading passage

**What to do:**
1. Read the full spec: `~/workspace/cartilla-reference/workbook-layout-spec.md`
2. Identify the workbook rendering components (likely in `src/components/cartilla/` — look for workbook/lesson components)
3. Create a new branch: `git checkout -b chatgpt/workbook-exact-replica`
4. Apply the exact replica transformation:
   - Remove: garden backgrounds, top nav bars, progress dots, card-based layouts, any decorative UI chrome
   - Add: white page surface, teal wavy stripe (outer edge), diamond page number (bottom outer), "Lección N" (bottom inner)
   - Rebuild exercise layouts per the 7 templates above
   - DO NOT touch images — only placements/layout/CSS
5. Verify against the PDF: sample at least 10 pages across different lessons and page types
6. Run tests, verify no regressions
7. Do NOT merge or push without user approval

### PRIORITY 3: Flipchart art defects (BLOCKED — do not start without user approval)
The user said "don't touch the images." These defects require image work. **DO NOT START** until the user explicitly approves.

- **Defect 10:** uña.webp is a washed-out beige blob (7 sheets: 6, 8, 31, 34, 43, 46, 52). Needs new artwork. Re-cropping won't help — source is washed out.
- **Defect 11:** Donkey (burro.webp) is poor quality, black background not transparent (2 sheets: 42, 44). Needs new artwork. The only alternative in repo is a goat (wrong animal).
- **Defect 15:** Dog (perro.webp) is painterly style, clashes with flat-cartoon set (2 sheets: 43, 44). Needs re-render in flat style.
- **Defect 12:** Background-removal leftovers (4 images: avion, traje, sopa, gorra). CAN be fixed with cleanup (erase fragments), not new art. Still requires image editing — wait for approval.
- **Defect 13:** Sheet 55 green/yellow band. Source hero file is clean — may be render issue. Needs live investigation.
- **Defect 16:** Sheet 33 missing 4 images (Beba, Bubi, bate, bebita). Need extraction from HD scans (same pattern as 16 native crops).

### PRIORITY 4: Workbook defects 23-24 (NEED USER DECISION — do not change unilaterally)
- **Defect 23:** Every lesson 13-24 page-3 "Completa" exercise pre-prints the correct answer next to the blank (e.g., `nariz [____] na`). Is this an intentional hint or a bug? If bug, hide until "Comprobar" is clicked.
- **Defect 24:** Verify vocabulary: "ñutu", "ñeque", "ñero" (L14-p2), "borrumba" (L18-p2) — are these intended words?
- **DO NOT CHANGE** until the user decides.

---

## WHAT WE ARE WAITING ON (not your task, for awareness)

1. **ChatGPT's 16 optimized crops** — The user prompted ChatGPT directly (~11:13 EDT) to: pull the 16 raw crops from Drive, apply flipchart-exclusive color polish, save to `public/cartilla/art/optimized/flipchart-native/`, wire into `pageArt()` priority, commit to a work branch (not main). Status unknown. When these land, they need verification and merge per the work-branch rule.

2. **Verification suite results** — A full test + screenshot sweep + zero-defect check was running. If it completed, check its output before merging anything.

3. **User decisions** on defects 23-24 (pre-revealed answers, vocabulary verification).

4. **Google Drive cleanup** — Partial upload (5 of 16 crops) in "16 Flip Chart Native Crops - Raw for ChatGPT Optimization". User said "Nevermind on Google drive" — cleanup pending user confirmation.

---

## TECHNICAL REFERENCES

- **Repo:** `ejnburrows-rgb/cartilla-de-gretel`
- **Local:** `~/workspace/cartilla-master` (use this, NOT `cartilla-newmain` which no longer exists)
- **Current branch:** `muse/exact-replica-placements` (4 commits ahead of origin/main)
- **Main branch:** `origin/main` (has EXACT REPLICA rule + defect 14 fix)
- **Dev server:** `npm run dev` → http://127.0.0.1:5173/
- **Tests:** `npm test -- --run`
- **Key files:**
  - `src/components/cartilla/FlipchartNativeBoard.tsx` — flipchart page renderer
  - `src/styles/flipchart-presenter.css` — flipchart styles
  - `src/lib/flipchart-native.ts` — normalizeWord(), art matching (DO NOT MODIFY normalizeWord)
  - `src/lib/pageArt()` — art priority: OPTIMIZED_EXCLUSIVE → NATIVE_EXTRAS → FAITHFUL
  - **CRITICAL:** `LivingIllustration` loads `delivery/faithful/{384,768}/` via srcset FIRST — fixing a canonical asset REQUIRES regenerating derivatives. (But you are NOT fixing assets — only layouts.)

---

## DEFINITION OF DONE

1. ✅ The 4 work-branch commits are verified (screenshots prove they match the book) and merged to `main`
2. ✅ Workbook exact replica is implemented on a work branch, verified against the PDF (10+ sample pages), tests pass
3. ✅ Full test suite passes: `npm test -- --run`
4. ✅ No images were modified (verify with `git diff --name-only` — no files under `public/cartilla/art/` should appear)
5. ✅ No pushes to `origin/main` without explicit user approval

---

## IF YOU ARE UNSURE

- **About a placement:** Check the PDF. The book is the source of truth. `~/workspace/cartilla-reference/flipchart.pdf` or `workbook.pdf`.
- **About whether to change an image:** DON'T. The answer is always don't. Images are frozen.
- **About pushing to main:** DON'T without explicit user approval. Open a PR or ask.
- **About conflicting instructions:** This handoff and AGENTS.md override everything else. EXACT REPLICA is the rule.

---

**End of handoff. Do not modify this file.**
