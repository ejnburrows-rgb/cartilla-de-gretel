# Restoration pipeline — `scripts/restore-art.mjs`

Implements the **Faithful Restoration Standard** (see `AGENTS.md`). Restoration
**cleans**; it never **invents**. The script runs only non-generative
pixel-cleanup on already-faithful art, writes to a mirrored `restored/` path
(originals are never touched), and gates every output with an automated
acceptance test.

## What it does (allowed ops only)
1. **Upscale** (optional) — Real-ESRGAN if `RESRGAN_BIN` points at a binary,
   otherwise sharp Lanczos. Capped at `--max-dim` on the longest side.
2. **Scan-speckle / JPEG-noise removal** — gentle median (does not move lines).
3. **Paper-shadow removal + white-balance** — level normalize toward clean white.
4. **Palette normalization** — mild, hue-preserving.

Generative fill, redraws, style transfer, or anything that adds/moves/reshapes a
line are never invoked. The backstop is the acceptance test: a tool is judged by
whether its **output** passes the overlay test, not by whether it is internally
"generative" (AGENTS.md, 2026-07-22).

## Acceptance test (per image)
The restored image is downscaled back to the original's size, overlaid on the
original at 50%, and scored by **edge-map drift** (Laplacian mean-abs-diff, 0..1).
- `drift <= --threshold` → **pass**; an overlay proof PNG is written.
- `drift > --threshold` → **reject**: the restored file is deleted and the run
  exits non-zero (fails the batch).

## Usage
```bash
# Prove it on a sample (writes overlay proofs + report.json):
node scripts/restore-art.mjs --src public/cartilla/art/hd/workbook \
  --out public/cartilla/art/restored --limit 5 --upscale 2

# Full batch (e.g. lessons L1–L4 art), fail if any image drifts:
node scripts/restore-art.mjs --src <batch-dir> --out public/cartilla/art/restored --upscale 4
```

Options: `--src` `--out` `--proofs` `--upscale <n>` `--max-dim <px>`
`--threshold <0..1>` `--limit <k>` `--dry`.

## Free tools only ($0)
`sharp` (bundled). Real-ESRGAN is optional — set `RESRGAN_BIN` to its path to use
it for the upscale step; without it, sharp's Lanczos upscale is used and still
passes the overlay test on the book scans.

## Sample proofs
`docs/restore-art-proofs/` holds representative 50%-overlay proofs and a
`report.json` with per-image drift scores (all well under threshold). Bulk
restored output under `public/cartilla/art/restored/` is git-ignored; batch PRs
wire in the specific restored files they need.
