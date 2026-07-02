# Cartilla de Gretel — Claude Code Instructions

## What This Is
Spanish literacy app for young children (ages 4-7).
Gretel is an animated guide character who reacts to student actions.
Students work through a 95-page interactive workbook (cartilla).
Teachers create classes, assign students, and track progress via Supabase.

## Stack
- Vite + React + TypeScript
- TanStack Router (file-based routing — src/routes/)
- Supabase (auth + database)
- src/routeTree.gen.ts is AUTO-GENERATED — never edit manually

## Directory Map
- src/routes/        → all pages (file-based routing)
- src/components/    → shared UI components
- src/features/      → feature modules
- src/services/      → all Supabase calls go here
- src/integrations/  → Supabase client init
- src/context/       → React context providers
- src/data/          → static lesson/content data
- src/types/         → TypeScript types
- public/cartilla/images/gretel/poses/ → PRODUCTION Gretel assets (do not move)
- scratch/           → working files, not production

## Hard Rules
- NEVER edit src/routeTree.gen.ts manually
- NEVER hardcode localhost URLs — always use import.meta.env
- ALL Supabase calls go through src/services/ only
- NEVER delete files — move or rename only
- NEVER refactor working code unless explicitly asked
- NEVER touch Gretel animation state machine without explicit approval
- Confirm before any change touching more than 3 files at once
- sessionStorage is a placeholder — student data must go to Supabase
- All env vars use import.meta.env (Vite)

## Start Every Session Like This
1. Read this file
2. Read package.json and src/main.tsx
3. Summarize what you find
4. Wait for task assignment before making any changes

## Working Style — Never Stall
- Never end a turn by just waiting idle. Always leave the owner with either
  (a) concrete next-step prompts they can hand to their other agent
  (Antigravity) or act on themselves, or (b) continued work of your own.
- When blocked on an external dependency (e.g. art delivery), don't just
  report and stop — find and execute the next unblocked piece of work
  yourself, and say what it was.
- Default to action over asking, once you have enough information to make
  a reasonable call.
- When something needs to go back to Antigravity (or anyone else), give
  ONE complete, consolidated, copy-pasteable list of everything outstanding
  — every known bug, every missing word, every gap — in a single message.
  Never dole it out piecemeal across multiple turns/rounds; the owner is
  relaying these by hand and re-checking every round costs them real time.
- Don't ask the owner small clarifying questions when a reasonable default
  exists — pick it, act, and say what you picked. Save questions for real
  decisions only.

## Current Status (July 2026)
✅ Landing page with desk scene
✅ Workbook with 95 pages
✅ Gretel compositing (GretelStage, GretelGuide)
✅ Gretel reactions — event-driven via src/lib/gretel-bus.ts (lesson:start,
   answer:correct/wrong, lesson:complete, activity:complete, etc.), wired
   from real student actions across Ejercicios/DragBuildWord/InteractiveMiniGames
   /etc. NOT hardcoded to page numbers — that refactor is already done.
✅ Faithful page digitization (feat/faithful-pages, PR #48) — all 90 workbook
   pages transcribed with real text + book fonts/colors (PageRegion schema +
   FaithfulPageRenderer, src/data/page-layouts.json). Student workbook and
   teacher flipbook both render it automatically wherever hasPageLayout()
   is true, scan fallback otherwise. Illustrations: partial (verified real
   crops wired in as they arrive from the art pipeline; "art pending" shown
   honestly elsewhere — see public/cartilla/art/faithful/manifest.json).
⚠️  Student login — uses sessionStorage, needs Supabase
❌  Teacher login + class management — incomplete
❌  Cloud progress sync — not yet built
