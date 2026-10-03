-- Rotate live class join codes from guessable dictionary codes (GRETEL, NOVO26)
-- to crypto-random 6-character alphanumeric join codes.
--
--  Clase Leonor: GRETEL -> K8P3X7
--  Clase Emilio: NOVO26 -> M9W2Y4

update public.classes
set join_code = 'K8P3X7'
where upper(join_code) = 'GRETEL';

update public.classes
set join_code = 'M9W2Y4'
where upper(join_code) = 'NOVO26';

-- Update the seeding function to use rotated non-dictionary join codes.
create or replace function public.seed_cartilla_classroom_for_teacher(
  p_teacher_email text,
  p_profile text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_teacher_id uuid;
  v_profile text := lower(trim(p_profile));
  v_class_id uuid;
  v_class_name text;
  v_join_code text;
  v_assignment_id uuid;
begin
  if p_teacher_email is null or length(trim(p_teacher_email)) = 0 then
    raise exception 'Teacher email is required.';
  end if;

  select id
    into v_teacher_id
  from auth.users
  where lower(email) = lower(trim(p_teacher_email))
  limit 1;

  if v_teacher_id is null then
    raise exception 'No Supabase auth user found for %. Create the teacher account first.', p_teacher_email;
  end if;

  if v_profile = 'leonor' then
    v_class_name := 'Clase Leonor';
    v_join_code := 'K8P3X7';
  elsif v_profile = 'emilio' then
    v_class_name := 'Clase Emilio';
    v_join_code := 'M9W2Y4';
  else
    raise exception 'Unknown classroom profile %. Use leonor or emilio.', p_profile;
  end if;

  insert into public.user_roles (user_id, role)
  values (v_teacher_id, 'teacher')
  on conflict (user_id, role) do nothing;

  insert into public.classes (teacher_id, name, join_code)
  values (v_teacher_id, v_class_name, v_join_code)
  on conflict (join_code) do nothing
  returning id into v_class_id;

  if v_class_id is null then
    select id
      into v_class_id
    from public.classes
    where join_code = v_join_code
      and teacher_id = v_teacher_id
    limit 1;
  end if;

  if v_class_id is null then
    raise exception 'Join code % already exists for another teacher. Resolve before seeding.', v_join_code;
  end if;

  insert into public.students (class_id, display_name, student_code)
  values
    (v_class_id, 'Erick Novo', 'NOVO'),
    (v_class_id, 'Sofia Morejon', 'SOFIA')
  on conflict (class_id, student_code) do update
    set display_name = excluded.display_name;

  insert into public.assignments (class_id, lesson_id, title, due_at, time_limit_seconds)
  values (v_class_id, '1', 'Primer repaso', null, null)
  on conflict do nothing
  returning id into v_assignment_id;

  return jsonb_build_object(
    'ok', true,
    'teacher_email', p_teacher_email,
    'teacher_id', v_teacher_id,
    'profile', v_profile,
    'class_id', v_class_id,
    'class_name', v_class_name,
    'join_code', v_join_code,
    'students', jsonb_build_array('Erick Novo', 'Sofia Morejon')
  );
end;
$$;

comment on function public.seed_cartilla_classroom_for_teacher(text, text)
  is 'Seeds real Supabase classroom records for the preconfigured Cartilla teacher profiles after teacher auth users exist.';
