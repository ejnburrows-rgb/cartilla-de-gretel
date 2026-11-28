# Tutor data retention — La Cartilla de Gretel

Status: **stub with owner placeholders** (spec §11, milestone 6). Retention
periods and contact details are owner policy and are deliberately NOT
invented here (AGENTS.md, School-pilot data safety). Replace every
`[OWNER TO SET]` before any real-data pilot.

## What the tutor collects

Progress events only — one event per finished item, with exactly these
fields (spec §10):

| Field | Value |
|---|---|
| `session_id` | UUIDv5(namespace, `${classCode}:${slot}`) — anonymous, not secret (anyone who knows the class code can compute it) |
| `lesson_id` | 1, 2, or 3 |
| `item_id` | lesson item id, ≤ 64 chars |
| `result` | `correct` / `correct_after_retry` / `missed` |
| `attempts` | 1–3 |
| `created_at` | ISO-8601 timestamp |

Never collected by the tutor: names, audio, transcripts, or any other field.

## Audio

Processed on the device only, and never stored or sent (on-device path).

## Table location (future, NOT applied)

Owner decision (EJN, 2026-10-21): progress is stored **on the device only**.
No Supabase writer is built. The insert-only table definition ships as
`supabase/migrations/20261021_tutor_progress.sql` and is **not applied** to
any environment; applying it requires separate owner approval
(Supabase/live-student-data work is owner-gated).

- Future table: `public.tutor_progress` (only after owner approval and
  application of the migration file above).
- Row level security is on; the only client policy is insert-only. There are
  deliberately no select/update/delete policies for clients.
- The teacher/admin read path is an open owner decision (spec §10).

## On-device storage (current)

| What | Where |
|---|---|
| Progress events | `localStorage` key `cartilla.tutor.progress.v1` (bounded to 500 events, FIFO) |

## Deletion method

- On-device progress log: erase the browser's site data for this app, or the
  tutor's teacher-side controls that call `clearTutorProgress()`
  (`src/lib/tutor-progress.ts`).
- Future `public.tutor_progress` rows: deletion is **[OWNER TO SET]** — no
  client delete path exists by design.

## Retention

- On-device events: **[OWNER TO SET]** — the on-device log is bounded to the
  most recent 500 events (FIFO), but no time-based retention rule is defined.
- `public.tutor_progress` (if ever applied): **[OWNER TO SET]**.

## Contact

**[OWNER TO SET]**

## Analytics / cookies

No analytics, no third-party cookies on tutor routes.