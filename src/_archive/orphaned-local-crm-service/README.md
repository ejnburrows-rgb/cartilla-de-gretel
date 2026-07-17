# Archived: local-only CRM service (`crm.ts`)

Moved here 2026-07-17, out of `src/services/`, so it's no longer part of the
live tree. Not deleted — per repo policy, files are moved/archived, never
deleted.

## Why

`src/services/crm.ts` was a `localStorage`-backed store (`crmService`) that let
the teacher **Progreso** page manually toggle per-student lesson-completion
checkmarks. Those checkmarks were disconnected from real student activity —
they only reflected what a teacher had hand-clicked in that one browser, never
what students actually did.

The Progreso page (`src/routes/cartilla/teacher/progreso.tsx`) now reads **real**
per-student completion data from the same source the Reportes page uses
(`getClassProgress` for live Supabase / `getSeedClassProgress` for the demo
seed session — both return `perStudent[].completedLessonIds`). The grid is
read-only: it reflects lessons students have genuinely completed, with no
manual override (owner decision, 2026-07-17).

After that rewire, `crm.ts` had **zero** remaining importers (verified by
repo-wide grep — `progreso.tsx` was its only consumer), so it was archived
rather than left as dead code in the live tree. `src/_archive/**` is excluded
from `tsconfig.json` and ESLint, so nothing here is compiled, bundled, or
linted.
