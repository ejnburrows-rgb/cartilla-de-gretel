# Missing assets - current, honest state (this turn)

Result of a full audit of every 0-byte / near-empty file under
`public/cartilla/art/faithful/`. See `ART_BACKLOG.md` for the longer history
of prior wrong-crop discoveries - this file tracks only what's still
unresolved after this pass, plus what was recovered/rejected this turn.

## Recovered this turn (verified correct subject, restored)

- `leccion-1/ola.webp` - was 0 bytes. Historical blob at commit `c0f2d10` (3574 bytes) recovered.
- - `vocal-o/oruga.webp` - was 118 bytes (blank teal sliver). Historical blob (6694 bytes) recovered.
  - - `leccion-1/ojos.webp` - was 0 bytes. Historical blob (4.65 KB) recovered.
    - - `leccion-1/oruga.webp` - was 0 bytes. Historical blob (6.54 KB) recovered.
      - - `leccion-22-g-j/gato.webp` - was 0 bytes. Historical blob recovered.
       
        - ## Rejected this turn (historical blob exists, but shows the wrong subject - NOT restored)
       
        - All of these were 0-byte on disk and referenced only from
        - `src/content/workbook/workbook-manifest.json` (a duplicate/legacy content
        - file, distinct from the live `page-layouts.json`/`consonants.json`). Each
        - historical blob was pulled and opened at full resolution; none show the
        - labeled subject, so none were restored. The `asset` reference was instead
        - removed from `workbook-manifest.json` (object renders text-only now):
       
        - - `leccion-1/carro.webp` - recovered blob shows a page fragment with a large "9" and letter "e".
          - - `leccion-1/casa.webp` - recovered blob shows a man with a rake and a cartoon bear/rabbit.
            - - `leccion-1/dulce.webp` - recovered blob shows "Circula el..." instruction text.
              - - `leccion-1/iglesia.webp` - recovered blob shows claws holding a broom.
                - - `leccion-1/libro.webp` - recovered blob shows a mirrored letter "u".
                  - - `leccion-1/pajaro.webp` - no better historical blob than the current 0 bytes.
                   
                    - Also stripped: `vocal-o/ojos.webp`, `leccion-1/globo.webp`, `vocal-a/ardilla.webp`, `vocal-e/erizo.webp`, `vocal-i/iguana.webp`, `vocal-i/igual.webp`, `leccion-1/abeja_wb.webp`.
                   
                    - ## Still 0 bytes, no usable historical blob at all (never had real content in git history)
                   
                    - Pending real art. Not referenced by any live content source - confirmed via a full-repo grep:
                   
                    - - `leccion-1/abeja.webp`
                      - - `leccion-18-c/caballo.webp`
                        - - `leccion-18-c/cama.webp`
                          - - `leccion-19-ch/chaleco.webp`
                            - - `leccion-19-ch/chile.webp`
                              - - `leccion-20-f/fila.webp`
                                - - `leccion-21-y-ll/llanta.webp`
                                  - - `leccion-21-y-ll/llave.webp`
                                    - - `leccion-22-g-j/gota.webp`
                                      - - `leccion-23-h-z/hielo.webp`
                                        - - `leccion-23-h-z/hoja.webp`
                                          - - `leccion-24-k-w-x/kiwi.webp`
                                            - - `leccion-24-k-w-x/koala.webp`
                                             
                                              - These need a real crop from source scans.
                                             
                                              - ## Guard now in place
                                             
                                              - `scripts/validate-content.mjs` (runs in `pnpm build`) and `manifest-integrity.test.ts` / `art-slots-integrity.test.ts` (run in `pnpm test`) now enforce a 1500-byte floor on every referenced asset.
