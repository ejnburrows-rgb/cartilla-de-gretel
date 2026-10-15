# Production integration gate: NOT PASSED

Authoritative coverage input: [`c03dadfa80967e89fa716db664fb305c6617ae9b`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/c03dadfa80967e89fa716db664fb305c6617ae9b/docs/proofs/artwork-coverage-2026-10-14/coverage-manifest.json). This is the committed coverage checkpoint available for Agent 1's input; it is not a completed unique-illustration inventory.

All 330 provisional placement IDs have **NEEDS REVIEW** status. None has verified approval provenance. No record is certified MISSING OPTIMIZATION. Consequently no artwork is eligible for integration or a missing-art gallery under the required evidence standard.

[Machine-readable gate report](production-integration-gate.json) lists every affected ID, page, mapping proposal, evidence gap and corrective action. [Review comparison gallery](gallery.md) remains available; it is not a certified missing-art gallery.

| Required total | Verified result |
| --- | --- |
| Unique approved optimized illustrations certified by the input | 0 |
| Unique illustrations integrated and production verified by this work | 0 |
| Additional production placements updated through reuse | 0 |
| Unique illustrations certified as awaiting optimization | 0 |
| Unique illustrations requiring review | Unknown |
| Provisional placements requiring review | 330 |

The unique inventory is unresolved because repeated drawing identities and frontmatter components are not consolidated. Zero certifications do not establish that approved or missing artwork does not exist. Existing production artwork is not recertified by this report.

## Verification and remaining work

The committed verifier checks the two authoritative PDF SHA-256 values, every recorded crop hash, and the proposed GitHub candidate bytes at the coverage baseline and input commit. It also asserts that `src/`, `public/`, `scripts/` and `tests/` are unchanged between those revisions. Actual counts and results are in the JSON report.

Command executed from the repository:

```text
python docs/proofs/artwork-coverage-2026-10-14/integration-intake-verifier.py
```

On this Windows environment the command used the bundled Python executable. Initial execution stopped at an overly strict working-tree byte comparison: Git's Windows line-ending conversion makes committed JSON bytes differ from checked-out JSON bytes. The verifier was corrected to compare Git blob identity; source SHA-256 checks still compare actual source bytes.

No production mapping or artwork was changed. No integration commit or deployment is claimed. Asset validation and regression tests were not run: there is no eligible implementation change, and this sparse audit checkout is not a complete release environment. After approval evidence is established, run the existing `pnpm audit:art` and `pnpm verify:assets`, then relevant existing placement regressions.

The source check found another concrete evidence defect: 14 Workbook lesson-1 SVG candidate hashes in the input describe Windows CRLF checkout bytes, rather than GitHub's LF blob bytes. The first complete verification returned exit 1:

```json
{"source_integrity": false, "pdf_files_checked": 2, "crop_records_checked": 330, "production_candidate_files_checked": 239, "eligible_approved": 0, "verified_missing": 0, "gate": "NOT PASSED"}
```

The verifier now separately records both committed hashes, exact committed-byte continuity, and whether LF-to-CRLF conversion reproduces the manifest hash. The affected paths and artwork IDs appear in the gate JSON; no authoritative input hash is silently replaced. The next coverage revision must label these byte domains and add committed-file SHA-256 values. This diagnosis does not approve any drawing.

Corrected verification returned exit 0:

```json
{"source_integrity": true, "pdf_files_checked": 2, "crop_records_checked": 330, "production_candidate_files_checked": 239, "eligible_approved": 0, "verified_missing": 0, "gate": "NOT PASSED"}
```

This verifies unchanged sources and explains the byte-domain discrepancy. It does not pass the production integration gate.

No exact-revision production browser screenshots were captured. No missing-art gallery was created or browser-certified. These remain mandatory after eligible records exist; uploaded files, this report, and the existing review gallery do not fulfill those gates.

Corrective sequence: reconcile the drawing inventory and repeats; establish explicit exact-byte approvals; finish alternative-source examination and independent disputed/missing comparisons; freeze that corrected manifest at its GitHub commit; update eligible canonical mappings; validate and test; inspect actual workbook and flipchart pages at that same revision; capture identified page/viewport screenshots; browser-test the verified missing-art gallery; publish final reconciliation.
