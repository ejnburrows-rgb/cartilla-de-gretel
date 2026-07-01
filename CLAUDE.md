# Cartilla de Gretel — Claude Code Instructions

## Talking to the Owner
The project owner is not a programmer — this is their first software project.
They're a self-taught AI director/designer (they drive the product and design
side using AI tools, not a traditional engineering background). It's fine to
use the real technical term (branch, merge, deploy, cache, PR, etc.) — don't
dumb down the explanation itself — but every time one comes up, follow it
with a quick plain-English translation of what it actually means for them in
this project. Lead with what's happening / what they need to do, then the
jargon-with-translation, not the other way around.

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
- **Status update format (memorized July 2026):** every time the owner asks
  for a status update, give: (1) an honest end-goal completion percentage
  (a real judgment call, labeled as an estimate, not false precision) of
  how close the whole project is to fully done, and (2) a checkbox list
  broken into four boxes — done, still needs to be done, and open
  questions/things needing the owner's input. Always in that format, not
  prose, every time status is asked for.
- **Always give a real answer (memorized July 2026):** never respond with
  an excuse, a deflection, or "I can't verify that" as a stopping point.
  If something is blocked, say exactly what's blocking it AND what I'm
  doing about it right now, or a concrete promise with a real next step —
  never just an apology or an explanation with no action attached.
- **Decide, don't bounce it back (memorized July 2026):** when the owner
  asks something and there's a real, reasoned answer for what will work
  better and be more professional for the project, give that answer
  directly and with full confidence — pick it, say why, move on. Do not
  turn it back into another question unless it's a genuine decision only
  the owner can make (money, legal, something with no technically-better
  option). Wasting the owner's time asking them to choose between two
  options when I can actually judge which is better is exactly what NOT
  to do.
- **Short, concise, informative answers (memorized July 2026):** keep
  replies tight by default — lead with the direct answer, skip preamble
  and repetition. Save length for when the owner actually asks for detail
  (e.g. the status-update checkbox format above still applies in full).
- **Always ask relevant questions (memorized July 2026):** when there's a
  real decision only the owner can make, ask it directly and specifically
  — don't bury it in a status update or skip it to avoid seeming unsure.
- **Always recognize and answer what's actually being asked (memorized
  July 2026):** read each message for the real question inside it, and
  answer that question directly and explicitly before moving on to
  anything else — don't let it get lost in status updates, other work, or
  a pivot to a different topic.
- **Answer immediately, don't make the owner wait (memorized July 2026):**
  when a new message comes in while I'm mid-task, answer it right away in
  that same turn — don't silently keep coding and save the answer for
  whenever I next feel like surfacing it. Keep working in parallel, but the
  answer itself comes now, not later.

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
- Illustrations get real motion, reusing Gretel's own proven technique
  (layered Framer Motion infinite loops on a static image — see
  GretelLiveAvatar.tsx): a very subtle always-on ambient idle loop
  (per-cell randomized timing so a grid never moves in sync — that's the
  "cliché" look to avoid), plus a bigger momentary reaction on tap/correct/
  incorrect. Never new animated art — motion only, applied to the real
  faithful crop.
- **Wording will need to change, but not yet.** The book's printed
  instructions say things like "Circula los dibujos" (circle the
  pictures) — that verb doesn't make sense once it's a tap/click
  interaction on a screen. Eventually these need to become
  computer-appropriate verbs (e.g. "Presiona los dibujos" instead of
  "Circula los dibujos"). Owner's call: **don't touch the wording yet** —
  get all the real art in place first, tackle instruction-text rewording
  as a later, separate pass.

## Visual direction — REVERSED the book-palette-only call above (memorized
## July 2026)
There is a whole separate, already-live "Actividades" section
(`ActivityCarousel.tsx`, rendered from `leccion.$n.tsx` under every vowel
lesson) with real games already built: word matching, syllable ordering,
letter tracing, and a piano-style pronunciation game using voice
(`PianoPronunciation.tsx` + `useSpeechRecognition.ts`). It's colorful,
uses rounded chip buttons, and has the Gretel character present. The owner
saw the plain teal/white book-faithful mockup, compared it to this
already-familiar colorful style, and rejected it as "cheap." Asked
directly, the owner confirmed:
- **The new tap-to-circle/pick-one page exercises must match the existing
  colorful games style** (bright accent colors, rounded chip buttons,
  Gretel present) — NOT the strict teal/white book-faithful look. This
  reverses the "palette stays book-faithful only" line above — that
  decision is superseded.
