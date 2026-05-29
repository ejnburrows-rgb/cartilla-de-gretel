# La Cartilla de Gretel

A digital edition and classroom platform for *La Cartilla de Gretel*, the Spanish early-literacy workbook by Leonor Lopetegui. It pairs a faithful digital workbook for students with a teacher dashboard for managing classes, assignments, and progress.

**Live:** https://cartilla-de-gretel.vercel.app

## Features

- **Student workbook** — page-faithful lessons following the book's vowel and consonant order, with light interactive activities.
- **Teacher dashboard** — classes, students, join codes, assignments, and progress tracking.
- **Classroom view** — a presentation-friendly flip book for teaching at the front of the room.

## Tech stack

- Vite + React + TypeScript
- TanStack Router
- Tailwind CSS
- Supabase (authentication and data)
- Deployed on Vercel

## Getting started

```bash
npm install
npm run dev
```

To build and preview a production bundle:

```bash
npm run build
npm run preview
```

## Environment variables

The public reader and local lesson mode work without any configuration. Teacher accounts, classes, join codes, and cloud progress require Supabase:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Apply the SQL migrations in `supabase/migrations/` before using the teacher and student cloud features.

## Deployment

Deployed on Vercel using the Vite preset:

- Build command: `npm run build`
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
- Published by LANY Books LLC
