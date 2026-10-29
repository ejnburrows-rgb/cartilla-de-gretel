# La Cartilla de Gretel

> **Execution policy:** [AGENTS.md](AGENTS.md). **Current assignments/status:** [GitHub #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877). Historical directives below are context, not independent controller instructions.

Digital classroom edition of *La Cartilla de Gretel* by Leonor Lopetegui.

## Artwork evidence (October 14, 2026)

Historical artwork reconciliation is preserved in [PR #751](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/751) (**closed, unmerged**); current accepted source repairs were integrated through [PR #1205](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1205). Do not treat the older PR as a current artwork inventory. Its historical source record and its [current master mapping](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/MASTER-MAPPING.md). Existing evidence covers 201 drawing groups/330 placements: 90 groups with a faithful optimized master, 108 needing optimization, 3 unresolved frontmatter composites. These are not production approval or runtime integration. See `AGENTS.md` for precedence and do not restart the four completed audits. The `PEZ`-named source IDs in group `DRAW-WB-10-1` **depict an airplane**, not a fish.

## Source of truth

`AGENTS.md` defines the complete active instruction hierarchy; follow that hierarchy.

Repository/runtime state is interpreted as follows:
- `main` = the current repository source tree.
- live Vercel = deployed/runtime truth and must be checked directly when deployment state matters.
- an open PR = candidate state, not current `main` and not deployed truth.
- never assume current `main` equals what is currently deployed.

The authoritative physical Student Workbook and teacher Flip Chart PDFs remain the source authority for curriculum, wording, page structure, and source fidelity.

## Commands

General/controller development may use `pnpm dev`; production/release verification may use `pnpm build` and `pnpm verify:release`. These commands can invoke production-art preparation and are **not ordinary implementation-worker commands**.

Ordinary implementation workers use targeted tests/checks, `pnpm typecheck` when relevant, `pnpm verify:worker` when broader non-mutating verification is useful, and `pnpm dev:worker` for browser/runtime work. Follow the worker command boundary in `AGENTS.md`.

```bash
pnpm install --frozen-lockfile
pnpm dev:worker
```

## Environment

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

No paid AI API is required.

## Repository hygiene

Historical directives live under `docs/archive/directives/` and are not active instructions.
Do not recommit raw scans, restoration outputs, proof PDFs, screenshots, temporary crops, generated delivery derivatives, or agent scratch folders.
