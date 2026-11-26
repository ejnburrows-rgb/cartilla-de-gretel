# Bounded local evidence-helper repair

Owner: Codex integration. Based on candidate `4d73acf7647d04f4f02a4cf2cef4acae8dc14025`; source-only documentation delta parent `577b12d1bb5ead1dd44868e583d6bd1ad3e90c5f`.

The four helpers identified in the eleven inline security comments now constrain their local CLI authority. This changes neither the application nor artwork bytes. Historical evidence remains tied to its original helper revision.

- Both reporting helpers require a full forty-character hexadecimal commit before invoking Git, and use `git show --end-of-options`.
- Python helpers accept only the checkout containing the helper. Reports must remain beneath this continuation directory, reject redirected destinations, and use exclusive creation rather than overwrite.
- Restoration preflights both fixed asset destinations and its report before writing. It refuses an existing report and refuses PNG/WebP bytes that differ from the reviewed pre-restoration commit. The restoration was **not executed**: accepted restored artwork must remain unchanged.
- Git is explicitly selected by absolute `--git-executable` (Python) or `GIT_EXECUTABLE` (runtime). The selected file must exist and have the Git basename. This removes implicit PATH lookup; it does not certify the operator-selected binary's signature or integrity.
- The runtime helper rejects redirected evidence ancestry and existing `runtime-new` output. Its old accepted `runtime/` evidence is preserved.

## Focused verification

Eight boundary regressions passed, zero skipped: exact/invalid commit IDs; unrelated checkout rejection; explicit Git path; outside-directory and overwrite rejection; an actual Windows junction redirect; both reporting CLIs rejecting an option-shaped head before opening the PDF; restoration refusing an unrelated repository without writes; runtime refusing PATH-based Git before creating output or opening a browser. Python compilation and JavaScript syntax checks passed. No production artwork mutation or recapture was performed.

Run `test-evidence-cli-guard.py` with an absolute `GIT_EXECUTABLE` and `EVIDENCE_TEST_REDIRECT` pointing to a prepared junction/symlink beneath this continuation directory. Its target must be outside the continuation directory. The fixture is created and removed by the operator; the test never deletes a caller-selected tree. Raw output is in `helper-guard-tests.txt`.

Anti-Churn decide/accept/verify recorded passing evidence (`b11ab132d33f8baf6b7f28db29f421be3785b5aa99f10dce46be2ee2e39b0bda`). The receipt used parent prefix `577b12d1`; the exact parent is recorded above and the committed helper diff establishes the tested change. This is bounded CLI verification, not a whole-application security clearance.

Example new report invocation: `python lesson4-source-provenance.py --pdf ORIGINAL.pdf --repo CHECKOUT --head FULL_SHA --output CHECKOUT/docs/proofs/m7-m8-m9-verification/continuation/new-report.json --git-executable ABSOLUTE_GIT_PATH`. The parent directory must already exist, and the report filename must be new. Inputs remain trusted local operator choices. Concurrent hostile filesystem replacement and hostile PDF decoding are outside this patch's demonstrated guarantees.

Status: **DONE but not live** for these local guards, pending independent affected-delta review. Review discussions are not automatically resolved or dismissed. Performance, source/placement, formal-review and release gates remain separate.
