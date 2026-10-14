# MASTER MAPPING — source-evidenced artwork availability (2026-10-14)

**Working evidence, not a production install or owner approval.** This file is generated from the existing PR #751 artifacts at `9525e06` plus direct source image verification of the historically misleading `PEZ` IDs. It does not repeat the four completed artwork audits.

- [330 placement rows, explicit source, destination, crop, selected source SHA, runtime pointer, quality and proof](MASTER-MAPPING.csv) — machine-readable master; all 330 unique IDs accounted for.
- [Full adjudication and provenance](availability-inventory.json) — existing authoritative evidence for every historical candidate and per-placement decision.
- [Side-by-side original and proposed masters](availability-inventory.md); [108 original references requiring optimization](missing-originals.md); [nine corrected-crop SHA proofs](missing-originals/provenance.json).
- [Integrity check](validate-availability.py); [numerical evidence](availability-validation.json).

## Current classification — artwork availability, not integration

| Class | Drawing groups | Placements |
|---|---:|---:|
| READY — optimized faithful drawing exists | 90 | 186 |
| NEEDS OPTIMIZATION — original reference exists, standalone master not ready | 108 | 141 |
| UNRESOLVED — frontmatter composite separation | 3 | 3 |

**115** exact oriented placement/source-file matches were verified in the existing audit. **71 READY placements** rely on an existing group master but have no individual exact selected file. **Eight selected masters** have archival paths on the owner's local computer, not GitHub production paths. Production approval and runtime integration remain unverified; no automatic production overwrites.

**Critical semantic identity:** `DRAW-WB-10-1` is an **airplane (avión)** shown in the actual source crop (`crops/WB-S019-OBJ02-PEZ.png`) and existing selected preview. All five `PEZ` placement filenames are misleading historical labels; they must remain unchanged as IDs, and no renaming to *pez* is authorized. This resolves a mistaken generated mapping recommendation without inventing a new match.

**Unknowns:** `FC-FRONT-001`, `WB-FRONT-001`, `WB-FRONT-003` have unresolved composite boundaries; the 50 withheld hashes have no recoverable artwork associations, not evidence that each corresponding colored drawing is missing.

## Representative originals and selected masters

These rows index groups; inspect the CSV for all 330 independent placement-level records and their current runtime/approval fields. An image reference under `crops/` or `missing-originals/` is **source reference artwork**, not a production-ready optimized image.

