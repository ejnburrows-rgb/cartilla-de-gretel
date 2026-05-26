# Cartilla de Gretel — Build Report

_Last updated 2026-05-26._

## What ships on `main` today

- **Workbook (student) and flipchart (teacher) both render the uploaded PDF.** No JPG flipbook is used; lesson and page numbering are identical on both sides.
- **Build-time art pipeline** (runs only on Vercel; never blocks the build):
  1. `scripts/prebuild-fetch-pdfs.mjs` — pulls the PDF from Notion using `.cartilla-import/targets.json` and writes a diagnostic to `public/robots.txt`.
  2. `scripts/verify-pdf.mjs` — validates the PDF header and writes `public/cartilla/art/_pdf-status.json`.
  3. `scripts/extract-art.mjs` — renders each PDF page to `public/cartilla/art/raw/page-NNN.png` via `pdfjs-dist` + `@napi-rs/canvas` at scale 2.
  4. `scripts/polish-art.mjs` — deterministic clean-up via `sharp` (normalise → sharpen → resize 1600 → webp 86) into `public/cartilla/art/polished/page-NNN.webp`. **No redraws.**
  5. `scripts/build-art-manifest.mjs` — writes `public/cartilla/art/manifest.json`.
  Every step has a time budget and exits 0 so a single failure cannot abort the build.
- **`useBookArt(lessonN)`** + **`useBookCover()`** read the manifest with `cache: "force-cache"`.
- **`BookArtFigure`** renders the polished webp when present; otherwise it paints a colored placeholder using the lesson's accent.
- **`/cartilla/imprimir/$n`** stacks every workbook page for the lesson on A4 sheets with `@page` CSS and a browser Imprimir button.
- **`PdfPage`** has retry, `onLoadError`/`onSourceError` handlers, optional `hideBadge`, and a diagnostic link to `/robots.txt`.

## Governance locks

- Author: Leonor Lopetegui (Aida Fernandez + Silvia Diez contribute). Illustrator: Estela de Armas Plasencia. Imprint: Lanny / LANY BOOKS LLC. ISBN: 0-971-8696-8-5.
- 92 pages, 24 lessons. Vowels in order O → A → E → I → U. Consonants M P S T D L N Ñ B V R rr G F J C Y Z.
- Lesson page ranges live in `CATALOG` (`src/lib/lesson-catalog.ts`) and `getWorkbookPagesForLesson(n)` (`src/lib/book-faithful.ts`).
- Vowel palette: O `#2f80ed`, A `#e63946`, E `#f28c28`, I `#2a9d8f`, U `#8338ec`.
- **No AI art, no stock art, no Pixar, no redraws.** Image transformations are deterministic.

## JSX double-brace rule

Inline JSX object literals — `style=173`, `transition=173`, `params=173`, `initial=173`, `animate=173`, `whileHover=173`, `whileTap=173` — get template-mangled at dispatch time and break the build. **Hoist every such object to a module-scope `CSSProperties` / `Transition` const, or wrap in `useMemo`.** Grep your diff before opening a PR; matches must be zero.

## Lanes in flight

- **Antigravity → `feat/teacher-cinema-and-landing-art`** — teacher cinema route, landing/lesson art wiring, PDF prefetch, manifest stale-while-revalidate.
- **Cortex (Codex) → `feat/student-rich-ux-and-a11y`** — practica / repaso / mi-progreso polish, audio + accessibility, persistent session continuity.
- **Direct on `main`** — repairs, scripts, documentation, and anything that cannot wait on a branch.

## Known issues

- Vercel preview is password-gated (`Ejn!79021`), so AI-side `loadPage` returns 504 and cannot self-verify renders. Visual verification must be done on a real device.
- `react-pdf` worker must match the installed `pdfjs-dist` version. A future bump may require pinning the worker URL.
- The art chain depends on `@napi-rs/canvas` native binaries on Vercel's linux-x64-gnu runtime. If installs fail, the chain still exits 0 and the frontend falls back to `BookArtFigure` placeholders.
- The Notion fetch step writes its log to `public/robots.txt`. That file is publicly served; do not put secrets in it.
