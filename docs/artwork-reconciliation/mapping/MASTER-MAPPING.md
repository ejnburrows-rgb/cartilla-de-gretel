# MASTER MAPPING — Cartilla Artwork Reconciliation

**Source:** PR #751 `evidence/artwork-coverage-20261014`, head commit `9525e06e09c15b2b02e8dc2b9f555e90a947d654` (2026-10-14). Current main at build time: `3746f2ce087a61c062c8473586d9b75597d24476`.
Built from `docs/proofs/artwork-coverage-2026-10-14/availability-inventory.json` (201 consolidated groups, 330 placements). Companion machine file: `MASTER-MAPPING.csv` (330 placement rows).

## Corrected counts (no duplicates, no missing records)

| Level | READY | NEEDS OPTIMIZATION | UNRESOLVED | Total |
|---|---|---|---|---|
| Drawing groups | 90 | 108 | 3 | 201 |
| Placements | 186 | 141 | 3 | 330 |

- Deduplication: 202 working groups → 201 after verified repeat merge (`DRAW-FC-011-01` merged into `DRAW-FC-009-04`; same mother/child pose, clothing folds, flower-border arrangement).
- Orphan placements (placement without a group): 0. Duplicate group IDs: 0. Duplicate placement IDs: 0.

## Path verification (per-item, against live PR #751 tree at 9525e06)

- Source crops `docs/proofs/artwork-coverage-2026-10-14/crops/<placement>.png`: **330/330 EXIST**.
- Selected-match destinations that are repo paths: **107/107 EXIST** in the PR tree.
- Selected-match destinations inside local archives (owner PC ZIPs, `local-additional-archive:*`): **8** — not repo paths; recorded as verified archive members in the audit file register. Their `location` values are archive-member references, not GitHub paths.
- Placements with no selected match: **215** = 141 NEEDS OPTIMIZATION + 71 READY (group-level status, no per-placement match) + 3 UNRESOLVED. For these the link points at the verified source crop.

> Status rule (from the source inventory): availability classifies the original drawing identity, not runtime integration. `production_approval_verified: false` for all groups — no owner approval is claimed for any match in this file.
>
> Caveats carried from the source docs: completion gate NOT PASSED (all 330 placements remain NEEDS REVIEW in the source); 50 withheld unavailable hashes could affect unknown IDs; cover/title component crops not individually inventoried; `phase1-matches.md` cross-reference was not available when this file was built — fold it in if/when it lands.

## READY — optimized version exists (90)

