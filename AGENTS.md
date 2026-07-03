# La Cartilla de Gretel — Agent Guide

## Project
Spanish literacy app for K-3 early readers.
Physical book: 24 lessons, ~95 pages.
Author: Leonor Lopetegui. Colaboradoras: Silvia Diez, Aída Fernández.
Stack: React, TanStack Router, Vite, TypeScript, Supabase, Vercel.
Local path: C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel

## Setup
pnpm install
pnpm dev
pnpm build
pnpm run prepare:assets  (extracts book pages from PDFs — run once locally)

## Routes
Student: /cartilla/lecciones → /cartilla/leccion/$n (workbook + activities)
Teacher: /cartilla/teacher → dashboard, roster, progreso, reportes, flipchart

## Asset Convention
Book pages: public/art/hd/page-{N}.png (NOT committed to git)
PDFs: project root (NOT committed to git)
Images served locally via Vite dev server, via Vercel on production.

## Hard Rules — Never Break These
- Never commit PDFs to git. Image files in public/cartilla/art/ ARE allowed to be committed.
- Never change lesson-meta.ts letter assignments or page ranges
- Never replace original book illustrations with AI-generated art
- Never hardcode Supabase keys
- Never add English text to student-facing UI
- Never alter the book's original Spanish reading content
- NEVER use AI-generated images. Always use the authentic hand-drawn artwork
  cropped from the real flipchart scans.

## Commit Format
feat(scope): description
fix(scope): description
chore(scope): description

## Current division of labor (updated — supersedes any earlier "own the
## student path" instruction below or in prior sessions)
- **Antigravity: art-extraction only.** Your entire job is producing real,
  tightly-cropped color illustration files from the physical book's
  flipchart scans and wiring them into the shared manifest below. You do
  **not** own the student path, activities, gamification, or any UI/UX
  decisions — those all belong to Claude. If you think a UI/UX change is
  needed, say so as a suggestion; don't implement it.
- **Claude: everything else** — app code, schema, page content
  (`src/data/page-layouts.json`), teacher CRM, student activities, grading,
  Supabase, routing, styling.
- **Before starting ANY work, every time**: `git fetch origin && git reset
  --hard origin/main` (or fresh-clone) so you're never working from a stale
  base. A branch built on a `main` that's several commits behind will look
  like it's redoing already-finished work, because it is — this has
  happened before and wasted a full round.
- **Read `ART_BACKLOG.md`** (repo root) before starting — it is the current,
  authoritative list of what art is actually still needed. It is kept
  up to date in git; a chat message is not a substitute for it and may be
  stale the moment `main` moves.
- **Never touch `src/data/page-layouts.json`.** It's Claude's page-content
  schema (text, region layout, grading data) — Antigravity's job is only to
  produce image files and manifest entries; Claude wires `illustrationSrc`
  references into that file.

## Shared art contract (the only interface between the two of us)
- Crop faithful COLOR illustrations from the flipchart scans — no redraw,
  no AI generation, no color changes.
- **Crop tight**: no neighboring word's label bleeding in from an adjacent
  cell, no oversized blank canvas around the picture. If unsure where the
  cell boundary is, err toward cropping tighter, not looser — a slightly
  tight crop is fixable, a crop with a neighbor's text/drawing bleeding in
  is not usable as-is and has been the single most common rejection reason.
- File lands at `public/cartilla/art/faithful/<lesson-or-vowel-folder>/<slug>.webp`
  — reuse the existing folder convention already in the manifest (e.g.
  `leccion-1/`, `vocal-a/`, `vocal-e/`, `vocal-i/`, `vocal-o/`, `vocal-u/`).
  Do not invent a new top-level folder (e.g. a flat `vocales/` folder) —
  it breaks the existing lookup convention.
- Add one entry to `public/cartilla/art/faithful/manifest.json`:
  `{ slug, word, lessonNumber, pageNumber, src, sourceFlipchartPage, cropBox }`.
- Only produce words that actually appear in `page-layouts.json`'s existing
  captions (check `ART_BACKLOG.md` for the current list) — don't introduce
  new words that aren't part of the book's own transcribed content.
- Push to a fresh branch off current `main` and **open a PR against this
  repo** (you already have push access — this repo's Claude session is
  subscribed to PR activity and will review automatically) instead of only
  reporting done in chat.

## Workflow Rules (Strict)
1. Committing directly to main is allowed for asset files (images in public/cartilla/art/). All code changes still require a feature branch and PR. Let Vercel build the **preview** deployment and verify your change on the preview URL *before* it ever touches production.
2. **Stop iterating on production.** Settle the work on your branch and push **once** when it's right — not 5 commits redoing the same batch. Every push to `main` is a production build that consumes our Vercel deploy budget.
3. **Before merging:** confirm the preview URL actually renders. Don't merge red.
4. **No Emojis/Made-up Art.** NEVER use any emojis or any made-up art unless specifically allowed by the user.
