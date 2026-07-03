# Art backlog — current, authoritative

This is the real, current list of illustration art still needed. It is kept
in git (not chat) specifically so it never goes stale the moment `main`
moves — read this file fresh every time, don't rely on an earlier chat
message. Last verified: July 2026, against `src/data/page-layouts.json` and
`public/cartilla/art/faithful/manifest.json` on `main`.

## Still needed (6 words)

| word | status | notes |
|---|---|---|
| aguja | never attempted | no crop exists yet at all |
| anillo | needs re-crop | last delivery still had a neighboring word's label bleeding in from the top edge |
| manzana | needs re-crop | earlier bad crop moved to `_needs-recrop/`, never fixed |
| pera | needs re-crop | earlier bad crop moved to `_needs-recrop/`, never fixed |
| taza | needs re-crop | earlier bad crop moved to `_needs-recrop/`, never fixed |
| uniforme | needs re-crop | last delivery still had neighbor-bleed below the illustration plus an oversized blank canvas |

**Crop rule**: crop tight to just the illustration itself. If a neighboring
cell's label or drawing is bleeding into the frame, the crop boundary is
wrong — move it in, don't just accept the bleed. When in doubt, crop
tighter rather than looser.

## Confirmed NOT to exist in the source material — do not attempt
arco, pez, traje, águila — these words appear in `page-layouts.json`'s
captions but have no corresponding illustration anywhere in the physical
book's scans. Leave their cells showing "art pending" — that's correct,
not a gap to fill.

## Already done — do not re-deliver
Every other word currently wired in `public/cartilla/art/faithful/manifest.json`
(44 entries as of this writing) is already solved and shipped. If you're
about to crop a word, check the manifest first — if it's already there with
a real `src`, it's done.

## Where files go
`public/cartilla/art/faithful/<folder>/<slug>.webp` — reuse the existing
per-lesson/per-vowel folders already in the manifest
(`leccion-1/`, `vocal-a/`, `vocal-e/`, `vocal-i/`, `vocal-o/`, `vocal-u/`).
Do not create a new flat folder (e.g. `vocales/`) — it breaks the lookup
convention every other tool in this repo expects.

Add a manifest entry for each new/fixed file:
```json
{ "slug": "aguja", "word": "aguja", "lessonNumber": null, "pageNumber": null,
  "src": "/cartilla/art/faithful/vocal-a/aguja.webp",
  "sourceFlipchartPage": null, "cropBox": null }
```

## How to submit
Push to a fresh branch off current `main`, open a PR against this repo.
Do not touch `src/data/page-layouts.json` — that's owned by Claude, who
wires `illustrationSrc` in once your PR lands.
