# Contributing

This repository is the digital edition and classroom platform for *La Cartilla de Gretel* by Leonor Lopetegui. The source content — workbook text, illustrations, sight words, pedagogy order, and book-page presentation — is authored by the project owner and is not accepted via pull request.

Before changing any teacher Flip Chart / flipbook or Student Workbook surface, read:

- `AGENTS.md`
- `CARTILLA_SOURCE_OF_TRUTH.md`

## Accepted

- Bug reports with steps to reproduce and the affected commit.
- Accessibility, performance, and responsive-layout fixes.
- Improvements to the teacher dashboard (rosters, assignments, progress).
- Placement/navigation fixes that make the digital books match their authoritative physical-book pages more faithfully without altering the locked images.

## Not accepted

- Edits to lesson content, illustrations, or pedagogy order (vowel order, consonant order, sight-word lists).
- Replacing original illustrations with emoji, clip-art, AI-generated images, alternate images, or remastered versions.
- Recoloring, regenerating, redrawing, recropping, retouching, restyling, or otherwise modifying approved book images.
- Rebuilding a book page from separate “modernized” objects or redesigning it into a new layout.

## Book-image handling

The approved/fixed/cropped book images are finished assets for this phase.

Use them unchanged. Use the authoritative source PDFs to verify page order, placement, scale, orientation, spacing, composition, and fidelity.

If a visual problem is caused by placement, fix the placement. Do not modify the image to compensate.

## Local setup

```bash
npm install
npm run dev
```

Before opening a pull request, make sure the project builds:

```bash
npm run build
```

## Reporting issues

Open a GitHub issue with steps to reproduce, the affected commit, and your browser and operating system. Add a screenshot for visual issues.
