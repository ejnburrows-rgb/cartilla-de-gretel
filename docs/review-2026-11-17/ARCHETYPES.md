# Lesson & Flip Chart Archetypes Inventory (2026-11-17)

Approved Option A model (locked 2026-11-18): **Lesson 3** (Workbook pages 7–9 with `curl=a` corner lift + `PENCIL-CURSOR-SPEC.md` `@image1` cursor; Flip Chart sheet 5 on Projector Presenter `/cartilla/presentar/$n`).

## Curriculum Lesson Sequences
- **Intro**: Lesson 1 (`O A E I U`, Workbook pp. 1–3, Flip Chart sheet 3)
- **Vowels**: Lessons 2–6 (`Oo, Aa, Ee, Ii, Uu`, Workbook pp. 4–18, Flip Chart sheets 4–8)
- **First Consonants**: Lessons 7–14 (`m, p, s, t, d, l, n, ñ`, Workbook pp. 19–50, Flip Chart sheets 9–32)
- **Later Consonants**: Lessons 15–21 (`b, v, r, rr, g, f, j`, Workbook pp. 51–78, Flip Chart sheets 33–53)
- **Combinations & Final**: Lessons 22–24 (`c, y, z`, Workbook pp. 79–90, Flip Chart sheets 54–62; pp. 86–87 `SOURCE_BLOCKED`)

## Summary Table (Type -> Count -> Model Pages -> Contract Kernel)

| Surface | Type | Count | Model Pages | Shared Contract Kernel |
|---|---|---:|---|---|
| workbook | `tap-circle-picture` (Tap / Circle Picture) | 6 | L1 p.1, L3 p.7 (approved) | Yes |
| workbook | `vowel-row-choice` (Vowel Row Choice) | 1 | L1 p.2 | Yes |
| workbook | `line-connect-pairs` (Line Connect (Pairs)) | 1 | L1 p.3 | Yes |
| workbook | `line-connect-central` (Line Connect (Central Target)) | 5 | L3 p.8 (approved) | Yes |
| workbook | `letter-trace-and-draw` (Letter Trace + Draw) | 22 | L3 p.9 (approved), L7 p.19, L15 p.51, L22 p.79 | No (freehand/static) |
| workbook | `syllable-circle` (Syllable Circle) | 18 | L7 p.20, L15 p.52, L22 p.80 | Yes |
| workbook | `read-word-list` (Read Word List & Sentences) | 18 | L7 p.21, L15 p.53, L22 p.81 | No (freehand/static) |
| workbook | `fill-blank-and-write` (Fill Blank + Sentence Writing) | 17 | L7 p.22, L15 p.54, L22 p.82 | No (freehand/static) |
| workbook | `source-blocked` (Source Blocked (Missing Scan)) | 2 | — (SOURCE_BLOCKED) | No (freehand/static) |
| flipchart | `flipchart-frontmatter` (Flip Chart — Frontmatter) | 2 | L0 p.1 | No (freehand/static) |
| flipchart | `flipchart-vowel-header` (Flip Chart — Vowel Intro & Vocab) | 6 | L1 p.3, L3 p.5 (approved) | No (freehand/static) |
| flipchart | `flipchart-consonant-vocab` (Flip Chart — Consonant Intro & Vocab) | 18 | L7 p.9, L15 p.33, L22 p.54 | No (freehand/static) |
| flipchart | `flipchart-syllable-drill` (Flip Chart — Syllable & Word Drill) | 18 | L7 p.10, L15 p.34, L22 p.55 | No (freehand/static) |
| flipchart | `flipchart-reading-panel` (Flip Chart — Reading Verse / Scene) | 16 | L7 p.11, L15 p.35, L22 p.56 | No (freehand/static) |
| flipchart | `flipchart-story-letter` (Flip Chart — Special Story / Letter) | 2 | L18 p.44, L24 p.62 | No (freehand/static) |

## Full Page & Sheet Listing

### Tap / Circle Picture (`tap-circle-picture`, 6)
- **Kernel / Host**: InteractivePictureGrid -> WorkbookPencilMark
- **Pages**: L1 p.1, L2 p.4, L3 p.7, L4 p.10, L5 p.13, L6 p.16

### Vowel Row Choice (`vowel-row-choice`, 1)
- **Kernel / Host**: InteractiveVowelPickOne -> WorkbookPencilMark
- **Pages**: L1 p.2

### Line Connect (Pairs) (`line-connect-pairs`, 1)
- **Kernel / Host**: DirectPencilConnector (aligned to PENCIL_CONTRACT + holdEraser)
- **Pages**: L1 p.3