| Group | Drawing | Placements | Pages / sheets | Source crop | Destination (matched file) | Exact matches |
|---|---|---|---|---|---|---|
| `DRAW-WB-01-1` | abanico | 4 | Flip Chart page 005; Workbook sheet 007; Workbook sheet 013; Workbook sheet 019 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ03-ABANICO.png) | [p005-abanico.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-abanico.png)<br>[abanico.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/abanico.svg) | 2 |
| `DRAW-WB-02-1` | abeja | 7 | Workbook sheet 007; Workbook sheet 013; Workbook sheet 014; Workbook sheet 016; Workbook sheet 017; Workbook sheet 020; Workbook sheet 022 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ19-ABEJA.png) | [abeja.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/abeja.svg) | 1 |
| `DRAW-WB-06-1` | arana | 3 | Flip Chart page 005; Workbook sheet 009; Workbook sheet 010 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S009-OBJ03-ARANA.png) | [p005-arana.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-arana.png) | 1 |
| `DRAW-WB-10-1` | avión | 5 | Workbook sheet 007; Workbook sheet 013; Workbook sheet 014; Workbook sheet 019; Workbook sheet 022 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ06-PEZ.png) | [pez.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/pez.webp) | 2 |
| `DRAW-WB-15-1` | erizo | 3 | Flip Chart page 006; Workbook sheet 016; Workbook sheet 017 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S016-OBJ06-ERIZO.png) | [p006-erizo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-erizo.png) | 1 |
| `DRAW-WB-16-1` | escalera | 4 | Flip Chart page 006; Workbook sheet 007; Workbook sheet 016; Workbook sheet 017 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ09-ESCALERA.png) | [p006-escalera.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-escalera.png)<br>[escalera.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/escalera.svg) | 2 |
| `DRAW-WB-18-1` | escuela | 2 | Workbook sheet 007; Workbook sheet 016 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ11-ESCUELA.png) | [escuela.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/escuela.svg) | 1 |
| `DRAW-WB-20-1` | estrella | 7 | Flip Chart page 006; Workbook sheet 008; Workbook sheet 013; Workbook sheet 016; Workbook sheet 017; Workbook sheet 022; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ06-ESTRELLA.png) | [p006-estrella.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-estrella.png)<br>[estrella.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-e/estrella.webp) | 6 |
| `DRAW-WB-21-1` | globo | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ14-GLOBO.png) | [globo.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/globo.webp) | 1 |
| `DRAW-WB-23-1` | iglu | 7 | Flip Chart page 007; Workbook sheet 010; Workbook sheet 011; Workbook sheet 014; Workbook sheet 016; Workbook sheet 019; Workbook sheet 020 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S010-OBJ02-IGLU.png) | [p007-iglu.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-iglu.png) | 1 |
| `DRAW-WB-29-1` | insecto | 3 | Flip Chart page 007; Workbook sheet 019; Workbook sheet 022 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S019-OBJ15-INSECTO.png) | [p007-insecto.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-insecto.png) | 2 |
| `DRAW-WB-31-1` | isla | 3 | Flip Chart page 007; Workbook sheet 007; Workbook sheet 019 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ05-ISLA.png) | [p007-isla.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-isla.png)<br>[isla.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/isla.svg)<br>[isla.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-i/isla.webp) | 3 |
| `DRAW-WB-32-1` | libro | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ03-LIBRO.png) | [libro.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/libro.webp) | 1 |
| `DRAW-WB-33-1` | maiz | 5 | Workbook sheet 007; Workbook sheet 010; Workbook sheet 014; Workbook sheet 016; Workbook sheet 017 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ18-MAIZ.png) | [maiz.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/maiz.svg) | 1 |
| `DRAW-WB-35-1` | ocho | 3 | Flip Chart page 004; Workbook sheet 009; Workbook sheet 010 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S009-OBJ02-OCHO.png) | [p004-ocho.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p004-ocho.png)<br>[ocho.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-o/ocho.webp) | 3 |
| `DRAW-WB-36-1` | ojos | 1 | Workbook sheet 007 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ17-OJOS.png) | [ojos.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/wb-p1/ojos.svg) | 1 |
| `DRAW-WB-38-1` | olla | 6 | Flip Chart page 003; Flip Chart page 004; Workbook sheet 007; Workbook sheet 010; Workbook sheet 011; Workbook sheet 019 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ20-OLLA.png) | [p004-olla.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p004-olla.png)<br>[olla.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/olla.svg) | 3 |
| `DRAW-WB-39-1` | oreja | 4 | Flip Chart page 004; Workbook sheet 007; Workbook sheet 010; Workbook sheet 011 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ12-OREJA.png) | [p004-oreja.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p004-oreja.png)<br>[oreja.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/oreja.svg) | 2 |
| `DRAW-WB-41-1` | oso | 13 | Flip Chart page 004; Workbook sheet 007; Workbook sheet 008; Workbook sheet 010; Workbook sheet 011; Workbook sheet 013; Workbook sheet 014; Workbook sheet 017; Workbook sheet 019; Workbook sheet 020; Workbook sheet 022; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ04-OSO-1.png) | [p004-oso.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p004-oso.png) | 2 |
| `DRAW-WB-42-1` | oveja | 6 | Flip Chart page 004; Workbook sheet 007; Workbook sheet 010; Workbook sheet 011; Workbook sheet 013; Workbook sheet 022 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ15-OVEJA.png) | [p004-oveja.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p004-oveja.png)<br>[oveja.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/oveja.svg) | 2 |
| `DRAW-WB-47-1` | una | 6 | Workbook sheet 007; Workbook sheet 010; Workbook sheet 019; Workbook sheet 020; Workbook sheet 022; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ14-UNA.png) | C:\Users\EJN\Downloads\cartilla-de-gretel-archive-cartilla-owner-art-20261011.zip!cartilla-de-gretel-archive-cartilla-owner-art-20261011/public/cartilla/art/faithful/vocal-u/uña.webp (archive member)<br>[arco.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-1/arco.webp) | 6 |
| `DRAW-WB-48-1` | unicornio | 4 | Flip Chart page 008; Workbook sheet 016; Workbook sheet 022; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S016-OBJ10-UNICORNIO.png) | C:\Users\EJN\Downloads\cartilla-gretel-assets.zip!cutouts/p8_asset04.png (archive member) | 1 |
| `DRAW-WB-49-1` | uniforme | 8 | Flip Chart page 008; Workbook sheet 007; Workbook sheet 008; Workbook sheet 010; Workbook sheet 016; Workbook sheet 022; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ13-UNIFORME-2.png) | C:\Users\EJN\Downloads\cartilla-gretel-assets.zip!cutouts/p8_asset05.png (archive member) | 1 |
| `DRAW-WB-50-1` | uno | 10 | Flip Chart page 008; Workbook sheet 007; Workbook sheet 009; Workbook sheet 010; Workbook sheet 013; Workbook sheet 016; Workbook sheet 019; Workbook sheet 022; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ10-UNO.png) | [p008-uno.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p008-uno.png)<br>[uno.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/uno.svg) | 2 |
| `DRAW-WB-51-1` | urraca | 3 | Flip Chart page 008; Workbook sheet 016; Workbook sheet 022 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S016-OBJ12-URRACA.png) | C:\Users\EJN\Downloads\cartilla-gretel-assets.zip!cutouts/p8_asset03.png (archive member) | 1 |
| `DRAW-FC-003-01` | Ilustración de la página 3 | 1 | Flip Chart page 003 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-003-01.png) | [p003-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p003-scene.png) | 1 |
| `DRAW-FC-003-02` | avión | 1 | Flip Chart page 003 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-003-02.png) | [avion.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/avion.svg) | 1 |
| `DRAW-FC-003-03` | escoba | 1 | Flip Chart page 003 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-003-03.png) | [escoba.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-e/escoba.webp) | 1 |
| `DRAW-FC-003-04` | imán | 2 | Flip Chart page 003; Flip Chart page 007 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-003-04.png) | [p007-iman.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-iman.png) | 1 |
| `DRAW-FC-003-06` | uña | 1 | Flip Chart page 003 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-003-06.png) | [una.svg](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/workbook/leccion-1/una.svg) | 1 |
| `DRAW-FC-004-01` | Ilustración de la página 4 | 1 | Flip Chart page 004 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-004-01.png) | C:\Users\EJN\Downloads\cartilla-gretel-assets.zip!modernized/p4_scene.png (archive member) | 1 |
| `DRAW-FC-005-01` | Ilustración de la página 5 | 1 | Flip Chart page 005 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-005-01.png) | [p005-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-scene.png) | 1 |
| `DRAW-FC-005-03` | anillo | 1 | Flip Chart page 005 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-005-03.png) | [p005-anillo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-anillo.png) | 1 |
| `DRAW-FC-005-05` | ala | 1 | Flip Chart page 005 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-005-05.png) | [p005-ala.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p005-ala.png) | 1 |
| `DRAW-FC-005-06` | aro | 1 | Flip Chart page 005 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-005-06.png) | [aro.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/vocal-a/aro.webp) | 1 |
| `DRAW-FC-006-01` | Ilustración de la página 6 | 1 | Flip Chart page 006 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-006-01.png) | [p006-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-scene.png) | 1 |
| `DRAW-FC-006-02` | elefante | 1 | Flip Chart page 006 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-006-02.png) | [p006-elefante.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-elefante.png) | 1 |
| `DRAW-FC-006-03` | espejo | 1 | Flip Chart page 006 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-006-03.png) | [p006-espejo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p006-espejo.png) | 1 |
| `DRAW-FC-007-01` | Ilustración de la página 7 | 1 | Flip Chart page 007 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-007-01.png) | [p007-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p007-scene.png) | 1 |
| `DRAW-FC-008-01` | Ilustración de la página 8 | 1 | Flip Chart page 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-008-01.png) | C:\Users\EJN\Downloads\cartilla-gretel-assets.zip!cutouts/p8_scene.png (archive member) | 1 |
| `DRAW-FC-008-03` | uva | 1 | Flip Chart page 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-008-03.png) | C:\Users\EJN\Downloads\cartilla-gretel-assets.zip!cutouts/p8_asset02.png (archive member) | 1 |
| `DRAW-FC-008-07` | Ulises | 1 | Flip Chart page 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-008-07.png) | [p008-ulises.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p008-ulises.png) | 1 |
| `DRAW-FC-009-01` | Ilustración de la página 9 | 1 | Flip Chart page 009 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-009-01.png) | [p009-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p009-scene.png) | 1 |
| `DRAW-FC-009-02` | mamá | 1 | Flip Chart page 009 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-009-02.png) | [mama.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-7-m/mama.webp) | 1 |
| `DRAW-FC-012-03` | pie | 1 | Flip Chart page 012 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-012-03.png) | [p012-pie.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p012-pie.png) | 1 |
| `DRAW-FC-012-06` | pomo | 1 | Flip Chart page 012 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-012-06.png) | [p012-pomo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p012-pomo.png) | 1 |
| `DRAW-FC-015-02` | Sesi | 1 | Flip Chart page 015 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-015-02.png) | [p015-sesi.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p015-sesi.png) | 1 |
| `DRAW-FC-015-03` | sopa | 1 | Flip Chart page 015 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-015-03.png) | [p015-sopa.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p015-sopa.png) | 1 |
| `DRAW-FC-015-04` | sapo | 1 | Flip Chart page 015 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-015-04.png) | [p015-sapo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p015-sapo.png) | 1 |
| `DRAW-FC-018-02` | tomate | 1 | Flip Chart page 018 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-018-02.png) | [p018-tomate.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p018-tomate.webp) | 1 |
| `DRAW-FC-018-03` | tapa | 1 | Flip Chart page 018 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-018-03.png) | [p018-tapa.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p018-tapa.webp) | 1 |
| `DRAW-FC-018-04` | topo | 1 | Flip Chart page 018 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-018-04.png) | [p018-topo.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p018-topo.webp) | 1 |
| `DRAW-FC-021-02` | Didi | 1 | Flip Chart page 021 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-021-02.png) | [p021-didi.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p021-didi.webp) | 1 |
| `DRAW-FC-021-05` | doce | 1 | Flip Chart page 021 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-021-05.png) | [p021-doce.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p021-doce.webp) | 1 |
| `DRAW-FC-024-02` | maleta | 1 | Flip Chart page 024 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-024-02.png) | [p024-maleta.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-maleta.webp) | 1 |
| `DRAW-FC-024-03` | lata | 1 | Flip Chart page 024 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-024-03.png) | [p024-lata.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-lata.webp) | 1 |
| `DRAW-FC-024-04` | Luli | 1 | Flip Chart page 024 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-024-04.png) | [p024-luli.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-luli.webp) | 1 |
| `DRAW-FC-024-05` | loma | 1 | Flip Chart page 024 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-024-05.png) | [p024-loma.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-loma.webp) | 1 |
| `DRAW-FC-024-06` | Lala | 1 | Flip Chart page 024 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-024-06.png) | [p024-lala.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p024-lala.png) | 1 |
| `DRAW-FC-027-02` | nido | 1 | Flip Chart page 027 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-027-02.png) | [p027-nido.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p027-nido.png) | 1 |
| `DRAW-FC-027-03` | nudo | 1 | Flip Chart page 027 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-027-03.png) | [p027-nudo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p027-nudo.png) | 1 |
| `DRAW-FC-033-02` | Beba | 1 | Flip Chart page 033 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-033-02.png) | [p033-beba.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p033-beba.png) | 1 |
| `DRAW-FC-033-03` | Bubi | 2 | Flip Chart page 033; Flip Chart page 042 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-033-03.png) | [p033-bubi.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p033-bubi.png)<br>[p042-burro.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p042-burro.png) | 2 |
| `DRAW-FC-033-05` | bota | 1 | Flip Chart page 033 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-033-05.png) | [bota.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-15-b/bota.webp) | 1 |
| `DRAW-FC-036-01` | Ilustración de la página 36 | 1 | Flip Chart page 036 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-036-01.png) | [p036-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-scene.png) | 1 |
| `DRAW-FC-036-02` | vaso | 1 | Flip Chart page 036 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-036-02.png) | [p036-vaso.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-vaso.png) | 1 |
| `DRAW-FC-036-03` | vela | 1 | Flip Chart page 036 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-036-03.png) | [p036-vela.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-vela.png) | 1 |
| `DRAW-FC-036-04` | Vita | 1 | Flip Chart page 036 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-036-04.png) | [p036-vita.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p036-vita.png) | 1 |
| `DRAW-FC-039-02` | rana | 1 | Flip Chart page 039 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-039-02.png) | [p039-rana.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p039-rana.png) | 1 |
| `DRAW-FC-039-03` | remos | 1 | Flip Chart page 039 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-039-03.png) | [p039-remos.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p039-remos.png) | 1 |
| `DRAW-FC-042-01` | Ilustración de la página 42 | 1 | Flip Chart page 042 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-042-01.png) | [p042-scene.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p042-scene.png) | 1 |
| `DRAW-FC-042-03` | carrusel | 1 | Flip Chart page 042 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-042-03.png) | [p042-carrusel.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p042-carrusel.png) | 1 |
| `DRAW-FC-042-04` | torre | 1 | Flip Chart page 042 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-042-04.png) | [torre.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-18-rr/torre.webp) | 1 |
| `DRAW-FC-042-05` | barril | 1 | Flip Chart page 042 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-042-05.png) | [barril.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-18-rr/barril.webp) | 1 |
| `DRAW-FC-042-06` | Tierra | 1 | Flip Chart page 042 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-042-06.png) | [tierra.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/faithful/leccion-18-rr/tierra.webp) | 1 |
| `DRAW-FC-045-02` | gaveta | 1 | Flip Chart page 045 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-045-02.png) | [p045-gaveta.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p045-gaveta.png) | 1 |
| `DRAW-FC-045-03` | gusano | 1 | Flip Chart page 045 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-045-03.png) | [p045-gusano.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p045-gusano.png) | 1 |
| `DRAW-FC-045-05` | gorra | 1 | Flip Chart page 045 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-045-05.png) | [p045-gorra.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p045-gorra.png) | 1 |
| `DRAW-FC-048-02` | foto | 1 | Flip Chart page 048 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-048-02.png) | [p048-foto.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p048-foto.png) | 1 |
| `DRAW-FC-048-03` | fideos | 1 | Flip Chart page 048 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-048-03.png) | [p048-fideos.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p048-fideos.png) | 1 |
| `DRAW-FC-051-02` | jicotea | 1 | Flip Chart page 051 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-051-02.png) | [p051-jicotea.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p051-jicotea.png) | 1 |
| `DRAW-FC-051-03` | jugo | 1 | Flip Chart page 051 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-051-03.png) | [p051-jugo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p051-jugo.png) | 1 |
| `DRAW-FC-051-05` | ajo | 1 | Flip Chart page 051 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-051-05.png) | [p051-ajo.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p051-ajo.png) | 1 |
| `DRAW-FC-054-02` | cuna | 1 | Flip Chart page 054 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-054-02.png) | [p054-cuna.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p054-cuna.png) | 1 |
| `DRAW-FC-056-01` | Ilustración de la página 56 | 1 | Flip Chart page 056 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-056-01.png) | [p056-caramelos.webp](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p056-caramelos.webp) | 1 |
| `DRAW-FC-057-02` | yate | 1 | Flip Chart page 057 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-057-02.png) | [p057-yate.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p057-yate.png) | 1 |
| `DRAW-FC-057-03` | yema | 1 | Flip Chart page 057 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-057-03.png) | [p057-yema.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p057-yema.png) | 1 |
| `DRAW-FC-057-04` | Yayita | 1 | Flip Chart page 057 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-057-04.png) | [p057-yayita.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p057-yayita.png) | 1 |
| `DRAW-FC-060-02` | zapato | 1 | Flip Chart page 060 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-060-02.png) | [p060-zapato.png](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/153c7eccbec5bc1090cd130a909f0cf73630415a/public/cartilla/art/optimized/flipchart-native/p060-zapato.png) | 1 |
| `DRAW-FC-060-06` | Zulema | 1 | Flip Chart page 060 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-060-06.png) | C:\Users\EJN\Downloads\cartilla-gretel-assets.zip!cutouts/p60_asset05.png (archive member) | 1 |

