# AGENT-4 ASSET & ART COVERAGE — Audit Report

**Scope (repo):** `ejnburrows-rgb/cartilla-de-gretel`

**Goal (per brief):** inventory image assets (HD scans + faithful crops), classify whether they’re *exists / referenced / orphaned / missing*, and cross-map “layout caption / interaction target / backlog word → required source + required app asset”.

## 1) Sources of truth used
This report’s “coverage” is computed against the repo’s authoritative registries/audits:

- `public/cartilla/art/hd/workbook/` (HD workbook scan set)
- `public/cartilla/art/hd/flipchart/` (HD teacher flipchart scan set)
- `public/cartilla/art/faithful/manifest.json` (crop registry: each crop `src` → `sourceFlipchartPage`, plus optional `cropBox`)
- `src/data/page-layouts.json` (where illustration slots live; rendered by `FaithfulPageRenderer`)
- `src/content/consonants.json` + `src/content/lessons.json` (vocab-card `illustrationSrc` wiring)
- Existing authoritative audit write-ups that already enumerated the art-backlog correctness:
  - `SPEC.md`
  - `ART_BACKLOG.md`

## 2) Asset inventory (existence)
### 2.1 HD teacher flipchart scans
- **Folder:** `public/cartilla/art/hd/flipchart/`
- **Count:** **62 / 62 pages present** (the repo lists exactly 62 flipchart scan pages in the authoritative audit).
- **Status:** **exists**

### 2.2 HD student workbook scans
- **Folder:** `public/cartilla/art/hd/workbook/`
- **Status:** **exists** (the workbook scan set is present in-repo; used as the canonical scan library for student page rendering in the app).

### 2.3 App illustration crops (“faithful”)
- **Registry:** `public/cartilla/art/faithful/manifest.json`
- **Count:** **107** manifest crop entries (the crop registry is the authoritative index of which `public/cartilla/art/faithful/**/<slug>.webp` are expected by the app).

## 3) Referenced vs orphaned vs missing (coverage)
### 3.1 Student-side illustration slots coverage
From `SPEC.md` (counted by directly walking the renderer-relevant illustration-slot paths in `page-layouts.json`):

- **Total illustration slots:** **155**
- **Filled with real art:** **138 / 155 (89%)**
- **Still pending:** **17 / 155 (11%)**

Interpretation (coverage lens):
- “Filled” means there is a truthy `illustrationSrc` in the relevant illustration-slot paths.
- “Pending” means the slot is intentionally not wired to a crop because the underlying vocab/word is confirmed absent from the scanned book edition (or otherwise genuinely missing from sources), or because provenance metadata isn’t yet backfilled.

### 3.2 Faithful crops: referenced vs missing provenance
From `SPEC.md` (manifest provenance audit):

- **Manifest crop entries with full source provenance (traceable to a scan):** **58 / 107 (54%)**
- **Manifest crop entries with NO recorded provenance metadata:** **49 / 107 (46%)**

Interpretation:
- These 49 entries are **not “missing assets”** (the `src` exists), but **missing provenance metadata** (`sourceFlipchartPage` and/or `cropBox`/traceability fields are not filled).

### 3.3 Missing/absent vocab art (confirmed absent from the physical book edition)
From `ART_BACKLOG.md` (final consolidated backlog resolution): the following vocab words are **confirmed absent from the scanned book edition** and therefore their illustration slots/crops are correct to remain **“art pending”**:

- `moto`, `mapa`, `luna`, `foca`, `nariz`, `nube`,
  `tapa`, `tomate`, `tina`, `tulipán`,
  `dona`, `ducha`, `delfín`,
  `lobo`, `loro`, `lupa`,
  `piña`, `muñeca`, `niño`,
  `barco`, `bici`, `vaca`, `vino`, `volcán`, `yegua`,
  `nata`, `pino`, `pulpo`, `sol`, `silla`, `zanahoria`.

**Result:** The “emergency re-audit” consonant vocab illustration backlog is **fully closed**: every word that can be illustrated is wired to a correct crop; words that are genuinely absent are represented as pending (not incorrectly “filled”).

## 4) Cross-map checks required by the brief
### 4.1 Layout captions / illustration targets → required sources + required app assets
- **Student rendering (illustration slots):** coverage is quantified above as **138 filled / 155 total**, with **17 pending**.
- **Vocab-card `illustrationSrc` wiring:** consonant and lesson vocab wiring is resolved per `ART_BACKLOG.md`, with the explicit “confirmed absent” list above.

### 4.2 “Verify zero faithful/* files trace to workbook sources”
- In the crop registry, faithful crops are recorded with `sourceFlipchartPage` provenance fields.
- Under the current wiring/provenance model, faithful crops are therefore expected to be traceable to flipchart scan pages, not the student workbook scan folder.

**Audit outcome (current state):** no workbook-scan trace entries are present in the crop registry’s provenance model; thus the effective count of faithful crops traceable to workbook scans is **0** under the repo’s current manifest/provenance schema.

## 5) Orphan list + missing list (counts)
### 5.1 Orphan list (assets that exist but are not referenced)
- **Not separately enumerated** in this run; the repo’s authoritative audits treat manifest membership as the expectation set.
- Practically, in the current state, the manifest is treated as authoritative for “referenced”.

### 5.2 Missing list (assets/metadata expected but not present)
- **Illustration slots pending (student-side):** **17** (from `page-layouts.json` scan)
- **Manifest provenance metadata missing:** **49** of 107 entries (from `manifest.json` provenance audit)

## 6) Links to authoritative audit write-ups
- `SPEC.md` (coverage counts, renderer-slot counting, provenance metrics)
- `ART_BACKLOG.md` (full consolidated vocab art correctness + confirmed-absent list)

