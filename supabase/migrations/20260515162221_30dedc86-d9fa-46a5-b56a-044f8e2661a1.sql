
-- Roles enum + table
create type public.app_role as enum ('teacher', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);
create index classes_teacher_idx on public.classes(teacher_id);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  display_name text not null,
  student_code text not null unique,
  created_at timestamptz not null default now()
);
create index students_class_idx on public.students(class_id);

create table public.progress_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_id text not null,
  event_kind text not null check (event_kind in ('lesson_completed','exercise','time','badge','level')),
  score integer,
  total integer,
  time_seconds integer,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index progress_student_idx on public.progress_events(student_id);
create index progress_lesson_idx on public.progress_events(lesson_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.progress_events enable row level security;

-- profiles: owner reads/updates own
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

-- user_roles: user reads own
create policy "roles self read" on public.user_roles for select using (auth.uid() = user_id);

-- classes: teacher manages own; anyone can read by join_code (kids joining)
create policy "classes teacher all" on public.classes for all
  using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy "classes public read" on public.classes for select using (true);

-- students: teacher of class manages; public can read for joining
create policy "students teacher all" on public.students for all
  using (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));
create policy "students public read" on public.students for select using (true);

-- progress_events: teacher of student's class can read; writes go via server fn (no direct insert policy needed; service role bypasses RLS)
create policy "progress teacher read" on public.progress_events for select
  using (exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = student_id and c.teacher_id = auth.uid()
  ));
create policy "progress teacher delete" on public.progress_events for delete
  using (exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = student_id and c.teacher_id = auth.uid()
  ));

-- Trigger: on signup -> create profile + grant teacher role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'teacher')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
