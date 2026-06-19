# Contributing

This repository is the digital edition and classroom platform for *La Cartilla de Gretel* by Leonor Lopetegui. The source content — workbook text, illustrations, sight words, and pedagogy order — is authored by the project owner and is not accepted via pull request.

## Accepted

- Bug reports with steps to reproduce and the affected commit.
- Accessibility, performance, and responsive-layout fixes.
- Improvements to the teacher dashboard (rosters, assignments, progress).

## Not accepted

- Edits to lesson content, illustrations, or pedagogy order (vowel order, consonant order, sight-word lists).
- Replacing original illustrations with emoji, clip-art, or AI-generated images.

## Image Restoration

When digitizing and restoring official workbook scans, please follow the standard [Image Restoration Workflow](docs/image-restoration-workflow.md) to ensure high-quality, consistent assets.

## Local setup

```bash
npm install
npm run dev
```

Before opening a pull request, make sure the project builds and the tests pass:

```bash
npm run build
npm run typecheck
npx vitest run
```

## Branching & deployment

- **Never commit directly to `main`.** Branch first, push, and open a PR.
- Vercel builds a **preview** deployment for every branch/PR — verify your
  change there (the real built app) before merging.
- Merging to `main` is what deploys **production**. Don't merge red, and
  settle a design on your branch rather than iterating on production.

Full details, plus how to recover when production deploys are stuck, are in
the [deployment & release runbook](docs/deployment.md).

## Reporting issues

Open a GitHub issue with steps to reproduce, the affected commit, and your browser and operating system. Add a screenshot for visual issues.
