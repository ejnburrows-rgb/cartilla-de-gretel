# Art backlog — current, authoritative

This is the real, current list of illustration art still needed. It is kept
in git (not chat) specifically so it never goes stale the moment `main`
moves — read this file fresh every time, don't rely on an earlier chat
message. Last verified: July 2026, against `src/data/page-layouts.json` and
`public/cartilla/art/faithful/manifest.json` on `main`.

## Update — full re-audit of all 51 wired crops, real work reopened

The "no open art-extraction work" line below is **no longer true** — a full,
direct, full-resolution re-check of every one of the 51 files currently in
`manifest.json` (not a sample, all of them) found real, concrete defects.
Every item below was opened and judged individually — none of this is
guesswork or taken from a screenshot inside the app (the app's small cell
containers can make a fine crop look worse than it is, and vice versa — see
the `uña` note further down).

### Real defects — please re-crop these (crop tighter/looser as noted, never
### invent new art, same rule as always)
- `arbol` — a star-shaped fragment from the neighboring grid cell is
  bleeding into the frame. Crop tighter to exclude it.
- `oruga` — two different neighboring cells' fragments bleed in, plus a
  stray grid-divider line is visible. Crop tighter.
- `maiz` — a bird/duck fragment from a neighboring cell plus a grid-divider
  line bleed in at the top-right corner. Crop tighter.
- `iguana` — a fan/plant fragment plus a grid-divider line bleed in on the
  right side, **and** the export is wrongly grayscale — every other crop in
  the set is full color, this one needs to be re-exported in color.
- `erizo` — way too loose: the actual subject only fills about 15% of the
  frame, the rest is blank blue background. Crop in tight around the
  subject.
- `ojos` — same problem: the eyes are confined to a thin strip at the top,
  roughly 70% of the frame below them is blank white space. Crop in tight.
- `abanico` — this reads as a random corner fragment of a busy, multi-color
  composite scene (looks like fireworks/sky/an unrelated stray shape), not
  an isolated "fan" illustration at all. Needs a real re-crop centered on
  just the fan.
- `abeja` — exported as a grayscale/monochrome line drawing where every
  other crop in the set is full color. Re-export in color.
- `igual` — **the worst one, please prioritize.** The current crop shows
  fragments of at least 3 different neighboring grid cells bleeding in from
  every side (another animal top-left, a person in a hat top-right, another
  animal bottom-right) around a tiny "=" in the middle. This needs a real,
  isolated re-crop of just the "=" symbol, not a partial-grid collage.
- `abrigo` — a thin teal grid-divider line is visible along two edges, and
  a fragment of a neighboring cell (looks like a small flower/circle) bleeds
  in at the bottom-left corner. Crop tighter to exclude both.
- `globo` — a grid-divider line is visible on the left edge, and a fragment
  of a neighboring cell (a spiky/leaf shape unrelated to a balloon) bleeds
  in at the bottom-right. Crop tighter.
- `ardilla` — a grid-divider line is visible at the top, and what looks
  like a fragment of a caption/word from the row above bleeds in at the
  very top edge. Crop tighter to exclude both.

### Minor, but check your crop-tool margins — this looks systemic, not
### one-off
A thin (1-3px) sliver of the original teal grid-divider line is visible
along one edge on a noticeable number of otherwise-clean, tight, correct
crops: `ola`, `pajaro`, `remolino`, `libro`, `aguja`, `anillo`, `taza`,
`uniforme`, `invierno`. Each of these is fine as a subject (tight,
recognizable, correct), so these do NOT need a full re-crop — but since it's
showing up this often, please check whatever margin/inset setting your crop
tool uses by default, since it looks like it's leaving a hairline of the
grid border in on a lot of exports rather than being an isolated mistake on
any one word.

### Needs a second look, not a confirmed defect
- `pera` — noticeably paler/lower-contrast than every other crop in the set
  (looks almost washed-out/monochrome-white rather than the pear's natural
  color). It may just need a levels/contrast pass rather than a re-crop —
  please double-check against the source page and re-export with normal
  color/contrast if it looks washed out there too.
