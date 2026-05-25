# Classroom CRM Status

Date: 2026-05-25

## Current framing

This is the CRM layer for the real La Cartilla de Gretel classroom platform. It should not be treated as a throwaway demo.

The system has two modes:

1. **Production mode** — Supabase is configured and classroom data syncs to the cloud.
2. **Local mode** — Supabase is not configured and the preconfigured teacher/student accounts are stored in this device/browser.

## What works

- **Teacher roster and class management**: teachers can create classes, add students, copy class join codes, view class rosters, delete students/classes, and export rosters to CSV.
- **Teacher dashboard**: class detail pages show progress across lessons, per-student completed lesson counts, event counts, last active timestamps, assignments, and student progress pages.
- **Student join flow**: students can join with a class join code and personal student code when a teacher provides them.
- **Public workbook browsing**: the student workbook can be explored without a class code. A class code is optional for progress tracking.
- **Progress event pipeline**: lesson completions, exercise attempts, study time, badges, and level-up events can be recorded.
- **Curriculum assignments**: teachers can assign lessons, due dates, and time limits. Students with a session see assignments in the lesson page.

---

## Preconfigured local accounts

When Supabase is missing, the app loads preconfigured classroom records for real review/use on the device:

Teacher accounts:

- Leonor Lopetegui — username `leonore`
- Emilio Novo — username `emilio`

Student/class access:

- Erick Novo — class `GRETEL`, code `NOVO`
- Sofia Morejon — class `GRETEL`, code `SOFIA`
- Erick Novo — class `NOVO26`, code `NOVO`
- Sofia Morejon — class `NOVO26`, code `SOFIA`

These records should be seeded into Supabase for real cloud-backed production. See `docs/SUPABASE_REAL_ACCOUNTS.md`.

---

## Local mode

When Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) are missing, the CRM runs in local mode:

- Sessions and progress are stored in the current browser.
- Progress does not sync across devices.
- Teacher local data can be exported/imported/reset where the dashboard supports it.
- The UI should clearly say that progress is saved on this device only.

Use this wording:

> Local mode — progress is saved on this device only.

---

## Supabase production mode

When configured:

- Supabase handles authentication/data access paths used by the CRM layer.
- CRM records persist in cloud tables.
- Student progress can sync beyond one browser/device.
- Production use still requires reviewing schema, migrations, RLS/security policies, and real account setup.

Required environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

---

## Student flow

1. Open `/cartilla` or `/cartilla/lecciones` to browse the workbook publicly.
2. Optional: open `/cartilla/unirse` if a teacher provided a class code and student code.
3. Persistent session is established after joining.
4. Work through `/cartilla/lecciones` and lesson pages.
5. Open `/cartilla/mi-progreso` to review personal progress.

## Teacher flow

1. Open `/login` if teacher access requires it.
2. Open `/cartilla/teacher`.
3. Create/manage classes and students.
4. Assign lessons and track progress.
5. Use `/cartilla/teacher/flipchart` for class presentation.
6. Use `/cartilla/teacher/remaster-review` for internal visual approval only.

---

## Reliability states

The UI should surface clear states for:

- loading
- no students yet
- no progress yet
- local mode
- Supabase not configured
- progress saved locally
- sync unavailable
- progress synced
- load failure

## Production blockers

Before real classroom use:

- Confirm the live Supabase schema.
- Confirm migrations/RLS policies.
- Seed real teacher account(s), classes, students, and initial assignments in Supabase.
- Confirm privacy process for students.
- Confirm student progress sync works in production mode.
- Confirm remastered images are reviewed before approval.
