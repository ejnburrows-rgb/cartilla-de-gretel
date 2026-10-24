# Picture-slot integrity audit + drop-in manifest

Generated: 2026-10-21T08:33:19.799Z by `scripts/build-picture-slot-manifest.mjs`.
Scope: READ-ONLY audit. No existing picture file or app code was modified, moved, renamed or deleted.

## Totals

- Art files on disk under public/cartilla/art: 777
- Static references found in src/ and public/: 2771
- OK (reference resolves to an existing file): 2306
- MISSING-FILE (reference has no file on disk): 340
- WORD-FILE-MISMATCH (caption and file name disagree, undocumented): 0
- KNOWN-HISTORICAL-NAME (documented historical file name): 17
- SCENE-CAPTION (generic scene/cover file names, informational): 108
- Dynamic template-literal references (checked by prefix): 10
- Art files on disk not referenced from source: 183

## Known finding: the avion slot wired to the pez file

- `src/data/page-layouts.json` line 910: caption "avión" -> `/cartilla/art/faithful/leccion-1/pez.webp` (KNOWN-HISTORICAL-NAME).
- `src/data/page-layouts.json` line 1209: caption "avión" -> `/cartilla/art/faithful/leccion-1/pez.webp` (KNOWN-HISTORICAL-NAME).
- `src/data/page-layouts.json` line 1426: caption "avión" -> `/cartilla/art/faithful/leccion-1/pez.webp` (KNOWN-HISTORICAL-NAME).

Documented in src/data/book-transcription/lessons-01-07.json: leccion-1/pez.webp shows the workbook's airplane (avion); file names are historical, captions follow the drawing. The drawing behind the file was NOT re-inspected by this script; visual confirmation stays on the owner side-by-side gate.

## MISSING-FILE references

By surface: app-data: 4, build-manifest: 260, test: 9, app-data-runtime-manifest: 67.

App-facing MISSING-FILE findings (referenced by code or data the app loads):

- `src/content/games/payaso-chano-ss.ts`: 4 reference(s) under `/cartilla/art/payaso-chano/`. Example: `/cartilla/art/payaso-chano/pizarra.svg`.
- `public/cartilla/art/manifest.json`: 67 reference(s) under `/cartilla/art/hd/workbook/`, `/cartilla/art/illustrations/`. Example: `/cartilla/art/hd/workbook/page-001.jpg`.

