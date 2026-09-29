# La Cartilla de Gretel

Digital classroom edition of *La Cartilla de Gretel* by Leonor Lopetegui.

## Source of truth

- `main` is the production code source of truth.
- **Book appearance is governed by `CARTILLA_SOURCE_OF_TRUTH.md` and the two
  authoritative PDFs in `Google Drive > Cartilla Production Hub > 01 Source Documents`:**
  - `La Cartilla de Gretel Flip Chart.pdf`
  - `Libro del alumno - Rescan and Optimize (2).pdf`
- The digital Flip Chart must look like the source Flip Chart page-for-page.
- The digital student Workbook must look like the source Workbook page-for-page.
- Approved/cropped book images are locked pixels: placement only, no
  regeneration/recoloring/remastering/recropping.
- Vite + React + TypeScript + TanStack Router + Supabase.
- Production host: Vercel.
- Git contains production code and the small assets actually required by the app.


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
