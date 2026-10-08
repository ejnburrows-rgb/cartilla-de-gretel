# Workbook Archetypes 3 & 4 Rendered Proof

**Parent PR / Issue:** #495 / #450
**Verification Date:** October 8, 2026
**Scope:** Current-main rendered proof for Workbook Archetypes 3 (multi-pair matching/connect) and 4 (single central target + surrounding pictures).

---

## Overview & Scope

This proof verifies the digital execution of Workbook Archetype families 3 and 4 across the Cartilla learning platform:

1. **Archetype 3: Multi-pair matching / connect**
   - **Representative Page:** Printed Page 3 (Lesson 1, page index 2)
   - **Instruction:** *"Traza una línea de la vocal al dibujo que le corresponde."*
   - **Layout:** Two-column direct connector setup matching left-column vowels (`o`, `a`, `i`, `e`, `u`) to right-column pictures (`ocho`, `araña`, `iglesia`, `escoba`, `uno`).

2. **Archetype 4: Single target + surrounding pictures**
   - **Representative Pages:** Printed Pages 5 (Oo), 8 (Aa), 11 (Ee), 14 (Ii), and 17 (Uu).
   - **Instruction:** *"Traza una línea desde la vocal [X] hasta el dibujo de la palabra que comienza con [X]."*
   - **Layout:** Central letter target surrounded by a 3x3 matrix of 7 picture cards plus the central target button.
   - **Pre-drawn Examples:** Pre-connected example cards (`ola` on p5, `abeja` on p8, `escalera` on p11, `iguana` on p14, `uña` on p17).

---

## Key Verification Criteria & Findings

### 1. Source Ordering, Labels, and Images
- **Page 3 (Archetype 3):** Vowels appear strictly in source order (`o`, `a`, `i`, `e`, `u`). Target cards display matching pictures. Every illustration element loads with valid image dimensions (`naturalWidth > 0`).
- **Pages 5, 8, 11, 14, 17 (Archetype 4):** Central target buttons prominently render the focal letter pairs (`Oo`, `Aa`, `Ee`, `Ii`, `Uu`). Surrounding grid items accurately represent lesson vocabulary options.

### 2. Pencil Line Presentation
- Both Archetypes 3 and 4 present direct pencil connectors (`.am-direct-pencil`, SVG `<line stroke="#0d9488">`, wooden pencil tip animation `<PencilShape>`).
- Rope / lasso mechanics (`.am-lasso__rope-layer`, rope coils, character rope-throwing) are **never** rendered or used for these archetypes.

### 3. Central-Target Approved Composition
- The 3x3 matrix layout places the focal vowel button in the center (row 2, column 2) surrounded by picture choices.
- Pre-connected examples render as pre-settled connector lines (`data-example="true"`), remaining visible as instructional hints without requiring learner re-submission.

### 4. Activity Completion Compatibility
- **Archetype 3 (Page 3):** Connecting all 5 vowel-picture pairs triggers completion (`data-complete="true"`), sets `.native-lesson-viewer[data-page-complete="true"]`, and unlocks page navigation.
- **Archetype 4 (Page 5):** Connecting the central target `Oo` to all remaining correct surrounding pictures (`oveja`, `ojos`, `oreja`, `olla`, `oso`) completes the page (`data-complete="true"`) and unlocks the *"Siguiente"* button.

### 5. Responsive Viewport Compatibility
- Verified across **Laptop** (1280x900, 1366x768), **Tablet** (768x1024), and **Phone** (375x667).
- No horizontal window overflow (`scrollWidth - innerWidth <= 0`).
- No clipping or broken layout elements on small screens.

---

## Screenshot Proof Artifacts

- **Archetype 3 (Page 3):**
  - [Laptop View (Page 3)](page3-archetype3-laptop.png)
  - [Completed State (Page 3)](page3-archetype3-completed.png)
  - [Tablet View (Page 3)](page3-archetype3-tablet.png)
  - [Phone View (Page 3)](page3-archetype3-phone.png)

- **Archetype 4 (Pages 5, 8, 11, 14, 17):**
  - [Page 5 Laptop View (Oo)](page5-archetype4-laptop.png)
  - [Page 5 Completed State](page5-archetype4-completed.png)
  - [Page 5 Tablet View](page5-archetype4-tablet.png)
  - [Page 5 Phone View](page5-archetype4-phone.png)
  - [Page 8 Laptop View (Aa)](page8-archetype4-laptop.png)
  - [Page 11 Laptop View (Ee)](page11-archetype4-laptop.png)
  - [Page 14 Laptop View (Ii)](page14-archetype4-laptop.png)
  - [Page 17 Laptop View (Uu)](page17-archetype4-laptop.png)

---

## Reported Product Defects

Per project scope (*Verification-only product scope. Report defects; do not edit implementation here*), the following content/artwork asset mismatches were identified during source layout verification:

1. **Page 8 (Central target Aa):**
   - **Cell Caption:** `avión`
   - **Configured Image Path:** `/cartilla/art/faithful/leccion-1/pez.webp`
   - **Observed Asset:** The card displays a fish (`pez`) artwork instead of an airplane (`avión`).

2. **Page 14 (Central target Ii):**
   - **Cell Caption:** `uña`
   - **Configured Image Path:** `/cartilla/art/faithful/leccion-1/arco.webp`
   - **Observed Asset:** The card displays a rainbow (`arco`) artwork instead of fingernail (`uña`).

3. **Page 17 (Central target Uu):**
   - **Cell Caption:** `uña`
   - **Configured Image Path:** `/cartilla/art/faithful/leccion-1/arco.webp`
   - **Observed Asset:** The card displays a rainbow (`arco`) artwork instead of fingernail (`uña`).

*Note: These data discrepancies exist in `src/data/page-layouts.json` on `main` and are reported here without modifying application source files.*

---

## Automated Execution

All checks are codified in `tests/e2e/archetype-proof-3-4.spec.ts` and executed via Playwright Chromium against the Vite dev server (`http://127.0.0.1:5173`). All 10 tests pass cleanly.
