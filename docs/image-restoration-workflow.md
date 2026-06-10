# Image Restoration Workflow
## Digitizing & Restoring *La Cartilla de Gretel* Scan Assets

This document defines the **canonical process** for producing the high-fidelity
`public/hd/` assets used in the student and teacher views. Every page image
served by the app must pass through this pipeline before being committed.

---

## The Core Rule

> **Clean first. Upscale second. Never generate.**
>
> Artifacts must be removed before upscaling — baking scan lines into a 4× upscale
> makes them permanent. AI generation tools (inpainting, generative fill, outpainting)
> are strictly prohibited. Every pixel in the final asset must be traceable to the
> original book artwork.

---

## Source Files

| Source | Physical book | PDF location |
|---|---|---|
| **Libro del alumno** (student workbook) | 61-Libro-del-alumno.pdf | 96 pages |
| **Láminas / flipchart** (teacher classroom cards) | Separate PDF | Variable pages |

Both sources are stored in the project's private assets folder and are not
committed to the public repository.

---

## Pipeline — 5 Steps

### Step 1 — Extract Pages as TIFF

Extract at native scanner resolution. Do not downsample at this stage.

**Adobe Acrobat:**
> File → Export To → Image → TIFF
> Resolution: 300 DPI minimum (use 600 DPI if the scanner supports it)
> Color space: RGB (not CMYK, not Grayscale)

**Command line (pdftoppm):**
```bash
pdftoppm -r 600 -png input.pdf ./output/page
# Produces: page-001.png, page-002.png, etc.
```

Output: one TIFF or PNG per page at full native resolution.

---

### Step 2 — Dewarp & Clean (ScanTailor Advanced)

**Download:** https://github.com/4lex4/scantailor-advanced

ScanTailor is purpose-built for book scans. Use it for:
- Page dewarping (fixes curved pages from book spine)
- Opposite-page bleed-through removal
- Auto color level correction
- Skew/rotation correction

**Settings for color illustration pages:**
- Mode: **Color / Grayscale** (not Black & White — that destroys illustration color)
- Content detection: Auto
- Margins: 0px (preserve full page including illustration edges)
- Output DPI: match input (do not downsample here)

Output: clean, dewarped TIFF per page.

---

### Step 3 — Spot Repair (Photoshop or GIMP)

For remaining artifacts after ScanTailor — dust specks, isolated scan lines,
paper damage — do targeted manual repair only on affected pixels.

**GIMP (free):**
- Filters → G'MIC → Repair → Repair Scanned Document
- Use Healing tool for isolated dust spots
- Do NOT use any AI-assisted fill tools

**Photoshop:**
- Spot Healing Brush (Content-Aware OFF — use Proximity Match only)
- Do NOT use Generative Fill

**Fidelity check:** After repair, compare side-by-side with the original PDF page.
Every line, color, and letter must match. If in doubt, leave the artifact — a minor
scan line is less harmful than an incorrect illustration.

---

### Step 4 — Upscale to Ultra HD

**Recommended: Topaz Gigapixel AI**
- Model: **Illustration / Art** (not Photo, not Standard)
- Scale: 4×
- Suppress noise: Low (0.1–0.2) — avoid over-smoothing flat color fills
- Remove blur: Medium (0.3–0.5)

**Free alternative: Upscayl + RealESRGAN**
- Download: https://upscayl.org (free desktop app, runs locally)
- Model: `RealESRGAN_x4plus_anime_6B`
  - Trained specifically on illustrations and flat color art
  - Best match for children's book illustration style
- Scale: 4×
- Output format: PNG

**Why these models:**
Both use the existing pixels as source of truth — they sharpen and enlarge,
they do not invent. A 300 DPI clean scan at 4× produces an effective ~1200 DPI
equivalent, suitable for both screen and print-quality output.

Output: ultra-HD PNG per page.

---

### Step 5 — Export for Web (WebP + AVIF + JPG)

Generate all three formats from the upscaled PNG for maximum browser compatibility.

**Using @squoosh/cli:**
```bash
npm install -g @squoosh/cli

squoosh-cli \
  --avif '{"cqLevel":18,"speed":4}' \
  --webp '{"quality":90}' \
  --mozjpeg '{"quality":85}' \
  ./upscaled/*.png \
  --output-dir ./public/hd/
```

**Quality targets for illustration/textbook assets:**

| Format | Setting | Notes |
|---|---|---|
| AVIF | cqLevel 16–20 | Best for fine lines and flat color. 18 = sweet spot. |
| WebP | quality 88–92 | Fallback for older browsers. |
| JPG | quality 85 | Last-resort fallback only. |

**Serving in the app** (use `<picture>` for automatic browser selection):
```html
<picture>
  <source srcset="/hd/page-007.avif" type="image/avif" />
  <source srcset="/hd/page-007.webp" type="image/webp" />
  <img
    src="/hd/page-007.jpg"
    alt="Página 7 — Letra M"
    width="1240"
    height="1754"
    loading="lazy"
    decoding="async"
  />
</picture>
```

---

## File Naming Convention

```
public/hd/
  page-001.avif   ← libro del alumno, page 1
  page-001.webp
  page-001.jpg
  page-002.avif
  ...
  page-096.avif
```

Zero-padded to 3 digits. No spaces. No uppercase. Consistent across all formats.

---

## Fidelity Checklist (before committing any page)

- [ ] Dewarped — no visible page curve or skew
- [ ] No scan lines visible at 100% zoom
- [ ] No dust spots or paper artifacts
- [ ] Colors match the physical book (check against PDF at 100%)
- [ ] All text is sharp and readable at screen size
- [ ] All illustration lines are clean — no AA fringing from upscale
- [ ] AVIF, WebP, and JPG all generated
- [ ] `width` and `height` attributes set on every `<img>` tag
- [ ] File naming follows `page-NNN.format` convention

---

## What NOT to Do

- ❌ Do not use AI inpainting, generative fill, or outpainting on any page
- ❌ Do not downsample before cleaning
- ❌ Do not use Black & White mode in ScanTailor (destroys color)
- ❌ Do not commit JPGs without also committing AVIF and WebP versions
- ❌ Do not rename files mid-project (breaks all existing page mappings)
- ❌ Do not exceed cqLevel 22 for AVIF (visible quality loss on fine lines)

---

## Tools Reference

| Tool | Purpose | Cost | URL |
|---|---|---|---|
| ScanTailor Advanced | Dewarp, clean, level | Free | https://github.com/4lex4/scantailor-advanced |
| Upscayl | 4× upscale GUI (RealESRGAN) | Free | https://upscayl.org |
| Topaz Gigapixel AI | 4× upscale (best quality) | Paid | https://topazlabs.com/gigapixel-ai |
| GIMP + G'MIC | Spot repair, scan line removal | Free | https://www.gimp.org |
| @squoosh/cli | AVIF / WebP / JPG export | Free | https://github.com/GoogleChromeLabs/squoosh |
| pdftoppm | PDF → PNG extraction | Free (poppler) | `brew install poppler` |
