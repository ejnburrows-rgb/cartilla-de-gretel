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
- Never commit PDFs to git. PNGs in public/cartilla/art/ ARE allowed to be committed.
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
1. Committing directly to main is allowed for asset files (PNGs in public/cartilla/art/). All code changes still require a feature branch and PR. Let Vercel build the **preview** deployment and verify your change on the preview URL *before* it ever touches production.
2. **Stop iterating on production.** If you're redesigning a component, settle the design on your branch and push **once** when it works — not 5 commits redoing the same screen. Every push to `main` is a production build that consumes our Vercel deploy budget.
4. **Before merging:** run `pnpm typecheck` and `pnpm vitest run`, and confirm the preview URL actually renders. Don't merge red.
5. **Stay in your lane.** You own the student path + activities. Claude owns infra / teacher-CRM / docs. Don't both edit the same files; rebase on latest `main` before large changes so we don't clobber each other.
6. **No Emojis/Made-up Art in CRM.** NEVER use any emojis or any made-up art inside the CRM unless specifically allowed by the user.

## UI / UX Strict Guidelines
- **Teacher CRM (Google-Suite Style)**: The teacher interface must be ultra-professional, seamless, and standardized (like Google Workspace). No emojis, no AI-generated art, and consistent fonts throughout.
- **Teacher CRM Color-Coding (The "4 Squares")**:
  - Blue: "Rimas Reproducible Enriquecimiento" (y Respuestas de las Evaluaciones)
  - Red: "Evaluaciones Reproducibles"
  - Purple: "Black line masters, tablas silábicas"
  *(Information must be structured in these distinct folders as sublinks).*
- **Student Gamification**: The student interface must NOT use plain grids. It must use immersive, story-like gamification (e.g., "Mapa de Gretel" level-paths, infinite parallax environments).
- **Art Integration (No Dead Cutters)**: When integrating authentic hand-drawn Cartilla art, NEVER use "white, dead cutters" (plain white square backgrounds). You must use CSS masking (e.g., `mask-image: radial-gradient`) or proper transparent PNGs to seamlessly blend the characters into immersive environments so they look like one cohesive "Big Happy Family."
- **No UI Surprises**: Before implementing any new major UI component or screen, the agent MUST first provide a visual mockup (using the generate_image tool or a detailed visual description) and get explicit user approval.
- **School District Standards**: For any new Teacher-facing features, the agent must perform web research on the most user-friendly, modern UX formats used by US School Districts (e.g., Canvas, Google Classroom, Clever) and apply those specific design patterns, rather than guessing.
- **100% Visual Fidelity**: Any digital representation of the physical book or flipchart MUST be 100% faithful to the original layout, aspect ratio, and aesthetic. No deviations or modernized simplifications are allowed for the original content.
