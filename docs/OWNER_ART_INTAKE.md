# Owner Artwork Intake Directive & Tooling (`#454`)

This document defines the deterministic one-command intake pipeline for owner-supplied foreground artwork in **La Cartilla de Gretel**.

---

## Overview

The intake tooling replaces manual artwork wiring cycles with a deterministic, verified single-command process.

### Primary Principles

1. **Reuses Existing Asset Pipeline**: Reuses canonical artwork import and delivery derivative generation (`scripts/prepare-art-assets.mjs`).
2. **Explicit Target Mapping**: Requires explicit mapping by canonical slot or word/lesson. Filename guessing when ambiguous is strictly prohibited.
3. **Automated Sanity Verification**: Validates image decode, min dimensions, transparency/crop bounds, and target path security.
4. **Overwrite Protection**: Never overwrites an already-verified production asset unless explicitly forced (`--allow-overwrite-verified` / `--force`).
5. **Dry-Run Classification Plan**: Shows before/after classification plans without modifying any files on disk during dry-run validation.
6. **Selective Delivery Derivatives**: Regenerates 384w and 768w delivery WebP derivatives strictly for the supplied target assets.
7. **Exact Reporting**: Outputs the exact canonical files changed, delivery derivatives generated, and remaining still-missing slots.

---

## Command Line Usage

### Validate / Dry-Run an Owner Art Package

```bash
node scripts/validate-owner-art-package.mjs --package <folder-or-zip-path> [--mapping <mapping.json>] [--dry-run] [--json]
```

Or using the extended canonical art importer:

```bash
node scripts/import-canonical-artwork.mjs --package <folder-or-zip-path> [--mapping <mapping.json>] [--dry-run]
```

### Options

- `--package <path>`: Path to a directory or `.zip` archive containing owner-supplied image files.
- `--mapping <path>`: Optional path to a JSON file containing explicit slot mappings.
- `--dry-run`: Runs full validation and prints the before/after classification plan without writing any files to disk.
- `--allow-overwrite-verified` / `--force`: Permits overwriting an asset that is currently marked as verified (`PASS`, `VERIFIED COLOR TRANSFER`, or `CROP FIX`).
- `--json`: Outputs the complete inspection report as structured JSON.

---

## Mapping Schema (`mapping.json`)

To prevent ambiguity, owner-supplied files are mapped explicitly to target canonical slots in `public/cartilla/art/faithful/`.

An explicit `mapping.json` file can be placed inside the owner package folder or provided via `--mapping`.

```json
{
  "mappings": [
    {
      "file": "manzana_final.png",
      "slot": "/cartilla/art/faithful/leccion-1/manzana.webp"
    },
    {
      "file": "casa_restored.png",
      "word": "casa",
      "lessonNumber": 22
    }
  ]
}
```

### Ambiguity Policy

- If explicit mapping is omitted, the tool attempts filename stem matching ONLY when 100% unambiguous (a file stem matches exactly one target slot in `manifest.json`).
- If multiple target slots share a word stem or multiple supplied files target the same slot, the tool flags an `AMBIGUOUS_MAPPING_REQUIRED` status and skips automatic mapping.

---

## Automated Sanity Checks

Every supplied image is validated before import:

1. **Decode Verification**: Verified using `sharp` to ensure valid image headers and pixel data.
2. **Dimension Sanity**: Must be at least 32x32 pixels with valid positive dimensions.
3. **Transparency & Content Bounds**: Must contain visible opaque pixels (`alpha > 8`). Fully transparent or empty images are rejected. Content bounding box must be at least 8x8 pixels.
4. **Target Path Safety**: Resolved target path must reside strictly inside `public/cartilla/art/` to prevent path traversal.
5. **Verified Asset Protection**: Rejects import if the target slot is already verified (`isVerified === true`), unless `--allow-overwrite-verified` is supplied.

---

## Delivery Derivative Generation & Output

Upon actual import (non dry-run mode):

1. The supplied image is written as a WebP file at its target canonical location (`public/cartilla/art/faithful/...`).
2. The provenance status in `public/cartilla/art/faithful/manifest.json` is updated to `VERIFIED-OWNER-INTAKE-YYYY-MM-DD`.
3. `public/cartilla/art/faithful/qa-results.json` verdict is updated to `PASS`.
4. Delivery derivatives at widths `384` and `768` are generated exclusively for the newly imported target asset in `public/cartilla/art/delivery/faithful/<width>/...`.
5. The report lists:
   - `filesChanged`: Exact canonical files created/updated.
   - `derivativesGenerated`: Exact delivery WebP derivative files written.
   - `stillMissingSlots`: Exact target slots that remain unverified (`PENDING NO VERIFIED SOURCE`).
