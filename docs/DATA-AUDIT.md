# DATA AUDIT — secrets and minors' data

**Date:** 2026-07-29 · **Scope:** browser bundle secrets, row-level security, and what
personal data the app holds about children.
**Project audited:** `Cartilla de Gretel` (`rckarlopnickdyyjfbas`) — the only project this
app points at. The org also contains `otto-live`; it is unrelated to this app and, per
the `-live` rule in `AGENTS.md`, it was not touched.

**Method:** read-only. Nothing was changed, no policy was loosened, no migration was
applied. Every claim below has a command or a query behind it.

> **A note on the evidence.** Verifying the access findings meant calling the live API as
> an anonymous visitor. No child's name, code, or record is reproduced in this document —
> only counts, field names, and yes/no answers. That was a deliberate constraint, not an
> oversight.

---

## Verdict in one line

**Secrets hygiene is clean. Row-level security is on and correctly written on every
table. Neither is where the risk is** — the student lane deliberately bypasses RLS
through `SECURITY DEFINER` functions that anyone on the internet can call, and one of
those functions hands a child's login code to a caller who never proved they had it.

---

## Findings

| # | Tier | Finding |
|---|---|---|
| 1 | **Blocker** | An anonymous caller who guesses a class join code gets every child's name, and can then obtain any child's `student_code` without supplying it |
| 2 | **Blocker** | Both classes in the live database use dictionary-word join codes (`GRETEL`, `NOVO26`) |
| 3 | High | No retention limit anywhere — every progress event and child name is kept forever |
| 4 | High | `students.teacher_notes` is unbounded free text about a named child, with no stated purpose or limit |
| 5 | High | `progress_events.meta` accepts arbitrary client-supplied JSON on a row attached to a child |
| 6 | Cleanup | `lesson_verifications` exists in migrations but was never applied to the live database |
| 7 | Cleanup | Leaked-password protection off (already known and mitigated — no action proposed) |

---

## 1. Secrets in the browser bundle — CLEAN, no Blocker

