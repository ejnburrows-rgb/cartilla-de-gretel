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

## Notion Sync — permanent rule (memorized July 2026)
Claude is connected to the operator's Notion via MCP. Notion is maintained by
the operator's Notion agent and is the shared source of truth between us.
- **At the start of every session**, read from Notion: (1) "La Cartilla de
  Gretel Hub" — Launch definition (locked 7/9), Hard-coded rules block,
  Status snapshot (verified 7/9), Current 3 next actions — these override any
  older assumptions; (2) when lesson TEXT/vocab is in question: "📖 Lessons ·
  47 Pages" and "🎮 Activities & Games · 26 Pages" — canonical, never invent
  past them; (3) when teacher-guide content is in question: "📘 Step 4 ·
  Teacher's Guide" (canonical for L1-16; L17-24 status tracked there); (4)
  when visual/art rules are in question: "Visual Direction — Locked Canon"
  and the Gretel canon table in the Hub.
- **READ-ONLY**: never create, edit, or delete anything in Notion. The
  Notion agent maintains those pages; Claude's writes go to the repo only.
- **Precedence**: Hub hard-coded rules > CLAUDE.md > SPEC.md > code comments.
- If the repo contradicts Notion, do not silently pick one — put it in the
  WRONG-IN-DOCS section of the session digest so the operator can have the
  Notion agent reconcile it.
- Do not re-read all pages mid-session; once per session is enough (token
  discipline).

## Standing orders (memorized July 2026)
Agents create a branch, open a pull request, SHOW THE WORK, and STOP. Only
EJN approves and merges pull requests. AGENTS.md overrides every
conflicting instruction in this repository.

## Automatic per-turn rule — Anti-Gravity check-in (memorized July 2026)
At the START of every single turn — no matter what the owner's message says,
even mid-task — automatically, without being asked:
1. Fetch `feat/content-extraction` and check for new Anti-Gravity pushes
   since the last check (new commits, new AG-STATUS.md entries).
2. If there's anything new: verify it (validators, spot-check against
   source, no invented content, no forbidden paths touched) and confirm in
   plain language what AG pushed, whether it's good, and what was done
   with it.
3. If there's nothing new since last check, say so in one line ("AG: no
   new pushes since <last sha>") and move on.

At the END of every turn — also automatic, also unprompted:
4. A fresh copy-paste AG prompt matched to the current state (never
   "nothing for AG" — minimum is a verification pass).
5. A copy-paste prompt for the owner's own next session.

Never skip this, never ask whether the owner wants it.

## What This Is
Spanish literacy app for young children (ages 4-7).
Gretel is an animated guide character who reacts to student actions.
Students work through a 95-page interactive workbook (cartilla).
Teachers create classes, assign students, and track progress via Supabase.

## CANON FACTS (memorized July 2026 — override any conflicting assumption)
- **Page count is NOT a magic number.** The physical book is a real printed
  book: it may contain blank pages, cover pages, or filler. Do NOT chase a
  fixed total like "92" (or "90" or "95"). The truth is whatever the source
  PDF/scans actually contain that is worth digitizing. Every page with real
  content gets digitized; blank/filler pages get logged in SPEC.md as
  SKIPPED-BLANK (with the page number) and are NOT counted as gaps.
  Completion = 100% of *content* pages, not a magic total.
- **The two products are never mixed** (this is not complicated):
  - **TEACHER FLIPCHART/FLIPBOOK** = the teacher's tool. The teacher uses it
    to PRESENT and share lessons with the whole class (projection /
    front-of-class). It lives in the TEACHER LANE only.
  - **STUDENT WORKBOOK** = the students' book. Students work in it
    individually (exercises, tracing, practice). It lives in the STUDENT
    LANE only.
  Student screens never show flipchart material; the flipchart view never
  shows student workbook exercises.

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
  (one scoped approval granted July 2026 — see "Characters must be ALIVE"
  section: wiring the 7 delivered frames is approved; anything beyond that
  still requires new approval)
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
- **Standing orders on merging (memorized July 2026):** Agents create a
  branch, open a pull request, SHOW THE WORK, and STOP. Only EJN approves
  and merges pull requests. AGENTS.md overrides every conflicting
  instruction in this repository.
