-- Static/Vercel deployment support.
-- These RPCs replace app-server functions for student join, assignment, and progress flows.

create or replace function public.join_class(
  p_join_code text,
  p_student_code text
)
returns table (
  student_id uuid,
  student_name text,
  student_code text,
  class_id uuid,
  class_name text
)
language sql
security definer
set search_path = public
as $$
  select
    s.id as student_id,
    s.display_name as student_name,
    s.student_code,
    c.id as class_id,
    c.name as class_name
  from public.classes c
  join public.students s on s.class_id = c.id
  where upper(c.join_code) = upper(trim(p_join_code))
    and upper(s.student_code) = upper(trim(p_student_code))
  limit 1;
$$;

create or replace function public.get_student_assignments(
  p_class_id uuid,
  p_student_id uuid,
  p_student_code text
)
returns table (
  id uuid,
  lesson_id text,
  title text,
  due_at timestamptz,
  time_limit_seconds integer,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    a.id,
    a.lesson_id,
    a.title,
    a.due_at,
    a.time_limit_seconds,
    a.created_at
  from public.assignments a
  join public.students s on s.class_id = a.class_id
  where a.class_id = p_class_id
    and s.id = p_student_id
    and s.class_id = p_class_id
    and upper(s.student_code) = upper(trim(p_student_code))
  order by a.due_at asc nulls last, a.created_at desc;
$$;

create or replace function public.get_student_progress(
  p_student_id uuid,
  p_student_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  c record;
  events jsonb;
  lesson_progress jsonb;
begin
  select * into s
  from public.students
  where id = p_student_id
    and upper(student_code) = upper(trim(p_student_code));

  if not found then
    raise exception 'Estudiante no autorizado.';
  end if;

  select id, name into c
  from public.classes
  where id = s.class_id;

  select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc), '[]'::jsonb)
    into events
  from (
    select id, lesson_id, event_kind, score, total, time_seconds, meta, created_at
    from public.progress_events
    where student_id = p_student_id
    order by created_at desc
    limit 1000
  ) e;

  select coalesce(jsonb_agg(to_jsonb(lp)), '[]'::jsonb)
    into lesson_progress
  from (
    select lesson_id, status, completed_at, time_seconds, best_score, best_total, total_attempts, last_active_at
    from public.student_lesson_progress
    where student_id = p_student_id
  ) lp;

  return jsonb_build_object(
    'student', jsonb_build_object(
      'id', s.id,
      'display_name', s.display_name,
      'student_code', s.student_code,
      'class_id', s.class_id
    ),
    'class', jsonb_build_object(
      'id', c.id,
      'name', c.name
    ),
    'events', events,
    'lessonProgress', lesson_progress
  );
end;
$$;

