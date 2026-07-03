# Cartilla de Gretel — Claude Code Instructions

## What This Is
Spanish literacy app for young children (ages 4-7).
Gretel is an animated guide character who reacts to student actions.
Students work through a 95-page interactive workbook (cartilla).
Teachers create classes, assign students, and track progress via Supabase.

## Stack
- Vite + React + TypeScript
- TanStack Router (file-based routing — src/routes/)
- Supabase (auth + database)
- src/routeTree.gen.ts is AUTO-GENERATED — never edit manually

## Directory Map
- src/routes/        → all pages (file-based routing)
- src/components/    → shared UI components
- src/features/      → feature modules
- src/services/      → all Supabase calls go here
- src/integrations/  → Supabase client init
- src/context/       → React context providers
- src/data/          → static lesson/content data
- src/types/         → TypeScript types
- public/cartilla/images/gretel/poses/ → PRODUCTION Gretel assets (do not move)
- scratch/           → working files, not production

## Hard Rules
- NEVER edit src/routeTree.gen.ts manually
- NEVER hardcode localhost URLs — always use import.meta.env
- ALL Supabase calls go through src/services/ only
- NEVER delete files — move or rename only
- NEVER refactor working code unless explicitly asked
- NEVER touch Gretel animation state machine without explicit approval
- Confirm before any change touching more than 3 files at once
- sessionStorage is a placeholder — student data must go to Supabase
- All env vars use import.meta.env (Vite)

## Start Every Session Like This
1. Read this file
2. Read package.json and src/main.tsx
3. Summarize what you find
4. Wait for task assignment before making any changes

## Talking to the Owner
- The project owner is not a programmer. Explain things in plain, everyday
  words — no tech jargon (no "routes," "branches," "deploy," "backend,"
  etc. without explaining what that means in real terms). Say what
  something does for the app/the kids/the teachers, not how it's built.
- Whenever the owner says "memorize" something, actually write it into this
  file right then, every single time — don't just acknowledge it in chat
  and move on.

## Owner's Urgency (memorized July 2026)
The owner is way behind schedule and has zero patience left for busywork or
back-and-forth. Antigravity has repeatedly claimed fixes that turned out to
still be broken — the owner will not tolerate more of that. Move fast, verify
everything myself before saying it's done, and don't waste the owner's time
relaying anything I haven't personally checked.

## Working Style — Never Stall
- Do not stop working and wait for a reply unless the owner says to stop
  right now. Keep finding and doing the next unblocked thing.
- Only report a piece of external work (Antigravity, another agent) as
  "done" once independently verified — never relay a self-report as
  fact. Report back the moment that verification is actually confident,
  not on a timer.
- The owner also has Fable 5 and another non-coding-but-code-capable agent
  available. Only hand them a prompt when genuinely confident it's a
  well-scoped, independent piece of work worth parallelizing — don't
  invent busywork for them just to seem productive. Otherwise, say so
  plainly and keep working solo.
- Never end a turn by just waiting idle. Always leave the owner with either
  (a) concrete next-step prompts they can hand to their other agent
  (Antigravity) or act on themselves, or (b) continued work of your own.
- When blocked on an external dependency (e.g. art delivery), don't just
  report and stop — find and execute the next unblocked piece of work
  yourself, and say what it was.
- Default to action over asking, once you have enough information to make
  a reasonable call.
- When something needs to go back to Antigravity (or anyone else), give
  ONE complete, consolidated, copy-pasteable list of everything outstanding
  — every known bug, every missing word, every gap — in a single message.
  Never dole it out piecemeal across multiple turns/rounds; the owner is
  relaying these by hand and re-checking every round costs them real time.
- Every single time something needs to go to Antigravity, write it as an
  actual ready-to-paste prompt (direct instructions Antigravity can act on
  immediately), not just a description of the problem — the owner copies
  these over by hand, so make it something they can paste as-is.
- Don't ask the owner small clarifying questions when a reasonable default
  exists — pick it, act, and say what you picked. Save questions for real
  decisions only.

## Reading Experience Redesign (memorized July 2026)
The owner rejected the reconstructed-page look: it read as a "cheap scan,"
not a real product. Decisions made, now locked in:
- The workbook pages must become **real interactive exercises** — kids tap
  to circle pictures, mark an X, trace a line — not just look at pictures.
  This is NOT a passive "reading CRM." Scope: student workbook view only;
  teacher's flipbook/paginas views stay read-only previews.
- **Grading is real from day one** — correct/incorrect interactions log to
  Supabase like the existing lesson exercises (reuse Ejercicios.tsx's
  existing pattern, don't invent a new one).
- **Rollout**: pilot on Lección 1 first, get sign-off, then batch the rest —
  same discipline as the original page-by-page digitization.
- **Palette stays book-faithful only** — teal/white/Andika tokens already in
  src/styles.css (--book-teal, --book-paper, --book-ink, etc.). Never pull
  the landing page's blue/orange brand colors into the actual page content
  or its chrome. "Premium" means better craft inside the book's own look.
- Root cause of a scrollbar bug found along the way: `.faithful-page` sizes
  itself via `aspect-ratio` + container queries; any wrapper that forces a
  fixed pixel/viewport height instead of an aspect-ratio breaks that and
  produces a stray native scrollbar. Always size faithful-page wrappers by
  aspect-ratio (see StudentWorkbookFlip.tsx's working pattern), never by
  fixed height.
- Before building any large visual change like this, make a quick mockup
  (Artifact) first so the owner can react before real code gets written —
  worked well here, keep doing it for future visual asks.

## Current Status (July 2026)
✅ Landing page with desk scene
✅ Workbook with 95 pages
✅ Gretel compositing (GretelStage, GretelGuide)
✅ Gretel reactions — event-driven via src/lib/gretel-bus.ts (lesson:start,
   answer:correct/wrong, lesson:complete, activity:complete, etc.), wired
   from real student actions across Ejercicios/DragBuildWord/InteractiveMiniGames
   /etc. NOT hardcoded to page numbers — that refactor is already done.
✅ Faithful page digitization (feat/faithful-pages, PR #48) — all 90 workbook
   pages transcribed with real text + book fonts/colors (PageRegion schema +
   FaithfulPageRenderer, src/data/page-layouts.json). Student workbook and
   teacher flipbook both render it automatically wherever hasPageLayout()
   is true, scan fallback otherwise. Illustrations: partial (verified real
   crops wired in as they arrive from the art pipeline; "art pending" shown
   honestly elsewhere — see public/cartilla/art/faithful/manifest.json).
✅ Student login — real Supabase flow at /cartilla/unirse (join class by
   code, src/lib/student.functions.ts + student-session.ts), zod-validated.
   Landing page now links here (was pointing at a dead sessionStorage-only
   stub — fixed in PR #49). NOT wired up in THIS environment (no
   VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY configured — check before
   assuming it's broken; it's an env problem, not a code problem).
✅ Teacher login + class management — real Supabase auth (src/routes/login.tsx)
   + full class/student CRUD (src/lib/teacher.functions.ts: listClasses,
   createClass, addStudents, getClassProgress, etc.) under
   src/routes/_authenticated/. Same credentials caveat as above.
✅ Cloud progress sync — src/lib/assignments.functions.ts +
   log_student_progress/get_student_progress RPCs already implemented and
   called from the real student flow. Same credentials caveat as above.
⚠️  None of the three above have been tested end-to-end against a live
   Supabase project in a session yet — only verified by reading the code
   + existing unit tests (student.functions.test.ts). First real test needs
   VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (local .env + Vercel).
