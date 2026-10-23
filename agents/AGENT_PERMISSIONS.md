# Agent Permissions — La Cartilla de Gretel

Owner-ordered reorganization, 2026-10-23. One agent per file area. No overlaps.
No agent merges its own work. No task is done until independently verified.
Agents escalate blockers to Muse (Controller), never to each other.
Recover existing work before rebuilding anything.

## Chain of command
Emilio (owner, decisions only) → Muse (Controller) → Jules / ChatGPT / Antigravity / Freebuff
Opus (Inspector, read-only) → reports to Emilio directly after every merge.

## JULES — Builder
Owns: phone layout fixes, page curl (PageCurl.tsx), piano timer, teacher section,
pencil pages, PencilConnector, build gate.
Files: lesson-fit.css, FaithfulPageRenderer (branch Muse identifies), NativeLessonViewer,
FixedLayoutPage, PageFrame, PageCurl.tsx, piano component + completeTimerRef,
teacher section components (implementation Muse identifies), PencilConnector (PR Muse identifies).
Must NEVER touch: game components, audio files, art/image files, react-pageflip mounted
path (tests only), tasks/plan.md.

## CHATGPT — Audio Agent
Owns: TTS fallback fix, audio wiring, broken audio references, lesson narration fallbacks.
Files: src/audio/, public/audio/, gretel-voice.ts, speak.ts, AUDIO_POLICY,
tutor-lines manifest, BadgeGrid + StickerReel audio references,
src/content/lesson-meta.ts (audio references only).
Must NEVER touch: layout/CSS files, game components, art/image files.

## ANTIGRAVITY — Games Agent
Owns: Cow, Rima, Palabras por minuto, Chano games
(src/content/games/cow/, rima/, palabras-por-minuto/, payaso-chano/), game route
(use the candidate Muse identifies).
Must NEVER touch: layout files, audio files, art/image files, tasks/plan.md.
Owner ruling 2026-10-23 ~14:00 EDT: the old Antigravity prohibition is LIFTED.
Antigravity works in the repo inside its game areas only, under the same rules
as every agent: recover existing work first, never merge its own work, proof
(screenshots for every state) required.

## FREEBUFF — Backlog Cleaner + Maintenance
Added by owner 2026-10-23 ~14:00 EDT.
Owns: backlog cleanup and maintenance only — duplicate/junk PR and issue
candidates, stale branch lists, docs tidy-ups, maintenance checklists.
Rules: Freebuff PREPARES cleanup lists and maintenance work; it does not close,
delete, or merge anything on its own — every close/delete/merge needs the
owner's yes, presented by Muse. Escalates blockers to Muse, not to other agents.
Must NEVER touch: app code, game components, audio files, art/image files,
agent permission files (Muse owns those).

## OPUS — Inspector (read-only)
Owns: repository verification only.
Must NEVER: write code, merge anything, take instructions from other agents.
Reports directly to Emilio after every merge: what changed, conflicts with open PRs,
build result, whether the change does what the agent claimed, what was NOT verified.

## MUSE — Controller
Owns: Mission Board (MISSION_BOARD.md), Approval Ledger (APPROVAL_LEDGER.md),
starter prompts for every agent (agents/prompts/), tasks/plan.md.
Permanent controller duties per the 2026-10-13 owner contract: inspect, verify,
review, integrate — see AGENTS.md. (The 2026-10-23 package text saying Muse does
not verify/merge conflicts with that contract and does not supersede it.)

## Universal rules
- Auto-deploy OFF. Every deployment needs the owner's explicit yes.
- vercel.json git.deploymentEnabled:false stays untouched on every branch.
- No new art generation, ever. No supplied original modified, replaced, or regenerated.
- No agent generates voice, ever. Device TTS OFF — silence where no recording exists.
- Proof: screenshot for every visible change, video for anything that moves.
