# Approval Ledger — La Cartilla de Gretel
Standing decisions. Already decided — never ask the owner again.
Base revision when written: c450d686 (main, verified 2026-10-23).

## GAMES
- Four confirmed games: Cow, Rima, Palabras por minuto, Chano.
- Mariposas: OUT for now. No fifth game without the owner's decision.
- Chano: owner ruled the finished game DONE 2026-10-23 — it is "Chano's Word Circus"
  (Lovable). The old Opus game branch is superseded; look, don't touch.

## AUDIO
- Device TTS (computer voice): OFF everywhere. Silence where no recording exists.
- Rejected recordings (rec_gretel_* files): NEVER USE.
- Gretel_558674_Original.m4a: only with verified transcript match.
- Lesson narrations leccion-1 … leccion-24: silent fallback until the owner records them.
- No agent generates voice. Ever.

## ARTWORK
- No new art generation. Ever. No supplied original modified, replaced, or regenerated.
- Source of truth: the original book art. Show every picture side-by-side with the
  original and get the owner's yes before it enters any page.
- 7 approved flip-chart fix pictures: owner APPROVED 2026-10-20; files are on main.
  Wiring them into the Flip Chart pages is the remaining step.
- OJOS: DECIDED + DONE 2026-10-23 10:26 EDT — owner said "use the single approved
  eye in both spots." Done and byte-verified on main. (The 2026-10-23 prompt package
  said "HOLD — do not use"; that line is overridden by the owner's actual tap.)
- Background color: CREAM (per package; D12 confirmation was still listed in the package).
- Pencil pages 7–8: always separate, never merged with other pages.

## DEPLOYMENT
- Auto-deploy: OFF. Every deployment requires the owner's explicit yes.
- vercel.json has git.deploymentEnabled:false — manual trigger required. Never touch the lock.

## MERGING
- No agent merges its own work.
- Agents may merge ONLY finished + tested work (real running build, screenshot/video
  proof) — owner merge rule, PR #1092, merged by the owner 2026-10-22.
- Every report carries WORKS / DOES NOT WORK / NOT VERIFIED, in that order.
- Merges never trigger a deploy by themselves.
