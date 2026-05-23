# La Cartilla de Gretel

Digital edition of *La Cartilla de Gretel*, a 92-page, 24-lesson Spanish reading primer by Leonor Lopetegui. Contributors: Aída Fernández and Silvia Diez. Illustrator: Estela de Armas Plasencia. Imprint: Lanny Books (LANY BOOKS LLC). ISBN 0-971-8696-8-5.

This repository is also the classroom CRM for the book:

- Student side: official-workbook-oriented lesson experience with lesson colors, page ranges, and a book/page shell.
- Teacher side: class CRM for teachers, student rosters, progress, assignments, and branding controls.
- Teacher presentation side: `/cartilla/teacher/presentacion` provides a projection-friendly book-structure view for all 24 lessons.

Exact page-by-page workbook transcription is still incomplete where source text is not present. Do not claim full workbook text fidelity until that content is verified.

## Current state

- Production URL: https://cartilla-de-gretel.vercel.app
- Verified production commit: `3901508f61e620c8b22b9d9683a629168302eea0`.
- Current `main` includes the verified production smoke-test documentation plus repo-health workflow updates.
- Live lesson route: `src/routes/cartilla/leccion.$n.tsx`.
- `BookFaithfulOverlay` is wired into the live lesson route and verified in production for lessons 9 and 17.
- `src/data/teacher-guide.json` exists as a 24-lesson TODO skeleton only. Teacher-guide prose has not been transcribed and must not be invented.
- `.env.example` exists with Supabase public environment placeholders.
- The wrong-edition workbook PDF was deleted at commit `36496b9c`. Do not re-add a PDF binary at `public/book/book.pdf`; the prebuild fetcher at `scripts/prebuild-fetch-pdfs.mjs` pulls the real one from Notion at build time via `.cartilla-import/targets.json`.

## Verified production smoke tests

Verified on 2026-05-23:

- `/robots.txt` served commit `3901508f61e620c8b22b9d9683a629168302eea0`.
- `/cartilla/leccion/9` rendered directly, showed Letra S s / páginas 27-30, showed sight-word chips `es, de, un, está, en, la, el`, and included `aria-label="Palabra de vista: es"`.
- `/cartilla/leccion/17` rendered directly, showed Letra R r / páginas 59-62, and displayed `Esta lección tiene un mini-cuento.`.
- Browser console errors: none detected during smoke test.

## Stack

- Vite 7 · React 19 · TanStack Router 1.168
- Supabase JS 2.105 · Tailwind 4 · framer-motion 12 · react-pdf 10 · pdfjs-dist 5

## Run locally

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Typecheck, lint, and full verification:

```bash
npm run typecheck
npm run lint
npm run verify
```

## Where the data lives

| Path | Purpose |
| --- | --- |
| `src/data/lessons.json` | Book-faithful spine for all 24 lessons + page scaffolding |
| `src/lib/book-faithful.ts` | Typed accessors over the spine |
| `src/lib/lesson-catalog.ts` | Renders the live `CATALOG` consumed by the lesson route |
| `src/content/lessons.json` | Vowel-lesson content (vocab, matchPairs, checkboxItems) |
| `src/content/consonants.json` | Consonant-lesson content (syllables, examples, sentences) |
| `src/content/miami-dade.json` | Miami-Dade aligned standards Q&A bank |
| `src/components/cartilla/BookFaithfulOverlay.tsx` | Drop-in: sight-word chips, mini-story banner, empty-palabras banner, editorial notes |
| `src/types/cartilla.ts` | Central re-export module for cartilla domain types |
| `src/data/teacher-guide.json` | Teacher-guide skeleton with TODO placeholders only |

## Pedagogy locks

These are fixed by the source book. Do not change them; do not invent additions.

- Vowel order taught: **O → A → E → I → U**
- Consonant order taught: **M · P · S · T · D · L · N · Ñ · B · V · R · rr · G · F · J · C · Y · Z**
- Each consonant lesson = 4 pages
- Sight words by lesson: L7 *y*; L8 *yo*; L9 *es, de, un, está, en, la, el*; L10 *tiene, patio, no*; L11 *son, están*; L12 *también*; L14 *del*; L15 *alto, con, bueno*; L17 *bien*; L20 *hay*
- Mini-story lessons: **L17, L19, L21, L22, L23, L24**
- Intentionally empty `palabras` sections: **L16, L18, L19, L21, L22, L23, L24**
- Closing exercises are **poems**; L1 closing is **rima**
- Known printer typo: page 30 footer prints "Lección 19" but the lesson there is **L9 (Ss)**. Preserve as a flagged editorial note rather than silently correcting.

## Banned terms / claims

Never include in source files, content files, docs, UI, or commit messages:

> Maria Artola · Noble · ABC's Book Supply · Double R · Pixar / clipart references · "EDICIÓN ESPECIAL" · "Libro del alumno" · remaquetada · CD narration · prose-not-poems · isla

Do not claim workbook transcription, PDF mirror, teacher-guide content, or Notion Hub cleanup is complete unless the relevant source and deployment have been verified in the same work session.

## Supabase

The public reader and local interactive lesson mode run without Supabase. Teacher accounts, classes, student join codes, assignments, and cloud progress require:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Apply migrations in `supabase/migrations/` before using the teacher/student cloud platform.

## Known issues

See `KNOWN_ISSUES.md` at repo root for the current inventory of verified status, open gaps, and parked work.

The PDF mirror is not claimed as fixed by the CRM shell work unless separately verified in the same deployment pass.
