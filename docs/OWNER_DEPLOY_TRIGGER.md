# Owner-authored deploy trigger

This file intentionally triggers deployment from the repository owner account when needed.

Deadline rollout checkpoint:

- Launch Cockpit added on `/cartilla`.
- Production GitHub Actions workflow added for verify → Supabase migrations → Vercel deploy.
- Supabase real classroom seed path added.
- Production-oriented CRM wording and product navigation cleanup added.

Latest expected production commit after this trigger:

```text
5d346c69a0715d78ec1066e5be43779a024aab94
```

Expected production behavior after deployment:

- Public workbook access remains available.
- `/cartilla` shows the Launch Cockpit / Centro de lanzamiento.
- Teacher CRM can use Supabase when env vars are configured.
- Supabase migrations can be applied from GitHub Actions.
- Vercel can deploy production from GitHub Actions.
- Preconfigured local accounts remain fallback only when Supabase is not configured.

Created: 2026-05-25T04:31:00Z