- **Always show 3-5 pages of progress (memorized July 2026):** whenever
  work touches pages/visual content, show the owner 3-5 real
  screenshots/pages actually worked on (not just a text description) so
  they can see the progress directly — send them as files
  (SendUserFile), not just describe them in words. Do this every time,
  not just when asked.
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
- **Owner does not do manual work (memorized July 2026):** The owner does
  not crop images, edit JSON, run terminal commands, or do any production
  task by hand. Everything is automated or done with coding tools. **Antigravity
  owns art extraction end-to-end** (scripts, crops, manifest, PR). Grok/Claude
  owns visual QA, takeover on AG failure, and wiring `illustrationSrc` after
  each art PR passes. Never tell the owner to hand-crop, open an image editor,
  or run commands themselves — always give Antigravity complete, paste-ready
  prompts it can execute autonomously.
- **Always ship a 0%→100% checklist (memorized July 2026):** every multi-step
  goal gets an explicit percent-tracked list of everything left to reach done —
  no implied steps, no guessing. Ask the owner only when MD files lack the answer.
- **Grok work groups — nonstop rotation (memorized July 2026):** Grok cycles
  without owner pings: **A** watch GitHub for `feat/consonant-art-l*` PRs;
  **B** visual QA every webp; **C** takeover crop if Antigravity fails;
  **D** wire `consonants.json` after pass; **E** unblocked backlog (Gretel,
  docs) while waiting. Never merge rejected branches; never touch `leccion-1/`
  or `vocal-*/`.
- **Antigravity parallel lanes (memorized July 2026):** consonant crops split
  into 3 lanes — L7–12, L13–18, L19–24 — one HEADER + one LANE prompt per
  Antigravity session, one PR per lesson per lane.

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
- **Whenever waiting on another AI agent, always hand over a ready-to-paste
  prompt for it — every single time, no exceptions (memorized July 2026).**
  Never just report "blocked on Antigravity" and stop. Do not stall waiting
  on the owner's reply either — be proactive, not reactive: check real state
  yourself first (git log/diff, file contents — not the other agent's
  self-report), then hand over the prompt in the same turn, whether or not
  the owner asked for one this time.
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
- **Standing orders on merging (memorized July 2026):** Agents create a
  branch, open a pull request, SHOW THE WORK, and STOP. Only EJN approves
  and merges pull requests. AGENTS.md overrides every conflicting
  instruction in this repository.

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
  faithful crop. (July 2026 update: the owner has now approved ONE scoped
  exception — see "Characters must be ALIVE": living creatures in book
  illustrations may get generated blink frames derived from the real book
  art.)
- **Wording will need to change, but not yet.** The book's printed
  instructions say things like "Circula los dibujos" (circle the
  pictures) — that verb doesn't make sense once it's a tap/click
  interaction on a screen. Eventually these need to become
  computer-appropriate verbs (e.g. "Presiona los dibujos" instead of
  "Circula los dibujos"). Owner's call: **don't touch the wording yet** —
  get all the real art in place first, tackle instruction-text rewording
  as a later, separate pass.

## Visual direction — ActivityCarousel is REMOVED and ON HOLD, not live
## (corrected July 2026)
**Correction to an earlier version of this section**, which described an
"already-live 'Actividades' section (`ActivityCarousel.tsx`, rendered from
`leccion.$n.tsx` under every vowel lesson)." That stopped being true in the
July 12 rewrite: the owner rejected showing generic games unattended
(SPEC.md, "'Ejercicios Interactivos' step removed from every lesson"), and
`leccion.$n.tsx` now renders only the book's real pages, one at a time — no
tabs, no games carousel, no `ActivityCarousel` reference anywhere in that
route. `ActivityCarousel.tsx` and its game components (`SyllableTap`,
`DragMatchPairs`, `DragBuildWord`, `DragLetterTrace`, `PianoPronunciation`)
still exist in the repo per the never-delete-files rule, but they are
**unwired dead code**, not rendered anywhere a student can reach.

