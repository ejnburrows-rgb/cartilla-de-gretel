# Independent source-ground repair verification

**DONE but not live — the identified p006 ground-removal finding is resolved.** Reviewer: independent Codex technical-review worker; implementation remains owned by the integration owner. Verified exact head `3519b0e273c60935b16b5c9fa4c9e2f1414ead24`, including repair `9780b703ca34821972916185033e79140051722e`.

The existing [bounded source-alpha diagnostic](independent-review-source-alpha.py) was executed against the exact candidate Git blob and authentic PDF. [Raw after result](independent-review-ground-after.json) verifies:

- The complete band `[0,900,950,1250]` is opaque and its RGB exactly equals the reconstructed source-backed JPEG95 crop.
- All29092 formerly fully deleted saturated grass pixels counted by the diagnostic are restored; count is now0. All four recorded source-colored samples are opaque and exact.
- An independent decoded-array comparison of PNG against the baseline verifies **every RGBA pixel above y900 is unchanged**.
- An independent decoded-array comparison verifies the WEBP bottom band matches the corrected PNG's RGBA exactly.
- PNG SHA256 `91d1f0ac9969191b13db7cc9355b697c4d37375cf7b14939133e60ec5f6eed43`; WEBP SHA256 `d2e8ccda3a939a43b6ad6bc0cb538bb8df4444db662f41dcae509dd08af114f2`.

The corrected full-size PNG was visually inspected against the previously inspected source crop: grass/ground below the shoes is present and continuous again, character and floral composition remain unchanged, and the restored band introduces no caption. The source crop comes directly from the authentic PDF through the disclosed JPEG95 intermediate; this remains **not exact RGB equality to the original embedded JPEG**. No hidden drawing was inferred or synthesized.

This clears only the concrete alpha-removal finding for these two exact asset digests. It does not certify every preexisting alpha edge elsewhere, motion geometry, source-blocked pages35/41/47/53, final full-suite qualification, physical devices/projector or deployment. The final review may reuse this result if these asset hashes and policy remain unchanged; a new report-only commit does not require another pixel replay.