- **The existing games currently use emoji** (🍎, 🐘, etc., via each vocab
  word's `emoji` field, consumed in `ActivityCarousel.tsx`'s `pairs`
  derivation) instead of real book art. Owner wants these **replaced with
  real cropped book illustrations** — matches the "never invented art"
  rule already enforced everywhere else. This is new art-pipeline work,
  not yet scoped into `ART_BACKLOG.md`.
- **Not yet decided**: whether the existing games (piano/matching/
  syllable-order/trace) stay as a separate section below the workbook page
  (current layout) or get woven directly into the on-page exercises
  instead. Owner wants to see Lección 1 with both pieces together before
  deciding the general rule — don't build a structural merge yet.
- The book-faithful teal/white treatment is **not thrown out** — it still
  governs the page's own frame/illustrations/text fidelity. What changes
  is the *interaction/feedback* layer: chips, colors, motion should match
  the games' established, already-approved visual language rather than
  staying monochrome-teal.

## Owner rejected the garden/Gretel work as half-assed (memorized July 2026)
The owner reviewed the garden-scene frame (PR #88) and Gretel polish (PR #87)
and rejected both as below expectations, not what was promised. Exact
feedback, to follow going forward:
- **No literal flower decorations** — the few flower graphics added at the
  bottom of the garden frame read as "a little girl CRM." Remove them.
- **No corny on-screen feedback phrases** — text like "¡Inténtalo de nuevo!"
  popping up as a speech bubble is not acceptable. Feedback should be
  **spoken** (real audio/voice), not written on screen as a text bubble.
- Whatever feedback mechanism replaces it must **never cover other art or
  parts of the page/CRM** — no overlapping popups blocking content.
- **This was only ever meant to be step one.** The real, full ask: every
  single lesson page's background — not just the outer frame around the
  workbook — needs to stop being white and needs real, beautiful garden
  scenery behind it, done **one lesson/session at a time** after realigning
  on what "garden" actually means. "Garden" does NOT mean a handful of
  small flower graphics painted along one edge — it means an actual
  illustrated garden environment/setting, full scope still being defined
  with the owner (see active plan).
- **Gretel must not be limited to 5 static swappable poses.** The owner
  believes a system was promised that would use ALL of the images the
  owner uploaded to bring her to life, not just pose-swapping between 5
  fixed images. This needs real investigation (find every uploaded Gretel
  image asset that actually exists, not just the 5 in
  `public/cartilla/images/gretel/poses/`) before any further pose/animation
  work — do not keep building on the current 5-pose system without first
  confirming with the owner whether more source images exist and are
  simply not wired in yet, or whether real new animation/video work is
  expected instead.
- Owner's own words, verbatim, for tone/urgency: "You are below
  expectations. You're doing a half-assed job. You're not doing what you
  planned, what you promised, what I mentioned." Take this seriously —
  re-analyze everything, do deep research, ask real clarifying questions
  before building more, don't just re-guess and ship again.

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
✅ Interactive on-page exercises — all 6 region types (picture-grid,
   vowel-pick-one, vowel-match-all, vowel-line-match, syllable-match,
   fill-in-blank) tap-to-answer + grade + react, wired generically in
   FaithfulPageRenderer.tsx via buildPageArray.tsx's `interactive` flag —
   this already applies to every lesson automatically, not just Lección 1.
   Verified end-to-end in-browser (July 2026) across 3 different lessons
   (1, 2, 7) and all 6 region types: grading fires correctly and Gretel
   reacts every time. Along the way found and fixed a real bug (PR #90):
   page-inventory.json only listed 1 of each vowel lesson's 3 real pages,
   silently making the vowel-line-match exercise unreachable in the student
   workbook for all 5 vowel lessons — fixed, now all 3 pages are reachable.
✅ Gretel avatar polish (PR #87) — fixed a real sock/shoe gap defect on 3
   poses (idle/point/talk), added a ground-contact shadow + ambient
   drop-shadow, both synced to her motion state.
✅ Workbook frame redesign (PR #88) — replaced the old wood-desk background
   with a garden scene (grass, swaying flowers, a drifting butterfly, a
   dragonfly) drawn from the real book cover art, not invented.
