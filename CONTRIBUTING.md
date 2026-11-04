# Contributing

This repository is the digital edition and classroom platform for *La Cartilla de Gretel* by Leonor Lopetegui. The source content — workbook text, illustrations, sight words, pedagogy order, and book-page presentation — is authored by the project owner and is not accepted via pull request.

Before changing any teacher Flip Chart / flipbook or Student Workbook surface, read `AGENTS.md`. It defines the complete active instruction hierarchy; follow that hierarchy rather than maintaining a second list here.

Current-state terms:
- `main` = current repository source tree.
- live Vercel = deployed/runtime truth.
- an open PR = candidate state.
- never assume `main` is the currently deployed build.

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

Use the authoritative source PDFs to verify page order, placement, scale, orientation, spacing, composition, and fidelity. Technical cleanup or motion must follow `ASSET_FIDELITY_POLICY.md`. Dense Student Workbook exercises use the clean digital canvas rather than full scenic wallpaper. The teacher Flip Chart defaults to clean paper without a scenic background-image layer, retaining its source instructional foreground scenes. Only explicitly owner-approved scenic contexts may use `repo.md` to generate background assets; preservation of older scenery does not authorize displaying it by default.

If a visual problem is caused by placement, fix the placement. Do not modify the image to compensate.

## Development commands

For ordinary implementation workers, use `pnpm dev:worker` for browser/runtime work, targeted tests/checks, `pnpm typecheck` when relevant, and `pnpm verify:worker` when a broader non-mutating check is useful.

`pnpm dev`, `pnpm build`, `pnpm build:app`, `pnpm prepare:art`, and `pnpm verify:release` can invoke production-art generation or release work and are not ordinary worker commands. Follow the exceptions and release ownership in `AGENTS.md`.

## Reporting issues

**First satisfy the evidence-first dispatch gate at the top of `AGENTS.md`: check current code, existing issues/PRs, Jules work and still-valid proof to ensure the problem is real, unassigned and not already resolved.** If the finding is genuinely distinct, open an issue with steps to reproduce, the affected commit, and your browser and operating system. Add a screenshot for visual issues. Do not create issues merely to fill worker capacity.
