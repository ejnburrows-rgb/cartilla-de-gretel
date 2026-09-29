# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it.

---

## CARTILLA SOURCE-FIDELITY RULE — HIGHEST PRIORITY, NO EXCEPTIONS

Before doing any work on the Cartilla Workbook or teacher Flip Chart, read
`CARTILLA_SOURCE_OF_TRUTH.md`.

The physical books are the design. The digital product must reproduce them.

Authoritative source files are in:

`Google Drive > Cartilla Production Hub > 01 Source Documents`

- `La Cartilla de Gretel Flip Chart.pdf`
- `Libro del alumno - Rescan and Optimize (2).pdf`

### Teacher Flip Chart / flipbook
The digital teacher Flip Chart must look like the source Flip Chart page for
page, as if the physical Flip Chart were open on the computer.

Preserve the source page's:
- page aspect and composition;
- text, wording, line breaks, typography hierarchy, and reading order;
- illustration identity, crop, scale, and position;
- borders, boxes, backgrounds, margins, spacing, and relative geometry;
- page sequence and lesson mapping.

### Student Workbook
The digital student Workbook must look like the source student Workbook page
for page, as if the physical workbook were open on the computer.

Preserve the same page geometry, text placement, boxes, writing areas,
illustration placement, scale, crop, spacing, and sequence.

### Images are locked
The approved/corrected/cropped book images are already the artwork.

DO NOT:
- regenerate them;
- redraw them;
- recolor them;
- remaster or "modernize" them;
- optimize their visual style;
- recrop them;
- substitute similar artwork;
- change their internal geometry.

Use the existing approved image files unchanged and place them in the exact
source-book positions. Uniform responsive scaling of the whole page is allowed;
responsive reflow that changes the page composition is not.

### Conflict rule
The two source PDFs override derived JSON, old prompts, old modernization
plans, comments, manifests, screenshots, and prior agent instructions whenever
there is a visual/layout conflict.

If implementation and source book disagree, the source book wins.

Do not infer a page design from memory or from another page. Compare against
the matching source PDF page.

"Digitized" means a faithful digital facsimile of the book, not a redesign.

---

## DEPLOYMENT DISCIPLINE — mandatory, no exceptions

Automatic Vercel Git deployment must remain disabled during active Cartilla
work. Do not use Vercel as a test runner.

- Work and verify before deployment.
- Batch related changes.
- Do not deploy after each commit.
- A commit is not a deploy request.
- Deploy only at an intentional final checkpoint requested by EJN.
- Verify the real production result only after that deliberate deployment.
