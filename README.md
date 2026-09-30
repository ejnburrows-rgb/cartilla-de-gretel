# La Cartilla de Gretel

Digital classroom edition of *La Cartilla de Gretel* by Leonor Lopetegui.

## Source of truth

- `main` is the production code source of truth.
- **Book appearance is governed by `PROJECT_SOURCE_OF_TRUTH.md` and the two
  authoritative PDFs in `Google Drive > Cartilla Production Hub > 01 Source Documents`:**
  - `La Cartilla de Gretel Flip Chart.pdf`
  - `Libro del alumno - Rescan and Optimize (2).pdf`
- The digital Flip Chart must preserve the source Flip Chart's instructional structure and content with a premium digital presentation.
- The digital student Workbook must preserve the source Workbook's instructional structure and content with screen-native interaction.
- Artwork follows `ASSET_FIDELITY_POLICY.md`: approved art is preserved; faithful technical cleanup and approved motion are allowed.
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
