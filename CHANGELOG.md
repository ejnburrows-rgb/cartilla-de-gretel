# Changelog

All notable changes to this project are documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `LICENSE` (MIT) at the repository root.
- `CONTRIBUTING.md` documenting accepted and rejected change types.
- `CHANGELOG.md` to track release history.
- `.github/workflows/extract-art.yml` to run the art extraction, polish, and manifest pipeline on push.
- Status badges, hero pointer, folder-structure tree, contributing, license, and credits sections in `README.md`.
- **Teacher CRM Lesson Catalog**: Centralized, minimalist curriculum browser mapping to all 24 interactive student workbook lessons.
- **Interactive Exercises Digitization**: Fully interactive, colorful, and faithful layout structures for all 18 Consonant lessons (Lessons 7-24).
- **Splash Screen Gateway**: Redesigned 3D CSS-animated garden entry point with explicit routing separation between Students and Teachers.
- **Supabase Integration**: Live connection established via local Vercel CLI token linking.

### Removed
- Kid-voice recording entry point and related orphans (`src/routes/cartilla/grabar.tsx`, `src/lib/audio-recorder.ts`) as out of spec.

## [Verified-2026-05-23]

### Verified in production
- `/robots.txt` served commit `3901508f61e620c8b22b9d9683a629168302eea0`.
- `/cartilla/leccion/9` rendered with Letra S s, páginas 27-30, sight-word chips, and aria labels.
- `/cartilla/leccion/17` rendered with Letra R r, páginas 59-62, and the mini-story banner.
- Browser console: no errors during the smoke test.
