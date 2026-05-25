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

## Public workbook access

Public users should be able to open the workbook without a class code:

- `/cartilla`
- `/cartilla/lecciones`
- `/cartilla/leccion/1` through `/cartilla/leccion/24`

A class code is optional and only needed for classroom progress tracking.

## Local mode

When Supabase environment variables are missing, the app runs in local mode:

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

Before real classrooms, verify:

- Supabase project exists.
- Tables/migrations are applied.
- Teacher/class/student/progress records persist in Supabase.
- RLS/security policies are reviewed.
- No student email is required.

## Core CRM objects

- Teacher
- Class
- Student
- Assignment
- Lesson progress
- Activity attempt

## Current blockers before real classroom use

- Confirm Supabase schema and migrations in the live Supabase project.
- Seed real teacher account(s).
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

Make the platform feel like one clean classroom system:

- Public workbook access is simple.
- Teacher CRM is clear.
- Teacher flipchart is separate from student workbook.
- Remaster workflow is approval-gated.
- Local mode is honest but not the final production target.
