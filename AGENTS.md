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
- Never commit PNGs or PDFs to git
- Never change lesson-meta.ts letter assignments or page ranges
- Never replace original book illustrations with AI-generated art
- Never hardcode Supabase keys
- Never add English text to student-facing UI
- Never alter the book's original Spanish reading content

## Commit Format
feat(scope): description
fix(scope): description
chore(scope): description

- NEVER use AI-generated images or the legacy 'GretelStage' animated character. Always use the authentic hand-drawn artwork (e.g. public/art/hd/gretel-authentic.jpg).

## Workflow Rules (Strict)
1. **Do not commit to `main`.** Create a feature branch, push there, open a PR. Let Vercel build the **preview** deployment and verify your change on the preview URL *before* it ever touches production.
2. **Stop iterating on production.** If you're redesigning a component, settle the design on your branch and push **once** when it works — not 5 commits redoing the same screen. Every push to `main` is a production build that consumes our Vercel deploy budget.
3. **Our Vercel production deploys are currently BLOCKED** (usage/spend limit) and production is frozen on a June-17 build. Until that's cleared, pushing more to `main` does nothing but burn quota. Slow down and batch.
4. **Before merging:** run `pnpm typecheck` and `pnpm vitest run`, and confirm the preview URL actually renders. Don't merge red.
5. **Stay in your lane.** You own the student path + activities. Claude owns infra / teacher-CRM / docs. Don't both edit the same files; rebase on latest `main` before large changes so we don't clobber each other.
