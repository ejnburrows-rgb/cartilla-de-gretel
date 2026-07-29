# Scrub report — 2026-07-29

What was done across the four phases, what it found, and what is left. Written
to be read top to bottom; the decisions that need you are gathered at the end.

Nothing here was merged. All four phases are open draft pull requests, because
every one of them turned up at least one thing that is yours to decide.

| Phase | Branch | PR | State |
|---|---|---|---|
| 1 — taught-order violation (#359) | `fix/decoy-syllable-order` | [#380](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/380) | Draft, green |
| 2 — secrets and minors' data | `chore/minors-data-and-secrets-audit` | [#381](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/381) | Draft, green |
| 3 — teacher & student flows | `test/teacher-and-student-flows` | [#382](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/382) | Draft, green |
| 4 — missing art, reconciled | `docs/art-reconciliation` | [#383](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/383) | Draft |

Issue **#356** (the garbled generated sign text on the welcome splash) was
skipped entirely, as instructed. Not looked at, not touched.

---

## The two things that need you most

**1. One guessed join code exposes every child in that class.** Phase 2, verified
live and anonymously. `enter_class_as_student` hands back a child's
`student_code` without ever being asked for it, and its sibling
`list_class_students` gives the roster from the join code alone. So the join
code is effectively the only secret — and both live classes use dictionary
codes (`GRETEL`, `NOVO26`) from the seed migration rather than generated ones.
That chain yields every child's name and full learning history in the class, and
permits writes as any of them. Nothing was changed: it is an authentication
change and it sits on real children's records, which `AGENTS.md` puts behind
your sign-off. Full detail in `docs/DATA-AUDIT.md` (PR #381).

**2. A child could not finish a lesson.** Phase 3. The lesson's bottom bar had no
`z-index` while the page body sits at `z-index: 1`, so the bar painted underneath
the content and an "ilustración pendiente" placeholder swallowed the tap on
"Marcar y siguiente". Measured in the browser: at 1280×900 on Lesson 1 the
button's centre returns the placeholder element, not the button. Fixed in #382.
This is the one fix in this scrub most likely to matter to a real child today.

---

## Phase 1 — the taught-order violation (#359)

**The violation you named is gone**, and it went in before this scrub via #373:
`silabas-o` no longer offers `sa` and `lo` at the vowel stage.

**The real deliverable — a test that catches this class of bug — is in #380.**
It derives the teaching order from `lesson-meta.ts` rather than restating it, so
there is one copy of the lesson order and the test reads it; it covers every game
on disk via `import.meta.glob` rather than a fixed list, so a new game is covered
the day it lands; and it was mutation-tested three ways, including dropping in a
brand-new game file with bad decoys without touching the test, to prove it can
actually fail.

The two you called defensible (`silabas-m`, `silabas-p`) were left alone.

**Content decisions for you.** You asked about `sopa`; walking every lesson found
it is one of five word-forced cases, which is why the set is worth seeing rather
than just the one:

| Game | Lesson | Word | Syllable | First taught |
|---|---|---|---|---|
| `silabas-o` | 2 | `oso` | `so` | 9 |
| `silabas-o` | 2 | `ola` | `la` | 12 |
| `silabas-o` | 2 | `oveja` | `ve`, `ja` | 16, 21 |
| `silabas-m` | 7 | `mono` | `no` | 13 |
| `silabas-p` | 8 | `sopa` | `so` | 9 |

`sopa` is at `src/content/games/syllable-builder-pilot.ts:78`, and its image is
borrowed from `leccion-9-s/sopa.webp` — a child at lesson 8 sees art from lesson
9. The three vowel-lesson cases are structural (no Spanish word is spellable from
vowels alone). `mono` and `sopa` are not: both sit at a consonant lesson and
reach ahead, and `mono` reaches six lessons further than `sopa` does. **No word
list was changed.** All five are recorded so they cannot grow silently.

Also worth a decision: `lesson-meta.ts` records lesson 1 with `syllables: []`,
but the book's own teacher guide for lesson 1 says the children will read the
five vowels (`src/content/guia/lesson-1.json:10`). The test treats the vowels as
taught in lesson 1 on that basis — without it, the `a`/`e` decoys that #373
introduced would themselves read as violations.

---

## Phase 2 — secrets and minors' data

`docs/DATA-AUDIT.md`, tiered Blocker / High / Cleanup. **Nothing was changed and
no policy was loosened.**

**Both things you asked me to confirm came back clean.**

- **No service-role key reaches the browser.** Checked against a real `vite
  build`, not just source: no `service_role`, `sb_secret_` or JWT anywhere in
  `dist/`. The inlined key is `sb_publishable_…`. The service-role key appears
  only in `supabase/functions/delete-teacher/index.ts:44` via `Deno.env.get` —
  the correct place. One correction to your brief: a third `VITE_` var exists,
  `VITE_ALLOW_DEMO_MODE`. It is not a secret and is compiled out of production.
- **No table holding student data is unprotected.** All 10 live tables have RLS
  on with at least one policy, every one scoped to `auth.uid() = teacher_id`, an
  ownership join, or an admin role check. **No policy uses `using (true)`.** A
  direct anonymous table read is refused.

**But RLS is not where the risk is.** Children cannot sign in, so the student
lane runs through eight `SECURITY DEFINER` functions that bypass RLS by design
and are callable anonymously. That design is defensible; one function is not —
see the Blocker at the top of this report.

Beyond that: retention is **forever** — no cron, no triggers, no purge logic
anywhere. `students.teacher_notes` is unbounded free text about a named child,
and `progress_events.meta` stores arbitrary client JSON against a child. Both are
reported, not changed; retention is your decision, as you said.

No child's name, code or record appears in the audit document or its PR — only
counts, field names and yes/no answers.

---

## Phase 3 — the two flows that actually matter

Both flows now run in a real browser, in the existing Playwright setup. Four
specs, green:

```
playwright test    4 passed
vitest run         85 files, 1180 passed, 2 expected fail
tsc --noEmit       clean
eslint             0 errors
pnpm build         green
```

- **Teacher** — create a class → read its join code → add a student → see that
  child's progress. Runs on the demo lane with **nothing stubbed**.
- **Student** — join with the class code → tap your name → open the assigned
  lesson → finish it → progress saved → still there after a reload. The reload
  check deliberately wipes the browser's local progress first, so the only way
  the lesson can still read as done is the round-trip to the backend.

**Two real bugs found by writing them**, both fixed in #382: the lesson bottom
bar described at the top of this report, and the CRM not refreshing after
creating a class — the class was written, but the screen kept saying "create your
first class" until a manual reload, so a teacher would reasonably click "Crear"
again and end up with duplicates.

**What I could not automate, and why.** Two steps, both structural:

1. **The teacher cannot create an assignment on the demo lane.** `TaskList.tsx`
   deliberately calls the live Supabase path — its own comment says "never the
   local seed-data mock" — and it cannot be stubbed around either, because
   `listAssignments` validates `classId` as a UUID and demo class ids are not
   UUIDs. Related: `createSeedAssignment` exists in `seed-data.ts:571` and **no
   UI calls it** — it is dead code. The student half (that an assignment reaches
   the child and renders) *is* covered.
2. **The student lane has no demo branch at all** — `student.functions.ts` always
   calls Supabase. So its spec runs against a fake of the six student RPCs. The
   screens, routing, session handling, schemas and payloads are all real
   production code; only the database is a fixture. Docker is not available in
   this environment, so a local Supabase was not an option, and the live project
   was out of the question.

**Worth knowing:** the `.env` in this repo points at the live project. Before
this change, an end-to-end run that touched the student lane would have written
to the database holding real children's records. The test server is now pinned to
a dead address and the fake throws if anything ever addresses a real Supabase
host.

---

## Phase 4 — one honest list of missing art

`docs/ILUSTRACIONES-QUE-FALTAN.md`. **16 cells across 6 words** — `abeja`,
`aguja`, `abrigo`, `remolino`, `globo`, `oruga` — each listed with its lesson,
the book page, and the exact path a replacement must land at. **Zero broken image
references anywhere in the app.**

I did not merge the two old documents, because merging them would inherit their
errors — `ART_BACKLOG.md` contains a section titled "FULL AUDIT COMPLETE" that
later sections retract. The gap was recomputed from the code instead and the
documents used only as cross-checks. It reconciles: the backlog's latest entry
says 18 cells / 7 words, and the difference is exactly `escoba`, which that same
entry reports as fixed.

All six words already have a file at the path given, and **every one of those
files failed visual QA** — they were deliberately unwired so the app shows the
honest placeholder rather than bad art. So the work is a crop that passes QA at
the same path, then wiring. `ART_BACKLOG.md` also records that all 62 flipchart
pages were searched and none of the six appears there, so these may not be
croppable at all — which is a decision for you, not more searching.

**One live defect, flagged not fixed:** `vocal-i/iglu.webp` carries a QA verdict
of FAIL and **is still wired**, rendering on six pages across lessons 2–5. It is
the only failed file still wired. Not stale QA — the file dates from 2026-07-20
and the QA run from 2026-07-25. It is art, so I changed nothing.

Both old documents are kept with a banner marking them history; `AGENTS.md`
named `ART_BACKLOG.md` as authoritative in four places and now points at the new
list.

---

## Everything waiting on you

**Blockers — live right now, on real children's data**
1. Whether `enter_class_as_student` should stop returning `student_code`. The one
   change that breaks the exposure chain. Auth change, and it may affect the
   tap-to-login flow.
2. Whether the two live classes should be reissued generated join codes. They
   currently hold 7 students, and the codes are dictionary words.

**Content — I changed nothing**
3. `sopa` (lesson 8, needs `so` from lesson 9, art borrowed from lesson 9) and
   `mono` (lesson 7, needs `no` from lesson 13). Same problem; `mono` reaches
   further.
4. Whether `lesson-meta.ts` should record that lesson 1 teaches all five vowels,
   so it agrees with the book's own teacher guide.

**Art — I changed nothing**
5. Whether the six words can be sourced at all, given the flipchart search found
   none of them.
6. `iglu.webp` — the failing image currently on screen on six pages.

**Product**
7. What `teacher_notes` is for. Empty today, and the field most likely to
   accumulate the most sensitive material in the system, with no purpose limit.
8. How long a child's progress should be kept after they leave a class. Today:
   forever.
9. Whether the demo lane should be able to create assignments, or whether that
   panel should be hidden there.

---

## What is still not done

- **Nothing is merged.** Four draft PRs await your review.
- **No reviewer-agent verdict** on any of the four — no second agent has looked
  at them.
- **No fix for anything in Phase 2.** Deliberate: report-only was the brief, and
  both Blockers need sign-off.
- **The teacher-side creation of an assignment is untested**, for the structural
  reasons above.
- The 24 lessons' `page-layouts.json` exercises are not walked for taught-order —
  the Phase 1 guard covers game content only.
- Issue #356 untouched, as instructed.