**Asked:** confirm only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` reach the
browser, and treat any service-role key in client code as a Blocker.

**Answer: confirmed. There is no service-role key in client code.** Checked against a real
production build (`vite build`), not just the source:

| Check | Result |
|---|---|
| `service_role` / `sb_secret_` / `SUPABASE_SERVICE_ROLE` anywhere in `dist/` | **none** |
| JWT-shaped tokens embedded in `dist/` | **none** |
| Key actually inlined | `sb_publishable_…`, 46 chars — a publishable key, **not** `sb_secret_` |
| Project URL inlined | yes — expected and safe |
| `.env` tracked by git | never; `.gitignore:49` is `.env*`, only `.env.example` is tracked |
| `.env.example` contents | placeholders only |
| Service-role key ever committed | no — history search for `service_role` / `sb_secret_` finds only a doc line |

The URL and publishable key being in the bundle is correct and by design: a publishable
key is meant to be public, and everything it can reach is what RLS allows.

**One correction to the brief:** a *third* `VITE_` variable exists — `VITE_ALLOW_DEMO_MODE`
(`src/lib/seed-data.ts:31`, `src/routes/login.tsx:52`). It is not a secret, and it does
**not** reach production: `demoModeAllowed()` returns `false` under `import.meta.env.PROD`
regardless of the flag, and the string is absent from the built bundle. Noted only so the
"only two variables" statement is exactly true.

The service-role key appears in exactly one place — `supabase/functions/delete-teacher/index.ts:44`,
read via `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` inside a server-side Edge Function.
That is the correct place for it.

---

## 2. Row-level security — every table is protected

**Asked:** check RLS on every table holding student data and report exactly which are
unprotected.

**Answer: none are unprotected.** All 10 tables in the live `public` schema have RLS
enabled and at least one policy:

| Table | RLS | Policies | Holds data about a child? |
|---|---|---|---|
| `students` | on | 2 | **yes** — name, code, teacher notes |
| `student_lesson_progress` | on | 3 | **yes** — per-lesson performance |
| `progress_events` | on | 3 | **yes** — every attempt, score, time |
| `exercise_attempt_summary` | on | 3 | **yes** — per-exercise accuracy |
| `assignment_progress` | on | 2 | **yes** — assignment completion |
| `assignments` | on | 1 | indirectly |
| `folder_assignments` | on | 1 | indirectly |
| `classes` | on | 2 | join code, class name |
| `profiles` | on | 4 | teacher (adult) name + email |
| `user_roles` | on | 1 | teacher roles |

The policies themselves are well written — every one scopes to `auth.uid() = teacher_id`,
or an `EXISTS` join proving the teacher owns the class the row belongs to, or
`has_role(auth.uid(), 'admin')`. **No policy uses `using (true)`.** Verified live that a
direct table read as an anonymous caller is refused:

```
GET /rest/v1/students?select=display_name
→ {"code":"42501","message":"permission denied for function has_role"}
```

**I loosened nothing, and I recommend loosening nothing.** The RLS layer is not the problem.

---

## 3. BLOCKER — the student lane bypasses RLS, and leaks the credential that gates it

RLS only governs direct table access. The student lane does not use it. Children cannot
sign in — they are 4 to 7 years old — so the app reaches student data through eight
`SECURITY DEFINER` functions, which run as their owner and **bypass RLS by design**. All
eight are executable by the `anon` role, i.e. by anyone on the internet with the
publishable key, which is in the bundle:

`list_class_students` · `enter_class_as_student` · `join_class` · `get_student_progress` ·
`get_student_assignments` · `get_student_folder_assignments` · `log_student_progress` ·
`save_last_page`

That is a defensible design for non-reading children. The defect is in one function.

### The chain, verified live against the real database

**Step 1 — `list_class_students(p_join_code)` takes a join code and nothing else.**
It returns every child in the class:

```
POST /rest/v1/rpc/list_class_students  {"p_join_code":"GRETEL"}
→ 4 records, fields: ['student_id', 'display_name']
```

Four real children's names, to an anonymous caller. This is intentional — it draws the
"tap your name" login list — but it means a join code alone is enough to enumerate a class.

**Step 2 — `enter_class_as_student(p_join_code, p_student_id)` returns the child's
`student_code` without ever asking for it.**

```
POST /rest/v1/rpc/enter_class_as_student  {"p_join_code":"GRETEL","p_student_id":"<from step 1>"}
→ fields: ['student_id','student_name','student_code','class_id','class_name']
→ student_code leaked to anonymous caller: YES
```

**This is the actual defect.** Its sibling `join_class(p_join_code, p_student_code)`
requires the code and checks it. `enter_class_as_student` substitutes `p_student_id` —
which step 1 just handed out for free — and returns the secret as output. The
`student_code` is therefore not a credential at all; it is derivable by anyone holding the
class join code.

**Step 3 — with that code, the whole record opens.**

```
POST /rest/v1/rpc/get_student_progress  {"p_student_id":"…","p_student_code":"<leaked>"}
→ keys: ['class','events','student','lessonProgress']
```

Every other student RPC takes the same `(student_id, student_code)` pair, so the same
leaked code also permits **writes** — `log_student_progress` and `save_last_page` let an
attacker fabricate or corrupt a child's record.

**Net effect: one join code = read every child's name and full learning history in that
class, and write as any of them.** No login, no rate limit observed.

---

## 4. BLOCKER — the live join codes are dictionary words

Codes generated by the app are strong: `makeCode(6)` in `src/lib/teacher.functions.ts:89`
uses `crypto.getRandomValues` over a 32-character ambiguity-free alphabet — 32⁶ ≈ 1.07
billion combinations, and the code comment shows this was a deliberate hardening choice.

**But neither live class uses a generated code.** Both were created by the seed migration
`supabase/migrations/20260525033000_seed_cartilla_real_classroom_accounts.sql:55,58`, which
hard-codes `GRETEL` and `NOVO26`:

```
classes: 2   ·   classes with a dictionary code: 2   ·   codes not 6 chars: 0
```

`GRETEL` is the product's own name. Guessing it is not an attack, it is a first try — and
that is exactly how the chain in section 3 was verified. The 1-in-a-billion protection is
real for future classes and absent for every class that exists today.

These two hold **7 students and 6 teacher profiles**. Per
`20260525033000…sql:12-13` the roster is named individuals, not synthetic test data.

---

## 5. What personal data is stored, where, and for how long

**Retention answer, plainly: forever. There is no expiry anywhere.** No `pg_cron`
extension, no scheduled job, no trigger that deletes or ages out rows, and no retention
logic in the codebase. Every row written stays until someone removes it by hand.
*(Retention policy is the owner's decision — this is a statement of the current state, not
a recommendation.)*

### About a child

| Where | Field | What it is |
|---|---|---|
| `students` | `display_name` | The child's name as the teacher typed it |
| `students` | `student_code` | Their login code — see section 3 |
| `students` | `teacher_notes` | **Free text about a named child.** Nothing constrains what a teacher may write here |
| `students` | `archived_at` | Soft delete — "removing" a child hides them; the name stays in the table |
| `student_lesson_progress` | status, timings, best score, attempts, last page | Per-lesson performance |
| `progress_events` | lesson, event kind, score, total, time, `meta`, timestamp | One row per attempt; `get_student_progress` returns up to 1000 |
| `exercise_attempt_summary` | per-exercise hits/attempts | Which exercise types a child struggles with |
| `assignment_progress` | completion per assignment | — |

Current volume: **7 students, 8 progress events, oldest 2026-07-13, 0 archived, 0 with
teacher notes.**

Two fields deserve attention beyond their size:

- **`teacher_notes`** is unbounded free text attached to a named 4-to-7-year-old. Today it
  is empty everywhere. It is the field most likely to accumulate the most sensitive
  material in the system (a child's difficulties, diagnoses, home circumstances) with no
  schema, no purpose limit, and no retention rule.
- **`progress_events.meta`** is `z.record(z.string(), z.unknown())`
  (`src/lib/student.functions.ts:28`) — arbitrary JSON, accepted from the client, written
  through an anonymously-callable RPC. Whatever a caller puts there is stored against a
  child indefinitely.

### About a teacher (adult)

`profiles.full_name`, `profiles.email`, `user_roles.role`. Protected by RLS: self-read,
self-update, plus admin read. 6 profiles.

### Outside the database

- **Browser `localStorage`** — the Supabase auth session (`persistSession: true`,
  `src/integrations/supabase/client.ts`), plus demo-lane keys `cartilla.seed.teacher.v1`
  and `cartilla.seed.state.v1`. On a shared classroom device this persists until cleared.
- **CSV export** of class progress, downloaded to the teacher's machine. Outside the
  app's control once saved. `AGENTS.md` treats keeping it current as part of the safety
  net; it is also a copy of children's data living outside RLS.

---

## 6. Cleanup

- **`lesson_verifications` was never applied live.** `supabase/migrations/20260715140000_lesson_verifications.sql`
  creates it with RLS and 4 policies, but the table does not exist in the live database.
  Repo and database are out of step; whatever feature depends on it is not working live.
- **Leaked-password protection is off.** Confirmed by the security advisor. Already known
  and already mitigated in-app (`src/lib/password-strength.ts`) — Supabase gates the
  HaveIBeenPwned check behind the Pro plan. **No action proposed**; recorded only so the
  advisor output is fully accounted for.
- **The seeding function is properly locked down.** `seed_cartilla_classroom_for_teacher`
  has 0 grants to `anon`/`authenticated`/`PUBLIC` — the fix recorded in `STATUS.md` for
  #363 is confirmed still in place.
- `relforcerowsecurity` is `false` on all tables. Standard for Supabase (it only affects
  the table owner, who bypasses RLS anyway). Noted for completeness, not a gap.

---

## What I did not do

- **Changed nothing.** No policy, no migration, no function, no data. Findings 1 and 2
  touch authentication and real children's records, which `AGENTS.md` puts behind
  mandatory human sign-off, and the brief said report only.
- **Did not read children's records.** Only counts, field names, and schema.
- **Did not touch `otto-live`.**
- **Did not rate-limit-test.** Hammering the live API to measure how fast join codes could
  be enumerated would be a load test against a production database holding real children's
  data. The design flaw is demonstrated without it.

## Open questions only the owner can answer

1. Should `enter_class_as_student` stop returning `student_code`? It is the one change
   that breaks the chain, and it is an auth change needing your sign-off.
2. Should the two live classes be reissued generated join codes? This invalidates the
   codes currently in children's hands.
3. How long should a child's progress history be kept after they leave a class?
4. What is `teacher_notes` for, and what should teachers be told not to put in it?
