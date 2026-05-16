# Cartilla de Gretel Direct Build Report

Generated: 2026-05-15

## Result

This package has been converted away from the Lovable/TanStack Start deployment path into a standard Vite + React + TanStack Router static application. It is Vercel-friendly and uses `dist/` as its output directory.

Verified commands:

```bash
npm install
npm run format
npx tsc --noEmit
npm run lint
npm audit --omit=dev
npm run build
npm run preview -- --port 4178
```

## Smoke test results

All checked routes returned HTTP 200 from the local production preview server:

- `/`
- `/book`
- `/book/book.pdf`
- `/cartilla`
- `/cartilla/lecciones`
- `/cartilla/practica`
- `/cartilla/unirse`
- `/cartilla/mi-progreso`
- `/login`
- `/cartilla/teacher`
- `/cartilla/teacher/branding`
- `/cartilla/leccion/1`

## Direct-platform changes

- Removed the Lovable/TanStack Start SSR dependency path.
- Removed unused EPUB-specific reader dependencies and stale download assets.
- Kept the platform as a static Vite app with SPA rewrites in `vercel.json`.
- Kept the teacher/student Supabase platform layer, but made public reading and lesson pages work even before Supabase environment variables are set.
- Kept the official PDF at `public/book/book.pdf`.
- Added TypeScript-safe Supabase RPC definitions.
- Confirmed TypeScript passes with `npx tsc --noEmit`.
- Confirmed ESLint has no errors; remaining output is warnings only from shadcn-style component exports and hook dependency notes.
- Confirmed `npm audit --omit=dev` returns zero vulnerabilities.

## Vercel settings

Use:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Required for teacher/student cloud features:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Public reader and interactive local lessons will load without those variables. Teacher login, class creation, join codes, and cloud progress require Supabase.

## Remaining warnings

Vite reports a large main chunk and a PDF viewer chunk. This is expected because the project includes a 94-page PDF reader and classroom UI. It does not block deployment.
