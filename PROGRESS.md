- Task 1.2: Fixed BookHeroGretel tests and home-landing test to match updated DOM structure. Verified: pnpm test passes all Gretel tests (manifest integrity fails intentionally). Screenshot: 1.2-proof.txt
- Task 1.3: Resolved lint problems (no-empty, useless escape, any) in 5 lib files. Added prettier endOfLine rule to fix 78k CRLF errors on Windows.
- Task 2.1: BLOCKED (No Supabase access)
- Task 2.2: BLOCKED (No Supabase access)
- Task 2.3: BLOCKED (No Supabase access)
- Task 3.1: Created a polished opening splash screen using existing approved art. Refactored Landing page to be a centered layout with stacked entry buttons.
- Task 3.2: Hid unfinished Gretel avatar elements by returning null in GretelLiveAvatar and GretelStage.
- Task 4.1 (Transplant Colored Art): Restored correct abeja/maiz manual crops, transplanted carro art to leccion-1, and removed empty/stub assets from workbook-manifest.json. Tests pass successfully.
- Task 4.2 (Reader Layouts): Implemented automatic orientation based on role (student horizontal, teacher vertical) without any toggle.
- Task 4.3 (Physical-Book Page-Turn Animation): Restored react-pageflip to provide elegant canvas-based page curl animations. Hooked up prefers-reduced-motion to disable animations automatically.
- Task 4.4 (Student Escuchar Option): Added EscucharInstruccionButton to student exercises (SyllableTap, WordMatch, DragBuildWord, and ReadingSentences). Audio playback speaks the instructions clearly.

- [x] Task 5.1: Complete Teacher Flipchart - Created flipchart selection view linking to the presentation viewer.
- [x] Task 5.2: Connect all sourced lessons and activities. Ensured missing lessons 6, 8, 10-24 are wired.

- [x] Documentation Job A: Completed TEACHER-HOWTO.md explaining login, class joining, assignments, flipchart, and curriculum for non-technical users.
- [x] Documentation Job B: Completed CONTENT-STATUS.md and ART-MAP.md auditing exact lesson statuses, HD asset locations, and open art slots.
