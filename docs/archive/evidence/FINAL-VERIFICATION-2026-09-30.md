> **HISTORICAL EVIDENCE ONLY — NOT ACTIVE PROJECT INSTRUCTIONS OR CURRENT STATUS.**
> Archived during the 2026-10-05 governance-coherence repair. Current truth and execution authority come from the active hierarchy in `AGENTS.md`, current code/configuration, and live/runtime evidence where relevant.

# Cartilla completion verification — 2026-09-30

Status: PARTIAL. This is a tested PR candidate, not a completed release. All work remains on PR #426, branch `fix/lessons-08-24-book-fidelity`; no merge or deployment was performed.

## Changes

- Consonant reading pages use three vocabulary columns and put the letter beside both syllable strips. Six-item Completa pages use two rows of three on desktop/tablet, with a readable single column on phones. Existing text, picture identities and order are preserved.
- Added a once-per-scene Gretel video player with explicit replay, still-image fallback, load/error/stall handling, reduced-motion and data-saving support. Muting does not restart video. Scenes keep their minimum reading time when voice is unavailable.
- Added the approved-clip registry and ten media-player tests. The registry is deliberately empty: there are zero produced, registered clips. The approved Gretel 2.0 direction remains established; its exact source file still needs identification before production.
- Corrected the completeness verifier: 88 available workbook pages out of 90, pages 86–87 blocked, zero approved clips out of 31. Structural checks passing must not be reported as full product completion.

## Verification

- Fresh-checkout baseline: dependency install, art generation (167 native crops), typecheck, tests and production build passed.
- Changed candidate: typecheck passed; 109 test files, 1,354 passed tests plus two expected-fail tests; production build passed after the final CSS fix. `git diff --check` passed.
- Chromium viewport checks: all 60 teaching plates at 1920×1080, 768×1024 and 390×844; workbook samples 1, 24, 25, 26, 86, 87, 88 and 90 at all three sizes. Total 204 checks with no document overflow, visible broken images or page exceptions. Pages 25–26 were checked again after the final layout fix, including explicit geometry assertions.
- Real student gate, lesson 8: click and Enter cannot skip page 23. Sixteen trace checkpoints alone leave it locked; completing a freehand drawing and Listo unlock it. Circling all 30 words unlocks page 24. Completion remains on return and after reload. No page exceptions were observed.
- Content tests cover the available workbook transcription and the exact Flip Chart pictures/order. Browser sampling does not independently establish visual fidelity for all 88 workbook pages.

## Sources and remaining work

- Original Drive workbook rescan `13mj0ewFUI2Txa5OsEgGpt6i64qfGYh-b`: PDF sheet 91 shows printed page 85, and sheet 92 shows printed page 88. Printed pages 86–87 are absent. Older files named workbook-86-source and workbook-87-source actually show printed 88 and 89; they cannot fill the gap.
- GitHub check annotations on baseline `1888cdb1a3257844d9d7c27f02d4c08738ef4efb`: “The job was not started because your account is locked due to a billing issue.” Local checks are passing; hosted CI remains blocked until account billing is repaired.
- Gretel: exact master file unresolved; 31 approved motion clips still need production. No video-generation service was connected and no credits were spent. Browser speech is not the owner's final voice recording.
- Supabase/login remains deferred by owner decision.
- Reported Muse local commit `c9a55b66` was not available from this workspace or the remote repository. The existing remote branch and its Muse work were preserved; this report does not claim that separate local commit was recovered.

The proof archive contains viewport screenshots, gate screenshots and machine-readable check results. Generated build-time crops and delivery outputs are excluded from this source commit; the existing build pipeline regenerates them.
