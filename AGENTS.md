# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it. Never wait to be asked.

---

## EXACT REPLICA — the #1 rule, no exceptions

This is an e-learning platform that is a **digitized exact replica** of the
physical books. Not a reinterpretation. Not "inspired by." EXACT.

- **The flipbook** (teacher flip chart) must look exactly like the physical
  flipbook, digitized. Same layout, same placements, same order — as if you
  are holding the book, but on a computer.
- **The workbook** (student workbook) must look exactly like the physical
  workbook, digitized. Same layout, same placements, same order — as if you
  are holding the book, but on a computer.
- **DO NOT touch the images.** They are already fixed and cropped. Never
  modify, redraw, regenerate, or "improve" any artwork image.
- **What you MAY change:** placements, layout, CSS positioning — ONLY to make
  each page match the book exactly.
- **Reference:** the physical books are the source of truth. PDFs are in the
  owner's Google Drive: "La Cartilla de Gretel Flip Chart.pdf" (flipbook) and
  "La cartilla Workbook.pdf" (workbook). Local copies: 
  `~/workspace/cartilla-reference/flipchart.pdf` and 
  `~/workspace/cartilla-reference/workbook.pdf`.
- If a page doesn't look like the book, the page is wrong — not the book.
- Any prior instruction to redesign, modernize, or reinterpret layouts is
  VOID. Exact replica only.

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
