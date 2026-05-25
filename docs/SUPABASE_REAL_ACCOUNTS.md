# Supabase Real Accounts and Seed Data

The platform should use real classroom records, not fake demo identity as the product goal.

## Preconfigured local accounts

When Supabase is not configured, the app loads the same intended classroom structure in local browser storage so the platform can be used and reviewed immediately.

Teacher accounts:

| Teacher | Username | Local password |
| --- | --- | --- |
| Leonor Lopetegui | `leonore` | `Cartilla2026!` |
| Emilio Novo | `emilio` | `Novo2026!` |

Classes:

| Teacher | Class | Join code |
| --- | --- | --- |
| Leonor Lopetegui | Clase Leonor | `GRETEL` |
| Emilio Novo | Clase Emilio | `NOVO26` |

Students:

| Student | Class code | Student code |
| --- | --- | --- |
| Erick Novo | `GRETEL` | `NOVO` |
| Sofia Morejon | `GRETEL` | `SOFIA` |
| Erick Novo | `NOVO26` | `NOVO` |
| Sofia Morejon | `NOVO26` | `SOFIA` |

## Production rule

In production Supabase mode, these should become actual Supabase records:

- teacher auth users
- teacher roles
- classes
- students
- assignments
- progress events

Local mode is only a fallback when Supabase is not configured. The real product target is Supabase-backed classroom data.

## Required env vars

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

## Migration added

A production seed helper has been added:

```text
supabase/migrations/20260525033000_seed_cartilla_real_classroom_accounts.sql
```

It creates this SQL function:

```sql
public.seed_cartilla_classroom_for_teacher(p_teacher_email text, p_profile text)
```

It also changes student-code uniqueness from global to per-class, so the same student code can exist in different classes.

## Production setup steps

1. Create the teacher auth users in Supabase Auth.
2. Apply all migrations.
3. Run the seed helper for each real teacher account.

Example:

```sql
select public.seed_cartilla_classroom_for_teacher('leonor@example.com', 'leonor');
select public.seed_cartilla_classroom_for_teacher('emilio@example.com', 'emilio');
```

Replace the emails with the actual Supabase Auth emails.

## What the seed helper creates

For `leonor`:

- teacher role for the auth user
- class: `Clase Leonor`
- join code: `GRETEL`
- students: Erick Novo / Sofia Morejon
- assignment: `Primer repaso`

For `emilio`:

- teacher role for the auth user
- class: `Clase Emilio`
- join code: `NOVO26`
- students: Erick Novo / Sofia Morejon
- assignment: `Primer repaso`

## Important

The migration does not create Supabase Auth users. Those must be created in Supabase Auth first, because passwords and identity belong to Supabase Auth, not ordinary public database tables.