Known consumers, checked by hand during this audit:
- /cartilla/art/hd/workbook/*.jpg is referenced only through public/cartilla/art/manifest.json, fetched by src/hooks/useBookArt.ts and rendered by src/components/cartilla/BookArtFigure.tsx. No live route imports BookArtFigure on main 6121ae0c (grep, this audit), so these 67 references currently feed a dormant component. NOT VERIFIED visually.
- /cartilla/art/payaso-chano/*.svg (4 files) is referenced by src/content/games/payaso-chano-ss.ts, which is routed through src/routes/cartilla/juego.$gameId.tsx. Whether the component renders those exact paths or a fallback was NOT VERIFIED by this script.

Build-manifest MISSING-FILE references (tooling data pointing at generated or absent work directories; not shipped app slots):

- `src/data/conversion-status.json`: 35
- `src/data/reconstruction/ai-optimization-manifest.json`: 26
- `src/data/reconstruction/color-finishing-manifest.json`: 24
- `src/data/reconstruction/deterministic-master-lock.json`: 13
- `src/data/reconstruction/production-manifest.json`: 25
- `public/cartilla/art/delivery/manifest.json`: 67
- `public/cartilla/art/faithful/quarantine.json`: 70

## WORD-FILE-MISMATCH (undocumented)

None.

## Drop-in manifest for the 55 true-remainder pictures

Source list: scripts/picture-slot-manifest/still-missing-55.json (parsed from Cartilla-STILL-MISSING-TRUE-REMAINDER.pdf, built 2026-10-21 from main 6121ae0c: 35 flip chart + 20 workbook).
Every slot below already names the exact file the replacement picture must land at. When the new art arrives, it drops in at expected_drop_in_path with zero rewiring. Nothing is replaced by this audit.

| # | Section | Lesson | Picture | Status | Defect | Drop-in path (expected file) |
|---|---------|--------|---------|--------|--------|------------------------------|
| 1 | FLIP CHART | 2 (Vowel A) | Oto | NEEDS-NEW-PICTURE | DEFECT: clipped: lower portrait of Oto cut | `/cartilla/art/optimized/flipchart-native/p004-oto.png` |
| 2 | FLIP CHART | 7 (Letter M) | Ilustración de la página 11 | NEEDS-NEW-PICTURE | DEFECT: clipped: lower flower border cut + spiral binding artifact at top | `/cartilla/art/optimized/flipchart-native/p011-scene.png` |
| 3 | FLIP CHART | 8 (Letter P) | Pepe | NEEDS-NEW-PICTURE | DEFECT: clipped: top of hair cut flat | `/cartilla/art/optimized/flipchart-native/p012-pepe.png` |
| 4 | FLIP CHART | 9 (Letter S) | pisa | NEEDS-NEW-PICTURE | DEFECT: missing banana peel and ground shadow from the book drawing | `/cartilla/art/optimized/flipchart-native/p015-pisa.png` |
| 5 | FLIP CHART | 9 (Letter S) | sopa | NEEDS-NEW-PICTURE | DEFECT: different version: pink steam added, bowl reshaped; not the book drawing | `/cartilla/art/optimized/flipchart-native/p015-sopa.png` |
| 6 | FLIP CHART | 9 (Letter S) | Susi | NEEDS-NEW-PICTURE | DEFECT: cropped at bottom: legs cut off (book shows full kneeling legs + shoe) | `/cartilla/art/optimized/flipchart-native/p015-susi.png` |
| 7 | FLIP CHART | 9 (Letter S) | Ilustración de la página 17 | NEEDS-NEW-PICTURE | DEFECT: cropped/squashed: bottom flowers, grass and small frog lost | `/cartilla/art/optimized/flipchart-native/p017-scene.png` |
| 8 | FLIP CHART | 9 (Letter S) | sopa | NEEDS-NEW-PICTURE | MINOR: steam tips cut at top edge | `/cartilla/art/faithful/leccion-9-s/sopa.webp` |
| 9 | FLIP CHART | 11 (Letter D) | dados | NEEDS-NEW-PICTURE | DEFECT: caption "dados" baked into the picture (book has no caption) | `/cartilla/art/optimized/flipchart-native/p021-dados.webp` |
| 10 | FLIP CHART | 11 (Letter D) | dedo | NEEDS-NEW-PICTURE | DEFECT: caption "dedo" baked into the picture | `/cartilla/art/optimized/flipchart-native/p021-dedo.webp` |
| 11 | FLIP CHART | 11 (Letter D) | Dunia | NEEDS-NEW-PICTURE | DEFECT: caption "Dunia" baked into the picture | `/cartilla/art/optimized/flipchart-native/p021-dunia.webp` |
| 12 | FLIP CHART | 12 (Letter L) | Ilustración de la página 24 | NEEDS-NEW-PICTURE | DEFECT: different layout: extra moon character added, scene rearranged | `/cartilla/art/optimized/flipchart-native/p024-scene.png` |
| 13 | FLIP CHART | 12 (Letter L) | Lala | NEEDS-NEW-PICTURE | DEFECT: degraded: darkened, heavier outlines, distorted vs book | `/cartilla/art/optimized/flipchart-native/p024-lala.png` |
| 14 | FLIP CHART | 14 (Letter Ñ) | Ñuno | NEEDS-NEW-PICTURE | DEFECT: missing head and neck of the ostrich | `/cartilla/art/optimized/flipchart-native/p030-nuno.png` |
| 15 | FLIP CHART | 14 (Letter Ñ) | piñata | NEEDS-NEW-PICTURE | DEFECT: cropped at bottom: boy legs cut off | `/cartilla/art/optimized/flipchart-native/p030-pinata.png` |
| 16 | FLIP CHART | 15 (Letter B) | bebita | NEEDS-NEW-PICTURE | DEFECT: cropped: bassinet legs and wheels missing (book shows full stand) | `/cartilla/art/optimized/flipchart-native/p033-bebita.png` |
| 17 | FLIP CHART | 15 (Letter B) | Ilustración de la página 35 | NEEDS-NEW-PICTURE | MINOR: reframed: boy shrunk, extra sketched ball at top - owner should judge against the physical book | `/cartilla/art/optimized/flipchart-native/p035-scene.png` |
| 18 | FLIP CHART | 16 (Letter V) | Vuli | NEEDS-NEW-PICTURE | DEFECT: cropped at bottom: paws and lower body cut off | `/cartilla/art/optimized/flipchart-native/p036-vuli.png` |
| 19 | FLIP CHART | 18 (Letter RR) | burro | NEEDS-NEW-PICTURE | - | `/cartilla/art/optimized/flipchart-native/p042-burro.png` |
| 20 | FLIP CHART | 19 (Letter G) | gorra | NEEDS-NEW-PICTURE | MINOR: mild shrink | `/cartilla/art/optimized/flipchart-native/p045-gorra.png` |
| 21 | FLIP CHART | 19 (Letter G) | cubo | NEEDS-NEW-PICTURE | MINOR: right edge possibly clipped / COLOR: arrows red -> orange, bucket green -> lime | `/cartilla/art/faithful/leccion-19-c/cubo.webp` |
| 22 | FLIP CHART | 19 (Letter G) | gato | NEEDS-NEW-PICTURE | DEFECT: scene-fragment crop (FC p47 scene incl. hearts/tail) | `/cartilla/art/faithful/leccion-19-g/gato.webp` |
| 23 | FLIP CHART | 19 (Letter G) | gorra | NEEDS-NEW-PICTURE | DEFECT: bottom brim clipped flat | `/cartilla/art/faithful/leccion-19-g/gorra.webp` |
| 24 | FLIP CHART | 20 (Letter F) | familia | NEEDS-NEW-PICTURE | DEFECT: heads cropped at top | `/cartilla/art/optimized/flipchart-native/p048-familia.png` |
| 25 | FLIP CHART | 20 (Letter F) | familia | NEEDS-NEW-PICTURE | DEFECT: right-edge seam strip | `/cartilla/art/faithful/leccion-20-f/familia.webp` |
| 26 | FLIP CHART | 20 (Letter F) | fiesta | NEEDS-NEW-PICTURE | DEFECT: scene-fragment crop (FC p50) + right seam | `/cartilla/art/faithful/leccion-20-f/fiesta.webp` |
| 27 | FLIP CHART | 21 (Letter J) | jarra | NEEDS-NEW-PICTURE | DEFECT: shrunken in canvas | `/cartilla/art/optimized/flipchart-native/p051-jarra.png` |
| 28 | FLIP CHART | 21 (Letter J) | jugo | NEEDS-NEW-PICTURE | DEFECT: shrunken + bottom clipped | `/cartilla/art/optimized/flipchart-native/p051-jugo.png` |
| 29 | FLIP CHART | 21 (Letter J) | Ilustración de la página 53 | NEEDS-NEW-PICTURE | MINOR: left-edge seam strip | `/cartilla/art/optimized/flipchart-native/p053-scene.png` |
| 30 | FLIP CHART | 21 (Letter J) | jarra | NEEDS-NEW-PICTURE | DEFECT: bottom cropped (base/fruit cut) / COLOR: crimson -> hot pink | `/cartilla/art/faithful/leccion-21-j/jarra.webp` |
| 31 | FLIP CHART | 21 (Letter J) | jugo | NEEDS-NEW-PICTURE | DEFECT: bottom cropped | `/cartilla/art/faithful/leccion-21-j/jugo.webp` |
| 32 | FLIP CHART | 22 (Letter C) | cubo | NEEDS-NEW-PICTURE | MINOR: mild shrink | `/cartilla/art/optimized/flipchart-native/p054-cubo.png` |
| 33 | FLIP CHART | 22 (Letter C) | Ilustración de la página 54 | NEEDS-NEW-PICTURE | MINOR: left-edge strip + corner mark | `/cartilla/art/optimized/flipchart-native/p054-scene.png` |
| 34 | FLIP CHART | 22 (Letter C) | yema | NEEDS-NEW-PICTURE | DEFECT: rough sketchy re-trace, degraded | `/cartilla/art/faithful/leccion-22-y/yema.webp` |
| 35 | FLIP CHART | 23 (Letter Y) | yema | NEEDS-NEW-PICTURE | DEFECT: shrunken in canvas | `/cartilla/art/optimized/flipchart-native/p057-yema.png` |
| 36 | WORKBOOK | 1 (Vowel O) | globo | NEEDS-NEW-PICTURE | DEFECT: tinted: balloon rendered near-black, unreadable / COLOR: balloon rendered near-black, unreadable | `/cartilla/art/faithful/leccion-1/globo.webp` |
| 37 | WORKBOOK | 1 (Vowel O) | pera | NEEDS-NEW-PICTURE | DEFECT: distorted: pear stretched horizontal vs upright book pear | `/cartilla/art/faithful/leccion-1/pera.webp` |
| 38 | WORKBOOK | 1 (Vowel O) | arco | NEEDS-NEW-PICTURE | DEFECT: COLOR: red background removed, nail turned beige (same FC-003-06 original as una) | `/cartilla/art/faithful/leccion-1/arco.webp` |
| 39 | WORKBOOK | 1 (Vowel O) | traje | NEEDS-NEW-PICTURE | - | `/cartilla/art/faithful/leccion-1/traje.webp` |
| 40 | WORKBOOK | 1 (Vowel O) | pez | NEEDS-NEW-PICTURE | DEFECT: COLOR: teal duotone; flip chart original is full color | `/cartilla/art/faithful/leccion-1/pez.webp` |
| 41 | WORKBOOK | 1 (Vowel O) | aguila | NEEDS-NEW-PICTURE | - | `/cartilla/art/faithful/leccion-1/aguila.webp` |
| 42 | WORKBOOK | 1 (Vowel O) | oso (parpadeo) | NEEDS-NEW-PICTURE | - | `/cartilla/art/faithful/vocal-o/oso-blink.webp` |
| 43 | WORKBOOK | 2 (Vowel A) | arbol | NEEDS-NEW-PICTURE | MINOR: green halo speckle | `/cartilla/art/faithful/vocal-a/arbol.webp` |
| 44 | WORKBOOK | 2 (Vowel A) | alas | NEEDS-NEW-PICTURE | - | `/cartilla/art/faithful/vocal-a/alas.webp` |
| 45 | WORKBOOK | 4 (Vowel I) | iglesia | NEEDS-NEW-PICTURE | MINOR: sepia tint (colors-free rule - owner call) | `/cartilla/art/faithful/vocal-i/iglesia.webp` |
| 46 | WORKBOOK | 4 (Vowel I) | igual | NEEDS-NEW-PICTURE | DEFECT: degraded: equals sign thin and wispy vs bold book bars / extra stray line included + navy tint | `/cartilla/art/faithful/vocal-i/igual.webp` |
| 47 | WORKBOOK | 4 (Vowel I) | iguana | NEEDS-NEW-PICTURE | MINOR: speckle top-right | `/cartilla/art/faithful/vocal-i/iguana.webp` |
| 48 | WORKBOOK | 4 (Vowel I) | invierno | NEEDS-NEW-PICTURE | DEFECT: clipped: left part of winter scene cut / cropped right + top frame line | `/cartilla/art/faithful/vocal-i/invierno.webp` |
| 49 | WORKBOOK | 5 (Vowel U) | uvas | NEEDS-NEW-PICTURE | MINOR: clipped: bottom grapes cut / slightly tighter crop | `/cartilla/art/faithful/vocal-u/uvas.webp` |
| 50 | WORKBOOK | 11 (Letter D) | dado | NEEDS-NEW-PICTURE | - | `/cartilla/art/faithful/leccion-11-d/dado.webp` |
| 51 | WORKBOOK | 14 (Letter Ñ) | niño | NEEDS-NEW-PICTURE | DEFECT: cropped at bottom: crossed feet cut off | `/cartilla/art/faithful/leccion-14-n/nino.webp` |
| 52 | WORKBOOK | 15 (Letter B) | bebé | NEEDS-NEW-PICTURE | DEFECT: cropped: bassinet legs and wheels missing (book shows full stand) / COLOR: bassinet crimson -> hot pink, trim | `/cartilla/art/faithful/leccion-15-b/bebe.webp` |
| 53 | WORKBOOK | 17 (Letter R) | remo | NEEDS-NEW-PICTURE | MINOR: COLOR: mauve -> vivid purple | `/cartilla/art/faithful/leccion-17-r/remo.webp` |
| 54 | WORKBOOK | 18 (Letter RR) | burro | NEEDS-NEW-PICTURE | DEFECT: COLOR: gray-brown body -> mustard/olive halftone | `/cartilla/art/faithful/leccion-18-rr/burro.webp` |
| 55 | WORKBOOK | 18 (Letter RR) | perro | NEEDS-NEW-PICTURE | DEFECT: scene-fragment crop (rhyme scene), not word cutout | `/cartilla/art/faithful/leccion-18-rr/perro.webp` |
