# Independent affected-delta review — local helper guards

**Exact reviewed commit: `97354ea934f47c4f2f4d91767d7f12977d42ba60`.** Base: `4d73acf7647d04f4f02a4cf2cef4acae8dc14025`. Reviewer: Codex independent_review, separate from integration/implementation, existing `continuation/1247-review` branch.

**DONE but not live:** bounded helper repair independently accepted. **WAITING:** overall merge/release HOLD remains; performance, source holds, final gate/runtime evidence and final-head formal GitHub review are separate. No self-approval, conversation resolution or alert dismissal was performed.

## Scope and evidence examined

The reviewer read the exact Git diff for the four changed helpers, shared guard and eight focused regressions, plus the repair report and raw eight-test output. The source-recovery Markdown update is documentation only. The complete application/asset/config/test-budget delta from the base is empty: changes are confined to continuation evidence and helpers.

[Implementation and limits](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/97354ea934f47c4f2f4d91767d7f12977d42ba60/docs/proofs/m7-m8-m9-verification/continuation/HELPER-SECURITY-REPAIR.md), [guard source](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/97354ea934f47c4f2f4d91767d7f12977d42ba60/docs/proofs/m7-m8-m9-verification/continuation/evidence_cli_guard.py), [regression source](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/97354ea934f47c4f2f4d91767d7f12977d42ba60/docs/proofs/m7-m8-m9-verification/continuation/test-evidence-cli-guard.py), [raw eight-test result](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/97354ea934f47c4f2f4d91767d7f12977d42ba60/docs/proofs/m7-m8-m9-verification/continuation/helper-guard-tests.txt).

The implementation owner's eight passing boundary regressions and syntax checks are attributed to that owner and reused; this reviewer did not repeat them or execute the mutating restoration. The reviewer independently inspected code/control ordering, source assertions and the result receipt, and verified locally that Git accepts the guarded `show --end-of-options FULL_SHA:path` command. A same-identity application suite or browser recapture would add no evidence for these helper-only changes.

## Material assessment

No material defect was found in the bounded repair under the documented local operator model:

- Caller-selected Git heads must be exactly forty hexadecimal characters before Git runs; end-of-options also separates the fixed show command from the revision. A syntactically valid nonexistent/object-wrong commit fails normally at Git rather than adding executable options.
- Python repository selection resolves to the checkout containing the helper and accepts a worktree `.git` file. Reports must stay beneath the fixed continuation directory, reject redirected paths and use exclusive creation. Existing historical reports cannot be overwritten.
- The restorer preflights both asset destinations and its report before mutations. It also requires both current PNG/WebP bytes to match the reviewed pre-restoration baseline. Current accepted restored art and its existing report intentionally make replay fail closed. No existing art bytes were changed by this repair.
- Git is selected through an explicit absolute existing file with the Git basename; bare PATH resolution has been removed from all four flagged helpers. This validates selection syntax/file presence, **not executable integrity**.
- Runtime evidence is anchored beside the helper, checks cwd and evidence ancestry before loading project dependencies, refuses an existing fresh-output directory, and preserves the old `runtime/` evidence. Exact path comparison is retained on case-sensitive systems; Windows comparison alone normalizes case.

The unit-level junction test checks the shared destination guard using an actual prepared Windows junction; malicious reporting CLI heads, unrelated restoration repos and implicit runtime Git selection also have direct subprocess regressions. This is meaningful focused coverage of the changed authority boundaries, not a whole-environment penetration test.

## Evidence-backed conversation disposition

Every finding in the live eleven-thread receipt has a concrete repaired boundary. These discussions are **eligible for resolution after a specific implementation/proof reply**, subject to the integration owner's final current-head verification. This document does not itself resolve them.

| Alert / original thread | Repaired boundary and basis |
|---|---|
| 135 / `PRRT_kwDOSfBV9s6zKT71` | Alpha helper head: exact SHA validation plus end-of-options; invalid option-shaped head CLI regression. |
| 131 / `PRRT_kwDOSfBV9s6zKT8p` | Provenance helper head: same guard and direct invalid-head CLI regression. |
| 134 / `PRRT_kwDOSfBV9s6zKT8I` | Alpha report data construction reaches confined exclusive report writer; outside/overwrite/junction guard regressions. |
| 133 / `PRRT_kwDOSfBV9s6zKT8Z` | Alpha report write uses shared confined exclusive writer; same boundary regressions. |
| 130 / `PRRT_kwDOSfBV9s6zKT82` | Provenance report data construction reaches the guarded writer; same boundary regressions. |
| 132 / `PRRT_kwDOSfBV9s6zKT8_` | Provenance report write uses shared confined exclusive writer; same boundary regressions. |
| 138 / `PRRT_kwDOSfBV9s6zKT9O` | Restorer repo resolves only to owning checkout; unrelated-repo CLI rejection before writes. |
| 136 / `PRRT_kwDOSfBV9s6zKT9a` | Fixed PNG write preflight, nonredirected confined destination, expected baseline bytes before writes. |
| 139 / `PRRT_kwDOSfBV9s6zKT9o` | Fixed WebP write preflight plus expected baseline bytes; all destinations checked before either asset mutation. |
| 137 / `PRRT_kwDOSfBV9s6zKT9u` | Fixed evidence write preflight and exclusive report creation; existing accepted report refuses replay. |
| 140 / `PRRT_kwDOSfBV9s6zKT90` | Runtime Git requires explicit absolute file; bare Git selection fails before output/browser launch in direct regression. |

Line numbers in GitHub may move after the patch; thread/alert identity above refers to the original finding, not a claim that its old line still contains the call.

## Limits and final-head dependency

These guards do not defend against an operator deliberately selecting a malicious executable named Git, concurrently hostile filesystem replacement between check and write, hostile local repository configuration, arbitrary hostile PDF decoder exploits or an already-compromised computer. Those assumptions remain explicit; no blanket security clearance is given. The runtime capture body was not rerun, and the historical provenance/alpha checks keep their original output identity.

Formal current-head review still needs an eligible independent provider/reviewer. The old Graphify review is stale, and the existing request targeted `4d73acf7`, not this changed head. When performance work is integrated, independently reassess its exact startup delta and final evidence before the final formal-review request. Owner merge/sound/manual-deployment authorization remains accepted; no request to repeat it is implied.
