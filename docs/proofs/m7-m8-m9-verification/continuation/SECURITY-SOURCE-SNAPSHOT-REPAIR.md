# Lesson 4 proof-helper source integrity

Based on PR #1247 candidate 226991ec775c51592be859d30bb8ee978bfcda0d.

The local restorer used Python assertions for source/crop and pixel integrity. `python -O` removes those checks. All five are now explicit exceptions. All three Lesson 4 helpers verify one immutable bytes snapshot against the already recorded original PDF SHA-256 before decoding, and use that same snapshot for decoding and reporting. The operator can still select the original outside the checkout or under a different filename. No production artwork was restored or changed.

Five focused tests pass, including six real CLI subprocess cases (all three helpers in normal and optimized mode). They reject unverified source bytes without report creation or PNG/WebP changes; other cases cover directories, missing sources, a renamed original and replacement after snapshot capture. The positive snapshot fixture substitutes its expected digest; separately the existing actual original was accepted at its recorded digest `d7fb3dff4e63caf3443226e57a9ef700f8974acd4ad8f08f44e2792e13cc4930`, 40,246,585 bytes. No broad application test was repeated for this documentation-helper-only change.

Raw focused results: `source-snapshot-tests.txt`. Anti-Churn accepted receipt: `source-snapshot-accepted.json`, verified after acceptance. Earlier destination/head/Git guards and their accepted evidence remain applicable.

## Current scan dispositions

Live alert instances 130/134/138/141 were open on exact 226991ec; null top-level alert state did not mean closed. No alert has been dismissed by this repair.

| Alert | Actual sink and disposition |
|---|---|
| 130 | Provenance helper hashes operator-selected PDF. Intentional local source reading, no application input or raw-source disclosure established. Now hashes only the same canonical snapshot used for decoding. |
| 134 | Alpha helper hashes operator-selected PDF. Same supported local-read disposition and snapshot repair. |
| 138 | Restorer hashes operator-selected PDF. Canonical identity is necessary for fixed source geometry; optimized-mode bypass was a real defect and is repaired unconditionally. |
| 141 | Restorer hashes fixed PNG/WebP outputs in the owning checkout. Existing destination/link and baseline guards confine these reads; no caller-selected arbitrary output path is established. Supported non-defect at this sink. |

This is a bounded local-helper repair and reasoned triage, pending independent exact-commit review and normal scanner review. It is not a whole-product security pass. The helper must read operator-selected bytes to identify the original; digest verification does not claim it never reads a mismatching file. Local hostile filesystem replacement, compromised Git executables, and hostile decoder exploitation remain outside the established guarantees.
