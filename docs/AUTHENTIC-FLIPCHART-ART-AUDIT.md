# Authentic flip-chart art audit — current repair rule

**Status:** active repair record, 2026-08-08. This document overrides stale claims in prior art-backlog, status, generated-art manifest, PR, and issue text where they conflict with the original source images.

## Non-negotiable rule

For workbook lesson content, the only acceptable replacement is the **identical authentic illustration cropped from the 62 teacher flip-chart pages**. A filename, missing crop box, missing manifest entry, color validator result, or “fallback required” message is **not** proof that the illustration is absent.

Never use generated lesson art, an emoji, clip art, recoloring, a visually similar object, or a substitute crop. Do not expose vocabulary words beside picture-selection choices unless the original student workbook shows them.

## Verified source match

| Student word | Current faithful path | Teacher source | Source crop box | Result |
|---|---|---|---|---|
| iglú | `/cartilla/art/faithful/vocal-i/iglu.webp` | `public/cartilla/art/hd/flipchart/page-007.jpg` | `x=960, y=1530, width=600, height=570` | Exact authentic colored drawing found. The live grayscale/under-colored crop must be replaced from this source. |

The crop box above was checked visually against the original page and excludes the printed `iglú` word.

## Items that must not be generated

`abeja`, `aguja`, `abrigo`, `oruga`, `globo`, and `remolino` are not authorized for generated replacement. Their existing generated substitution records are invalid for lesson content and must not be reintroduced.

A full visual contact-sheet review of the 62 available teacher pages did not yet establish a literal, captioned source match for these six items. This is an unresolved source-location question, **not permission to make or recolor art**. Before any change, compare each current student artwork or original student-workbook reference directly to every candidate teacher-page illustration and record the teacher page and crop box.

## Required workflow

1. Identify every live use and the current asset path.
2. Locate the literal source in the teacher pages by visual comparison.
3. Crop only the source drawing at source resolution.
4. Add or update the faithful-art manifest with source page and crop box.
5. Verify the rendered student page without adding answer labels.
6. Keep generated files unused until dependency verification is complete. Do not delete assets during the repair phase.

## Explicitly out of scope

Do not rebuild workbook pages, alter interactions, change page layouts, change authentication or database code, change the renderer, or clean up files until each repair has been visually verified.
