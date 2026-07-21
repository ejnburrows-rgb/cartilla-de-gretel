# La Cartilla de Gretel

A digital edition and classroom platform for *La Cartilla de Gretel*, the Spanish early-literacy workbook by Leonor Lopetegui. It pairs a faithful digital workbook for students with a teacher dashboard for managing classes, assignments, and progress.

**Live:** https://cartilla-de-gretel.vercel.app

> **Working on this project (human or AI agent)? Read [`AGENTS.md`](AGENTS.md) first — it is the single source of truth for how we work here.** Current state of the work lives in [`docs/STATUS.md`](docs/STATUS.md).

## Features

- **Student workbook** — page-faithful lessons following the book's vowel and consonant order, with light interactive activities.
- **Teacher dashboard** — classes, students, join codes, assignments, and progress tracking.
- **Classroom view** — a presentation-friendly flip book for teaching at the front of the room.

### Status Highlights
- All 24 core lessons (vowels and consonants) are fully digitized with faithful layouts and interactive elements.
- The Teacher CRM includes a centralized curriculum catalog.
- Fully integrated with Supabase.

## Tech stack

- Vite + React + TypeScript
- TanStack Router
- Tailwind CSS
- Supabase (authentication and data)
- Deployed on Vercel

## Getting started

This project uses [pnpm](https://pnpm.io/) (a fast package manager).

```bash
pnpm install
pnpm dev
```

To build and preview a production bundle:

```bash
pnpm build
pnpm preview
```

New teacher? See the plain-Spanish quick-start: [`docs/GUIA-RAPIDA-DOCENTE.md`](docs/GUIA-RAPIDA-DOCENTE.md).

## Environment variables

The public reader and local lesson mode work without any configuration. Teacher accounts, classes, join codes, and cloud progress require Supabase:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Apply the SQL migrations in `supabase/migrations/` before using the teacher and student cloud features.

## Deployment

Deployed on Vercel using the Vite preset:

- Build command: `pnpm build`
- Output directory: `dist`

`vercel.json` handles single-page-app route rewrites.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The source content — workbook text, illustrations, and lesson order — is authored by the project owner and is not accepted via pull request.

## License

Released under the MIT License. See [LICENSE](LICENSE).

## Credits

- Author: Leonor Lopetegui
- Contributors: Aída Fernández, Silvia Diez
- Illustrator: Estela de Armas Plasencia
- Digital adaptation: Emilio José Novo
- Digital edition of La Cartilla de Gretel

## Command Center Automation

The `scripts/regenerate-command-center.js` script pulls live data from GitHub and Vercel APIs and injects it into `educrm-command-center.html` on every push to `main`. This is triggered by `.github/workflows/regenerate-command-center.yml`.

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | How to get it |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create token |
| `VERCEL_PROJECT_ID` | vercel.com → Project → Settings → General → Project ID |
| `VERCEL_TEAM_ID` | vercel.com → Team Settings → General → Team ID (only if using a team) |

`GITHUB_TOKEN` is provided automatically by GitHub Actions — no setup needed.

### What gets injected

- Latest commit hash and message
- Open PR count and list
- Branch list
- Latest Vercel deploy status and URL
- Timestamp of last regeneration

Data is embedded as a JSON comment block (`<!-- COMMAND-CENTER-DATA ... -->`) inside `educrm-command-center.html` and also written to `data-*` attributes on existing KPI elements if present.
