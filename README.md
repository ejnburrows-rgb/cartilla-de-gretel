# La Cartilla de Gretel

Digital classroom edition of *La Cartilla de Gretel* by Leonor Lopetegui.

## Source of truth

- `main` is the only production source of truth.
- Vite + React + TypeScript + TanStack Router + Supabase.
- Production host: Vercel.
- Git contains only production code and small assets actually required by the app.

Large archival workbook scans, flipchart masters, proof files, screenshots, crop sources, restoration work, and agent scratch are not stored in active Git history. Runtime fallbacks for the original workbook PDF and scan families are served from the immutable production asset snapshot configured in `vercel.json`.

## Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Verify

```bash
pnpm build
```

The build runs TypeScript checks, unit tests, and the Vite production build.

## Environment

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

No paid AI API is required.

## Repository hygiene

Do not recommit raw scans, restoration outputs, proof PDFs, screenshots, temporary crops, generated delivery derivatives, or agent scratch folders.