## NEEDS OPTIMIZATION (108)

| Group | Drawing | Placements | Pages / sheets | Source crop | Destination (matched file) | Exact matches |
|---|---|---|---|---|---|---|
| `DRAW-WB-03-1` | abrigo | 2 | Workbook sheet 007; Workbook sheet 017 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ01-UNIFORME-1.png) | — | 0 |
| `DRAW-WB-04-1` | aguja | 3 | Workbook sheet 013; Workbook sheet 014; Workbook sheet 016 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S013-OBJ15-AGUJA.png) | — | 0 |
| `DRAW-WB-05-1` | ala | 2 | Workbook sheet 010; Workbook sheet 013 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S010-OBJ07-ALA.png) | — | 0 |
| `DRAW-WB-05-2` | ala | 3 | Workbook sheet 011; Workbook sheet 014; Workbook sheet 019 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S011-OBJ08-ALA.png) | — | 0 |
| `DRAW-WB-07-1` | arbol | 3 | Workbook sheet 008; Workbook sheet 013; Workbook sheet 022 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ05-ARBOL.png) | — | 0 |
| `DRAW-WB-08-1` | ardilla | 1 | Workbook sheet 013 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S013-OBJ12-ARDILLA.png) | — | 0 |
| `DRAW-WB-09-1` | aro | 3 | Workbook sheet 007; Workbook sheet 013; Workbook sheet 014 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ08-ARO.png) | — | 0 |
| `DRAW-WB-09-2` | aro | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ01-ARO.png) | — | 0 |
| `DRAW-WB-11-1` | carro | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ12-CARRO.png) | — | 0 |
| `DRAW-WB-13-1` | dulce | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ15-DULCE.png) | — | 0 |
| `DRAW-WB-14-1` | elefante | 5 | Workbook sheet 007; Workbook sheet 013; Workbook sheet 016; Workbook sheet 017; Workbook sheet 022 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ16-ELEFANTE.png) | — | 0 |
| `DRAW-WB-17-1` | escoba | 2 | Workbook sheet 009; Workbook sheet 016 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S009-OBJ05-ESCOBA.png) | — | 0 |
| `DRAW-WB-18-2` | escuela | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ04-ESCUELA.png) | — | 0 |
| `DRAW-WB-19-1` | espejo | 1 | Workbook sheet 016 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S016-OBJ15-ESPEJO.png) | — | 0 |
| `DRAW-WB-22-1` | iglesia | 1 | Workbook sheet 009 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S009-OBJ01-IGLESIA.png) | — | 0 |
| `DRAW-WB-24-1` | igual | 2 | Workbook sheet 019; Workbook sheet 020 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S019-OBJ14-IGUAL.png) | — | 0 |
| `DRAW-WB-25-1` | iguana | 2 | Workbook sheet 019; Workbook sheet 020 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S019-OBJ03-IGUANA.png) | — | 0 |
| `DRAW-WB-26-1` | iman | 6 | Workbook sheet 007; Workbook sheet 013; Workbook sheet 019; Workbook sheet 020; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S007-OBJ07-IMAN-2.png) | — | 0 |
| `DRAW-WB-28-1` | indio | 5 | Flip Chart page 007; Workbook sheet 008; Workbook sheet 016; Workbook sheet 019; Workbook sheet 020 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ08-INDIO.png) | — | 0 |
| `DRAW-WB-30-1` | invierno | 1 | Workbook sheet 019 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S019-OBJ08-INVIERNO.png) | — | 0 |
| `DRAW-WB-34-1` | manzana | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ02-MANZANA.png) | — | 0 |
| `DRAW-WB-36-2` | ojos | 3 | Workbook sheet 010; Workbook sheet 011; Workbook sheet 013 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S010-OBJ16-OJOS.png) | — | 0 |
| `DRAW-WB-37-1` | ola | 3 | Workbook sheet 010; Workbook sheet 011; Workbook sheet 019 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S010-OBJ01-OLA.png) | — | 0 |
| `DRAW-WB-40-1` | oruga | 1 | Workbook sheet 013 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S013-OBJ02-ORUGA.png) | — | 0 |
| `DRAW-WB-43-1` | pajaro | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ10-PAJARO.png) | — | 0 |
| `DRAW-WB-44-1` | pera | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ09-PERA.png) | — | 0 |
| `DRAW-WB-46-1` | taza | 1 | Workbook sheet 008 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S008-OBJ07-TAZA.png) | — | 0 |
| `DRAW-WB-52-1` | uva | 3 | Workbook sheet 010; Workbook sheet 022; Workbook sheet 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-S010-OBJ10-UVA.png) | — | 0 |
| `DRAW-FC-004-03` | Oto | 1 | Flip Chart page 004 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-004-03.png) | — | 0 |
| `DRAW-FC-005-07` | Ana | 1 | Flip Chart page 005 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-005-07.png) | — | 0 |
| `DRAW-FC-006-04` | Ema | 1 | Flip Chart page 006 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-006-04.png) | — | 0 |
| `DRAW-FC-007-07` | Irma | 1 | Flip Chart page 007 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-007-07.png) | — | 0 |
| `DRAW-FC-009-03` | amo | 1 | Flip Chart page 009 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-009-03.png) | — | 0 |
| `DRAW-FC-009-04` | mima | 2 | Flip Chart page 009; Flip Chart page 011 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-009-04.png) | — | 0 |
| `DRAW-FC-009-05` | Meme | 1 | Flip Chart page 009 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-009-05.png) | — | 0 |
| `DRAW-FC-009-06` | Mumi | 1 | Flip Chart page 009 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-009-06.png) | — | 0 |
| `DRAW-FC-012-01` | Ilustración de la página 12 | 1 | Flip Chart page 012 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-012-01.png) | — | 0 |
| `DRAW-FC-012-02` | papá | 1 | Flip Chart page 012 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-012-02.png) | — | 0 |
| `DRAW-FC-012-04` | Pepe | 1 | Flip Chart page 012 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-012-04.png) | — | 0 |
| `DRAW-FC-012-05` | puma | 1 | Flip Chart page 012 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-012-05.png) | — | 0 |
| `DRAW-FC-014-01` | Ilustración de la página 14 | 1 | Flip Chart page 014 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-014-01.png) | — | 0 |
| `DRAW-FC-015-01` | Ilustración de la página 15 | 1 | Flip Chart page 015 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-015-01.png) | — | 0 |
| `DRAW-FC-015-05` | pisa | 1 | Flip Chart page 015 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-015-05.png) | — | 0 |
| `DRAW-FC-015-06` | Susi | 1 | Flip Chart page 015 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-015-06.png) | — | 0 |
| `DRAW-FC-017-01` | Ilustración de la página 17 | 1 | Flip Chart page 017 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-017-01.png) | — | 0 |
| `DRAW-FC-018-01` | Ilustración de la página 18 | 1 | Flip Chart page 018 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-018-01.png) | — | 0 |
| `DRAW-FC-018-05` | tipi | 1 | Flip Chart page 018 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-018-05.png) | — | 0 |
| `DRAW-FC-018-06` | Tuto | 1 | Flip Chart page 018 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-018-06.png) | — | 0 |
| `DRAW-FC-020-01` | Ilustración de la página 20 | 1 | Flip Chart page 020 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-020-01.png) | — | 0 |
| `DRAW-FC-021-01` | Ilustración de la página 21 | 1 | Flip Chart page 021 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-021-01.png) | — | 0 |
| `DRAW-FC-021-03` | dados | 1 | Flip Chart page 021 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-021-03.png) | — | 0 |
| `DRAW-FC-021-04` | dedo | 1 | Flip Chart page 021 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-021-04.png) | — | 0 |
| `DRAW-FC-021-06` | Dunia | 1 | Flip Chart page 021 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-021-06.png) | — | 0 |
| `DRAW-FC-023-01` | Ilustración de la página 23 | 1 | Flip Chart page 023 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-023-01.png) | — | 0 |
| `DRAW-FC-024-01` | Ilustración de la página 24 | 1 | Flip Chart page 024 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-024-01.png) | — | 0 |
| `DRAW-FC-026-01` | Ilustración de la página 26 | 1 | Flip Chart page 026 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-026-01.png) | — | 0 |
| `DRAW-FC-027-01` | Ilustración de la página 27 | 1 | Flip Chart page 027 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-027-01.png) | — | 0 |
| `DRAW-FC-027-04` | mono | 1 | Flip Chart page 027 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-027-04.png) | — | 0 |
| `DRAW-FC-027-05` | Napi | 1 | Flip Chart page 027 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-027-05.png) | — | 0 |
| `DRAW-FC-027-06` | tenedor | 1 | Flip Chart page 027 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-027-06.png) | — | 0 |
| `DRAW-FC-029-01` | Ilustración de la página 29 | 1 | Flip Chart page 029 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-029-01.png) | — | 0 |
| `DRAW-FC-030-01` | Ilustración de la página 30 | 1 | Flip Chart page 030 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-030-01.png) | — | 0 |
| `DRAW-FC-030-02` | piñata | 1 | Flip Chart page 030 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-030-02.png) | — | 0 |
| `DRAW-FC-030-03` | Ñuno | 1 | Flip Chart page 030 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-030-03.png) | — | 0 |
| `DRAW-FC-030-04` | niñito | 1 | Flip Chart page 030 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-030-04.png) | — | 0 |
| `DRAW-FC-030-05` | moño | 1 | Flip Chart page 030 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-030-05.png) | — | 0 |
| `DRAW-FC-030-06` | Meñe | 1 | Flip Chart page 030 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-030-06.png) | — | 0 |
| `DRAW-FC-032-01` | Ilustración de la página 32 | 1 | Flip Chart page 032 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-032-01.png) | — | 0 |
| `DRAW-FC-033-01` | Ilustración de la página 33 | 1 | Flip Chart page 033 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-033-01.png) | — | 0 |
| `DRAW-FC-033-04` | bate | 1 | Flip Chart page 033 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-033-04.png) | — | 0 |
| `DRAW-FC-033-06` | bebita | 1 | Flip Chart page 033 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-033-06.png) | — | 0 |
| `DRAW-FC-035-01` | Ilustración de la página 35 | 1 | Flip Chart page 035 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-035-01.png) | — | 0 |
| `DRAW-FC-036-05` | pavo | 1 | Flip Chart page 036 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-036-05.png) | — | 0 |
| `DRAW-FC-036-06` | Vuli | 1 | Flip Chart page 036 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-036-06.png) | — | 0 |
| `DRAW-FC-038-01` | Ilustración de la página 38 | 1 | Flip Chart page 038 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-038-01.png) | — | 0 |
| `DRAW-FC-039-01` | Ilustración de la página 39 | 1 | Flip Chart page 039 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-039-01.png) | — | 0 |
| `DRAW-FC-039-04` | Rita | 1 | Flip Chart page 039 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-039-04.png) | — | 0 |
| `DRAW-FC-039-05` | rosa | 1 | Flip Chart page 039 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-039-05.png) | — | 0 |
| `DRAW-FC-039-06` | rueda | 1 | Flip Chart page 039 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-039-06.png) | — | 0 |
| `DRAW-FC-041-01` | Ilustración de la página 41 | 1 | Flip Chart page 041 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-041-01.png) | — | 0 |
| `DRAW-FC-044-01` | Ilustración de la página 44 | 1 | Flip Chart page 044 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-044-01.png) | — | 0 |
| `DRAW-FC-045-01` | Ilustración de la página 45 | 1 | Flip Chart page 045 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-045-01.png) | — | 0 |
| `DRAW-FC-045-04` | Goloso | 1 | Flip Chart page 045 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-045-04.png) | — | 0 |
| `DRAW-FC-045-06` | mago | 1 | Flip Chart page 045 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-045-06.png) | — | 0 |
| `DRAW-FC-047-01` | Ilustración de la página 47 | 1 | Flip Chart page 047 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-047-01.png) | — | 0 |
| `DRAW-FC-048-01` | Ilustración de la página 48 | 1 | Flip Chart page 048 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-048-01.png) | — | 0 |
| `DRAW-FC-048-04` | familia | 1 | Flip Chart page 048 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-048-04.png) | — | 0 |
| `DRAW-FC-048-05` | Felo | 1 | Flip Chart page 048 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-048-05.png) | — | 0 |
| `DRAW-FC-048-06` | funda | 1 | Flip Chart page 048 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-048-06.png) | — | 0 |
| `DRAW-FC-050-01` | Ilustración de la página 50 | 1 | Flip Chart page 050 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-050-01.png) | — | 0 |
| `DRAW-FC-051-01` | Ilustración de la página 51 | 1 | Flip Chart page 051 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-051-01.png) | — | 0 |
| `DRAW-FC-051-04` | Jesús | 1 | Flip Chart page 051 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-051-04.png) | — | 0 |
| `DRAW-FC-051-06` | jarra | 1 | Flip Chart page 051 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-051-06.png) | — | 0 |
| `DRAW-FC-053-01` | Ilustración de la página 53 | 1 | Flip Chart page 053 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-053-01.png) | — | 0 |
| `DRAW-FC-054-01` | Ilustración de la página 54 | 1 | Flip Chart page 054 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-054-01.png) | — | 0 |
| `DRAW-FC-054-03` | conejo | 1 | Flip Chart page 054 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-054-03.png) | — | 0 |
| `DRAW-FC-054-04` | casa | 1 | Flip Chart page 054 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-054-04.png) | — | 0 |
| `DRAW-FC-054-05` | cubo | 1 | Flip Chart page 054 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-054-05.png) | — | 0 |
| `DRAW-FC-054-06` | Catalina | 1 | Flip Chart page 054 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-054-06.png) | — | 0 |
| `DRAW-FC-057-01` | Ilustración de la página 57 | 1 | Flip Chart page 057 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-057-01.png) | — | 0 |
| `DRAW-FC-057-05` | mayúscula | 1 | Flip Chart page 057 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-057-05.png) | — | 0 |
| `DRAW-FC-057-06` | yoyo | 1 | Flip Chart page 057 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-057-06.png) | — | 0 |
| `DRAW-FC-059-01` | Ilustración de la página 59 | 1 | Flip Chart page 059 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-059-01.png) | — | 0 |
| `DRAW-FC-060-01` | Ilustración de la página 60 | 1 | Flip Chart page 060 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-060-01.png) | — | 0 |
| `DRAW-FC-060-03` | zig-zag | 1 | Flip Chart page 060 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-060-03.png) | — | 0 |
| `DRAW-FC-060-04` | zorro | 1 | Flip Chart page 060 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-060-04.png) | — | 0 |
| `DRAW-FC-060-05` | zepelín | 1 | Flip Chart page 060 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-060-05.png) | — | 0 |
| `DRAW-FC-062-01` | Ilustración de la página 62 | 1 | Flip Chart page 062 | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-062-01.png) | — | 0 |

