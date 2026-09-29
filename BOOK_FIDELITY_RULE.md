# PERMANENT BOOK FIDELITY RULE — OWNER DECISION 2026-09-29

This rule is mandatory for all future work on the digital **Flip Chart / Flipbook** and **Student Workbook**. It supersedes every older repo note, prompt, issue description, art workflow, reconstruction rule, remaster rule, color-transfer rule, or implementation comment that conflicts with it.

## Authoritative books

Use the owner's Google Drive copies as the visual/page-layout authority:

- Teacher: `La Cartilla de Gretel Flip Chart.pdf`
- Student: `Libro del alumno - Rescan and Optimize (2).pdf`

The repository mappings may help identify page relationships, but the books themselves control what each page must look like.

## Required result

### Teacher Flip Chart / Flipbook
The digital teacher Flip Chart must look like the real Flip Chart, page for page, as though the physical book is being viewed on a computer.

### Student Workbook
The digital student workbook must look like the real student workbook, page for page, as though the physical workbook is being viewed on a computer.

Responsive scaling is allowed. Reflowing, redesigning, re-composing, or stylistically reinterpreting the internal book page is not.

## Images are locked

The current approved/fixed/cropped book images are already finished.

Do **not**:
- recolor;
- remaster;
- regenerate;
- redraw;
- recrop;
- retouch;
- restyle;
- run image generation or image-editing;
- replace an illustration with another version;
- extract individual objects in order to rebuild a page;
- apply Gretel 2.0 or any other style transformation to book-page artwork;
- create a “native reinterpretation” of a page from separate learning objects.

Only change an image if the owner gives a new, explicit instruction naming that image.

## What implementation work IS allowed

The task is placement and digital presentation:

- put each already-approved image on the correct page;
- use the real book to determine exact page order, position, scale, orientation, spacing, grouping, and surrounding text/layout;
- preserve the original visual hierarchy and page geometry;
- preserve the correct teacher-vs-student source;
- make navigation, page turning, zooming, responsive containment, accessibility, and other app chrome work around the page without redesigning the page itself;
- keep internal page proportions stable across screen sizes.

## Never cross the two books

- The Flip Chart must remain the Flip Chart.
- The Student Workbook must remain the Student Workbook.
- Do not make one look like the other.
- Do not transfer Flip Chart artwork/colors/layout into the Workbook.
- Do not transfer Workbook layout into the Flip Chart.
- A mapping between books is a reference relationship, not permission to copy or transform page artwork.

## Conflict rule

If any older repository file, issue, prompt, comment, branch note, manifest description, or source comment says to remaster, recolor, reconstruct, modernize, replace, recompose, or rebuild the book pages from standalone assets, that instruction is obsolete where it conflicts with this file.

This file and the matching section in `AGENTS.md` win.

## Acceptance test

For every book page, compare the digital result side-by-side with the corresponding authoritative book page.

PASS only when:
- the correct book/page is shown;
- page content and artwork match the source;
- image placements and proportions match the source;
- no locked image was altered;
- the internal page was not redesigned;
- the result feels like the physical page presented digitally.

If a page cannot be matched from the authoritative source, mark it unresolved and locate the source. Do not invent a replacement.
