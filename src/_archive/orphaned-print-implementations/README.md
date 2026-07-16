# Archived: 3 of the 4 duplicate print/binder implementations

Moved here 2026-07-15/16, out of `src/routes/` so they no longer register
as live routes. Not deleted — per repo policy, files are moved/archived,
never deleted.

Why: four separate, complete print implementations existed, none wired
into any teacher nav:

1. `/cartilla/binder` + `/cartilla/binder/$lesson` (`BinderCover`,
   `BinderTOC`, `LessonBinderSheet`, `binder-export.ts`) — a class-binder
   generator with lesson checkboxes and a real PDF-export function.
   **Archived here.**
2. `/cartilla/imprimir/$n` + `/cartilla/imprimir/all` — a per-lesson and
   whole-notebook printable worksheet generator, built from real
   `CATALOG` data (syllables, vocab, `PdfPage`). **Kept as the one real
   implementation** — it was already the most complete of the 4, its own
   naming ("Imprimir") matches the task's own wording, and it needed the
   least work to finish: added the missing teacher-only auth gate
   (previously none of the 4 had one) and a nav entry in
   `teacher/route.tsx`. See `SCREENSHOTS/6.2-teacher-nav-imprimir.png`
   and `SCREENSHOTS/6.2-imprimir-all-working.png` for proof it works,
   gated, from the real teacher nav.
3. `/print/$lessonId` + `/print/binder` (`PrintBinder.tsx`) — thin
   26-line wrappers around a single `PrintBinder` component.
   **Archived here.**
4. `teacher/print.tsx` — a literal placeholder
   ("PLACEHOLDER_CONTENT — Las fichas de trabajo imprimibles estarán
   disponibles próximamente"). **Archived here** (as
   `teacher-print-placeholder.tsx`).

Confirmed via grep before moving: nothing outside each cluster's own
files ever linked to any of #1, #3, or #4 — no `<Link>`/`navigate()`
target anywhere in `src/` pointed at `/cartilla/binder`, `/print/*`, or
`/cartilla/teacher/print`.

Also found, not archived here (out of scope — not one of the 4 named
duplicate implementations, a separate, pre-existing dead-code pocket):
`src/components/print/AnswerKeyBlock.tsx`, `ExerciseHandout.tsx`,
`HomeworkSlip.tsx` — confirmed via grep to have zero importers anywhere,
including the archived binder cluster. Left in place; flagged for a
future, separately-scoped dead-code pass.

If binder's PDF-export approach or the print/$lessonId per-lesson
preview layout are ever wanted, port the specific feature into the real
`/cartilla/imprimir/*` deliberately — don't just move these files back
to `src/routes/`.
