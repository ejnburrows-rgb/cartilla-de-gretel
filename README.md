# La Cartilla de Gretel

Digital classroom edition of *La Cartilla de Gretel* by Leonor Lopetegui.

## Source of truth

- `main` is the production code source of truth.
- `AGENTS.md` governs execution, safety, Git, and deployment.
- `PROJECT_FINISH_DEFINITION.md` is the canonical owner-locked definition of what must be true before the entire project can be called finished.
- `PROJECT_SOURCE_OF_TRUTH.md` is the canonical current product state, priorities, active scope, and major owner decisions.
- `CARTILLA_DIGITAL_DIRECTIVE.md` is the canonical Cartilla fidelity and presentation directive.
- `ASSET_FIDELITY_POLICY.md` is the active artwork, image, verified color-transfer, and motion rule.
- `STUDENT_INTERACTION_STANDARD.md` is the canonical premium Workbook interaction/motion standard.
- `repo.md` is the authoritative method when scenic background generation is explicitly approved; it is not a requirement to render scenic backgrounds on every page.
- Authoritative book sources are the owner's originals in:
  `Google Drive > Cartilla Production Hub > 01 Source Documents`
  - `La Cartilla de Gretel Flip Chart.pdf`
  - `Libro del alumno - Rescan and Optimize (2).pdf`
- Structure and content follow the matching source book page.
- Presentation is modern digital and responsive, as defined by the digital directive.
- The Student Workbook uses a clean digital canvas for dense learner exercises; full scenic wallpaper is reserved from those surfaces. The teacher Flip Chart may retain richer source-appropriate scenery.
- Approved/cropped book images are source-locked: do not regenerate, redraw, replace, or change geometry/content. Verified source-preserving color transfer is allowed under `ASSET_FIDELITY_POLICY.md`; scenic backgrounds are a separate, explicitly approved background-only exception under `repo.md`.
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
