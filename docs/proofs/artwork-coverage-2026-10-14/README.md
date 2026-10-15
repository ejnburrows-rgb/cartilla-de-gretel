# Artwork reconciliation — current state, not production approval

**Primary current evidence:** [MASTER-MAPPING.md](MASTER-MAPPING.md), [MASTER-MAPPING.csv](MASTER-MAPPING.csv) (330 placements), [availability-inventory.json](availability-inventory.json) (201 groups, candidate provenance), [illustrated inventory](availability-inventory.md), and [source originals needing optimization](missing-originals.md). The retained 2026-10-14 PR #751 baseline is commit `9525e06`; newer commits on this evidence branch must be checked before citing it as current.

**Availability totals:** 90 READY groups / 186 placements, 108 NEEDS OPTIMIZATION groups / 141 placements, 3 UNRESOLVED frontmatter composites / 3 placements; 201 groups and 330 placements. Those classifications are NOT proof of owner approval or successful runtime integration. Eight selected candidates reside only in owner-local archives; 71 READY placements lack an individual exact selected file.

**Identity warning:** `DRAW-WB-10-1` depicts an **airplane (avión)**, proved by actual source and selected images. Its five `PEZ` placement IDs and crop filenames are misleading legacy labels; do not reinterpret the drawing as fish or rename the IDs. See [source](crops/WB-S019-OBJ02-PEZ.png).

**Unresolved:** `FC-FRONT-001`, `WB-FRONT-001`, `WB-FRONT-003` (component boundaries); 50 withheld hashes cannot be mapped to individual artwork without bytes/filenames. Do not fabricate matches, repeat the four completed audits, treat source crops as optimized masters, or alter approved production art.

**Historic evidence retained, not new work:** [drawing-inventory.json](drawing-inventory.json), [classification-inventory.md](classification-inventory.md), [coverage-manifest.json](coverage-manifest.json), [gallery.md](gallery.md), [source pages](source-pages.html), [decoded candidate library](asset-library.html), and [SVG hash proof](svg-hash-domains.json). Those supporting snapshots preserve forensic traceability but no longer set today's availability status.

**Verification:** [validate-availability.py](validate-availability.py) checks record coverage, representative references and hash-backed original crop provenance. This is a mapping checkpoint, not a claim that all optimization, approvals or release tests passed.
