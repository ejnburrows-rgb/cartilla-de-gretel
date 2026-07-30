-- La Cartilla de Gretel security hardening — prepared only.
-- Do not apply to production until the owner approves the auth/data migration gate.
-- Forward migration goals:
-- 1) stop anonymous RPCs from returning reusable student_code credentials;
-- 2) issue short-lived scoped student sessions restricted to one student and one class;
-- 3) add class-code rotation without rotating existing live codes automatically;
-- 4) stop automatic teacher role grants for public signups;
-- 5) constrain child progress metadata and teacher notes.

begin;

create table if not exists public.student_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint student_sessions_short_lived check (expires_at <= created_at + interval '2 hours')
);

create index if not exists student_sessions_student_active_idx
  on public.student_sessions(student_id, class_id, expires_at)
  where revoked_at is null;

alter table public.student_sessions enable row level security;

create table if not exists public.teacher_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role app_role not null default 'teacher',
  invitation_code_hash text not null unique,
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint teacher_invitations_role_check check (role in ('teacher', 'admin'))
);

alter table public.teacher_invitations enable row level security;

create table if not exists public.class_code_history (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  join_code text not null,
  expired_at timestamptz not null default now(),
  rotated_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.student_data_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  request_type text not null check (request_type in ('archive', 'export', 'deletion_request', 'permanent_deletion')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'rejected')),
  requested_by uuid references auth.users(id),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.student_data_requests enable row level security;

alter table public.students
  alter column teacher_notes type varchar(1000),
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists permanently_deleted_at timestamptz;

create or replace function public.validate_progress_meta(p_meta jsonb)
returns jsonb
language plpgsql
stable
as $$
begin
  if p_meta is null then
    return null;
  end if;

  if jsonb_typeof(p_meta) <> 'object' then
    raise exception 'Invalid progress metadata';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_meta) as key
    where key not in ('exercise', 'page', 'attempt', 'inputMode', 'durationMs')
  ) then
    raise exception 'Invalid progress metadata';
  end if;

  return p_meta;
end;
$$;

-- Generic error wording is intentional: it avoids confirming whether a class or child exists.
create or replace function public.enter_class_as_student(
  p_join_code text,
  p_student_id uuid
)
returns table (
  student_id uuid,
  student_name text,
  class_id uuid,
  class_name text,
  student_session_token text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class record;
  v_student record;
  v_token text;
  v_expires_at timestamptz;
begin
  select id, name into v_class
  from public.classes
  where upper(join_code) = upper(trim(p_join_code))
  limit 1;

  if v_class.id is null then
    raise exception 'No se pudo entrar a la clase.';
  end if;

  select id, display_name into v_student
  from public.students
  where id = p_student_id
    and class_id = v_class.id
    and archived_at is null
  limit 1;

  if v_student.id is null then
    raise exception 'No se pudo entrar a la clase.';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + interval '45 minutes';

  insert into public.student_sessions(class_id, student_id, session_token_hash, expires_at)
  values (v_class.id, v_student.id, encode(digest(v_token, 'sha256'), 'hex'), v_expires_at);

  return query select
    v_student.id,
    v_student.display_name,
    v_class.id,
    v_class.name,
    v_token,
    v_expires_at;
end;
$$;

create or replace function public.validate_student_session(
  p_student_id uuid,
  p_class_id uuid,
  p_session_token text
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_sessions
    where student_id = p_student_id
      and class_id = p_class_id
      and session_token_hash = encode(digest(p_session_token, 'sha256'), 'hex')
      and revoked_at is null
      and expires_at > now()
  );
$$;

create or replace function public.rotate_class_join_code(p_class_id uuid)
returns table (class_id uuid, new_join_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old text;
  v_new text;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'No autorizado';
  end if;

  select join_code into v_old from public.classes where id = p_class_id for update;
  if v_old is null then
    raise exception 'Clase no encontrada';
  end if;

  loop
    v_new := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 6));
    exit when not exists (select 1 from public.classes where join_code = v_new);
  end loop;

  insert into public.class_code_history(class_id, join_code, rotated_by)
  values (p_class_id, v_old, auth.uid());

  update public.classes set join_code = v_new where id = p_class_id;

  return query select p_class_id, v_new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (user_id) do nothing;

  -- Public registration is pending by default. Teacher/admin role rows are granted
  -- only by invitation acceptance or an administrator-controlled operation.
  return new;
end;
$$;

comment on table public.student_sessions is 'Short-lived, one-child, one-class student sessions. Never expose reusable student_code anonymously.';
comment on table public.student_data_requests is 'Synthetic-testable audit path for archive, export, deletion request, and permanent deletion workflows.';
comment on column public.students.teacher_notes is 'Teacher note limit: 1000 characters. Do not store diagnoses, medical information, family circumstances, or unnecessary sensitive details.';

commit;