create or replace function public.log_student_progress(
  p_student_id uuid,
  p_student_code text,
  p_lesson_id text,
  p_event_kind text,
  p_score integer default null,
  p_total integer default null,
  p_time_seconds integer default null,
  p_meta jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  now_ts timestamptz := now();
  assignment_row record;
  exercise_name text := coalesce(p_meta->>'exercise', 'exercise');
  completed_rounds_value integer := case
    when p_meta is not null and p_meta ? 'completed' and lower(p_meta->>'completed') = 'true' then 1
    else 0
  end;
  is_late boolean;
begin
  if p_event_kind not in ('lesson_completed', 'exercise', 'time', 'badge', 'level') then
    raise exception 'Tipo de evento inválido.';
  end if;

  select * into s
  from public.students
  where id = p_student_id
    and upper(student_code) = upper(trim(p_student_code));

  if not found then
    raise exception 'Estudiante no autorizado.';
  end if;

  insert into public.progress_events(student_id, lesson_id, event_kind, score, total, time_seconds, meta)
  values(p_student_id, p_lesson_id, p_event_kind, p_score, p_total, p_time_seconds, p_meta);

  if p_event_kind = 'lesson_completed' then
    insert into public.student_lesson_progress(student_id, lesson_id, status, completed_at, last_active_at)
    values(p_student_id, p_lesson_id, 'completed', now_ts, now_ts)
    on conflict(student_id, lesson_id) do update set
      status = 'completed',
      completed_at = coalesce(public.student_lesson_progress.completed_at, excluded.completed_at),
      last_active_at = excluded.last_active_at;

    for assignment_row in
      select id, due_at from public.assignments where class_id = s.class_id and lesson_id = p_lesson_id
    loop
      is_late := assignment_row.due_at is not null and assignment_row.due_at < now_ts;
      insert into public.assignment_progress(assignment_id, student_id, status, completed_at)
      values(assignment_row.id, p_student_id, case when is_late then 'late' else 'completed' end, now_ts)
      on conflict(assignment_id, student_id) do update set
        status = excluded.status,
        completed_at = coalesce(public.assignment_progress.completed_at, excluded.completed_at);
    end loop;
  elsif p_event_kind = 'time' and coalesce(p_time_seconds, 0) > 0 then
    insert into public.student_lesson_progress(student_id, lesson_id, status, time_seconds, last_active_at)
    values(p_student_id, p_lesson_id, 'started', coalesce(p_time_seconds, 0), now_ts)
    on conflict(student_id, lesson_id) do update set
      time_seconds = public.student_lesson_progress.time_seconds + coalesce(p_time_seconds, 0),
      last_active_at = excluded.last_active_at;

    for assignment_row in
      select id from public.assignments where class_id = s.class_id and lesson_id = p_lesson_id
    loop
      insert into public.assignment_progress(assignment_id, student_id, status, started_at, time_seconds)
      values(assignment_row.id, p_student_id, 'started', now_ts, coalesce(p_time_seconds, 0))
      on conflict(assignment_id, student_id) do update set
        started_at = coalesce(public.assignment_progress.started_at, excluded.started_at),
        status = case when public.assignment_progress.status = 'assigned' then 'started' else public.assignment_progress.status end,
        time_seconds = public.assignment_progress.time_seconds + coalesce(p_time_seconds, 0);
    end loop;
  elsif p_event_kind = 'exercise' and p_score is not null and p_total is not null then
    insert into public.exercise_attempt_summary(student_id, lesson_id, exercise, hits, attempts, completed_rounds, last_updated)
    values(p_student_id, p_lesson_id, exercise_name, p_score, p_total, completed_rounds_value, now_ts)
    on conflict(student_id, lesson_id, exercise) do update set
      hits = excluded.hits,
      attempts = excluded.attempts,
      completed_rounds = excluded.completed_rounds,
      last_updated = excluded.last_updated;

    insert into public.student_lesson_progress(student_id, lesson_id, status, best_score, best_total, total_attempts, last_active_at)
    values(p_student_id, p_lesson_id, 'started', p_score, p_total, p_total, now_ts)
    on conflict(student_id, lesson_id) do update set
      best_score = greatest(coalesce(public.student_lesson_progress.best_score, 0), coalesce(excluded.best_score, 0)),
      best_total = excluded.best_total,
      total_attempts = excluded.total_attempts,
      last_active_at = excluded.last_active_at;

    for assignment_row in
      select id from public.assignments where class_id = s.class_id and lesson_id = p_lesson_id
    loop
      insert into public.assignment_progress(assignment_id, student_id, status, started_at, score, total)
      values(assignment_row.id, p_student_id, 'started', now_ts, p_score, p_total)
      on conflict(assignment_id, student_id) do update set
        started_at = coalesce(public.assignment_progress.started_at, excluded.started_at),
        status = case when public.assignment_progress.status = 'assigned' then 'started' else public.assignment_progress.status end,
        score = excluded.score,
        total = excluded.total;
    end loop;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.join_class(text, text) to anon, authenticated;
grant execute on function public.get_student_assignments(uuid, uuid, text) to anon, authenticated;
grant execute on function public.get_student_progress(uuid, text) to anon, authenticated;
grant execute on function public.log_student_progress(uuid, text, text, text, integer, integer, integer, jsonb) to anon, authenticated;
