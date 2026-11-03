# Independent security continuation review

## Baseline and current scan

Reviewed baseline: `226991ec775c51592be859d30bb8ee978bfcda0d`. Reviewer: `independent_review`, review-only owner on `continuation/1247-review`; implementation belongs to root.

On 2026-11-03, direct GitHub API reads confirmed that this exact baseline has two failed checks: [SonarCloud 126088355045](https://github.com/ejnburrows-rgb/cartilla-de-gretel/runs/126088355045) reports four HIGH findings, and [Code Analysis 126088352483](https://github.com/ejnburrows-rgb/cartilla-de-gretel/runs/126088352483) reports New Code Security Rating C against required A. This supersedes the earlier analysis of `580e8ddb` and the historical no-current-check snapshot. Sonar remains advisory under AGENTS.md; a failed rating is not itself a product defect or authority to bypass a real defect.

All four alert APIs have `most_recent_instance.commit_sha` equal to the baseline and `most_recent_instance.state: open`. Their top-level `state` is null in the API response; that does not mean resolved.

| Alert | Observed sink | Independent baseline disposition |
|---|---|---|
| [130](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/130) | Provenance helper line 37, caller-selected PDF read/hash | Intentional local source reading, including originals outside the checkout. Not an output-path injection at this sink. Exact original identity should be checked before decoding, because this helper assumes fixed page/crop geometry. |
| [134](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/134) | Alpha helper line 39, caller-selected PDF read/hash | Same intentional original-source input, with fixed page/crop assumptions. A shared canonical-source check can strengthen provenance without prohibiting the operator's external originals. |
| [138](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/138) | Restorer line 21, caller-selected PDF read/hash | Canonical PDF digest is checked, but the safety condition uses Python `assert`, which optimized execution removes. Root was notified to replace safety assertions with explicit exceptions and cover optimized execution. |
| [141](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/141) | Restorer line 42, fixed output reads/hashes | Paths derive from the anchored checkout, both destinations are confined/preflighted, original asset bytes must match the fixed baseline, and the report uses exclusive creation. No arbitrary selected output path is established at this sink under the local non-hostile-filesystem model. |

No application/student/network invocation path into these Python helpers was established. A targeted source/scripts/workflow/package search found only references to the provenance JSON result, not helper execution. This is a bounded source inspection, not proof that unrestricted agent-selected filesystem access is safe.

Two other current Code Analysis annotations are the previously inspected condition-only `np.where` maintainability concern and the decorative cover canvas `aria-hidden` annotation. They are not the four security-rating findings. No new concrete focusable canvas path was established by this continuation.

## Review boundary

The historical eight boundary regressions and prior helper-guard review remain attributed to their original exact version; they were not rerun for reassurance. Root owns the narrowly changed helper implementation and boundary tests. The subsequent exact-commit review must inspect its changed source and completed results before acceptance. No artwork restoration, asset mutation, browser/build job, scanner rerun, alert dismissal, conversation resolution, or formal self-approval is performed by this review.

## Exact repair acceptance

**DONE but not live:** bounded source-helper repair independently accepted at exact commit [`b4ec4490d24c02238fc213c5187caa26d8f02338`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/commit/b4ec4490d24c02238fc213c5187caa26d8f02338). No material defect was found in its eight-file delta. Application code, production assets, configuration, dependency files and budget thresholds are unchanged by this commit.

The shared reader resolves an operator-selected regular file at any location, reads one immutable bytes snapshot, checks its canonical SHA-256 unconditionally, and returns those bytes. All three helpers pass that same snapshot to PyMuPDF's stream decoder and hash that same snapshot in their reports. This removes the earlier source/decoder/report identity gap without requiring originals to be moved into the checkout or given a particular filename. Deliberately reading a selected file remains part of original identification; this is not a claim that no mismatching local file can ever be read.

The restorer's canonical-source assertion is replaced by the shared unconditional check; its other four safety assertions become explicit exceptions. Optimized Python can no longer remove those integrity conditions. Existing destination preflight, fixed baseline PNG/WebP checks and exclusive report creation remain intact. The repair itself did not run a restoration.

The reviewer inspected the five regression tests and the completed raw result: five tests pass, with six direct helper invocations across normal and optimized Python. Rejections require the canonical-source error, no new report, and unchanged production PNG/WebP hashes. Missing inputs and directories are rejected. The positive fixture deliberately substitutes its own expected digest and proves a returned snapshot survives subsequent source-file replacement; it is not presented as a canonical original. The implementation report separately attributes acceptance of the actual 40,246,585-byte original to root.

The reviewer independently ran only the Anti-Churn receipt verifier: **PASS**. The local raw result file SHA-256 `1485b1d7ef82c63a66c4afa992f0b842e3f24597c6bb303258f8af380a95619c` matches the accepted receipt's evidence digest. The tests themselves were reused rather than rerun; no browser/build or source mutation was performed. Receipt verification authenticates the stored receipt structure and linkage; it is not an independent rerun of the tests.

[Implementation rationale](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/b4ec4490d24c02238fc213c5187caa26d8f02338/docs/proofs/m7-m8-m9-verification/continuation/SECURITY-SOURCE-SNAPSHOT-REPAIR.md), [focused regression source](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/b4ec4490d24c02238fc213c5187caa26d8f02338/docs/proofs/m7-m8-m9-verification/continuation/test-lesson4-source-boundary.py), [completed raw result](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/b4ec4490d24c02238fc213c5187caa26d8f02338/docs/proofs/m7-m8-m9-verification/continuation/source-snapshot-tests.txt), [accepted receipt](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/b4ec4490d24c02238fc213c5187caa26d8f02338/docs/proofs/m7-m8-m9-verification/continuation/source-snapshot-accepted.json).

The four dispositions above remain reasoned source-level conclusions, now supported by canonical snapshot enforcement for 130/134/138. They do not close scanning instances or certify a new scan. No unsupported dismissal is recommended. Deliberately malicious local file replacement during path checking, compromised Git, hostile decoder exploitation and a compromised machine remain outside this bounded assessment.

**WAITING:** overall merge/publication remains pending separate source, runtime, full-gate and eligible exact-final-head formal-review requirements. This technical review is not a formal GitHub approval and does not authorize protection bypass. Owner authorization is preserved.
