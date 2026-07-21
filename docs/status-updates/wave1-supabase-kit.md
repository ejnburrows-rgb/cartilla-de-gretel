# Wave 1 — Supabase go-live kit (issue #239)

Added `docs/SUPABASE-SETUP.md` (plain-language, non-technical setup guide) and `scripts/smoke-supabase.mjs` (a one-command connection check, wired as `pnpm smoke:supabase`).

Proof (both runs):

```
$ pnpm smoke:supabase            # no env vars
[smoke] Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. See docs/SUPABASE-SETUP.md.
[smoke] (This is fine: public reading mode works without Supabase.)
exit=0

$ VITE_SUPABASE_URL=https://fake-project.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=fake pnpm smoke:supabase
[smoke] Supabase configured. Checking connection to fake-project.supabase.co ...
[smoke] FAIL — connected but the query was rejected: TypeError: fetch failed
exit=1
```

`pnpm typecheck` and `pnpm build` pass. Implemented directly (the assigned background agent generated code but could not push its branch to GitHub).
