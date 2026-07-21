# Wave 1 — Teacher CRM test coverage (issue #240)

Added 12 tests covering the four previously-untested `teacher.functions.ts` functions: `getClassProgress`, `findStudentsByName`, `getWeeklyActivity`, `getAllTeacherStudents` (not-authorized/not-owned paths, empty-data shapes, and success aggregation). Added the two chainable methods these functions use (`ilike`, `gte`) to the shared query-builder mock.

Proof: `pnpm test` → 545 passed | 2 expected fail (was 533). The teacher.functions suite went from 17 to 29 tests.

Break-it-on-purpose check: temporarily changed `events: eventCounts[s.id] ?? 0` to `events: 999` in `getAllTeacherStudents`; the new test failed with `expected 999 to be 2`; reverted; all 29 pass again.

Implemented directly (the assigned background agent generated code but could not push its branch to GitHub).
