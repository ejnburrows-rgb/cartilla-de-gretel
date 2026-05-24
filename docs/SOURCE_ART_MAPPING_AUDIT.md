# Source Art Mapping Audit — La Cartilla de Gretel

**Last updated:** 2026-05-24  
**Repo:** `cartilla-de-gretel-live` (connected to `https://github.com/ejnburrows-rgb/cartilla-de-gretel`)

---

## Honesty Policy

- No image is attached to a student activity unless verified to exist in the source material.
- No emojis, generic clipart, or AI-generated art are used for workbook content.
- Object hotspot coordinates are marked `coordinatesVerified: false` until mapped from real page measurements.
- Unverified words are flagged accordingly.

---

## Source Discovery & Extraction

All source files are single-page PDFs extracted from the `Main Book` directory:
- `14-Ss.pdf` (workbook page 13)
- `15-Ss.pdf` (workbook page 14)
- `16-Ss.pdf` (workbook page 15)
- `37-Rr inicial.pdf` (workbook page 37)
- `38-R inicial.pdf` (workbook page 38)
- `39-Rr inicial.pdf` (workbook page 39)

### Extraction method
PyMuPDF (`fitz`) render at 2x scale (~144dpi equivalent), RGB, saved as JPEG under `public/cartilla/images/source/`.

---

## Ss Source Pages — Fully Mapped

### ss-page-14.jpg (source: 14-Ss.pdf, workbook page 13)
- **App Page:** Page 27
- **Role:** Illustrated vocabulary introduction.
- **Content verified by visual inspection:**
  - Syllable chart: `sa se si so su` (top-right)
  - Letter display: `Ss`
  - Labeled illustrated objects: **Sesi** (girl in green dress), **sopa** (bowl of soup), **sapo** (frog), **pisa** (foot stepping on banana peel), **Susi** (girl hugging chick).
- **Interactions mapped:**
  - `l9-p27-word-reveal` (drag-word-to-image: sopa, sapo, pisa)
  - `l9-p27-names-reveal` (listen-and-tap: Sesi, Susi)

### ss-page-15.jpg (source: 15-Ss.pdf, workbook page 14)
- **App Page:** Page 28
- **Role:** Syllables, word list, and reading sentences.
- **Content verified by visual inspection:**
  - Syllables bands: `sa se si so su` and `su so sa se si`
  - 3 word columns: `masa sapo así puso Sisi`, `mesa seso sopa supo ese`, `suma Susi paso supe esa`
  - Sight words strip: `es de un está en la el`
  - 7 reading sentences:
    1. La mesa es de Susi.
    2. La sopa está en la mesa.
    3. Papá pasa la sopa a Susi.
    4. Sisi pasa la sopa a mamá.
    5. Ese sapo es de Sisi. Es el sapo Samapo.
    6. Sisi pasa el sapo a Pepe.
    7. Pepe puso un sapo en la mesa.
- **Interactions mapped:**
  - `l9-p28-sight-words` (listen-and-tap: es, de, un, está, en, la, el)
  - `l9-p28-syllable-tap` (drag-syllable-to-slot: sa, se, si, so, su)

### ss-page-16.jpg (source: 16-Ss.pdf, workbook page 15)
- **App Page:** Page 29
- **Role:** Mini-story page.
- **Content verified by visual inspection:**
  - Illustration: Frog (Samapo) sitting on a bench with a sunflower.
  - Verbatim story text:
    ```
    Sapo Samapo
    en la mesa está
    sapo Samapo
    sa-po-mi-pa.
    ```
- **Interactions mapped:**
  - `l9-p29-mini-story-ss` (mini-story read-along)

---

## R inicial Source Pages — Fully Mapped

### r-page-37.jpg (source: 37-Rr inicial.pdf, workbook page 37)
- **App Page:** Page 59
- **Role:** Illustrated vocabulary introduction.
- **Content verified by visual inspection & OCR:**
  - Syllable/letter display: `ra`, `ru`, `Rr`
  - 5 illustrated objects: **rana** (frog), **remo** (oar), **Rita** (girl), **rosa** (rose), **rueda** (wheel).
- **Interactions mapped:**
  - `l17-p59-word-reveal-r` (drag-word-to-image: rana, remo, rosa, rueda, Rita). Upgraded to transcription verified from source page `book-derived` status!

### r-page-38.jpg (source: 38-R inicial.pdf, workbook page 38)
- **App Page:** Page 60
- **Role:** Syllables, word list, and mini-story page.
- **Content verification:**
  - Syllables bands: `ra re ri ro ru` and `ru ro ra re ri`
  - 5 word columns: `ramo rosa risa rata roto`, `remo rana ruta Rita Roma`, `ropa rosado rulo Rolo rebaño`
  - Sight word strip: `bien`
  - **Mini-story text status:** `transcription verified from source page` (Sourced directly from the official Notion `38-R inicial` export page and visually confirmed on the page scan).
  - Mini-story text (verbatim):
    ```
    La bola de Roberto rueda bien. Rolo patea la bola.
    La bola rueda y le da a un bolo. El bolo se rompe
    y Roberto se ríe. Rolo se ríe también.
    Rita le da al bolo. Rita se ríe.
    Rolo y Roberto se ríen también.
    ```
- **Interactions mapped:**
  - `l17-p60-syllable-r` (drag-syllable-to-slot: ra, re, ri, ro, ru) — status: `page scan mapped`, `hotspot pending`
  - `l17-p60-sight-word-bien` (listen-and-tap: bien) — status: `page scan mapped`
  - `l17-p60-mini-story-r` (mini-story read-along) — status: `page scan mapped`

### r-page-39.jpg (source: 39-Rr inicial.pdf, workbook page 39)
- **App Page:** Page 61
- **Role:** Poem page.
- **Content verification:**
  - **Poem text status:** `OCR-extracted & manually verified` (Extracted via PDF Page-Scan OCR using PyTesseract from `39-Rr inicial.pdf` and manually reviewed line-by-line against the physical image scan to correct raw OCR typos such as `oara` -> `para` and `risueno` -> `risueño`).
  - Poem text (verbatim):
    ```
    La r para la rama
    para el roer del ratón
    y para el rabo del mono
    risueño y remolón.

    Para la rueda redonda
    la risa de tío Rolo
    la rana, el remo, la rosa
    y la rosca de Manolo.
    ```
- **Interactions mapped:**
  - `l17-p61-poem-r` (mini-story read-along for the poem) — status: `page scan mapped`

---

## Files Copied/Extracted into Repo

| Target path (public/) | Source | Size | Status |
|---|---|---|---|
| `cartilla/images/source/ss/ss-page-14.jpg` | `Main Book/14-Ss.pdf` | 2,076,051 bytes | Mapped (Page 27) |
| `cartilla/images/source/ss/ss-page-15.jpg` | `Main Book/15-Ss.pdf` | 1,225,176 bytes | Mapped (Page 28) |
| `cartilla/images/source/ss/ss-page-16.jpg` | `Main Book/16-Ss.pdf` | 1,407,037 bytes | Mapped (Page 29) |
| `cartilla/images/source/r/r-page-37.jpg` | `Main Book/37-Rr inicial.pdf` | 1,891,080 bytes | Mapped (Page 59) |
| `cartilla/images/source/r/r-page-38.jpg` | `Main Book/38-R inicial.pdf` | 1,479,918 bytes | Mapped (Page 60) |
| `cartilla/images/source/r/r-page-39.jpg` | `Main Book/39-Rr inicial.pdf` | 2,267,114 bytes | Mapped (Page 61) |

All pages are now page scans verified, extracted, and integrated with correct page numbers and interactive activities.
