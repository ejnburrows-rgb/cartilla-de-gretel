# La Cartilla de Gretel — Current Technical Status

Updated: 2026-07-30

## Found

La Cartilla de Gretel is a Spanish early-literacy app for children ages 4–7 with two separate products: the student workbook and the teacher dashboard/flipchart. The current repository includes React/Vite/TypeScript, Supabase migrations, Vitest tests, Playwright tests, content validators, art validators, and GitHub Actions.

## Current blockers

- **Blocker:** student access still requires an approved live migration before the old anonymous credential pattern can be considered closed in production.
- **Blocker:** real class-code rotation for `GRETEL`, `NOVO26`, or any other real code remains an owner-approved live-data operation and was not performed.
- **High:** public teacher signup needs the prepared pending/invitation flow applied in Supabase dev and then production after approval.
- **High:** retention and deletion defaults are proposed, not legally/operationally approved.

## Done in branch `fix/security-ci-data-guardrails`

- Removed unconditional `/book/book.pdf` preload from first paint.
- Added one authoritative pull-request verification workflow.
- Added bundle budget check script.
- Prepared forward and rollback Supabase migrations for student sessions, teacher approval, class-code rotation, child-data request paths, metadata validation, and teacher-note limits.
- Added security/data-handling, accessibility, and deployment/rollback/export/maintenance documentation.

## Preservation confirmation

This branch does not change lesson order, Spanish educational content, authentic illustrations, Gretel behavior, workbook pages, flipchart content, or the separation between student workbook and teacher flipchart. Missing art remains pending; no invented art was added.
