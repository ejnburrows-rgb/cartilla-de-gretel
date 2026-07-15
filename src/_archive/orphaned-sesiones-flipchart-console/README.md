# Archived: duplicate flipchart console (`/cartilla/sesiones`, `/cartilla/sesion/$n`)

Moved here 2026-07-15, out of `src/routes/` so it no longer registers as a
live route (the file-based router only scans `src/routes/`). Not deleted —
per repo policy, files are moved/archived, never deleted.

Why: this was a second, complete "live session console" for teacher
classroom projection, alongside the real one at `/cartilla/presentar/$n`.
Confirmed nothing in the app ever links to it — grepped every `<Link>`/
`navigate()`/`redirect()` target across `src/`, the only inbound references
to `/cartilla/sesiones` or `/cartilla/sesion/$n` were from these two files
linking to each other. `/cartilla/presentar/$n` is linked from
`TeacherCrmShell.tsx`, `teacher/guia.$n.tsx`, and `teacher/paginas.$n.tsx`.

Verified working before archiving this (per the "cleanup only after the
live flow it duplicates is verified working" rule): logged in via the demo
teacher lane and opened `/cartilla/presentar/17` — real HD flipchart
plates render, page navigation, pointer, focus mode, and fullscreen all
work. (Note: the underlying flipchart HD scan images themselves have a
known, separately-tracked orientation bug — text/art render upside-down —
already documented in `SPEC.md`; that's an art-asset issue, not something
this archival touched or caused.)

**Real feature gap, not silently dropped:** this archived console had 4
things the real flipchart doesn't: `AudioNarrationDock` (per-step audio
narration), `AccessibilityPanel` (dedicated a11y controls), `SessionShareCard`
(a share/QR card, presumably for families), and `SessionTimer`. Porting
these into `/cartilla/presentar/$n` would be genuine new feature work —
touching well more than 5 files — not a cleanup task, so it wasn't done
here. If any of these are wanted, port the *feature* into the real
`/cartilla/presentar/$n` deliberately as its own task, using this archived
code as reference — don't just move these files back to `src/routes/`.

The route files (`sesiones.tsx`, `sesion.$n.tsx`) moved in this same pass;
the components/lib they used only (`SessionStepRail`, `SessionProjector`,
`SessionTimer`, `AudioNarrationDock`, `AccessibilityPanel`, `SessionShareCard`,
`FlipBoard`, `session-store.ts` — confirmed via grep to have no other
importers) were archived in immediately-following commits on the same
branch, same reason.
