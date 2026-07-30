-- Secure read/write paths for a scoped student session, plus invitation
-- acceptance for teacher onboarding. Prepared only — do not apply to production
-- until the owner approves the authentication/permissions migration gate.
--
-- Depends on 20260730100000_secure_student_sessions_and_teacher_approval.sql.

begin;

-- Every failure returns the same generic error on purpose: distinct messages
-- would confirm whether a class, child or session exists.
create or replace function public.log_student_progress_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_session_token text,
  p_lesson_id text,
  p_event_kind text,
  p_score integer default null,
  p_total integer default null,
  p_time_seconds integer default null,
  p_meta jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.validate_student_session(p_student_id, p_class_id, p_session_token) then
    raise exception 'No se pudo guardar el progreso.';
  end if;

  if p_event_kind not in ('lesson_completed', 'exercise', 'time', 'badge', 'level') then
    raise exception 'No se pudo guardar el progreso.';
  end if;

  insert into public.progress_events(
    student_id, lesson_id, event_kind, score, total, time_seconds, meta
  )
  values (
    p_student_id,
    p_lesson_id,
    p_event_kind,
    p_score,
    p_total,
    p_time_seconds,
    public.validate_progress_meta(p_meta)
  );
end;
$$;

create or replace function public.get_student_progress_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_session_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_events jsonb;
  v_lessons jsonb;
begin
  if not public.validate_student_session(p_student_id, p_class_id, p_session_token) then
    raise exception 'No se pudo cargar el progreso.';
  end if;

  select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc), '[]'::jsonb)
  into v_events
  from (
    select id, lesson_id, event_kind, score, total, time_seconds, meta, created_at
    from public.progress_events
    where student_id = p_student_id
    order by created_at desc
    limit 1000
  ) e;

  select coalesce(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
  into v_lessons
  from (
    select lesson_id, status, completed_at, last_active_at, last_page
    from public.student_lesson_progress
    where student_id = p_student_id
  ) l;

  return jsonb_build_object('events', v_events, 'lessonProgress', v_lessons);
end;
$$;

create or replace function public.save_last_page_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_session_token text,
  p_lesson_id text,
  p_page integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.validate_student_session(p_student_id, p_class_id, p_session_token) then
    raise exception 'No se pudo guardar la página.';
  end if;

  if p_page < 0 or p_page > 1000 then
    raise exception 'No se pudo guardar la página.';
  end if;

  insert into public.student_lesson_progress(student_id, lesson_id, last_page, last_active_at)
  values (p_student_id, p_lesson_id, p_page, now())
  on conflict (student_id, lesson_id)
  do update set last_page = excluded.last_page, last_active_at = now();
end;
$$;

-- Teacher onboarding: role assignment stays entirely server-side. Accepting a
-- valid, unexpired, unused invitation is the only self-service path to a role.
create or replace function public.accept_teacher_invitation(p_invitation_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation record;
begin
  if auth.uid() is null then
    raise exception 'No autorizado';
  end if;

  select * into v_invitation
  from public.teacher_invitations
  where invitation_code_hash = encode(digest(p_invitation_code, 'sha256'), 'hex')
  limit 1;

  if v_invitation.id is null then
    raise exception 'Invitación inválida';
  end if;

  if v_invitation.accepted_at is not null then
    raise exception 'Invitación inválida';
  end if;

  if v_invitation.expires_at <= now() then
    raise exception 'Invitación vencida';
  end if;

  insert into public.user_roles (user_id, role)
  values (auth.uid(), v_invitation.role)
  on conflict do nothing;

  update public.teacher_invitations
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invitation.id;

  return v_invitation.role::text;
end;
$$;

-- Retention: configurable, and deliberately not scheduled here. Applying a
-- purge to real children's records is an owner decision, not a side effect of
-- a migration.
create table if not exists public.data_retention_settings (
  id boolean primary key default true,
  archived_student_retention_days integer not null default 365,
  updated_at timestamptz not null default now(),
  constraint data_retention_single_row check (id),
  constraint data_retention_days_sane check (archived_student_retention_days between 30 and 3650)
);

insert into public.data_retention_settings(id) values (true)
on conflict (id) do nothing;

comment on table public.data_retention_settings is 'Proposed default: archived student data retained 365 days, then owner-approved deletion or anonymisation. Not enforced automatically.';

commit;
