# La Cartilla de Gretel

Digital edition of *La Cartilla de Gretel*, a 92-page, 24-lesson Spanish reading primer by Leonor Lopetegui. Illustrator: Estela de Armas Plasencia. Imprint: LANY Books LLC. ISBN 0-971-8696-8-5.

## Current state (verified, not aspirational)

- HEAD on `main`: `abc271b5` at the time of this README (book-faithful accessors).
- Latest data spine: `src/data/lessons.json` v0.2.0 — the 24-lesson book-faithful array plus `editorialNotes`, `sightWordIndex`, `miniStoryLessons`, `emptyPalabrasLessons`.
- Latest accessor lib: `src/lib/book-faithful.ts`.
- Live lesson route: `src/routes/cartilla/leccion.$n.tsx` (renders from `src/lib/lesson-catalog.ts`, the existing 24-entry CATALOG).
- Deploy: Vercel is currently serving a build older than commit `a028edf7`. Live publication is blocked on a deploy-host toggle. Nothing on `main` past that SHA is on the public URL yet.
- The wrong-edition workbook PDF was deleted at commit `36496b9c`. Do not re-add a PDF binary at `public/book/book.pdf`; the prebuild fetcher at `scripts/prebuild-fetch-pdfs.mjs` pulls the real one from Notion at build time via `.cartilla-import/targets.json`.

## Stack

- Vite 7 · React 19 · TanStack Router 1.168
- Supabase JS 2.105 · Tailwind 4 · framer-motion 12 · react-pdf 10 · pdfjs-dist 5

## Run locally

```bash
pnpm install
pnpm dev
```

Build and preview:

```bash
pnpm build
pnpm preview
```

Typecheck and lint:

```bash
pnpm tsc --noEmit
pnpm lint
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

## Pedagogy locks

These are fixed by the source book. Do not change them; do not invent additions.

- Vowel order taught: **O → A → E → I → U**
- Consonant order taught: **M · P · S · T · D · L · N · Ñ · B · V · R · rr · G · F · J · C · Y · Z**
- Each consonant lesson = 4 pages
- Sight words by lesson: L7 *y*; L8 *yo*; L9 *es, de, un, está, en, la, el*; L10 *tiene, patio, no*; L11 *son, están*; L12 *también*; L14 *del*; L15 *alto, con, bueno*; L17 *bien*; L20 *hay*
- Mini-story lessons (replace word list): **L17, L19, L21, L22, L23, L24**
- Intentionally empty `palabras` sections: **L16, L18, L19, L21, L22, L23, L24**
- Closing exercises are **poems** (and L1's `rima`), never prose
- Known printer typo: page 30 footer prints "Lección 19" but the lesson there is **L9 (Ss)**. Preserve as a flagged editorial note rather than silently correcting.

## Banned terms

Never include in any source file, content file, or commit message:

> Second · Revised · Updated · Corrected · Expanded · Evolved · Programmed Edition · Digital Edition by Emilio José Novo · Noble · Double R Publishing · Doubler Muy Bien · ABC's Book Supply · isla · prose-not-poems · CD narration · "EDICIÓN ESPECIAL" · "Libro del alumno" subtitle · "Maria Artola" · Pixar / clipart / AI-generated illustration references

## Supabase

The local interactive lesson mode runs without Supabase. Teacher accounts, classes, student join codes, assignments, and cloud progress require:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Apply migrations in `supabase/migrations/` before using the teacher/student cloud platform.

## Known issues

See `KNOWN_ISSUES.md` at repo root for a current inventory of unverified items and open follow-ups.
