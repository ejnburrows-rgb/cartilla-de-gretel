-- Bootstrap: confirm live teacher auth users so password login works.
-- Safe / idempotent: only sets email_confirmed_at when null.
-- Does not change passwords or roles.

update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) in (
  'cartilla.teacher.live@gmail.com',
  'ejnburrows@gmail.com'
);

-- Third roster name for GRETEL (Clase Leonor) if missing.
insert into public.students (class_id, display_name, student_code)
select c.id, 'Mateo Reyes', 'MATEO'
from public.classes c
where upper(c.join_code) = 'GRETEL'
on conflict (class_id, student_code) do update
  set display_name = excluded.display_name;
