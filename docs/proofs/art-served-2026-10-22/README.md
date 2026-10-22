# Artwork Verification Audit Report — 2026-10-22

**Execution Branch:** `jules-9637602260831069411-e0b64339`  
**Base Commit:** `head a310494d`  
**Scope:** Runtime verification of served artwork files and byte hashes across 17 placements for **ARBOL**, **ELEFANTE**, **OVEJA**, and **IGUAL** from `docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv`.

---

## Executive Summary Status Table

| Category | Placement ID | Book & Location | Served File Path | Served SHA256 | Status | Notes |
|---|---|---|---|---|---|---|
| **ARBOL** | WB-S008-OBJ05-ARBOL | Workbook Sheet 8 (Page 2) | `public/cartilla/art/delivery/faithful/384/vocal-a/arbol.webp` | `d3cb678fa30d7bebf0e2b3bcd98a9dd015efc2b3fa1b5633853d95c553f389b1` | **DOES NOT WORK** | Served WebP (`d3cb678f...`) differs from Owner Green Tree Master JPG (`3d3cacdc...`) |
| **ARBOL** | WB-S013-OBJ07-ARBOL | Workbook Sheet 13 (Page 7) | `public/cartilla/art/delivery/faithful/384/vocal-a/arbol.webp` | `d3cb678fa30d7bebf0e2b3bcd98a9dd015efc2b3fa1b5633853d95c553f389b1` | **DOES NOT WORK** | Served WebP (`d3cb678f...`) differs from Owner Green Tree Master JPG (`3d3cacdc...`) |
| **ARBOL** | WB-S022-OBJ09-ARBOL | Workbook Sheet 22 (Page 16) | `public/cartilla/art/delivery/faithful/384/vocal-a/arbol.webp` | `d3cb678fa30d7bebf0e2b3bcd98a9dd015efc2b3fa1b5633853d95c553f389b1` | **DOES NOT WORK** | Served WebP (`d3cb678f...`) differs from Owner Green Tree Master JPG (`3d3cacdc...`) |
| **ELEFANTE** | FC-006-02 | Flip Chart Page 6 (FC 4) | `public/cartilla/art/optimized/flipchart-native/p006-elefante.png` | `c79cd5920de38e1230df82d432184870e7e90a1cd1342d8513eff17ba6216662` | **WORKS** | Serves approved still (`stale-motion-art.json` guard active) |
| **ELEFANTE** | WB-S007-OBJ16-ELEFANTE | Workbook Sheet 7 (Page 1) | `public/cartilla/art/optimized/workbook/leccion-1/elefante.svg` | `3b1e99c87d48172855d0d009e030b9311157353d0aef000f373f6dfaf1f80c98` | **WORKS** | Serves approved still (`stale-motion-art.json` guard active) |
| **ELEFANTE** | WB-S013-OBJ08-ELEFANTE | Workbook Sheet 13 (Page 7) | `public/cartilla/art/delivery/faithful/384/vocal-e/elefante.webp` | `b06c535f9ba3e529adf5840c694f7d9041c17eaf5fb9c62394eb877ce8d40082` | **WORKS** | Serves approved still (`stale-motion-art.json` guard active for vocal-e) |
| **ELEFANTE** | WB-S016-OBJ01-ELEFANTE | Workbook Sheet 16 (Page 10) | `public/cartilla/art/delivery/faithful/384/vocal-e/elefante.webp` | `b06c535f9ba3e529adf5840c694f7d9041c17eaf5fb9c62394eb877ce8d40082` | **WORKS** | Serves approved still (`stale-motion-art.json` guard active for vocal-e) |
| **ELEFANTE** | WB-S017-OBJ02-ELEFANTE | Workbook Sheet 17 (Page 11) | `public/cartilla/art/faithful/vocal-e/elefante.webp` | `27e76b480a87f6c6df4bb08c20f21b7b6b55edf493b39e90073070c56a81d370` | **WORKS** | Serves approved still (`stale-motion-art.json` guard active for vocal-e) |
| **ELEFANTE** | WB-S022-OBJ08-ELEFANTE | Workbook Sheet 22 (Page 16) | `public/cartilla/art/delivery/faithful/384/vocal-e/elefante.webp` | `b06c535f9ba3e529adf5840c694f7d9041c17eaf5fb9c62394eb877ce8d40082` | **WORKS** | Serves approved still (`stale-motion-art.json` guard active for vocal-e) |
| **OVEJA** | FC-004-04 | Flip Chart Page 4 (FC 2) | `public/cartilla/art/optimized/flipchart-native/p004-oveja-alive.svg` | `a6ac32eb0c55272dbac1f260554f3eed9e914c74df8bc6bf74da3257cdfbb252` | **DOES NOT WORK** | Serves stale animated variant (`p004-oveja-alive.svg`). Selection path: `LivingIllustration.tsx` -> `getLivingActor()` in `src/lib/living-actor-registry.ts` |
| **OVEJA** | WB-S007-OBJ15-OVEJA | Workbook Sheet 7 (Page 1) | `public/cartilla/art/optimized/workbook/leccion-1/oveja-alive.svg` | `31fc2e7785dde1be23c69d6948177d0faa301e8661002c289085f986ab58ff31` | **DOES NOT WORK** | Serves stale animated variant (`oveja-alive.svg`). Selection path: `LivingIllustration.tsx` -> `getLivingActor()` in `src/lib/living-actor-registry.ts` |
| **OVEJA** | WB-S010-OBJ06-OVEJA | Workbook Sheet 10 (Page 4) | `public/cartilla/art/delivery/faithful/384/vocal-o/oveja.webp` | `5de9913bccf66200fc795f10aedcd361e550205b164ec57f1b760da6b1973e26` | **WORKS** | Serves approved still (`vocal-o/oveja.webp` guard active in `stale-motion-art.json`) |
| **OVEJA** | WB-S011-OBJ02-OVEJA | Workbook Sheet 11 (Page 5) | `public/cartilla/art/faithful/vocal-o/oveja.webp` | `5ba07a1511c28e7a3ad3db869970a37d8656716367a3c18d10394a29def46a32` | **WORKS** | Serves approved still (`vocal-o/oveja.webp` guard active in `stale-motion-art.json`) |
| **OVEJA** | WB-S013-OBJ05-OVEJA | Workbook Sheet 13 (Page 7) | `public/cartilla/art/delivery/faithful/384/vocal-o/oveja.webp` | `5de9913bccf66200fc795f10aedcd361e550205b164ec57f1b760da6b1973e26` | **WORKS** | Serves approved still (`vocal-o/oveja.webp` guard active in `stale-motion-art.json`) |
| **OVEJA** | WB-S022-OBJ02-OVEJA | Workbook Sheet 22 (Page 16) | `public/cartilla/art/delivery/faithful/384/vocal-o/oveja.webp` | `5de9913bccf66200fc795f10aedcd361e550205b164ec57f1b760da6b1973e26` | **WORKS** | Serves approved still (`vocal-o/oveja.webp` guard active in `stale-motion-art.json`) |
| **IGUAL** | WB-S019-OBJ14-IGUAL | Workbook Sheet 19 (Page 13) | `public/cartilla/art/delivery/faithful/384/vocal-i/igual.webp` | `cc19eefa067f643edd544bb0004bc6e9d387e1c030635ab6ffc496c72fcf5a6d` | **NOT VERIFIED** | Provenance NOT VERIFIED (unknown approval status) |
| **IGUAL** | WB-S020-OBJ04-IGUAL | Workbook Sheet 20 (Page 14) | `public/cartilla/art/faithful/vocal-i/igual.webp` | `1404f51a491aff775d91ee4df54069776ab196df6d983ce416a30d480ea99d42` | **NOT VERIFIED** | Provenance NOT VERIFIED (unknown approval status) |

