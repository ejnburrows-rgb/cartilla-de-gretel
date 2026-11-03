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

**WAITING:** exact implementation candidate and its completed boundary evidence. Overall merge/publication remains pending separate source, runtime, full-gate and eligible formal-review requirements. Owner authorization is preserved.
