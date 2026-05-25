# Owner-authored deploy trigger

This file intentionally triggers deployment from the repository owner account when needed.

Deadline rollout checkpoint:

- Fast remaster quality mode added.
- Student workbook prefers V2/corrected images with original scan fallback.
- Teacher flipchart projection mode prefers V2/corrected images with original scan fallback.
- 3D page flip was upgraded.
- Deadline remaster batch queue added to `/cartilla`.
- Production GitHub Actions workflow exists for verify → Supabase migrations → Vercel deploy.

Latest expected production commit after this trigger:

```text
3b5f4afa7b4b864282e5e92c567718c4fd073ebb
```

Newer trigger commit should deploy the same deadline quality work plus the batch queue.

Expected production behavior after deployment:

- Public workbook access remains available.
- `/cartilla` shows the real progress center and remaster deadline queue.
- `/cartilla/leccion/:n` uses the best available scan/remaster path.
- `/cartilla/teacher/flipchart` uses projection quality mode and falls back to original scans if a remaster asset fails.
- `/cartilla/teacher/remaster-review` remains the comparison workflow for visual decisions.

Updated: 2026-05-25T04:39:00Z
