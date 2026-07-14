# Archived: orphaned `/_authenticated/cartilla/teacher/*` tree

Moved here 2026-07-11, out of `src/routes/` so it no longer registers as a
live route (the file-based router only scans `src/routes/`). Not deleted —
per repo policy, files are moved/archived, never deleted.

Why: this was a second, parallel teacher-CRM route tree (class dashboard,
student detail, branding, presentation, remaster-review) alongside the real
one at `/cartilla/teacher/*`. Git history traces it to old commits
(`9af5b77`, `b335b6f`) that predate the current active development, and
nothing in the app ever links to it — `login.tsx` and every nav link in the
app point at `/cartilla/teacher`, never `/_authenticated/cartilla/teacher`.
PR #158 (student-session isolation fix) patched this tree's gate too, as
defense-in-depth, but that's what surfaced the duplication: two independently
gated teacher surfaces is exactly the kind of footgun that let a gap open in
the first place.

If any feature here (e.g. the student detail view, branding page) is ever
wanted, port it into the real `/cartilla/teacher/*` tree deliberately rather
than re-registering this one — don't just move these files back to
`src/routes/`.
