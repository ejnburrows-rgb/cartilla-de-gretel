# Contributing

This repository is the digital edition and classroom platform for *La Cartilla de Gretel* by Leonor Lopetegui. The source content — workbook text, illustrations, sight words, pedagogy order, and book-page presentation — is authored by the project owner and is not accepted via pull request.

Before changing any teacher Flip Chart / flipbook or Student Workbook surface, read:

- `AGENTS.md`
- `PROJECT_SOURCE_OF_TRUTH.md`
- `CARTILLA_DIGITAL_DIRECTIVE.md`
- `ASSET_FIDELITY_POLICY.md`
- `repo.md` (before creating any Workbook or Flip Chart background)

## Accepted

- Bug reports with steps to reproduce and the affected commit.
- Accessibility, performance, and responsive-layout fixes.
- Improvements to the teacher dashboard (rosters, assignments, progress).
- Placement/navigation fixes that make the digital books match their authoritative physical-book pages more faithfully without altering the locked images.

## Not accepted

- Edits to lesson content, illustrations, or pedagogy order (vowel order, consonant order, sight-word lists).
- Replacing original illustrations with emoji, clip-art, AI-generated images, alternate images, or remastered versions.
- Inventing replacement artwork, changing composition/object count/identity, or altering educational meaning.
- Rebuilding a book page from separate “modernized” objects or redesigning it into a new layout.

## Book-image handling

The approved/fixed/cropped book images are finished assets for this phase.

Use the authoritative source PDFs to verify page order, placement, scale, orientation, spacing, composition, and fidelity. Technical cleanup or motion must follow `ASSET_FIDELITY_POLICY.md`. New scenic backgrounds (background environment only) must follow `repo.md`.

If a visual problem is caused by placement, fix the placement. Do not modify the image to compensate.

## Local setup

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Before opening a pull request, make sure the project builds:

```bash
pnpm build
```

## Reporting issues

Open a GitHub issue with steps to reproduce, the affected commit, and your browser and operating system. Add a screenshot for visual issues.
