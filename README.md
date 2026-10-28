# La Cartilla de Gretel

> **LATEST OWNER EXECUTION / PROVISIONAL APPROVAL — October 28, 2026.** Owner: “Go ahead and approve everything for now until you finish. Then anything that I want to change, I will change.” Treat remaining routine visual and implementation decisions within the existing Cartilla completion scope as provisionally approved, including the shown Lesson 3 direction (card E); A–D are already accepted. Continue material work without returning routine approval cards or making the owner repeatedly say continue. Keep versioned proof and present the assembled result for later changes. Preserve explicit rejections, authentic workbook/art/voice decisions, existing assignments and destructive/security/cost holds; this does not authorize new services or reviewer access, bypass protected-main review, or authorize production deployment. Merge/release authorization remains separately scoped.


> **OWNER OVERRIDE — October 28, 2026: controller ownership.** ChatGPT/Codex in the owner's current Cartilla conversation is the primary controller and single owner-facing entry point. Muse is a supporting source of history and records, not an independent controller or dispatcher. This supersedes all older Muse-only, Muse/Instinct dual-controller, and owner-carried prompt-routing instructions, including the October 13 controller allocation.
>
> Use the existing October 28 Cartilla Master Completion Plan; prioritize independent review and authorized integration of delivered fixes before new coding. Recover existing assignments and proof; do not duplicate work, reopen resolved issues, launch a new audit, or rebuild the workflow. Codex retains artwork ownership; Jules and other existing specialists retain their assigned work until the controller reconciles ownership. No new infrastructure or automatic schedules are authorized.
>
> The controller handles technical coordination through available tools. Report one concise dashboard: finished, confirmed active now, blocked, next, and owner decisions; distinguish verified evidence from reported status and development from production. Never imply background execution without confirmation. If access truly blocks progress, state the exact blocker and the single necessary owner action. Preserve source/workbook fidelity, existing approvals, independent review and branch protection. Merges require applicable exact-change owner authorization; deployment requires explicit owner authorization. No self-approval or bypass. Preserve all existing art, voice, privacy, security and spending gates.


Digital classroom edition of *La Cartilla de Gretel* by Leonor Lopetegui.

## Artwork evidence (October 14, 2026)

The source-faithful image availability reconciliation lives in [PR #751](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/751) (still a **draft**, not `main`) and its [current master mapping](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/docs/proofs/artwork-coverage-2026-10-14/MASTER-MAPPING.md). Existing evidence covers 201 drawing groups/330 placements: 90 groups with a faithful optimized master, 108 needing optimization, 3 unresolved frontmatter composites. These are not production approval or runtime integration. See `AGENTS.md` for precedence and do not restart the four completed audits. The `PEZ`-named source IDs in group `DRAW-WB-10-1` **depict an airplane**, not a fish.

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
