# Missing Assets Audit

## RECOVERED
- `public/cartilla/art/faithful/leccion-1/ojos.webp`
  - **Correction: this entry is stale.** The file does not exist on disk
    (checked directly — no `ojos.webp` anywhere under
    `public/cartilla/art/faithful/leccion-1/`). Whatever recovery was
    recorded here either never landed or was lost in a later change. Treat
    `leccion-1/ojos.webp` as still missing, not recovered.
  - Source blob: `cf0d6c7d4792d6d9154102f29b8e08b4dd706275`
  - Source commit: Historic blob (previously added to git history)
  - Processing performed: Extracted exact original blob, verified visually as green eyes.

- `public/cartilla/art/faithful/leccion-1/oruga.webp`
  - Source blob: `8941582b380f7b0e8204c593e3d04b60192b18cf`
  - Source commit: Historic blob (from `vocal-o/oruga.webp`)
  - Processing performed: Copied from already-recovered `vocal-o/oruga.webp` (visually confirmed caterpillar).

- `public/cartilla/art/faithful/leccion-22-g-j/gato.webp`
  - Source blob: `fdc667d1e8b14be65b1b465177614b6bfe356cd9`
  - Source commit: Historic blob (from `leccion-19-g/gato.webp`)
  - Processing performed: Extracted exact original blob, verified visually as color illustration of two cats.

## PENDING — NO VERIFIED SOURCE FOUND
- `public/cartilla/art/faithful/leccion-1/abeja.webp`
  - Locations searched: Git history blobs for `abeja.webp`, `abeja.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-18-c/caballo.webp`
  - Locations searched: Git history blobs for `caballo.webp`, `caballo.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-18-c/cama.webp`
  - Locations searched: Git history blobs for `cama.webp`, `cama.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-19-ch/chaleco.webp`
  - Locations searched: Git history blobs for `chaleco.webp`, `chaleco.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-19-ch/chile.webp`
  - Locations searched: Git history blobs for `chile.webp`, `chile.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-20-f/fila.webp`
  - Locations searched: Git history blobs for `fila.webp`, `fila.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-21-y-ll/llanta.webp`
  - Locations searched: Git history blobs for `llanta.webp`, `llanta.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-21-y-ll/llave.webp`
  - Locations searched: Git history blobs for `llave.webp`, `llave.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-22-g-j/gota.webp`
  - Locations searched: Git history blobs for `gota.webp`, `gota.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-23-h-z/hielo.webp`
  - Locations searched: Git history blobs for `hielo.webp`, `hielo.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-23-h-z/hoja.webp`
  - Locations searched: Git history blobs for `hoja.webp`, `hoja.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-24-k-w-x/kiwi.webp`
  - Locations searched: Git history blobs for `kiwi.webp`, `kiwi.png`, `hd` and `raw` folders.
- `public/cartilla/art/faithful/leccion-24-k-w-x/koala.webp`
  - Locations searched: Git history blobs for `koala.webp`, `koala.png`, `hd` and `raw` folders.

## RESOLVED SINCE THIS AUDIT
- `leccion-1/dulce.webp`, `leccion-1/libro.webp`, `leccion-1/pajaro.webp` —
  **no longer rejected/missing.** A later commit ("Fill last 3 workbook
  slots: libro, pajaro, dulce (lesson 1)") added real, correct crop files
  for all three — confirmed on disk (real WebP images, 7-20KB each, not
  stubs). Left out of the "REJECTED CANDIDATES" list below because that
  rejection no longer applies to the current files at these paths.

## REJECTED CANDIDATES
- `leccion-1/carro.webp`
  - Rejection reason: Candidate blobs are either a stock vector image or a fragment showing '9' and 'e', not the faithful scan.
  - Still missing — confirmed no file exists at this path.
- `leccion-1/casa.webp`
  - Rejection reason: Candidate blobs show letters 'ca', 'co', 'CO', 'CU' or a man with a rake, not a house.
  - Still missing at this exact path — confirmed no file exists here. Note:
    a working `casa` illustration for the C lesson lives at a different
    path, `leccion-19-c/casa.webp` — see `ART_BACKLOG.md` for that history;
    this entry is specifically about the `leccion-1/casa.webp` path.
- `leccion-1/iglesia.webp`
  - Rejection reason: Candidate blobs show a fragment of a roof in black-and-white.
  - Still missing — confirmed no file exists at this path.
