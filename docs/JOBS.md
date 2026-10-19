# JOBS.md — job board (owner standing orders 2026-10-16)

Shared coordination board for both controllers (Muse and Instinct). Kept current on GitHub after every lane event: dispatch, report, merge, block.

One PR per lane. Lanes push branch + report only, never merge. Picture changes are never merged without owner approval. "Done" is never claimed without a link that proves it.

| JOB | STATUS | PR LINK | PROVEN | NOT PROVEN | NEEDS FROM OWNER |
|---|---|---|---|---|---|
| Lane 1 — Index cards wording | DONE | PR #875 (merged b7f2168) | New titles verified in src/lib/lesson-catalog.ts on main: Card 1 "Las vocales: A E I O U", vowels "La vocal O", consonants "La consonante Mm" ("La consonante Rr" for rr). Subtitles unchanged; 19/22/24 keep short sets (already in consonants.json). lesson-meta.ts untouched. | How the cards look on the live site (Vercel not deploying — see Vercel row). | — |
| Lane 2 — Lesson 3 archetype (layout, images, quality, pencil + eraser, voice) | IN PROGRESS | Jules 4554014884223712015 → PR on branch lane2/lesson-3-archetype | Plan confirmed by lane 10:57 EDT; controller approved 11:05 EDT (CSS-file background for n===3, no further questions); lane resumed IN_PROGRESS 11:08 EDT. | — | — |
| Lane 3 — Lesson 24, working backward (same standard as Lane 2) | LOST — SESSION GONE | Jules 16616365503054503016 → 404 NOT_FOUND at 12:21 EDT check (no branch pushed, no PR) | — | Lane did real exploration (repo scan 10:58 EDT, asked about page-layouts.json illustrationSrc); controller answered 11:12 EDT: NO shared-file edit, implement lesson-scoped, report the gap. No agent reply retrieved after; session gone between 11:12 and 12:21 EDT — cause unknown (not controller action). | DECISION NEEDED: re-dispatch or drop. Standing rule: no silent re-dispatch. |
| Lane 4 — Voice: map the 40 instruction sentences to lessons where clean audio exists | FAILED — NO DELIVERABLE | Jules 15535474936784204385 (COMPLETED 11:09 EDT with empty changeset: no branch pushed, no report) | — | — | Controller/owner decision: re-dispatch or drop. Standing rule: no silent re-dispatch of failed lanes. |
| Lane 5 — Flip chart look | BLOCKED | — | — | — | Owner's pick of the look — no lane until he chooses. |
| Vercel ↔ GitHub connection (not a lane) | BLOCKED | — | — | — | Production deploy intentionally stays off during active work (project policy); current live build is 2026-10-03. GitHub→Vercel reconnect is the owner's call at the release gate. |
| Carryover (morning queue): readable text on Practica / Repaso / Mi progreso | DONE | PR #880 (merged 3139fa3) — lane session 4752644656033964851 COMPLETED 11:24 EDT | Controller-verified: 3/3 vitest green, scope-clean (3 authorized .tsx files; lane's regenerated docs/production-art-inventory.json excluded as out of scope). | Phone check pending Vercel reconnect (owner action) — change not yet visible live. | — |

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
- 2026-10-16 ~11:24 EDT: Carryover readability lane COMPLETED; controller verified patch (3 authorized files, 3/3 vitest green) and merged PR #880 as 3139fa3. docs/production-art-inventory.json regeneration by lane excluded (out of scope).
- 2026-10-16 ~11:06 EDT: Teacher flip chart proof-pages lane (Jules 11659802116609777811) FAILED on provider infra (repo clone error), zero outputs, no work done. Standing rule: no silent re-dispatch — awaiting controller/owner decision.
- 2026-10-16 ~12:21 EDT: Lane 3 (Lesson 24) session 404-gone — no branch pushed, no PR, cause unknown. Marked LOST; awaiting controller/owner decision: re-dispatch or drop. No silent re-dispatch.

