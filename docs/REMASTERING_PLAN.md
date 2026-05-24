# Cartilla Remastering Plan

## 1. Preserving Originals
- `public/cartilla/images/source/` (and existing `/lessons/` or `/teacher-flipchart/`) stays strictly as original source scans.
- DO NOT overwrite the original scan files.

## 2. Remaster Lanes
Cleaned and remastered copies must be stored separately:
- `public/cartilla/images/remastered/student-workbook/`
- `public/cartilla/images/remastered/teacher-flipchart/`

## 3. Current State (Low-Quality Audit)
The imported pages are direct extractions from the original PDFs or raw photos. While they preserve the honest, original structure, they suffer from common scan issues:
- **Scan lines / seams**: Visible scanning artifacts, binder rings, or shadows.
- **Soft focus / Blurriness**: The original scans lack sharpness, especially around text.
- **Color bleed**: Colors are washed out or inconsistent across pages.
- **Noise**: Compression artifacts, yellowing, and paper texture noise.

## 4. Remaster Vision (First Pass)
The goal is a **professional projection/student-quality target** that remains absolutely faithful to the original style.
- **Faithful to Original**: Do NOT invent new art, characters, or layouts. Do NOT use generic AI cartoon styles. Do NOT copy competitor brand styles.
- **Cleanup**: Remove scan lines/seams, clean page edges, reduce yellowing/noise.
- **Crisp and Legible**: Improve contrast, sharpen text and illustration edges.
- **Color Correction**: Standardize white balance and enhance color balance without bleeding.

## 5. Metadata and Approval Workflow
All remasters are tracked in `src/data/remaster-inventory.json`.
- A remaster must be explicitly marked with `approvalStatus: "approved"` to be displayed in the UI.
- If not approved, the UI will fall back to displaying the original source scan.
- Until a clean image is actually created and visually approved, its status is marked as "Cleanup needed" or "Remaster pending".

## 6. Recommended Pipeline
To achieve the remaster vision without compromising the honest source material, follow this pipeline for each page:
1. **Scan Cleanup**: Remove noise, paper texture, scan lines/seams, binder rings, and background artifacts.
2. **Conservative Upscale**: Use a high-quality, non-hallucinating upscaler (or manual clean vectors) to increase resolution while strictly preserving original lines.
3. **Color Correction**: Standardize white balance and enhance saturation to viewer/projector-friendly levels.
4. **Line Sharpening**: Darken and sharpen structural lines and text borders for legibility.
5. **Manual/Visual Approval**: Every remastered page MUST be manually compared against the original source scan to verify that no fake art or incorrect text was introduced.

