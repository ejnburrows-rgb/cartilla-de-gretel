# Flipchart source PDFs (raw, unprocessed)

Corrected per-section source PDFs for the Teacher Flip Chart, supplied directly
by the project owner to replace the outdated/incorrect files this repo had
before. Each file is a multi-page export (cover variants, proofs, crop marks,
etc.) for one flipchart section — not yet run through the art-extraction
pipeline.

| File | Section |
| --- | --- |
| `1Portada.pdf` | Front cover |
| `1aContraportada.pdf` | Back cover |
| `2Las_hermanitas_vocales_Rima.pdf` | Vowels rhyme ("Las hermanitas vocales") |
| `10Mm.pdf` | Letter M |
| `11Pp.pdf`, `12Pp.pdf`, `13Pp.pdf` | Letter P |
| `14Ss.pdf`, `15Ss.pdf`, `16Ss.pdf` | Letter S |
| `17Tt.pdf`, `18Tt.pdf` | Letter T |
| `19Dd.pdf`, `20Dd.pdf`, `21Dd.pdf` | Letter D |
| `22Ll.pdf`, `23Ll.pdf`, `24Ll.pdf` | Letter L |
| `25Nn.pdf`, `26Nn.pdf` | Letter N |

## Status

Raw and unprocessed. `scripts/extract-art.mjs` renders source PDFs to PNG via
`scripts/pdf-to-png.swift` (macOS PDFKit only) and currently points at a
different, non-existent `Cartilla 1 Interactivos/` directory outside the repo
— it has not been updated to read from here yet. No page images have been
generated from these files; `src/data/teacher-flipchart.json` and
`src/lib/flipchart-hd.ts` still serve the prior (flagged-as-wrong) flipchart
art until that pipeline step is run and the extracted pages are wired in.
