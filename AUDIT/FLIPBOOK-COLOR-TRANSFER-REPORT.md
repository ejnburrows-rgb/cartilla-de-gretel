# FLIPBOOK COLOR TRANSFER REPORT — Worker D

## Terminal
FLIPBOOK_COLOR_TRANSFER_COMPLETE

## Method
1. Join via `workbook_flipchart_join.csv` + visual QA of flipchart sources
2. Prefer staged flipchart-color crops when contentful
3. Else re-crop from flipchart/exercise source with verified boxes / teal-frame detection
4. Palettes from real pixels only (empty for monochrome)
5. Full-page colorized export only when scan already has real color (no invented fills)

## Color map

| slug | confidence | method | qa_verdict | output |
|------|------------|--------|------------|--------|
| ojos | MEDIUM | o-page-4-frame-interior | FIXED_FROM_SOURCE | public/cartilla/art/color/workbook/ojos.webp |
| oreja | HIGH | faithful-verified + o-page-3 crosscheck | FIXED_FROM_SOURCE | public/cartilla/art/color/workbook/oreja.webp |
| abeja | UNMATCHED | a-page-5-frame-interior-lineart | FIXED_FROM_SOURCE | public/cartilla/art/color/workbook/abeja.webp |
| ola | UNMATCHED | o-page-4-frame-interior-monochrome | FIXED_FROM_SOURCE | public/cartilla/art/color/workbook/ola.webp |
| oso | HIGH | staged-flipchart-color | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/oso.webp |
| olla | HIGH | staged-flipchart-color | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/olla.webp |
| oveja | HIGH | staged-flipchart-color-label-trimmed | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/oveja.webp |
| arco | HIGH | staged-flipchart-color | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/arco.webp |
| maiz | HIGH | staged-flipchart-color | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/maiz.webp |
| traje | HIGH | staged-flipchart-color | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/traje.webp |
| iglu | HIGH | staged-flipchart-color | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/iglu.webp |
| uvas | HIGH | staged-flipchart-color | VERIFIED_UPRIGHT | public/cartilla/art/color/workbook/uvas.webp |


## Page colorization

| page | status | output |
|------|--------|--------|
| 1 | SKIPPED_MONOCHROME_NO_FAITHFUL_TRANSFER | — |
| 4 | ORIENTATION_FIXED_QA_ONLY | — |
| 19 | SOURCE_ALREADY_COLOR | public/cartilla/pages/colorized/page-019.webp |
| 23 | SOURCE_ALREADY_COLOR | public/cartilla/pages/colorized/page-023.webp |
| 27 | SOURCE_ALREADY_COLOR | public/cartilla/pages/colorized/page-027.webp |
| 39 | SOURCE_ALREADY_COLOR | public/cartilla/pages/colorized/page-039.webp |
| 45 | SOURCE_ALREADY_COLOR | public/cartilla/pages/colorized/page-045.webp |
| 90 | SOURCE_ALREADY_COLOR | public/cartilla/pages/colorized/page-090.webp |


## Counts
- Transfer entries: 12
- HIGH/MEDIUM confidence: 10
- Colorized pages emitted: 6
- Contact sheet: `generated/color-qa/flipbook-transfer/contact-pages.png`

## Artifacts
- `generated/flipbook-to-workbook-color-map.json`
- `generated/page-colorized-manifest.json`
- `generated/flipbook-palettes/`
- `public/cartilla/art/color/workbook/`
- `public/cartilla/pages/colorized/` (only faithful color scans)
