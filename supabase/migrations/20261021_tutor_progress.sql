-- Tutor progress table (spec §10, milestone 6).
--
-- IMPORTANT — FILE ONLY, NOT APPLIED:
--   Owner decision (EJN, 2026-10-21): progress is stored ON THE DEVICE ONLY.
--   No Supabase writer is built and this migration is NOT applied to any
--   environment. Supabase work is owner-gated and deferred (AGENTS.md
--   2026-10-13 gate). Applying this file requires separate owner approval.
--
-- Insert-only by design: RLS is on and there are deliberately NO
-- select/update/delete policies for clients. The read path (teacher/admin)
-- is an open owner decision (spec §10: admin-only read, or add a class
-- column — a scope change).

create table public.tutor_progress (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  lesson_id text not null check (lesson_id ~ '^[1-3]$'),
  item_id text not null check (char_length(item_id) <= 64),
  result text not null check (result in ('correct','correct_after_retry','missed')),
  attempts int not null check (attempts between 1 and 3),
  created_at timestamptz not null default now()
);

alter table public.tutor_progress enable row level security;

create policy tutor_progress_insert_only on public.tutor_progress
  for insert to anon, authenticated with check (true);

-- no select/update/delete policies for clients