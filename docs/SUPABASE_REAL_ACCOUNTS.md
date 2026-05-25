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

## Next required production step

Create or confirm Supabase tables and seed these same accounts/classes/students as real database records. Do not rely on browser local storage for real classroom operation.
