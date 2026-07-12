-- Functional CRM completion: additive-only schema for archive/rename,
-- teacher notes, last-read-page persistence, and duplicate-assignment
-- prevention. Already applied live to the production project via MCP;
-- this file captures it as a versioned migration.

alter table public.students
  add column if not exists archived_at timestamptz,
  add column if not exists teacher_notes text;

alter table public.student_lesson_progress
  add column if not exists last_page integer;

alter table public.assignments
  add constraint assignments_class_lesson_unique unique (class_id, lesson_id);

create or replace function public.save_last_page(p_student_id uuid, p_student_code text, p_lesson_id text, p_page integer)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  s record;
  now_ts timestamptz := now();
begin
  if p_page is null or p_page < 0 then
    raise exception 'Página inválida.';
  end if;

  select * into s
  from public.students
  where id = p_student_id
    and upper(student_code) = upper(trim(p_student_code));

  if not found then
    raise exception 'Estudiante no autorizado.';
  end if;

  insert into public.student_lesson_progress(student_id, lesson_id, status, last_page, last_active_at)
  values (p_student_id, p_lesson_id, 'started', p_page, now_ts)
  on conflict (student_id, lesson_id) do update set
    last_page = excluded.last_page,
    last_active_at = excluded.last_active_at,
    status = case
      when public.student_lesson_progress.status = 'not_started' then 'started'
      else public.student_lesson_progress.status
    end;

  return jsonb_build_object('ok', true);
end;
$function$;

create or replace function public.get_student_progress(p_student_id uuid, p_student_code text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
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
    select lesson_id, status, completed_at, time_seconds, best_score, best_total, total_attempts, last_active_at, last_page
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
$function$;
