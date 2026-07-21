# OWNER-MANUAL-STEPS — La Cartilla de Gretel

These are the steps **only you (the owner) can do** — they need accounts,
secrets, or creative decisions that no coding agent can make. The autonomous
loop (`LOOP-CLAUDE.md`) deliberately skips everything on this page. Nothing here
is code an agent can write; each item is an account, a key, a button in a
dashboard, or a decision.

Plain-language note: "environment variable" = a setting kept outside the code so
secrets never live in the repo. "Migration" = the one-time script that builds the
database tables.

---

## 1. Turn on the real database (the single biggest blocker)

The teacher and student cloud features (sign-in, classes, join codes, saving a
child's progress) are fully written but have **never run against a real
database**. To turn them on:

1. Create (or open) the project's Supabase project in the Supabase dashboard.
2. Copy its **Project URL** and **publishable (anon) key**.
3. Put them in the app's hosting environment (Vercel → Project → Settings →
   Environment Variables) as:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Apply the database migration for the first time (the SQL in
   `supabase/migrations/`). Treat this as a real first-time run, not a formality.
5. Verify: run `pnpm smoke:supabase` — it should reach the `classes` table
   without printing any key. Then sign in as a real teacher on the live site.

Until this is done, the teacher side only works through the non-production demo
lane (seed teacher `leonore` / `Cartilla2026!`), which cannot save real data.

## 2. Decisions an agent cannot make for you

- **Welcome splash (#243):** approve the direction (Gretel alone on existing
  approved art — no animal crowd, no newly commissioned painting), or commission
  one small new painting in the same hand as `gretel-authentic.jpg`. Held until
  you sign off.
- **Admin cross-teacher dashboard:** confirm whether you still want it before any
  build work is scoped. It is genuinely unbuilt today.
- **Coloring the grayscale art** (`abrigo`, `aguja`, `remolino`, and `oruga` /
  `globo` which have no clean source): agents are forbidden to invent or AI-color
  art. If you want these pictures, supply a colored scan from the physical book;
  otherwise they correctly stay "pendiente".

## 3. GitHub housekeeping (needs the GitHub web UI)

- **Delete the ghost `BuildFailed` CI workflow** — it fails on every commit
  (including `main`) but has no matching file in `.github/workflows/`. Remove it
  from the GitHub Actions UI.
- **Delete two already-merged branches** the automated environment can't remove
  (returns 403): `claude/finish-app-batch1` and `claude/page-layout-art-gap`.
- **(Optional) Grant Jules push access.** Jules can draft code but currently
  can't push branches here, so the loop runs on Claude Code instead. If you want
  Jules in the loop, grant its GitHub app push access in the repo's GitHub App
  settings.

## 4. Nice-to-have, owner-supervised (kept OUT of the autonomous loop)

- **Lint debt (#245, ~362 problems):** a single careful, behavior-preserving pass
  — no blanket auto-fix. Left out of the autonomous loop on purpose so an agent
  doesn't silently change behavior across hundreds of edits. Run it with a human
  reviewing the diff.
