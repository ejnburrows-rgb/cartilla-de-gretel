# La Cartilla de Gretel

Digital classroom edition of *La Cartilla de Gretel* by Leonor Lopetegui.

## Source of truth

- `main` is the production code source of truth.
- `AGENTS.md` governs execution, safety, Git, and deployment.
- `CARTILLA_DIGITAL_DIRECTIVE.md` is the canonical Cartilla fidelity and presentation directive.
- Authoritative book sources are the owner's originals in:
  `Google Drive > Cartilla Production Hub > 01 Source Documents`
  - `La Cartilla de Gretel Flip Chart.pdf`
  - `Libro del alumno - Rescan and Optimize (2).pdf`
- Structure and content follow the matching source book page.
- Presentation is modern digital and responsive, as defined by the digital directive.
- Approved/cropped book images are locked: do not regenerate, redraw, recolor, remaster, recrop, or substitute them.
- Vite + React + TypeScript + TanStack Router + Supabase.
- Production host: Vercel.

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

Historical directives live under `docs/archive/directives/` and are not active instructions.
Do not recommit raw scans, restoration outputs, proof PDFs, screenshots, temporary crops, generated delivery derivatives, or agent scratch folders.
