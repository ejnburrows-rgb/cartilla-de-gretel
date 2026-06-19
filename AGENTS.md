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
