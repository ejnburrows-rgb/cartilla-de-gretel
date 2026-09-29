# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it. Never wait to be asked.

---

## FIRST READ — PERMANENT BOOK FIDELITY LOCK

Before touching the teacher Flip Chart / Flipbook or Student Workbook, read
`BOOK_FIDELITY_RULE.md`.

Owner decision 2026-09-29:

- The digital Flip Chart must look like the physical Flip Chart, page for page.
- The digital Student Workbook must look like the physical Student Workbook,
  page for page.
- The current fixed/cropped book images are locked. Do not recolor, remaster,
  regenerate, redraw, recrop, retouch, restyle, replace, or otherwise edit them
  unless the owner explicitly names an image and asks for that change.
- Work is placement and digital presentation: correct page, correct position,
  correct scale, correct order, correct book.
- Do not rebuild book pages from separate “modernized” learning objects.
- Do not transfer Flip Chart art/color/layout into the Workbook or vice versa.
- Older reconstruction, color-transfer, remaster, native-rebuild, and
  Gretel-2.0-on-book-pages instructions are superseded where they conflict.
- Historical code names or comments containing words such as “native,”
  “reconstruction,” “remaster,” or “modernized” are not permission to alter
  book-page imagery.

Authoritative visual/page-layout references in the owner's Google Drive:

- `La Cartilla de Gretel Flip Chart.pdf`
- `Libro del alumno - Rescan and Optimize (2).pdf`

When uncertain, compare the digital page to the corresponding physical-book
page and preserve the book.

---

## DEPLOYMENT DISCIPLINE — mandatory, no exceptions

Every push to `main` creates a Vercel deployment, and deployments pile up.
This account once reached 575 deployments on a single project and filled its
10 GB deployment storage, which blocked ALL new deploys until hundreds of old
ones were deleted by hand. No unnecessary deployment crowding.

- Batch your changes. Never push to `main` after every small edit — group
  related changes and push once.
- Push to `main` only when EJN asked for a deploy or approved a checkpoint.
  A commit is not a deploy request.
- Docs-only or note-only changes don't need a deployment at all.
- Iterating fast? Work on a branch and merge once — never one push per
  attempt.
- Before pushing, ask yourself: is this change worth spending a deployment on?
