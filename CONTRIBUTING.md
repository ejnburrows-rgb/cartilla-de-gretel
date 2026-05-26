# Contributing

This repository is the digital edition and classroom CRM for *La Cartilla de Gretel* by Leonor Lopetegui. Source content (workbook PDF, lesson text, illustrations, sight words, pedagogy order) is authored by the project owner and is not accepted via pull request.

## Accepted

- Bug reports with reproduction steps and the affected commit SHA.
- Accessibility, performance, or responsive-layout fixes.
- Improvements to the teacher CRM surface (rosters, assignments, progress).

## Not accepted

- Edits to `src/content/`, `src/data/lessons.json`, `src/data/teacher-guide.json`, or `public/cartilla/art/**`.
- Replacement of original illustrations with emoji glyphs, clip-art, or AI-generated images.
- Re-introduction of a kid-voice recording flow, a kiosk mode, an offline PWA installer, or a smartboard surface. These are out of spec.
- Changes to the pedagogy locks declared in `README.md` (vowel order, consonant order, sight-word list, mini-story lessons, intentionally empty palabras sections).

## Local setup

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run verify
```

`verify` runs `typecheck`, `lint`, and `build`. All three must pass.

## Reporting issues

Open a GitHub issue with:

- The affected commit SHA (from `public/build-version.txt` or the build footer).
- Steps to reproduce.
- Browser, viewport width, and OS.
- A screenshot for visual issues.

## Banned terms

Do not introduce the banned terms listed in `README.md` under "Banned terms / claims".
