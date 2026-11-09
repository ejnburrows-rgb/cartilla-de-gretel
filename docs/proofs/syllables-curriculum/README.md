# Consonant Syllables & Circling (Lessons 6–10) Verification Report

## Overview
This proof package verifies the implementation and curriculum rollout for consonant syllables recognition and circling across printed workbook consonant pages:
- **M**: Page 20 (`p20-ma`, `p20-me`, `p20-mi`, `p20-mo`, `p20-mu`)
- **P**: Page 24 (`p24-pa`, `p24-pe`, `p24-pi`, `p24-po`, `p24-pu`)
- **S**: Page 28 (`p28-sa`, `p28-se`, `p28-si`, `p28-so`, `p28-su`)
- **T**: Page 32 (`p32-ta`, `p32-te`, `p32-ti`, `p32-to`, `p32-tu`)
- **L**: Page 40 (`p40-la`, `p40-le`, `p40-li`, `p40-lo`, `p40-lu`)

## Deliverables Summary

### 1. Consonant Syllables Curriculum Rollout
- Fully verified syllable recognition and circling across printed consonant pages for M (Lesson 6 / Page 20), P (Lesson 7 / Page 24), S (Lesson 8 / Page 28), T (Lesson 10 / Page 32), and L (Lesson 9 / Page 40).
- All 5 syllable groups per page render all candidate words faithfully from `page-layouts.json`.
- Single-occurrence words circle immediately upon tap.
- Multi-occurrence words (such as "papá" or "mamá") accurately distinguish which syllable was tapped.

### 2. Approved Pencil Marks & Responsive Geometry
- `WorkbookPencilMark` renders the approved child pencil circle overlay.
- Circles are positioned directly over the target syllable letters (`left` and `width` percentages computed against `.native-syllable__letters`).
- Zero clipping or container line box overflow across responsive viewports (375px mobile, 768px tablet, 1280px desktop).

### 3. Persistence & Clean Learner Isolation
- **Reload Persistence**: Completed marks and exact syllable start indices are saved under `learnerStorageKey` and survive page unmounts and browser reloads.
- **Learner Isolation**: Switching from Student A to Student B completely clears Student A's marks from the UI and storage scope. Student B starts with a fresh empty activity state.
- **Learner Restoration**: Switching back to Student A restores Student A's original marks and selected start positions intact.

## Test Artifacts & Verifications

### Vitest Unit Tests
- `src/cartilla/interactions/__tests__/SyllableWordCircle.rollout.test.tsx` (11 tests passed)
- `src/cartilla/interactions/__tests__/SyllableWordCircle.test.tsx` (5 tests passed)

### Playwright Automated Proofs
- Script: `scripts/proofs/check-syllables-curriculum.mjs`
- Test Output:
  - 375px mobile viewport:
    - Video: `375-syllables-curriculum.webm`
    - Screenshots: `375-page-20-m-syllables.png`, `375-page-24-p-syllables.png`, `375-page-28-s-syllables.png`, `375-page-32-t-syllables.png`, `375-page-40-l-syllables.png`, `375-page-40-reloaded.png`, `375-learner-b-isolated-empty.png`, `375-learner-a-restored.png`
  - 768px tablet viewport:
    - Video: `768-syllables-curriculum.webm`
    - Screenshots: `768-page-20-m-syllables.png`, `768-page-24-p-syllables.png`, `768-page-28-s-syllables.png`, `768-page-32-t-syllables.png`, `768-page-40-l-syllables.png`, `768-page-40-reloaded.png`, `768-learner-b-isolated-empty.png`, `768-learner-a-restored.png`
  - 1280px desktop viewport:
    - Video: `1280-syllables-curriculum.webm`
    - Screenshots: `1280-page-20-m-syllables.png`, `1280-page-24-p-syllables.png`, `1280-page-28-s-syllables.png`, `1280-page-32-t-syllables.png`, `1280-page-40-l-syllables.png`, `1280-page-40-reloaded.png`, `1280-learner-b-isolated-empty.png`, `1280-learner-a-restored.png`
  - JSON Summary: `results.json`
