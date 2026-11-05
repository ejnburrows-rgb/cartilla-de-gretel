# Image Audit & Optimization Handoff Prompt

**Project**: La Cartilla de Gretel  
**Local Workspace**: `c:\Users\EJN\Downloads\La Cartilla de Gretel` (NTFS junction to `D:\Downloads\La Cartilla de Gretel`)  
**Current Branch**: `feat/living-cover-welcome-redesign`  
**Current Commit**: `d613b78ba553c3c5786afdf7d589305a3080f1cf`  
**Node/Package Runtime**: Node.js v20+, `pnpm`  
**Governing Rules**: `AGENTS.md` (no fake/invented art, no TTS, no touching Tutor files or Mariposas game assets, keep `vercel.json` `git.deploymentEnabled: false`).

---

## 1. Primary Objectives
1. **Determine Unoptimized Images**: Audit all illustrations in the Workbook (Lessons 1–24) and Teacher Flip Chart (Pages 1–24) to locate assets that are:
   - Low resolution, blurry, or pixelated.
   - Traced SVG vector outlines instead of authentic watercolor scan crops.
   - Improperly cropped, split, or severed (e.g. cut off characters, missing limbs/props).
   - Displaying color shifts, clipping artifacts, or dark fringing/halos.
2. **Source Authentic Masters**: Search and extract high-resolution originals from the master image foundation located directly on the PC at `C:\Users\EJN\Downloads`:
   - `C:\Users\EJN\Downloads\La Cartilla de Gretel Flip Chart.pdf` (40.2 MB physical flip chart master scan)
   - `C:\Users\EJN\Downloads\La_Cartilla_de_Gretel_2026_Remaster.pdf` (68.3 MB remastered physical edition)
   - `C:\Users\EJN\Downloads\LaCartillaDeGretel_LANY2026_Restored.pdf` (52.9 MB restored master)
   - `C:\Users\EJN\Downloads\CARTILLA_ORIGINAL_VS_OPTIMIZED_APPROVAL.pdf` (53.6 MB comparison reference)
   - `C:\Users\EJN\Downloads\Cartilla_Colored_Artwork_Library_2026-10-21.zip` (39.1 MB colored library)
   - `C:\Users\EJN\Downloads\la_cartilla_de_gretel_complete_package.zip` (149.4 MB master assets package)
   - `C:\Users\EJN\Downloads\cartilla-recovery-handoff\` and `Cartilla-Drop\`
3. **Execute Extraction & Optimization**:
   - Extract at 300+ DPI directly from master scan pages without recompression degradation.
   - Apply clean background removal preserving authentic watercolor brushstrokes and soft edges (no harsh thresholding or black fringe).
   - Generate dual format outputs: lossless transparent PNG and optimized WebP.
   - Update asset registries: `src/data/flipchart-native-assets.json`, `src/data/flipchart-art-placement.json`, `src/data/flipchart-art-content-bounds.json`, `public/cartilla/art/faithful/manifest.json`.
4. **Unlocatable Asset Manifest**: If any specific artwork is absent from all local foundation sources, produce an exact table (Book, Lesson/Page, Word, Placement Slot, Defect Description) for the owner to produce.

---

## 2. Key Inventory & Audit Pointers
- **Existing Replacement Inventory**: Read `docs/art-board/old-crops-replacement-inventory.json` (contains 33 identified high-priority vector-traced and old crops).
- **Canonical Master Mapping**: `docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv` (330 placements across 201 drawing groups; DO NOT change canonical slot IDs).
- **Flipchart Native Registry**: `src/data/flipchart-native-assets.json` and `src/data/flipchart-art-placement.json`.
- **Workbook Catalog & Vocab**: `src/lib/lesson-catalog.ts` (maps all 24 lessons to vocabulary illustration URLs).
- **Verified High-Res Catalog**: `docs/art-board/verified-pc-highres-catalog.json` and `docs/art-board/verified-optimized-catalog.json`.

---

## 3. Execution Runbook

### Step 1: Run Preflight Audit
Execute the existing audit scripts to catalog discrepancies:
```powershell
pnpm audit:art
node scripts/audit-foreground-art.mjs
```

### Step 2: Extract & Crop Authentic Masters
Use Python (`pdf2image`, `pypdfium2`, or `PyMuPDF`) or Node.js (`sharp`) to extract the exact bounding region from `La Cartilla de Gretel Flip Chart.pdf` or `La_Cartilla_de_Gretel_2026_Remaster.pdf`.
Example Python extraction pattern (already proven in Milestone 8 for Page 6):
```python
import fitz # PyMuPDF
doc = fitz.open(r"C:\Users\EJN\Downloads\La Cartilla de Gretel Flip Chart.pdf")
page = doc.load_page(page_index) # 0-indexed
pix = page.get_pixmap(dpi=300)
# crop unsevered bounding box, save to target directory
```

### Step 3: Deploy Optimized Assets
Place newly generated assets into the corresponding directory:
- Flip Chart: `public/cartilla/art/optimized/flipchart-native/p{page:03d}-{slug}.png` and `.webp`
- Workbook: `public/cartilla/art/optimized/workbook/leccion-{n}/{slug}.webp` and `.png`

### Step 4: Update Metadata & Placement Bounds
Update `src/data/flipchart-art-content-bounds.json` and `src/data/flipchart-art-placement.json` to ensure `clip: [0, 0, 0, 0]` so the full illustration renders without CSS clipping.

### Step 5: Verification & Proof Capture
Run all verification suites:
```powershell
pnpm verify:assets
pnpm typecheck
npx vitest run src/routes/__tests__/-index.test.tsx src/components/intro/__tests__/WelcomeSplash.test.tsx src/lib/__tests__/living-motion.test.ts
npx vite build
```
Capture real-route visual evidence using Playwright:
```powershell
node scripts/proofs/living-cover-built-proof.mjs
```

### Step 6: Final Report
Output a clean summary:
- Total images audited.
- Total images successfully replaced and optimized from local PC foundation.
- Verification pass/fail table.
- Exact table of any unlocatable images requiring owner production.
