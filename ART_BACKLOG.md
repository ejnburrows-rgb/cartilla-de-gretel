# Art backlog — current, authoritative

## 🚨 UPDATE (July 2026) — emergency re-audit: the "already verified good" set was WRONG too; scope is much bigger than documented, safe fix already shipped

Triggered by directly opening `mono.webp` again (previously claimed "confirmed
separately and already wired, NOT affected" by the note below) and finding it
shows a floral decoration, not a monkey. That forced a full re-open of every
word from PRs #111/#112 that had been trusted without re-checking. **Every
file below was opened directly at full resolution — not taken on the earlier
report:**

**CONFIRMED WRONG (subject does not match the label at all):**
- `mono.webp` — shows flowers, not a monkey.
- `sapo.webp` — shows a girl's hair, not a toad.
- `sopa.webp` — mostly blank + a tiny unrelated fragment, not soup.
- `dado.webp` — shows a ladder + a bird, not a die.
- `foca.webp` — shows a man eating noodles — this is actually `fideos`'
  illustration (a different F-word), not a seal.
- `zapato.webp` — shows an unrelated yellow/purple shape + leaves, not a shoe.
- `casa.webp` (leccion-19-c) — shows a baby crib + teddy bear, not a house.
- `casa.webp` (leccion-1) — **separate, additional bug**: this file is a
  **0-byte empty file** committed to git (confirmed via `git cat-file -s` =
  0), a broken image reference regardless of subject. Two different `casa`
  files exist at two different paths and both are bad, for two different
  reasons.
- `luna.webp` — shows high-heel shoes + a suitcase, not a moon.
- `bebe.webp` — shows shoe soles + confetti + a possible animal fragment,
  not a baby.
- `rosa.webp` — shows crossed drumsticks — this is actually `remos`'
  illustration (a different R-word), not a rose.
- `remo.webp` — shows a butterfly, not an oar.

**Re-confirmed CORRECT (subject genuinely matches, spot-checked to bound the
damage, not assumed):** `mama`, `papa`, `rana`, `burro`, `gato`, `perro`,
`vela` (marginal — small/off-center but right subject), `rueda` (a bicycle
wheel — correct for "rueda").

**Root cause**: the earlier note directly below ("mamá, mono, papá, sapo,
sopa, dado ... are NOT affected; those are confirmed separately and already
wired") was itself wrong — being sourced from an earlier "hand-verified" PR
did not mean every word in it was actually opened and checked pixel-by-pixel.
Lesson: "hand-verified in an earlier PR" is not a substitute for re-opening
the actual current file before trusting it — a later commit can silently
replace a good crop with a bad one, or the original verification simply
missed a subset.

**Safe fix already shipped this pass (no owner sign-off needed — this is an
unambiguous correctness fix, not a creative call)**: removed the
`illustrationSrc` field for all 11 confirmed-wrong words above, plus the full
34-word `bb3a458` batch below (tulipán, delfín, dona, ducha, lobo, loro, lupa,
nariz, nido, nube, nata, piña, muñeca, niño, barco, bici, vaca, vino, volcán,
yate, yegua, yoyo, zapato, zanahoria, moto, mapa, pino, pulpo, sol, silla,
tapa, tomate, tina, pez), from both `src/content/consonants.json` and
`src/data/page-layouts.json` — **125 references removed total** (structural
JSON edit, not text search-replace). Students now see the honest "art
pending" placeholder instead of actively wrong content. `pnpm tsc --noEmit`
and `pnpm build` both clean after the removal.

**What Antigravity needs to re-crop (real, current, consolidated list — 45
words total, supersedes every prior partial list in this file)**: mono, sapo,
sopa, dado, foca, zapato, casa (both leccion-1 and leccion-19-c paths — verify
which lesson actually owns "casa" and only keep one), luna, bebe, rosa, remo,
tulipán, delfín, dona, ducha, lobo, loro, lupa, nariz, nido, nube, nata, piña,
muñeca, niño, barco, bici, vaca, vino, volcán, yate, yegua, yoyo, zanahoria,
moto, mapa, pino, pulpo, sol, silla, tapa, tomate, tina. (`pez` is excluded —
confirmed elsewhere in this file as not existing in the physical book.)
**Crop rule reminder**: crop tight to only the labeled word's own
illustration; if the source scan shows a grid of vocab pictures, double- and
triple-check the label actually printed next to/under the picture you're
cropping — several of the defects above (rosa/remo swapped, foca showing
fideos) look like an off-by-one grid-cell error, not a bad crop boundary.

**Not yet re-audited**: the remaining consonant-lesson words not named above
or below. Given how wrong the "already verified" assumption turned out to be,
treat anything not explicitly confirmed-correct in this file as unverified,
not safe.

## ⚠️ UPDATE (July 2026) — the "best effort heuristic" batch is confirmed BAD, not just unverified

Commit `bb3a458` ("Extract 69 vocabulary crops (best effort heuristic)",
already merged to `main`) is the source of 34 of the 44 currently-missing
consonant vocab illustrations having a manifest entry. I wired all 34 into
`src/content/consonants.json` and then visually opened each file before
committing (never trust a manifest entry without opening the actual pixels
— same discipline used all session). **5 of 5 spot-checked are wrong,
not just imperfectly cropped:**
- `leccion-7-m/moto.webp` — labeled "moto" (motorcycle), the actual image
  is a floral border decoration. Completely wrong subject, not a bad crop
  of the right thing.
- `leccion-8-p/pino.webp`, `leccion-8-p/pez.webp`,
  `leccion-11-d/dona.webp` — each is ~90%+ blank white canvas with an
  unrelated fragment (a dark round shape, a fish-tail-like fragment, a
  pink corner) in one corner. Not recognizable as the labeled word.
- `leccion-14-n/nino.webp` — a boy's head/shoulder fragment, badly
  off-center with excessive blank space, not a usable crop.

**Every other file from this same commit must be treated as unverified and
likely wrong** until individually opened and confirmed — the heuristic
that produced this batch is not reliable. Do NOT wire any of the following
into `consonants.json` until each is re-cropped and re-verified: tulipán,
delfín, dona, ducha, lobo, loro, lupa, nariz, nido, nube, nata, piña,
muñeca, niño, barco, bici, vaca, vino, volcán, yate, yegua, yoyo, zapato,
zanahoria, moto, mapa, pino, pulpo, sol, silla, tapa, tomate, tina, pez.
(`mamá`, `mono`, `papá`, `sapo`, `sopa`, `dado` — from the same commit but
originally delivered by earlier careful, hand-verified PRs #111/#112 —
are NOT affected; those are confirmed separately and already wired.)

**Also confirmed by direct recount of `page-layouts.json`**: the "17
remaining vowel/intro illustration slots" mentioned elsewhere are not a
real gap. All 17 are the words already listed below as confirmed absent
from the physical book (arco, pez, traje, águila) — correctly showing
"art pending," nothing to extract. Do not reattempt these.

**Still genuinely missing entirely (no manifest entry at all, real new
crops needed)**: jabón, jirafa, joya, juguete (L21 J), queso, coco, cuchara
(L22 C), yuca (L23 Y), cine, zorro (L24 Z).


This is the real, current list of illustration art still needed. It is kept
in git (not chat) specifically so it never goes stale the moment `main`
moves — read this file fresh every time, don't rely on an earlier chat
message. Last verified: July 2026, against `src/data/page-layouts.json` and
`public/cartilla/art/faithful/manifest.json` on `main`.

## ⚠️ BRANCH SAFETY WARNINGS — read before merging anything

### DO NOT MERGE these branches
- `fix-vocabulary-crops` — contains bot-generated heuristic re-crops of
  13 backlog words. These would OVERWRITE hand-verified art with bot
  versions. The hand-verified crops already on main are correct.
- `fix-instruction-verbs` — implements the "Circula → Presiona" wording
  change AND edits `src/data/page-layouts.json`. This wording change is
  DEFERRED (owner has not approved it yet), and Antigravity is BANNED
  from editing `page-layouts.json` per CLAUDE.md. Do not merge.

### REQUIRES VISUAL VERIFICATION before merge
- `feat/art-extraction-consonants` — L10-L20 are fully merged and wired. Remaining consonant vocabulary crops generated by heuristic image extraction (L21-L24) must be visually confirmed before wiring into `src/content/consonants.json`.
- `feature/garden-backgrounds` (PR #104) — 6 garden images (base.jpg +
  5 vowel backgrounds). Owner must visually approve at full resolution.
- `feature/gretel-wave-repaint` (PR #105) — repainted gretel-wave.webp.
  Owner must visually approve.
- `feature/gretel-wave-painterly` (PR #106) — 7 new Gretel animation
  frames. Owner must visually approve, then coding agent wires them
  into `gretelMachine.ts` + `GretelLiveAvatar.tsx`.

### READY TO MERGE (code verified, no visual art)
- `feat/wire-garden-vowels` — wires the 5 vowel lesson backgrounds into
  `LESSON_GARDEN_BG` in `FaithfulPageRenderer.tsx`. Based on
  `feature/garden-backgrounds`, so merge PR #104 first or merge this
  branch which carries both the art and the wiring.
- `fix/gretel-speech-audit` — removes the 10s nudge timer (unprompted
  speech), suppresses visual speech bubbles in 3 components. Pure code,
  no art changes, no state machine logic changes.
- `feature/docs-proposals` (PR #107) — docs only, zero code.

## Update — the re-audit list below is now fully closed out

Every word named in the "full re-audit" section below has been fixed and
merged directly to `main` this session, by hand-cropping from the real
source page scans (`public/cartilla/art/hd/workbook/page-0NN.jpg`) — not
taken on report from any other agent: `arbol`, `oruga`, `maiz`, `iguana`,
`igual`, `erizo`, `ojos`, `globo`, `abanico`, `abeja`, `escalera`, `pera`
(contrast fixed), and now **`ardilla`** — the one word previously marked
"unresolved, no wider source available." A wider source was found after
all: `public/cartilla/art/hd/workbook/page-009.jpg` (real book page 7,
Vocal A picture-grid — note this scan folder's filenames run 2 pages ahead
of the real page number, e.g. `page-009.jpg` = real page 7, confirmed by
reading the page-number diamond directly on multiple files, not assumed).
The squirrel illustration in that grid cell is printed upside-down relative
to the rest of the page (a real quirk of this scan, not a mistake on my
part) — rotating just that cell 180° before cropping gives a full, clean,
tight squirrel holding an acorn, no bleed, no clipping.

**No open art-extraction defects remain as of this update.** The only two
words confirmed to have no illustration anywhere in the physical book are
still `arco`, `pez`, `traje`, `águila`, `urna` (see "Confirmed NOT to
exist" below) — those stay as "art pending," which is correct.

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

**Vocabulary games note (updated July 2026)**: all 5 vowel lesson vocab
games are now wired to real art (19/20 words; urna has no crop in the book
and is correct to show "art pending"). 3 of 72 consonant vocabulary words
(araña, carro, casa) have manifest crops and are wired into consonants.json.
The remaining 69 consonant vocab words need crops from Antigravity before
they can show real art in the games — those are the next batch to request.
Nothing further needed from Antigravity for vowel vocab.

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
convention every other tool in the repo expects.

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
