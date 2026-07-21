# Getting the Teacher & Student Cloud Working (Supabase Setup)

This is a plain-language, step-by-step guide. Every technical term is
explained in parentheses the first time it appears. You do not need to be a
programmer to follow it.

## What this is and why you need it

The app has two modes:

- **Public reading mode** — the 24 lessons and the digital book work for
  anyone, with no setup at all. (In code this is why `isSupabaseConfigured`
  can be false and the app still runs — see
  `src/integrations/supabase/client.ts`.)
- **Teacher & student accounts** — logging in, creating classes, join codes,
  and saving each child's progress. This part needs a cloud backend
  ("backend" = the server + database that stores accounts and progress).

The backend this project uses is **Supabase** (a hosted service that gives
you a database plus login/security, https://supabase.com). Until you connect
a Supabase project, everything account-related is switched off. This guide
connects it.

You will do three things: (1) create a Supabase project, (2) give the app its
two connection values, (3) load the database structure. Then you verify it.

---

## Step 1 — Create a free Supabase project

1. Go to https://supabase.com and click **Start your project** / **Sign in**
   (you can sign in with GitHub or an email).
2. Click **New project**.
3. Give it a name (for example, `cartilla-de-gretel`), and set a **database
   password** ("database password" = a password that protects the data store;
   save it somewhere safe — you will rarely need it, but you cannot recover it
   later).
4. Pick the region closest to your users and click **Create new project**.
   Wait a minute or two while it sets up.

---

## Step 2 — Get the two values the app needs

The app needs exactly two values (their exact names are in the file
`.env.example` in this project):

- `VITE_SUPABASE_URL` — your project's web address.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the **public** key (also called the
  "anon"/"publishable" key). "Public key" = a value that is safe to ship in a
  web app; it does not give admin access on its own because the database's
  security rules still apply.

To find them in Supabase:

1. In your project, open **Project Settings** (the gear icon) → **API**.
2. Copy the **Project URL** → this is `VITE_SUPABASE_URL`.
3. Copy the **anon / public** key (labeled "publishable") → this is
   `VITE_SUPABASE_PUBLISHABLE_KEY`.

> Do NOT copy the "service_role" key. That one is a secret admin key and must
> never go into a website or into this project.

### Put the values in two places

**A) On your computer, for local testing** — create a file named `.env`
("dot env" = a file that holds settings/secrets, kept out of the code) in the
project's top folder, containing:

```
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_PUBLISHABLE_KEY"
```

This file is already ignored by git (the project's `.gitignore` lists
`.env*`), so your values will not be uploaded to GitHub. Never paste real
keys into any other file.

**B) On Vercel, for the live site** — Vercel is the host that serves the live
site. Open your project on https://vercel.com → **Settings** →
**Environment Variables**, and add the same two names and values there. Then
redeploy so the live site picks them up.

---

## Step 3 — Load the database structure (apply the migrations)

The database needs its tables and security rules created. These are defined
as "migration" files (a **migration** = a script that builds/updates the
database structure) in this project under `supabase/migrations/`. As of this
writing they are:

```
20260515162221_...sql
20260515162238_...sql
20260515165609_...sql
20260515215000_platform_hardening_and_progress_tables.sql
20260515230000_static_vercel_student_rpc.sql
20260525033000_seed_cartilla_real_classroom_accounts.sql
20260709191308_class_code_tap_name_login.sql
20260710132007_folder_assignments.sql
20260712050853_crm_completion_additive_schema.sql
20260713205500_confirm_bootstrap_teacher_login.sql
20260715140000_lesson_verifications.sql
```

You have two easy ways to apply them:

- **Simplest (copy/paste):** In Supabase, open the **SQL Editor**, then open
  each migration file from `supabase/migrations/` in order (oldest date
  first), paste its contents, and click **Run**. Do them in filename order so
  later ones build on earlier ones.
- **Command line (if you use it):** install the Supabase CLI
  (command-line tool) and run `supabase db push` linked to your project. If
  you are non-technical, use the copy/paste method above.

> Important: this is the first time these migrations run against a real
> database. Treat it as a real first run — do them in order, and if one
> errors, stop and read the error before continuing.

---

## Step 4 — Verify it works

From the project folder, run:

```
pnpm smoke:supabase
```

- If you have NOT set the values yet, it prints a friendly "not configured"
  note and stops. That is expected before Step 2.
- Once the values are set and the migrations are applied, it connects and
  reads the `classes` table, then prints a **PASS** line. That means the
  backend is live.
- If it prints a **FAIL** line, read the message — it will say whether the
  key was rejected or the tables are missing.

Then open the app, go to the teacher login, and confirm you can sign in and
create a class.

---

## If it doesn't work

- **"not configured" keeps showing** → the `.env` file is missing, misnamed
  (it must be exactly `.env`), or in the wrong folder (it goes in the
  project's top folder). On the live site, the values must be set in Vercel
  and the site redeployed.
- **FAIL: query rejected / table not found** → the migrations in Step 3 were
  not applied (or not all of them). Re-run them in order.
- **FAIL: wrong key** → double-check you copied the **anon/publishable** key,
  not the service_role key, and that there are no extra spaces.
- **Login works locally but not on the live site** → the two values were set
  locally but not in Vercel; add them in Vercel and redeploy.
