# Owner-authored deploy trigger

This file intentionally triggers deployment from the repository owner account when needed.

Latest automation commit includes:

- Production GitHub Actions workflow for verify → Supabase migrations → Vercel deploy.
- Supabase real classroom seed path.
- Production-oriented CRM wording and product navigation cleanup.

Expected production behavior after deployment:

- Public workbook access remains available.
- Teacher CRM can use Supabase when env vars are configured.
- Supabase migrations can be applied from GitHub Actions.
- Vercel can deploy production from GitHub Actions.
- Preconfigured local accounts remain fallback only when Supabase is not configured.

Created: 2026-05-25T04:20:00Z