The owner's stated visual preferences below are kept for whenever this work
resumes — they describe a past design discussion, not the current app:
- The owner compared an early teal/white book-faithful mockup for on-page
  exercises to this same (then-live) colorful games style and preferred the
  colorful one (bright accent colors, rounded chip buttons, Gretel present)
  over the strict teal/white look, for that mockup decision.
- The old carousel's games used emoji (🍎, 🐘, etc.) instead of real book
  art; if/when this section is rebuilt, it should use real cropped book
  illustrations instead, matching the "never invented art" rule.
- **July 2026 owner directive, still in force:** the Activities/games
  section (the owner calls it "the channel") must be **REVAMPED
  COMPLETELY** when the owner asks for it. Do not start the revamp
  unprompted, and do not spend time patching the old, unwired carousel in
  the meantime — when the owner says go, it's a full redesign from
  scratch, not a resurrection of the old component.

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
- **Gretel pose investigation is now complete.** Confirmed: only 5 poses
  exist in the repo (public/cartilla/images/gretel/poses/: idle, cheer,
  point, talk, wave). No additional uploaded images found anywhere in
  public/. The 5-pose system is all we have right now. For richer
  animation (talk mouth frames, wave arm frames, cheer variants, blink)
  new frames need to come from an image-gen agent (Prompt 2 in active
  plan) — not from the owner's prior uploads, which are simply not there.
  (July 2026 update: those frames HAVE now been delivered — see next
  section.)
- Owner's own words, verbatim, for tone/urgency: "You are below
  expectations. You're doing a half-assed job. You're not doing what you
  planned, what you promised, what I mentioned." Take this seriously —
  re-analyze everything, do deep research, ask real clarifying questions
  before building more, don't just re-guess and ship again.

## Characters must be ALIVE — current Gretel treatment rejected (memorized July 2026)
The owner reviewed the current Gretel presentation and rejected it outright.
Their words: she is "just a stupid figurine bouncing up and down," with
"five poses just awkwardly there," she is "blocking the damn CRM for the
kids," and she is "saying nonsense for no reason." This is NOT to their
expectations. Standing rules from this feedback, effective immediately, for
every agent working on this repo:
- **Alive standard for every character:** anything living (Gretel, animals
  like a bear) must show organic, life-like animation — blinking,
  breathing, natural micro-movement — never just a vertical bounce loop.
  Only inanimate objects (a box, a ball) may use the simple up-and-down
  bob. A static pose image sliding or bouncing around the screen does not
  count as "animated."
- **Never block content:** Gretel (and any character or feedback element)
  must never cover or overlap the workbook page, exercises, or any part of
  the CRM the kids use. GretelLiveAvatar is now the standard component replacing GretelGuide, and uses fixed corner placement across all routes (login, student view, teacher view) to guarantee she never overlaps content.
- **No unprompted speech:** Gretel only speaks in reaction to a real
  student action or event (lesson start, correct, wrong, complete). No
  idle chatter, no random phrases "for no reason."
- Priority: ASAP — this is the owner's top visual complaint right now.

### Owner decisions, asked and answered directly (July 2026) — all locked in
1. **Frame wiring: APPROVED — "Yes, go now."** The owner gave the explicit
   go to wire the 7 delivered frames (gretel-blink, gretel-talk-0/1/2,
   gretel-wave-1/2, gretel-cheer-1) into the Gretel animation state machine
   (gretelMachine + GretelLiveAvatar.tsx): idle blink loop every few
   seconds, talk mouth frames cycling while she speaks, wave on lesson
   start, cheer on completion. This satisfies the "explicit approval" hard
   rule for THIS scoped work only; anything beyond it needs fresh approval.
