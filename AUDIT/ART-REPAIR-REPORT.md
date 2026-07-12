# ART REPAIR AUDIT REPORT

## Page 4 Asset Verification
| Asset | Source Region | Method | Upright NCC | Flipped NCC | Verdict |
|---|---|---|---|---|---|
| `/cartilla/art/faithful/vocal-i/iglu.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.401 | 0.359 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-o/oso.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.441 | 0.493 | FIXED (Rotated 180) |
| `/cartilla/art/faithful/leccion-1/maiz.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.649 | 0.616 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-o/oveja.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.325 | 0.304 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-a/alas.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.173 | 0.172 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-o/oreja.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.401 | 0.445 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-o/olla.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.420 | 0.494 | FIXED (Rotated 180) |
| `/cartilla/art/faithful/vocal-u/uvas.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.452 | 0.491 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-o/ocho.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.442 | 0.438 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-u/uno.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.375 | 0.389 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-a/arana.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.455 | 0.462 | UNPROVABLE (Gap < 0.05) |
| `/cartilla/art/faithful/vocal-o/oso.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.494 | 0.441 | VERIFIED-UPRIGHT |
| `/cartilla/art/faithful/vocal-o/ojos.webp` | `page-004.png` | MatchTemplate (0.25x scale) | 0.964 | 0.578 | VERIFIED-UPRIGHT |

## Additional Repairs
| Asset | Notes |
|---|---|
| `vocal-o/ojos.webp` | Clean high-resolution re-crop from workbook `page-004.png` upright scan |
| `vocal-o/oreja.webp` | Extracted from flipchart `o-page-3.jpg` using workbook template matching |
| `vocal-a/abeja.webp` | Extracted from flipchart `a-page-4.jpg` using workbook template matching |

All before/after and proof side-by-side images are saved in `generated/art-repair-qa/`.