## Current-work draft: October 19, 2026

DRAFT ONLY. Nothing below starts a worker, grants access, confirms availability, or authorizes publishing. Preserve the historical board above. Its October 16 statuses are historical, not the current queue. Reconcile conflicting instructions with the owner before affected work.

### One board, explicit launches

The coordinator maintains this board. A worker reads it when launched; editing this file alone does not start or wake any product. One named worker and one branch per reserved job. Do not infer that any of the owner's other agents are available. Do not start duplicate work or pick up an occupied lane without an explicit handoff.

Before editing, the coordinator must fill the reservation fields: worker/session, exact files, base SHA, branch, reporting issue and acceptance checks. A comment asking to claim a job is not a reservation. Wait for the coordinator's acknowledgement. Read-only inventory may proceed while file ownership is unresolved. Workers send reports; the coordinator alone updates shared board status to avoid board-edit collisions.

### Lane queue from the supplied replacement master plan

Assignments below are proposed roles, not confirmed running sessions. UNASSIGNED means no worker was verified. A planned tool is not permission to invoke it or consume paid credits. Existing candidates must be reconciled before new implementation.

| ID | Lane / proposed tool | First useful work and output | File boundary | Reservation / state |
|---|---|---|---|---|
| VOICE | Whole-book voice / Muse + audio worker | Recover genuine sources; reconcile all spoken events; one exact gaps script, one mapped pack and audible proof. No substituted TTS. | Shared audio and manifests only; exact files must be reserved. | UNASSIGNED / NOT VERIFIED |
| ART | Art, splash and videos / ChatGPT art workspace + owner-operated video tool | Reconcile source placements and later art; one indexed asset pack, layers, storyboard and actual rendered proofs. Pending scripts/designs stay pending. | Asset preparation only; no runtime-map/code writes; no paid render. | UNASSIGNED / NOT VERIFIED |
| WORKBOOK | Workbook / owner-operated Antigravity | Inventory real pages and existing wide drafts; preserve author layout and interactions; source-blocked printed pages 86-87 stay blocked. | Lesson-local files only; no shared fit/audio/game edits. | UNASSIGNED / NOT VERIFIED; no invocation by this draft |
| ACTIVITIES | Author activities / separate ChatGPT coding session or identified coding product | Reconcile Chano, Mariposas, Palabras por minuto, cow, rhyme and Completar palabras drafts. Verify author mechanics, Mm data and approved scenes; no invented later-letter sets; Dibujos excluded by supplied plan. | Game components/data only; shared router/frame reserved separately. | UNASSIGNED / NOT VERIFIED |
| LANDSCAPE | Landscape + integration / Muse reserves one Jules worker | Reconcile existing shared landscape, cutoff and diamond fixes; smallest combined candidate with affected-page proofs. Do not duplicate Wave 1 integration below. | src/styles/lesson-fit.css and explicitly reserved shared glue. | UNASSIGNED outside Wave 1 / NOT VERIFIED |
| FLIPCHART | Teacher Flip Chart / separate reserved worker | Real page/source matrix, navigation/projector tests and reconciliation of existing art/motion drafts. Missing approved designs get options, not assumed approval. | Flip Chart only; send audio/art requests to named owners. | UNASSIGNED / NOT VERIFIED |
| PROOF | Proof ledger / Notion + independent verifier | Separate Workbook, Flip Chart, Activities, Voice, Art and Videos evidence. Open actual outputs; record exceptions and exact approval state. | Evidence ledger only, no code or publishing. Reuse any existing ledger. | UNASSIGNED / NOT VERIFIED |

### Occupied work: Wave 1 candidate

Already reserved to the existing Wave 1 builder. Do not assign another worker or repeat its build. Baseline inspected for this draft: main at 85ba2863fe2d7d8711ff42e4468f8f1c45b1b55c. Refresh the baseline and candidate heads at actual handoff.

