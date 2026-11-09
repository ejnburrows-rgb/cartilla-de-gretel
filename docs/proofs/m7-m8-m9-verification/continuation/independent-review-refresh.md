# Independent review refresh — PR #1247

Reviewed candidate: `4d73acf7647d04f4f02a4cf2cef4acae8dc14025`. Review owner: Codex independent_review, isolated existing `continuation/1247-review` checkout. This is a live-state reconciliation, not a repeated material audit. No production implementation, test threshold, alert state, review thread or branch protection was changed.

**Status: WAITING; merge HOLD.** Existing independent material review and security triage remain applicable to this unchanged candidate. Performance repair is assigned separately; changed startup code will need affected-delta review after its exact commit and measurements arrive.

## Formal review and eligibility

- The [existing current-head Graphify request](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1247#issuecomment-6605957742) is confirmed present. No duplicate request was sent.
- Provider read-back still reports only `61a6bd7b279f261254573ddc5a8ffef18df98283`, completed/pass. The provider's `superseded:false` does not make this old commit the current candidate.
- [Graphify review 5740426046](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1247#pullrequestreview-5740426046) is COMMENTED on that old head. [Security review 5753596988](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1247#pullrequestreview-5753596988) is COMMENTED on the current candidate, containing the eleven local-helper findings below; it is not an independent material assessment of the final performance repair.
- GitHub review requests are empty. The authenticated CLI account and PR author are both `ejnburrows-rgb`. The repository collaborators endpoint lists only that same administrator. No distinct eligible human reviewer was found through the available repository collaborator list. This is a bounded observation, not proof that no external reviewer can exist.
- Do not submit an author-account approval or impersonate a reviewer. The already-requested Graphify app is the existing independent provider path; an actual current-final-head review must be read back before treating this gate as met. A final head change invalidates the request's exact-head identity and requires reconciliation of the affected scope.

## Eleven conversations reconciled

All eleven are still unresolved and not outdated. Each matches the [published bounded triage](independent-review-security-triage.md); no new finding or changed helper was observed. Full thread IDs and positions are in [live receipt](review-refresh/live-review-state.json).

| Alerts | Helpers / boundary | Disposition |
|---|---|---|
| 135, 131 | `independent-review-source-alpha.py:23`, `lesson4-source-provenance.py:27`; caller-controlled Git revision | Existing exact-SHA manual invocations reused. Array arguments avoid shell interpretation but do not eliminate option injection. Unvalidated future revisions remain a local invocation hazard. |
| 134, 133, 130, 132 | The same two reporting helpers; caller-selected report output | Existing deliberate report destinations reused. No confinement/overwrite protection is present; do not expose these as unrestricted agent/path-input tools. |
| 138, 136, 139, 137 | `restore-lesson4-ground.py:15,33,34`; caller-selected repository plus fixed asset/evidence writes | Existing restoration used the designated owner-authorized isolated checkout and verified source hashes. Content hashes do not confine redirected filesystem paths. This tool mutates production assets and must not be relabeled read-only. |
| 140 | `runtime-check.mjs:10`; local Git executable lookup | Fixed argv does not certify executable identity or all PATH directories. No app-controlled executable path was established; local environment risk remains. |

The review re-read exact candidate helper sources using Git object contents, because three helpers are absent from this older review checkout's working tree. It did not execute any mutating helper, replay the restoration, dismiss an alert, or resolve a conversation. No lower-trust application route into these helper arguments was established by the existing bounded investigation; that is not a global security certification.

## Repository gate versus advisory severity

Live `main` protection enforces administrators, linear history and **required conversation resolution**; force pushes/deletion remain disabled. Required approving review count is zero, while AGENTS independently requires formal exact-head review plus independent material technical review. A zero count does not waive that project policy.

Sonar is advisory under AGENTS; that does not disable required conversation resolution. Retaining a justified triage and leaving all threads open means this repository gate remains unmet. Resolution needs a concrete accepted disposition of each discussion or a narrow repair validated by the assigned owner; there was no automatic bulk dismissal in this lane.

## Retained holds and next action

- Four real performance failures: WAITING for performance owner's fix, exact measurements and unchanged-threshold focused evidence.
- Source/placement holds for 35/41/47/53: retain source owner's precise request; no replacement art inferred.
- Physical phone/projector and complete release E2E: NOT TESTED in this review.
- Owner merge, CC0 sound and manual deployment authorization are accepted, including [deployment authorization](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877#issuecomment-6606568478). The older material report's final sentence saying deployment was unauthorized is historical and superseded.
- Next: review the repaired startup delta at its exact commit, inspect final gate/runtime evidence, reconcile all conversations, then obtain/read back eligible final-head formal review. No merge/deployment permitted merely by this receipt.
