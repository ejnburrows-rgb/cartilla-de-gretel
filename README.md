# La Cartilla de Gretel

A digital literacy program and classroom platform for *La Cartilla de Gretel*, the Spanish early-literacy workbook by Leonor Lopetegui. It pairs a faithful digital workbook for students with a teacher dashboard for managing classes, assignments, and progress.

## What is it?

La Cartilla de Gretel provides a complete suite for teaching early Spanish literacy:

- **Student Reader:** A digital, interactive 24-lesson workbook following the original book's vowel and consonant order, with engaging activities.
- **Teacher Flipchart:** A presentation-friendly digital flipchart allowing teachers to project lessons at the front of the classroom.
- **Teacher CRM:** A powerful dashboard for managing classes, generating join codes for students, assigning activities, and tracking student progress over time.

## Project Structure Overview

- `src/components/` - React components for the UI, including the student reader (`cartilla/`), teacher CRM (`teacher/`), and games (`games/`).
- `src/features/` - Core feature logic, like the Teacher CRM.
- `src/routes/` - TanStack Router page definitions for both student and teacher views.
- `src/content/` - Lesson definitions, guides, word banks, and metadata.
- `src/lib/` - Utility functions, state management, and core business logic (e.g., student progress, text-to-speech).
- `docs/` - Documentation files, including the Quick Start Guide for teachers.
- `public/` - Static assets, images, and audio files.

## Running Locally

Ensure you have Node.js and `pnpm` installed.

### Install dependencies
```bash
pnpm install
```

### Start the development server
```bash
pnpm run dev
```

### Run tests
```bash
pnpm test
# or
npx vitest run
```

### Build for production
```bash
pnpm run build
```

To preview the built app locally:
```bash
pnpm run preview
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

- Build command: `pnpm run build`
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
