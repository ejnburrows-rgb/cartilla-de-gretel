# Owner-authored deploy trigger

This file intentionally triggers a Vercel deployment from the repository owner account so the latest `main` tree can deploy on the Vercel Hobby plan.

Includes prior changes through commit:

`5c8776ea8da3bd02534ca35cf38f15a981c81264`

Includes this additional fix:

- Student landing cover now uses `/cartilla/images/original/cover.jpg` instead of a stylized/generated cover panel.

Expected production behavior after deployment:

- Student landing page shows the original workbook cover image.
- Book-style page-turn controls are present.
- Verified Ss and R page scans are available in the student Cuaderno.
- Object-level cutouts and exact hotspots remain pending and should not be overclaimed.
- The protected site still requires the project password.

Created: 2026-05-24T02:43:00Z
