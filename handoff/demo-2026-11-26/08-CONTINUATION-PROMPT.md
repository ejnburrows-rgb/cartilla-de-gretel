# Continuation prompt for an agent with coding, browser and testing access

You are continuing La Cartilla de Gretel (`ejnburrows-rgb/cartilla-de-gretel`). Issue #877 is the only source of truth. Follow AGENTS.md: owner rules, §5 ask once before code changes, §8 authentic sources only, §8a locks, two-choice approvals, and no deploy without the exact words “deploy it”. Do not restart audits. Read `handoff/demo-2026-11-26/` first; it corrects open PR #1321. Do the work on PR #1321’s branch; do not open a new PR.

1. **Do not “fix” the corner drag.** It is already gated (`NativeLessonViewer.tsx:418`). If the owner says yes, add only the regression test described in `05-MOTION-INSPECTION.md`.
2. **Runtime-verify motion** on `/cartilla/leccion/3` (pp. 7–9) and `/cartilla/presentar/3` at 390×844 and 1366×768, with continuous recordings. Check: pencil tip on the mark, one cursor, wrong → red → erase → retry, correct → green → one side turn (≈3.0 s) with one rustle, Flip Chart top turn (2.0 s), corner drag on an incomplete page is blocked, mute, reduced motion. Post the proof in #877.
3. **Artwork:** recrop `02` §A1/§A2 from `public/cartilla/art/source/workbook/page-NNN.jpg` with the same file names, and show them on `/revision#art`. Present the p.7 airplane and eyes options for an owner yes. Never add pictures to pp. 4, 13 or 16. Regenerate the audit so it matches by caption.
4. **Ledger:** after a yes, append the two Option A entries in `07` to `public/review/owner-decisions-locked-b.json`.
5. **Audio:** collect, one at a time, the owner decisions on the §8 source rule, #1058, the retry phrase and the 86 wordings. After approval, wire the clips through `gretel-approved-clips.json` + the `recorded-audio` provider + one listener on `-leccion-view.tsx`. Verify by listening. Everything else stays silent. No TTS.
6. **Owner decisions** (one at a time, plain language): Flip Chart 2.0 s vs 2.6 s (§8a lock); Cow/Chano upgrades; Apple activity; Chano art; `completar-palabras` answer keys.

Do not touch Tutor #1073 files, Mariposas assets, pages 86–87, or the §8a pencil, eraser, curl and Flip Chart locks. No paid services.