2. **Placement: fixed corner spot.** Gretel lives in a dedicated fixed
   corner of the screen that never overlaps the page, the exercises, or any
   content — on EVERY surface. The owner confirmed she currently blocks
   content / misbehaves on the workbook pages, in the lesson games, and
   everywhere she appears — audit and fix every surface, not just one.
3. **Speech audit everywhere:** the owner sees her "saying nonsense for no
   reason" across all surfaces. Verify every trigger; anything that fires
   speech outside real student events (start/correct/wrong/complete) is a
   bug to remove.
4. **Voice: robot browser TTS stays for now.** Fix behavior first; real
   recorded human voice is a later, separate pass. Do not spend time on
   voice recording now.
5. **Blink frames for book creatures: APPROVED exception to the
   never-invent-art rule.** Generating new blink/idle frames for LIVING
   CREATURES in the book's illustrations is allowed, with strict limits:
   frames must be derived from the real book illustration of that same
   creature (same style, same colors, same creature — eyes closed / mid-
   blink variants only), never a newly invented character or redrawn scene.
   Inanimate-object crops keep the existing gentle float/bob only.
6. **"Channel" = the Activities/games section** (see the Visual direction
   section above) — full revamp queued for when the owner asks; not started.

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
✅ Workbook frame redesign (PR #88 + #93 + #95) — replaced wood-desk with
   a garden scene; PR #93 removed literal flower graphics (owner feedback);
   PR #95 replaced synthetic art with real feathered crops from
   gretel-authentic.jpg for the grass corners.
✅ Gretel spoken feedback (PR #94) — feedback is spoken via browser TTS
   (speakGretelPhrase in src/lib/gretel-tts.ts), never shown as on-screen
   text that could cover content. a11y-only hidden text kept for screen
   readers. Text bubble deleted entirely.
✅ Painted garden background on workbook pages (PR #99) — student workbook
   pages now use the real book painting (gretel-authentic.jpg) as a soft
   background (blurred, 22% opacity, lower garden/foliage area shown).
   CSS custom property --garden-page-bg is hot-swappable per lesson when
   dedicated backgrounds arrive. Teacher views unaffected.
✅ Vocab card grids with real art (PRs #97, #98, #46) — all 5 vowel
   lessons show painted illustration crops in the vocab card grid;
   consonant words for lessons 7-20 now show real art (verified and merged).
   Remaining consonant vocab words for L21-L24 await verification.
✅ Gretel pose investigation COMPLETE — confirmed only 5 poses exist on
   main (public/cartilla/images/gretel/poses/: idle, cheer, point,
   talk, wave). July 2026: 7 NEW animation frames (blink, talk-0/1/2,
   wave-1/2, cheer-1) delivered via PR #107 — owner approved wiring them
   in (see "Characters must be ALIVE" decisions).
✅ Illustration motion on static cells (faithful-page.css + FaithfulPageRenderer.tsx)
   — @keyframes fpFaithfulFloat + per-cell --float-delay offsets applied to
   all 4 static region types (picture-grid, vowel-match, vowel-pick, vowel-match-all).
   Teacher views and student workbook both show ambient floating motion;
   prefers-reduced-motion disables it fully. Shipped as part of PR #99 era.
   (July 2026: per the ALIVE standard, this float is now only correct for
   INANIMATE objects — living creatures need blink frames, see decisions.)
✅ Per-lesson garden background hot-swap infrastructure (PR #101) — PageFrame
   gains a `gardenBg` prop that sets --garden-page-bg inline; FaithfulPageRenderer
   defines a LESSON_GARDEN_BG mapping (empty for now, all lessons use interim
   gretel-authentic.jpg). Adding a dedicated lesson background once image-gen
   delivers art is a one-line change in that mapping.
