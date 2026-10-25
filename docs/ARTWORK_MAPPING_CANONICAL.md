# CANONICAL ARTWORK-TO-SLOT MAPPING

**The artwork-to-slot mapping is `docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv`.**

- The existing stable placement and drawing-group identities are preserved. See the generated companion view for totals; do not maintain another count here. Acceptance of the mapping does not approve each candidate image.
- Generated human-readable view (never edit independently): `docs/artwork-reconciliation/mapping/MASTER-MAPPING.md` (grouped by drawing identity, with original and selected-master links).
- Full supporting evidence: `docs/proofs/artwork-coverage-2026-10-14/` (availability inventory, page register, galleries, verification results).

## Rules for every agent — read this before any artwork task

1. **Do NOT ask the owner to re-map artwork.** The mapping exists. It is final. It has been done.
2. **Do NOT regenerate, reinvent, or re-derive the mapping.** Use `MASTER-MAPPING.csv` as-is.
3. Blank or unresolved fields in the CSV are **intentional** — not every slot has a verified image yet. Never fill them with guesses.
4. Optimization (color quality, detail fidelity, cleanup) of source-referenced groups is allowed. Redrawing (changing shapes, subjects, composition) is banned.
5. The 172 "PENDING NO VERIFIED SOURCE" slots from the 2026-10-08 classification audit are resolved by this mapping where sources were found. Where the CSV still shows no verified source, the slot stays restricted — no invented artwork.

## One current authority everywhere — owner instruction, October 25, 2026

- The CSV on `main` is the sole editable artwork-to-slot mapping. Branches and PRs are proposed changes until integrated. Historical inventories, ZIPs, screenshots and audit reports are evidence, never another current master.
- Generate the readable mapping with `pnpm artwork:mapping:update`. `pnpm artwork:mapping:check` rejects drift and obsolete active routing; asset verification and release builds run this check.
- The CSV's existing availability and destination fields describe historical candidates. They do not certify the latest approved master. Do not overwrite current production from those old candidate paths.
- Each illustration must use its one latest explicitly approved master across all placements, with traceable necessary derivatives. Changes to a master require checking all stills, animations, delivery sizes and fallbacks. Different original drawings of the same named subject remain distinct drawing groups.
- Approval requires an exact owner decision and asset identity; runtime correctness requires proof from the real served page. Preserve unknowns. Never invent approval, promote READY into approval or mark inaccessible evidence as missing.
- Current runtime files and approval evidence must be reconciled into the existing machine record before claiming universal application enforcement. This routing/view check does not by itself verify images or deployed behavior.