## UNRESOLVED (3)

| Group | Drawing | Placements | Pages / sheets | Source crop | Destination (matched file) | Exact matches |
|---|---|---|---|---|---|---|
| `COMPOSITE-FC-FRONT-001` | Cover/title illustration composite | 1 | Flip Chart cover/title | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/FC-FRONT-001.png) | — | 0 |
| `COMPOSITE-WB-FRONT-001` | Cover/title illustration composite | 1 | Workbook cover/title | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-FRONT-001.png) | — | 0 |
| `COMPOSITE-WB-FRONT-003` | Cover/title illustration composite | 1 | Workbook cover/title | [crop](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/crops/WB-FRONT-003.png) | — | 0 |

## Placement IDs per group (exact page/lesson/placement references)

Full per-placement detail (330 rows: source path, destination, verification, links) is in `MASTER-MAPPING.csv`. Group → placement IDs:

- `DRAW-WB-01-1` (READY): WB-S007-OBJ03-ABANICO, WB-S013-OBJ01-ABANICO, WB-S019-OBJ04-ABANICO, FC-005-02
- `DRAW-WB-02-1` (READY): WB-S007-OBJ19-ABEJA, WB-S013-OBJ06-ABEJA, WB-S014-OBJ04-ABEJA, WB-S016-OBJ07-ABEJA, WB-S017-OBJ03-ABEJA, WB-S020-OBJ08-ABEJA, WB-S022-OBJ13-ABEJA
- `DRAW-WB-03-1` (NEEDS OPTIMIZATION): WB-S007-OBJ01-UNIFORME-1, WB-S017-OBJ08-CHAQUETA
- `DRAW-WB-04-1` (NEEDS OPTIMIZATION): WB-S013-OBJ15-AGUJA, WB-S014-OBJ05-AGUJA, WB-S016-OBJ08-AGUJA
- `DRAW-WB-05-1` (NEEDS OPTIMIZATION): WB-S010-OBJ07-ALA, WB-S013-OBJ10-ALA
- `DRAW-WB-05-2` (NEEDS OPTIMIZATION): WB-S011-OBJ08-ALA, WB-S014-OBJ03-ALA, WB-S019-OBJ07-ALA
- `DRAW-WB-06-1` (READY): WB-S009-OBJ03-ARANA, WB-S010-OBJ13-ARANA, FC-005-04
- `DRAW-WB-07-1` (NEEDS OPTIMIZATION): WB-S008-OBJ05-ARBOL, WB-S013-OBJ07-ARBOL, WB-S022-OBJ09-ARBOL
- `DRAW-WB-08-1` (NEEDS OPTIMIZATION): WB-S013-OBJ12-ARDILLA
- `DRAW-WB-09-1` (NEEDS OPTIMIZATION): WB-S007-OBJ08-ARO, WB-S013-OBJ03-ARO, WB-S014-OBJ08-ARO
- `DRAW-WB-09-2` (NEEDS OPTIMIZATION): WB-S008-OBJ01-ARO
- `DRAW-WB-10-1` (READY): WB-S007-OBJ06-PEZ, WB-S013-OBJ14-PEZ, WB-S014-OBJ07-PEZ, WB-S019-OBJ02-PEZ, WB-S022-OBJ03-PEZ
- `DRAW-WB-11-1` (NEEDS OPTIMIZATION): WB-S008-OBJ12-CARRO
- `DRAW-WB-13-1` (NEEDS OPTIMIZATION): WB-S008-OBJ15-DULCE
- `DRAW-WB-14-1` (NEEDS OPTIMIZATION): WB-S007-OBJ16-ELEFANTE, WB-S013-OBJ08-ELEFANTE, WB-S016-OBJ01-ELEFANTE, WB-S017-OBJ02-ELEFANTE, WB-S022-OBJ08-ELEFANTE
- `DRAW-WB-15-1` (READY): WB-S016-OBJ06-ERIZO, WB-S017-OBJ04-ERIZO, FC-006-06
- `DRAW-WB-16-1` (READY): WB-S007-OBJ09-ESCALERA, WB-S016-OBJ05-ESCALERA, WB-S017-OBJ06-ESCALERA, FC-006-07
- `DRAW-WB-17-1` (NEEDS OPTIMIZATION): WB-S009-OBJ05-ESCOBA, WB-S016-OBJ09-ESCOBA
- `DRAW-WB-18-1` (READY): WB-S007-OBJ11-ESCUELA, WB-S016-OBJ13-ESCUELA
- `DRAW-WB-18-2` (NEEDS OPTIMIZATION): WB-S008-OBJ04-ESCUELA
- `DRAW-WB-19-1` (NEEDS OPTIMIZATION): WB-S016-OBJ15-ESPEJO
- `DRAW-WB-20-1` (READY): WB-S008-OBJ06-ESTRELLA, WB-S013-OBJ11-ESTRELLA, WB-S016-OBJ11-ESTRELLA, WB-S017-OBJ07-ESTRELLA, WB-S022-OBJ06-ESTRELLA, WB-S023-OBJ07-ESTRELLA, FC-006-05
- `DRAW-WB-21-1` (READY): WB-S008-OBJ14-GLOBO
- `DRAW-WB-22-1` (NEEDS OPTIMIZATION): WB-S009-OBJ01-IGLESIA
- `DRAW-WB-23-1` (READY): WB-S010-OBJ02-IGLU, WB-S011-OBJ01-IGLU, WB-S014-OBJ02-IGLU, WB-S016-OBJ02-IGLU, WB-S019-OBJ01-IGLU, WB-S020-OBJ03-IGLU, FC-007-03
- `DRAW-WB-24-1` (NEEDS OPTIMIZATION): WB-S019-OBJ14-IGUAL, WB-S020-OBJ04-IGUAL
- `DRAW-WB-25-1` (NEEDS OPTIMIZATION): WB-S019-OBJ03-IGUANA, WB-S020-OBJ07-IGUANA
- `DRAW-WB-26-1` (NEEDS OPTIMIZATION): WB-S007-OBJ07-IMAN-2, WB-S013-OBJ04-IMAN, WB-S019-OBJ10-IMAN, WB-S020-OBJ01-IMAN, WB-S023-OBJ08-IMAN, WB-S007-OBJ02-IMAN-1
- `DRAW-WB-28-1` (NEEDS OPTIMIZATION): WB-S008-OBJ08-INDIO, WB-S016-OBJ04-INDIO, WB-S019-OBJ06-INDIO, WB-S020-OBJ05-INDIO, FC-007-04
- `DRAW-WB-29-1` (READY): WB-S019-OBJ15-INSECTO, WB-S022-OBJ15-INSECTO, FC-007-05
- `DRAW-WB-30-1` (NEEDS OPTIMIZATION): WB-S019-OBJ08-INVIERNO
- `DRAW-WB-31-1` (READY): WB-S007-OBJ05-ISLA, WB-S019-OBJ12-ISLA, FC-007-06
- `DRAW-WB-32-1` (READY): WB-S008-OBJ03-LIBRO
- `DRAW-WB-33-1` (READY): WB-S007-OBJ18-MAIZ, WB-S010-OBJ04-MAIZ, WB-S014-OBJ06-MAIZ, WB-S016-OBJ03-MAIZ, WB-S017-OBJ05-MAIZ
- `DRAW-WB-34-1` (NEEDS OPTIMIZATION): WB-S008-OBJ02-MANZANA
- `DRAW-WB-35-1` (READY): WB-S009-OBJ02-OCHO, WB-S010-OBJ11-OCHO, FC-004-07
- `DRAW-WB-36-1` (READY): WB-S007-OBJ17-OJOS
- `DRAW-WB-36-2` (NEEDS OPTIMIZATION): WB-S010-OBJ16-OJOS, WB-S011-OBJ03-OJOS, WB-S013-OBJ13-OJOS
- `DRAW-WB-37-1` (NEEDS OPTIMIZATION): WB-S010-OBJ01-OLA, WB-S011-OBJ06-OLA, WB-S019-OBJ09-OLA
- `DRAW-WB-38-1` (READY): WB-S007-OBJ20-OLLA, WB-S010-OBJ09-OLLA, WB-S011-OBJ05-OLLA, WB-S019-OBJ16-OLLA, FC-003-05, FC-004-02
- `DRAW-WB-39-1` (READY): WB-S007-OBJ12-OREJA, WB-S010-OBJ08-OREJA, WB-S011-OBJ04-OREJA, FC-004-06
- `DRAW-WB-40-1` (NEEDS OPTIMIZATION): WB-S013-OBJ02-ORUGA
- `DRAW-WB-41-1` (READY): WB-S007-OBJ04-OSO-1, WB-S008-OBJ11-OSO, WB-S010-OBJ03-OSO-1, WB-S010-OBJ14-OSO-2, WB-S011-OBJ07-OSO, WB-S013-OBJ16-OSO, WB-S014-OBJ01-OSO, WB-S017-OBJ01-OSO, WB-S019-OBJ05-OSO, WB-S020-OBJ02-OSO, WB-S022-OBJ11-OSO, WB-S023-OBJ03-OSO, FC-004-05
- `DRAW-WB-42-1` (READY): WB-S007-OBJ15-OVEJA, WB-S010-OBJ06-OVEJA, WB-S011-OBJ02-OVEJA, WB-S013-OBJ05-OVEJA, WB-S022-OBJ02-OVEJA, FC-004-04
- `DRAW-WB-43-1` (NEEDS OPTIMIZATION): WB-S008-OBJ10-PAJARO
- `DRAW-WB-44-1` (NEEDS OPTIMIZATION): WB-S008-OBJ09-PERA
- `DRAW-WB-46-1` (NEEDS OPTIMIZATION): WB-S008-OBJ07-TAZA
- `DRAW-WB-47-1` (READY): WB-S007-OBJ14-UNA, WB-S010-OBJ05-UNA, WB-S019-OBJ13-UNA, WB-S020-OBJ06-UNA, WB-S022-OBJ04-UNA, WB-S023-OBJ06-UNA
- `DRAW-WB-48-1` (READY): WB-S016-OBJ10-UNICORNIO, WB-S022-OBJ01-UNICORNIO, WB-S023-OBJ05-UNICORNIO, FC-008-05
- `DRAW-WB-49-1` (READY): WB-S007-OBJ13-UNIFORME-2, WB-S008-OBJ13-UNIFORME, WB-S010-OBJ15-UNIFORME, WB-S016-OBJ14-UNIFORME, WB-S022-OBJ07-UNIFORME-1, WB-S022-OBJ14-UNIFORME-2, WB-S023-OBJ01-UNIFORME, FC-008-06
- `DRAW-WB-50-1` (READY): WB-S007-OBJ10-UNO, WB-S009-OBJ04-UNO, WB-S010-OBJ12-UNO, WB-S013-OBJ09-UNO, WB-S016-OBJ16-UNO, WB-S019-OBJ11-UNO, WB-S022-OBJ10-UNO-1, WB-S022-OBJ16-UNO-2, WB-S023-OBJ02-UNO, FC-008-02
- `DRAW-WB-51-1` (READY): WB-S016-OBJ12-URRACA, WB-S022-OBJ12-URRACA, FC-008-04
- `DRAW-WB-52-1` (NEEDS OPTIMIZATION): WB-S010-OBJ10-UVA, WB-S022-OBJ05-UVA, WB-S023-OBJ04-UVA
- `DRAW-FC-003-01` (READY): FC-003-01
- `DRAW-FC-003-02` (READY): FC-003-02
- `DRAW-FC-003-03` (READY): FC-003-03
- `DRAW-FC-003-04` (READY): FC-003-04, FC-007-02
- `DRAW-FC-003-06` (READY): FC-003-06
- `DRAW-FC-004-01` (READY): FC-004-01
- `DRAW-FC-004-03` (NEEDS OPTIMIZATION): FC-004-03
- `DRAW-FC-005-01` (READY): FC-005-01
- `DRAW-FC-005-03` (READY): FC-005-03
- `DRAW-FC-005-05` (READY): FC-005-05
- `DRAW-FC-005-06` (READY): FC-005-06
- `DRAW-FC-005-07` (NEEDS OPTIMIZATION): FC-005-07
- `DRAW-FC-006-01` (READY): FC-006-01
- `DRAW-FC-006-02` (READY): FC-006-02
- `DRAW-FC-006-03` (READY): FC-006-03
- `DRAW-FC-006-04` (NEEDS OPTIMIZATION): FC-006-04
- `DRAW-FC-007-01` (READY): FC-007-01
- `DRAW-FC-007-07` (NEEDS OPTIMIZATION): FC-007-07
- `DRAW-FC-008-01` (READY): FC-008-01
- `DRAW-FC-008-03` (READY): FC-008-03
- `DRAW-FC-008-07` (READY): FC-008-07
- `DRAW-FC-009-01` (READY): FC-009-01
- `DRAW-FC-009-02` (READY): FC-009-02
- `DRAW-FC-009-03` (NEEDS OPTIMIZATION): FC-009-03
- `DRAW-FC-009-04` (NEEDS OPTIMIZATION): FC-009-04, FC-011-01
- `DRAW-FC-009-05` (NEEDS OPTIMIZATION): FC-009-05
- `DRAW-FC-009-06` (NEEDS OPTIMIZATION): FC-009-06
- `DRAW-FC-012-01` (NEEDS OPTIMIZATION): FC-012-01
- `DRAW-FC-012-02` (NEEDS OPTIMIZATION): FC-012-02
- `DRAW-FC-012-03` (READY): FC-012-03
- `DRAW-FC-012-04` (NEEDS OPTIMIZATION): FC-012-04
- `DRAW-FC-012-05` (NEEDS OPTIMIZATION): FC-012-05
- `DRAW-FC-012-06` (READY): FC-012-06
- `DRAW-FC-014-01` (NEEDS OPTIMIZATION): FC-014-01
- `DRAW-FC-015-01` (NEEDS OPTIMIZATION): FC-015-01
- `DRAW-FC-015-02` (READY): FC-015-02
- `DRAW-FC-015-03` (READY): FC-015-03
- `DRAW-FC-015-04` (READY): FC-015-04
- `DRAW-FC-015-05` (NEEDS OPTIMIZATION): FC-015-05
- `DRAW-FC-015-06` (NEEDS OPTIMIZATION): FC-015-06
- `DRAW-FC-017-01` (NEEDS OPTIMIZATION): FC-017-01
- `DRAW-FC-018-01` (NEEDS OPTIMIZATION): FC-018-01
- `DRAW-FC-018-02` (READY): FC-018-02
- `DRAW-FC-018-03` (READY): FC-018-03
- `DRAW-FC-018-04` (READY): FC-018-04
- `DRAW-FC-018-05` (NEEDS OPTIMIZATION): FC-018-05
- `DRAW-FC-018-06` (NEEDS OPTIMIZATION): FC-018-06
- `DRAW-FC-020-01` (NEEDS OPTIMIZATION): FC-020-01
- `DRAW-FC-021-01` (NEEDS OPTIMIZATION): FC-021-01
- `DRAW-FC-021-02` (READY): FC-021-02
- `DRAW-FC-021-03` (NEEDS OPTIMIZATION): FC-021-03
- `DRAW-FC-021-04` (NEEDS OPTIMIZATION): FC-021-04
- `DRAW-FC-021-05` (READY): FC-021-05
- `DRAW-FC-021-06` (NEEDS OPTIMIZATION): FC-021-06
- `DRAW-FC-023-01` (NEEDS OPTIMIZATION): FC-023-01
- `DRAW-FC-024-01` (NEEDS OPTIMIZATION): FC-024-01
- `DRAW-FC-024-02` (READY): FC-024-02
- `DRAW-FC-024-03` (READY): FC-024-03
- `DRAW-FC-024-04` (READY): FC-024-04
- `DRAW-FC-024-05` (READY): FC-024-05
- `DRAW-FC-024-06` (READY): FC-024-06
- `DRAW-FC-026-01` (NEEDS OPTIMIZATION): FC-026-01
- `DRAW-FC-027-01` (NEEDS OPTIMIZATION): FC-027-01
- `DRAW-FC-027-02` (READY): FC-027-02
- `DRAW-FC-027-03` (READY): FC-027-03
- `DRAW-FC-027-04` (NEEDS OPTIMIZATION): FC-027-04
- `DRAW-FC-027-05` (NEEDS OPTIMIZATION): FC-027-05
- `DRAW-FC-027-06` (NEEDS OPTIMIZATION): FC-027-06
- `DRAW-FC-029-01` (NEEDS OPTIMIZATION): FC-029-01
- `DRAW-FC-030-01` (NEEDS OPTIMIZATION): FC-030-01
- `DRAW-FC-030-02` (NEEDS OPTIMIZATION): FC-030-02
- `DRAW-FC-030-03` (NEEDS OPTIMIZATION): FC-030-03
- `DRAW-FC-030-04` (NEEDS OPTIMIZATION): FC-030-04
- `DRAW-FC-030-05` (NEEDS OPTIMIZATION): FC-030-05
- `DRAW-FC-030-06` (NEEDS OPTIMIZATION): FC-030-06
- `DRAW-FC-032-01` (NEEDS OPTIMIZATION): FC-032-01
- `DRAW-FC-033-01` (NEEDS OPTIMIZATION): FC-033-01
- `DRAW-FC-033-02` (READY): FC-033-02
- `DRAW-FC-033-03` (READY): FC-033-03, FC-042-02
- `DRAW-FC-033-04` (NEEDS OPTIMIZATION): FC-033-04
- `DRAW-FC-033-05` (READY): FC-033-05
- `DRAW-FC-033-06` (NEEDS OPTIMIZATION): FC-033-06
- `DRAW-FC-035-01` (NEEDS OPTIMIZATION): FC-035-01
- `DRAW-FC-036-01` (READY): FC-036-01
- `DRAW-FC-036-02` (READY): FC-036-02
- `DRAW-FC-036-03` (READY): FC-036-03
- `DRAW-FC-036-04` (READY): FC-036-04
- `DRAW-FC-036-05` (NEEDS OPTIMIZATION): FC-036-05
- `DRAW-FC-036-06` (NEEDS OPTIMIZATION): FC-036-06
- `DRAW-FC-038-01` (NEEDS OPTIMIZATION): FC-038-01
- `DRAW-FC-039-01` (NEEDS OPTIMIZATION): FC-039-01
- `DRAW-FC-039-02` (READY): FC-039-02
- `DRAW-FC-039-03` (READY): FC-039-03
- `DRAW-FC-039-04` (NEEDS OPTIMIZATION): FC-039-04
- `DRAW-FC-039-05` (NEEDS OPTIMIZATION): FC-039-05
- `DRAW-FC-039-06` (NEEDS OPTIMIZATION): FC-039-06
- `DRAW-FC-041-01` (NEEDS OPTIMIZATION): FC-041-01
- `DRAW-FC-042-01` (READY): FC-042-01
- `DRAW-FC-042-03` (READY): FC-042-03
- `DRAW-FC-042-04` (READY): FC-042-04
- `DRAW-FC-042-05` (READY): FC-042-05
- `DRAW-FC-042-06` (READY): FC-042-06
- `DRAW-FC-044-01` (NEEDS OPTIMIZATION): FC-044-01
- `DRAW-FC-045-01` (NEEDS OPTIMIZATION): FC-045-01
- `DRAW-FC-045-02` (READY): FC-045-02
- `DRAW-FC-045-03` (READY): FC-045-03
- `DRAW-FC-045-04` (NEEDS OPTIMIZATION): FC-045-04
- `DRAW-FC-045-05` (READY): FC-045-05
- `DRAW-FC-045-06` (NEEDS OPTIMIZATION): FC-045-06
- `DRAW-FC-047-01` (NEEDS OPTIMIZATION): FC-047-01
- `DRAW-FC-048-01` (NEEDS OPTIMIZATION): FC-048-01
- `DRAW-FC-048-02` (READY): FC-048-02
- `DRAW-FC-048-03` (READY): FC-048-03
- `DRAW-FC-048-04` (NEEDS OPTIMIZATION): FC-048-04
- `DRAW-FC-048-05` (NEEDS OPTIMIZATION): FC-048-05
- `DRAW-FC-048-06` (NEEDS OPTIMIZATION): FC-048-06
- `DRAW-FC-050-01` (NEEDS OPTIMIZATION): FC-050-01
- `DRAW-FC-051-01` (NEEDS OPTIMIZATION): FC-051-01
- `DRAW-FC-051-02` (READY): FC-051-02
- `DRAW-FC-051-03` (READY): FC-051-03
- `DRAW-FC-051-04` (NEEDS OPTIMIZATION): FC-051-04
- `DRAW-FC-051-05` (READY): FC-051-05
- `DRAW-FC-051-06` (NEEDS OPTIMIZATION): FC-051-06
- `DRAW-FC-053-01` (NEEDS OPTIMIZATION): FC-053-01
- `DRAW-FC-054-01` (NEEDS OPTIMIZATION): FC-054-01
- `DRAW-FC-054-02` (READY): FC-054-02
- `DRAW-FC-054-03` (NEEDS OPTIMIZATION): FC-054-03
- `DRAW-FC-054-04` (NEEDS OPTIMIZATION): FC-054-04
- `DRAW-FC-054-05` (NEEDS OPTIMIZATION): FC-054-05
- `DRAW-FC-054-06` (NEEDS OPTIMIZATION): FC-054-06
- `DRAW-FC-056-01` (READY): FC-056-01
- `DRAW-FC-057-01` (NEEDS OPTIMIZATION): FC-057-01
- `DRAW-FC-057-02` (READY): FC-057-02
- `DRAW-FC-057-03` (READY): FC-057-03
- `DRAW-FC-057-04` (READY): FC-057-04
- `DRAW-FC-057-05` (NEEDS OPTIMIZATION): FC-057-05
- `DRAW-FC-057-06` (NEEDS OPTIMIZATION): FC-057-06
- `DRAW-FC-059-01` (NEEDS OPTIMIZATION): FC-059-01
- `DRAW-FC-060-01` (NEEDS OPTIMIZATION): FC-060-01
- `DRAW-FC-060-02` (READY): FC-060-02
- `DRAW-FC-060-03` (NEEDS OPTIMIZATION): FC-060-03
- `DRAW-FC-060-04` (NEEDS OPTIMIZATION): FC-060-04
- `DRAW-FC-060-05` (NEEDS OPTIMIZATION): FC-060-05
- `DRAW-FC-060-06` (READY): FC-060-06
- `DRAW-FC-062-01` (NEEDS OPTIMIZATION): FC-062-01
- `COMPOSITE-FC-FRONT-001` (UNRESOLVED): FC-FRONT-001
- `COMPOSITE-WB-FRONT-001` (UNRESOLVED): WB-FRONT-001
- `COMPOSITE-WB-FRONT-003` (UNRESOLVED): WB-FRONT-003
