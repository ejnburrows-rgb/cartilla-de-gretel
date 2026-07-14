# Missing assets — current, honest state (this turn)

Result of a full audit of every 0-byte / near-empty file under
`public/cartilla/art/faithful/`. See `ART_BACKLOG.md` for the longer history
of prior wrong-crop discoveries — this file tracks only what's still
unresolved after this pass, plus what was recovered/rejected this turn.

## Recovered this turn (verified correct subject, restored)

- `leccion-1/ola.webp` — was 0 bytes. Historical blob at commit `c0f2d10`
  (3574 bytes) recovered and visually confirmed: a wave/swirl illustration,
  consistent with "ola". Restored. (Not currently wired via any
  `illustrationSrc`/`asset` reference — it's a distractor caption in
  page-layouts.json with no image slot — so this only fixes the file on
  disk, nothing changes on screen yet.)
- `vocal-o/oruga.webp` — was 118 bytes (blank teal sliver). Historical blob
  (6694 bytes) recovered and visually confirmed: a real caterpillar
  illustration. Restored.

## Rejected this turn (historical blob exists, but shows the wrong subject — NOT restored)

All of these were 0-byte on disk and referenced only from
`src/content/workbook/workbook-manifest.json` (a duplicate/legacy content
file, distinct from the live `page-layouts.json`/`consonants.json`). Each
historical blob was pulled and opened at full resolution; none show the
labeled subject, so none were restored. The `asset` reference was instead
removed from `workbook-manifest.json` (object renders text-only now — the
schema's own documented "art isn't ready yet" state, not invented art):

- `leccion-1/carro.webp` — recovered blob shows a page fragment with a
  large "9" and letter "e", not a car.
- `leccion-1/casa.webp` — recovered blob shows a man with a rake and a
  cartoon bear/rabbit, not a house.
- `leccion-1/dulce.webp` — recovered blob shows "Circula el..." instruction
  text and a letter "p", not candy.
- `leccion-1/iglesia.webp` — recovered blob shows claws holding a broom,
  not a church.
- `leccion-1/libro.webp` — recovered blob shows a mirrored letter "u", not
  a book.
- `leccion-1/pajaro.webp` — no better historical blob than the current
  0 bytes (never had real content).

Also stripped (non-zero but under the new 1500-byte floor, opened and
confirmed to be garbage crops — blank corner slivers or a single unrelated
line, not the labeled subject): `vocal-o/ojos.webp`, `leccion-1/globo.webp`,
`vocal-a/ardilla.webp`, `vocal-e/erizo.webp`, `vocal-i/iguana.webp`,
`vocal-i/igual.webp`, `leccion-1/abeja_wb.webp`.

## Still 0 bytes, no usable historical blob at all (never had real content in git history)

Pending real art. Not referenced by any live content source
(`page-layouts.json`, `consonants.json`, `lessons.json`) — confirmed via a
full-repo grep — so nothing on screen is currently broken by these; they're
tracked here so they aren't forgotten:

- `leccion-1/abeja.webp`
- `leccion-1/ojos.webp`
- `leccion-1/oruga.webp`
- `leccion-18-c/caballo.webp`
- `leccion-18-c/cama.webp`
- `leccion-19-ch/chaleco.webp`
- `leccion-19-ch/chile.webp`
- `leccion-20-f/fila.webp`
- `leccion-21-y-ll/llanta.webp`
- `leccion-21-y-ll/llave.webp`
- `leccion-22-g-j/gato.webp`
- `leccion-22-g-j/gota.webp`
- `leccion-23-h-z/hielo.webp`
- `leccion-23-h-z/hoja.webp`
- `leccion-24-k-w-x/kiwi.webp`
- `leccion-24-k-w-x/koala.webp`

These need a real crop from source scans (same pipeline as everything else
in `ART_BACKLOG.md`) — not a re-recovery, since git history has nothing
better for any of them.

## Guard now in place

`scripts/validate-content.mjs` (runs in `pnpm build`) and
`manifest-integrity.test.ts` / `art-slots-integrity.test.ts` (run in
`pnpm test`) now enforce a 1500-byte floor on every referenced asset, not
just existence — a 0-byte or near-empty stub will fail the build/test run
the moment anything tries to reference one of the files above. That's what
caught the `ojos`/`globo`/`ardilla`/`erizo`/`iguana` set above.
