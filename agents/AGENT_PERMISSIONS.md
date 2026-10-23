# Agent Permissions — La Cartilla de Gretel

Owner-ordered reorganization, 2026-10-23. One agent per file area. No overlaps.
No agent merges its own work. No task is done until independently verified.
Agents escalate blockers to Muse (Controller), never to each other.
Recover existing work before rebuilding anything.

## Chain of command
Emilio (owner, decisions only) → Muse (Controller) → Jules / ChatGPT / Antigravity
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

## ANTIGRAVITY — Games Agent (ON HOLD — see conflict note)
Package assignment: Cow, Rima, Palabras por minuto, Chano games
(src/content/games/cow/, rima/, palabras-por-minuto/, payaso-chano/).
Must NEVER touch: layout files, audio files, art/image files, tasks/plan.md.
⚠️ CONFLICT: standing owner rule forbids Antigravity by default (read-only reports
only, 2026-10-20 exception). This assignment stays INACTIVE until the owner lifts
that ban explicitly for games. Do not dispatch Antigravity until then.

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
