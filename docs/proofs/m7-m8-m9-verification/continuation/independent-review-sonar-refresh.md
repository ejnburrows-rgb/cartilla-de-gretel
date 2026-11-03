# Independent Sonar gate reconciliation

Read-only reconciliation for PR #1247. Live PR head observed: `974ce8a80c33e452feb05afe3b9122edd1a2760f`. Its checks/statuses were empty/pending at this inspection. The latest inspected completed failing analysis targets **`580e8ddb760a9574f4795410da2b5b658f6f0c86`**, not an inferred analysis of the newer head.

**WAITING / overall HOLD.** Twelve resolved review conversations do not mean Sonar's quality gate passed or its alerts closed. No alert was dismissed, no source was changed and no analysis rerun was requested in this reconciliation.

## Actual gate reason

- [SonarCloud check 126017239979](https://github.com/ejnburrows-rgb/cartilla-de-gretel/runs/126017239979) is FAILURE, with four new **HIGH** security alerts.
- SonarCloud Code Analysis check `126017235889` is FAILURE: **Security Rating on New Code C**, required **A**. [Quality gate details](https://sonarcloud.io/dashboard?id=ejnburrows-rgb_cartilla-de-gretel&pullRequest=1247).
- GitHub's code-scanning API for `refs/pull/1247/head` still reports four open instances at analyzed commit `580e8ddb`, all rule `pythonsecurity:S8707`:

| Alert | Analyzed file/line | Current concrete boundary and residual |
|---|---|---|
| [134](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/134) | `independent-review-source-alpha.py:39` | Report result hashes the caller-selected PDF and constructs the JSON. The report destination is confined/exclusive by the accepted repair; **PDF input remains a deliberate trusted local path**, not confined by that output guard. PDF decoding already occurred before this line. |
| [130](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/130) | `lesson4-source-provenance.py:37` | Same deliberate caller-selected source-PDF read/hash; output confinement does not certify or restrict this input. Source PDF is decoded before the result construction. |
| [138](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/138) | `restore-lesson4-ground.py:21` | Reads the operator-selected source PDF and checks its SHA256 against the fixed canonical digest before decoding/restoring. This still entails a local read of the selected path; arbitrary untrusted source-path selection was not made a supported restricted tool capability. |
| [141](https://github.com/ejnburrows-rgb/cartilla-de-gretel/security/code-scanning/141) | `restore-lesson4-ground.py:42` | Result construction hashes the two fixed production assets below the anchored checkout. Both asset paths/report were preflighted for confinement/redirection before mutations and both pre-restoration asset hashes are checked. This repaired boundary was individually reconciled in the superseding discussion; the scanning alert remains open. |

The guards remove the reviewed option-shaped Git-head, report-overwrite, arbitrary-repository and implicit Git-PATH boundaries under the documented local operator model. They do **not** mean every remaining caller-controlled file read is confined. The helpers intentionally consume original PDFs outside the checkout. Their current valid use still requires the operator to verify and deliberately select the intended originals; do not expose unrestricted `--pdf` selection to untrusted agent inputs or claim a general read-confinement guarantee. No app/student/network-input route into these helpers was established by this bounded review. Hostile PDF decoding and compromised/concurrently hostile local filesystems remain outside its certification.

The earlier eleven comments and superseding alert141 discussion have specific remediation/triage replies and were verified resolved (12/12). That resolves conversation state, **not the four scanning instances or Sonar rating**. The API's current `most_recent_instance.state:open`, high rule labels and exact analyzed revision remain authoritative for those separate facts.

## Other annotations inspected

The six Code Analysis annotations comprise those four path findings plus:

- `independent-review-source-alpha.py:35`: use `np.nonzero` for condition-only `np.where`. A maintainability annotation, not the recorded security-rating gate reason.
- `LivingBookCover.tsx:165`: `aria-hidden=true` must not be placed on a focusable element. The exact source renders an empty decorative canvas with no `tabIndex`, interactive descendants or attached interaction handlers; its CSS has `pointer-events:none`. No concrete focusable path was established in this source inspection. This is not a keyboard/screen-reader runtime certification or a silent dismissal.

AGENTS makes Sonar advisory. That policy does not turn a failed scan green, erase high labels or waive a confirmed material defect. The independent material assessment remains limited to the repaired boundaries and concrete observed code paths; unrelated source, complete gate, full-release E2E and final formal-review holds remain intact. Reassess any new final-head analysis when available; do not repeat the unchanged scan merely to seek a green status.
