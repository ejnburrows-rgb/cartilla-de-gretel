# Airplane path runtime proof — October 28

WORKS: Actual Workbook pages 8, 13 and 16 load the descriptive airplane path on Chromium at 390×844, 768×1024 and 1366×900. All nine checks waited for the exact printed page and idle page-turn state before capture. The decoded airplane and selected currentSrc were inspected in the running lesson. Page 8 selects the canonical image; pages 13 and 16 select the 384 delivery image. Network response SHA256 equals the preserved corresponding pez.webp source in every case. Both renamed delivery tiers and canonical bytes were already verified identical in this PR; no illustration was changed. See checks.json, the nine page screenshots and three viewport recordings.

DOES NOT WORK: No failure observed in this bounded path check. An initial capture caught the turning page before it settled; those temporary recordings were discarded and all nine captures repeated with explicit printed-page and idle-state assertions. This was capture timing, not a demonstrated navigation defect.

NOT VERIFIED: Audible vocabulary, exercise grading/completion, physical phone, Safari, assembled integration and deployment. Lesson completion was seeded only to reach the relevant pages; this is not student-completion proof. Existing source/master decisions are preserved. No public deployment or main merge.

Tested product head: 2cc39fb7d5d81c4f9be2a7ef3b27b5d6e514e0ad. Reproduce from repository root with `node scripts/proofs/check-airplane-runtime.mjs` against the worker-mode app on localhost:5173 and system Chromium. This proof-only follow-up changes no product code or assets.
