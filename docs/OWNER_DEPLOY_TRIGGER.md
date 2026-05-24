# Owner-authored deploy trigger

This file intentionally triggers a Vercel deployment from the repository owner account so the latest `main` tree can deploy on the Vercel Hobby plan.

Includes prior changes through commit:

- V2 remaster samples: `f3e97c26eac243af4355f2092c111b63ac1999e0`

Expected production behavior after deployment:

- V2 remaster samples are available in the review workflow.
- `/cartilla/teacher/remaster-review` shows Original / Remaster V1 / Remaster V2 comparison where available.
- V2 samples remain review-only and are not auto-approved.
- Original scans remain the production fallback unless remaster metadata is approved.
- Student workbook scans, interactions, BookPageFlip, teacher flipchart, and CRM flows remain intact.
- No fake art, emojis, or invented text are introduced.

Created: 2026-05-24T18:45:00Z
