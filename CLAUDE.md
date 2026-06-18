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
- src/lib/           → utilities + *.functions.ts (Supabase data-access lives here, NOT in src/services/)
- src/integrations/  → Supabase client init
- src/context/       → React context providers
- src/data/          → static lesson/content data
- src/types/         → TypeScript types
- public/cartilla/images/gretel/poses/ → PRODUCTION Gretel assets (do not move)
- scratch/           → working files, not production

## Hard Rules
- NEVER edit src/routeTree.gen.ts manually
- NEVER hardcode localhost URLs — always use import.meta.env
- Supabase data-access goes through src/lib/*.functions.ts (auth helpers may call the client directly)
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

## Current Status (June 2026)
✅ Landing page with desk scene
✅ Workbook with 95 pages
✅ Gretel compositing (GretelStage, GretelGuide)
⚠️  Student login — Supabase-validated join, session cached locally (offline-first by design)
✅  Teacher login + class management — Supabase-backed CRM at /cartilla/teacher
✅  Cloud progress sync — offline queue, drains to Supabase on reconnect
❌  Gretel reactions — hardcoded to page numbers, needs event-driven refactor