| Drawing group | Identity | Class | Placements | Verified original reference | Matched master / current limitation |
|---|---|---|---:|---|---|
| `DRAW-WB-01-1` | abanico | READY | 4 | [original](crops/WB-S007-OBJ03-ABANICO.png) | [abanico.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/abanico.svg) |
| `DRAW-WB-02-1` | abeja | READY | 7 | [original](crops/WB-S007-OBJ19-ABEJA.png) | [abeja.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/abeja.svg) |
| `DRAW-WB-06-1` | arana | READY | 3 | [original](crops/WB-S009-OBJ03-ARANA.png) | [p005-arana.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-arana.png) |
| `DRAW-WB-10-1` | avión | READY | 5 | [original](crops/WB-S007-OBJ06-PEZ.png) | [pez.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/pez.webp) |
| `DRAW-WB-15-1` | erizo | READY | 3 | [original](crops/WB-S016-OBJ06-ERIZO.png) | [p006-erizo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-erizo.png) |
| `DRAW-WB-16-1` | escalera | READY | 4 | [original](crops/WB-S007-OBJ09-ESCALERA.png) | [escalera.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/escalera.svg) |
| `DRAW-WB-18-1` | escuela | READY | 2 | [original](crops/WB-S007-OBJ11-ESCUELA.png) | [escuela.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/escuela.svg) |
| `DRAW-WB-20-1` | estrella | READY | 7 | [original](crops/WB-S008-OBJ06-ESTRELLA.png) | [estrella.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-e/estrella.webp) |
| `DRAW-WB-21-1` | globo | READY | 1 | [original](crops/WB-S008-OBJ14-GLOBO.png) | [globo.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/globo.webp) |
| `DRAW-WB-23-1` | iglu | READY | 7 | [original](crops/WB-S010-OBJ02-IGLU.png) | [p007-iglu.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-iglu.png) |
| `DRAW-WB-29-1` | insecto | READY | 3 | [original](crops/WB-S019-OBJ15-INSECTO.png) | [p007-insecto.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-insecto.png) |
| `DRAW-WB-31-1` | isla | READY | 3 | [original](crops/WB-S007-OBJ05-ISLA.png) | [isla.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/isla.svg) |
| `DRAW-WB-32-1` | libro | READY | 1 | [original](crops/WB-S008-OBJ03-LIBRO.png) | [libro.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/libro.webp) |
| `DRAW-WB-33-1` | maiz | READY | 5 | [original](crops/WB-S007-OBJ18-MAIZ.png) | [maiz.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/maiz.svg) |
| `DRAW-WB-35-1` | ocho | READY | 3 | [original](crops/WB-S009-OBJ02-OCHO.png) | [ocho.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-o/ocho.webp) |
| `DRAW-WB-36-1` | ojos | READY | 1 | [original](crops/WB-S007-OBJ17-OJOS.png) | [ojos.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/ojos.svg) |
| `DRAW-WB-38-1` | olla | READY | 6 | [original](crops/WB-S007-OBJ20-OLLA.png) | [olla.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/olla.svg) |
| `DRAW-WB-39-1` | oreja | READY | 4 | [original](crops/WB-S007-OBJ12-OREJA.png) | [oreja.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/oreja.svg) |
| `DRAW-WB-41-1` | oso | READY | 13 | [original](crops/WB-S007-OBJ04-OSO-1.png) | [p004-oso.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p004-oso.png) |
| `DRAW-WB-42-1` | oveja | READY | 6 | [original](crops/WB-S007-OBJ15-OVEJA.png) | [oveja.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/oveja.svg) |
| `DRAW-WB-47-1` | una | READY | 6 | [original](crops/WB-S007-OBJ14-UNA.png) | archive: uña.webp (not integrated) |
| `DRAW-WB-48-1` | unicornio | READY | 4 | [original](crops/WB-S016-OBJ10-UNICORNIO.png) | archive: p8_asset04.png (not integrated) |
| `DRAW-WB-49-1` | uniforme | READY | 8 | [original](crops/WB-S007-OBJ13-UNIFORME-2.png) | archive: p8_asset05.png (not integrated) |
| `DRAW-WB-50-1` | uno | READY | 10 | [original](crops/WB-S007-OBJ10-UNO.png) | [uno.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/uno.svg) |
| `DRAW-WB-51-1` | urraca | READY | 3 | [original](crops/WB-S016-OBJ12-URRACA.png) | archive: p8_asset03.png (not integrated) |
| `DRAW-FC-003-01` | Ilustración de la página 3 | READY | 1 | [original](crops/FC-003-01.png) | [p003-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p003-scene.png) |
| `DRAW-FC-003-02` | avión | READY | 1 | [original](crops/FC-003-02.png) | [avion.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/avion.svg) |
| `DRAW-FC-003-03` | escoba | READY | 1 | [original](crops/FC-003-03.png) | [escoba.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-e/escoba.webp) |
| `DRAW-FC-003-04` | imán | READY | 2 | [original](crops/FC-003-04.png) | [p007-iman.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-iman.png) |
| `DRAW-FC-003-06` | uña | READY | 1 | [original](crops/FC-003-06.png) | [una.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/una.svg) |
| `DRAW-FC-004-01` | Ilustración de la página 4 | READY | 1 | [original](crops/FC-004-01.png) | archive: p4_scene.png (not integrated) |
| `DRAW-FC-005-01` | Ilustración de la página 5 | READY | 1 | [original](crops/FC-005-01.png) | [p005-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-scene.png) |
| `DRAW-FC-005-03` | anillo | READY | 1 | [original](crops/FC-005-03.png) | [p005-anillo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-anillo.png) |
| `DRAW-FC-005-05` | ala | READY | 1 | [original](crops/FC-005-05.png) | [p005-ala.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-ala.png) |
| `DRAW-FC-005-06` | aro | READY | 1 | [original](crops/FC-005-06.png) | [aro.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-a/aro.webp) |
| `DRAW-FC-006-01` | Ilustración de la página 6 | READY | 1 | [original](crops/FC-006-01.png) | [p006-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-scene.png) |
| `DRAW-FC-006-02` | elefante | READY | 1 | [original](crops/FC-006-02.png) | [p006-elefante.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-elefante.png) |
| `DRAW-FC-006-03` | espejo | READY | 1 | [original](crops/FC-006-03.png) | [p006-espejo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-espejo.png) |
| `DRAW-FC-007-01` | Ilustración de la página 7 | READY | 1 | [original](crops/FC-007-01.png) | [p007-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-scene.png) |
| `DRAW-FC-008-01` | Ilustración de la página 8 | READY | 1 | [original](crops/FC-008-01.png) | archive: p8_scene.png (not integrated) |
| `DRAW-FC-008-03` | uva | READY | 1 | [original](crops/FC-008-03.png) | archive: p8_asset02.png (not integrated) |
| `DRAW-FC-008-07` | Ulises | READY | 1 | [original](crops/FC-008-07.png) | [p008-ulises.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p008-ulises.png) |
| `DRAW-FC-009-01` | Ilustración de la página 9 | READY | 1 | [original](crops/FC-009-01.png) | [p009-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p009-scene.png) |
| `DRAW-FC-009-02` | mamá | READY | 1 | [original](crops/FC-009-02.png) | [mama.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-7-m/mama.webp) |
| `DRAW-FC-012-03` | pie | READY | 1 | [original](crops/FC-012-03.png) | [p012-pie.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p012-pie.png) |
| `DRAW-FC-012-06` | pomo | READY | 1 | [original](crops/FC-012-06.png) | [p012-pomo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p012-pomo.png) |
| `DRAW-FC-015-02` | Sesi | READY | 1 | [original](crops/FC-015-02.png) | [p015-sesi.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p015-sesi.png) |
| `DRAW-FC-015-03` | sopa | READY | 1 | [original](crops/FC-015-03.png) | [p015-sopa.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p015-sopa.png) |
| `DRAW-FC-015-04` | sapo | READY | 1 | [original](crops/FC-015-04.png) | [p015-sapo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p015-sapo.png) |
| `DRAW-FC-018-02` | tomate | READY | 1 | [original](crops/FC-018-02.png) | [p018-tomate.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p018-tomate.webp) |
| `DRAW-FC-018-03` | tapa | READY | 1 | [original](crops/FC-018-03.png) | [p018-tapa.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p018-tapa.webp) |
| `DRAW-FC-018-04` | topo | READY | 1 | [original](crops/FC-018-04.png) | [p018-topo.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p018-topo.webp) |
| `DRAW-FC-021-02` | Didi | READY | 1 | [original](crops/FC-021-02.png) | [p021-didi.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p021-didi.webp) |
| `DRAW-FC-021-05` | doce | READY | 1 | [original](crops/FC-021-05.png) | [p021-doce.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p021-doce.webp) |
| `DRAW-FC-024-02` | maleta | READY | 1 | [original](crops/FC-024-02.png) | [p024-maleta.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-maleta.webp) |
| `DRAW-FC-024-03` | lata | READY | 1 | [original](crops/FC-024-03.png) | [p024-lata.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-lata.webp) |
| `DRAW-FC-024-04` | Luli | READY | 1 | [original](crops/FC-024-04.png) | [p024-luli.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-luli.webp) |
| `DRAW-FC-024-05` | loma | READY | 1 | [original](crops/FC-024-05.png) | [p024-loma.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-loma.webp) |
| `DRAW-FC-024-06` | Lala | READY | 1 | [original](crops/FC-024-06.png) | [p024-lala.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-lala.png) |
| `DRAW-FC-027-02` | nido | READY | 1 | [original](crops/FC-027-02.png) | [p027-nido.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p027-nido.png) |
| `DRAW-FC-027-03` | nudo | READY | 1 | [original](crops/FC-027-03.png) | [p027-nudo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p027-nudo.png) |
| `DRAW-FC-033-02` | Beba | READY | 1 | [original](crops/FC-033-02.png) | [p033-beba.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p033-beba.png) |
| `DRAW-FC-033-03` | Bubi | READY | 2 | [original](crops/FC-033-03.png) | [p033-bubi.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p033-bubi.png) |
| `DRAW-FC-033-05` | bota | READY | 1 | [original](crops/FC-033-05.png) | [bota.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-15-b/bota.webp) |
| `DRAW-FC-036-01` | Ilustración de la página 36 | READY | 1 | [original](crops/FC-036-01.png) | [p036-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-scene.png) |
| `DRAW-FC-036-02` | vaso | READY | 1 | [original](crops/FC-036-02.png) | [p036-vaso.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-vaso.png) |
| `DRAW-FC-036-03` | vela | READY | 1 | [original](crops/FC-036-03.png) | [p036-vela.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-vela.png) |
| `DRAW-FC-036-04` | Vita | READY | 1 | [original](crops/FC-036-04.png) | [p036-vita.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-vita.png) |
| `DRAW-FC-039-02` | rana | READY | 1 | [original](crops/FC-039-02.png) | [p039-rana.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p039-rana.png) |
| `DRAW-FC-039-03` | remos | READY | 1 | [original](crops/FC-039-03.png) | [p039-remos.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p039-remos.png) |
| `DRAW-FC-042-01` | Ilustración de la página 42 | READY | 1 | [original](crops/FC-042-01.png) | [p042-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p042-scene.png) |
| `DRAW-FC-042-03` | carrusel | READY | 1 | [original](crops/FC-042-03.png) | [p042-carrusel.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p042-carrusel.png) |
| `DRAW-FC-042-04` | torre | READY | 1 | [original](crops/FC-042-04.png) | [torre.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-18-rr/torre.webp) |
| `DRAW-FC-042-05` | barril | READY | 1 | [original](crops/FC-042-05.png) | [barril.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-18-rr/barril.webp) |
| `DRAW-FC-042-06` | Tierra | READY | 1 | [original](crops/FC-042-06.png) | [tierra.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-18-rr/tierra.webp) |
| `DRAW-FC-045-02` | gaveta | READY | 1 | [original](crops/FC-045-02.png) | [p045-gaveta.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p045-gaveta.png) |
| `DRAW-FC-045-03` | gusano | READY | 1 | [original](crops/FC-045-03.png) | [p045-gusano.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p045-gusano.png) |
| `DRAW-FC-045-05` | gorra | READY | 1 | [original](crops/FC-045-05.png) | [p045-gorra.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p045-gorra.png) |
| `DRAW-FC-048-02` | foto | READY | 1 | [original](crops/FC-048-02.png) | [p048-foto.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p048-foto.png) |
| `DRAW-FC-048-03` | fideos | READY | 1 | [original](crops/FC-048-03.png) | [p048-fideos.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p048-fideos.png) |
| `DRAW-FC-051-02` | jicotea | READY | 1 | [original](crops/FC-051-02.png) | [p051-jicotea.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p051-jicotea.png) |
| `DRAW-FC-051-03` | jugo | READY | 1 | [original](crops/FC-051-03.png) | [p051-jugo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p051-jugo.png) |
| `DRAW-FC-051-05` | ajo | READY | 1 | [original](crops/FC-051-05.png) | [p051-ajo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p051-ajo.png) |
| `DRAW-FC-054-02` | cuna | READY | 1 | [original](crops/FC-054-02.png) | [p054-cuna.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p054-cuna.png) |
| `DRAW-FC-056-01` | Ilustración de la página 56 | READY | 1 | [original](crops/FC-056-01.png) | [p056-caramelos.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p056-caramelos.webp) |
| `DRAW-FC-057-02` | yate | READY | 1 | [original](crops/FC-057-02.png) | [p057-yate.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p057-yate.png) |
| `DRAW-FC-057-03` | yema | READY | 1 | [original](crops/FC-057-03.png) | [p057-yema.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p057-yema.png) |
| `DRAW-FC-057-04` | Yayita | READY | 1 | [original](crops/FC-057-04.png) | [p057-yayita.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p057-yayita.png) |
| `DRAW-FC-060-02` | zapato | READY | 1 | [original](crops/FC-060-02.png) | [p060-zapato.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p060-zapato.png) |
| `DRAW-FC-060-06` | Zulema | READY | 1 | [original](crops/FC-060-06.png) | archive: p60_asset05.png (not integrated) |
| `DRAW-WB-03-1` | abrigo | NEEDS OPTIMIZATION | 2 | [original](crops/WB-S007-OBJ01-UNIFORME-1.png) | none; source only |
| `DRAW-WB-04-1` | aguja | NEEDS OPTIMIZATION | 3 | [original](missing-originals/WB-S013-OBJ15-AGUJA.png) | none; source only |
| `DRAW-WB-05-1` | ala | NEEDS OPTIMIZATION | 2 | [original](crops/WB-S010-OBJ07-ALA.png) | none; source only |
| `DRAW-WB-05-2` | ala | NEEDS OPTIMIZATION | 3 | [original](crops/WB-S011-OBJ08-ALA.png) | none; source only |
| `DRAW-WB-07-1` | arbol | NEEDS OPTIMIZATION | 3 | [original](crops/WB-S008-OBJ05-ARBOL.png) | none; source only |
| `DRAW-WB-08-1` | ardilla | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S013-OBJ12-ARDILLA.png) | none; source only |
| `DRAW-WB-09-1` | aro | NEEDS OPTIMIZATION | 3 | [original](crops/WB-S007-OBJ08-ARO.png) | none; source only |
| `DRAW-WB-09-2` | aro | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ01-ARO.png) | none; source only |
| `DRAW-WB-11-1` | carro | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ12-CARRO.png) | none; source only |
| `DRAW-WB-13-1` | dulce | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ15-DULCE.png) | none; source only |
| `DRAW-WB-14-1` | elefante | NEEDS OPTIMIZATION | 5 | [original](crops/WB-S007-OBJ16-ELEFANTE.png) | none; source only |
| `DRAW-WB-17-1` | escoba | NEEDS OPTIMIZATION | 2 | [original](crops/WB-S009-OBJ05-ESCOBA.png) | none; source only |
| `DRAW-WB-18-2` | escuela | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ04-ESCUELA.png) | none; source only |
| `DRAW-WB-19-1` | espejo | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S016-OBJ15-ESPEJO.png) | none; source only |
| `DRAW-WB-22-1` | iglesia | NEEDS OPTIMIZATION | 1 | [original](missing-originals/WB-S009-OBJ01-IGLESIA.png) | none; source only |
| `DRAW-WB-24-1` | igual | NEEDS OPTIMIZATION | 2 | [original](crops/WB-S019-OBJ14-IGUAL.png) | none; source only |
| `DRAW-WB-25-1` | iguana | NEEDS OPTIMIZATION | 2 | [original](crops/WB-S019-OBJ03-IGUANA.png) | none; source only |
| `DRAW-WB-26-1` | iman | NEEDS OPTIMIZATION | 6 | [original](crops/WB-S007-OBJ02-IMAN-1.png) | none; source only |
| `DRAW-WB-28-1` | indio | NEEDS OPTIMIZATION | 5 | [original](crops/FC-007-04.png) | none; source only |
| `DRAW-WB-30-1` | invierno | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S019-OBJ08-INVIERNO.png) | none; source only |
| `DRAW-WB-34-1` | manzana | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ02-MANZANA.png) | none; source only |
| `DRAW-WB-36-2` | ojos | NEEDS OPTIMIZATION | 3 | [original](crops/WB-S010-OBJ16-OJOS.png) | none; source only |
| `DRAW-WB-37-1` | ola | NEEDS OPTIMIZATION | 3 | [original](crops/WB-S010-OBJ01-OLA.png) | none; source only |
| `DRAW-WB-40-1` | oruga | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S013-OBJ02-ORUGA.png) | none; source only |
| `DRAW-WB-43-1` | pajaro | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ10-PAJARO.png) | none; source only |
| `DRAW-WB-44-1` | pera | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ09-PERA.png) | none; source only |
| `DRAW-WB-46-1` | taza | NEEDS OPTIMIZATION | 1 | [original](crops/WB-S008-OBJ07-TAZA.png) | none; source only |
| `DRAW-WB-52-1` | uva | NEEDS OPTIMIZATION | 3 | [original](crops/WB-S010-OBJ10-UVA.png) | none; source only |
| `DRAW-FC-004-03` | Oto | NEEDS OPTIMIZATION | 1 | [original](crops/FC-004-03.png) | none; source only |
| `DRAW-FC-005-07` | Ana | NEEDS OPTIMIZATION | 1 | [original](crops/FC-005-07.png) | none; source only |
| `DRAW-FC-006-04` | Ema | NEEDS OPTIMIZATION | 1 | [original](crops/FC-006-04.png) | none; source only |
| `DRAW-FC-007-07` | Irma | NEEDS OPTIMIZATION | 1 | [original](crops/FC-007-07.png) | none; source only |
| `DRAW-FC-009-03` | amo | NEEDS OPTIMIZATION | 1 | [original](crops/FC-009-03.png) | none; source only |
| `DRAW-FC-009-04` | mima | NEEDS OPTIMIZATION | 2 | [original](crops/FC-009-04.png) | none; source only |
| `DRAW-FC-009-05` | Meme | NEEDS OPTIMIZATION | 1 | [original](crops/FC-009-05.png) | none; source only |
| `DRAW-FC-009-06` | Mumi | NEEDS OPTIMIZATION | 1 | [original](crops/FC-009-06.png) | none; source only |
| `DRAW-FC-012-01` | Ilustración de la página 12 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-012-01.png) | none; source only |
| `DRAW-FC-012-02` | papá | NEEDS OPTIMIZATION | 1 | [original](crops/FC-012-02.png) | none; source only |
| `DRAW-FC-012-04` | Pepe | NEEDS OPTIMIZATION | 1 | [original](crops/FC-012-04.png) | none; source only |
| `DRAW-FC-012-05` | puma | NEEDS OPTIMIZATION | 1 | [original](crops/FC-012-05.png) | none; source only |
| `DRAW-FC-014-01` | Ilustración de la página 14 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-014-01.png) | none; source only |
| `DRAW-FC-015-01` | Ilustración de la página 15 | NEEDS OPTIMIZATION | 1 | [original](missing-originals/FC-015-01.png) | none; source only |
| `DRAW-FC-015-05` | pisa | NEEDS OPTIMIZATION | 1 | [original](crops/FC-015-05.png) | none; source only |
| `DRAW-FC-015-06` | Susi | NEEDS OPTIMIZATION | 1 | [original](crops/FC-015-06.png) | none; source only |
| `DRAW-FC-017-01` | Ilustración de la página 17 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-017-01.png) | none; source only |
| `DRAW-FC-018-01` | Ilustración de la página 18 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-018-01.png) | none; source only |
| `DRAW-FC-018-05` | tipi | NEEDS OPTIMIZATION | 1 | [original](missing-originals/FC-018-05.png) | none; source only |
| `DRAW-FC-018-06` | Tuto | NEEDS OPTIMIZATION | 1 | [original](crops/FC-018-06.png) | none; source only |
| `DRAW-FC-020-01` | Ilustración de la página 20 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-020-01.png) | none; source only |
| `DRAW-FC-021-01` | Ilustración de la página 21 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-021-01.png) | none; source only |
| `DRAW-FC-021-03` | dados | NEEDS OPTIMIZATION | 1 | [original](crops/FC-021-03.png) | none; source only |
| `DRAW-FC-021-04` | dedo | NEEDS OPTIMIZATION | 1 | [original](crops/FC-021-04.png) | none; source only |
| `DRAW-FC-021-06` | Dunia | NEEDS OPTIMIZATION | 1 | [original](crops/FC-021-06.png) | none; source only |
| `DRAW-FC-023-01` | Ilustración de la página 23 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-023-01.png) | none; source only |
| `DRAW-FC-024-01` | Ilustración de la página 24 | NEEDS OPTIMIZATION | 1 | [original](missing-originals/FC-024-01.png) | none; source only |
| `DRAW-FC-026-01` | Ilustración de la página 26 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-026-01.png) | none; source only |
| `DRAW-FC-027-01` | Ilustración de la página 27 | NEEDS OPTIMIZATION | 1 | [original](missing-originals/FC-027-01.png) | none; source only |
| `DRAW-FC-027-04` | mono | NEEDS OPTIMIZATION | 1 | [original](crops/FC-027-04.png) | none; source only |
| `DRAW-FC-027-05` | Napi | NEEDS OPTIMIZATION | 1 | [original](crops/FC-027-05.png) | none; source only |
| `DRAW-FC-027-06` | tenedor | NEEDS OPTIMIZATION | 1 | [original](crops/FC-027-06.png) | none; source only |
| `DRAW-FC-029-01` | Ilustración de la página 29 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-029-01.png) | none; source only |
| `DRAW-FC-030-01` | Ilustración de la página 30 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-030-01.png) | none; source only |
| `DRAW-FC-030-02` | piñata | NEEDS OPTIMIZATION | 1 | [original](crops/FC-030-02.png) | none; source only |
| `DRAW-FC-030-03` | Ñuno | NEEDS OPTIMIZATION | 1 | [original](crops/FC-030-03.png) | none; source only |
| `DRAW-FC-030-04` | niñito | NEEDS OPTIMIZATION | 1 | [original](crops/FC-030-04.png) | none; source only |
| `DRAW-FC-030-05` | moño | NEEDS OPTIMIZATION | 1 | [original](missing-originals/FC-030-05.png) | none; source only |
| `DRAW-FC-030-06` | Meñe | NEEDS OPTIMIZATION | 1 | [original](crops/FC-030-06.png) | none; source only |
| `DRAW-FC-032-01` | Ilustración de la página 32 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-032-01.png) | none; source only |
| `DRAW-FC-033-01` | Ilustración de la página 33 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-033-01.png) | none; source only |
| `DRAW-FC-033-04` | bate | NEEDS OPTIMIZATION | 1 | [original](crops/FC-033-04.png) | none; source only |
| `DRAW-FC-033-06` | bebita | NEEDS OPTIMIZATION | 1 | [original](crops/FC-033-06.png) | none; source only |
| `DRAW-FC-035-01` | Ilustración de la página 35 | NEEDS OPTIMIZATION | 1 | [original](missing-originals/FC-035-01.png) | none; source only |
| `DRAW-FC-036-05` | pavo | NEEDS OPTIMIZATION | 1 | [original](crops/FC-036-05.png) | none; source only |
| `DRAW-FC-036-06` | Vuli | NEEDS OPTIMIZATION | 1 | [original](crops/FC-036-06.png) | none; source only |
| `DRAW-FC-038-01` | Ilustración de la página 38 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-038-01.png) | none; source only |
| `DRAW-FC-039-01` | Ilustración de la página 39 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-039-01.png) | none; source only |
| `DRAW-FC-039-04` | Rita | NEEDS OPTIMIZATION | 1 | [original](crops/FC-039-04.png) | none; source only |
| `DRAW-FC-039-05` | rosa | NEEDS OPTIMIZATION | 1 | [original](crops/FC-039-05.png) | none; source only |
| `DRAW-FC-039-06` | rueda | NEEDS OPTIMIZATION | 1 | [original](crops/FC-039-06.png) | none; source only |
| `DRAW-FC-041-01` | Ilustración de la página 41 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-041-01.png) | none; source only |
| `DRAW-FC-044-01` | Ilustración de la página 44 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-044-01.png) | none; source only |
| `DRAW-FC-045-01` | Ilustración de la página 45 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-045-01.png) | none; source only |
| `DRAW-FC-045-04` | Goloso | NEEDS OPTIMIZATION | 1 | [original](crops/FC-045-04.png) | none; source only |
| `DRAW-FC-045-06` | mago | NEEDS OPTIMIZATION | 1 | [original](crops/FC-045-06.png) | none; source only |
| `DRAW-FC-047-01` | Ilustración de la página 47 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-047-01.png) | none; source only |
| `DRAW-FC-048-01` | Ilustración de la página 48 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-048-01.png) | none; source only |
| `DRAW-FC-048-04` | familia | NEEDS OPTIMIZATION | 1 | [original](crops/FC-048-04.png) | none; source only |
| `DRAW-FC-048-05` | Felo | NEEDS OPTIMIZATION | 1 | [original](crops/FC-048-05.png) | none; source only |
| `DRAW-FC-048-06` | funda | NEEDS OPTIMIZATION | 1 | [original](crops/FC-048-06.png) | none; source only |
| `DRAW-FC-050-01` | Ilustración de la página 50 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-050-01.png) | none; source only |
| `DRAW-FC-051-01` | Ilustración de la página 51 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-051-01.png) | none; source only |
| `DRAW-FC-051-04` | Jesús | NEEDS OPTIMIZATION | 1 | [original](crops/FC-051-04.png) | none; source only |
| `DRAW-FC-051-06` | jarra | NEEDS OPTIMIZATION | 1 | [original](crops/FC-051-06.png) | none; source only |
| `DRAW-FC-053-01` | Ilustración de la página 53 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-053-01.png) | none; source only |
| `DRAW-FC-054-01` | Ilustración de la página 54 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-054-01.png) | none; source only |
| `DRAW-FC-054-03` | conejo | NEEDS OPTIMIZATION | 1 | [original](crops/FC-054-03.png) | none; source only |
| `DRAW-FC-054-04` | casa | NEEDS OPTIMIZATION | 1 | [original](crops/FC-054-04.png) | none; source only |
| `DRAW-FC-054-05` | cubo | NEEDS OPTIMIZATION | 1 | [original](crops/FC-054-05.png) | none; source only |
| `DRAW-FC-054-06` | Catalina | NEEDS OPTIMIZATION | 1 | [original](crops/FC-054-06.png) | none; source only |
| `DRAW-FC-057-01` | Ilustración de la página 57 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-057-01.png) | none; source only |
| `DRAW-FC-057-05` | mayúscula | NEEDS OPTIMIZATION | 1 | [original](crops/FC-057-05.png) | none; source only |
| `DRAW-FC-057-06` | yoyo | NEEDS OPTIMIZATION | 1 | [original](crops/FC-057-06.png) | none; source only |
| `DRAW-FC-059-01` | Ilustración de la página 59 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-059-01.png) | none; source only |
| `DRAW-FC-060-01` | Ilustración de la página 60 | NEEDS OPTIMIZATION | 1 | [original](crops/FC-060-01.png) | none; source only |
| `DRAW-FC-060-03` | zig-zag | NEEDS OPTIMIZATION | 1 | [original](crops/FC-060-03.png) | none; source only |
| `DRAW-FC-060-04` | zorro | NEEDS OPTIMIZATION | 1 | [original](crops/FC-060-04.png) | none; source only |
| `DRAW-FC-060-05` | zepelín | NEEDS OPTIMIZATION | 1 | [original](crops/FC-060-05.png) | none; source only |
| `DRAW-FC-062-01` | Ilustración de la página 62 | NEEDS OPTIMIZATION | 1 | [original](missing-originals/FC-062-01.png) | none; source only |
| `COMPOSITE-FC-FRONT-001` | Cover/title illustration composite | UNRESOLVED | 1 | [original](crops/FC-FRONT-001.png) | none; source only |
| `COMPOSITE-WB-FRONT-001` | Cover/title illustration composite | UNRESOLVED | 1 | [original](crops/WB-FRONT-001.png) | none; source only |
| `COMPOSITE-WB-FRONT-003` | Cover/title illustration composite | UNRESOLVED | 1 | [original](crops/WB-FRONT-003.png) | none; source only |

## Verification boundaries

The 108 source images were independently downloaded/opened and all nine special corrected originals matched their recorded PDF provenance SHA256 values. The separate 52-page illustrated inventory and 108-original ZIP were verified as readable in the preceding delivery; those external deliverables are not production optimized files. The repository must not claim these crops have been optimized.

**No deletion or installation is authorized by this evidence file alone.** Protect current production art, owner-approved originals, source books, old evidence referenced here and application dependencies. A cleanup needs targeted evidence that each removed item is unreferenced.
