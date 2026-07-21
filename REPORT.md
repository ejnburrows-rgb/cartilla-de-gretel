# REPORT — worker task log

One line per completed task from `docs/ROADMAP-TO-100.md`, newest first.

- **S1 — Teacher demo reports show real numbers instead of "—" / "0 mins"**:
  `getSeedClassProgress()` in `src/lib/seed-data.ts` now aggregates score/total/time
  from seed events (mirroring the live `getClassProgress()` in
  `teacher.functions.ts`) instead of hardcoding `accuracy: null`,
  `timeSeconds: 0`, `perStudentExercise: {}`. Verified in the browser: demo
  class report now shows real percentages (90%/60%/90%/30%/—) and minutes
  (126/70/14/7/0), and the exercise-type table shows real hit/attempt counts.