---

## Detailed Section Findings & Visual Evidence

### 1. ARBOL (Tree) Verification
Owner Master: `public/cartilla/art/owner-intake/2026-10-22/arbol-original-15ec6eb6.jpg`  
Master SHA256: `3d3cacdc82fc24e002e08f4258420c51a88d7806d0a8a681410658966c3607fb`

- **WB-S008-OBJ05-ARBOL**: Serves `public/cartilla/art/delivery/faithful/384/vocal-a/arbol.webp` (SHA256: `d3cb678fa30d7bebf0e2b3bcd98a9dd015efc2b3fa1b5633853d95c553f389b1`). **DOES NOT WORK** (differs from master). [Side-by-side Screenshot](./WB-S008-OBJ05-ARBOL-side-by-side.png)
- **WB-S013-OBJ07-ARBOL**: Serves `public/cartilla/art/delivery/faithful/384/vocal-a/arbol.webp` (SHA256: `d3cb678fa30d7bebf0e2b3bcd98a9dd015efc2b3fa1b5633853d95c553f389b1`). **DOES NOT WORK** (differs from master). [Side-by-side Screenshot](./WB-S013-OBJ07-ARBOL-side-by-side.png)
- **WB-S022-OBJ09-ARBOL**: Serves `public/cartilla/art/delivery/faithful/384/vocal-a/arbol.webp` (SHA256: `d3cb678fa30d7bebf0e2b3bcd98a9dd015efc2b3fa1b5633853d95c553f389b1`). **DOES NOT WORK** (differs from master). [Side-by-side Screenshot](./WB-S022-OBJ09-ARBOL-side-by-side.png)

