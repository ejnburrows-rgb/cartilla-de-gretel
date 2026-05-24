# Teacher Flipchart Remaster Plan

## 1. Source Material
- **Source File Found**: `C:\Users\enovo\OneDrive\Desktop\cartilla-de-gretel-direct-vercel\Cartilla 1 Interactivos\La Cartilla de Gretel Flip Chart.pdf`
- **Total Pages Imported**: 62 pages.
- **Import Location**: `public/cartilla/images/teacher-flipchart/teacher-page-XX.jpg`

## 2. Current State (Low-Quality Audit)
The imported pages are direct extractions from the original PDF at 2x resolution. While they preserve the honest, original structure, they suffer from common scan issues:
- **Soft focus / Blurriness**: The original scans lack sharpness, especially around text.
- **Color bleed**: Colors are slightly washed out or inconsistent across pages.
- **Artifacts**: Minor compression artifacts and paper texture noise.

## 3. Remaster Vision
The goal for the projected teacher flipchart is a **professional classroom presentation quality** that remains absolutely faithful to the original style.
- **Faithful to Original**: Do NOT invent new art, characters, or layouts. Do NOT use generic AI cartoon styles. Do NOT copy competitor brand styles.
- **Crisp and Legible**: Sharpen all text and structural lines so they are readable from the back of a classroom when projected.
- **Clean Color Palette**: Correct the white balance so the "paper" background is consistently neutral (not yellow or gray), and colors are vibrant without bleeding.
- **Subtle Depth**: Add very subtle depth (e.g., slight drop shadows or parallax layering) *only* if it enhances the physical feel of the chart without altering the original illustrations.

## 4. Recommended Pipeline
To achieve the remaster vision without compromising the honest source material, follow this pipeline for each page:
1. **Scan Cleanup**: Remove noise, paper texture, and background artifacts.
2. **Upscale**: Use a high-quality, non-hallucinating upscaler (e.g., Topaz Gigapixel or a conservative ESRGAN model) to increase resolution while preserving original lines.
3. **Color Correction**: Standardize white balance and enhance saturation to projector-friendly levels.
4. **Line Cleanup**: Darken and sharpen structural lines and text borders.
5. **Optional Depth/Parallax**: Separate foreground elements into distinct layers if dynamic presentation features are added later.
6. **Manual Approval**: Every remastered page MUST be manually compared against the original source scan to verify that no fake art or incorrect text was introduced.