- `escalera` — a faint, semi-transparent watermark-like text ghost is
  visible overlaid across the ladder. If this is a leftover artifact from
  whatever tool/source produced the export, please re-export without it.

### Re-checked and cleared — do NOT reopen these
- `uña` — an earlier note in this file already says this was "verified
  directly... genuine, tight fingernail crop... merged." A separate quick
  look flagged it as looking like "an unidentifiable blob," which turned
  out to be a false alarm caused by viewing it scaled down inside the app's
  small cell container rather than at full resolution — opened the actual
  file directly and it is genuinely clean and correct. **This word is
  fine, leave it alone.**
- The "first 6 confirmed done" note below (`aguja`, `anillo`, `manzana`,
  `pera`, `taza`, `uniforme`) mostly still holds — `anillo`, `taza`, and
  `uniforme` are genuinely fine subject-wise (just the minor grid-line
  sliver noted above); `manzana` is fully clean, no notes. `aguja` is also
  fine subject-wise (same minor grid-line sliver). `pera` is the one
  exception — see "needs a second look" above.
- Everything else currently in the manifest not named anywhere in this
  update (`iglu`, `oso`, `estrella`, `unicornio`, `escoba`, `iglesia`,
  `casa`, `carro`, `manzana`, `avion`, `dulce`, `alas`, `araña`, `elefante`,
  `indio`, `insecto`, `isla`, `ocho`, `oreja`, `espejo`, `uno`, `oveja`,
  `aro`, `imán`, `olla`, `uvas`, `escuela`) was opened and checked directly
  — all genuinely clean, tight, correct. Do not touch these.

## Update — first 6 confirmed done
`aguja`, `anillo`, `manzana`, `pera`, `taza`, `uniforme` were delivered on
`art/final-6-words` and checked directly (not just taken on report) — all
6 are genuinely clean, tight crops with no neighbor bleed. These are done;
don't redo them.

## Update — the last word is closed out
`uña` was delivered and verified directly (a genuine, tight fingernail
crop) — merged. `urna` was first delivered as a duplicate of the `uña`
file mislabeled — rejected, not merged. Antigravity then reported `urna`
doesn't actually appear anywhere in the book (a hallucinated word, same
category as arco/pez/traje/águila below) and removed it. That claim is
**not independently verified against the physical scan** — taken on
report, same caveat as the other "doesn't exist" words. If it later turns
up in a real page, add it back here.

**Vocabulary games note**: the student-facing games (word matching, etc.)
still use emoji pictures for their 18 other words even though real crops
for those already exist in the manifest — that's an app-side wiring task
(Claude's side), not an art-extraction task. Nothing further needed from
Antigravity on vocabulary art right now.

**Crop rule**: crop tight to just the illustration itself. If a neighboring
cell's label or drawing is bleeding into the frame, the crop boundary is
wrong — move it in, don't just accept the bleed. When in doubt, crop
tighter rather than looser.

## Confirmed NOT to exist in the source material — do not attempt
arco, pez, traje, águila, urna — these words appear in the app's content
but have no corresponding illustration anywhere in the physical book's
scans (per Antigravity's own report — not independently re-verified by
Claude against the physical pages). Leave their cells showing "art
pending" — that's correct, not a gap to fill.

## Current status: SUPERSEDED, see the re-audit update at the top of this file
This line used to say "no open art-extraction work" — that's no longer
true. See the "full re-audit of all 51 wired crops" section at the top of
this file for the real, current, concrete list.

## Already done — do not re-deliver
Every word in `public/cartilla/art/faithful/manifest.json` (51 entries as of
this writing) not listed in the re-audit section above is already solved
and shipped, confirmed by direct visual re-check, not just by being present
in the manifest. If you're about to crop a word, check the manifest first —
if it's already there with a real `src` and isn't named in the re-audit
section above, it's done.

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
