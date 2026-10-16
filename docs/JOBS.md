# JOBS.md — job board (owner standing orders 2026-10-16)

Shared coordination board for both controllers (Muse and Instinct). Kept current on GitHub after every lane event: dispatch, report, merge, block.

One PR per lane. Lanes push branch + report only, never merge. Picture changes are never merged without owner approval. "Done" is never claimed without a link that proves it.

| JOB | STATUS | PR LINK | PROVEN | NOT PROVEN | NEEDS FROM OWNER |
|---|---|---|---|---|---|
| Lane 1 — Index cards wording | DONE | PR #875 (merged b7f2168) | New titles verified in src/lib/lesson-catalog.ts on main: Card 1 "Las vocales: A E I O U", vowels "La vocal O", consonants "La consonante Mm" ("La consonante Rr" for rr). Subtitles unchanged; 19/22/24 keep short sets (already in consonants.json). lesson-meta.ts untouched. | How the cards look on the live site (Vercel not deploying — see Vercel row). | — |
| Lane 2 — Lesson 3 archetype (layout, images, quality, pencil + eraser, voice) | IN PROGRESS | Jules 4554014884223712015 → PR on branch lane2/lesson-3-archetype | Plan confirmed by lane 10:57 EDT; controller approved 11:05 EDT (CSS-file background for n===3, no further questions); lane resumed IN_PROGRESS 11:08 EDT. | — | — |
| Lane 3 — Lesson 24, working backward (same standard as Lane 2) | IN PROGRESS | Jules 16616365503054503016 → PR on branch lane3/lesson-24-archetype | Lane asked 11:05 EDT whether to add illustrationSrc to page-layouts.json; controller answered 11:12 EDT: NO — shared file, no single lesson lane edits it; implement lesson-scoped (CSS class .cartilla-lesson-bg-24) and REPORT the gap. Answer #1 delivered; watching for resume. | — | — |
| Lane 4 — Voice: map the 40 instruction sentences to lessons where clean audio exists | FAILED — NO DELIVERABLE | Jules 15535474936784204385 (COMPLETED 11:09 EDT with empty changeset: no branch pushed, no report) | — | — | Controller/owner decision: re-dispatch or drop. Standing rule: no silent re-dispatch of failed lanes. |
| Lane 5 — Flip chart look | BLOCKED | — | — | — | Owner's pick of the look — no lane until he chooses. |
| Vercel ↔ GitHub connection (not a lane) | BLOCKED | — | — | — | Production deploy intentionally stays off during active work (project policy); current live build is 2026-10-03. GitHub→Vercel reconnect is the owner's call at the release gate. |
| Carryover (morning queue): readable text on Practica / Repaso / Mi progreso | IN PROGRESS | lane session 4752644656033964851 | Actively working as of 11:09 EDT. | — | — |

## Lane file rules
- Each lesson lane works only on its own lesson's files.
- Only Lane 1 may edit lesson-meta.ts and consonants.json. No other lane touches them.
- page-layouts.json is SHARED (Lane 2 and Lane 3 both read it) — no lesson lane edits it; gaps get reported to the controller for central reconciliation.
- Owner-intake originals (public/cartilla/art/owner-intake/) are never modified.
- Never replace owner-verified artwork with AI-generated images.

## Updates
- 2026-10-16 ~10:45 EDT: board created; Lane 1 done (PR #875 merged).
- 2026-10-16 ~10:50 EDT: Lanes 2/3/4 dispatched (Jules sessions above).
- 2026-10-16 ~11:05 EDT: Lane 2 asked plan confirmation (10:57 EDT); controller approved on owner's behalf (CSS-file background for n===3, proceed to implement, no further questions) — answer #1. Lane 2 resumed IN_PROGRESS 11:08 EDT.
- 2026-10-16 ~11:07 EDT: PR #876 (this board) merged to main; Codex bot's 4 review threads resolved (each conflicted with an explicit owner standing order) — resolution recorded.
- 2026-10-16 ~11:09 EDT: Lane 4 COMPLETED with EMPTY changeset — no branch pushed, no report. Marked FAILED-NO-DELIVERABLE; not re-dispatched.
- 2026-10-16 ~11:12 EDT: Lane 3 asked (11:05 EDT) whether to edit page-layouts.json for illustrationSrc; controller answered NO (shared file, Lane 2 also reads it) — implement lesson-scoped, report the gap. Answer #1 delivered.