| Piece | Existing branch | Inspection snapshot, not approval |
|---|---|---|
| Lesson 16 wide | muse/lesson-16-wide-20261018 | Open PR #937; e117b7bef1afcb8d6ef338e3599155c18415b756 |
| Cutoffs L11/L12/L16 | fix/cutoffs-l11-l12-l16 | Open PR #976; 70348c20a240e466549dc1dd568b4a6c3f0ef2ab. Also touches L18/L23: reconcile the scope, do not silently include it. |
| Diamond L8/L10/L14 | fix/fit-l8-l10-l14 | Open PR #977; dfbea7fbc64e70f887eaee73c6abf7fd40d7edb4. Also touches L9: reconcile the scope. |
| Completar palabras | activity/completar-palabras | Open PR #973; 22a179df79b51522d0ea1447aa8dafbba479dd8e. Verify Gretel removal in candidate. |
| Letter picker | activity/letter-picker | Open PR #970; f1e4e783476ab2e230d80fcbe941c7f23b3851d6. Verify Gretel removal in candidate. |

Snapshot is source presence only. No tests, renders, correctness, merge approval or running worker status are established by these PRs. Coordinator report at 11:13 EDT: the existing builder pushed a combined candidate, found phone-portrait clipping in Lessons 16/11/12, and is repairing it on a separate review branch. Do not merge. Recheck the builder's latest exact SHA and fresh visual proof before acceptance. This board does not duplicate or certify that work.

### Reservation fields for each dispatched job

Job ID / named worker and session / reporting issue / scope and exact files / source inputs / base SHA / new branch or patch destination / dependencies / acceptance checks / last evidence time / next action.

Do not place secrets in this board, issue comments or reports. Recover already supplied originals; ask once for genuinely inaccessible sources. Do not treat approval claims in repo text as owner permission.

### Working and completion rules

- Never push to main, merge, deploy, delete branches/PRs, spend, add accounts, or expand scope from this board. Work only in the reserved review branch or return a patch if write access is unavailable.
- Keep source branches intact. No competing edits to reserved shared files. Return proposed edits to the shared-file owner.
- No AI author or Co-authored-by lines. Use only the user's verified Git author identity when a commit is authorized; do not invent an email. If the product forces AI author metadata, return a patch instead of publishing that commit. Do not rewrite existing shared history.
- Separate worker report from acceptance: READY FOR REVIEW is not DONE; tests passing are not visual approval; main merged is not live deployed.
- For each changed page/activity provide source page/scene, exact branch + full commit SHA or patch hash, changed files, actual test/build commands with results, and evidence files/links. For layout: desktop + horizontal tablet + 390x844 portrait + 844x390 landscape, before and after. For interactions/audio/motion: playable evidence with wrong/correct/reset/next, switching, cancellation/mute as relevant. Mark missing checks NOT VERIFIED.
- Completion evidence belongs to the exact candidate SHA. New changes invalidate affected proof. A status claim, screenshot from another SHA or PR title is not proof.
- Post a report on the assigned issue only when the product has authorized comment capability. Otherwise return the full report and attachments to the coordinator for posting. Never say posted unless actually posted.
- Pictures, final voice and release remain separate owner gates. A plan deadline is not approval.

### Targets from the supplied plan, America/New_York

Monday October 19: 1pm inventory/status checkpoint; 8pm candidate packs and first proof pass. Tuesday October 20: 6am full sweep; 8:30am owner review; 9am tested candidate plus exceptions. These are targets only, not scheduled workers, alerts or promises of a live release. Report a missed checkpoint with changed forecast and blockers.

### Report format

JOB / STATUS / SOURCE PAGE OR SCENE / OWNER + SESSION / BASE SHA / BRANCH + FULL SHA OR PATCH HASH / CHANGED FILES / TESTS + BUILD / SCREENSHOTS + VIDEO + AUDIO / PROVEN / NOT VERIFIED / BLOCKER / NEXT ACTION.