### 2. ELEFANTE and OVEJA Runtime Selection
- **FC-006-02 (ELEFANTE)**: Serves approved still `public/cartilla/art/optimized/flipchart-native/p006-elefante.png` (SHA256: `c79cd5920de38e1230df82d432184870e7e90a1cd1342d8513eff17ba6216662`). **WORKS**. [Side-by-side Screenshot](./FC-006-02-side-by-side.png)
- **WB-S007-OBJ16-ELEFANTE**: Serves approved still `public/cartilla/art/optimized/workbook/leccion-1/elefante.svg` (SHA256: `3b1e99c87d48172855d0d009e030b9311157353d0aef000f373f6dfaf1f80c98`). **WORKS**. [Side-by-side Screenshot](./WB-S007-OBJ16-ELEFANTE-side-by-side.png)
- **WB-S013-OBJ08-ELEFANTE**: Serves approved still `public/cartilla/art/delivery/faithful/384/vocal-e/elefante.webp` (SHA256: `b06c535f9ba3e529adf5840c694f7d9041c17eaf5fb9c62394eb877ce8d40082`). **WORKS**. [Side-by-side Screenshot](./WB-S013-OBJ08-ELEFANTE-side-by-side.png)
- **WB-S016-OBJ01-ELEFANTE**: Serves approved still `public/cartilla/art/delivery/faithful/384/vocal-e/elefante.webp` (SHA256: `b06c535f9ba3e529adf5840c694f7d9041c17eaf5fb9c62394eb877ce8d40082`). **WORKS**. [Side-by-side Screenshot](./WB-S016-OBJ01-ELEFANTE-side-by-side.png)
- **WB-S017-OBJ02-ELEFANTE**: Serves approved still `public/cartilla/art/faithful/vocal-e/elefante.webp` (SHA256: `27e76b480a87f6c6df4bb08c20f21b7b6b55edf493b39e90073070c56a81d370`). **WORKS**. [Side-by-side Screenshot](./WB-S017-OBJ02-ELEFANTE-side-by-side.png)
- **WB-S022-OBJ08-ELEFANTE**: Serves approved still `public/cartilla/art/delivery/faithful/384/vocal-e/elefante.webp` (SHA256: `b06c535f9ba3e529adf5840c694f7d9041c17eaf5fb9c62394eb877ce8d40082`). **WORKS**. [Side-by-side Screenshot](./WB-S022-OBJ08-ELEFANTE-side-by-side.png)
- **FC-004-04 (OVEJA)**: Serves stale animated variant `public/cartilla/art/optimized/flipchart-native/p004-oveja-alive.svg` (SHA256: `a6ac32eb0c55272dbac1f260554f3eed9e914c74df8bc6bf74da3257cdfbb252`). **DOES NOT WORK**. Code path: `LivingIllustration.tsx` -> `getLivingActor()` in `src/lib/living-actor-registry.ts` -> returns `p004-oveja-alive.svg` because `p004-oveja.png` is missing from `src/data/stale-motion-art.json`. [Side-by-side Screenshot](./FC-004-04-side-by-side.png)
- **WB-S007-OBJ15-OVEJA**: Serves stale animated variant `public/cartilla/art/optimized/workbook/leccion-1/oveja-alive.svg` (SHA256: `31fc2e7785dde1be23c69d6948177d0faa301e8661002c289085f986ab58ff31`). **DOES NOT WORK**. Code path: `LivingIllustration.tsx` -> `getLivingActor()` in `src/lib/living-actor-registry.ts` -> returns `oveja-alive.svg` because `oveja.svg` is missing from `src/data/stale-motion-art.json`. [Side-by-side Screenshot](./WB-S007-OBJ15-OVEJA-side-by-side.png)
- **WB-S010-OBJ06-OVEJA**: Serves approved still `public/cartilla/art/delivery/faithful/384/vocal-o/oveja.webp` (SHA256: `5de9913bccf66200fc795f10aedcd361e550205b164ec57f1b760da6b1973e26`). **WORKS**. [Side-by-side Screenshot](./WB-S010-OBJ06-OVEJA-side-by-side.png)
- **WB-S011-OBJ02-OVEJA**: Serves approved still `public/cartilla/art/faithful/vocal-o/oveja.webp` (SHA256: `5ba07a1511c28e7a3ad3db869970a37d8656716367a3c18d10394a29def46a32`). **WORKS**. [Side-by-side Screenshot](./WB-S011-OBJ02-OVEJA-side-by-side.png)
- **WB-S013-OBJ05-OVEJA**: Serves approved still `public/cartilla/art/delivery/faithful/384/vocal-o/oveja.webp` (SHA256: `5de9913bccf66200fc795f10aedcd361e550205b164ec57f1b760da6b1973e26`). **WORKS**. [Side-by-side Screenshot](./WB-S013-OBJ05-OVEJA-side-by-side.png)
- **WB-S022-OBJ02-OVEJA**: Serves approved still `public/cartilla/art/delivery/faithful/384/vocal-o/oveja.webp` (SHA256: `5de9913bccf66200fc795f10aedcd361e550205b164ec57f1b760da6b1973e26`). **WORKS**. [Side-by-side Screenshot](./WB-S022-OBJ02-OVEJA-side-by-side.png)

### 3. IGUAL Verification
- **WB-S019-OBJ14-IGUAL**: Serves `public/cartilla/art/delivery/faithful/384/vocal-i/igual.webp` (SHA256: `cc19eefa067f643edd544bb0004bc6e9d387e1c030635ab6ffc496c72fcf5a6d`). **NOT VERIFIED** (provenance unknown approval status). [Side-by-side Screenshot](./WB-S019-OBJ14-IGUAL-side-by-side.png)
- **WB-S020-OBJ04-IGUAL**: Serves `public/cartilla/art/faithful/vocal-i/igual.webp` (SHA256: `1404f51a491aff775d91ee4df54069776ab196df6d983ce416a30d480ea99d42`). **NOT VERIFIED** (provenance unknown approval status). [Side-by-side Screenshot](./WB-S020-OBJ04-IGUAL-side-by-side.png)
