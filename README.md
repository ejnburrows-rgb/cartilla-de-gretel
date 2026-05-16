# La Cartilla de Gretel — Direct Vercel Build

This is a standard Vite + React + TanStack Router application. It is no longer tied to Lovable or TanStack Start SSR.

## Quick start

```bash
npm install
npm run build
npm run preview
```

Open the preview URL printed by Vite.

## Vercel deployment settings

Use these settings in Vercel:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

The included `vercel.json` handles SPA route rewrites and PDF caching.

## Supabase

The public reader and local interactive lesson mode work without Supabase.

Teacher accounts, classes, student join codes, assignments, and cloud progress require:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Apply the SQL migrations in `supabase/migrations/` before using the teacher/student cloud platform.

## Book file

The official PDF is included here:

```txt
public/book/book.pdf
```

Do not rename it unless you also update the reader path.
