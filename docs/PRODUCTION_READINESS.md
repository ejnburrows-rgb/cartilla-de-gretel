# Production Readiness — La Cartilla de Gretel

Date: 2026-05-25

## Product goal

The goal is the real classroom platform, not a temporary demo:

1. Student workbook
2. Teacher classroom CRM
3. Teacher flipchart / class presentation book

## What works now

- Public Cartilla landing page exists.
- Student workbook scans are mapped for all 24 lessons.
- Student workbook page flip and book shell exist.
- Source-backed student interactions exist for selected high-value lessons.
- Teacher dashboard exists.
- Teacher flipchart lane exists.
- Remaster review workflow exists.
- Local mode works when Supabase is not configured.
- A Supabase seed helper exists for creating the real classroom records once teacher auth users exist.

## Public workbook access

Public users should be able to open the workbook without a class code:

- `/cartilla`
- `/cartilla/lecciones`
- `/cartilla/leccion/1` through `/cartilla/leccion/24`

A class code is optional and only needed for classroom progress tracking.

## Local mode

When Supabase environment variables are missing, the app runs in local mode:

- Preconfigured teacher/student/class records load in this browser.
- Progress and sessions are saved in the browser/device.
- Data is not synced to the cloud.
- The UI should say this honestly.

Use this wording:

> Local mode — progress is saved on this device only.

Avoid making local mode the product goal. It is a fallback.

## Supabase production path

Required environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Required setup:

1. Create Supabase project.
2. Apply all migrations in `supabase/migrations/`.
3. Create real teacher auth users in Supabase Auth.
4. Run the seed helper from `docs/SUPABASE_REAL_ACCOUNTS.md` to create classes/students.
5. Add the Vercel environment variables.
6. Redeploy.
7. Verify teacher login, class roster, student join, and progress sync.

## Core CRM objects

- Teacher
- Class
- Student
- Assignment
- Lesson progress
- Activity attempt

## Current blockers before real classroom use

- Confirm Supabase project and migrations are applied.
- Create/confirm real teacher accounts.
- Seed real classes/students/assignments in Supabase.
- Confirm RLS/security policies are reviewed.
- Confirm student privacy flow and parental/guardian process.
- Verify teacher can create classes and students in production mode.
- Verify student progress syncs across devices when Supabase is configured.
- Review remaster samples before approving any remastered pages for production.

## Internal-only tools

These should remain teacher/internal-facing:

- `/cartilla/teacher/remaster-review`
- remaster approval workflow
- source/remaster metadata
- hotspot/cutout readiness labels

## Next production milestone

Make the platform operate from Supabase-backed classroom records:

- Teacher accounts exist in Supabase Auth.
- Classes and student codes exist in Supabase tables.
- Student progress syncs to Supabase.
- Public workbook access remains simple.
- Teacher CRM is clear.
- Teacher flipchart is separate from student workbook.
- Remaster workflow is approval-gated.
