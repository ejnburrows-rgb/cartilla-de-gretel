# Owner-authored deploy trigger

This file intentionally triggers a Vercel deployment from the repository owner account so the latest `main` tree can deploy on the Vercel Hobby plan.

Includes prior changes through commits:

- CRM hardening: `a137e28dd5b63ccdff845652855a14b454ff8fa1`
- Remaster samples and review workflow: `f28a6af638ffb3a0cfeb43e36789ab070b0850b5`

Expected production behavior after deployment:

- Remaster review route is available at `/cartilla/teacher/remaster-review`.
- Remastered sample images are review-only and not auto-approved.
- Original scans remain production fallback unless remaster metadata marks approval.
- CRM demo hardening remains available.
- Student workbook scans, interactions, and BookPageFlip remain intact.
- Teacher flipchart lane remains available.
- No fake art, emojis, or invented text are introduced.

Created: 2026-05-24T18:31:00Z
