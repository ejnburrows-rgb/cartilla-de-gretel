# Owner-authored deploy trigger

This file intentionally triggers deployment from the repository owner account when needed.

Current deadline rollout checkpoint:

- The home page now states the core mission clearly: old-school paper workbook material converted into a real classroom CRM.
- The student side is centered on the real 24-lesson workbook path.
- The teacher side is centered on the CRM: classes, students, codes, assignments, progress, time, and accuracy.
- The teacher flipchart is centered on classroom projection of the teacher book.
- Student workbook pages use a stronger book shell with spine/depth treatment.
- Teacher flipchart uses a stronger projected-book visual treatment.
- Student workbook prefers V2/corrected images with original scan fallback.
- Teacher flipchart projection mode prefers V2/corrected images with original scan fallback.
- Generated workbook activities are built from verified scan text when no hand-authored interaction exists.
- GitHub Pages preview workflow was simplified to avoid malformed expression placeholders.

Latest expected repo commit after this trigger:

```text
d674edee489b5dd1ed17159f7216b71295255fab
```

Expected visible behavior after deployment:

- `/` shows the paper-to-CRM classroom system mission.
- `/cartilla` shows the real workbook + CRM + flipchart product direction.
- `/cartilla/lecciones` opens all 24 workbook lessons.
- `/cartilla/leccion/:n` shows the workbook page viewer, quality toggle, page turn, and generated activities.
- `/cartilla/teacher` opens the teacher CRM.
- `/cartilla/teacher/flipchart` opens the classroom projection book.
- `/cartilla/teacher/remaster-review` remains the visual comparison workflow.

Updated: 2026-05-25T05:12:00Z