### Line Connect (Central Target) (`line-connect-central`, 5)
- **Kernel / Host**: DirectPencilConnector (aligned to PENCIL_CONTRACT + holdEraser)
- **Pages**: L2 p.5, L3 p.8, L4 p.11, L5 p.14, L6 p.17

### Letter Trace + Draw (`letter-trace-and-draw`, 22)
- **Kernel / Host**: WorkbookLetterTrace + DibujaHost (ContractPencilCursor)
- **Pages**: L2 p.6, L3 p.9, L4 p.12, L5 p.15, L6 p.18, L7 p.19, L8 p.23, L9 p.27, L10 p.31, L11 p.35, L12 p.39, L13 p.43, L14 p.47, L15 p.51, L16 p.55, L17 p.59, L18 p.63, L19 p.67, L20 p.71, L21 p.75, L22 p.79, L23 p.83

### Syllable Circle (`syllable-circle`, 18)
- **Kernel / Host**: SyllableWordCircle -> WorkbookPencilMark
- **Pages**: L7 p.20, L8 p.24, L9 p.28, L10 p.32, L11 p.36, L12 p.40, L13 p.44, L14 p.48, L15 p.52, L16 p.56, L17 p.60, L18 p.64, L19 p.68, L20 p.72, L21 p.76, L22 p.80, L23 p.84, L24 p.88

### Read Word List & Sentences (`read-word-list`, 18)
- **Kernel / Host**: FaithfulPageRenderer static reading surface (ContractPencilCursor + Curl B)
- **Pages**: L7 p.21, L8 p.25, L9 p.29, L10 p.33, L11 p.37, L12 p.41, L13 p.45, L14 p.49, L15 p.53, L16 p.57, L17 p.61, L18 p.65, L19 p.69, L20 p.73, L21 p.77, L22 p.81, L23 p.85, L24 p.89

### Fill Blank + Sentence Writing (`fill-blank-and-write`, 17)
- **Kernel / Host**: InteractiveFillInBlank + WorkbookWritingResponse
- **Pages**: L7 p.22, L8 p.26, L9 p.30, L10 p.34, L11 p.38, L12 p.42, L13 p.46, L14 p.50, L15 p.54, L16 p.58, L17 p.62, L18 p.66, L19 p.70, L20 p.74, L21 p.78, L22 p.82, L24 p.90

### Source Blocked (Missing Scan) (`source-blocked`, 2)
- **Kernel / Host**: SOURCE_BLOCKED notice
- **Pages**: L23 p.86 [SOURCE_BLOCKED], L24 p.87 [SOURCE_BLOCKED]

### Flip Chart — Frontmatter (`flipchart-frontmatter`, 2)
- **Kernel / Host**: FlipchartHdPanel (Flip B top-spiral)
- **Pages**: L0 p.1, L0 p.2

### Flip Chart — Vowel Intro & Vocab (`flipchart-vowel-header`, 6)
- **Kernel / Host**: FlipchartHdPanel (Flip B top-spiral)
- **Pages**: L1 p.3, L2 p.4, L3 p.5, L4 p.6, L5 p.7, L6 p.8

### Flip Chart — Consonant Intro & Vocab (`flipchart-consonant-vocab`, 18)
- **Kernel / Host**: FlipchartHdPanel (Flip B top-spiral)
- **Pages**: L7 p.9, L8 p.12, L9 p.15, L10 p.18, L11 p.21, L12 p.24, L13 p.27, L14 p.30, L15 p.33, L16 p.36, L17 p.39, L18 p.42, L19 p.45, L20 p.48, L21 p.51, L22 p.54, L23 p.57, L24 p.60

### Flip Chart — Syllable & Word Drill (`flipchart-syllable-drill`, 18)
- **Kernel / Host**: FlipchartHdPanel (Flip B top-spiral)
- **Pages**: L7 p.10, L8 p.13, L9 p.16, L10 p.19, L11 p.22, L12 p.25, L13 p.28, L14 p.31, L15 p.34, L16 p.37, L17 p.40, L18 p.43, L19 p.46, L20 p.49, L21 p.52, L22 p.55, L23 p.58, L24 p.61

### Flip Chart — Reading Verse / Scene (`flipchart-reading-panel`, 16)
- **Kernel / Host**: FlipchartHdPanel (Flip B top-spiral)
- **Pages**: L7 p.11, L8 p.14, L9 p.17, L10 p.20, L11 p.23, L12 p.26, L13 p.29, L14 p.32, L15 p.35, L16 p.38, L17 p.41, L19 p.47, L20 p.50, L21 p.53, L22 p.56, L23 p.59

### Flip Chart — Special Story / Letter (`flipchart-story-letter`, 2)
- **Kernel / Host**: FlipchartHdPanel (Flip B top-spiral)
- **Pages**: L18 p.44, L24 p.62

