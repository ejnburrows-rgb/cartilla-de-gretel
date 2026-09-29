# CARTILLA SOURCE OF TRUTH — OWNER DIRECTIVE

**Status: CANONICAL. This file supersedes every conflicting Cartilla artwork,
reconstruction, remastering, modernization, or native-layout instruction in the
repository.**

## Authoritative physical sources

Use the originals in:

`Google Drive > Cartilla Production Hub > 01 Source Documents`

1. `La Cartilla de Gretel Flip Chart.pdf`
2. `Libro del alumno - Rescan and Optimize (2).pdf`

Do not ask the owner to upload these again. They already exist in Google Drive.

## Required result

### Teacher Flip Chart / flipbook

The computer version must visually reproduce the Flip Chart page for page.

It must feel like the same physical Flip Chart is being viewed on a computer,
not like a redesigned presentation inspired by it.

Match:
- page aspect ratio and overall canvas;
- element positions and relative sizes;
- exact text content and order;
- line breaks and visible hierarchy;
- illustrations and their exact page locations;
- illustration crop and scale;
- margins, whitespace, borders, boxes, backgrounds, and decorations;
- lesson/page sequence.

### Student Workbook

The computer version must visually reproduce the student workbook page for
page.

Match:
- page aspect ratio and overall canvas;
- exact text and labels;
- writing/tracing/drawing areas;
- grids, boxes, lines, margins, and whitespace;
- illustration identity, crop, scale, and placement;
- page and lesson sequence.

## Approved image rule

The artwork has already been fixed/cropped/approved for this phase.

**Placement is the task. Image transformation is not.**

Never regenerate, redraw, recolor, remaster, modernize, restyle, re-illustrate,
recrop, or otherwise alter the pixels of an approved book image.

Never substitute a "better", "similar", or newly generated image.

If an image looks wrong because it is in the wrong place, fix the placement.
Do not alter the image to compensate for a layout error.

## Digital implementation rule

Implementation technology is subordinate to fidelity.

HTML, React, SVG, CSS, canvas, positioned image assets, or a full-page source
render may be used only insofar as the final visible page matches the source
book.

Do not force:
- a 16:9 redesign;
- responsive reflow;
- a new card/grid system;
- modernized spacing;
- new typography hierarchy;
- a new visual theme;
- standalone-art composition that changes the page.

For responsiveness, scale the book page uniformly as a page. Do not rearrange
its internal composition.

Selectable/digital text is acceptable only when its visible placement, line
breaks, size relationships, and page appearance remain source-faithful.

## Source hierarchy

For visual/layout truth:

1. Matching page in the authoritative source PDF.
2. Approved existing image/crop taken from that source.
3. Verified mapping/coordinate data that agrees with the source page.
4. Everything else.

Mappings help locate content. They do not override the books.

## Verification rule

Before changing a page:
1. Open the matching source PDF page.
2. Compare the current digital page against it.
3. Correct placement/layout differences.
4. Leave already-correct image pixels untouched.

A page passes when the digital version visibly matches the source page in
composition and content at the same page aspect ratio.

Do not declare a page complete from metadata, manifest entries, coordinates,
or a build alone.

## Existing features

Navigation, teacher controls, student interactions, accessibility, progress
tracking, and optional overlays may exist around the book.

They must not alter the baseline book-page composition.

When the page itself is visible, the default book surface remains a faithful
digital reproduction of the source.

## Prohibited conflicting workflow

Do not revive prior instructions that say to:
- modernize/re-render Workbook or Flip Chart illustrations;
- generate missing page art from prose;
- rebuild the Flip Chart into a different e-learning layout;
- replace source-page composition with a "cleaner" native layout;
- optimize already-approved book crops;
- treat the source scans as merely inspirational/fallback visual material.

Those directions are superseded.
