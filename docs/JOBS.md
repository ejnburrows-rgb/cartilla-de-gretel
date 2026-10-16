# JOBS.md — job board (owner standing orders 2026-10-16)

Shared coordination board for both controllers (Muse and Instinct). Kept current on GitHub after every lane event: dispatch, report, merge, block.

One PR per lane. Lanes push branch + report only, never merge. Picture changes are never merged without owner approval. "Done" is never claimed without a link that proves it.

| JOB | STATUS | PR LINK | PROVEN | NOT PROVEN | NEEDS FROM OWNER |
|---|---|---|---|---|---|
| Lane 1 — Index cards wording | DONE | PR #875 (merged b7f2168) | New titles verified in src/lib/lesson-catalog.ts on main: Card 1 "Las vocales: A E I O U", vowels "La vocal O", consonants "La consonante Mm" ("La consonante Rr" for rr). Subtitles unchanged; 19/22/24 keep short sets (already in consonants.json). lesson-meta.ts untouched. | How the cards look on the live site (Vercel not deploying — see Vercel row). | — |
| Lane 2 — Lesson 3 archetype (layout, images, quality, pencil + eraser, voice) | IN PROGRESS | Jules 4554014884223712015 → PR on branch lane2/lesson-3-archetype | — | — | — |
| Lane 3 — Lesson 24, working backward (same standard as Lane 2) | IN PROGRESS | Jules 16616365503054503016 → PR on branch lane3/lesson-24-archetype | — | — | — |
| Lane 4 — Voice: map the 40 instruction sentences to lessons where clean audio exists | IN PROGRESS | Jules 15535474936784204385 → PR on branch lane4/instruction-voice-mapping | — | — | — |
| Lane 5 — Flip chart look | BLOCKED | — | — | — | Owner's pick of the look — no lane until he chooses. |
| Vercel ↔ GitHub connection (not a lane) | BLOCKED | — | — | — | Vercel is not connected to GitHub: pushes to main do not deploy. Needs the owner in the Vercel dashboard. |
| Carryover (morning queue): readable text on Practica / Repaso / Mi progreso | IN PROGRESS | lane session 4752644656033964851 | — | — | — |
| Lesson 3 owner-voice only (swarm) — ONLY his original recordings, no generated voice, no merge | IN PROGRESS | branch voice/lesson-3-owner-only (off PR #866 branch) → draft PR | — | — | — |

## Lane file rules
- Each lesson lane works only on its own lesson's files.
- Only Lane 1 may edit lesson-meta.ts and consonants.json. No other lane touches them.
- Owner-intake originals (public/cartilla/art/owner-intake/) are never modified.
- Never replace owner-verified artwork with AI-generated images.

## Updates
- 2026-10-16 ~10:45 EDT: board created; Lane 1 done (PR #875 merged).
- 2026-10-16 ~10:50 EDT: Lanes 2/3/4 dispatched (Jules sessions above).
- 2026-10-16 ~14:20 EDT: Lesson 3 owner-voice swarm launched (new job).
